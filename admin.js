/* ============================================================
   ADMIN.JS — The Governor Creek School back-office
   Lets staff manage every editable part of the site: school
   info, programs, admissions & fees, news, gallery, and the
   student-records tools (students, grades, payments, schedule).
   Uses the shared data-service.js (demo localStorage or Supabase).
   ============================================================ */

/* ---------------- AUTH ---------------- */
async function handleLogin(event) {
  event.preventDefault();
  const form = event.target;
  if (!validateForm(form)) return false;

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const errorBox = document.querySelector(".login-error");

  if (DEMO_MODE) {
    localStorage.setItem("gcs_session", JSON.stringify({ email, demo: true }));
    window.location.href = "dashboard.html";
    return false;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    errorBox.textContent = "Incorrect credentials. Please check your email and password.";
    errorBox.style.display = "block";
    return false;
  }
  window.location.href = "dashboard.html";
  return false;
}

async function requireAuth() {
  if (DEMO_MODE) {
    if (!localStorage.getItem("gcs_session")) window.location.href = "index.html";
    return;
  }
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) window.location.href = "index.html";
}

async function handleLogout() {
  if (DEMO_MODE) localStorage.removeItem("gcs_session");
  else await supabaseClient.auth.signOut();
  window.location.href = "index.html";
}

/* ---------------- Helpers ---------------- */
function fmtKES(n) {
  return Number(n || 0).toLocaleString("en-KE") + " KES";
}
function openModal(id) { document.getElementById(id).classList.add("open"); }
function closeModal(id) { document.getElementById(id).classList.remove("open"); }

/* ---------------- KPIs ---------------- */
async function renderKPIs() {
  const el = document.querySelector("[data-kpis]");
  if (!el) return;
  const students = await fetchTable("students");
  const payments = await fetchTable("payments");
  const classes = await fetchTable("classes");
  const totalDue = payments.reduce((s, p) => s + Number(p.amount_due), 0);
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount_paid), 0);
  el.innerHTML = `
    <div class="kpi-card"><div class="num">${students.length}</div><div class="label">Enrolled Students</div></div>
    <div class="kpi-card"><div class="num">${classes.length}</div><div class="label">Active Classes</div></div>
    <div class="kpi-card"><div class="num">${fmtKES(totalPaid)}</div><div class="label">Collected This Term</div></div>
    <div class="kpi-card"><div class="num">${fmtKES(totalDue - totalPaid)}</div><div class="label">Balance Outstanding</div></div>
  `;
}

/* ---------------- Site Settings ---------------- */
async function loadSettingsForm() {
  const form = document.getElementById("settings-form");
  if (!form) return;
  const s = await getSettings();
  Object.keys(s).forEach((key) => {
    const field = form.querySelector(`[name="${key}"]`);
    if (field) field.value = s[key] ?? "";
  });
}

async function submitSettingsForm(event) {
  event.preventDefault();
  const form = event.target;
  if (!validateForm(form)) return false;
  const patch = {};
  new FormData(form).forEach((value, key) => (patch[key] = value));
  await updateSettings(patch);
  const status = form.querySelector(".form-status");
  if (status) { status.textContent = "Saved — changes are live on the public site."; status.style.color = "var(--acacia)"; }
  await renderSettingsPreviewName();
  return false;
}

async function renderSettingsPreviewName() {
  const s = await getSettings();
  document.querySelectorAll("[data-current-school-name]").forEach((el) => (el.textContent = s.school_name));
}

/* ---------------- Programs ---------------- */
async function renderPrograms() {
  const el = document.querySelector("[data-programs-table]");
  if (!el) return;
  const rows = await fetchTable("programs");
  if (!rows.length) { el.innerHTML = emptyState("No programs yet. Add the first one above."); return; }
  el.innerHTML = table(
    ["Name", "Age range", "Description", ""],
    rows.map((p) => [p.name, p.age_range, truncate(p.description, 70), removeBtn("programs", p.id)])
  );
}
async function submitProgramForm(event) {
  event.preventDefault();
  const form = event.target;
  if (!validateForm(form)) return false;
  await insertRow("programs", {
    name: form.name.value,
    age_range: form.age_range.value,
    description: form.description.value,
  });
  form.reset();
  closeModal("modal-program");
  await renderPrograms();
  return false;
}

