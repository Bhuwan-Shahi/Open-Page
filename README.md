# Open Book - Book Ecommerce Platform

A comprehensive book ecommerce platform built with Next.js 15, featuring user authentication, shopping cart, and admin management.

## Features

- 📚 **Book Catalog**: Browse and search through a collection of books
- 🛒 **Shopping Cart**: Add books to cart and manage purchases
- 🔐 **Authentication System**: OTP-based login/register with email verification
- 👤 **User Management**: User profiles and role-based access
- ⚡ **Admin Panel**: Manage books, users, and orders (Admin access)
- 📧 **Email Notifications**: OTP codes and welcome emails via Nodemailer
- 🎨 **Professional Design**: Clean, modern UI with consistent color palette

## Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT tokens, HTTP-only cookies, OTP verification
- **Email**: Nodemailer with Gmail SMTP
- **Styling**: Professional color palette (Blue, Green, Gray, Orange)

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Gmail account for email services

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd open-book-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
```

4. **Configure environment variables in `.env`**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/open_book_db"
JWT_SECRET="your-super-secret-jwt-key-here"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
ADMIN_EMAIL="shahibhuwan265@gmail.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

5. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data and admin user
node prisma/seed.js
```

6. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication System

### Default Admin Account
- **Email**: shahibhuwan265@gmail.com
- **Password**: admin123
- **Role**: ADMIN

### Features
- **OTP Verification**: Email-based OTP for secure login/registration
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Admin and User roles with different permissions
- **Email Integration**: Automated OTP and welcome emails

### Email Setup
To enable email functionality:
1. Enable 2-factor authentication in your Gmail account
2. Generate an App Password for Gmail
3. Use the App Password in `SMTP_PASS` environment variable

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with OTP
- `POST /api/auth/login` - User login with OTP verification
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/resend-otp` - Resend OTP code
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Books
- `GET /api/books` - Get all books
- `POST /api/books` - Create new book (Admin only)
- `PUT /api/books/[id]` - Update book (Admin only)
- `DELETE /api/books/[id]` - Delete book (Admin only)

## Project Structure

```
src/
├── app/
│   ├── api/auth/          # Authentication API routes
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── admin/             # Admin dashboard
│   └── ...
├── components/            # Reusable UI components
├── contexts/              # React contexts (Auth, Cart)
├── lib/                   # Utility functions
└── ...
```

## Database Schema

### Users
- Authentication with OTP verification
- Role-based access (USER, ADMIN)
- Profile information (name, email, phone)

### Books
- Complete book information
- Category and pricing
- Stock management

## Development

### Adding New Features
1. Create API routes in `src/app/api/`
2. Build UI components in `src/components/`
3. Update database schema in `prisma/schema.prisma`
4. Run migrations: `npx prisma migrate dev`

### Color Palette
- **Primary Blue**: #4A90E2
- **Success Green**: #28A745  
- **Neutral Gray**: #6C757D
- **Accent Orange**: #F5A623

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
