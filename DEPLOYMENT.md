# Deployment Guide for Hostinger Cloud Hosting

This guide will help you deploy the Teer Prediction application to Hostinger Cloud Hosting.

## Prerequisites

- Hostinger Cloud Hosting account
- Node.js 18+ installed on server
- MySQL database (provided by Hostinger)
- SSH access to your server

## Step 1: Prepare Your Server

### 1.1 Connect via SSH
```bash
ssh username@your-server-ip
```

### 1.2 Install Node.js (if not installed)
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 1.3 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

## Step 2: Set Up MySQL Database

### 2.1 Create Database
1. Log in to your Hostinger hPanel
2. Go to "Databases" → "MySQL Databases"
3. Create a new database (e.g., `teer_db`)
4. Create a database user and password
5. Note down the connection details

### 2.2 Get Database Connection String
```
mysql://username:password@localhost:3306/database_name
```

## Step 3: Upload Application Files

### 3.1 Using Git (Recommended)
```bash
# Navigate to your web directory
cd /home/username/domains/yourdomain.com/public_html

# Clone your repository
git clone https://github.com/yourusername/teer-prediction.git .

# Or upload files via FTP/SFTP
```

### 3.2 Install Dependencies
```bash
npm install
```

## Step 4: Configure Environment Variables

### 4.1 Create .env file
```bash
nano .env
```

### 4.2 Add Environment Variables
```env
# Database
DATABASE_URL="mysql://db_user:db_password@localhost:3306/teer_db"

# NextAuth - CRITICAL: Change these!
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-super-secret-key-min-32-characters-change-this-in-production"

# App Settings
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_WHATSAPP_NUMBER="919999999999"
NEXT_PUBLIC_WHATSAPP_MESSAGE="Hello, I have completed payment for Teer predictions subscription."

# File Upload Settings
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
ALLOWED_CSV_TYPES=text/csv,application/vnd.ms-excel
```

**IMPORTANT**: Generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## Step 5: Set Up Database

### 5.1 Run Prisma Migrations
```bash
npx prisma migrate deploy
npx prisma generate
```

### 5.2 Seed Initial Data
```bash
npx prisma db seed
```

## Step 6: Build Application

```bash
npm run build
```

## Step 7: Start Application with PM2

### 7.1 Start the Application
```bash
pm2 start npm --name "teer-app" -- start
```

### 7.2 Configure PM2 to Start on Reboot
```bash
pm2 startup
pm2 save
```

### 7.3 Useful PM2 Commands
```bash
# View application status
pm2 status

# View logs
pm2 logs teer-app

# Restart application
pm2 restart teer-app

# Stop application
pm2 stop teer-app

# Monitor
pm2 monit
```

## Step 8: Configure Nginx (if using)

### 8.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/teer-app
```

### 8.2 Add Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 8.3 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/teer-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 9: Set Up SSL Certificate

### 9.1 Install Certbot
```bash
sudo apt-get install certbot python3-certbot-nginx
```

### 9.2 Obtain SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 9.3 Auto-renewal
```bash
sudo certbot renew --dry-run
```

## Step 10: Create Admin User

### 10.1 Access MySQL
```bash
mysql -u your_username -p your_database
```

### 10.2 Create Admin Account
```sql
-- First, register via the app, then update role
UPDATE User SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

## Step 11: File Upload Directory

### 11.1 Create Upload Directories
```bash
mkdir -p public/uploads/payment-qr
mkdir -p public/uploads/payment-proofs
mkdir -p public/uploads/csv
chmod -R 755 public/uploads
```

## Step 12: Set Up Cron Jobs (Optional)

For automated prediction generation:

```bash
crontab -e
```

Add:
```cron
# Generate predictions daily at 12:00 AM
0 0 * * * cd /path/to/app && node scripts/generate-predictions.js
```

## Troubleshooting

### Application Not Starting
1. Check PM2 logs: `pm2 logs teer-app`
2. Verify .env file exists and is correct
3. Check Node.js version: `node --version`
4. Ensure all dependencies are installed: `npm install`

### Database Connection Issues
1. Verify DATABASE_URL in .env
2. Check MySQL service: `sudo systemctl status mysql`
3. Test database connection manually

### File Upload Issues
1. Check directory permissions: `ls -la public/uploads`
2. Verify MAX_FILE_SIZE in .env
3. Check nginx/apache upload limits

### 500 Internal Server Error
1. Check application logs: `pm2 logs teer-app`
2. Verify environment variables
3. Check file permissions

## Maintenance

### Update Application
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Run migrations
npx prisma migrate deploy

# Rebuild
npm run build

# Restart application
pm2 restart teer-app
```

### Backup Database
```bash
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql
```

### Monitor Application
```bash
# CPU and Memory usage
pm2 monit

# View logs
pm2 logs teer-app --lines 100
```

## Performance Optimization

### 1. Enable Compression
Already configured in Next.js

### 2. Database Optimization
```sql
-- Add indexes (already in schema)
-- Regular cleanup of old data if needed
DELETE FROM Result WHERE date < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

### 3. PM2 Cluster Mode
```bash
pm2 start npm --name "teer-app" -i max -- start
```

## Security Checklist

- ✅ Strong NEXTAUTH_SECRET generated
- ✅ Database credentials secured
- ✅ SSL certificate installed
- ✅ File upload validation enabled
- ✅ Environment variables not committed to git
- ✅ Regular backups scheduled
- ✅ Firewall configured
- ✅ Regular security updates

## Support

For issues specific to:
- **Hostinger**: Contact Hostinger support
- **Application**: Check application logs and error messages
- **Database**: Verify connection and credentials

## Quick Reference

```bash
# Start app
pm2 start teer-app

# Stop app
pm2 stop teer-app

# Restart app
pm2 restart teer-app

# View logs
pm2 logs teer-app

# Update app
git pull && npm install && npm run build && pm2 restart teer-app

# Database backup
mysqldump -u user -p database > backup.sql
```
