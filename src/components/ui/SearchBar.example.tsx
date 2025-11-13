/**
 * SearchBar Component Usage Example
 * 
 * This example demonstrates how to use the advanced SearchBar component
 * with badge-based search groups and AND/OR logic.
 */

import { useState } from 'react';
import { SearchBar, SearchGroup } from './SearchBar';

export const SearchBarExample = () => {
  // Initialize with one empty search group
  const [searchGroups, setSearchGroups] = useState<SearchGroup[]>([
    { id: 'group-1', badges: [], inputValue: '' }
  ]);

  // Your filtered results count
  const resultsCount = 42;

  return (
    <div>
      <SearchBar
        searchGroups={searchGroups}
        onSearchGroupsChange={setSearchGroups}
        placeholder="Type and press Enter to add search terms..."
        resultsCount={resultsCount}
        showResultsCount={true}
        className="mb-8"
        layout="column" // or "row"
      />

      {/* Display the current search query for debugging */}
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Current Search Query:</h3>
        {searchGroups.map((group, index) => (
          <div key={group.id} className="mb-2">
            <strong>Group {index + 1}:</strong>
            {group.badges.length > 0 ? (
              <span> ({group.badges.join(' OR ')})</span>
            ) : (
              <span className="text-gray-500"> (empty)</span>
            )}
          </div>
        ))}
        {searchGroups.length > 1 && (
          <p className="text-sm text-gray-600 mt-2">
            Groups are combined with AND logic
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Example Query Building:
 * 
 * User adds: "NPI manager" to Group 1
 * User adds: "Angol" to Group 2
 * User adds: "Német" to Group 2
 * 
 * This creates the query: ("NPI manager") AND ("Angol" OR "Német")
 * 
 * Which means: Find professionals who match "NPI manager" 
 * AND (match "Angol" OR match "Német")
 */
