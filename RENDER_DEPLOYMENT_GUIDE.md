# Render Deployment Guide for GDSC Tracker

This guide will help you deploy your GDSC Cloud Study Jams tracker on Render.

## Prerequisites

1. **GitHub Repository**: Your code should be pushed to a GitHub repository
2. **Render Account**: Create a free account at [render.com](https://render.com)

## Deployment Options

### Option 1: Static Site Only (Recommended for Frontend)

This deploys just the frontend without the refresh functionality.

#### Steps:

1. **Connect GitHub to Render**:
   - Log into Render
   - Click "New +" → "Static Site"
   - Connect your GitHub repository: `GDSC-GNIOT-Completion-Tracker`

2. **Configure Static Site**:
   - **Name**: `gdsc-tracker`
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Build Command**: Leave empty
   - **Publish Directory**: `main`

3. **Deploy**:
   - Click "Create Static Site"
   - Your site will be available at `https://your-site-name.onrender.com`

### Option 2: Full Stack Deployment (Frontend + Backend)

This includes the refresh server functionality.

#### Steps:

1. **Deploy Backend (Web Service)**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `gdsc-tracker-backend`
     - **Language**: Python 3
     - **Branch**: `main`
     - **Root Directory**: Leave empty
     - **Build Command**: `pip install -r conversion/requirements.txt`
     - **Start Command**: `cd conversion && python refresh_server_production.py`
     - **Plan**: Free

2. **Deploy Frontend (Static Site)**:
   - Click "New +" → "Static Site"
   - Connect the same repository
   - Configure:
     - **Name**: `gdsc-tracker-frontend`
     - **Branch**: `main`
     - **Root Directory**: Leave empty
     - **Build Command**: Leave empty
     - **Publish Directory**: `main`

3. **Update Frontend Configuration**:
   - After backend deployment, note the backend URL (e.g., `https://gdsc-tracker-backend.onrender.com`)
   - Update your `main/script.js` to use this URL instead of `localhost:5001`

## Alternative: One-Click Deployment

You can use the included `render.yaml` file for one-click deployment:

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add Render deployment config"
   git push origin main
   ```

2. **Deploy via Blueprint**:
   - In Render, click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically read the `render.yaml` file

## Environment Variables (if using backend)

If deploying the backend, you may need to set these environment variables in Render:

- `FLASK_ENV`: `production`
- `PORT`: `10000` (Render sets this automatically)

## Custom Domain (Optional)

To use a custom domain:

1. In your Render dashboard, go to your service
2. Go to "Settings" → "Custom Domains"
3. Add your domain and follow the DNS setup instructions

## Troubleshooting

### Common Issues:

1. **Static files not loading**: Ensure the publish directory is set to `main`
2. **CORS errors**: The backend is configured to allow all origins - you may want to restrict this
3. **Backend not starting**: Check the logs in Render dashboard for error messages

### Render Free Tier Limitations:

- Services sleep after 15 minutes of inactivity
- 750 free hours per month
- Cold starts can take 30+ seconds

## Files Created for Deployment:

- `render.yaml`: Render Blueprint configuration
- `render-full.yaml`: Full stack deployment configuration
- `conversion/refresh_server_production.py`: Production-ready Flask server

## Next Steps:

1. Choose your deployment option (static-only is simpler)
2. Follow the steps above
3. Update any hardcoded URLs in your frontend
4. Test the deployment
5. (Optional) Set up custom domain

## Support:

If you encounter issues:
- Check Render's documentation: https://render.com/docs
- Review service logs in the Render dashboard
- Ensure all file paths are correct in your configuration