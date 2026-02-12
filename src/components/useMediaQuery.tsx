"use client";

import { useState, useEffect } from "react";

const useMediaQuery = (query = "(min-width: 768px)") => {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
 
    const media = window.matchMedia(query);

    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
};

export default useMediaQuery;
