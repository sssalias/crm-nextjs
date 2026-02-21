# CRM System - Frontend & Full Documentation

## 📋 Overview

This is a complete Customer Relationship Management (CRM) system built with Next.js 16+ and TypeORM with SQLite database. It includes role-based access control, shift management, order lifecycle management, and financial tracking.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (with npm or yarn)
- SQLite3

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Initialize the database:**
   ```bash
   npx ts-node -P tsconfig.json src/db/data-source.ts
   ```

3. **Seed demo data:**
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Visit `http://localhost:3000`

## 🔐 Demo Credentials

After seeding, use these credentials to test:

### Operator
- **Phone:** +1234567890
- **Password:** password123
- **Permissions:** Open shifts, create/edit/complete orders, record payments

### Master 1
- **Phone:** +1987654321
- **Password:** password123
- **Specialization:** Oil changes and maintenance
- **Permissions:** Mark orders as in progress, complete assigned orders

### Master 2
- **Phone:** +1555666777
- **Password:** password123
- **Specialization:** Tire and brake service
- **Permissions:** Mark orders as in progress, complete assigned orders

### Client
- **Phone:** +1111222333
- **Password:** password123
- **Permissions:** View own orders

---

## 🏗️ Architecture

### Frontend Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with LayoutClient wrapper
│   ├── globals.css              # Global styles
│   ├── page.tsx                 # Home/landing page
│   ├── login/page.tsx           # Login page
│   ├── register/page.tsx        # Registration page
│   ├── dashboard/page.tsx       # Role-based dashboard
│   ├── shifts/page.tsx          # Shift management (operator only)
│   ├── orders/
│   │   ├── page.tsx             # Orders list with filters
│   │   ├── new/page.tsx         # Create new order (operator only)
│   │   └── [id]/page.tsx        # Order detail & actions
│   ├── my-orders/page.tsx       # User's own orders (master/client)
│   └── api/                     # Backend API routes
│       ├── auth/                # Authentication routes
│       ├── shifts/              # Shift management routes
│       ├── orders/              # Order management routes
│       ├── services/            # Service catalog routes
│       ├── users/               # User management routes
│       └── seed/                # Database seeding route
├── components/
│   └── layout/
│       └── LayoutClient.tsx     # Client-side layout wrapper with auth checking
├── hooks/
│   ├── useUser.ts              # Hook to fetch current user
│   └── useFetch.ts             # Generic data fetching hook
├── lib/
│   ├── auth.ts                 # Authentication utilities (hash, verify, tokens)
│   ├── session.ts              # Session management (get current user)
│   └── guards.ts               # Authorization guards
├── db/
│   └── data-source.ts          # TypeORM database configuration
└── entities/                    # Database entities
    ├── User.ts                 # User model (with roles: OPERATOR, MASTER, CLIENT, ADMIN)
    ├── Service.ts              # Service catalog
    ├── MasterService.ts        # Master ↔ Service relationship
    ├── Order.ts                # Order model (with status & financial fields)
    ├── Shift.ts                # Operator shift tracking
    └── ShiftLog.ts             # Shift event audit log
