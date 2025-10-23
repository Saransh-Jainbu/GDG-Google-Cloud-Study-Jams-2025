# Frontend Debugging Guide

## Issue: No Data Loading on Deployed Frontend

### Quick Debugging Steps:

1. **Check if data.json is accessible**:
   - Visit: `https://your-frontend-url.onrender.com/data.json`
   - You should see the JSON data
   - If you get 404, the file isn't deployed correctly

2. **Check browser console**:
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for error messages like:
     - `Failed to fetch ./data.json`
     - `404 Not Found`
     - `CORS errors`

3. **Check Network tab**:
   - Open Developer Tools → Network tab
   - Refresh the page
   - Look for failed requests to `data.json`

### Common Solutions:

#### Solution 1: Verify Render Configuration
Ensure your Render static site settings:
- **Publish Directory**: `main` ✓
- **Build Command**: Leave empty ✓
- All files in `main/` folder should be deployed

#### Solution 2: Check File Path
The script uses `./data.json` which should work if:
- `data.json` is in the same directory as `index.html`
- Both are in the `main/` folder

#### Solution 3: Add Error Handling
If the above doesn't work, we can add better error handling.

### Advanced Debugging:

#### Check what's actually deployed:
1. Go to your Render dashboard
2. Click on your static site
3. Check "Deploy Logs" for any errors
4. Verify all files were deployed correctly

#### Test local vs production:
- Does it work locally when you open `main/index.html`?
- If yes, it's a deployment issue
- If no, it's a code issue

### Let me know:
1. What's your frontend URL?
2. What error messages do you see in browser console?
3. Can you access `your-site-url/data.json` directly?