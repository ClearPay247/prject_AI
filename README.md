# ClearPay247

Modern payment portal for debt resolution with AI-powered collection assistance.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
VITE_SUPABASE_URL=https://zelujzsyxycirrxrgrhe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplbHVqenN5eHljaXJyeHJncmhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5OTM5OTMsImV4cCI6MjA0NjU2OTk5M30.kPlT_zxroGhbVnG7u_xSv4ui9NOO7pHmuq-2SAUvrfQ
VITE_ENCRYPTION_KEY=your_encryption_key
```

## Deployment

The site is deployed on Netlify with continuous deployment from the main branch.

### Build Settings
- Build command: `npm run build`
- Publish directory: `dist`