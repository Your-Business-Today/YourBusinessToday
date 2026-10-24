/* The JPMS component vocabulary as string builders. Each helper mirrors a jpms component:
   PageHeader, TabRow, FilterChips, Panel, Pill, Notice, MetricStat, MetaRow, the data-table. */
window.JPMS = window.JPMS || {};

(function () {
  const escape = (text) => String(text ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const join = (parts) => (Array.isArray(parts) ? parts.filter(Boolean).join('') : parts || '');

  const ui = {
    escape,
    join,

    icon(key, size) {
      const path = JPMS.icons[key] || JPMS.icons['#fallback'];
      return `<svg class="icon ${size ? 'icon-' + size : ''}" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
    },

    svg(path, size) {
      return `<svg class="icon ${size ? 'icon-' + size : ''}" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
    },

    jewel(size = 20) {
      return `<svg width="${size}" height="${size}" viewBox="0 0 530 460" fill="none" stroke="currentColor" stroke-width="34" aria-hidden="true"><path d="M 140 30 L 390 30 L 510 175 L 265 430 L 20 175 Z"/><path d="M 55 175 L 475 175"/><path d="M 185 30 L 185 175"/><path d="M 345 30 L 345 175"/><path d="M 185 175 L 265 430"/><path d="M 345 175 L 265 430"/></svg>`;
    },

    money(amount, options = {}) {
      if (amount === null || amount === undefined || amount === '') return '—';
      const isNegative = amount < 0;
      const digits = options.pence ? 2 : 0;
      const text = '£' + Math.abs(amount).toLocaleString('en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits });
      return isNegative ? `(${text})` : text;
    },

    percent(value, digits = 1) {
      return `${Number(value).toFixed(digits)}%`;
    },

    link(text, href) {
      return `<a class="link" href="${href}">${text}</a>`;
    },

    mono(text) {
      return `<span class="mono">${escape(text)}</span>`;
    },

    pill(text, tone, options = {}) {
      const toneClass = tone ? `pill-${tone}` : '';
      const dot = options.dot ? '<span class="dot"></span>' : '';
      const caret = options.caret ? '<span>▾</span>' : '';
      return `<span class="pill ${toneClass}">${dot}${escape(text)}${caret}</span>`;
    },

    btn(label, kind = 'secondary', options = {}) {
      const icon = options.icon ? ui.svg(options.icon, 'sm') : '';
      const href = options.href ? ` data-href="${options.href}"` : '';
      return `<button type="button" class="btn btn-${kind} ${options.class || ''}"${href}>${icon}${escape(label)}</button>`;
    },

    iconBtn(path, title) {
      return `<button type="button" class="btn-icon" title="${escape(title)}">${ui.svg(path, 'sm')}</button>`;
    },

    header({ eyebrow, title, subtitle, actions, primary } = {}) {
      const eyebrowHtml = eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : '';
      const titleHtml = title ? `<h1>${title}</h1>` : '';
      const subtitleHtml = subtitle ? `<p class="subtitle">${subtitle}</p>` : '';
      const primaryHtml = primary ? ui.btn(primary, 'primary') : '';
      const actionsHtml = actions || primary ? `<div class="actions">${join(actions)}${primaryHtml}</div>` : '';
      return `<header class="page-header"><div>${eyebrowHtml}${titleHtml}${subtitleHtml}</div>${actionsHtml}</header>`;
    },

    tabs(tabs, activeIndex = 0) {
      const items = tabs.map((tab, index) => {
        const label = typeof tab === 'string' ? tab : tab.label;
        const href = typeof tab === 'string' ? '' : tab.href || '';
        const count = tab.count !== undefined ? `<span class="chip-count">${tab.count}</span>` : '';
        const active = index === activeIndex ? ' is-active' : '';
        return `<li><a class="tab${active}" ${href ? `href="${href}"` : 'data-tab'}>${escape(label)}${count}</a></li>`;
      });
      return `<nav class="tab-row"><ul>${items.join('')}</ul></nav>`;
    },

    chips(chips, activeIndex = 0) {
      const items = chips.map((chip, index) => {
        const label = typeof chip === 'string' ? chip : chip.label;
        const count = chip.count !== undefined ? `<span class="chip-count">${chip.count}</span>` : '';
        return `<button type="button" class="chip${index === activeIndex ? ' is-active' : ''}" data-chip>${escape(label)}${count}</button>`;
      });
      return `<div class="chips">${items.join('')}</div>`;
    },

    search(placeholder = 'Search…') {
      return `<label class="search"><svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input class="field" placeholder="${escape(placeholder)}"></label>`;
    },

    toolbar(left, right) {
      return `<div class="row-between" style="margin-bottom:16px"><div class="row">${join(left)}</div><div class="row">${join(right)}</div></div>`;
    },

    panel(title, body, options = {}) {
      const header = title || options.actions ? `<header class="panel-header"><h2>${title || ''}</h2><div class="row">${join(options.actions)}</div></header>` : '';
      const bodyClass = options.flush ? 'panel-flush' : 'panel-body';
      return `<section class="panel ${options.class || ''}">${header}<div class="${bodyClass}">${join(body)}</div></section>`;
    },

    notice(title, body, tone) {
      const toneClass = tone ? `notice-${tone}` : '';
      const titleHtml = title ? `<p class="notice-title">${title}</p>` : '';
      const bodyHtml = body ? `<div class="notice-body">${body}</div>` : '';
      return `<div class="notice ${toneClass}">${titleHtml}${bodyHtml}</div>`;
    },

    stat({ label, value, delta, tone, caption }) {
      const deltaHtml = delta ? `<div class="stat-delta"><p class="tone-${tone || 'positive'}">${delta}</p>${caption ? `<p class="stat-caption">${caption}</p>` : ''}</div>` : '';
      return `<article class="stat"><div class="stat-top"><p class="stat-label">${label}</p>${deltaHtml}</div><p class="stat-value">${value}</p></article>`;
    },

    stats(stats) {
      const columns = Math.min(stats.length, 4);
      return `<div class="grid grid-${columns} grid-gap-sm">${stats.map(ui.stat).join('')}</div>`;
    },

    meta(pairs) {
      return `<dl class="meta">${pairs.map(([label, value]) => `<div><dt>${label}</dt><dd>${value ?? '—'}</dd></div>`).join('')}</dl>`;
    },

    grid(columns, items) {
      return `<div class="grid grid-${columns}">${join(items)}</div>`;
    },

    table({ columns, rows, footer, dense, hrefs, selected }) {
      const head = columns.map((column) => {
        const label = typeof column === 'string' ? column : column.label;
        return `<th class="${column.num ? 'num' : ''}">${label}</th>`;
      }).join('');
      const cell = (value, index) => {
        const column = columns[index] || {};
        return `<td class="${column.num ? 'num' : ''}">${value ?? ''}</td>`;
      };
      const body = rows.map((row, rowIndex) => {
        const href = hrefs && hrefs[rowIndex];
        const classes = [href ? 'is-clickable' : '', selected === rowIndex ? 'is-selected' : ''].join(' ');
        return `<tr class="${classes}" ${href ? `data-href="${href}"` : ''}>${row.map(cell).join('')}</tr>`;
      }).join('');
      const foot = footer ? `<tfoot><tr>${footer.map(cell).join('')}</tr></tfoot>` : '';
      return `<div class="table-wrap"><table class="data-table ${dense ? 'data-table-dense' : ''}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody>${foot}</table></div>`;
    },

    progress(percent, tone) {
      return `<div class="bar ${tone ? 'bar-' + tone : ''}"><span style="width:${Math.max(0, Math.min(100, percent))}%"></span></div>`;
    },

    empty(text) {
      return `<p class="subtle" style="padding:24px;text-align:center">${escape(text)}</p>`;
    },

    menu(label, items) {
      const entries = items.map((item) => `<a class="menu-item" href="${item.href || '#'}">${escape(item.label)}${item.hint ? `<span class="hint">${escape(item.hint)}</span>` : ''}</a>`).join('');
      return `<div class="menu" data-menu><button type="button" class="btn btn-secondary">${escape(label)} ▾</button><div class="menu-panel">${entries}</div></div>`;
    },

    field(label, value, options = {}) {
      const control = options.textarea
        ? `<textarea class="field" placeholder="${escape(options.placeholder || '')}">${escape(value || '')}</textarea>`
        : `<input class="field" value="${escape(value || '')}" placeholder="${escape(options.placeholder || '')}">`;
      return `<label style="display:block"><span class="form-label">${label}</span>${control}</label>`;
    },

    avatar(initials) {
      return `<span class="avatar">${escape(initials)}</span>`;
    }
  };

  JPMS.ui = ui;
})();
