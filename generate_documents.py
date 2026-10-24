#!/usr/bin/env python3
"""Render the HouseHull review samples. No network, sending, or business writes.

The renderer accepts already assigned document numbers. It does not allocate
production numbers, create invoices in Black Flag, or select actual products.
"""
from __future__ import annotations

import argparse
import json
import re
from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, KeepTogether, LongTable, PageTemplate,
    Paragraph, Spacer, Table, TableStyle,
)

ROOT = Path(__file__).resolve().parent
CENT = Decimal('0.01')
NAVY = colors.HexColor('#173C46')
TEAL = colors.HexColor('#316D75')
INK = colors.HexColor('#233A40')
MUTED = colors.HexColor('#5B6C70')
RULE = colors.HexColor('#D7E1E2')
PALE = colors.HexColor('#EFF5F5')
GOLD = colors.HexColor('#795815')
SAMPLE_BG = colors.HexColor('#FFF5DF')
W, H = letter
M = 36
WIDTH = W - M * 2


def register_fonts():
    candidates = [ROOT / 'fonts', Path('/usr/share/fonts/truetype/dejavu')]
    regular = next((p / 'DejaVuSans.ttf' for p in candidates if (p / 'DejaVuSans.ttf').exists()), None)
    bold = next((p / 'DejaVuSans-Bold.ttf' for p in candidates if (p / 'DejaVuSans-Bold.ttf').exists()), None)
    mono = next((p / 'DejaVuSansMono.ttf' for p in candidates if (p / 'DejaVuSansMono.ttf').exists()), None)
    if regular and bold and mono:
        pdfmetrics.registerFont(TTFont('Body', str(regular)))
        pdfmetrics.registerFont(TTFont('BodyBold', str(bold)))
        pdfmetrics.registerFont(TTFont('Code', str(mono)))
        pdfmetrics.registerFontFamily('Body', normal='Body', bold='BodyBold', italic='Body', boldItalic='BodyBold')
        return 'Body', 'BodyBold', 'Code'
    # Standard PDF fonts are sufficient for these ASCII review fixtures.
    return 'Helvetica', 'Helvetica-Bold', 'Courier'


BODY, BOLD, CODE = register_fonts()


def dec(value):
    d = Decimal(str(value))
    if not d.is_finite():
        raise ValueError('Amounts and quantities must be finite.')
    return d


def money(value):
    return '$' + f'{dec(value).quantize(CENT, rounding=ROUND_HALF_UP):,.2f}'


def quantity(value):
    return format(dec(value).normalize(), 'f')


def date_label(value):
    return date.fromisoformat(value).strftime('%b %d, %Y')


def totals(document):
    by_kind = {'material': Decimal('0'), 'service': Decimal('0')}
    lines = []
    for row in document['lines']:
        amount = (dec(row['quantity']) * dec(row['unit_price'])).quantize(CENT, rounding=ROUND_HALF_UP)
        by_kind[row['kind']] += amount
        lines.append(amount)
    subtotal = sum(lines, Decimal('0'))
    tax = (subtotal * dec(document['tax']['rate'])).quantize(CENT, rounding=ROUND_HALF_UP)
    total = subtotal + tax
    paid = dec(document.get('payments_applied', '0')).quantize(CENT)
    return dict(by_kind=by_kind, lines=lines, subtotal=subtotal, tax=tax, total=total, paid=paid, balance=total-paid)


