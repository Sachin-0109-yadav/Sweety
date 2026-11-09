# Sweety --- Smart Blood Glucose Tracker

Sweety is a full-stack web application for recording blood glucose
readings and reviewing daily and monthly summaries. It provides
authenticated user accounts, reading management, a dashboard, and
reports with glucose statistics.

**Live application:** https://sweety-psi.vercel.app\
**Backend API health:**
https://sweety-backend-s3pb.onrender.com/api/health\
**Repository:** https://github.com/Sachin-0109-yadav/Sweety

> **Project context:** Built as a full-stack developer assessment
> project. This application is intended for tracking and demonstration
> purposes; it is not a medical device and does not provide diagnosis or
> treatment advice.

## Features

### Authentication and accounts

-   User registration and login.
-   Password hashing with bcrypt.
-   JWT-based authentication.
-   Authenticated users can access only their own readings.

### Glucose readings

-   Create, view, update, and delete readings.
-   Record a date, reading slot, and glucose value in mg/dL.
-   Four supported daily slots: Morning (fasting), After breakfast,
    After lunch, and After dinner.
-   Validation for glucose values and reading dates.
-   Prevent duplicate readings for the same slot and date, and enforce
    the daily reading limit.

### Dashboard and reports

-   Dashboard with recent readings and glucose statistics.
-   Daily report for a selected date.
-   Month-to-date report.
-   Monthly report for the previous full month.
-   Highest, lowest, average, and reading-count summaries.
-   Charts and visual analytics.
-   Friendly empty states when there is no report data.

### User experience

-   Responsive interface for desktop and mobile.
-   Protected application routes.
-   Form validation and user-facing error states.

## Technology stack

  Layer              Technologies
  ------------------ ----------------------------------------------
  Frontend           React, Vite, JavaScript, React Router, Axios
  Charts             Recharts
  UI icons           Lucide React
  Backend            Node.js, Express.js
  Database           PostgreSQL
  Database access    `pg`
  Authentication     JSON Web Tokens (JWT), bcrypt
  Validation         Zod
  Frontend hosting   Vercel
  Backend hosting    Render
  Database hosting   Neon

## Architecture

``` text
Browser
  |
  v
React + Vite frontend (Vercel)
  |
  | HTTPS / REST API + JWT
  v
Node.js + Express backend (Render)
  |
  | PostgreSQL connection (TLS)
  v
Neon PostgreSQL database
```

The frontend communicates with the backend through the `VITE_API_URL`
environment variable. Protected API requests include the user's JWT
access token. The backend enforces authentication and user-level
ownership checks before accessing readings.

## Repository structure

``` text
Sweety/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── features/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── test/
│   │   └── utils/
│   ├── index.html
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── package.json
│   └── .env.example
├── database/
│   ├── migrations/
│   └── seeds/
├── tests/
│   ├── backend/
│   └── frontend/
├── docs/
├── screenshots/
├── package.json
└── README.md
```

Some folders may contain additional files as the project evolves.

## Requirements

-   Node.js 22 or later
-   npm
-   PostgreSQL 15 or later, or a PostgreSQL-compatible hosted database
    such as Neon
-   Git

Check installed versions:

``` bash
node --version
npm --version
git --version
```

## Local installation and setup

### 1. Clone the repository

``` bash
git clone https://github.com/Sachin-0109-yadav/Sweety.git
cd Sweety
```

### 2. Install dependencies

The repository uses npm workspaces:

``` bash
npm install
```

### 3. Configure PostgreSQL

Create a PostgreSQL database (for example, `sweety_db`).

Apply the initial schema migration using your PostgreSQL client or your
database host's SQL editor:

``` text
database/migrations/001_initial_schema.sql
```

For a local PostgreSQL installation, you can run:

``` bash
psql -U postgres -d sweety_db -f database/migrations/001_initial_schema.sql
```

### 4. Configure backend environment variables

Create `server/.env` using `server/.env.example` as a reference.

For a local PostgreSQL database, configure the database host, port,
database name, username, and password. Configure a strong JWT secret of
at least 32 characters.

For Neon or another hosted PostgreSQL database, use its full connection
string in `DATABASE_URL`. Do not commit `.env` files or share real
credentials.

