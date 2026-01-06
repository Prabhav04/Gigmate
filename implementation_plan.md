# GIGmate - Real-time Band Collaboration App Implementation Plan

## 1. Project Overview

GIGmate is a real-time collaboration tool tailored for music bands. It allows band members (Singer, Drummer, Keyboardist, Guitarist, Violinist) to have synchronized views of their setlists and notes.

- **Key Feature**: The Keyboardist acts as the "Leader". Text added by the Keyboardist is broadcasted/visible to everyone.
- **Individual Spaces**: Each member has their own dedicated tab/space for personal notes.
- **Real-time**: Updates happen instantly across all connected devices.

## 2. Technology Stack

- **Framework**: React (Vite)
- **Styling**: Tailwind CSS (with specific focus on "dark mode", "glassmorphism", and "vibrant aesthetics")
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Real-time Backend**: Firebase (Firestore)
  - _Why?_ Provides out-of-the-box real-time document syncing, perfect for a "Google Docs" simplified alternative.
- **Editor**: Simple ContentEditable or Textarea for MVP, or `react-quill` for rich text if needed (Starting with Textarea for simplicity and total styling control).

## 3. Data Structure (Firestore Schema)

```json
{
  "sessions": {
    "sessionId": {
      "activeSongId": "song1",
      "songs": {
        "song1": {
          "title": "Song Title",
          "masterNotes": "Notes from Keyboardist (Visible to all)",
          "lyrics": "Lyrics for Singer",
          "drumNotes": "Beats for Drummer",
          "guitarNotes": "Chords for Guitarist",
          "violinNotes": "Score/notes for Violinist"
        }
      }
    }
  }
}
```

## 4. Phase 1: Setup & Design System

- [x] **Initialize Project**: Verify Vite + React setup.
- [x] **Install Dependencies**: `tailwindcss`, `postcss`, `autoprefixer`, `firebase`, `react-router-dom`, `lucide-react`, `framer-motion` (for animations).
- [x] **Configure Tailwind**: Set up custom color palette (Neon/Dark theme), fonts (Inter/Outfit).
- [x] **Global Styles**: Implement `index.css` with glassmorphism utilities and animated backgrounds.

## 5. Phase 2: Core Components & Routing

- [x] **Router Setup**: Define routes (`/`, `/session/:id`, `/join`).
- [x] **Role Selection**: A visually stunning landing page to select the instrument/role.
- [x] **Layout**:
  - **Navbar**: Shows current session and connected status.
  - **Tab System**: Navigation between "Master View" and "Personal View".

## 6. Phase 3: Real-time Integration (Firebase)

- [x] **Firebase Setup**: Initialize Firebase app and Firestore (Config file created).
- [x] **Hooks**: Create `useSession` hook to listen to real-time updates (Implemented with Mock data).
- [x] **Sync Logic**: Ensure text changes sync immediately to Firestore (Implemented with auto-creation).

## 7. Phase 4: The Workspace UI

- [x] **Master Board (Keyboardist View)**: Large centralized text area. Edits here update `masterNotes`.
- [x] **Player Board (Other Roles)**:
  - Top Section: Displays `masterNotes` (Read-only or visual reference).
  - Bottom/Main Section: Personal text area (e.g., `lyrics` for Singer) editable only by that role.
- [x] **Tabs**: Navigation structure implemented via Role Selection logic.

## 8. Phase 5: Polish & Animations

- [x] **Micro-interactions**: Hover effects, focus states (Included in components).
- [x] **Transitions**: Smooth page transitions using Framer Motion (and CSS animations).
- [x] **Responsive Design**: Ensure it works on tablets/phones for live gig usage.

## 9. Next Steps

1. **Deploy**: Deploy to Vercel/Netlify.
2. **User Testing**: Test with real band members.
