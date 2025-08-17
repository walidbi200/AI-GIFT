# Vercel Postgres Database Setup Guide

## Overview
This application has been refactored to use Vercel Postgres instead of file-based storage for blog posts. This resolves the `FUNCTION_INVOCATION_FAILED` error that occurred on Vercel due to the read-only filesystem.

## Step 1: Create Vercel Postgres Database

1. **Go to your Vercel Dashboard**
   - Navigate to your project
   - Go to the "Storage" tab
   - Click "Create Database"
   - Select "Postgres"

2. **Configure Database**
   - Choose a name for your database (e.g., "ai-gft-blog")
   - Select a region close to your users
   - Choose the appropriate plan (Hobby plan is sufficient for development)

3. **Get Connection Details**
   - After creation, Vercel will automatically add the `POSTGRES_URL` environment variable
   - The connection string will look like: `postgresql://username:password@host:port/database`

## Step 2: Set Up Database Schema

1. **Access your database**
   - In Vercel Dashboard, go to your database
   - Click "Connect" and select "Query"
   - Or use the Vercel CLI: `vercel db connect`

2. **Run the schema**
   - Copy the contents of `database/schema.sql`
   - Paste and execute it in your database query interface

## Step 3: Environment Variables

Vercel should automatically add the `POSTGRES_URL` environment variable. If not:

1. **In Vercel Dashboard:**
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add: `POSTGRES_URL` with your connection string

2. **For local development:**
   - Create a `.env.local` file
   - Add: `POSTGRES_URL=your_connection_string`

## Step 4: Deploy

1. **Commit and push your changes**
   ```bash
   git add .
   git commit -m "feat: migrate to Vercel Postgres for blog storage"
   git push
   ```

2. **Vercel will automatically deploy**
   - The new API endpoints will use Postgres
   - Blog posts will be stored in the database
   - No more filesystem errors

## Verification

After deployment, test the blog functionality:

1. **Generate a blog post** using the AI Blog Generator
2. **Save the post** - it should now work without errors
3. **Check the database** - you should see the post in your Vercel Postgres database

## API Endpoints

The following endpoints now use Vercel Postgres:

- `POST /api/blog/save` - Save a new blog post
- `GET /api/blog/list` - List all blog posts with pagination
- `DELETE /api/blog/delete` - Delete a blog post

## Troubleshooting

### Common Issues:

1. **"Cannot connect to database"**
   - Check that `POSTGRES_URL` is set correctly
   - Verify the database is created and running

2. **"Table does not exist"**
   - Run the schema from `database/schema.sql`
   - Check that the table was created successfully

3. **"Permission denied"**
   - Ensure your database user has the necessary permissions
   - Check that the connection string is correct

### Support:
- Vercel Postgres Documentation: https://vercel.com/docs/storage/vercel-postgres
- Vercel CLI: `npm i -g vercel`
- Database queries: `vercel db connect`
