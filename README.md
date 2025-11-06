# 🦋 Critter Connects

# IS216 Web Application Development II

---

## Section & Group Number

G3 Group 8

---

## Group Members

|                               Photo                               | Full Name            | Role / Features Responsible For                                                                                                                                                                                                                                                                                               |
| :----------------------------------------------------------------: | :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<img src="frontend/src/public/assets/Jessica.png" width="80">` | Ang Hui Peng Jessica | Designed the Home page                                                                                                                                                                                                                                                                                                        |
| `<img src="frontend/src/public/assets/Charlize.png" width="80">` | Charlize Teo Hui Zi  | Designed the Guidebook game function and Volunteer map page                                                                                                                                                                                                                                                                   |
|  `<img src="frontend/src/public/assets/Haoyue.png" width="80">`  | Wu Haoyue            | System architecture: Project setup, database management, cloud deployment.`<br>`System Logic: Role-based access control, authentication (Signup & Login), integration test & debug.`<br>`Features: Report page backend, Volunteer Active Report Summary (frontend & backend), Volunteer Past Report (frontend & backend). |
|  `<img src="frontend/src/public/assets/Amelia.png" width="80">`  | Soh Li Qing Amelia   | Designed Report, Resources/Donate page                                                                                                                                                                                                                                                                                        |
|   `<img src="frontend/src/public/assets/Ryan.png" width="80">`   | Chua Wee Chye Ryan   | integrated the backend logic for AI Camera and Status Page                                                                                                                                                                                                                                                                    |
| `<img src="frontend/src/public/assets/Ruixuan.png" width="80">` | Low Rui Xuan         | Designed Guidebook, Login & Signup page                                                                                                                                                                                                                                                                                       |

> Place all headshot thumbnails in the `/photos` folder (JPEG or PNG).

---

## Business Problem

Describe the **real-world business or community problem** your project addresses.

Wildlife rescue operations face critical delays due to inefficient public reporting methods and fragmented coordination between rescue organizations. When members of the public encounter wildlife in distress, the lack of a standardized reporting platform creates operational bottlenecks that slow response time, often making the difference between life and death for injured animals. Additionally, rescue organizations struggle to leverage community support at scale, missing opportunities to mobilize volunteers and resources effectively during emergencies.
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Web Solution Overview

### �� Intended Users

Identify your target user groups.
The general public and rescue organisations.

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
| Reporter Dashboard                           | Reports made by users show up here and can be sorted                                                   | Allows users to check the cases that they reported                                                      |
| Volunteer Dashboard                          | Cases accepted by volunteers show up here and they can update the details of the case as it progresses | Allows volunteers to easily manage cases that they accepted and have a standard workflow for each case  |
| Admin Dashboard                              | All reports show up here and it is possible to reset/change the progress of each case                 | Allows admin to check the details of all reports and change/reset the progress of each case if neededof |

---

## Tech Stack

|                                                                                      Logo                                                                                      | Technology                        | Purpose / Usage                                       |
| :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------- | :---------------------------------------------------- |
|                                      `<img src="https://raw.githubusercontent.com/github/explore/main/topics/html/html.png" width="40">`                                      | **HTML5**                   | Structure and content                                 |
|                                       `<img src="https://raw.githubusercontent.com/github/explore/main/topics/css/css.png" width="40">`                                       | **CSS3 / Bootstrap**        | Styling and responsiveness                            |
|                                `<img src="https://raw.githubusercontent.com/github/explore/main/topics/javascript/javascript.png" width="40">`                                | **JavaScript (ES6)**        | Client-side logic and interactivity                   |
|                                                             `<img src="https://vitejs.dev/logo.svg" width="40">`                                                             | **Vite**                    | Development server and build tool                     |
|                                                          `<img src="https://vuejs.org/images/logo.png" width="40">`                                                          | **Vue.js 3**                | Component-based frontend framework                    |
|             `<img src="https://router.vuejs.org/logo.svg" width="40" alt="Vue Router" onerror="this.src='https://via.placeholder.com/40/4FC08D/ffffff?text=VR'">`             | **Vue Router**              | Client-side routing and navigation                    |
|  `<img src="https://expressjs.com/images/express-facebook-share.png" width="40" alt="Express.js" onerror="this.src='https://via.placeholder.com/40/000000/ffffff?text=EX'">`  | **Express.js**              | Backend server framework and API endpoints            |
|             `<img src="https://socket.io/images/logo.svg" width="40" alt="Socket.io" onerror="this.src='https://via.placeholder.com/40/010101/ffffff?text=IO'">`             | **Socket.io**               | Real-time bidirectional communication (WebSocket)     |
|             `<img src="https://axios-http.com/assets/logo.svg" width="40" alt="Axios" onerror="this.src='https://via.placeholder.com/40/5A29E4/ffffff?text=AX'">`             | **Axios**                   | HTTP client for API requests                          |
|          `<img src="https://leafletjs.com/docs/images/logo.png" width="40" alt="Leaflet" onerror="this.src='https://via.placeholder.com/40/199900/ffffff?text=LF'">`          | **Leaflet**                 | Interactive maps and geospatial visualization         |
|                             `<img src="https://firebase.google.com/downloads/brand-guidelines/PNG/logo-logomark.png" width="40" alt="Firebase">`                             | **Firebase**                | Authentication, Firestore database, and cloud storage |
|    `<img src="https://opencagedata.com/images/opencage-logo.png" width="40" alt="OpenCage API" onerror="this.src='https://via.placeholder.com/40/4A90E2/ffffff?text=OC'">`    | **OpenCage API**            | Geocoding and reverse geocoding services              |
|                                    `<img src="https://www.docker.com/app/uploads/2023/08/logo-guide-logos-1.svg" width="40" alt="Docker" `                                    | **Docker**                       | Deploying machine learning model                      |
| `<img src="https://www.python.org/static/community_logos/python-logo.png" width="40" alt="Python" onerror="this.src='https://via.placeholder.com/40/3776AB/ffffff?text=PY'">` | **Python / SpeciesNet API** | AI-powered species identification from images         |

---

## Use Case & User Journey (Images NOT YET UPDATED)

Provide screenshots and captions showing how users interact with your app.

1. **Landing Page**`<img src="screenshots/landing.png" width="600">`

   - Displays the homepage with navigation options.
2. **Report Feature**`<img src="screenshots/search.png" width="600">`

   - Users can report wild distressed animals that they encounter
3. **Guidebook**`<img src="screenshots/dashboard.png" width="600">`

   - Users can read the guidebook to learn more about the animals
4. **Game**
   `<img>`

- Interactive game users can play to test their knowledge or use to learn more

5. **Status Update**

- Allows users to estimate when the rescue services are coming, as well as key updates after they leave the wild animal with the rescue organisation

6. **Donation Page**
   - Users can decides to donate out of goodwill and respect for the cause.

> Save screenshots inside `/screenshots` with clear filenames.

---

## Developers Setup Guide

### 0) Prerequisites

#### Required Software

- [Git](https://git-scm.com/) v2.4+
- [Node.js](https://nodejs.org/) v18+ and npm v9+

#### Cloud Services & APIs

- **Firebase Project** (required)

  - [Firebase Console](https://console.firebase.google.com/) account
  - Firestore Database enabled
  - Authentication enabled (Email/Password provider)
  - Firebase Storage enabled (for image uploads)
  - Firebase Hosting (optional, for frontend deployment)
  - Service Account JSON file (for backend admin operations)
- **Railway Account** (optional, for backend deployment)

  - [Railway](https://railway.app/) account for cloud backend hosting
- **OpenCage API Key** (required for geocoding)

  - Get your API key from [OpenCage Data](https://opencagedata.com/api)
- **SpeciesNet API** (optional, for species identification)

  - Access to SpeciesNet API endpoint (default: `http://34.126.93.66:8000`)

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
VITE_OPENCAGE_API_KEY=your_opencage_api_key_here
VITE_API_URL=http://localhost:4100/api
VITE_SOCKET_URL=http://localhost:4100
```

> ⚠️ Never commit `.env` or `service-account.json` to GitHub.

---

### 3) Install dependencies

Open your terminal in the project folder and run the following commands to install packages for both backend and frontend:

```bash
npm install confetti-canvas
npm install mathjs
npm intall date-fns

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

