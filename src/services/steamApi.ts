import { GameWithAccounts } from '../types';

// Backend API base URL (proxy handles Steam API calls and CORS)
const API_BASE = '/api';

// Get API key from localStorage
function getApiKey(): string | null {
  return localStorage.getItem('steam_api_key');
}

// Response type from backend
export interface GamesResponse {
  games: GameWithAccounts[];
  errors?: string[];
  warning?: string;
}

// Main function to get games for multiple users
export async function getGamesForUsers(nicknames: string[]): Promise<GamesResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Steam API key is required. Please enter your API key in the settings.');
  }

  try {
    const response = await fetch(`${API_BASE}/games-for-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nicknames, apiKey }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Return both games and any errors/warnings from the server
    return {
      games: data.games || [],
      errors: data.errors || [],
      warning: data.warning,
    };
  } catch (error) {
    console.error('Error fetching games for users:', error);
    throw error;
  }
}

// Get Steam ID by username (exported for direct use if needed)
export async function getSteamIdByUsername(username: string): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Steam API key is required. Please enter your API key in the settings.');
  }

  try {
    const response = await fetch(`${API_BASE}/resolve-steam-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier: username, apiKey }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.steamId || null;
  } catch (error) {
    console.error('Error resolving Steam ID:', error);
    throw error;
  }
}
