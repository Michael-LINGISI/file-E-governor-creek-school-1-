/* ============================================================
   MAIN.JS — renders every public page from data-service.js so
   that admin edits (settings, programs, admissions, fees, news,
   gallery) show up on the live site without touching any HTML.
   ============================================================ */

function fmtKES(n) {
  return Number(n || 0).toLocaleString("en-KE");
}
function ksh(n) {
  return "KSh " + fmtKES(n);
}

async function renderSettings() {
  const s = await getSettings();
  document.querySelectorAll("[data-school-name]").forEach((el) => (el.textContent = s.school_name));
  document.querySelectorAll("[data-school-tagline]").forEach((el) => (el.textContent = s.tagline));
  document.querySelectorAll("[data-school-about]").forEach((el) => (el.textContent = s.about));
  document.querySelectorAll("[data-school-phone]").forEach((el) => (el.textContent = s.phone));
  document.querySelectorAll("[data-school-email]").forEach((el) => (el.textContent = s.email));
  document.querySelectorAll("[data-school-address]").forEach((el) => (el.textContent = s.address));
  document.querySelectorAll("[data-school-hours]").forEach((el) => (el.textContent = s.hours));
  document.querySelectorAll("[data-school-facebook]").forEach((el) => (el.href = s.facebook_url || "#"));
  document.querySelectorAll("[data-school-tiktok]").forEach((el) => (el.href = s.tiktok_url || "#"));
  document.querySelectorAll("[data-school-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  if (s.boarding_fee !== undefined && s.boarding_fee !== null && s.boarding_fee !== "") {
    document.querySelectorAll("[data-boarding-fee]").forEach((el) => (el.textContent = ksh(s.boarding_fee)));
  }
  if (s.stationery_fee !== undefined && s.stationery_fee !== null && s.stationery_fee !== "") {
    document.querySelectorAll("[data-stationery-fee]").forEach((el) => (el.textContent = ksh(s.stationery_fee)));
  }

  // Google Maps embed + links (location text is editable in the staff portal)
  const q = encodeURIComponent(s.map_query || s.address || s.school_name);
  document.querySelectorAll("[data-map]").forEach((el) => (el.src = "https://www.google.com/maps?q=" + q + "&output=embed"));
  document.querySelectorAll("[data-map-open]").forEach((el) => (el.href = "https://www.google.com/maps/search/?api=1&query=" + q));
  document.querySelectorAll("[data-map-directions]").forEach((el) => (el.href = "https://www.google.com/maps/dir/?api=1&destination=" + q));

  const statsGrid = document.querySelector("[data-stats]");
  if (statsGrid) {
    statsGrid.innerHTML = `
      <div><div class="stat-num">${s.stat_students}</div><div class="stat-label">Students</div></div>
      <div><div class="stat-num">${s.stat_teachers}</div><div class="stat-label">Teachers</div></div>
      <div><div class="stat-num">${s.stat_years}</div><div class="stat-label">Founded</div></div>
      <div><div class="stat-num">${s.stat_pass_rate}</div><div class="stat-label">KCPE/KCSE Pass Rate</div></div>
    `;
  }
}

async function renderPrograms() {
  const el = document.querySelector("[data-programs]");
  if (!el) return;
  const programs = await fetchTable("programs");
  el.innerHTML = programs
    .map((p) => `<div class="branch-card"><span class="age">${p.age_range}</span><h3>${p.name}</h3><p>${p.description}</p></div>`)
    .join("") || `<p>No programs published yet.</p>`;
}

async function renderFacilities() {
  const el = document.querySelector("[data-facilities]");
  if (!el) return;
  const facilities = await fetchTable("facilities");
  el.innerHTML = facilities
    .map((f) => `<div class="branch-card"><h3>${f.name}</h3><p>${f.description}</p></div>`)
    .join("") || `<p>No facilities published yet.</p>`;
}

