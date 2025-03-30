# Masters25

![Masters Golf Tournament](https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80)

## The Gaskin Masters Pool 2025

Masters25 is a full-stack web application for managing a Masters Tournament golf pool. It allows users to create accounts, select golfers for their team, track live tournament scores, and compete against friends on a real-time leaderboard.

## 🏆 Features

- **User Authentication**: Secure login and registration via Clerk
- **Team Selection**: Pick 8 golfers to form your team (best 6 scores count)
- **Live Leaderboard**: Real-time tournament scoring and pool standings
- **Admin Dashboard**: Manage golfers, entries, and settings
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Payment Tracking**: Admin tools to track entry fees

## 🧩 Key Pages

- **Home**: Introduction to the Masters Pool with tournament countdown
- **Draft**: Interactive golfer selection experience with real-time updates
- **Dashboard**: User's pool entries, standings, and tournament information
- **Leaderboard**: Live tournament scores and pool standings

## 🔧 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI**: Tailwind CSS, Shadcn UI components
- **State Management**: React Server Components + limited client state
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **API**: Golf data from RapidAPI
- **Package Manager**: Bun

## 📋 Project Timeline

- **Week 1**: Project setup, authentication, basic UI
- **Week 2**: Database schema, team selection, admin features
- **Week 3**: Leaderboard, live scoring, UI polish
- **Week 4**: Testing, optimization, and launch

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (JavaScript runtime & package manager)
- Node.js 18+
- Supabase account
- Clerk account
- RapidAPI account (for golf data)

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/hgaskin/masters2025.git
   cd masters2025
   ```

2. Install dependencies
   ```bash
   bun install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```

4. Configure your environment variables in `.env.local` file

5. Setup Clerk with Supabase
   Follow the detailed steps in [Clerk-Supabase Setup](docs/clerk-supabase-setup.md) to:
   - Configure Clerk JWT templates
   - Apply database migrations
   - Setup webhooks for user synchronization

6. Set up database schema
   ```bash
   cd supabase
   chmod +x setup.sh
   ./setup.sh
   ```

7. Start the development server
   ```bash
   bun dev
   ```

8. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Project Structure

```
masters25/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Authentication routes
│   ├── (dashboard)/        # User dashboard routes
│   ├── (admin)/            # Admin routes
│   ├── api/                # API routes
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── ui/                 # UI components from Shadcn
│   ├── forms/              # Form components
│   ├── leaderboard/        # Leaderboard components
│   └── admin/              # Admin components
├── lib/                    # Shared utility functions
│   ├── supabase/           # Supabase client and utilities
│   ├── auth/               # Clerk-Supabase integration
│   ├── golf-api/           # Golf API integration
│   └── scoring/            # Scoring algorithms
├── docs/                   # Documentation
├── supabase/               # Supabase configuration and migrations
│   ├── migrations/         # SQL migration files
│   └── setup.sh            # Setup script for applying migrations
├── public/                 # Static assets
└── .env.example            # Example environment variables
```

## 📊 Database Schema

The project uses a PostgreSQL database with the following main tables:

- **users**: User information synchronized from Clerk
- **pools**: Tournament pools information
- **golfers**: Golfer information for the tournament
- **entries**: User entries in the pool
- **picks**: Individual golfer selections
- **tournament_scores**: Cached tournament scores

## 🔐 Security Considerations

- Clerk handles authentication and user management
- Supabase Row-Level Security (RLS) for database access control
- API routes protected with proper authorization
- Environment variables for sensitive information

## 🚢 Deployment

The application is deployed on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy from main branch

## 📜 License

This project is private and proprietary. All rights reserved.

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome.

## 📧 Contact

For questions or suggestions, please contact Henry Gaskin.
