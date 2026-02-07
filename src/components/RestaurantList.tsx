import { Restaurant } from "@/types/data";
import RestaurantCard from "./RestaurantCard";

interface RestaurantListProps {
  restaurants: Restaurant[]; // Replace 'any' with the appropriate Restaurant type when available
}
const RestaurantList = ({ restaurants }: RestaurantListProps) => {
  return (
    <ul className="hidden md:grid grid-cols-4 gap-5">
      {restaurants.map((restaurant) => (
        <li key={restaurant.id}>
          <RestaurantCard restaurant={restaurant} />
        </li>
      ))}
    </ul>
  );
};

export default RestaurantList;
