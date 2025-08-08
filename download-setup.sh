#!/bin/bash

# NIPOST Parcel Tracking System - Download and Setup Script
# This script helps you download and set up the project on your system

echo "🚀 NIPOST Parcel Tracking System - Setup Script"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version is too old. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm $(npm --version) detected"

# Create project directory
echo "📁 Creating project directory..."
mkdir -p Tracking_and_monitoring_system
cd Tracking_and_monitoring_system

# Download project files (this is a placeholder - you'll need to replace with actual download method)
echo "⬇️  Downloading project files..."
# In a real scenario, you would use:
# git clone <repository-url> .
# or download the ZIP file and extract it

echo "⚠️  Please download the project files manually and place them in this directory:"
echo "   $(pwd)"
echo ""
echo "Then run this script again from the project directory."
echo ""
read -p "Press Enter after you've downloaded the files..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
echo "🔧 Setting up environment configuration..."
cp .env.example .env.local

echo "✅ Environment file created at .env.local"
echo "⚠️  Please edit .env.local with your configuration before proceeding:"
echo "   - Update JWT_SECRET and NEXTAUTH_SECRET with secure values"
echo "   - Configure SMTP settings for email notifications"
echo ""
read -p "Press Enter after you've configured the environment file..."

# Database setup
echo "🗄️  Setting up database..."
npm run db:push
npm run db:generate

# Seed database
echo "🌱 Seeding database with sample data..."
npm run db:seed

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Login Credentials:"
echo "   Admin: admin@nipost.gov.ng / admin123"
echo "   Staff: staff@nipost.gov.ng / staff123"
echo "   Customer: customer@example.com / customer123"
echo ""
echo "📦 Sample Tracking IDs:"
echo "   NIP2024001"
echo "   NIP2024002"
echo ""
echo "🚀 To start the development server:"
echo "   npm run dev"
echo ""
echo "🌐 Application will be available at:"
echo "   http://localhost:3000"
echo ""
echo "📖 For more information, see SETUP.md"