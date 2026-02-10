import RestaurantList from "@/components/RestaurantList";
import {
  fetchRestaurantsByTypes,
  fetchRestaurantsByKeyword,
  fetchLocation,
} from "@/lib/restaurants/api";
import { Restaurant } from "@/types/data";
import { CATEGORY_MAP } from "@/lib/restaurants/constants";
import CategoriesBar from "@/components/CategoriesBar";
import { redirect } from "next/navigation";

const SearchPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ category: string; restaurant: string }>;
}) => {
  const [{category, restaurant}, location] = await Promise.all([searchParams, fetchLocation()]);
  let data: { restaurants: Restaurant[] } = { restaurants: [] };

  const mode = category ? "category" : restaurant ? "keyword" : "none";

  switch (mode) {
    case "category":
      data = await fetchRestaurantsByTypes({includedTypes: [category], lat: location.lat, lng: location.lng});

      return (
        <div className="min-h-screen flex flex-col space-y-4 md:space-y-8 py-8 md:py-16">
          <CategoriesBar />
          {data.restaurants.length > 0 ? (
            <RestaurantList restaurants={data.restaurants} />
          ) : (
            <p>
              カテゴリ:{" "}
              {CATEGORY_MAP[category as keyof typeof CATEGORY_MAP]?.label}
              に一致するレストランがみつかりません
            </p>
          )}
        </div>
      );

    case "keyword":
      data = await fetchRestaurantsByKeyword(restaurant!);

      return (
        <div className="min-h-screen flex flex-col space-y-4 md:space-y-8 py-8 md:py-16">
          {data.restaurants.length > 0 ? (
            <>
            <div className="mb-4">{restaurant}の検索結果 {data.restaurants.length} 件</div>
            <RestaurantList restaurants={data.restaurants} />
            </>
          ) : (
            <p>
              Keyword: {restaurant}
              に一致するレストランがみつかりません
            </p>
          )}
        </div>
      );

    case "none":
    default:
      redirect("/?from=search");
  }
};

export default SearchPage;
