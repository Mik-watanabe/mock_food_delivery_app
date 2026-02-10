import Section from "@/components/Section";
import RestaurantCard from "@/components/RestaurantCard";
import CarouselContainer from "@/components/CarouselContainer";
import { fetchAsianRestaurants, fetchAllRestaurants, fetchLocation } from "@/lib/restaurants/api";
import RestaurantList from "@/components/RestaurantList";
import CategoriesBar from "@/components/CategoriesBar";

const Home = async () => {
  const location = await fetchLocation();
console.log("User location:", location);
  const { restaurants: asianRestaurants } = await fetchAsianRestaurants(location);
  const { restaurants } = await fetchAllRestaurants(location);
  return (
    <>
      <div className="min-h-screen flex flex-col space-y-4 md:space-y-8 pt-8 md:pt-16">
        <CategoriesBar />
        <Section title="Nearby Asian Restaurants" list={<RestaurantList restaurants={asianRestaurants} />}>
          <CarouselContainer>
            {asianRestaurants.map((restaurant, index) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                index={index}
              />
            ))}
          </CarouselContainer>
        </Section>
        <Section title="Nearby All Restaurants" list={<RestaurantList restaurants={restaurants}/>}>
          <CarouselContainer>
            {restaurants.map((restaurant, index) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                index={index}
              />
            ))}
          </CarouselContainer>
        </Section>
      </div>
    </>
  );
};

export default Home;
