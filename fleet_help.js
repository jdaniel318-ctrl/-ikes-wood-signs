/* Fleet help runs only inside an authenticated host workspace. */
(function () {
  'use strict';
  const methods = Object.freeze({
    owner: 'owner_list_fleet_help',
    captain: 'vessel_captain_list_fleet_help',
    admiral: 'admiral_list_fleet_help'
  });
  const titles = {open:'Open', in_progress:'In progress', verified:'Verified'};
  const mounted = new WeakMap();

  function listMethod(role) {
    if (!Object.hasOwn(methods, role)) throw new Error('Unknown fleet-help role');
    return methods[role];
  }
  function validReply(row, project, id) {
    return !!row && typeof row.project_id === 'string' && !!row.project_id &&
      typeof row.request_id === 'string' && !!row.request_id &&
      (!project || row.project_id === project) && (!id || row.request_id === id) &&
      Number.isInteger(row.version) && row.version > 0 && Object.hasOwn(titles, row.status);
  }
  function nextActions(role, status) {
    if (role !== 'captain') return [];
    if (status === 'open') return ['in_progress'];
    return status === 'in_progress' ? ['verified'] : [];
  }
  function accessDenied(error) {
    return [401, 403].includes(error?.status) ||
      ['42501','PGRST301','PGRST302','PGRST303'].includes(error?.code) ||
      /access.denied|membership.required|authority.required|not.authorized/i.test(error?.message || '');
  }
  function errorMessage(error) {
    const code = error?.code;
    const msg = String(error?.message || error || '');
    if (code === 'PGRST202' || code === '42883' || /PGRST202|schema cache|could not find the function/i.test(msg))
      return 'Fleet help needs its database setup. Your business workspace is still available.';
    if (accessDenied(error))
      return 'Your account needs current access to this workspace. Sign in again to check access.';
    if (code === '22023')
      return 'Check the screen name, description, and any screenshot. Use a screen name without a web address.';
    if (code === '40001' || /version.conflict|stale.version/i.test(msg))
      return 'This report changed. Refresh reports to see its current status.';
    return 'Could not confirm the result. Check your connection and refresh reports.';
  }

  function element(tag, text, className) {
    const el = document.createElement(tag);
    if (text != null) el.textContent = text;
    if (className) el.className = className;
    return el;
  }
  function button(label, listener, primary) {
    const el = element('button', label, primary ? 'fh-primary' : 'fh-button');
    el.type = 'button';
    el.addEventListener('click', listener);
    return el;
  }
  function field(label, control) {
    const wrap = element('label', label);
    wrap.append(control);
    return wrap;
  }
  function dateLabel(raw) {
    const date = new Date(raw);
    return raw && Number.isFinite(date.valueOf()) ? date.toLocaleString(undefined, {dateStyle:'medium',timeStyle:'short'}) : '';
  }

  async function screenshot(file) {
    if (!file) return null;
    if (file.size > 16 * 1024 * 1024) throw new Error('Choose a screenshot smaller than 16 MB.');
    if (!['image/jpeg','image/png','image/webp'].includes(file.type))
      throw new Error('Choose a PNG, JPEG or WebP screenshot.');
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      for (const size of [1, 0.72, 0.5]) {
        canvas.width = Math.max(1, Math.round(img.width * scale * size));
        canvas.height = Math.max(1, Math.round(img.height * scale * size));
        const context = canvas.getContext('2d');
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        const result = canvas.toDataURL('image/jpeg', 0.78);
        if (result.startsWith('data:image/jpeg;base64,') && result.length <= 220000) return result;
      }
      throw new Error('Choose a smaller screenshot or remove it before sending.');
    } finally { URL.revokeObjectURL(url); }
  }

  function mount(container, options) {
    const {role, projectId, projectName, screen, build, rpc, isCurrent} = options;
    const read = listMethod(role);
    if (typeof rpc !== 'function' || typeof isCurrent !== 'function' || (role !== 'admiral' && !projectId))
      throw new Error('Fleet help needs an authenticated workspace');
    mounted.get(container)?.();
    let active = true;
    let loadVersion = 0;
    let received = [];
    const current = () => active && container.isConnected && isCurrent();
    const panel = element('details', null, 'fleet-help');
    const heading = role === 'owner' ? 'Get fleet help' : 'Fleet help';
    panel.append(element('summary', heading));
    const body = element('div', null, 'fh-body');
    panel.append(body);
    const live = () => {
      const node = element('p', '', 'fh-status');
      node.setAttribute('role','status');
      node.setAttribute('aria-live','polite');
      return node;
    };
    const message = live();
    const listState = live();
    const records = element('div', null, 'fh-records');

    async function request(name, args) {
      try {
        return await rpc(name, args);
      } catch (error) {
        if (accessDenied(error) && current()) {
          destroy();
          const notice = live();
          notice.textContent = errorMessage(error);
          container.replaceChildren(notice);
        }
        throw error;
      }
    }

    function addComposer() {
      const editor = element('div', null, 'fh-editor');
      const where = element('input');
      where.type='text'; where.value = String(screen || 'Owner workspace').slice(0,80); where.maxLength=80;
      const description = element('textarea');
      description.rows = 3; description.maxLength = 1200;
      const attachment = element('input');
      attachment.type='file'; attachment.accept='image/png,image/jpeg,image/webp';
      const extra = element('details', null, 'fh-attachment');
      extra.append(element('summary','Add a screenshot'),field('Choose image', attachment),
        element('small','Choose an image the vessel’s owner and Captain can see. Crop out customer details.'));
      const receipt = element('small', [projectName, build && 'Build ' + build].filter(Boolean).join(' · '));
      const send = button('Send report', submit, true);
      editor.append(receipt,field('Where did it happen?',where),element('small','The Admiral can see this screen name.'),field('What happened?',description),extra,send);
      body.append(editor,message);
      let sending = false;
      let pending = null;

      async function submit() {
        if (sending || !current()) return;
        if (!description.value.trim() || !where.value.trim()) {
          message.textContent = 'Enter the screen and a short description.';
          (!where.value.trim() ? where : description).focus();
          return;
        }
        if (/[\u0000-\u001F\u007F?#%@<>:]/.test(where.value.trim())) {
          message.textContent = 'Enter a screen name, such as Orders or Settings.'; where.focus(); return;
        }
        sending = true;
        send.disabled = true;
        where.disabled = description.disabled = attachment.disabled = true;
        let reachedService = false;
        try {
          if (!pending) {
            const photo = await screenshot(attachment.files[0]);
            if (!current()) return;
            pending = {p_project_id:projectId,p_request_id:crypto.randomUUID(),p_screen:where.value.trim(),
              p_build:String(build || 'unknown').slice(0,80),p_description:description.value.trim(),p_attachment:photo};
          }
          message.textContent = 'Sending report…';
          reachedService = true;
          const result = await request('owner_create_fleet_help', pending);
          if (!current()) return;
          if (!validReply(result, projectId, pending.p_request_id)) throw new Error('Unexpected receipt');
          message.textContent = 'Report saved for this vessel. Its appointed Captain can review it.';
          pending = null;
          description.value=''; attachment.value=''; extra.open=false;
          await refresh();
        } catch (err) {
          if (current()) {
            message.textContent = reachedService ? errorMessage(err) : (err?.message || 'Could not read the screenshot.');
            if (pending) {
              if (['PGRST202','42883','42501','22023'].includes(err?.code)) pending=null;
              else message.textContent += ' You can send the same report again using its original reference.';
            }
          }
        } finally {
          sending = false;
          if (current()) {
            send.disabled=false;
            send.textContent=pending ? 'Retry same report' : 'Send report';
            where.disabled=description.disabled=attachment.disabled=!!pending;
          }
        }
      }
    }

    function renderRow(row) {
      const item = element('article', null, 'fh-record');
      const line = element('div', null, 'fh-line');
      line.append(element('strong', role === 'admiral' ? row.project_name || row.project_id : row.screen),
        element('span', titles[row.status], 'fh-badge fh-'+row.status));
      const metadata = [role === 'admiral' ? row.screen : '',row.build && 'Build '+row.build,dateLabel(row.updated_at)].filter(Boolean);
      item.append(line, element('small',metadata.join(' · ')));
      if (role !== 'admiral' && row.description) item.append(element('p',row.description));
      if (row.outcome) item.append(element('p','Verification note · '+row.outcome));
      if (role !== 'admiral' && row.has_attachment) {
        const view = button('View screenshot', async () => {
          if (!current()) return;
          view.disabled=true;
          try {
            const result=await request('fleet_help_read_attachment',{p_project_id:projectId,p_request_id:row.request_id});
            if (!current() || !item.isConnected) return;
            if (result?.request_id!==row.request_id || typeof result.attachment!=='string' ||
                result.attachment.length>220000 || !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(result.attachment)) throw new Error('Attachment unavailable');
            const img=element('img'); img.alt='Screenshot attached to this report'; img.src=result.attachment;
            view.replaceWith(img);
          } catch (err) { if (current()) { listState.textContent=errorMessage(err); view.disabled=false; } }
        });
        item.append(view);
      }
      for (const action of nextActions(role,row.status)) {
        const verify=action==='verified';
        const note=verify ? element('textarea') : null;
        if (note) {
          note.rows=2; note.maxLength=600;
          item.append(field('How was the fix checked?',note),element('small','The owner and Admiral can read this note. Leave out customer details.'));
        }
        const change=button(verify?'Verify outcome':'Start work', async () => {
          if (!current() || change.disabled) return;
          const outcome=note?.value.trim() || '';
          if (verify && outcome.length<8) {
            listState.textContent='Describe the check and its result in at least eight characters.'; note.focus(); return;
          }
          change.disabled=true;
          try {
            const result=await request('vessel_captain_update_fleet_help',{p_project_id:projectId,p_request_id:row.request_id,p_version:row.version,p_status:action,p_outcome:outcome});
            if (!current()) return;
            if (!validReply(result,projectId,row.request_id) || result.status!==action) throw new Error('Unexpected receipt');
            await refresh();
            if (current()) message.textContent = verify?'Verification recorded.':'Work started.';
          } catch(err) { if (current()) {listState.textContent=errorMessage(err); change.disabled=false;} }
        },true);
        item.append(change);
      }
      return item;
    }
    async function refresh() {
      if (!current()) return;
      const version=++loadVersion;
      listState.textContent='Loading reports…';
      try {
        const response=await request(read,role==='admiral'?{}:{p_project_id:projectId});
        if (!current() || version!==loadVersion) return;
        if (!Array.isArray(response?.records) || !response.records.every(row=>validReply(row,role==='admiral'?'':projectId)))
          throw new Error('Unexpected report list');
        received=response.records;
        records.replaceChildren(...received.map(renderRow));
        listState.textContent = received.length ? '' : 'No fleet help reports yet.';
        if (response.has_more) listState.textContent = 'Showing the most recent reports.';
      } catch (err) {
        if (!current() || version!==loadVersion) return;
        received=[]; records.replaceChildren(); listState.textContent=errorMessage(err);
      }
    }
    if (role==='owner') addComposer();
    else body.append(message);
    const listHeading = element('div',null,'fh-line');
    listHeading.append(element('strong',role==='admiral'?'Fleet outcomes':role==='captain'?'Vessel reports':'Recent reports'),
      button('Refresh reports',refresh));
    body.append(listHeading,listState,records);
    panel.addEventListener('toggle',()=>{ if(panel.open) refresh(); });
    container.replaceChildren(panel);
    if (role === 'owner') panel.open = true;
    function destroy() {
      active=false; ++loadVersion; received=[];
      panel.remove(); if (mounted.get(container)===destroy) mounted.delete(container);
    }
    mounted.set(container,destroy);
    return destroy;
  }
  const api=Object.freeze({mount,listMethod,validReply,nextActions,errorMessage});
  if (typeof window!=='undefined') window.DarkSkyFleetHelp=api;
  if (typeof module!=='undefined' && module.exports) module.exports=api;
})();
