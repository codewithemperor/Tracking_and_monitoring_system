# NIPOST Parcel Tracking System - Setup Guide

This guide will help you download, set up, and run the NIPOST Parcel Tracking System on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git** (for downloading the code)

## Step 1: Download the Code

### Option A: Using Git (Recommended)
```bash
git clone <repository-url>
cd Tracking_and_monitoring_system
```

### Option B: Direct Download
1. Download the project files as a ZIP file
2. Extract the ZIP file to your desired location
3. Navigate to the project directory in your terminal

## Step 2: Install Dependencies

```bash
npm install
```

This will install all the required Node.js packages.

## Step 3: Environment Configuration

### Copy Environment Variables
```bash
cp .env.example .env.local
```

### Edit Environment Variables
Open `.env.local` file and update the following values:

```env
# Database Configuration
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Email Configuration (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="your-email@gmail.com"

# Application Configuration
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Socket.IO Configuration
SOCKET_IO_CORS_ORIGIN="http://localhost:3000"
```

**Important Notes:**
- Change `JWT_SECRET` and `NEXTAUTH_SECRET` to secure random strings
- For Gmail, you need to create an "App Password" instead of your regular password
- Update `NEXTAUTH_URL` if you're running on a different port or domain

## Step 4: Database Setup

### Initialize Database
```bash
npm run db:push
```

### Generate Prisma Client
```bash
npm run db:generate
```

### Seed Database with Sample Data
```bash
npm run db:seed
```

This will create:
- An admin user
- A staff user
- A customer user
- Sample parcels with tracking history

## Step 5: Start the Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:3000`

## Login Credentials

After running the database seed, you can use the following credentials:

### Admin Dashboard
- **Email:** `admin@nipost.gov.ng`
- **Password:** `admin123`
- **Access:** Full system access, user management, analytics

### Staff Dashboard
- **Email:** `staff@nipost.gov.ng`
- **Password:** `staff123`
- **Access:** Parcel management, status updates, assigned parcels

### Customer Dashboard
- **Email:** `customer@example.com`
- **Password:** `customer123`
- **Access:** Parcel registration, tracking, personal parcels

### Sample Tracking IDs
- `NIP2024001`
- `NIP2024002`

## Application Features

### Landing Page (`/`)
- Parcel tracking search
- Feature overview
- Testimonials
- Navigation to login/register

### User Dashboard (`/dashboard`)
- Register new parcels
- View personal parcels
- Track parcel status
- Real-time updates

### Staff Dashboard (`/staff-dashboard`)
- View assigned parcels
- Update parcel status
- Manage deliveries
- Real-time notifications

### Admin Dashboard (`/admin-dashboard`)
- User management
- System analytics
- Parcel overview
- Staff assignment

### Tracking Page (`/track/[trackingId]`)
- Public parcel tracking
- Status history
- Real-time location updates

## Key Features

- **Real-time Tracking:** Socket.IO integration for live updates
- **Role-based Access:** Admin, Staff, and Customer roles
- **JWT Authentication:** Secure user authentication
- **Email Notifications:** Automated status updates
- **Responsive Design:** Mobile-friendly interface
- **Accessibility:** WCAG compliant design
- **Database:** SQLite with Prisma ORM

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Database commands
npm run db:push      # Push schema to database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:reset     # Reset database
npm run db:seed      # Seed database with sample data
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Database Connection Issues**
   ```bash
   # Reset database
   npm run db:reset
   npm run db:seed
   ```

3. **Permission Issues**
   ```bash
   # Fix file permissions
   chmod -R 755 .
   ```

4. **Node.js Version Issues**
   ```bash
   # Check Node.js version
   node --version
   # Should be v18 or higher
   ```

### Email Configuration

For Gmail SMTP:
1. Enable 2-factor authentication on your Google account
2. Go to Google Account → Security → App Passwords
3. Generate a new app password
4. Use the app password in `SMTP_PASS`

## Production Deployment

1. Update environment variables for production
2. Build the application:
   ```bash
   npm run build
   ```
3. Start the production server:
   ```bash
   npm start
   ```

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all environment variables are correctly set
4. Verify Node.js version compatibility

## Security Notes

- Change default passwords in production
- Use strong JWT secrets
- Configure proper CORS origins
- Enable HTTPS in production
- Regularly update dependencies
- Implement rate limiting for APIs