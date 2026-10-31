
'use strict';
const initial = [
  {id:'maersk',name:'Maersk Line',domain:'Maersk line.com',kind:'carrier',category:'Ocean',icon:'ship',description:'AI-powered document generation and management',status:'connected'},
  {id:'lufthansa',name:'Maersk Line',domain:'Maersk line.com',kind:'carrier',category:'Air',icon:'plane',description:'AI-powered document generation and management',status:'syncing'},
  {id:'msc',name:'Maersk Line',domain:'Maersk line.com',kind:'carrier',category:'Ocean',icon:'ship',description:'AI-powered document generation and management',status:'errors'},
  {id:'salesforce',name:'Salesforce CRM',kind:'system',category:'CRM',logo:'salesforce',letters:'cloud',description:'Customer relationship management',status:'connected'},
  {id:'sap',name:'SAP TMS',kind:'system',category:'TMS',logo:'sap',letters:'SAP',description:'Transportation management system',status:'connected'},
  {id:'oracle',name:'Oracle ERP',kind:'system',category:'ERP',logo:'oracle',letters:'ORACLE',description:'Enterprise resource planning',status:'syncing'},
  {id:'dynamics',name:'Microsoft Dynamics',kind:'system',category:'ERP',logo:'dynamics',letters:'D',description:'Business applications',status:'errors'},
  {id:'slack',name:'Slack',kind:'system',category:'Communication',logo:'slack',letters:'#',description:'Team communication',status:'connected'},
  {id:'shopify',name:'Shopify',kind:'system',category:'E-commerce',logo:'shopify',letters:'S',description:'E-commerce platform',status:'connected'},
  {id:'cma',name:'CMA CGM',domain:'cma-cgm.com',kind:'carrier',category:'Ocean',icon:'ship',description:'Shipping schedules and container tracking.',status:'available'},
  {id:'hapag',name:'Hapag-Lloyd',domain:'hapag-lloyd.com',kind:'carrier',category:'Ocean',icon:'ship',description:'Container transport and shipment events.',status:'available'},
  {id:'dhl',name:'DHL Express',domain:'dhl.com',kind:'carrier',category:'Air',icon:'plane',description:'Express delivery and tracking updates.',status:'available'},
  {id:'hubspot',name:'HubSpot',kind:'system',category:'CRM',letters:'H',description:'Customer contacts and sales records',status:'available'},
  {id:'teams',name:'Microsoft Teams',kind:'system',category:'Communication',letters:'T',description:'Team channels and notifications',status:'available'},
  {id:'woo',name:'WooCommerce',kind:'system',category:'E-commerce',letters:'W',description:'Store orders and fulfillment',status:'available'},
  {id:'netsuite',name:'NetSuite',kind:'system',category:'ERP',letters:'N',description:'Business planning and inventory',status:'available'}
];
const $ = selector => document.querySelector(selector);
const storageKey = 'html-css-logistics-reference-v2';
const validStatuses = ['connected','syncing','errors','available'];
const labels = {connected:'Connected',syncing:'Syncing',errors:'Errors',available:'Available'};
let items = initial.map(item => ({...item}));
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved && typeof saved === 'object') items.forEach(item => { if (validStatuses.includes(saved[item.id])) item.status = saved[item.id]; });
} catch {   }
let expandedCarriers = false;
let toastTimer;
let storageAvailable = true;
const iconSprites = {
  check: [812,536,21,21], 'sync-badge': [1293,536,21,21], alert: [1768,536,23,22],
  settings: [896,704,21,22], external: [735,600,17,17]
};
const spriteStyle = ([x,y,w,h]) => `--sx:${-x};--sy:${-y};width:calc(${w} * var(--u));height:calc(${h} * var(--u))`;
const icon = name => iconSprites[name]
  ? `<span class="reference-icon" style="${spriteStyle(iconSprites[name])}" aria-hidden="true"></span>`
  : `<svg aria-hidden="true"><use href="#${name}"/></svg>`;
const statusBadge = status => `<span class="status status-${status}">${icon(status === 'connected' ? 'check' : status === 'syncing' ? 'sync-badge' : status === 'errors' ? 'alert' : 'plus')}${labels[status]}</span>`;

