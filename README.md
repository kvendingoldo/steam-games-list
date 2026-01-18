# Steam Games List

A React frontend application that allows you to enter multiple Steam nicknames and get a consolidated list of games showing:
- Game picture/cover image
- Game name
- Tags/genres
- Which accounts own each game

## Features

- Add multiple Steam accounts (by Steam ID, profile URL, or username)
- View consolidated game library across all accounts
- See game images, tags, and ownership information
- Modern, responsive UI built with React, TypeScript, and Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Get a Steam API Key:
   - Go to https://steamcommunity.com/dev/apikey
   - Register and get your API key

3. Configure environment variables:
   - Copy `.env.example` to `.env` (or create `.env` file)
   - Add your Steam API key:
   ```
   STEAM_API_KEY=your_steam_api_key_here
   PORT=3001
   ```

4. Start the backend server (in one terminal):
```bash
npm run dev:server
```

5. Start the frontend development server (in another terminal):
```bash
npm run dev
```

   Or run both together:
```bash
npm run dev:all
```

6. Open your browser to the URL shown in the terminal (usually `http://localhost:5173`)

## Important Notes

### Steam API Key Required

This application requires a Steam API key to function. The backend server acts as a proxy to:
- Securely store your Steam API key
- Make API calls to Steam on behalf of the frontend
- Handle CORS restrictions
- Resolve Steam IDs from usernames/vanity URLs

### Supported Input Formats

You can enter Steam accounts in multiple formats:
- **Steam ID** (numeric): `76561198000000000`
- **Profile URL**: `https://steamcommunity.com/profiles/76561198000000000`
- **Vanity URL**: `https://steamcommunity.com/id/username`
- **Username** (if vanity URL is set): `username`

### Game Library Visibility

**Important**: The Steam accounts you're querying must have **public game libraries** for the API to return their games. You can check/change this in Steam Settings → Privacy → Game Details.

## Project Structure

```
├── server/
│   └── index.js       # Express backend server (Steam API proxy)
├── src/
│   ├── components/       # React components
│   │   ├── NicknameInput.tsx  # Input form for Steam nicknames
│   │   └── GameList.tsx       # Display component for games
│   ├── services/        # API services
│   │   └── steamApi.ts  # Frontend API client (calls backend)
│   ├── types.ts         # TypeScript type definitions
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── .env                 # Environment variables (create from .env.example)
└── package.json         # Dependencies and scripts
```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, CORS
- **API**: Steam Web API

## Troubleshooting

### "No games found" error
- Make sure the Steam accounts have **public game libraries**
- Verify your Steam API key is set correctly in `.env`
- Check that the backend server is running on port 3001
- Try using Steam IDs directly (numeric format) instead of usernames

### Backend connection errors
- Ensure the backend server is running: `npm run dev:server`
- Check that the API key is set in `.env` file
- Verify the backend is accessible at `http://localhost:3001`

### CORS errors
- The backend handles CORS automatically
- Make sure you're accessing the frontend through Vite dev server (not file://)
