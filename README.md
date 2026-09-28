# ⚡ CyberHUD

> A cyberpunk-inspired productivity and goal management dashboard for turning daily actions into measurable progress.

**CyberHUD** is a futuristic productivity application designed to manage **tasks, habits, and long-term goals** from a single dashboard.

Instead of treating productivity as a simple checklist, CyberHUD tracks effort, consistency, streaks, progress, and historical activity through a sci-fi HUD-style interface.

All application data is persisted locally in the browser using **IndexedDB through Dexie.js**, so the application can work without a traditional backend or external database.

## 🚀 Live Demo

**[Launch CyberHUD](https://cyber-hud-gold.vercel.app/)**

## ✨ Features

### 📊 Productivity Dashboard

* Overall effort index
* Active habit streak tracking
* Pending task overview
* Active long-term goal tracking
* Today's habit activity
* Goal progress visualization
* Habit streak warnings
* Real-time dashboard updates

### ✅ Task Management

* Create tasks
* Edit tasks
* Delete tasks
* Mark tasks as completed
* Task descriptions
* Due dates
* Pending / completed filtering
* Daily recurring tasks
* Link tasks to long-term goals
* Link tasks to specific goal checkpoints
* Effort classification when completing tasks

### 🔥 Habit Tracking

* Create and edit habits
* Delete habits
* Short-term and long-term habit classification
* Configurable target duration
* Automatic long-term promotion
* Daily effort logging
* Current streak tracking
* Consecutive missed-day tracking
* 14-day visual habit history
* Effort-based progress tracking

### 🎯 Long-Term Goals

* Create and manage strategic goals
* Set target dates
* Organize goals by category
* Break goals into smaller checkpoints
* Track checkpoint completion
* Connect tasks to specific goals
* Visualize goal completion progress

### 📈 Analytics

* Effort telemetry
* Habit activity analysis
* Task activity
* Progress visualization
* Historical effort tracking
* Recharts-based data visualization

### 💾 Local-First Data Storage

CyberHUD uses **IndexedDB** through Dexie.js for persistent browser storage.

This means:

* No backend server is required
* Data persists between browser sessions
* Tasks, habits, goals, and logs are stored locally
* React components automatically react to database changes

### 🖥️ Cyberpunk HUD Interface

* Futuristic cyberpunk interface
* Animated HUD-style background
* Boot/terminal welcome screen
* Sci-fi dashboard navigation
* Responsive layout
* Visual status indicators
* Optional interface audio
* Toggleable background grid
* Lucide iconography

## 🛠️ Tech Stack

### Core

* **React 19**
* **JavaScript (ES Modules)**
* **Vite**
* **Tailwind CSS 4**

### Data & State

* **Dexie.js** — IndexedDB database wrapper
* **dexie-react-hooks** — Reactive database queries

### Visualization

* **Recharts** — Charts and data visualization

### UI

* **Lucide React** — Icons
* **Canvas Confetti** — Celebration effects
* Custom CSS animations and cyberpunk HUD styling

### Development

* **Vite** — Development server and build tooling
* **Oxlint** — JavaScript/React linting
* **@vitejs/plugin-react** — React integration for Vite

The dependency list is taken from the project's current `package.json`.

## 📦 Dependencies

### Runtime Dependencies

| Package             | Purpose                          |
| ------------------- | -------------------------------- |
| `react`             | UI library                       |
| `react-dom`         | React browser rendering          |
| `dexie`             | IndexedDB database abstraction   |
| `dexie-react-hooks` | Reactive Dexie queries in React  |
| `recharts`          | Data visualization and analytics |
| `lucide-react`      | Interface icons                  |
| `tailwindcss`       | Utility-first styling            |
| `@tailwindcss/vite` | Tailwind/Vite integration        |
| `canvas-confetti`   | Celebration/confetti effects     |

### Development Dependencies

| Package                | Purpose                           |
| ---------------------- | --------------------------------- |
| `vite`                 | Development server and build tool |
| `@vitejs/plugin-react` | React support for Vite            |
| `@types/react`         | React type definitions            |
| `@types/react-dom`     | React DOM type definitions        |
| `oxlint`               | Fast JavaScript/React linting     |

## 🧠 How It Works

CyberHUD is built around three primary productivity entities:

```text
                    ┌─────────────────┐
                    │   CYBERHUD      │
                    │   DASHBOARD     │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
      ┌────────┐        ┌────────┐        ┌────────┐
      │ Tasks  │        │ Habits │        │ Goals  │
      └────┬───┘        └────┬───┘        └────┬───┘
           │                 │                  │
           └─────────────────┼──────────────────┘
                             ▼
                    ┌─────────────────┐
                    │ Effort & Streak │
                    │    Telemetry    │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────┐
                    │    IndexedDB    │
                    │    via Dexie    │
                    └─────────────────┘
```

The application initializes the local database, loads the stored tasks, habits, and goals, and calculates live productivity telemetry for the dashboard.

## ⚙️ Effort System

Activities can be classified using four effort levels:

| Level                | Score |
| -------------------- | ----: |
| Full Effort          |  100% |
| Not Full Effort      |   70% |
| Lazy Way             |   40% |
| Zero Effort / Missed |    0% |

These values are used to calculate the application's overall effort telemetry.

## 📂 Project Structure

```text
cyber-hud/
│
├── public/
│   └── screenshot.png
│
├── src/
│   ├── components/
│   │   ├── DashboardOverview.jsx
│   │   ├── TasksMatrix.jsx
│   │   ├── HabitProtocols.jsx
│   │   ├── LongTermGoals.jsx
│   │   ├── VisualAnalytics.jsx
│   │   ├── DataNexus.jsx
│   │   └── ...
│   │
│   ├── db/
│   │   └── database.js
│   │
│   ├── utils/
│   │   ├── streakLogic.js
│   │   └── audioSynth.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 💻 Run Locally

### Prerequisites

Make sure you have:

* [Node.js](https://nodejs.org/) installed
* npm installed

### 1. Clone the repository

```bash
git clone https://github.com/mashukurmanilk/cyber-hud.git
```

### 2. Enter the project directory

```bash
cd cyber-hud
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Vite will provide a local development URL, usually:

```text
http://localhost:5173
```

### 5. Build for production

```bash
npm run build
```

### 6. Preview the production build

```bash
npm run preview
```

### 7. Run linting

```bash
npm run lint
```

## 🌐 Deployment

The application is deployed using **Vercel**.

Live application:

**https://cyber-hud-gold.vercel.app/**

For your own deployment, import the repository into Vercel and use the default Vite build configuration.

## 🔗 Relevant Links

* **Live Demo:** https://cyber-hud-gold.vercel.app/

## 📌 Important Note

CyberHUD currently uses browser-local IndexedDB storage rather than a remote backend database. Clearing the browser's site data can therefore remove locally stored application data.

---

⭐ If you find the project interesting, consider giving the repository a star.
