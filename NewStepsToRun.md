# Steps to Run — Smart Waste Management System

## 0. Check if Node.js is installed

1. Open a terminal:
   - **VS Code**: menu → `Terminal` → `New Terminal`
   - **Windows**: press `Win`, type `cmd` or `PowerShell`, press Enter
2. Run:
   ```
   node -v
   npm -v
   ```
3. **If you see version numbers** (e.g. `v20.11.0` and `10.2.4`) — Node.js is already installed. Skip to **Step 1**.
4. **If you see an error** like `'node' is not recognized as an internal or external command` — Node.js is not installed. Follow the install steps below first.

### Installing Node.js (Windows)

1. Go to https://nodejs.org
2. Download the **LTS** version installer (the button labeled "LTS" — avoid "Current").
3. Run the downloaded `.msi` file. Accept the defaults and click through the installer (Next → Next → Install → Finish). This also installs `npm` automatically.
4. **Close every open terminal window** (important — a terminal opened before installing won't see the new `node`/`npm` commands) and open a fresh one.
5. Verify the install:
   ```
   node -v
   npm -v
   ```
   Both should now print version numbers. If they still don't, restart your computer and try again.

---

## 1. Open the project

1. Open VS Code.
2. `File` → `Open Folder...` → select the `waste-mgmt` project folder.
3. Open a terminal in VS Code: `Terminal` → `New Terminal`.

---

## 2. Backend setup (`server`)

In your VS Code terminal:

```
cd server
npm install
```

Start the backend:

```
npm run dev
```

This starts the API on **http://localhost:5000** and auto-restarts on file changes. Leave this terminal running.

---

## 3. Frontend setup (`client`)

Open a **second** terminal (`Terminal` → `New Terminal` again, or click the `+` icon) so the backend keeps running in the first one:

```
cd client
npm install
```

Start the frontend:

```
npm run dev
```

This starts the app on **http://localhost:5173**. Leave this terminal running too.

---

## 4. Using the app

1. Open your browser to **http://localhost:5173**.

2. Explore the citizen, admin, and worker views based on the account role.

Role                        Email                       Password

Admin                admin@wastemgmt.local              Admin@123

Citizen                 ravi@example.com                Citizen@123

Citizen                 priya@example.com               Citizen@123

Worker           suresh.worker@wastemgmt.local          Worker@123

Worker           manoj.worker@wastemgmt.local           Worker@123

---