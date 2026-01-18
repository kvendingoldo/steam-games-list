import { useState, useMemo } from 'react';
import { GameWithAccounts } from '../types';

interface GameListProps {
  games: GameWithAccounts[];
}

export default function GameList({ games }: GameListProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showFilter, setShowFilter] = useState(false);

  // Extract all unique tags from games (store tags from Steam API)
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    games.forEach(game => {
      game.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [games]);

  // Extract all unique users/accounts from games
  const allUsers = useMemo(() => {
    const userSet = new Set<string>();
    games.forEach(game => {
      game.accounts.forEach(account => userSet.add(account));
    });
    return Array.from(userSet).sort();
  }, [games]);

  // Filter games based on selected tags and users
  const filteredGames = useMemo(() => {
    let filtered = games;

    // Filter by tags
    if (selectedTags.size > 0) {
      filtered = filtered.filter(game => {
        return game.tags.some(tag => selectedTags.has(tag));
      });
    }

    // Filter by users
    if (selectedUsers.size > 0) {
      filtered = filtered.filter(game => {
        return game.accounts.some(account => selectedUsers.has(account));
      });
    }

    return filtered;
  }, [games, selectedTags, selectedUsers]);

  const handleToggleTag = (tag: string) => {
    const newSelected = new Set(selectedTags);
    if (newSelected.has(tag)) {
      newSelected.delete(tag);
    } else {
      newSelected.add(tag);
    }
    setSelectedTags(newSelected);
  };

  const handleToggleUser = (user: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(user)) {
      newSelected.delete(user);
    } else {
      newSelected.add(user);
    }
    setSelectedUsers(newSelected);
  };

  const handleClearFilters = () => {
    setSelectedTags(new Set());
    setSelectedUsers(new Set());
  };

  const handleSelectAllTags = () => {
    if (selectedTags.size === allTags.length) {
      setSelectedTags(new Set());
    } else {
      setSelectedTags(new Set(allTags));
    }
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.size === allUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(allUsers));
    }
  };

  if (games.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center text-gray-500">
        No games found. Add some Steam nicknames and click "Get Games List".
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Games List ({filteredGames.length} of {games.length} games)
        </h2>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-semibold"
        >
          {showFilter ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {showFilter && (
        <div className="mb-6 space-y-4">
          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="p-4 bg-white rounded-lg shadow-md border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Filter by Tags</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAllTags}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    {selectedTags.size === allTags.length ? 'Deselect All' : 'Select All'}
                  </button>
                  {selectedTags.size > 0 && (
                    <button
                      onClick={() => setSelectedTags(new Set())}
                      className="px-3 py-1 text-sm bg-red-200 text-red-700 rounded hover:bg-red-300 transition-colors"
                    >
                      Clear Tags ({selectedTags.size})
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleToggleTag(tag)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedTags.has(tag)
                        ? 'bg-purple-500 text-white'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Filter */}
          {allUsers.length > 0 && (
            <div className="p-4 bg-white rounded-lg shadow-md border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Filter by User</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAllUsers}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    {selectedUsers.size === allUsers.length ? 'Deselect All' : 'Select All'}
                  </button>
                  {selectedUsers.size > 0 && (
                    <button
                      onClick={() => setSelectedUsers(new Set())}
                      className="px-3 py-1 text-sm bg-red-200 text-red-700 rounded hover:bg-red-300 transition-colors"
                    >
                      Clear Users ({selectedUsers.size})
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {allUsers.map((user) => (
                  <button
                    key={user}
                    onClick={() => handleToggleUser(user)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedUsers.has(user)
                        ? 'bg-green-500 text-white'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {user.length > 25 ? `${user.substring(0, 25)}...` : user}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear All Filters */}
          {(selectedTags.size > 0 || selectedUsers.size > 0) && (
            <div className="flex justify-end">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-semibold"
              >
                Clear All Filters ({selectedTags.size + selectedUsers.size})
              </button>
            </div>
          )}

          {/* Active Filters Summary */}
          {(selectedTags.size > 0 || selectedUsers.size > 0) && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Active filters:</span>
                {selectedTags.size > 0 && (
                  <span className="ml-2">
                    {selectedTags.size} tag{selectedTags.size !== 1 ? 's' : ''}
                  </span>
                )}
                {selectedUsers.size > 0 && (
                  <span className="ml-2">
                    {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {filteredGames.length === 0 && (selectedTags.size > 0 || selectedUsers.size > 0) ? (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center text-gray-500">
          No games match the selected filters. Try selecting different tags/users or clear the filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGames.map((game) => (
            <GameCard key={game.appid} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}

// Separate component for game card to handle image error state
function GameCard({ game }: { game: GameWithAccounts }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Game Picture */}
      <div className="aspect-video bg-gray-200 overflow-hidden flex items-center justify-center">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No Image Available
          </div>
        ) : (
          <img
            src={game.picture}
            alt={game.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* Game Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
          {game.name}
        </h3>

        {/* Store Tags */}
        {game.tags && game.tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {game.tags.slice(0, 10).map((tag, index) => (
                <span
                  key={`tag-${index}`}
                  className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {game.tags.length > 10 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{game.tags.length - 10}
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
  );
}

