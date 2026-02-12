"use client";

import useSWR from "swr";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  AlertCircle,
  LoaderCircle,
  MapPinned,
  MapPinPlus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { v4 as uuidv4 } from "uuid";
import { Address, AddressSuggestion } from "@/types/data";
import {
  registerAddressAction,
  updateSelectedAddressAction,
  deleteAddressAction,
} from "@/app/(private)/actions/addressActions";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface AddressResponse {
  addresses: Address[];
  selectedAddress: Address | null;
}

const AddressModal = () => {
  const [inputAddress, setInputAddress] = useState("");
  const [sessionToken, setSessionToken] = useState(uuidv4());
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const fetchAddressSuggestions = useDebouncedCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (trimmed === "") {
        setSuggestions([]);
        setErrorMessage(null);
        setLoading(false);
        return;
      }

      setIsTyping(false);
      setLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(
          `/api/suggestions/address?query=${query}&sessionToken=${sessionToken}`,
        );

        const body = await response.json();

        if (!response.ok) {
          console.error("Error response from API:", body);
          setErrorMessage(body.error || "Failed to fetch suggestions.");
          setSuggestions([]);
          return;
        }

        const { suggestions: data } = body as {
          suggestions: AddressSuggestion[];
        };
        setSuggestions(data ?? []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setErrorMessage("An error occurred while fetching suggestions.");
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    500,
  );

  const handleInputAddressChange = (value: string) => {
    setIsTyping(true);
    setInputAddress(value);
    if (!value.trim()) {
      resetState();
    }
  };

  useEffect(() => {
    fetchAddressSuggestions(inputAddress);
  }, [inputAddress]);

  const resetState = () => {
    setSuggestions([]);
    setErrorMessage(null);
    setLoading(false);
    setIsTyping(false);
  };

  const handleSuggestionSelect = async (suggestion: AddressSuggestion) => {
    setLoading(true);
    const result = await registerAddressAction({ suggestion, sessionToken });

    if (!result.ok) {
      alert(
        result.error || "Failed to retrieve the address. Please try again.",
      );
      console.error("Error:", result.error);
      return;
    }
    setSessionToken(uuidv4());
    await mutate(); // Refresh the list of registered addresses after adding a new one

    router.refresh();
    setInputAddress("");
    setLoading(false);
  };

  const handleAddressSelect = async (address: Address) => {
    console.log("Selected address:", address);

    const res = await updateSelectedAddressAction(address.id);

    if (!res.ok) {
      alert(
        res.error || "Failed to update the selected address. Please try again.",
      );
      console.error("Error:", res.error);
      return;
    }
    mutate(); // Refresh the list of registered addresses after updating the selected one
    router.refresh(); // Refresh the page to update the selected address in the header
    setIsModalOpen(false);
  };

  const handleAddressDelete = async (addressId: number) => {
    console.log("Deleting address with ID:", addressId);

    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }
    const isSelectedAddress = data?.selectedAddress?.id === addressId;
    const res = await deleteAddressAction(addressId, isSelectedAddress);

    if (!res.ok) {
      alert(res.error || "Failed to delete the address. Please try again.");
      console.error("Error:", res.error);
      return;
    }
    mutate(); // Refresh the list of registered addresses after deletion

    if (isSelectedAddress) {
      router.refresh(); //only refresh the page if the deleted address was same as selected one.
    }
  };

  const fetcher = async (url: string) => {
    console.log("FETCHING:", url);
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error);
    }
    return data as AddressResponse;
  };

  // function Profile ({ userId }) {
  const { data, error, isLoading, mutate } = useSWR<AddressResponse>(
    `/api/address`,
    fetcher,
  );
  if (error) {
    // TODO: DISPLAY ERROR TO USER WITH TOAST OR ALERT
    console.error("Error fetching addresses:", error);
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => setIsModalOpen(open)}>
      <DialogTrigger asChild>
        {data?.selectedAddress ? (
          <button className="flex items-center space-x-1 max-w-[140px] bg-muted px-2 py-1 rounded-full">
            <MapPinned className="shrink-0 text-blue-400" size={18} />
            <span className="truncate text-sm font-bold">
              {data.selectedAddress.name}
            </span>
          </button>
        ) : (
          <MapPinPlus className="text-blue-500" />
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Address</DialogTitle>
          <DialogDescription className="sr-only">
            Register address to find restaurants around you and get your food
            delivered! You can register multiple addresses, such as home, work,
            or a friend&apos;s place.
          </DialogDescription>
        </DialogHeader>
        <Command shouldFilter={false}>
          <div className="bg-muted mb-4 rounded-md">
            <CommandInput
              value={inputAddress}
              placeholder="Type an address..."
              onValueChange={handleInputAddressChange}
            />
          </div>
          <CommandList>
            {inputAddress ? (
              <>
                {isTyping ? (
                  <div className="flex-center-center">Typing...</div>
                ) : loading ? (
                  <div className="flex-center-center min-h-[120px]">
                    <LoaderCircle className="animate-spin" />
                  </div>
                ) : errorMessage ? (
                  <div className="flex-center-center text-destructive">
                    <AlertCircle className="mr-2" />
                    <p className="text-destructive">{errorMessage}</p>
                  </div>
                ) : suggestions.length === 0 ? (
                  <CommandEmpty>
                    <div className="flex-center-center">No results found.</div>
                  </CommandEmpty>
                ) : (
                  suggestions.map((suggestion) => (
                    <CommandItem
                      className="p-3"
                      key={suggestion.placeId}
                      onSelect={() => handleSuggestionSelect(suggestion)}
                    >
                      <MapPinPlus className="size-4 mr-2" />
                      <div>
                        <p className="font-bold">{suggestion.placeName}</p>
                        <p className="text-muted-foreground">
                          {suggestion.address_text}
                        </p>
                      </div>
                    </CommandItem>
                  ))
                )}
              </>
            ) : (
              // show registered addresses
              <>
                <h3 className="font-semibold mb-2 text-lg">Saved Addresses</h3>
                {data?.addresses.map((address) => (
                  <CommandItem
                    key={address.id}
                    onSelect={() => handleAddressSelect(address)}
                    className={cn(
                      "p-3 flex-center justify-between",
                      data.selectedAddress?.id === address.id
                        ? "bg-red-500/10!"
                        : "cursor-pointer",
                    )}
                  >
                    <div>
                      <p className="font-bold">{address.name}</p>
                      <p>{address.address_text}</p>
                    </div>

                    <Button
                      size={"icon"}
                      variant={"ghost"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddressDelete(address.id);
                      }}
                    >
                      <Trash2 className="m-auto" />
                    </Button>
                  </CommandItem>
                ))}
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default AddressModal;
