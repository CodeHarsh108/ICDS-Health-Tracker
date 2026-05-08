# ICDS Health Tracker – Anganwadi Management System

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://icds-health-tracker.netlify.app)
[![API](https://img.shields.io/badge/API-deployed-blue)](https://icds-health-tracker.onrender.com)
[![Java](https://img.shields.io/badge/Java-21-orange)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.5-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> **🧠 A production‑ready, offline‑first, voice‑assisted health management platform for rural Anganwadi workers.**  
> Built to tackle child malnutrition, vaccine tracking, and real‑time risk prediction in low‑connectivity environments.

🔗 **Live Demo** → [https://icds-health-tracker.netlify.app](https://icds-health-tracker.netlify.app)  
🔗 **API Endpoint** → [https://icds-health-tracker.onrender.com](https://icds-health-tracker.onrender.com)

---

## 📌 Table of Contents
- [Overview](#overview)
- [Why This Project?](#why-this-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 📖 Overview


**ICDS Health Tracker** digitises the workflow of Anganwadi (rural childcare) workers under India’s ICDS scheme. It replaces paper registers with a modern web app that works **offline**, understands **voice commands**, predicts **malnutrition risk**, and generates **WHO‑compliant growth charts**.

Target users:
- **Anganwadi Worker** – daily attendance, growth records, vaccination tracking, nutrition distribution
- **Supervisor** – monitor multiple centers, view reports, risk alerts
- **Admin** – manage centers & workers, generate reports

---

## 🧩 Why This Project?

| Problem | Solution |
|---------|----------|
| Paper registers → data loss | **Offline‑first sync** with IndexedDB |
| Low literacy & typing difficulty | **Voice‑assisted data entry** (Web Speech API) |
| Late malnutrition detection | **Predictive risk scoring** (5 factors + WHO Z‑score) |
| Missed vaccinations | **Auto‑schedule** with due/overdue status |
| No growth visualisation | **WHO Z‑score charts** with classification |
| Poor internet in villages | **Offline queue** – data saved locally, syncs when online |

---

## ✨ Features

### ✅ Core (Foundation)
- Role‑based authentication (JWT, Spring Security)
- CRUD for Centers, Workers, Beneficiaries
- Growth tracking with duplicate & future date validation
- Vaccination schedule (19 preloaded vaccines) with due/overdue status
- Nutrition distribution log + monthly summary
- Attendance register (batch marking, monthly % stats)
- PDF/CSV reports (growth summary, vaccination coverage, nutrition)

### 🚀 Advanced 
- **WHO Z‑score growth chart** – weight‑for‑age Z‑score + classification (severe underweight → obese)
- **Predictive malnutrition risk system** – 5 weighted factors → risk score (0‑100) + actionable recommendations
- **Offline‑first sync** – IndexedDB queue, axios interceptor, auto‑sync on network restore
- **Voice‑assisted data entry** – Web Speech API + custom NLP parsing for growth records, attendance, registration
- **Live demo** – deployed on Render (backend) + Netlify (frontend)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Spring Boot 3.4.5, Java 21, Spring Security, JWT, Spring Data JPA |
| **Database** | PostgreSQL 16 |
| **Frontend** | React 18, React Router, Axios, Recharts, Dexie.js (IndexedDB) |
| **Voice** | Web Speech API (no backend – pure browser) |
| **PDF/CSV** | OpenPDF, Apache Commons CSV |
| **DevOps** | Docker, Render (backend), Netlify (frontend) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Netlify)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Voice Input │  │ Offline DB  │  │ Recharts (Z‑score)  │  │
│  │ (Web Speech)│  │ (Dexie.js)  │  │                     │  │
│  └─────────────┘  └──────┬──────┘  └─────────────────────┘  │
│         │                │                                   │
│         └────────┬───────┘                                   │
│                  │ HTTP / JWT                                │
│                  ▼                                           │
│         Spring Boot API (Render)                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Security │ JWT Filter │ Controllers │ Services │ Repos  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                  │                                           │
│                  ▼                                           │
│              PostgreSQL (Supabase / Render)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Java 21 + Maven
- Node.js 18+ + npm
- PostgreSQL 16 (or use Docker)

### Backend Setup

```bash
# Clone repository
git clone https://github.com/yourusername/icds-health-tracker.git
cd icds-health-tracker/backend

# Create PostgreSQL database (or use Docker)
docker run --name icds-db -e POSTGRES_DB=icds_db -e POSTGRES_USER=icds_user -e POSTGRES_PASSWORD=icds_pass -p 5432:5432 -d postgres:16

# Configure application.properties (see Environment Variables)
# Build and run
./mvnw spring-boot:run
```

### Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

The app will open at `http://localhost:5173`.

### Docker Compose (Full Stack)

```bash
docker-compose up -d
```

---

## 🔐 Environment Variables

### Backend (`application.properties` or Render env)
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/icds_db
spring.datasource.username=icds_user
spring.datasource.password=icds_pass
jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
jwt.expiration.ms=86400000
```

### Frontend (`.env`)
```
VITE_API_URL=https://icds-health-tracker.onrender.com   # or http://localhost:8080
```

---

## 📚 API Documentation

Interactive Swagger UI (available when running locally):
```
http://localhost:8080/swagger-ui.html
```

**Key Endpoints** (protected by JWT)
```http
POST /auth/login          → { "mobile": "9999999999", "password": "admin123" }
GET  /beneficiaries       → list
POST /beneficiaries/{id}/growth
GET  /risk/at-risk?centerId=1
GET  /reports/nutrition-summary/csv?centerId=1&year=2025&month=5
```

Full Postman collection – [link to be added]

---

## 📸 Screenshots

| Dashboard | Growth Chart with Z‑Score |
|-----------|---------------------------|
| ![Dashboard](https://via.placeholder.com/400x200?text=Dashboard+Screenshot) | ![Z‑Score Chart](https://via.placeholder.com/400x200?text=Z‑Score+Chart) |

| Offline Sync Indicator | Voice Input in Action |
|------------------------|-----------------------|
| ![Offline Queue](https://via.placeholder.com/400x200?text=Offline+Queue) | ![Voice](https://via.placeholder.com/400x200?text=Voice+Input) |


---

## 🧭 Roadmap (Ideas for Future)

- [ ] SMS reminders for vaccinations (Twilio)
- [ ] Mobile app (React Native) with full offline support
- [ ] ML‑based malnutrition prediction (LSTM on historical data)
- [ ] Biometric / Aadhaar integration (mock for demo)
- [ ] Multi‑language support (Hindi, regional languages)

---

## 🤝 Contributing

Contributions are welcome!  
1. Fork the repository  
2. Create your feature branch (`git checkout -b feature/amazing`)  
3. Commit changes (`git commit -m 'Add some amazing feature'`)  
4. Push to the branch (`git push origin feature/amazing`)  
5. Open a Pull Request  

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgements

- WHO Anthro for LMS growth tables
- Recharts for beautiful charts
- Dexie.js for IndexedDB wrapper
- Render & Netlify for free hosting

---

**Built with ❤️ to empower Anganwadi workers and improve child health in rural India.**

[⬆ Back to top](#icds-health-tracker--anganwadi-management-system)
