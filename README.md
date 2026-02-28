YouTube Watch Party – Frontend
This is the React frontend for the YouTube Watch Party application, allowing multiple users to watch YouTube videos together in real-time. Users can chat, and hosts/moderators have playback controls to synchronize the video for all participants.

Live Demo
Frontend (Vercel):https://watch-party-snowy.vercel.app
Backend (Render):https://watch-party-kad7.onrender.com

Features
Join or create watch rooms with unique Room IDs
Host and Moderator controls: Play, Pause, Seek, Change Video
Participants watch-only mode
Role management: Host can assign Moderator, remove participants, transfer Host
Real-time video synchronization with Socket.IO
Chat inside rooms
Popup notification for participants removed by Host
SPA support for refreshing inside rooms

Tech Stack
React – Frontend UI
Socket.IO Client – Real-time communication with backend
YouTube IFrame API – Embedded controllable video player
CSS / Inline Styling – Clean, responsive UI

# React + Vite
This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
Currently, two official plugins are available:
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler
The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

Setup & Installation
Clone the repository
git clone <your-repo-url>
cd watch-party/frontend

Install dependencies
npm install

Update backend URL in App.jsx:
socketRef.current = io("https://watch-party-kad7.onrender.com");

Run the frontend locally
npm start
The app will be available at http://localhost:5001.

Configuration
Socket.IO URL: Set to your deployed backend URL for production.
Room IDs & Usernames: Users can join rooms by entering an existing room ID or creating a new one.

Running Locally with Backend
Make sure your backend server is running (on Render or locally)

Start frontend:
npm start
Open in browser: http://localhost:5001
Test video playback synchronization, chat, and role assignment

Deployment
Vercel Deployment:
Build frontend for production:
npm run build

Deploy the build/ folder to Vercel (or link project using Vercel CLI or GitHub integration)
Ensure backend URL in App.jsx points to Render deployment URL

Folder Structure
client/
├── public/                # Static assets
├── src/
│   ├── App.jsx            # Main application
│   ├── index.js           # React entry point
│   └── ...                # Components, styles
├── package.json           # Dependencies and scripts
└── README.md

Notes
Only Host and Moderator can control playback
Participants cannot play/pause, seek, or change videos
Removed participants receive a popup alert on their screen
Moderator buttons are visible only when assigned
Chat messages are synced in real-time
The frontend is deployed on Vercel, backend on Render
