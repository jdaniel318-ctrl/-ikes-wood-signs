/* Colorwake: public ship metadata only. No network, storage or account authority. */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WWFleet=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const description={schema:'blackflag-public-learning-vessel-v1',vessel:'wonderwake',name:'Wonderwake',version:'0.11.0',release:'Lantern Harbor',fleet:'Black Flag',role:'independent-learning-vessel',lifecycle:'family-preview',commissioned:false,live_health_verified:false,learner_data_included:false,automatic_transfer:false,complete_k12:false,production_origin_isolation_verified:false,capabilities:[
{id:'contextual-feedback-v1',direction:'ship-to-fleet',summary:'Show an action outcome next to the activity, naming the encountered value and current goal; text and shape cues accompany color.',transfer:'review-and-adopt'},
{id:'cancellable-celebration-v1',direction:'ship-to-fleet',summary:'Activity-specific completion scenes use active elapsed time, stop on exit, honor reduced motion, and keep the next action available.',transfer:'review-and-adopt'},
{id:'svg-artwork-exchange-v1',direction:'ship-to-fleet',summary:'Constrained local SVG to checked PNG preview; explicit per-learner apply. No source execution or network transfer.',transfer:'review-and-adopt'},
{id:'pointer-guard-v1',direction:'ship-to-fleet',summary:'Single-pointer strokes and an explicit finger reset after pen use; native Pencil acceptance pending.',transfer:'review-and-adopt'},
{id:'save-readback-v1',direction:'fleet-to-ship',summary:'Report a save only after transaction completion and separate readback.',transfer:'review-and-adopt'},
{id:'explicit-scope-v1',direction:'fleet-to-ship',summary:'Stable learner identity; explicit selection; no inherited authority.',transfer:'review-and-adopt'},
{id:'creative-touch-v1',direction:'ship-to-fleet',summary:'Touch-first shape placement, mirroring and independent creations; candidate for review.',transfer:'review-and-adopt'},
{id:'stable-creative-surface-v1',direction:'ship-to-fleet',summary:'Fixed paper with overlay tools and reduced motion; review before adopting in another vessel.',transfer:'review-and-adopt'},
{id:'dismiss-before-action-v1',direction:'ship-to-fleet',summary:'Consume an entire outside dismissal gesture, including overlapping contacts, before the next action.',transfer:'review-and-adopt'},
{id:'learner-tool-preferences-v1',direction:'ship-to-fleet',summary:'Optional validated custom colors and per-tool sizes follow the learner into checked local saves and progress copies.',transfer:'review-and-adopt'},
{id:'honest-coverage-v1',direction:'ship-to-fleet',summary:'Keep practice progress separate from curriculum coverage and certified mastery.',transfer:'review-and-adopt'}]};
return Object.freeze({version:'0.11.0',engineURL:'https://jdaniel318-ctrl.github.io/-ikes-wood-signs/',passport:function(){return JSON.parse(JSON.stringify(description));}});
});
