# Admin Setup Documentation

## Overview

The NFL Pool application now uses a secure admin setup system that eliminates hardcoded credentials and supports multiple setup methods.

## Setup Methods

### 1. Environment Variables (Recommended for Production)

Set the following environment variables in your `.env` file or hosting platform:

```bash
ADMIN_USERNAME=your_admin_username
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number

### 2. Interactive CLI (Development)

If no environment variables are set and you're in development mode, you'll be prompted to enter credentials interactively when the server starts:

```bash
npm start
```

You'll see:
```
==============================================
  NFL POOL - FIRST TIME ADMIN SETUP
==============================================

No admin user found. Please create the initial admin account.

Enter admin username: 
Enter admin email: 
Enter admin password: 
Confirm admin password: 
```

### 3. Standalone Setup Script

Run the setup script separately before starting the server:

```bash
node setup.js
```

## Security Features

### ✅ What's Secure Now

1. **No Hardcoded Credentials**: All default credentials removed from source code
2. **Environment-Based Config**: Credentials configured via environment variables
3. **Production Safety**: Interactive prompts disabled in production
4. **Conditional Logging**: Credentials only logged in development mode
5. **Password Validation**: Enforces strong password requirements
6. **Bcrypt Hashing**: Passwords hashed with bcrypt (cost factor 12)

### 🔒 Production Deployment

For production environments:

1. **MUST** set environment variables for admin credentials
2. Server will refuse to start if admin doesn't exist and no env vars provided
3. Credentials are never logged to console in production
4. Interactive prompts are disabled

**Example Production .env:**
```bash
NODE_ENV=production
ADMIN_USERNAME=nfl_admin
ADMIN_EMAIL=admin@nflpool.com
ADMIN_PASSWORD=MyVerySecurePassword123!
```

## Deployment Platforms

### Vercel

Add environment variables in the Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
3. Deploy

### Heroku

```bash
heroku config:set ADMIN_USERNAME=nfl_admin
heroku config:set ADMIN_EMAIL=admin@nflpool.com
heroku config:set ADMIN_PASSWORD=YourSecurePassword123!
```

### Docker

In your `docker-compose.yml`:
```yaml
services:
  nfl-pool:
    environment:
      - ADMIN_USERNAME=nfl_admin
      - ADMIN_EMAIL=admin@nflpool.com
      - ADMIN_PASSWORD=YourSecurePassword123!
```

Or use a `.env` file:
```bash
docker run --env-file .env nfl-pool
```

### Railway

Add environment variables in Railway dashboard:
1. Select your project
2. Go to Variables tab
3. Add `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`

## First Time Setup

### Development Environment

1. Clone the repository
2. Copy `.env.example` to `.env`
3. Configure database settings
4. Choose ONE of these options:

**Option A: Set admin credentials in .env**
```bash
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@localhost.com
ADMIN_PASSWORD=DevPassword123!
```

**Option B: Use interactive setup**
- Don't set admin env vars
- Run `npm start` or `node setup.js`
- Follow the prompts

### Production Environment

1. Set environment variables on your hosting platform
2. Ensure `NODE_ENV=production` is set
3. Deploy your application
4. Admin will be created automatically on first run

## Troubleshooting

### Error: "Admin credentials must be provided via environment variables in production"

**Solution**: Set `ADMIN_USERNAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` environment variables in your production environment.

### Error: "Password does not meet security requirements"

**Solution**: Ensure your password has:
- At least 8 characters
- One uppercase letter
- One lowercase letter
- One number

### Error: "Cannot prompt for admin credentials (non-interactive mode)"

**Solution**: You're running in a non-interactive environment (CI/CD, Docker, etc.). Set environment variables instead.

### Admin Already Exists

If an admin user already exists, the setup will skip creation and show:
```
✅ Admin user already exists
```

## Changing Admin Password

After initial setup, change the admin password through:

1. **Web Interface**: Login → Profile → Change Password
2. **Database Direct**: Use bcrypt to hash a new password and update the database
3. **Create New Admin**: 
   - Login as existing admin
   - Create new admin user through admin panel
   - Delete old admin account

## Security Best Practices

1. ✅ **Change Default Credentials**: Always change from example passwords
2. ✅ **Use Strong Passwords**: Follow password requirements strictly
3. ✅ **Rotate Credentials**: Change admin passwords regularly
4. ✅ **Limit Admin Accounts**: Only create admin accounts as needed
5. ✅ **Monitor Access**: Review admin activity logs regularly
6. ✅ **Environment Variables**: Never commit `.env` file to version control
7. ✅ **HTTPS Only**: Always use HTTPS in production

## API Reference

### setupAdmin(pool)

Main function that orchestrates admin setup process.

**Parameters:**
- `pool` (Object): MySQL connection pool

**Returns:** Promise<void>

**Behavior:**
- Checks if admin exists
- Attempts to load credentials from environment variables
- Falls back to interactive prompt (dev only)
- Creates admin user with hashed password
- Logs credentials (dev only)

### createAdminUser(pool, credentials)

Creates admin user in database.

**Parameters:**
- `pool` (Object): MySQL connection pool
- `credentials` (Object): `{username, email, password}`

**Returns:** Promise<number> - Created user ID

### adminExists(pool)

Checks if any admin user exists in database.

**Parameters:**
- `pool` (Object): MySQL connection pool

**Returns:** Promise<boolean>

### promptAdminCredentials()

Interactive CLI for credential input.

**Returns:** Promise<Object> - `{username, email, password}`

**Throws:** Error if validation fails

### getAdminCredentialsFromEnv()

Loads and validates admin credentials from environment variables.

**Returns:** Object | null - Credentials or null if not found

**Throws:** Error if validation fails

## File Structure

```
server/
├── adminSetup.js       # Admin setup module
├── database.js         # Database initialization (calls adminSetup)
└── setup.js           # Standalone setup script
```

## Example Workflows

### Local Development - Interactive Setup

```bash
# 1. Clone and install
git clone <repo>
npm install

