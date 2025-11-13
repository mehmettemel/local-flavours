# LocalFlavors - Project Overview

## What is LocalFlavors?

LocalFlavors is a community-driven platform designed to help people discover authentic restaurants, cafes, and hidden gems in cities around the world. Unlike traditional review platforms, LocalFlavors focuses on building a trusted community where users can share their genuine experiences and vote for their favorite places.

## Core Mission

Our mission is to create a reliable, community-powered platform that helps travelers and locals discover the best dining experiences in any city, starting with Turkey. We believe in the power of collective wisdom and aim to surface truly exceptional places through a democratic voting system and trust-based community engagement.

## Key Features

### 1. **Hierarchical Location System**
- **Country Level**: Starting with Turkey, expandable to other countries
- **City Level**: Major cities like Istanbul, Ankara, Izmir, Antalya, etc.
- **District Level**: Detailed district-level browsing for large cities (e.g., Kadıköy, Beşiktaş in Istanbul)

This hierarchical structure allows users to browse from broad to specific locations, making discovery intuitive and organized.

### 2. **Community Voting & Trust Score**
- **Democratic Voting**: Users can vote for places they recommend
- **Weighted Votes**: Vote weight increases with account age to prevent manipulation
  - Accounts < 30 days: 0.5x weight
  - Accounts 30-90 days: 0.75x weight
  - Accounts 90-180 days: 1.0x weight
  - Accounts > 180 days: 1.2x weight
- **Trust Score**: Calculated based on vote_score, total votes, and vote_percentage
- **Top 20 Focus**: Each location showcases the top 20 places based on community votes

### 3. **Multi-Language Support**
LocalFlavors is built with internationalization at its core:
- **Turkish (TR)**: Primary language for Turkish users
- **English (EN)**: International audience
- **Spanish (ES)**: Expanding to Spanish-speaking markets

All content (place names, descriptions, categories, locations) is stored in multiple languages, ensuring a native experience for all users.

### 4. **Category-Based Discovery**
Places are organized into intuitive categories:
- **Restaurants**: Traditional and modern dining experiences
- **Cafes**: Coffee shops and casual dining
- **Bars & Pubs**: Nightlife and social venues
- (More categories can be added as the platform grows)

### 5. **Admin Dashboard**
A comprehensive admin panel for content management:
- **Places Management**: Create, edit, and moderate place listings
- **Locations Management**: Manage countries, cities, and districts
- **Categories Management**: Organize and maintain place categories
- **Approval System**: Review and approve community-submitted places

### 6. **Place Submission & Moderation**
- **Community Submissions**: Users can suggest new places
- **Approval Workflow**: Submitted places go through a moderation process (pending → approved/rejected)
- **Quality Control**: Ensures only genuine, quality establishments are featured

### 7. **Rate Limiting & Anti-Spam**
- **Vote Rate Limiting**: Users limited to 10 votes per hour
- **Submission Rate Limiting**: Users can submit 5 places per day
- **IP-based & User-based Tracking**: Prevents abuse from both authenticated and anonymous users

## Target Audience

### Primary Users
1. **Travelers**: People visiting Turkey looking for authentic local experiences
2. **Locals**: Residents discovering new places in their own cities
3. **Expats**: International residents navigating local dining scenes
4. **Food Enthusiasts**: People passionate about culinary experiences

### Use Cases
- Planning a trip to Istanbul and looking for top-rated restaurants in Kadıköy
- A local wanting to discover hidden gems in their neighborhood
- An expat looking for authentic Turkish cuisine recommendations
- A food blogger researching the best cafes in a new city

## How It Works

### For Visitors (Unauthenticated Users)
1. Browse locations hierarchically (Turkey → Istanbul → Kadıköy)
2. View the top 20 places in any location
3. Filter by category (restaurants, cafes, bars)
4. See detailed information about each place (description, address, images)
5. View vote counts and trust scores

### For Registered Users (Future Feature)
1. All visitor features, plus:
2. Vote for favorite places
3. Submit new place suggestions
4. Build reputation with account age
5. Create personal lists and favorites
6. Leave detailed reviews and photos

