# Password Reset Flow - Complete Guide

## Overview

Users can now reset their password if they forget it. The flow involves:
1. Request reset code (sent via email)
2. Enter reset code and new password
3. Password is updated

## User Flow

### Step 1: Forgot Password
1. User clicks "Forgot password?" on login page
2. Enters their email address
3. Clicks "Send Reset Code"
4. Receives 6-digit code via email

### Step 2: Reset Password
1. User is automatically shown the reset password form
2. Enters the 6-digit code from email
3. Enters new password
4. Confirms new password
5. Clicks "Reset Password"

### Step 3: Login
1. User is redirected to login page
2. Can now log in with new password

## API Endpoints

### 1. Request Password Reset
**POST** `/api/auth/forgot-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset code sent to your email"
}
```

**What happens:**
- Generates 6-digit code
- Code expires in 1 hour
- Sends email with reset code
- Returns success message

### 2. Reset Password
**POST** `/api/auth/reset-password`

**Request:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Validation:**
- ✅ Email must exist
- ✅ Code must match
- ✅ Code must not be expired (1 hour limit)
- ✅ New password must be at least 6 characters

**What happens:**
- Verifies reset code
- Hashes new password
- Updates user password
- Clears reset code from database
- User can now log in with new password

## Security Features

### Code Expiration
- Reset codes expire after **1 hour**
- Expired codes cannot be used
- User must request a new code if expired

### Code Storage
- Codes are stored in database (not sent in URL)
- Prevents code leakage via browser history/logs
- Codes are cleared after successful reset

### Password Requirements
- Minimum 6 characters
- Hashed with bcrypt (12 salt rounds)
- Never stored in plain text

### Email Verification
- Reset codes only sent to verified emails
- User must have access to the email account
- Prevents unauthorized password resets

## Frontend Forms

### Forgot Password Form
```tsx
<form onSubmit={handleForgotPassword}>
  <input 
    type="email" 
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Enter your email"
    required
  />
  <button type="submit">
    Send Reset Code
  </button>
</form>
```

### Reset Password Form
```tsx
<form onSubmit={handleResetPassword}>
  {/* 6-digit code inputs */}
  <div className="flex space-x-2">
    {verificationCode.map((digit, index) => (
      <input
        key={index}
        type="text"
        maxLength={1}
        value={digit}
        onChange={(e) => handleVerificationInput(index, e.target.value)}
      />
    ))}
  </div>
  
  {/* New password */}
  <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="New password"
    required
  />
  
  {/* Confirm password */}
  <input
    type="password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    placeholder="Confirm password"
    required
  />
  
  <button type="submit">Reset Password</button>
</form>
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid email or reset code" | Email not found | Check email spelling |
| "Invalid reset code" | Code doesn't match | Check code from email |
| "Reset code has expired" | Code older than 1 hour | Request new code |
| "Password must be at least 6 characters" | Password too short | Use longer password |
| "Passwords do not match" | Mismatch in confirmation | Retype passwords |

### User Feedback

All errors are shown via toast notifications:
```typescript
if (!response.ok) {
  toast.error(data.error || 'Reset failed');
  return;
}

toast.success('Password reset successfully!');
```

## Email Template

The password reset email includes:
- **Pink/red gradient design**
- **6-digit code** prominently displayed
- **1-hour expiry warning**
- **Security notice** if user didn't request reset
- **Support contact** for help

Example:
```
Subject: 🔑 Reset Your EduSphere Password

Hello [Name],

We received a request to reset your password. Use the code below:

      123456

This code will expire in 1 hour.

⚠️ If you didn't request this, please ignore or contact support.
```

## Testing

### Test the Complete Flow

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Go to** `/auth` and click "Forgot password?"

3. **Enter your email** and submit

4. **Check your email** for the reset code

5. **Enter the code** and new password

6. **Submit** and verify success

7. **Log in** with new password

### Test Error Cases

1. **Expired code:** Wait 1 hour, try code (should fail)
2. **Wrong code:** Enter incorrect code (should fail)
3. **Wrong email:** Enter non-existent email (should fail silently)
4. **Short password:** Enter password < 6 chars (should fail)
5. **Mismatch passwords:** Enter different confirmation (should fail)

## Database Fields

The User model uses these fields for password reset:

```prisma
model User {
  // ... other fields
  
  passwordResetCode String?
  passwordResetExpires DateTime?
  
  // ... other fields
}
```

## Code Lifecycle

1. **Request reset** → Code generated, saved, email sent
2. **Code valid** → Can be used within 1 hour
3. **Code used** → Password updated, code cleared
4. **Code expires** → After 1 hour, must request new one
5. **Code cleared** → After successful reset or new request

## Best Practices

✅ **Do:**
- Use the 6-digit code (easy to type)
- Send codes via email (secure channel)
- Expire codes after 1 hour (security)
- Clear codes after use (prevent reuse)
- Show clear error messages (user experience)

❌ **Don't:**
- Send codes in URL (insecure)
- Use codes without expiration (security risk)
- Allow multiple attempts without rate limiting
- Store codes in plain text
- Show different errors for missing vs wrong email

## Future Enhancements

Possible improvements:
1. **Rate limiting** - Prevent brute force attacks
2. **Multiple attempts** - Lock account after X failed attempts
3. **SMS codes** - Alternative to email
4. **Password strength meter** - Show password security level
5. **Recent passwords** - Prevent reusing old passwords
6. **2FA** - Two-factor authentication
7. **Remember reset** - Track recent reset requests

## Support

If users have issues:
1. Check spam folder for email
2. Request new code if expired
3. Verify email spelling
4. Contact support: support@edusphere.com
