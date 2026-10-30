lucide.createIcons();

const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const alexMenu = document.getElementById("alexMenu");
const alexToggle = document.getElementById("alexToggle");

sidebarToggle.addEventListener("click", () => {
  sidebar.classList.toggle("hidden");

  const isOpen = !sidebar.classList.contains("hidden");
  sidebarToggle.setAttribute("aria-expanded", String(isOpen));
});

alexToggle.addEventListener("click", () => {
  alexMenu.classList.toggle("hidden");

  const isOpen = !alexMenu.classList.contains("hidden");
  alexToggle.setAttribute("aria-expanded", String(isOpen));
});