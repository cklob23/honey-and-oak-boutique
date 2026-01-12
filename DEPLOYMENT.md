# Honey & Oak Boutique - Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database connection tested
- [ ] Square API credentials verified
- [ ] Email service configured
- [ ] Assets and images uploaded
- [ ] SSL certificate ready (for production)

## Frontend Deployment (Next.js to Vercel)

### Step 1: Prepare for Deployment
\`\`\`bash
# Build the project locally to test
npm run build

# Check for any build errors
npm run start
\`\`\`

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI
\`\`\`bash
npm i -g vercel
vercel login
vercel
\`\`\`

#### Option B: Using GitHub Integration
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repository
5. Configure environment variables in Vercel dashboard
6. Click "Deploy"

### Step 3: Configure Environment Variables in Vercel
Add these to your Vercel project settings:

\`\`\`
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_key
\`\`\`

## Backend Deployment (Node.js to Railway or Heroku)

### Option 1: Deploy to Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project"
4. Select "Deploy from GitHub"
5. Choose your backend repository
6. Add environment variables:
   \`\`\`
   MONGODB_URI=your_connection_string
   SQUARE_ACCESS_TOKEN=your_token
   EMAIL_USER=your_email
   EMAIL_PASSWORD=your_password
   \`\`\`
7. Deploy

### Option 2: Deploy to Heroku

\`\`\`bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_connection_string
heroku config:set SQUARE_ACCESS_TOKEN=your_token
heroku config:set EMAIL_USER=your_email
heroku config:set EMAIL_PASSWORD=your_password

# Deploy
git push heroku main
\`\`\`

### Option 3: Deploy Using Docker

\`\`\`bash
# Build Docker image
docker build -t honey-oak-backend .

# Tag for registry (e.g., Docker Hub)
docker tag honey-oak-backend username/honey-oak-backend:latest

# Push to registry
docker push username/honey-oak-backend:latest

# Deploy to hosting service (AWS ECS, Google Cloud Run, etc.)
\`\`\`

## Database Deployment (MongoDB Atlas)

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a new cluster
3. Set up network access (IP whitelist)
4. Create database user
5. Get connection string
6. Add to backend environment variables

## Domain Setup

### Step 1: Register Domain
- Register domain at GoDaddy, Namecheap, or similar

### Step 2: Configure DNS
For Vercel:
- Point domain to Vercel nameservers
- Or use CNAME records to Vercel endpoints

For Backend API:
- Create subdomain (e.g., api.yourdomain.com)
- Point to your hosting service

### Step 3: SSL Certificate
- Vercel: Automatic SSL
- Other services: Use Let's Encrypt or certbot

\`\`\`bash
# Example with certbot (for Linux servers)
sudo certbot certonly --standalone -d api.yourdomain.com
\`\`\`

## Post-Deployment

### Step 1: Verify Deployments
\`\`\`bash
# Frontend health check
curl https://yourdomain.com/api/health

# Backend health check
curl https://api.yourdomain.com/api/health
\`\`\`

### Step 2: Test Critical Flows
- [ ] Create product in admin dashboard
- [ ] Add product to cart
- [ ] Complete checkout with test payment
- [ ] Receive order confirmation email
- [ ] Check order in admin panel

### Step 3: Monitor
- Set up error tracking with Sentry
- Configure logging with LogRocket
- Monitor performance with New Relic or DataDog

## Continuous Deployment

### GitHub Actions (Recommended)
Create \`.github/workflows/deploy.yml\`:

\`\`\`yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
\`\`\`

## Scaling Considerations

### Database
- Enable sharding for large datasets
- Set up read replicas
- Regular backups

### Backend
- Use load balancing (Nginx, HAProxy)
- Enable caching (Redis)
- Set up auto-scaling

### Frontend
- Use CDN for static assets
- Implement image optimization
- Enable gzip compression

## Troubleshooting

### Backend Won't Connect to Database
\`\`\`
Error: MongoDB connection failed
Solution: Check MONGODB_URI, verify IP whitelist in Atlas
\`\`\`

### CORS Errors
\`\`\`
Error: Access blocked by CORS
Solution: Update CORS config to include frontend domain
\`\`\`

### Email Not Sending
\`\`\`
Error: Nodemailer failed
Solution: Verify EMAIL_USER/PASSWORD, check 2FA settings
\`\`\`

## Security Best Practices

1. **Secrets Management**
   - Never commit .env files
   - Use platform secrets (Vercel, Railway, etc.)
   - Rotate keys regularly

2. **HTTPS**
   - Always use HTTPS in production
   - Implement HSTS headers

3. **Database**
   - Enable encryption at rest
   - Use strong passwords
   - Regular backups

4. **API Security**
   - Rate limiting
   - Input validation
   - CSRF protection

5. **Monitoring**
   - Real-time alerts
   - Error tracking
   - Performance monitoring
\`\`\`

## Support

For deployment issues:
1. Check service status pages
2. Review documentation for your hosting provider
3. Contact support teams
4. Check GitHub issues
\`\`\`
