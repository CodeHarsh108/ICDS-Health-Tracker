/**
 * ICDS Tracker — Database Seed Script
 * Seeds via the Spring Boot REST API on localhost:8080
 * Admin: 9589850604 / admin123
 * 
 * Run: node seed.mjs
 */

const BASE = 'http://localhost:8080';
let TOKEN = '';

// ===== Helpers =====
async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}) },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`  ❌ POST ${path} → ${res.status}: ${text.substring(0, 120)}`);
    return null;
  }
  try { return JSON.parse(text); } catch { return { _raw: text }; }
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}) },
  });
  if (!res.ok) return null;
  try { return await res.json(); } catch { return null; }
}

// ===== Data =====
const centers = [
  { centerCode: 'AW1',  name: 'Anganwadi Sundarpur',    village: 'Sundarpur',    block: 'Sadar',     district: 'Varanasi' },
  { centerCode: 'AW2',  name: 'Anganwadi Ramgarh',      village: 'Ramgarh',      block: 'Chandauli', district: 'Chandauli' },
  { centerCode: 'AW3',  name: 'Anganwadi Lakshmipur',   village: 'Lakshmipur',   block: 'Mirzapur',  district: 'Mirzapur' },
  { centerCode: 'AW4',  name: 'Anganwadi Devpura',      village: 'Devpura',      block: 'Jaunpur',   district: 'Jaunpur' },
  { centerCode: 'AW5',  name: 'Anganwadi Krishnanagar', village: 'Krishnanagar', block: 'Azamgarh',  district: 'Azamgarh' },
  { centerCode: 'AW6',  name: 'Anganwadi Shivpuri',     village: 'Shivpuri',     block: 'Ghazipur',  district: 'Ghazipur' },
  { centerCode: 'AW7',  name: 'Anganwadi Govindpur',    village: 'Govindpur',    block: 'Balia',     district: 'Ballia' },
  { centerCode: 'AW8',  name: 'Anganwadi Nehrunagar',   village: 'Nehrunagar',   block: 'Gorakhpur', district: 'Gorakhpur' },
  { centerCode: 'AW9',  name: 'Anganwadi Gandhigram',   village: 'Gandhigram',   block: 'Deoria',    district: 'Deoria' },
  { centerCode: 'AW10', name: 'Anganwadi Patelpur',     village: 'Patelpur',     block: 'Mau',       district: 'Mau' },
];

const workers = [
  { employeeId: 'W1',  fullName: 'Sunita Devi',   mobile: '9100000001', email: 'sunita@aw.in',  role: 'WORKER' },
  { employeeId: 'W2',  fullName: 'Meena Kumari',  mobile: '9100000002', email: 'meena@aw.in',   role: 'WORKER' },
  { employeeId: 'W3',  fullName: 'Rekha Sharma',  mobile: '9100000003', email: 'rekha@aw.in',   role: 'WORKER' },
  { employeeId: 'W4',  fullName: 'Geeta Yadav',   mobile: '9100000004', email: 'geeta@aw.in',   role: 'WORKER' },
  { employeeId: 'W5',  fullName: 'Kavita Singh',  mobile: '9100000005', email: 'kavita@aw.in',  role: 'WORKER' },
  { employeeId: 'W6',  fullName: 'Anita Verma',   mobile: '9100000006', email: 'anita@aw.in',   role: 'WORKER' },
  { employeeId: 'W7',  fullName: 'Pooja Gupta',   mobile: '9100000007', email: 'pooja@aw.in',   role: 'WORKER' },
  { employeeId: 'W8',  fullName: 'Suman Pandey',  mobile: '9100000008', email: 'suman@aw.in',   role: 'WORKER' },
  { employeeId: 'W9',  fullName: 'Lata Mishra',   mobile: '9100000009', email: 'lata@aw.in',    role: 'WORKER' },
  { employeeId: 'W10', fullName: 'Asha Tiwari',   mobile: '9100000010', email: 'asha@aw.in',    role: 'WORKER' },
];

