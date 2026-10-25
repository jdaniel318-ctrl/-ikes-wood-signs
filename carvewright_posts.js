/* Carvewright First Cut — bounded 2.5D controller exporters and output readback.
 * OpenSBP commands: official ShopBot Command Reference / Programming Handbook.
 * G-code dialects: GRBL 1.1 and LinuxCNC documented command subsets.
 * Does not connect to hardware, establish work zeros, or validate a physical setup.
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CarvewrightPosts = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var EPS = 0.000001, MAX_MOVES = 200000, MAX_TEXT = 32000000;
  var profiles = Object.freeze([
    {id:'shopbot-inch',label:'ShopBot OpenSBP · inches',units:'in',extension:'sbp',controller:'shopbot',spindleModes:['manual']},
    {id:'shopbot-mm',label:'ShopBot OpenSBP · millimeters',units:'mm',extension:'sbp',controller:'shopbot',spindleModes:['manual']},
    {id:'grbl-mm',label:'GRBL 1.1 · millimeters',units:'mm',extension:'nc',controller:'grbl',spindleModes:['manual','controller']},
    {id:'grbl-inch',label:'GRBL 1.1 · inches',units:'in',extension:'nc',controller:'grbl',spindleModes:['manual','controller']},
    {id:'linuxcnc-mm',label:'LinuxCNC · millimeters',units:'mm',extension:'nc',controller:'linuxcnc',spindleModes:['manual','controller']},
    {id:'linuxcnc-inch',label:'LinuxCNC · inches',units:'in',extension:'nc',controller:'linuxcnc',spindleModes:['manual','controller']}
  ].map(function (p) { Object.freeze(p.spindleModes); return Object.freeze(p); }));
  function fail(message) { throw new Error('Carvewright CNC: ' + message); }
  function finite(n, name, min, max) {
    if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max) fail(name + ' must be finite and between ' + min + ' and ' + max + '.');
    return n;
  }
  function profileFor(value, fallbackMode) {
    var id = typeof value === 'string' ? value : value && value.id;
    var p = profiles.find(function (x) { return x.id === id; });
    if (!p) fail('Choose a supported controller profile.');
    var mode = value && typeof value === 'object' && value.spindleMode !== undefined ? value.spindleMode : (fallbackMode || 'manual');
    if (p.controller === 'shopbot' && mode !== 'manual') fail('This ShopBot profile requires manual spindle control.');
    if (p.spindleModes.indexOf(mode) < 0) fail('Unsupported spindle control mode.');
    return {id:p.id,label:p.label,units:p.units,extension:p.extension,controller:p.controller,spindleMode:mode};
  }
  function safeText(text, grbl) {
    return String(text === undefined || text === null ? '' : text).replace(/[^\x20-\x7e]/g, ' ').replace(grbl ? /[()'%;!?~]/g : /[()'%;]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
  }
  function number(n, digits) {
    var s = n.toFixed(digits);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return !s || s === '-0' ? '0' : s;
  }
  function validateJob(job) {
    if (!job || job.schema !== 'carvewright-toolpath-v1' || job.units !== 'mm') fail('Expected a millimeter Carvewright toolpath job.');
    var s = job.setup;
    if (!s || s.schema !== 'carvewright-machining-setup-v1' || s.operation !== 'pocket' || !s.stock || !s.tool || !s.cut || !s.origin || !s.machine) fail('Missing machining setup.');
    var stock=s.stock, tool=s.tool, cut=s.cut;
    finite(stock.widthMm,'Stock width',1,10000); finite(stock.heightMm,'Stock height',1,10000); finite(stock.thicknessMm,'Stock thickness',0.1,1000);
    if (tool.type !== 'flat-endmill' || tool.centerCutting !== true) fail('Use a center-cutting flat end mill for this operation.');
    finite(tool.diameterMm,'Tool diameter',0.1,100); finite(tool.cuttingLengthMm,'Tool cutting length',0.1,1000);
    finite(cut.depthMm,'Cut depth',0.001,999); finite(cut.stepDownMm,'Step-down depth',0.001,cut.depthMm);
    if (cut.depthMm >= stock.thicknessMm || cut.depthMm > tool.cuttingLengthMm) fail('Cut depth must be below stock thickness and within tool cutting length.');
    finite(cut.stepOverPercent,'Stepover',10,50); finite(cut.toleranceMm,'Tolerance',0.005,0.1);
    if (cut.toleranceMm >= tool.diameterMm/4) fail('Tolerance must be substantially smaller than the tool radius.');
    finite(cut.feedMmMin,'Cut feed',0.1,100000); finite(cut.plungeMmMin,'Plunge feed',0.1,20000);
    finite(cut.spindleRpm,'Spindle RPM',1,120000); finite(cut.clearanceMm,'Clearance',0.1,500);
    if ((s.origin.xy !== 'lower-left' && s.origin.xy !== 'center') || s.origin.z !== 'stock-top') fail('Unsupported work origin; use lower-left or center XY and stock-top Z.');
    if (!Array.isArray(job.moves) || job.moves.length < 2 || job.moves.length > MAX_MOVES) fail('Move count must be between 2 and ' + MAX_MOVES + '.');
    var ox=s.origin.xy==='center'?-stock.widthMm/2:0, oy=s.origin.xy==='center'?-stock.heightMm/2:0, prior=null, actualCuts=0;
    job.moves.forEach(function (m, i) {
      if (!m || (m.kind !== 'rapid' && m.kind !== 'cut')) fail('Unsupported move kind at ' + i + '.');
      ['x','y','z'].forEach(function (k) { finite(m[k], 'Move '+i+' coordinate '+k, -10000, 10000); });
      if (m.x < ox-EPS || m.y < oy-EPS || m.x > ox+stock.widthMm+EPS || m.y > oy+stock.heightMm+EPS) fail('Move '+i+' is outside stock bounds.');
      if (m.z < -cut.depthMm-EPS || m.z > cut.clearanceMm+EPS) fail('Move '+i+' exceeds the configured depth or clearance.');
      var xy = prior && (Math.abs(m.x-prior.x)>EPS || Math.abs(m.y-prior.y)>EPS), dz=prior && Math.abs(m.z-prior.z)>EPS;
      if (xy && dz) fail('Simultaneous XY and Z movement is unsupported in this 2.5D release.');
      if (i === 0 && (m.kind !== 'rapid' || Math.abs(m.z-cut.clearanceMm)>EPS)) fail('The first move must position at clearance.');
      if (m.kind === 'rapid') {
        if (m.z < -EPS || (xy && (prior.z < cut.clearanceMm-EPS || m.z < cut.clearanceMm-EPS))) fail('Rapid XY travel requires clearance above stock.');
        if (m.feedMmMin !== undefined && m.feedMmMin !== 0) fail('Rapid moves must not carry a cutting feed.');
      } else {
        finite(m.feedMmMin, 'Cut feed at move '+i, 0.1, 100000);
        if (m.feedMmMin > (dz ? cut.plungeMmMin : cut.feedMmMin)+EPS) fail('Move '+i+' exceeds its configured '+(dz?'plunge':'cut')+' feed.');
        if (m.z < 0) {
          actualCuts++;
          var radius=tool.diameterMm/2;
          if (m.x < ox+radius-EPS || m.y < oy+radius-EPS || m.x > ox+stock.widthMm-radius+EPS || m.y > oy+stock.heightMm-radius+EPS) fail('Cutter at move '+i+' extends beyond stock bounds.');
        }
      }
      prior=m;
    });
    var last=job.moves[job.moves.length-1];
    if (last.kind !== 'rapid' || Math.abs(last.z-cut.clearanceMm)>EPS) fail('The final move must retract to clearance.');
    if (!actualCuts) fail('The program contains no material-cutting moves.');
    return s;
  }
  function exportProgram(job, profileOrId) {
    var s=validateJob(job), p=profileFor(profileOrId || s.machine.postId, s.machine.spindleMode);
    var scale=p.units==='in'?25.4:1, digits=p.units==='in'?5:4, coord=function(v){return number(v/scale,digits);};
    var lines=[], source=job.source||{}, sb=p.controller==='shopbot';
    function comment(t) { lines.push(sb?"' "+safeText(t):'('+safeText(t,p.controller==='grbl')+')'); }
    comment('Carvewright First Cut | '+(source.title||'Untitled design')+' | revision '+(Number.isSafeInteger(source.revision)?source.revision:'unknown'));
    comment('Target: '+p.label+' | '+p.units+' | '+p.spindleMode+' spindle');
    comment('Origin: '+s.origin.xy+' XY, stock-top Z'+(sb?'':'; establish G54 first; temporary G92 offsets are cleared'));
    comment('Tool: '+s.tool.label+' | diameter '+number(s.tool.diameterMm,4)+' mm | part '+(s.tool.partNumber||'not specified'));
    comment('Stock '+number(s.stock.widthMm,4)+' x '+number(s.stock.heightMm,4)+' x '+number(s.stock.thicknessMm,4)+' mm; depth '+number(s.cut.depthMm,4)+' mm');
    comment('Generated for operator setup and controller preview; physical machine acceptance is pending.');
    var prior=null;
    if (sb) {
      lines.push('IF %(25)='+(p.units==='in'?0:1)+' THEN GOTO CW_UNITS_OK');
      comment('Units mismatch. This file requires '+(p.units==='in'?'inches':'millimeters')+'. Match controller units and reload.');
      lines.push('PAUSE','END','CW_UNITS_OK:','SA');
      var sx=s.cut.feedMmMin, sz=s.cut.plungeMmMin;
      function speed(v) { return number(v/scale/60,6); }
      lines.push('MS,'+speed(sx)+','+speed(sz),'JS,'+speed(sx)+','+speed(sz));
      comment('Confirm setup and start the spindle using the machine controls; continue when ready.'); lines.push('PAUSE');
      lines.push('JZ,'+coord(s.cut.clearanceMm));
      job.moves.forEach(function(m) {
        var dz=prior && Math.abs(m.z-prior.z)>EPS;
        if (m.kind==='rapid') lines.push(dz?'JZ,'+coord(m.z):'J2,'+coord(m.x)+','+coord(m.y));
        else {
          var nx=dz?sx:m.feedMmMin, nz=dz?m.feedMmMin:sz;
          if (Math.abs(nx-sx)>EPS || Math.abs(nz-sz)>EPS) {sx=nx;sz=nz;lines.push('MS,'+speed(sx)+','+speed(sz));}
          lines.push(dz?'MZ,'+coord(m.z):'M2,'+coord(m.x)+','+coord(m.y));
        }
        prior=m;
      });
      comment('Stop the spindle using the machine controls before removing the work.'); lines.push('PAUSE','END');
    } else {
      lines.push(p.units==='in'?'G20':'G21','G17','G90','G94','G40','G54','G49','G80','G92.1');
      if(p.controller==='linuxcnc')lines.push('G61');
      lines.push('M5');
      if(p.spindleMode==='controller'){
        lines.push('M3 S'+number(s.cut.spindleRpm,0));
        comment('Confirm spindle is at the set speed before continuing.'); lines.push('M0');
      } else {comment('Confirm setup and start the spindle using the machine controls; continue when ready.');lines.push('M0');}
      lines.push('G0 Z'+coord(s.cut.clearanceMm));
      job.moves.forEach(function(m){
        var dz=prior && Math.abs(m.z-prior.z)>EPS;
        var text=(m.kind==='rapid'?'G0':'G1')+(dz?' Z'+coord(m.z):' X'+coord(m.x)+' Y'+coord(m.y));
        if(m.kind==='cut')text+=' F'+number(m.feedMmMin/scale,5);
        lines.push(text);prior=m;
      });
      if(p.spindleMode==='manual'){comment('Stop the spindle using the machine controls before removing the work.');lines.push('M0');}
      lines.push('M5','M2');
    }
    var text=lines.join('\r\n')+'\r\n';
    var parsed=parseProgram(text,{id:p.id,spindleMode:p.spindleMode});
    if(parsed.moves.length!==job.moves.length)fail('Output readback changed the number of moves.');
    var maxCoord=0,maxFeed=0;
    parsed.moves.forEach(function(m,i){
      var src=job.moves[i];if(m.kind!==src.kind)fail('Output readback changed move kind.');
      ['x','y','z'].forEach(function(k){maxCoord=Math.max(maxCoord,Math.abs(m[k]-src[k]));});
      if(m.kind==='cut')maxFeed=Math.max(maxFeed,Math.abs(m.feedMmMin-src.feedMmMin));
    });
    if(maxCoord>0.00015 || maxFeed>0.002)fail('Output readback exceeded numeric tolerance.');
    return {postId:p.id,extension:p.extension,mime:'text/plain;charset=utf-8',text:text,units:p.units,
      validation:{pass:true,checkedMoves:parsed.moves.length,maximumCoordinateErrorMm:maxCoord,maximumFeedErrorMmMin:maxFeed,
        initialRetractMm:parsed.initialRetractMm,finalRetractMm:parsed.moves[parsed.moves.length-1].z,physicalMachineAcceptance:false}};
  }

  /* Output readback is a separate narrow interpreter. It does not call the
   * serializer or accept arbitrary controller programs. Unsupported commands,
   * missing setup modes and unsafe sequencing fail closed. */
  function parseProgram(text, profileOrId) {
    var p=profileFor(profileOrId), sb=p.controller==='shopbot', factor=p.units==='in'?25.4:1;
    if(typeof text!=='string'||!text.length||text.length>MAX_TEXT)fail('Program text is empty or exceeds the size limit.');
    if(/[^\x09\x0a\x0d\x20-\x7e]/.test(text))fail('Program contains unsupported characters.');
    // GRBL handles realtime bytes before its line/comment parser sees them.
    if(p.controller==='grbl'&&/[!?~]/.test(text))fail('GRBL program contains realtime command characters.');
    var raw=text.split(/\r?\n/), body=[];
    raw.forEach(function(line){
      if(sb){var q=line.indexOf("'");if(q>=0)line=line.slice(0,q);}
      else {
        if(/\([^)]*\(/.test(line)||/\)[^(]*\)/.test(line))fail('Malformed program comment.');
        line=line.replace(/\([^()]*\)/g,'');if(/[()]/.test(line))fail('Malformed program comment.');
      }
      line=line.trim();if(line)body.push(line.toUpperCase());
    });
    if(body.length>MAX_MOVES*3+100)fail('Program line limit exceeded.');
    if(sb){
      var unit=/^IF %\(25\)=([01]) THEN GOTO CW_UNITS_OK$/.exec(body[0]||'');
      if(!unit||Number(unit[1])!==(p.units==='in'?0:1))fail('ShopBot unit guard does not match the selected output units.');
      if(body[1]!=='PAUSE'||body[2]!=='END'||body[3]!=='CW_UNITS_OK:')fail('Malformed ShopBot unit-stop branch.');
      body=body.slice(4);
    }
    var pos={x:null,y:null,z:null},moves=[],initial=null,absolute=false,ended=false,speedXY=null,speedZ=null,feed=null,hasStart=false,hasStop=false,hasPause=false,hasJogSpeed=false,pauseAfterMotion=false;
    var modes={},unitsSeen=false;
    function numeric(s){if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))fail('Invalid numeric controller parameter.');var n=Number(s);if(!Number.isFinite(n)||Math.abs(n)>1000000)fail('Invalid finite controller parameter.');return n;}
    function motion(kind,values,f){
      if(ended)fail('Motion appears after program end.');
      if(!absolute)fail('Absolute-coordinate preamble is missing.');
      if(!sb){['G17','G90','G94','G54','G40','G49','G80','G92.1'].forEach(function(k){if(!modes[k])fail('Required work-origin or offset preamble is missing: '+k);});if(!unitsSeen)fail('Output units preamble is missing.');}
      if(p.controller==='linuxcnc'&&!modes.G61)fail('LinuxCNC exact path preamble G61 is missing.');
      var keys=Object.keys(values);
      if(initial===null){
        if(!hasPause)fail('Operator setup pause must precede the first motion.');
        if(sb&&(!hasJogSpeed||speedXY===null||speedZ===null))fail('ShopBot move and jog speeds must be set before motion.');
        if(kind!=='rapid'||keys.length!==1||keys[0]!=='z'||values.z<=0)fail('First motion must be a positive Z-only retract.');
        initial=values.z;pos.z=values.z;pauseAfterMotion=false;return;
      }
      var next={x:pos.x,y:pos.y,z:pos.z};keys.forEach(function(k){next[k]=values[k];});
      if(next.x===null||next.y===null||next.z===null)fail('Position is incomplete after initial retract.');
      var xy=pos.x===null||pos.y===null||Math.abs(next.x-pos.x)>EPS||Math.abs(next.y-pos.y)>EPS;
      var dz=Math.abs(next.z-pos.z)>EPS;
      if(xy&&dz)fail('Simultaneous XY/Z motion is unsupported in 2.5D output.');
      if(kind==='rapid'&&(next.z < -EPS||(xy&&(pos.z<initial-EPS||next.z<initial-EPS))))fail('Rapid motion is below initial clearance.');
      if(next.z>initial+EPS)fail('Motion exceeds the configured initial clearance.');
      if(kind==='cut'&&(!Number.isFinite(f)||f<=0))fail('Cutting feed is missing or invalid.');
      if(kind==='cut'&&!sb&&p.spindleMode==='controller'&&(!hasStart||hasStop))fail('Controller spindle must be started before cutting.');
      moves.push({kind:kind,x:next.x,y:next.y,z:next.z,feedMmMin:kind==='cut'?f:0});
      pos=next;pauseAfterMotion=false;if(moves.length>MAX_MOVES)fail('Move count limit exceeded.');
    }
    body.forEach(function(line){
      if(ended)fail('Unexpected command after program end.');
      if(sb){
        if(line==='SA'){if(initial!==null)fail('Unexpected absolute-mode change.');absolute=true;return;}
        if(line==='PAUSE'){hasPause=true;if(initial!==null)pauseAfterMotion=true;return;}
        if(line==='END'){ended=true;return;}
        var bits=line.split(','), command=bits.shift();
        if(command==='MS'||command==='JS'){
          if(bits.length!==2)fail('Invalid ShopBot speed command.');var sx=numeric(bits[0])*factor*60,sz=numeric(bits[1])*factor*60;
          if(sx<=0||sz<=0)fail('ShopBot speeds must be positive.');if(command==='MS'){speedXY=sx;speedZ=sz;}else hasJogSpeed=true;return;
        }
        if(command==='JZ'||command==='MZ'){
          if(bits.length!==1)fail('Invalid ShopBot Z command.');motion(command==='JZ'?'rapid':'cut',{z:numeric(bits[0])*factor},speedZ);return;
        }
        if(command==='J2'||command==='M2'){
          if(bits.length!==2)fail('Invalid ShopBot XY command.');motion(command==='J2'?'rapid':'cut',{x:numeric(bits[0])*factor,y:numeric(bits[1])*factor},speedXY);return;
        }
        fail('Unsupported ShopBot command: '+command);
      } else {
        if(line==='G61'){if(p.controller!=='linuxcnc')fail('Unsupported controller command: G61.');if(initial!==null)fail('Unexpected path preamble after motion.');modes.G61=true;return;}
        if(/^G(?:17|90|94|54|40|49|80|92\.1)$/.test(line)){if(initial!==null)fail('Unexpected preamble mode after motion.');if(line==='G54'&&!modes.G40)fail('G40 must cancel cutter compensation before selecting G54.');modes[line]=true;if(line==='G90')absolute=true;return;}
        if(line==='G20'||line==='G21'){if(initial!==null||unitsSeen)fail('Unexpected units change.');if(line!==(p.units==='in'?'G20':'G21'))fail('Program units do not match selected profile.');unitsSeen=true;return;}
        if(line==='M0'){hasPause=true;if(initial!==null)pauseAfterMotion=true;return;}
        if(line==='M5'){hasStop=true;return;}
        if(line==='M2'){ended=true;return;}
        var spindle=/^M3 S([+-]?(?:\d+(?:\.\d*)?|\.\d+))$/.exec(line);
        if(spindle){if(p.spindleMode!=='controller'||initial!==null||numeric(spindle[1])<=0)fail('Unexpected spindle command.');hasStart=true;hasStop=false;return;}
        var words=line.split(/\s+/),op=words.shift();
        if(op!=='G0'&&op!=='G1')fail('Unsupported G-code command: '+op);
        var values={},f=null;
        words.forEach(function(w){var m=/^([XYZF])([+-]?(?:\d+(?:\.\d*)?|\.\d+))$/.exec(w);if(!m)fail('Invalid G-code parameter.');var k=m[1].toLowerCase();if(k==='f'){if(f!==null)fail('Duplicate feed parameter.');f=numeric(m[2])*factor;}else{if(Object.prototype.hasOwnProperty.call(values,k))fail('Duplicate coordinate parameter.');values[k]=numeric(m[2])*factor;}});
        if(!Object.keys(values).length)fail('Empty motion command.');
        if(op==='G0'&&f!==null)fail('Rapid command must not set a cutting feed.');
        if(op==='G1'){if(f===null)fail('Every cutting move requires an explicit feed.');feed=f;}
        motion(op==='G0'?'rapid':'cut',values,feed);
      }
    });
    if(!ended)fail('Program end is missing.');
    if(initial===null||moves.length<2)fail('Program has no complete movement sequence.');
    if(!hasPause)fail('Operator setup pause is missing.');
    if(p.spindleMode==='manual'&&!pauseAfterMotion)fail('Manual spindle shutdown pause must follow the final motion.');
    if(!sb&&(!hasStop||(p.spindleMode==='controller'&&!hasStart)))fail('Spindle start/shutdown sequence is incomplete.');
    var last=moves[moves.length-1];if(last.kind!=='rapid'||Math.abs(last.z-initial)>EPS)fail('Final clearance retract is missing.');
    return {postId:p.id,units:'mm',outputUnits:p.units,moves:moves,initialRetractMm:initial,spindleMode:p.spindleMode,programEnd:true};
  }
  return Object.freeze({profiles:profiles,exportProgram:exportProgram,parseProgram:parseProgram});
});
