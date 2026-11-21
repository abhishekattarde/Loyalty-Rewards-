# LoyaltyRewards — Customer Loyalty System

A full-stack web application for factory owners to reward customers with points via QR codes inside product boxes.

## Features
- **QR Code Generation**: Owner generates printable PDFs of unique QR codes
- **Points System**: 50 points = ₹25 redeemable in the shop  
- **Google Sign-In**: Customers authenticate with Google
- **Admin Panel**: Separate email/password login for the factory owner
- **Fraud Prevention**: Each QR code is single-use with a unique 15-character code
- **Batch Management**: Owner can deactivate QR batches if fraud is suspected

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Auth**: NextAuth.js (Google OAuth + Credentials)
- **Database**: PostgreSQL (Neon) via Prisma ORM
- **PDF Generation**: pdf-lib
- **QR Generation**: qrcode
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in values
4. Set up a PostgreSQL database (Neon recommended — free tier at neon.tech)
5. Push schema: `npm run db:push`
6. Run dev server: `npm run dev`

## Environment Variables
See `.env.example` for all required variables.

## Deployment
Push to GitHub and connect to Vercel. Add all env vars in Vercel dashboard. Neon DB connects automatically.
