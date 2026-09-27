# finFlow

finFlow is a starter personal-finance app with a React/Vite client and an Express, MongoDB, and JWT API.

## Prerequisites

- Node.js 20.19+ or 22.12+
- MongoDB running locally, or a MongoDB Atlas connection string

## Run the API

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Set `MONGODB_URI` and replace `JWT_SECRET` in `backend/.env` with a long random value. Then run:

```powershell
npm run dev
```

The API listens on `http://localhost:5000`. `GET /api/health` is available for a quick check.

## Run the client

In a second terminal:

```powershell
cd frontend/finflow
npm install
npm run dev
```

The Vite client uses `http://localhost:5000/api` by default. Set `VITE_API_URL` in `frontend/finflow/.env` to change it.

## MongoDB Compass Setup

1. Start the MongoDB service, then open MongoDB Compass.
2. Connect using the host from `MONGODB_URI` in `backend/.env` (for a local default, `mongodb://127.0.0.1:27017`; use your Atlas host for Atlas).
3. The database name is the final path component of `MONGODB_URI` and is case-sensitive. Select **Create Database**, enter that exact name and `users` as the first collection, then create it.
4. Keep the same URI in `backend/.env`; for example, `mongodb://127.0.0.1:27017/finflow` selects the `finflow` database.
5. Start the API and sign up through the app. A `users` document will be created with `name`, `email`, `passwordHash`, `role`, `currency`, and timestamp fields. Passwords are stored as bcrypt hashes, not plain text.

Mongoose can create the database and `users` collection automatically on the first signup, so creating them in Compass first is optional. Personal finance records use owner-scoped `accounts`, `transactions`, `budgets`, and `goals` collections for both standard users and administrators. Admin telemetry/configuration uses `usageevents`, `auditlogs`, `systemevents`, and `appsettings`; Mongoose creates these collections on first use. You do not need to create collections manually in Compass.

## Auth, Roles, And Currency

Signup and login return a one-day JWT. The client stores it in `localStorage`, sends it as a bearer token, and validates the session with `/api/auth/me` on startup. Signing out removes the token; expired or invalid tokens are rejected by the API. New accounts always receive the `user` role. For local development, update a user's `role` field to `admin` in the Compass `finflow.users` collection. The `/admin` client route and `/api/admin/overview` endpoint both require that role.

User currency is stored on the user document and defaults to `INR`. Profile settings allow users to change their display currency, and dashboard amounts use a shared formatter. Supported currency codes in the current user schema are `INR`, `USD`, `EUR`, and `GBP`; changing the display currency does not convert stored financial values.

## Admin Access

There is no public admin signup. Create a normal account, then promote that account in Compass by editing its document in `finflow.users`: set `role` to `admin` and `status` to `active`. Sign out and back in, then open `/admin`. The entire `/admin` route and every `/api/admin` endpoint require a valid JWT and the `admin` role. Do not promote untrusted accounts.

Admin collections (`usageevents`, `auditlogs`, `systemevents`, `appsettings`) are created by Mongoose when first used. Personal finance collections (`accounts`, `transactions`, `budgets`, `goals`) are also created on first write. Both user and admin finance screens use the same components and APIs, and every personal finance query is scoped to the authenticated owner. System-wide admin analytics return counts/trends only and never include transaction amounts or descriptions.

For local admin setup, the `users` collection's `lastActiveAt` may be empty until a user signs in after this feature is installed. Existing users without a `status` field are treated as active.

## Finance Data

Overview, Accounts, Transactions, Budgets, and Reports use the same authenticated, owner-scoped finance workspace for users and administrators. Records created there are stored in MongoDB and visible only to their owner. No bank integrations are configured.