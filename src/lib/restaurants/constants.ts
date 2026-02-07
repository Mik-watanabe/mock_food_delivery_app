import { Category, CategoryType } from "@/types/data";

export const CATEGORY_MAP = {
  fast_food_restaurant: {
    label: "Fast Food",
    icon: "/images/fast-food.png",
  },
  ramen_restaurant: {
    label: "Ramen",
    icon: "/images/ramen.png",
  },
  sushi_restaurant: {
    label: "Sushi",
    icon: "/images/sushi.png",
  },
  cafe: {
    label: "Cafe",
    icon: "/images/cafe.png",
  },
  pizza_restaurant: {
    label: "Pizza",
    icon: "/images/pizza.png",
  },
  hamburger_restaurant: {
    label: "Hamburger",
    icon: "/images/hamburger.png",
  },
  chinese_restaurant: {
    label: "Chinese",
    icon: "/images/chinese.png",
  },
  italian_restaurant: {
    label: "Italian",
    icon: "/images/italian.png",
  },
  french_restaurant: {
    label: "French",
    icon: "/images/french.png",
  },
  korean_restaurant: {
    label: "Korean",
    icon: "/images/korean.png",
  },
  indian_restaurant: {
    label: "Indian",
    icon: "/images/indian.png",
  },
} as const


export const categories: Category[] = Object.entries(CATEGORY_MAP).map(
  ([type, value]) => ({
    type: type as CategoryType,
    label: value.label,
    icon: value.icon,
  })
)