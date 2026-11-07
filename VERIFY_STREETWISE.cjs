'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const {webcrypto} = require('node:crypto');
const read = name => fs.readFileSync(path.join(__dirname,name));
const requests=[];
let corrupt=false;
const ctx={
  TextDecoder, crypto:webcrypto,
  fetch:async url=>{
    assert.match(url,/^\.\/streetwise_rva_\d{2}\.json\?v=[a-f0-9]{12}$/);
    requests.push(url);
    return new Response(corrupt ? '{}' : read(url.split('?')[0]));
  }
};
vm.runInNewContext(read('service_address_fleet.js').toString(),ctx);
vm.runInNewContext(read('service_address.js').toString(),ctx);
const lookup=ctx.BlackFlagServiceAddress;
(async()=>{
  assert.ok(lookup.supports({id:'bf-p-f92f87e8ec44'}));
  assert.ok(lookup.supports({id:'another-contractor',customerExperience:{addressRegion:'richmond-va'}}));
  assert.ok(lookup.supports({id:'bor-north-richmond'}));
  assert.equal(lookup.supports({id:'bf-p-f92f87e8ec44',customerExperience:{addressRegion:'off'}}),false);
  assert.equal(lookup.supports({id:'elsewhere'}),false);
  assert.equal((await lookup.suggest('900')).length,0);
  assert.equal(requests.length,0);
  const rows=await lookup.suggest('900 E Bro');
  const hall=rows.find(row=>row.address==='900 E Broad St, Richmond, VA 23219');
  assert.ok(hall);
  assert.ok(Math.abs(hall.latitude-37.54079)<0.00002 && Math.abs(hall.longitude+77.43316)<0.00002);
  for(const typed of ['900 East Broad Street, Richmond, VA 23219','900 Broad Str','900 e. broad st']){
    assert.ok((await lookup.suggest(typed)).some(r=>r.address===hall.address));
  }
  assert.equal(requests.length,1);
  assert.equal((await lookup.suggest('900 Fleet Test Lane')).length,0);
  const link=lookup.mapLink(hall.address,hall);
  assert.match(link,/https:\/\/www.google.com\/maps\/search\//);
  assert.equal(lookup.mapLink(hall.address+'x',hall),'');
  assert.equal(lookup.mapLink(hall.address,{...hall,latitude:null}),'');
  assert.equal(lookup.mapLink(hall.address,{...hall,longitude:1}),'');
  corrupt=true; await assert.rejects(lookup.suggest('1000 Ba'),/changed/);
  corrupt=false; assert.ok((await lookup.suggest('1000 Ba')).some(r=>r.address==='1000 Bank St, Richmond, VA 23219'));
  assert.equal(requests.length,3);
  const provenance=JSON.parse(read('STREETWISE_RVA_SOURCE.json'));
  let total=0;
  for(let bucket=0;bucket<16;bucket++){
    const data=JSON.parse(read('streetwise_rva_'+String(bucket).padStart(2,'0')+'.json'));
    for(const [number,homes] of Object.entries(data.numbers)){
      assert.equal(parseInt(number,10)%16,bucket);
      for(const [street,place,lat,lon] of homes){
        assert.ok(data.streets[street] && data.places[place]?.[1]);
        assert.ok(Number.isInteger(lat)&&Number.isInteger(lon));total++;
      }
    }
  }
  assert.equal(total,provenance.uniqueMappedAddresses);
  console.log('PASS address matching, postal labels, pin validity, privacy, data integrity and retry;',total,'indexed addresses');
})().catch(error=>{console.error(error);process.exitCode=1;});