/* ---------------- Facilities ---------------- */
async function renderFacilities() {
  const el = document.querySelector("[data-facilities-table]");
  if (!el) return;
  const rows = await fetchTable("facilities");
  if (!rows.length) { el.innerHTML = emptyState("No facilities yet. Add the first one above."); return; }
  el.innerHTML = table(
    ["Name", "Description", ""],
    rows.map((f) => [f.name, truncate(f.description, 70), removeBtn("facilities", f.id)])
  );
}
async function submitFacilityForm(event) {
  event.preventDefault();
  const form = event.target;
  if (!validateForm(form)) return false;
  await insertRow("facilities", {
    name: form.name.value,
    description: form.description.value,
  });
  form.reset();
  closeModal("modal-facility");
  await renderFacilities();
  return false;
}

/* ---------------- Admission steps ---------------- */
async function renderAdmissionSteps() {
  const el = document.querySelector("[data-steps-table]");
  if (!el) return;
  const rows = (await fetchTable("admission_steps")).sort((a, b) => (a.step_order || 0) - (b.step_order || 0));
  if (!rows.length) { el.innerHTML = emptyState("No admission steps yet."); return; }
  el.innerHTML = table(
    ["#", "Title", "Description", ""],
    rows.map((s) => [s.step_order, s.title, truncate(s.description, 70), removeBtn("admission_steps", s.id)])
  );
}
async function submitStepForm(event) {
  event.preventDefault();
  const form = event.target;
  if (!validateForm(form)) return false;
  await insertRow("admission_steps", {
    step_order: Number(form.step_order.value),
    title: form.title.value,
    description: form.description.value,
  });
  form.reset();
  closeModal("modal-step");
  await renderAdmissionSteps();
  return false;
}

/* ---------------- Edit helpers (fees, transport) ---------------- */
function editBtn(fn, id) {
  return `<button class="btn btn-outline btn-sm" onclick="${fn}('${id}')">Edit</button>`;
}
function resetModal(modalId, title) {
  const modal = document.getElementById(modalId);
  const form = modal.querySelector("form");
  form.reset();
  form.elements.row_id.value = "";
  form.querySelectorAll(".field-error").forEach((e) => e.remove());
  form.querySelectorAll(".field-invalid").forEach((e) => e.classList.remove("field-invalid"));
  const banner = form.querySelector(".form-error-banner");
  if (banner) banner.style.display = "none";
  modal.querySelector("h3").textContent = title;
  return form;
}
function openFeeModal() { resetModal("modal-fee", "Add Fee Band"); openModal("modal-fee"); }
async function editFee(id) {
  const row = (await fetchTable("fees")).find((r) => r.id === id);
  if (!row) return;
  const form = resetModal("modal-fee", "Edit Fee Band");
  form.elements.row_id.value = id;
  ["sort_order", "band_name", "levels", "tuition", "lunch", "snacks"].forEach((k) => (form.elements[k].value = row[k]));
  openModal("modal-fee");
}
function openTransportModal() { resetModal("modal-transport", "Add Transport Zone"); openModal("modal-transport"); }
async function editTransport(id) {
  const row = (await fetchTable("transport_zones")).find((r) => r.id === id);
  if (!row) return;
  const form = resetModal("modal-transport", "Edit Transport Zone");
  form.elements.row_id.value = id;
  ["sort_order", "zone", "areas", "amount"].forEach((k) => (form.elements[k].value = row[k]));
  openModal("modal-transport");
}

