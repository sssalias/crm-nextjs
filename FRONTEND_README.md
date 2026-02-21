# CRM System - Complete Frontend

Complete React/Next.js frontend for the CRM system with full role-based access control and business logic implementation.

## 🎯 Features

### Authentication
- **Register/Login** - User account creation and authentication
- **Session Management** - JWT-based authentication with httpOnly cookies
- **Logout** - Secure session termination
- **Role-Based Access Control** - OPERATOR, MASTER, CLIENT, ADMIN roles

### Navigation & Layout
- **Role-Based Sidebar** - Dynamic navigation based on user role
- **Dashboard** - Home page with stats and quick actions
- **Not Found Page** - 404 error handling

### Shift Management (OPERATOR/ADMIN only)
- **View Shifts** - List active and past shifts
- **Open Shift** - Start a new work shift
- **Close Shift** - End work shift
- **Shift Status Display** - Active shift indicator on dashboard

### Order Management
- **Create Order** - Create new orders (OPERATOR/ADMIN)
  - Client selection
  - Service selection with pricing
  - Optional master assignment
  - Date/time scheduling
  - Discount and extra work fields
  - Real-time price calculation
  
- **Order List** - View all orders with advanced filtering
  - Filter by status (CREATED, IN_PROGRESS, COMPLETED, CANCELLED)
  - Filter by master ID
  - Filter by date range
  - Status color-coding
  - Quick order detail access
  
- **Order Details** - Full order management view
  - Order information
  - Financial details (price breakdown, paid amount, remaining)
  - Status-based action buttons
  - Master transition (CREATED → IN_PROGRESS)
  - Completion with optional comments
  - Cancellation with reason tracking
  - Payment recording and history
  
- **My Orders** - Role-specific order views
  - MASTER: View assigned orders grouped by status
  - CLIENT: View submitted orders with progress tracking

### Financial Features
- **Price Snapshot** - Capture service price at order creation
- **Discount Application** - Apply discounts to orders
- **Extra Work Tracking** - Add additional charges beyond service price
- **Partial Payments** - Record multiple payments against an order
- **Payment History** - View all payment operations with timestamps
- **Final Price Calculation** - Dynamic calculation: servicePrice + extraWork - discount

### Role-Specific Pages

#### OPERATOR / ADMIN
- Dashboard with shift status and order stats
- Shift management (open/close)
- Create new orders
- View all orders with advanced filtering
- Complete/cancel orders (if open shift)
- Record payments
- Order details and operations log

#### MASTER
- Dashboard showing assigned orders
- View my orders (filtered by masterId)
- Mark orders as in-progress (when status = CREATED)
- Complete orders and add completion comments
- View payment history

#### CLIENT
- Dashboard showing submitted orders
- View my orders (filtered by clientId)
- Track order status and pricing
- Monitor payment progress

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/              # Authentication endpoints
│   │   ├── orders/            # Order CRUD and operations
│   │   ├── shifts/            # Shift management
│   │   ├── services/          # Service catalog
│   │   ├── users/             # User listing (for dropdowns)
│   │   └── seed/              # Database seeding with demo data
│   ├── dashboard/             # Main dashboard page
│   ├── login/                 # Login page
│   ├── register/              # Registration page
│   ├── orders/
│   │   ├── page.tsx           # Order list with filters
│   │   ├── new/page.tsx       # Create order form
│   │   └── [id]/page.tsx      # Order detail view
│   ├── my-orders/             # Role-specific order views
│   ├── shifts/                # Shift management UI
│   ├── layout.tsx             # Root layout
│   ├── not-found.tsx          # 404 page
│   └── globals.css            # Global styles
├── components/
│   └── layout/
│       └── LayoutClient.tsx   # Main layout wrapper
├── hooks/
│   ├── useUser.ts             # Current user authentication hook
│   └── useFetch.ts            # Generic data fetching hook
├── lib/
│   ├── auth.ts                # Password hashing and JWT
│   ├── session.ts             # Session parsing and validation
│   └── guards.ts              # Route-level access control
├── entities/                  # TypeORM entity definitions
└── db/
    └── data-source.ts         # Database configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Seed the database** (optional, creates demo users and services)
