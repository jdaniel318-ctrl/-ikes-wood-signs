(function (scope) {
  'use strict';
  const {subjects, bands, fresh, newRecord} = WWSchoolState;
  const places = {Math:'Beacon Pier', Spelling:'The post boat', Grammar:'Dispatch desk', Science:'Field station', Art:'Sail loft', Music:'Bell tower'};
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const key = lesson => lesson.subject + '-' + bands.indexOf(lesson.band);
  function stationArt(subject) {
    return 'station-' + subject.toLowerCase() + '.webp';
  }
  function shortcuts(profile) {
    const level = profile.school?.band || 0;
    return '<section class="ds-shortcuts" aria-label="School stations">'+subjects.map(subject=>
      '<button class="ds-shortcut" data-action="station" data-key="'+(profile.school?.paths[subject] || subject+'-'+level)+'"><img width="764" height="337" src="'+stationArt(subject)+'" alt=""><span>'+subject+'</span></button>'
    ).join('')+'</section>';
  }
  function learnerStation(profile) {
    const current=scope.SchoolLessons.find(l=>key(l)===profile.school?.current);
    const image=current?stationArt(current.subject):'lantern-harbor.webp';
    return {image, caption:current?'Last lesson · '+current.title:'Ready for Lantern Harbor'};
  }
  function entry(profile) {
    const older = (profile.school?.band || 0) > 1;
    return '<section class="ds-hero ds-entry '+(older?'ds-older':'')+'"><div class="ds-cover"><span>Daniel School of Excellence</span><h1>Lantern Harbor</h1><p>A mail boat is waiting for a light. Choose your subject and take a turn at the harbor.</p><button class="ds-primary" data-action="school">'+(profile.school?.current?'Return to school':'Enter Lantern Harbor')+' &nbsp; →</button></div></section>'+shortcuts(profile);
  }
  function mount(root, {owner, name, change, speak, voice, initialKey}) {
    const lessons = scope.SchoolLessons;
    const byKey = new Map(lessons.map(lesson => [key(lesson),lesson]));
    const state = owner.school || fresh();
    let selectedBand = state.band, grade = bands[selectedBand].split('–')[0];
    let playing = null, solved = false, shownStep = 0, clearStudio = null, sound = null;
    const abort = new AbortController();
    const signal = abort.signal;
    const write = () => { owner.school = state; change(); };
    function silence() {
      if (sound && sound.state !== 'closed') void sound.close().catch(()=>{});
      sound=null;
      if (scope.speechSynthesis) scope.speechSynthesis.cancel();
    }
    function clear() {
      silence();
      if (clearStudio) { clearStudio(); clearStudio=null; }
    }
    function focusHeading() {
      const heading=root.querySelector('h1,h2');
      if (heading) { heading.tabIndex=-1; heading.focus({preventScroll:true}); }
      window.scrollTo(0,0);
    }
    function badge(r) {
      if (!r) return '';
      if (r.step === 3) return 'Lesson complete';
      return r.step ? r.step + ' of 3 checked' : r.completions ? 'Practicing again' : 'Started';
    }
    function harbor(focus=true) {
      clear(); playing=null;
      const saved = byKey.get(state.current);
      const resume = saved && state.records[state.current].step < 3;
      const done = Object.values(state.records).filter(r=>r.completions>0).length;
      const place = selectedBand < 2 ? 'Lantern Harbor' : 'The tide room';
      const trails = lessons.filter(l=>l.band===bands[selectedBand]).map(l=>{
        const note=badge(state.records[key(l)]);
        return '<button class="ds-card ds-'+l.subject.toLowerCase()+'" data-school="lesson" data-key="'+key(l)+'"><img class="ds-station-picture" alt="" src="'+stationArt(l.subject)+'" width="764" height="337"><span class="ds-card-body"><span class="ds-label">'+l.subject+' · '+places[l.subject]+'</span><strong>'+esc(l.title)+'</strong><small>'+esc(l.goal)+'</small>'+(note?'<em>'+esc(note)+'</em>':'')+'</span><span class="ds-arrow" aria-hidden="true">→</span></button>';
      }).join('');
      root.innerHTML='<section class="ds"><div class="ds-top"><span>'+esc(name)+'’s school</span><button class="ds-link" data-school="map">K–12 curriculum map ↗</button></div><div class="ds-hero '+(selectedBand>1?'ds-older':'')+'"><div class="ds-cover"><span>Daniel School of Excellence</span><h1>'+place+'</h1><p>'+(selectedBand<2?'From the lantern pier to the bell tower, every station has a job for you.':'Take the watch. Read the instruments, test an idea and send word back to the harbor.')+'</p>'+(resume?'<button class="ds-primary" data-school="resume">Continue my adventure →</button><small>'+esc(saved.title)+'</small>':'')+'</div></div><div class="ds-shelf"><div><h2>Choose a lesson</h2><p>'+done+' of '+lessons.length+' harbor lessons completed</p></div><div class="ds-bands" aria-label="Choose lesson level">'+bands.map((b,i)=>'<button data-school="band" data-band="'+i+'" aria-pressed="'+(selectedBand===i)+'">Grades '+b+'</button>').join('')+'</div></div><div class="ds-cards">'+trails+'</div></section>';
      if (focus) focusHeading();
    }
    function map(focus=true) {
      clear();
      const row=scope.SchoolMap.find(r=>r.grade===grade)||scope.SchoolMap[0];
      root.innerHTML='<section class="ds ds-map"><button class="ds-back" data-school="harbor">← Harbor lessons</button><span class="ds-label">Daniel School of Excellence</span><h1>Curriculum map</h1><p>Explore suggested skills to practice alongside school. In high school, follow the order of the courses your learner takes.</p><label>Explore grade <select data-field="grade">'+scope.SchoolMap.map(r=>'<option value="'+r.grade+'" '+(r.grade===grade?'selected':'')+'>'+ (r.grade==='K'?'Kindergarten':'Grade '+r.grade)+'</option>').join('')+'</select></label><h2>'+ (row.grade==='K'?'Kindergarten':'Grade '+row.grade)+' goals</h2><dl>'+subjects.map(s=>'<div><dt>'+s+'</dt><dd>'+esc(row[s])+'</dd></div>').join('')+'</dl><button class="ds-primary" data-school="level-go">Play this grade band →</button><details><summary>Curriculum references and coverage</summary><p>These are original suggested goals. The first release offers one playable harbor lesson per subject in each of four grade bands. A completed lesson records practice on one skill.</p>'+scope.SchoolSources.map(s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.name)+' ↗</a>').join('')+'</details></section>';
      if(focus)focusHeading(); else root.querySelector('select').focus({preventScroll:true});
    }
    function begin(id, continuing=false) {
      const l=byKey.get(id); if (!l) return;
      const old=state.records[id], prior=byKey.get(state.paths[l.subject]);
      const revisit=!continuing && state.current && id!==state.current &&
        (old?.completions || (prior && bands.indexOf(l.band)<bands.indexOf(prior.band)));
      if (!old) state.records[id]=newRecord();
      const rec=state.records[id];
      if (rec.step===3) { rec.step=0; rec.assisted=false; }
      if (!revisit) { state.current=id; state.paths[l.subject]=id; }
      state.band=selectedBand=bands.indexOf(l.band);
      playing=l; solved=false; write(); drawLesson(true);
    }
    function lightRow(on,total,flags=false) {
      const wording=(flags?'Flags':'Lanterns')+': '+on+' of '+total;
      return '<div class="ds-lamps '+(flags?'ds-flags':'')+'" role="img" aria-label="'+wording+'">'+Array.from({length:total},(_,i)=>'<span aria-hidden="true" class="'+(i<on?'bright':'')+'">'+''+'</span>').join('')+'</div>';
    }
    function drawLesson(focus=false) {
      clear();
      const l=playing, rec=state.records[key(l)];
      shownStep=rec.step; solved=false;
      if(shownStep===3) { finish(); return; }
      const q=l.rounds[shownStep];
      let scene='', liveCount='';
      if (l.subject==='Math'&&l.band===bands[0]) {
        const quantities=[[2,3],[2,4],[3,5]][shownStep];
        scene=lightRow(...quantities,shownStep===2); liveCount=' data-total="'+quantities[1]+'"';
      }
      root.innerHTML='<article class="ds ds-play ds-'+l.subject.toLowerCase()+'"><div class="ds-top"><button class="ds-back" data-school="harbor">← Harbor lessons</button><span>'+esc(name)+' · '+l.band+'</span></div><div class="ds-play-grid"><section class="ds-place"><div><span class="ds-label">'+l.subject+' · '+places[l.subject]+'</span><h1>'+esc(l.title)+'</h1><p>'+esc(l.goal)+'</p></div></section><section class="ds-question"><div class="ds-qmeta"><span class="ds-label">'+(shownStep===2?'Try it in a new situation':'Harbor practice')+' · '+(shownStep+1)+' / 3</span><button class="ds-link" data-school="listen" aria-label="Read the question and choices aloud">Read aloud</button></div><h2>'+esc(q.prompt)+'</h2><div class="ds-evidence"'+liveCount+'>'+scene+'</div>'+(q.tones?'<button class="ds-back" data-school="bells">♪ Play the bells</button>':'')+'<div class="ds-answers">'+q.choices.map((c,i)=>'<button data-school="answer" data-option="'+i+'">'+esc(c)+'</button>').join('')+'</div><div class="ds-feedback" role="status" aria-live="polite"></div><div class="ds-actions"><button class="ds-link" data-school="help">Teach me again</button><button class="ds-primary" data-school="next" hidden>Continue →</button></div><div class="ds-coach" hidden></div></section></div><div class="ds-tools"></div></article>';
      clearStudio=scope.SchoolStudio.mount(root.querySelector('.ds-tools'),l.subject,l.band);
      if(focus) focusHeading();
      if(voice()) read();
    }
    function read() {
      const q=playing.rounds[shownStep];
      speak(q.prompt+' Your choices are '+q.choices.join(', ')+'.');
    }
    function coach() {
      const l=playing, rec=state.records[key(l)], q=l.rounds[shownStep];
      const box=root.querySelector('.ds-coach'); box.hidden=false;
      box.innerHTML='<strong>Try this together</strong><p>'+esc(l.teach)+'</p><p>'+esc(q.hint)+'</p><button class="ds-link" data-school="hear-help">Hear the example</button>';
      if(!rec.assisted) {rec.assisted=true; write();}
      if(voice()) speak(l.teach+' '+q.hint);
    }
    function answer(button) {
      if(solved) return;
      const l=playing, rec=state.records[key(l)], q=l.rounds[shownStep];
      const feedback=root.querySelector('.ds-feedback');
      if(Number(button.dataset.option)!==q.answer) {
        button.setAttribute('aria-disabled','true'); button.disabled=true;
        feedback.textContent='Try another idea. '+q.hint;
        rec.assisted=true; write(); if(voice()) speak(feedback.textContent); return;
      }
      solved=true;
      if(shownStep===2) {rec.solo=rec.solo||(!rec.assisted && !rec.completions);rec.completions=Math.min(999999,rec.completions+1);}
      rec.step++;rec.assisted=false;write();
      button.classList.add('ds-correct');
      for(const b of root.querySelectorAll('[data-school="answer"]')) b.disabled=true;
      const evidence=root.querySelector('.ds-evidence[data-total]');
      if(evidence) evidence.innerHTML=lightRow(Number(evidence.dataset.total),Number(evidence.dataset.total),shownStep===2);
      feedback.textContent=q.why;
      root.querySelector('[data-school="help"]').hidden=true;
      const next=root.querySelector('[data-school="next"]');next.hidden=false; next.textContent=shownStep===2?'Finish the lesson →':'Next challenge →';next.focus({preventScroll:true});
      if(voice()) speak(q.why);
    }
    function finish() {
      clear();
      const l=playing, record=state.records[key(l)];
      const next=lessons.find(x=>x.subject===l.subject && bands.indexOf(x.band)===bands.indexOf(l.band)+1);
      const resume=state.current!==key(l) && state.records[state.current]?.step<3;
      root.innerHTML='<section class="ds ds-finish"><div class="ds-top"><span>'+esc(name)+'’s learning journal</span></div><div class="ds-hero '+(bands.indexOf(l.band)>1?'ds-older':'')+'"><div class="ds-cover"><span>'+l.subject+' · Lesson complete</span><h1>'+esc(l.title)+'</h1><p>'+esc(l.goal)+'</p></div></div><section class="ds-wrap"><h2>Your harbor log</h2><p>'+esc(l.rounds[2].why)+'</p><p>'+(record.solo?'You solved the new situation independently on your first visit.':'You practiced applying this idea in a new situation.')+'</p><div class="ds-actions">'+(resume?'<button class="ds-primary" data-school="resume">Return to my adventure →</button>':next?'<button class="ds-primary" data-school="lesson" data-key="'+key(next)+'">Explore the next level →</button>':'')+'<button class="ds-back" data-school="harbor">Choose another lesson</button><button class="ds-link" data-school="again">Practice again</button></div></section></section>';
      focusHeading();
    }
    function bells() {
      silence(); const Context=scope.AudioContext||scope.webkitAudioContext;
      const q=playing.rounds[shownStep]; if(!Context||!q.tones)return;
      const ctx=new Context();sound=ctx;
      ctx.resume().then(()=>{
        if(ctx!==sound)return;
        q.tones.forEach((frequency,i)=>{const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+i*.48;
          o.type='sine';o.frequency.value=frequency;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.16,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.42);
          o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+.44);
        });
      }).catch(()=>{root.querySelector('.ds-feedback').textContent='Use the written pitch pattern for this challenge.';});
    }
    root.addEventListener('click', e=>{
      const b=e.target.closest('[data-school]'); if(!b||!root.contains(b))return;
      switch(b.dataset.school) {
        case 'band': selectedBand=Number(b.dataset.band);state.band=selectedBand;write();harbor(false);root.querySelector('[data-band="'+selectedBand+'"]').focus({preventScroll:true});break;
        case 'resume': begin(state.current,true);break;
        case 'harbor': harbor();break;
        case 'lesson': begin(b.dataset.key);break;
        case 'map': grade=bands[selectedBand].split('–')[0];map();break;
        case 'level-go': {const n=Number(grade)||0;selectedBand=n<3?0:n<6?1:n<9?2:3; state.band=selectedBand;write();harbor();break;}
        case 'listen': read();break;
        case 'help': coach();break;
        case 'hear-help': speak(playing.teach+' '+playing.rounds[shownStep].hint);break;
        case 'answer': answer(b);break;
        case 'bells': bells();break;
        case 'next': drawLesson(true);break;
        case 'again': begin(key(playing));break;
      }
    },{signal});
    root.addEventListener('change', e=>{if(e.target.dataset.field==='grade') {grade=e.target.value; map(false);}}, {signal});
    if (initialKey && byKey.has(initialKey)) begin(initialKey);
    else harbor();
    return ()=>{abort.abort();clear();};
  }
  scope.WWSchool={entry,mount,learnerStation};
})(window);
