(() => {
  "use strict";
  const control = document.querySelector(".journey-animation");
  const image = control.querySelector("img");
  const source = image.getAttribute("src").split("#")[0];
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let running = !preference.matches;

  function render() {
    const fragment = running
      ? preference.matches ? "#walking-request" : "#walking"
      : "";
    if (image.getAttribute("src") !== source + fragment)
      image.setAttribute("src", source + fragment);
    const label = window.Lab.text(
      running ? "Stop walking animation" : "Restart walking animation",
      running ? "إيقاف حركة المشي" : "إعادة تشغيل حركة المشي",
    );
    control.setAttribute("aria-label", label);
    control.title = label;
  }

  control.disabled = false;
  control.addEventListener("click", () => { running = !running; render(); });
  preference.addEventListener("change", () => { running = !preference.matches; render(); });
  document.addEventListener("lab:languagechange", render);
  render();
})();
