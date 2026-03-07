<div align="center">
  <img src="public/header/header1.png" alt="GIGmate Banner" width="100%" />

# 🎸 GIGmate

**The ultimate real-time collaboration workspace for bands.**

[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.7-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.2-0055FF?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)

</div>

---

## 📖 About Project

**GIGmate** is a web-based, real-time collaboration tool tailored specifically for bands and musicians. Whether you are practicing in the studio or performing live on stage, GIGmate ensures everyone is on the same page.

It allows band members to join a shared session, view setlists, sync master notes, and maintain their own personal notes. With specialized views like the **MasterBoard** (for keyboardists/band leaders) and **PlayerBoard** (for singers/other members), it provides a tailored experience for each role.

---

## ✨ Features

- **Real-time Sync:** Powered by Firebase, all session data (songs, notes, active status) updates instantly across all connected devices.
- **Role-based Workspaces:**
  - **Master (Keyboardist/Leader):** Can add, edit, reorder, and delete songs. Controls the active song for the whole band.
  - **Player (Singer/Others):** Follows the master's setlist, views master notes, and can maintain private personal notes for each song.
- **Performance Mode:** A distraction-free, maximized view designed for live gigs.
- **Stage Mode (OLED):** A high-contrast dark mode optimized for stage lighting and battery saving.
- **Persistent Sessions:** Your recent gigs and studios are saved locally for quick access.
- **Interactive Metronome:** Built-in metronome for practice and timing.
- **Lyrics View:** Integrated lyrics viewer for singers.

---

## 🛠️ Tools

This project is built using modern web development tools to ensure performance, scalability, and an excellent developer experience:

- **Frontend Framework:** React 19 + Vite
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS (v4)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Backend/Database:** Firebase (Firestore)

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/GIGmate.git
   cd GIGmate/gigmate
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project.
   - Enable Firestore Database.
   - Add your Firebase configuration to the project (e.g., in `src/lib/firebase.js` or via `.env` variables).

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open the app**
   Navigate to `http://localhost:5173` in your browser.

---

## 🔧 Tweaks Needed

While GIGmate is fully functional, there are always areas for improvement. Here are some tweaks and upcoming features planned:

- [ ] **Offline Mode Support:** Improve caching so the app can better handle sudden drops in internet connectivity during a gig.
- [ ] **Advanced Metronome Sync:** Ensure the metronome stays perfectly synchronized across all devices with minimal latency.
- [ ] **PDF/Chord Chart Uploads:** Allow users to upload and view PDF files for sheet music directly in the session.
- [ ] **Custom Themes:** Give bands the ability to customize the UI colors to match their brand.

---

<div align="center">
  <p>Built with 🎸 by musicians, for musicians.</p>
</div>