```

### Technology Stack

- **Frontend Framework:** Next.js 16.1.6 (App Router)
- **React Version:** 19.2.3
- **Language:** TypeScript
- **Database:** SQLite3 with TypeORM 0.3.18
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Styling:** Tailwind CSS

---

## 🔏 Authentication Flow

1. **Register** → New user created as CLIENT role (default)
   - `POST /api/auth/register`
   - Body: `{ fullName, phone, password }`

2. **Login** → JWT token stored in httpOnly cookie
   - `POST /api/auth/login`
   - Body: `{ phone, password }`
   - Returns: `{ user, success: true }`

3. **Dashboard Access** → LayoutClient checks user via `/api/auth/me`
   - GET request to `/api/auth/me`
   - Returns: `{ user }` or `{ user: null }`

4. **Logout** → Cookie cleared
   - `POST /api/auth/logout`

## 👥 Roles & Permissions

### OPERATOR
- **Access:** Assigned routes (dashboard, shifts, orders)
- **Capabilities:**
  - ✅ Open/close shifts (must have open shift before creating orders)
  - ✅ Create orders (requires open shift)
  - ✅ Edit orders (only `CREATED` status)
  - ✅ Assign masters (must support the service)
  - ✅ Cancel orders
  - ✅ Record payments (partial or full)
  - ✅ Complete orders
  - ✅ View all orders with advanced filters
  - ❌ Cannot mark own orders as in progress

### MASTER
- **Access:** Dashboard, my-orders
- **Capabilities:**
  - ✅ View assigned orders
  - ✅ Mark order status to IN_PROGRESS
  - ✅ Complete assigned orders (transition IN_PROGRESS → COMPLETED)
  - ❌ Cannot create/edit/cancel orders
  - ❌ Cannot record payments (only operator can)

### CLIENT
- **Access:** Dashboard, my-orders
- **Capabilities:**
  - ✅ View own orders only
  - ❌ No write permissions

### ADMIN
- **Access:** Same as OPERATOR
- **Future:** Additional admin-only routes (user management, reporting)

---

## 📋 Pages & Features

### 1. **Login Page** (`/login`)
- Phone number and password authentication
- Redirect to dashboard on success
- Link to register page

### 2. **Register Page** (`/register`)
- Create new account (default role: CLIENT)
- Full name, phone, password
- Validation: passwords must match, min 6 chars
- Redirect to dashboard on success

### 3. **Dashboard** (`/dashboard`)
**Operator/Admin:**
- ✅ Active shift status card (or "Open Shift" button)
- ✅ Quick stats: total orders, completed orders, revenue
- ✅ Quick links: Create Order, View All Orders

**Master:**
- ✅ My assignments count
- ✅ Quick link to view assignments

**Client:**
- ✅ My orders count
- ✅ Quick link to view orders

**All Roles:**
- ✅ Recent orders table with quick view links

### 4. **Shift Management** (`/shifts`)
**Operator Only**
- ✅ Active shift card with open time
- ✅ Button to close shift (if active)
- ✅ Button to open new shift (if no active)
- ✅ History of previous shifts
- ✅ Error handling for constraints (e.g., one active shift per operator)

### 5. **Orders List** (`/orders`)
**All Users (Scoped by Role)**
- ✅ Operators: See all orders
- ✅ Masters: See assigned orders only
- ✅ Clients: See own orders only

**Filter Options:**
- Status: CREATED, IN_PROGRESS, COMPLETED, CANCELLED
- Master ID filter
- Date range (from/to)

**Table Display:**
- Order ID, Client, Service, Master, Date, Price, Paid, Status
- View action link to detail page

### 6. **Create Order** (`/orders/new`)
**Operator Only**
- ✅ Client selector (dropdown)
- ✅ Service selector with price display
- ✅ Master selector (optional, filtered by service support)
- ✅ Scheduled date/time picker
- ✅ Discount field (optional)
- ✅ Extra work field (optional)
- ✅ Price summary preview
- ✅ Form validation & error messages
- ✅ Redirect to order detail on success

### 7. **Order Detail** (`/orders/[id]`)
**All Authorized Users**

**Information Tab:**
- Order ID, status, scheduled date
- Client info (name + phone)
- Service name
- Master & operator assigned

**Financial Details:**
- Service price (snapshot)
- Discount amount
- Extra work amount
- Final price calculation
- Paid amount & remaining balance

**Actions (Based on Role & Status):**
- **Operator (CREATED → IN_PROGRESS):** Can cancel
- **Operator (IN_PROGRESS):** Can complete, record payment
- **Master (CREATED):** Can mark as IN_PROGRESS
- **Master (IN_PROGRESS):** Can complete

**Payment Form:**
- Shows remaining amount
- Input for payment amount
- Records as OrderOperation (audit trail)

**Operations Log:**
- All PAYMENT and CANCELLATION operations
- Amount, reason, timestamp, who performed it

### 8. **My Orders** (`/my-orders`)
**Masters & Clients Only**
- Status filter
- Table of user's orders
- View link to detail page
- (Masters see assigned orders, Clients see their own orders)

### 9. **Navigation Sidebar** (LayoutClient)
**All Pages** (except login/register)
- CRM System header
- User name & role display
- Dynamic navigation based on role:
  - **Dashboard** (all)
  - **Shifts** (operator/admin only)
  - **Create Order** (operator/admin only)
  - **My Orders** (master/client)
  - **Orders** list (all)
- **Logout** button

**Unauthenticated Users:**
- Landing page with CRM System title
- Login button
- Register button

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Shifts
- `GET /api/shifts` - Get user's shifts
- `POST /api/shifts/open` - Open new shift (operator only, requires no active shift)
- `POST /api/shifts/close` - Close active shift (operator only)

### Orders
- `GET /api/orders` - List orders (query: status, masterId, operatorId, dateFrom, dateTo)
- `POST /api/orders` - Create order (op only, requires open shift)
- `GET /api/orders/[id]` - Get order detail
- `PATCH /api/orders/[id]` - Edit order (op only, CREATED status only)
- `POST /api/orders/[id]/cancel` - Cancel order (op only, not COMPLETED/CANCELLED)
- `POST /api/orders/[id]/in-progress` - Mark as in progress (master, assigned)
- `POST /api/orders/[id]/complete` - Complete order (op or master assigned)
- `POST /api/orders/[id]/pay` - Record payment (op only, requires open shift)

### Services
- `GET /api/services` - List active services
- `POST /api/services` - Create service (admin only)

### Users
- `GET /api/users?role=ROLE` - List users by role

### Database
- `POST /api/seed` - Initialize demo data (one-time)

---

## 💾 Database Schema

### Users
```typescript
id: number (PK)
fullName: string
phone: string (unique)
passwordHash: string
role: 'OPERATOR' | 'MASTER' | 'CLIENT' | 'ADMIN'
experienceYears?: number (master only)
specialization?: string (master only)
createdAt: timestamp
updatedAt: timestamp
```

### Services
```typescript
id: number (PK)
name: string
description: string
price: number (cents, e.g., 5000 = $50)
isActive: boolean
createdAt: timestamp
updatedAt: timestamp
```

### MasterService (Junction)
```typescript
id: number (PK)
masterId: number (FK → User)
serviceId: number (FK → Service)
createdAt: timestamp
```

### Orders
```typescript
id: number (PK)
clientId: number (FK → User)
serviceId: number (FK → Service)
masterId?: number (FK → User, optional)
operatorId: number (FK → User)
scheduledAt: timestamp
status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
servicePrice: number (snapshot, cents)
discount: number (cents, default 0)
extraWork: number (cents, default 0)
paidAmount: number (cents, default 0)
finalPrice?: number (calculated)
completionComment?: string
createdAt: timestamp
updatedAt: timestamp
```

### Shifts
```typescript
id: number (PK)
operatorId: number (FK → User)
openedAt: timestamp
closedAt?: timestamp
isClosed: boolean
createdAt: timestamp
updatedAt: timestamp
```

### ShiftLogs
```typescript
id: number (PK)
shiftId: number (FK → Shift)
operatorId: number (FK → User)
action: 'OPEN' | 'CLOSE'
createdAt: timestamp
```

### OrderOperations (in Order.ts)
```typescript
id: number (PK)
orderId: number (FK → Order)
type: 'PAYMENT' | 'CANCELLATION'
amount: number (cents)
reason?: string
createdBy: User
createdAt: timestamp
```

---

## 🛡️ Security Features

1. **Password Hashing:** bcryptjs (10 rounds)
2. **JWT Tokens:** 7-day expiration (configurable in auth.ts)
3. **httpOnly Cookies:** Prevents XSS attacks
4. **Role-Based Guards:** API routes check user role before execution
5. **Input Validation:** Form validation on frontend + backend
6. **CORS Ready:** (Add to api responses if needed)

---

## 🧪 Testing the System

### 1. **Seed Demo Data:**
```bash
curl -X POST http://localhost:3000/api/seed
```

### 2. **Test Operator Workflow:**
- Login as operator (+1234567890 / password123)
- Open a shift (Dashboard → Shifts)
- Create an order (Dashboard → Create Order)
- View orders and filter them
- Record a payment on an incomplete order
- Complete an order

### 3. **Test Master Workflow:**
- Login as master (+1987654321 / password123)
- Dashboard shows assigned orders count
- View My Orders page
- Click on an order to view details
- Mark order as "In Progress"
- Complete the order

### 4. **Test Client Workflow:**
- Login as client (+1111222333 / password123)
- View My Orders (see orders created as this client)
- Click on order to see detail (read-only)

---

## 📦 Build & Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Deploy to Vercel
```bash
vercel
```

---

## 🐛 Troubleshooting

### Database Issues
1. **"Cannot find module"**: Run `npx tsc --noEmit` to check TypeScript errors
2. **"Database locked"**: Close other instances or delete `database.sqlite` and re-seed
3. **"Cannot access before initialization"**: Use type-only imports in entity relationships

### Authentication Issues
1. **"Invalid token"**: Clear cookies (Dev Tools → Application → Cookies)
2. **"401 Unauthorized"**: Ensure login was successful and cookie is set
3. **"Incorrect password"**: Check caps lock, demo password is `password123`

### API Issues
1. **"CORS error"**: Add `no-cors` mode to fetch or configure CORS headers
2. **"404 Not Found"**: Check API route file structure matches the URL
3. **"Shift already open"**: Close existing shift before opening a new one

---

## 📝 Environment Variables

Create `.env.local` if needed (currently uses defaults):

```bash
# Optional: Set custom JWT expiry
NEXT_PUBLIC_JWT_EXPIRY=7d

# Optional: Set custom cookie name
NEXT_PUBLIC_COOKIE_NAME=crm_token
```

---

## 🚀 Future Enhancements

- [ ] Admin panel (user management, service management)
- [ ] Email notifications for orders
- [ ] Real-time order status updates (WebSocket)
- [ ] Photo upload for order documentation
- [ ] Reporting dashboard (revenue, performance metrics)
- [ ] Recurring orders/subscriptions
- [ ] Multi-currency support
- [ ] SMS notifications
- [ ] Mobile app (React Native)

---

## 📄 License

Proprietary - All Rights Reserved

---

## 📞 Support

For issues or questions, contact the development team.
