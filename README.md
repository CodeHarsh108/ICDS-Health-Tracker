````md
# 🌱 ICDS Health Tracker – Anganwadi Management System

<p align="center">

![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)
![API](https://img.shields.io/badge/API-deployed-blue?style=for-the-badge)
![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.5-brightgreen?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-61dafb?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

</p>

<p align="center">
  <b>Offline-First • Voice-Assisted • AI-Driven • Production-Ready</b>
</p>

<p align="center">
A modern health management platform for Anganwadi workers under India's ICDS scheme.
</p>

---

## 🔗 Live Links

🌐 **Frontend Demo**  
https://icds-health-tracker.netlify.app

⚙️ **Backend API**  
https://icds-health-tracker.onrender.com

---

# 📌 Table of Contents

- [📖 Overview](#-overview)
- [❓ Why This Project?](#-why-this-project)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ System Architecture](#️-system-architecture)
- [🚀 Getting Started](#-getting-started)
- [🔐 Environment Variables](#-environment-variables)
- [📚 API Documentation](#-api-documentation)
- [📸 Screenshots](#-screenshots)
- [🧭 Future Roadmap](#-future-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgements](#-acknowledgements)

---

# 📖 Overview

**ICDS Health Tracker** digitizes the daily workflow of rural Anganwadi workers by replacing traditional paper registers with a smart, scalable, offline-capable web platform.

The system helps track:

- 👶 Child growth records
- 💉 Vaccination schedules
- 🥗 Nutrition distribution
- 📈 Malnutrition risk prediction
- 🗣️ Voice-based data entry
- 📊 WHO-compliant growth analytics

Built specifically for **low-connectivity rural environments**.

---

# ❓ Why This Project?

Traditional Anganwadi systems still rely heavily on paper records.  
That means:

- Lost records
- Delayed reporting
- Poor analytics
- Missed vaccinations
- Difficult field operations

This platform modernizes the entire workflow.

| 🚨 Problem | ✅ Solution |
|---|---|
| Paper registers & manual records | Offline-first digital sync using IndexedDB |
| Low literacy & slow typing | Voice-assisted data entry |
| Delayed malnutrition detection | Predictive risk scoring system |
| Missed vaccination schedules | Automated due/overdue tracking |
| Poor internet in villages | Offline queue with auto-sync |
| No growth visualization | WHO Z-score growth charts |

---

# ✨ Features

---

## ✅ Core Features

### 🔐 Authentication & Security
- JWT Authentication
- Role-based access control
- Spring Security integration

### 👥 Beneficiary Management
- Manage centers, workers, and children
- CRUD operations with validation

### 📈 Growth Tracking
- Weight & height records
- Duplicate prevention
- Future date validation

### 💉 Vaccination Tracking
- 19 preloaded vaccines
- Due / overdue indicators
- Auto scheduling

### 🥗 Nutrition Distribution
- Nutrition logs
- Monthly summaries
- Consumption reports

### 📅 Attendance Management
- Batch attendance marking
- Monthly percentage analytics

### 📄 Report Generation
- PDF reports
- CSV exports
- Growth summaries
- Vaccination coverage reports

---

## 🚀 Advanced Features

### 📊 WHO Z-Score Growth Analytics
- Weight-for-age classification
- Growth curve visualization
- Severe underweight → obese classification

### 🧠 Predictive Malnutrition Risk Engine
Risk score generated using:
- Growth trends
- Nutrition gaps
- Vaccination status
- Attendance consistency
- Age-specific health indicators

### 🌐 Offline-First Architecture
- IndexedDB local storage
- Auto sync queue
- Axios retry interceptor
- Works without internet

### 🎙️ Voice-Assisted Data Entry
Supports:
- Growth recording
- Attendance updates
- Beneficiary registration

Built using:
- Web Speech API
- Custom NLP parsing

### ☁️ Production Deployment
- Backend hosted on Render
- Frontend deployed on Netlify

---

# 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Spring Boot 3.4.5, Java 21, Spring Security, JWT, JPA |
| **Frontend** | React 18, React Router, Axios, Recharts |
| **Database** | PostgreSQL 16 |
| **Offline Storage** | Dexie.js + IndexedDB |
| **Voice Processing** | Web Speech API |
| **Reports** | OpenPDF, Apache Commons CSV |
| **Deployment** | Docker, Render, Netlify |

---

# 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Netlify)                │
│                                                             │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐   │
│  │ Voice Input │   │ Offline DB  │   │ Recharts Graphs │   │
│  │ Web Speech  │   │ Dexie.js    │   │ WHO Z-Scores    │   │
│  └──────┬──────┘   └──────┬──────┘   └────────┬────────┘   │
│         └─────────────────┼────────────────────┘            │
│                           │                                 │
│                    HTTP + JWT                               │
│                           ▼                                 │
│                Spring Boot REST API                         │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Controllers • Services • JWT Filter • Repositories   │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│                    PostgreSQL Database                      │
└─────────────────────────────────────────────────────────────┘
````

---

# 🚀 Getting Started

---

## 📋 Prerequisites

Install:

* Java 21
* Maven
* Node.js 18+
* PostgreSQL 16
* Docker (optional)

---

# ⚙️ Backend Setup

```bash
# Clone repository
git clone https://github.com/yourusername/icds-health-tracker.git

# Navigate
cd icds-health-tracker/backend

# Start PostgreSQL container
docker run --name icds-db \
-e POSTGRES_DB=icds_db \
-e POSTGRES_USER=icds_user \
-e POSTGRES_PASSWORD=icds_pass \
-p 5432:5432 \
-d postgres:16

# Run Spring Boot app
./mvnw spring-boot:run
```

---

# 💻 Frontend Setup

```bash
cd ../frontend

npm install

npm run dev
```

Frontend runs at:

```txt
http://localhost:5173
```

---

# 🐳 Docker Compose

Run full stack:

```bash
docker-compose up -d
```

---

# 🔐 Environment Variables

---

## Backend (`application.properties`)

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/icds_db
spring.datasource.username=icds_user
spring.datasource.password=icds_pass

jwt.secret=YOUR_SECRET_KEY
jwt.expiration.ms=86400000
```

---

## Frontend (`.env`)

```env
VITE_API_URL=https://icds-health-tracker.onrender.com
```

---

# 📚 API Documentation

Swagger UI:

```txt
http://localhost:8080/swagger-ui.html
```

---

## 🔑 Important Endpoints

### Authentication

```http
POST /auth/login
```

Request:

```json
{
  "mobile": "9999999999",
  "password": "admin123"
}
```

---

### Beneficiaries

```http
GET /beneficiaries
POST /beneficiaries/{id}/growth
```

---

### Risk Prediction

```http
GET /risk/at-risk?centerId=1
```

---

### Reports

```http
GET /reports/nutrition-summary/csv?centerId=1&year=2025&month=5
```

---

# 📸 Screenshots

| Dashboard                                                        | Growth Analytics                                                      |
| ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| ![Dashboard](https://via.placeholder.com/500x250?text=Dashboard) | ![Growth](https://via.placeholder.com/500x250?text=WHO+Z-Score+Chart) |

| Offline Sync                                                      | Voice Input                                                    |
| ----------------------------------------------------------------- | -------------------------------------------------------------- |
| ![Offline](https://via.placeholder.com/500x250?text=Offline+Sync) | ![Voice](https://via.placeholder.com/500x250?text=Voice+Input) |

> Replace placeholder images with actual project screenshots.

---

# 🧭 Future Roadmap

* [ ] SMS vaccination reminders
* [ ] React Native mobile app
* [ ] Full multilingual support
* [ ] ML-based malnutrition prediction
* [ ] Aadhaar / biometric integration
* [ ] Real-time analytics dashboard
* [ ] GIS village health mapping

---

# 🤝 Contributing

Contributions are welcome.

```bash
# Fork repository

# Create branch
git checkout -b feature/amazing-feature

# Commit changes
git commit -m "Add amazing feature"

# Push branch
git push origin feature/amazing-feature
```

Then open a Pull Request 🚀

---

# 📄 License

Distributed under the **MIT License**.

See `LICENSE` for more information.

---

# 🙏 Acknowledgements

Special thanks to:

* WHO Anthro
* Recharts
* Dexie.js
* Render
* Netlify
* Spring Boot Community

---

<p align="center">
  Built with ❤️ for rural healthcare innovation in India 🇮🇳
</p>

<p align="center">
  <a href="#-icds-health-tracker--anganwadi-management-system">⬆ Back To Top</a>
</p>
```

Source: 
