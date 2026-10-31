document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const header = document.querySelector('.topbar');
  const navigation = header?.querySelector('nav');
  const navLinks = [...(navigation?.querySelectorAll('a[href^="#"]') || [])];

  if (header && navigation && navLinks.length) {
    const menuButton = document.createElement('button');
    menuButton.className = 'menu-toggle';
    menuButton.type = 'button';
    menuButton.setAttribute('aria-label', 'Open navigation menu');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.innerHTML = '<span></span><span></span><span></span>';
    header.insertBefore(menuButton, navigation);

    const closeMenu = () => {
      header.classList.remove('menu-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation menu');
    };

    menuButton.addEventListener('click', () => {
      const isOpen = header.classList.toggle('menu-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    });

    navLinks.forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });

    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    if ('IntersectionObserver' in window) {
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            const active = link.hash === `#${entry.target.id}`;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-25% 0px -60% 0px' });

      sections.forEach((section) => sectionObserver.observe(section));
    }
  }

  const revealItems = document.querySelectorAll(
    '.profile-card, .facts > div, .experience-item, .screen-card, .panel, .contact-band'
  );

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => {
      item.classList.add('reveal-on-scroll');
      revealObserver.observe(item);
    });
  }

  const gallery = document.querySelector('.project-gallery');
  if (gallery) {
    const lightbox = document.createElement('dialog');
    lightbox.className = 'image-lightbox';
    lightbox.setAttribute('aria-label', 'Project screen preview');
    lightbox.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close image preview">×</button><img alt="" /><p></p>';
    document.body.append(lightbox);

    const previewImage = lightbox.querySelector('img');
    const caption = lightbox.querySelector('p');
    const closeButton = lightbox.querySelector('.lightbox-close');

    gallery.addEventListener('click', (event) => {
      const card = event.target.closest('.screen-card');
      if (!card) return;
      event.preventDefault();
      const image = card.querySelector('img');
      previewImage.src = card.href;
      previewImage.alt = image.alt;
      caption.textContent = card.querySelector('.screen-caption strong')?.textContent || image.alt;
      lightbox.showModal();
      closeButton.focus();
    });

    closeButton.addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener('close', () => {
      previewImage.removeAttribute('src');
    });
  }
});
