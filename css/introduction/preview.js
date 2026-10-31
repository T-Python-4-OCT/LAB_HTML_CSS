(() => {
  "use strict";
  const form = document.querySelector("#note-form");
  const preview = document.querySelector("#note-preview");
  const status = document.querySelector("#form-status");
  const fields = ["name", "email", "topic", "message"];
  let checked = false;
  let submitted = null;
  const text = (en, ar) => window.Lab.text(en, ar);
  const topics = {
    walk: ["A place to walk", "مكان للمشي"],
    destination: ["A weekend destination", "وجهة لعطلة نهاية الأسبوع"],
    habit: ["A habit to try", "عادة أجربها"],
  };

  function errorFor(id) {
    const input = form.elements[id];
    const value = input.value.trim();
    if (id === "name" && (value.length < 2 || value.length > 80))
      return text(
        "Enter a name with 2–80 characters.",
        "اكتب اسمًا من حرفين إلى ٨٠ حرفًا.",
      );
    if (id === "email" && (!value || !input.validity.valid))
      return text(
        "Enter an email address such as name@example.com.",
        "اكتب بريدًا إلكترونيًا مثل name@example.com.",
      );
    if (id === "topic" && !topics[value])
      return text("Choose a topic for the suggestion.", "اختر نوع الاقتراح.");
    if (id === "message" && (value.length < 10 || value.length > 500))
      return text(
        "Write a suggestion with 10–500 characters.",
        "اكتب اقتراحًا من ١٠ إلى ٥٠٠ حرف.",
      );
    return "";
  }

  function validate(focus = false) {
    let firstInvalid = null;
    fields.forEach((id) => {
      const input = form.elements[id];
      const error = errorFor(id);
      document.querySelector(`#${id}-error`).textContent = error;
      if (error) {
        input.setAttribute("aria-invalid", "true");
        firstInvalid ||= input;
      } else input.removeAttribute("aria-invalid");
    });
    status.textContent = firstInvalid
      ? text(
          "Check the marked fields and preview again.",
          "راجع الحقول المحددة ثم عاين الاقتراح مجددًا.",
        )
      : "";
    if (focus && firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  function renderPreview() {
    if (!submitted) return;
    const heading = document.createElement("strong");
    heading.textContent = text("Suggestion preview", "معاينة الاقتراح");
    const name = document.createElement("bdi");
    name.textContent = submitted.name;
    const topic = document.createElement("span");
    topic.className = "preview-line";
    topic.textContent = text(...topics[submitted.topic]);
    const message = document.createElement("bdi");
    message.className = "preview-line";
    message.dir = "auto";
    message.textContent = submitted.message;
    preview.replaceChildren(
      heading,
      document.createElement("br"),
      name,
      document.createElement("br"),
      topic,
      document.createElement("br"),
      message,
    );
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    checked = true;
    if (!validate(true)) return;
    submitted = {
      name: form.elements.name.value.trim(),
      topic: form.elements.topic.value,
      message: form.elements.message.value.trim(),
    };
    renderPreview();
  });
  form.addEventListener("input", (event) => {
    if (checked && fields.includes(event.target.name)) validate();
  });
  document.addEventListener("lab:languagechange", () => {
    if (checked) validate();
    renderPreview();
  });

  form.querySelector('button[type="submit"]').disabled = false;
})();
