"""Offline Dreadwater modern-renderer art/camera QA using the release's actual renderer and world.

Usage: PYTHONPATH=/tmp/blacktide-python BLACKFLAG_CHROMIUM=/path/to/chromium \
       python VERIFY_DREADWATER_VISUAL.py RELEASE_DIR OUTPUT_DIR

This is a deterministic camera rig, not a player/UI or gameplay test. It stages
public Character positions and calls the real person() factory for cast studies.
The original five Lanternwake comparison cameras are preserved unchanged.
The extra pier camera is derived from production resting-camera equations and
core checkpoint coordinates, rather than estimated from a screenshot.
Mission states come from actual core events/BridgeWork and pass core validation.
No production source is patched; no HTTP server or remote asset is used. Each
PNG is the actual WebGL canvas captured synchronously after draw and gl.finish,
before the browser may discard a preserveDrawingBuffer:false drawing buffer.
The full-player verifier remains VERIFY_HELMSMAN_PLAYER.py. Software rendering
timings here are diagnostic only, not native-device FPS claims.
"""

from pathlib import Path
import argparse
import base64
import hashlib
import json
import math
import os
import struct
import sys
import time
import traceback


SOURCES = ("fun_core.js", "stormwake_core.js", "stormwake_three_vendor.js",
           "stormwake_assets.json", "stormwake_gl.js", "stormwake_cast.js",
           "stormwake_three.js", "stormwake_world.js")
VIEWS = (
    dict(name="01-harbor-introduction", size=[1280, 820], quality="balanced",
         state="intro", eye=[3.7, 4.6, -6.0], target=[-1.0, 3.4, -16.0],
         character=[1.4, 1.6, -13.8], yaw=.65,
         purpose="Original harbor, player and Bootstrap, windows and lantern mood."),
    dict(name="02-lighthouse-crew-home", size=[1280, 820], quality="balanced",
         state="complete", eye=[-14.8, 4.7, 38.3], target=[-16.1, 3.9, 31.4],
         character=[-14.7, 1.6, 31.8], yaw=.65,
         purpose="Validated completed mission, actual reunited crew, lighthouse masonry."),
    dict(name="03-cast-face-proportions", size=[1280, 820], quality="balanced",
         state="intro", eye=[.10, 3.1, -12.25], target=[0, 2.75, -15.5],
         character=[1.4, 1.6, -13.8], yaw=.65, cast_study=True,
         purpose="Real person() player, Bootstrap and chartmaker in the original harbor; full figures and faces."),
    dict(name="04-repaired-bridge-pose", size=[1280, 820], quality="balanced",
         state="bridge", eye=[9.0, 6.0, 15.0], target=[-3.0, 7.4, 28.0],
         character=[-1.8, 1.6, 21.8], yaw=3.141592653589793, interacting=1,
         purpose="Core-completed physical repair, raised bridge, winch and interacting character pose."),
    dict(name="05-harbor-portrait-low", size=[768, 1024], quality="low",
         state="intro", eye=[3.7, 4.6, -6.0], target=[-1.0, 3.4, -16.0],
         character=[1.4, 1.6, -13.8], yaw=.65,
         purpose="Same harbor camera at portrait aspect with the actual low-quality renderer path."),
)

# Explicit additional studies; baseline VIEWS above retain their original framing.
VIEWS += (
    dict(name="06-production-resting-pier", size=[1280, 820], quality="balanced",
         state="pier", eye=[0, 2.77 + math.sin(.34) * 7.6 + 1, 19 - math.cos(.34) * 7.6],
         target=[0, 2.77, 19], character=[0, 1.6, 19], yaw=0,
         camera_provenance="Derived production resting-pier camera: core SPAWNS.pier, camYaw=0, camPitch=.34, dist=7.6; no screenshot estimation.",
         purpose="Actual user's reported mission condition: briefed, three repairs, weight 1, bridge closed, pier checkpoint; derived production resting camera."),
    dict(name="07-cast-walk-pose-a", size=[1280, 820], quality="balanced",
         state="intro", eye=[.10, 3.1, -12.25], target=[0, 2.75, -15.5],
         character=[1.4, 1.6, -13.8], yaw=.65, cast_study=True,
         walk_phase=.75, scene_time=2.4,
         purpose="Staged real person() cast with actual production animator, run=1 and gait phase .75; first opposite arm/leg pose."),
    dict(name="08-cast-walk-pose-b", size=[1280, 820], quality="balanced",
         state="intro", eye=[.10, 3.1, -12.25], target=[0, 2.75, -15.5],
         character=[1.4, 1.6, -13.8], yaw=.65, cast_study=True,
         walk_phase=.75 + math.pi, scene_time=2.4 + math.pi / (5.4 * 2.7),
         purpose="Same staged cast and camera with gait advanced pi radians using production Character phase rate; opposite stride."),
)

