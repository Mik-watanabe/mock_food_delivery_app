"use client";

import { useRouter, useSearchParams } from "next/navigation";
import CarouselContainer from "./CarouselContainer";
import CategoryItem from "./CategoryItem";
import { categories } from "@/lib/restaurants/constants";

const CategoriesBar = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCategory = searchParams.get("category");

  const searchByCategory = (categoryType: string) => {
    const params = new URLSearchParams(searchParams);

    if (currentCategory === categoryType) {
        // click same category to clear filter and go back to home
        // クリアしたらサーチページのままで全部の種類のレストラン表示させる方が妥当そう
      router.replace("/");
    } else {
      params.set("category", categoryType);
      router.replace(`/search?${params.toString()}`);
    }

    // Implement search logic here
  };

  return (
    <CarouselContainer itemClassName="basis-full basis-1/4 sm:basis-1/6 md:basis-1/8 xl:basis-1/10">
      {categories.map((category) => (
        <CategoryItem
          category={category}
          key={category.type}
          isSelected={currentCategory === category.type}
          onClick={searchByCategory}
        />
      ))}
    </CarouselContainer>
  );
};

export default CategoriesBar;
