# Library Management System - Frontend

Modern Next.js 15 frontend with Tailwind CSS for the Library Management System.

## Features

- 🎨 Modern UI with Tailwind CSS
- 🔐 JWT Authentication
- 📱 Responsive Design
- ⚡ Next.js 15 App Router
- 🎯 Role-based Access Control
- 📊 Real-time Dashboard
- ✅ Form Validation with Zod

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Axios
- React Hook Form
- Zod
- date-fns

## Getting Started

### Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001)

### Production

```bash
pnpm build
pnpm start
```

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Pages

- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Dashboard (protected)
- `/books` - Books catalog (protected)
- `/inventory` - Inventory management (Admin/Librarian)
- `/transactions` - Transaction management (Admin/Librarian)
- `/users` - User management (Admin only)

## Default Credentials

- Email: admin@lms.com
- Password: admin123
