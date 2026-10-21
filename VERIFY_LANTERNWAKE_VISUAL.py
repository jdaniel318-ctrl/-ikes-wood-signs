"""Offline Stormwake art/camera QA using the release's actual renderer and world.

Usage: PYTHONPATH=/tmp/blacktide-python BLACKFLAG_CHROMIUM=/path/to/chromium \
       python VERIFY_LANTERNWAKE_VISUAL.py RELEASE_DIR OUTPUT_DIR

This is a deterministic camera rig, not a player/UI or gameplay test. It stages
public Character positions and, for one study, calls the real person() factory.
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
import os
import struct
import sys
import time
import traceback


SOURCES = ("fun_core.js", "stormwake_core.js", "stormwake_gl.js", "stormwake_world.js")
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

HTML = """<!doctype html><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'">
<style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#15252c}canvas{display:block;width:100%;height:100%}</style>
<canvas aria-label="Offline art camera study"></canvas>"""

DRAW_JS = r"""cfg => {
  const R = StormGL, S = BlackFlagStormwake, W = StormwakeWorld;
  const ensure = (value, message) => { if (!value) throw Error(message); };
  const state = S.fresh(), transitions = [];
  const event = e => { const result=S.event(state,e); ensure(result.ok,'Core event rejected: '+e.type); transitions.push(e); };
  let work = new S.BridgeWork(state);
  if (cfg.state !== 'intro') {
    event({type:'talk'});
    for (const id of S.PARTS) event({type:'collect',id});
    ensure(work.fitGear(state),'Core refused fitting recovered gear');
    ensure(work.secureBrace(state),'Core refused the timber/rope brace');
    ensure(work.setHolding(true,state),'Core refused the repaired winch');
    for(let i=0;i<121 && !state.mission.bridgeOpen;i++) work.step(.05,state);
    ensure(state.mission.bridgeOpen,'Actual BridgeWork did not finish');
    transitions.push({type:'BridgeWork',fitGear:true,secureBrace:true,heldSeconds:6.05});
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
  const sceneTime=2.4;
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
      actor.animate(sceneTime,{grounded:true,run:0,phase:0,landing:0,interacting:0},false,false);
      staged.push({role,position:[...actor.root.pos],yaw:actor.root.rot[1]});
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
  ensure(cfg.state==='intro'||world.bridge.rot[2]>1.2,'Validated repair did not visibly raise the bridge');

  const canvas=document.querySelector('canvas'), renderer=new R.Renderer(canvas);
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
  ensure(renderer.stats.frames>=1 && renderer.stats.draws>=visibleMeshes,'Renderer did not issue the scene draws');
  ensure(Object.values(renderer.stats).every(Number.isFinite),'Non-finite renderer statistics');
  ensure(renderer.stats.triangles===triangles,'Rendered geometry count differs from the visible scene');
  ensure(maximum-minimum>20 && colors.size>32,'Framebuffer is blank or effectively uniform');
  const png=canvas.toDataURL('image/png');
  ensure(png.startsWith('data:image/png;base64,'),'Canvas capture failed');
  const result={
    camera:{eye:cfg.eye,target:cfg.target},viewport:cfg.size,bufferSize:[canvas.width,canvas.height],
    quality:cfg.quality,sceneTime,mission:validated.mission,goal:S.goal(state).id,
    coreValidation:true,coreTransitions:transitions,stagedFactoryCast:staged,
    characterPose:{position:[character.x,character.y,character.z],yaw:character.yaw,interacting:character.interacting},
    bridgeAngle:world.bridge.rot[2],stats:{...renderer.stats},
    geometry:{visibleMeshes,shadowEligible,triangles,geometryValues,finite:true},
    glErrors:errors,contextLost:gl.isContextLost(),shadowFramebufferComplete:renderer.shadowOK,
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
    parser.add_argument("output_dir", type=Path, nargs="?", default=Path(__file__).parent.parent / "qa/lanternwake-art")
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
        "schema": "stormwake-offline-art-camera-v1",
        "scope": "Actual unmodified renderer/world in an offline camera rig; staged camera and character positions; not player/UI/gameplay verification.",
        "capture": "Synchronous actual WebGL canvas PNG after Renderer.draw and gl.finish; one GPU frame per view.",
        "source_sha256": {name: digest(data) for name, data in source_bytes.items()},
        "harness_sha256": digest(Path(__file__).read_bytes()),
        "release_directory": str(release),
        "stats_note": "Renderer.stats.draws includes shadow passes; geometry.visibleMeshes counts color-pass scene meshes. Triangle totals are the actual visible scene geometry, independent of camera culling.",
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
                    page.add_script_tag(content=sources[name])
                observed = page.evaluate(DRAW_JS, view)
                png = base64.b64decode(observed.pop("png").split(",", 1)[1], validate=True)
                assert png_size(png) == view["size"], "Wrong capture dimensions"
                assert not errors, errors
                assert not console_errors, console_errors
                assert not requests, "The offline camera rig attempted a request: " + repr(requests)
                filename = view["name"] + ".png"
                (output / filename).write_bytes(png)
                result.update(observed, **{"pass": True, "screenshot": filename, "png_sha256": digest(png), "png_bytes": len(png)})
                if view["name"] == "01-harbor-introduction":
                    result["intro_budget"] = {"max_visible_meshes": 115, "max_triangles": 90000,
                        "met": observed["geometry"]["visibleMeshes"] <= 115 and observed["geometry"]["triangles"] <= 90000}
                print("PASS", view["name"], json.dumps({"visibleMeshes": observed["geometry"]["visibleMeshes"], "triangles": observed["geometry"]["triangles"], "rendererDraws": observed["stats"]["draws"]}), flush=True)
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