### For Administrators
1. Access admin dashboard at `/admin`
2. Review and approve submitted places
3. Manage locations (add new cities/districts)
4. Organize categories
5. Moderate content
6. View analytics and statistics

## Content Structure

### Places
Each place contains:
- **Multi-language Names**: en, tr, es
- **Multi-language Descriptions**: Detailed information in each language
- **Category**: Restaurant, cafe, bar, etc.
- **Location**: Associated city or district
- **Address**: Physical location
- **Images**: Photo gallery (stored as URLs)
- **Status**: pending, approved, or rejected
- **Voting Stats**: vote_score, total_votes, vote_percentage
- **Trust Score**: Calculated quality metric
- **Timestamps**: created_at, updated_at

### Locations
Hierarchical structure:
- **Countries**: e.g., Turkey
- **Cities**: e.g., Istanbul, Ankara (parent: country)
- **Districts**: e.g., Kadıköy, Beşiktaş (parent: city)

Each location has:
- **Type**: country, city, or district
- **Slug**: URL-friendly identifier
- **Multi-language Names**
- **Path**: Materialized path for hierarchy
- **Coordinates**: latitude, longitude
- **has_districts**: Flag indicating if it has sub-locations

## Future Roadmap

### Phase 1 (Current)
- ✅ Core platform architecture
- ✅ Location hierarchy system
- ✅ Basic place listings
- ✅ Admin dashboard
- ✅ Multi-language support

### Phase 2 (Upcoming)
- 🔄 User authentication (Supabase Auth)
- 🔄 Voting system implementation
- 🔄 Place submission by users
- 🔄 User profiles

### Phase 3 (Future)
- 📋 Reviews and comments
- 📋 Photo uploads
- 📋 Personal lists and favorites
- 📋 Social features (follow users, share lists)

### Phase 4 (Advanced)
- 📋 Mobile apps (React Native)
- 📋 Advanced search and filtering
- 📋 Recommendation engine
- 📋 Integration with maps
- 📋 Reservation system integration
- 📋 Analytics dashboard

### Phase 5 (Expansion)
- 📋 Expand to more countries
- 📋 Business accounts for restaurants
- 📋 Paid promotions and features
- 📋 API for third-party integrations

## Design Philosophy

### User-Centric
Every feature is designed with the end-user in mind. The interface is clean, intuitive, and focuses on helping users discover great places quickly.

### Community-Driven
Trust is built through community participation. The voting system and account-age weighting ensure that genuine recommendations rise to the top.

### Scalable Architecture
Built with modern technologies and best practices to ensure the platform can grow from Turkey to global coverage without major rewrites.

### Multi-Language First
Internationalization isn't an afterthought—it's baked into every aspect of the platform, from data models to UI components.

### Performance-Focused
Server-side rendering, edge caching, and optimized queries ensure fast page loads regardless of location.

## Success Metrics

### Key Performance Indicators (KPIs)
1. **User Engagement**
   - Monthly active users
   - Average session duration
   - Pages per session

2. **Content Growth**
   - Number of places added
   - Number of active cities/districts
   - User-generated submissions

3. **Community Health**
   - Daily votes cast
   - User retention rate
   - Time to vote consistency

4. **Quality Metrics**
   - Approval rate of submissions
   - Places with 10+ votes
   - User satisfaction score

## Competitive Advantages

1. **Focus on Authenticity**: Unlike platforms dominated by tourist traps, we emphasize genuine local favorites
2. **Simple Voting**: No complex reviews to write—just vote for places you recommend
3. **Trust System**: Account-age weighting prevents fake reviews and vote manipulation
4. **Top 20 Focus**: Curated, quality over quantity approach
5. **True Multi-language**: Not just translations, but native content in each language
6. **Community-First**: No paid placements or business-biased rankings

## Technical Highlights

- **Modern Stack**: Next.js 16, React, TypeScript
- **Real-time Data**: Supabase with PostgreSQL
- **Edge-Ready**: Built for deployment on Vercel Edge Network
- **Type-Safe**: Full TypeScript coverage with generated database types
- **Scalable Database**: PostgreSQL with RLS, triggers, and materialized paths
- **SEO-Optimized**: Server-side rendering with dynamic metadata

---

**LocalFlavors** - Discover authentic places, powered by community wisdom.
