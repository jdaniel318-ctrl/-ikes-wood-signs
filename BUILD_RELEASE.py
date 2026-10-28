#!/usr/bin/env python3
"""Verify and package a PREPARED Black Flag release; never auto-seal or deploy.
python -B BUILD_RELEASE.py SOURCE --baseline PREVIOUS_FULL.zip --out NEW_EXTERNAL_DIR
Python >=3.11 and Node >=22 required. Pure checks; no live credentials needed.
The output is software source, NOT database/media/customer-record backup.
"""
from __future__ import annotations
import argparse, datetime, hashlib, json, os, re, shutil, stat, subprocess, sys, tempfile, zipfile
from pathlib import Path, PurePosixPath

CHECKSUMS={"CHECKSUMS.sha256","RELEASE_CHECKSUMS.sha256","SHA256SUMS.txt"}
MAX_FILES=5000
MAX_TOTAL=250*1024*1024
def digest(body: bytes)->str:
    return hashlib.sha256(body).hexdigest()
def data(files:dict[str,bytes],name:str)->dict:
    try:
        value=json.loads(files[name])
        if not isinstance(value,dict):raise ValueError("object required")
        return value
    except (KeyError,ValueError,UnicodeDecodeError) as e:
        raise ValueError(f"Invalid or missing {name}") from e
def clean_path(name:str)->str:
    if not isinstance(name,str) or not name or "\\" in name or "\x00" in name:
        raise ValueError("Unsafe source path")
    p=PurePosixPath(name)
    if p.is_absolute() or any(x in ("..",".","") for x in name.split("/")) or ":" in name:
        raise ValueError("Unsafe source path: "+name)
    return name
def load_tree(root:Path)->dict[str,bytes]:
    root=root.resolve(); files={}
    for directory,dirs,names in os.walk(root,followlinks=False):
        if Path(directory)==root:dirs[:]=[d for d in dirs if d!=".git"]
        for d in dirs:
            if (Path(directory)/d).is_symlink():raise ValueError("source symlink directory refused")
        for name in sorted(names):
            p=Path(directory)/name
            if p.is_symlink():raise ValueError("source symlink refused")
            rel=clean_path(p.relative_to(root).as_posix())
            files[rel]=p.read_bytes()
    if not files:raise ValueError("Empty source")
    return files
def read_zip(path:Path)->dict[str,bytes]:
    files={}; roots=set(); seen=set(); total=0
    with zipfile.ZipFile(path) as z:
        items=z.infolist()
        if len(items)>MAX_FILES:raise ValueError("ZIP entry limit exceeded")
        for item in items:
            if item.is_dir():continue
            name=clean_path(item.filename)
            if stat.S_ISLNK(item.external_attr>>16):raise ValueError("ZIP symlink refused")
            if "/" not in name:raise ValueError("Expected one top-level folder")
            prefix,rel=name.split("/",1);roots.add(prefix);clean_path(rel)
            if rel.casefold() in seen:raise ValueError("Duplicate or case-colliding ZIP path")
            seen.add(rel.casefold());total+=item.file_size
            if total>MAX_TOTAL:raise ValueError("ZIP expanded size limit exceeded")
            files[rel]=z.read(item)
    if not files or len(roots)!=1:raise ValueError("ZIP must contain one nonempty folder")
    return files
def verify_release(files:dict[str,bytes])->dict:
    for name in files:clean_path(name)
    if len({x.casefold() for x in files})!=len(files):raise ValueError("Case-colliding source paths")
    m=data(files,"DEPLOYMENT_MANIFEST.json")
    inv=data(files,"RELEASE_INVENTORY.json");seal=data(files,"RELEASE_SEAL.json");current=data(files,"CURRENT_BASELINE.json")
    build=m.get("build"); release_seal=m.get("release_seal")
    if not isinstance(build,str) or not build or not release_seal:raise ValueError("Release identity missing")
    if any(v.get("build")!=build for v in (inv,seal,current)):raise ValueError("Mixed build identity")
    if any(v.get("seal")!=release_seal for v in (inv,seal,current)):raise ValueError("Mixed release seal")
    if inv.get("files")!=sorted(files) or inv.get("file_count")!=len(files):raise ValueError("Complete source inventory mismatch")
    for name in m.get("required_runtime_files",[]):
        if name not in files:raise ValueError("Required dependency missing: "+str(name))
    runtime=m.get("runtime_integrity",{}).get("files",{})
    if not runtime:raise ValueError("Runtime digest inventory missing")
    for name,h in runtime.items():
        if name not in files or digest(files[name])!=h:raise ValueError("Runtime digest mismatch: "+name)
    for name,v in m.get("model_integrity",{}).get("files",{}).items():
        if name not in files or digest(files[name])!=v.get("sha256"):raise ValueError("Model digest mismatch: "+name)
        if v.get("policy")=="current-runtime-build" and (v.get("build")!=build or data(files,name).get("build")!=build):
            raise ValueError("Mixed model build: "+name)
    present=CHECKSUMS.intersection(files)
    if not present:raise ValueError("Complete source checksum inventory missing")
    expected={name:digest(body) for name,body in files.items() if name not in CHECKSUMS}
    for checksum in present:
        actual={}
        for line in files[checksum].decode("utf-8").splitlines():
            match=re.fullmatch(r"([0-9a-f]{64})  (.+)",line)
            if not match or match[2] in actual:raise ValueError("Invalid checksum entry")
            actual[clean_path(match[2])]=match[1]
        if actual!=expected:raise ValueError("Complete source checksum mismatch: "+checksum)
    return {"build":build,"seal":release_seal,"source_files":len(files),"runtime_hashes":len(runtime)}
