# 🚀 Quick Start Guide

Get the Bright Star Fitness application running in 5 minutes!

---

## ⚡ Quick Setup

### 1. Install Dependencies (1 min)
```bash
npm install
```

### 2. Configure Environment (2 min)
```bash
# Copy template
cp env.template .env.local

# Edit .env.local with your values:
# - Get Supabase credentials from https://app.supabase.com
# - Set admin email and password
```

### 3. Setup Database (1 min)
1. Open Supabase SQL Editor
2. Copy contents of `supabase-sessions-table.sql`
3. Execute the SQL script

### 4. Run the App (1 min)
```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 🔑 Default Credentials

**Admin Login:** `/admin/login`
- Email: `admin@brightstarfitness.com`
- Password: `admin123`

⚠️ **IMPORTANT:** Change these in `.env.local` before production!

---

## 📍 Key URLs

| Page | URL | Description |
|------|-----|-------------|
| **Home** | `/` | Landing page |
| **Admin Login** | `/admin/login` | Admin authentication |
| **Admin Dashboard** | `/admin` | Admin panel |
| **User Dashboard** | `/dashboard/[slug]` | User personal page |

---

## 🔧 Common Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Maintenance
npm run lint         # Run linter
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] App loads at http://localhost:3000
- [ ] No console errors
- [ ] Admin login works at `/admin/login`
- [ ] Can access admin dashboard
- [ ] User registration form works
- [ ] Database tables exist in Supabase

---

## 🐛 Quick Troubleshooting

**Server won't start?**
```bash
chmod +x node_modules/.bin/next
npm run dev
```

**Database errors?**
- Check `.env.local` has correct Supabase credentials
- Verify SQL script was executed in Supabase

**Admin login fails?**
- Clear browser cookies
- Check `.env.local` for ADMIN_EMAIL and ADMIN_PASSWORD
- Verify you're using correct credentials

**Build errors?**
```bash
rm -rf .next
npm install
npm run build
```

---

## 📚 Documentation

- **Full Setup:** See `README.md`
- **Security Info:** See `SECURITY_FIXES.md`
- **Complete Analysis:** See `PROJECT_ANALYSIS.md`

---

## 🎯 Next Steps

1. ✅ Get app running locally
2. ✅ Test all features
3. ✅ Change admin credentials
4. ✅ Configure production environment
5. ✅ Deploy to Vercel

---

**Need Help?** Check the full README.md for detailed instructions.

**Ready for Production?** See SECURITY_FIXES.md for deployment checklist.
