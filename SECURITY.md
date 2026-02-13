# Security Guidelines

This document outlines security best practices and procedures for the Smart Gift Finder application.

## Environment Variables

### NEVER Commit These Files

**The following files contain sensitive secrets and must NEVER be committed to git:**

- `.env`
- `.env.local`
- `.env.development.local`
- `.env.test.local`
- `.env.production.local`
- Any file matching `*.env` or `.env*.local`

These files are now protected by `.gitignore`, but always verify before committing:

```powershell
git status
git check-ignore -v .env.local
```

### Always Use Vercel Environment Variables

For production deployments, all secrets must be stored as Vercel environment variables:

1. Navigate to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables for Production, Preview, and Development as needed
3. Never hardcode secrets in your codebase

## Credential Rotation Procedures

After this security fix, you **MUST** rotate all exposed credentials immediately.

### 1. Rotate OpenAI API Key

**Current Status:** ⚠️ EXPOSED - Key starting with `sk-proj-Xk_jCAQwRkIy...` was committed to git

**Steps to rotate:**

1. Go to https://platform.openai.com/api-keys
2. Delete the exposed key: `sk-proj-Xk_jCAQwRkIy...`
3. Create a new API key
4. Copy the new key
5. Add to Vercel: Environment Variable `OPENAI_API_KEY` = `<new key>`
6. Redeploy the application

### 2. Rotate Database Credentials

**Current Status:** ⚠️ EXPOSED - Postgres connection string was committed to git

**Steps to rotate:**

1. Log into Vercel Dashboard
2. Go to Storage → Postgres → Your Database
3. Click "Reset Password" or create a new database instance
4. Update the following Vercel environment variables:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
5. Redeploy the application

### 3. Generate New Admin Password

**Current Status:** ⚠️ EXPOSED - Plain text password `trading@@@123` was committed to git

**Steps to rotate:**

1. Choose a strong new password (minimum 12 characters, mix of letters, numbers, symbols)
2. Edit `scripts/hash-password.js` and replace the placeholder with your new password
3. Run the script:
   ```powershell
   node scripts/hash-password.js
   ```
4. Copy the bcrypt hash output
5. Add to Vercel: Environment Variable `ADMIN_PASSWORD_HASH` = `<hash>`
6. Add to Vercel: Environment Variable `ADMIN_USERNAME` = `<your-new-username>`
7. **IMPORTANT:** Revert changes to `scripts/hash-password.js` (do not commit your password)
8. Redeploy the application

### 4. Generate New JWT Secret

**Current Status:** ⚠️ Old NEXTAUTH_SECRET exposed

**Steps to rotate:**

1. Generate a secure random secret:
   ```powershell
   # On Windows (PowerShell):
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   
   # On Linux/Mac:
   openssl rand -base64 32
   ```
2. Copy the output
3. Add to Vercel: Environment Variable `JWT_SECRET` = `<generated secret>`
4. Redeploy the application

## Pre-Commit Security Checklist

Before committing code, always verify:

- [ ] Run `git status` to check for `.env*` files
- [ ] Search for hardcoded secrets: `findstr /S /I /N "sk-proj\|postgres://\|password.*=" *.ts *.js`
- [ ] Verify all secrets use `process.env.VARIABLE_NAME`
- [ ] Check that no API keys, passwords, or tokens are in the code
- [ ] Ensure new files with secrets are added to `.gitignore`

## Git History Cleanup

**CRITICAL:** The `.env.local` file with exposed secrets is already in your git history. This implementation prevents future commits, but you must clean the history separately.

### Option 1: Using git-filter-repo (Recommended)

```powershell
# Install git-filter-repo first
pip install git-filter-repo

# Remove the .env.local file from all history
git filter-repo --path .env.local --invert-paths

# Force push (warning: rewrites history)
git push origin --force --all
```

### Option 2: Using BFG Repo-Cleaner

```powershell
# Download BFG from https://rtyley.github.io/bfg-repo-cleaner/
# Then run:
bfg --delete-files .env.local
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
```

> [!CAUTION]
> Force pushing rewrites git history. Coordinate with all team members before doing this.

## Security Headers

The application implements the following security headers (configured in `api/headers.ts`):

- **Content-Security-Policy:** Restricts resource loading to prevent XSS
- **X-Content-Type-Options:** Prevents MIME-sniffing
- **X-Frame-Options:** Prevents clickjacking
- **X-XSS-Protection:** Enables browser XSS filtering
- **Referrer-Policy:** Controls referrer information
- **Permissions-Policy:** Restricts browser features
- **CORS:** Restricted to specific domains (no wildcards)

## Authentication System

The application uses:

- **JWT Tokens:** Signed with HS256 algorithm (jose library)
- **Bcrypt Password Hashing:** 10 rounds of salting
- **Token Expiration:** 24-hour sessions with automatic logout
- **Role-Based Access Control:** Admin role verification

### Session Management

- Tokens are stored in `localStorage` as `authToken`
- Tokens automatically expire after 24 hours
- Users receive an alert on session expiration
- All sessions are invalidated on password rotation

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

**Contact:** [Add your security contact email here]

**Please include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

**Do NOT:**
- Create public GitHub issues for security vulnerabilities
- Share the vulnerability publicly before it's fixed
- Exploit the vulnerability beyond proof-of-concept testing

## Regular Security Maintenance

### Monthly Tasks

- [ ] Review environment variables for any exposed secrets
- [ ] Check dependency updates for security patches
- [ ] Review authentication logs for suspicious activity
- [ ] Verify CORS configuration is still restrictive

### After Major Updates

- [ ] Re-run security audit
- [ ] Update dependencies
- [ ] Review new code for hardcoded secrets
- [ ] Test authentication flows

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Vercel Security Best Practices](https://vercel.com/docs/security/secure-your-application)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Password Hashing with Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
