# CRITICAL: MongoDB Atlas Network Access Fix

## Problem
Render cannot connect to MongoDB Atlas because the IP address is not whitelisted.

## Solution: Add IP Whitelist to MongoDB Atlas

### Step 1: Go to MongoDB Atlas
https://cloud.mongodb.com/

### Step 2: Navigate to Network Access
1. Click your **Project**
2. In left sidebar, click **Security** 
3. Click **Network Access** (or **IP Whitelist** in older versions)

### Step 3: Add IP Address
1. Click **"+ ADD IP ADDRESS"** button (top right)
2. In the dialog:
   - **Option A (Recommended):** Enter `0.0.0.0/0` (allows all IPs - only for development)
   - **Option B (Secure):** Enter `0.0.0.0` (same as above)
3. Click **"CONFIRM"**

### Step 4: Verify
You should see a new entry in the Network Access list with status "Active"

### Step 5: Deploy on Render
Go back to Render → Deployments → Deploy latest commit

## Expected Result
After deployment:
- Server should show: `✅ MongoDB connected successfully`
- OR: No more `querySrv ENOTFOUND` errors

## Security Note
Using `0.0.0.0/0` allows any IP to connect. For production, use Render's static IP or your organization's IP range.

## Troubleshooting
If still not working:
1. Wait 30 seconds for changes to propagate
2. Try deploying again on Render
3. Check MongoDB Atlas shows the IP entry as "Active"
4. Verify connection string username/password are correct
