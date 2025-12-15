# Complete Folder Structure

```
teer-prediction-app/
│
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
├── next.config.ts                  # Next.js configuration
├── package.json                    # NPM dependencies and scripts
├── postcss.config.mjs              # PostCSS configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── middleware.ts                   # Route protection middleware
├── auth.ts                         # NextAuth.js core configuration
├── auth.config.ts                  # NextAuth.js provider configuration
├── README.md                       # Project documentation
├── DEPLOYMENT.md                   # Deployment guide
├── FOLDER_STRUCTURE.md            # This file
│
├── actions/                        # Server Actions (Next.js 15)
│   ├── admin/                     # Admin-only server actions
│   │   ├── houses.ts             # House CRUD operations
│   │   ├── results.ts            # Results management & bulk upload
│   │   ├── predictions.ts        # Prediction generation
│   │   ├── payment-methods.ts    # Payment method management
│   │   └── payments.ts           # Payment approval/rejection
│   ├── auth.ts                    # Authentication actions
│   └── subscription.ts            # User subscription actions
│
├── app/                           # Next.js App Router
│   ├── admin/                    # Admin Panel (Protected: ADMIN only)
│   │   ├── houses/              # House management
│   │   │   ├── new/
│   │   │   │   └── page.tsx     # Create new house
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx # Edit house
│   │   │   ├── house-actions.tsx # Client component for actions
│   │   │   └── page.tsx         # List all houses
│   │   ├── results/             # Results management
│   │   │   └── page.tsx         # Manage results
│   │   ├── predictions/         # Prediction management
│   │   │   └── page.tsx         # Generate predictions
│   │   ├── payment-methods/     # Payment QR/UPI management
│   │   │   └── page.tsx         # Manage payment methods
│   │   ├── payments/            # Payment approval
│   │   │   ├── payment-actions.tsx # Approve/reject actions
│   │   │   └── page.tsx         # List payments
│   │   ├── layout.tsx           # Admin layout with sidebar
│   │   └── page.tsx             # Admin dashboard
│   │
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts     # NextAuth.js API route
│   │   ├── packages/
│   │   │   └── route.ts         # Get subscription packages
│   │   └── payment-methods/
│   │       └── route.ts         # Get payment methods
│   │
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   │   └── page.tsx         # Login page
│   │   └── register/
│   │       └── page.tsx         # Registration page
│   │
│   ├── dashboard/                # User Dashboard (Protected)
│   │   ├── layout.tsx           # Dashboard layout
│   │   └── page.tsx             # Dashboard home
│   │
│   ├── predictions/              # Predictions page (Protected)
│   │   └── page.tsx             # View predictions
│   │
│   ├── results/                  # Results page (Public)
│   │   └── page.tsx             # View latest results
│   │
│   ├── subscription/             # Subscription page (Protected)
│   │   └── page.tsx             # Subscribe and payment
│   │
│   ├── error.tsx                 # Global error handler
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── not-found.tsx            # 404 page
│   └── page.tsx                  # Home page
│
├── components/                   # React Components
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── toast.tsx
│   ├── error-boundary.tsx       # Error boundary component
│   └── toaster.tsx              # Toast notification provider
│
├── lib/                          # Utility Libraries
│   ├── validations/             # Zod validation schemas
│   │   ├── admin.ts            # Admin input validation
│   │   ├── auth.ts             # Auth validation
│   │   └── user.ts             # User input validation
│   ├── errors.ts                # Custom error classes & handlers
│   ├── file-upload.ts           # File upload utilities
│   ├── predictions.ts           # Prediction algorithm (frequency analysis)
│   ├── prisma.ts                # Prisma client singleton
│   └── utils.ts                 # Helper functions (cn, formatDate, etc.)
│
├── prisma/                       # Prisma ORM
│   ├── schema.prisma            # Database schema definition
│   └── seed.ts                  # Database seeding script
│
├── public/                       # Static files
│   └── uploads/                 # File upload directory (gitignored)
│       ├── payment-qr/         # QR code images
│       ├── payment-proofs/     # Payment proof screenshots
│       └── csv/                # CSV uploads
│
├── scripts/                      # Utility scripts
│   └── generate-sample-csv.js  # Generate sample CSV for testing
│
└── types/                        # TypeScript type definitions
    └── next-auth.d.ts           # NextAuth.js type extensions
```

## Key Directories Explained

### `/actions`
Server Actions for form submissions and mutations. All contain robust error handling with try/catch and Zod validation.

### `/app`
Next.js 15 App Router structure:
- **admin/**: Protected admin-only routes
- **dashboard/**: Protected user routes
- **api/**: API endpoints
- **auth/**: Public authentication pages
- Routes are protected via middleware.ts

### `/components`
- **ui/**: shadcn/ui components (Button, Card, Input, etc.)
- Reusable React components with TypeScript

### `/lib`
Core business logic and utilities:
- **predictions.ts**: Frequency analysis algorithm
- **errors.ts**: Centralized error handling
- **file-upload.ts**: Secure file upload with validation
- **validations/**: Zod schemas for all inputs

### `/prisma`
Database management:
- **schema.prisma**: Complete database schema
- **seed.ts**: Initial data seeding

## File Upload Structure

```
public/uploads/
├── payment-qr/          # Admin uploads QR codes here
├── payment-proofs/      # Users upload payment screenshots here
└── csv/                 # CSV files for bulk upload
```

**Note**: The `uploads/` directory is in `.gitignore` and created automatically on first upload.

## Environment Files

- `.env.example`: Template for environment variables
- `.env`: Actual environment variables (gitignored)

## Configuration Files

- `next.config.ts`: Next.js configuration
- `tailwind.config.ts`: Tailwind CSS theme
- `tsconfig.json`: TypeScript compiler options
- `postcss.config.mjs`: PostCSS plugins
- `middleware.ts`: Route protection and authentication

## Database Schema (Prisma)

Models:
- User (with roles: USER, ADMIN)
- House (Teer houses)
- Result (daily results)
- Prediction (generated predictions)
- SubscriptionPackage (pricing plans)
- Subscription (user subscriptions)
- PaymentMethod (QR codes, UPI)
- Payment (payment records with proofs)

## Authentication Flow

1. User registers/logs in → `/app/auth/`
2. NextAuth.js handles authentication → `/auth.ts`, `/auth.config.ts`
3. Session stored in JWT
4. Middleware protects routes → `/middleware.ts`
5. Role-based access (USER/ADMIN)

## Payment Flow

1. User selects package → `/app/subscription/`
2. Views QR code, makes payment
3. Uploads proof image
4. Redirects to WhatsApp
5. Admin reviews → `/app/admin/payments/`
6. Admin approves/rejects
7. Subscription activated on approval

## Prediction Generation Flow

1. Admin uploads results (CSV or manual) → `/app/admin/results/`
2. System stores in database
3. Admin generates predictions → `/app/admin/predictions/`
4. Algorithm analyzes last 30 days → `/lib/predictions.ts`
5. Predictions stored and displayed to subscribers

## Error Handling Chain

1. Zod validates input → `/lib/validations/`
2. Try/catch in server actions → `/actions/`
3. Custom error classes → `/lib/errors.ts`
4. Error boundary catches React errors → `/components/error-boundary.tsx`
5. Global error handler → `/app/error.tsx`
6. Toast notifications → Sonner
