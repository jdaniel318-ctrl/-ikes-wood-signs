"""Run the shipped ScheduleJoe controller in an isolated Chromium fixture with fictional records."""
import json
import os
from pathlib import Path
import shutil
import sys
from playwright.sync_api import sync_playwright, expect

ROOT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(__file__).resolve().parent
origin = 'http://127.0.0.1:8173'
prefix = 'bootstrapBuildProjectScheduleV1:'
source = (ROOT / 'captain.js').read_text()
start = source.index(';(()=>{', source.index('/* 8.8.13 Project Roster'))
end = source.index('// v2.9.61', start)
controller = source[start:end]

def lot(unit):
    def task(key, label, vendor, day, kind):
        return dict(id=key, title=label, vendor=vendor, start=day, duration=1,
                    trade='Fixture', type=kind, baselineStart=day, plannedDuration=1)
    return dict(projectId='1234-'+unit, version=5, planningWeeks=12, revision=1,
                planStart='2026-11-02', updatedAt='2026-11-01T12:00:00Z',
                acceleratedDays=[], activity=[], tasks=[
                    task('pipe','Plumbing rough-in','Demo Pipe Crew',4,'work'),
                    task('check','Rough inspection '+unit,'Demo Inspector',5,'inspection'),
                    task('valves','Valve setting','Demo Pipe Crew',5,'work')])

