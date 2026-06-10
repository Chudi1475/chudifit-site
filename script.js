// ===== ChudiFit interactions =====
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Current year in footer
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Night mode toggle
  var modeBtn = document.getElementById("modeToggle");
  if (modeBtn) {
    modeBtn.addEventListener("click", function () {
      var on = document.documentElement.classList.toggle("night");
      try { localStorage.setItem("chudifit-mode", on ? "night" : "day"); } catch (e) {}
    });
  }

  // Sticky header shadow
  var header = document.getElementById("header");
  var onScroll = function () {
    if (window.scrollY > 20) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile nav
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Staggered scroll reveals: delay each reveal by its position among reveal siblings.
  // The hero is skipped here; it runs its own load-in sequence via CSS (.hero .reveal delays).
  document.querySelectorAll(".reveal").forEach(function (el) {
    if (el.closest(".hero")) return;
    var parent = el.parentElement;
    if (!parent) return;
    var sibs = Array.prototype.filter.call(parent.children, function (c) {
      return c.classList && c.classList.contains("reveal");
    });
    var i = sibs.indexOf(el);
    if (i > 0 && !reduceMotion) {
      el.style.transitionDelay = (i * 0.2).toFixed(3) + "s";
    }
  });

  // Hero load-in: trigger the sequence shortly after the page is ready
  var hero = document.querySelector(".hero");
  if (hero && !reduceMotion) {
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        hero.classList.add("loaded");
      });
    });
  } else if (hero) {
    hero.classList.add("loaded");
  }

  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );
    reveals.forEach(function (el) {
      if (el.closest(".hero")) return; // hero runs its own load-in sequence
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // Parallax + fade on the hero as you scroll past it
  var heroInner = document.querySelector(".hero-inner");
  var heroGlow = document.querySelector(".hero-glow");
  var heroH = window.innerHeight;
  if ((heroInner || heroGlow) && !reduceMotion) {
    var ticking = false;
    var parallax = function () {
      var y = window.scrollY;
      if (y <= heroH) {
        if (heroInner) {
          heroInner.style.transform = "translateY(" + (y * 0.16).toFixed(1) + "px)";
          heroInner.style.opacity = String(Math.max(0, 1 - y / (heroH * 0.72)));
        }
        if (heroGlow) {
          heroGlow.style.transform = "translateY(" + (y * 0.32).toFixed(1) + "px)";
        }
      }
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
    window.addEventListener("resize", function () { heroH = window.innerHeight; }, { passive: true });
  }

  // Scroll-spy: highlight the nav link for the section in view
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var sections = navLinks
    .map(function (a) {
      var id = a.getAttribute("href").slice(1);
      var sec = document.getElementById(id);
      return sec ? { link: a, sec: sec } : null;
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove("active"); });
            var match = sections.filter(function (s) { return s.sec === entry.target; })[0];
            if (match) match.link.classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) { spy.observe(s.sec); });
  }
})();
