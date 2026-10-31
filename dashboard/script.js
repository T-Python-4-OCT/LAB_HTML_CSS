const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let toastTimer;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

// Responsive navigation and active page labels.
$("#openSidebar").addEventListener("click", () => $("#sidebar").classList.add("open"));
$("#closeSidebar").addEventListener("click", () => $("#sidebar").classList.remove("open"));
$$(".nav-item").forEach(item => item.addEventListener("click", event => {
  event.preventDefault();
  $$(".nav-item").forEach(link => link.classList.remove("active"));
  item.classList.add("active");
  $("#currentPage").textContent = item.dataset.page || "Dashboard";
  $("#sidebar").classList.remove("open");
  if (item.dataset.page === "Dashboard") $("#overview").scrollIntoView({behavior:"smooth"});
  else showToast(`${item.dataset.page} section selected — connect this item to your page when ready.`);
}));

// Light/dark theme.
$("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  const light = document.body.classList.contains("light-mode");
  $("#themeToggle").textContent = light ? "☾" : "☼";
  showToast(light ? "Light theme enabled" : "Dark theme enabled");
});

// Search filters project rows and gives useful feedback.
$("#globalSearch").addEventListener("input", event => {
  const query = event.target.value.trim().toLowerCase();
  let visible = 0;
  $$("#projectTable tr").forEach(row => {
    const match = row.textContent.toLowerCase().includes(query);
    row.hidden = !match;
    if (match) visible++;
  });
  if (query) showToast(`${visible} matching project${visible === 1 ? "" : "s"} found`);
  else $$("#projectTable tr").forEach(row => row.hidden = false);
});
document.addEventListener("keydown", event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    $("#globalSearch").focus();
  }
  if (event.key === "Escape") $("#sidebar").classList.remove("open");
});

