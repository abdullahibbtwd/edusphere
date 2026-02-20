# Email Integration with Resend

## Overview

The authentication system now automatically sends beautiful, branded emails for verification codes and password resets using [Resend](https://resend.com).

## Setup

### 1. Get Your Resend API Key

1. Sign up at [https://resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add it to your `.env.local` file:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Email Templates

Two beautiful, responsive email templates are included:

- **Verification Email** - Gradient purple/violet theme
- **Password Reset Email** - Gradient pink/red theme

Both templates feature:
- ✨ Modern, professional design
- 📱 Fully responsive (mobile-friendly)
- 🎨 Branded with EduSphere colors
- 🔐 Large, easy-to-read verification codes
- ⏰ Expiry time warnings
- 🛡️ Security tips and support contact

## Usage

Emails are automatically sent when:

1. **User Registers** → Sends verification code email
2. **User Requests Password Reset** → Sends reset code email

### Files Structure

```
src/
├── lib/
│   ├── email-templates.ts     # HTML email templates
│   └── email-service.ts       # Email sending functions
└── app/api/
    ├── send-email/route.ts    # Resend API integration
    └── auth/
        ├── register/route.ts  # Sends verification email
        └── forgot-password/route.ts  # Sends reset email
```

## Testing

### Development Mode

In development, verification codes are:
1. **Sent via email** to the user's inbox
2. **Also returned in API response** for easy testing
3. **Logged to console** for debugging

### Test Email Flow

```bash
# 1. Start dev server
npm run dev

# 2. Register a new user at /auth
# 3. Check your email for the verification code
# 4. Also check the browser console/toast for the code (dev only)
# 5. Verify your email with the 6-digit code
```

## Email Service Functions

### Send Verification Email

```typescript
import { sendVerificationEmail } from '@/lib/email-service';

await sendVerificationEmail(
  'user@example.com',  // recipient email
  'John Doe',          // user name
  '123456'             // verification code
);
```

### Send Password Reset Email

```typescript
import { sendPasswordResetEmail } from '@/lib/email-service';

await sendPasswordResetEmail(
  'user@example.com',  // recipient email
  'John Doe',          // user name
  '654321'             // reset code
);
```

## Email Templates Customization

### Modify Colors

Edit `src/lib/email-templates.ts`:

```typescript
// Verification email gradient (default: purple/violet)
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// Password reset gradient (default: pink/red)
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
```

### Update Branding

Replace "EduSphere" with your school name in the templates.

### Add Logo

Add your logo URL to the email header:

```html
<img src="YOUR_LOGO_URL" alt="School Logo" style="max-width: 150px;" />
```

## Production Notes

### From Email Address

Currently using Resend's default testing domain: `onboarding@resend.dev`

For production:
1. Add your custom domain in Resend dashboard
2. Update `src/app/api/send-email/route.ts`:

```typescript
const finalFromEmail = 'noreply@yourdomain.com';
```

### Email Deliverability

- ✅ Resend handles SPF, DKIM, and DMARC automatically
- ✅ High deliverability rates
- ✅ Real-time delivery tracking
- ✅ Bounce and complaint management

## Error Handling

The system is designed to never fail user registration/password reset if email sending fails:

```typescript
try {
  await sendVerificationEmail(...);
} catch (emailError) {
  console.error("⚠️ Failed to send email:", emailError);
  // Registration continues successfully
}
```

This ensures a better user experience. Users can request a new code if needed.

## Monitoring

### Check Email Delivery

1. Log in to your Resend dashboard
2. View "Emails" tab for delivery status
3. Check for bounces or failures

### Console Logs

Look for these logs in your server console:

```
✅ Verification email sent to: user@example.com
⚠️ Failed to send verification email: <error details>
```

## Troubleshooting

### Issue: Emails not sending

**Check:**
- ✅ `RESEND_API_KEY` is set in `.env.local`
- ✅ API key is valid (check Resend dashboard)
- ✅ No typo in email address
- ✅ Check spam folder

### Issue: "Resend API key not configured"

**Solution:**
```bash
# Make sure .env.local exists and contains:
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### Issue: Emails going to spam

**Solutions:**
1. Use a custom verified domain (instead of `onboarding@resend.dev`)
2. Add SPF/DKIM records (Resend provides these)
3. Start with low volume to build reputation

## Rate Limits

Resend Free Tier:
- 100 emails/day
- 3,000 emails/month

For higher volumes, upgrade your Resend plan.

## Security Best Practices

✅ **API Key Security**
- Never commit `.env.local` to version control
- Use environment variables on deployment
- Rotate keys periodically

✅ **Email Content**
- Don't include sensitive data in emails
- Use codes instead of clickable links (for security)
- Set appropriate expiry times (24h for verification, 1h for reset)

## Next Steps

1. ✅ Test email delivery with a real email address
2. ✅ Customize email templates with your branding
3. ⏭️ Add custom domain in production
4. ⏭️ Set up email analytics/monitoring
5. ⏭️ Consider adding email preferences for users

## Support

- **Resend Docs**: https://resend.com/docs
- **EduSphere Support**: support@edusphere.com
