/* Quartermaster customer PDFs. Offline, dependency-free PDF 1.7 writer.
 * Uses only the supplied document snapshot. Font license: quartermaster_font_license.txt. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./quartermaster_fonts.js'));
  else root.BlackFlagQuartermasterPDF = factory(root.BlackFlagQuartermasterFonts);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (fonts) {
  'use strict';
  const MAX = BigInt(Number.MAX_SAFE_INTEGER), W = 612, H = 792, LEFT = 36, RIGHT = 576, BOTTOM = 735;
  const navy = [0.08, 0.22, 0.27], teal = [0.12, 0.40, 0.45], gray = [0.33, 0.41, 0.45], pale = [0.93, 0.96, 0.96], line = [0.80, 0.85, 0.87];
  function fail(message) { throw new Error('Quartermaster PDF: ' + message); }
  function ready() { if (!fonts || !fonts.regular || !fonts.bold) fail('bundled quartermaster_fonts.js must be loaded before the PDF renderer'); }
  function obj(x, label) { if (!x || typeof x !== 'object' || Array.isArray(x)) fail(label + ' must be an object'); return x; }
  function str(x, label, limit = 20000) {
    if (typeof x !== 'string' || x.length > limit) fail(label + ' must be a bounded string');
    for (const c of x) { const n = c.codePointAt(0); if (c === '\n' || c === '\r' || c === '\t') continue; if (n < 32 || n === 127 || !fonts.regular.cmap[n] || !fonts.bold.cmap[n]) fail(label + ': unsupported character U+' + n.toString(16).toUpperCase()); }
    return x.replace(/\r\n?/g, '\n').replace(/\t/g, '    ');
  }
  function field(o, k, limit) { return str(o[k] === undefined ? '' : o[k], k, limit); }
  function required(x, label) { if (!x.trim()) fail(label + ' is required'); }
  function date(x, label, needed) {
    str(x, label, 10); if (!x && !needed) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(x)) fail(label + ' must be YYYY-MM-DD');
    const d = new Date(x + 'T00:00:00Z'); if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== x) fail(label + ' is invalid');
  }
  function decimal(x, places, label, positive) {
    if (typeof x !== 'string' || x.length > 30 || !new RegExp('^\\d+(?:\\.\\d{1,' + places + '})?$').test(x)) fail(label + ' is malformed');
    const parts = x.split('.'), n = BigInt(parts[0]) * 10n ** BigInt(places) + BigInt((parts[1] || '').padEnd(places, '0'));
    if (n > MAX || (positive && n === 0n)) fail(label + ' is outside the supported range'); return n;
  }
  function safe(n) { if (n > MAX || n < 0n) fail('money exceeds the safe integer range'); return Number(n); }
  function money(cents) { const n=BigInt(cents);return '$'+(n/100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',')+'.'+(n%100n).toString().padStart(2,'0'); }
  function validate(input) {
    ready(); obj(input, 'document');
    if (!['invoice', 'quote'].includes(input.type)) fail('type must be invoice or quote');
    if (!['draft', 'finalized'].includes(input.status)) fail('status must be draft or finalized');
    if (typeof input.isSample !== 'boolean' || typeof input.taxConfirmed !== 'boolean') fail('sample and tax review flags must be booleans');
    if (!Number.isSafeInteger(input.revision) || input.revision < 1) fail('revision must be a positive safe integer');
    const d = { type:input.type,status:input.status,isSample:input.isSample,taxConfirmed:input.taxConfirmed,revision:input.revision };
    for (const k of ['number','issueDate','dueDate','validUntil','terms','notes','taxRate']) d[k] = field(input,k,k==='notes'?200000:20000);
    required(d.number,'document number');
    date(d.issueDate,'issue date',d.status==='finalized');date(d.dueDate,'due date',false);date(d.validUntil,'valid until',false);
    for (const k of ['business','customer','job']) {
      const original=obj(input[k],k);d[k]={};
      for (const f of (k==='job'?['name','address']:['name','address','email','phone'])) d[k][f]=field(original,f);
    }
    if (d.status==='finalized') {required(d.business.name,'business name');required(d.customer.name,'customer name');if(!d.taxConfirmed)fail('finalized document requires reviewed tax');}
    if (!Array.isArray(input.lines) || input.lines.length > 2000) fail('lines must be an array with at most 2000 entries');
    if (d.status==='finalized' && !input.lines.length) fail('finalized document requires lines');
    d.lines=[];let subtotal=0n;
    input.lines.forEach((l,i)=>{
      obj(l,'line '+i);if(!['material','service'].includes(l.kind))fail('line kind must be material or service');
      const row={kind:l.kind};
      for(const k of ['code','description','specification','packageDescription','manufacturerPart','supplierSku','quantity','unit','unitPrice']) row[k]=field(l,k);
      for(const k of ['code','description','unit'])required(row[k],'line '+k);
      if(d.status==='finalized' && row.kind==='material') required(row.packageDescription,'material package description');
      const q=decimal(row.quantity,4,'quantity',true), price=decimal(row.unitPrice,2,'unit price',false);
      row.amountCents=safe((q*price+5000n)/10000n);subtotal+=BigInt(row.amountCents);safe(subtotal);d.lines.push(row);
    });
    const rate=d.taxRate==='' && d.status==='draft' && !d.taxConfirmed?0n:decimal(d.taxRate,3,'tax rate',false);
    const tax=(subtotal*rate+50000n)/100000n, total=subtotal+tax;
    obj(input.totals,'totals');d.totals={subtotalCents:safe(subtotal),taxCents:safe(tax),totalCents:safe(total)};
    for(const k of Object.keys(d.totals))if(!Number.isSafeInteger(input.totals[k])||input.totals[k]!==d.totals[k])fail('inconsistent '+k);
    d.quoteReference=null;
    if(input.quoteReference!==undefined && input.quoteReference!==null){obj(input.quoteReference,'source quote');const q=input.quoteReference;if(!Number.isSafeInteger(q.revision)||q.revision<1)fail('invalid quote revision');d.quoteReference={number:field(q,'number'),revision:q.revision};required(d.quoteReference.number,'source quote number');if(d.type!=='invoice')fail('only an invoice can reference a quote');}
    return d;
  }
  function width(s,size,bold=false) { const f=fonts[bold?'bold':'regular'];let n=0;for(const c of s)n+=f.widths[f.cmap[c.codePointAt(0)]];return n*size/1000; }
  function wrap(s,max,size,bold=false) {
    const result=[];
    for(const paragraph of s.split('\n')) {
      if(!paragraph){result.push('');continue;}
      let current='';
      for(const word of paragraph.split(/\s+/).filter(Boolean)) {
        if(width(current?(current+' '+word):word,size,bold)<=max){current+=(current?' ':'')+word;continue;}
        if(current){result.push(current);current='';}
        for(const ch of word){if(current&&width(current+ch,size,bold)>max){result.push(current);current='';}current+=ch;}
      }
      if(current)result.push(current);
    }
    return result;
  }
  function wrapNumber(s,max,size){
    if(width(s,size,true)<=max)return[s];
    const split=s.lastIndexOf('-L');
    if(split>0)return wrap(s.slice(0,split+1),max,size,true).concat(wrap(s.slice(split+1),max,size,true));
    return wrap(s,max,size,true);
  }
  function render(input) {
    const d=validate(input), pages=[], used={regular:new Map(),bold:new Map()};let page, y, table=false, kind='';
    function rgb(a){return a.join(' ');}
    function rect(x,top,w,h,color){page.push(rgb(color)+' rg '+x+' '+(H-top-h)+' '+w+' '+h+' re f');}
    function rule(top){page.push(rgb(line)+' RG 0.5 w '+LEFT+' '+(H-top)+' m '+RIGHT+' '+(H-top)+' l S');}
    function text(s,x,top,size=8.5,bold=false,color=navy,align='left',max=0) {
      if(!s)return; const f=fonts[bold?'bold':'regular'];
      if(max && width(s,size,bold)>max)size*=max/width(s,size,bold);
      if(align==='right')x-=width(s,size,bold);
      let hex='';for(const c of s){const cp=c.codePointAt(0),gid=f.cmap[cp];used[bold?'bold':'regular'].set(gid,cp);hex+=gid.toString(16).padStart(4,'0');}
      page.push('BT /'+(bold?'FB':'FR')+' '+size.toFixed(3)+' Tf '+rgb(color)+' rg 1 0 0 1 '+x.toFixed(2)+' '+(H-top-size).toFixed(2)+' Tm <'+hex+'> Tj ET');
    }
    function paragraph(s,x,top,max,size=8.2,bold=false,color=gray,leading=10.5){const lines=wrap(s,max,size,bold);lines.forEach((l,i)=>text(l,x,top+i*leading,size,bold,color));return lines.length*leading;}
    function flags(top){const label=[d.status==='draft'?'DRAFT':'',d.isSample?'SAMPLE - FOR REVIEW ONLY':''].filter(Boolean).join('  |  ');if(label){rect(LEFT,top,540,18,[1,0.96,0.86]);text(label,LEFT+8,top+4,8,true,[0.48,0.32,0.06]);return 24;}return 0;}
    function newPage(first=false){page=[];pages.push(page);table=false;
      if(first){
        const businessH=paragraph(d.business.name||'Business',LEFT,26,270,23,true,navy,27);
        let leftTop=26+businessH+5;
        for(const s of [d.business.address,d.business.email,d.business.phone].filter(Boolean))leftTop+=paragraph(s,LEFT,leftTop,265,8,false,gray,10);
        text(d.type.toUpperCase(),RIGHT,27,23,true,navy,'right');
        const numberLines=wrapNumber(d.number,260,8.1);numberLines.forEach((l,i)=>text(l,RIGHT,58+i*10,8.1,true,navy,'right'));
        let rt=60+numberLines.length*10; text('Revision '+d.revision+(d.issueDate?'  |  Issued '+d.issueDate:''),RIGHT,rt,8,false,gray,'right');
        y=Math.max(leftTop+9,rt+20,106);rule(y-5);y+=flags(y);
        const metaStart=y+6;let a=metaStart,b=metaStart,c=metaStart;
        text(d.type==='invoice'?'BILL TO':'PREPARED FOR',LEFT,a,8,true,teal);a+=15;
        a+=paragraph(d.customer.name||'Customer not entered',LEFT,a,170,9,true,navy,11);
        for(const s of [d.customer.address,d.customer.email,d.customer.phone].filter(Boolean))a+=paragraph(s,LEFT,a+2,170,8,false,gray,10)+2;
        text('PROJECT / PROPERTY',225,b,8,true,teal);b+=15;
        b+=paragraph(d.job.name||'Project not entered',225,b,170,9,true,navy,11);
        if(d.job.address)b+=paragraph(d.job.address,225,b+2,170,8,false,gray,10)+2;
        text('DOCUMENT DETAILS',424,c,8,true,teal);c+=15;
        if(d.type==='invoice'&&d.dueDate)c+=paragraph('Due '+d.dueDate,424,c,152,8,false,gray,10)+3;
        if(d.type==='quote'&&d.validUntil)c+=paragraph('Valid until '+d.validUntil,424,c,152,8,false,gray,10)+3;
        if(d.quoteReference){c+=paragraph('Source quote / revision '+d.quoteReference.revision,424,c,152,7.5,false,gray,10);c+=paragraph(d.quoteReference.number,424,c,152,7,false,navy,9)+3;}
        if(d.terms && wrap('Terms: '+d.terms,152,8).length<=4)c+=paragraph('Terms: '+d.terms,424,c,152,8,false,gray,10);
        y=Math.max(a,b,c)+15;
        // Very large metadata is moved through the same flowing blocks used for notes.
        if(y>BOTTOM-60)fail('business, customer or project details are too long for a page; shorten those fields');
      }else{
        text(d.business.name||'Business',LEFT,27,15,true,navy,'left',260);text(d.type.toUpperCase(),RIGHT,25,16,true,navy,'right');
        const ns=wrapNumber(d.number,265,8.1);ns.forEach((s,i)=>text(s,RIGHT,48+i*10,8.1,true,navy,'right'));y=Math.max(72,49+ns.length*10);rule(y);y+=8;y+=flags(y);
      }
    }
    function tableHead(){if(table)return;rect(LEFT,y,540,21,navy);[['Part / service no.',42],['Description / specification',151],['Qty',368],['Unit',380],['Unit price',489],['Amount',570]].forEach(([s,x],i)=>text(s,x,y+6,7.7,true,[1,1,1],i===2||i>=4?'right':'left'));y+=21;table=true;}
    function group(name,continued=false){if(y+45>BOTTOM)newPage();tableHead();rect(LEFT,y,540,17,pale);const label=name==='material'?'MATERIALS':'LABOR & SERVICES';text(label+(continued?' (continued)':''),42,y+4,8,true,teal);if(!continued){const total=d.lines.filter(l=>l.kind===name).reduce((a,l)=>a+l.amountCents,0);text(money(total),570,y+4,8,true,teal,'right',90);}y+=17;kind=name;}
    newPage(true);
    if(!d.lines.length){text('No line items entered.',LEFT,y+8,9,false,gray);y+=38;}
    for(const section of ['material','service']){
      const rows=d.lines.filter(l=>l.kind===section);if(!rows.length)continue;group(section);
      for(const row of rows){
        const detail=[];const add=(s,size,color)=>{if(s)wrap(s,187,size).forEach(t=>detail.push({s:t,size,color}));};
        add(row.description,8.2,navy);add(row.specification,7.3,gray);if(row.packageDescription&&row.packageDescription!==row.specification)add('Pack: '+row.packageDescription,7.3,gray);if(row.manufacturerPart)add('Mfr: '+row.manufacturerPart,7.3,gray);if(row.supplierSku)add('Supplier SKU: '+row.supplierSku,7.3,gray);
        const cells=[wrap(row.code,101,7),detail,wrap(row.quantity,30,8),wrap(row.unit,39,7.3),[money(Number(decimal(row.unitPrice,2,'unit price')))], [money(row.amountCents)]];
        const total=Math.max(...cells.map(a=>a.length));let offset=0;
        while(offset<total){
          const minimum=Math.min(total-offset,2)*9.5+8;
          if(y+minimum>BOTTOM){newPage();group(section,true);}
          const take=Math.min(total-offset,Math.floor((BOTTOM-y-7)/9.5));
          if(take<1)fail('unable to paginate line');
          const height=take*9.5+7;
          for(let n=0;n<take;n++){
            const i=offset+n,top=y+4+n*9.5;
            if(cells[0][i])text(cells[0][i],42,top,7);
            if(cells[1][i])text(cells[1][i].s,151,top,cells[1][i].size,false,cells[1][i].color);
            if(cells[2][i])text(cells[2][i],368,top,8,false,navy,'right',30);
            if(cells[3][i])text(cells[3][i],380,top,7.3);
            if(cells[4][i])text(cells[4][i],489,top,8,false,navy,'right',65);
            if(cells[5][i])text(cells[5][i],570,top,8,false,navy,'right',73);
          }
          y+=height;rule(y);offset+=take;
        }
      }
    }
    y+=13;
    // Extended terms/exclusions use full-width flowing pages, preserving every line.
    if(d.terms && wrap('Terms: '+d.terms,152,8).length>4){
      const terms=wrap(d.terms,540,8.2);
      if(y+32>BOTTOM)newPage();
      text('TERMS / EXCLUSIONS',LEFT,y,8,true,teal);y+=17;
      for(const s of terms){if(y+11>BOTTOM){newPage();text('TERMS / EXCLUSIONS (continued)',LEFT,y,8,true,teal);y+=17;}text(s,LEFT,y,8.2,false,gray);y+=10.5;}
      y+=15;
    }
    // Reserve a readable final totals block. Notes can flow over any number of pages.
    const totalsHeight=91;
    let inlineNotes=d.notes;
    if(d.notes && y+20+wrap(d.notes,287,8).length*10.5>BOTTOM){
      const flowing=wrap(d.notes,540,8.2);inlineNotes='';
      if(y+32>BOTTOM)newPage();
      text('NOTES',LEFT,y,8,true,teal);y+=17;
      for(const s of flowing){if(y+11>BOTTOM){newPage();text('NOTES (continued)',LEFT,y,8,true,teal);y+=17;}text(s,LEFT,y,8.2,false,gray);y+=10.5;}
      y+=15;
    }
    if(y+totalsHeight>BOTTOM)newPage();
    const totalTop=y;
    text('Subtotal',350,totalTop+5,9);text(money(d.totals.subtotalCents),RIGHT,totalTop+5,9,false,navy,'right',140);
    const taxLabel=!d.taxConfirmed?'Tax not reviewed':('Tax ('+d.taxRate+'%)');text(taxLabel,350,totalTop+25,8.5,false,gray,'left',125);text(money(d.totals.taxCents),RIGHT,totalTop+25,9,false,navy,'right',95);
    rect(342,totalTop+47,234,32,pale);text(d.type==='quote'?'Quote total':'Total due',350,totalTop+56,10,true);text(money(d.totals.totalCents),568,totalTop+54,13,true,navy,'right',125);
    if(!d.taxConfirmed)text('Confirm tax before finalizing.',350,totalTop+83,7,false,gray);
    if(inlineNotes){
      text('NOTES',LEFT,totalTop+5,8,true,teal);
      const notes=wrap(inlineNotes,287,8);let n=0,nt=totalTop+20;
      while(n<notes.length){
        if(nt+10>BOTTOM){y=Math.max(nt,totalTop+totalsHeight);newPage();text('NOTES (continued)',LEFT,y,8,true,teal);nt=y+16;}
        text(notes[n++],LEFT,nt,8,false,gray);nt+=10.5;
      }
      y=Math.max(nt,totalTop+totalsHeight);
    }else y=totalTop+totalsHeight;
    pages.forEach((commands,i)=>{page=commands;rule(756);text((d.business.name||'Business')+'  |  '+d.number,LEFT,763,6.5,false,gray,'left',450);text('Page '+(i+1)+' of '+pages.length,RIGHT,763,6.5,false,gray,'right');});
    return encodePDF(pages,used);
  }
  function bytes(s){return new TextEncoder().encode(s);}
  function decode(s){if(typeof Buffer!=='undefined')return new Uint8Array(Buffer.from(s,'base64'));const b=atob(s),r=new Uint8Array(b.length);for(let i=0;i<b.length;i++)r[i]=b.charCodeAt(i);return r;}
  function join(parts){const r=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let n=0;for(const p of parts){r.set(p,n);n+=p.length;}return r;}
  function encodePDF(pages,used){
    const objects=[null],reserve=()=>{objects.push(null);return objects.length-1;},put=(n,s)=>objects[n]=typeof s==='string'?bytes(s):s;
    function stream(content,extra=''){return join([bytes('<< /Length '+content.length+' '+extra+' >>\nstream\n'),content,bytes('\nendstream')]);}
    const catalog=reserve(),tree=reserve(),fontRefs={};
    for(const key of ['regular','bold']){
      const f=fonts[key],type0=reserve(),cid=reserve(),desc=reserve(),file=reserve(),unicode=reserve();fontRefs[key]=type0;
      const fontBytes=decode(f.data);put(file,stream(fontBytes,'/Length1 '+fontBytes.length));
      put(desc,'<< /Type /FontDescriptor /FontName /'+f.name+' /Flags 32 /FontBBox ['+f.bbox.join(' ')+'] /ItalicAngle 0 /Ascent '+f.ascent+' /Descent '+f.descent+' /CapHeight 730 /StemV '+(key==='bold'?120:80)+' /FontFile2 '+file+' 0 R >>');
      const entries=Array.from(used[key].entries()).sort((a,b)=>a[0]-b[0]);
      put(cid,'<< /Type /Font /Subtype /CIDFontType2 /BaseFont /'+f.name+' /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor '+desc+' 0 R /CIDToGIDMap /Identity /DW 1000 /W ['+entries.map(([g])=>g+' ['+f.widths[g]+']').join(' ')+'] >>');
      const cmap=['/CIDInit /ProcSet findresource begin','12 dict begin','begincmap','/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def','/CMapName /QuartermasterUnicode def','/CMapType 2 def','1 begincodespacerange','<0000> <FFFF>','endcodespacerange'];
      for(let i=0;i<entries.length;i+=100){const batch=entries.slice(i,i+100);cmap.push(batch.length+' beginbfchar');for(const [gid,cp]of batch)cmap.push('<'+gid.toString(16).padStart(4,'0')+'> <'+cp.toString(16).padStart(4,'0')+'>');cmap.push('endbfchar');}cmap.push('endcmap','CMapName currentdict /CMap defineresource pop','end','end');
      put(unicode,stream(bytes(cmap.join('\n'))));put(type0,'<< /Type /Font /Subtype /Type0 /BaseFont /'+f.name+' /Encoding /Identity-H /DescendantFonts ['+cid+' 0 R] /ToUnicode '+unicode+' 0 R >>');
    }
    const refs=[];
    for(const page of pages){const p=reserve(),content=reserve();refs.push(p);put(content,stream(bytes(page.join('\n'))));put(p,'<< /Type /Page /Parent '+tree+' 0 R /MediaBox [0 0 612 792] /Resources << /Font << /FR '+fontRefs.regular+' 0 R /FB '+fontRefs.bold+' 0 R >> >> /Contents '+content+' 0 R >>');}
    put(catalog,'<< /Type /Catalog /Pages '+tree+' 0 R >>');put(tree,'<< /Type /Pages /Count '+refs.length+' /Kids ['+refs.map(n=>n+' 0 R').join(' ')+'] >>');
    const parts=[bytes('%PDF-1.7\n% Quartermaster offline customer document\n')],offsets=[0];let pos=parts[0].length;
    for(let i=1;i<objects.length;i++){offsets.push(pos);const chunk=join([bytes(i+' 0 obj\n'),objects[i],bytes('\nendobj\n')]);parts.push(chunk);pos+=chunk.length;}
    const trailer='xref\n0 '+objects.length+'\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+objects.length+' /Root '+catalog+' 0 R >>\nstartxref\n'+pos+'\n%%EOF\n';parts.push(bytes(trailer));return join(parts);
  }
  function filename(d){const type=d&&d.type==='quote'?'quote':'invoice';const n=d&&typeof d.number==='string'?d.number:'';const safeName=n.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,150);return(safeName||type)+'.pdf';}
  return Object.freeze({render,filename,initialize:function(){ready();return Promise.resolve();}});
});
