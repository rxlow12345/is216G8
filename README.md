# 🦋 Critter Connects

# �� IS216 Web Application Development II

---

## Section & Group Number
G3 Group 8 

---

## Group Members

| Photo | Full Name | Role / Features Responsible For |
|:--:|:--|:--|
| <img src="frontend/src/public/assets/Jessica.png" width="80"> | Ang Hui Peng Jessica | Designed the Home page |
| <img src="frontend/src/public/assets/Charlize.png" width="80"> | Charlize Teo Hui Zi | Designed the Guidebook game function and Backend logic of map page |
| <img src="frontend/src/public/assets/Haoyue.png" width="80"> | Wu Haoyue | Database & Auth - Firebase Integration, Integrate backend logic for Report, Login & Signup page |
| <img src="frontend/src/public/assets/Amelia.png" width="80"> | Soh Li Qing Amelia | Designed Report, Resources/Donate page |
| <img src="frontend/src/public/assets/Ryan.png" width="80"> | Chua Wee Chye Ryan | integrated the backend logic for AI Camera and Status Page |
| <img src="frontend/src/public/assets/Ruixuan.png" width="80"> | Low Rui Xuan | Designed Guidebook, Login & Signup page |

> Place all headshot thumbnails in the `/photos` folder (JPEG or PNG).

---

## Business Problem

Describe the **real-world business or community problem** your project addresses.

> *Example:*  
> Current wildlife rescue system have slow response times & inefficient processes
> Our web application aims to enhance coordination with resuce organisations through faster case response, educate and empower the general public, and increase community involvement and support.

---

## Web Solution Overview

### �� Intended Users
Identify your target user groups.  
The general public and rescue organisations. 

### 💡 What Users Can Do & Benefits
Explain the core features and the benefit each provides.  

| Feature | Description | User Benefit |
|:--|:--|:--|
| Register & Login | Secure authentication system | Personalized experience and data security |
| GuideBook | Educational Guide for all users with game function| Increase knowledge of animals and interactivity with the app|
| Reporting function with integrated AI camera | Helps to identify the animal and pre-fill the report page with the animal| More efficient and helps users if they are unable to identify the animal |
|Live Incident Map| Volunteers can access map which will provide them with real time location of the animal | Easier for volunteers to locate the animal |
|Status Page| Page will update and reporters can see live updates of the animal they rescued | Sense of fulfilment for the reporters when they see that the animal has been rescued |
|Donation Page| Page that will accept donation from users | Clear and informative donation page for users to donate to the cause easily

---
## Tech Stack (NOT YET UPDATED)

| Logo | Technology | Purpose / Usage |
|:--:|:--|:--|
| <img src="https://raw.githubusercontent.com/github/explore/main/topics/html/html.png" width="40"> | **HTML5** | Structure and content |
| <img src="https://raw.githubusercontent.com/github/explore/main/topics/css/css.png" width="40"> | **CSS3 / Bootstrap** | Styling and responsiveness |
| <img src="https://raw.githubusercontent.com/github/explore/main/topics/javascript/javascript.png" width="40"> | **JavaScript (ES6)** | Client-side logic and interactivity |
| <img src="https://vitejs.dev/logo.svg" width="40"> | **Vite** | Development server and build tool |
| <img src="https://vuejs.org/images/logo.png" width="40"> | **Vue.js 3** | Component-based frontend framework |
| <img src="https://firebase.google.com/downloads/brand-guidelines/PNG/logo-logomark.png" width="40"> | **Firebase** | Authentication and database services |

> Add or remove technologies depending on your project stack (e.g., Express.js, Supabase, MongoDB Atlas, AWS S3).

---

## Use Case & User Journey (Images NOT YET UPDATED)

Provide screenshots and captions showing how users interact with your app.

1. **Landing Page**  
   <img src="screenshots/landing.png" width="600">  
   - Displays the homepage with navigation options.

2. **Report Feature**  
   <img src="screenshots/search.png" width="600">  
   - Users report the wounded animal that they found

3. **Guidebook**  
   <img src="screenshots/dashboard.png" width="600">  
   - While waiting for rescuers, the user takes a look at the guidebook.
  
4. **Game**
   <img>
  - User decides to play the game to test their knowledge

5. **Status Update**
  - Taking quite some time, decides to look at the status page to see when help will arrive.

6. **Donation Page**
   - After the animal is rescued, the user decides to donate out of goodwill and respect for the cause.

> Save screenshots inside `/screenshots` with clear filenames.

---

## Developers Setup Guide

### 0) Prerequisites
- [Git](https://git-scm.com/) v2.4+  
- [Node.js](https://nodejs.org/) v18+ and npm v9+  
- Access to backend or cloud services used (Firebase, MongoDB Atlas, AWS S3, etc.)

---

### 1) Download the Project
```bash
git clone https://github.com/<org-or-user>/<repo-name>.git
cd <repo-name>
npm install
```

---

### 2) Create `.env` files

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

### 3) Install dependencies

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
------------------------------------Have yet to change these---------------------------------------------------
### 3) Backend / Cloud Service Setup

#### Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project.
3. Enable the following:
   - **Authentication** → Email/Password sign-in
   - **Firestore Database** or **Realtime Database**
   - **Hosting (optional)** if you plan to deploy your web app
4. Copy the Firebase configuration into your `.env` file.

#### Optional: Express.js / MongoDB
If your app includes a backend:
1. Create a `/server` folder for backend code.
2. Inside `/server`, create a `.env` file with:
   ```bash
   MONGO_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_jwt_secret_key>
   ```
3. Start the backend:
   ```bash
   cd server
   npm install
   npm start
   ```

---

### 4) Run the Frontend
To start the development server:
```bash
npm run dev
```
The project will run on [http://localhost:5173](http://localhost:5173) by default.

To build and preview the production version:
```bash
npm run build
npm run preview
```

---

### 5) Testing the Application

#### Manual Testing
Perform the following checks before submission:

| Area | Test Description | Expected Outcome |
|:--|:--|:--|
| Authentication | Register, Login, Logout | User successfully signs in/out |
| CRUD Operations | Add, Edit, Delete data | Database updates correctly |
| Responsiveness | Test on mobile & desktop | Layout adjusts without distortion |
| Navigation | All menu links functional | Pages route correctly |
| Error Handling | Invalid inputs or missing data | User-friendly error messages displayed |

#### Automated Testing (Optional)
If applicable:
```bash
npm run test
```

---

### 6) Common Issues & Fixes

| Issue | Cause | Fix |
|:--|:--|:--|
| `Module not found` | Missing dependencies | Run `npm install` again |
| `Firebase: permission-denied` | Firestore security rules not set | Check rules under Firestore → Rules |
| `CORS policy error` | Backend not allowing requests | Enable your domain in CORS settings |
| `.env` variables undefined | Missing `VITE_` prefix | Rename variables to start with `VITE_` |
| `npm run dev` fails | Node version mismatch | Check Node version (`node -v` ≥ 18) |

---

------------------------------------Please don't touch these---------------------------------------------------
###  Project Structure Overview

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
--------------------------------------------------------------------------------------------------------
## Group Reflection

Each member should contribute 2–3 sentences on their learning and project experience.

> **Reflections:**  
> - Ryan:  
> - Haoyue:
> - Charlize:
> - Amelia:
> - Jessica:
> - Rui Xuan:

As a team, reflect on:
- Key takeaways from working with real-world frameworks  
- Challenges faced and how they were resolved  
- Insights on teamwork, project management, and problem-solving  
  
