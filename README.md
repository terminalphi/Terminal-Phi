# Terminal Phi Website — Walkthrough

## Overview

Built a fluid, premium website for **Terminal Phi** college coding society, inspired by the design language of [amsderive.in](https://amsderive.in/). The site features a 3-page flow with smooth transitions, terminal-inspired aesthetics, and rich animations.

**Tech Stack**: React + Vite + Vanilla CSS + React Router

**Live at**: http://localhost:5173/

---

## Page Flow

### 1. Landing Page → 2. Sign-In → 3. Main Site

````carousel
![Landing page with logo animation, typewriter text, and glowing ENTER button](/Users/shreeanshaggarwal/.gemini/antigravity-ide/brain/1d9544cd-d275-4e00-8abd-839175448776/landing.png)
<!-- slide -->
![Sign-in page with glassmorphism card and terminal-styled inputs](/Users/shreeanshaggarwal/.gemini/antigravity-ide/brain/1d9544cd-d275-4e00-8abd-839175448776/signin.png)
<!-- slide -->
![Main site hero section with code block and navigation](/Users/shreeanshaggarwal/.gemini/antigravity-ide/brain/1d9544cd-d275-4e00-8abd-839175448776/hero.png)
````

---

## Main Site Sections

````carousel
![About Terminal Phi — numbered cards with staggered reveal](/Users/shreeanshaggarwal/.gemini/antigravity-ide/brain/1d9544cd-d275-4e00-8abd-839175448776/about.png)
<!-- slide -->
![Activities grid — Project Building, Hackathons, Mock Interviews, System Design, DSA/CP](/Users/shreeanshaggarwal/.gemini/antigravity-ide/brain/1d9544cd-d275-4e00-8abd-839175448776/activities.png)
<!-- slide -->
![Events timeline with numbered items, tags, and status indicators](/Users/shreeanshaggarwal/.gemini/antigravity-ide/brain/1d9544cd-d275-4e00-8abd-839175448776/events.png)
<!-- slide -->
![Footer with brand, social links, quick links, and contact info](/Users/shreeanshaggarwal/.gemini/antigravity-ide/brain/1d9544cd-d275-4e00-8abd-839175448776/footer.png)
````

---

## Files Created

| File | Purpose |
|------|---------|
| [index.html](file:///Users/shreeanshaggarwal/.gemini/antigravity-ide/scratch/terminal-phi/index.html) | Entry HTML with Google Fonts, SEO meta |
| [index.css](file:///Users/shreeanshaggarwal/.gemini/antigravity-ide/scratch/terminal-phi/src/index.css) | Design system: tokens, reset, animations |
| [App.jsx](file:///Users/shreeanshaggarwal/.gemini/antigravity-ide/scratch/terminal-phi/src/App.jsx) | Router + animated page transitions |
| [LandingPage.jsx](file:///Users/shreeanshaggarwal/.gemini/antigravity-ide/scratch/terminal-phi/src/pages/LandingPage.jsx) | Video animation + typewriter + enter |
| [SignInPage.jsx](file:///Users/shreeanshaggarwal/.gemini/antigravity-ide/scratch/terminal-phi/src/pages/SignInPage.jsx) | Glassmorphism auth card |
| [MainSite.jsx](file:///Users/shreeanshaggarwal/.gemini/antigravity-ide/scratch/terminal-phi/src/pages/MainSite.jsx) | Assembles all sections |
| [Navbar.jsx](file:///Users/shreeanshaggarwal/.gemini/antigravity-ide/scratch/terminal-phi/src/components/Navbar.jsx) | Fixed nav, scroll-aware, mobile menu |
| [HeroSection.jsx](file:///Users/shreeanshaggarwal/.gemini/antigravity-ide/scratch/terminal-phi/src/components/HeroSection.jsx) | Title, code block, CTAs |
| [AboutSection.jsx](file:///Users/shreeanshaggarwal/.gemini/antigravity-ide/scratch/terminal-phi/src/components/AboutSection.jsx) | 3 numbered cards |
| [ActivitiesSection.jsx](file:///Users/shreeanshaggarwal/.gemini/antigravity-ide/scratch/terminal-phi/src/components/ActivitiesSection.jsx) | 6 activity cards in 3×2 grid |
| [EventsSection.jsx](file:///Users/shreeanshaggarwal/.gemini/antigravity-ide/scratch/terminal-phi/src/components/EventsSection.jsx) | Timeline layout |
| [Footer.jsx](file:///Users/shreeanshaggarwal/.gemini/antigravity-ide/scratch/terminal-phi/src/components/Footer.jsx) | Brand, socials, contact |

---

## Key Design Features

- **Terminal green accent** (`#5DCA A5`) from your SVG logo
- **Dark theme** (`#050505`) with subtle grid background
- **Glassmorphism** cards with backdrop blur
- **Typewriter effect** on landing page
- **Pulse glow** animation on CTA buttons
- **IntersectionObserver** scroll reveal on all sections
- **Staggered animations** for card grids
- **Responsive** — mobile hamburger menu, stacked layouts
- **Your logo animation video** plays on the landing page

## What's Next

> [!NOTE]
> - **Authentication**: Wire up real Supabase/Firebase auth
> - **Content**: Add actual team members, events, social links
> - **Deployment**: Deploy to Vercel/Netlify
> - **Backend**: Flask/FastAPI as per your architecture diagram

I recommend setting the workspace to `/Users/shreeanshaggarwal/.gemini/antigravity-ide/scratch/terminal-phi` for continued development.
