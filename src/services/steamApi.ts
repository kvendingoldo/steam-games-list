import { GameWithAccounts } from '../types';

// Backend API base URL (proxy handles Steam API calls)
const API_BASE = '/api';

// Main function to get games for multiple users
export async function getGamesForUsers(nicknames: string[]): Promise<GameWithAccounts[]> {
  try {
    const response = await fetch(`${API_BASE}/games-for-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nicknames }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.games || [];
  } catch (error) {
    console.error('Error fetching games for users:', error);
    throw error;
  }
}

