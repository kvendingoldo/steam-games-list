import { useState, useEffect } from 'react';

interface ApiKeyInputProps {
  onApiKeyChange: (apiKey: string) => void;
}

export default function ApiKeyInput({ onApiKeyChange }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Load API key from localStorage
    const savedApiKey = localStorage.getItem('steam_api_key') || '';
    if (savedApiKey) {
      setApiKey(savedApiKey);
      onApiKeyChange(savedApiKey);
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  }, [onApiKeyChange]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('steam_api_key', apiKey.trim());
      onApiKeyChange(apiKey.trim());
      setIsExpanded(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem('steam_api_key');
    setApiKey('');
    onApiKeyChange('');
    setIsExpanded(true);
  };

  if (!isExpanded && apiKey) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span className="text-sm text-green-700">Steam API key is configured</span>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm text-green-600 hover:text-green-800 underline"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="mb-2">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Steam API Key
        </label>
        <p className="text-xs text-gray-600 mb-2">
          Get your API key at{' '}
          <a
            href="https://steamcommunity.com/dev/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            https://steamcommunity.com/dev/apikey
          </a>
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Steam API key"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Save
          </button>
          {localStorage.getItem('steam_api_key') && (
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

