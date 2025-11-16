# 🦊 CritterConnect

# IS216 Web Application Development II

---

## Section & Group Number

G3 Group 8

---

## Group Members

|                               Photo                               | Full Name            | Role / Features Responsible For                                                                                                                                                                                                                                                                                               |
| :----------------------------------------------------------------: | :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="frontend/src/public/assets/Jessica.png" width="80"> | Ang Hui Peng Jessica | Designed the Home page                                                                                                                                                                                                                                                                                                        |
| <img src="frontend/src/public/assets/Charlize.png" width="80"> | Charlize Teo Hui Zi  | Designed the Guidebook game function and Volunteer map page                                                                                                                                                                                                                                                                   |
|  <img src="frontend/src/public/assets/Haoyue.png" width="80">  | Wu Haoyue            | System Architecture: Project setup, database management, cloud deployment<br> System Logic: Role-based access control, authentication (Signup & Login), integration test & debug<br> Features: Report page backend, Volunteer Active Report Summary (frontend & backend), Volunteer Past Report (frontend & backend) |
|  <img src="frontend/src/public/assets/Amelia.png" width="80">  | Soh Li Qing Amelia   | Designed Report, Resources/Donate page                                                                                                                                                                                                                                                                                        |
|   <img src="frontend/src/public/assets/Ryan.png" width="80">   | Chua Wee Chye Ryan   | integrated the backend logic for AI Camera and Status Page                                                                                                                                                                                                                                                                    |
| <img src="frontend/src/public/assets/Ruixuan.png" width="80"> | Low Rui Xuan         | Designed Guidebook, Login & Signup page                                                                                                                                                                                                                                                                                       |

> Place all headshot thumbnails in the `/photos` folder (JPEG or PNG).

---

## Business Problem
Wildlife rescue operations face critical delays due to inefficient public reporting methods and fragmented coordination between rescue organizations. When members of the public encounter wildlife in distress, the lack of a standardized reporting platform creates operational bottlenecks that slow response time, often making the difference between life and death for injured animals. Additionally, rescue organizations struggle to leverage community support at scale, missing opportunities to mobilize volunteers and resources effectively during emergencies.

## Web Solution Overview

### Intended Users

The general public, volunteers for rescue organisations and rescue organisations themselves.

### 💡 What Users Can Do & Benefits

Explain the core features and the benefit each provides.

| Feature                                      | Description                                                                                            | User Benefit                                                                                            |
| :------------------------------------------- | :----------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| Register & Login                             | Secure authentication system                                                                           | Personalized experience and data security                                                               |
| GuideBook                                    | Educational Guide for all users, along with a game function                                            | Increase knowledge of animals while improving app interactivity                                         |
| Reporting function with integrated AI camera | Helps to identify the animal and pre-fill the report page with the animal                              | Makes the reporting process smooth and easy for users                                                   |
| Live Incident Map                            | Volunteers can access map which will provide them with real time location of the animal                | Allow volunteers to easily locate the animal                                                            |
| Status Page                                  | Page will update and reporters can see live updates of the animal they rescued                         | Allows reporters to gain a sense of fulfilment when they see that the animal has been rescued           |
| Donation Page                                | Page that will accept donation from users                                                              | Clear and informative donation page for users to donate to the cause easily                             |
| Resources                             | View news and updates about our organisation or wildlife rescue, and report feedback                | Users can learn more about wildlife rescue and report feedback |
| Reporter and Volunteer Dashboards                         | Includes links to different reporter and volunteer functions                                              | Allows users to easily access the functions for their role                                                   |
| Reporter Past Reports                         | Reports made by users show up here and can be sorted                                                   | Allows users to check the cases that they reported                                                      |
| Volunteer Active Reports                        | Cases accepted by volunteers show up here and they can update the details of the case as it progresses | Allows volunteers to easily manage cases that they accepted and have a standard workflow for each case  |
| Volunteer Rescue Impact                        | Volunteers can view their past resolved cases and their rescue impact | Motivates volunteers with their rescue impact  |
| Admin Dashboard                              | All reports show up here and it is possible to reset/change the progress of each case                 | Allows admin to check the details of all reports and change/reset the progress of each case if neededof |

---

