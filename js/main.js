(function () {
  var drawer = document.getElementById("mobile-drawer");
  var toggle = document.getElementById("menu-toggle");
  var backdrop = document.querySelector(".drawer-backdrop");

  function setOpen(open) {
    if (!drawer || !toggle) return;
    drawer.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setOpen(!drawer.classList.contains("is-open"));
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", function () {
      setOpen(false);
    });
  }

  document.querySelectorAll(".drawer-nav a").forEach(function (link) {
    link.addEventListener("click", function () {
      setOpen(false);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });

  /* Fees / Eligibility tabs */
  var tabBtns = document.querySelectorAll(".tab-switch .tab-btn");
  var tabPanels = document.querySelectorAll(".fees-inner .tab-panel");

  function setTab(activeBtn) {
    if (!activeBtn) return;
    var targetId = activeBtn.getAttribute("aria-controls");
    tabBtns.forEach(function (b) {
      var on = b === activeBtn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    tabPanels.forEach(function (p) {
      var on = p.id === targetId;
      p.classList.toggle("is-active", on);
    });

    var isFees = targetId === "panel-fees";
    var sec = document.getElementById("fees-eligibility");
    var bgFees = document.querySelector(".fees-bg-panel--fees");
    var bgElig = document.querySelector(".fees-bg-panel--elig");
    if (bgFees) bgFees.classList.toggle("is-active", isFees);
    if (bgElig) bgElig.classList.toggle("is-active", !isFees);
    if (sec) {
      sec.classList.toggle("section--fees--view-fees", isFees);
      sec.classList.toggle("section--fees--view-elig", !isFees);
      sec.setAttribute("data-fees-view", isFees ? "fees" : "elig");
    }
  }

  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setTab(btn);
    });
  });

  /* FAQ accordion */
  document.querySelectorAll(".faq-item button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      var wasOpen = item.classList.contains("is-open");
      document.querySelectorAll(".faq-item").forEach(function (el) {
        el.classList.remove("is-open");
        var b = el.querySelector("button");
        if (b) b.setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* Faculty carousel — scroll distance matches card width + gap */
  var carousel = document.querySelector("[data-faculty-carousel]");
  if (carousel) {
    var track = carousel.querySelector(".fac-track");
    var prev = carousel.querySelector(".fac-prev");
    var next = carousel.querySelector(".fac-next");

    function scrollStep() {
      if (!track) return 280;
      var card = track.querySelector(".fac-person");
      if (!card) return 280;
      var gapRaw = window.getComputedStyle(track).gap || window.getComputedStyle(track).columnGap;
      var gap = parseFloat(gapRaw) || 18;
      return Math.round(card.getBoundingClientRect().width + gap);
    }

    function scrollBy(delta) {
      if (!track) return;
      track.scrollBy({ left: delta, behavior: "smooth" });
    }

    if (prev) prev.addEventListener("click", function () {
      scrollBy(-scrollStep());
    });
    if (next) next.addEventListener("click", function () {
      scrollBy(scrollStep());
    });
  }

  /* Highlights carousel — dot pagination + prev/next */
  (function () {
    var root = document.querySelector("[data-highlights-carousel]");
    if (!root) return;

    var viewport = root.querySelector(".highlights-carousel-viewport");
    var track = root.querySelector("[data-highlights-track]");
    var dotsWrap = root.querySelector("[data-highlights-dots]");
    var prevBtn = root.querySelector(".hi-prev");
    var nextBtn = root.querySelector(".hi-next");

    var currentPage = 0;
    var prefersReduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function cardList() {
      return track ? Array.prototype.slice.call(track.querySelectorAll(".hi-card")) : [];
    }

    function getCardsPerView() {
      var w = window.innerWidth;
      if (w >= 1100) return 4;
      if (w >= 768) return 3;
      if (w >= 480) return 2;
      return 1;
    }

    function getGapPx() {
      if (!track) return 24;
      var cs = window.getComputedStyle(track);
      var n = parseFloat(cs.columnGap || cs.gap || "0");
      return isNaN(n) ? 24 : n;
    }

    function layoutCards() {
      if (!viewport || !track) return;
      var list = cardList();
      var per = getCardsPerView();
      var vw = viewport.getBoundingClientRect().width;
      var gap = getGapPx();
      var totalGap = (per - 1) * gap;
      var cardW = Math.floor(((vw - totalGap) / per) * 100) / 100;
      list.forEach(function (card) {
        card.style.flexBasis = cardW + "px";
        card.style.width = cardW + "px";
        card.style.minWidth = cardW + "px";
      });
    }

    function pageCount() {
      var list = cardList();
      var per = getCardsPerView();
      if (!list.length || per < 1) return 1;
      return Math.max(1, Math.ceil(list.length / per));
    }

    function maxPageIndex() {
      return pageCount() - 1;
    }

    function updateChromeVisibility() {
      var single = pageCount() <= 1;
      if (dotsWrap) dotsWrap.hidden = single;
      if (prevBtn) prevBtn.hidden = single;
      if (nextBtn) nextBtn.hidden = single;
    }

    function updateDots() {
      if (!dotsWrap) return;
      var dots = dotsWrap.querySelectorAll(".hi-dot");
      dots.forEach(function (d, i) {
        var on = i === currentPage;
        d.classList.toggle("is-active", on);
        d.setAttribute("aria-selected", on ? "true" : "false");
      });
    }

    function updateNavDisabled() {
      var maxIdx = maxPageIndex();
      if (prevBtn) prevBtn.disabled = currentPage <= 0;
      if (nextBtn) nextBtn.disabled = currentPage >= maxIdx;
    }

    function goToPage(page) {
      if (!track || !viewport) return;
      var list = cardList();
      if (!list.length) return;

      var per = getCardsPerView();
      var maxIdx = maxPageIndex();
      currentPage = Math.max(0, Math.min(page, maxIdx));

      var start = currentPage * per;
      if (start >= list.length) {
        currentPage = maxIdx;
        start = currentPage * per;
      }

      var x = list[start] ? list[start].offsetLeft : 0;
      if (prefersReduced) {
        track.style.transition = "none";
      } else {
        track.style.removeProperty("transition");
      }
      track.style.transform = "translate3d(-" + x + "px, 0, 0)";

      updateDots();
      updateNavDisabled();
    }

    function rebuildDots() {
      if (!dotsWrap) return;
      var n = pageCount();
      dotsWrap.innerHTML = "";
      for (var i = 0; i < n; i++) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "hi-dot" + (i === currentPage ? " is-active" : "");
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-selected", i === currentPage ? "true" : "false");
        btn.setAttribute("aria-label", "Go to page " + (i + 1) + " of " + n);
        (function (idx) {
          btn.addEventListener("click", function () {
            goToPage(idx);
          });
        })(i);
        dotsWrap.appendChild(btn);
      }
    }

    function refresh() {
      layoutCards();
      rebuildDots();
      if (currentPage > maxPageIndex()) currentPage = maxPageIndex();
      updateChromeVisibility();
      goToPage(currentPage);
    }

    function debounce(fn, ms) {
      var t;
      return function () {
        clearTimeout(t);
        t = setTimeout(fn, ms);
      };
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goToPage(currentPage - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goToPage(currentPage + 1);
      });
    }

    window.addEventListener("resize", debounce(refresh, 100));

    if (window.ResizeObserver && viewport) {
      var ro = new ResizeObserver(
        debounce(function () {
          layoutCards();
          goToPage(currentPage);
        }, 60)
      );
      ro.observe(viewport);
    }

    requestAnimationFrame(function () {
      refresh();
    });
    window.addEventListener("load", function () {
      refresh();
    });
  })();
})();
