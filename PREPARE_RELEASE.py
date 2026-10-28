#!/usr/bin/env python3
"""Prepare known release-identity fields from RELEASE_CONFIG.json, then seal exact bytes.
No global search/replace. Shared JavaScript components are NEVER rewritten (only sw.js).
Preparation is not testing, signing, deployment, authority, or data restoration.
python3 -B PREPARE_RELEASE.py SOURCE [--seal-only]
"""
from __future__ import annotations
import argparse, datetime, hashlib, importlib.util, json, re
from pathlib import Path
spec=importlib.util.spec_from_file_location('blackflag_package_tools',Path(__file__).with_name('BUILD_RELEASE.py'))
package=importlib.util.module_from_spec(spec);spec.loader.exec_module(package)
load_tree=package.load_tree
MODELS=('FLEET_DOCTRINE_REGISTRY.json','GOLDEN_VOYAGES.json','FLEET_COMMAND_MODEL.json','ADMIRAL_ENTITLEMENT_STATE_MODEL.json')
CHECKSUMS={'CHECKSUMS.sha256','RELEASE_CHECKSUMS.sha256','SHA256SUMS.txt'}
def jb(value):return (json.dumps(value,indent=2)+'\n').encode('utf-8')
def get(files,name):return json.loads(files[name])
def sha(body):return hashlib.sha256(body).hexdigest()
def changed_text(files,name,pattern,replacement,count=1):
 text=files[name].decode('utf-8');text,n=re.subn(pattern,lambda m:replacement,text,flags=re.S)
 if n!=count:raise ValueError('Missing or ambiguous generation marker in '+name)
 files[name]=text.encode('utf-8')
def config_check(config,files):
 if config.get('schema')!='blackflag-release-config-v1':raise ValueError('Unsupported release configuration')
 for field in ['build','base','app_component_revision','owner_helper_revision']:
  if not re.fullmatch(r'\d+(?:\.\d+){2,5}',str(config.get(field,''))):raise ValueError('Invalid '+field)
 if not re.fullmatch(r'[A-Za-z][A-Za-z0-9]{1,39}',str(config.get('name',''))):raise ValueError('Invalid name')
 if not re.fullmatch(r'[a-z][a-z0-9-]{2,79}',str(config.get('seal',''))):raise ValueError('Invalid seal')
 if not re.fullmatch(r'[0-9a-f]{64}',str(config.get('base_sha256',''))):raise ValueError('Invalid base digest')
 if not isinstance(config.get('base_files'),int) or config['base_files']<1:raise ValueError('Invalid base files')
 if datetime.datetime.fromisoformat(config['prepared_at'].replace('Z','+00:00')).tzinfo is None:raise ValueError('Timestamp timezone required')
 app=files['app.js'].decode('utf-8')
 revision=re.search(r"const\s+APP_COMPONENT_REVISION\s*=\s*['\"]([^'\"]+)['\"]",app)
 if not revision or revision[1]!=config['app_component_revision']:raise ValueError('App component revision does not match source')
 # Owner helper checks remain intentionally pinned, independent from installed version.
 if ("HELPER_COMPONENT_BUILD='"+config['owner_helper_revision']+"'") not in files['owner.html'].decode():raise ValueError('Owner helper component revision does not match source')
def current_block(files,name,body):
 start='<!-- BLACKFLAG_CURRENT_RELEASE_START -->';end='<!-- BLACKFLAG_CURRENT_RELEASE_END -->'
 text=files[name].decode('utf-8');block=start+'\n'+body.rstrip()+'\n'+end+'\n'
 if start in text:
  text,n=re.subn(re.escape(start)+r'.*?'+re.escape(end)+r'\n?',lambda _:block,text,flags=re.S)
  if n!=1:raise ValueError('Ambiguous current release block '+name)
 else:text=block+'\n## Retained historical notes\n\n'+text
 files[name]=text.encode('utf-8')
def seal(files):
 out=dict(files);m=get(out,'DEPLOYMENT_MANIFEST.json')
 for name in m['runtime_integrity']['files']:
  if name not in out:raise ValueError('Missing runtime '+name)
  m['runtime_integrity']['files'][name]=sha(out[name])
 for name,item in m['model_integrity']['files'].items():
  if name not in out:raise ValueError('Missing model '+name)
  item['sha256']=sha(out[name])
  if item.get('policy')=='current-runtime-build':item['build']=m['build']
  if 'bytes' in item:item['bytes']=len(out[name])
 out['DEPLOYMENT_MANIFEST.json']=jb(m)
 inv=get(out,'RELEASE_INVENTORY.json');inv.update(build=m['build'],seal=m['release_seal'],release=m['release_name'],name=m['release_name'],files=sorted(out),file_count=len(out));out['RELEASE_INVENTORY.json']=jb(inv)
 text=''.join(sha(out[n])+'  '+n+'\n' for n in sorted(out) if n not in CHECKSUMS).encode()
 for n in CHECKSUMS:out[n]=text
 return out

