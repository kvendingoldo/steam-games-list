# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Get Steam API Key

1. Go to https://steamcommunity.com/dev/apikey
2. Sign in with your Steam account
3. Register a domain (you can use `localhost` for development)
4. Copy your API key

## Step 3: Configure Environment

Create a `.env` file in the root directory:

```bash
STEAM_API_KEY=your_api_key_here
PORT=3001
```

Replace `your_api_key_here` with your actual Steam API key.

## Step 4: Start the Application

### Option 1: Run Both Servers Together (Recommended)

```bash
npm run dev:all
```

This starts both the backend (port 3001) and frontend (port 5173) servers.

### Option 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Step 5: Use the Application

1. Open your browser to `http://localhost:5173`
2. Enter Steam account identifiers (Steam ID, profile URL, or username)
3. Click "Get Games List"
4. View the consolidated game library!

## Troubleshooting

### Backend won't start
- Make sure Node.js version is 18+ (has native fetch support)
- Check that port 3001 is not already in use
- Verify `.env` file exists and has `STEAM_API_KEY` set

### "No games found" error
- **Most common issue**: The Steam accounts must have **public game libraries**
  - Go to Steam → Settings → Privacy
  - Set "Game details" to "Public"
- Verify the Steam ID/profile URL is correct
- Check browser console for detailed error messages

### API Key errors
- Make sure your `.env` file is in the root directory (same level as `package.json`)
- Verify the API key doesn't have extra spaces or quotes
- Restart the backend server after changing `.env`

## Testing with Your Own Account

To test with your own Steam account:

1. Find your Steam ID:
   - Go to https://steamid.io/
   - Enter your Steam profile URL
   - Copy the "SteamID64" (the long number)

2. Make sure your game library is public:
   - Steam → Settings → Privacy → Game details → Public

3. Enter your Steam ID in the app and click "Get Games List"

