# 🦋 Critter Connects

## 🚀 Getting Started

Follow these steps to set up the project locally after cloning.

---

### 1. Create `.env` files

- In your root folder, copy the example file `.env.example` and rename it to `.env`, then update the API keys or credentials as needed.

#### Backend `.env`
```bash
PORT=4100
SERVICE_ACCOUNT_PATH=C:\path\to\service-account.json
```

#### Frontend `.env`
```bash
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

> ⚠️ Never commit `.env` or `service-account.json` to GitHub.

---

### 2. Install dependencies

Open your terminal in the project folder and run the following commands to install packages for both backend and frontend:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 3. Project Structure Overview

This structure helps keep the code modular and maintainable.

#### 📦 Backend folders (`backend/src`)
| Folder | Description |
|---------|--------------|
| **controllers/** | Contains logic for handling requests (e.g. CRUD operations). |
| **routes/** | Maps URL endpoints to controller functions. |
| **firebase.js** | Initializes Firebase Admin SDK. |

#### 💻 Frontend folders (`frontend/src`)
| Folder | Description |
|---------|--------------|
| **api/** | Functions that make HTTP requests to your backend APIs. |
| **components/** | Vue components that render the user interface. |
| **App.vue / main.js** | Entry point and root component setup. |

---

### 4. Start Servers 

#### 🧱 Backend (runs on http://localhost:4100)

```bash
#open new Terminal
cd backend
npm run dev
```

#### 💻 Frontend (runs on http://localhost:5175)

```bash
#open new Terminal
cd frontend
npm run dev
```

---

### 5. Build for Production (optional)

To build and serve both frontend and backend together on one port:

```bash
# From backend folder
npm run serve:prod
```

This will:
- Build the Vue frontend (`npm run build`)
- Serve it from the Express backend  
- Expose both API and UI on `http://localhost:4100`

---

## 🧰 Useful Scripts

| Command | Description |
|----------|-------------|
| `npm run dev` | Start local dev server (backend or frontend) |
| `npm run build` | Build the frontend for production |
| `npm run serve:prod` | Build and serve both frontend + backend on one port |
| `npm run preview` | Preview frontend build locally |

---

## 🔥 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Project Settings → Service Accounts**
3. Click **Generate new private key** → rename it to `service-account.json`
4. Place it in `/backend/`

---

## 📎 Notes
- Backend port: `4100`
- Frontend port: `5175`
- Change ports easily in `.env` (backend) and `vite.config.js` (frontend)
- Compatible with deployment platforms like **Render**, **Railway**, or **Firebase Hosting**
