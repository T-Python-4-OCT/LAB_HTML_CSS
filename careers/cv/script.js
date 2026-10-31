/* Small, independent enhancements. The magazine remains readable without JS. */
(() => {
  "use strict";

  // Highlight the section at the reading line. Native anchors handle navigation.
  const navLinks = [...document.querySelectorAll('.contents-links a[href^="#"]')];
  const nav = document.querySelector(".contents-nav");
  const sections = navLinks.map(link => ({
    link,
    section: document.getElementById(link.hash.slice(1))
  })).filter(item => item.section);
  let scrollQueued = false;

  function updateContents() {
    const readingLine = (nav?.getBoundingClientRect().height || 0) + 65;
    let current = null;
    for (const item of sections) {
      if (item.section.getBoundingClientRect().top <= readingLine) current = item;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3) {
      current = sections.at(-1) || null;
    }
    for (const item of sections) {
      if (item === current) item.link.setAttribute("aria-current", "location");
      else item.link.removeAttribute("aria-current");
    }
    scrollQueued = false;
  }

  function queueContentsUpdate() {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(updateContents);
  }
  window.addEventListener("scroll", queueContentsUpdate, { passive: true });
  window.addEventListener("resize", queueContentsUpdate);
  window.addEventListener("load", queueContentsUpdate);
  updateContents();

  // A real local search: no account, submission endpoint, or stored personal data.
  const searchForm = document.getElementById("project-search");
  const queryInput = document.getElementById("project-query");
  const resultCount = document.getElementById("project-count");
  const noResults = document.getElementById("no-projects");
  const projects = [...document.querySelectorAll("[data-project]")];

  if (searchForm && queryInput && resultCount && noResults && projects.length) {
    const searchable = projects.map(card => ({
      card,
      text: `${card.textContent} ${card.dataset.keywords || ""}`.toLocaleLowerCase()
    }));

    function filterProjects(query = queryInput.value) {
      const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
      let count = 0;
      for (const { card, text } of searchable) {
        const matches = words.every(word => text.includes(word));
        card.hidden = !matches;
        if (matches) count += 1;
      }
      noResults.hidden = count !== 0;
      resultCount.textContent = words.length
        ? `${count} of ${projects.length} course projects match your search.`
        : `Showing all ${projects.length} course projects.`;
      queueContentsUpdate();
    }

    searchForm.addEventListener("submit", event => {
      event.preventDefault();
      filterProjects();
    });
    queryInput.addEventListener("input", () => filterProjects());
    searchForm.addEventListener("reset", () => {
      filterProjects("");
      queryInput.focus();
    });
    searchForm.hidden = false;
  }

  const printButton = document.getElementById("print-edition");
  if (printButton && typeof window.print === "function") {
    printButton.hidden = false;
    printButton.addEventListener("click", () => window.print());
  }

  // Observe only below-the-fold features. Content starts visible in the HTML.
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  if ("IntersectionObserver" in window && !motionPreference.matches) {
    let observer;
    const candidates = [...document.querySelectorAll("[data-reveal]")];
    const revealAll = () => {
      candidates.forEach(element => element.classList.remove("will-reveal"));
      observer?.disconnect();
    };
    try {
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }, { rootMargin: "0px 0px 35px 0px", threshold: 0.08 });

      for (const element of candidates) {
        if (element.getBoundingClientRect().top < window.innerHeight) continue;
        element.classList.add("will-reveal");
        observer.observe(element);
      }
      motionPreference.addEventListener("change", revealAll, { once: true });
      window.addEventListener("beforeprint", revealAll);
    } catch {
      revealAll();
    }
  }
})();
