# The Governor Creek School — Website

Full website for a primary and secondary school in Mombasa: public site + a staff
back-office that can update **everything** — school info, programs, admissions, fees,
news, gallery, and student records.

## ⚠️ About the content in this build

Real assets now in use: the official logo (`images/logo.jpg`, used as favicon and in
every header/footer/admin sidebar), the real campus building photo on the home page
hero, and two real campus photos in the gallery. The 5 education levels (Play Group,
Pre-Primary PP1 & PP2, Primary Grade 1–6, Junior Secondary Grade 7–9, Senior School
Grade 10–12), the facilities list, the tagline ("Learning Today, Leading Tomorrow")
and the brief presentation are all taken from the school's own flyer. The color
palette (navy, gold, green, blue, orange) is sampled directly from the logo and the
building facade. The **2027 fee structure** supplied by the school (5 bands, day vs
boarding, stationery, 3 transport zones) is live on the Admissions page.

Still placeholder **Lorem ipsum** — fill these in from the Site Info, Admissions &
Fees and News sections of the staff dashboard before going live: exact street
address, phone/email/WhatsApp, real Facebook/TikTok links (no public account was
found under this name), student/teacher counts, pass rate, and news posts. The Google Map
currently searches "The Governor Creek School, Mombasa" — paste the exact address or
coordinates in Site Info → Map location for a precise pin. A few gallery slots also still use placeholder images — swap them for real
photos (classroom, library, sports day, science lab) via the Gallery section.

## Structure

```
/
├── index.html               Home
├── programs.html             Programs, facilities, sample timetable
├── admissions.html           Admission steps, fees, validated application form
├── gallery.html               Photo gallery (admin-managed)
├── contact.html               Contact info + validated contact form
├── images/                    Real logo + campus photos
├── css/style.css             Public site design (Navy/Gold/Green/Blue/Orange palette)
├── js/
│   ├── supabase-client.js     ⚙️ Supabase keys go here
│   ├── data-service.js        Shared data layer (demo mode or Supabase) for ALL content
│   ├── validation.js          Generic form validation (required *, formats, limits)
│   └── main.js                 Renders public pages from data-service.js
├── admin/                     Staff back-office
│   ├── index.html              Login
│   ├── dashboard.html          Manage: site info, programs, facilities, admissions &
│   │                            fees, news, gallery, students, grades, payments, schedule
│   ├── css/admin.css
│   └── js/admin.js
└── supabase/schema.sql        Full SQL schema (public content + student records)
```

## 1. Try it in demo mode (no setup needed)

Open `index.html` through a local server (see below) and everything already works:
public pages show the placeholder content, and `admin/index.html` accepts **any**
email/password to explore the dashboard. Data is stored in the browser
(`localStorage`) — perfect for testing, but not shared between devices.

## 2. Fill in the real content

Sign in at `admin/index.html`, then go through each dashboard section:

- **Site Info** — map location (address or coordinates, drives the Google Map on the Contact page), school name, tagline, brief presentation, address, phone, email,
  WhatsApp, office hours, Facebook/TikTok/Instagram links, home page statistics.
- **Programs** — add/remove each program (name, age range, description).
- **Admissions & Fees** — the numbered admission steps, the **2027 fee bands**
  (tuition, lunch, snacks — day and day + boarding totals are calculated automatically),
  and the optional **transport zones**. Use **Edit** to change an amount for a new year.
  The boarding fee (30,000) and yearly stationery fee (2,000) are in **Site Info**.
- **News** — short announcements shown on the home page.
- **Gallery** — paste image URLs (e.g. from Google Drive, Facebook, or any image
  host) with a caption; they appear on the Home and Gallery pages instantly.
- **Students / Grades / Payments / Schedule** — the internal record-keeping tools.

All forms validate required fields (marked with **\***), formats (email, phone,
URLs) and character limits, and show a clear error message under any invalid field.

## 3. Switch on a real, shared database (Supabase)

1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the contents of `supabase/schema.sql`.
3. In **Settings → API**, copy the `Project URL` and `anon public` key.
4. Paste them into `js/supabase-client.js` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`).
5. In **Authentication → Users**, create an account for each staff member.
6. In **SQL Editor**, grant each account access to the dashboard:
   ```sql
   insert into staff (auth_user_id, full_name, role)
   values ('paste-the-user-uuid-here', 'Full Name', 'admin');
   ```

Once configured, the public site reads live data from Supabase (no login required —
it's public content), while the back-office tables (students, grades, payments,
schedule) stay restricted to signed-in staff.

## 4. Run it locally

No build step — plain HTML/CSS/JS. From the project folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html`. On Windows, install Python from
python.org (check "Add python.exe to PATH") and run the same command in PowerShell.

## 5. Put it online

- **Netlify / Vercel**: drag-and-drop the folder onto
  [app.netlify.com/drop](https://app.netlify.com/drop), or connect a GitHub repo.
- **GitHub Pages**: push this folder to a repo and enable Pages in its settings.
- **Regular hosting**: upload all files via FTP to your host's public folder.

## 6. Receiving contact/admission form submissions for real

Right now the public forms validate input and show an on-screen confirmation, but
don't send anywhere yet. Two simple options once you're ready:
- A service like [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com)
  (free, no backend needed).
- Or save straight to Supabase — call `insertRow('contact_requests', {...})` from
  `handleContactSubmit()` in `js/main.js` (the table already exists in the schema).

---
This is a ready-to-customize base — replace every Lorem ipsum block via the admin
dashboard, and swap the placeholder logo/images for the school's real artwork
before launch.
