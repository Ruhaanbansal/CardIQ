'use client';

import React, { useEffect } from 'react';
import { useMerchantStore } from '../../stores/merchantStore';

export function MerchantAutocomplete() {
  const { searchQuery, setSearchQuery, performSearch, searchResults, isSearching } = useMerchantStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        placeholder="Search merchants..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      {isSearching && <div className="absolute right-3 top-3">...</div>}

      {searchResults.length > 0 && (
        <ul className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {searchResults.map((merchant) => (
            <li 
              key={merchant.id}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
            >
              <span className="font-medium">{merchant.name}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {merchant.category}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
