# Fix Login/Register 500 Error

## Problem
Both login and register endpoints are returning 500 errors because the Render backend doesn't have the MongoDB connection environment variable properly set.

## Solution

### Step 1: Update Render Environment Variables
1. Go to https://dashboard.render.com
2. Click on your backend service: **food-ordering-s1ry**
3. Go to **Settings** → **Environment**
4. Add/Update these environment variables:

```
MONGO_URI=mongodb+srv://vijay15coder:Vijay%40123@cluster0.exl5dxs.mongodb.net/foodOrderingApp?retryWrites=true&w=majority
JWT_SECRET=supersecretkey
NODE_ENV=production
```

**IMPORTANT:** Make sure there are NO extra spaces before or after the values!

### Step 2: Trigger Redeploy
1. In Render dashboard, click **Deployments**
2. Click **Deploy latest commit** button
3. Wait for deployment to complete (should see "Deploy successful")

### Step 3: Test Login/Register
Once deployment completes:
1. Go to your Vercel frontend: https://food-ordering-five-psi.vercel.app (or your URL)
2. Try registering a new account
3. If successful, try logging in
4. You should see "Home" page with menu items

## What Changed
- Updated backend MongoDB URI from local `mongodb://localhost:27017/food` to cloud `mongodb+srv://...`
- This allows Render backend to connect to your MongoDB Atlas cluster
- Frontend Socket.io now uses environment variable (fixed in previous commit)
- Both changes are committed and pushed to GitHub

## If Still Getting 500 Error
Check Render logs:
1. Go to **food-ordering-s1ry** service
2. Click **Logs** tab
3. Look for errors related to MongoDB connection
4. Share any error messages

## Expected Errors After Fix
- First login might show: "Invalid credentials" (means DB is connected but user doesn't exist)
- This is GOOD - it means MongoDB is working!
