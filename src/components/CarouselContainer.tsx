import React, { ReactNode } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CarouselProps {
  children: ReactNode[];
  itemClassName?: string;
}

const CarouselContainer = ({ children, itemClassName = "basis-full basis sm:basis-1/2 md:basis-1/4 xl:basis-1/5" }: CarouselProps) => {
  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent>
        {children.map((child, index) => (
          <CarouselItem
            key={index}
            className={itemClassName}
          >
            <div className="p-1">{child}</div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="flex items-center justify-center" />
      <CarouselNext className="flex items-center justify-center" />
    </Carousel>
  );
};

export default CarouselContainer;
