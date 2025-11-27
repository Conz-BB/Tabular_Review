# Deployment Guide

This guide will help you deploy Tabular Review to **Render.com** (free tier available).

## Why Render?

- ✅ Free tier available (with limitations)
- ✅ Hosts both frontend and backend
- ✅ Easy Python/FastAPI deployment
- ✅ Automatic HTTPS
- ✅ Simple environment variable management
- ✅ No credit card required for free tier

## Prerequisites

1. A GitHub account
2. A Render.com account (sign up at https://render.com)
3. Your Google Gemini API key

## Step 1: Prepare Your Code

### 1.1 Update Backend CORS

The backend CORS is already configured to accept environment variables. The `server/main.py` file has production-ready CORS setup that reads from the `FRONTEND_URL` environment variable.

### 1.2 Push to GitHub

**Important:** Make sure you're pushing to YOUR repository, not someone else's.

If you need to change the remote:
```bash
# Check current remote
git remote -v

# If it points to someone else's repo, change it to yours:
git remote set-url origin https://github.com/YOUR_USERNAME/Tabular_Review.git

# Or create a new repo on GitHub and set it:
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

Then push:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

## Step 2: Deploy Backend (Python/FastAPI)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `tabular-review-backend` (or your choice)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r server/requirements.txt`
   - **Start Command**: `cd server && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: Leave empty (or set to `server` if you prefer)

5. **Environment Variables**:
   - No backend-specific env vars needed yet (we'll add `FRONTEND_URL` after frontend is deployed)

6. Click **"Create Web Service"**
7. Wait for deployment (first deploy takes ~5-10 minutes due to Docling dependencies)
8. **Copy the service URL** (e.g., `https://tabular-review-backend.onrender.com`)

## Step 3: Deploy Frontend (Static Site)

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `tabular-review-frontend` (or your choice)
   - **Build Command**: `pnpm install && pnpm build`
   - **Publish Directory**: `dist`
   - **Root Directory**: Leave empty

4. **Environment Variables**:
   - `VITE_GEMINI_API_KEY`: Your Google Gemini API key
   - `VITE_API_URL`: Your backend URL from Step 2 (e.g., `https://tabular-review-backend.onrender.com`)

5. Click **"Create Static Site"**
6. Wait for deployment (~3-5 minutes)
7. **Copy the frontend URL** (e.g., `https://tabular-review-frontend.onrender.com`)

## Step 4: Update Backend CORS

1. Go back to your backend service in Render
2. Go to **"Environment"** tab
3. Add environment variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: Your frontend URL from Step 3 (e.g., `https://tabular-review-frontend.onrender.com`)

4. The backend will automatically restart and use the new CORS settings

## Step 5: Test Your Deployment

1. Visit your frontend URL
2. Try uploading a document
3. Verify extraction works

## Troubleshooting

### Backend CORS Errors
- Make sure `FRONTEND_URL` environment variable is set in backend
- Check that the frontend URL matches exactly (including https://)
- Verify the backend has restarted after adding the environment variable

### Build Failures
- Check Render logs for specific errors
- Ensure all dependencies are in `requirements.txt` and `package.json`
- For backend: First deployment can take 10+ minutes due to Docling dependencies

### Slow First Request
- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds (this is normal)
- Backend will wake up automatically on first request

### Frontend Not Connecting to Backend
- Verify `VITE_API_URL` is set correctly in frontend environment variables
- Check that the backend URL includes `https://` (not `http://`)
- Ensure backend service is running (check status in Render dashboard)

## Cost

- **Render Free Tier**: 
  - 750 hours/month (enough for always-on if you're the only user)
  - Spins down after 15 min inactivity (freezes on first request)
  - Perfect for demos and personal projects

- **Upgrade**: $7/month per service for always-on (no spin-down)

## Notes

- The free tier has limitations (spin-down, slower cold starts)
- For production use, consider upgrading to paid tier
- Always keep your API keys secure (never commit them to git)
- Backend first deployment is slow due to Docling model downloads (~10-15 minutes)
- Subsequent deployments are faster (~3-5 minutes)
