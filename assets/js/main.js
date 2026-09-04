/* ============================================================================
   Evans Marketing — site behaviour
   Three independent pieces, each a no-op on pages that don't contain them:
     1. the Services accordion (single-open)
     2. the Contact form (validation + submit state)
     3. the Home hero parallax
   ========================================================================== */
(function () {
  "use strict";

  /* --------------------------------------------------------------------------
     1. Services accordion — single-open disclosure.
     One row is open at a time. Clicking the open row closes it, leaving none
     open. State lives on the DOM (the `is-open` class + `aria-expanded`), so
     there is nothing to keep in sync.
     ----------------------------------------------------------------------- */
  function initAccordion() {
    var items = document.querySelectorAll(".acc-item");
    if (!items.length) return;

    function setOpen(item, open) {
      item.classList.toggle("is-open", open);
      var trigger = item.querySelector(".acc-trigger");
      var marker = item.querySelector(".acc-marker");
      if (trigger) trigger.setAttribute("aria-expanded", open ? "true" : "false");
      // En dash when open, plus when closed — the only glyphs in the design.
      if (marker) marker.textContent = open ? "–" : "+";
    }

    Array.prototype.forEach.call(items, function (item) {
      var trigger = item.querySelector(".acc-trigger");
      if (!trigger) return;

      trigger.addEventListener("click", function () {
        var willOpen = !item.classList.contains("is-open");
        Array.prototype.forEach.call(items, function (other) {
          setOpen(other, false);
        });
        setOpen(item, willOpen);
      });
    });
  }

  /* --------------------------------------------------------------------------
     2. Contact form.
     There is no backend yet. Set data-endpoint on the <form> to a form service
     (Formspree, Netlify Forms, your own handler) and the fields are POSTed
     there; with no endpoint the form validates and shows the thank-you state
     without sending anything. See README.md.
     ----------------------------------------------------------------------- */
  function initContactForm() {
    var form = document.querySelector(".contact-form");
    if (!form) return;

    var status = form.querySelector(".form__status");
    var submit = form.querySelector('button[type="submit"]');
    var message = form.querySelector('textarea[name="message"]');
    var counter = form.querySelector(".field__counter");

    function fieldOf(input) { return input.closest(".field"); }

    function showError(input, text) {
      var field = fieldOf(input);
      if (!field) return;
      field.classList.add("has-error");
      var slot = field.querySelector(".field__error");
      if (slot) slot.textContent = text;
      input.setAttribute("aria-invalid", "true");
    }

    function clearError(input) {
      var field = fieldOf(input);
      if (!field) return;
      field.classList.remove("has-error");
      var slot = field.querySelector(".field__error");
      if (slot) slot.textContent = "";
      input.removeAttribute("aria-invalid");
    }

    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    // Digits, spaces and the usual punctuation; at least 7 digits overall.
    var PHONE = /^[0-9+()\-.\s]{7,}$/;

    function validate(input) {
      var value = input.value.trim();

      if (input.required && !value) {
        showError(input, "Required");
        return false;
      }
      if (input.type === "email" && value && !EMAIL.test(value)) {
        showError(input, "Enter a valid email address");
        return false;
      }
      if (input.type === "tel" && value) {
        var digits = value.replace(/\D/g, "");
        if (!PHONE.test(value) || digits.length < 7) {
          showError(input, "Enter a valid phone number");
          return false;
        }
      }
      if (input.maxLength > 0 && value.length > input.maxLength) {
        showError(input, "Too long");
        return false;
      }
      clearError(input);
      return true;
    }

    var inputs = form.querySelectorAll("input, textarea");

    Array.prototype.forEach.call(inputs, function (input) {
      // Only re-validate on blur once the field has been touched, so the form
      // doesn't shout at someone who is still filling it in.
      input.addEventListener("blur", function () { validate(input); });
      input.addEventListener("input", function () {
        if (fieldOf(input) && fieldOf(input).classList.contains("has-error")) {
          validate(input);
        }
      });
    });

    // Live character count for the 600-character message cap.
    if (message && counter) {
      var updateCounter = function () {
        counter.textContent = message.value.length + " / " + message.maxLength;
      };
      message.addEventListener("input", updateCounter);
      updateCounter();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var firstInvalid = null;
      Array.prototype.forEach.call(inputs, function (input) {
        if (!validate(input) && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        if (status) status.textContent = "Please check the highlighted fields.";
        firstInvalid.focus();
        return;
      }

      var endpoint = form.getAttribute("data-endpoint");

      if (!endpoint) {
        // No backend wired up yet — confirm locally so the page still works.
        if (submit) {
          submit.textContent = "Thank you — we'll be in touch";
          submit.disabled = true;
        }
        if (status) {
          status.textContent =
            "This form is not connected to an inbox yet. See README.md to point " +
            "it at a form service.";
        }
        return;
      }

      if (submit) {
        submit.disabled = true;
        submit.textContent = "Sending…";
      }
      if (status) status.textContent = "";

      fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Request failed");
          form.reset();
          if (counter && message) {
            counter.textContent = "0 / " + message.maxLength;
          }
          if (submit) submit.textContent = "Thank you — we'll be in touch";
          if (status) status.textContent = "Your message is on its way.";
        })
        .catch(function () {
          if (submit) {
            submit.disabled = false;
            submit.textContent = "Submit";
          }
          if (status) {
            status.textContent =
              "Something went wrong. Please email hello@evansmarketing.ca instead.";
          }
        });
    });
  }

  /* --------------------------------------------------------------------------
     3. Hero parallax (Home only).
     The headline slab drifts a few pixels toward the cursor and lifts away on
     scroll. Both listeners are passive and coalesced through a single
     requestAnimationFrame, so pointer movement costs one style write per frame.
     Writes go to the slab wrapper only — the headline itself owns the CSS
     animations and must not be touched.
     ----------------------------------------------------------------------- */
  function initHeroParallax() {
    var slab = document.getElementById("heroSlab");
    if (!slab) return;

    // Reduced motion: attach nothing at all, leaving a static headline.
    if (window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var mx = 0, my = 0, sy = 0, raf = null;

    function frame() {
      raf = null;
      var damp = Math.max(0, 1 - sy / 620);   // parallax dies off as the hero leaves
      var x = mx * 10 * damp;
      var y = my * 6 * damp - sy * 0.08;      // the slab also lifts with scroll
      var scale = 1 + mx * 0.004 * damp;
      slab.style.transform =
        "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2) + "px,0) " +
        "scale(" + scale.toFixed(4) + ")";
      slab.style.opacity = String(Math.max(0.15, 1 - sy / 900));
    }

    function schedule() {
      if (!raf) raf = window.requestAnimationFrame(frame);
    }

    window.addEventListener("mousemove", function (e) {
      mx = (e.clientX / (window.innerWidth || 1) - 0.5) * 2;   // -1 … 1
      my = (e.clientY / (window.innerHeight || 1) - 0.5) * 2;
      schedule();
    }, { passive: true });

    window.addEventListener("scroll", function () {
      sy = window.scrollY || 0;
      schedule();
    }, { passive: true });
  }

  function init() {
    initAccordion();
    initContactForm();
    initHeroParallax();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