HTML = """<!doctype html><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'">
<style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#15252c}canvas{display:block;width:100%;height:100%}</style>
<canvas aria-label="Offline art camera study"></canvas>"""

DRAW_JS = r"""async cfg => {
  const R = StormGL, S = BlackFlagStormwake, W = StormwakeWorld;
  const ensure = (value, message) => { if (!value) throw Error(message); };
  const state = S.fresh(), transitions = [];
  const event = e => { const result=S.event(state,e); ensure(result.ok,'Core event rejected: '+e.type); transitions.push(e); };
  let work = new S.BridgeWork(state);
  if (['bridge','complete','pier'].includes(cfg.state)) {
    event({type:'talk'});
    for (const id of S.PARTS) event({type:'collect',id});
    if (cfg.state === 'pier') {
      event({type:'checkpoint',id:'pier'});
    } else {
      ensure(work.fitGear(state),'Core refused fitting recovered gear');
      ensure(work.secureBrace(state),'Core refused the timber/rope brace');
      ensure(work.setHolding(true,state),'Core refused the repaired winch');
      for(let i=0;i<121 && !state.mission.bridgeOpen;i++) work.step(.05,state);
      ensure(state.mission.bridgeOpen,'Actual BridgeWork did not finish');
      transitions.push({type:'BridgeWork',fitGear:true,secureBrace:true,heldSeconds:6.05});
    }
  }
  if (cfg.state === 'complete') {
    event({type:'rescue'}); event({type:'finish'});
    ensure(state.mission.complete && S.goal(state).id==='complete','Core did not recognize the completed rescue');
  }
  event({type:'prefs',prefs:{quality:cfg.quality,sound:false,reducedMotion:false}});
  const validated=S.validate(state);
  ensure(JSON.stringify(validated)===JSON.stringify(state),'State failed exact core round-trip validation');

  const world=W.create(), character=new S.Character(state.mission.checkpoint), boat=new S.Boat(cfg.state==='complete'?'lighthouse':'arrival');
  [character.x,character.y,character.z]=cfg.character;
  character.yaw=cfg.yaw; character.interacting=cfg.interacting||0;
  const sceneTime=cfg.scene_time ?? 2.4;
  if (Number.isFinite(cfg.walk_phase)) {character.run=1;character.phase=cfg.walk_phase;}
  // Settle the existing world animation without spending GPU frames. No mission
  // flags, bridge geometry, materials, lights, or production APIs are replaced.
  for(let i=0;i<40;i++) world.update(sceneTime,.05,state,character,boat,'walk',false,work);

  const staged=[];
  if(cfg.cast_study) {
    // Public factory in the unmodified world, with its original environment.
    // Hide the three ordinary instances so the study has exactly three figures.
    for(const actor of [world.player,world.bootstrap,world.cartographer]) actor.root.visible=false;
    world.marker.visible=false;
    for(const [i,role] of ['player','bootstrap','chartmaker'].entries()) {
      const actor=W.person(world.root,role);
      actor.root.pos=[(i-1)*1.25,1.6,-15.5];
      actor.root.rot[1]=0;
      actor.animate(sceneTime,{grounded:true,run:Number.isFinite(cfg.walk_phase)?1:0,phase:cfg.walk_phase||0,landing:0,interacting:0},false,false);
      staged.push({role,position:[...actor.root.pos],yaw:actor.root.rot[1],avatar:JSON.parse(JSON.stringify(actor.root.avatar))});
    }
  }

  let visibleMeshes=0, triangles=0, shadowEligible=0, geometryValues=0;
  const scan=(node,parent)=>{
    if(!node.visible)return;
    for(const key of ['pos','rot','scale','color']) ensure(node[key].every(Number.isFinite),'Non-finite scene '+key);
    const matrix=R.M.mul(parent,R.M.compose(node.pos,node.rot,node.scale));
    ensure([...matrix].every(Number.isFinite),'Non-finite model matrix');
    if(node.mesh) {
      ensure(node.mesh.length>0 && node.mesh.length%27===0,'Invalid triangle geometry');
      ensure(node.mesh.every(Number.isFinite),'Non-finite vertex value');
      visibleMeshes++; triangles+=node.mesh.length/27; geometryValues+=node.mesh.length;
      if(node.castShadow && !node.kind && !(node.emission>.5))shadowEligible++;
    }
    for(const child of node.children)scan(child,matrix);
  };
  scan(world.root,R.M.id());
  ensure(visibleMeshes>40 && triangles>10000,'Scene did not contain the actual harbor geometry');
  ensure(!['bridge','complete'].includes(cfg.state)||world.bridge.rot[2]>1.2,'Validated repair did not visibly raise the bridge');
  if(cfg.state==='pier')ensure(state.mission.briefed && state.mission.parts.length===3 && state.mission.weight===1 && !state.mission.bridgeOpen && state.mission.checkpoint==='pier','Pier mission differs from the user condition');

  const canvas=document.querySelector('canvas'), renderer=new R.Renderer(canvas);
  ensure(renderer.ready && typeof renderer.ready.then==='function','Modern renderer readiness promise missing');
  await renderer.ready;
  ensure(renderer.stats.backend==='three-webgl2','Modern WebGL2 backend was not selected');
  ensure(renderer.stats.texturesExpected===8 && renderer.stats.texturesReady===8 && renderer.stats.textureErrors===0,'All eight embedded maps must be ready before drawing');
  renderer.resize(cfg.quality);
  const gl=renderer.gl, errors=[];
  const drainErrors=()=>{for(let i=0;i<20;i++){const code=gl.getError();if(code===gl.NO_ERROR)break;errors.push(code);}};
  drainErrors();
  renderer.draw(world.root,{eye:cfg.eye,target:cfg.target},sceneTime);
  gl.finish();
  drainErrors();
  const pixels=new Uint8Array(canvas.width*canvas.height*4);
  gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
  drainErrors();
  let minimum=255,maximum=0;
  const colors=new Set();
  for(let i=0;i<pixels.length;i+=4*97) {
    for(let k=0;k<3;k++){minimum=Math.min(minimum,pixels[i+k]);maximum=Math.max(maximum,pixels[i+k]);}
    colors.add((pixels[i]<<16)|(pixels[i+1]<<8)|pixels[i+2]);
  }
  ensure(!gl.isContextLost(),'WebGL context lost');
  ensure(errors.length===0,'WebGL errors: '+JSON.stringify(errors));
  ensure(renderer.stats.frames>=1 && renderer.stats.draws>0 && renderer.stats.triangles>0,'Renderer did not issue actual scene draws');
  const numericStats=Object.fromEntries(Object.entries(renderer.stats).filter(([key,value])=>typeof value==='number'));
  ensure(Object.values(numericStats).every(Number.isFinite),'Non-finite numeric renderer statistics');
  ensure(renderer.stats.nativeAvatars>=3,'Modern skinned cast was not present');
  ensure(maximum-minimum>20 && colors.size>32,'Framebuffer is blank or effectively uniform');
  const png=canvas.toDataURL('image/png');
  ensure(png.startsWith('data:image/png;base64,'),'Canvas capture failed');
  const result={
    rigScope:'Staged offline art study using unmodified production code; not a full-player gameplay test',
    camera:{eye:cfg.eye,target:cfg.target,provenance:cfg.camera_provenance||'Preserved fixed art-study camera'},viewport:cfg.size,bufferSize:[canvas.width,canvas.height],
    quality:cfg.quality,sceneTime,mission:validated.mission,goal:S.goal(state).id,
    coreValidation:true,coreTransitions:transitions,stagedFactoryCast:staged,
    characterPose:{position:[character.x,character.y,character.z],yaw:character.yaw,interacting:character.interacting,run:character.run,phase:character.phase},
    bridgeAngle:world.bridge.rot[2],stats:{...renderer.stats},
    geometry:{facadeVisibleMeshes:visibleMeshes,facadeShadowEligible:shadowEligible,facadeTriangles:triangles,facadeGeometryValues:geometryValues,finite:true},
    rendered:{backend:renderer.stats.backend,drawCalls:renderer.stats.draws,triangles:renderer.stats.triangles,nativeAvatars:renderer.stats.nativeAvatars},
    textures:{expected:renderer.stats.texturesExpected,ready:renderer.stats.texturesReady,errors:renderer.stats.textureErrors},
    glErrors:errors,contextLost:gl.isContextLost(),shadowMapEnabled:renderer.engine.shadowMap.enabled,
    framebuffer:{minimum,maximum,sampledColors:colors.size},png
  };
  renderer.dispose();
  return result;
}"""


