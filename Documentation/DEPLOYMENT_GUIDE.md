# Deployment Guide - Platform-Specific Instructions

## 🚀 Vercel

### Step 1: Prepare Your Project

```bash
# Ensure vercel.json exists
# Add build configuration for server
```

**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Step 2: Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
NODE_ENV=production
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=nfl_pool
JWT_SECRET=your_jwt_secret_min_32_chars
REFRESH_TOKEN_SECRET=your_refresh_secret_min_32_chars
ADMIN_USERNAME=nfl_admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!
```

### Step 3: Deploy

```bash
vercel --prod
```

### Step 4: Post-Deployment

1. Visit your deployment URL
2. Login with admin credentials
3. Test functionality
4. Optionally remove `ADMIN_PASSWORD` from env vars

---

## 🟣 Heroku

### Step 1: Create Heroku App

```bash
heroku create nfl-pool-app
```

### Step 2: Add MySQL Database

```bash
# Option 1: ClearDB (MySQL addon)
heroku addons:create cleardb:ignite

# Get database credentials
heroku config:get CLEARDB_DATABASE_URL
# Format: mysql://user:password@host/database

# Option 2: JawsDB
heroku addons:create jawsdb:kitefin
```

### Step 3: Set Environment Variables

```bash
# Parse database URL and set individually
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=your_host
heroku config:set DB_USER=your_user
heroku config:set DB_PASSWORD=your_password
heroku config:set DB_NAME=your_database
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)
heroku config:set ADMIN_USERNAME=nfl_admin
heroku config:set ADMIN_EMAIL=admin@yourdomain.com
heroku config:set ADMIN_PASSWORD=YourSecurePassword123!
```

### Step 4: Configure Buildpacks

```bash
heroku buildpacks:set heroku/nodejs
```

### Step 5: Add Procfile

**Procfile:**
```
web: node server/server.js
release: node server/setup.js
```

### Step 6: Deploy

```bash
git push heroku main
```

### Step 7: Check Logs

```bash
heroku logs --tail
```

---

## 🚂 Railway

### Step 1: Create New Project

1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository

### Step 2: Add MySQL Database

1. Click "New" → "Database" → "MySQL"
2. Railway will automatically create and link database
3. Connection details available in "Variables" tab

### Step 3: Set Environment Variables

In your service → Variables tab:

```
NODE_ENV=production
ADMIN_USERNAME=nfl_admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!
JWT_SECRET=your_jwt_secret_min_32_chars
REFRESH_TOKEN_SECRET=your_refresh_secret_min_32_chars
```

**Note:** Database variables (DB_HOST, DB_USER, etc.) are automatically set by Railway.

### Step 4: Configure Start Command

In Settings → Deploy:
```
npm run start:prod
```

### Step 5: Deploy

1. Push to GitHub
2. Railway auto-deploys

---

## 🐳 Docker

### Step 1: Create Dockerfile

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 5000

# Setup and start
CMD ["sh", "-c", "node server/setup.js && node server/server.js"]
```

### Step 2: Create docker-compose.yml

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: nfl_pool
      MYSQL_USER: nfluser
      MYSQL_PASSWORD: nflpassword
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      DB_HOST: db
      DB_USER: nfluser
      DB_PASSWORD: nflpassword
      DB_NAME: nfl_pool
      JWT_SECRET: your_jwt_secret_here_min_32_chars
      REFRESH_TOKEN_SECRET: your_refresh_secret_here_min_32_chars
      ADMIN_USERNAME: nfl_admin
      ADMIN_EMAIL: admin@nflpool.com
      ADMIN_PASSWORD: YourSecurePassword123!
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

volumes:
  mysql_data:
```

### Step 3: Create .dockerignore

**.dockerignore:**
```
node_modules
.git
.env
.env.local
.env.production
npm-debug.log
dist
.DS_Store
```

### Step 4: Build and Run

```bash
# Build and start
docker-compose up -d

# Check logs
docker-compose logs -f app

