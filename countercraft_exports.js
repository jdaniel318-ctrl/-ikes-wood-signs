/* Canonical shop identity and recorded customer consent wrap the existing portable artwork package. */
(function(g,f){const api=f(g.IkeShopCore,g.CountercraftCore);if(typeof module==='object'&&module.exports)module.exports=api;g.CountercraftExports=api;})(globalThis,function(S,C){'use strict';
async function build(job,fonts){
 if(job.customerApprovedRevision!==job.revision)throw Error('The current revision needs customer approval before export.');
 const record=job.revisions.find(r=>r.revision===job.revision);if(!record)throw Error('The saved revision is missing.');
 if(record.snapshot.lettering&&!record.snapshot.lettering.resolved)throw Error('Ike’s requested lettering needs a matching customer-approved proof.');
 const snapshot=record.snapshot,acceptance=job.events.filter(e=>e.actor==='customer'&&e.action==='amendment-accept'&&e.details?.digest===snapshot.approval.digest).at(-1);
 const approvedAt=acceptance?.at||(snapshot.approval.kind==='customer-complete-request'?snapshot.approval.at:null);
 if(!approvedAt||!Number.isFinite(Date.parse(approvedAt)))throw Error('Recorded customer approval is required.');
 const request=C.clone(snapshot.request);request.revision=job.revision;request.design.revision=job.revision;request.approval.approvedAt=approvedAt;
 const bundle=await S.buildPackage(request,fonts);if(!await S.verifyPackage(request,bundle,fonts))throw Error('Artwork package verification failed.');
 const canonical={schema:'countercraft-job-export-v1',id:job.id,number:job.number,revision:job.revision,version:job.version,status:job.status,customerApprovedRevision:job.customerApprovedRevision,customerAcceptance:{at:approvedAt,eventId:acceptance?.id||job.events.find(e=>e.action==='received')?.id||null,digest:snapshot.approval.digest},lettering:snapshot.lettering||null,plankEvidence:snapshot.plankEvidence||[],price:snapshot.price,stockId:snapshot.stockId,contactPreference:snapshot.contactPreference,requestedPickup:snapshot.requestedPickup,requestId:request.id,requestFingerprint:request.approval.contentFingerprint,proofSha256:request.proof.sha256,productionApproved:false};
 const bytes=new TextEncoder().encode(JSON.stringify(canonical,null,2)+'\n'),file={name:'countercraft-job.json',mime:'application/json',bytes,sha256:await C.hash(bytes)};
 const files=bundle.files.filter(f=>f.name!=='manifest.json').concat(file);bundle.manifest.files=files.map(f=>({name:f.name,mime:f.mime,bytes:f.bytes.length,sha256:f.sha256}));
 const manifestBytes=new TextEncoder().encode(JSON.stringify(bundle.manifest,null,2)+'\n');files.push({name:'manifest.json',mime:'application/json',bytes:manifestBytes,sha256:await C.hash(manifestBytes)});
 const archive=S.zipFiles(files);return {name:job.number+'-r'+job.revision+'.zip',bytes:archive,sha256:await C.hash(archive),manifest:bundle.manifest,files};
}
return Object.freeze({build});});
