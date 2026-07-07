# Smart Waste Complaint and Collection Management System — Complete Architecture

**Stack:** MERN + Cloudinary + Leaflet.js + Google Cloud Console (Gmail API) + AWS Free Tier

---

## 1. System Overview

Three user roles share one backend, one database, one API:

- **Citizen** — submits complaints, tracks status
- **Admin** — views all complaints, assigns workers, monitors analytics
- **Worker** — views assigned tasks, marks resolution with proof photo

---

## 2. Folder Structure

### Backend (`/server`)

```
server/
├── config/
│   ├── db.js                 # MongoDB connection
│   ├── cloudinary.js         # Cloudinary config
│   └── gmail.js              # Gmail API OAuth2 client setup
├── models/
│   ├── User.js
│   ├── Complaint.js
│   ├── Worker.js
│   └── StatusLog.js
├── controllers/
│   ├── authController.js
│   ├── complaintController.js
│   ├── adminController.js
│   └── workerController.js
├── routes/
│   ├── authRoutes.js
│   ├── complaintRoutes.js
│   ├── adminRoutes.js
│   └── workerRoutes.js
├── middleware/
│   ├── authMiddleware.js      # JWT verify + role check
│   ├── uploadMiddleware.js     # Multer + Cloudinary
│   └── errorMiddleware.js
├── services/
│   ├── emailService.js         # Gmail API send wrapper
│   └── notificationService.js  # Orchestrates email triggers
├── jobs/
│   └── slaEscalation.js        # node-cron job
├── utils/
│   └── generateToken.js
├── app.js
└── server.js
```

### Frontend (`/client`)

```
client/
├── src/
│   ├── components/
│   │   ├── citizen/
│   │   │   ├── ComplaintForm.jsx
│   │   │   ├── ComplaintCard.jsx
│   │   │   └── StatusTracker.jsx
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ComplaintTable.jsx
│   │   │   ├── AssignWorkerModal.jsx
│   │   │   └── AnalyticsCharts.jsx
│   │   ├── worker/
│   │   │   └── TaskList.jsx
│   │   ├── shared/
│   │   │   ├── MapPicker.jsx     # Leaflet location picker
│   │   │   ├── MapView.jsx       # Leaflet complaint markers
│   │   │   └── Navbar.jsx
│   ├── pages/
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── services/
│   │   └── api.js               # Axios instance
│   ├── App.jsx
│   └── main.jsx
```

---

## 3. Database Schema (MongoDB + Mongoose)

```js
// User
{
  name, email, phone, password (hashed),
  role: "citizen" | "admin" | "worker",
  address, createdAt
}

// Complaint
{
  userId: ObjectId ref User,
  category: "garbage_overflow" | "missed_pickup" | "illegal_dumping" | "other",
  description: String,
  imageUrl: String,           // Cloudinary URL
  location: { lat: Number, lng: Number },
  status: "pending" | "assigned" | "in_progress" | "resolved",
  priority: "low" | "medium" | "high",
  assignedWorkerId: ObjectId ref Worker,
  resolvedImageUrl: String,
  resolvedAt: Date,
  createdAt: Date
}

// Worker
{
  name, phone, zoneAssigned, userId: ObjectId ref User
}

// StatusLog
{
  complaintId: ObjectId ref Complaint,
  oldStatus, newStatus,
  changedBy: ObjectId ref User,
  timestamp: Date
}
```

---

## 4. API Endpoints

**Auth**
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

**Complaints (citizen)**
```
POST   /api/complaints              # create with image + location
GET    /api/complaints/my           # own complaint history
GET    /api/complaints/:id
```

**Admin**
```
GET    /api/admin/complaints         # all, filterable by status/category/area
PATCH  /api/admin/complaints/:id/assign
PATCH  /api/admin/complaints/:id/status
GET    /api/admin/analytics          # counts by status/category/time
GET    /api/admin/workers
```

**Worker**
```
GET    /api/worker/tasks             # assigned complaints
PATCH  /api/worker/tasks/:id/resolve # upload proof photo + mark resolved
```

All routes except register/login pass through `authMiddleware` (JWT verify) with role-based guards.

---

## 5. Third-Party Integration Details

### Cloudinary
- Frontend sends image via `multipart/form-data` → Multer (memory storage) → backend streams to Cloudinary → stores returned `secure_url` in the `Complaint` document.
- Use an **unsigned upload preset** only if uploading directly from client to reduce server load; otherwise route through backend for validation control (recommended for a complaint system, so you can reject non-image files server-side).

### Leaflet.js
- `MapPicker.jsx`: citizen clicks on the map to drop a pin when submitting a complaint → captures `lat/lng` → sent with complaint payload.
- `MapView.jsx`: admin dashboard renders all pending complaints as markers, colored by status/priority, using OpenStreetMap tiles (free, no API key needed).

### Gmail API (Google Cloud Console)
1. Create a project in Google Cloud Console → enable **Gmail API**.
2. Create OAuth 2.0 credentials (or a service account with domain-wide delegation if using Google Workspace).
3. Generate a refresh token once via OAuth playground or a short local script.
4. Backend uses `googleapis` npm package with the stored refresh token to send mail via `gmail.users.messages.send`.
5. Trigger points: complaint submitted (confirmation), status changed (update), complaint resolved (closure notice).

### node-cron (SLA automation)
- Runs daily: finds complaints where `status != resolved` and `createdAt` older than 48 hrs → escalates `priority` to `high` and emails admin a digest.

---

## 6. AWS Free Tier Deployment Steps

1. **MongoDB Atlas**: create free M0 cluster, whitelist EC2's IP, get connection string.
2. **Cloudinary**: create free account, get cloud name/API key/secret.
3. **Google Cloud Console**: set up Gmail API OAuth credentials as above.
4. **EC2 (backend)**:
   - Launch t2.micro, Ubuntu 22.04, free tier eligible.
   - SSH in, install Node.js, PM2, Nginx.
   - Clone repo, set `.env` (Mongo URI, Cloudinary keys, Gmail OAuth tokens, JWT secret).
   - `pm2 start server.js --name waste-api`
   - Configure Nginx as reverse proxy (port 80/443 → localhost:5000).
   - Optional: free SSL via Certbot/Let's Encrypt if you attach a domain.
5. **S3 + CloudFront (frontend)**:
   - `npm run build` in `/client`.
   - Create S3 bucket, enable static website hosting, upload `build/` contents.
   - Create CloudFront distribution pointing to the bucket for HTTPS + CDN caching.
6. **Security group**: open port 22 (SSH, restrict to your IP), 80/443 (HTTP/HTTPS) on the EC2 instance.
7. **Environment separation**: keep `.env` out of git; use AWS Systems Manager Parameter Store or just a server-side `.env` file for a project of this scope.

---

## 7. Security Checklist

- Passwords hashed with bcrypt, never stored/logged in plaintext.
- JWT with short expiry + refresh flow, or simple long-lived token acceptable for academic scope — mention the trade-off in your report.
- Role-based middleware on every protected route (citizen can't hit `/api/admin/*`).
- Multer file-type + size validation before Cloudinary upload (reject non-images, cap at ~5MB).
- Rate-limit `/api/auth/login` to blunt brute-force attempts (express-rate-limit).
- Sanitize all user input (express-validator) before DB writes.

---

## 8. Suggested Report Diagrams to Pair With This

- ER diagram (already covered in schema above — render with mermaid `erDiagram` for the report)
- Use case diagram: Citizen / Admin / Worker actors
- Sequence diagram: complaint lifecycle from submission → resolution → notification
- DFD Level 0/1: data flow between client, API, DB, Cloudinary, Gmail
