import { GameWithAccounts } from '../types';

interface GameListProps {
  games: GameWithAccounts[];
}

export default function GameList({ games }: GameListProps) {
  if (games.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center text-gray-500">
        No games found. Add some Steam nicknames and click "Get Games List".
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Games List ({games.length} games)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <div
            key={game.appid}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Game Picture */}
            <div className="aspect-video bg-gray-200 overflow-hidden">
              <img
                src={game.picture}
                alt={game.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback image if the original fails to load
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/460x215?text=No+Image';
                }}
              />
            </div>

            {/* Game Info */}
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                {game.name}
              </h3>

              {/* Tags */}
              {game.tags.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {game.tags.slice(0, 5).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {game.tags.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{game.tags.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Accounts */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Owned by:</p>
                <div className="flex flex-wrap gap-1">
                  {game.accounts.map((account, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                    >
                      {account.length > 20 ? `${account.substring(0, 20)}...` : account}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

