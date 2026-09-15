/*!
 * medlem123.no — egen, vanilla JS (2026-09-09)
 * Erstatter jQuery 3.5.1 + Bootstrap-JS-bundle + jQuery Easing + jqBootstrapValidation.
 * Anker-scroll er ren CSS (scroll-behavior:smooth) — trenger ingen JS her.
 */
(function () {
  "use strict";

  // Lys/mørk-bryter (r003, 2026-09-15). Det innledende, blokkerende scriptet i
  // <head> har allerede satt data-theme FØR denne filen laster (unngår FOUC) -
  // her håndteres kun selve klikket + lagring + ikon/aria-oppdatering.
  var THEME_KEY = "medlem123-theme";
  var themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    var icon = themeToggle.querySelector("i");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    function effectiveTheme() {
      var manual = document.documentElement.getAttribute("data-theme");
      if (manual === "light" || manual === "dark") return manual;
      return prefersDark.matches ? "dark" : "light";
    }

    function syncButton() {
      var current = effectiveTheme();
      var isDark = current === "dark";
      icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Bytt til lyst utseende" : "Bytt til mørkt utseende"
      );
    }

    themeToggle.addEventListener("click", function () {
      var next = effectiveTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        // Privat nettlesing/blokkert storage: valget virker fortsatt for denne
        // sideinnlastingen, bare ikke husket til neste besøk. Ikke kritisk.
      }
      syncButton();
    });

    // Hvis brukeren ALDRI har trykket bryteren (intet lagret valg), skal siden
    // fortsette å følge systemet live - f.eks. hvis de bytter macOS mellom lys/
    // mørk mens siden står åpen i en fane.
    prefersDark.addEventListener("change", function () {
      if (!document.documentElement.hasAttribute("data-theme")) syncButton();
    });

    syncButton();
  }

  // Responsiv nav: åpne/lukk
  var toggler = document.querySelector(".navbar-toggler");
  var collapse = document.getElementById("navbarResponsive");
  if (toggler && collapse) {
    toggler.addEventListener("click", function () {
      collapse.classList.toggle("show");
    });
    // Lukk menyen når en lenke klikkes (mobil)
    collapse.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        collapse.classList.remove("show");
      });
    });
  }

  // Aktiv nav-lenke basert på hvilken seksjon som er synlig (erstatter Bootstrap scrollspy)
  var sections = document.querySelectorAll("section[id], header[id]");
  var navLinks = document.querySelectorAll(".nav-link");
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    navLinks.forEach(function (l) {
      var id = l.getAttribute("href");
      if (id && id.charAt(0) === "#") byId[id.slice(1)] = l;
    });
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = byId[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove("active"); });
            link.classList.add("active");
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(function (s) { observer.observe(s); });
  }

  // Vis/skjul "scroll til topp"-knapp
  var scrollTopBtn = document.querySelector(".scroll-to-top");
  if (scrollTopBtn) {
    window.addEventListener("scroll", function () {
      scrollTopBtn.classList.toggle("show", window.scrollY > 100);
    });
  }

  // Portfolio-modaler (native <dialog> — ingen Bootstrap/Popper nødvendig)
  document.querySelectorAll("[data-open-modal]").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var dialog = document.getElementById(trigger.getAttribute("data-open-modal"));
      if (dialog && typeof dialog.showModal === "function") dialog.showModal();
    });
  });
  document.querySelectorAll("dialog.portfolio-modal").forEach(function (dialog) {
    dialog.querySelectorAll("[data-close-modal]").forEach(function (btn) {
      btn.addEventListener("click", function () { dialog.close(); });
    });
    // Lukk ved klikk utenfor selve modal-innholdet (på backdrop)
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });
  });
})();
