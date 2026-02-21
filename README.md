# CRM System - Complete Implementation

A full-stack Customer Relationship Management (CRM) system built with Next.js, TypeORM, and SQLite. Features multi-role access control, shift management, order tracking, and financial management.

## ✨ Features Overview

### 🔐 Authentication & Authorization
- User registration and login with JWT authentication
- Role-based access control (OPERATOR, MASTER, CLIENT, ADMIN)
- Secure password hashing with bcryptjs
- httpOnly cookie-based sessions
- Per-route access guards

### 📋 Order Management
- Create, read, update, and cancel orders
- Order status workflow: CREATED → IN_PROGRESS → COMPLETED/CANCELLED
- Master assignment with service validation
- Client and operator role-based filtering
- Advanced order filtering by status, master, operator, and date range

### 💰 Financial Features
- Service price snapshots at order creation time
- Discount application per order
- Extra work charges tracking
- Partial payment recording with history
- Final price calculation: servicePrice + extraWork - discount
- Payment operation audit trail

### ⏱️ Shift Management
- Operator shift tracking (open/close)
- Shift-dependent order operations
- Shift logging with timestamps
- Previous shift history

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd crm-nextjs
npm install
npm run dev
```

Visit `http://localhost:3000/login`

### Seed Demo Data
```bash
curl -X POST http://localhost:3000/api/seed
```

Demo credentials:
- **Operator**: +1234567890 / password123
- **Master**: +1987654321 / password123  
- **Client**: +1111222333 / password123

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/me` - Get current user

### Orders
- `GET /api/orders` - List orders (filters: status, masterId, operatorId, dateFrom, dateTo)
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order details
- `PATCH /api/orders/[id]` - Update order
- `POST /api/orders/[id]/cancel` - Cancel order
- `POST /api/orders/[id]/in-progress` - Mark as in progress
- `POST /api/orders/[id]/complete` - Complete order
- `POST /api/orders/[id]/pay` - Record payment

### Shifts
- `GET /api/shifts` - Get user's shifts
- `POST /api/shifts/open` - Open new shift
- `POST /api/shifts/close` - Close shift

### Data
- `GET /api/services` - List services
- `GET /api/users?role=MASTER` - List masters
- `POST /api/seed` - Seed database with demo data

## 🔐 Security

- JWT Authentication with httpOnly cookies
- Password hashing with bcryptjs (10 salt rounds)
- Role-based access control enforced server-side
- Input validation on all API routes
- Type-safe TypeScript implementation

## 🏗️ Architecture

### Frontend
- Next.js 16+ App Router
- React 19 with TypeScript
- Tailwind CSS styling
- Custom React hooks (useUser, useFetch)
- Role-based UI rendering

### Backend
- Next.js API routes
- TypeORM ORM with SQLite
- Server-side session validation
- QueryBuilder for efficient filtering

### Database
- 7 core entities with relationships
- Automatic timestamps
- Type-safe queries
- Circular dependency prevention via type-only imports

## 📊 Core Data Models

**User** - Full name, phone, password hash, role (OPERATOR/MASTER/CLIENT/ADMIN)
**Order** - Client, service, master, operator, status, pricing, payment tracking
**Shift** - Operator shift tracking with open/close timestamps
**Service** - Service catalog with pricing
**MasterService** - Many-to-many mapping between masters and services

## 🧪 Development

```bash
# Type checking
npx tsc --noEmit

# Development server
npm run dev

# Production build
npm run build
npm start
```

## 📚 Documentation

- [Frontend Documentation](./FRONTEND_README.md) - Detailed frontend features
- [TypeORM Docs](https://typeorm.io/)
- [Next.js Docs](https://nextjs.org/docs/)

## 🐛 Troubleshooting

- **TypeScript Errors**: Run `npx tsc --noEmit`
- **Database Issues**: Delete `database.sqlite` and re-seed
- **Login Problems**: Clear cookies and re-seed database

---

**Status**: ✅ Production Ready - Complete CRM system implementation
