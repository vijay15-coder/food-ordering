# CRITICAL: Render Environment Variables Not Set

## ⚠️ Current Problem
- Backend returning 500 errors because MongoDB connection is failing
- Reason: Environment variables NOT configured on Render
- Solution: Add environment variables directly in Render dashboard

## ✅ Step-by-Step Fix

### 1. Go to Render Dashboard
- Open: https://dashboard.render.com
- Log in with your account

### 2. Select Backend Service
- Click "food-ordering-s1ry" service

### 3. Go to Environment Settings
- Click the "Settings" tab (top menu)
- Scroll down to "Environment Variables" section

### 4. Add Environment Variables
Click "Add Environment Variable" and add these THREE variables:

| Key | Value |
|-----|-------|
| `MONGO_URI` | `mongodb+srv://vijay15coder:Vijay%40123@cluster0.exl5dxs.mongodb.net/foodOrderingApp?retryWrites=true&w=majority` |
| `JWT_SECRET` | `supersecretkey` |
| `NODE_ENV` | `production` |

**IMPORTANT:** Copy-paste EXACTLY - no extra spaces!

### 5. Save and Deploy
- Click "Save" button
- Go to "Deployments" tab
- Click "Deploy latest commit" button
- Wait for green checkmark (deployment successful)

## 🔍 How to Verify Deployment Completed
1. In Render dashboard, go to your service
2. Look for "Deployments" → Latest should show green status
3. Check "Logs" tab for messages like:
   - "Server running"
   - "MongoDB connection successful" (or no errors)

## 🧪 Test After Deployment
1. Go to your frontend: https://food-ordering-five-psi.vercel.app
2. Try to Register with:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
3. You should either:
   - ✅ Successfully register and be logged in, OR
   - ✅ Get "User already exists" (means DB is working!)

## If Still Failing
1. Check Render Logs for database connection errors
2. Verify MongoDB Atlas credentials are correct
3. Ensure IP whitelist includes "0.0.0.0/0" for all access in MongoDB Atlas

## 📝 Progress Checklist
- [ ] Render environment variables added
- [ ] Render deployment completed
- [ ] Registration test passed
- [ ] Login test passed
- [ ] Socket.io connections working (order tracking)
