# Honey & Oak Boutique - Setup & Deployment Guide

## Overview

Honey & Oak Boutique is a full-stack e-commerce application built with MERN (MongoDB, Express, React, Node.js) stack, integrated with Square for payments and Square Customer Directory.

## Tech Stack

**Frontend:**
- Next.js 16 with React 19.2
- TypeScript
- Tailwind CSS v4
- shadcn/ui components

**Backend:**
- Node.js + Express
- MongoDB (Mongoose ODM)
- Square API Integration
- JWT Authentication

**Integrations:**
- Square Payments (Card, Apple Pay, Google Pay, Cash App, Affirm, ShopPay)
- Digital Gift Cards
- Email Notifications

## Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB instance (local or cloud)
- Square Business Account
- Vercel account (for frontend deployment)

## Installation

### 1. Frontend Setup

\`\`\`bash
# Clone the repository
git clone <your-repo-url>
cd honey-oak-boutique

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local

# Update .env.local with your values:
# NEXT_PUBLIC_SQUARE_APPLICATION_ID=your_app_id
# NEXT_PUBLIC_SQUARE_LOCATION_ID=your_location_id
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Run development server
npm run dev
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Update .env with your values:
# MONGODB_URI=mongodb://localhost:27017/honey-oak
# SQUARE_ACCESS_TOKEN=your_token
# SQUARE_ENVIRONMENT=sandbox
# PORT=5000

# Start MongoDB (if running locally)
mongod

# Run development server
npm run dev
\`\`\`

## Environment Variables

### Frontend (.env.local)

\`\`\`
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sq0xxxxxxx
NEXT_PUBLIC_SQUARE_LOCATION_ID=LxxxxxxX
SQUARE_ACCESS_TOKEN=sq0axxxxxxxxx
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

### Backend (.env)

\`\`\`
MONGODB_URI=mongodb://localhost:27017/honey-oak
SQUARE_ACCESS_TOKEN=sq0axxxxxxxxx
SQUARE_ENVIRONMENT=sandbox
SQUARE_LOCATION_ID=LxxxxxxX
PORT=5000
NODE_ENV=development
ADMIN_EMAIL=admin@honeyandoak.com
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
\`\`\`

## Square Configuration

1. Go to [Square Dashboard](https://developer.squareup.com/apps)
2. Create a new application
3. Copy your Application ID and Location ID
4. Generate an Access Token
5. Enable desired payment methods in Square Dashboard
6. Add these to your `.env` files

## Database Setup

### MongoDB Atlas (Recommended)

1. Create account at mongodb.com/cloud/atlas
2. Create a free tier cluster
3. Whitelist your IP address
4. Create database user credentials
5. Copy connection string to `MONGODB_URI`

### Local MongoDB

\`\`\`bash
# Install MongoDB (macOS)
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Connection string
mongodb://localhost:27017/honey-oak
\`\`\`

## API Documentation

### Products

\`\`\`
GET /api/products - Get all products
GET /api/products?category=shirts - Filter by category
GET /api/products/:id - Get single product
\`\`\`

### Cart

\`\`\`
GET /api/cart/:sessionId - Get cart
POST /api/cart/:sessionId/add - Add to cart
POST /api/cart/:sessionId/remove - Remove from cart
POST /api/cart/:sessionId/update-totals - Update totals
\`\`\`

### Checkout

\`\`\`
POST /api/checkout/payment - Process payment
GET /api/checkout/order/:orderId - Get order details
\`\`\`

### Gift Cards

\`\`\`
GET /api/gift-cards/types - Get gift card types
POST /api/gift-cards/create - Create gift card
POST /api/gift-cards/redeem - Redeem gift card
\`\`\`

### Admin

\`\`\`
GET /api/admin/stats - Dashboard stats
GET /api/admin/orders - Get all orders
GET /api/admin/inventory - Get inventory
POST /api/admin/inventory/:productId - Update inventory
GET /api/admin/reports/sales - Sales report
\`\`\`

## Deployment

### Frontend (Vercel)

\`\`\`bash
# Push to GitHub
git push origin main

# Connect repository to Vercel
# 1. Go to vercel.com/new
# 2. Select your repository
# 3. Add environment variables:
#    - NEXT_PUBLIC_SQUARE_APPLICATION_ID
#    - NEXT_PUBLIC_SQUARE_LOCATION_ID
#    - NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
# 4. Deploy

# Or use Vercel CLI
vercel
\`\`\`

### Backend (Heroku or Railway)

\`\`\`bash
# Using Heroku
heroku create honey-oak-api
heroku config:set MONGODB_URI=your_mongodb_url
heroku config:set SQUARE_ACCESS_TOKEN=your_token
git push heroku main

# Using Railway
railway init
railway up
\`\`\`

## Features Implemented

✅ Homepage with new arrivals
✅ Product browsing with categories
✅ Shopping cart management
✅ Multiple payment methods (Square)
✅ Digital gift cards system
✅ Order tracking
✅ Admin dashboard
✅ Inventory management
✅ Sales reports
✅ Email notifications
✅ Newsletter subscription
✅ Size charts
✅ Returns management

## TODO / Next Steps

- [ ] Email notification system (nodemailer setup)
- [ ] Abandoned cart recovery emails
- [ ] Purchase alerts for admin
- [ ] User authentication & account management
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced search and filtering
- [ ] Analytics dashboard
- [ ] Inventory low-stock alerts
- [ ] SMS notifications

## Troubleshooting

### Connection Issues

If you get MongoDB connection errors:
- Check if MongoDB is running
- Verify connection string
- Check IP whitelist (if using Atlas)

### Square Payment Errors

- Ensure you're using correct Access Token
- Verify Location ID
- Check if payment method is enabled in Dashboard
- Test with Square test cards

### CORS Issues

If frontend can't reach backend:
- Check API URL in .env.local
- Ensure backend CORS is configured
- Verify backend is running on correct port

## Support & Documentation

- [Square Payments Documentation](https://developer.squareup.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Express Documentation](https://expressjs.com)

## License

This project is proprietary to Honey & Oak Boutique.
