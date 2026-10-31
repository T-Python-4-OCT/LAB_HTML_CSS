(() => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Filter tabs
  const filterButtons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll("[data-cat]");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      filterButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });

      cards.forEach((card) => {
        card.hidden = !(filter === "all" || card.dataset.cat === filter);
      });
    });
  });

  // Card tilt (only with a fine pointer and motion allowed)
  if (finePointer && !reduceMotion) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      const enterTransition =
        "transform 0.15s ease-out, border-color 0.3s ease, box-shadow 0.3s ease";
      const leaveTransition =
        "transform 0.5s ease, border-color 0.3s ease, box-shadow 0.3s ease";

      card.addEventListener("pointerenter", () => {
        card.style.transition = enterTransition;
      });

      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const x = e.clientX - rect.left - cx;
        const y = e.clientY - rect.top - cy;
        const rotateX = (y / cy) * -6;
        const rotateY = (x / cx) * 6;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transition = leaveTransition;
        card.style.transform =
          "perspective(1000px) rotateX(0) rotateY(0) translateY(0)";
      });
    });
  }

  // Three.js background (optional: the page works without it)
  initBackground();

  function initBackground() {
    const container = document.getElementById("canvas-container");
    if (!container) return;

    if (!window.THREE) {
      container.remove();
      return;
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err) {
      container.remove();
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 5;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const icosahedron = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2, 2),
      new THREE.MeshBasicMaterial({
        color: 0x00f2fe,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      }),
    );
    scene.add(icosahedron);

    const count = 400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 3.5 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      positions[i * 3] = radius * Math.cos(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.cos(phi) * Math.sin(theta);
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0x6366f1,
        size: 0.035,
        transparent: true,
        opacity: 0.5,
      }),
    );
    scene.add(particles);

    let targetX = 0;
    let targetY = 0;
    if (!reduceMotion) {
      window.addEventListener(
        "pointermove",
        (e) => {
          targetX = (e.clientX / window.innerWidth) * 2 - 1;
          targetY = -(e.clientY / window.innerHeight) * 2 + 1;
        },
        { passive: true },
      );
    }

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function update() {
      icosahedron.rotation.x +=
        0.002 + (targetY * 0.5 - icosahedron.rotation.x) * 0.05;
      icosahedron.rotation.y +=
        0.003 + (targetX * 0.5 - icosahedron.rotation.y) * 0.05;
      particles.rotation.y -= 0.001;
      renderer.render(scene, camera);
    }

    if (reduceMotion) {
      // Draw one static frame and stop
      renderer.render(scene, camera);
      return;
    }

    let frameId = 0;
    function loop() {
      update();
      frameId = requestAnimationFrame(loop);
    }
    function start() {
      if (!frameId) loop();
    }
    function stop() {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }

    // Pause the animation while the tab is in the background
    document.addEventListener("visibilitychange", () =>
      document.hidden ? stop() : start(),
    );
    start();
  }
})();
