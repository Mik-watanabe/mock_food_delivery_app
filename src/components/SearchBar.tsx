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
import {
  AlertCircle,
  LoaderCircle,
  MapPinIcon,
  SearchIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

const SearchBar = () => {
  const [isShow, setIsShow] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [sessionToken, setSessionToken] = useState(uuidv4());
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();

  const fetchSuggestions = useDebouncedCallback(async (query: string) => {
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }

    try {
      setErrorMessage(null);
      const response = await fetch(
        `/api/suggestions?query=${query}&sessionToken=${sessionToken}`,
      );

      const body = await response.json();
      if (!response.ok) {
        console.error("Error response from API:", body);
        setErrorMessage(body.error || "Failed to fetch suggestions.");
        setSuggestions([]);
        return;
      }

      const { suggestions: data } = body as {
        suggestions: PlaceSuggestion[];
      };

      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setErrorMessage("An error occurred while fetching suggestions.");
    } finally {
      setLoading(false);
    }
  }, 500);

  useEffect(() => {
    fetchSuggestions(inputValue);
  }, [inputValue]);

  const handleInputChange = (value: string) => {
    setLoading(true);
    const trimmedValue = value.trim();
    console.log(trimmedValue);
    setInputValue(trimmedValue);
    setIsShow(trimmedValue.length > 0);
    if (trimmedValue.length === 0) {
      setSuggestions([]);
    }
  };

  const handleBlur = () => {
    closeSuggestions();
  };

  const handleFocus = () => {
    if (inputValue) {
      setIsShow(true);
    }
  };

  const closeSuggestions = () => {
    setIsShow(false);
  }

  const handleSuggestionSelect = (suggestion: PlaceSuggestion) => {
    console.log("Selected suggestion:", suggestion);

    if (suggestion.type === "placePrediction") {
      router.push(
        `/restaurant/${suggestion.placeId}?sessionToken=${sessionToken}`,
      );
      setSessionToken(uuidv4());
    } else if (suggestion.type === "queryPrediction") {
      router.replace(`/search?restaurant=${suggestion.placeName}`);
    }
    closeSuggestions();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!inputValue.trim()) return;
      router.replace(`/search?restaurant=${inputValue}`);
      closeSuggestions();
    }
  };

  return (
    <Command
      className={cn("overflow-visible bg-muted", isShow && "rounded-b-none")}
      shouldFilter={false}
      onKeyDown={handleKeyDown} // search for own suggestions, not let Command handle it
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
            <CommandEmpty>
              <div className="flex-center-center">
                {loading ? (
                  <LoaderCircle className="animate-spin" />
                ) : errorMessage ? (
                  <div className="flex-center-center text-destructive">
                    <AlertCircle className="mr-2" />
                    <p className="text-destructive">{errorMessage}</p>
                  </div>
                ) : (
                  "No results found."
                )}
              </div>
            </CommandEmpty>
            {suggestions.map((suggestion, i) => (
              <CommandItem
                key={suggestion.placeId || suggestion.placeName + i}
                value={suggestion.placeName + i}
                onMouseDown={(e) => e.preventDefault()}
                onSelect={() => handleSuggestionSelect(suggestion)}
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
