/* Kernel portal — behavior */
(function () {
  "use strict";

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem("kernel-theme"); } catch (e) {}
  if (stored === "dark") root.classList.add("dark");
  if (stored === "light") root.classList.remove("dark");

  function toggleTheme() {
    var dark = root.classList.toggle("dark");
    try { localStorage.setItem("kernel-theme", dark ? "dark" : "light"); } catch (e) {}
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-theme-toggle]");
    if (t) { toggleTheme(); }
  });

  /* ---------- Toast ---------- */
  var toast = document.getElementById("toast");
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.querySelector(".toast-msg").textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1600);
  }

  function copyText(text, label) {
    var done = function () { showToast((label || "Copied") + " — " + text); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta); done();
    }
  }

  /* ---------- Click-to-copy (swatches, tokens) ---------- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-copy]");
    if (!el) return;
    copyText(el.getAttribute("data-copy"), el.getAttribute("data-copy-label") || "Copied");
  });

  /* ---------- Copy buttons (code blocks) ---------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".copy-btn");
    if (!btn) return;
    var sel = btn.getAttribute("data-copy-target");
    var text = "";
    if (sel) {
      var src = document.querySelector(sel);
      if (src) text = src.textContent;
    } else if (btn.getAttribute("data-copy")) {
      text = btn.getAttribute("data-copy");
    }
    copyText(text.trim(), "Copied");
    var labelEl = btn.querySelector(".copy-btn-label");
    var prev = labelEl ? labelEl.textContent : null;
    btn.classList.add("copied");
    if (labelEl) labelEl.textContent = "Copied";
    setTimeout(function () {
      btn.classList.remove("copied");
      if (labelEl && prev !== null) labelEl.textContent = prev;
    }, 1400);
  });

  /* ---------- Tabs ---------- */
  document.addEventListener("click", function (e) {
    var tab = e.target.closest(".tab");
    if (!tab) return;
    var list = tab.closest(".tabs");
    if (!list) return;
    list.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("active"); });
    tab.classList.add("active");
    var panelId = tab.getAttribute("data-tab");
    list.querySelectorAll(".tab-panel").forEach(function (p) {
      p.hidden = p.getAttribute("data-panel") !== panelId;
    });
  });

  /* ---------- Accordion ---------- */
  document.addEventListener("click", function (e) {
    var head = e.target.closest(".acc-head");
    if (!head) return;
    var item = head.closest(".acc-item");
    var acc = item.closest(".accordion");
    var wasOpen = item.classList.contains("open");
    acc.querySelectorAll(".acc-item").forEach(function (i) { i.classList.remove("open"); });
    if (!wasOpen) item.classList.add("open");
  });

  /* ---------- Collapsible ---------- */
  document.addEventListener("click", function (e) {
    var head = e.target.closest(".collapsible-head");
    if (!head) return;
    var body = head.parentElement.querySelector(".collapsible-body");
    if (body) body.hidden = !body.hidden;
  });

  /* ---------- Motion token tracks (foundation demo) ---------- */
  document.addEventListener("click", function (e) {
    var track = e.target.closest(".motion-track");
    if (!track) return;
    var dot = track.querySelector(".motion-dot");
    if (dot) dot.style.transition = "left " + track.getAttribute("data-dur") + " " + track.getAttribute("data-ease");
    track.classList.toggle("on");
  });

  /* ---------- Table playground (density / style) ---------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-dt-set]");
    if (!btn) return;
    var group = btn.closest("[data-dt-group]");
    var targetSel = group.getAttribute("data-dt-target");
    var table = document.querySelector(targetSel);
    if (!table) return;
    var kind = group.getAttribute("data-dt-group"); // "density" | "style"
    var value = btn.getAttribute("data-dt-set");
    group.querySelectorAll("[data-dt-set]").forEach(function (b) { b.classList.remove("on"); });
    btn.classList.add("on");
    if (kind === "density") {
      table.classList.remove("density-compact", "density-comfortable");
      if (value !== "default") table.classList.add("density-" + value);
    } else {
      table.classList.remove("striped", "bordered", "borderless");
      if (value !== "default") table.classList.add(value);
    }
  });

  /* ---------- Expandable table rows ---------- */
  document.addEventListener("click", function (e) {
    var caret = e.target.closest(".dt-caret");
    if (!caret) return;
    var row = caret.closest("tr");
    var panel = row.nextElementSibling;
    if (!panel || !panel.classList.contains("dt-expand-row")) return;
    var open = caret.classList.toggle("open");
    row.classList.toggle("expanded", open);
    panel.hidden = !open;
  });

  /* ---------- Mobile nav drawer ---------- */
  var navToggle = document.querySelector("[data-nav-toggle]");
  function setNav(open) {
    document.body.classList.toggle("nav-open", open);
    if (navToggle) navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-nav-toggle]")) {
      setNav(!document.body.classList.contains("nav-open"));
      return;
    }
    if (e.target.closest("[data-nav-close]")) { setNav(false); return; }
    var link = e.target.closest(".sidebar a");
    if (link && document.body.classList.contains("nav-open")) setNav(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) setNav(false);
  });

  /* ---------- Per-page hash router (decision 0011) ----------
     Each side-rail item is its own page: only the active <section> is
     shown. A sub-anchor (e.g. #c-input, #fe-selection) resolves to the
     section that contains it, then scrolls to that element. */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-link[data-section]"));
  var pages = Array.prototype.slice.call(document.querySelectorAll("main.content .section"));

  // id (section id OR any descendant element id) -> owning section id
  var ownerOf = {};
  pages.forEach(function (sec) {
    ownerOf[sec.id] = sec.id;
    sec.querySelectorAll("[id]").forEach(function (el) {
      if (!ownerOf[el.id]) ownerOf[el.id] = sec.id;
    });
  });

  var DEFAULT_PAGE = pages.length ? pages[0].id : "overview";

  function resolve(hash) {
    var raw = (hash || "").replace(/^#/, "");
    if (!raw) return { page: DEFAULT_PAGE, target: null };
    var owner = ownerOf[raw];
    if (!owner) return { page: DEFAULT_PAGE, target: null };
    return { page: owner, target: raw === owner ? null : raw };
  }

  function showPage(pageId, targetId) {
    pages.forEach(function (sec) {
      sec.classList.toggle("is-active", sec.id === pageId);
    });
    links.forEach(function (l) {
      l.classList.toggle("active", l.getAttribute("data-section") === pageId);
    });
    var crumb = document.getElementById("crumb-section");
    var active = links.find(function (l) { return l.getAttribute("data-section") === pageId; });
    if (crumb && active) crumb.textContent = active.getAttribute("data-title") || active.textContent.trim();

    renderPager(pageId);

    if (targetId) {
      var el = document.getElementById(targetId);
      if (el) { el.scrollIntoView({ block: "start" }); return; }
    }
    window.scrollTo(0, 0);
  }

  /* Sequential prev/next pager (mobile doc pattern) — walks the rail order. */
  var pager = document.getElementById("doc-pager");
  function pagerCard(dir, link) {
    var page = link.getAttribute("data-section");
    var title = link.getAttribute("data-title") || link.textContent.trim();
    var isNext = dir === "next";
    var chevron = isNext
      ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"/></svg>';
    var label = '<span class="dp-label">' + (isNext ? "Next" : "Previous") + '</span>';
    var name = '<span class="dp-title">' + title + '</span>';
    var text = '<span class="dp-text">' + label + name + '</span>';
    return '<a class="dp-card dp-' + dir + '" href="#' + page + '">' +
      (isNext ? text + chevron : chevron + text) + '</a>';
  }
  function renderPager(pageId) {
    if (!pager) return;
    var i = links.findIndex(function (l) { return l.getAttribute("data-section") === pageId; });
    if (i < 0) { pager.innerHTML = ""; return; }
    var html = "";
    html += i > 0 ? pagerCard("prev", links[i - 1]) : '<span class="dp-spacer"></span>';
    if (i < links.length - 1) html += pagerCard("next", links[i + 1]);
    pager.innerHTML = html;
  }

  function route() {
    var r = resolve(window.location.hash);
    showPage(r.page, r.target);
  }

  window.addEventListener("hashchange", route);
  route();
})();
