-- ============================================================
-- The Governor Creek School — Supabase schema
-- Run this in your Supabase project's SQL editor.
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- PUBLIC CONTENT TABLES
-- Readable by anyone (anon), writable only by authenticated staff.
-- This is what powers the public website AND the admin dashboard.
-- ============================================================

-- ---------- Site settings (single row) ----------
create table if not exists settings (
  id text primary key default 'main',
  school_name text not null default 'The Governor Creek School',
  tagline text,
  about text,
  founded_year text,
  address text,
  phone text,
  email text,
  whatsapp text,
  hours text,
  facebook_url text,
  tiktok_url text,
  instagram_url text,
  logo_note text,
  stat_students text,
  stat_teachers text,
  stat_years text,
  stat_pass_rate text,
  boarding_fee numeric default 30000,
  stationery_fee numeric default 2000,
  map_query text default 'The Governor Creek School, Mombasa, Kenya',
  updated_at timestamptz default now()
);
insert into settings (id) values ('main') on conflict (id) do nothing;

-- ---------- Programs ----------
create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age_range text,
  description text,
  created_at timestamptz default now()
);

-- ---------- Facilities ----------
create table if not exists facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- ---------- Admission steps ----------
create table if not exists admission_steps (
  id uuid primary key default gen_random_uuid(),
  step_order int not null default 1,
  title text not null,
  description text,
  created_at timestamptz default now()
);

-- ---------- Fees ----------
-- Per-term fees in KSh. Day total = tuition + lunch + snacks;
-- "day + boarding" adds settings.boarding_fee (computed on the site).
create table if not exists fees (
  id uuid primary key default gen_random_uuid(),
  sort_order int not null default 1,
  band_name text not null,
  levels text not null,
  tuition numeric(10,2) not null default 0,
  lunch numeric(10,2) not null default 0,
  snacks numeric(10,2) not null default 0,
  created_at timestamptz default now()
);

-- ---------- Transport zones (optional school transport, per term) ----------
create table if not exists transport_zones (
  id uuid primary key default gen_random_uuid(),
  sort_order int not null default 1,
  zone text not null,
  areas text not null,
  amount numeric(10,2) not null default 0,
  created_at timestamptz default now()
);

-- ---------- News ----------
create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date_label text,
  excerpt text,
  created_at timestamptz default now()
);

-- ---------- Gallery ----------
create table if not exists gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  created_at timestamptz default now()
);

-- ---------- Contact / admission form submissions ----------
create table if not exists contact_requests (
  id uuid primary key default gen_random_uuid(),
  kind text default 'contact',      -- 'contact' or 'admission'
  full_name text not null,
  email text,
  phone text,
  message text,
  created_at timestamptz default now()
);

