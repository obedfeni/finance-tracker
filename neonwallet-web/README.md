# NeonWallet Web App v5.0

Mobile Money Finance Tracker — Built for Ghana 🇬🇭

## Features
- 🔐 PIN lock (default: 1234)
- 📊 Dashboard with live balance, charts, AI advice
- 💳 Full transaction management (add, delete, filter, search)
- 📲 SMS auto-import (paste MoMo SMS messages)
- 📈 Reports with bar/pie/line charts
- 🎯 Savings goals with progress tracking
- 📤 Export CSV / JSON
- 📱 iPhone Shortcuts API endpoint
- 🌙 Neon dark theme

## Run Locally
```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Deploy to Vercel
1. Push this folder to GitHub
2. Go to vercel.com → New Project
3. Import your GitHub repo
4. Click Deploy (no env vars needed)

## PIN
Default PIN: **1234**  
Change in Settings after login.

## iPhone Shortcut Setup
After deploying, create an Apple Shortcut:
1. Action: "Receive input from Share Sheet" (Text)
2. Action: "Get contents of URL"
   - URL: `https://your-app.vercel.app/api/sms-import`
   - Method: POST
   - Body: JSON `{ "sms": [Shortcut Input] }`
3. Action: "Show notification" → "Imported!"

Then: Long-press MoMo SMS → Share → Run Shortcut

## Supported SMS Formats
- MTN MoMo received/sent
- Telecel (Vodafone Cash)
- AirtelTigo Money
- Generic GHS amount detection
