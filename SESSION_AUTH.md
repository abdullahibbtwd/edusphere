# Session & Cookie Authentication

## Overview

The authentication system now uses **secure HTTP-only cookies** and **JWT tokens** for session management. This is more secure than localStorage and provides automatic authentication across all requests.

## How It Works

### 1. Login Process

When a user logs in successfully:

1. **JWT Token Created** - Contains user data: `userId`, `email`, `name`, `role`, `schoolId`, `imageUrl`
2. **Two Cookies Set**:
   - `auth-token` (HTTP-only) - Secure JWT token for server-side verification
   - `user-session` (Accessible) - User data for client-side use

### 2. Cookie Details

#### Auth Token Cookie (Secure)
```javascript
{
  name: 'auth-token',
  httpOnly: true,        // Cannot be accessed by JavaScript
  secure: true,          // HTTPS only in production
  sameSite: 'lax',       // CSRF protection
  maxAge: 7 days,        // or 30 days with "Remember Me"
  path: '/',
}
```

#### User Session Cookie (Client-Accessible)
```javascript
{
  name: 'user-session',
  httpOnly: false,       // Can be read by JavaScript
  value: {
    userId: "clxxx...",
    name: "John Doe",
    email: "john@example.com",
    role: "STUDENT",
    imageUrl: "...",
    schoolId: "clyyy...",
    schoolName: "Example School",
    schoolSubdomain: "example"
  }
}
```

## Client-Side Usage

### Get Current User

```typescript
import { getUserSession, isAuthenticated } from '@/lib/client-auth';

// Check if user is logged in
if (isAuthenticated()) {
  const user = getUserSession();
  console.log(user.name, user.role);
}
```

### Check User Role

```typescript
import { hasRole, hasAnyRole } from '@/lib/client-auth';

// Check specific role
if (hasRole('ADMIN')) {
  // Show admin features
}

// Check multiple roles
if (hasAnyRole(['ADMIN', 'TEACHER'])) {
  // Show features for admins and teachers
}
```

### Logout

```typescript
import { logout } from '@/lib/client-auth';

// Logout and redirect to login page
await logout();
```

## Server-Side Usage (API Routes)

### Protect Any Route

```typescript
import { requireAuth } from '@/lib/auth-middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Require authentication
  const user = requireAuth(request);
  if (user instanceof NextResponse) return user; // Returns 401 if not authenticated

  // User is authenticated
  return NextResponse.json({
    message: `Hello ${user.name}!`,
    userId: user.userId,
  });
}
```

### Protect Route by Role

```typescript
import { requireRole } from '@/lib/auth-middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  // Only allow ADMIN role
  const user = requireRole(request, ['ADMIN']);
  if (user instanceof NextResponse) return user; // Returns 403 if not admin

  // User is admin, proceed
  return NextResponse.json({ success: true });
}
```

### Get Current User Info

```typescript
import { getCurrentUser } from '@/lib/auth-middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const user = getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.userId,
      email: user.email,
      role: user.role,
    },
  });
}
```

## API Endpoints

### Login
**POST** `/api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": true  // Optional - extends session to 30 days
}
```

**Response:**
Sets cookies automatically and returns:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "STUDENT",
    "school": {...}
  }
}
```

### Logout
**POST** `/api/auth/logout`

**Response:**
Clears cookies and returns:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Security Features

✅ **HTTP-Only Cookies** - Prevents XSS attacks  
✅ **Secure Flag** - HTTPS only in production  
✅ **SameSite Protection** - Prevents CSRF attacks  
✅ **JWT Tokens** - Cryptographically signed  
✅ **Token Expiration** - 7 or 30 days  
✅ **Role-Based Access Control** - Fine-grained permissions

## Environment Variables

Add to your `.env.local`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**⚠️ IMPORTANT:** Change the JWT secret in production to a strong random string!

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Migration from localStorage

If you were previously using localStorage:

### Before
```typescript
const user = JSON.parse(localStorage.getItem('user'));
if (user) {
  console.log(user.name);
}
```

### After
```typescript
import { getUserSession } from '@/lib/client-auth';

const user = getUserSession();
if (user) {
  console.log(user.name);
}
```

## Example: Protected Page Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getUserSession, isAuthenticated } from '@/lib/client-auth';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth');
      return;
    }

    setUser(getUserSession());
  }, [router]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

## Cookie Lifespan

| Scenario | Duration |
|----------|----------|
| Normal login | 7 days |
| "Remember Me" checked | 30 days |
| Manual logout | Immediate expiry |

## Troubleshooting

### Cookies not being set
- Check browser console for errors
- Ensure HTTPS in production
- Check SameSite settings

### Token expired
- User needs to log in again
- Cookies automatically cleared
- Redirect to login page

### Can't access user data client-side
- Use `getUserSession()` from `@/lib/client-auth`
- Don't try to access `auth-token` cookie (it's HTTP-only)
- Use `user-session` cookie instead

## Best Practices

1. ✅ Always verify authentication server-side
2. ✅ Use `requireAuth()` or `requireRole()` in API routes
3. ✅ Never trust client-side authentication alone
4. ✅ Log out users on sensitive operations
5. ✅ Use HTTPS in production
6. ✅ Rotate JWT secret periodically
7. ✅ Set appropriate cookie expiration times
