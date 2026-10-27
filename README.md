# CalmSpace (Optimized Modular Version)

This is the optimized, modularized version of CalmSpace — a mindfulness and wellness app built with **React + Vite + Firebase**.

---

## 🛠️ Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Dev Server
```bash
npm run dev
```
This will start your app at **http://localhost:5173/**.

---

## ⚙️ Firebase Setup

The app uses Firebase Authentication + Firestore.

You can configure Firebase by injecting your config object as a global variable (before React loads):

### Option 1 — Inline in `index.html`
```html
<script>
  window.__firebase_config = JSON.stringify({
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  });
</script>
```

### Option 2 — Vite `.env` File
You can also modify the context file to read from `import.meta.env.VITE_FIREBASE_API_KEY` style environment variables if preferred.

---

## 🧘 Tailwind Setup (Recommended)

For best visuals, install TailwindCSS:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Then replace the contents of your `tailwind.config.js` with:

```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

And include Tailwind in your main stylesheet (`src/styles/theme.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Now remove the minimal fallback CSS in `src/styles/theme.css` if you wish.

---

## 💬 Gemini API (CalmBot)

The CalmBot chat uses Google’s Gemini API.  
To activate it, add this before your React script in `index.html`:

```html
<script>
  window.__GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
</script>
```

If no key is provided, the chatbot will use simulated responses.

---

## 🧩 Folder Structure Overview

```
src/
  ├── App.jsx
  ├── main.jsx
  ├── components/         # Reusable UI components
  ├── screens/            # Main pages
  ├── games/              # Mini wellness games
  ├── context/            # Firebase context
  ├── utils/              # Helpers & constants
  └── styles/             # Theme + animations
```

---

## 💡 Improvements

- Modular architecture for scalability
- Firestore queries optimized with `orderBy` + `limit`
- Reusable hooks and memoization
- Shared style and animation files
- Firebase kept fully functional

---

Enjoy your calmer, cleaner CalmSpace 🌿
