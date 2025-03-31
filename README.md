# 🏉 The Gaskin Masters Pool – greenjacket.io

Welcome to the official repo for the **Gaskin Masters Pool**, a fantasy golf experience built for the iconic Masters Tournament at Augusta National. Hosted on **[greenjacket.io](https://greenjacket.io)**, this platform delivers community, competition, and tradition through a slick modern web app.

## 🧠 What Is It?

The Gaskin Masters Pool is a light-weight, high-stakes fantasy game where participants select 8 golfers, and the **top 6 scores** determine their team's fate. Strategic depth, real-time leaderboard drama, and an annual buy-in make this a fan-favorite pool that has run for years and continues to grow.

---

## ✨ Key Features

### 1. 👤 My Teams Dashboard
Manage all your entries in one place. See team breakdowns, edit entries (pre-lock), and track your position on the leaderboard.

### 2. 🏆 Draft Your Team
Choose 8 golfers from a curated field. Only the **top 6 scores** count. Teams lock at **Thursday 9AM** sharp.

### 3. 🔢 Scoring & Rules Engine
- Best 6 out of 8 scores count
- CUT/W/D/DQ = **+8 strokes per unplayed round**
- Auto-calculating tiebreaker logic

### 4. 🔺 Live Leaderboard
Real-time updates from the PGA Tour API. Watch your team climb (or fall) as scores update throughout the day.

### 5. 🔔 Tiebreaker UI
When teams are tied:
- App will show 7th golfer comparison, then 8th if needed
- Visual callout:  
  _"You're tied for 1st. Your 7th golfer: -2. Opponent's 7th: +1. You win the tiebreak! 🎉"_

---

## 🔹 Bonus (Nice-to-Have) Features

- 🌟 **Past Winners Hall of Fame**: See the legends of previous years
- 💬 **Chatroom / Banter Zone**: Live chat for roasting bad picks, cheering on longshots
- 🕰️ **Mobile-Optimized UI**: Built for quick checking between holes
- 🌐 **Share Your Team**: Generate links to flex your squad pre-tournament
- 🎓 **Glossary / How It Works Page**: For first-timers and forgetful returners

---

## 🎩 Rules & Scoring

- Each team consists of **8 golfers**, selected from a pre-defined pool.
- Only the **best 6 scores** count toward your team total.
- **Cut, Withdrawn, or DQ players** receive a **+8 stroke penalty per unplayed round**.
  - E.g., WD after 2 rounds = +16 penalty.
- Lowest total team score wins.
- **Tiebreakers**:
  1. Compare 7th golfer's score.
  2. Then compare 8th.
  3. Still tied? Split the prize.
- Team rankings show as **T1, T2**, etc., when tied.

---

## 💰 Entry Details

- Entry Fee: **$20/team**
- Deadline: **Thursday @ 9:00 AM (first tee-off)**
- Enter as **many teams as you want**
- Send e-transfer to: **henrygaskin@rogers.com**
- **Unpaid entries are disqualified** at the deadline

---

## 🏆 Payouts

- 🥇 1st Place – 60%
- 🥈 2nd Place – 30%
- 🥉 3rd Place – 10%

> Ties resolved via 7th and 8th golfer scores. Still tied? Split the pot.

---

## 🤔 FAQs

**Can I enter more than one team?**  
Absolutely. Build multiple squads for multiple chances to win.

**What if I forget to pay?**  
Your team will be disqualified if payment isn't received by the Thursday 9AM deadline.

**How does the tiebreaker work?**  
If two teams are tied, we compare their 7th golfer. If still tied, we go to the 8th. If it's still a tie, the winnings are split.

**How do I track my team during the tournament?**  
You'll get access to a real-time leaderboard with your score, team ranking, and breakdowns.

**How are penalties applied for missed cuts?**  
Each round missed adds +8 strokes. Missing two rounds = +16. This keeps it fair for everyone.

---

## 🛠️ Tech Stack

| Layer        | Tech                               |
|--------------|----------------------------------- |
| Runtime      | Bun                                |
| Frontend     | Next.js 15.2.3 (App Router)        |
| Styling      | Tailwind CSS v4 + Framer Motion    |
| Forms        | React Hook Form + Zod              |
| Auth         | Clerk                              |
| DB / Backend | Supabase                           |
| Hosting      | Vercel                             |
| Data         | PGA Tour Leaderboard API           |
| Media        | Cloudinary for image uploads       |
| Domain       | greenjacket.io (localhost:3000 dev)|

---

## 🔮 Project Status

### Current Progress
- [x] Project scaffolding with Bun + Next.js 15 + Tailwind v4
- [x] Clerk authentication integration
- [x] Supabase database setup with core tables
- [x] Clerk webhook for user synchronization
- [x] Custom loading animations
- [x] Homepage design with tournament countdown
- [x] Augusta Engine API integration with Sportradar and SlashGolf
- [x] Complete database schema implementation with indexes and constraints
- [ ] Team draft interface (in progress)
- [ ] Leaderboard implementation
- [ ] Payment tracking

Check the [TODO.md](./TODO.md) file for detailed development tasks and priorities.

---

## 📊 Dev Setup

### Prerequisites
- [Bun](https://bun.sh/) for package management and running the app
- [Supabase CLI](https://supabase.com/docs/guides/cli) for local database development
- [Clerk Developer Account](https://clerk.com/) for authentication
- [Cloudinary Account](https://cloudinary.com/) for image uploads

### Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/masters2025.git
   cd masters2025
   ```

2. Install dependencies:
   ```
   bun install
   ```

3. Set up environment variables:
   - Copy the `.env.example` file to `.env.local`
   - Fill in the required values

4. Start the development server:
   ```
   bun run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

Create a `.env.local` file with the following:

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxx
CLERK_SECRET_KEY=sk_test_xxxx
CLERK_WEBHOOK_SECRET=whsec_xxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API Configuration (for tournament data)
PGA_API_KEY=your-api-key
```

---

## 👍 Contributing

PRs welcome! Please open an issue first for feature requests or bug reports. This is a community-driven project with tradition, vibes, and bragging rights.

### Development Workflow
1. Check the [TODO.md](./TODO.md) for prioritized tasks
2. Create a feature branch from `main`
3. Implement your changes
4. Submit a pull request

---

## 👏 A Tradition Unlike Any Other™

The Gaskin Masters Pool is more than fantasy golf. It's tradition, rivalry, and the ultimate test of your Masters instincts. Whether you're a veteran entrant or a first-time hopeful, this is your shot at digital immortality.

Let the games begin. ⛳️