-- ============================================================
-- SCHOOL-RECORDS TABLES (staff-only, back-office)
-- ============================================================
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level text not null,
  teacher_name text,
  created_at timestamptz default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  date_of_birth date,
  class_id uuid references classes(id) on delete set null,
  parent_name text,
  parent_phone text,
  parent_email text,
  admission_date date default current_date,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists grades (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  subject text not null,
  term text not null,
  score numeric(5,2),
  max_score numeric(5,2) default 100,
  comment text,
  created_at timestamptz default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  term text not null,
  amount_due numeric(10,2) not null,
  amount_paid numeric(10,2) default 0,
  due_date date,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists schedule (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade,
  day_of_week text not null,
  start_time time not null,
  end_time time not null,
  subject text not null,
  teacher_name text
);

-- ---------- Staff accounts allowed into the back-office ----------
create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  role text default 'staff',
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table settings enable row level security;
alter table programs enable row level security;
alter table facilities enable row level security;
alter table admission_steps enable row level security;
alter table fees enable row level security;
alter table transport_zones enable row level security;
alter table news enable row level security;
alter table gallery enable row level security;
alter table contact_requests enable row level security;
alter table classes enable row level security;
alter table students enable row level security;
alter table grades enable row level security;
alter table payments enable row level security;
alter table schedule enable row level security;
alter table staff enable row level security;

-- Public content: anyone can read, only staff can write
create policy "public can read settings" on settings for select using (true);
create policy "staff can write settings" on settings for update using (exists (select 1 from staff where auth_user_id = auth.uid()));

create policy "public can read programs" on programs for select using (true);
create policy "staff can write programs" on programs for all using (exists (select 1 from staff where auth_user_id = auth.uid()));

create policy "public can read facilities" on facilities for select using (true);
create policy "staff can write facilities" on facilities for all using (exists (select 1 from staff where auth_user_id = auth.uid()));

create policy "public can read admission_steps" on admission_steps for select using (true);
create policy "staff can write admission_steps" on admission_steps for all using (exists (select 1 from staff where auth_user_id = auth.uid()));

create policy "public can read fees" on fees for select using (true);
create policy "staff can write fees" on fees for all using (exists (select 1 from staff where auth_user_id = auth.uid()));

create policy "public can read transport_zones" on transport_zones for select using (true);
create policy "staff can write transport_zones" on transport_zones for all using (exists (select 1 from staff where auth_user_id = auth.uid()));

create policy "public can read news" on news for select using (true);
create policy "staff can write news" on news for all using (exists (select 1 from staff where auth_user_id = auth.uid()));

create policy "public can read gallery" on gallery for select using (true);
create policy "staff can write gallery" on gallery for all using (exists (select 1 from staff where auth_user_id = auth.uid()));

-- Contact form: anyone can submit, only staff can read
create policy "public can submit contact_requests" on contact_requests for insert with check (true);
create policy "staff can read contact_requests" on contact_requests for select using (exists (select 1 from staff where auth_user_id = auth.uid()));

-- School records: staff only, both read and write
create policy "staff can read classes" on classes for select using (exists (select 1 from staff where auth_user_id = auth.uid()));
create policy "staff can write classes" on classes for all using (exists (select 1 from staff where auth_user_id = auth.uid()));

create policy "staff can read students" on students for select using (exists (select 1 from staff where auth_user_id = auth.uid()));
create policy "staff can write students" on students for all using (exists (select 1 from staff where auth_user_id = auth.uid()));

create policy "staff can read grades" on grades for select using (exists (select 1 from staff where auth_user_id = auth.uid()));
create policy "staff can write grades" on grades for all using (exists (select 1 from staff where auth_user_id = auth.uid()));

create policy "staff can read payments" on payments for select using (exists (select 1 from staff where auth_user_id = auth.uid()));
create policy "staff can write payments" on payments for all using (exists (select 1 from staff where auth_user_id = auth.uid()));

create policy "staff can read schedule" on schedule for select using (exists (select 1 from staff where auth_user_id = auth.uid()));
create policy "staff can write schedule" on schedule for all using (exists (select 1 from staff where auth_user_id = auth.uid()));

create policy "staff can read own staff row" on staff for select using (auth_user_id = auth.uid());

-- ============================================================
-- After creating a user in Authentication > Users, grant them
-- access to the back-office by adding them to "staff":
--
-- insert into staff (auth_user_id, full_name, role)
-- values ('paste-the-user-uuid-here', 'Full Name', 'admin');
--
-- Optional: seed the public content tables with your real data
-- (or just use the admin dashboard once staff access is set up).
-- ============================================================

-- ============================================================
-- SEED: 2027 fee structure supplied by the school (KSh per term).
-- Only runs if the tables are still empty, so it is safe to re-run.
-- Day total = tuition + lunch + snacks; "day + boarding" adds
-- settings.boarding_fee (30,000) — computed on the site.
-- ============================================================
update settings set boarding_fee = 30000, stationery_fee = 2000 where id = 'main';

insert into fees (sort_order, band_name, levels, tuition, lunch, snacks)
select * from (values
  (1, 'ECDE Wing',     'Playgroup, PP1, PP2', 6000,  5000, 2400),
  (2, 'Lower Primary', 'Grade 1 – 3',         7500,  5000, 2400),
  (3, 'Upper Primary', 'Grade 4 – 6',         8000,  5000, 2400),
  (4, 'Junior School', 'Grade 7 – 9',         10000, 5000, 2400),
  (5, 'Senior School', 'Grade 10 – 12',       15000, 5000, 2400)
) as v(sort_order, band_name, levels, tuition, lunch, snacks)
where not exists (select 1 from fees);

insert into transport_zones (sort_order, zone, areas, amount)
select * from (values
  (1, 'Zone A', 'Town, Nyali, Mtwapa, Utange, Mwakirunge', 7500),
  (2, 'Zone B', 'Bamburi, Kiembeni, Safari',               6000),
  (3, 'Zone C', 'Vikwatani, Mwisho wa Lami',               4500)
) as v(sort_order, zone, areas, amount)
where not exists (select 1 from transport_zones);
