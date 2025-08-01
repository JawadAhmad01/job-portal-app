import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface JobFiltersProps {
  onFiltersChange: (filters: {
    location?: string;
    tags?: string[];
    search?: string;
  }) => void;
}

export default function JobFilters({ onFiltersChange }: JobFiltersProps) {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const availableTags = ["Frontend", "Backend", "Full Stack", "Design", "Mobile", "React", "Node.js", "Python", "Java", "AWS"];

  const handleTagChange = (tag: string, checked: boolean) => {
    const newTags = checked 
      ? [...selectedTags, tag]
      : selectedTags.filter(t => t !== tag);
    setSelectedTags(newTags);
  };

  const applyFilters = () => {
    onFiltersChange({
      location: selectedLocation && selectedLocation !== "all" ? selectedLocation : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      search: searchQuery || undefined,
    });
  };

  const clearFilters = () => {
    setSelectedLocation("");
    setSelectedTags([]);
    setSearchQuery("");
    onFiltersChange({});
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
      <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
      
      {/* Search */}
      <div className="mb-6">
        <Label className="block text-sm font-medium text-gray-700 mb-2">Search</Label>
        <Input
          type="text"
          placeholder="Job title, keywords, or company"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Location Filter */}
      <div className="mb-6">
        <Label className="block text-sm font-medium text-gray-700 mb-2">Location</Label>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="new-york">New York, NY</SelectItem>
            <SelectItem value="san-francisco">San Francisco, CA</SelectItem>
            <SelectItem value="london">London, UK</SelectItem>
            <SelectItem value="toronto">Toronto, CA</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tags Filter */}
      <div className="mb-6">
        <Label className="block text-sm font-medium text-gray-700 mb-2">Job Tags</Label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {availableTags.map((tag) => (
            <div key={tag} className="flex items-center space-x-2">
              <Checkbox
                id={`tag-${tag}`}
                checked={selectedTags.includes(tag)}
                onCheckedChange={(checked) => handleTagChange(tag, checked as boolean)}
              />
              <Label htmlFor={`tag-${tag}`} className="text-sm text-gray-600">
                {tag}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Button onClick={applyFilters} className="w-full bg-primary text-white hover:bg-blue-600">
          Apply Filters
        </Button>
        <Button onClick={clearFilters} variant="outline" className="w-full">
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