async function renderAdmissionSteps() {
  const el = document.querySelector("[data-admission-steps]");
  if (!el) return;
  const steps = (await fetchTable("admission_steps")).sort((a, b) => (a.step_order || 0) - (b.step_order || 0));
  el.innerHTML = steps
    .map((s) => `<div class="branch-card"><span class="age">Step ${s.step_order}</span><h3>${s.title}</h3><p>${s.description}</p></div>`)
    .join("") || `<p>Admission steps coming soon.</p>`;
}

async function renderFees() {
  const el = document.querySelector("[data-fees]");
  if (!el) return;
  const fees = await fetchTable("fees");
  const s = await getSettings();
  const boarding = Number(s.boarding_fee || 0);
  const rows = fees.slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  el.innerHTML = rows
    .map((f) => {
      const day = Number(f.tuition || 0) + Number(f.lunch || 0) + Number(f.snacks || 0);
      return `<tr>
        <td class="band-cell"><span class="band-tag">Band ${f.sort_order}</span><span class="band-name">${f.band_name}</span><span class="band-levels">${f.levels}</span></td>
        <td data-label="Tuition">${ksh(f.tuition)}</td>
        <td data-label="Lunch">${ksh(f.lunch)}</td>
        <td data-label="Snacks">${ksh(f.snacks)}</td>
        <td class="total" data-label="Day total">${ksh(day)}</td>
        <td class="total-board" data-label="Day + boarding">${ksh(day + boarding)}</td>
      </tr>`;
    })
    .join("") || `<tr><td colspan="6" style="text-align:left;">Fee structure coming soon.</td></tr>`;
}

async function renderTransport() {
  const el = document.querySelector("[data-transport]");
  if (!el) return;
  const zones = (await fetchTable("transport_zones")).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  el.innerHTML = zones
    .map((z) => `<div class="zone-row"><div><strong>${z.zone}</strong><span>${z.areas}</span></div><div class="zone-amount">${ksh(z.amount)}</div></div>`)
    .join("") || `<p class="dl-note">Transport zones coming soon.</p>`;
}

async function renderNews() {
  const el = document.querySelector("[data-news]");
  if (!el) return;
  const news = await fetchTable("news");
  el.innerHTML = news
    .map((n) => `<div class="news-card"><div class="thumb"></div><div class="body"><div class="news-date">${n.date_label}</div><h3>${n.title}</h3><p>${n.excerpt}</p></div></div>`)
    .join("") || `<p>No news posted yet.</p>`;
}

async function renderGallery() {
  const el = document.querySelector("[data-gallery]");
  if (!el) return;
  const images = await fetchTable("gallery");
  el.innerHTML = images
    .map((g) => `<div class="gallery-item"><img src="${g.image_url}" alt="${g.caption}" loading="lazy"><div class="caption">${g.caption}</div></div>`)
    .join("") || `<p>No photos uploaded yet.</p>`;
}

document.addEventListener("DOMContentLoaded", async () => {
  // Mobile menu toggle
  const toggle = document.querySelector(".nav-toggle");
  const wrap = document.querySelector(".nav-wrap");
  if (toggle && wrap) toggle.addEventListener("click", () => wrap.classList.toggle("open"));

  await renderSettings();
  await renderPrograms();
  await renderFacilities();
  await renderAdmissionSteps();
  await renderFees();
  await renderTransport();
  await renderNews();
  await renderGallery();
});

/* Public forms (contact / admissions) — validated, then confirmed
   on screen. Swap the body of this function for a real submission
   (e.g. Formspree, or insertRow('contact_requests', {...})) when
   you're ready to receive messages for real. */
function handleContactSubmit(event) {
  event.preventDefault();
  const form = event.target;
  if (!validateForm(form)) return false;

  const status = form.querySelector(".form-status");
  if (status) {
    status.textContent = "Thank you! Your message has been sent. We'll get back to you within 48 hours.";
    status.style.color = "var(--acacia)";
  }
  form.reset();
  return false;
}