def scenario(browser, width, height, interior_plan=False):
    ctx = browser.new_context(viewport=dict(width=width,height=height), locale='en-US',
                              timezone_id='America/New_York',service_workers='block')
    def serve(route):
        path = route.request.url.removeprefix(origin)
        if path == '/':
            return route.fulfill(content_type='text/html',body='<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/styles.css"><section id="watchWorkspace"><button data-schedulejoe-open>Open schedules</button></section>')
        if path == '/styles.css':
            return route.fulfill(path=str(ROOT/'styles.css'),content_type='text/css')
        if path.startswith('/bootstrap_build_') and (ROOT/path[1:]).is_file():
            return route.fulfill(path=str(ROOT/path[1:]))
        route.abort()
    ctx.route('**/*',serve)
    p = ctx.new_page()
    p.set_default_timeout(5000)
    def launch():
        p.evaluate("""() => {
          window.BlackFlagV3Identity={productionAuth:{readClientConfig:()=>({})}};
          window.DarkSkySupabase={create:()=>({readSession:()=>({user:{id:'demo-manager'}})})};
          window.__darkSkyVerifiedRelease={build:'fixture'};
          window.DarkSkyAdmiralIdentityStatus=async()=>true;
          window.DarkSkyAdmiralSession={status:()=>({reusable:true,startedAt:1})};
        }""")
        p.add_script_tag(content=controller)
        p.get_by_text('Open schedules',exact=True).click()
    def open_lot(unit):
        p.locator('[data-open-project="1234-'+unit+'"]').click()
    def edit(key):
        p.locator('[data-task-id="'+key+'"]:visible, [data-edit-task="'+key+'"]:visible').first.click()
        expect(p.locator('#joeEditor')).to_be_visible()
    def read(unit):
        return p.evaluate('(key)=>localStorage.getItem(key)',prefix+'1234-'+unit)
    p.goto(origin)
    for unit in ('A','B'):
        p.evaluate('([k,v])=>localStorage.setItem(k,v)',[prefix+'1234-'+unit,json.dumps(lot(unit))])
    a,b=read('A'),read('B')
    if interior_plan:
        plan=lot('A')
        plan['planStart']='2026-12-07'
        pipe,check,later=plan['tasks']
        pipe.update(duration=3,area='interior')
        check.update(start=9,area='interior',duration=2,title='Rough trade inspections')
        later.update(start=6,title='Electrical rough-in',duration=3,area='interior')
        for i in range(11):
            plan['tasks'].append(dict(later,id='inside-'+str(i),title='Interior finish '+str(i),start=11+i))
        plan['tasks'].append(dict(later,id='outside',title='Driveway',area='exterior',start=18))
        p.evaluate('([k,v])=>localStorage.setItem(k,v)',[prefix+'1234-A',json.dumps(plan)])
        before=read('A')
        launch();open_lot('A');edit('pipe')
        p.locator('#bootstrapScheduleDay').fill('2026-12-18')
        p.locator('#deskSave').click();p.locator('#joeAdjust').click()
        summary=p.locator('#joeMoveSummary')
        expect(summary).to_contain_text('Fri, Dec 25, 2026')
        expect(summary).to_contain_text('conflict cleared')
        expect(p.locator('#joeMove')).not_to_contain_text('Interior finish')
        assert read('A')==before
        p.locator('[data-move-scope=exterior]').click()
        expect(summary).to_contain_text('still at risk');expect(summary).to_contain_text('Fri, Dec 18')
        p.locator('[data-move-scope=interior]').click()
        p.locator('#joeApply').click()
        expect(p.locator('#bootstrapScheduleStatus')).to_contain_text('Saved on this device')
        after=json.loads(read('A'))
        wanted={t['id'] for t in plan['tasks'] if t['area']=='interior'}
        assert len(wanted)==14 and len(after['activity'])==14
        assert {n['taskId'] for n in after['vendorNotices']}==wanted
        starts={t['id']:t['start'] for t in after['tasks']}
        assert all(starts[t['id']]==t['start']+(5 if t['id'] in wanted else 0) for t in plan['tasks'])
        assert read('B')==b
        print(f'PASS {width}x{height}: 14 interior tasks adjusted, inspection date summarized, exterior and sibling lot preserved')
        ctx.close()
        return
    launch();open_lot('A');edit('pipe')
    day = p.locator('#bootstrapScheduleDay')
    expect(day).to_have_value('2026-11-06')
    day.fill('2026-11-07')
    expect(p.locator('#deskSave')).to_be_disabled()
    day.fill('2026-11-09')
    expect(p.locator('#deskSave')).to_be_enabled()
    expect(p.locator('#deskTaskWarning')).to_contain_text('Valve setting')
    # The inspector is a different crew. The editor must still flag the booking.
    editor=p.locator('#joeEditor')
    expect(editor).to_contain_text('Rough inspection A',timeout=1200)
    expect(editor).not_to_contain_text('Rough inspection B')
    impact=p.locator('#deskMoveImpact')
    expect(impact).to_contain_text('Fri, Nov 6')
    expect(impact).to_contain_text('Mon, Nov 9')
    expect(impact).to_contain_text('Demo Pipe Crew')
    assert editor.evaluate('(e)=>e.scrollWidth<=e.clientWidth+1')
    assert (a,b)==(read('A'),read('B'))
    day.fill('2026-11-10')
    expect(impact).to_contain_text('past')
    day.fill('2026-11-05')
    expect(impact).to_contain_text('Next inspection')
    day.fill('2026-11-07')
    expect(impact).to_be_hidden()
    p.locator('#bootstrapScheduleCancel').click()
    assert (a,b)==(read('A'),read('B'))
    if width>720:
        card=p.locator('[data-task-id="pipe"]:visible').first
        card.press('ArrowRight')
        expect(p.locator('#joeMoveReason')).to_contain_text('Rough inspection A')
    else:
        edit('pipe');day.fill('2026-11-09')
        p.locator('#deskSave').click()
    expect(p.locator('#joeMoveReason')).to_contain_text('Nov 9')
    p.locator('#joeAdjust').click()
    expect(p.locator('[data-move-scope=interior]')).to_have_attribute('aria-pressed','true')
    summary=p.locator('#joeMoveSummary')
    expect(summary).to_contain_text('clear')
    expect(summary).to_contain_text('Tue, Nov 10')
    expect(summary).not_to_contain_text('Valve setting')
    expect(summary).not_to_contain_text('Plumbing rough-in')
    expect(p.locator('#joeMoveReason')).to_be_hidden()
    expect(p.locator('#joeMoveTitle')).to_have_text('Adjust schedule')
    expect(p.locator('#joeApply')).to_have_text('Apply interior adjustment')
    p.locator('[data-move-scope=all]').click()
    expect(summary).not_to_contain_text('Valve setting')
    assert summary.evaluate('(el)=>el.scrollHeight<=el.clientHeight+1')
    p.locator('[data-move-scope=exterior]').click()
    expect(p.locator('#joeMoveSummary')).to_contain_text('still at risk')
    assert read('A')==a
    p.locator('#joeSingle').click()
    expect(p.locator('#bootstrapScheduleStatus')).to_contain_text('Saved on this device')
    saved=json.loads(read('A'));assert saved['revision']==2
    assert [t['start'] for t in saved['tasks']]==[5,5,5] and saved['acceleratedDays']==[]
    assert len(saved['activity'])==1 and read('B')==b
    # Reopen through the same launcher and verify restoration from IndexedDB alone.
    p.evaluate('(k)=>localStorage.removeItem(k)',prefix+'1234-A')
    p.reload();launch();open_lot('A');edit('pipe')
    expect(day).to_have_value('2026-11-09')
    p.locator('#bootstrapScheduleCancel').click();p.locator('#bootstrapProjectsHome').click()
    open_lot('B');edit('pipe');expect(day).to_have_value('2026-11-06')
    assert read('B')==b
    p.locator('#bootstrapScheduleCancel').click()
    p.locator('#joePrompt').check()
    edit('pipe');day.fill('2026-11-09')
    expect(impact).to_contain_text('If only this task moves')
    p.locator('#deskSave').click()
    expect(p.locator('#joeMove')).to_be_visible()
    p.locator('#joeCancel').click()
    assert read('B')==b
    p.locator('#bootstrapScheduleCancel').click()
    if width>720:
        p.locator('#joePrompt').uncheck()
        p.locator('[data-task-id="pipe"]:visible').press('ArrowLeft')
        expect(p.locator('#bootstrapScheduleStatus')).to_contain_text('Saved on this device')
        assert json.loads(read('B'))['tasks'][0]['start']==3
        expect(editor).not_to_be_visible()
        p.locator('#joeUndo').click()
        expect(p.locator('#bootstrapScheduleStatus')).to_contain_text('Move undone.')
        assert json.loads(read('B'))['tasks'][0]['start']==4
    p.locator('#joePrompt').uncheck()
    edit('check');day.fill('2026-11-05');p.locator('#deskSave').click()
    expect(p.locator('#joeMoveReason')).to_contain_text('Plumbing rough-in')
    p.locator('#joeAdjust').click()
    p.locator('[data-move-scope=all]').click()
    p.locator('#joeApply').click()
    expect(p.locator('#bootstrapScheduleStatus')).to_contain_text('Saved on this device')
    saved_b=json.loads(read('B'))
    assert [t['start'] for t in saved_b['tasks']]==[4,3,3]
    assert {item['task'] for item in saved_b['activity'][:2]}=={'Rough inspection B','Valve setting'}
    assert {item['taskId'] for item in saved_b['vendorNotices'][-2:]}=={'check','valves'}

    ctx.close()
    print(f'PASS {width}x{height}: weekday edit, crew and inspection preview, cancel, save, reload and sibling-unit isolation')

with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM') or shutil.which('chromium'),args=['--no-sandbox'])
    for viewport in [(1024,768),(390,844)]:
        scenario(browser,*viewport)
        scenario(browser,*viewport,interior_plan=True)
    browser.close()
