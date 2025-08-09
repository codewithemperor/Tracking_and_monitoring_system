# Vercel Deployment Setup Guide

## Database Configuration

The application has been migrated from SQLite to PostgreSQL for Vercel compatibility. Follow these steps to set up your database:

### 1. Set Up PostgreSQL Database

**Recommended: Neon Database (Free Tier Available)**
1. Go to [Neon](https://neon.tech/) and sign up for an account
2. Create a new project/database
3. Get your connection string from the Neon dashboard
4. The connection string should look like:
   ```
   postgresql://username:password@host.neon.tech/database?sslmode=require
   ```

**Alternative Options:**
- **Supabase**: Free PostgreSQL database with additional features
- **PlanetScale**: MySQL-compatible (requires schema changes)
- **Railway**: Full deployment platform with database

### 2. Configure Environment Variables on Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variables:

#### Required Variables
```
DATABASE_URL=postgresql://username:password@host.neon.tech/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-app.vercel.app
```

#### Optional Variables (for email notifications)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### Optional Variables (for AI features)
```
AI_API_KEY=your-ai-api-key
```

### 3. Database Migration

After setting up the environment variables, you need to run the database migration:

1. **Locally** (for testing):
   ```bash
   npm run db:setup
   ```

2. **On Vercel** (automatic):
   - The build script includes `prisma generate`
   - Vercel will automatically run the build process when you deploy

### 4. Deployment Steps

1. **Push your changes to GitHub**
   ```bash
   git add .
   git commit -m "Fix login role validation and database configuration"
   git push origin main
   ```

2. **Deploy to Vercel**
   - If you have automatic deployment enabled, Vercel will deploy automatically
   - Otherwise, manually trigger deployment from the Vercel dashboard

### 5. Verify Deployment

1. Check the deployment logs in Vercel for any errors
2. Test the login endpoints with different user roles:
   - `/user/login` - should only work for CUSTOMER accounts
   - `/staff/login` - should only work for STAFF accounts  
   - `/admin/login` - should only work for ADMIN accounts

### 6. Troubleshooting

#### Common Issues:

**Database Connection Errors:**
- Ensure `DATABASE_URL` starts with `postgresql://` or `postgres://`
- Verify the connection string is correct
- Check that SSL mode is enabled (`sslmode=require`)

**Login Issues:**
- The login endpoint now validates user roles
- Ensure users are logging in through the correct portal
- Check that user roles are properly set in the database

**Build Errors:**
- Ensure `prisma generate` is included in build script
- Check that all dependencies are properly installed

#### Error Messages and Solutions:

1. **"Invalid `prisma.user.findUnique()` invocation: error: Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`"**
   - Solution: Update `DATABASE_URL` environment variable on Vercel

2. **"Access denied. This account is registered as [role], not [intended-role]"**
   - Solution: This is the new role validation working correctly. Users must login through their designated portal.

3. **"PrismaClientInitializationError"**
   - Solution: Check database connection string and ensure PostgreSQL database is accessible

### 7. Security Considerations

- **Environment Variables**: Never commit sensitive data to version control
- **JWT Secret**: Use a strong, randomly generated secret
- **Database**: Use SSL connections for production
- **User Roles**: The new role validation prevents cross-role access

### 8. Testing Checklist

After deployment, test the following:

- [ ] Customer login through `/user/login`
- [ ] Staff login through `/staff/login`
- [ ] Admin login through `/admin/login`
- [ ] Verify that staff cannot login through customer portal
- [ ] Verify that customers cannot login through staff portal
- [ ] Test tracking functionality
- [ ] Test parcel creation and management
- [ ] Test complaint system

### 9. Monitoring

- Set up Vercel Analytics for performance monitoring
- Configure error tracking (if available)
- Monitor database usage through your database provider's dashboard

---

**Note**: The application now properly validates user roles during login, preventing cross-role access. This is a security enhancement that ensures users can only access their designated portals.