### 5. Configure the frontend environment

Create `client/.env`:

``` env
VITE_API_URL=http://localhost:5000/api
```

The Vite development server uses port `5173`; the backend's local API
uses port `5000` in the current development configuration. If the
backend uses another port, update the URL accordingly.

### 6. Start the backend

From the repository root:

``` bash
npm run dev:server
```

### 7. Start the frontend

Open a second terminal at the repository root:

``` bash
npm run dev:client
```

Open the local frontend URL printed by Vite (normally
`http://localhost:5173`).

## Environment variables

Use `server/.env.example` as the source of truth for the backend's
required variables. The application configuration uses these keys:

  -----------------------------------------------------------------------
  Variable                            Purpose
  ----------------------------------- -----------------------------------
  `NODE_ENV`                          Runtime environment, such as
                                      `development` or `production`

  `PORT`                              Backend listening port; the hosting
                                      platform may provide this
                                      automatically

  `JWT_SECRET`                        Secret used to sign and verify
                                      authentication tokens; use a strong
                                      value of at least 32 characters

  `DATABASE_URL`                      Full PostgreSQL connection string
                                      for Neon or another hosted
                                      PostgreSQL service

  `DB_HOST`                           Local PostgreSQL hostname when not
                                      using `DATABASE_URL`

  `DB_PORT`                           Local PostgreSQL port; defaults to
                                      `5432`

  `DB_NAME`                           Local PostgreSQL database name

  `DB_USER`                           Local PostgreSQL username

  `DB_PASSWORD`                       Local PostgreSQL password

  `CLIENT_URL`                        Frontend origin allowed by the
                                      backend CORS configuration
  -----------------------------------------------------------------------

The frontend uses:

  Variable         Purpose
  ---------------- -------------------------------------------------
  `VITE_API_URL`   Backend API base URL, including the `/api` path

**Important:** Vite exposes variables prefixed with `VITE_` to browser
code. Never put database credentials, JWT secrets, or other private
values in frontend environment variables.

For production, configure environment variables in the hosting
providers' dashboards rather than committing secret values to Git.

## Available npm scripts

Run these commands from the repository root:

  -----------------------------------------------------------------------
  Command                             Description
  ----------------------------------- -----------------------------------
  `npm run dev:server`                Start the backend development
                                      server

  `npm run dev:client`                Start the Vite frontend development
                                      server

  `npm run build`                     Build the frontend for production

  `npm run test:backend`              Run backend tests

  `npm run test:frontend`             Run frontend tests

  `npm run test:all`                  Run backend tests, frontend tests,
                                      and the frontend build

  `npm run lint`                      Run configured workspace lint
                                      scripts, when present
  -----------------------------------------------------------------------

Run the complete test and build sequence:

``` bash
npm run test:all
```

## API overview

The backend exposes REST endpoints under `/api`.

  ----------------------------------------------------------------------------
  Area                    Endpoint                     Purpose
  ----------------------- ---------------------------- -----------------------
  Health                  `GET /api/health`            Check API availability

  Database health         `GET /api/health/database`   Check PostgreSQL
                                                       connectivity

  Authentication          `/api/auth`                  Registration, login,
                                                       current-user and
                                                       profile operations

  Readings                `/api/readings`              Create, list, update,
                                                       and delete glucose
                                                       readings

  Reports                 `/api/reports`               Retrieve report
                                                       summaries and reading
                                                       history
  ----------------------------------------------------------------------------

The exact request and response schemas are defined in the backend route,
controller, and validation files.

## Validation and data rules

The application supports the four assessment reading slots: Morning
(fasting), After breakfast, After lunch, and After dinner.

The reading form and backend validation enforce the assignment's core
rules:

-   Glucose value is required.
-   Glucose value must be a whole number between 40 and 600 mg/dL.
-   Only one reading is allowed per slot per date.
-   No more than four readings are allowed per day.
-   A reading date cannot be in the future.

The backend must remain the final authority for validation; frontend
validation is provided for a clearer user experience.

## Reports

The reports area supports:

-   **Daily:** readings for the selected date.
-   **Month-to-date:** from the first day of the selected month through
    the selected date.
