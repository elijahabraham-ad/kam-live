/* ---------------------------------------------------------------------------
   Kingdom Assembly Missions: page behaviour.
   Menu, forms, and tap-to-play video. The scrollcraft engine is untouched.
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
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) setOpen(false);
    });
    // Keep focus inside the panel while it is open.
    panel.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var items = panel.querySelectorAll("a[href], button:not([disabled])");
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  })();

  /* ------------------------------------------------- reveal safety net ---- */
  /* The engine reveals on intersection, so landing on an anchor can leave
     blocks ABOVE the viewport at opacity 0. Reveal anything already behind
     the reader on load. */
  (function revealBehind() {
    if (reduced) return;
    requestAnimationFrame(function () {
      var blocks = document.querySelectorAll("[data-sc-in], [data-sc-stagger] > *");
      Array.prototype.forEach.call(blocks, function (el) {
        if (el.getBoundingClientRect().bottom < 0) el.classList.add("sc-in");
      });
    });
  })();

  /* ---------------------------------------------- preselect a topic ------ */
  /* JOIN BIBLE STUDY falls back to /get-involved/?topic=...#contact until the
     Zoom link is in config. Choose that topic so the visitor only has to add
     their name and email. */
  (function topic() {
    var want = new URLSearchParams(location.search).get("topic");
    if (!want) return;
    var sel = document.querySelector('#contact select[name="topic"]');
    if (!sel) return;
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === want) { sel.selectedIndex = i; break; }
    }
    var msg = document.querySelector('#contact textarea[name="message"]');
    if (msg && !msg.value && /bible/i.test(want)) msg.value = "I would like to join the Bible study.";
  })();

  /* ------------------------------------------------------------- forms ---- */
  (function forms() {
    var all = document.querySelectorAll("form[data-kam-form]");
    if (!all.length) return;

    var root = document.documentElement;
    var endpoint = root.getAttribute("data-endpoint") || "";
    var live = endpoint && endpoint !== "TBD";
    var inbox = root.getAttribute("data-email") || "";
    var SUBJECT = { contact: "Message from the website", volunteer: "Volunteer" };

    Array.prototype.forEach.call(all, function (form) {
      var status = form.querySelector(".form__status");
      var submit = form.querySelector('button[type="submit"]');

      function say(msg, kind) {
        if (!status) return;
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

      // No backend: offer the same message as an email from the visitor's own
      // app. Built with nodes, never innerHTML, because it carries visitor text.
      function emailInstead(kind) {
        var lines = [], fd = new FormData(form);
        fd.forEach(function (v, k) {
          if (k === "_hp" || v === "" || v == null) return;
          var f = form.querySelector('[name="' + k + '"]');
          if (f && f.type === "checkbox") {
            var set = f.closest("fieldset");
            var legend = set && set.querySelector("legend");
            lines.push((legend ? legend.textContent.trim() : k) + ": " + v);
            return;
          }
          lines.push((f ? labelFor(f) : k) + ": " + v);
        });
        var body = lines.join("\n\n");
        if (encodeURIComponent(body).length > 1500) {
          while (body.length && encodeURIComponent(body + "...").length > 1500) body = body.slice(0, -20);
          body += "...";
        }
        var href = "mailto:" + inbox + "?subject=" + encodeURIComponent((SUBJECT[kind] || "Message from the website") + " (kingdomassemblymissions.org)") +
          "&body=" + encodeURIComponent(body);

        status.hidden = false;
        status.className = "form__status form__status--err";
        status.textContent = "";
        status.appendChild(document.createTextNode("Our online form is not connected yet, so this has not been sent. Send the same message from your own email instead:"));
        var row = document.createElement("span");
        row.className = "form__fallback";
        var a = document.createElement("a");
        a.className = "btn btn--gold";
        a.href = href;
        a.textContent = "Email this to KAM";
        row.appendChild(a);
        status.appendChild(row);
        status.appendChild(document.createTextNode("Or write to " + inbox + " directly."));
      }

      form.addEventListener("submit", function (e) {
        e.preventDefault();

        var hp = form.querySelector('input[name="_hp"]');
        if (hp && hp.value) { say("Thank you. Your message has been received.", "ok"); return; }

        var invalid = firstInvalid();
        if (invalid) {
          say("Please fill in " + labelFor(invalid) + " before sending.", "err");
          invalid.focus();
          return;
        }

        var kind = form.getAttribute("data-kam-form");
        if (!live) {
          if (inbox) emailInstead(kind);
          else say("This form is not connected yet, so nothing was sent.", "err");
          return;
        }

        var data = new FormData(form);
        data.append("_form", kind);
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
            say("That did not go through. Please try again, or email " + (inbox || "us") + " directly.", "err");
          })
          .finally(function () {
            if (submit) { submit.disabled = false; submit.textContent = submit.dataset.label || "Send"; }
          });
      });
    });
  })();

  /* ------------------------------------------------- photos and video --- */
  /* Clips are tap-to-play; starting one pauses any other. */
  (function media() {
    var clips = document.querySelectorAll(".shot video");
    clips.forEach(function (v) {
      v.addEventListener("play", function () {
        clips.forEach(function (o) { if (o !== v && !o.paused) o.pause(); });
      });
    });
  })();
})();
