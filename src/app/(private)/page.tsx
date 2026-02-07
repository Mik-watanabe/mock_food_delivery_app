import Section from "@/components/Section";
import RestaurantCard from "@/components/RestaurantCard";
import CarouselContainer from "@/components/CarouselContainer";
import { fetchAsianRestaurants, fetchAllRestaurants } from "@/lib/restaurants/api";
import RestaurantList from "@/components/RestaurantList";
import CategoriesBar from "@/components/CategoriesBar";

const Home = async () => {
  const { restaurants: asianRestaurants } = await fetchAsianRestaurants();
  const { restaurants } = await fetchAllRestaurants();
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
