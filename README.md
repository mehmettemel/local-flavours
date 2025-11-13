# LocalFlavors 🍽️

A scalable web platform for discovering authentic restaurants, cafes, and hidden gems in cities worldwide, starting with Turkey.

## Features

- 🌍 **Hierarchical Location System**: Country → City → District (for big cities)
- 🗳️ **Community Voting**: Upvote/downvote places with weighted votes based on account age
- 🏆 **Top 20 Rankings**: See the best-ranked places per location and category
- 🌐 **Multi-language Support**: Turkish, English, and Spanish
- 🔐 **Secure**: Email verification, rate limiting, and spam prevention
- 📱 **Responsive**: Works on all devices
- ⚡ **Fast**: Built with Next.js 14 App Router and SSR

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Internationalization**: next-intl
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### 1. Clone the repository

```bash
git clone https://github.com/mehmettemel/local-flavours.git
cd local-flavours
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API to get your credentials
3. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Run database migrations

In your Supabase project dashboard:

1. Go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the query
5. Repeat for `supabase/migrations/002_seed_data.sql`

Alternatively, if you have Supabase CLI installed:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
local-flavours/
├── app/
│   ├── [locale]/          # Internationalized routes
│   │   ├── layout.tsx     # Locale-specific layout
│   │   └── page.tsx       # Home page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── i18n/                 # Internationalization config
│   ├── config.ts
│   └── request.ts
├── lib/                  # Utilities
│   ├── supabase/         # Supabase client utilities
│   └── utils.ts          # Helper functions
├── messages/             # Translation files
│   ├── en.json
│   ├── tr.json
│   └── es.json
├── supabase/
│   └── migrations/       # Database migrations
├── types/                # TypeScript types
│   └── database.ts       # Database types
└── middleware.ts         # Next.js middleware
```

## Database Schema

### Main Tables

- **users**: User profiles with trust scores and roles
- **locations**: Hierarchical location structure (countries, cities, districts)
- **categories**: Place categories (restaurants, cafes, etc.)
- **places**: The actual places with multilingual content
- **votes**: User votes with weighted scoring
- **reports**: Community reporting system

### Key Features

- **Materialized Path**: For efficient hierarchical queries
- **Vote Weighting**: Based on account age (new accounts have lower weight)
- **Automatic Ranking**: Triggers update place rankings based on votes
- **Row Level Security**: Supabase RLS policies for data access control

## URL Structure

```
/                           # Home page
/:locale                    # Localized home
/:locale/:country           # Country page
/:locale/:country/:city     # City page or districts list
/:locale/:country/:city/:district         # District places
/:locale/:country/:city/:district/:category # Filtered by category
/:locale/:country/:city/place/:slug       # Place detail page
```

## MVP Scope (Phase 1)

- ✅ Turkey only (10 cities)
- ✅ Istanbul with 7 districts
- ✅ Basic voting system with rate limiting
- ✅ Turkish and English languages
- 🚧 Manual admin approval workflow (pending)
- 🚧 Responsive UI with place cards (pending)
- 🚧 Authentication with email verification (pending)

## Roadmap

### Phase 1: Turkey Launch (Months 1-3)
- Complete MVP features
- Add place submission form
- Build admin dashboard
- Implement image upload
- Launch marketing campaign

### Phase 2: Expansion (Months 4-6)
- Add 2-3 more countries
- Advanced filtering
- User profiles and history
- Place comments/reviews

### Phase 3: Global (Months 6+)
- Global expansion
- Mobile app (React Native)
- API for third-party integrations
- Premium features

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- Email verification required for voting
- Rate limiting on votes (3/day for new accounts)
- Vote weight increases with account age
- Manual admin approval for new places
- Community reporting system
- Row-level security on all tables

## License

This project is private and proprietary.

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Supabase
