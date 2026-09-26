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
2. Connect using `mongodb://127.0.0.1:27017` (use your Atlas connection string instead if the database is hosted in Atlas).
3. Select **Create Database**. Enter `finflow` as the database name and `users` as the first collection, then create it.
4. Keep `MONGODB_URI=mongodb://127.0.0.1:27017/finflow` in `backend/.env` so the API uses that database.
5. Start the API and sign up through the app. A `users` document will be created with `name`, `email`, `passwordHash`, `role`, `currency`, and timestamp fields. Passwords are stored as bcrypt hashes, not plain text.

Mongoose can create the database and `users` collection automatically on the first signup, so creating them in Compass first is optional. Do not add `transactions`, `budgets`, or `accounts` collections yet: the app does not have database models or API endpoints for them. Those pages currently display sample data only. Collections for those features should be created when their schemas and API behavior are implemented, not by inserting arbitrary documents now.

## Auth, Roles, And Currency

Signup and login return a one-day JWT. The client stores it in `localStorage`, sends it as a bearer token, and validates the session with `/api/auth/me` on startup. Signing out removes the token; expired or invalid tokens are rejected by the API. New accounts always receive the `user` role. For local development, update a user's `role` field to `admin` in the Compass `finflow.users` collection. The `/admin` client route and `/api/admin/overview` endpoint both require that role.

User currency is stored on the user document and defaults to `INR`. Dashboard amounts use one shared currency formatter that reads the signed-in user's currency, so a future profile-settings currency control can change the display throughout the dashboard. Supported currency codes in the current user schema are `INR`, `USD`, `EUR`, and `GBP`; there is not yet a profile endpoint or UI for changing this preference.

## Sample Data Notice

All balance, income, spending, transaction, budget, and report values shown on the dashboard are hard-coded sample values in `frontend/finflow/src/utils/data.js`. They are not linked to MongoDB, a bank, or a user's financial accounts. Only authentication users are currently persisted.