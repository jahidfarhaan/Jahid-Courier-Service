document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("pageLoader");
  const introKey = "jahidExpressIntroSeen";
  if (loader && sessionStorage.getItem(introKey) !== "1") {
    document.body.classList.add("is-locked");
    setTimeout(() => {
      loader.classList.add("loaded");
      document.body.classList.remove("is-locked");
      sessionStorage.setItem(introKey, "1");
    }, 1100);
  } else {
    loader?.remove();
  }

  // Navigation
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach(a => {
    if (a.getAttribute("href") === current) a.classList.add("active");
    a.addEventListener("click", () => nav?.classList.remove("open"));
  });

  // Cursor light for desktop
  const glow = document.getElementById("cursorGlow");
  if (glow && matchMedia("(pointer:fine)").matches) {
    window.addEventListener("mousemove", e => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    });
  }

  // Live clock
  const clockNodes = [document.getElementById("heroTime"), document.getElementById("consoleClock")].filter(Boolean);
  if (clockNodes.length) {
    const updateClock = () => {
      const now = new Date();
      const s = now.toLocaleTimeString("en-IN", {hour12:false});
      clockNodes.forEach(n => n.textContent = s);
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  // Count-up stats
  const countNodes = document.querySelectorAll("[data-count]");
  if (countNodes.length && "IntersectionObserver" in window) {
    const seen = new WeakSet();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || seen.has(entry.target)) return;
        seen.add(entry.target);
        const target = Number(entry.target.dataset.count);
        let currentValue = 0;
        const step = Math.max(1, Math.ceil(target / 18));
        const timer = setInterval(() => {
          currentValue += step;
          if (currentValue >= target) {
            currentValue = target;
            clearInterval(timer);
          }
          entry.target.textContent = String(currentValue);
        }, 45);
      });
    }, {threshold:.45});
    countNodes.forEach(n => observer.observe(n));
  }

  // Scroll reveal
  const revealTargets = document.querySelectorAll(".showcase-intro,.track-command,.service-carousel,.split-showcase,.facility-tease,.founder-strip,.coverage-marquee,.final-cta,.page-hero,.service-full,.process-stage,.tracking-console,.tracking-benefits,.business-story,.business-grid,.business-quote,.network-stage,.coverage-bottom,.facility-hero,.facility-grid,.facility-manifesto,.founder-hero-page,.founder-letter,.founder-values,.about-feature,.about-pillars,.about-counts,.contact-wrap,.contact-bottom");
  revealTargets.forEach(el => el.classList.add("reveal"));
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, {threshold:.12});
    revealTargets.forEach(el => revealObserver.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add("visible"));
  }

  // Service slider
  const serviceTrack = document.getElementById("serviceTrack");
  document.querySelector("[data-service-next]")?.addEventListener("click", () => {
    serviceTrack?.scrollBy({left: serviceTrack.clientWidth * .52, behavior:"smooth"});
  });
  document.querySelector("[data-service-prev]")?.addEventListener("click", () => {
    serviceTrack?.scrollBy({left: -serviceTrack.clientWidth * .52, behavior:"smooth"});
  });

  // Quick tracking
  const quickTrack = document.getElementById("quickTrack");
  if (quickTrack) {
    quickTrack.addEventListener("submit", e => {
      e.preventDefault();
      const value = document.getElementById("quickTrackInput").value.trim();
      const status = document.getElementById("quickTrackStatus");
      if (value.length < 6) {
        status.textContent = "Enter a valid tracking number.";
        return;
      }
      location.href = "tracking.html?tracking=" + encodeURIComponent(value);
    });
  }

  // Tracking page
  const trackingForm = document.getElementById("trackingForm");
  if (trackingForm) {
    const field = document.getElementById("trackingNumber");
    const error = document.getElementById("trackingError");
    const output = document.getElementById("trackingIdOutput");
    const params = new URLSearchParams(location.search);
    if (params.get("tracking")) field.value = params.get("tracking");

    trackingForm.addEventListener("submit", e => {
      e.preventDefault();
      const value = field.value.trim();
      if (value.length < 6) {
        error.textContent = "Enter a valid tracking number.";
        return;
      }
      error.textContent = "Shipment found.";
      output.textContent = value.toUpperCase();
    });
  }

  // Form validation
  const allowedDomains = new Set([
    "gmail.com","outlook.com","hotmail.com","yahoo.com",
    "icloud.com","protonmail.com","zoho.com","rediffmail.com"
  ]);
  const validEmail = value => {
    const email = value.trim().toLowerCase();
    const m = email.match(/^[a-z0-9._%+-]+@([a-z0-9-]+(?:\.[a-z0-9-]+)+)$/);
    return !!m && m[1].endsWith(".com") && allowedDomains.has(m[1]);
  };
  const validPhone = value => /^[6-9]\d{9}$/.test(value.trim().replace(/\s+/g,""));
  const validName = value => /^[A-Za-z][A-Za-z .'-]{2,49}$/.test(value.trim());

  function err(field, message) {
    field.classList.add("field-error");
    let note = field.parentElement.querySelector(".field-message");
    if (!note) {
      note = document.createElement("div");
      note.className = "field-message";
      field.parentElement.appendChild(note);
    }
    note.textContent = message;
  }
  function clear(field) {
    field.classList.remove("field-error");
    field.parentElement.querySelector(".field-message")?.remove();
  }

  document.querySelectorAll("form").forEach(form => {
    form.querySelectorAll("input,select,textarea").forEach(f => {
      f.addEventListener("input", () => clear(f));
      f.addEventListener("change", () => clear(f));
    });
  });

  const quoteForm = document.getElementById("quoteForm");
  if (quoteForm) {
    quoteForm.addEventListener("submit", e => {
      e.preventDefault();
      let ok = true;
      const name = quoteForm.elements.name;
      const phone = quoteForm.elements.phone;
      const email = quoteForm.elements.email;
      [name,phone,email,quoteForm.elements.service,quoteForm.elements.pickup,quoteForm.elements.delivery,quoteForm.elements.message].forEach(clear);

      if (!validName(name.value)) { err(name,"Enter a valid full name."); ok=false; }
      if (!validPhone(phone.value)) { err(phone,"Enter a valid 10-digit Indian mobile number."); ok=false; }
      if (!validEmail(email.value)) { err(email,"Use a valid .com email address from a recognised provider."); ok=false; }
      ["service","pickup","delivery","message"].forEach(key => {
        const f = quoteForm.elements[key];
        if (!f.value.trim()) { err(f,"This field is required."); ok=false; }
      });

      const status = document.getElementById("quoteStatus");
      if (!ok) {
        status.className = "form-status error";
        status.textContent = "Please correct the highlighted details.";
        return;
      }

      status.className = "form-status success";
      status.textContent = "Your quote request is ready. Opening your email client...";
      const subject = encodeURIComponent("Jahid Express Quote Request");
      const body = encodeURIComponent(
        `Name: ${name.value}\nPhone: ${phone.value}\nEmail: ${email.value}\nService: ${quoteForm.elements.service.value}\nPickup: ${quoteForm.elements.pickup.value}\nDelivery: ${quoteForm.elements.delivery.value}\nShipment details: ${quoteForm.elements.message.value}`
      );
      setTimeout(() => {
        location.href = `mailto:contact@jahidexpress.com?subject=${subject}&body=${body}`;
      }, 250);
    });
  }

  // Replace temporary image labels instantly once the images exist.
  document.querySelectorAll(".photo-frame img").forEach(img => {
    if (img.complete && img.naturalWidth > 0) img.parentElement.classList.add("has-image");
  });

  // Smooth anchor navigation on pages.
  document.querySelectorAll('a[href*="#"]').forEach(link => {
    link.addEventListener("click", () => nav?.classList.remove("open"));
  });

  // ===== FULL DESIGNER V2 INTERACTIONS =====

  // Add scroll progress bar.
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);

  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = max > 0 ? ((window.scrollY / max) * 100) + "%" : "0%";
  };
  window.addEventListener("scroll", updateProgress, {passive:true});
  updateProgress();

  // Make every real photo respond gently to pointer movement.
  document.querySelectorAll(".photo-frame.has-image, .photo-frame").forEach(frame => {
    const img = frame.querySelector("img");
    if (!img) return;

    const glow = document.createElement("span");
    glow.className = "parallax-glow";
    frame.appendChild(glow);

    if (matchMedia("(pointer:fine)").matches) {
      frame.addEventListener("pointermove", e => {
        const r = frame.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const px = x / r.width - .5;
        const py = y / r.height - .5;
        frame.style.setProperty("--mx", (x / r.width * 100) + "%");
        frame.style.setProperty("--my", (y / r.height * 100) + "%");
        img.style.transform = `scale(1.055) translate(${px * 10}px, ${py * 10}px)`;
        glow.style.left = x + "px";
        glow.style.top = y + "px";
        frame.classList.add("reactive", "image-active", "cursor-target");
      });
      frame.addEventListener("pointerleave", () => {
        img.style.transform = "";
        frame.classList.remove("reactive", "image-active");
      });
    }
  });

  // Make cards subtly tilt toward the cursor (desktop only).
  if (matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".service-slide,.facility-card,.team-card").forEach(card => {
      card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const rx = ((y / r.height) - .5) * -3;
        const ry = ((x / r.width) - .5) * 4;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  // Click pulse on buttons / links.
  document.querySelectorAll(".button,.nav-cta,.slider-controls button,.text-link").forEach(el => {
    el.addEventListener("click", e => {
      const pulse = document.createElement("span");
      pulse.style.cssText = `
        position:fixed; z-index:120; pointer-events:none; width:10px; height:10px; border-radius:50%;
        left:${e.clientX}px; top:${e.clientY}px; background:rgba(239,77,49,.35);
        transform:translate(-50%,-50%); transition:transform .6s ease, opacity .6s ease;
      `;
      document.body.appendChild(pulse);
      requestAnimationFrame(() => {
        pulse.style.transform = "translate(-50%,-50%) scale(13)";
        pulse.style.opacity = "0";
      });
      setTimeout(() => pulse.remove(), 650);
    });
  });

  // Horizontal sections can also be dragged with mouse/touch.
  document.querySelectorAll(".service-track,.facility-slider").forEach(track => {
    let down = false, startX = 0, scrollStart = 0;
    track.addEventListener("pointerdown", e => {
      down = true;
      startX = e.clientX;
      scrollStart = track.scrollLeft;
      track.setPointerCapture?.(e.pointerId);
    });
    track.addEventListener("pointermove", e => {
      if (!down) return;
      track.scrollLeft = scrollStart - (e.clientX - startX) * 1.2;
    });
    ["pointerup","pointercancel","pointerleave"].forEach(evt => track.addEventListener(evt, () => down = false));
  });

  // Gentle image zoom while hero is visible.
  const heroPhoto = document.querySelector(".hero-photo");
  if (heroPhoto && "IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) heroPhoto.classList.add("hero-reactive");
        else heroPhoto.classList.remove("hero-reactive");
      });
    }, {threshold:.1});
    heroObserver.observe(heroPhoto);
  }

  // Hero cursor-follow movement for heading area.
  const heroCenter = document.querySelector(".hero-center");
  if (heroCenter && matchMedia("(pointer:fine)").matches) {
    window.addEventListener("mousemove", e => {
      const rect = heroCenter.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom) return;
      const dx = (e.clientX - window.innerWidth / 2) / window.innerWidth;
      const dy = (e.clientY - window.innerHeight / 2) / window.innerHeight;
      heroCenter.style.transform = `translate(${dx * 5}px, ${dy * 4}px)`;
    });
  }
});
