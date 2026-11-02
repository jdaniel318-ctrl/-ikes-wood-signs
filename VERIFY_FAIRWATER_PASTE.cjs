const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const code=fs.readFileSync((process.argv[2]||__dirname)+'/fleet_supabase.js','utf8');
const prefix=code.slice(0,code.indexOf('  // A customer handoff'))+'})();';
let handler;class Input{constructor(preserve){this.value='  Name  ';this.type='text';this.isConnected=true;this.preserve=preserve;}hasAttribute(){return false;}getAttribute(){return this.preserve?'preserve':null;}dispatchEvent(){}}
vm.runInNewContext(prefix,{window:{setTimeout:f=>f()},document:{addEventListener:(t,f)=>handler=f},HTMLInputElement:Input,Event:class{}});
const preserved=new Input(true);handler({target:preserved});assert.equal(preserved.value,'  Name  ');
const legacy=new Input(false);handler({target:legacy});assert.equal(legacy.value,'Name');console.log('PASS paste preserve and legacy trim');
