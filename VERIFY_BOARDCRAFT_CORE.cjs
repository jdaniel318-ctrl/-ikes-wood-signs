#!/usr/bin/env node
'use strict';
// Real photo/Canvas/vector/package pipeline; no network or customer data.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {fixture,prepare,ROOT}=require('./VERIFY_SHOPCRAFT_PACKAGE.cjs');
const OUT=path.resolve(process.argv[3]||path.join(ROOT,'../boardcraft-core-evidence'));
(async()=>{
  fs.mkdirSync(OUT,{recursive:true});const f=await fixture(),results=[];
  const test=async(name,fn)=>{try{await fn();results.push({name,pass:true});console.log('PASS '+name);}catch(e){results.push({name,pass:false,error:e.message});console.error('FAIL '+name+' — '+e.message);}};
  try{
    await f.page.addScriptTag({content:fs.readFileSync(path.join(ROOT,'boardcraft_photo.js'),'utf8')});
    await prepare(f.page);
    await test('new request explicitly starts without another customer board',async()=>{
      assert.equal(await f.page.evaluate(()=>IkeShopCore.createRequest().board),null);
    });
    await test('legacy no-board package still verifies before photo composition',async()=>{
      assert.equal(await f.page.evaluate(()=>IkeShopCore.verifyPackage(__request,__bundle,IkeCarveFonts)),true);
    });
    await test('confirmed board frame is valid but unconfirmed or missing-photo frame cannot be approved',async()=>{
      const v=await f.page.evaluate(()=>{const r=IkeShopCore.clone(__request);r.board=BoardcraftPhoto.createBoard(r.design,r.photos[0]);const unconfirmed=IkeShopCore.validate(r,IkeCarveFonts,{complete:true});r.board.frameConfirmed=true;const confirmed=IkeShopCore.validate(r,IkeCarveFonts,{complete:true});r.board.photoId='missing-photo';return {unconfirmed,confirmed,missing:IkeShopCore.validate(r,IkeCarveFonts,{complete:true})};});
      assert.equal(v.unconfirmed.ok,false);assert.equal(v.confirmed.ok,true,v.confirmed.errors.join(' '));assert.equal(v.missing.ok,false);
    });
    await test('frozen proof is exactly the shared photo scene, with unchanged portable vectors',async()=>{
      const v=await f.page.evaluate(async()=>{
        let r=IkeShopCore.clone(__request);const svgBefore=CarvewrightCore.toSvg(r.design,IkeCarveFonts);r.board=BoardcraftPhoto.createBoard(r.design,r.photos[0]);r.board.frameConfirmed=true;r.approval=null;r.proof=null;
        r=await IkeShopCore.review(r,IkeCarveFonts);const bundle=await IkeShopCore.buildPackage(r,IkeCarveFonts),scene=BoardcraftPhoto.scene(r.design,r.photos[0],r.board,IkeCarveFonts);
        const url=URL.createObjectURL(new Blob([scene.svg],{type:'image/svg+xml'}));let expected;
        try{const image=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=url;});const c=document.createElement('canvas');c.width=r.proof.width;c.height=r.proof.height;const ctx=c.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(image,0,0,c.width,c.height);expected=c.toDataURL('image/png');}finally{URL.revokeObjectURL(url);}
        const decode=name=>new TextDecoder().decode(bundle.files.find(x=>x.name===name).bytes),meta=JSON.parse(decode('request.json'));
        window.__boardRequest=r;window.__boardBundle=bundle;
        return {exact:r.proof.dataUrl===expected,proof:r.proof,photo:{width:r.photos[0].width,height:r.photos[0].height},valid:await IkeShopCore.verifyPackage(r,bundle,IkeCarveFonts),vectors:decode('artwork.svg')===svgBefore,art:decode('artwork.svg'),metaBoard:meta.board,board:r.board,brief:decode('request-brief.txt')};
      });
      assert(v.exact,'frozen PNG must render the same scene as the customer saw');assert.equal(v.proof.width,v.photo.width);assert.equal(v.proof.height,v.photo.height);assert(v.valid&&v.vectors);assert.deepEqual(v.metaBoard,v.board);assert.doesNotMatch(v.art,/<image|data:image/);assert.match(v.brief,/board photograph|board photo/i);assert.match(v.brief,/unconfirmed|not calibrated/i);
      fs.writeFileSync(path.join(OUT,'photo-proof.png'),Buffer.from(v.proof.dataUrl.split(',')[1],'base64'));
    });
    await test('frame, orientation and photo selection revoke customer approval',async()=>{
      const v=await f.page.evaluate(async()=>{const out=[];for(const change of [r=>r.board.frame.x-=.01,r=>{r.board=BoardcraftPhoto.createBoard(r.design,r.photos[0],1);r.board.frameConfirmed=true;},r=>r.board.frameConfirmed=false,r=>r.board.photoId='missing-photo']){const r=IkeShopCore.clone(__boardRequest);change(r);out.push(await IkeShopCore.approvalMatches(r,IkeCarveFonts));}const book=IkeShopCore.clone(__boardRequest);book.revision++;book.design.revision++;return {out,book:await IkeShopCore.approvalMatches(book,IkeCarveFonts)};});
      assert.deepEqual(v.out,[false,false,false,false]);assert.equal(v.book,true);
    });
    await test('quarter-turn proof retains oriented photograph proportions and no new CNC geometry',async()=>{
      const v=await f.page.evaluate(async()=>{let r=IkeShopCore.clone(__boardRequest);r.board=BoardcraftPhoto.createBoard(r.design,r.photos[0],1);r.board.frameConfirmed=true;r.approval=null;r.proof=null;r=await IkeShopCore.review(r,IkeCarveFonts);return {width:r.proof.width,height:r.proof.height,photo:r.photos[0],svg:CarvewrightCore.toSvg(r.design,IkeCarveFonts)===CarvewrightCore.toSvg(__boardRequest.design,IkeCarveFonts),approved:await IkeShopCore.approvalMatches(r,IkeCarveFonts)};});
      assert.equal(v.width,v.photo.height);assert.equal(v.height,v.photo.width);assert(v.svg&&v.approved);
    });
    await test('detailed board photo fits the PNG budget without altering its attachment or placement',async()=>{
      const v=await f.page.evaluate(async()=>{
        const c=document.createElement('canvas');c.width=1600;c.height=1600;const x=c.getContext('2d'),pixels=x.createImageData(1600,1600);let seed=73021;
        for(let i=0;i<pixels.data.length;i+=4){for(let k=0;k<3;k++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;pixels.data[i+k]=seed>>>24;}pixels.data[i+3]=255;}x.putImageData(pixels,0,0);
        const blob=await new Promise(resolve=>c.toBlob(resolve,'image/jpeg',.98)),photo=await IkeShopCore.normalizePhoto(new File([blob],'detailed-board.jpg',{type:'image/jpeg'}));
        let r=IkeShopCore.clone(__boardRequest);r.photos=[photo];r.board=BoardcraftPhoto.createBoard(r.design,photo);r.board.frameConfirmed=true;r.approval=null;r.proof=null;const frame=JSON.stringify(r.board),source=photo.dataUrl;r=await IkeShopCore.review(r,IkeCarveFonts);
        return {width:r.proof.width,height:r.proof.height,photoWidth:photo.width,photoHeight:photo.height,bytes:atob(r.proof.dataUrl.split(',')[1]).length,photoUnchanged:r.photos[0].dataUrl===source,placementUnchanged:JSON.stringify(r.board)===frame,approved:await IkeShopCore.approvalMatches(r,IkeCarveFonts)};
      });
      assert(v.bytes<=2*1024*1024);assert(v.width<v.photoWidth,'detailed full-photo PNG exercises bounded downscaling');assert.equal(v.width/v.height,v.photoWidth/v.photoHeight);assert(v.photoUnchanged&&v.placementUnchanged&&v.approved);
    });
    assert.deepEqual(f.errors,[]);assert.deepEqual(f.blocked,[]);
  }finally{
    await f.browser.close();const report={scope:'Isolated browser Canvas, exact shared scene and real request archive; synthetic photos; no network.',passed:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,results};fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify(report,null,2));process.exitCode=report.failed?1:0;
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
