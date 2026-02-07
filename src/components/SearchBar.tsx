"use client";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { PlaceSuggestion } from "@/types/data";
import { MapPinIcon, SearchIcon } from "lucide-react";

const SearchBar = () => {
  const [isShow, setIsShow] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [sessionToken, setSessionToken] = useState(uuidv4());
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);

  const fetchSuggestions = useDebouncedCallback(async () => {
    if(inputValue.trim() === "") {
      setSuggestions([]);
      return;
    }
    console.log("Fetching suggestions for:", inputValue);
    try {
      const response = await fetch(
        `/api/suggestions?query=${inputValue}&sessionToken=${sessionToken}`,
      );

      const { suggestions: data } = (await response.json()) as {
        suggestions: PlaceSuggestion[];
      };

      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }, 500);

  useEffect(() => {
    fetchSuggestions();
  }, [inputValue]);

  const handleInputChange = (value: string) => {
    const trimmedValue = value.trim();
    console.log(trimmedValue);
    setInputValue(trimmedValue);
    setIsShow(trimmedValue.length > 0);
    if (trimmedValue.length === 0) {
      setSuggestions([]);
    }
  };

  const handleBlur = () => {
    setIsShow(false);
  };

  const handleFocus = () => {
    if (inputValue) {
      setIsShow(true);
    }
  };

  return (
    <Command
      className={cn("overflow-visible bg-muted", isShow && "rounded-b-none")}
      shouldFilter={false}
    >
      <CommandInput
        placeholder="Type a command or search..."
        onValueChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
      />
      {isShow && (
        <div className="relative border-t">
          <CommandList className="absolute bg-background w-full rounded-b-md shadow-md">
            <CommandEmpty>No results found.</CommandEmpty>
            {suggestions.map((suggestion, i) => (
              <CommandItem
                key={suggestion.placeId || suggestion.placeName + i}
                value={suggestion.placeName + i}
              >
                {suggestion.type === "placePrediction" ? (
                  <MapPinIcon className="size-4 mr-2" />
                ) : (
                  <SearchIcon className="size-4 mr-2" />
                )}
                <p>{suggestion.placeName}</p>
              </CommandItem>
            ))}
          </CommandList>
        </div>
      )}
    </Command>
  );
};

export default SearchBar;
