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

### Option 1: Docker (Recommended - One Command)

1. Build and run with Docker:
```bash
docker-compose up --build
```

2. Open your browser to `http://localhost:3001`

3. Enter your Steam API Key in the UI:
   - Get your API key at https://steamcommunity.com/dev/apikey
   - Enter it in the API key input field at the top of the page
   - The key will be saved in your browser's localStorage

The Docker setup automatically:
- Builds the frontend
- Runs the backend server
- Serves the frontend from the backend
- Everything runs on port 3001

### Option 2: Local Development

1. Install dependencies:
```bash
npm install
```

2. Get a Steam API Key:
   - Go to https://steamcommunity.com/dev/apikey
   - Register and get your API key

3. Start both servers:

   **Option A: Run both together (Recommended)**
   ```bash
   npm run dev:all
   ```
   This starts both the backend (port 3001) and frontend (port 5173) servers.

   **Option B: Run separately**

   Terminal 1 - Backend:
   ```bash
   npm run dev:server
   ```

   Terminal 2 - Frontend:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

5. Enter your Steam API Key in the UI:
   - Enter it in the API key input field at the top of the page
   - The key will be saved in your browser's localStorage
   - The key is sent to the backend server (never exposed to third parties)

## Important Notes

### Steam API Key Required

This application requires a Steam API key to function. The API key is:
- Entered directly in the UI
- Stored securely in your browser's localStorage
- Sent to the backend server (which handles all Steam API calls)
- Never exposed to third-party services (only used by your backend to call Steam API)

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
│   └── index.js          # Express backend server (handles Steam API & CORS)
├── src/
│   ├── components/          # React components
│   │   ├── ApiKeyInput.tsx  # API key input component
│   │   ├── NicknameInput.tsx  # Input form for Steam nicknames
│   │   └── GameList.tsx       # Display component for games
│   ├── services/        # API services
│   │   └── steamApi.ts  # Frontend API client (calls backend)
│   ├── types.ts         # TypeScript type definitions
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
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
- **Storage**: Browser localStorage (for API key)

## Troubleshooting

### "No games found" error
- Make sure the Steam accounts have **public game libraries**
- Verify your Steam API key is entered correctly in the UI
- Try using Steam IDs directly (numeric format) instead of usernames
- Check browser console for detailed error messages

### Backend connection errors
- Ensure the backend server is running: `npm run dev:server`
- Check that the backend is accessible at `http://localhost:3001`
- Verify the API proxy is configured correctly in `vite.config.ts`

### API Key errors
- Make sure you've entered a valid Steam API key in the UI
- The API key is stored in localStorage - try clearing it and re-entering
- Verify your API key is valid at https://steamcommunity.com/dev/apikey

### Username resolution issues
- The backend tries multiple methods to resolve usernames (Steam API, XML API, HTML scraping)
- If a username doesn't resolve, try using the Steam ID instead
- Or use the full profile URL: `https://steamcommunity.com/id/username`