const supervisors = [
  { employeeId: 'S1',  fullName: 'Rajesh Kumar',    mobile: '9200000001', email: 'rajesh@aw.in', role: 'SUPERVISOR' },
  { employeeId: 'S2',  fullName: 'Priya Patel',     mobile: '9200000002', email: 'priya@aw.in',  role: 'SUPERVISOR' },
  { employeeId: 'S3',  fullName: 'Amit Srivastava', mobile: '9200000003', email: 'amit@aw.in',   role: 'SUPERVISOR' },
  { employeeId: 'S4',  fullName: 'Neha Gupta',      mobile: '9200000004', email: 'neha@aw.in',   role: 'SUPERVISOR' },
  { employeeId: 'S5',  fullName: 'Vikram Chauhan',  mobile: '9200000005', email: 'vikram@aw.in', role: 'SUPERVISOR' },
  { employeeId: 'S6',  fullName: 'Deepa Joshi',     mobile: '9200000006', email: 'deepa@aw.in',  role: 'SUPERVISOR' },
  { employeeId: 'S7',  fullName: 'Manoj Tripathi',  mobile: '9200000007', email: 'manoj@aw.in',  role: 'SUPERVISOR' },
  { employeeId: 'S8',  fullName: 'Seema Agarwal',   mobile: '9200000008', email: 'seema@aw.in',  role: 'SUPERVISOR' },
  { employeeId: 'S9',  fullName: 'Ravi Dubey',      mobile: '9200000009', email: 'ravi@aw.in',   role: 'SUPERVISOR' },
  { employeeId: 'S10', fullName: 'Kiran Saxena',    mobile: '9200000010', email: 'kiran@aw.in',  role: 'SUPERVISOR' },
];

// B1-B10: Children (diverse ages, genders). B11-B12: Pregnant mothers in centers 3 & 7
const beneficiaries = [
  { fullName: 'Arjun Kumar',    dateOfBirth: '2023-03-15', gender: 'MALE',   parentName: 'Ramesh Kumar',  parentMobile: '9300000001', isPregnant: false, centerIdx: 0 },
  { fullName: 'Priya Sharma',   dateOfBirth: '2022-08-20', gender: 'FEMALE', parentName: 'Suresh Sharma', parentMobile: '9300000002', isPregnant: false, centerIdx: 1 },
  { fullName: 'Rohan Singh',    dateOfBirth: '2024-01-10', gender: 'MALE',   parentName: 'Ajay Singh',    parentMobile: '9300000003', isPregnant: false, centerIdx: 2 },
  { fullName: 'Ananya Patel',   dateOfBirth: '2023-06-25', gender: 'FEMALE', parentName: 'Vijay Patel',   parentMobile: '9300000004', isPregnant: false, centerIdx: 3 },
  { fullName: 'Dev Yadav',      dateOfBirth: '2022-11-05', gender: 'MALE',   parentName: 'Manoj Yadav',   parentMobile: '9300000005', isPregnant: false, centerIdx: 4 },
  { fullName: 'Isha Verma',     dateOfBirth: '2023-09-12', gender: 'FEMALE', parentName: 'Anil Verma',    parentMobile: '9300000006', isPregnant: false, centerIdx: 5 },
  { fullName: 'Kabir Gupta',    dateOfBirth: '2024-04-18', gender: 'MALE',   parentName: 'Sanjay Gupta',  parentMobile: '9300000007', isPregnant: false, centerIdx: 6 },
  { fullName: 'Meera Pandey',   dateOfBirth: '2023-02-28', gender: 'FEMALE', parentName: 'Dinesh Pandey', parentMobile: '9300000008', isPregnant: false, centerIdx: 7 },
  { fullName: 'Aarav Mishra',   dateOfBirth: '2022-12-03', gender: 'MALE',   parentName: 'Rakesh Mishra', parentMobile: '9300000009', isPregnant: false, centerIdx: 8 },
  { fullName: 'Saanvi Tiwari',  dateOfBirth: '2023-07-08', gender: 'FEMALE', parentName: 'Sunil Tiwari',  parentMobile: '9300000010', isPregnant: false, centerIdx: 9 },
  // Pregnant mothers
  { fullName: 'Radha Devi',     dateOfBirth: '1998-05-14', gender: 'FEMALE', parentName: 'Mohan Lal',     parentMobile: '9300000011', isPregnant: true,  centerIdx: 2 },
  { fullName: 'Savitri Kumari', dateOfBirth: '2000-09-22', gender: 'FEMALE', parentName: 'Bhola Nath',    parentMobile: '9300000012', isPregnant: true,  centerIdx: 6 },
];