/* ---------------- Fees (bands) ---------------- */
async function renderFees() {
  const el = document.querySelector("[data-fees-table]");
  if (!el) return;
  const rows = (await fetchTable("fees")).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  if (!rows.length) { el.innerHTML = emptyState("No fee bands yet."); return; }
  el.innerHTML = table(
    ["Band", "Levels", "Tuition", "Lunch", "Snacks", "Day total", ""],
    rows.map((f) => [
      `Band ${f.sort_order} — ${f.band_name}`, f.levels, fmtKES(f.tuition), fmtKES(f.lunch), fmtKES(f.snacks),
      `<strong>${fmtKES(Number(f.tuition) + Number(f.lunch) + Number(f.snacks))}</strong>`, editBtn("editFee", f.id) + " " + removeBtn("fees", f.id),
    ])
  );
}
async function submitFeeForm(event) {
  event.preventDefault();
  const form = event.target;
  if (!validateForm(form)) return false;
  const payload = {
    sort_order: Number(form.sort_order.value),
    band_name: form.band_name.value.trim(),
    levels: form.levels.value.trim(),
    tuition: Number(form.tuition.value),
    lunch: Number(form.lunch.value),
    snacks: Number(form.snacks.value),
  };
  const rowId = form.elements.row_id.value;
  if (rowId) await updateRow("fees", rowId, payload);
  else await insertRow("fees", payload);
  form.reset();
  closeModal("modal-fee");
  await renderFees();
  return false;
}

/* ---------------- Transport zones ---------------- */
async function renderTransport() {
  const el = document.querySelector("[data-transport-table]");
  if (!el) return;
  const rows = (await fetchTable("transport_zones")).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  if (!rows.length) { el.innerHTML = emptyState("No transport zones yet."); return; }
  el.innerHTML = table(
    ["Zone", "Areas", "Per term", ""],
    rows.map((z) => [z.zone, z.areas, fmtKES(z.amount), editBtn("editTransport", z.id) + " " + removeBtn("transport_zones", z.id)])
  );
}
async function submitTransportForm(event) {
  event.preventDefault();
  const form = event.target;
  if (!validateForm(form)) return false;
  const payload = {
    sort_order: Number(form.sort_order.value),
    zone: form.zone.value.trim(),
    areas: form.areas.value.trim(),
    amount: Number(form.amount.value),
  };
  const rowId = form.elements.row_id.value;
  if (rowId) await updateRow("transport_zones", rowId, payload);
  else await insertRow("transport_zones", payload);
  form.reset();
  closeModal("modal-transport");
  await renderTransport();
  return false;
}

/* ---------------- News ---------------- */
async function renderNews() {
  const el = document.querySelector("[data-news-table]");
  if (!el) return;
  const rows = await fetchTable("news");
  if (!rows.length) { el.innerHTML = emptyState("No news posted yet."); return; }
  el.innerHTML = table(
    ["Title", "Date", "Excerpt", ""],
    rows.map((n) => [n.title, n.date_label, truncate(n.excerpt, 60), removeBtn("news", n.id)])
  );
}
async function submitNewsForm(event) {
  event.preventDefault();
  const form = event.target;
  if (!validateForm(form)) return false;
  await insertRow("news", {
    title: form.title.value,
    date_label: form.date_label.value,
    excerpt: form.excerpt.value,
    created_at: new Date().toISOString(),
  });
  form.reset();
  closeModal("modal-news");
  await renderNews();
  return false;
}

/* ---------------- Gallery ---------------- */
async function renderGalleryAdmin() {
  const el = document.querySelector("[data-gallery-admin]");
  if (!el) return;
  const rows = await fetchTable("gallery");
  if (!rows.length) { el.innerHTML = emptyState("No photos uploaded yet."); return; }
  el.innerHTML = `<div class="gallery-grid">${rows
    .map(
      (g) => `<div class="gallery-item">
        <img src="${g.image_url}" alt="${g.caption}" loading="lazy" onerror="this.src='https://placehold.co/600x450/10284A/EEF2F6?text=Image+not+found'">
        <div class="caption">${g.caption}
          <div style="margin-top:8px;"><button class="btn btn-outline btn-sm" onclick="removeRow('gallery','${g.id}', renderGalleryAdmin)">Remove</button></div>
        </div>
      </div>`
    )
    .join("")}</div>`;
}
async function submitGalleryForm(event) {
  event.preventDefault();
  const form = event.target;
  if (!validateForm(form)) return false;
  await insertRow("gallery", { image_url: form.image_url.value, caption: form.caption.value });
  form.reset();
  closeModal("modal-gallery");
  await renderGalleryAdmin();
  return false;
}