function notify(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 4000);
}
function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(items.map(item => [item.id,item.status])))); }
  catch { storageAvailable = false; }
}
function savedNotice(message) { notify(storageAvailable ? message : `${message} Updated for this session only; browser storage is unavailable.`); }
function render() {
  const query = $('#search').value.trim().toLowerCase();
  const filter = $('#status-filter').value;
  const matches = item => `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query) && (filter === 'all' || item.status === filter);
  const allMatches = items.filter(matches);
  const carriers = allMatches.filter(item => item.kind === 'carrier' && (expandedCarriers || query || filter !== 'all' || item.status !== 'available'));
  const systems = allMatches.filter(item => item.kind === 'system' && (item.status !== 'available' || filter === 'available' || query));
  $('#carrier-grid').innerHTML = carriers.map(item => `<article class="carrier"><div class="carrier-content"><div class="carrier-top"><span class="carrier-logo reference-sprite ${item.icon === 'plane' ? 'plane-logo' : ''}" aria-hidden="true"></span>${statusBadge(item.status)}</div><div class="carrier-name"><h3>${item.name}</h3><span class="domain">${item.domain}${icon('external')}</span></div><p>${item.description}</p></div><div class="carrier-bottom"><button class="quiet-button" data-configure="${item.id}">${item.status === 'available' ? 'Connect' : 'View Integration'}</button><button class="icon-button" data-configure="${item.id}" aria-label="Configure ${item.name} ${labels[item.status].toLowerCase()} connection">${icon('settings')}</button></div></article>`).join('') || '<p class="empty-state">No matching carrier APIs.</p>';
  $('#system-list').innerHTML = systems.map(item => `<article class="system-row"><span class="system-logo ${item.logo ? 'reference-sprite' : ''} logo-${item.logo || item.id}" aria-hidden="true">${item.logo ? '' : item.letters}</span><div class="system-info"><h3>${item.name}</h3><p>${item.description}</p></div><span class="system-category">${item.category}</span>${statusBadge(item.status)}<button class="quiet-button" data-configure="${item.id}" aria-label="${item.status === 'available' ? 'Connect' : 'Configure'} ${item.name}">${item.status === 'available' ? 'Connect' : 'Configure'}</button></article>`).join('') || '<p class="empty-state">No matching system integrations.</p>';

  const referenceTotals = {connected:45, syncing:5, errors:1, available:54};
  validStatuses.forEach(status => {
    const originalCount = initial.filter(item => item.status === status).length;
    const currentCount = items.filter(item => item.status === status).length;
    $(`#${status}-count`).textContent = Math.max(0, referenceTotals[status] + currentCount - originalCount);
  });
  $('#result-status').textContent = `${carriers.length} carrier APIs and ${systems.length} system integrations shown.`;
  $('#view-carriers').innerHTML = `${expandedCarriers ? 'Show Less' : 'View All'} ${icon('arrow')}`;
  $('#view-carriers').setAttribute('aria-expanded', String(expandedCarriers));
}
function openDialog(content) {
  $('#dialog-content').innerHTML = content;
  if (!$('#integration-dialog').open) $('#integration-dialog').showModal();
}
function finishConfiguration(id) {
  $('#integration-dialog').close();
  const replacement = $(`[data-configure="${id}"]`);
  (replacement || $('#add-new')).focus();
}
function configure(id) {
  const item = items.find(entry => entry.id === id);
  if (!item) return;
  if (item.status === 'available') { addDialog(id); return; }
  openDialog(`<h2 id="dialog-title">${item.name}</h2><p>${item.description}.</p><dl><dt>Category</dt><dd>${item.category}</dd><dt>Environment</dt><dd>Demo workspace</dd><dt>Connection</dt><dd>${labels[item.status]}</dd></dl><form id="configure-form"><label for="connection-status">Connection status</label><select id="connection-status" name="status"><option value="connected" ${item.status === 'connected' ? 'selected' : ''}>Connected</option><option value="syncing" ${item.status === 'syncing' ? 'selected' : ''}>Syncing</option><option value="errors" ${item.status === 'errors' ? 'selected' : ''}>Errors</option><option value="available">Disconnect</option></select><button class="dialog-submit" type="submit">Save changes</button></form><p class="dialog-note">This changes sample data in your browser only.</p>`);
  $('#configure-form').addEventListener('submit', event => {
    event.preventDefault(); item.status = $('#connection-status').value; persist(); render(); finishConfiguration(item.id); savedNotice(`${item.name} updated.`);
  });
}
function addDialog(selected = '') {
  const available = items.filter(item => item.status === 'available');
  openDialog(`<h2 id="dialog-title">Add an integration</h2><p>Choose a service to add to this demo workspace.</p>${available.length ? `<form id="add-form"><label for="new-service">Available services</label><select id="new-service" name="service">${available.map(item => `<option value="${item.id}" ${item.id === selected ? 'selected' : ''}>${item.name} · ${item.category}</option>`).join('')}</select><button class="dialog-submit" type="submit">${icon('plus')} Add integration</button></form>` : '<p>Every sample service is already connected.</p>'}<p class="dialog-note">No account credentials are needed. No live connection is created.</p>`);
  if (available.length) $('#add-form').addEventListener('submit', event => {
    event.preventDefault(); const item = items.find(entry => entry.id === $('#new-service').value); item.status = 'connected'; persist(); $('#search').value = ''; $('#status-filter').value = 'all'; render(); finishConfiguration(item.id); savedNotice(`${item.name} added to the demo workspace.`);
  });
}
function showPanel(panel) {
  const errors = items.filter(item => item.status === 'errors');
  const syncing = items.filter(item => item.status === 'syncing');
  const content = {
    insight: `<h2 id="dialog-title">Workspace insight</h2><p>A summary of the sample integration data.</p><ul><li>${items.filter(item => item.status === 'connected').length} services are connected.</li><li>${syncing.length} services are syncing.</li><li>${errors.length} services need attention${errors.length ? `: ${errors.map(item => item.name).join(', ')}` : ''}.</li></ul><p>Open an integration to review its status.</p><p class="dialog-note">This summary is calculated locally; it does not use an AI service.</p>`,
    activity: `<h2 id="dialog-title">Connection activity</h2><p>Current events in the demo workspace.</p><ul>${errors.map(item => `<li>${item.name}: review connection settings.</li>`).join('')}${syncing.map(item => `<li>${item.name}: sync in progress.</li>`).join('')}${!errors.length && !syncing.length ? '<li>All active connections are up to date.</li>' : ''}</ul>`,
    help: '<h2 id="dialog-title">A quick guide</h2><ul><li>Search by service name or category.</li><li>Filter by connection status.</li><li>Configure a service to change its sample status.</li><li>Choose Add New to connect a sample service.</li></ul><p>Your changes stay in this browser. <a class="help-link" href="../assets/dahsboard.png">View the design reference.</a></p>',
    learning: '<h2 id="dialog-title">Explore the lab</h2><p>The article covers how language models work and where human checks matter.</p><p><a class="help-link" href="../article/ai/index.html">Read The AI revolution ↗</a></p>',
    documents: '<h2 id="dialog-title">Project documents</h2><ul><li><a class="help-link" href="../README.md">Project README</a></li><li><a class="help-link" href="../assets/dahsboard.png">Dashboard reference</a></li></ul>',
    customers: '<h2 id="dialog-title">Customer portal</h2><p>This sample workspace has one example account.</p><dl><dt>Workspace</dt><dd>Acme Logistics</dd><dt>Member</dt><dd>Alex · Demo user</dd><dt>Mode</dt><dd>Local preview</dd></dl>',
    shipments: '<h2 id="dialog-title">Sample shipments</h2><p>Illustrative records for this dashboard.</p><dl><dt>DEMO-001</dt><dd>Ocean · In transit</dd><dt>DEMO-002</dt><dd>Air · Scheduled</dd><dt>DEMO-003</dt><dd>Express · Delivered</dd></dl><p class="dialog-note">These are example records, not live shipment data.</p>',
    quote: '<h2 id="dialog-title">Freight quote example</h2><p>Quotes depend on route, cargo, and carrier rates. This HTML/CSS demo has no live rate service.</p><p>Use the Carrier APIs panel to explore the sample connections.</p>',
    settings: '<h2 id="dialog-title">Workspace settings</h2><p>Restore the original sample services and statuses.</p><button class="dialog-submit" id="reset-demo">Reset demo data</button><p class="dialog-note">This affects only this dashboard\'s locally saved sample data.</p>'
  };
  openDialog(content[panel] || content.help);
  if (panel === 'settings') $('#reset-demo').addEventListener('click', () => { items = initial.map(item => ({...item})); persist(); $('#search').value = ''; $('#status-filter').value = 'all'; render(); $('#integration-dialog').close(); savedNotice('Original demo data restored.'); });
}
$('#search').addEventListener('input', render);
$('#status-filter').addEventListener('change', render);
$('#add-new').addEventListener('click', () => addDialog());
$('#view-carriers').addEventListener('click', () => { expandedCarriers = !expandedCarriers; render(); });
$('#layout-toggle').addEventListener('click', () => {
  const grid = $('#system-list').classList.toggle('grid-view');
  $('#layout-toggle').setAttribute('aria-pressed', String(grid));
  $('#layout-toggle').setAttribute('aria-label', `Switch system integrations to ${grid ? 'list' : 'grid'} view`);
});
document.addEventListener('click', event => {
  const configureButton = event.target.closest('[data-configure]');
  if (configureButton) configure(configureButton.dataset.configure);
  const panelButton = event.target.closest('[data-panel]');
  if (panelButton) showPanel(panelButton.dataset.panel);
});
$('#close-dialog').addEventListener('click', () => $('#integration-dialog').close());
$('#integration-dialog').addEventListener('click', event => { if (event.target === $('#integration-dialog')) { const bounds = event.target.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.target.close(); } });
$('#collapse-sidebar').addEventListener('click', () => { $('.app').classList.add('sidebar-collapsed'); $('#menu-toggle').setAttribute('aria-expanded', 'false'); $('#menu-toggle').focus(); });
$('#menu-toggle').addEventListener('click', () => {
  if ($('.app').classList.contains('sidebar-collapsed')) {
    $('.app').classList.remove('sidebar-collapsed');
    if (matchMedia('(max-width: 900px)').matches) {
      $('#sidebar').classList.add('open');
      $('#menu-toggle').setAttribute('aria-expanded', 'true');
      $('#sidebar a').focus();
    } else $('#collapse-sidebar').focus();
    return;
  }
  const open = $('#sidebar').classList.toggle('open');
  $('#menu-toggle').setAttribute('aria-expanded', String(open));
  if (open) $('#sidebar a').focus();
});
$('#sidebar').addEventListener('click', event => { if (event.target.closest('a,button')) { $('#sidebar').classList.remove('open'); $('#menu-toggle').setAttribute('aria-expanded', 'false'); } });