## Tech Stack

|                                                                                      Logo                                                                                      | Technology                        | Purpose / Usage                                       |
| :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------- | :---------------------------------------------------- |
|                                      <img src="https://raw.githubusercontent.com/github/explore/main/topics/html/html.png" width="40">                                     | **HTML5**                   | Structure and content                                 |
|                                       <img src="https://raw.githubusercontent.com/github/explore/main/topics/css/css.png" width="40">                                       | **CSS3 / Bootstrap**        | Styling and responsiveness                            |
|                                <img src="https://raw.githubusercontent.com/github/explore/main/topics/javascript/javascript.png" width="40">                                | **JavaScript (ES6)**        | Client-side logic and interactivity                   |
|                                                             <img src="https://vitejs.dev/logo.svg" width="40">                                                             | **Vite**                    | Development server and build tool                     |
|                                                          <img src="https://vuejs.org/images/logo.png" width="40">                                                          | **Vue.js 3**                | Component-based frontend framework                    |                   |
|  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRykNi4-zfKLf0bRRdPOEjnqB-rpXHe1TXRxA&s" width="60" alt="Express.js" onerror="this.src='https://via.placeholder.com/40/000000/ffffff?text=EX'">  | **Express.js**              | Backend server framework and API endpoints            |
|             <img src="https://socket.io/images/logo.svg" width="40" alt="Socket.io" onerror="this.src='https://via.placeholder.com/40/010101/ffffff?text=IO'">             | **Socket.io**               | Real-time bidirectional communication (WebSocket)     |
|             <img src="https://axios-http.com/assets/logo.svg" width="50" alt="Axios" onerror="this.src='https://via.placeholder.com/40/5A29E4/ffffff?text=AX'">             | **Axios**                   | HTTP client for API requests                          |
|          <img src="https://leafletjs.com/docs/images/logo.png" width="60" alt="Leaflet" onerror="this.src='https://via.placeholder.com/40/199900/ffffff?text=LF'">          | **Leaflet**                 | Interactive maps and geospatial visualization         |
|                             <img src="https://firebase.google.com/downloads/brand-guidelines/PNG/logo-logomark.png" width="40" alt="Firebase">                            | **Firebase**                | Authentication, Firestore database, and cloud storage |
|    <img src="https://assets.opencagedata.com/assets/opencage-logo.color-e24d56eed9ceb12ad446617cfcd7fd394fba896ed6e82b031535e875fbec772b.png" width="60" alt="OpenCage API" onerror="this.src='https://via.placeholder.com/40/4A90E2/ffffff?text=OC'">    | **OpenCage API**            | Geocoding and reverse geocoding services              |
|                                    <img src="https://www.docker.com/app/uploads/2023/08/logo-guide-logos-1.svg" width="85" alt="Docker">                                    | **Docker**                       | Deploying machine learning model                      |
| <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFCHi18uXFtRb1_q7pQIVxYlwqvhVzCzZ4PQ&s" width="40" alt="Python" onerror="this.src='https://via.placeholder.com/40/3776AB/ffffff?text=PY'"> | **Python / SpeciesNet API** | AI-powered species identification from images         |

## Use Case & User Journey (Images NOT YET UPDATED)

### General Usage for all roles:

1. **Landing/Home Page**
   <br><img src="screenshots/Landing_Page.png" width="600">

   - Displays the homepage with navigation options.

2. **Guidebook**
   <br><img src="screenshots/Guidebook.png" width="600">

   - Users can read the guidebook to learn more about the animals
3. **Game**
   <br><img src="screenshots/Game.png" width="600">

   - Interactive game users can play to test their knowledge or learn more about animals

4. **Report Status**
   <br><img src="screenshots/Status.png" width="600">

   - Users can view the status and rescue timeline of animal

5. **Donation Page**
   <br><img src="screenshots/Donation.png" width="600">
   - Users can donate to our partners

6. **Resources Page**
   <br><img src="screenshots/Resources.png" width="600">

   - Users can view updates on wildlife rescue and provide feedback

### Reporter Role:

1. **Reporter Dashboard**
   <br><img src="screenshots/ReporterDashboard.png" width="600">

   - Reporter can report cases or check past reports from here