# Stop
docker-compose down
```

---

## ☁️ AWS (EC2 + RDS)

### Step 1: Create RDS MySQL Instance

1. Go to AWS RDS Console
2. Create MySQL database
3. Note: endpoint, username, password, database name

### Step 2: Create EC2 Instance

1. Launch Ubuntu 22.04 LTS instance
2. Configure security group:
   - Allow SSH (port 22)
   - Allow HTTP (port 80)
   - Allow HTTPS (port 443)
   - Allow app port (port 5000)

### Step 3: SSH and Setup

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install nginx (optional, for reverse proxy)
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

### Step 4: Deploy Application

```bash
# Clone repository
git clone your-repo-url
cd 603E_Pool

# Create .env file
nano .env
```

**. env content:**
```bash
NODE_ENV=production
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=your_rds_password
DB_NAME=nfl_pool
JWT_SECRET=your_jwt_secret_min_32_chars
REFRESH_TOKEN_SECRET=your_refresh_secret_min_32_chars
ADMIN_USERNAME=nfl_admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!
PORT=5000
```

```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Run setup
npm run setup

# Start with PM2
pm2 start server/server.js --name nfl-pool
pm2 save
pm2 startup
```

### Step 5: Configure Nginx (Optional)

```bash
sudo nano /etc/nginx/sites-available/nfl-pool
```

**nginx config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/nfl-pool /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🌐 DigitalOcean App Platform

### Step 1: Create New App

1. Go to DigitalOcean App Platform
2. Click "Create App"
3. Connect GitHub repository

### Step 2: Add Managed Database

1. Add component → Database → MySQL
2. Note connection details

### Step 3: Configure Environment Variables

In App → Settings → Environment Variables:

```
NODE_ENV=production
ADMIN_USERNAME=nfl_admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!
JWT_SECRET=your_jwt_secret_min_32_chars
REFRESH_TOKEN_SECRET=your_refresh_secret_min_32_chars
```

### Step 4: Configure Build & Run

**Build Command:**
```
npm install && npm run build
```

**Run Command:**
```
node server/setup.js && node server/server.js
```

### Step 5: Deploy

Click "Deploy" and wait for build to complete.

---

## 🔧 Post-Deployment Checklist

### For All Platforms

- [ ] Database connection successful
- [ ] Admin user created
- [ ] Can login with admin credentials
- [ ] HTTPS is working
- [ ] All API endpoints responding
- [ ] Frontend loads correctly
- [ ] Create test user and pool
- [ ] Test pick submission
- [ ] Check error logs
- [ ] Verify email functionality (if configured)
- [ ] Test password reset flow
- [ ] Monitor resource usage

### Security Steps

- [ ] Change admin password from deployment credentials
- [ ] Remove ADMIN_PASSWORD from environment variables (optional)
- [ ] Enable firewall rules
- [ ] Configure rate limiting
- [ ] Set up monitoring/alerting
- [ ] Enable backup strategy
- [ ] Test backup restoration
- [ ] Review access logs

### Performance Steps

- [ ] Enable gzip compression
- [ ] Configure CDN (if needed)
- [ ] Optimize database indexes
- [ ] Set up caching
- [ ] Monitor response times
- [ ] Load test the application

---

## 🆘 Troubleshooting

### Database Connection Failed

```bash
# Test connection manually
mysql -h your_host -u your_user -p your_database

# Check firewall rules allow connection
# Check database credentials are correct
# Verify database exists
```

### Admin Setup Failed

```bash
# Check logs for specific error
# Verify all ADMIN_* env vars are set
# Ensure password meets requirements
# Try running setup manually:
node server/setup.js
```

### Application Won't Start

```bash
# Check all required env vars are set
# Verify Node.js version (18+)
# Check port is not already in use
# Review application logs
```

### 502 Bad Gateway (nginx)

```bash
# Check application is running
pm2 status

# Check nginx config
sudo nginx -t

# View nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📚 Additional Resources

- [Node.js Deployment Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Need Help?** Open an issue on GitHub with:
- Platform name
- Error message
- Relevant logs
- Environment details