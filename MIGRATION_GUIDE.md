# Database Migration Guide: SQLite to PostgreSQL

## Why Migrate?

SQLite doesn't work on Vercel or any serverless environment because:
- No persistent file system access
- Ephemeral storage that's discarded after function execution
- Read-only limitations even if you could upload the DB file

## Recommended Database: Neon (PostgreSQL)

### Why Neon?
- ✅ **Serverless**: Built for Vercel and serverless environments
- ✅ **Free Tier**: Generous free tier for development
- ✅ **Auto-scaling**: Handles traffic spikes automatically
- ✅ **Easy Setup**: Simple connection strings
- ✅ **Branching**: Database branching for development

## Step-by-Step Migration

### 1. Set Up Neon Database

1. **Sign up for Neon**
   - Go to [Neon](https://neon.tech/)
   - Create a free account
   - Verify your email

2. **Create a New Project**
   - Click "New Project"
   - Choose a region closest to your users
   - Name your project (e.g., "nipost-tracking")
   - Click "Create Project"

3. **Get Connection String**
   - Once created, go to Dashboard → Project Details
   - Copy the connection string
   - It should look like: `postgresql://username:password@host.neon.tech/database?sslmode=require`

### 2. Update Environment Variables

#### Local Development (.env)
```bash
# Replace with your Neon connection string
DATABASE_URL="postgresql://username:password@host.neon.tech/database?sslmode=require"

# Keep other variables
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="your-jwt-secret-here"
# ... other variables
```

#### Vercel Deployment
1. Go to your Vercel project dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add the following variables:
   - `DATABASE_URL`: Your Neon connection string
   - `NEXTAUTH_SECRET`: Generate a random secret
   - `JWT_SECRET`: Generate a random secret
   - `NEXT_PUBLIC_SOCKET_URL`: `https://your-domain.com`

### 3. Run Migration

#### Option A: Using the Setup Script (Recommended)
```bash
npm run db:setup
```

This will:
- Generate Prisma client
- Push schema to PostgreSQL
- Run the seed script

#### Option B: Manual Steps
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database
npm run db:seed
```

### 4. Test Locally

```bash
# Start the development server
npm run dev

# Test the application
- Visit http://localhost:3000
- Try logging in with admin credentials
- Create some test data
- Verify everything works
```

### 5. Deploy to Vercel

1. **Commit your changes**
   ```bash
   git add .
   git commit -m "Migrate from SQLite to PostgreSQL"
   git push origin master
   ```

2. **Deploy to Vercel**
   - Vercel will automatically detect the push
   - It will build using the updated build script
   - The application will connect to your Neon database

## Alternative Database Options

### 1. Supabase (PostgreSQL)
- **Website**: https://supabase.com/
- **Pros**: Free tier, includes auth and storage
- **Connection**: `postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres`

### 2. PlanetScale (MySQL)
- **Website**: https://planetscale.com/
- **Pros**: Serverless MySQL, free tier
- **Cons**: MySQL instead of PostgreSQL
- **Connection**: `mysql://username:password@host/database`

### 3. Railway (PostgreSQL)
- **Website**: https://railway.app/
- **Pros**: Simple deployment, free tier
- **Connection**: `postgresql://username:password@host.railway.app:5432/database`

## Troubleshooting

### Common Issues

#### 1. "Database connection failed"
- **Solution**: Check your DATABASE_URL format
- **Ensure**: SSL mode is enabled (`?sslmode=require`)

#### 2. "Prisma schema mismatch"
- **Solution**: Run `npm run db:push` to update the database schema

#### 3. "Seed script fails"
- **Solution**: Run it manually: `npm run db:seed`

#### 4. "Vercel deployment fails"
- **Solution**: Check environment variables in Vercel dashboard
- **Ensure**: All required variables are set correctly

### Testing the Connection

You can test your database connection with:

```bash
# Generate Prisma client
npx prisma generate

# Test connection
npx prisma db execute --stdin --url="$DATABASE_URL"
```

Enter `\q` to quit the database shell.

## Post-Migration Checklist

- [ ] Database schema updated successfully
- [ ] Prisma client generated without errors
- [ ] Seed script executed successfully
- [ ] Application works locally with new database
- [ ] Environment variables updated in Vercel
- [ ] Application deployed successfully to Vercel
- [ ] All features working in production
- [ ] No database-related errors in logs

## Benefits of PostgreSQL

1. **Production Ready**: Built for production workloads
2. **Scalable**: Handles high traffic and large datasets
3. **Reliable**: ACID compliance and data integrity
4. **Feature Rich**: Advanced features like JSONB, full-text search
5. **Well Supported**: Excellent Prisma support
6. **Performance**: Optimized for concurrent connections

## Cost Considerations

- **Neon Free Tier**: 3 Projects, 1 GB storage, 32 GB RAM/month
- **Supabase Free Tier**: 500 MB database, 1 GB bandwidth, 2 API calls/second
- **Paid Plans**: Usually start at $20/month for increased resources

The free tiers are sufficient for development and small production applications.

## Support

If you encounter any issues:
1. Check the logs: `npx prisma studio`
2. Verify connection string format
3. Ensure SSL is enabled
4. Check Vercel environment variables
5. Review Neon/Supabase dashboard for any service issues

---

**🎉 Congratulations! Your NIPOST tracking system is now ready for production with a proper cloud database!**