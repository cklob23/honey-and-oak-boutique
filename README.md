# Honey & Oak Boutique

A modern, elegant e-commerce platform for women's clothing featuring advanced inventory management, multiple payment options, and gift card functionality.

## Features

- **Product Showcase** - Browse curated collections with detailed product information
- **Multiple Payment Methods** - Credit/Debit Cards, Apple Pay, Google Pay, Cash App, Affirm, ShopPay
- **Digital Gift Cards** - Purchase and send customizable gift cards
- **Shopping Cart** - Full cart management with real-time updates
- **Admin Dashboard** - Order tracking, inventory management, and sales reports
- **Size Charts** - Detailed size guides for all products
- **Newsletter** - Subscribe to updates and sale notifications
- **Customer Support** - Contact form and comprehensive help sections

## Quick Start

### Frontend
\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`

Backend runs on [http://localhost:5000](http://localhost:5000)

## Environment Setup

See [SETUP.md](./SETUP.md) for detailed environment configuration and deployment instructions.

## Project Structure

\`\`\`
honey-oak-boutique/
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── ui/               # shadcn/ui components
│   └── admin/            # Admin dashboard components
├── backend/              # Express backend
│   ├── src/
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API routes
│   │   └── services/     # Business logic
│   └── server.ts         # Express server setup
├── public/               # Static assets
└── SETUP.md             # Setup documentation
\`\`\`

## Technologies

- **Frontend**: Next.js 16, React 19.2, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Payments**: Square API
- **Hosting**: Vercel (Frontend), Heroku/Railway (Backend)

## License

Proprietary - Honey & Oak Boutique

## Contact

hello@honeyandoak.com