def prepare(files,config):
 config_check(config,files);out=dict(files);build=config['build'];name=config['name'];release_seal=config['seal'];base=config['base'];prefix='DarkSky'+build.replace('.','')+'-'+name
 out['RELEASE_CONFIG.json']=jb(config)
 changed_text(out,'index.html',r"const DARK_SKY_RELEASE = Object.freeze\(\{build:'[^']+',seal:'[^']+'\}\);",f"const DARK_SKY_RELEASE = Object.freeze({{build:'{build}',seal:'{release_seal}'}});")
 changed_text(out,'index.html',r'<small id="engineReleaseLabel">[^<]+</small>',f'<small id="engineReleaseLabel">{build} • {name.upper()}</small>')
 changed_text(out,'owner.html',r'<script id="blackFlagPageRelease">.*?</script>',f'<script id="blackFlagPageRelease">window.__blackFlagPageRelease=Object.freeze({{build:\'{build}\',seal:\'{release_seal}\',name:\'{name}\'}});</script>')
 changed_text(out,'owner.html',r'<div class="eyebrow" id="ownerInstalledRelease">[^<]+</div>',f'<div class="eyebrow" id="ownerInstalledRelease">{build} · QUARTERMASTER</div>')
 changed_text(out,'sw.js',r"const RELEASE_BUILD='[^']+';",f"const RELEASE_BUILD='{build}';")
 changed_text(out,'sw.js',r"const RELEASE_SEAL='[^']+';",f"const RELEASE_SEAL='{release_seal}';")
 webapp=get(out,'manifest.webmanifest');webapp.update(version=build,start_url=f'./index.html?_darkSkyRelease={build}&_darkSkySeal={release_seal}');out['manifest.webmanifest']=jb(webapp)
 m=get(out,'DEPLOYMENT_MANIFEST.json');m.update(build=build,version=build,release_name=name,releaseName=name,release_seal=release_seal)
 m['component_contract']={'schema':'blackflag-component-contract-v1','release_binding':'verified-page-context-v1','app_revision':config['app_component_revision'],'unchanged_component_policy':'Exact current-manifest SHA-256 required; no version-only rewrites','owner_helper_revision':config['owner_helper_revision'],'scope':'Client code identity only; no server authority'}
 out['DEPLOYMENT_MANIFEST.json']=jb(m)
 sd=get(out,'RELEASE_SEAL.json');sd.update(build=build,release=name,seal=release_seal,release_name=name,name=name,releaseName=name);out['RELEASE_SEAL.json']=jb(sd)
 for model in MODELS:
  doc=get(out,model);doc['build']=build;out[model]=jb(doc)
 out['CURRENT_BASELINE.json']=jb({'schema':'blackflag-current-baseline-v1','build':build,'release':name,'seal':release_seal,'base':base,'base_source_files':config['base_files'],'base_sha256':config['base_sha256'],'prepared_at':config['prepared_at'],'upload':prefix+'-Upload.zip','full_source_backup':prefix+'-FullBackup.zip','database_backup':False,'canonical_instructions':'UPLOAD_THIS_ONE_BUILD.md','release_config':'RELEASE_CONFIG.json','verification_runner':'VERIFY_RELEASE_ALL.cjs','check_command':'node VERIFY_RELEASE_ALL.cjs . ../release-check-evidence','prepare_command':'python3 -B PREPARE_RELEASE.py .','package_command':f'python3 -B BUILD_RELEASE.py . --baseline /path/to/DarkSky{base.replace(".","")}-FullBackup.zip --out ../release-output','native_acceptance':'pending','component_versions':'Retained component revisions may differ from the installed release; exact hashes still required'})
 contract=get(out,'PATCH_CONTRACT.json');contract.update(target_build=build,target_seal=release_seal,supported_bases=[{'build':base,'source_sha256':config['base_sha256'],'file_count':config['base_files']}],requires_deletions=False,database_actions='none',rule=f'Upload every changed/new root file over complete {base}. Keep everything else. No SQL, permission or record changes.');out['PATCH_CONTRACT.json']=jb(contract)
 gate=get(out,'RELEASE_GATE.json');gate.update(build=build,release=name,**{'pass':False},verification_status='PREPARED_NOT_TESTED',native_safari_acceptance='PENDING',evidence_file='TRIMLINE_EVIDENCE.json',production_certification=False);out['RELEASE_GATE.json']=jb(gate)
 current=f'''# Black Flag {name} {build}\n\nCurrent instructions: UPLOAD_THIS_ONE_BUILD.md. Current identity source: RELEASE_CONFIG.json.\nBaseline: {base}. Shared component revisions do not need to equal the installed release: the loader verifies exact approved bytes.\nVerification: `node VERIFY_RELEASE_ALL.cjs . ../release-check-evidence`. Preparation alone does not certify tests or production readiness.\nNo database, permission, stored-record, loading-dependency or deployment operation is part of this software patch.\n'''
 for file in ['README.md','CHANGELOG.md','BUILD_NOTES.txt']:current_block(out,file,current)
 out['UPLOAD_THIS_ONE_BUILD.md']=f'''# Upload {name} {build}\n\nUse `{prefix}-Upload.zip`, not the full backup or rollback.\n1. Extract the ZIP. Open its single folder. Upload ALL files inside to the existing repository ROOT; replace matching files and KEEP all other files. Commit the upload.\n2. After deployment open the Engine and confirm `{build} · {name.upper()}`. Do not clear Safari data, reset records or change permissions.\n3. Fleet Maintenance should show `FLEET STEWARD · STORAGE & RECOVERY`, without the misleading old app-version prefix.\n\nBusiness functionality, account/session keys, authority rules, layouts and loading order are preserved. Shared specialist components retain their own revision labels; this is intentional reuse, not a mixed upload. Exact SHA-256 checks still run before Engine scripts execute.\n\nFull backup: application source ONLY; not Supabase, customer media or device drafts.\nRollback: restore prior software files only. Never restore old permissions or business data. New root tooling files remain unused by the old app.\nNo passkeys/Face ID or performance gain is claimed.\n'''.encode()
 architecture=f'''# Current architecture — {name} {build}\n\nSource of release identity: RELEASE_CONFIG.json. Installed page/manifest/seal/worker identity is generated together. APP_COMPONENT_REVISION is {config['app_component_revision']}; owner helper revision is {config['owner_helper_revision']}. Unchanged component bodies remain byte-identical across release-only changes.\n\nThe Engine still verifies every required body, current governance models, app component contract and worker identity before executing the same script sequence. App and Captain bind audit/display freshness to the verified installed release. This context never grants permissions. The owner page keeps explicit helper compatibility checks.\n\nNo specialist module is deferred or removed. No live data, schema, session key, appointment, authorization endpoint, sign-design geometry or ledger behavior is changed. Fleet core and Admiral programs remain distinct.\n\n## Release commands\nPrepare known identity fields: `python3 -B PREPARE_RELEASE.py .` (resets test status to untested; never deploys).\nSeal reviewed bytes only: `python3 -B PREPARE_RELEASE.py . --seal-only`.\nVerify: `node VERIFY_RELEASE_ALL.cjs . ../release-check-evidence`.\nPackage: `python3 -B BUILD_RELEASE.py . --baseline <exact prior full-source ZIP> --out <new external directory>`.\n\nPrevious release guides/scripts are retained historical material; do not run their release-pinned sealers on this release.\nNative Safari/hosted integration is separate from offline checks. Source backup is not business-data restore.\n'''
 current_block(out,'CURRENT_ARCHITECTURE.md',architecture)
 return seal(out)
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('source',type=Path);p.add_argument('--seal-only',action='store_true');a=p.parse_args()
 try:
  files=load_tree(a.source);out=seal(files) if a.seal_only else prepare(files,get(files,'RELEASE_CONFIG.json'))
  # Plan all generated bytes before writing; leaves unchanged files untouched.
  changed=[n for n in out if out[n]!=files.get(n)]
  for n in changed:(a.source/n).write_bytes(out[n])
 except (ValueError,KeyError,OSError) as e:p.exit(1,'PREPARATION BLOCKED: '+str(e)+'\n')
 print(json.dumps({'changed_files':changed,'tests_certified':False,'deployed':False}))
if __name__=='__main__':main()
