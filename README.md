# Teer Prediction Platform

A complete, production-ready Next.js 15 application for Teer predictions with admin panel, user subscriptions, and automated prediction generation.

## Features

### For Users
- 🆓 **Free Access**: View latest Teer results
- 📊 **Advanced Predictions**: AI-powered predictions based on 30-day frequency analysis
- 💳 **Flexible Subscriptions**: Multiple subscription packages (1-30 days)
- 📱 **WhatsApp Integration**: Easy communication for payment verification
- 🔒 **Secure Payments**: Manual verification with proof upload

### For Administrators
- 🏢 **House Management**: CRUD operations for Teer houses
- 📈 **Results Management**: Upload results individually or via CSV (30-day bulk upload)
- 🧠 **Auto-Predictions**: Generate predictions with frequency analysis
  - Common numbers (top 10 frequent)
  - Direct numbers (recent high-frequency)
  - House numbers (consistent patterns)
  - Ending numbers (last digit analysis)
  - Hot/Cold numbers (trending analysis)
- 💰 **Payment Management**: Approve/reject payments with proof images
- 🎯 **Payment Methods**: Configure payment QR codes and UPI details

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS + shadcn/ui
- **Validation**: Zod
- **Notifications**: Sonner (toast)
- **File Handling**: Built-in upload system
- **CSV Parsing**: PapaParse

## Project Structure

```
teer-prediction-app/
├── actions/                 # Server actions
│   ├── admin/              # Admin-only actions
│   │   ├── houses.ts
│   │   ├── results.ts
│   │   ├── predictions.ts
│   │   ├── payment-methods.ts
│   │   └── payments.ts
│   ├── auth.ts             # Authentication actions
│   └── subscription.ts     # User subscription actions
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel routes
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── predictions/       # Predictions page
│   ├── results/           # Results page
│   ├── subscription/      # Subscription page
│   ├── error.tsx          # Global error handler
│   ├── layout.tsx         # Root layout
│   ├── not-found.tsx      # 404 page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── error-boundary.tsx
│   └── toaster.tsx
├── lib/                   # Utility functions
│   ├── validations/      # Zod schemas
│   ├── errors.ts         # Error handling
│   ├── file-upload.ts    # File upload utilities
│   ├── predictions.ts    # Prediction algorithm
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
├── prisma/
│   └── schema.prisma     # Database schema
├── public/
│   └── uploads/          # File upload directory
├── types/
│   └── next-auth.d.ts    # TypeScript definitions
├── .env.example          # Environment variables template
├── middleware.ts         # Route protection
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MySQL database
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd teer-prediction-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
DATABASE_URL="mysql://user:password@localhost:3306/teer_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-32-char-string"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_WHATSAPP_NUMBER="919999999999"
```

4. **Generate NextAuth secret**
```bash
openssl rand -base64 32
```

5. **Set up database**
```bash
npx prisma migrate dev
npx prisma generate
```

6. **Seed initial data**
```bash
npx prisma db seed
```

7. **Run development server**
```bash
npm run dev
```

Visit http://localhost:3000

### Create Admin User

1. Register a new account via the UI
2. Connect to MySQL:
```bash
mysql -u root -p teer_db
```

3. Update user role:
```sql
UPDATE User SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

## Subscription Packages

Default packages (can be managed by admin):

| Package | Days | Price |
|---------|------|-------|
| 1 Day   | 1    | ₹29   |
| 3 Days  | 3    | ₹59   |
| 7 Days  | 7    | ₹149  |
| 15 Days | 15   | ₹249  |
| 30 Days | 30   | ₹399  |

## Prediction Algorithm

The system generates predictions using frequency analysis of the last 30 days:

1. **Common Numbers**: Top 10 most frequently appearing numbers
2. **Direct Numbers**: Recent high-frequency matches
3. **House Numbers**: Numbers with 15-40% appearance rate
4. **Ending Numbers**: Analysis of last digit patterns
5. **Hot Numbers**: Frequently appearing in last 7 days
6. **Cold Numbers**: Rarely appearing or overdue

## Error Handling

Comprehensive error handling throughout:

- ✅ Try/catch in all server actions
- ✅ Zod validation with user-friendly messages
- ✅ Toast notifications for success/errors
- ✅ Global error boundary
- ✅ Prisma error handling
- ✅ File upload validation
- ✅ Custom error classes

## API Routes

### Public
- `GET /api/packages` - Get active subscription packages
- `GET /api/payment-methods` - Get active payment methods

### Protected (Authenticated)
All pages under `/dashboard` require authentication

### Admin Only
All routes under `/admin` require admin role

## File Uploads

Supported file types:
- **Images**: JPEG, PNG, WebP (max 5MB)
- **CSV**: CSV files for bulk results upload

Upload directories:
- `public/uploads/payment-qr` - Payment QR codes
- `public/uploads/payment-proofs` - Payment proof screenshots
- `public/uploads/csv` - CSV files

## Database Schema

Key models:
- **User**: Authentication and user management
- **House**: Teer houses
- **Result**: Daily Teer results
- **Prediction**: Generated predictions
- **SubscriptionPackage**: Subscription plans
- **Subscription**: User subscriptions
- **PaymentMethod**: Payment QR codes and UPI
- **Payment**: Payment records and proofs

## Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Database operations
npx prisma migrate dev
npx prisma generate
npx prisma studio
npx prisma db seed
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for Hostinger Cloud Hosting.

Quick deployment checklist:
1. Set up MySQL database
2. Configure environment variables
3. Run database migrations
4. Build application
5. Start with PM2
6. Configure Nginx
7. Set up SSL

## CSV Upload Format

For bulk results upload, use this CSV format:

```csv
date,firstRound,secondRound
2024-01-01,45,67
2024-01-02,23,89
```

- **date**: YYYY-MM-DD format
- **firstRound**: 0-99 or empty
- **secondRound**: 0-99 or empty

## Security Features

- 🔐 Password hashing with bcrypt
- 🛡️ CSRF protection via NextAuth
- 🔒 SQL injection prevention via Prisma
- ✅ Input validation with Zod
- 📁 File upload restrictions
- 🚫 Role-based access control
- 🔑 Secure session management

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License

## Support

For issues or questions:
1. Check error logs in browser console
2. Review server logs: `pm2 logs teer-app`
3. Verify environment variables
4. Check database connection

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## Roadmap

- [ ] Email notifications for payment status
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Automated payment gateway integration
- [ ] Multi-language support
- [ ] Export predictions as PDF
