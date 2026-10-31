
(() => {
  "use strict";
  const storageKey = "lab-language";
  const originals = new WeakMap();
  const attributes = {
    label: "aria-label",
    placeholder: "placeholder",
    title: "title",
    alt: "alt",
    src: "src",
    content: "content",
    description: "aria-description",
  };
  const queryLanguage = new URL(location.href).searchParams.get("lang");
  const requested = ["en", "ar"].includes(queryLanguage) ? queryLanguage : null;
  let saved = null;
  try {
    saved = localStorage.getItem(storageKey);
  } catch {

  }
  let language = (requested || saved) === "ar" ? "ar" : "en";
  if (requested) {
    try {
      localStorage.setItem(storageKey, language);
    } catch {

    }
  }

  function translateElement(element) {
    if (!originals.has(element)) {
      const original = { html: element.innerHTML, attrs: {} };
      Object.entries(attributes).forEach(([key, attr]) => {
        if (element.hasAttribute(`data-ar-${key}`))
          original.attrs[attr] = element.getAttribute(attr);
      });
      originals.set(element, original);
    }
    const original = originals.get(element);
    if (element.hasAttribute("data-ar"))
      element.innerHTML =
        language === "ar" ? element.getAttribute("data-ar") : original.html;
    Object.entries(attributes).forEach(([key, attr]) => {
      if (!element.hasAttribute(`data-ar-${key}`)) return;
      const value =
        language === "ar"
          ? element.getAttribute(`data-ar-${key}`)
          : original.attrs[attr];
      if (value === null) element.removeAttribute(attr);
      else element.setAttribute(attr, value);
    });
  }

  function updateLinkLanguage(link) {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;
    const url = new URL(href, location.href);
    if (
      url.origin !== location.origin ||
      url.protocol !== location.protocol ||
      !/\.html$|\/$/.test(url.pathname)
    )
      return;

    if (/\/dashboard\/(?:index\.html)?$/.test(url.pathname)) {
      url.searchParams.delete("lang");
      link.href = url.href;
      return;
    }
    if (/\/html\/introduction\/index(?:\.ar)?\.html$/.test(url.pathname)) {
      url.pathname = url.pathname.replace(
        /index(?:\.ar)?\.html$/,
        language === "ar" ? "index.ar.html" : "index.html",
      );
    }
    url.searchParams.set("lang", language);
    link.href = url.href;
  }

  function applyLanguage(next, persist = false) {
    language = next === "ar" ? "ar" : "en";
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

    document
      .querySelectorAll(
        "[data-ar], [data-ar-label], [data-ar-placeholder], [data-ar-title], [data-ar-alt], [data-ar-src], [data-ar-content], [data-ar-description]",
      )
      .forEach(translateElement);
    document.querySelectorAll("[data-language]").forEach((button) => {
      const selected = button.dataset.language === language;
      button.setAttribute("aria-pressed", String(selected));
      button.lang = button.dataset.language;
    });
    document.querySelectorAll("[data-readme-link]").forEach((link) => {
      link.href = link.href.replace(
        /README(?:\.ar)?\.md/,
        language === "ar" ? "README.ar.md" : "README.md",
      );
    });
    document.querySelectorAll("a[href]").forEach(updateLinkLanguage);
    if (persist) {
      try {
        localStorage.setItem(storageKey, language);
      } catch {

      }
      try {
        const url = new URL(location.href);
        url.searchParams.set("lang", language);
        history.replaceState(null, "", url);
      } catch {

      }
    }
    document.dispatchEvent(
      new CustomEvent("lab:languagechange", { detail: { language } }),
    );
  }

  window.Lab = Object.freeze({
    get language() {
      return language;
    },
    text: (english, arabic) => (language === "ar" ? arabic : english),
    number: (value) =>
      new Intl.NumberFormat(language === "ar" ? "ar-SA" : "en").format(value),
    setLanguage: (next) => applyLanguage(next, true),
  });
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-language]");
    if (button) applyLanguage(button.dataset.language, true);
    const link = event.target.closest("a[href]");
    if (link) updateLinkLanguage(link);
  });
  applyLanguage(language);
})();
