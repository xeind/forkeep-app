# Forkeep

**"Keep the ones who matter."**

A personality-first dating app with a retro photocard aesthetic. Built for the WC Launchpad Builder Round hackathon.

## Overview

Forkeep reimagines online dating by combating swipe fatigue and superficial connections. Instead of mindless swiping, users engage with profiles presented as beautiful photocards that flip to reveal personality prompts and deeper information.

## Features

### Core Functionality

- **User Authentication**: Secure sign-up and login with JWT tokens
- **Profile Management**: Create and edit profiles with photos, bio, and personality prompts
- **Photocard Discovery**: Browse potential matches presented as flippable photocards
- **Smart Matching**: Match when both users like each other
- **Match Management**: View all matches and unmatch when needed

### Design Highlights

- **Photocard Interface**: Cards occupy 70% of the viewport with large portrait photos
- **Flip Interaction**: Click to reveal the back of the card with detailed prompts
- **Swipe Animations**: Heart stamp on right swipe, fold animation on left swipe
- **Light/Dark Themes**:
  - Light mode: Scrapbook desk aesthetic with craft paper texture
  - Dark mode: Film lab/darkroom with charcoal grain and subtle vignette
- **Typography**: Noto Serif for elegant, intentional presentation

### Bonus Features

- Light/dark mode toggle
- Toast notifications (Sonner)
- Test accounts for demo purposes
- Advanced filtering by location, age, interests

## Tech Stack

### Frontend

- **React 19** with TypeScript
- **Motion for React** (motion.dev) for fluid animations
- **Tailwind CSS 4** for styling
- **React Router** for navigation
- **Radix UI** for accessible components
- **Sonner** for toast notifications

### Backend

- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** with Prisma ORM
- **JWT** for authentication
- **WebSocket (Socket.io)** for real-time chat

### Development Tools

- **Vite** for fast development and building
- **ESLint** with strict TypeScript rules
- **Prettier** for code formatting

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd forkeep-app
```

2. Install dependencies:

```bash
npm install
cd backend && npm install
```

3. Set up environment variables:

```bash
# Backend (.env)
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
PORT=3000
```

4. Set up the database:

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

5. Run the development servers:

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

The app will be available at `http://localhost:5173`

## Build Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
forkeep-app/
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React contexts (theme, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and API client
│   ├── pages/           # Route components
│   └── utils/           # Helper functions
├── backend/
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Auth and other middleware
│   │   └── routes/      # API route definitions
│   └── prisma/          # Database schema and migrations
└── public/              # Static assets
```

## Code Style

- Strict TypeScript with all compiler flags enabled
- ES modules only, no file extensions in imports
- Functional components with hooks
- PascalCase for components, camelCase for functions/variables
- Animation durations: 200-300ms with ease-out
- Transform/opacity only for animations
- Accessibility-first with reduced motion support

## Deployment

The app is configured for deployment on:

- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Neon

## Demo Accounts

For testing purposes, test accounts are available on the login page.

## Contributing

This is a hackathon project built in 5 days (October 27-31, 2025) for the WC Launchpad Builder Round.

## License

MIT