/* ---------------- Students / Grades / Payments / Schedule ---------------- */
async function renderStudents() {
  const el = document.querySelector("[data-students-table]");
  if (!el) return;
  const students = await fetchTable("students");
  const classes = await fetchTable("classes");
  const classMap = Object.fromEntries(classes.map((c) => [c.id, c.name]));
  if (!students.length) { el.innerHTML = emptyState("No students enrolled yet. Add the first one above."); return; }
  el.innerHTML = table(
    ["Name", "Class", "Parent", "Phone", "Status", ""],
    students.map((s) => [
      s.full_name, classMap[s.class_id] || "—", s.parent_name || "—", s.parent_phone || "—",
      `<span class="tag paid">${s.status}</span>`, removeBtn("students", s.id),
    ])
  );
}
async function renderGrades() {
  const el = document.querySelector("[data-grades-table]");
  if (!el) return;
  const grades = await fetchTable("grades");
  const students = await fetchTable("students");
  const studentMap = Object.fromEntries(students.map((s) => [s.id, s.full_name]));
  if (!grades.length) { el.innerHTML = emptyState("No grades recorded yet."); return; }
  el.innerHTML = table(
    ["Student", "Subject", "Term", "Score", "Comment", ""],
    grades.map((g) => [
      studentMap[g.student_id] || "—", g.subject, g.term, `${g.score} / ${g.max_score}`,
      g.comment || "—", removeBtn("grades", g.id),
    ])
  );
}
async function renderPayments() {
  const el = document.querySelector("[data-payments-table]");
  if (!el) return;
  const payments = await fetchTable("payments");
  const students = await fetchTable("students");
  const studentMap = Object.fromEntries(students.map((s) => [s.id, s.full_name]));
  if (!payments.length) { el.innerHTML = emptyState("No payments recorded yet."); return; }
  const tagClass = (status) => (status === "paid" ? "paid" : status === "partial" ? "pending" : "due");
  el.innerHTML = table(
    ["Student", "Term", "Due", "Paid", "Status", ""],
    payments.map((p) => [
      studentMap[p.student_id] || "—", p.term, fmtKES(p.amount_due), fmtKES(p.amount_paid),
      `<span class="tag ${tagClass(p.status)}">${p.status}</span>`, removeBtn("payments", p.id),
    ])
  );
}
async function renderSchedule() {
  const el = document.querySelector("[data-schedule-table]");
  if (!el) return;
  const schedule = await fetchTable("schedule");
  const classes = await fetchTable("classes");
  const classMap = Object.fromEntries(classes.map((c) => [c.id, c.name]));
  if (!schedule.length) { el.innerHTML = emptyState("No time slots scheduled yet."); return; }
  el.innerHTML = table(
    ["Day", "Time", "Class", "Subject", "Teacher", ""],
    schedule.map((s) => [
      s.day_of_week, `${s.start_time} – ${s.end_time}`, classMap[s.class_id] || "—",
      s.subject, s.teacher_name || "—", removeBtn("schedule", s.id),
    ])
  );
}

async function removeRow(tableName, id, afterFn) {
  if (!confirm("Remove this entry? This cannot be undone.")) return;
  await deleteRow(tableName, id);
  if (afterFn) await afterFn();
  else await refreshAll();
}

