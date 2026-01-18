import { useState } from 'react';
import NicknameInput from './components/NicknameInput';
import GameList from './components/GameList';
import ApiKeyInput from './components/ApiKeyInput';
import { GameWithAccounts } from './types';
import { getGamesForUsers } from './services/steamApi';

function App() {
  const [games, setGames] = useState<GameWithAccounts[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (nicknames: string[]) => {
    setIsLoading(true);
    setError(null);
    setGames([]);

    try {
      const result = await getGamesForUsers(nicknames);

      setGames(result.games);

      // Check if result has errors (from backend)
      if (result.errors && result.errors.length > 0) {
        const errorMessages = result.errors.join('\n');
        if (result.games.length > 0) {
          // Show warning but still display games
          setError(`Warning: Some users could not be processed:\n${errorMessages}\n\nShowing games from successfully processed users.`);
        } else {
          // No games found, show full error
          setError(`No games found. ${result.warning || ''}\n\nErrors:\n${errorMessages}`);
        }
      } else if (result.games.length === 0) {
        setError('No games found. Make sure the usernames are valid and the accounts have public game libraries.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching games.');
      console.error('Error fetching games:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Steam Games List
          </h1>
          <p className="text-gray-600">
            Compare game libraries across multiple Steam accounts
          </p>
        </header>

        <div className="mb-8">
          <ApiKeyInput onApiKeyChange={() => {}} />
        </div>

        <div className="mb-8">
          <NicknameInput onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {error && (
          <div className="w-full max-w-4xl mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-semibold mb-2">
              {error.includes('Warning:') ? '⚠️ Warning:' : '❌ Error:'}
            </p>
            <pre className="whitespace-pre-wrap text-sm font-sans">{error}</pre>
            {!error.includes('Warning:') && (
              <p className="mt-2 text-sm">
                Make sure you have entered a valid Steam API key above and the backend server is running.
              </p>
            )}
          </div>
        )}

        {isLoading && (
          <div className="w-full max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading games...</p>
          </div>
        )}

        {!isLoading && games.length > 0 && (
          <GameList games={games} />
        )}
      </div>
    </div>
  );
}

export default App;

