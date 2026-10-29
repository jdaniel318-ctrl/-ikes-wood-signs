/* TEST-ONLY asynchronous IndexedDB-shaped fixture. No native persistence claim.
   Supports atomic abort and serial readwrite operations used by BrightwakeStore. */
(function(g){
 const copy=x=>x===undefined?undefined:structuredClone(x);
 class Store{
 constructor(tx,name){this.tx=tx;this.name=name;}
 req(fn){const req={};const tx=this.tx;tx.pending++;const work=()=>{if(tx.aborted)return;if(!tx.started){setTimeout(work,1);return;}try{req.result=fn();req.onsuccess?.({target:req});}catch(e){req.error=e;req.onerror?.({target:req});tx.error=e;tx.abort();}finally{tx.pending--;tx.check();}};setTimeout(work,0);return req;}
 rows(){return this.tx.working.get(this.name).rows;}
 get(k){return this.req(()=>copy(this.rows().get(k)));}
 getAll(){return this.req(()=>[...this.rows().values()].map(copy));}
 count(){return this.req(()=>this.rows().size);}
 put(v){return this.req(()=>{if(g.fixtureWriteBlocked)throw new DOMException('Injected storage refusal','QuotaExceededError');if(this.tx.mode!=='readwrite')throw Error('Readonly');this.rows().set(v.id,copy(v));return v.id;});}
 add(v){return this.req(()=>{if(g.fixtureWriteBlocked)throw new DOMException('Injected storage refusal','QuotaExceededError');if(this.rows().has(v.id))throw new DOMException('Duplicate','ConstraintError');this.rows().set(v.id,copy(v));return v.id;});}
 delete(k){return this.req(()=>{if(g.fixtureWriteBlocked)throw new DOMException('Injected','QuotaExceededError');this.rows().delete(k);});}
 }
 class Tx{
 constructor(db,mode){this.db=db;this.mode=mode;this.pending=0;this.aborted=false;this.done=false;this.error=null;this.working=null;this.started=false;db.queue.push(this);db.advance();}
 objectStore(n){if(!this.db.stores.has(n))throw Error('Missing store');return new Store(this,n);}
 check(){clearTimeout(this.finishTimer);this.finishTimer=setTimeout(()=>{if(this.started&&!this.pending&&!this.aborted&&!this.done){this.done=true;if(this.mode==='readwrite')this.db.stores=this.working;this.oncomplete?.();this.db.finish(this);}},1);}
 abort(){if(this.done||this.aborted)return;this.aborted=true;clearTimeout(this.finishTimer);setTimeout(()=>{this.onabort?.();this.db.finish(this);},0);}
 }
 class DB{
 constructor(n){this.name=n;this.stores=new Map();this.queue=[];this.current=null;}
 advance(){if(this.current||!this.queue.length)return;const tx=this.current=this.queue.shift();tx.working=new Map([...this.stores].map(([k,v])=>[k,{rows:new Map([...v.rows].map(([id,row])=>[id,copy(row)]))}]));tx.started=true;tx.check();}
 finish(tx){if(this.current===tx)this.current=null;else this.queue=this.queue.filter(t=>t!==tx);this.advance();}
 createObjectStore(n){this.stores.set(n,{rows:new Map()});}
 transaction(n,mode='readonly'){g.fixtureTransactions.push({database:this.name,mode});return new Tx(this,mode);}
 close(){}
 }
 const dbs=new Map();g.fixtureTransactions=[];g.fixtureWriteBlocked=false;
 const factory={open(n){g.fixtureOpened.push(n);const req={};setTimeout(()=>{let db=dbs.get(n);if(!db){db=new DB(n);dbs.set(n,db);req.result=db;req.onupgradeneeded?.();}req.result=db;req.onsuccess?.();},0);return req;},databases:async()=>[...dbs.keys()].map(name=>({name}))};
 g.fixtureOpened=[];Object.defineProperty(g,'indexedDB',{value:factory,configurable:true});g.fixtureState={dbs};
})(globalThis);
