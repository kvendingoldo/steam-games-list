import { useState } from 'react';

interface NicknameInputProps {
  onSearch: (nicknames: string[]) => void;
  isLoading: boolean;
}

export default function NicknameInput({ onSearch, isLoading }: NicknameInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [nicknames, setNicknames] = useState<string[]>([]);

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !nicknames.includes(trimmed)) {
      setNicknames([...nicknames, trimmed]);
      setInputValue('');
    }
  };

  const handleRemove = (nickname: string) => {
    setNicknames(nicknames.filter(n => n !== nickname));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const handleSearch = () => {
    if (nicknames.length > 0) {
      onSearch(nicknames);
    }
  };

  const handleClear = () => {
    setNicknames([]);
    setInputValue('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Enter Steam Nicknames</h2>

      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter Steam ID, profile URL, or username"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleAdd}
            disabled={isLoading || !inputValue.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>

        {nicknames.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {nicknames.map((nickname) => (
              <span
                key={nickname}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {nickname}
                <button
                  onClick={() => handleRemove(nickname)}
                  disabled={isLoading}
                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSearch}
          disabled={isLoading || nicknames.length === 0}
          className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          {isLoading ? 'Loading...' : 'Get Games List'}
        </button>
        {nicknames.length > 0 && (
          <button
            onClick={handleClear}
            disabled={isLoading}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <p className="mt-4 text-sm text-gray-600">
        You can enter Steam IDs (e.g., 76561198000000000), profile URLs, or usernames
      </p>
    </div>
  );
}

