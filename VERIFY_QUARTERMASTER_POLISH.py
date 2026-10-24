"""Verify sealed .51 presentation update and exact .50 behavior preservation."""
from pathlib import Path
import json,re,sys
sys.dont_write_bytecode=True
R=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parent
B=Path(sys.argv[2]).resolve() if len(sys.argv)>2 else R.parent.parent/'quartermaster-build/release'
sys.path.insert(0,str(R))
from VERIFY_PACKAGE import verify_full,require,sha,parse_json,content_digest
def files(p):return {x.name:x.read_bytes() for x in p.iterdir() if x.is_file()}
def norm(s):return s.replace('8.8.20.51','8.8.20.50').replace('quartermaster-882051','quartermaster-882050')
current,base=files(R),files(B)
result=verify_full(current)
require(result['build']=='8.8.20.51' and result['seal']=='quartermaster-882051','Wrong current identity')
require(content_digest(base)=='6d1a89e3f4d6e70b2c7caa3c3b3f6b834f9ed23e4fd087b84a18b4ccc01e55b6','Unexpected .50 baseline')
require(set(base)<=set(current),'A baseline file was removed')
m=parse_json(current,'DEPLOYMENT_MANIFEST.json')
require(m['release_name']=='Quartermaster','Wrong current heading')
require(b'8.8.20.51 \xe2\x80\xa2 QUARTERMASTER' in current['index.html'],'Current visible heading missing')
changes=parse_json(current,'QUARTERMASTER_PRESENTATION_CHANGES.json')
runtime_count=0
for name in sorted(base):
    if Path(name).suffix not in ('.js','.html','.css'):continue
    old=base[name].decode();new=norm(current[name].decode())
    for edit in reversed(changes['replacements']):
        if edit['file']!=name:continue
        require(new.count(edit['new'])==edit['count'],'Presentation replacement differs: '+name)
        new=new.replace(edit['new'],edit['old'])
    if name in changes['appended_styles']:
        require(new.startswith(old),'Existing styles changed: '+name)
        tail=new[len(old):].encode();record=changes['appended_styles'][name]
        require(len(tail)==record['bytes'] and sha(tail)==record['sha256'],'Scoped style bytes differ: '+name)
        new=new[:len(old)]
    if name=='fun_program.js':
        mask=lambda s:re.sub(r"(\bSTORMWAKE_SHA\s*=\s*['\"])[a-f0-9]{64}",r'\1PLAYER_HASH',s)
        new,old=mask(new),mask(old)
    require(new==old,'Behavior outside declared presentation changed: '+name)
    runtime_count+=1
reference_count=0
for name,entry in m['model_integrity']['files'].items():
    if entry['policy']=='retained-versioned-reference':
        require(current[name]==base[name],'Retained model changed: '+name);reference_count+=1
require(reference_count==39,'Unexpected retained model set')
for name in ['quartermaster_core.js','quartermaster_pdf.js','quartermaster_fonts.js','quartermaster_font_license.txt','QUARTERMASTER_CAPABILITY.json','HOUSEHULL_PLAN.json','HOUSEHULL_BUILD_PLAN.md','stormwake_assets.json','STORMWAKE_VENDOR.json','stormwake_three_vendor.js']:
    require(current[name]==base[name],'Preserved document/data/art contract changed: '+name)
report=parse_json(current,'STORMWAKE_PLAYER_BUILD.json')
require(report['build']=='8.8.20.51','Compiled report identity differs')
for name,digest in report['inputs_sha256'].items():require(sha(current[name])==digest,'Compiled input differs: '+name)
require(report['player']['sha256']==sha(current['stormwake_player.html']),'Compiled player digest differs')
require(report['player']['sha256'].encode() in current['fun_program.js'],'Host player reference differs')
require(norm(current['BUILD_STORMWAKE_PLAYER.py'].decode())==base['BUILD_STORMWAKE_PLAYER.py'].decode(),'Compiler behavior changed')
for name in m['required_runtime_files']:require(name in current,'Runtime missing: '+name)
require(all(m['runtime_integrity']['files'][n]==sha(current[n]) for n in ['captain.js','styles.css','quartermaster.js','quartermaster.css']),'Changed runtime unsealed')
gate=parse_json(current,'RELEASE_GATE.json')
require(gate['build']=='8.8.20.51' and gate['release']=='Quartermaster','Release gate identity differs')
patch={n:b for n,b in current.items() if base.get(n)!=b}
require(len(patch)<=85,'Upload exceeds file budget')
print(json.dumps({'pass':True,'build':result['build'],'file_count':len(current),'changed_or_added_files':len(patch),'maximum_upload_files':85,'baseline_names_retained':len(base),'retained_models_exact':reference_count,'runtime_files_compared':runtime_count,'authority_and_document_logic':'byte-exact after declared presentation reversal and identity normalization','core_pdf_catalog_storage':'byte-exact .50','game_behavior':'byte-exact after identity normalization; host digest updated','scope':'Offline source/release integrity; not live authority or native Safari certification'},indent=2))