def digest(data):
    return hashlib.sha256(data).hexdigest()


def png_size(data):
    if data[:8] != b"\x89PNG\r\n\x1a\n" or data[12:16] != b"IHDR":
        raise ValueError("Capture is not a PNG")
    return list(struct.unpack(">II", data[16:24]))


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("release_dir", type=Path, nargs="?", default=Path(__file__).parent)
    parser.add_argument("output_dir", type=Path, nargs="?", default=Path(__file__).parent.parent / "qa/dreadwater-art")
    parser.add_argument("--view", action="append", choices=[v["name"] for v in VIEWS], help="Run only this fixed view; repeatable")
    parser.add_argument("--list-views", action="store_true", help="Print the fixed camera choices without starting a browser")
    args = parser.parse_args()
    if args.list_views:
        print(json.dumps(VIEWS, indent=2))
        return 0
    release, output = args.release_dir.resolve(), args.output_dir.resolve()
    source_bytes = {name: (release / name).read_bytes() for name in SOURCES}
    sources = {name: data.decode("utf-8") for name, data in source_bytes.items()}
    output.mkdir(parents=True, exist_ok=True)
    report = {
        "schema": "stormwake-offline-art-camera-v2",
        "scope": "Actual unmodified renderer/world in an offline camera rig; staged camera and character positions; not player/UI/gameplay verification.",
        "capture": "Synchronous actual WebGL canvas PNG after Renderer.draw and gl.finish; one GPU frame per view.",
        "source_sha256": {name: digest(data) for name, data in source_bytes.items()},
        "harness_sha256": digest(Path(__file__).read_bytes()),
        "release_directory": str(release),
        "stats_note": "geometry.facade* counts legacy adapter source meshes before modern cast replacement. rendered and stats count actual Three.js submitted geometry including native cast, water, sky and shadow behavior. These values differ by design and are recorded separately, without equality assertions.",
        "loaded_source_order": list(SOURCES),
        "source_provenance": {name: {"file": str(release / name), "bytes": len(source_bytes[name]), "sha256": digest(source_bytes[name]), "injection": "window.StormwakeAssets assignment from exact JSON" if name.endswith(".json") else "Exact unmodified script bytes"} for name in SOURCES},
        "camera_reference": {"file": "stormwake_game.js", "sha256": digest((release / "stormwake_game.js").read_bytes()), "scope": "Read-only provenance for production resting-pier camera equations; this UI/game-loop source is not loaded into the staged rig."},
        "embedded_art_provenance": json.loads(sources["stormwake_assets.json"])["sources"],
        "network_policy": "Offline browser contexts; all requests blocked and recorded; image sources are embedded data URIs.",
        "limitations": ["Art quality and framing require visual review of the PNGs.", "No gameplay, UI, native Safari, device input, sustained performance, or native-device FPS claim."],
        "views": [],
    }
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            executable_path=os.environ.get("BLACKFLAG_CHROMIUM", "/usr/bin/chromium"),
            headless=True,
            args=["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
        )
        for view in VIEWS:
            if args.view and view["name"] not in args.view:
                continue
            started = time.monotonic()
            errors, console_errors, requests = [], [], []
            context = browser.new_context(
                viewport={"width": view["size"][0], "height": view["size"][1]},
                device_scale_factor=1, service_workers="block", offline=True,
            )
            context.route("**/*", lambda route: route.abort())
            page = context.new_page()
            page.set_default_timeout(60000)
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
            page.on("request", lambda request: requests.append(request.url))
            result = {"name": view["name"], "purpose": view["purpose"], "pass": False}
            try:
                page.set_content(HTML, timeout=60000)
                for name in SOURCES:
                    page.add_script_tag(content=("window.StormwakeAssets=" + sources[name] + ";") if name.endswith(".json") else sources[name])
                observed = page.evaluate(DRAW_JS, view)
                png = base64.b64decode(observed.pop("png").split(",", 1)[1], validate=True)
                assert png_size(png) == view["size"], "Wrong capture dimensions"
                assert not errors, errors
                assert not console_errors, console_errors
                assert not requests, "The offline camera rig attempted a request: " + repr(requests)
                filename = view["name"] + ".png"
                (output / filename).write_bytes(png)
                result.update(observed, **{"pass": True, "screenshot": filename, "png_sha256": digest(png), "png_bytes": len(png)})
                print("PASS", view["name"], json.dumps({"facadeVisibleMeshes": observed["geometry"]["facadeVisibleMeshes"], "facadeTriangles": observed["geometry"]["facadeTriangles"], "renderedTriangles": observed["rendered"]["triangles"], "rendererDraws": observed["stats"]["draws"], "texturesReady": observed["textures"]["ready"]}), flush=True)
            except Exception as exc:
                result["error"] = str(exc)
                print("FAIL", view["name"], str(exc)[:400], flush=True)
                traceback.print_exc()
            finally:
                result.update(pageErrors=errors, consoleErrors=console_errors, attemptedRequests=requests,
                              elapsedSeconds=round(time.monotonic() - started, 3))
                report["views"].append(result)
                report["pass"] = all(v["pass"] for v in report["views"])
                (output / "results.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
                context.close()
        browser.close()
    return 0 if report["pass"] else 1


if __name__ == "__main__":
    sys.exit(main())
