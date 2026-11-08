(function(g,f){const a=f(typeof module==='object'&&module.exports?require('./ike_shop_core.js'):g.IkeShopCore,typeof module==='object'&&module.exports?require('./countercraft_core.js'):g.CountercraftCore,typeof module==='object'&&module.exports?require('./boardcraft_photo.js'):g.BoardcraftPhoto);if(typeof module==='object'&&module.exports)module.exports=a;g.CountercraftFlow=a;})(globalThis,function(S,C,B){'use strict';
function create(){let state;function reset(){state={step:0,request:S.createRequest(),stockId:'',boardSpec:null,contactPreference:'email',requestedPickup:'',plankEvidence:[],lettering:null,frozen:false};return state;}reset();function editable(){if(state.frozen)throw Error('Check the pending submission before editing.');}function invalidate(){state.request.approval=null;state.request.proof=null;}function set(field,value){
 editable();const r=state.request;let target,key,placement=false;
 if(['name','email','phone'].includes(field)){target=r.customer;key=field;value=String(value).trim();}
 else if(field==='wording'){target=r.design.text;key='value';placement=true;}
 else if(field==='font'){target=r.design.text;key='fontId';placement=true;}
 else if(['quantity','finish','notes'].includes(field)){target=r.details;key=field;if(field==='quantity')value=1;placement=field==='finish';}
 else if(['lettering','stockId','contactPreference','requestedPickup'].includes(field)){target=state;key=field;placement=field==='lettering';}
 else throw Error('Unknown customer field.');
 if(JSON.stringify(target[key])===JSON.stringify(value))return false;
 target[key]=value;
 if(field==='wording')r.design.title=value.trim().slice(0,120)||'Untitled design';
 if(placement&&r.board)r.board.frameConfirmed=false;
 invalidate();return true;
}
function selectStock(pub,id){
 editable();const spec=C.boardSpec(pub,id),stock=pub.stocks.find(s=>s.id===id),r=state.request;
 const previous=C.clone(r.design.stock),base=S.createRequest().design.stock;
 if(state.plankEvidence[0])delete state.plankEvidence[0].layoutSize;
 delete r.boardSetup;
 r.design.stock={...base,id:id||base.id,species:stock?.species||base.species};
 if(spec){const [widthMm,heightMm,thicknessMm]=spec.actualMm;r.design.stock={...r.design.stock,widthMm,heightMm,thicknessMm,marginMm:Math.min(previous.marginMm,Math.min(widthMm,heightMm)/4)};}
 r.design.review=null;state.stockId=id;state.boardSpec=spec;
 if(r.photos[0])r.board=B.createBoard(r.design,r.photos[0],r.board?.quarterTurns||0,state.plankEvidence[0]?.boardArea);
 invalidate();
}
function applyPhotoSize(size){
 editable();
 const first=state.plankEvidence[0],r=state.request;
 if(!first||!r.photos[0]||state.stockId)throw Error('Use the photographed board to set a photo size.');
 const values=[size.lengthMm,size.widthMm];
 if(values.some(v=>!Number.isFinite(v)||v<25.4||v>3048)||!['photo-card','matched-tape'].includes(size.source))throw Error('Invalid photo dimensions.');
 if(size.source==='matched-tape'&&(!Number.isFinite(size.thicknessMm)||size.thicknessMm<1||size.thicknessMm>150))throw Error('Invalid recorded thickness.');
 if(size.source==='photo-card'&&(!['index-3x5','index-4x6'].includes(size.referenceType)||!r.photos.some(p=>p.id===size.scalePhotoId)))throw Error('Select the scale photo and its card size.');
 if(size.source==='matched-tape'&&(!size.referenceId||size.referenceId!==first.sizeScan?.reference))throw Error('The photographed board could not be matched.');
 const stock=r.design.stock;
 stock.widthMm=size.lengthMm;stock.heightMm=size.widthMm;
 stock.thicknessMm=size.source==='matched-tape'?size.thicknessMm:S.createRequest().design.stock.thicknessMm;
 stock.marginMm=Math.min(stock.marginMm,Math.min(...values)/4);
 first.layoutSize={...size,photoId:r.photos[0].id};
 r.design.review=null;r.board=B.createBoard(r.design,r.photos[0],r.board?.quarterTurns||0,first.boardArea);invalidate();
}
function clearPhotoSize(){
 editable();if(!state.plankEvidence[0]?.layoutSize||state.stockId)return;
 const r=state.request;delete state.plankEvidence[0].layoutSize;
 r.design.stock=S.createRequest().design.stock;r.design.review=null;
 r.board=B.createBoard(r.design,r.photos[0],r.board?.quarterTurns||0,state.plankEvidence[0].boardArea);invalidate();
}
function reconcileStock(pub){
 editable();const id=state.stockId;if(!id&&!state.boardSpec)return {changed:false};
 let spec=null,message='The shop board changed. Choose your board and confirm the layout again.';
 try{spec=C.boardSpec(pub,id);}catch(e){selectStock(pub,'');return {changed:true,message:e.message};}
 if(C.canonical(spec)===C.canonical(state.boardSpec))return {changed:false};
 selectStock(pub,id);return {changed:true,message};
}
function next(){editable();if(state.step===0&&!state.request.photos.length)throw Error('Add a photograph of your plank.');if(state.step===1&&!state.request.design.text.value.trim()&&!state.request.design.layers?.length)throw Error('Add your wording or artwork.');if(state.step===2){if(!state.request.customer.name.trim())throw Error('Enter your name.');const email=S.emailValid(state.request.customer.email),phone=state.request.customer.phone.replace(/\D/g,'').length>=7;if(!email&&!phone)throw Error('Enter a usable email address or phone number.');if(state.contactPreference==='email'&&!email||state.contactPreference==='phone'&&!phone)throw Error('Choose an available contact method.');}state.step=Math.min(3,state.step+1);}
return {state:()=>state,set,selectStock,applyPhotoSize,clearPhotoSize,reconcileStock,next,back:()=>{editable();state.step=Math.max(0,state.step-1);},addPhoto:p=>{editable();if(state.request.photos.length>=3)throw Error('Up to three photographs per request.');state.request.photos.push(p);if(state.request.board)state.request.board.frameConfirmed=false;invalidate();},useDesign:(d,b)=>{editable();C.checkBoard({boardSpec:state.boardSpec,stockId:state.stockId,request:{design:d}});state.request.design=S.clone(d);state.request.board=b?{...S.clone(b),frameConfirmed:false}:null;invalidate();},restore:s=>{editable();state.request=S.clone(s.request);state.request.details.quantity=1;for(const key of ['name','email','phone'])state.request.customer[key]=String(state.request.customer[key]||'').trim();state.request.approval=null;state.request.proof=null;state.stockId=s.stockId||'';state.boardSpec=s.boardSpec?S.clone(s.boardSpec):null;C.checkBoard(state);state.contactPreference=s.contactPreference||'email';state.requestedPickup=s.requestedPickup||'';state.plankEvidence=s.plankEvidence||[];state.lettering=s.lettering||null;state.step=0;},reReview:()=>{state.frozen=false;state.step=0;invalidate();},freeze:()=>state.frozen=true,reset};}
return Object.freeze({create});});
