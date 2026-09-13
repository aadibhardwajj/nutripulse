# NutriPulse — Production-Quality Fitness & Nutrition Tracking Web Application

NutriPulse is a commercial-grade, full-stack fitness and nutrition tracking web application inspired by the functionality and UX patterns of MyFitnessPal. Built with an original brand identity, modern visual hierarchy, and scientific metabolic formulas (Mifflin-St Jeor), NutriPulse delivers precision calorie, macronutrient, hydration, and progressive overload exercise tracking.

---

## Architecture Overview

```
                      ┌─────────────────────────────────────────┐
                      │          React SPA (Vite v5)            │
                      │  - Tailwind CSS + CSS Design Tokens     │
                      │  - TanStack Query v5 + Zustand          │
                      │  - React Hook Form + Recharts           │
                      │  - Lucide React + Error Boundary        │
                      └────────────────────┬────────────────────┘
                                           │
                                  HTTPS / JSON REST
                                           │
                      ┌────────────────────▼────────────────────┐
                      │       Node.js / Express Backend         │
                      │  - Helmet + CORS Allowlist              │
                      │  - Express Rate Limiting                │
                      │  - Zod Input Validation & Sanitization  │
                      │  - Centralized Error Handler (JSON)     │
                      │  - Mifflin-St Jeor Calculation Engine   │
                      └────────────────────┬────────────────────┘
                                           │
                                  Mongoose Pooling
                                           │
                      ┌────────────────────▼────────────────────┐
                      │             MongoDB Atlas               │
                      │  - Indexed collections (userId, date)   │
                      │  - Cascade Account & Health Deletion    │
                      │  - Strict Cross-User Tenant Isolation   │
                      └─────────────────────────────────────────┘
```

---

## Key Features

1. **Intelligent Calorie & Macro Engine**:
   - Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) calculation using Mifflin-St Jeor.
   - Dynamic energy balance calculation: `Remaining = Goal - Consumed + Burned`.
   - Real-time macronutrient progress bars for Carbohydrates, Protein, and Fat.
   - *Presented as scientific metabolic estimates for wellness guidance.*

2. **Full Daily Food Diary**:
   - Categorized meal tracking: Breakfast, Lunch, Dinner, and Snacks.
   - Micronutrient & macronutrient breakdown: Calories, Protein, Carbohydrates, Fat, Fiber, Sugars, and Sodium.
   - Seamless add, edit, and delete operations with confirmation dialogs and date navigation.

3. **Debounced Food Database Search & Pagination**:
   - Instant query lookup across whole foods, brand items, and user-custom foods.
   - Category filtering (Fruits, Vegetables, Grains, Dairy & Eggs, Meat & Poultry, Seafood, etc.).
   - Interactive nutrition facts panel with dynamic portion size scaling.
   - One-tap favorites bookmarking and recent foods history.

4. **Saved Meals & Multi-Ingredient Recipes**:
   - Recipe builder with dynamic ingredient inputs (name, quantity, unit, calories, protein, carbs, fat), automated totals calculation, and unsaved changes warnings.
   - Saved Meals with multi-item logging for one-tap diary entries.
   - Standardized server-side pagination (`{ data, pagination: { page, limit, total, pages } }`).

5. **Exercise & Workout Tracking**:
   - Activity catalog with scientifically referenced MET values for cardio, running, cycling, swimming, and sports.
   - Multi-set resistance workout routine tracker (Exercises, Sets, Reps, and Weights) with confirmation modals and unsaved changes guards.

6. **Hydration Tracking**:
   - Daily fluid intake goal progress with quick-add actions (`+250ml`, `+500ml`, `+750ml`, `+1000ml`) and custom volume input.
   - Daily timestamped hydration timeline.

7. **Progress Analytics & Charts**:
   - Interactive Recharts visualizers for Calorie Budget vs Intake, Macro Distributions, Weight milestones, and Active Exercise minutes.
   - Customizable time horizons: 7 Days, 30 Days, 3 Months, 6 Months, and 1 Year.

8. **Three-Mode Appearance Engine**:
   - **Light Mode**: Dedicated clean light surface design with soft borders and crisp contrast.
   - **Dark Mode**: Deep slate aesthetic designed for low-light environments and minimal eye strain.
   - **System Default**: Automatically reacts to device OS theme updates (`prefers-color-scheme: dark`) without page reload.
   - Zero screen flash on initial page load via early evaluation scripts.

9. **Polished Guided Onboarding**:
   - 4-step wizard calculating personalized caloric and macro goals from user biometrics (height, weight, sex, age, activity level, goal).

10. **Enterprise Security & Data Isolation**:
    - Bcrypt password hashing (10 rounds) and JWT authentication with automatic 401 expiration handling.
    - Rate limiting, Helmet security headers, and CORS protection.
    - Full cascade deletion of all user records (diary, workouts, logs, profile, goals) on account deletion.
    - Strict cross-user data isolation (backend enforces `userId: req.user._id` across all queries).

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, JavaScript, JSX, Vite 5, React Router DOM v6, Tailwind CSS, TanStack Query v5, Zustand, React Hook Form, Axios, Recharts, Lucide React |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose 8, JSON Web Tokens (JWT), bcryptjs, Zod, Helmet, Express Rate Limit, CORS |
| **Deployment** | Vercel Serverless (`backend/api/index.js` + `frontend/vercel.json` SPA rewrites), MongoDB Atlas |

