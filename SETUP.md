# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start the Application

```bash
npm run dev
```

## Step 3: Get Steam API Key

1. Go to https://steamcommunity.com/dev/apikey
2. Sign in with your Steam account
3. Register a domain (you can use `localhost` for development)
4. Copy your API key

## Step 4: Enter API Key in UI

1. Open your browser to `http://localhost:5173`
2. Enter your Steam API key in the input field at the top of the page
3. Click "Save" - the key will be stored in your browser's localStorage

## Step 5: Use the Application

1. Enter Steam account identifiers (Steam ID, profile URL, or username)
2. Click "Get Games List"
3. View the consolidated game library!

## Troubleshooting

### "No games found" error
- **Most common issue**: The Steam accounts must have **public game libraries**
  - Go to Steam → Settings → Privacy
  - Set "Game details" to "Public"
- Verify the Steam ID/profile URL is correct
- Make sure you've entered a valid Steam API key
- Check browser console for detailed error messages

### API Key errors
- Make sure you've entered the API key correctly in the UI
- Try clearing the stored key and re-entering it
- Verify your API key is valid at https://steamcommunity.com/dev/apikey

### Username resolution issues
- If a username doesn't resolve, try using the Steam ID instead
- Or use the full profile URL: `https://steamcommunity.com/id/username`

## Testing with Your Own Account

To test with your own Steam account:

1. Find your Steam ID:
   - Go to https://steamid.io/
   - Enter your Steam profile URL
   - Copy the "SteamID64" (the long number)

2. Make sure your game library is public:
   - Steam → Settings → Privacy → Game details → Public

3. Enter your Steam ID (or username) in the app and click "Get Games List"