# 2. Configure database only
cp .env.example .env
# Edit .env - set DB_* variables only

# 3. Run setup
npm start
# Follow interactive prompts

# 4. Login with created credentials
```

### Local Development - Environment Variables

```bash
# 1. Clone and install
git clone <repo>
npm install

# 2. Configure everything
cp .env.example .env
# Edit .env - set DB_* and ADMIN_* variables

# 3. Run setup
npm start
# Admin created automatically

# 4. Login with .env credentials
```

### Production Deployment

```bash
# 1. Set environment variables on hosting platform
ADMIN_USERNAME=production_admin
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=SuperSecure123!
NODE_ENV=production

# 2. Deploy application
# Admin will be created on first run

# 3. Remove ADMIN_PASSWORD from environment variables (optional)
# Admin is already created, password no longer needed in env
```

### CI/CD Pipeline

```yaml
# Example GitHub Actions
- name: Setup Database
  env:
    DB_HOST: ${{ secrets.DB_HOST }}
    DB_USER: ${{ secrets.DB_USER }}
    DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
    ADMIN_USERNAME: ${{ secrets.ADMIN_USERNAME }}
    ADMIN_EMAIL: ${{ secrets.ADMIN_EMAIL }}
    ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
  run: node setup.js
```

## Migration from Old System

If you have an existing database with the old hardcoded admin:

```sql
-- Option 1: Keep existing admin (recommended)
-- No action needed, setup will detect existing admin

-- Option 2: Reset admin
DELETE FROM users WHERE role = 'admin';
-- Then run setup.js to create new admin

-- Option 3: Update existing admin password
UPDATE users 
SET password_hash = '$2a$12$NEW_HASH_HERE'
WHERE username = 'admin';
```

## FAQ

**Q: Can I skip admin setup?**  
A: No, the application requires at least one admin user to function properly.

**Q: Can I create multiple admins?**  
A: Yes, after initial setup, existing admins can create additional admin users through the admin panel.

**Q: What if I forget admin password?**  
A: Use the password reset feature, or manually update the password hash in the database.

**Q: Are credentials stored in logs?**  
A: Only in development mode. Production logs never contain credentials.

**Q: Can I automate admin creation in Docker?**  
A: Yes, set environment variables in your docker-compose.yml or Dockerfile.

## Support

For issues or questions:
1. Check this documentation
2. Review server logs
3. Check environment variable configuration
4. Verify database connectivity
5. Open an issue on GitHub