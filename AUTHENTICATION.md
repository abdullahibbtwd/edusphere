# Authentication System Documentation

## Overview

This application now has a complete authentication system with user registration, login, email verification, and password reset functionality.

## Features

✅ **User Registration** - Create new user accounts with email verification  
✅ **Login** - Secure login with password hashing (bcrypt)  
✅ **Email Verification** - 6-digit verification codes  
✅ **Password Reset** - Forgot password functionality  
✅ **School Integration** - Users can be associated with schools  
✅ **Role-based Access** - Support for STUDENT, TEACHER, and ADMIN roles

## API Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "confirmPassword": "securepassword123",
  "schoolId": "optional-school-id"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "user": {
    "id": "clxxx...",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "STUDENT",
    "isEmailVerified": false,
    "createdAt": "2025-12-07T..."
  },
  "verificationCode": "123456" // Only in development mode
}
```

### 2. Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "clxxx...",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "STUDENT",
    "isEmailVerified": true,
    "school": {
      "id": "clyyy...",
      "name": "Example School",
      "subdomain": "example"
    }
  }
}
```

### 3. Verify Email
**POST** `/api/auth/verify`

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "user": {
    "id": "clxxx...",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "STUDENT",
    "isEmailVerified": true
  }
}
```

### 4. Forgot Password
**POST** `/api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset code sent to your email",
  "resetCode": "654321" // Only in development mode
}
```

## Frontend Usage

### Registration Flow

1. User fills out the registration form
2. Submit to `/api/auth/register`
3. User receives verification code (in development, shown in toast)
4. Redirect to verification page
5. User enters 6-digit code
6. Submit to `/api/auth/verify`
7. Redirect to login

### Login Flow

1. User enters email and password
2. Submit to `/api/auth/login`
3. If not verified, show error and redirect to verification
4. If successful, store user data in localStorage
5. Redirect based on role/school:
   - If user has school: `/{subdomain}`
   - Otherwise: `/dashboard`

## Database Schema

The User model includes:
```prisma
model User {
  id          String    @id @default(cuid())
  name        String?
  email       String    @unique
  password    String    // Hashed with bcrypt
  role        Role      @default(STUDENT)
  schoolId    String?
  
  // Email verification
  isEmailVerified Boolean @default(false)
  emailVerificationCode String?
  emailVerificationExpires DateTime?
  
  // Password reset
  passwordResetCode String?
  passwordResetExpires DateTime?
  
  // Relations
  school      School?   @relation(fields: [schoolId], references: [id])
  student     Student?
  teacher     Teacher?
}
```

## Security Features

1. **Password Hashing** - Uses bcrypt with salt rounds of 12
2. **Email Verification** - Users must verify email before logging in
3. **Code Expiry** - Verification codes expire after 24 hours
4. **Reset Code Expiry** - Password reset codes expire after 1 hour
5. **Secure Password Requirements** - Minimum 6 characters
6. **Error Handling** - Graceful error messages without exposing sensitive info

## Development vs Production

### Development Mode
- Verification codes and reset codes are returned in API responses
- Console logging enabled for debugging

### Production Mode
- Codes are only sent via email (TODO: implement email service)
- Minimal logging

## Next Steps (TODO)

1. **Email Integration**
   - Set up email service (Resend, SendGrid, etc.)
   - Send verification emails
   - Send password reset emails

2. **Session Management**
   - Implement JWT tokens
   - Add refresh token functionality
   - Create session middleware

3. **Password Reset Completion**
   - Add route to update password with reset code
   - Add form in frontend

4. **User Profile**
   - Add route to update user profile
   - Add profile picture upload

## Testing

To test the authentication system:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/auth`

3. Register a new account

4. Check the toast notification for the verification code (in development)

5. Verify your email

6. Log in with your credentials

## Troubleshooting

**Issue:** "User with this email already exists"
- **Solution:**Delete the user from the database or use a different email

**Issue:** "Please verify your email before logging in"
- **Solution:** Complete the verification process or manually update `isEmailVerified` to `true` in the database

**Issue:** "Invalid verification code"
- **Solution:** Ensure you're entering the correct 6-digit code and it hasn't expired

**Issue:** Database connection errors
- **Solution:** Ensure your DATABASE_URL is correctly set in `.env` file