// Chart.js charts.
const chartText = "#8c98b9";
const gridColor = "rgba(140,152,185,.12)";
const revenueSets = {
  week: {labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], revenue:[8,11,9,15,13,18,21], previous:[6,8,10,9,12,13,15]},
  month: {labels:["Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"], revenue:[18,24,21,31,27,38,34,48], previous:[14,19,17,25,23,28,29,36]},
  year: {labels:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], revenue:[12,18,16,25,23,31,27,38,34,48,43,57], previous:[9,14,13,19,18,23,22,28,25,36,32,42]}
};
const revenueCtx = $("#revenueChart").getContext("2d");
const gradient = revenueCtx.createLinearGradient(0, 0, 0, 270);
gradient.addColorStop(0, "rgba(139,92,246,.34)");
gradient.addColorStop(1, "rgba(139,92,246,0)");
const revenueChart = new Chart(revenueCtx, {
  type:"line",
  data:{labels:revenueSets.month.labels,datasets:[
    {label:"Revenue",data:revenueSets.month.revenue,borderColor:"#9a7aff",backgroundColor:gradient,fill:true,tension:.42,borderWidth:2.5,pointRadius:0,pointHoverRadius:5,pointHoverBackgroundColor:"#b9a5ff"},
    {label:"Previous period",data:revenueSets.month.previous,borderColor:"#2dd4e9",backgroundColor:"transparent",fill:false,tension:.42,borderWidth:1.8,borderDash:[5,5],pointRadius:0,pointHoverRadius:4}
  ]},
  options:{responsive:true,maintainAspectRatio:false,interaction:{mode:"index",intersect:false},plugins:{legend:{display:false},tooltip:{backgroundColor:"#202844",titleColor:"#fff",bodyColor:"#c8d0e9",padding:12,displayColors:true}},scales:{x:{grid:{display:false},ticks:{color:chartText,font:{family:"Inter",size:9}},border:{display:false}},y:{beginAtZero:true,grid:{color:gridColor},ticks:{color:chartText,font:{family:"Inter",size:9},callback:value=>"$"+value+"k"},border:{display:false}}}}
});
$("#revenueRange").addEventListener("change", event => {
  const set = revenueSets[event.target.value];
  revenueChart.data.labels = set.labels;
  revenueChart.data.datasets[0].data = set.revenue;
  revenueChart.data.datasets[1].data = set.previous;
  revenueChart.update();
  showToast(`Revenue chart updated: ${event.target.options[event.target.selectedIndex].text}`);
});
const trafficCtx = $("#trafficChart").getContext("2d");
new Chart(trafficCtx,{type:"doughnut",data:{labels:["Organic search","Direct","Social media","Referral"],datasets:[{data:[42,28,18,12],backgroundColor:["#9270ff","#2dd4e9","#f472b6","#fb923c"],borderWidth:0,hoverOffset:7,spacing:4,borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,cutout:"76%",plugins:{legend:{display:false},tooltip:{backgroundColor:"#202844",padding:10,callbacks:{label:ctx=>`${ctx.label}: ${ctx.raw}%`}}}}});

// Create projects locally in the table.
const dialog = $("#projectDialog");
$("#newProjectBtn").addEventListener("click", () => { $("#projectName").value = ""; dialog.showModal(); });
$("#projectForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = $("#projectName").value.trim();
  if (!name) return;
  const status = $("#projectStatus").value;
  const statusClass = status === "In review" ? "status-review" : "status-progress";
  const row = document.createElement("tr");
  const safeName = document.createElement("strong");
  safeName.textContent = name;
  const nameWrap = document.createElement("div"); nameWrap.className = "project-name";
  const symbol = document.createElement("span"); symbol.className = "project-symbol symbol-purple"; symbol.textContent = "✦";
  const detail = document.createElement("div"); detail.append(safeName);
  const updated = document.createElement("small"); updated.textContent = "Created just now"; detail.append(updated);
  nameWrap.append(symbol, detail);
  const nameCell = document.createElement("td"); nameCell.append(nameWrap);
  const statusCell = document.createElement("td"); const statusTag = document.createElement("span"); statusTag.className = `status ${statusClass}`; statusTag.textContent = status; statusCell.append(statusTag);
  const completionCell = document.createElement("td"); completionCell.innerHTML = '<div class="progress-cell"><div class="progress-track"><span style="width:0%"></span></div><small>0%</small></div>';
  const teamCell = document.createElement("td"); teamCell.innerHTML = '<div class="team-stack"><span>MA</span></div>';
  row.append(nameCell,statusCell,completionCell,teamCell);
  $("#projectTable").prepend(row);
  const count = $$("#projectTable tr").length;
  $(".count-pill").textContent = count;
  $(".nav-count").textContent = count;
  dialog.close();
  showToast(`Project “${name}” created`);
});

// Export a small report as a CSV file.
$("#exportBtn").addEventListener("click", () => {
  const rows = [["Project","Status","Completion","Team"]];
  $$("#projectTable tr").forEach(row => {
    if (row.hidden) return;
    const cells = [...row.querySelectorAll("td")];
    rows.push([cells[0].innerText.replace(/\n/g," — "),cells[1].innerText,cells[2].innerText.replace(/\n/g," "),cells[3].innerText.replace(/\n/g," ")]);
  });
  const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = "vision-dashboard-projects.csv"; link.click();
  URL.revokeObjectURL(url);
  showToast("Project report exported as CSV");
});
$("#viewAllProjects").addEventListener("click", () => { $("#globalSearch").value = ""; $$("#projectTable tr").forEach(row=>row.hidden=false); showToast("Showing all projects"); });
$("#notificationBtn").addEventListener("click", () => showToast("You're all caught up — no new notifications."));
$("#profileMenu").addEventListener("click", () => showToast("Signed in as Mustafa Al Ali · AI Engineer"));
$("#userButton").addEventListener("click", () => showToast("Profile menu selected"));
$("#helpBtn").addEventListener("click", () => showToast("Help center: add your support URL here."));
$("#activityBtn").addEventListener("click", () => showToast("You're viewing the latest four activity updates."));
$("#activityMenu").addEventListener("click", () => showToast("Activity is sorted by most recent."));
$("#trafficMenu").addEventListener("click", () => showToast("Traffic sources for the current month."));
