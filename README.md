# Remix Grocery Management App

A modern grocery management application built with Remix, TypeScript, Tailwind CSS, and Drizzle ORM.

## Features

- 📱 Responsive grocery inventory management
- 🍽️ Recipe suggestions based on available ingredients
- 📊 Analytics and stats dashboard
- 🔔 Expiration notifications
- 🏷️ Barcode scanning support
- 🎨 Modern UI with glassmorphic design
- 🌙 Dark/light mode support

## Tech Stack

- **Framework**: Remix
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: SQLite with Drizzle ORM
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React

## Development

1. **Install dependencies**:
```bash
npm install
```

2. **Run database migrations**:
```bash
npm run db-migrate
```

3. **Start the development server**:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server with database migration
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run db-migrate` - Run database migrations

## Project Structure

```
app/
├── components/        # Reusable UI components
├── routes/           # Remix routes
├── lib/              # Utility functions and services
├── hooks/            # Custom React hooks
└── drizzle/          # Database schema and configuration
```

## Deployment

First, build your app for production:

```bash
npm run build
```

Then run the app in production mode:

```bash
npm start
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=./app/db.sqlite
NODE_ENV=production
```

## Database Management

The app includes a built-in database manager at `/dbmanager` for development purposes.

## Contributing

1. Fix any TypeScript errors: `npm run typecheck`
2. Ensure code quality: `npm run lint:fix`
3. Test the build: `npm run build`

## License

MIT
