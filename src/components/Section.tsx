"use client";
import { ReactNode, useState } from "react";
import { Button } from "./ui/button";
import useMediaQuery from "./useMediaQuery";

interface SectionProps {
  children: ReactNode;
  title: string;
  list?: ReactNode;
}

const Section = ({ children, title, list }: SectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = () => {
    setIsExpanded((prev) => !prev);
  };
  const isMdUp = useMediaQuery("(min-width: 768px)");

  return (
    <section>
      <div className="flex-center justify-between py-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        {isMdUp && (
        //   ADD <Suspense>
          <Button onClick={handleChange} className="text-sm">
            {isExpanded ? "Show less" : "View all"}
          </Button>
        //   </Suspense>
        )}
      </div>
      {isMdUp && isExpanded ? list : children}
    </section>
  );
};

export default Section;