/* ---------------- Small render helpers ---------------- */
function truncate(text, n) {
  if (!text) return "—";
  return text.length > n ? text.slice(0, n) + "…" : text;
}
function removeBtn(tableName, id) {
  return `<button class="btn btn-outline btn-sm" onclick="removeRow('${tableName}','${id}')">Remove</button>`;
}
function table(headers, rows) {
  return `<div class="table-scroll"><table class="data-table" style="min-width:560px;">
    <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
  </table></div>`;
}
function emptyState(text) {
  return `<div class="empty-state"><div class="glyph">🌊</div>${text}</div>`;
}

/* ---------------- Add-entity forms (students/grades/payments/schedule) ---------------- */
async function populateClassAndStudentSelects() {
  const classes = await fetchTable("classes");
  const students = await fetchTable("students");
  document.querySelectorAll("select[data-class-select]").forEach((sel) => {
    sel.innerHTML = classes.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
  });
  document.querySelectorAll("select[data-student-select]").forEach((sel) => {
    sel.innerHTML = students.map((s) => `<option value="${s.id}">${s.full_name}</option>`).join("");
  });
}

async function submitStudentForm(event) {
  event.preventDefault();
  const form = event.target;
  if (!validateForm(form)) return false;
  await insertRow("students", {
    full_name: form.full_name.value,
    date_of_birth: form.date_of_birth.value,
    class_id: form.class_id.value,
    parent_name: form.parent_name.value,
    parent_phone: form.parent_phone.value,
    parent_email: form.parent_email.value,
    status: "active",
    created_at: new Date().toISOString(),
  });
  form.reset();
  closeModal("modal-student");
  await renderKPIs();
  await renderStudents();
  await populateClassAndStudentSelects();
  return false;
}

async function submitGradeForm(event) {
  event.preventDefault();
  const form = event.target;
  if (!validateForm(form)) return false;
  await insertRow("grades", {
    student_id: form.student_id.value,
    subject: form.subject.value,
    term: form.term.value,
    score: Number(form.score.value),
    max_score: 100,
    comment: form.comment.value,
    created_at: new Date().toISOString(),
  });
  form.reset();
  closeModal("modal-grade");
  await renderGrades();
  return false;
}

async function submitPaymentForm(event) {
  event.preventDefault();
  const form = event.target;
  if (!validateForm(form)) return false;
  const due = Number(form.amount_due.value);
  const paid = Number(form.amount_paid.value);
  await insertRow("payments", {
    student_id: form.student_id.value,
    term: form.term.value,
    amount_due: due,
    amount_paid: paid,
    due_date: form.due_date.value,
    status: paid >= due ? "paid" : paid > 0 ? "partial" : "pending",
    created_at: new Date().toISOString(),
  });
  form.reset();
  closeModal("modal-payment");
  await renderKPIs();
  await renderPayments();
  return false;
}

async function submitScheduleForm(event) {
  event.preventDefault();
  const form = event.target;
  if (!validateForm(form)) return false;
  await insertRow("schedule", {
    class_id: form.class_id.value,
    day_of_week: form.day_of_week.value,
    start_time: form.start_time.value,
    end_time: form.end_time.value,
    subject: form.subject.value,
    teacher_name: form.teacher_name.value,
  });
  form.reset();
  closeModal("modal-schedule");
  await renderSchedule();
  return false;
}

/* ---------------- Init ---------------- */
async function refreshAll() {
  await renderKPIs();
  await loadSettingsForm();
  await renderSettingsPreviewName();
  await renderPrograms();
  await renderFacilities();
  await renderAdmissionSteps();
  await renderFees();
  await renderTransport();
  await renderNews();
  await renderGalleryAdmin();
  await renderStudents();
  await renderGrades();
  await renderPayments();
  await renderSchedule();
  await populateClassAndStudentSelects();
}

document.addEventListener("DOMContentLoaded", async () => {
  if (document.body.dataset.page === "dashboard") {
    await requireAuth();
    await refreshAll();
    const logoutBtn = document.querySelector(".logout");
    if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
  }
});
