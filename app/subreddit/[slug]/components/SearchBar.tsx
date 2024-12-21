'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface SearchBarProps {
  keyword: string;
  sentiment: string;
  onKeywordChange: (value: string) => void;
  onSentimentChange: (value: string) => void;
}

export function SearchBar({
  keyword,
  sentiment,
  onKeywordChange,
  onSentimentChange,
}: SearchBarProps) {
  return (
    <div className="flex gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search posts..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={sentiment} onValueChange={onSentimentChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by sentiment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sentiment</SelectItem>
          <SelectItem value="positive">Positive</SelectItem>
          <SelectItem value="neutral">Neutral</SelectItem>
          <SelectItem value="negative">Negative</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 