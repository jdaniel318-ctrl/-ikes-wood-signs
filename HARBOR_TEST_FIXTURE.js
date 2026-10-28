/* TEST ONLY. Small asynchronous in-memory storage adapter; not browser persistence proof.
   Never loaded by the application. Supports the API surface used by Harbor tests. */
(function(g){
class FixtureStorage{
 constructor(){Object.defineProperty(this,'_map',{value:new Map(),enumerable:false});}
 get length(){return this._map.size;}
 key(i){return Array.from(this._map.keys())[i]??null;}
 getItem(k){return this._map.has(k)?this._map.get(k):null;}
 setItem(k,v){this._map.set(k,String(v));Object.defineProperty(this,k,{value:String(v),writable:true,enumerable:true,configurable:true});}
 removeItem(k){this._map.delete(k);delete this[k];}
 clear(){for(const k of this._map.keys())delete this[k];this._map.clear();}
}
class FixtureObjectStore{
 constructor(db,name,tx=null){this.db=db;this.name=name;this.tx=tx;}
 put(value,key){const st=this.db._stores.get(this.name),k=key===undefined?value[st.keyPath]:key;st.rows.set(JSON.stringify(k),{key:structuredClone(k),value:structuredClone(value)});return {};}
 add(v,k){return this.put(v,k);}
 delete(k){this.db._stores.get(this.name).rows.delete(JSON.stringify(k));}
 clear(){this.db._stores.get(this.name).rows.clear();}
 openCursor(){const req={},rows=Array.from(this.db._stores.get(this.name).rows.values()).map(x=>structuredClone(x));let i=0;
 const next=()=>setTimeout(()=>{if(this.tx?.aborted)return;req.result=i<rows.length?{key:rows[i].key,value:rows[i++].value,continue:next}:null;req.onsuccess?.({target:req});if(!req.result&&!this.tx?.aborted)setTimeout(()=>this.tx?.oncomplete?.(),0);},0);next();return req;}
}
class FixtureDatabase{
 constructor(name,version=1){this.name=name;this.version=version;this._stores=new Map();}
 get objectStoreNames(){const a=Array.from(this._stores.keys());a.contains=n=>a.includes(n);return a;}
 createObjectStore(name,{keyPath}={}){this._stores.set(name,{keyPath,rows:new Map()});return new FixtureObjectStore(this,name);}
 transaction(names,mode='readonly'){const db=this;const tx={mode,aborted:false,error:null,objectStore(name){if(!db._stores.has(name))throw new DOMException('Missing','NotFoundError');return new FixtureObjectStore(db,name,tx);},abort(){if(tx.aborted)return;tx.aborted=true;setTimeout(()=>tx.onabort?.(),0);}};return tx;}
 close(){}
}
class FixtureFactory{
 constructor(){this._dbs=new Map();this.opened=[];}
 databases(){return Promise.resolve(Array.from(this._dbs.values()).map(x=>({name:x.name,version:x.version})));}
 open(name,version){const req={result:null,error:null,transaction:null};this.opened.push(name);setTimeout(()=>{let db=this._dbs.get(name);if(!db){db=new FixtureDatabase(name,version||1);req.result=db;let aborted=false;req.transaction={abort(){aborted=true;}};req.onupgradeneeded?.({target:req});if(aborted){req.error=new DOMException('Aborted create','AbortError');req.onerror?.();return;}this._dbs.set(name,db);}req.result=db;req.onsuccess?.({target:req});},0);return req;}
 deleteDatabase(name){this._dbs.delete(name);}
}
const api={FixtureStorage,FixtureObjectStore,FixtureDatabase,FixtureFactory};
if(typeof module==='object'&&module.exports)module.exports=api;
else{
 Object.defineProperty(g,'Storage',{value:FixtureStorage,configurable:true});
 Object.defineProperty(g,'localStorage',{value:new FixtureStorage(),configurable:true});
 Object.defineProperty(g,'indexedDB',{value:new FixtureFactory(),configurable:true});
 Object.defineProperty(g,'IDBFactory',{value:FixtureFactory,configurable:true});
 Object.defineProperty(g,'IDBDatabase',{value:FixtureDatabase,configurable:true});
 Object.defineProperty(g,'IDBObjectStore',{value:FixtureObjectStore,configurable:true});
}
})(globalThis);
