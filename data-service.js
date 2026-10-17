/* ============================================================
   DATA-SERVICE.JS
   Single data layer used by BOTH the public site and the admin
   back-office. Every piece of editable content on the site —
   school info, programs, admissions, fees, news, gallery, and
   the student-records back-office — goes through this file.

   Two modes, switched automatically by js/supabase-client.js:
   - DEMO MODE (default): data lives in the browser (localStorage).
     Great for testing; admin edits are visible only on this device.
   - SUPABASE MODE: once real keys are set, every read/write goes
     to your Supabase project so the whole team sees the same data.
   ============================================================ */

const DEMO_SEED = {
  settings: {
    id: "main",
    school_name: "The Governor Creek School",
    tagline: "Learning Today, Leading Tomorrow",
    about: "At the Governor Creek School, we believe education is not just passing exams — it is about nurturing creativity, building character, and preparing every learner to thrive as a leader in tomorrow's world.",
    founded_year: "2026",
    address: "Mombasa, Kenya — Lorem ipsum exact address",
    phone: "+254 700 000 000",
    email: "info@governorcreekschool.ac.ke",
    whatsapp: "+254700000000",
    hours: "Monday–Friday, 7:30am–4:30pm",
    facebook_url: "https://facebook.com/governorcreekschool",
    tiktok_url: "https://tiktok.com/@governorcreekschool",
    instagram_url: "",
    logo_note: "Official logo applied — Est. 2026, motto: Inspire. Educate. Innovate.",
    stat_students: "Lorem",
    stat_teachers: "Lorem",
    stat_years: "Est. 2026",
    stat_pass_rate: "Lorem",
    boarding_fee: "30000",
    stationery_fee: "2000",
    map_query: "The Governor Creek School, Mombasa, Kenya",
  },

  programs: [
    { id: "pr1", name: "Play Group", age_range: "Ages 3 – 4", description: "Focused on play, socialisation and motor skills." },
    { id: "pr2", name: "Pre-Primary (PP1 & PP2)", age_range: "Ages 4 – 6", description: "Builds foundational literacy, numeracy and creativity for young learners." },
    { id: "pr3", name: "Primary School (Grade 1–6)", age_range: "Ages 6 – 12", description: "Core academics, values and life skills to strengthen knowledge and discipline." },
    { id: "pr4", name: "Junior Secondary (Grade 7–9)", age_range: "Ages 12 – 15", description: "CBC pathways with exploration in STEM, Arts, Sports and Social Sciences." },
    { id: "pr5", name: "Senior School (Grade 10–12)", age_range: "Ages 15 – 18", description: "Advanced learning, career preparation, leadership and readiness for tertiary education." },
  ],

  facilities: [
    { id: "fc1", name: "Specialized Classrooms", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, purpose-built spaces for focused, hands-on learning." },
    { id: "fc2", name: "Libraries", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, a quiet home for reading, research and independent study." },
    { id: "fc3", name: "Arts and Creative Spaces", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, dedicated rooms for music, art and creative expression." },
    { id: "fc4", name: "Modern Laboratories", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, equipped labs for hands-on science at every level." },
    { id: "fc5", name: "Sports Facilities", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, space to build teamwork, fitness and healthy competition." },
  ],

  admission_steps: [
    { id: "as1", step_order: 1, title: "Online Enquiry", description: "Lorem ipsum dolor sit amet, submit the admission enquiry form with your child's basic details." },
    { id: "as2", step_order: 2, title: "Assessment", description: "Lorem ipsum dolor sit amet, a short placement assessment and interview with our academic team." },
    { id: "as3", step_order: 3, title: "Documents & Fees", description: "Lorem ipsum dolor sit amet, submit required documents and settle the registration fee." },
    { id: "as4", step_order: 4, title: "Welcome & Orientation", description: "Lorem ipsum dolor sit amet, campus tour and orientation ahead of the first day of class." },
  ],

  // 2027 fee structure (KSh per term). Day total = tuition + lunch + snacks.
  // "Day + boarding" adds settings.boarding_fee on top.
  fees: [
    { id: "fe1", sort_order: 1, band_name: "ECDE Wing", levels: "Playgroup, PP1, PP2", tuition: 6000, lunch: 5000, snacks: 2400 },
    { id: "fe2", sort_order: 2, band_name: "Lower Primary", levels: "Grade 1 – 3", tuition: 7500, lunch: 5000, snacks: 2400 },
    { id: "fe3", sort_order: 3, band_name: "Upper Primary", levels: "Grade 4 – 6", tuition: 8000, lunch: 5000, snacks: 2400 },
    { id: "fe4", sort_order: 4, band_name: "Junior School", levels: "Grade 7 – 9", tuition: 10000, lunch: 5000, snacks: 2400 },
    { id: "fe5", sort_order: 5, band_name: "Senior School", levels: "Grade 10 – 12", tuition: 15000, lunch: 5000, snacks: 2400 },
  ],

  // Optional school transport, per term
  transport_zones: [
    { id: "tz1", sort_order: 1, zone: "Zone A", areas: "Town, Nyali, Mtwapa, Utange, Mwakirunge", amount: 7500 },
    { id: "tz2", sort_order: 2, zone: "Zone B", areas: "Bamburi, Kiembeni, Safari", amount: 6000 },
    { id: "tz3", sort_order: 3, zone: "Zone C", areas: "Vikwatani, Mwisho wa Lami", amount: 4500 },
  ],

  news: [
    { id: "nw1", title: "Lorem ipsum dolor sit amet open day", date_label: "Lorem 2026", excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore." },
    { id: "nw2", title: "Lorem ipsum exam results announcement", date_label: "Lorem 2026", excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt." },
    { id: "nw3", title: "Lorem ipsum new facility opening", date_label: "Lorem 2026", excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor." },
  ],

  gallery: [
    { id: "gl1", image_url: "images/campus-front.jpg", caption: "The Governor Creek School — main campus building" },
    { id: "gl2", image_url: "images/campus-angle.jpg", caption: "The Governor Creek School — campus and school transport" },
    { id: "gl3", image_url: "https://placehold.co/600x450/10284A/EEF2F6?text=Classroom", caption: "Lorem ipsum — classroom placeholder" },
    { id: "gl4", image_url: "https://placehold.co/600x450/0F7FC4/EEF2F6?text=Sports+Day", caption: "Lorem ipsum — sports day placeholder" },
    { id: "gl5", image_url: "https://placehold.co/600x450/D9A521/10284A?text=Library", caption: "Lorem ipsum — library placeholder" },
    { id: "gl6", image_url: "https://placehold.co/600x450/6FA83B/10284A?text=Science+Lab", caption: "Lorem ipsum — science lab placeholder" },
  ],

  classes: [
    { id: "c1", name: "Grade 4 A", level: "Primary", teacher_name: "Lorem Ipsum" },
    { id: "c2", name: "Grade 9 B", level: "Junior Secondary", teacher_name: "Lorem Ipsum" },
  ],
  students: [
    { id: "s1", full_name: "Lorem Ipsum Student", date_of_birth: "2016-03-12", class_id: "c1", parent_name: "Lorem Parent", parent_phone: "+254 711 222 333", parent_email: "parent1@example.com", status: "active" },
    { id: "s2", full_name: "Dolor Sit Student", date_of_birth: "2011-08-02", class_id: "c2", parent_name: "Dolor Parent", parent_phone: "+254 722 333 444", parent_email: "parent2@example.com", status: "active" },
  ],
  grades: [
    { id: "g1", student_id: "s1", subject: "Mathematics", term: "Term 2 2026", score: 78, max_score: 100, comment: "Lorem ipsum good progress" },
    { id: "g2", student_id: "s2", subject: "English", term: "Term 2 2026", score: 85, max_score: 100, comment: "Lorem ipsum excellent work" },
  ],
  payments: [
    { id: "p1", student_id: "s1", term: "Term 2 2026", amount_due: 60000, amount_paid: 60000, due_date: "2026-05-01", status: "paid" },
    { id: "p2", student_id: "s2", term: "Term 2 2026", amount_due: 78000, amount_paid: 30000, due_date: "2026-05-01", status: "partial" },
  ],
  schedule: [
    { id: "sc1", class_id: "c1", day_of_week: "Monday", start_time: "08:00", end_time: "10:00", subject: "English", teacher_name: "Lorem Ipsum" },
    { id: "sc2", class_id: "c2", day_of_week: "Tuesday", start_time: "10:30", end_time: "12:30", subject: "Mathematics", teacher_name: "Lorem Ipsum" },
  ],
};

const DEMO_KEY = "gcs_demo_data_v2";

function loadDemoData() {
  if (!localStorage.getItem(DEMO_KEY)) {
    localStorage.setItem(DEMO_KEY, JSON.stringify(DEMO_SEED));
  }
  const data = JSON.parse(localStorage.getItem(DEMO_KEY));
  // Backfill any tables added after a visitor's first load
  let changed = false;
  Object.keys(DEMO_SEED).forEach((key) => {
    if (!(key in data)) { data[key] = DEMO_SEED[key]; changed = true; }
  });
  if (changed) saveDemoData(data);
  return data;
}
function saveDemoData(data) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(data));
}

/* ---------------- Generic multi-row tables ---------------- */
async function fetchTable(table) {
  if (DEMO_MODE) return loadDemoData()[table] || [];
  const { data, error } = await supabaseClient.from(table).select("*").order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return data;
}

async function insertRow(table, row) {
  if (DEMO_MODE) {
    const data = loadDemoData();
    row.id = table.slice(0, 2) + Date.now();
    data[table].unshift(row);
    saveDemoData(data);
    return row;
  }
  const { data, error } = await supabaseClient.from(table).insert(row).select();
  if (error) { alert("Error: " + error.message); return null; }
  return data[0];
}

async function updateRow(table, id, patch) {
  if (DEMO_MODE) {
    const data = loadDemoData();
    data[table] = data[table].map((r) => (r.id === id ? { ...r, ...patch } : r));
    saveDemoData(data);
    return;
  }
  const { error } = await supabaseClient.from(table).update(patch).eq("id", id);
  if (error) alert("Error: " + error.message);
}

async function deleteRow(table, id) {
  if (DEMO_MODE) {
    const data = loadDemoData();
    data[table] = data[table].filter((r) => r.id !== id);
    saveDemoData(data);
    return;
  }
  await supabaseClient.from(table).delete().eq("id", id);
}

/* ---------------- Singleton "settings" row ---------------- */
async function getSettings() {
  if (DEMO_MODE) return loadDemoData().settings;
  const { data, error } = await supabaseClient.from("settings").select("*").eq("id", "main").single();
  if (error) { console.error(error); return DEMO_SEED.settings; }
  return data;
}

async function updateSettings(patch) {
  if (DEMO_MODE) {
    const data = loadDemoData();
    data.settings = { ...data.settings, ...patch };
    saveDemoData(data);
    return;
  }
  const { error } = await supabaseClient.from("settings").update(patch).eq("id", "main");
  if (error) alert("Error: " + error.message);
}