// Diverse growth profiles for each child
const growthProfiles = [
  [{ date:'2025-01-15', w:10.5, h:78, m:14.5 },{ date:'2025-03-15', w:11.2, h:80, m:14.8 },{ date:'2025-05-01', w:11.8, h:82, m:15.0 }],
  [{ date:'2025-01-10', w:8.5,  h:75, m:12.8 },{ date:'2025-03-10', w:9.2,  h:77, m:13.2 },{ date:'2025-05-01', w:9.8,  h:79, m:13.5 }],
  [{ date:'2025-02-01', w:7.0,  h:65, m:12.0 },{ date:'2025-04-01', w:7.8,  h:68, m:12.5 },{ date:'2025-05-01', w:8.2,  h:70, m:12.8 }],
  [{ date:'2025-01-20', w:9.8,  h:76, m:14.0 },{ date:'2025-03-20', w:10.5, h:78, m:14.3 },{ date:'2025-05-01', w:11.0, h:80, m:14.5 }],
  [{ date:'2025-01-05', w:7.5,  h:73, m:11.5 },{ date:'2025-03-05', w:7.8,  h:75, m:11.8 },{ date:'2025-05-01', w:8.0,  h:76, m:12.0 }],
  [{ date:'2025-02-12', w:9.0,  h:72, m:14.2 },{ date:'2025-04-12', w:9.8,  h:74, m:14.5 },{ date:'2025-05-01', w:10.2, h:75, m:14.8 }],
  [{ date:'2025-02-18', w:6.0,  h:60, m:11.5 },{ date:'2025-04-18', w:6.8,  h:63, m:12.0 },{ date:'2025-05-01', w:7.2,  h:65, m:12.2 }],
  [{ date:'2025-01-28', w:8.0,  h:74, m:12.5 },{ date:'2025-03-28', w:9.0,  h:76, m:13.0 },{ date:'2025-05-01', w:9.5,  h:78, m:13.5 }],
  [{ date:'2025-01-03', w:10.0, h:80, m:15.0 },{ date:'2025-03-03', w:10.8, h:82, m:15.2 },{ date:'2025-05-01', w:11.5, h:84, m:15.5 }],
  [{ date:'2025-02-08', w:8.8,  h:71, m:13.5 },{ date:'2025-04-08', w:9.5,  h:73, m:13.8 },{ date:'2025-05-01', w:10.0, h:75, m:14.0 }],
];

const nutritionItems = [
  { itemName: 'Egg',         quantity: 2,   unit: 'piece' },
  { itemName: 'Milk',        quantity: 200, unit: 'ml' },
  { itemName: 'Dal Khichdi', quantity: 150, unit: 'grams' },
  { itemName: 'Banana',      quantity: 1,   unit: 'piece' },
  { itemName: 'Halwa',       quantity: 100, unit: 'grams' },
  { itemName: 'Chikki',      quantity: 50,  unit: 'grams' },
  { itemName: 'Upma',        quantity: 120, unit: 'grams' },
  { itemName: 'Poha',        quantity: 130, unit: 'grams' },
  { itemName: 'Curd',        quantity: 100, unit: 'ml' },
  { itemName: 'Fruit Salad', quantity: 80,  unit: 'grams' },
];

