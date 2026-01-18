import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend build (only in production/Docker)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
}

const STEAM_API_BASE = 'https://api.steampowered.com';
const STEAM_STORE_API = 'https://store.steampowered.com/api';

// Helper function to make Steam API requests
async function steamApiRequest(endpoint, params = {}) {
  const queryParams = new URLSearchParams({
    ...params,
    format: 'json',
  });

  const url = `${STEAM_API_BASE}${endpoint}?${queryParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Steam API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Resolve Steam ID from username/vanity URL
async function resolveSteamIdFromUsername(username, apiKey) {
  if (!apiKey) {
    throw new Error('Steam API key is required');
  }

  console.log(`Resolving Steam ID for username: "${username}"`);

  // Method 1: Try Steam API ResolveVanityURL (most reliable if vanity URL is set)
  try {
    console.log(`  Method 1: Trying Steam API ResolveVanityURL...`);
    const data = await steamApiRequest('/ISteamUser/ResolveVanityURL/v0001/', {
      key: apiKey,
      vanityurl: username,
    });

    if (data.response?.success === 1 && data.response?.steamid) {
      const steamId = data.response.steamid;
      console.log(`  ✓ Resolved via Steam API: ${steamId}`);
      return steamId;
    } else if (data.response?.success === 42) {
      console.log(`  ✗ Steam API: Vanity URL not found, trying other methods...`);
    }
  } catch (error) {
    console.warn(`  ✗ Steam API resolution failed:`, error.message);
  }

  // Method 2: Try XML API (works even if vanity URL not set)
  try {
    console.log(`  Method 2: Trying Steam XML API...`);
    const xmlUrl = `https://steamcommunity.com/id/${encodeURIComponent(username)}?xml=1`;
    const response = await fetch(xmlUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (response.ok) {
      const text = await response.text();
      // Try multiple XML patterns
      const xmlPatterns = [
        /<steamID64>(\d{17})<\/steamID64>/i,
        /<steamID64[^>]*>(\d{17})<\/steamID64>/i,
        /steamID64[^>]*>(\d{17})</i,
      ];

      for (const pattern of xmlPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          const steamId = match[1];
          if (steamId.startsWith('7656119') && steamId.length === 17 && /^\d{17}$/.test(steamId)) {
            console.log(`  ✓ Resolved via XML API: ${steamId}`);
            return steamId;
          }
        }
      }
    } else if (response.status === 404) {
      console.log(`  ✗ XML API: Profile not found (404)`);
    }
  } catch (error) {
    console.warn(`  ✗ XML API resolution failed:`, error.message);
  }

  // Method 3: Try HTML scraping (fallback method)
  try {
    console.log(`  Method 3: Trying HTML page scraping...`);
    const profileUrl = `https://steamcommunity.com/id/${encodeURIComponent(username)}`;
    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (response.ok) {
      const html = await response.text();
      const patterns = [
        /"steamid"\s*:\s*"(\d{17})"/gi,
        /g_rgProfileData\s*=\s*\{[^}]*"steamid"\s*:\s*"(\d{17})"/gi,
        /data-steamid\s*=\s*"(\d{17})"/gi,
        /\/profiles\/(\d{17})/g,
        /steamid64\s*:\s*"(\d{17})"/gi,
        /steamID64\s*:\s*"(\d{17})"/gi,
        /steamID64["\s]*[:=]["\s]*(\d{17})/gi,
        /href=["']\/profiles\/(\d{17})/gi,
      ];

      for (const pattern of patterns) {
        const matches = html.matchAll(pattern);
        for (const match of matches) {
          if (match && match[1]) {
            const steamId = match[1];
            if (steamId.startsWith('7656119') && steamId.length === 17 && /^\d{17}$/.test(steamId)) {
              console.log(`  ✓ Resolved via HTML scraping: ${steamId}`);
              return steamId;
            }
          }
        }
      }
    } else if (response.status === 404) {
      console.log(`  ✗ HTML scraping: Profile not found (404)`);
    }
  } catch (error) {
    console.warn(`  ✗ HTML scraping failed:`, error.message);
  }

  console.log(`  ✗ All methods failed for username: "${username}"`);
  return null;
}