2. **Report Feature**
   <br><img src="screenshots/Report.png" width="600">

   - Users can report wild distressed animals that they encounter

3. **Past Reports**
   <br><img src="screenshots/Report.png" width="600">

   - Users can check on previously submitted reports

### Volunteer Role:

1. **Volunteer Dashboard**
   
<br><img src="screenshots/VolunteerDashboard.png" width="600">

- Volunteer can open the map to accept cases, view active cases and check cases resolved from here

2. **Map**
   
<br><img src="screenshots/Map.png" width="600">

- Volunteer can view pending reports and accept them to take on the case

3. **Volunteer Active Reports**
<br><img src="screenshots/VolunteerActive.png" width="600">
<br><img src="screenshots/VolunteerActiveModal.png" width="600">

- Volunteer can view active reports that he has accepted and update on their progress here

4. **Volunteer Rescue Impact**
<br><img src="screenshots/RescueImpact.png" width="600">

- Volunteer can view past resolved cases and rescue impact statistics


### Admin Role:

1. **Admin Dashboard**
<br><img src="screenshots/AdminDashboard.png" width="600">
<br><img src="screenshots/AdminDashboardModal.png" width="600">

- Admin can view all reports and reset the progress of cases as needed

> Save screenshots inside `/screenshots` with clear filenames.

---

## Developers Setup Guide

### Prerequisites

#### Required Software