// ===== MAIN =====
async function main() {
  console.log('\n🌱 ICDS Tracker — Seeding Database\n' + '━'.repeat(50));

  // Step 0: Login as admin (mobile: 9589850604, password: admin123)
  console.log('\n📌 Step 0: Admin Login');
  const loginRes = await post('/auth/login', { mobile: '9589850604', password: 'admin123' });
  if (!loginRes || !loginRes.token) {
    console.error('❌ Could not login as admin. Ensure backend is running and admin exists.');
    process.exit(1);
  }
  TOKEN = loginRes.token;
  console.log('  ✅ Logged in as admin (token acquired)');

  // Step 1: Create 10 Centers
  console.log('\n📌 Step 1: Creating 10 Centers');
  const centerIds = [];
  for (const c of centers) {
    const res = await post('/centers', c);
    if (res && res.data && res.data.id) {
      centerIds.push(res.data.id);
      console.log(`  ✅ ${c.centerCode} — ${c.name} (ID: ${res.data.id})`);
    } else {
      // Maybe already exists, try fetching all
      const all = await get('/centers');
      const existing = Array.isArray(all) ? all.find(x => x.centerCode === c.centerCode) : null;
      if (existing) {
        centerIds.push(existing.id);
        console.log(`  ⏭️  ${c.centerCode} already exists (ID: ${existing.id})`);
      } else {
        centerIds.push(null);
        console.error(`  ❌ Failed: ${c.centerCode}`);
      }
    }
  }

  // Step 2: Create Workers & Supervisors (via /workers endpoint, default password = default123)
  console.log('\n📌 Step 2: Creating 10 Workers + 10 Supervisors');
  for (let i = 0; i < 10; i++) {
    const cid = centerIds[i];
    if (!cid) continue;

    // Worker
    const w = { ...workers[i], centerId: cid };
    const wRes = await post('/workers', w);
    console.log(`  ${wRes ? '✅' : '⏭️ '} Worker ${w.employeeId} — ${w.fullName}`);

    // Supervisor
    const s = { ...supervisors[i], centerId: cid };
    const sRes = await post('/workers', s);
    console.log(`  ${sRes ? '✅' : '⏭️ '} Supervisor ${s.employeeId} — ${s.fullName}`);
  }

  // Step 3: Create Beneficiaries
  console.log('\n📌 Step 3: Creating 10 Children + 2 Pregnant Mothers');
  const beneficiaryIds = [];
  for (let i = 0; i < beneficiaries.length; i++) {
    const b = beneficiaries[i];
    const cid = centerIds[b.centerIdx];
    if (!cid) { beneficiaryIds.push(null); continue; }

    const payload = {
      fullName: b.fullName,
      dateOfBirth: b.dateOfBirth,
      gender: b.gender,
      parentName: b.parentName,
      parentMobile: b.parentMobile,
      isPregnant: b.isPregnant,
      centerId: cid,
    };
    const res = await post('/beneficiaries', payload);
    const id = res?.data?.id || res?.id;
    if (id) {
      beneficiaryIds.push(id);
      console.log(`  ✅ ${b.isPregnant ? '🤰' : '👶'} ${b.fullName} → ${centers[b.centerIdx].centerCode} (ID: ${id})`);
    } else {
      beneficiaryIds.push(null);
      console.log(`  ❌ Failed: ${b.fullName}`);
    }
  }

  // Step 4: Growth Records (children only, first 10)
  console.log('\n📌 Step 4: Adding Growth Records');
  for (let i = 0; i < 10; i++) {
    const bid = beneficiaryIds[i];
    if (!bid) continue;
    const profile = growthProfiles[i];
    let ok = 0;
    for (const g of profile) {
      const res = await post(`/beneficiaries/${bid}/growth`, {
        recordDate: g.date,
        weightKg: g.w,
        heightCm: g.h,
        muacCm: g.m,
        notes: `Checkup at ${centers[beneficiaries[i].centerIdx].name}`,
      });
      if (res) ok++;
    }
    console.log(`  ✅ ${beneficiaries[i].fullName} — ${ok}/${profile.length} growth records`);
  }

  // Step 5: Nutrition Distribution
  console.log('\n📌 Step 5: Adding Nutrition Records');
  const nutritionDates = ['2025-04-01', '2025-04-15', '2025-05-01'];
  for (let i = 0; i < 10; i++) {
    const bid = beneficiaryIds[i];
    if (!bid) continue;
    let ok = 0;
    for (let d = 0; d < nutritionDates.length; d++) {
      const item = nutritionItems[(i + d) % nutritionItems.length];
      const res = await post(`/beneficiaries/${bid}/nutrition`, {
        distributionDate: nutritionDates[d],
        itemName: item.itemName,
        quantity: item.quantity,
        unit: item.unit,
      });
      if (res) ok++;
    }
    console.log(`  ✅ ${beneficiaries[i].fullName} — ${ok}/3 nutrition records`);
  }

  // Step 6: Attendance (3 days, diverse present/absent patterns)
  console.log('\n📌 Step 6: Marking Attendance');
  const attendanceDates = ['2025-05-01', '2025-05-02', '2025-05-05'];
  for (let di = 0; di < attendanceDates.length; di++) {
    const date = attendanceDates[di];
    const attendances = [];
    for (let i = 0; i < 10; i++) {
      const bid = beneficiaryIds[i];
      if (!bid) continue;
      // Diverse pattern: rotate who is absent
      const isPresent = !((i + di) % 4 === 0);
      attendances.push({ beneficiaryId: bid, isPresent });
    }
    const res = await post('/attendance/batch', {
      attendanceDate: date,
      sessionType: 'CHILD_SESSION',
      attendances,
    });
    const pc = attendances.filter(a => a.isPresent).length;
    console.log(`  ${res ? '✅' : '❌'} ${date} — ${pc}/${attendances.length} present`);
  }

  // Step 7: Vaccination
  console.log('\n📌 Step 7: Recording Vaccinations');
  for (let i = 0; i < 10; i++) {
    const bid = beneficiaryIds[i];
    if (!bid) continue;

    const schedule = await get(`/beneficiaries/${bid}/vaccination-schedule`);
    if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
      console.log(`  ⏭️  ${beneficiaries[i].fullName} — no schedule`);
      continue;
    }

    const pending = schedule.filter(v => v.status !== 'COMPLETED');
    const toMark = pending.slice(0, Math.min(2 + (i % 2), pending.length));
    let marked = 0;
    for (const v of toMark) {
      const vid = v.vaccineId || v.id;
      if (!vid) continue;
      const res = await post(`/beneficiaries/${bid}/vaccinations`, {
        vaccineId: vid,
        givenDate: '2025-04-20',
        batchNumber: `BATCH-2025-${String(i + 1).padStart(3, '0')}`,
      });
      if (res) marked++;
    }
    console.log(`  ✅ ${beneficiaries[i].fullName} — ${marked} vaccines`);
  }

  // Done
  console.log('\n' + '━'.repeat(50));
  console.log('🎉 Seeding complete!\n');
  console.log(`  📍 Centers:       ${centerIds.filter(Boolean).length}/10`);
  console.log(`  👷 Workers:       10 (password: default123)`);
  console.log(`  📋 Supervisors:   10 (password: default123)`);
  console.log(`  👶 Children:      ${beneficiaryIds.slice(0, 10).filter(Boolean).length}/10`);
  console.log(`  🤰 Pregnant:      ${beneficiaryIds.slice(10).filter(Boolean).length}/2`);
  console.log(`  📈 Growth:        30 records`);
  console.log(`  🍽️  Nutrition:     30 records`);
  console.log(`  📅 Attendance:    3 days`);
  console.log(`  💉 Vaccinations:  ~20 records`);
  console.log(`\n  Admin Login: 9589850604 / admin123\n`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
