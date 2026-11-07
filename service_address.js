/* Standalone address suggestions. Only public address reference data is shared. */
(function (root) {
  'use strict';
  const script = root.document?.currentScript;
  const scriptUrl = script?.src;
  const assetBase = script?.getAttribute('data-address-base') ||
    (scriptUrl && /^https?:/.test(scriptUrl) ? new URL('.',scriptUrl).href : '');
  let fieldNumber = 0;
  const dataset = 'richmond-williamsburg-v2';
  // Regional contractors can opt into the same lookup through their vessel configuration.
  function supports(project) {
    const region = project?.customerExperience?.addressRegion ?? root.BlackFlagAddressDefaults?.[project?.id];
    return region==='richmond-va';
  }
  const hashes = [
  "7a8f5655cb66c67af3c83ab87732176787032f9f41ee1ed737370428834d3a26",
  "8f0aa75625d7aef49380dbc6babbc4d60984718788c61b573208e9f7a5ba1faf",
  "574a008270c928bca6852e859d47543cfaacbc67c95e0c92cf8b418419a4e99c",
  "ca8d6a4cd8cfe967b218604f46631e21e0dc874dc8964373e4644551d40b8a56",
  "25594f6dd0eba00439d5423ff18048bff5f55aa02d4ac33705e885e24ff57ffb",
  "917297cc1387e0b05d2856622a9f0c0d2a3c4bfbcbcb035eddb59265639b7723",
  "670040a856d643472e641277c1d17be3dd8c726986f491fc3a4bf4ad22a44cb8",
  "57093610074d0e0bde78b6f495640b6b64ece5d565af76d0089de4882abb3177",
  "a1ae7baa62aee8b514fe5d8cf6e97c792af8e05f3d80fa5470e82a9159e0ea80",
  "0e9293f2c8183c9645b946f8d67efe61d6079fc1d1574e8d73c4e539b0ee50cd",
  "a152b322f66f245b97b4f06ec754a9c293d9ad0958b499ebe0835204741d5efb",
  "9a2505b28f1ea030e836af0801253b5478209fd118db59d6dbd73bbbf9eca3f9",
  "3e29e0ac48a3159dcc3e3d99e61e970978ace2960d47275a2ec564e0ee6a1d12",
  "859ba8ae8bd271b282c2c141d5455de02b727df9f4759eed361362636f64367f",
  "4ef301bdac5e17ea31fb542bbc5528eb3d1db0d7b976485cf2dff1980569457f",
  "eece6fa80067efdad94ad913ac03fbe474ef508fbbbfc747ceab31b5b2125d5b"
];
  const cache = new Map();
  const aliases = {
    north:'n', south:'s', east:'e', west:'w', northeast:'ne', northwest:'nw', southeast:'se', southwest:'sw',
    street:'st', road:'rd', avenue:'ave', drive:'dr', lane:'ln', boulevard:'blvd', court:'ct',
    circle:'cir', place:'pl', terrace:'ter', highway:'hwy', parkway:'pkwy', trail:'trl', turnpike:'tpke'
  };
  const fullWords=Object.fromEntries(Object.entries(aliases).map(([word,abbr])=>[abbr,word]));
  function tokens(text) {
    return text.toLowerCase().replace(/[.'’]/g,'').match(/[a-z0-9-]+/g)?.map(t => fullWords[t] || t) || [];
  }
  async function load(bucket) {
    if (!cache.has(bucket)) {
      const digest = hashes[bucket];
      const url = './streetwise_rva_' + String(bucket).padStart(2,'0') + '.json?v=' + digest.slice(0,12);
      const pending = (async () => {
        const response = await fetch(assetBase ? new URL(url,new URL(assetBase,document.baseURI)).href : url, {credentials:'same-origin'});
        if (!response.ok) throw new Error('Address data unavailable');
        const bytes = await response.arrayBuffer();
        const check = await crypto.subtle.digest('SHA-256', bytes);
        const actual = Array.from(new Uint8Array(check), b => b.toString(16).padStart(2,'0')).join('');
        if (actual !== digest) throw new Error('Address data changed');
        return JSON.parse(new TextDecoder().decode(bytes));
      })();
      cache.set(bucket, pending);
      pending.catch(() => cache.delete(bucket));
    }
    return cache.get(bucket);
  }
  function parts(value) {
    return value.trim().match(/^(\d{1,7}[a-z]{0,3}(?:-[a-z0-9]+)*)\s+(.{2,})$/i);
  }
  async function suggest(value) {
    const parsed = parts(value);
    if (!parsed) return [];
    const number = parsed[1].toUpperCase(), query = tokens(parsed[2]);
    if (!query.length) return [];
    const index = await load(parseInt(number,10) % hashes.length);
    const matches = [];
    for (const [streetId, placeId, lat, lon] of index.numbers[number] || []) {
      const street=index.streets[streetId], [city,zip]=index.places[placeId];
      const label=number+' '+street+', '+city+', VA '+zip;
      const addressWords=tokens(street+' '+city+' VA '+zip);
      const startsAt = offset => query.every((word,i) => {
        const candidate=addressWords[offset+i];
        return i===query.length-1 ? candidate?.startsWith(word) : candidate===word;
      });
      const directional=['north','south','east','west','northeast','northwest','southeast','southwest'].includes(addressWords[0]);
      if (!startsAt(0) && !(directional && startsAt(1))) continue;
      matches.push({address:label, latitude:lat/100000, longitude:lon/100000, dataset});
      if (matches.length===6) break;
    }
    return matches;
  }
  function matchesAddress(address, point) {
    if (!point || String(address||'').trim()!==point.address ||
        !Number.isFinite(point.latitude) || !Number.isFinite(point.longitude)) return false;
    // Preserve the bounds and map links of previously saved Richmond requests.
    const legacy=point.dataset==='rva-streetwise-v1';
    if (!legacy && point.dataset!==dataset) return false;
    return point.latitude>=(legacy ? 36.9 : 36.75) && point.latitude<=38.1 &&
      point.longitude>=(legacy ? -78.2 : -78.4) && point.longitude<=(legacy ? -76.9 : -76.2);
  }
  function mapLink(address, point) {
    if (!matchesAddress(address, point)) return '';
    const location = encodeURIComponent(point.latitude+','+point.longitude);
    return '<a href="https://www.google.com/maps/search/?api=1&amp;query='+location+'" target="_blank" rel="noopener noreferrer">Open in Maps</a>';
  }
  function mount(input, options = {}) {
    if (!input || input.readOnly || input.disabled) return;
    if (input.closest('.streetwise-field')) return;
    const label = input.labels?.[0] || input.closest('label');
    if (!label) return;
    if (!input.id) input.id = 'serviceAddressField'+(++fieldNumber);
    const field = label.contains(input) ? label : input;
    const hint = document.createElement('small'), list = document.createElement('div');
    hint.className='streetwise-hint'; hint.id=input.id+'MapStatus';
    hint.setAttribute('role','status');
    list.className='streetwise-options'; list.id=input.id+'Suggestions';
    list.hidden=true; list.setAttribute('role','listbox');
    list.setAttribute('aria-label','Matching addresses');
    
    // Keep the options under their own field in a multi-column form.
    const group = document.createElement('div');
    group.className='streetwise-field'; field.before(group); group.append(field);
    if (field===label) label.append(hint); else group.append(hint);
    group.append(list);
    input.setAttribute('role','combobox'); input.setAttribute('aria-autocomplete','list');
    input.setAttribute('aria-expanded','false'); input.setAttribute('aria-controls',list.id);
    input.setAttribute('aria-describedby',[input.getAttribute('aria-describedby'),hint.id].filter(Boolean).join(' '));
    let generation=0, timer, active=-1, choices=[];
    let press=null;
    let selected=matchesAddress(input.value,options.point) ? options.point : null;
    const guidance='Choose a Richmond or Williamsburg area address, or enter it manually.';
    function status() {hint.textContent=selected ? 'Matched to an address on the map.' : guidance;}
    function close() {
      generation++; clearTimeout(timer); active=-1; choices=[]; press=null;
      list.replaceChildren(); list.hidden=true;
      input.setAttribute('aria-expanded','false'); input.removeAttribute('aria-activedescendant');
    }
    function choose(index) {
      const choice=choices[index];
      if (!choice) return;
      close(); input.value=choice.address;
      selected=choice;
      // Save the label through the same path as ordinary typing.
      input.dispatchEvent(new Event('input',{bubbles:true}));
      if (selected===choice) options.onMatch?.(choice);
      status();
    }
    function schedule() {
      close(); status();
      if (selected || !parts(input.value)) return;
      const ticket=generation, value=input.value;
      timer=setTimeout(async () => {
        const current=()=>generation===ticket && input.isConnected && input.value===value && document.activeElement===input;
        if (!current()) return;
        try {
          const rows=await suggest(value);
          if (!current()) return;
          choices=rows;
          rows.forEach((row,index) => {
            const opt=document.createElement('button');
            opt.type='button'; opt.tabIndex=-1; opt.id=list.id+'-'+index;
            opt.setAttribute('role','option'); opt.setAttribute('aria-selected','false');
            opt.textContent=row.address;
            let cancelled=false;
            opt.addEventListener('pointerdown',e=>{
              if (!e.isPrimary || e.button!==0) return;
              cancelled=false;
              press={id:e.pointerId, x:e.clientX, y:e.clientY, query:input.value.trim()};
              e.preventDefault();
              if (opt.hasPointerCapture?.(e.pointerId)===false) {
                // Synthetic and assistive clicks may have no active pointer.
                try { opt.setPointerCapture(e.pointerId); } catch {}
              }
            });
            opt.addEventListener('pointermove',e=>{
              if (press?.id===e.pointerId && Math.hypot(e.clientX-press.x,e.clientY-press.y)>12) cancelled=true;
            });
            function cancel(e) {
              if (press?.id!==e.pointerId) return;
              press=null; cancelled=true;
              if (document.activeElement!==input) {close();status();}
            }
            opt.addEventListener('pointercancel',cancel);
            opt.addEventListener('lostpointercapture',cancel);
            opt.addEventListener('pointerup',e=>{
              if (press?.id!==e.pointerId) return;
              const hit=document.elementFromPoint(e.clientX,e.clientY);
              if (cancelled || !opt.contains(hit) || Math.hypot(e.clientX-press.x,e.clientY-press.y)>12) {
                cancel(e);return;
              }
              choose(index);
            });
            opt.addEventListener('click',()=>{
              if (!cancelled && choices[index]===row) choose(index);
            });
            list.append(opt);
          });
          list.hidden=!rows.length; input.setAttribute('aria-expanded',String(!!rows.length));
          hint.textContent=rows.length ? 'Choose a matching address.' : 'No local map match. You can enter the full address manually.';
        } catch {
          if (current()) hint.textContent='Address lookup is unavailable. You can enter the full address manually.';
        }
      },140);
    }
    input.addEventListener('input',()=>{
      if (selected && input.value===selected.address) return;
      // The host can trim whitespace while focus moves to a pressed option.
      if (press && press.query===input.value.trim()) return;
      selected=null;options.onMatch?.(null);schedule();
    });
    input.addEventListener('focus',schedule);
    input.addEventListener('blur',()=>{if (!press) {close();status();}});
    input.addEventListener('keydown',e=>{
      if (e.key==='Escape') {close();status();return;}
      if (!choices.length) return;
      if (e.key==='Enter' && active>=0) {e.preventDefault();choose(active);return;}
      if (!['ArrowDown','ArrowUp'].includes(e.key)) return;
      e.preventDefault();
      active=e.key==='ArrowDown' ? (active+1)%choices.length : (active<=0 ? choices.length-1 : active-1);
      Array.from(list.children).forEach((el,i)=>el.setAttribute('aria-selected',String(i===active)));
      const option=list.children[active];
      input.setAttribute('aria-activedescendant',option.id); option.scrollIntoView({block:'nearest'});
    });
    status();
  }
  function staffLookup(host, address) {
    if (!host) return;
    const details=document.createElement('details'), summary=document.createElement('summary');
    summary.textContent='Look up this address';
    const label=document.createElement('label'), input=document.createElement('input');
    label.textContent='Service address to check';
    input.id='staffServiceAddressLookup'; input.type='text'; input.value=address; input.autocomplete='off';
    const link=document.createElement('p');
    label.append(input); details.append(summary,label,link); host.append(details);
    mount(input,{onMatch:point=>{link.innerHTML=mapLink(input.value,point);}});
  }
  root.BlackFlagServiceAddress=Object.freeze({supports,suggest,mount,matchesAddress,mapLink,staffLookup});
})(globalThis);
