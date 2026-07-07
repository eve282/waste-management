# Smart Waste Complaint and Collection Management System

MERN stack capstone project — full backend + frontend + seed data.

## Structure

```
waste-mgmt/
├── server/     # Node + Express + MongoDB API
└── client/     # React (Vite) frontend
```

## Prerequisites

- Node.js 18+
- A MongoDB Atlas free-tier cluster (or local MongoDB)
- A Cloudinary account (free tier)
- A Google Cloud Console project with Gmail API enabled + OAuth2 refresh token

## Backend setup

```bash
cd server
npm install
cp .env.example .env
# fill in .env with your Mongo URI, Cloudinary keys, Gmail OAuth credentials
npm run seed     # populates sample admin, citizens, workers, complaints
npm run dev      # starts on http://localhost:5000
```

Sample seeded logins (printed again at the end of `npm run seed`):

| Role    | Email                          | Password     |
|---------|---------------------------------|--------------|
| Admin   | admin@wastemgmt.local           | Admin@123    |
| Citizen | ravi@example.com                | Citizen@123  |
| Citizen | priya@example.com               | Citizen@123  |
| Worker  | suresh.worker@wastemgmt.local   | Worker@123   |
| Worker  | manoj.worker@wastemgmt.local    | Worker@123   |

## Frontend setup

```bash
cd client
npm install
cp .env.example .env
# VITE_API_URL should point at your backend, e.g. http://localhost:5000/api
npm run dev      # starts on http://localhost:5173
```

## Getting a Gmail API refresh token (one-time)

1. In Google Cloud Console, create a project → enable the Gmail API.
2. Create OAuth 2.0 credentials (Web application type), add
   `https://developers.google.com/oauthplayground` as an authorized redirect URI.
3. Go to the OAuth 2.0 Playground → gear icon → check "Use your own OAuth credentials" → paste your client ID/secret.
4. In step 1, select the Gmail API v1 scope `https://mail.google.com/` → Authorize → exchange for tokens.
5. Copy the refresh token into `GMAIL_REFRESH_TOKEN` in `server/.env`.

## What's implemented

- JWT auth with citizen/admin/worker roles
- Complaint submission with Cloudinary image upload + Leaflet location picker
- Admin dashboard: complaint table, status updates, worker assignment, analytics charts, map view of all complaints
- Worker task list with resolve + proof-photo upload
- Email notifications (Gmail API) on submission and every status change
- node-cron job that escalates unresolved complaints past the SLA window (default 48h) and emails admins a digest

## What you'll likely want to add before final submission

- Password reset flow
- Pagination on the admin complaint table (fine for a demo dataset, but add it if you seed hundreds of records)
- Deployment to AWS per the architecture doc (EC2 for this `server/`, S3+CloudFront for this `client/`'s build output)
- Basic Jest tests for the auth and complaint controllers, since your report likely wants a testing section
