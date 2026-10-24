'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const vm = require('node:vm');
const out = path.resolve(__dirname, '../qa/pdf');
fs.mkdirSync(out, { recursive: true });
const PDF = require('./quartermaster_pdf.js');
let count = 0;
function check(label, fn) { fn(); count++; console.log('PASS ' + label); }
// Canonical 12-line approved sample, kept local so verification works from an unpacked release.
const sampleLines=[
 ['DEMO-SID-200-WH','Vinyl siding - white','200 sq ft / carton (sample coverage)','8','carton','189.00'],
 ['DEMO-STR-12','Starter strip','12 ft / piece','16','piece','8.50'],
 ['DEMO-JCH-12-WH','J-channel - white','12 ft / piece','24','piece','9.75'],
 ['DEMO-OUT-10-WH','Outside corner post - white','10 ft / piece','6','piece','29.50'],
 ['DEMO-IN-10-WH','Inside corner post - white','10 ft / piece','2','piece','25.00'],
 ['DEMO-UTR-12-WH','Undersill trim - white','12 ft / piece','12','piece','8.25'],
 ['DEMO-FLS-50-AL','Flashing coil - aluminum','24 in x 50 ft / roll','2','roll','47.50'],
 ['DEMO-WRP-900','Housewrap','9 ft x 100 ft / roll','2','roll','115.00'],
 ['DEMO-NAIL-5','Siding fasteners','5 lb / box; sample product','4','box','24.50'],
 ['DEMO-SEAL-WH','Exterior sealant - white','10 oz / tube','12','tube','7.50'],
 ['DEMO-LAB-EXT','Exterior installation labor','Sample agreed job allowance','1','job','3200.00'],
 ['DEMO-SVC-DISP','Removal and disposal','Sample agreed job allowance','1','job','350.00']
].map((l,i)=>({kind:i<10?'material':'service',part_or_service_number:l[0],description:l[1],specification:l[2],package_specification:i<10?l[2]:'',quantity:l[3],unit:l[4],unit_price:l[5]}));
const src={documents:['invoice','quote'].map(type=>({type,customer:{name:'Sample Customer',address:['123 Example Lane','Sampletown, ST 00000']},job:{label:'Exterior siding package'},issue_date:'2026-10-23',due_date:type==='invoice'?'2026-11-07':'',valid_until:type==='quote'?'2026-11-22':'',lines:sampleLines}))};
function fixture(type='invoice') {
  const s = src.documents.find(d => d.type === type);
  const d = { id: 'document-1', type, number: 'HH-'+(type==='invoice'?'INV':'QTE')+'-2026-LA1B2C3D4E5F641F0A1B2C3D4E5F641F0-000001', revision: 1, status: 'finalized', business: {id:'househull',name:'HouseHull',address:'100 Sample Way - Sampletown, ST 00000',email:'estimates@househull.example',phone:''}, customer:{name:s.customer.name,address:s.customer.address.join('\n'),email:'',phone:''},job:{name:s.job.label,address:'123 Example Lane\nSampletown, ST 00000'},issueDate:s.issue_date,dueDate:s.due_date||'',validUntil:s.valid_until||'',terms:type==='invoice'?'Net 15':'Valid for 30 days',notes:'Supply the exterior materials, installation labor and disposal listed above.\nDEMO codes, quantities, pack sizes and prices are illustrative. Replace them with verified supplier parts and job quantities.',taxRate:'0',taxConfirmed:true,isSample:true,quoteReference:type==='invoice'?{id:'quote-1',number:'HH-QTE-2026-LA1B2C3D4E5F641F0A1B2C3D4E5F641F0-000001',revision:1}:null,lines:s.lines.map((l,i)=>({id:'line-'+i,itemId:'item-'+i,itemRevision:1,kind:l.kind,code:l.part_or_service_number,description:l.description,specification:l.specification,packageDescription:l.package_specification||'',manufacturerPart:'',supplierSku:'',quantity:l.quantity,unit:l.unit,unitPrice:l.unit_price})),totals:{subtotalCents:627100,taxCents:0,totalCents:627100}};
  return d;
}
function clone(d) {return JSON.parse(JSON.stringify(d));}
function command(name,args){try{return cp.execFileSync(name,args,{encoding:'utf8'});}catch(e){if(e.status===0&&typeof e.stdout==='string'&&e.stdout.length)return e.stdout;throw e;}}
function output(name,d) {const bytes=PDF.render(d);assert.ok(bytes instanceof Uint8Array);assert.equal(Buffer.from(bytes.subarray(0,8)).toString(),'%PDF-1.7');const file=path.join(out,name+'.pdf');fs.writeFileSync(file,bytes);const txt=command('pdftotext',['-raw',file,'-']);const pages=Number(command('pdfinfo',[file]).match(/Pages:\s+(\d+)/)[1]);return {bytes,file,txt,pages};}
check('public API',()=>{assert.equal(typeof PDF.render,'function');assert.equal(typeof PDF.filename,'function');});
check('browser globals render without Buffer or network',()=>{const sandbox={TextEncoder,Uint8Array,atob};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'quartermaster_fonts.js'),'utf8'),sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'quartermaster_pdf.js'),'utf8'),sandbox);const d=fixture();assert.deepEqual(sandbox.BlackFlagQuartermasterPDF.render(d),PDF.render(d));});
const sample=output('quartermaster-sample-invoice',fixture());
check('ordinary sample fits one page',()=>assert.equal(sample.pages,1));
check('correct customer amounts and groups',()=>{for(const s of ['HouseHull','MATERIALS','LABOR & SERVICES','Total due','$6,271.00','SAMPLE'])assert.ok(sample.txt.includes(s),s);assert.ok(sample.txt.replace(/\s+/g,'').includes('HH-QTE-2026-LA1B2C3D4E5F641F0A1B2C3D4E5F641F0-000001'));assert.ok(!sample.txt.includes('DRAFT'));});
const quote=output('quartermaster-sample-quote',fixture('quote'));
check('quote label',()=>{assert.equal(quote.pages,1);assert.ok(quote.txt.includes('Quote total'));assert.ok(!quote.txt.includes('Total due'));});
check('20-character prefix and full local series stay readable',()=>{const d=fixture();d.number=d.number.replace(/^HH-/,'ABCDEFGHIJKLMNOPQRST-');const p=output('quartermaster-long-number-invoice',d);assert.equal(p.pages,1);assert.ok(p.txt.replace(/\s+/g,'').includes(d.number));});
const normal=fixture();normal.isSample=false;normal.business.name='Élodie & Müller – Rénovation';normal.customer.name='Zoë O’Connor';normal.lines[0].cost='SECRET-COST-883';normal.lines[0].margin='SECRET-MARGIN-884';normal.cost='SECRET-COST-885';normal.lines[0].manufacturerPart='000-AA/12';normal.lines[0].supplierSku='001.7';normal.lines[0].packageDescription='Sealed carton / 200 sq ft';normal.notes='Literal data: <script>alert(1)</script> (\\) %';
const unicode=output('quartermaster-unicode-invoice',normal);
check('Unicode extraction and literal content, no internal leaks',()=>{for(const s of ['Élodie','Müller','Zoë O’Connor','<script>alert(1)</script>','000-AA/12','001.7','Pack: Sealed carton / 200 sq ft'])assert.ok(unicode.txt.includes(s),s);for(const s of ['SAMPLE','DRAFT','SECRET-COST','SECRET-MARGIN'])assert.ok(!unicode.txt.includes(s),s);});
const draft=fixture();draft.status='draft';draft.isSample=false;draft.taxConfirmed=false;draft.taxRate='';draft.lines=[];draft.totals={subtotalCents:0,taxCents:0,totalCents:0};
check('blank draft export explicitly labeled',()=>{const p=output('quartermaster-draft-invoice',draft);assert.ok(p.txt.includes('DRAFT'));assert.ok(p.txt.includes('Tax not reviewed'));});
const long=fixture();long.isSample=false;long.lines=Array.from({length:63},(_,i)=>({...clone(long.lines[i%12]),id:'long-'+i,code:'PART-'+i,description:('Long row '+i+' café specification text ').repeat(i===2?180:3),quantity:'1',unitPrice:'1.00'}));long.totals={subtotalCents:6300,taxCents:0,totalCents:6300};long.notes='Long notes end marker. '+('This note must wrap and paginate safely. '.repeat(250))+'FINAL-NOTE-END';
const many=output('quartermaster-multipage-invoice',long);
check('long rows and notes paginate without dropping content',()=>{assert.ok(many.pages>4);assert.ok(many.txt.includes('PART-62'));assert.ok(many.txt.includes('FINAL-NOTE-END'));const pages=many.txt.split('\f').filter(s=>s.trim());assert.equal(pages.length,many.pages);for(const p of pages)assert.ok(p.replace(/\s+/g,'').includes(long.number));assert.ok(pages.at(-1).includes('Total due'));});
const longTerms=fixture('quote');longTerms.terms='Work excludes concealed damage. Changes require written approval. '.repeat(40)+'FINAL-TERMS-END';
check('ordinary long terms paginate and preserve all exclusions',()=>{const p=output('quartermaster-long-terms-quote',longTerms);assert.ok(p.pages>1);assert.ok(p.txt.includes('FINAL-TERMS-END'));assert.equal((p.txt.replace(/\s+/g,' ').match(/Work excludes concealed damage/g)||[]).length,40);assert.ok(p.txt.includes('TERMS / EXCLUSIONS (continued)'));});
check('maximum core terms flow through multiple pages with totals at end',()=>{const d=clone(longTerms);const end='MAXIMUM-TERMS-END';d.terms=('A bounded exclusion clause applies to this scope. '.repeat(210)).slice(0,10000-end.length)+end;assert.equal(d.terms.length,10000);const p=output('quartermaster-maximum-terms-quote',d);assert.ok(p.pages>2);assert.ok(p.txt.includes('MAXIMUM-TERMS-END'));assert.ok(p.txt.split('\f').filter(s=>s.trim()).at(-1).includes('Quote total'));});
check('half-up line and tax arithmetic',()=>{const d=fixture();d.lines=[{...d.lines[0],quantity:'0.005',unitPrice:'1.00'}];d.taxRate='50';d.totals={subtotalCents:1,taxCents:1,totalCents:2};const p=output('quartermaster-rounding-invoice',d);assert.ok(p.txt.includes('$0.02'));});
check('largest safe cents retain exact final cents',()=>{const d=fixture();d.lines=[{...d.lines[0],quantity:'1',unitPrice:'90071992547409.91'}];d.totals={subtotalCents:9007199254740991,taxCents:0,totalCents:9007199254740991};const p=output('quartermaster-safe-limit-invoice',d);assert.ok(p.txt.includes('$90,071,992,547,409.91'));});
const invalid=[
 ['inconsistent total',d=>d.totals.totalCents++],['inconsistent subtotal',d=>d.totals.subtotalCents++],['inconsistent tax',d=>d.totals.taxCents++],
 ['malformed quantity',d=>d.lines[0].quantity='1x'],['negative quantity',d=>d.lines[0].quantity='-1'],['zero quantity',d=>d.lines[0].quantity='0'],['quantity precision',d=>d.lines[0].quantity='1.00001'],['price precision',d=>d.lines[0].unitPrice='1.001'],['blank finalized price',d=>d.lines[0].unitPrice=''],['unsafe arithmetic',d=>d.lines[0].unitPrice='9007199254740991'],['bad rate',d=>d.taxRate='1e2'],['unreviewed finalized tax',d=>d.taxConfirmed=false],['bad type',d=>d.type='receipt'],['bad status',d=>d.status='paid'],['invalid date',d=>d.issueDate='2026-02-30'],['bad line kind',d=>d.lines[0].kind='product'],['unsupported glyph',d=>d.customer.name='Client 🧪'],['control character',d=>d.customer.name='Client\u0000'],['unbounded text',d=>d.notes='a'.repeat(200001)],['object content',d=>d.customer.name={x:'unsafe'}],['null lines',d=>d.lines=null],['missing finalized customer',d=>d.customer.name=''],['missing package',d=>d.lines[0].packageDescription='']
];
for(const [label,mutate] of invalid)check('reject '+label,()=>{const d=fixture();mutate(d);assert.throws(()=>PDF.render(d));});
check('safe filename',()=>{assert.equal(PDF.filename(fixture()),'HH-INV-2026-LA1B2C3D4E5F641F0A1B2C3D4E5F641F0-000001.pdf');assert.ok(!PDF.filename({type:'quote',number:'../../evil\nname'}).includes('/'));assert.ok(PDF.filename({type:'quote',number:''}).endsWith('.pdf'));});
const report={checks:count,pages:{sampleInvoice:sample.pages,sampleQuote:quote.pages,multipage:many.pages},files:fs.readdirSync(out).filter(f=>f.endsWith('.pdf'))};
fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
