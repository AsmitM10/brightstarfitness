# Bright Star Fitness - 7 Day Online Free Sessions

A comprehensive fitness platform built with Next.js 16, offering 7-day free online yoga and meditation sessions with referral tracking, admin dashboard, and session management.

## 🌟 Features

### User Features
- **7-Day Free Trial** - Complete fitness program with yoga and meditation
- **Referral System** - Earn rewards by inviting friends
- **Personal Dashboard** - Track attendance and progress
- **Session Scheduling** - View upcoming live sessions
- **WhatsApp Integration** - Easy verification and communication

### Admin Features
- **User Management** - View and manage all registered users
- **Session Scheduling** - Schedule and manage fitness sessions
- **Holiday Management** - Declare holidays with automatic user extension
- **Analytics Dashboard** - Track registrations, attendance, and growth
- **Calendar View** - Visual session and holiday management

## 🏗️ Tech Stack

- **Framework:** Next.js 16.1.1 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4.1.9
- **UI Components:** Radix UI, shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Cookie-based sessions
- **Animations:** Framer Motion
- **Charts:** Recharts

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd yoga
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment template:

```bash
cp env.template .env.local
```

Edit `.env.local` and add your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Credentials (Change in production!)
ADMIN_EMAIL=admin@brightstarfitness.com
ADMIN_PASSWORD=admin123

# Base URL (for production)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 4. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `supabase-sessions-table.sql`

This creates the required tables:
- `user4` - User data and attendance
- `user5` - Referral tracking
- `sessions` - Session scheduling
- `holidays` - Holiday management

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
yoga/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── admin/        # Admin authentication
│   │   │   ├── holidays/     # Holiday management
│   │   │   ├── register/     # User registration
│   │   │   ├── sessions/     # Session scheduling
│   │   │   └── verify-user/  # User verification
│   │   ├── admin/            # Admin dashboard
│   │   ├── dashboard/        # User dashboard
│   │   ├── [slug]/           # Dynamic referral pages
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   ├── landing/          # Landing page components
│   │   │   └── admin-dashboard/  # Admin components
│   │   └── ui/               # Reusable UI components
│   ├── lib/
│   │   ├── auth.ts           # Authentication helpers
│   │   └── supabase/         # Supabase clients
│   └── middleware.ts         # Route protection
├── public/                   # Static assets
├── env.template              # Environment variables template
├── SECURITY_FIXES.md         # Security documentation
└── supabase-sessions-table.sql  # Database schema
```

## 🔐 Security

The application implements several security measures:

- ✅ Server-side authentication with HTTP-only cookies
- ✅ Protected admin routes via middleware
- ✅ API route authentication
- ✅ Secure session management
- ✅ CSRF protection ready
- ✅ Environment variable configuration

**See `SECURITY_FIXES.md` for detailed security documentation.**

## 🎯 Usage

### For Users

1. **Register:** Fill the join form on the homepage
2. **Verify:** Click the Telegram link to verify with admin
3. **Access Dashboard:** Login to view your personal dashboard
4. **Refer Friends:** Share your unique referral link
5. **Track Progress:** Monitor attendance and sessions

### For Admins

1. **Login:** Navigate to `/admin/login`
   - Default: `admin@brightstarfitness.com` / `admin123`
2. **Dashboard:** View analytics and user statistics
3. **Manage Users:** View all registered users
4. **Schedule Sessions:** Add/cancel sessions via calendar
5. **Declare Holidays:** Automatically extends user trial periods

## 🔧 Configuration

### Admin Credentials

**⚠️ IMPORTANT:** Change default credentials before production!

Set in `.env.local`:
```env
ADMIN_EMAIL=your-email@domain.com
ADMIN_PASSWORD=your-secure-password
```

### Base URL

For production deployment, set:
```env
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## 📦 Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🧪 Testing

Before deployment, verify:

- [ ] Environment variables are set
- [ ] Database tables are created
- [ ] Admin login works
- [ ] User registration works
- [ ] Session scheduling works
- [ ] Referral system works
- [ ] All API routes are protected

## 🐛 Troubleshooting

### Common Issues

**1. Permission Denied Error**
```bash
chmod +x node_modules/.bin/next
```

**2. Supabase Connection Error**
- Verify environment variables
- Check Supabase project URL and keys
- Ensure database tables exist

**3. Admin Login Not Working**
- Clear browser cookies
- Check environment variables
- Verify middleware is working

**4. Build Errors**
- Run `npm install` again
- Delete `.next` folder and rebuild
- Check TypeScript errors

## 📊 Database Schema

### user4 Table
- User registration and profile data
- Attendance tracking (7-day array)
- Referral information

### user5 Table
- Referral tracking
- List of referred users per user

### sessions Table
- Session scheduling
- Meeting links
- Status (scheduled/cancelled)

### holidays Table
- Holiday date ranges
- Automatic user extension logic

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Compatible with any Node.js hosting:
- Netlify
- Railway
- Render
- AWS
- DigitalOcean

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 📞 Support

For issues or questions:
- Review `SECURITY_FIXES.md`
- Check environment setup
- Verify database configuration

---

**Built with ❤️ using Next.js and Supabase**
