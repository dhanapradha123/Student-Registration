# Northstar Placement Desk

A React frontend and Express/Mongoose API for student placement registration and a company-wise coordinator directory.

## Run locally

Install dependencies for the client and server:

```sh
npm --prefix client install
npm --prefix server install
```

Start MongoDB locally, or replace `MONGODB_URI` in `server/.env` with your MongoDB Atlas connection string. Then run these commands in separate terminals:

```sh
npm --prefix server run dev
npm --prefix client run dev
```

The API listens on port 4000. The Vite client runs on port 5173 and sends registrations to the API. Build the frontend with `npm --prefix client run build`. Student records are stored in MongoDB, with server-side checks for unique student IDs, zero standing arrears, and exactly four valid company preferences.

The local `server/.env` is ignored by Git. Do not use real student records until authentication and access control have been added to the admin view.
