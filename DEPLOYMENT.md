# Deployment Guide

This FreshTrack application is now ready for deployment. Here are the steps for different hosting platforms:

## Prerequisites

1. **Database Setup**: The application uses SQLite by default. For production, consider using a managed database service.

2. **Environment Variables**: Set up the following environment variables:
   - `DATABASE_URL`: Database connection string (optional, defaults to local SQLite)
   - `NODE_ENV`: Set to "production"

## Deployment Options

### 1. Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard.

### 2. Railway

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Deploy:
   ```bash
   railway login
   railway init
   railway up
   ```

### 3. Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm run build`
4. Set start command: `npm start`

### 4. Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t freshtrack .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 freshtrack
   ```

### 5. Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Database Migration

Before deploying, ensure your database is properly migrated:

```bash
npm run db:push
```

## Environment Variables

Create a `.env` file in production with:

```env
NODE_ENV=production
DATABASE_URL=your_database_url_here
```

## Troubleshooting

1. **Build Errors**: Run `npm run typecheck` to check for TypeScript errors
2. **Database Issues**: Ensure the database is accessible and properly migrated
3. **Port Issues**: Make sure port 3000 is available or set the PORT environment variable

## Performance Optimization

1. **Database**: Consider using a managed database service for better performance
2. **Caching**: Implement caching strategies for frequently accessed data
3. **CDN**: Use a CDN for static assets

## Security

1. **Environment Variables**: Never commit sensitive data to version control
2. **Database**: Use strong passwords and secure connections
3. **HTTPS**: Always use HTTPS in production

## Monitoring

1. Set up logging and monitoring for your deployment
2. Monitor database performance
3. Set up alerts for errors and downtime