def verify_target(contract:dict,state:dict)->None:
    if contract.get("target_build")!=state["build"] or contract.get("target_seal")!=state["seal"]:
        raise ValueError("Patch target identity mismatch")
def verify_baseline(files:dict[str,bytes],archive_sha:str,supported:list[dict])->dict:
    state=verify_release(files)
    for item in supported:
        if item.get("source_sha256")==archive_sha and item.get("build")==state["build"] and item.get("file_count")==len(files):
            return state
    raise ValueError("Unsupported baseline archive identity/hash/count; do not guess a baseline")
def delta(base:dict[str,bytes],candidate:dict[str,bytes])->dict:
    removed=sorted(set(base)-set(candidate))
    if removed:raise ValueError("Baseline files removed: "+", ".join(removed[:8]))
    changed=sorted(n for n in base if base[n]!=candidate[n])
    added=sorted(set(candidate)-set(base))
    return {"changed":changed,"added":added,"unchanged":len(base)-len(changed)}
def require_external_output(root:Path,out:Path)->None:
    root=root.resolve();out=out.resolve()
    if out==root or out.is_relative_to(root) or root.is_relative_to(out):raise ValueError("Output must be outside source and not its ancestor")
    if out.exists():raise ValueError("Output already exists; use a new destination")
def write_zip(path:Path,folder:str,files:dict[str,bytes],timestamp:tuple)->None:
    clean_path(folder)
    if "/" in folder:raise ValueError("ZIP folder must be a single name")
    with zipfile.ZipFile(path,"w",compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for name,body in sorted(files.items()):
            clean_path(name)
            i=zipfile.ZipInfo(folder+"/"+name,date_time=timestamp)
            i.create_system=3;i.external_attr=(stat.S_IFREG|0o644)<<16
            i.compress_type=zipfile.ZIP_DEFLATED
            z.writestr(i,body)
    if read_zip(path)!=files:raise ValueError("Archive readback mismatch")
def run_check(command:list[str],root:Path,log:Path)->None:
    log.parent.mkdir(parents=True,exist_ok=True)
    env={**os.environ,"PYTHONDONTWRITEBYTECODE":"1","PYTHONUNBUFFERED":"1"}
    with log.open("w") as stream:
        try:
            result=subprocess.run(command,cwd=root,stdout=stream,stderr=subprocess.STDOUT,env=env,timeout=300,check=False)
        except (OSError,subprocess.TimeoutExpired) as e:raise ValueError("Verification failed to execute; inspect "+str(log)) from e
    if result.returncode:raise ValueError("Verification failed; inspect "+str(log))
def verification_runner(files:dict[str,bytes])->str:
    runner=data(files,"CURRENT_BASELINE.json").get("verification_runner","VERIFY_FAIRLEAD_ALL.cjs")
    if not isinstance(runner,str) or not re.fullmatch(r"VERIFY_[A-Z0-9_]+\.cjs",runner) or runner not in files:
        raise ValueError("Missing or invalid verification runner; no unchecked package generated")
    return runner
def build(root:Path,baseline:Path,out:Path)->dict:
    root=root.resolve();baseline=baseline.resolve();out=out.resolve()
    require_external_output(root,out)
    original=load_tree(root);state=verify_release(original);contract=data(original,"PATCH_CONTRACT.json")
    verify_target(contract,state)
    old=read_zip(baseline);oldsha=digest(baseline.read_bytes())
    oldstate=verify_baseline(old,oldsha,contract.get("supported_bases",[]))
    changes=delta(old,original);names=sorted(changes["changed"]+changes["added"])
    if not names:raise ValueError("No release changes")
    if contract.get("requires_deletions") is not False or contract.get("database_actions")!="none":
        raise ValueError("This packager only supports no-deletion software-only patches")
    if len(names)>int(contract.get("max_upload_files",85)):raise ValueError("Upload file budget exceeded")
    if any("/" in n for n in names):raise ValueError("Nested changed file needs a separate reviewed upload plan")
    current=data(original,"CURRENT_BASELINE.json")
    if current.get("base")!=oldstate["build"] or current.get("base_sha256")!=oldsha:raise ValueError("Current baseline declaration mismatch")
    stamp=datetime.datetime.fromisoformat(current["prepared_at"].replace("Z","+00:00")).astimezone(datetime.timezone.utc)
    timestamp=(stamp.year,stamp.month,stamp.day,stamp.hour,stamp.minute,stamp.second//2*2)
    release=re.sub("[^A-Za-z0-9]","",str(data(original,"DEPLOYMENT_MANIFEST.json").get("release_name","Release")))
    number=state["build"].replace(".","");prefix=f"DarkSky{number}-{release}"
    out.parent.mkdir(parents=True,exist_ok=True)
    stage=Path(tempfile.mkdtemp(prefix="."+prefix+"-",dir=out.parent))
    try:
        evidence=stage/"verification"
        node=shutil.which("node")
        if not node:raise ValueError("Node is required; no unchecked package generated")
        run_check([node,str(root/verification_runner(original)),str(root),str(evidence)],root,stage/"verification.log")
        if load_tree(root)!=original:raise ValueError("Source changed during verification; no package issued")
        upload={n:original[n] for n in names}
        rollback={n:old[n] for n in changes["changed"]}
        merged={**old,**upload}
        if merged!=original:raise ValueError("Patch reconstruction failed")
        restored={**original,**rollback}
        if any(restored[n]!=b for n,b in old.items()):raise ValueError("Software rollback content mismatch")
        outputs=[(prefix+"-Upload.zip",prefix+"-Upload",upload),
                 (prefix+"-FullBackup.zip",prefix+"-FullBackup",original),
                 ("DarkSky"+oldstate["build"].replace(".","")+"-RollbackFrom"+number+".zip","BlackFlag-Software-Rollback",rollback)]
        proof={"schema":"blackflag-automated-release-proof-v1","build":state["build"],"release":release,
               "baseline":oldstate["build"],"baseline_sha256":oldsha,"source_files":len(original),
               "upload_files":len(names),"unchanged_original_files":changes["unchanged"],"added":changes["added"],
               "changed":changes["changed"],"removed":[],"exact_patch_reconstruction":True,
               "software_rollback_original_files_match":True,"retained_new_tool_files_after_rollback":changes["added"],
               "verification":"listed offline suites passed; logs included","source_snapshot_unchanged":True,
               "deployed":False,"database_actions":"none","backup_scope":"application source only; not database/customer/media recovery",
               "native_safari":"pending","performance_improvement_claim":False,"archives":{}}
        runtime_names=set(data(original,"DEPLOYMENT_MANIFEST.json").get("runtime_integrity",{}).get("files",{}))
        reused=sorted(n for n in runtime_names if n in old and original[n]==old[n])
        changed_runtime=sorted(n for n in runtime_names if n not in old or original[n]!=old[n])
        proof["component_reuse"]={"runtime_paths":len(runtime_names),"byte_identical_runtime_paths":reused,"changed_runtime_paths":changed_runtime,"policy":"Exact bytes compared to supported baseline; component labels are not proof"}
        for filename,folder,contents in outputs:
            path=stage/filename;write_zip(path,folder,contents,timestamp)
            proof["archives"][filename]={"files":len(contents),"bytes":path.stat().st_size,"sha256":digest(path.read_bytes()),"crc_and_readback":"pass"}
        (stage/"PackageProof.json").write_text(json.dumps(proof,indent=2)+"\n")
        (stage/"README.txt").write_text("UPLOAD: "+outputs[0][0]+"\nExtract; upload its inner files into the existing repository root. Keep all other files.\nFULL BACKUP: source only, not business records. Do not upload it as the patch.\nROLLBACK: restore prior software files only, never old permissions or customer data. Added release-tool files remain unused by the restored prior software.\nVerification logs are separate from the website source. No deployment, deletion or live database action was performed.\n")
        os.replace(stage,out)
        return proof
    except Exception:
        # Retain only failure logs outside source; never publish partial ZIPs as a release.
        fail=out.with_name(out.name+"-FAILED")
        if not fail.exists():os.replace(stage,fail)
        else:shutil.rmtree(stage)
        raise
def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("source",type=Path);p.add_argument("--baseline",type=Path,required=True);p.add_argument("--out",type=Path,required=True)
    a=p.parse_args()
    try:
        proof=build(a.source,a.baseline,a.out)
    except (ValueError,OSError,zipfile.BadZipFile) as e:
        p.exit(1,"RELEASE BLOCKED: "+str(e)+"\n")
    print(json.dumps({"build":proof["build"],"upload_files":proof["upload_files"],"source_files":proof["source_files"],"output":str(a.out.resolve()),"deployed":False}))
if __name__=="__main__":main()
