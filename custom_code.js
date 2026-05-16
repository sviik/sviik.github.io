(() => {
  // Visitor SDK may run inside an iframe; if so, host the panel in the visible
  // top-level document. Falls back to local document if cross-origin blocks it.
  const getHostDocument = () => {
    try {
      if (window.top !== window.self && window.top.document.body) return window.top.document;
    } catch {}
    return document;
  };
  const hostDoc = getHostDocument();

  const el = (tag, styles, props) => {
    const e = hostDoc.createElement(tag);
    if (styles) Object.assign(e.style, styles);
    if (props) Object.assign(e, props);
    return e;
  };

  const buildCurl = (interactionId, accessToken) =>
    `curl '${sm.conf.api_url}/api/v2/interactions/${interactionId}/entries?maxpagesize=10000' \\\n  -H 'accept: application/vnd.salemove.private+json' \\\n  -H 'authorization: Bearer ${accessToken}' \\\n | jq`;

  const getJwtPayload = (token) => {
    try { return JSON.parse(atob(token.split('.')[1])); }
    catch { return {}; }
  };

  const HANDLE_BORDER = '1px solid #ececec';

  const createPanel = (onClose) => {
    const panel = el('div', {
      position: 'fixed', top: '50%', left: '24px', transform: 'translateY(-50%)',
      minWidth: '320px', maxWidth: '480px',
      background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '13px', color: '#222',
      zIndex: '2147483647', overflow: 'hidden',
    });

    const handle = el('div', {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '6px 8px 6px 12px',
      background: '#f5f5f5', borderBottom: HANDLE_BORDER,
      cursor: 'move', userSelect: 'none',
    });

    const grip = el('span', { color: '#aaa', letterSpacing: '1px', fontSize: '14px' });
    grip.textContent = '⠇⠇';

    const makeIconBtn = (label, text, fontSize) => {
      const btn = el('button', {
        background: 'transparent', border: 'none', lineHeight: '1',
        color: '#888', cursor: 'pointer', padding: '0 4px', fontSize,
      }, { type: 'button', textContent: text });
      btn.setAttribute('aria-label', label);
      btn.addEventListener('mouseenter', () => { btn.style.color = '#222'; });
      btn.addEventListener('mouseleave', () => { btn.style.color = '#888'; });
      return btn;
    };

    const minimizeBtn = makeIconBtn('Minimize', '−', '16px');
    const closeBtn = makeIconBtn('Close', '×', '18px');

    const body = el('div', {
      padding: '10px 12px',
      display: 'grid', gridTemplateColumns: 'auto 1fr',
      columnGap: '14px', rowGap: '6px', alignItems: 'center',
    });

    let minimized = false;
    const toggleMinimize = () => {
      minimized = !minimized;
      const rect = panel.getBoundingClientRect();
      if (panel.style.transform !== 'none') {
        panel.style.transform = 'none';
        panel.style.top = `${rect.top}px`;
      }
      if (!panel.style.width) panel.style.width = `${rect.width}px`;
      body.style.display = minimized ? 'none' : 'grid';
      handle.style.borderBottom = minimized ? 'none' : HANDLE_BORDER;
      minimizeBtn.textContent = minimized ? '+' : '−';
      minimizeBtn.setAttribute('aria-label', minimized ? 'Restore' : 'Minimize');
    };
    minimizeBtn.addEventListener('click', toggleMinimize);
    handle.addEventListener('dblclick', (e) => {
      if (actions.contains(e.target)) return;
      toggleMinimize();
    });

    const actions = el('div', { display: 'flex', alignItems: 'center', gap: '2px' });
    actions.append(minimizeBtn, closeBtn);

    handle.append(grip, actions);
    panel.append(handle, body);

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;
    const onMove = (e) => {
      if (!dragging) return;
      panel.style.left = `${e.clientX - offsetX}px`;
      panel.style.top = `${e.clientY - offsetY}px`;
    };
    const onUp = () => { dragging = false; };

    handle.addEventListener('mousedown', (e) => {
      if (actions.contains(e.target)) return;
      dragging = true;
      const rect = panel.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      panel.style.transform = 'none';
      panel.style.left = `${rect.left}px`;
      panel.style.top = `${rect.top}px`;
      e.preventDefault();
    });
    hostDoc.addEventListener('mousemove', onMove);
    hostDoc.addEventListener('mouseup', onUp);

    closeBtn.addEventListener('click', () => {
      hostDoc.removeEventListener('mousemove', onMove);
      hostDoc.removeEventListener('mouseup', onUp);
      panel.remove();
      onClose?.();
    });

    hostDoc.body.appendChild(panel);
    return body;
  };

  const setRow = (body, label, value, display) => {
    let valueEl = body.querySelector(`a[data-row="${label}"]`);
    if (!valueEl) {
      const labelEl = el('div', { color: '#555', whiteSpace: 'nowrap' });
      labelEl.textContent = label;

      valueEl = el('a', {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: '12px',
        textDecoration: 'none',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }, { href: '#' });
      valueEl.dataset.row = label;
      valueEl.addEventListener('mouseenter', () => {
        if (valueEl.dataset.copyValue) valueEl.style.textDecoration = 'underline';
      });
      valueEl.addEventListener('mouseleave', () => { valueEl.style.textDecoration = 'none'; });
      valueEl.addEventListener('click', (e) => {
        e.preventDefault();
        const v = valueEl.dataset.copyValue;
        if (v) navigator.clipboard.writeText(v);
      });
      body.append(labelEl, valueEl);
    }

    const hasValue = Boolean(value);
    valueEl.textContent = hasValue ? (display ?? value) : '-';
    valueEl.dataset.copyValue = value || '';
    valueEl.style.color = hasValue ? '#0366d6' : '#aaa';
    valueEl.style.cursor = hasValue ? 'pointer' : 'default';
    valueEl.title = hasValue && !display ? value : '';
  };

  let body = createPanel(() => { body = null; });

  ['Site ID', 'Visitor ID', 'Account ID', 'Visitor code',
   'Engagement ID', 'Interaction ID', 'Operator ID', 'Access token', 'Transcript curl',
  ].forEach(label => setRow(body, label, ''));

  sm.getApi({ version: 'v1' }).then((glia) => {
    const update = (rows) => {
      if (!body) return;
      rows.forEach(([label, value, display]) => setRow(body, label, value, display));
    };

    update([
      ['Site ID', glia.getSiteId()],
      ['Visitor ID', glia.getVisitorId()],
      ['Account ID', getJwtPayload(sm.accessToken).account_id],
      ['Visitor code', ''],
      ['Engagement ID', ''],
      ['Interaction ID', ''],
      ['Operator ID', ''],
      ['Access token', sm.accessToken, '[access-token]'],
      ['Transcript curl', '', '[curl]'],
    ]);

    glia.omnibrowse.getVisitorCode().then((r) => update([['Visitor code', r.code]]));

    glia.addEventListener(glia.EVENTS.ENGAGEMENT_START, (e) => update([
      ['Engagement ID', e.engagementId],
      ['Interaction ID', e.interactionId],
      ['Operator ID', e.operator?.id],
      ['Transcript curl', buildCurl(e.interactionId, sm.accessToken), '[curl]'],
    ]));

    glia.addEventListener(glia.EVENTS.ENGAGEMENT_END, () => {
      update([
        ['Engagement ID', ''],
        ['Interaction ID', ''],
        ['Operator ID', ''],
        ['Transcript curl', '', '[curl]'],
      ]);
      glia.omnibrowse.getVisitorCode().then((r) => update([['Visitor code', r.code]]));
    });
  });
})();
