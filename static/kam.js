/* ---------------------------------------------------------------------------
   Kingdom Assembly Missions: page behaviour.
   The scrollcraft engine is untouched. Everything bespoke here is driven off
   the --sc-p custom property the engine publishes, or off plain observers.
   ------------------------------------------------------------------------- */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------- menu ---- */
  (function menu() {
    var panel = document.querySelector("[data-menu]");
    var open = document.querySelector("[data-menu-open]");
    var close = document.querySelector("[data-menu-close]");
    if (!panel || !open) return;

    var lastFocus = null;

    function setOpen(on) {
      panel.hidden = !on;
      open.setAttribute("aria-expanded", String(on));
      document.documentElement.style.overflow = on ? "hidden" : "";
      if (on) {
        lastFocus = document.activeElement;
        var first = panel.querySelector("a, button");
        if (first) first.focus();
      } else if (lastFocus) {
        lastFocus.focus();
      }
    }

    open.addEventListener("click", function () { setOpen(panel.hidden); });
    if (close) close.addEventListener("click", function () { setOpen(false); });
    panel.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) setOpen(false);
    });
    // Trap focus inside the panel while it is open.
    panel.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var items = panel.querySelectorAll("a[href], button:not([disabled])");
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  })();

  /* ------------------------------------------- the mending (signature) ---- */
  /* Nine shards plus a core piece fan from shared vertices, so they tile the vessel exactly.
     Scroll drives them home; the gold seams then draw themselves along every
     fracture. The engine publishes --sc-p on the act; the transforms are pure
     CSS calc against it. All this needs from JS is each seam's real length. */
  (function mending() {
    var fig = document.querySelector("[data-mend]");
    if (!fig) return;

    var seams = fig.querySelectorAll(".mend__seam");
    Array.prototype.forEach.call(seams, function (s) {
      var len;
      try { len = s.getTotalLength(); } catch (err) { len = 0; }
      if (!len) return;
      s.style.setProperty("--len", len);
      s.style.strokeDasharray = len;
    });

    if (reduced) fig.setAttribute("data-mend-static", "");
  })();

  /* ------------------------------------------------- reveal safety net ---- */
  /* The engine reveals on intersection, so a deep anchor or a jump to the end
     of the page can leave blocks ABOVE the viewport still at opacity 0. They
     recover as soon as the reader scrolls back up, but a reader who lands on
     an anchor and scrolls DOWN never sees them at all. Reveal anything already
     behind us on load. */
  (function revealBehind() {
    if (reduced) return;
    requestAnimationFrame(function () {
      var blocks = document.querySelectorAll("[data-sc-in], [data-sc-stagger] > *");
      Array.prototype.forEach.call(blocks, function (el) {
        if (el.getBoundingClientRect().bottom < 0) el.classList.add("sc-in");
      });
    });
  })();

  /* --------------------------------------------------- the outreach model - */
  /* A single gold line draws itself down the six stations as the reader
     travels the section, lighting each one as it arrives. */
  (function model() {
    var root = document.querySelector("[data-model]");
    if (!root) return;
    var fill = root.querySelector(".model__line i");
    var steps = Array.prototype.slice.call(root.querySelectorAll(".model__step"));
    if (!fill || !steps.length) return;

    if (reduced) {
      fill.style.setProperty("--draw", 1);
      steps.forEach(function (s) { s.classList.add("is-lit"); });
      return;
    }

    var ticking = false;

    function frame() {
      ticking = false;
      var r = root.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      // Start when the section's top passes 78% of the viewport, finish when
      // its bottom passes 42%. Both inside the fold, so it draws while read.
      var span = r.height + vh * 0.36;
      var travelled = vh * 0.78 - r.top;
      var p = Math.max(0, Math.min(1, travelled / span));
      fill.style.setProperty("--draw", p.toFixed(4));

      var lit = p * steps.length;
      steps.forEach(function (s, i) { s.classList.toggle("is-lit", lit > i + 0.15); });
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    frame();
  })();

  /* ------------------------------------------------------------- forms ---- */
  (function forms() {
    var all = document.querySelectorAll("form[data-kam-form]");
    if (!all.length) return;

    var endpoint = document.documentElement.getAttribute("data-endpoint") || "";
    var live = endpoint && endpoint !== "TBD";

    Array.prototype.forEach.call(all, function (form) {
      var status = form.querySelector(".form__status");
      var submit = form.querySelector('button[type="submit"]');

      function say(msg, kind) {
        if (!status) return;
        // The role and aria-live are already in the markup. A live region
        // created in the same tick as its content is generally not announced,
        // so only the text and the styling change here.
        status.hidden = false;
        status.className = "form__status form__status--" + kind;
        status.textContent = msg;
      }

      function labelFor(field) {
        var lab = form.querySelector('label[for="' + field.id + '"]');
        var txt = lab ? lab.textContent : field.name;
        return txt.replace(/\*/g, "").replace(/\(optional\)/i, "").trim();
      }

      function firstInvalid() {
        var fields = form.querySelectorAll("input[required], select[required], textarea[required]");
        for (var i = 0; i < fields.length; i++) {
          if (!fields[i].checkValidity()) return fields[i];
        }
        return null;
      }

      form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Honeypot: a real person never fills this.
        var hp = form.querySelector('input[name="_hp"]');
        if (hp && hp.value) { say("Thank you. Your message has been received.", "ok"); return; }

        var invalid = firstInvalid();
        if (invalid) {
          say("Please fill in " + labelFor(invalid) + " before sending.", "err");
          invalid.focus();
          if (status) status.focus();
          return;
        }

        if (!live) {
          say(
            "This form is not connected yet. Kingdom Assembly Missions is standing up its inbox now. " +
            "Please check back shortly, or reach us through the contact details on this site.",
            "err"
          );
          return;
        }

        var data = new FormData(form);
        data.append("_form", form.getAttribute("data-kam-form"));
        data.append("_page", location.pathname);

        if (submit) { submit.disabled = true; submit.dataset.label = submit.textContent; submit.textContent = "Sending"; }
        say("Sending.", "ok");

        fetch(endpoint, { method: "POST", body: data })
          .then(function (r) {
            if (!r.ok) throw new Error("bad status " + r.status);
            return r.json().catch(function () { return {}; });
          })
          .then(function () {
            form.reset();
            say(form.getAttribute("data-success") || "Thank you. Someone from KAM will be in touch.", "ok");
          })
          .catch(function () {
            say("That did not go through. Please try again, or reach us directly using the contact details on this site.", "err");
          })
          .finally(function () {
            if (submit) { submit.disabled = false; submit.textContent = submit.dataset.label || "Send"; }
          });
      });
    });
  })();

  /* --------------------------------------------------------- quick exit --- */
  /* On the safety page only. Replaces the current history entry so the page
     does not sit in the back button, and opens the real destination fresh. */
  (function quickExit() {
    var btn = document.querySelector("[data-exit]");
    if (!btn) return;
    function go() {
      // ONE destination. An earlier version also opened a second tab, which is
      // the opposite of what a quick exit is for: it left two tabs open and the
      // foreground one on a Google CAPTCHA interstitial.
      location.replace("https://www.weather.com/");
    }
    btn.addEventListener("click", go);
    document.addEventListener("keydown", function (e) {
      // Three quick Escapes leaves the page, for anyone who cannot reach the button.
      if (e.key !== "Escape") return;
      quickExit.n = (quickExit.n || 0) + 1;
      clearTimeout(quickExit.t);
      quickExit.t = setTimeout(function () { quickExit.n = 0; }, 900);
      if (quickExit.n >= 3) go();
    });
  })();
})();
