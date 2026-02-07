import { Restaurant } from "@/types/data";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface RestaurantCardProps {
  index?: number;
  restaurant: Restaurant;
}

const RestaurantCard = ({ index = 0, restaurant } : RestaurantCardProps) => {
  return (
    <div className="relative">
      <Link className="absolute inset-0 z-10" href="#" />
      <div className="relative aspect-video w-full rounded-md overflow-hidden">
        <Image
          className="object-cover"
          src={restaurant.photoUrl}
          alt="restaurant image"
          fill
          priority={index === 0}
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>
      <div className="flex-center justify-between p-3 gap-1">
        <p className="text-sm font-bold line-clamp-3">{restaurant.restaurantName}</p>
        <div className="z-15">
          <Heart
            color="gray"
            strokeWidth={3}
            size={20}
            className="hover:cursor-pointer hover:fill-red-500/80 hover:stroke-0"
          />
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
