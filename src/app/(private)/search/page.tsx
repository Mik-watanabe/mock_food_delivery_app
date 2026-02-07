import Section from "@/components/Section";
import RestaurantList from "@/components/RestaurantList";
import { fetchRestaurantsByTypes } from "@/lib/restaurants/api";
import { Restaurant } from "@/types/data";
import { CATEGORY_MAP } from "@/lib/restaurants/constants";
import CategoriesBar from "@/components/CategoriesBar";

const SearchPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ category: string }>;
}) => {
  const { category } = await searchParams;
  let data: { restaurants: Restaurant[] } = { restaurants: [] };

  if (category) {
    data = await fetchRestaurantsByTypes([category]);
  }
  return (
    <div className="min-h-screen flex flex-col space-y-4 md:space-y-8 py-8 md:py-16">
      <CategoriesBar />
      {/* カテゴリの場合はそのアイコンの背景の色を変えたい。 */}

      {data.restaurants.length < 0 ? (
        <RestaurantList restaurants={data.restaurants} />
      ) : (
        <p>
          カテゴリ: {CATEGORY_MAP[category as keyof typeof CATEGORY_MAP]?.label}
          に一致するレストランがみつかりません
        </p>
      )}
    </div>
  );
};

export default SearchPage;
