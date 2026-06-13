# DocIntel AI — React Frontend

A beautiful, responsive React 18 + TypeScript frontend for DocIntel AI document intelligence platform. Features voice interface, real-time document upload progress, conversational Q&A, document summarization, and dark theme with glassmorphism UI.

**Repository:** https://github.com/Anandbd09/docintel-ui  
**Backend:** https://github.com/Anandbd09/doc-intelligence-platform  
**Live Demo:** https://docintel-app.netlify.app

---

## Quick Start (2 minutes)

```bash
# 1. Clone
git clone https://github.com/Anandbd09/docintel-ui.git
cd docintel-ui

# 2. Install dependencies
npm install

# 3. Create .env.local (see Configuration section)
echo "VITE_API_BASE=http://localhost:8080" > .env.local

# 4. Start dev server
npm run dev

# Open http://localhost:5173
```

**Frontend is now running!** (Backend must be running on http://localhost:8080)

---

## Prerequisites

### Software Requirements
- **Node.js 18+**
  ```bash
  node --version
  # Should output: v18.x.x or higher
  ```
- **npm 9+**
  ```bash
  npm --version
  # Should output: 9.x.x or higher
  ```
- **Git**
  ```bash
  git --version
  ```

### Backend Requirement
- Backend running on `http://localhost:8080` (API Gateway)
- See [Backend Setup Guide](https://github.com/Anandbd09/doc-intelligence-platform)

---

## Configuration

### Step 1: Create `.env.local`

In the frontend root directory:

```bash
touch .env.local
```

### Step 2: Add Configuration

```env
# API Gateway URL
# Local: http://localhost:8080
# Production: https://your-domain.com
VITE_API_BASE=http://localhost:8080

# AWS Region (optional)
REACT_APP_AWS_REGION=ap-south-1

# Environment
VITE_ENV=development
```

### Step 3: Verify Configuration

```bash
# Check .env.local is created
cat .env.local

# Should output:
# VITE_API_BASE=http://localhost:8080
```

---

## Development Setup

### Step 1: Install Dependencies

```bash
npm install

# Or with yarn
yarn install

# Or with pnpm
pnpm install
```

This installs 30+ dependencies:
- React 18
- TypeScript
- Tailwind CSS
- Axios
- React Router
- React Markdown
- Web Speech API
- TanStack Start
- React Hot Toast (notifications)
- And more...

### Step 2: Start Development Server

```bash
npm run dev

# Output:
#   VITE v5.x.x  ready in xxx ms
#   ➜  Local:   http://localhost:5173/
#   ➜  Press h + enter to show help
```

### Step 3: Open in Browser

Navigate to **http://localhost:5173**

You should see the login page.

### Step 4: Create Account & Test

1. Click **Sign Up**
2. Enter email: `test@example.com`
3. Enter password: `Test@1234`
4. Click **Register**
5. Login with same credentials
6. You're now on the **Documents** page

---

## Project Structure

```
docintel-ui/
├── src/
│   ├── pages/
│   │   ├── Login.tsx               # Login/Register form
│   │   ├── Documents.tsx           # Document library + upload
│   │   ├── Query.tsx               # Q&A interface
│   │   ├── Summarize.tsx           # Document summarization
│   │   ├── Compare.tsx             # Document comparison
│   │   ├── CrossSearch.tsx         # Multi-document search
│   │   ├── History.tsx             # Query history
│   │   └── AuditLog.tsx            # Compliance logs
│   │
│   ├── components/
│   │   ├── Header.tsx              # Navigation + user menu
│   │   ├── Sidebar.tsx             # Left navigation
│   │   ├── DocumentUpload.tsx       # Drag-drop uploader
│   │   ├── ProgressIndicator.tsx    # Upload status
│   │   ├── QueryBox.tsx            # Question input + voice
│   │   ├── AnswerDisplay.tsx        # AI response + sources
│   │   ├── VoiceButton.tsx          # Voice recording
│   │   └── Modal.tsx               # Modal dialogs
│   │
│   ├── api/
│   │   └── api.ts                  # Axios client + endpoints
│   │
│   ├── hooks/
│   │   ├── useAuth.ts              # Auth state management
│   │   ├── useDocuments.ts         # Document state
│   │   ├── useQuery.ts             # Query state
│   │   └── useVoice.ts             # Voice interface
│   │
│   ├── utils/
│   │   ├── auth.ts                 # JWT token helpers
│   │   ├── date.ts                 # Date formatting
│   │   ├── markdown.ts             # Markdown parsing
│   │   └── validation.ts           # Form validation
│   │
│   ├── styles/
│   │   └── globals.css             # Tailwind + custom CSS
│   │
│   ├── App.tsx                     # Root component + routing
│   └── main.tsx                    # Entry point
│
├── public/
│   └── favicon.svg
│
├── .env.local                      # Configuration (create this)
├── .env.example                    # Example config
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript config
├── tailwind.config.js              # Tailwind CSS config
├── package.json                    # Dependencies
└── README.md
```

---

## Key Features

### 1. Authentication

- **Register** — Create new account with email/password
- **Login** — JWT token-based auth
- **Logout** — Clear token and session
- **Password** — BCrypt hashed on backend, never stored plain text

**Flow:**
```
Register → Backend (BCrypt hash) → JWT token → Store in localStorage
```

### 2. Document Upload

- **Drag & Drop** — Drag files directly onto the page
- **File Browser** — Click to select files
- **File Validation** — Only PDF, PNG, JPG allowed (max 50MB)
- **Real-time Progress** — Upload → Downloading → Extracting → Embedding → Ready

**Status Indicators:**
```
UPLOADING  → Server received, validating
DOWNLOADING → Downloading from S3
EXTRACTING → Extracting text
EMBEDDING  → Creating vectors
READY      → Ready for queries
FAILED     → See error message
```

### 3. Document Q&A (RAG)

- **Text Query** — Type questions in English
- **Voice Query** — Click 🎤, speak, auto-submit
- **Cited Answers** — Response shows source chunks
- **Cache** — Repeat questions return in 11ms
- **History** — Track all questions asked

**Example Query:**
```
Q: What is method overloading?

A: Method overloading is a feature in Java where...

Sources:
• "Method overloading allows multiple methods with..." (0.95 similarity)
• "Overloaded methods must have different..." (0.89 similarity)
```

### 4. Document Summarization

- **Structured Output** — Overview, topics, insights, conclusions
- **Key Points** — Extracted from document
- **Risks & Recommendations** — If applicable
- **Action Items** — With owners and deadlines

### 5. Document Comparison

- **Side-by-Side** — Compare two documents
- **Structured Output** — Similarities, differences, pros/cons
- **Table View** — Easy comparison format

### 6. Multi-Document Cross Search

- **Search Library** — Find across all your documents
- **Ranked Results** — By relevance
- **Document Switching** — Open results in full context

### 7. Voice Interface

- **Speech Recognition** — Browser's Web Speech API
- **Auto-Submit** — Voice question auto-submits when done speaking
- **Barge-In** — Stop speaking to interrupt
- **Auto Readback** — Answer read aloud via Text-to-Speech

**Supported Languages:**
- English, Spanish, French, German, Mandarin, Japanese, and 20+ more

### 8. Conversational Memory

- **Last 10 Messages** — Stored in Redis on backend
- **Follow-up Questions** — Can reference previous answers
- **Context** — LLM knows conversation history

**Example:**
```
Q1: What is method overloading?
A1: [answer]

Q2: Give me an example of that
A2: [uses context from Q1] Here's an example of method overloading...
```

### 9. Audit Log

- **Every Query Logged** — For compliance
- **Timestamp** — When question was asked
- **Document** — Which document was queried
- **User** — Who asked
- **Search History** — See all past queries

### 10. Dark Theme UI

- **Glassmorphism** — Frosted glass effect
- **Dark Background** — Easier on eyes
- **Color Coding** — Document status, buttons, alerts
- **Responsive** — Works on mobile, tablet, desktop

---

## Component Guide

### Login Page (`src/pages/Login.tsx`)

```tsx
<Login />
// Shows form with email + password
// Has "Sign Up" and "Login" toggles
// Form validation: email format, password length
```

### Documents Page (`src/pages/Documents.tsx`)

```tsx
<Documents />
// Shows document library
// Drag-drop upload area
// Filters: by tag, by status
// Actions: query, summarize, compare, delete
```

### Query Page (`src/pages/Query.tsx`)

```tsx
<Query />
// Document detail view
// Question input box with voice button
// Shows previous questions (history)
// Displays answer + sources
```

### Voice Interface (`src/components/VoiceButton.tsx`)

```tsx
<VoiceButton onTranscript={(text) => submitQuestion(text)} />
// Shows 🎤 icon when ready
// Changes to 🔴 recording when speaking
// Auto-submits on speech end
```

---

## API Integration

### Axios Client Setup (`src/api/api.ts`)

```typescript
import axios from 'axios';

const API_BASE = process.env.VITE_API_BASE || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE,
});

// Auto-attach JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Example API Calls

```typescript
// Register
const response = await api.post('/api/auth/register', {
  email: 'user@example.com',
  password: 'Password123!',
  name: 'John Doe'
});
const token = response.data.token;
localStorage.setItem('token', token);

// Upload Document
const formData = new FormData();
formData.append('file', file);
formData.append('userId', userId);
const doc = await api.post('/api/documents', formData);

// Query Document
const answer = await api.post('/api/query', {
  userId: userId,
  docId: docId,
  question: 'What is...?'
});
console.log(answer.data.answer);
```

---

## Styling & Theming

### Tailwind CSS

The entire UI is styled with **Tailwind CSS v3**. No custom CSS needed for most components.

**Dark Theme Colors:**
```css
/* Backgrounds */
bg-slate-950        /* darkest background */
bg-slate-900        /* darker panels */
bg-slate-800        /* lighter panels */

/* Text */
text-white          /* primary text */
text-slate-300      /* secondary text */
text-blue-400       /* links */

/* Accents */
bg-blue-600         /* buttons */
border-blue-500     /* borders */
```

### Custom CSS (`src/styles/globals.css`)

```css
/* Glassmorphism effect */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Fade animation */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}
```

---

## State Management

### useAuth Hook

```typescript
const { user, token, login, register, logout, isAuthenticated } = useAuth();

// Usage
if (isAuthenticated) {
  return <Dashboard />;
} else {
  return <Login />;
}
```

### useDocuments Hook

```typescript
const { documents, upload, delete, refreshList } = useDocuments();

// Usage
const handleUpload = async (file) => {
  const newDoc = await upload(file);
  refreshList();
};
```

### useQuery Hook

```typescript
const { ask, loading, answer, sources } = useQuery(docId);

// Usage
const handleAsk = async (question) => {
  const result = await ask(question);
  console.log(result.answer);
};
```

### useVoice Hook

```typescript
const { isListening, transcript, startListening, stopListening } = useVoice();

// Usage
<button onClick={startListening}>🎤 Speak</button>
<p>{transcript}</p>
```

---

## Forms & Validation

### Login Form

```typescript
interface LoginFormData {
  email: string;        // required, valid email
  password: string;     // required, min 8 chars
}

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (pwd) => pwd.length >= 8;
```

### Upload Form

```typescript
interface UploadFormData {
  file: File;           // required
  userId: string;       // from token
}

const validateFile = (file) => {
  const validTypes = ['application/pdf', 'image/png', 'image/jpeg'];
  const maxSize = 50 * 1024 * 1024; // 50MB
  return validTypes.includes(file.type) && file.size <= maxSize;
};
```

### Query Form

```typescript
interface QueryFormData {
  question: string;     // required, min 3 chars
  docId: string;        // required
  userId: string;       // from token
}
```

---

## Notifications & Alerts

Using **react-hot-toast** for notifications:

```typescript
import toast from 'react-hot-toast';

// Success
toast.success('Document uploaded!');

// Error
toast.error('Failed to upload document');

// Loading
const id = toast.loading('Uploading...');
// Later:
toast.success('Done!', { id });
```

---

## Performance Tips

### Code Splitting

```typescript
const Query = lazy(() => import('./pages/Query'));
const Summarize = lazy(() => import('./pages/Summarize'));

// Routes lazy-load components only when needed
```

### Image Optimization

```typescript
// Use next-gen formats (WebP)
<img src="logo.webp" alt="Logo" loading="lazy" />
```

### API Caching

```typescript
// Cache queries in-browser
const cachedResponse = localStorage.getItem(`query_${docId}_${question}`);
if (cachedResponse) {
  return JSON.parse(cachedResponse);
}
```

---

## Build & Deployment

### Development Build

```bash
npm run dev
# Starts dev server at http://localhost:5173
# Hot reload on file changes
# Source maps for debugging
```

### Production Build

```bash
npm run build
# Creates optimized dist/ folder
# Minified bundles
# Tree-shaking enabled
# Runs in ~2 minutes

# Output:
# dist/index.html
# dist/assets/main-abc123.js (minified)
# dist/assets/main-xyz789.css (minified)
```

### Preview Build

```bash
npm run preview
# Serves the production build locally
# http://localhost:4173
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist

# Your site is live at https://docintel-app.netlify.app
```

---

## Troubleshooting

### "Cannot find module" errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Backend not responding"

**Problem:** `http://localhost:8080` not reachable  
**Solution:**
1. Check backend is running: `curl http://localhost:8080/actuator/health`
2. Update `VITE_API_BASE` in `.env.local`
3. Restart dev server: `npm run dev`

### "CORS error"

**Problem:** `Access to XMLHttpRequest blocked by CORS`  
**Solution:**
1. Verify backend CORS config includes your domain
2. Check `VITE_API_BASE` matches backend origin
3. Browser DevTools → Network → see OPTIONS request

### "Token expired"

**Problem:** Login redirects to login page  
**Solution:**
1. Token lasts 24 hours
2. Logout and login again
3. Or in DevTools: `localStorage.removeItem('token')`

### "Upload fails"

**Problem:** Document upload returns 400 or 413  
**Solution:**
1. Check file is PDF/PNG/JPG
2. File size < 50MB
3. Check backend is running
4. View browser console for error details

### "Voice doesn't work"

**Problem:** 🎤 button disabled or not recording  
**Solution:**
1. Check browser supports Web Speech API (Chrome, Edge, Safari)
2. Allow microphone permission
3. Check browser console for errors
4. Works best on HTTPS (Chrome blocks on HTTP)

### "Slow queries"

**Problem:** Q&A takes 5+ seconds  
**Solution:**
1. First query slower (LLM cold start)
2. Repeat queries use cache (11ms)
3. Larger documents take longer
4. Increase backend RAM allocation

---

## Environment Variables Reference

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_API_BASE` | `http://localhost:8080` | Backend API URL (local development) |
| `VITE_API_BASE` | `https://api.docintel.ai` | Backend API URL (production) |
| `REACT_APP_AWS_REGION` | `ap-south-1` | AWS region for S3 (optional) |
| `VITE_ENV` | `development` | Environment (dev/prod) |

---

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 90+ | ✅ Full | Best experience, voice works |
| Edge 90+ | ✅ Full | Chromium-based, voice works |
| Firefox 88+ | ✅ Full | All features work |
| Safari 14+ | ✅ Full | Voice may need permission |
| Mobile Safari | ⚠️ Partial | Voice interface limited |

---

## Security

### JWT Token Storage

```typescript
// Token stored in localStorage
localStorage.setItem('token', jwtToken);

// Attached to all API requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Backend validates signature
// Invalid/expired tokens return 401
```

### CORS

Frontend can only make requests to configured backend domain:
```
CORS allowed: http://localhost:8080 (dev)
CORS allowed: https://api.docintel.ai (prod)
CORS blocked: https://malicious.com
```

### Password

```typescript
// Never stored on frontend
// Sent to backend over HTTPS only
// Backend: BCrypt hashed
// Never sent back to frontend after registration
```

---

## Performance Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| First Load | < 3s | ~1.5s (Netlify CDN) |
| Cache Hit Query | < 50ms | ~11ms |
| Upload Progress | Real-time | Every 3s polling |
| Voice Recognition | < 500ms | Instant (browser) |
| LLM Response | < 3s | ~2.3s (Groq) |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test locally: `npm run dev`
4. Commit: `git commit -am "Add amazing feature"`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

---

## License

MIT License — see LICENSE.md

---

## Support

- **GitHub Issues:** [docintel-ui/issues](https://github.com/Anandbd09/docintel-ui/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Anandbd09/docintel-ui/discussions)

---

## Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2+ | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Styling |
| Axios | 1.x | HTTP client |
| React Router | 6.x | Routing |
| React Markdown | 9.x | Markdown rendering |
| React Hot Toast | 2.x | Notifications |
| TanStack Start | latest | Full-stack framework |

---

## Roadmap

- [ ] PWA support (offline mode)
- [ ] Document export (PDF, DOCX)
- [ ] Collaborative querying
- [ ] Advanced filters & search
- [ ] Document annotations
- [ ] Mobile app (React Native)
- [ ] Keyboard shortcuts
- [ ] Theme customization
- [ ] Email sharing
- [ ] Document versioning

---

## Author

Built by Anand B  
**GitHub:** [@Anandbd09](https://github.com/Anandbd09)

---

## FAQ

**Q: Can I deploy this to my own server?**  
A: Yes — build with `npm run build`, serve the `dist` folder with any static host (Vercel, Netlify, AWS S3, etc).

**Q: Does the frontend work offline?**  
A: No — requires backend API to function. But you can add service workers for PWA mode.

**Q: Can I change the styling/theme?**  
A: Yes — edit `tailwind.config.js` for colors and `src/styles/globals.css` for custom CSS.

**Q: Is the frontend secure?**  
A: Yes — JWT tokens, HTTPS, CORS validation. Always use HTTPS in production.

**Q: How do I debug voice issues?**  
A: Check browser console (F12), verify microphone permission, test with Chrome first, then other browsers.

---

## Acknowledgments

Built with ❤️ using React 18 and Tailwind CSS. Powered by Groq LLM and ChromaDB.