const mobileLayout = matchMedia('(max-width: 900px)');
mobileLayout.addEventListener('change', () => {
  const focusInSidebar = $('#sidebar').contains(document.activeElement);
  const focusOnToggle = document.activeElement === $('#menu-toggle');
  $('#sidebar').classList.remove('open');
  $('#menu-toggle').setAttribute('aria-expanded', 'false');
  if (mobileLayout.matches && focusInSidebar) $('#menu-toggle').focus();
  else if (!mobileLayout.matches && focusOnToggle && !$('.app').classList.contains('sidebar-collapsed')) $('#collapse-sidebar').focus();
});

document.addEventListener('keydown', event => {
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !$('#integration-dialog').open && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) { event.preventDefault(); $('#search').focus(); }
  if (event.key === 'Escape' && $('#sidebar').classList.contains('open') && !$('#integration-dialog').open) { $('#sidebar').classList.remove('open'); $('#menu-toggle').setAttribute('aria-expanded', 'false'); $('#menu-toggle').focus(); }
});

[
  ['.primary-nav > :nth-child(1) svg',172,221,20,20],
  ['.primary-nav > :nth-child(2) svg',171,280,21,21],
  ['.primary-nav > :nth-child(3) svg',171,342,22,22],
  ['.primary-nav > :nth-child(4) svg',171,405,22,21],
  ['.primary-nav > :nth-child(5) svg',171,468,22,19],
  ['.primary-nav > :nth-child(7) svg',172,581,20,22],
  ['.primary-nav > :nth-child(8) svg',171,644,22,21],
  ['.primary-nav > :nth-child(9) svg',171,706,22,22],
  ['.primary-nav > :nth-child(10) svg',172,769,20,22],
  ['.sidebar-bottom > :nth-child(1) svg',187,1176,21,22],
  ['.sidebar-bottom > :nth-child(2) svg',187,1226,22,20],
  ['.sidebar-bottom > :nth-child(3) svg',188,1275,21,21],
  ['.search svg',1190,127,19,19],
  ['.notification svg',1817,126,21,22],
  ['.top-help svg',1868,126,22,22],
  ['.insight-button svg',1759,126,21,21],
  ['.metric:nth-child(1) svg',767,332,22,22],
  ['.metric:nth-child(2) svg',1126,332,22,22],
  ['.metric:nth-child(3) svg',1485,332,22,22],
  ['.metric:nth-child(4) svg',1845,333,21,20],
  ['.filter-label svg',1751,808,21,20],
  ['#layout-toggle svg',1803,808,20,20],
  ['.panel-tools > :last-child svg',1852,806,24,24]
].forEach(([selector,...crop]) => {
  const element = $(selector);
  element.classList.add('reference-icon');
  element.setAttribute('aria-hidden','true');
  element.style.cssText = spriteStyle(crop);
});
render();
