# Quick Start Guide - Admin Setup

## 🚀 For Development (Local)

### Option 1: Interactive Setup (Easiest)

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env - configure database only

# 2. Install dependencies
npm install

# 3. Run setup (will prompt for admin credentials)
npm run setup

# 4. Start the application
npm start
```

### Option 2: Environment Variables

```bash
# 1. Setup environment with admin credentials
cp .env.example .env
# Edit .env - configure database AND admin credentials:
# ADMIN_USERNAME=admin
# ADMIN_EMAIL=admin@localhost.com
# ADMIN_PASSWORD=DevPassword123!

# 2. Install and run
npm install
npm start
```

## 🌐 For Production

### Step 1: Set Environment Variables

On your hosting platform (Vercel, Heroku, Railway, etc.), set:

```bash
NODE_ENV=production
ADMIN_USERNAME=your_admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!

# Plus your other variables (DB, JWT, etc.)
```

### Step 2: Deploy

Deploy your application. Admin will be created automatically on first run.

### Step 3: Secure Your Credentials

After successful deployment, optionally remove `ADMIN_PASSWORD` from environment variables (admin is already created).

## ⚡ Common Commands

```bash
# Run database setup only
npm run setup

# Start development server
npm start

# Start production server
npm run start:prod

# Reset database (CAUTION: Deletes all data)
npm run db:reset
```

## 🔐 Password Requirements

Your admin password must have:
- ✅ At least 8 characters
- ✅ One uppercase letter (A-Z)
- ✅ One lowercase letter (a-z)
- ✅ One number (0-9)

**Good Examples:**
- `AdminPass123`
- `SecureP@ss2024`
- `MyNFLadmin99`

**Bad Examples:**
- `admin` (too short, no uppercase, no number)
- `password123` (no uppercase)
- `PASSWORD123` (no lowercase)
- `AdminPass` (no number)

## 🆘 Troubleshooting

### "Admin credentials must be provided via environment variables in production"

**Fix:** Set `ADMIN_USERNAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in your production environment variables.

### "Password does not meet security requirements"

**Fix:** Ensure your password meets all requirements listed above.

### "Database connection failed"

**Fix:** Check your database credentials in `.env`:
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nfl_pool
```

### Interactive prompt not working

**Fix:** Use environment variables instead:
```bash
export ADMIN_USERNAME=admin
export ADMIN_EMAIL=admin@localhost.com
export ADMIN_PASSWORD=DevPassword123!
npm run setup
```

## 📋 Checklist

Before deploying to production:

- [ ] Environment variables are set (including admin credentials)
- [ ] `NODE_ENV=production` is set
- [ ] Database is accessible from your server
- [ ] JWT secrets are set and secure
- [ ] Admin password is strong and unique
- [ ] `.env` file is NOT committed to git
- [ ] CORS origin is configured correctly

## 🎯 Next Steps

After setup:

1. **Login**: Use your admin credentials to login
2. **Change Password**: Go to Profile → Change Password
3. **Create Pools**: Navigate to Admin → Create Pool
4. **Add Games**: Add games to your pools
5. **Invite Users**: Share registration link with users

## 📚 More Information

- Full documentation: `ADMIN_SETUP.md`
- Environment variables: `.env.example`
- Support: Open an issue on GitHub