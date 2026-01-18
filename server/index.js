import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

const STEAM_API_BASE = 'https://api.steampowered.com';
const STEAM_STORE_API = 'https://store.steampowered.com/api';
const STEAM_API_KEY = process.env.STEAM_API_KEY;

// Helper function to make Steam API requests
async function steamApiRequest(endpoint, params = {}) {
  const queryParams = new URLSearchParams({
    ...params,
    ...(STEAM_API_KEY && { key: STEAM_API_KEY }),
    format: 'json',
  });

  const url = `${STEAM_API_BASE}${endpoint}?${queryParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Steam API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Helper function to resolve Steam ID from username/vanity URL
async function resolveSteamIdFromUsername(username) {
  if (!STEAM_API_KEY) {
    throw new Error('Steam API key not configured');
  }

  try {
    const data = await steamApiRequest('/ISteamUser/ResolveVanityURL/v0001/', {
      vanityurl: username,
    });

    // Steam API returns success: 1 when found, success: 42 when not found
    if (data.response?.success === 1 && data.response?.steamid) {
      return data.response.steamid;
    } else if (data.response?.success === 42) {
      // Vanity URL not found - try fetching profile page as fallback
      console.log(`Vanity URL not found via API for "${username}", trying profile page...`);
      return await resolveSteamIdFromProfilePage(username);
    }

    return null;
  } catch (error) {
    console.error(`Error resolving username "${username}":`, error.message);
    // Try profile page as fallback
    try {
      return await resolveSteamIdFromProfilePage(username);
    } catch (fallbackError) {
      throw error; // Throw original error
    }
  }
}

// Fallback: Try to extract Steam ID from profile page HTML
async function resolveSteamIdFromProfilePage(username) {
  try {
    const profileUrl = `https://steamcommunity.com/id/${username}`;
    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Try to extract Steam ID from various patterns in the HTML
    // Pattern 1: "steamid":"7656119..."
    const steamIdMatch1 = html.match(/"steamid":"(\d{17})"/);
    if (steamIdMatch1) {
      return steamIdMatch1[1];
    }

    // Pattern 2: g_rgProfileData = {"steamid":"7656119..."
    const steamIdMatch2 = html.match(/g_rgProfileData\s*=\s*\{[^}]*"steamid"\s*:\s*"(\d{17})"/);
    if (steamIdMatch2) {
      return steamIdMatch2[1];
    }

    // Pattern 3: data-steamid="7656119..."
    const steamIdMatch3 = html.match(/data-steamid="(\d{17})"/);
    if (steamIdMatch3) {
      return steamIdMatch3[1];
    }

    // Pattern 4: Look for redirect to /profiles/7656119...
    const redirectMatch = html.match(/\/profiles\/(\d{17})/);
    if (redirectMatch) {
      return redirectMatch[1];
    }

    return null;
  } catch (error) {
    console.error(`Error fetching profile page for "${username}":`, error.message);
    return null;
  }
}

// Resolve Steam ID from vanity URL or username
app.post('/api/resolve-steam-id', async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ error: 'Identifier is required' });
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
      if (vanityMatch && STEAM_API_KEY) {
        // Resolve vanity URL to Steam ID
        const data = await steamApiRequest('/ISteamUser/ResolveVanityURL/v0001/', {
          vanityurl: vanityMatch[1],
        });

        if (data.response?.steamid) {
          return res.json({ steamId: data.response.steamid });
        }
      }
    }

    // Try to resolve as vanity URL if it's a username
    if (STEAM_API_KEY) {
      try {
        const steamId = await resolveSteamIdFromUsername(identifier);
        if (steamId) {
          return res.json({ steamId });
        }
      } catch (error) {
        return res.status(500).json({
          error: `Failed to resolve username: ${error.message}`
        });
      }
    }

    res.status(404).json({
      error: 'Could not resolve Steam ID. Make sure the username is a valid Steam vanity URL, or use Steam ID (numeric) or full profile URL.'
    });
  } catch (error) {
    console.error('Error resolving Steam ID:', error);
    res.status(500).json({ error: error.message || 'Failed to resolve Steam ID' });
  }
});

// Get user's game library
app.post('/api/user-games', async (req, res) => {
  try {
    const { steamId } = req.body;

    if (!steamId) {
      return res.status(400).json({ error: 'Steam ID is required' });
    }

    if (!STEAM_API_KEY) {
      return res.status(500).json({
        error: 'Steam API key not configured. Please set STEAM_API_KEY environment variable.'
      });
    }

    const data = await steamApiRequest('/IPlayerService/GetOwnedGames/v0001/', {
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
    const { nicknames } = req.body;

    if (!nicknames || !Array.isArray(nicknames) || nicknames.length === 0) {
      return res.status(400).json({ error: 'Nicknames array is required' });
    }

    if (!STEAM_API_KEY) {
      return res.status(500).json({
        error: 'Steam API key not configured. Please set STEAM_API_KEY environment variable.'
      });
    }

    const gameMap = new Map();

    for (const nickname of nicknames) {
      try {
        // Resolve Steam ID
        let steamId = null;

        if (/^\d+$/.test(nickname)) {
          steamId = nickname;
        } else if (nickname.includes('steamcommunity.com')) {
          const steamIdMatch = nickname.match(/\/profiles\/(\d+)/);
          if (steamIdMatch) {
            steamId = steamIdMatch[1];
          } else {
            const vanityMatch = nickname.match(/\/id\/([^/]+)/);
            if (vanityMatch) {
              const resolveData = await steamApiRequest('/ISteamUser/ResolveVanityURL/v0001/', {
                vanityurl: vanityMatch[1],
              });
              if (resolveData.response?.steamid) {
                steamId = resolveData.response.steamid;
              }
            }
          }
        } else {
          // Try to resolve as vanity URL/username
          try {
            steamId = await resolveSteamIdFromUsername(nickname);
            if (!steamId) {
              console.warn(`Could not resolve Steam ID for username: ${nickname}`);
              console.warn(`  - Make sure the username is a valid Steam vanity URL`);
              console.warn(`  - Or use Steam ID (numeric) or full profile URL instead`);
              continue;
            }
          } catch (error) {
            console.error(`Error resolving username "${nickname}":`, error.message);
            continue;
          }
        }

        if (!steamId) {
          console.warn(`Could not resolve Steam ID for: ${nickname}`);
          continue;
        }

        // Get user's games
        const gamesData = await steamApiRequest('/IPlayerService/GetOwnedGames/v0001/', {
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

              const gameWithAccounts = {
                appid: game.appid,
                name: game.name,
                picture: gameDetails?.header_image ||
                  `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_logo_url}.jpg`,
                tags: gameDetails?.categories?.map((c) => c.description) ||
                      gameDetails?.genres?.map((g) => g.description) || [],
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
        console.error(`Error processing user ${nickname}:`, error);
      }
    }

    res.json({ games: Array.from(gameMap.values()) });
  } catch (error) {
    console.error('Error fetching games for users:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch games' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!STEAM_API_KEY,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (!STEAM_API_KEY) {
    console.warn('⚠️  WARNING: STEAM_API_KEY not set. Some features may not work.');
    console.warn('   Get your API key at: https://steamcommunity.com/dev/apikey');
  }
});

