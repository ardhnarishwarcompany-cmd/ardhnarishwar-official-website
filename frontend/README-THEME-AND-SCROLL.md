# Ardhnarishwar – Premium Theme Toggle + Scroll Story Animation

## What was added

### 1. Light / Dark Theme Toggle (radial reveal)
- `src/context/ThemeContext.jsx` – lightweight theme context with localStorage persistence
- `src/components/ThemeToggle.jsx` – animated sun/moon button using the CSS View Transitions API
- Circular radial reveal starts from the toggle button
- Graceful fallback when View Transitions API is unsupported or `prefers-reduced-motion` is set
- Integrated into:
  - Public Navbar (desktop + mobile)
  - Admin dashboard sidebar

### 2. Scroll-driven Business Story section
- `src/components/home/ArdhnarishwarScrollStory.jsx`
- Three scenes:
  1. **BUILDING BETTER BUSINESS** – characters converge from scattered positions
  2. **SOLUTIONS THAT CONNECT** – business icons (Strategy, Technology, Consulting, Growth…) fly inward
  3. **FROM VISION TO GROWTH** – sequential step reveal (Vision → Strategy → Execution → Growth)
- Uses existing GSAP + ScrollTrigger (no new dependencies)
- Respects `prefers-reduced-motion`
- Placed on the Home page above the existing CinematicScrollStory

## How to apply

1. Copy the new files into your project:
   - `src/context/ThemeContext.jsx`
   - `src/components/ThemeToggle.jsx`
   - `src/components/home/ArdhnarishwarScrollStory.jsx`

2. Replace / merge these modified files:
   - `src/main.jsx` (ThemeProvider wrapper)
   - `src/components/Navbar.jsx`
   - `src/pages/Home.jsx`
   - `src/admin/AdminLayout.jsx`
   - `src/index.css` (appended theme + scroll-story styles)

3. No new npm packages required (uses existing gsap + lucide-react).

4. Restart the Vite dev server.

## Browser notes
- View Transitions radial animation works in Chromium-based browsers (Chrome, Edge, Opera).
- Firefox / Safari fall back to an instant theme switch (still fully functional).
- Reduced-motion users see the final state of the scroll story without character movement.

## Existing functionality preserved
- All routes, auth, CRM, admin modules, API calls, and the original CinematicScrollStory remain untouched.