---

## Project Directory Structure

```
fitness-tracker/
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       (Button, Input, Select, Modal, ConfirmModal, Card, Badge, Skeleton, DateNavigator, Toast)
│   │   │   ├── layout/       (Navbar, Sidebar, MobileNav, PageHeader)
│   │   │   ├── nutrition/    (CalorieBudgetRing, MacroBar, MealSection, FoodSearchModal, LogWaterModal, QuickAddModal)
│   │   │   ├── exercise/     (LogExerciseModal)
│   │   │   └── progress/     (LogWeightModal)
│   │   ├── pages/            (Landing, Login, Register, Onboarding, Dashboard, Diary, Foods, FoodDetail, Meals, Recipes, RecipeDetail, Exercise, Workouts, Water, Weight, Progress, Profile, Settings, NotFoundPage)
│   │   ├── layouts/          (AppLayout, AuthLayout)
│   │   ├── hooks/            (useTheme, useDebounce)
│   │   ├── services/         (api.js)
│   │   ├── store/            (useAuthStore, useThemeStore, useUIStore)
│   │   ├── utils/            (dateUtils, formatters)
│   │   ├── routes/           (AppRoutes, ProtectedRoute)
│   │   ├── styles/           (index.css, theme.css)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json           (SPA rewrite configuration)
│   ├── tailwind.config.js
│   └── README.md
│
├── backend/
│   ├── api/
│   │   └── index.js          (Vercel Serverless Function export)
│   ├── config/
│   │   ├── db.js             (Mongoose serverless pooling & production guard)
│   │   └── constants.js
│   ├── controllers/         (auth, dashboard, diary, food, meal, recipe, exercise, workout, water, weight, progress, profile)
│   ├── middleware/          (auth, error, validation, rateLimit)
│   ├── models/              (User, UserProfile, UserGoal, Food, Diary, Meal, Recipe, ExerciseLog, Workout, WaterLog, WeightLog, Measurement, Favorite, NotificationPreference)
│   ├── routes/              (auth, dashboard, diary, food, meal, recipe, exercise, workout, water, weight, progress, profile)
│   ├── services/            (calculationService.js)
│   ├── validators/          (auth, diary, food, log)
│   ├── utils/               (responseHandler, dateHelper)
│   ├── database/
│   │   └── seed.js           (Verified food database and demo history seeder with prod guards)
│   ├── test-suite.js         (Core E2E test verification suite)
│   ├── test-security.js      (Hardening & tenant isolation verification suite)
│   ├── server.js             (Local development server)
│   ├── vercel.json           (Backend Vercel serverless routing)
│   └── package.json
│
├── .env.example
├── .gitignore
├── vercel.json
└── README.md
```

---

## API Documentation

All API responses follow a consistent, standardized envelope:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Core Endpoints

| Method | Endpoint | Auth Required | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | No | System health check (API & DB connectivity status) |
| `POST` | `/api/auth/register` | No | Register new user account with initial credentials |
| `POST` | `/api/auth/login` | No | Authenticate user & return signed JWT token |
| `GET` | `/api/auth/me` | Yes | Retrieve authenticated user profile, biometrics & goals |
| `PUT` | `/api/auth/password` | Yes | Secure password change (verifies current password) |
| `DELETE` | `/api/auth/account` | Yes | Permanent cascade deletion of user and all health logs |
| `GET` | `/api/dashboard/summary?date=YYYY-MM-DD` | Yes | Day totals, remaining calories, macros, recent logs |
| `GET` | `/api/diary?date=YYYY-MM-DD` | Yes | Categorized daily food diary (Breakfast, Lunch, Dinner, Snacks) |
| `POST` | `/api/diary/items` | Yes | Add item to a daily diary meal |
| `PUT` | `/api/diary/items/:itemId` | Yes | Update quantity or serving of logged food item |
| `DELETE` | `/api/diary/items/:itemId` | Yes | Remove logged food item from diary |
| `POST` | `/api/diary/copy` | Yes | Copy diary entries from one date to another |
| `GET` | `/api/foods?query=...&page=1&limit=20` | Yes | Search whole & brand food database with pagination |
| `POST` | `/api/foods/custom` | Yes | Create custom user food item |
| `GET` | `/api/recipes?page=1&limit=10` | Yes | List user saved recipes with pagination |
| `POST` | `/api/recipes` | Yes | Create new multi-ingredient recipe |
| `DELETE` | `/api/recipes/:id` | Yes | Delete user recipe (ownership verified) |
| `GET` | `/api/meals?page=1&limit=10` | Yes | List user saved meal combinations with pagination |
| `POST` | `/api/meals` | Yes | Save meal for quick 1-tap logging |
| `DELETE` | `/api/meals/:id` | Yes | Delete saved meal (ownership verified) |
| `GET` | `/api/water?date=YYYY-MM-DD` | Yes | Daily hydration total and log timeline |
| `POST` | `/api/water` | Yes | Log water intake (`amountMl`) |
| `GET` | `/api/weight/logs?page=1&limit=10` | Yes | User weight history with pagination |
| `POST` | `/api/weight` | Yes | Log body weight measurement |
| `GET` | `/api/exercise/logs?page=1&limit=10` | Yes | Logged exercise activities with pagination |
| `POST` | `/api/exercise/logs` | Yes | Log cardio activity with MET-based caloric burn |
| `GET` | `/api/workouts?page=1&limit=10` | Yes | List resistance workout routines with pagination |
| `POST` | `/api/workouts` | Yes | Save resistance workout routine |
| `GET` | `/api/progress/analytics?days=7` | Yes | Chart time-series analytics (calories, weight, macros) |
| `PUT` | `/api/profile/biometrics` | Yes | Update height, weight, activity level, goal |
| `PUT` | `/api/profile/goals` | Yes | Update target calories and macro percentage split |