def validate_document(document):
    if document['status'] != 'sample':
        raise ValueError('This review-sample tool only renders explicitly marked SAMPLE documents.')
    if document['type'] not in ('quote', 'invoice'):
        raise ValueError('Document type must be quote or invoice.')
    if document['currency'] != 'USD':
        raise ValueError('This sample formatter is configured for USD; adapt the formatter before changing currency.')
    for field in ('document_id', 'business_id', 'number', 'issue_date', 'revision', 'lines'):
        if not document.get(field):
            raise ValueError(f'Missing document field: {field}')
    if not re.fullmatch(r'HH-(QTE|INV)-2026-\d{6}', document['number']):
        raise ValueError('The sample number must follow the declared HouseHull format.')
    if (document['type'] == 'quote') != ('-QTE-' in document['number']):
        raise ValueError('Quote and invoice numbering namespaces must match the document type.')
    date.fromisoformat(document['issue_date'])
    if int(document['revision']) < 1:
        raise ValueError('Revision must be positive.')
    if not document['lines']:
        raise ValueError('A sample must have at least one line.')
    ids = set()
    for row in document['lines']:
        if row['line_id'] in ids:
            raise ValueError('Duplicate line ID.')
        ids.add(row['line_id'])
        if row['kind'] not in ('material', 'service'):
            raise ValueError('Unknown line kind.')
        if not row['part_or_service_number'].startswith('DEMO-'):
            raise ValueError('All identifiers in these examples must be clearly fictional DEMO codes.')
        if dec(row['quantity']) <= 0 or dec(row['unit_price']) < 0:
            raise ValueError('Invalid quantity or price.')
        if not row['unit'] or not row['description'] or not row['specification']:
            raise ValueError('Each line needs an ordering/billing unit, description and specification.')
        if row['kind'] == 'material' and not row.get('package_specification'):
            raise ValueError('Physical material needs explicit pack or stock-size information.')
    if dec(document['tax']['rate']) < 0:
        raise ValueError('Invalid sample tax rate.')
    if document['type'] == 'invoice':
        ref = document.get('related_quote', {})
        if not ref.get('document_id') or not ref.get('number') or not ref.get('revision'):
            raise ValueError('The invoice sample must reference the exact quote revision.')
        date.fromisoformat(document['due_date'])
    else:
        date.fromisoformat(document['valid_until'])


def styles():
    return {
        'body': ParagraphStyle('body', fontName=BODY, fontSize=9, leading=12, textColor=INK),
        'small': ParagraphStyle('small', fontName=BODY, fontSize=8, leading=11, textColor=MUTED),
        'desc': ParagraphStyle('desc', fontName=BODY, fontSize=8.6, leading=10.5, textColor=INK),
        'code': ParagraphStyle('code', fontName=CODE, fontSize=8.2, leading=10, textColor=INK),
        'num': ParagraphStyle('num', fontName=BODY, fontSize=9, leading=11, textColor=INK, alignment=TA_RIGHT),
        'unit': ParagraphStyle('unit', fontName=BODY, fontSize=8.4, leading=11, textColor=INK),
        'th': ParagraphStyle('th', fontName=BOLD, fontSize=7.7, leading=10, textColor=colors.white),
        'thr': ParagraphStyle('thr', fontName=BOLD, fontSize=7.7, leading=10, textColor=colors.white, alignment=TA_RIGHT),
        'band': ParagraphStyle('band', fontName=BOLD, fontSize=8.1, leading=10, textColor=TEAL),
        'bandr': ParagraphStyle('bandr', fontName=BOLD, fontSize=8.1, leading=10, textColor=TEAL, alignment=TA_RIGHT),
        'label': ParagraphStyle('label', fontName=BOLD, fontSize=8, leading=11, textColor=INK),
        'total': ParagraphStyle('total', fontName=BOLD, fontSize=10, leading=13, textColor=NAVY),
        'totalr': ParagraphStyle('totalr', fontName=BOLD, fontSize=13, leading=15, textColor=NAVY, alignment=TA_RIGHT),
    }


def p(value, style):
    return Paragraph(escape(str(value)), style)