```bash
curl -X POST http://localhost:3000/api/seed
```

Demo credentials:
- **Operator**: +1234567890 / password123
- **Master**: +1987654321 / password123
- **Client**: +1111222333 / password123

### Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## 🔐 Authentication Flow

1. User visits `/login` or `/register`
2. Submits credentials to `/api/auth/login` or `/api/auth/register`
3. Server returns JWT token in httpOnly cookie
4. Token automatically included in all subsequent requests
5. On page load, `/api/auth/me` validates session
6. User redirected based on authentication status

## 🎨 UI/UX Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Color-Coded Status** - Visual status indicators
  - Yellow: CREATED
  - Blue: IN_PROGRESS
  - Green: COMPLETED
  - Red: CANCELLED
- **Form Validation** - Client-side validation for data integrity
- **Loading States** - Loading indicators during async operations
- **Error Handling** - User-friendly error messages
- **Success Feedback** - Confirmation messages after operations

## 📊 Data Types

### User
```typescript
{
  id: number
  fullName: string
  phone: string
  role: 'OPERATOR' | 'MASTER' | 'CLIENT' | 'ADMIN'
  experienceYears?: number    // MASTER only
  specialization?: string     // MASTER only
}
```

### Order
```typescript
{
  id: number
  clientId: number
  serviceId: number
  masterId?: number
  operatorId: number
  scheduledAt: string
  status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  servicePrice: number        // cents
  discount: number            // cents
  extraWork: number           // cents
  paidAmount: number          // cents
  completionComment?: string
  finalPrice?: number         // computed
}
```

### Shift
```typescript
{
  id: number
  operatorId: number
  openedAt: string
  closedAt?: string
  isClosed: boolean
}
```

## 🔗 API Endpoints Used

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/logout` - Clear session cookie
- `GET /api/auth/me` - Get current user info

### Orders
- `GET /api/orders` - List orders with optional filters (status, masterId, operatorId, dateFrom, dateTo)
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order details
- `PATCH /api/orders/[id]` - Update order
- `POST /api/orders/[id]/cancel` - Cancel order
- `POST /api/orders/[id]/in-progress` - Mark order as in progress
- `POST /api/orders/[id]/complete` - Complete order
- `POST /api/orders/[id]/pay` - Record payment

### Shifts
- `GET /api/shifts` - List user's shifts
- `POST /api/shifts/open` - Open new shift
- `POST /api/shifts/close` - Close active shift

### Supporting
- `GET /api/services` - List available services
- `GET /api/users?role=MASTER` - List masters
- `GET /api/users?role=CLIENT` - List clients
- `POST /api/seed` - Seed database with demo data

## 🛡️ Security Features

1. **httpOnly Cookies** - JWT tokens stored securely, inaccessible to JavaScript
2. **CSRF Protection** - POST requests validated via credentials header
3. **Password Hashing** - bcryptjs with 10 salt rounds
4. **Role-Based Access** - Backend validates user roles before operations
5. **Rate Limiting** - (Can be implemented in production)
6. **Input Validation** - Server-side validation on all routes

## 🔧 Troubleshooting

### Database Not Initializing
```bash
# Check if database.sqlite exists in project root
# Delete and reseed if corrupted
npm run dev
curl -X POST http://localhost:3000/api/seed
```

### Login Issues
- Ensure database is seeded with test users
- Clear browser cookies if token is invalid
- Check browser console for error messages

### Orders Not Showing
- Verify shift is open (required for operator actions)
- Check user role matches expected access level
- Ensure order dates are in proper format

## 📚 Tech Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript
- **Database**: TypeORM + SQLite
- **Styling**: Tailwind CSS
- **Authentication**: JWT + httpOnly Cookies
- **Password Security**: bcryptjs

## 📈 Performance Optimizations

- **Code Splitting** - Page-level splitting via Next.js
- **Image Optimization** - Built-in Next.js image optimization
- **Lazy Evaluation** - Decorators and imports optimized to avoid circular deps
- **Efficient Queries** - QueryBuilder for filtered data fetching

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeORM Documentation](https://typeorm.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Status**: Complete frontend implementation with all business logic and role-based features fully integrated. Ready for production deployment.
