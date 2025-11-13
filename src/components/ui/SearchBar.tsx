import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  resultsCount?: number;
  showResultsCount?: boolean;
  className?: string;
}

export const SearchBar = ({
  searchQuery,
  onSearchChange,
  placeholder = "Search...",
  resultsCount,
  showResultsCount = false,
  className = "",
}: SearchBarProps) => {
  return (
    <div className={`bg-card rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5 text-spective-accent" />
        <h2 className="text-lg font-semibold">Search</h2>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showResultsCount && searchQuery && resultsCount !== undefined && (
        <p className="text-sm text-muted-foreground mt-2">
          Found {resultsCount} result{resultsCount === 1 ? '' : 's'} matching "{searchQuery}"
        </p>
      )}
    </div>
  );
};
