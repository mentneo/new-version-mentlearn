# Mentlearn Backend - Render Deployment Guide

## Prerequisites
1. Create a Render account at https://render.com
2. Have your Firebase service account JSON ready
3. Have your Razorpay API keys ready

## Deployment Steps

### 1. Connect Repository
1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `yeduruabhiram/mindneox.ai`
4. Select the repository

### 2. Configure Service
- **Name**: `mentlearn-backend`
- **Region**: Oregon (US West) or closest to your users
- **Branch**: `main`
- **Root Directory**: `new-version-mentlearn/backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free (or paid for better performance)

### 3. Set Environment Variables

Go to "Environment" tab and add these variables:

#### Required Variables:

1. **NODE_ENV**
   ```
   production
   ```

2. **PORT**
   ```
   10000
   ```
   (Render uses port 10000 by default)

3. **FRONTEND_ORIGIN**
   ```
   https://your-frontend-domain.vercel.app,https://www.your-domain.com
   ```
   (Comma-separated list of allowed frontend origins)

4. **RAZORPAY_KEY_ID**
   ```
   rzp_live_RW6hQg5iL5Thm2
   ```
   (Your Razorpay Live Key ID)

5. **RAZORPAY_SECRET**
   ```
   your_razorpay_secret_key
   ```
   (Your Razorpay Live Secret - keep this secure!)

6. **FIREBASE_SERVICE_ACCOUNT_JSON**
   ```json
   {"type":"service_account","project_id":"mentor-app-238c6",...}
   ```
   (Entire Firebase service account JSON as a single-line string)

#### Optional Variables:

7. **MAX_HEADER_BYTES**
   ```
   16384
   ```
   (16KB - default header size limit)

8. **JSON_LIMIT**
   ```
   10mb
   ```
   (Request body size limit)

### 4. Health Check Configuration
- **Health Check Path**: `/api/health`
- This is automatically configured in `render.yaml`

### 5. Deploy
1. Click "Create Web Service"
2. Render will automatically:
   - Pull your code
   - Run `npm install`
   - Start the server with `npm start`
   - Monitor health via `/api/health`

### 6. Get Your Backend URL
After deployment, Render will provide a URL like:
```
https://mentlearn-backend.onrender.com
```

### 7. Update Frontend Configuration
Update your frontend environment variables with the new backend URL:
```
REACT_APP_API_URL=https://mentlearn-backend.onrender.com
```

## Testing Deployment

### 1. Health Check
```bash
curl https://mentlearn-backend.onrender.com/api/health
```
Should return: `{"status":"ok"}`

### 2. Extended Health Check
```bash
curl https://mentlearn-backend.onrender.com/_health
```
Should return: `{"ok":true,"uptime":123.456}`

### 3. Test Razorpay Endpoint
```bash
curl https://mentlearn-backend.onrender.com/api/razorpay/create-order \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{"courseId":"test-course","amount":100}'
```

## Common Issues & Solutions

### Issue 1: "Firebase credentials not found"
**Solution**: Make sure `FIREBASE_SERVICE_ACCOUNT_JSON` is set correctly as a single-line JSON string in environment variables.

### Issue 2: "CORS not allowed"
**Solution**: Add your frontend domain to `FRONTEND_ORIGIN` environment variable. Use comma-separated values for multiple domains.

### Issue 3: "Port already in use"
**Solution**: Render manages ports automatically. Don't set `PORT` manually - let Render assign it (usually 10000).

### Issue 4: Build fails with "npm ERR!"
**Solution**: 
- Check Node.js version matches `package.json` engines
- Run `npm install` locally to verify dependencies
- Check Render build logs for specific error messages

### Issue 5: Server starts but crashes
**Solution**: 
- Check "Logs" tab in Render dashboard
- Verify all required environment variables are set
- Test Firebase credentials locally first

### Issue 6: WebSocket connections fail
**Solution**: 
- Render Free tier may have WebSocket limitations
- Upgrade to paid plan for full WebSocket support
- Check CORS settings allow WebSocket upgrade

## Monitoring

### Render Dashboard
- **Metrics**: CPU, Memory, Bandwidth usage
- **Logs**: Real-time server logs
- **Events**: Deployment history

### Health Monitoring
Set up external monitoring (UptimeRobot, Pingdom) to ping:
```
https://mentlearn-backend.onrender.com/api/health
```
Every 5 minutes to keep free tier warm and monitor uptime.

## Scaling

### Free Tier Limitations
- Spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free

### Upgrade Benefits
- Always-on (no spin-down)
- Faster response times
- More CPU/RAM
- Full WebSocket support
- Custom domains

## Security Best Practices

1. **Never commit secrets**: Use Render environment variables
2. **Rotate keys regularly**: Update Razorpay and Firebase credentials periodically
3. **Enable HTTPS only**: Render provides SSL certificates automatically
4. **Monitor logs**: Check for suspicious activity
5. **Rate limiting**: Consider adding rate limiting middleware for production
6. **IP allowlisting**: Configure Firebase IP restrictions if needed

## Troubleshooting

### Check Logs
```bash
# In Render Dashboard > Logs tab
# Look for startup errors, crashes, or warnings
```

### Test Locally with Production Settings
```bash
# Set production environment variables
export NODE_ENV=production
export PORT=5001
export FRONTEND_ORIGIN=http://localhost:3000
# ... other vars

# Run server
npm start
```

### Verify Environment Variables
In Render Dashboard > Environment tab, ensure all variables are set correctly.

## Automatic Deploys

Render automatically redeploys when you push to `main` branch:
1. Push code: `git push origin main`
2. Render detects changes
3. Runs build command
4. Deploys new version
5. Health check confirms deployment

## Rollback

If deployment fails:
1. Go to Render Dashboard > Events
2. Find previous successful deployment
3. Click "Redeploy"

## Support

- Render Docs: https://render.com/docs
- Render Status: https://status.render.com
- Firebase Docs: https://firebase.google.com/docs
- Razorpay Docs: https://razorpay.com/docs

---

## Quick Deployment Checklist

- [ ] Repository connected to Render
- [ ] Service configured (Node.js, npm start)
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` set
- [ ] `RAZORPAY_KEY_ID` set
- [ ] `RAZORPAY_SECRET` set
- [ ] `FRONTEND_ORIGIN` set with frontend URL
- [ ] Health check path configured: `/api/health`
- [ ] Deployment successful
- [ ] Health endpoint returns 200 OK
- [ ] Frontend can reach backend API
- [ ] Payment flow tested end-to-end
- [ ] Monitoring set up

**Your backend is now deployed on Render! 🚀**
