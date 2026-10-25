/* Boardcraft 8.8.20.62 — one photo-coordinate scene for Studio and frozen proofs.
 * The frame maps reference millimeters to image pixels. It never measures wood.
 * Photos are presentation evidence; Carvewright artwork/CNC geometry is untouched. */
(function(root,factory){
  'use strict';
  const api=factory(typeof module==='object'&&module.exports?require('./carvewright_core.js'):root.CarvewrightCore);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.BoardcraftPhoto=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Design){
  'use strict';
  const VERSION='boardcraft-photo-v1',MAX_PHOTO_BYTES=1024*1024;
  const finite=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
  const plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v)&&(Object.getPrototypeOf(v)===Object.prototype||Object.getPrototypeOf(v)===null);
  const xml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const matrixText=m=>'matrix('+m.join(' ')+')';
  function fields(value,allowed,label,errors){
    if(!plain(value)){errors.push(label+' must be a plain object.');return false;}
    const names=Reflect.ownKeys(value);
    for(const name of names){const d=Object.getOwnPropertyDescriptor(value,name);if(typeof name!=='string'||!allowed.includes(name)||!d||!Object.prototype.hasOwnProperty.call(d,'value')||!d.enumerable)errors.push('Invalid '+label+' property.');}
    for(const name of allowed)if(!Object.prototype.hasOwnProperty.call(value,name))errors.push('Missing '+label+' field: '+name+'.');
    return !errors.length;
  }
  function photoErrors(photo,errors){
    if(!plain(photo)){errors.push('Choose a normalized board photograph.');return;}
    // Normalization and byte checksums are verified by the request owner. This
    // synchronous renderer accepts only bounded inert JPEG data, never URLs/SVG.
    for(const key of ['id','mime','dataUrl','sha256','width','height']){const d=Object.getOwnPropertyDescriptor(photo,key);if(!d||!Object.prototype.hasOwnProperty.call(d,'value')||!d.enumerable){errors.push('Photograph fields must be plain data.');return;}}
    if(typeof photo.id!=='string'||!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(photo.id))errors.push('Invalid board photograph identity.');
    if(photo.mime!=='image/jpeg'||typeof photo.dataUrl!=='string'||photo.dataUrl.length>23+4*Math.ceil(MAX_PHOTO_BYTES/3)||!/^data:image\/jpeg;base64,(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(photo.dataUrl)||photo.dataUrl.length<=23)errors.push('Board photograph must be a bounded normalized JPEG copy.');
    if(typeof photo.sha256!=='string'||!/^[a-f0-9]{64}$/.test(photo.sha256))errors.push('Board photograph needs its source checksum.');
    if(!Number.isSafeInteger(photo.width)||!Number.isSafeInteger(photo.height)||!finite(photo.width,1,1600)||!finite(photo.height,1,1600))errors.push('Invalid normalized board photograph dimensions.');
  }
  function inputErrors(design,photo,turns,errors){
    photoErrors(photo,errors);
    if(!Number.isInteger(turns)||turns<0||turns>3)errors.push('Choose a whole quarter-turn orientation.');
    if(!plain(design?.stock)||!finite(design.stock.widthMm,25.4,3048)||!finite(design.stock.heightMm,25.4,3048))errors.push('Enter valid reference layout dimensions.');
  }
  function oriented(photo,turns){return {width:turns%2?photo.height:photo.width,height:turns%2?photo.width:photo.height};}
  function initialFrame(design,photo,quarterTurns=0){
    const errors=[];inputErrors(design,photo,quarterTurns,errors);if(errors.length)throw Error(errors.join(' '));
    const p=oriented(photo,quarterTurns),ratio=design.stock.widthMm/design.stock.heightMm;
    const width=Math.min(p.width,p.height*ratio),height=width/ratio;
    return {x:(p.width-width)/(2*p.width),y:(p.height-height)/(2*p.height),w:width/p.width,h:height/p.height};
  }
  function createBoard(design,photo,quarterTurns=0){return {photoId:photo.id,quarterTurns,frame:initialFrame(design,photo,quarterTurns),frameConfirmed:false,dimensionsStatus:'reference-unconfirmed'};}
  function validate(design,photo,board,fonts,options){
    const errors=[];
    if(!fields(board,['photoId','quarterTurns','frame','frameConfirmed','dimensionsStatus'],'board placement',errors))return {ok:false,errors};
    inputErrors(design,photo,board.quarterTurns,errors);
    if(board.photoId!==photo?.id)errors.push('The board placement refers to a different photograph.');
    if(typeof board.frameConfirmed!=='boolean'||(options?.requireConfirmed===true&&board.frameConfirmed!==true))errors.push('Choose the layout area on this photograph.');
    if(board.dimensionsStatus!=='reference-unconfirmed')errors.push('Photo placement does not confirm physical measurements.');
    if(!fields(board.frame,['x','y','w','h'],'layout frame',errors))return {ok:false,errors};
    const f=board.frame;
    if(!finite(f.x,0,1)||!finite(f.y,0,1)||!finite(f.w,0.000001,1)||!finite(f.h,0.000001,1)||f.x+f.w>1+1e-9||f.y+f.h>1+1e-9)errors.push('Keep the complete layout frame inside the photograph.');
    if(!errors.length){
      const p=oriented(photo,board.quarterTurns),sx=f.w*p.width/design.stock.widthMm,sy=f.h*p.height/design.stock.heightMm;
      if(f.w*p.width<1||f.h*p.height<1||Math.abs(sx-sy)>Math.max(sx,sy)*1e-7)errors.push('The layout frame must keep the reference design proportions. Reset the area after changing its dimensions.');
    }
    if(fonts){try{const v=Design.validate(design,fonts);if(!v.ok)errors.push(...v.errors);}catch(_){errors.push('The vector design is unavailable.');}}
    return {ok:!errors.length,errors};
  }
  function scene(design,photo,board,fonts){
    const checked=validate(design,photo,board,fonts);if(!checked.ok)throw Error(checked.errors.join(' '));
    if(!fonts||!Design?.layout)throw Error('Exact vector lettering assets are unavailable.');
    const layout=Design.layout(design,fonts);
    if(!Array.isArray(layout.glyphs)||!layout.glyphs.every(g=>typeof g.d==='string'&&Array.isArray(g.matrix)&&g.matrix.length===6&&g.matrix.every(Number.isFinite)))throw Error('The vector artwork contains invalid coordinates.');
    const p=oriented(photo,board.quarterTurns),f=board.frame,framePixels={x:f.x*p.width,y:f.y*p.height,w:f.w*p.width,h:f.h*p.height};
    const scale=framePixels.w/design.stock.widthMm,matrix=[scale,0,0,scale,framePixels.x,framePixels.y];
    const photoTransform=[[1,0,0,1,0,0],[0,1,-1,0,photo.height,0],[-1,0,0,-1,photo.width,photo.height],[0,-1,1,0,0,photo.width]][board.quarterTurns];
    const photoSvg='<image x="0" y="0" width="'+photo.width+'" height="'+photo.height+'" preserveAspectRatio="xMidYMid meet" transform="'+matrixText(photoTransform)+'" href="'+xml(photo.dataUrl)+'"/>';
    const artworkSvg='<g transform="'+matrixText(matrix)+'" fill="'+xml(design.appearance.ink)+'" fill-rule="nonzero">'+Design.renderPaths({ok:true,glyphs:layout.glyphs})+'</g>';
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+p.width+'" height="'+p.height+'" viewBox="0 0 '+p.width+' '+p.height+'" role="img" aria-label="'+xml(design.title||'Sign design')+' on your board photograph"><title>'+xml(design.title||'Sign design')+'</title>'+photoSvg+artworkSvg+'</svg>';
    return {svg,width:p.width,height:p.height,matrix,photoTransform,framePixels,photoSvg,artworkSvg};
  }
  function toStockPoint(matrix,point){
    if(!Array.isArray(matrix)||matrix.length!==6||!matrix.every(Number.isFinite)||matrix[0]<=0||matrix[1]!==0||matrix[2]!==0||matrix[3]!==matrix[0]||!Number.isFinite(point?.x)||!Number.isFinite(point?.y))throw Error('Invalid photo-to-artwork coordinate mapping.');
    return {x:(point.x-matrix[4])/matrix[0],y:(point.y-matrix[5])/matrix[3]};
  }
  return Object.freeze({version:VERSION,initialFrame,createBoard,validate,scene,toStockPoint});
});
