/* Quartermaster customer PDFs. Offline, dependency-free PDF 1.7 writer.
 * Reads the saved document and its immutable creation receipt. Font license: quartermaster_font_license.txt. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./quartermaster_fonts.js'));
  else root.BlackFlagQuartermasterPDF = factory(root.BlackFlagQuartermasterFonts);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (fonts) {
  'use strict';
  const MAX = BigInt(Number.MAX_SAFE_INTEGER), W = 612, H = 792, LEFT = 36, RIGHT = 576, BOTTOM = 735;
  const gray = [0.33, 0.41, 0.45], line = [0.80, 0.85, 0.87];
  // Frozen print reproduction of the commissioned fleet-voyagekeeper.webp mark.
  // Keep this artwork with its letterhead version so saved documents reprint offline.
  const lighthouseJpeg = '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';
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
  const voyageKeeperProjects = new Set(['bf-p-42be92cbac12','bf-p-fc2816b8254a4845']);
  const newUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const printProfileUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-(8156|8256)-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  function matchesLighthouseAsset(url) {
    if (url === 'fleet-voyagekeeper.webp' || url === './fleet-voyagekeeper.webp') return true;
    if (typeof location === 'undefined' || typeof url !== 'string') return false;
    try {
      return new URL(url, location.href).href === new URL('fleet-voyagekeeper.webp', location.href).href;
    } catch { return false; }
  }
  function creationOperationId(rawUuid, brand, businessId) {
    if (!voyageKeeperProjects.has(businessId) || brand?.livery !== 'voyagekeeper' || !newUuid.test(rawUuid)) return rawUuid;
    // A UUIDv8 creation receipt freezes the letterhead choice without extending the
    // validated backup schema or deriving it later from mutable vessel branding.
    const profile = matchesLighthouseAsset(brand.logoUrl) ? '8156' : '8256';
    return rawUuid.slice(0,14) + profile + rawUuid.slice(18);
  }
  function letterheadFor(input, creation) {
    if (!voyageKeeperProjects.has(input.business?.id) || !input.id || creation?.kind !== 'createDocument' ||
        creation.documentId !== input.id || creation.request?.type !== input.type) return '';
    const match = printProfileUuid.exec(creation.id);
    return match ? (match[1] === '8156' ? 'lighthouse' : 'wordmark') : '';
  }
  function writeText(page,used,s,x,top,size,bold,color,align,max) {
      if(!s)return; const f=fonts[bold?'bold':'regular'];
      if(max && width(s,size,bold)>max)size*=max/width(s,size,bold);
      if(align==='right')x-=width(s,size,bold);
      let hex='';for(const c of s){const cp=c.codePointAt(0),gid=f.cmap[cp];used[bold?'bold':'regular'].set(gid,cp);hex+=gid.toString(16).padStart(4,'0');}
      page.push('BT /'+(bold?'FB':'FR')+' '+size.toFixed(3)+' Tf '+color.join(' ')+' rg 1 0 0 1 '+x.toFixed(2)+' '+(H-top-size).toFixed(2)+' Tm <'+hex+'> Tj ET');
    }

  // The recipient can use the full character repertoire of the vessel editor.
  // Render just that line with the device fonts if the bundled PDF font lacks glyphs.
  function offerRecipientImage(value, maxWidth) {
    const scale = 3, size = 12, leading = 15;
    const canvas = document.createElement('canvas');
    canvas.width = maxWidth * scale;
    const ctx = canvas.getContext('2d');
    ctx.font = size * scale + 'px sans-serif';
    const lines = [];
    let current = '';
    const units = typeof Intl.Segmenter === 'function'
      ? Array.from(new Intl.Segmenter(undefined, {granularity:'grapheme'}).segment(value), s => s.segment)
      : Array.from(value);
    for (const unit of units) {
      if (current && ctx.measureText(current + unit).width > canvas.width - 4 * scale) {
        lines.push(current);
        current = '';
      }
      current += unit;
    }
    if (current) lines.push(current);
    canvas.height = (lines.length * leading + 4) * scale;
    ctx.scale(scale, scale);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, maxWidth, canvas.height / scale);
    ctx.fillStyle = '#214a4c';
    ctx.font = size + 'px sans-serif';
    lines.forEach((entry, i) => ctx.fillText(entry, 1, size + i * leading));
    return {width:canvas.width, height:canvas.height, heightPt:canvas.height / scale,
      jpg:canvas.toDataURL('image/jpeg', .96).split(',')[1]};
  }

  function renderLaunchOffer(offer) {
    ready();
    const page = [], used = {regular:new Map(), bold:new Map()};
    const ink = [.07,.18,.20], teal = [.08,.27,.28], muted = [.25,.36,.37];
    const padding = 44, span = W - 2 * padding;
    let y = 33;
    function line(value, x, top, size, bold = false, color = ink, max = span) {
      writeText(page, used, value, x, top, size, bold, color, 'left', max);
    }
    function paragraph(value, size = 11, leading = 15, color = ink, bold = false) {
      for (const entry of wrap(value, span, size, bold)) {
        line(entry, padding, y, size, bold, color);
        y += leading;
      }
    }
    function heading(value) {
      page.push('0.80 0.85 0.84 RG 0.6 w ' + padding + ' ' + (H-y) + ' m ' + (W-padding) + ' ' + (H-y) + ' l S');
      y += 11;
      paragraph(value, 15, 23, teal, true);
    }
    line(offer.brand, padding, y, 11, true, teal);
    y += 18;
    line(offer.title, padding, y, 29, true, teal);
    y += 40;
    const recipient = offer.recipient.replace(/\s+/gu, ' ').trim();
    let recipientImage;
    if (Array.from(recipient).every(c => fonts.regular.cmap[c.codePointAt(0)])) {
      paragraph(recipient, 12, 16, muted);
    } else {
      recipientImage = offerRecipientImage(recipient, span);
      const actual = recipient.split('').map(c => c.charCodeAt(0).toString(16).padStart(4, '0')).join('');
      page.push('/Span << /ActualText <FEFF' + actual + '> >> BDC q ' + span + ' 0 0 ' +
        recipientImage.heightPt + ' ' + padding + ' ' + (H-y-recipientImage.heightPt) + ' cm /Recipient Do Q EMC');
      y += recipientImage.heightPt;
    }
    y += 8;
    page.push('0.74 0.58 0.30 rg ' + padding + ' ' + (H-y-2) + ' ' + span + ' 2 re f');
    y += 15;
    paragraph(offer.introTitle, 15, 23, teal, true);
    paragraph(offer.intro);
    y += 15;
    heading(offer.pricingTitle);
    page.push('0.92 0.95 0.94 rg ' + padding + ' ' + (H-y-78) + ' ' + span + ' 78 re f');
    const fees = [offer.rows[0],offer.rows[3],offer.rows[1],offer.rows[2]];
    fees.forEach(([label, value], i) => {
      const x = padding + 12 + (i%2)*span/2, top = y + 5 + Math.floor(i/2)*37;
      line(label, x, top, 9, false, muted, span/2-24);
      line(value, x, top+12, 15, true, teal, span/2-24);
    });
    y += 90;
    paragraph(offer.setupLead + ' ' + offer.setupText);
    y += 6;
    paragraph(offer.supportLead + ' ' + offer.supportText);
    y += 16;
    heading(offer.trialTitle);
    paragraph(offer.trial);
    y += 16;
    heading(offer.termsTitle);
    paragraph(offer.terms);
    y += 8;
    paragraph(offer.fine, 10, 14, muted);
    if (y > H-30) fail('owner offer exceeds the Letter page');
    return encodePDF([page], used, false, recipientImage);
  }

  function render(input, creation) {
    const d=validate(input), pages=[], used={regular:new Map(),bold:new Map()};let page, y, table=false, kind='';
    const branded = letterheadFor(input, creation), crest = branded === 'lighthouse';
    const navy=branded?[0.05,0.15,0.25]:[0.08,0.22,0.27], teal=branded?[0.13,0.35,0.43]:[0.12,0.40,0.45];
    const pale=branded?[0.93,0.95,0.97]:[0.93,0.96,0.96];
    function rgb(a){return a.join(' ');}
    function rect(x,top,w,h,color){page.push(rgb(color)+' rg '+x+' '+(H-top-h)+' '+w+' '+h+' re f');}
    function rule(top){page.push(rgb(line)+' RG 0.5 w '+LEFT+' '+(H-top)+' m '+RIGHT+' '+(H-top)+' l S');}
    function text(s,x,top,size=8.5,bold=false,color=navy,align='left',max=0) {
      writeText(page,used,s,x,top,size,bold,color,align,max);
    }
    function paragraph(s,x,top,max,size=8.2,bold=false,color=gray,leading=10.5){const lines=wrap(s,max,size,bold);lines.forEach((l,i)=>text(l,x,top+i*leading,size,bold,color));return lines.length*leading;}
    function flags(top){const label=[d.status==='draft'?'DRAFT':'',d.isSample?'SAMPLE - FOR REVIEW ONLY':''].filter(Boolean).join('  |  ');if(label){rect(LEFT,top,540,18,[1,0.96,0.86]);text(label,LEFT+8,top+4,8,true,[0.48,0.32,0.06]);return 24;}return 0;}
    function lighthouse(x, top, size) {
      // Clip the original square icon outside its circular gold rim.
      page.push('q '+size+' 0 0 '+size+' '+x+' '+(H-top-size)+' cm');
      page.push('0.5 0.97 m 0.76 0.97 0.97 0.76 0.97 0.5 c 0.97 0.24 0.76 0.03 0.5 0.03 c 0.24 0.03 0.03 0.24 0.03 0.5 c 0.03 0.76 0.24 0.97 0.5 0.97 c h W n /VKLighthouse Do Q');
    }
    function newPage(first=false){page=[];pages.push(page);table=false;
      if(first){
        const name=d.business.name||'Business';
        const contacts=[d.business.address,d.business.email,d.business.phone].filter(Boolean);
        // Give unusually long business details the original full text column.
        const besideMark = crest && 22*wrap(name,205,19,true).length +
          contacts.reduce((height,value)=>height+10*wrap(value,205,8).length,0) <= 66;
        const nameX=besideMark?LEFT+61:LEFT;
        if(crest)lighthouse(besideMark?LEFT-1.5:RIGHT-142,besideMark?23:21,besideMark?53:31);
        if(branded==='wordmark')rect(LEFT,19,26,2,[0.78,0.55,0.22]);
        const businessH=paragraph(name,nameX,26,besideMark?205:270,besideMark?19:23,true,navy,besideMark?22:27);
        let leftTop=26+businessH+5;
        for(const s of contacts)leftTop+=paragraph(s,nameX,leftTop,besideMark?205:265,8,false,gray,10);
        text(d.type.toUpperCase(),RIGHT,27,23,true,navy,'right');
        const numberLines=wrapNumber(d.number,260,8.1);numberLines.forEach((l,i)=>text(l,RIGHT,58+i*10,8.1,true,navy,'right'));
        let rt=60+numberLines.length*10; text('Revision '+d.revision+(d.issueDate?'  |  Issued '+d.issueDate:''),RIGHT,rt,8,false,gray,'right');
        y=Math.max(leftTop+9,rt+20,106);rule(y-5);
        if(branded)rect(LEFT,y-6,48,2,[0.78,0.55,0.22]);
        y+=flags(y);
        const metaStart=y+6;let a=metaStart,b=metaStart,c=metaStart;
        text(d.type==='invoice'?'BILL TO':'PREPARED FOR',LEFT,a,8,true,teal);a+=15;
        a+=paragraph(d.customer.name||'Customer not entered',LEFT,a,170,9,true,navy,11);
        for(const s of [d.customer.address,d.customer.email,d.customer.phone].filter(Boolean))a+=paragraph(s,LEFT,a+2,170,8,false,gray,10)+2;
        text('PROJECT / PROPERTY',225,b,8,true,teal);b+=15;
        b+=paragraph(d.job.name||'Project not entered',225,b,170,9,true,navy,11);
        if(d.job.address)b+=paragraph(d.job.address,225,b+2,170,8,false,gray,10)+2;
        if(!branded || (d.type==='invoice'?d.dueDate:d.validUntil) || d.quoteReference || (d.terms && wrap('Terms: '+d.terms,152,8).length<=4)){
          text('DOCUMENT DETAILS',424,c,8,true,teal);c+=15;
        }
        if(d.type==='invoice'&&d.dueDate)c+=paragraph('Due '+d.dueDate,424,c,152,8,false,gray,10)+3;
        if(d.type==='quote'&&d.validUntil)c+=paragraph('Valid until '+d.validUntil,424,c,152,8,false,gray,10)+3;
        if(d.quoteReference){c+=paragraph('Source quote / revision '+d.quoteReference.revision,424,c,152,7.5,false,gray,10);c+=paragraph(d.quoteReference.number,424,c,152,7,false,navy,9)+3;}
        if(d.terms && wrap('Terms: '+d.terms,152,8).length<=4)c+=paragraph('Terms: '+d.terms,424,c,152,8,false,gray,10);
        y=Math.max(a,b,c)+15;
        // Very large metadata is moved through the same flowing blocks used for notes.
        if(y>BOTTOM-60)fail('business, customer or project details are too long for a page; shorten those fields');
      }else{
        if(crest)lighthouse(LEFT,21,30);
        if(branded==='wordmark')rect(LEFT,21,20,1.5,[0.78,0.55,0.22]);
        text(d.business.name||'Business',crest?LEFT+38:LEFT,27,15,true,navy,'left',crest?221:260);text(d.type.toUpperCase(),RIGHT,25,16,true,navy,'right');
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
    return encodePDF(pages,used,crest);
  }
  function bytes(s){return new TextEncoder().encode(s);}
  function decode(s){if(typeof Buffer!=='undefined')return new Uint8Array(Buffer.from(s,'base64'));const b=atob(s),r=new Uint8Array(b.length);for(let i=0;i<b.length;i++)r[i]=b.charCodeAt(i);return r;}
  function join(parts){const r=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let n=0;for(const p of parts){r.set(p,n);n+=p.length;}return r;}
  function encodePDF(pages,used,branded,recipientImage){
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
    let artwork='';
    if(branded){
      const image=reserve();
      put(image,stream(decode(lighthouseJpeg),'/Type /XObject /Subtype /Image /Width 192 /Height 192 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode'));
      artwork=' /XObject << /VKLighthouse '+image+' 0 R >>';
    }
    if (recipientImage) {
      const img = reserve();
      put(img,stream(decode(recipientImage.jpg),'/Type /XObject /Subtype /Image /Width '+recipientImage.width+
        ' /Height '+recipientImage.height+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode'));
      artwork = ' /XObject << /Recipient '+img+' 0 R >>';
    }
    const refs=[];
    for(const page of pages){const p=reserve(),content=reserve();refs.push(p);put(content,stream(bytes(page.join('\n'))));put(p,'<< /Type /Page /Parent '+tree+' 0 R /MediaBox [0 0 612 792] /Resources << /Font << /FR '+fontRefs.regular+' 0 R /FB '+fontRefs.bold+' 0 R >>'+artwork+' >> /Contents '+content+' 0 R >>');}
    put(catalog,'<< /Type /Catalog /Pages '+tree+' 0 R >>');put(tree,'<< /Type /Pages /Count '+refs.length+' /Kids ['+refs.map(n=>n+' 0 R').join(' ')+'] >>');
    const parts=[bytes('%PDF-1.7\n% Quartermaster offline customer document\n')],offsets=[0];let pos=parts[0].length;
    for(let i=1;i<objects.length;i++){offsets.push(pos);const chunk=join([bytes(i+' 0 obj\n'),objects[i],bytes('\nendobj\n')]);parts.push(chunk);pos+=chunk.length;}
    const trailer='xref\n0 '+objects.length+'\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+objects.length+' /Root '+catalog+' 0 R >>\nstartxref\n'+pos+'\n%%EOF\n';parts.push(bytes(trailer));return join(parts);
  }
  function filename(d){const type=d&&d.type==='quote'?'quote':'invoice';const n=d&&typeof d.number==='string'?d.number:'';const safeName=n.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,150);return(safeName||type)+'.pdf';}
  return Object.freeze({render,renderLaunchOffer,filename,creationOperationId,letterheadFor,initialize:function(){ready();return Promise.resolve();}});
});
