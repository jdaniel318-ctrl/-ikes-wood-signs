/* Hands-on tools for Wonderwake's Daniel School of Excellence. */
(() => {
  'use strict';
  const mounted = new WeakMap();

  function el(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  function controls() {
    return el('div', 'ds-row');
  }

  function button(label, onClick, group, className = '') {
    const node = el('button', 'ds-button ' + className, label);
    node.type = 'button';
    node.addEventListener('click', onClick);
    group.appendChild(node);
    return node;
  }

  function toolOutput(text) {
    const node = el('output', '', text);
    node.setAttribute('aria-live', 'polite');
    node.setAttribute('aria-atomic', 'true');
    return node;
  }

  function partitionIndex(band) {
    const match = String(band || '').match(/\d+/);
    if (/^\s*k/i.test(band) || !match) return 0;
    const grade = Number(match[0]);
    return grade >= 9 ? 3 : grade >= 6 ? 2 : grade >= 3 ? 1 : 0;
  }

  function field(label, type, props = {}) {
    const node = el('label', 'ds-control');
    const caption = el('span', '', label);
    const input = el('input');
    input.type = type;
    Object.assign(input, props);
    node.append(caption, input);
    return { node, input, caption };
  }

  // Canvas coordinates stay in a fixed logical world while the backing bitmap follows retina/resize.
  function fitCanvas(canvas, worldWidth, worldHeight, draw, signal) {
    const resize = () => {
      const box = canvas.getBoundingClientRect();
      if (box.width <= 0 || box.height <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const width = Math.max(1, Math.round(box.width * dpr));
      const height = Math.max(1, Math.round(box.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(width / worldWidth, 0, 0, height / worldHeight, 0, 0);
      draw(ctx);
    };
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(resize);
      observer.observe(canvas);
      signal.addEventListener('abort', () => observer.disconnect(), { once: true });
    } else {
      window.addEventListener('resize', resize, {signal});
    }
    canvas.closest('details')?.addEventListener('toggle', resize, {signal});
    const frame = requestAnimationFrame(resize);
    signal.addEventListener('abort', () => cancelAnimationFrame(frame), {once:true});
    return resize;
  }

  function artBench(tray, gradeBand, signal) {
    const tasks = [
      'Stamp a circle, triangle, or square. Add lines with your finger or a Pencil to make a sail flag.',
      'Draw a lookout’s sign using light and dark values. Try white beside charcoal, then white beside gray.',
      'Mark a vanishing point and sketch a pier. Draw the edges receding toward that same point.',
      'Sketch two visual motifs on one sail. Change scale, rhythm, or contrast to give one more emphasis.'
    ];
    tray.append(el('p', '', tasks[gradeBand]));
    const colors = [['Ink','#18333b'],['Saffron','#df9418'],['Tide','#20728b'],['Coral','#bc523e'],['Gray','#878783'],['White','#ffffff']];
    const palette = controls();
    palette.classList.add('ds-palette');
    let color = colors[0][1], brush = 5, tool = 'Pen';
    const paletteButtons = colors.map(([name, hex]) => {
      const node = button(name, () => {
        color = hex;
        paletteButtons.forEach((b,i) => b.setAttribute('aria-pressed', String(colors[i][1] === color)));
      }, palette);
      const swatch = el('span','ds-swatch'); swatch.style.background = hex; swatch.setAttribute('aria-hidden','true');
      node.prepend(swatch);
      node.setAttribute('aria-pressed', String(color === hex));
      return node;
    });
    const styles = controls();
    const shapes = ['Pen','Circle','Triangle','Square'];
    const stamps = shapes.map(name => {
      const b = button(name,() => {
        keyLine=false;active=null;tool=name;
        stamps.forEach((v,i) => v.setAttribute('aria-pressed',String(shapes[i]===name)));
      },styles);
      b.setAttribute('aria-pressed',String(name===tool));return b;
    });
    const width = field('Brush size', 'range', {min:2, max:16, value:5});
    width.input.addEventListener('input', () => {
      brush = Number(width.input.value);
      width.caption.textContent = 'Brush size · ' + brush;
    });
    const canvas = el('canvas', 'ds-paper');
    canvas.tabIndex = 0;
    canvas.setAttribute('aria-label','Sail sketchpad. Tap or draw. Keyboard: arrows move the pen, Space stamps the selected mark, Enter starts or finishes a line.');
    const done = toolOutput('Blank sail.');
    const row = controls();
    const strokes = [];
    let active = null, pointerId = null, keyLine = false;
    const cursor = {x:300,y:150};
    let showCursor = false;
    const undo = button('Undo last mark', () => {
      active = null; keyLine = false;
      strokes.pop();
      syncDrawing();
    }, row);
    undo.disabled = true;
    const tip = el('p','ds-small','Finger or Pencil draws. With a keyboard, use arrows to move, Space to stamp, Enter to start or finish a line. Sketches stay on this workbench until you leave the lesson.');
    tray.append(palette, styles, width.node, canvas, row, done, tip);
    function line(ctx, stroke) {
      const pts = stroke.points;
      ctx.strokeStyle = ctx.fillStyle = stroke.color;
      if (stroke.tool!=='Pen') {
        const {x,y}=pts[0], size=stroke.width+7;
        ctx.beginPath();
        if(stroke.tool==='Circle') ctx.arc(x,y,size,0,Math.PI*2);
        else if(stroke.tool==='Square') ctx.rect(x-size,y-size,size*2,size*2);
        else {ctx.moveTo(x,y-size);ctx.lineTo(x+size,y+size);ctx.lineTo(x-size,y+size);ctx.closePath();}
        ctx.fill();return;
      }
      ctx.lineWidth = stroke.width;
      ctx.lineJoin = ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, stroke.width / 2, 0, Math.PI * 2);
      ctx.fill();
      if (pts.length < 2) return;
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (const pt of pts.slice(1)) ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
    const draw = fitCanvas(canvas,600,300,ctx => {
      ctx.fillStyle = '#fcf3dc'; ctx.fillRect(0,0,600,300);
      ctx.strokeStyle = '#dfd6b9'; ctx.lineWidth = 1;
      for(let x = 25; x < 600; x += 50) {
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,300); ctx.stroke();
      }
      for(let y = 20; y < 300; y += 50) {
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(600,y); ctx.stroke();
      }
      for(const stroke of strokes) line(ctx, stroke);
      if (showCursor) {
        ctx.beginPath(); ctx.arc(cursor.x,cursor.y,10,0,2*Math.PI);
        ctx.strokeStyle='#fff'; ctx.lineWidth=4; ctx.stroke();
        ctx.strokeStyle='#343e3e'; ctx.lineWidth=2; ctx.stroke();
      }
    },signal);
    function syncDrawing() {
      undo.disabled = !strokes.length;
      done.textContent = strokes.length ? strokes.length + (strokes.length===1?' mark.':' marks.') : 'Blank sail.';
      draw();
    }
    function startStroke(pt) {
      active = { width:brush, color, tool, points:[{x:pt.x,y:pt.y}] };
      strokes.push(active); undo.disabled = false;
    }
    function point(event) {
      const r = canvas.getBoundingClientRect();
      return {
        x:Math.max(0,Math.min(600,(event.clientX-r.left)*600/r.width)),
        y:Math.max(0,Math.min(300,(event.clientY-r.top)*300/r.height))
      };
    }
    canvas.addEventListener('pointerdown', e => {
      if (pointerId !== null || e.button !== 0) return;
      pointerId = e.pointerId;
      canvas.setPointerCapture(pointerId);
      showCursor = keyLine = false;
      startStroke(point(e)); draw();
    });
    canvas.addEventListener('pointermove', e => {
      if (!active || active.tool !== 'Pen' || e.pointerId !== pointerId) return;
      const samples = e.getCoalescedEvents?.();
      for (const sample of samples?.length ? samples : [e]) active.points.push(point(sample));
      draw();
    });
    function finish(e) {
      if (e.pointerId !== pointerId) return;
      pointerId = null; active = null;
      syncDrawing();
    }
    canvas.addEventListener('pointerup', finish);
    canvas.addEventListener('pointercancel', finish);
    canvas.addEventListener('lostpointercapture', finish);
    canvas.addEventListener('keydown', e => {
      const moves = {ArrowLeft:[-10,0], ArrowRight:[10,0], ArrowUp:[0,-10], ArrowDown:[0,10]};
      if (pointerId !== null || (!moves[e.key] && !['Enter',' '].includes(e.key))) return;
      e.preventDefault(); showCursor = true;
      if (moves[e.key]) {
        const [dx,dy] = moves[e.key];
        cursor.x = Math.max(0,Math.min(600,cursor.x+dx)); cursor.y = Math.max(0,Math.min(300,cursor.y+dy));
        if (keyLine && active) active.points.push({...cursor});
        done.textContent = 'Pen at column ' + (1+cursor.x/10) + ', row ' + (1+cursor.y/10) + '.';
      } else if (e.key === ' ' || tool !== 'Pen') {
        keyLine = false; startStroke(cursor); active = null; syncDrawing();
      } else if (!e.repeat) {
        keyLine = !keyLine;
        if (keyLine) { startStroke(cursor); done.textContent = 'Drawing a line. Move with arrows.'; }
        else { active = null; syncDrawing(); }
      }
      draw();
    });
    canvas.addEventListener('blur', () => {
      if (pointerId !== null) return;
      showCursor = keyLine = false; active = null; draw();
    });
  }

  function musicBench(tray, gradeBand, signal) {
    const notes = gradeBand < 2
      ? [['C',261.63],['D',293.66],['E',329.63],['G',392]]
      : [['C',261.63],['D',293.66],['E',329.63],['F',349.23],['G',392],['A',440],['B',493.88],['High C',523.25]];
    const steps = Array(gradeBand < 2 ? 4 : 8).fill(-1);
    const beatLabels = Array.from(steps,(_,i) => steps.length===4 ? String(i+1) : String(Math.floor(i/2)+1)+(i%2?' &':''));
    const unitDuration = steps.length===4 ? 540 : 270;
    const instructions = [
      'Choose and hear a bell, then tap a beat to place it. Can you make a pattern that goes low, middle, high?',
      'Fill one four-beat measure. Put bells on three beats and leave a rest on the fourth.',
      'There are eight half-beats in this bar. Place a bell on an “&” between beats to hear an offbeat entrance.',
      'Write a short motif. Play it. Then move every note up by the same musical interval and compare.'
    ];
    tray.append(el('p','',instructions[gradeBand]));
    const keys = controls(), beats = el('div','ds-grid ds-beats' + (steps.length === 8 ? ' ds-eight':''));
    const row = controls(), status = toolOutput('Choose a bell or a rest.');
    let selected = 0, ctx = null, interval = 0, next = 0;
    const voices = new Set();
    function unlock() {
      const Constructor = window.AudioContext || window.webkitAudioContext;
      if (!Constructor) return;
      try {
        if (!ctx) ctx = new Constructor();
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      } catch (_) { /* A device with unavailable audio still shows timing and notes. */ }
    }
    function sound(i) {
      if (!ctx || i < 0 || ctx.state === 'closed') return;
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      const t = ctx.currentTime;
      osc.type = 'sine'; osc.frequency.value = notes[i][1];
      gain.gain.setValueAtTime(.0001,t);
      gain.gain.exponentialRampToValueAtTime(.15,t+.015);
      gain.gain.exponentialRampToValueAtTime(.0001,t+.5);
      osc.connect(gain); gain.connect(ctx.destination); voices.add(osc);
      osc.onended = () => { voices.delete(osc); osc.disconnect(); gain.disconnect(); };
      osc.start(t); osc.stop(t+.52);
    }
    const keyButtons = [['Rest',null],...notes].map(([name], idx) => {
      const i = idx - 1;
      const b = button(name, () => {
        selected = i; unlock(); sound(i);
        keyButtons.forEach((key,k) => key.setAttribute('aria-pressed',String(k-1===selected)));
        status.textContent = name + ' selected. Choose a beat.';
      }, keys);
      b.setAttribute('aria-label', i < 0 ? 'Choose a rest' : 'Choose bell ' + name);
      b.setAttribute('aria-pressed', String(selected===i)); return b;
    });
    function describe(i) {
      const name = steps[i] < 0 ? 'Rest' : notes[steps[i]][0];
      const b = beatButtons[i];
      b.replaceChildren(el('span','','Beat ' + beatLabels[i]),el('strong','',name));
      b.setAttribute('aria-label','Beat ' + beatLabels[i] + ', ' + name + '. Place selected bell or rest.');
    }
    const beatButtons = steps.map((_,i) => button('',() => {
      stop(); steps[i] = selected; describe(i); unlock(); sound(selected);
      status.textContent = 'Beat ' + beatLabels[i] + ' set to ' + (selected < 0 ? 'a rest.' : notes[selected][0] + '.');
    }, beats,'ds-beat'));
    beatButtons.forEach((_,i) => describe(i));
    const play = button('Play sequence',() => {
      if (interval) { stop(); status.textContent='Stopped.'; return; }
      unlock(); next=0;
      play.textContent='Stop'; status.textContent='Playing one four-beat measure.';
      function tick() {
        beatButtons.forEach((b,i) => b.classList.toggle('ds-now',i===next));
        if(next>=steps.length) { stop(); status.textContent='Sequence finished.'; return; }
        sound(steps[next++]);
      }
      interval = window.setInterval(tick,unitDuration); tick();
    }, row);
    function stop() {
      if (interval) clearInterval(interval);
      interval=0;
      play.textContent='Play sequence'; beatButtons.forEach(b => b.classList.remove('ds-now'));
      for (const osc of voices) { try { osc.stop(); } catch (_) { /* Already stopped. */ } }
    }
    const details=tray.closest('details');
    details.addEventListener('toggle', () => {if(!details.open){stop(); status.textContent='Ready to play.';}},{signal});
    document.addEventListener('visibilitychange',() => {if(document.hidden){stop(); status.textContent='Ready to play.';}},{signal});
    signal.addEventListener('abort',() => {
      stop();
      if (ctx && ctx.state !== 'closed') ctx.close().catch(() => {});
    },{once:true});
    tray.append(keys,beats,row,status);
  }

  function mathBench(tray, band) {
    if (band === 0) {
      tray.append(el('p','','The dock has ten lamp places. Light or dim a lamp to see how many places are still dark.'));
      const frame = el('div','ds-grid ds-frames'), report=toolOutput('');
      const lamps=Array(10).fill(false);
      function update() {
        const total=lamps.filter(Boolean).length;
        report.textContent=total+' lit + '+(10-total)+' dark = 10 lamps.';
        lamps.forEach((on,i) => {
          switches[i].textContent=on?'Lit':'Dark';
          switches[i].setAttribute('aria-label','Lamp '+(i+1)+', '+(on?'lit':'dark'));
          switches[i].setAttribute('aria-pressed',String(on));
        });
      }
      const switches=lamps.map((_,i) => button('',() => {lamps[i]=!lamps[i];update();},frame,'ds-lamp'));
      update(); tray.append(frame,report); return;
    }
    if (band === 1) {
      tray.append(el('p','','Divide one oil tank into equal parts. Fill some parts, then compare the amount in eighths or fourths.'));
      const partition=el('label','ds-control','Equal parts of one tank');
      const select=el('select');
      [2,3,4,6,8].forEach(n => { const o=el('option','',n+' equal parts');o.value=n;select.append(o); });
      select.value='4'; partition.append(select);
      const cells=el('div','ds-grid ds-frac'), report=toolOutput('');
      const gcd=(a,b) => b ? gcd(b,a%b) : a;
      function render() {
        const n=Number(select.value), parts=Array(n).fill(false);
        cells.replaceChildren();cells.style.setProperty('--parts',n);
        function update() {
          const count=parts.filter(Boolean).length, g=gcd(count,n), num=count/g, den=n/g;
          const reduced=den===1?String(num):num+'/'+den;
          report.textContent=count+' of '+n+' equal parts filled. Fraction '+count+'/'+n+' = '+reduced+'.';
        }
        parts.forEach((_,i) => {
          const b=button('–',() => {
            parts[i]=!parts[i];b.textContent=parts[i]?'●':'–';b.setAttribute('aria-pressed',String(parts[i]));update();
          },cells);
          b.setAttribute('aria-label','Fill or empty tank part '+(i+1));b.setAttribute('aria-pressed','false');
        });
        update();
      }
      select.addEventListener('change',render);
      render();tray.append(partition,cells,report);return;
    }
    const isModels=band===3;
    tray.append(el('p','',isModels ? 'Compare two signal boats. Boat B travels 3 km each hour from the dock. Give boat A a head start and a rate, then move time forward.' : 'Set the chart scale and move along a route. Each chart unit covers the same number of real kilometres.'));
    const fields=el('div','ds-twin');
    const rate=field(isModels?'Boat A speed (km/h)':'Scale (km per chart unit)','range',{min:1,max:6,value:2});
    const distance=field(isModels?'Time (h)':'Chart distance (units)','range',{min:0,max:12,value:4});
    const start=field('Boat A head start (km)','range',{min:0,max:12,value:4});
    fields.append(rate.node,distance.node);if(isModels)fields.append(start.node);
    const report=toolOutput('');
    function update() {
      const r=Number(rate.input.value),t=Number(distance.input.value),b=Number(start.input.value);
      rate.caption.textContent=(isModels?'Boat A speed':'Chart scale')+' · '+r+(isModels?' km/h':' km per unit');
      distance.caption.textContent=(isModels?'Elapsed time':'Chart distance')+' · '+t+(isModels?' h':' units');
      start.caption.textContent='Boat A head start · '+b+' km';
      if(isModels) {
        const a=b+r*t, other=3*t;
        report.textContent='A: '+b+' + '+r+' × '+t+' = '+a+' km. B: 3 × '+t+' = '+other+' km. '+(a===other?'Boats meet here.':'Gap: '+Math.abs(a-other)+' km.');
      } else report.textContent=t+' units × '+r+' km per unit = '+(r*t)+' km.';
    }
    [rate,distance,start].forEach(f=>f.input.addEventListener('input',update));
    update();tray.append(fields,report);
  }

  function wordBench(tray, band, spelling) {
    // The label goal and all examples are supplied explicitly. Learners can rearrange without losing lesson attempts.
    const sets=spelling ? [
      {lead:'Build the word for a cloud of tiny water drops near the ground: FOG. Listen to its first sound, /f/.',pieces:['O','F','G','B'],answer:['F','O','G'],tip:'Begin with F for /f/, add O, then G.'},
      {lead:'Build the past tense of CARRY. Choose a spelling for the base and the ending.',pieces:['carry','carri','ed','d'],answer:['carri','ed'],tip:'After a consonant, change the final y to i before adding -ed: carried.'},
      {lead:'Build RECONSTRUCT, meaning to build again. Combine the prefix with the base.',pieces:['un','re','struct','construct'],answer:['re','construct'],tip:'The prefix re- means again. Construct means build. Put re before construct.'},
      {lead:'Build SPECTROSCOPE, an instrument for observing a spectrum. Combine the forms.',pieces:['spectro','scope','graph','spectra'],answer:['spectro','scope'],tip:'Use the combining form spectro- before -scope to make spectroscope.'}
    ] : [
      {lead:'Write a harbor report with a capital at the start and a period at the end.',pieces:['the','The','lamp','glows','.','?'],answer:['The','lamp','glows','.'],tip:'A statement starts with The and finishes with a period.'},
      {lead:'Write a statement about several boats. Match the verb to a plural subject.',pieces:['The','boats','boat','wait','waits','.'],answer:['The','boats','wait','.'],tip:'Several boats wait. One boat waits.'},
      {lead:'Mira heard Jo ring a bell. Build a sentence that names who rang it.',pieces:['Jo','rang','she','the','bell','.'],answer:['Jo','rang','the','bell','.'],tip:'The name Jo makes the actor clear without an ambiguous pronoun.'},
      {lead:'Give three orders in matching grammatical forms. Build the crew’s concise checklist.',pieces:['Chart',',','mark','and','to log','log','.'],answer:['Chart',',','mark',',','and','log','.'],tip:'Use three parallel imperative verbs: Chart, mark, and log.'}
    ];
    const set=sets[band], built=[], tiles=controls(), actions=controls(), line=el('div','ds-answer'), report=toolOutput('');
    tray.append(el('p','',set.lead));
    function preview() {
      line.textContent=built.length ? (spelling?built.join(''):built.join(' ').replace(/ ([,.?])/g,'$1')) : 'Your work goes here.';
      undo.disabled=check.disabled=!built.length;
    }
    set.pieces.forEach(s=>button(s,() => {
      if(built.length>=set.answer.length+3){report.textContent='Remove a piece to make room.';return;}
      built.push(s);report.textContent='';preview();
    },tiles));
    const undo=button('Remove last',() => {built.pop();report.textContent='';preview();},actions);
    const check=button('Check construction',() => {
      report.textContent=built.length===set.answer.length && built.every((s,i)=>set.answer[i]===s) ? 'That works. '+set.tip : set.tip;
    },actions);
    preview();tray.append(tiles,line,actions,report);
  }

  function scienceBench(tray,band,signal) {
    if(band===0) {
      tray.append(el('p','','Move the light past a post. Watch which side gets the shadow.'));
      const lamp=field('Lamp position','range',{min:-4,max:4,step:1,value:-3});
      const canvas=el('canvas','ds-chart');canvas.setAttribute('aria-hidden','true');
      const result=toolOutput('');
      tray.append(canvas,lamp.node,result);
      const draw=fitCanvas(canvas,400,160,ctx => {
        const x=200+Number(lamp.input.value)*36,shadow=200-Number(lamp.input.value)*21;
        ctx.fillStyle='#183841';ctx.fillRect(0,0,400,160);ctx.fillStyle='#a5c1ae';ctx.fillRect(0,125,400,35);
        ctx.beginPath();ctx.moveTo(x,33);ctx.lineTo(200,76);ctx.lineTo(shadow,125);ctx.lineTo(200,125);ctx.closePath();ctx.fillStyle='#e3be65';ctx.globalAlpha=.22;ctx.fill();ctx.globalAlpha=1;
        ctx.fillStyle='#415859';ctx.beginPath();ctx.ellipse((200+shadow)/2,127,Math.abs(200-shadow)/2+5,3,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#9d7150';ctx.fillRect(194,76,12,50);
        ctx.fillStyle='#ffdb87';ctx.beginPath();ctx.arc(x,33,10,0,Math.PI*2);ctx.fill();
      },signal);
      function change() {
        const v=Number(lamp.input.value),side=v<0?'left':v>0?'right':'center';
        lamp.caption.textContent='Lamp position · '+side;
        result.textContent=v===0?'The light is directly above the post. The shadow is under it.':'The light is on the '+side+'. The shadow falls to the '+(v<0?'right':'left')+'.';
        draw();
      }
      lamp.input.addEventListener('input',change);change();return;
    }
    if(band===1) {
      tray.append(el('p','','Test how a fan affects a model sailboat. Keep the sail unchanged to compare only wind speed.'));
      const wind=field('Fan speed','range',{min:1,max:4,value:2});
      const sail=field('Sail area','range',{min:1,max:3,value:1});
      const model=el('div','ds-twin');model.append(wind.node,sail.node);
      const result=toolOutput('Record a first trial.');const row=controls();let previous=null;
      function labels(){wind.caption.textContent='Fan setting · '+wind.input.value;sail.caption.textContent='Sail setting · '+sail.input.value;}
      [wind,sail].forEach(f => f.input.addEventListener('input',labels));labels();
      button('Run trial',() => {
        const w=Number(wind.input.value),s=Number(sail.input.value),distance=w*s*2;
        let note='Keep one setting fixed and run another trial.';
        if(previous) {
          const changed=Number(w!==previous.w)+Number(s!==previous.s);
          note='Previous model distance: '+previous.distance+' cm. '+['Same settings: a repeat trial.','One setting changed: a fair comparison.','Both settings changed. Which caused the difference? Try changing only one.'][changed];
        }
        result.textContent='Model distance: '+distance+' cm. '+note;previous={w,s,distance};
      },row);tray.append(model,row,result);return;
    }
    if(band===2) {
      tray.append(el('p','','Compare model samples with fresh water (about 1 g/mL). Adjust mass and volume to investigate density.'));
      const mass=field('Mass','range',{min:1,max:40,value:10}),vol=field('Volume','range',{min:1,max:30,value:10});
      const panels=el('div','ds-twin');panels.append(mass.node,vol.node);const result=toolOutput('');
      function change() {
        const m=Number(mass.input.value),v=Number(vol.input.value);
        mass.caption.textContent='Sample mass · '+m+' g';vol.caption.textContent='Sample volume · '+v+' mL';
        result.textContent=m+' g ÷ '+v+' mL ≈ '+(m/v).toFixed(2)+' g/mL. '+(m===v?'Equal to our fresh-water reference.':m>v?'Denser than the reference.':'Less dense than the reference.');
      }
      [mass,vol].forEach(f => f.input.addEventListener('input',change));change();tray.append(panels,result);return;
    }
    tray.append(el('p','','A harbor has three zones. Compare simulated algae counts from each before making a claim about the whole harbor.'));
    const pools=[['Inner dock',[16,15,17]],['Channel',[7,8,6]],['Outer reef',[2,4,3]]];
    const row=controls(),report=toolOutput('Choose a zone to collect its next simulated count.'),readings=[];
    const picked=[0,0,0];
    const zoneButtons=pools.map(([name,counts],i)=>button(name,() => {
      if(picked[i]>=counts.length)return;
      const count=counts[picked[i]++];readings.push(count);
      const n=readings.length,mean=readings.reduce((a,b)=>a+b,0)/n;
      zoneButtons[i].disabled=picked[i]===counts.length;
      report.textContent=name+': '+count+' algae cells per slide. Sample mean: '+mean.toFixed(1)+'. Zones sampled: '+picked.filter(Boolean).length+' of 3. '+(picked.every(x=>x===picked[0])?'Sampling is even across these zones.':'Zone representation is uneven.');
    },row));
    button('Reset sample',()=>{picked.fill(0);readings.length=0;zoneButtons.forEach(b=>b.disabled=false);report.textContent='Model reset. Choose a zone.';},row);
    tray.append(row,report);
  }

  const tools = {
    math:['Math workbench',mathBench], spelling:['Word builder',(t,b) => wordBench(t,b,true)],
    grammar:['Sentence workshop',(t,b) => wordBench(t,b,false)], science:['Harbor experiment',scienceBench],
    art:['Sailmaker’s sketchpad',artBench], music:['Harbor bell studio',musicBench]
  };
  function mount(container,subject,band) {
    mounted.get(container)?.();
    const config=tools[String(subject||'').toLowerCase().trim()];
    if (!config) return () => {};
    const details=el('details','dschool-studio'),sum=el('summary','',config[0]),tray=el('div','ds-tray');
    const controller=new AbortController();
    details.append(sum,tray);container.append(details);
    const bandIndex=partitionIndex(band);
    // Initialize on open, after the tool has a real viewport. Redraws and audio end with its lesson.
    let made=false;
    details.addEventListener('toggle',() => {
      if(details.open && !made) { made=true;config[1](tray,bandIndex,controller.signal); }
    },{signal:controller.signal});
    function cleanup() { controller.abort();details.remove();if(mounted.get(container)===cleanup)mounted.delete(container); }
    mounted.set(container,cleanup);return cleanup;
  }
  window.SchoolStudio=Object.freeze({mount});
})();
