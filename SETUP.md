# FreshTrack Setup Guide

## Quick Start

Follow these steps to get FreshTrack running on your local machine:

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize Database

The application uses SQLite for local development. Create the database file:

```bash
touch app/db.sqlite
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run typecheck` - Check TypeScript types
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically

## Database Management

### Optional: Generate Database Schema

If you want to generate migration files for the database:

```bash
npm run db-generate
```

### Optional: Push Schema to Database

If you want to push the schema directly to the database:

```bash
npm run db-migrate
```

**Note**: The application will automatically create tables as needed, so these steps are optional for development.

## Troubleshooting

### Database Issues

If you encounter database-related errors:

1. Make sure the `app/db.sqlite` file exists
2. Check that the file has write permissions
3. Try deleting and recreating the database file

### Port Issues

If port 3000 is already in use, you can specify a different port:

```bash
npm run dev -- --port 3001
```

### Build Issues

If you encounter build errors:

1. Run type checking: `npm run typecheck`
2. Run linting: `npm run lint:fix`
3. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Features

Once running, you can access:

- **Main Dashboard**: http://localhost:3000
- **Database Manager**: http://localhost:3000/dbmanager (development only)

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Environment Variables

Create a `.env` file in the root directory for any environment-specific configuration:

```env
NODE_ENV=development
DATABASE_URL=./app/db.sqlite
```

## Support

If you encounter any issues, please check:
1. Node.js version (requires Node 18+)
2. npm version
3. File permissions in the project directory

The application should now be running with a modern grocery management interface!