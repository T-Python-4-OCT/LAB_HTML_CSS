
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    const sidebar = document.getElementById("sidebar");
    const sidebarOpen = document.getElementById("sidebarOpen");
    const sidebarClose = document.getElementById("sidebarClose");

    const searchInput = document.getElementById("searchInput");

    const carrierList = document.getElementById("carrierList");
    const systemList = document.getElementById("systemList");
    const emptyState = document.getElementById("emptyState");

    const filterBtn = document.getElementById("filterBtn");
    const layoutBtn = document.getElementById("layoutBtn");
    const viewAll = document.getElementById("viewAll");
    const addNew = document.getElementById("addNew");

    const statConnected = document.getElementById("statConnected");
    const statAvailable = document.getElementById("statAvailable");

    const toast = document.getElementById("toast");

    const appDialog = document.getElementById("appDialog");
    const dialogTitle = document.getElementById("dialogTitle");
    const dialogDesc = document.getElementById("dialogDesc");
    const dialogFields = document.getElementById("dialogFields");
    const dialogForm = document.getElementById("dialogForm");
    const dialogSubmit = document.getElementById("dialogSubmit");

    const integrationName = document.getElementById("integrationName");
    const integrationType = document.getElementById("integrationType");

    const closeDialog = document.getElementById("closeDialog");
    const cancelDialog = document.getElementById("cancelDialog");

    const filters = [
        "all",
        "connected",
        "syncing",
        "errors"
    ];

    let currentFilter = 0;
    let dialogMode = "view";
    let toastTimer;

    function showToast(message) {

        if (!toast) return;

        clearTimeout(toastTimer);

        toast.textContent = message;
        toast.classList.add("visible");

        toastTimer = setTimeout(function () {
            toast.classList.remove("visible");
        }, 3000);

    }

    function openSidebar() {
        sidebar.classList.add("open");
    }

    function hideSidebar() {
        sidebar.classList.remove("open");
    }

    sidebarOpen?.addEventListener("click", openSidebar);

    sidebarClose?.addEventListener("click", hideSidebar);

    document.addEventListener("click", function (event) {

        if (window.innerWidth > 680) return;

        if (!sidebar.classList.contains("open")) return;

        if (
            sidebar.contains(event.target) ||
            sidebarOpen.contains(event.target)
        ) {
            return;
        }

        hideSidebar();

    });

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {
            hideSidebar();
        }

    });

    function updateIntegrations() {

        const query = searchInput.value
            .trim()
            .toLowerCase();

        const selectedFilter = filters[currentFilter];

        const carriers = carrierList.querySelectorAll(
            ".carrier-card"
        );

        const systems = systemList.querySelectorAll(
            ".system-row"
        );

        let visibleSystems = 0;

        carriers.forEach(function (card) {

            const name = card.dataset.name.toLowerCase();
            const status = card.dataset.status;

            const matchesSearch =
                name.includes(query) ||
                card.textContent.toLowerCase().includes(query);

            const matchesFilter =
                selectedFilter === "all" ||
                status === selectedFilter;

            card.hidden = !(matchesSearch && matchesFilter);

        });

        systems.forEach(function (row) {

            const name = row.dataset.name.toLowerCase();
            const status = row.dataset.status;

            const matchesSearch =
                name.includes(query) ||
                row.textContent.toLowerCase().includes(query);

            const matchesFilter =
                selectedFilter === "all" ||
                status === selectedFilter;

            const show = matchesSearch && matchesFilter;

            row.hidden = !show;

            if (show) {
                visibleSystems++;
            }

        });

        emptyState.hidden = visibleSystems > 0;

    }

    searchInput?.addEventListener(
        "input",
        updateIntegrations
    );

    filterBtn?.addEventListener("click", function () {

        currentFilter++;

        if (currentFilter >= filters.length) {
            currentFilter = 0;
        }

        const selected = filters[currentFilter];

        filterBtn.classList.toggle(
            "selected",
            selected !== "all"
        );

        filterBtn.title = "Filter: " + selected;

        filterBtn.setAttribute(
            "aria-label",
            "Current filter: " + selected
        );

        updateIntegrations();

        showToast("Showing: " + selected + " integrations");

    });

    layoutBtn?.addEventListener("click", function () {

        systemList.classList.toggle("compact");

        layoutBtn.classList.toggle("selected");

        const compact = systemList.classList.contains("compact");

        showToast(
            compact ? "Compact view enabled" : "Normal view enabled"
        );

    });

    viewAll?.addEventListener("click", function () {

        searchInput.value = "";

        currentFilter = 0;

        filterBtn.classList.remove("selected");

        filterBtn.title = "Filter: all";

        updateIntegrations();

        showToast("Showing all integrations");

    });

    function openDialog(title, description, mode = "view") {

        dialogMode = mode;

        dialogTitle.textContent = title;
        dialogDesc.textContent = description;

        const adding = mode === "add";

        dialogFields.hidden = !adding;

        integrationName.required = adding;
        integrationName.disabled = !adding;

        dialogSubmit.textContent = adding
            ? "Add Integration"
            : "Close";

        appDialog.showModal();

        if (adding) {
            integrationName.focus();
        }

    }

    function hideDialog() {
        appDialog.close();
    }

    closeDialog?.addEventListener("click", hideDialog);
    cancelDialog?.addEventListener("click", hideDialog);

    addNew?.addEventListener("click", function () {

        dialogForm.reset();

        openDialog(
            "Add New Integration",
            "Enter the information for your new integration. This is a front-end demonstration.",
            "add"
        );

    });

    function createIntegration(name, category) {

        const row = document.createElement("article");

        row.className = "system-row";

        row.dataset.name = name;
        row.dataset.status = "connected";

        const brand = document.createElement("div");
        brand.className = "system-brand";

        const avatar = document.createElement("span");
        avatar.className = "new-avatar";
        avatar.textContent = name.charAt(0).toUpperCase();

        const details = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = name;

        const description = document.createElement("p");
        description.textContent = "Custom integration";

        details.append(title, description);
        brand.append(avatar, details);

        const options = document.createElement("div");
        options.className = "system-options";

        const type = document.createElement("span");
        type.className = "type-pill";
        type.textContent = category;

        const status = document.createElement("span");
        status.className = "status status-connected";

        const statusIcon = document.createElement("i");
        statusIcon.className =
            "fa-solid fa-circle-check icon";

        status.append(
            statusIcon,
            document.createTextNode(" Connected")
        );

        const configure = document.createElement("button");

        configure.type = "button";
        configure.className = "small-pill config-pill";

        configure.textContent = "Configure";

        configure.dataset.configure = name;

        options.append(type, status, configure);

        row.append(brand, options);

        systemList.appendChild(row);

        const connected = Number(statConnected.textContent);
        const available = Number(statAvailable.textContent);

        statConnected.textContent = connected + 1;

        statAvailable.textContent = Math.max(
            0,
            available - 1
        );

    }

    dialogForm?.addEventListener("submit", function (event) {

        event.preventDefault();

        if (dialogMode !== "add") {
            hideDialog();
            return;
        }

        const name = integrationName.value.trim();
        const category = integrationType.value;

        if (!name) {
            integrationName.focus();
            return;
        }

        const existingRows = systemList.querySelectorAll(
            ".system-row"
        );

        const exists = Array.from(existingRows).some(
            function (row) {

                return row.dataset.name.toLowerCase() ===
                    name.toLowerCase();

            }
        );

        if (exists) {
            showToast("This integration already exists.");
            return;
        }

        createIntegration(name, category);

        hideDialog();

        searchInput.value = "";
        currentFilter = 0;

        filterBtn.classList.remove("selected");

        updateIntegrations();

        showToast(name + " added to the demo dashboard.");

    });

    document.addEventListener("click", function (event) {

        const configureButton = event.target.closest(
            "[data-configure]"
        );

        if (!configureButton) return;

        const name = configureButton.dataset.configure;

        openDialog(
            name,
            "Configuration options for " + name +
            ". No external integration service is connected.",
            "view"
        );

    });

    document.addEventListener("click", function (event) {

        const demoButton = event.target.closest(
            "[data-demo]"
        );

        if (!demoButton) return;

        showToast(demoButton.dataset.demo);

    });

    document.querySelectorAll('a[href="#"]').forEach(
        function (link) {

            link.addEventListener("click", function (event) {

                event.preventDefault();

                showToast(
                    "This page is not available in the demo."
                );

            });

        }
    );

    updateIntegrations();

    console.log("Logistics Dashboard loaded successfully.");

});
