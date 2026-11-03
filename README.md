<div align="center">

<img src="https://vteiyljzrqvlfujipdlf.supabase.co/storage/v1/object/sign/Official%20logo/Glossy%20Teal%20Connected%20Loop%20Emblem.png?token=eyJraWQiOiJlMDEyYTY3MS1jMGQwLTQzZjQtYmQ3MC01YjFhYmY2ZjYxZjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJPZmZpY2lhbCBsb2dvL0dsb3NzeSBUZWFsIENvbm5lY3RlZCBMb29wIEVtYmxlbS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzkzNzExNTkxLCJleHAiOjE4MjUyNDc1OTF9.zXMv_0GGSmo36fKcOXwvqHcPGXXvFnTS01BOdcAAgUA6nH8In0HaoVx5NYuYrnpH0ZHnsU16qB_IYVhfqQvlkA" alt="Doorbly Official Logo" width="100" height="100" style="border-radius: 20px;" />

# DOORBLY Workstation
### Remote Employee Workstation & Operations Management System
**Enterprise Multi-District Operations Platform across 30 Districts of Odisha, India**

[![React](https://img.shields.io/badge/React-19.0.1-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.3.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![License](https://img.shields.io/badge/License-Proprietary-teal.svg)](#license)

</div>

---

## 📋 Overview

**DOORBLY Remote Employee Workstation** is a full-featured, enterprise-grade operations platform engineered for distributed field staff, district managers, district coordinators, and central executive administration across all **30 districts of Odisha**.

The platform orchestrates daily task assignments, work submission verification, productivity credit calculation, staff wallet balances, withdrawal disbursements, customer service bookings, partner onboarding, and multi-district revenue pipelines in real-time.

---

## ✨ Key Capabilities

- **🌀 Dynamic Brand Emblem**: Official Doorbly emblem with continuous 3D perspective flip (`rotateY`) and an orbiting emerald light beacon.
- **🏛️ 30 Districts of Odisha**: Fully mapped districts from Khordha (Bhubaneswar HQ) and Cuttack to Mayurbhanj, Sundargarh, and Ganjam with real-time quota tracking.
- **🔐 Multi-Tier Role-Based Access (RBAC)**:
  - `super_admin`: Full statewide executive governance, financial approvals, SQL console, and system audit logs.
  - `district_manager`: District-level oversight, task allocation, team performance, and verification queues.
  - `district_coordinator`: Ground operations, field partner verification, and task progress monitoring.
  - `employee`: Individual task workspace, attendance clock-in, proof submissions, and wallet earnings.
- **💼 Individual Staff Wallet & Earnings**:
  - Live task payouts, commissions, bonus credits, and deductions ledger.
  - Real-time bank account & UPI withdrawal request pipeline with approval workflows.
- **📝 Evidence-Based Work Submission**: Upload proofs (links, screenshots, descriptions) with strict dual-review validation.
- **👥 CRM & Booking Pipeline**: General customer leads, corporate prospects, service bookings, and verified partner onboarding.
- **🗄️ Supabase & PostgreSQL Engine**:
  - Direct PostgreSQL schema with 23 relational tables and RLS security policies (`src/sql/schema.sql`).
  - Automatic bidirectional real-time persistence with offline-first client storage fallback.
  - Built-in Central Admin SQL runner and table inspection console.

---

## 🏗️ Architecture & Tech Stack

```
├── public/                 # Static assets & brand emblems
├── src/
│   ├── components/
│   │   ├── admin/          # Central Admin Panel, Wallet Control, Earnings
│   │   ├── announcements/  # Statewide and district announcements
│   │   ├── approvals/      # Task submission review and approval queue
│   │   ├── attendance/     # Shift check-in, geofenced logs, leave requests
│   │   ├── auth/           # Secure login, employee credential verification
│   │   ├── bookings/       # Customer service pipeline and invoices
│   │   ├── common/         # DoorblyLogo, BackendStatusModal, HR/Tech views
│   │   ├── crm/            # General leads & corporate prospect CRM
│   │   ├── dashboard/      # Role-specific dashboards (Admin, DM, DC, Staff)
│   │   ├── districts/      # 30 Districts revenue analytics & KPIs
│   │   ├── layout/         # Top Navbar (IST clock), Collapsible Sidebar
│   │   ├── partners/       # Service partner onboarding & document check
│   │   ├── performance/    # Productivity ratings, credit ledgers
│   │   ├── profile/        # Employee profile, bank/UPI details, ID card
│   │   ├── reports/        # Daily operational & department reports
│   │   ├── support/        # Helpdesk ticket resolution system
│   │   ├── tasks/          # My Daily Tasks, assignment & submission modals
│   │   └── wallet/         # Staff individual earnings wallet & withdrawals
│   ├── constants/          # Districts, departments, branding, task values
│   ├── services/           # Supabase client, Firebase auth, StorageEngine
│   ├── sql/                # Complete PostgreSQL schema (schema.sql & schemaSql.ts)
│   ├── types/              # Comprehensive TypeScript interfaces & domain types
│   ├── App.tsx             # Root application orchestrator
│   └── index.css           # Tailwind CSS v4 & custom animations
├── .env.example            # Environment variables configuration
├── package.json            # Scripts & project dependencies
├── tsconfig.json           # Strict TypeScript configuration
└── vite.config.ts          # Vite build & plugin configuration
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org) (v18.0.0 or higher recommended)
- `npm` or `bun`

### 1. Clone the Repository
```bash
git clone https://github.com/debabratamohanta884-MD/Doorbly-official-staff-workstation.git
cd Doorbly-official-staff-workstation
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file by copying the template:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
# Supabase Configuration
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

# Optional: Firebase Authentication
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_PROJECT_ID=""
```

### 4. Database Initialization
To create all 23 relational tables in your Supabase PostgreSQL instance:
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Open `src/sql/schema.sql` from this repository.
3. Paste the entire SQL script and execute **RUN**.
4. All tables, indexes, and Row Level Security policies will be set up automatically.

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite local development server on port 3000 |
| `npm run build` | Compiles the TypeScript codebase and outputs a production build to `/dist` |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs TypeScript compilation verification (`tsc --noEmit`) |
| `npm run clean` | Removes compiled distribution artifacts |

---

## 🔑 Authorized Baseline Credentials

The system provides an initial executive profile for immediate access:

| Field | Value |
| :--- | :--- |
| **Employee ID** | `DBL-OD-001` |
| **Email** | `debabratamohanta884@gmail.com` |
| **Designation** | State Director & Central Admin |
| **Role** | `super_admin` |
| **Headquarters** | Khordha (Bhubaneswar HQ) |

---

## 🚢 Deployment

### Vercel / Netlify
1. Connect your GitHub repository to Vercel or Netlify.
2. Set Build Command: `npm run build`
3. Set Output Directory: `dist`
4. Add environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Docker
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📄 License
Copyright © 2024–2026 **DOORBLY Technologies Private Limited**. All rights reserved.  
Confidential & Proprietary for authorized Doorbly personnel and partners.
