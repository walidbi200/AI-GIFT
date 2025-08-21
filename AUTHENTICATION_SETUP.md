# 🔐 Admin Authentication Setup Guide

This guide explains how to set up and use the admin authentication system for your deployed website.

## 🚀 Quick Setup

### 1. Environment Variables

Add these environment variables to your Vercel deployment:

```bash
# Admin Authentication
ADMIN_USER=your_admin_username
ADMIN_PASS=your_secure_password

# OpenAI API (for AI features)
OPENAI_API_KEY=your_openai_api_key
```

### 2. Access the Admin Panel

1. **Login URL**: `https://your-domain.com/login`
2. **Admin Dashboard**: `https://your-domain.com/admin`

## 🔧 How It Works

### Authentication Flow

1. **Login Page** (`/login`)
   - Users enter username and password
   - Credentials are validated against environment variables
   - Successful login stores a session token in localStorage
   - User is redirected to `/admin`

2. **Protected Routes**
   - All admin routes (`/admin/*`) are protected
   - Unauthenticated users are redirected to `/login`
   - Session persists across browser sessions

3. **Logout**
   - Click the logout button in the admin dashboard
   - Clears session data and redirects to login page

### Security Features

- ✅ **Environment Variable Protection**: Credentials stored securely in Vercel
- ✅ **Session Management**: Token-based authentication
- ✅ **Route Protection**: Automatic redirect for unauthorized access
- ✅ **CORS Support**: API routes configured for cross-origin requests
- ✅ **Input Validation**: Server-side credential validation

## 📁 File Structure

```
├── api/
│   └── auth/
│       └── login.ts              # Authentication API endpoint
├── src/
│   ├── components/
│   │   └── auth/
│   │       └── ProtectedRoute.tsx # Route protection component
│   ├── hooks/
│   │   └── useAuth.ts            # Authentication state management
│   └── pages/
│       └── Login.tsx             # Login page component
```

## 🛠️ API Endpoints

### POST `/api/auth/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "your_password"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "base64_encoded_session_token"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

## 🎨 UI Components

### Login Page Features
- Clean, modern design with Tailwind CSS
- Loading states and error handling
- Responsive design for all devices
- Form validation and accessibility

### Admin Dashboard Features
- User welcome message with username
- Logout button with confirmation
- Protected route access
- Session persistence

## 🔒 Security Best Practices

### 1. Strong Passwords
- Use a strong, unique password for admin access
- Consider using a password manager
- Change password regularly

### 2. Environment Variables
- Never commit credentials to version control
- Use Vercel's environment variable system
- Rotate credentials periodically

### 3. Session Management
- Sessions are stored in localStorage
- Clear sessions on logout
- Consider implementing session expiration

## 🚀 Deployment

### Vercel Deployment

1. **Set Environment Variables**:
   ```bash
   # In Vercel Dashboard > Settings > Environment Variables
   ADMIN_USER=your_admin_username
   ADMIN_PASS=your_secure_password
   ```

2. **Deploy**: Push to your main branch for automatic deployment

3. **Test**: Visit `https://your-domain.com/login`

### Local Development

1. **Create `.env` file**:
   ```bash
   ADMIN_USER=admin
   ADMIN_PASS=dev_password
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Test**: Visit `http://localhost:5173/login`

## 🔧 Customization

### Change Login URL
Update the route in `src/App.tsx`:
```tsx
<Route path="/your-custom-login-path" element={<Login />} />
```

### Customize UI
- Modify `src/pages/Login.tsx` for login page styling
- Update `src/components/admin/AdminDashboard.tsx` for dashboard header
- Customize colors and branding in Tailwind classes

### Add More Security
- Implement JWT tokens instead of simple base64 encoding
- Add rate limiting to login attempts
- Implement two-factor authentication
- Add session expiration

## 🐛 Troubleshooting

### Common Issues

1. **"Server configuration error"**
   - Check that `ADMIN_USER` and `ADMIN_PASS` are set in Vercel
   - Verify environment variable names are correct

2. **"Invalid credentials"**
   - Double-check username and password
   - Ensure no extra spaces in environment variables

3. **Redirect loop**
   - Clear browser localStorage
   - Check that login API is working
   - Verify route protection is configured correctly

4. **CORS errors**
   - API routes include CORS headers
   - Check that domain is correct in deployment

### Debug Mode

Add console logs to debug authentication:
```typescript
// In api/auth/login.ts
console.log('Login attempt:', { username, hasPassword: !!password });
```

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Test the login API endpoint directly
4. Clear browser cache and localStorage

## 🔄 Updates

To update the authentication system:

1. Pull latest changes from repository
2. Update environment variables if needed
3. Redeploy to Vercel
4. Test login functionality

---

**Note**: This is a basic authentication system suitable for admin access. For production applications with multiple users, consider implementing a more robust authentication system with proper user management, role-based access control, and enhanced security measures.