- [Git](https://git-scm.com/) v2.4+ - Version control
- [Node.js](https://nodejs.org/) v18+ and npm v9+ - JavaScript runtime and package manager
- [Python](https://www.python.org/) 3.12+ (optional, for local SpeciesNet API development)
- [Docker](https://www.docker.com/) (optional, for running SpeciesNet API locally)

#### Cloud Services & APIs

- **Firebase Project** (required)
  - [Firebase Console](https://console.firebase.google.com/) account
  - Firestore Database enabled
  - Authentication enabled (Email/Password provider)
  - Firebase Storage enabled (for image uploads)
  - Service Account JSON file (for backend admin operations)
  - Firebase Hosting (optional, for frontend deployment)

- **OpenCage API Key** (required for geocoding)
  - Get your free API key from [OpenCage Data](https://opencagedata.com/api)
  - Free tier: 2,500 requests/day

- **SpeciesNet API** (optional, for species identification)
  - Default endpoint: `http://34.126.93.66:8000` (hosted instance)
  - Or run locally using Docker (see SpeciesNet API Setup below)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/rxlow12345/is216G8.git
cd is216G8
```

---

### Step 2: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable the following services:
   - **Authentication** → Email/Password sign-in method
   - **Firestore Database** → Create database in production mode (you'll configure rules later)
   - **Storage** → Enable Firebase Storage
4. Get your Firebase configuration:
   - Go to **Project Settings** → **General** → **Your apps**
   - Click on the web app icon (`</>`) or create a new web app
   - Copy the Firebase configuration object
5. Generate Service Account Key:
   - Go to **Project Settings** → **Service Accounts**
   - Click **Generate new private key**
   - Save the JSON file as `service-account.json` in the `/backend/` folder
   - ⚠️ **Never commit this file to version control**

---

### Step 3: Environment Configuration

#### Backend Environment Variables

Create a `.env` file in the `/backend/` directory:

```bash
# Backend Port
PORT=4100

# Firebase Service Account (optional if using service-account.json file)
# You can either use the JSON file OR environment variables
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your_client_x509_cert_url

# Service Account File Path (alternative to env vars above)
SERVICE_ACCOUNT_PATH=./service-account.json

# Frontend URL for CORS (comma-separated for multiple origins)
FRONTEND_URL=http://localhost:5175

# SpeciesNet API URL (optional, defaults to hosted instance)
SPECIESNET_API_URL=http://34.126.93.66:8000
```

#### Frontend Environment Variables

Create a `.env` file in the `/frontend/` directory:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here

# OpenCage API Key (for geocoding)
VITE_OPENCAGE_API_KEY=your_opencage_api_key_here

# Backend API URLs
VITE_API_URL=http://localhost:4100/api
VITE_SOCKET_URL=http://localhost:4100

# Development Port (optional, defaults to 5175)
VITE_PORT=5175
```

> ⚠️ **Security Note**: Never commit `.env` files or `service-account.json` to version control. Add them to `.gitignore`.

---

### Step 4: Install Dependencies

#### Root Dependencies (if needed)

```bash
# From project root
npm install
```

#### Backend Dependencies

```bash
cd backend
npm install
```

#### Frontend Dependencies

```bash
cd ../frontend
npm install
```

> **Note**: The root `package.json` includes some shared dependencies. The main dependencies are installed in their respective `backend/` and `frontend/` directories.

---

### Step 5: SpeciesNet API Setup (Optional)

The SpeciesNet API is used for AI-powered species identification from images. You can either:

#### Option A: Use Hosted Instance (Recommended for Development)

The API is already hosted at `http://34.126.93.66:8000`. No additional setup needed if you're using the default endpoint.

#### Option B: Run Locally with Docker

1. Navigate to the SpeciesNet API directory:
   ```bash
   cd speciesnet-api
   ```

2. Build the Docker image:
   ```bash
   docker build -t speciesnet-api .
   ```

3. Run the container:
   ```bash
   docker run -d -p 8000:8000 --name speciesnet speciesnet-api
   ```

4. Update your backend `.env` to use local instance:
   ```bash
   SPECIESNET_API_URL=http://localhost:8000
   ```

5. Test the API:
   ```bash
   curl http://localhost:8000/docs
   ```

For more details, see `speciesnet-api/README.md`.

---

### Step 6: Start the Development Servers

You need to run both the backend and frontend servers simultaneously. Open **two separate terminal windows/tabs**.

#### Terminal 1: Backend Server

```bash
cd backend
npm run dev
```

The backend will run on [http://localhost:4100](http://localhost:4100)

#### Terminal 2: Frontend Server

```bash
cd frontend
npm run dev
```

The frontend will run on [http://localhost:5175](http://localhost:5175) (or the port specified in your `VITE_PORT` env variable)

> **Note**: The frontend Vite dev server is configured to proxy API requests to the backend automatically.

---

### Step 7: Verify Installation

1. **Check Backend**: Visit [http://localhost:4100/api](http://localhost:4100/api) - you should see API routes or a welcome message
2. **Check Frontend**: Visit [http://localhost:5175](http://localhost:5175) - you should see the application homepage
3. **Check Firebase Connection**: Try creating an account on the signup page
4. **Check Socket.io**: Real-time features should work automatically when both servers are running

---

### Step 8: Create Test Users

#### Default User Creation

1. Navigate to the signup page: `http://localhost:5175/signup`
2. Create a user account - accounts default to the **'reporter'** role

#### Create Admin/Volunteer Accounts

To create accounts with 'volunteer' or 'admin' roles:

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Open `create-test-accounts.js` and edit the function calls at the bottom:
   ```javascript
   // Example:
   createAdminAccount('admin@example.com', 'password123', 'Admin User');
   createVolunteerAccount('volunteer@example.com', 'password123', 'Volunteer User');
   ```

3. Run the script:
   ```bash
   node create-test-accounts.js
   ```

> ⚠️ **Note**: This script is for development only. Remove or secure it in production.

---

## 🧰 Available Scripts

### Backend Scripts (`backend/`)

| Command                | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Start development server with hot reload (nodemon) |
| `npm start`            | Start production server                             |
| `npm run serve:prod`   | Build frontend and serve both on one port (4100)    |
| `npm run upload-assets`| Upload assets to Firebase Storage                   |
| `npm run update-guidebook` | Update guidebook assets in Firebase            |
| `npm run verify-storage` | Verify Firebase Storage permissions            |

### Frontend Scripts (`frontend/`)

| Command                | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Start Vite development server                      |
| `npm run build`        | Build for production                                |
| `npm run preview`      | Preview production build locally                    |

---

## 🏗️ Project Structure

This structure helps keep the code modular and maintainable.

### Backend Structure (`backend/`)

```
backend/
├── index.js                 # Express server entry point
├── service-account.json     # Firebase service account (gitignored)
├── package.json
├── scripts/                 # Utility scripts
│   ├── upload-assets.js
│   └── update-guidebook-assets.js
└── src/
    ├── firebase.js          # Firebase Admin SDK initialization
    ├── controllers/         # Request handlers (business logic)
    │   ├── mapController.js
    │   ├── reportController.js
    │   └── taskController.js
    ├── routes/              # API route definitions
    │   ├── maps.js
    │   ├── reports.js
    │   └── tasks.js
    └── middleware/          # Express middleware
        └── auth.js          # Authentication middleware
```

### Frontend Structure (`frontend/`)

```
frontend/
├── src/
│   ├── main.js             # Vue app entry point
│   ├── App.vue             # Root component
│   ├── firebase.js         # Firebase client SDK initialization
│   ├── api/                # API client functions
│   │   ├── auth.js
│   │   ├── http.js
│   │   ├── mapapi.js
│   │   ├── reportApi.js
│   │   ├── socket.js
│   │   └── tasks.js
│   ├── components/         # Reusable Vue components
│   ├── config/             # Configuration files
│   │   └── asset-urls.json
│   ├── utils/              # Utility functions
│   │   └── getAssetUrl.js
│   └── public/             # Static assets
│       ├── assets/         # Images, icons, etc.
│       └── guidebook.json
├── pages/                  # Page components
│   ├── auth/               # Login, Signup
│   ├── map/                # Map view
│   ├── new_report/         # Report creation
│   ├── reporter/           # Reporter dashboards
│   ├── volunteer/          # Volunteer dashboards
│   └── orgAdmin/           # Admin dashboards
├── router/                 # Vue Router configuration
│   └── index.js
├── vite.config.js          # Vite configuration
└── package.json
```

---

## 🧪 Testing the Application

### Manual Testing Checklist

Test with these viewport dimensions:
- **Mobile M**: 375px width
- **Tablet**: 768px width
- **Laptop**: 1024px width
- **Laptop L**: 1440px width

| Area            | Test Description               | Expected Outcome                       |
| :-------------- | :----------------------------- | :------------------------------------- |
| Authentication  | Register, Login, Logout        | User successfully signs in/out         |
| CRUD Operations | Add, Edit, Delete data         | Database updates correctly             |
| Responsiveness  | Test on mobile & desktop       | Layout adjusts without distortion      |
| Navigation      | All menu links functional      | Pages route correctly                  |
| Error Handling  | Invalid inputs or missing data | User-friendly error messages displayed |
| Real-time Updates | Socket.io connections        | Live updates work across clients       |
| File Upload     | Image uploads to Firebase      | Images upload and display correctly    |

---

## 🐛 Common Issues & Troubleshooting

| Issue                           | Cause                            | Fix                                      |
| :------------------------------ | :------------------------------- | :--------------------------------------- |
| `Module not found`              | Missing dependencies             | Run `npm install` in the respective directory |
| `Firebase: permission-denied`   | Firestore security rules not set | Check rules under Firestore → Rules in Firebase Console |
| `CORS policy error`             | Backend not allowing requests    | Check `FRONTEND_URL` in backend `.env` and CORS settings |
| `.env` variables undefined     | Missing `VITE_` prefix          | Frontend env vars must start with `VITE_` |
| `npm run dev` fails             | Node version mismatch            | Check Node version (`node -v` ≥ 18)      |
| `Port already in use`           | Another process using the port   | Change port in `.env` or kill the process |
| `Firebase service account error`| Missing or invalid JSON file     | Verify `service-account.json` exists in `/backend/` |
| `Socket.io connection failed`   | Backend not running              | Ensure backend server is running on port 4100 |
| `SpeciesNet API timeout`        | API endpoint unreachable          | Check `SPECIESNET_API_URL` or use hosted instance |

### Debugging Tips

1. **Check Console Logs**: Both browser console and terminal output provide valuable error messages
2. **Verify Environment Variables**: Use `console.log(import.meta.env)` in frontend or `console.log(process.env)` in backend to verify env vars
3. **Firebase Console**: Check Firebase Console for authentication and database errors
4. **Network Tab**: Use browser DevTools Network tab to inspect API requests
5. **Backend Logs**: Check terminal running `npm run dev` in backend for server-side errors

---

## 🚀 Deployment Guide

This project uses **Firebase Hosting** for the frontend and **Railway** for the backend. After completing local setup, follow these additional steps to deploy.

---

### Prerequisites

- Firebase CLI: `npm install -g firebase-tools && firebase login`
- Railway account: [railway.app](https://railway.app/)
- Code pushed to GitHub

---

### Deploy Backend to Railway

1. **Create Railway Project**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - **New Project** → **Deploy from GitHub repo**
   - Select your repository
   - Set **Root Directory** to `backend`

2. **Configure Environment Variables**
   
   In Railway → **Variables** tab, add all variables from your `backend/.env`:
   - All Firebase service account variables (or use service account file)
   - `FRONTEND_URL` (update after frontend deployment)
   - `SPECIESNET_API_URL=http://34.126.93.66:8000`
   - `NODE_ENV=production`

3. **Get Backend URL**
   - Railway → **Settings** → **Networking** → **Generate Domain**
   - Copy the URL (e.g., `your-backend.up.railway.app`)

---

### Deploy Frontend to Firebase Hosting

1. **Initialize Firebase Hosting (First Time Only)**
   
   If you haven't set up Firebase Hosting:
   ```bash
   # From project root
   firebase init hosting
   ```
   
   When prompted:
   - Select **"Use an existing project"** (your Firebase project)
   - **Public directory**: `frontend/dist`
   - **Configure as single-page app**: **Yes**
   - **Set up automatic builds**: **No**
   - **Overwrite index.html**: **No**
   
   > Note: `firebase.json` should already be configured correctly.

2. **Create Production Environment File**
   
   Create `frontend/.env.production` with your Railway backend URL:
   ```bash
   # Copy all VITE_ variables from .env, but update these:
   VITE_API_URL=https://your-backend.up.railway.app/api
   VITE_SOCKET_URL=https://your-backend.up.railway.app
   ```

3. **Build and Deploy**
   ```bash
   cd frontend
   npm run build
   cd ..
   firebase deploy --only hosting
   ```
   
   Your frontend will be live at:
   - `https://your-project-id.web.app`
   - `https://your-project-id.firebaseapp.com`

4. **Update Railway CORS**
   
   After frontend deployment, update `FRONTEND_URL` in Railway:
   ```bash
   FRONTEND_URL=https://your-project-id.web.app,https://your-project-id.firebaseapp.com
   ```

---

### Key Differences from Local Setup

| Local Development | Production Deployment |
| :---------------- | :------------------- |
| `VITE_API_URL=http://localhost:4100/api` | `VITE_API_URL=https://your-backend.up.railway.app/api` |
| `VITE_SOCKET_URL=http://localhost:4100` | `VITE_SOCKET_URL=https://your-backend.up.railway.app` |
| `FRONTEND_URL=http://localhost:5175` | `FRONTEND_URL=https://your-project-id.web.app` |
| Backend runs locally | Backend runs on Railway |
| Frontend served by Vite dev server | Frontend served by Firebase Hosting |

---

### Troubleshooting

| Issue | Solution |
| :---- | :------- |
| CORS errors | Update `FRONTEND_URL` in Railway with Firebase Hosting URLs |
| Socket.io fails | Ensure `VITE_SOCKET_URL` uses `https://` (not `http://`) |
| API requests fail | Verify Railway service is running and URL is correct |
| Build fails | Check Railway logs and ensure all env vars are set |

---

## 📎 Configuration Notes

- **Backend Port**: `4100` (configurable via `PORT` in backend `.env`)
- **Frontend Port**: `5175` (configurable via `VITE_PORT` in frontend `.env` or `vite.config.js`)
- **Socket.io**: Automatically connects to backend on startup
- **API Proxy**: Frontend Vite dev server proxies `/api` requests to backend automatically
- **Firebase**: Uses both client SDK (frontend) and Admin SDK (backend)

---

## 📚 Additional Resources

- [Vue.js Documentation](https://vuejs.org/)
- [Express.js Documentation](https://expressjs.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Vite Documentation](https://vitejs.dev/)

---

## Group Reflection

Each member should contribute 2–3 sentences on their learning and project experience.

> **Reflections:**
> Each member should contribute 2–3 sentences on their learning and project experience.

> **Reflections:**
>
> - Ryan: Working with real-world frameworks helped me understand how actual web apps are built and how everything connects behind the scenes. I struggled at first with getting different parts of the app to work together, but I managed by breaking problems down, testing often, and asking my teammates for help. Through this project, I learned how important teamwork, planning, and communication are in keeping things running smoothly and solving problems faster.

> - Haoyue: I feel the biggest problem we had in the project was not planning ahead.  We started development without proper design artifacts, like UML models, use case diagrams, or detailed user stories.  We don't need to have comprehensive documentation, but I've learned that these tools are necessary for getting everyone on the same page with a common goal.  We often had problems with confusion, different expectations, and expensive rework without them. I also learned that well-written user stories with clear acceptance criteria are not just rules and regulations; they are necessary to keep everyone on the same page and stop uncontrolled scope creep. It was hard to deal with last-minute changes, but it taught me that setting limits isn't about being rigid; it's about keeping the project's integrity and the quality of the code. Additionaly, I learned that every team member should know how data flow through the whole system, even though we split up the work between the front end and the back end.  These aren't just theoretical best practices; they're real habits that help teams make software that works well and lasts.

> - Charlize: I feel like this project has been challenging and complicated, but it was really insightful in helping me realise how a proper project works. I learnt how to efficiently split up and delegate tasks based on our strengths, how to work together as a group to integrate our code and our ideas together, how to debug and fix errors that we came across and more. I think the biggest challenge was getting all our ideas aligned, and ensuring everyone was on the same page, since we all had different impressions of the same feature, which led to a lot of miscommunication and extra work.

> - Amelia: I've not only learned how to design a website, but also how to debug code  and understand why the code or certain features may not work as expected across different screens and devices. This project has taught me to be patient, pay attention to detail that I thought was not that significant, and recognise the importance of testing every small component before merging into the main system. Initially, there were a lot of challenges faced because some parts were not integrated well, but working as a team has made the process much easier because we do not struggle with this alone. Instead, we were able to ask questions and collaborated with each other out to solve problems together.

> - Jessica: With a tight schedule, it was challenging juggling all the work at hand. This experience has taught me how to prioritise tasks and manage my time effectively. Furthermore, as there are multiple people working on the same project, we had multiple ideas for the UI. Through this, I leanred how to integrate our UI designs to make them more cohesive and flow better.

> - Rui Xuan: I thought it was difficult since I was learning an entirely new language and have to use that knowledge to build the app, however, I thought it was a good learning experience and this helped me build my fundamentals for the module. Ensuring everyone could code without merge conflicts was definitely a pain, but it was worthwhile seeing everyone come together and helping each other solve their bugs. We did have miscommunications here and there, but we sat down with each other and fought it out, eventually coming to a conclusion.


## Use of AI/LLMS 
| Tasks                                                  |Yes/No   |Description
| :------------------------------------------------------| :-------| :--------------------------------------------------------------------------|
|Information Search|Yes|Used to gather information on problems faced by our target group and gain inspiration from other websites|
|Generating Website concepts, layouts, or themes|Yes|Search for possible themes and colour palettes that use for our website|
|Exploring UI/UX design inspiration|Yes|Gain inspiration on how we can make our UI/UX better and more intuitive for our users|
|Explaining coding errors / debugging hints|Yes|Since our codes were long, some bugs were overly tedious and difficult to identify manually.|
|Boilerplate code generation (starter code, small code snippets)|Yes|When we needed to code what was taught outside of class and it was too difficult, AI was used to help generate boilerplate codes to help us achieve what we wanted / give us a starting point|
|Generating unit tests, sample inputs, or mock data|Yes|For test data in map. Also for guidebook information as there were very little reliable API to use|
|Core Implementation tasks|No|We only used AI/LLMs to help us clarify concepts when we are stuck, but actual coding, structuring and logic were all manually implemented by us.|
|Major business logic, backend endpoints, or critical frontend interactivity|Yes|AI/LLMs were used for debugging purposes. It did not implement the business logic, endpoints or interactivity, final implementation was still done by us|
Solving significant implementation issues|Yes|We used AI/LLMs only to point out possible reasons or suggest other methods to diagnose the issue when faced with major issues.|

