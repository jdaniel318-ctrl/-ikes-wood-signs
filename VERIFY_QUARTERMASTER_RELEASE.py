"""Validate Quartermaster final-byte integrity and bounded .49 preservation."""
from pathlib import Path
import hashlib,json,re,sys
sys.dont_write_bytecode=True
ROOT=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parent
BASE=Path(sys.argv[2]).resolve() if len(sys.argv)>2 else ROOT.parent.parent/'homeward-save-repair/release'
sys.path.insert(0,str(ROOT))
from VERIFY_PACKAGE import verify_full,require,sha,parse_json

def files(root):return {p.name:p.read_bytes() for p in root.iterdir() if p.is_file()}
def normalize(body):
    return body.replace('8.8.20.50','8.8.20.49').replace('quartermaster-882050','harborhold-882049').replace('Quartermaster','Harborhold TEST').replace('QUARTERMASTER','HARBORHOLD TEST')

current,base=files(ROOT),files(BASE)
result=verify_full(current)
require(result['build']=='8.8.20.50' and result['seal']=='quartermaster-882050','Wrong current identity')
require(set(base)<=set(current),'A baseline filename was removed')
m=parse_json(current,'DEPLOYMENT_MANIFEST.json')
require(m['release_name']=='Quartermaster' and 'TEST' not in m['release_name'],'Wrong current release name')
require(b'8.8.20.50 \xe2\x80\xa2 QUARTERMASTER' in current['index.html'],'Current visible label missing')
page=current['index.html'].decode()
snapshot=re.search(r'const snapshotPaths=(\[[^\n]+\])',page).group(1)
execution=re.search(r'for\(const path of (\[[^\n]+\])\)\{\s*await new Promise',page).group(1)
new_js=['quartermaster_core.js','quartermaster_fonts.js','quartermaster_pdf.js','quartermaster.js']
for name in new_js+['quartermaster.css']:
    require(name in snapshot and name in m['required_runtime_files'] and m['runtime_integrity']['files'].get(name)==sha(current[name]),'New module omitted from verified snapshot: '+name)
for name in new_js:require(name in execution,'New module omitted from ordered execution: '+name)
require(execution.index('quartermaster_core.js')<execution.index('quartermaster_fonts.js')<execution.index('quartermaster_pdf.js')<execution.index('quartermaster.js'),'Module dependency order differs')
require("fetched['quartermaster.css']" in page,'Styles omitted from verified assembly')

# Existing customer workflows are compared byte-for-byte outside the one field-station block.
def without_field(source):
    a=source.index('  function isHouseHullProject(')
    b=source.index('  async function renderProjectControlOverview',a)
    return source[:a]+'HOUSEHULL_FIELD_BLOCK'+source[b:]
require(without_field(normalize(current['app.js'].decode()))==without_field(base['app.js'].decode()),'Unrelated customer/application behavior changed')
captain=current['captain.js'].decode()
block="      if(directTarget==='quartermaster'){\n        setAdmiralLane('govern');\n        window.setTimeout(()=>{window.BlackFlagQuartermasterUI?.open?.();},0);\n      }\n"
require(captain.count(block)==1,'Protected direct-route handoff differs')
require(normalize(captain.replace(block,''))==base['captain.js'].decode(),'Unrelated Captain/Admiral behavior changed')
require(captain.index(block)>captain.index('const openVerifiedAdmiralDeck=directTarget=>'),'Direct route outside verified deck transition')

reference_count=0
for name,entry in m['model_integrity']['files'].items():
    if entry['policy']=='retained-versioned-reference':
        require(current[name]==base[name],'Retained model changed: '+name);reference_count+=1
require(reference_count==39,'Unexpected retained model set')
for name in ['fleet_supabase.js','platform_identity.js','headway_contracts.js','woodwright_fit.js','stormwake_core.js','stormwake_comfort.js','stormwake_world.js','stormwake_cast.js','stormwake_gl.js','stormwake_three.js','stormwake_game.js','fun_core.js','styles.css','business_deck.css','business_deck.js','owner.html']:
    require(normalize(current[name].decode())==base[name].decode(),'Unexpected unrelated behavior change: '+name)
host=current['fun_program.js'].decode();old=base['fun_program.js'].decode()
hide_hash=lambda s:re.sub(r"(\bSTORMWAKE_SHA\s*=\s*['\"])[a-f0-9]{64}",r'\1PLAYER_HASH',s)
require(hide_hash(normalize(host))==hide_hash(old),'Game storage/session behavior changed')
report=parse_json(current,'STORMWAKE_PLAYER_BUILD.json')
require(report['build']=='8.8.20.50','Compiled report version differs')
for name,digest in report['inputs_sha256'].items():require(sha(current[name])==digest,'Compiled input differs: '+name)
require(report['player']['sha256']==sha(current['stormwake_player.html']),'Compiled player hash differs')
require(sha(current['stormwake_player.html']) in host,'Host player verification hash differs')
for name in ['stormwake_assets.json','STORMWAKE_VENDOR.json','stormwake_three_vendor.js']:
    require(current[name]==base[name],'Art/vendor changed: '+name)
cap=parse_json(current,'QUARTERMASTER_CAPABILITY.json')
require(not any(cap['automatic_actions'].values()),'Automatic business action unexpectedly enabled')
require('cloud invoice registry' in cap['not_implemented'],'Scope declaration missing')
require('customer_self_service' not in cap,'A global customer flow override appeared')
patch={n:b for n,b in current.items() if base.get(n)!=b}
require(len(patch)<=85,'Upload exceeds file budget')
print(json.dumps({'pass':True,'build':result['build'],'file_count':len(current),'changed_or_added_files':len(patch),'maximum_upload_files':85,'preserved_baseline_names':len(base),'retained_models_exact':reference_count,'unrelated_customer_and_authority_code':'preserved outside declared integration','game_behavior':'preserved; identity/digest-only changes','scope':'offline current-byte release checks; not native Safari or live Fleet certification'},indent=2))
