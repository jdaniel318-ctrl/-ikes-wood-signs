/* Dark Sky 8.4.2 — Ike Style Foundry
   Production style packs are governed assets. Browser font families are only
   provisional companion renderers until a glyph has certified shop geometry. */
(()=>{
  'use strict';
  const packs={
    A:{
      id:'A',name:'RAMJET',label:'Style A — Bold Block',status:'production-anchor',
      anchorText:'RAMJET',anchorImage:'ike_style_a_ramjet_reference.jpg',
      authority:'real-finished-sign',renderer:'companion-profile',
      certifiedGlyphs:'AEJMRT',provisionalCase:'mixed',
      metrics:{family:'"Arial Black", Impact, sans-serif',weight:'900',style:'normal',spacingEm:-0.03,widthTarget:0.88,heightTarget:0.82,widthBoost:1,compactWidthTarget:0.90,compactHeightTarget:0.84,opticalYBias:0.01,metricWidthScale:1,metricHeightScale:1,visualScaleX:1,visualScaleY:1},
      notes:'RAMJET is the fixed production anchor. Additional real signs expand certified glyph coverage; they do not silently replace the active pack.'
    },
    B:{
      id:'B',name:'SMOKE HOLE!',label:'Style B — Tall Western',status:'production-anchor',
      anchorText:'SMOKE HOLE!',anchorImage:'ike_style_b_smoke_hole_reference.jpg',
      authority:'real-finished-sign',renderer:'companion-profile',
      certifiedGlyphs:'!EHKLMOST',provisionalCase:'mixed',
      metrics:{family:'"American Typewriter Condensed", "American Typewriter", "Rockwell Extra Bold", Rockwell, "Courier New", serif',weight:'900',style:'normal',spacingEm:-0.045,widthTarget:0.93,heightTarget:0.88,widthBoost:1,compactWidthTarget:0.94,compactHeightTarget:0.90,opticalYBias:0,metricWidthScale:0.72,metricHeightScale:1.10,visualScaleX:0.72,visualScaleY:1.10},
      notes:'SMOKE HOLE! is the fixed production anchor. The mixed/lowercase companion remains provisional until approved real examples certify those glyphs.'
    }
  };
  function chars(text){return [...new Set(String(text||'').replace(/\s/g,'').split(''))].sort().join('');}
  function pack(id){return packs[String(id||'B')]||packs.B;}
  function coverage(id,text){const p=pack(id),wanted=chars(text),cert=new Set(String(p.certifiedGlyphs||'').split(''));const covered=[...wanted].filter(c=>cert.has(c)),missing=[...wanted].filter(c=>!cert.has(c));return {wanted,covered:covered.join(''),missing:missing.join(''),certified:missing.length===0};}
  window.IkeGlyphBench={schema:'dark-sky-ike-style-foundry-v2',build:'8.4.2',packs,pack,coverage,chars};
})();
