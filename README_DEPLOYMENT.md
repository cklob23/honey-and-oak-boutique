# Quick Start Guide

## Local Development

### Prerequisites
- Node.js 16+
- MongoDB local or Atlas connection
- Square API credentials
- Email service credentials

### Setup

\`\`\`bash
# Clone repository
git clone <your-repo>
cd honey-oak-boutique

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Create environment files
cp .env.example .env
cp backend/.env.example backend/.env

# Fill in your credentials in both .env files
\`\`\`

### Run Locally

\`\`\`bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
\`\`\`

Visit http://localhost:3000 and http://localhost:5000

## One-Click Deploy (Recommended)

### Deploy Frontend to Vercel
Click the button below to deploy to Vercel (requires GitHub account):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/honey-oak-boutique)

### Deploy Backend to Railway
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Add backend environment variables
5. Deploy

## Environment Variables Required

### Frontend (.env)
\`\`\`
NEXT_PUBLIC_API_URL=https://your-backend-url.com
\`\`\`

### Backend (.env)
\`\`\`
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/honey-oak
SQUARE_ACCESS_TOKEN=your_square_token
SQUARE_LOCATION_ID=your_location_id
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
\`\`\`

## Verify Deployment

\`\`\`bash
# Check frontend
curl https://yourdomain.com

# Check backend
curl https://api.yourdomain.com/api/health
\`\`\`

## Next Steps

1. Configure your domain
2. Set up SSL certificates
3. Add your products
4. Test complete checkout flow
5. Go live!

For detailed guides, see:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [TESTING.md](./TESTING.md) - Testing procedures
- [BACKEND_SETUP.md](./backend/BACKEND_SETUP.md) - Backend documentation

## Support

Need help? Check:
- GitHub Issues
- Documentation files
- Support email: support@honeyandoak.com
