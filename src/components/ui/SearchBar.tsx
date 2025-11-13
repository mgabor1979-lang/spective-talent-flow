import { useState, KeyboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Plus } from 'lucide-react';

export interface SearchGroup {
  id: string;
  badges: string[];
  inputValue: string;
}

interface SearchBarProps {
  searchGroups: SearchGroup[];
  onSearchGroupsChange: (groups: SearchGroup[]) => void;
  placeholder?: string;
  resultsCount?: number;
  showResultsCount?: boolean;
  className?: string;
  storageKey?: string; // Key for sessionStorage persistence
}

export const SearchBar = ({
  searchGroups,
  onSearchGroupsChange,
  placeholder = "Type and press Enter to add terms...",
  resultsCount,
  showResultsCount = false,
  className = "",
  storageKey,
}: SearchBarProps) => {
  const [localInputValues, setLocalInputValues] = useState<{ [key: string]: string }>({});

  // Load from sessionStorage on mount
  useEffect(() => {
    if (storageKey) {
      try {
        const stored = sessionStorage.getItem(storageKey);
        if (stored) {
          const parsedGroups = JSON.parse(stored) as SearchGroup[];
          onSearchGroupsChange(parsedGroups);
        }
      } catch (error) {
        console.error('Error loading search groups from sessionStorage:', error);
      }
    }
  }, [storageKey]); // Only run on mount or when storageKey changes

  // Save to sessionStorage whenever searchGroups change
  useEffect(() => {
    if (storageKey && searchGroups.length > 0) {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(searchGroups));
      } catch (error) {
        console.error('Error saving search groups to sessionStorage:', error);
      }
    }
  }, [searchGroups, storageKey]);

  const handleInputChange = (groupId: string, value: string) => {
    setLocalInputValues(prev => ({ ...prev, [groupId]: value }));
  };

  const handleKeyDown = (groupId: string, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter key to add badge
    if (e.key === 'Enter' && localInputValues[groupId]?.trim()) {
      e.preventDefault();
      const trimmedValue = localInputValues[groupId].trim();
      
      const updatedGroups = searchGroups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            badges: [...group.badges, trimmedValue],
          };
        }
        return group;
      });
      
      onSearchGroupsChange(updatedGroups);
      setLocalInputValues(prev => ({ ...prev, [groupId]: '' }));
    }
    
    // Handle Backspace key to remove last badge when input is empty
    if (e.key === 'Backspace' && !localInputValues[groupId]?.trim()) {
      const currentGroup = searchGroups.find(g => g.id === groupId);
      if (currentGroup && currentGroup.badges.length > 0) {
        e.preventDefault();
        const updatedGroups = searchGroups.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              badges: group.badges.slice(0, -1), // Remove last badge
            };
          }
          return group;
        });
        onSearchGroupsChange(updatedGroups);
      }
    }
  };

  const removeBadge = (groupId: string, badgeIndex: number) => {
    const updatedGroups = searchGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          badges: group.badges.filter((_, index) => index !== badgeIndex),
        };
      }
      return group;
    });
    onSearchGroupsChange(updatedGroups);
  };

  const removeGroup = (groupId: string) => {
    const updatedGroups = searchGroups.filter(group => group.id !== groupId);
    onSearchGroupsChange(updatedGroups);
  };

  const addNewGroup = () => {
    const newGroup: SearchGroup = {
      id: `group-${Date.now()}`,
      badges: [],
      inputValue: '',
    };
    onSearchGroupsChange([...searchGroups, newGroup]);
  };

  const clearAllGroups = () => {
    const clearedGroups = [{
      id: 'group-1',
      badges: [],
      inputValue: '',
    }];
    onSearchGroupsChange(clearedGroups);
    setLocalInputValues({});
    
    // Clear from sessionStorage
    if (storageKey) {
      try {
        sessionStorage.removeItem(storageKey);
      } catch (error) {
        console.error('Error clearing search groups from sessionStorage:', error);
      }
    }
  };

  const hasAnyContent = searchGroups.some(group => group.badges.length > 0);

  const totalBadgeCount = searchGroups.reduce((sum, group) => sum + group.badges.length, 0);

  // Helper function to get placeholder text based on state
  const getPlaceholderText = (groupId: string, groupBadgeCount: number): string => {
    if (groupBadgeCount === 0) {
      return placeholder;
    }
    if (localInputValues[groupId]?.trim()) {
      return "Press Enter to add OR...";
    }
    return "Add another term to OR...";
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-spective-accent" />
          <h2 className="text-lg font-semibold">Advanced Search</h2>
        </div>
        {hasAnyContent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllGroups}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {searchGroups.map((group, groupIndex) => (
          <>
            {groupIndex > 0 && (
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs font-semibold text-muted-foreground px-2 py-1 bg-muted rounded">
                  AND
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}
            <div key={group.id} className="w-full">
              <div className="relative">
                <div className="flex gap-2">
                  {/* Custom input container with badges inside */}
                  <div className="flex-1 min-w-0 flex items-center flex-wrap gap-1.5 px-3 py-2 border border-input bg-background rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    {group.badges.map((badge, badgeIndex) => (
                      <div key={`${group.id}-badge-${badge}-${badgeIndex}`} className="flex items-center">
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1 pl-2 pr-1 py-0.5 text-xs h-6"
                        >
                          <span>{badge}</span>
                          <button
                            onClick={() => removeBadge(group.id, badgeIndex)}
                            className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                            type="button"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                        {badgeIndex < group.badges.length - 1 && (
                          <span className="text-xs text-muted-foreground mx-1.5 font-medium">OR</span>
                        )}
                      </div>
                    ))}
                    <input
                      type="text"
                      placeholder={getPlaceholderText(group.id, group.badges.length)}
                      value={localInputValues[group.id] || ''}
                      onChange={(e) => handleInputChange(group.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(group.id, e)}
                      className="flex-1 min-w-[120px] outline-none bg-transparent text-sm placeholder:text-muted-foreground"
                    />
                  </div>
                  {searchGroups.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGroup(group.id)}
                      className="px-3"
                      title="Remove this search group"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={addNewGroup}
          className="text-spective-accent border-spective-accent hover:bg-spective-accent hover:text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          AND
        </Button>

        {showResultsCount && totalBadgeCount > 0 && resultsCount !== undefined && (
          <p className="text-sm text-muted-foreground">
            Found {resultsCount} result{resultsCount === 1 ? '' : 's'}
          </p>
        )}
      </div>
    </div>
  );
};