def page_header(canvas, document, profile, first=True):
    canvas.saveState()
    canvas.setTitle(f"{profile['name']} - {document['type'].title()} {document['number']} - SAMPLE")
    canvas.setAuthor(profile['name'])
    canvas.setSubject('Illustrative quote/invoice layout; fictional item codes and sample amounts.')
    canvas.setFillColor(NAVY)
    canvas.setFont(BOLD, 26)
    canvas.drawString(M, 751, profile['name'])
    canvas.setFont(BOLD, 25)
    canvas.drawRightString(W-M, 751, document['type'].upper())
    canvas.setFont(CODE, 10.5)
    canvas.drawRightString(W-M, 731, document['number'])
    canvas.setFillColor(MUTED)
    canvas.setFont(BODY, 9)
    canvas.drawString(M, 731, profile['tagline'])
    canvas.setFont(BODY, 7.8)
    canvas.drawString(M, 718, profile['address'])
    canvas.drawString(M, 705, profile['contact'])
    canvas.setFont(BODY, 8.5)
    canvas.drawRightString(W-M, 715, f"Issued {date_label(document['issue_date'])}  |  Revision {document['revision']}")
    canvas.setStrokeColor(RULE)
    canvas.line(M, 698, W-M, 698)
    canvas.setFillColor(SAMPLE_BG)
    canvas.roundRect(M, 674, WIDTH, 19, 3, stroke=0, fill=1)
    canvas.setFillColor(GOLD)
    canvas.setFont(BOLD, 7.8)
    canvas.drawString(M+9, 680.5, 'SAMPLE FOR REVIEW - NOT FOR ORDERING OR PAYMENT')
    canvas.setFont(BODY, 7.8)
    canvas.drawRightString(W-M-9, 680.5, 'USD')

    if first:
        def label(x, text):
            canvas.setFillColor(TEAL)
            canvas.setFont(BOLD, 7.6)
            canvas.drawString(x, 655, text)
        label(M, 'BILL TO' if document['type']=='invoice' else 'PREPARED FOR')
        label(220, 'PROJECT / PROPERTY')
        label(410, 'DOCUMENT DETAILS')
        customer = document['customer']
        canvas.setFillColor(INK)
        canvas.setFont(BOLD, 9.2)
        canvas.drawString(M, 638, customer['name'])
        canvas.setFont(BODY, 8.4)
        canvas.drawString(M, 623, customer['address'][0])
        canvas.drawString(M, 609, customer['address'][1])
        canvas.setFont(BOLD, 9.2)
        canvas.drawString(220, 638, document['job']['label'])
        canvas.setFont(BODY, 8.1)
        canvas.drawString(220, 623, document['job']['id'])
        canvas.drawString(220, 609, 'Property: same as customer address')
        if document['type'] == 'invoice':
            canvas.setFont(BODY, 8.1)
            canvas.drawString(410, 638, 'Sample terms: Net 15')
            canvas.drawString(410, 623, 'Due '+date_label(document['due_date']))
            canvas.setFont(BODY, 7.5)
            canvas.drawString(410, 610, 'Related quote / revision '+str(document['related_quote']['revision']))
            canvas.setFont(CODE, 7.5)
            canvas.drawString(410, 599, document['related_quote']['number'])
        else:
            canvas.setFont(BODY, 8.1)
            canvas.drawString(410, 638, 'Sample validity: 30 days')
            canvas.drawString(410, 623, 'Valid through '+date_label(document['valid_until']))
            canvas.setFont(BODY, 7.8)
            canvas.drawString(410, 609, 'Prepared by: Sample Estimator')

    canvas.setStrokeColor(RULE)
    canvas.line(M, 35, W-M, 35)
    canvas.setFillColor(MUTED)
    canvas.setFont(BODY, 7.1)
    canvas.drawString(M, 22, profile['name']+'  |  '+document['number']+'  |  Sample revision '+str(document['revision']))
    canvas.drawRightString(W-M, 22, 'Page '+str(canvas.getPageNumber()))
    canvas.restoreState()


def item_table(document, sums, st):
    rows = [[p('Part / service no.', st['th']), p('Material / description', st['th']), p('Qty', st['thr']), p('Unit', st['th']), p('Unit price', st['thr']), p('Amount', st['thr'])]]
    heights = [23]
    commands = [
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]
    for kind, label in [('material','MATERIALS'),('service','LABOR & SERVICES')]:
        group = [(row, sums['lines'][i]) for i,row in enumerate(document['lines']) if row['kind']==kind]
        if not group:
            continue
        band_index = len(rows)
        rows.append([p(label, st['band']), '', '', '', '', p(money(sums['by_kind'][kind]), st['bandr'])])
        heights.append(17)
        commands += [('SPAN',(0,band_index),(4,band_index)),('BACKGROUND',(0,band_index),(-1,band_index),PALE)]
        for row, amount in group:
            row_index = len(rows)
            description = Paragraph(escape(row['description'])+'<br/><font size="7.5" color="#5B6C70">'+escape(row['specification'])+'</font>',st['desc'])
            rows.append([p(row['part_or_service_number'],st['code']),description,p(quantity(row['quantity']),st['num']),p(row['unit'],st['unit']),p(money(row['unit_price']),st['num']),p(money(amount),st['num'])])
            heights.append(26)
            commands += [('LINEBELOW',(0,row_index),(-1,row_index),0.4,RULE)]
    table = LongTable(rows,colWidths=[111,197,39,42,70,81],rowHeights=heights,repeatRows=1,hAlign='LEFT')
    table.setStyle(TableStyle(commands))
    return table


