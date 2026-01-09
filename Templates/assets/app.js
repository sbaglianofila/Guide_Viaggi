/* =========================
   Guida Viaggi - JS Vanilla
   - Theme toggle (persist)
   - Year auto
   - Index search (index.html)
   - Optional sections auto-hide
   - Auto-generated TOC for visible sections
   - Scroll to top
   ========================= */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------- Theme ----------
  const THEME_KEY = "gv-theme"; // "light" | "dark"
  const root = document.documentElement;

  function applyTheme(theme) {
    // Theme is stored as "light" or "dark"
    root.setAttribute("data-theme", theme);
    const btn = $('[data-action="toggle-theme"]');
    if (btn) btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") {
      applyTheme(saved);
      return;
    }
    // Default: follow system preference (if available); fallback dark
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    applyTheme(prefersLight ? "light" : "dark");
  }

  function toggleTheme() {
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  // ---------- Utils ----------
  function setYear() {
    $$("[data-year]").forEach((el) => (el.textContent = String(new Date().getFullYear())));
  }

  function isSectionEmpty(section) {
    // Consider empty if it has no meaningful text AND no meaningful elements (ul/li etc)
    // We'll ignore headings (h2) when checking.
    const clone = section.cloneNode(true);
    $$(".section h2, .section h1, .section h3", clone).forEach((h) => h.remove());

    const text = clone.textContent.replace(/\s+/g, " ").trim();
    const hasMedia = clone.querySelector("img, video, iframe, table");
    const hasList = clone.querySelector("ul, ol, li");
    const hasAnyBlock = clone.querySelector(".attraction, p, blockquote, pre, code");

    return !text && !hasMedia && !hasList && !hasAnyBlock;
  }

  // ---------- Optional sections hide ----------
  function processOptionalSections() {
    const sections = $$(".section");
    if (!sections.length) return;

    sections.forEach((sec) => {
      const forceHide = sec.dataset.hide === "true";
      const empty = isSectionEmpty(sec);
      if (forceHide || empty) {
        sec.hidden = true;
        sec.setAttribute("aria-hidden", "true");
      }
    });
  }

  // ---------- TOC generation ----------
  function buildTOC() {
    const tocList = $("[data-toc]");
    if (!tocList) return;

    // Visible sections only (not [hidden])
    const visibleSections = $$(".section").filter((sec) => !sec.hidden);

    tocList.innerHTML = "";
    visibleSections.forEach((sec) => {
      // Ensure it has an id
      if (!sec.id) return;

      const heading = $("h2, h3", sec);
      const label = heading ? heading.textContent.trim() : sec.id;

      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${sec.id}`;
      a.textContent = label;

      li.appendChild(a);
      tocList.appendChild(li);
    });

    // If no sections remain, hide the TOC container
    const tocCard = tocList.closest(".toc-card");
    if (tocCard && visibleSections.length === 0) {
      tocCard.hidden = true;
      tocCard.setAttribute("aria-hidden", "true");
    }
  }

  // ---------- Index search ----------
  function initIndexSearch() {
    const input = $("#search");
    if (!input) return;

    const cards = $$(".location");
    function normalize(s) {
      return (s || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
    }

    input.addEventListener("input", () => {
      const q = normalize(input.value);
      cards.forEach((card) => {
        const text = normalize(card.textContent);
        const match = text.includes(q);
        card.style.display = match ? "" : "none";
      });
    });
  }

  // ---------- Scroll to top ----------
  function initScrollTop() {
    const btn = $('[data-action="scroll-top"]');
    if (!btn) return;
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ---------- Events ----------
  function initActions() {
    $$('[data-action="toggle-theme"]').forEach((btn) => {
      btn.addEventListener("click", toggleTheme);
    });
  }

  // ---------- Init ----------
  initTheme();
  setYear();
  initActions();
  initIndexSearch();

  // Page-locality features:
  processOptionalSections();
  buildTOC();
  initScrollTop();
})();
