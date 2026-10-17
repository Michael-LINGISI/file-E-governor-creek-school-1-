/* ============================================================
   VALIDATION.JS
   Generic client-side validation for every public/admin form.
   - Required fields are marked with * in the label (in HTML).
   - Each field's rules come from its native attributes:
     required, maxlength, minlength, pattern, type=email/tel...
   - On submit, every field is checked; the first invalid field
     is focused and a clear message is shown under it, plus a
     summary banner at the top of the form.
   ============================================================ */

const FIELD_MESSAGES = {
  valueMissing: "This field is required.",
  typeMismatch: "Please enter a valid value for this field.",
  patternMismatch: "This doesn't match the expected format.",
  tooLong: (max) => `Please shorten this to ${max} characters or fewer.`,
  tooShort: (min) => `Please enter at least ${min} characters.`,
  rangeOverflow: (max) => `Please enter a value of ${max} or less.`,
  rangeUnderflow: (min) => `Please enter a value of ${min} or more.`,
};

function fieldErrorMessage(input) {
  const v = input.validity;
  if (v.valueMissing) return FIELD_MESSAGES.valueMissing;
  if (v.typeMismatch) return FIELD_MESSAGES.typeMismatch;
  if (v.patternMismatch) return input.dataset.patternHint || FIELD_MESSAGES.patternMismatch;
  if (v.tooLong) return FIELD_MESSAGES.tooLong(input.maxLength);
  if (v.tooShort) return FIELD_MESSAGES.tooShort(input.minLength);
  if (v.rangeOverflow) return FIELD_MESSAGES.rangeOverflow(input.max);
  if (v.rangeUnderflow) return FIELD_MESSAGES.rangeUnderflow(input.min);
  return "Please check this field.";
}

function clearFieldError(field) {
  field.classList.remove("field-invalid");
  const msg = field.closest(".form-field")?.querySelector(".field-error");
  if (msg) msg.remove();
}

function showFieldError(field, text) {
  clearFieldError(field);
  field.classList.add("field-invalid");
  const el = document.createElement("p");
  el.className = "field-error";
  el.textContent = text;
  field.insertAdjacentElement("afterend", el);
}

/**
 * Validates every input/select/textarea inside a form.
 * Returns true if the whole form is valid.
 */
function validateForm(form) {
  const fields = form.querySelectorAll("input, select, textarea");
  let firstInvalid = null;
  let allValid = true;

  fields.forEach((field) => {
    clearFieldError(field);
    if (!field.checkValidity()) {
      allValid = false;
      showFieldError(field, fieldErrorMessage(field));
      if (!firstInvalid) firstInvalid = field;
    }
  });

  const banner = form.querySelector(".form-error-banner");
  if (banner) {
    banner.style.display = allValid ? "none" : "block";
    banner.textContent = allValid
      ? ""
      : "Please fix the highlighted field(s) below — required fields are marked with *.";
  }

  if (firstInvalid) {
    firstInvalid.focus();
    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return allValid;
}

// Live-clear an individual field's error as the user fixes it
document.addEventListener("input", (e) => {
  if (e.target.matches(".form-field input, .form-field select, .form-field textarea")) {
    if (e.target.checkValidity()) clearFieldError(e.target);
  }
});