def summary(document, sums, st):
    notes = Paragraph('<b>NOTES</b><br/>'+escape(document['scope'])+'<br/><br/>'+
        'DEMO codes, quantities, pack sizes and prices are illustrative. Replace them with verified supplier parts and job quantities. '+
        'Material quantities use the ordering unit shown; service codes are billing references.<br/><br/>'+
        'Tax is set to 0% only for this preview. Sample terms are for layout review.',st['small'])
    rows = [
        [p('Subtotal',st['body']),p(money(sums['subtotal']),st['num'])],
        [p('Sample tax (0%)',st['body']),p(money(sums['tax']),st['num'])],
    ]
    if document['type']=='invoice':
        rows += [
            [p('Invoice total',st['body']),p(money(sums['total']),st['num'])],
            [p('Payments applied',st['body']),p(money(sums['paid']),st['num'])],
            [p('Balance due',st['total']),p(money(sums['balance']),st['totalr'])],
        ]
    else:
        rows += [[p('Quote total',st['total']),p(money(sums['total']),st['totalr'])]]
    right = Table(rows,colWidths=[131,91],rowHeights=[19]*(len(rows)-1)+[29],hAlign='RIGHT')
    right.setStyle(TableStyle([
        ('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LINEABOVE',(0,-1),(-1,-1),1,TEAL),
        ('TOPPADDING',(0,-1),(-1,-1),7),
    ]))
    outer = Table([[notes,'',right]],colWidths=[294,24,222],hAlign='LEFT')
    outer.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0)]))
    return KeepTogether([Spacer(12,13),outer])


def render_document(document, profile, path):
    validate_document(document)
    sums = totals(document)
    st = styles()
    pdf = BaseDocTemplate(str(path),pagesize=letter,leftMargin=M,rightMargin=M,topMargin=196,bottomMargin=42,title=document['number'],author=profile['name'])
    first = Frame(M,42,WIDTH,550,leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0,id='first')
    later = Frame(M,42,WIDTH,621,leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0,id='later')
    pdf.addPageTemplates([
        PageTemplate(id='first',frames=[first],onPage=lambda c,d:page_header(c,document,profile,True),autoNextPageTemplate='later'),
        PageTemplate(id='later',frames=[later],onPage=lambda c,d:page_header(c,document,profile,False)),
    ])
    story = [
        p('Scope: '+document['scope'],st['body']),Spacer(12,9),
        Paragraph('<b>ITEMIZED DETAILS</b> - unit prices match the ordering / billing unit.',st['small']),Spacer(12,5),
        item_table(document,sums,st),summary(document,sums,st),
    ]
    pdf.build(story)
    return sums


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data',type=Path,default=ROOT/'sample_documents.json')
    parser.add_argument('--output',type=Path,default=ROOT/'output')
    args=parser.parse_args()
    data=json.loads(args.data.read_text())
    args.output.mkdir(parents=True,exist_ok=True)
    seen_ids=set(); seen_numbers=set(); results=[]
    for document in data['documents']:
        if document['document_id'] in seen_ids or document['number'] in seen_numbers:
            raise ValueError('Sample documents must have unique IDs and human-readable numbers.')
        seen_ids.add(document['document_id']); seen_numbers.add(document['number'])
        profile=data['business_profiles'][document['business_id']]
        filename='HouseHull-Sample-'+document['type'].title()+'.pdf'
        sums=render_document(document,profile,args.output/filename)
        results.append({'path':str((args.output/filename).resolve()),'number':document['number'],'materials':money(sums['by_kind']['material']),'services':money(sums['by_kind']['service']),'subtotal':money(sums['subtotal']),'tax':money(sums['tax']),'total':money(sums['total']),'balance':money(sums['balance'])})
    print(json.dumps(results,indent=2))


if __name__=='__main__':
    main()