| Area            | Test Description               | Expected Outcome                       |
| :-------------- | :----------------------------- | :------------------------------------- |
| Authentication  | Register, Login, Logout        | User successfully signs in/out         |
| CRUD Operations | Add, Edit, Delete data         | Database updates correctly             |
| Responsiveness  | Test on mobile & desktop       | Layout adjusts without distortion      |
| Navigation      | All menu links functional      | Pages route correctly                  |
| Error Handling  | Invalid inputs or missing data | User-friendly error messages displayed |

#### Automated Testing (Optional)

If applicable:

```bash
npm run test
```

---

### 6) Common Issues & Fixes

| Issue                           | Cause                            | Fix                                      |
| :------------------------------ | :------------------------------- | :--------------------------------------- |
| `Module not found`            | Missing dependencies             | Run `npm install` again                |
| `Firebase: permission-denied` | Firestore security rules not set | Check rules under Firestore → Rules     |
| `CORS policy error`           | Backend not allowing requests    | Enable your domain in CORS settings      |
| `.env` variables undefined    | Missing `VITE_` prefix         | Rename variables to start with `VITE_` |
| `npm run dev` fails           | Node version mismatch            | Check Node version (`node -v` ≥ 18)   |

---

------------------------------------Please don't touch these---------------------------------------------------

### Project Structure Overview

This structure helps keep the code modular and maintainable.

#### 📦 Backend folders (`backend/src`)

| Folder                 | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| **controllers/** | Contains logic for handling requests (e.g. CRUD operations). |
| **routes/**      | Maps URL endpoints to controller functions.                  |
| **firebase.js**  | Initializes Firebase Admin SDK.                              |

#### 💻 Frontend folders (`frontend/src`)

| Folder                      | Description                                             |
| --------------------------- | ------------------------------------------------------- |
| **api/**              | Functions that make HTTP requests to your backend APIs. |
| **components/**       | Vue components that render the user interface.          |
| **App.vue / main.js** | Entry point and root component setup.                   |

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

| Command                | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`        | Start local dev server (backend or frontend)        |
| `npm run build`      | Build the frontend for production                   |
| `npm run serve:prod` | Build and serve both frontend + backend on one port |
| `npm run preview`    | Preview frontend build locally                      |

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

As a team, reflect on:

- Key takeaways from working with real-world frameworks
- Challenges faced and how they were resolved
- Insights on teamwork, project management, and problem-solving
