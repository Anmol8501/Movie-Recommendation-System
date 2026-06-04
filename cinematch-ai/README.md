# CineMatch AI 🎬

CineMatch AI is a production-grade, Netflix-inspired movie recommendation web application. It combines the reasoning capabilities of the **Anthropic Claude API** with real-time movie metadata and images from **TMDB (The Movie Database)**. 

Designed with a premium Netflix-dark aesthetic, it provides user-friendly features like mood pill selectors, smart search, client-side caching, a local watchlist, interactive Recharts dashboard panels, and smooth scroll animations.

---

## 🚀 Key Features

* **AI-Powered Recommendation Brain:** Verbatim integration with Claude Sonnet system prompts to generate precise cinephile matches based on user queries, watch history, and emotional moods.
* **Dual Execution Mode (Intelligent Fallback):** If an Anthropic API Key is missing, the application automatically runs a client-side backup engine. It searches TMDB for real similar movies, director records, and genres, formatting the output to fit the Claude layout seamlessly.
* **Sticky Navigation Header & Mobile Drawer:** Fixed navbar transitioning from transparent to solid black, complete with active link indicators and a sliding mobile drawer.
* **Frosted Glass Search with Web Speech API:** A smart search input cycling through movie search prompts, complete with speech recognition (Voice Search).
* **Analytics Statistics Panel:** Interactive stats cards and charts powered by Recharts (Genre trends bar graph and scaling area chart).
* **Local Watchlist & AnimatePresence:** Manage, sort (Rating, Date, Year, Title), and filter saved films by genre. Watchlist cards slide and scale out of view with exit transitions.
* **Typewriter AI Insights:** Detailed analysis panels streaming themes, endure ratings, and trivia facts character-by-character.
* **Trailer Embed Modals:** Premium overlays displaying YouTube trailers from TMDB.

---

## 🛠️ Tech Stack

* **Frontend Framework:** React 18 + Vite
* **Styles & Motion:** Tailwind CSS v3 + Framer Motion v11
* **Icons:** Lucide React
* **Data Visualization:** Recharts
* **Networking:** Axios
* **AI Brain SDK:** `@anthropic-ai/sdk`
* **Data Provider:** TMDB API v3

---

## ⚙️ Quick Start

### 1. Clone & Extract
Open the terminal inside the `cinematch-ai` project directory.

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Duplicate `.env.example` into a new `.env` file:
```bash
cp .env.example .env
```
Open `.env` and fill in your keys:
```env
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔑 How to get API Keys

### 1. Anthropic API Key (Claude Brain)
1. Register/Login at [Anthropic Console](https://console.anthropic.com/).
2. Navigate to **API Keys** and generate a new key.
3. Add it as `VITE_ANTHROPIC_API_KEY` in `.env`.

### 2. TMDB API Key (Movie Database Metadata)
1. Sign up for a free account at [The Movie Database (TMDB)](https://www.themoviedb.org/).
2. Go to **Settings -> API** in your profile dashboard.
3. Submit an application for a developer account to immediately obtain an API Key (v3).
4. Add it as `VITE_TMDB_API_KEY` in `.env`.

---

## 🌍 Production Deploy

### Vercel
Deploy instantly on Vercel by running `vercel` in your CLI or connecting your repository.
Add `VITE_TMDB_API_KEY` and `VITE_ANTHROPIC_API_KEY` in Vercel's Environment Variables dashboard.

### Netlify
Set build command to `npm run build` and directory to `dist`. Add environment variables in site configuration.

---

## ⚠️ Attributions

* **TMDB:** This product uses the TMDB API but is not endorsed or certified by TMDB.
* **Anthropic:** Powered by Anthropic's Claude-3.5-Sonnet LLM.