// Resolve Steam ID endpoint
app.post('/api/resolve-steam-id', async (req, res) => {
  try {
    const { identifier, apiKey } = req.body;

    if (!identifier) {
      return res.status(400).json({ error: 'Identifier is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'Steam API key is required' });
    }

    // Check if it's already a Steam ID (numeric)
    if (/^\d+$/.test(identifier)) {
      return res.json({ steamId: identifier });
    }

    // Extract Steam ID from profile URL
    if (identifier.includes('steamcommunity.com')) {
      const steamIdMatch = identifier.match(/\/profiles\/(\d+)/);
      if (steamIdMatch) {
        return res.json({ steamId: steamIdMatch[1] });
      }

      const vanityMatch = identifier.match(/\/id\/([^/]+)/);
      if (vanityMatch) {
        const steamId = await resolveSteamIdFromUsername(vanityMatch[1], apiKey);
        if (steamId) {
          return res.json({ steamId });
        }
      }
    }

    // Try to resolve as username/vanity URL
    const steamId = await resolveSteamIdFromUsername(identifier, apiKey);
    if (steamId) {
      return res.json({ steamId });
    }

    res.status(404).json({
      error: `Could not resolve Steam ID for "${identifier}". Make sure the username is correct.`
    });
  } catch (error) {
    console.error('Error resolving Steam ID:', error);
    res.status(500).json({ error: error.message || 'Failed to resolve Steam ID' });
  }
});

// Get user's game library
app.post('/api/user-games', async (req, res) => {
  try {
    const { steamId, apiKey } = req.body;

    if (!steamId) {
      return res.status(400).json({ error: 'Steam ID is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'Steam API key is required' });
    }

    const data = await steamApiRequest('/IPlayerService/GetOwnedGames/v0001/', {
      key: apiKey,
      steamid: steamId,
      include_appinfo: 'true',
    });

    res.json({ games: data.response?.games || [] });
  } catch (error) {
    console.error('Error fetching user games:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch user games' });
  }
});

// Get game details including tags
app.get('/api/game-details/:appid', async (req, res) => {
  try {
    const { appid } = req.params;

    const response = await fetch(`${STEAM_STORE_API}/appdetails?appids=${appid}&l=en`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const gameData = data[appid]?.data;

    if (!gameData || !gameData.success) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({
      appid: parseInt(appid),
      name: gameData.name,
      short_description: gameData.short_description,
      header_image: gameData.header_image,
      genres: gameData.genres,
      tags: gameData.categories || gameData.genres,
    });
  } catch (error) {
    console.error('Error fetching game details:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch game details' });
  }
});

// Batch endpoint to get games for multiple users
app.post('/api/games-for-users', async (req, res) => {
  try {
    const { nicknames, apiKey } = req.body;

    if (!nicknames || !Array.isArray(nicknames) || nicknames.length === 0) {
      return res.status(400).json({ error: 'Nicknames array is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'Steam API key is required' });
    }

    const gameMap = new Map();
    const errors = [];

    for (const nickname of nicknames) {
      try {
        // Resolve Steam ID
        let steamId = null;

        if (/^\d+$/.test(nickname)) {
          // Already a Steam ID
          steamId = nickname;
          console.log(`Using Steam ID directly: ${steamId}`);
        } else if (nickname.includes('steamcommunity.com')) {
          // Extract from profile URL
          const steamIdMatch = nickname.match(/\/profiles\/(\d+)/);
          if (steamIdMatch) {
            steamId = steamIdMatch[1];
            console.log(`Extracted Steam ID from profile URL: ${steamId}`);
          } else {
            const vanityMatch = nickname.match(/\/id\/([^/]+)/);
            if (vanityMatch) {
              console.log(`Resolving username from profile URL: ${vanityMatch[1]}`);
              steamId = await resolveSteamIdFromUsername(vanityMatch[1], apiKey);
            }
          }
        } else {
          // Try to resolve as username/vanity URL
          console.log(`Resolving username: ${nickname}`);
          steamId = await resolveSteamIdFromUsername(nickname, apiKey);
        }

        if (!steamId) {
          const errorMsg = `Could not resolve Steam ID for "${nickname}". Make sure the username is correct and the user has a public profile.`;
          console.warn(errorMsg);
          errors.push(errorMsg);
          continue; // Skip this user but continue with others
        }

        // Get user's games
        const gamesData = await steamApiRequest('/IPlayerService/GetOwnedGames/v0001/', {
          key: apiKey,
          steamid: steamId,
          include_appinfo: 'true',
        });

        const games = gamesData.response?.games || [];

        // Process each game
        for (const game of games) {
          if (!gameMap.has(game.appid)) {
            // Fetch game details
            try {
              const detailsResponse = await fetch(
                `${STEAM_STORE_API}/appdetails?appids=${game.appid}&l=en`
              );
              const detailsData = await detailsResponse.json();
              const gameDetails = detailsData[game.appid.toString()]?.data;

              // Get store tags (categories/genres)
              const storeTags = gameDetails?.categories?.map((c) => c.description) ||
                                gameDetails?.genres?.map((g) => g.description) || [];

              const gameWithAccounts = {
                appid: game.appid,
                name: game.name,
                picture: gameDetails?.header_image ||
                  `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_logo_url}.jpg`,
                tags: storeTags,
                userTags: [],
                accounts: [],
              };

              gameMap.set(game.appid, gameWithAccounts);
            } catch (error) {
              // If details fetch fails, use basic game info
              const gameWithAccounts = {
                appid: game.appid,
                name: game.name,
                picture: `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_logo_url}.jpg`,
                tags: [],
                userTags: [],
                accounts: [],
              };
              gameMap.set(game.appid, gameWithAccounts);
            }
          }

          const gameWithAccounts = gameMap.get(game.appid);
          if (!gameWithAccounts.accounts.includes(nickname)) {
            gameWithAccounts.accounts.push(nickname);
          }
        }
      } catch (error) {
        const errorMsg = `Error processing user "${nickname}": ${error.message || error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    // Return games and any errors
    const response = { games: Array.from(gameMap.values()) };
    if (errors.length > 0) {
      response.errors = errors;
      response.warning = `${errors.length} user(s) could not be processed.`;
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching games for users:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch games' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve frontend for all non-API routes (only in production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`Frontend served from /dist`);
  }
});