-   **Monthly:** the complete previous calendar month.

Each report summarizes the highest, lowest, and average glucose value
(average rounded to one decimal place), along with the number of
readings. The daily report also displays individual readings and their
slots. Empty periods display an empty state.

## Deployment

  Component             Provider
  --------------------- ----------
  React frontend        Vercel
  Express API           Render
  PostgreSQL database   Neon

### Production URLs

-   **Application:** https://sweety-psi.vercel.app
-   **Backend health:**
    https://sweety-backend-s3pb.onrender.com/api/health
-   **Database health:**
    https://sweety-backend-s3pb.onrender.com/api/health/database

### Frontend deployment configuration

Configure the Vercel project with:

-   Root directory: `client`
-   Framework preset: Vite
-   Build command: `npm run build`
-   Output directory: `dist`
-   Environment variable:
    `VITE_API_URL=https://sweety-backend-s3pb.onrender.com/api`

The `client/vercel.json` rewrite configuration supports client-side
routes when a route is opened directly or refreshed.

### Backend deployment configuration

Configure the Render service to use the `server` directory, install
dependencies with `npm install`, and start with `npm start`. Add the
production database connection string, JWT secret, and frontend origin
in Render's environment settings.

## Testing

The project includes backend and frontend automated tests.

``` bash
npm run test:backend
npm run test:frontend
npm run test:all
```

During development, **27 backend tests and 39 frontend tests passed (66
total)**. Re-run the commands above against the current checkout to
verify the latest code.

### Manual test checklist

-   [ ] Register a new user.
-   [ ] Log in and access the dashboard.
-   [ ] Add a glucose reading.
-   [ ] View the readings list.
-   [ ] Edit a reading.
-   [ ] Delete a reading.
-   [ ] Verify duplicate-slot and daily-limit validation.
-   [ ] Verify future dates and out-of-range values are rejected.
-   [ ] Open daily, month-to-date, and previous-month reports.
-   [ ] Verify one user's readings are not visible to another user.
-   [ ] Log out and verify protected pages require authentication.

## Screenshots and demo

Add current screenshots or a short 2--3 minute screen recording to the
`screenshots/` directory before submission.

Suggested screenshots:

1.  `screenshots/dashboard.png` --- dashboard overview.
2.  `screenshots/readings.png` --- glucose readings list.
3.  `screenshots/add-reading.png` --- add-reading form.
4.  `screenshots/reports.png` --- analytics and reports.
5.  `screenshots/login.png` --- login screen.

Only include screenshots actually captured from the running application.
Hide email addresses, tokens, and other personal information.

## Seed data

The assignment requests a seed script that creates a demo user and
sample glucose readings. Keep the seed script under `database/seeds/`
and document its exact command here once it is implemented and verified.

Do not run a seed script against production unless it is specifically
designed for production and you intend to create the demo data there.
Use a development or disposable database for test data.

## Security notes

-   Passwords are hashed with bcrypt and are not stored as plain text.
-   Protected API routes require authentication.
-   Reading operations are scoped to the authenticated user.
-   Keep `.env` files and all credentials out of version control.
-   Use HTTPS for deployed frontend and API communication.
-   This project is a demonstration and tracking application, not a
    substitute for professional medical advice.

## Assumptions and future improvements

### Assumptions

-   Each user manages their own glucose readings.
-   A user can record at most one reading for each of the four defined
    slots per calendar day.
-   Glucose values are recorded in mg/dL.
-   Reports use the selected date to determine daily and month-to-date
    ranges, while the monthly report covers the previous complete
    calendar month.

### Possible improvements

-   Add pagination and filtering to the readings API.
-   Add more comprehensive end-to-end tests.
-   Add Docker Compose for repeatable local development.
-   Improve observability with structured logs and error monitoring.
-   Add export options for reports (CSV/PDF).
-   Add reminders and configurable notifications.
-   Conduct a security review and improve deployment monitoring before
    any real-world clinical use.

## Author

**Sachin**\
GitHub: https://github.com/Sachin-0109-yadav\
LinkedIn: https://linkedin.com/in/sachin-31y08

## License

No license has been specified yet. Add a `LICENSE` file if you intend to
publish the project under an open-source license.
