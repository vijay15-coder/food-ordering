# Deploy Frontend to Vercel

Your frontend is now configured to work with your Render backend!

## ✅ What's Been Set Up

1. **API Configuration** - Created centralized API URL management in `frontend/src/config/api.js`
2. **Environment Variables** - Set up for development and production:
   - `.env.local` - Local development (localhost:5000)
   - `.env.production` - Production (Render backend)
3. **Vercel Configuration** - `vercel.json` with proper build settings and rewrites
4. **.gitignore** - Excludes sensitive files from git

## 📋 Deploy to Vercel (Step by Step)

### Option 1: Using Vercel Dashboard (Recommended)

1. **Go to https://vercel.com/signup** (or login if you have account)
2. **Click "Add New..." → "Project"**
3. **Import your GitHub repository**
   - Select `food-ordering` repo
4. **Configure Project:**
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Add Environment Variables:**
   - Key: `VITE_API_URL`
   - Value: `https://food-ordering-s1ry.onrender.com`
6. **Click "Deploy"** ✅

### Option 2: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel

# For production
vercel --prod
```

## 🔑 Environment Variables for Vercel

In Vercel Dashboard → Project Settings → Environment Variables:

```
VITE_API_URL = https://food-ordering-s1ry.onrender.com
```

## 🧪 Testing After Deployment

1. Visit your Vercel deployment URL
2. Test Login → Should work with Render backend
3. Test Order placement → Check if order appears in admin panel
4. Test Order tracking → Should work with Render backend

## 📁 Project Structure

```
frontend/
├── src/
│   ├── config/
│   │   └── api.js          ← API URL configuration
│   ├── pages/              ← All pages use new API_BASE_URL
│   ├── components/         ← Menu component uses new API_BASE_URL
│   └── contexts/           ← Auth and Cart contexts
├── .env.local              ← Development config
├── .env.production         ← Production config
├── .env.example            ← Template
├── vercel.json             ← Vercel deployment config
└── .gitignore              ← Git ignore rules
```

## 🚀 After Deployment

Your URLs will be:
- **Frontend:** `https://your-project.vercel.app`
- **Backend:** `https://food-ordering-s1ry.onrender.com` (already deployed)
- **Backend Admin API:** `https://food-ordering-s1ry.onrender.com/api/...`

## ⚠️ Common Issues & Solutions

### CORS Errors
- Backend needs to allow Vercel domain in CORS settings
- Contact backend CORS configuration

### 404 on Route Refresh
- Vercel rewrites are configured in `vercel.json` ✅

### Environment Variables Not Working
- Make sure `VITE_API_URL` is set in Vercel dashboard
- Rebuild project after adding env vars

## 📞 Support

- Check `frontend/.env.example` for required env vars
- All API calls now use `API_BASE_URL` from `frontend/src/config/api.js`
- Socket.io connections also use the same `API_BASE_URL`