---

## Local Development Setup

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm
- MongoDB connection URI (optional in local dev; falls back to an in-memory Mongo server)

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/nutripulse?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```
*(Note: If `MONGODB_URI` is omitted during local development, backend automatically spins up an in-memory MongoDB session so you can test immediately without any local database daemon. In production, this fallback is strictly disabled and will fail fast).*

Seed database with verified demo foods and history:
```bash
npm run seed
```
Demo Credentials generated:
- **Email**: `demo@nutripulse.com`
- **Password**: `Password123!`

Start the backend server:
```bash
npm run dev
```
Backend runs at `http://localhost:5000`.

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the Vite development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Automated Verification Suites

The codebase includes two built-in verification scripts:

### 1. Production Hardening & Security Suite
Verifies health status formatting, 404 JSON fallbacks, server-side pagination, cross-user tenant data isolation, cascade account deletion, and token invalidation:
```bash
cd backend
node test-security.js
```

### 2. End-to-End API Suite
Verifies authentication, biometrics, food search, diary logging, hydration, exercises, weights, progress analytics, and goals update:
```bash
cd backend
node test-suite.js
```

### 3. Frontend Production Build Check
```bash
cd frontend
npm run build
```

---

## Deployment to Vercel + MongoDB Atlas

### 1. MongoDB Atlas Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with read/write privileges.
3. In **Network Access**, add `0.0.0.0/0` (allow access from anywhere, required for serverless functions).
4. Copy the connection string:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/nutripulse?retryWrites=true&w=majority`

### 2. Deploy Backend (`fitness-backend`)
1. In Vercel, click **Add New Project** and import your repository.
2. Set **Root Directory** to `backend`.
3. Framework Preset: **Other**.
4. Set Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection URI.
   - `JWT_SECRET`: A high-entropy random secret key (e.g. generated via `openssl rand -hex 32`).
   - `JWT_EXPIRES_IN`: `7d`
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: `https://your-frontend.vercel.app`
5. Click **Deploy**. Note your backend URL (e.g. `https://fitness-backend.vercel.app`).
6. The backend serverless handler is configured in `backend/api/index.js` and routed via `backend/vercel.json`.

### 3. Deploy Frontend (`fitness-frontend`)
1. In Vercel, click **Add New Project** and import the same repository.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Set Environment Variables:
   - `VITE_API_URL`: `https://fitness-backend.vercel.app/api`
7. Click **Deploy**. The `frontend/vercel.json` SPA rewrite rule guarantees that reloading nested paths (e.g. `/dashboard`, `/diary`, `/recipes/123`) serves `index.html` without 404 errors.

---

## Security & Production Best Practices

- **Zero Plaintext Passwords**: Passwords salted and hashed with `bcryptjs` (10 rounds).
- **Tenant Isolation**: Every database query filters by `userId: req.user._id`. Frontend user IDs in URL params or body payloads are strictly ignored.
- **Serverless DB Connection Pooling**: Mongoose connection is cached across lambda invocations (`cachedPromise`), with `maxPoolSize: 10`, `serverSelectionTimeoutMS: 5000`, and `socketTimeoutMS: 45000`.
- **CORS Allowlist**: Production mode strictly checks origins against `FRONTEND_URL`.
- **Rate Limiting**: Defends against brute-force attacks (`50` requests / 15 mins for auth, `1000` requests / 15 mins for general API).
- **Zod Request Validation**: Inbound request payloads are validated and sanitized prior to controller execution.
- **Accessible UX**: ARIA labels, focus states, keyboard navigation, accessible confirmation dialogs for destructive actions, and unsaved changes warnings.
- **Error Boundaries**: React Error Boundary catches unexpected component errors and presents an accessible recovery prompt without exposing stack traces.

---

## License
MIT License. Created by the NutriPulse Core Engineering Team.
