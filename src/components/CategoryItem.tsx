import { cn } from "@/lib/utils";
import { Category } from "@/types/data";
import Image from "next/image";

interface CategoryitemProps {
  category: Category;
  isSelected?: boolean;
  onClick: (categoryType: string) => void;
}

const CategoryItem = ({ category, isSelected, onClick }: CategoryitemProps) => {
  return (
    <div
      className="flex flex-col items-center gap-1 cursor-pointer"
      onClick={() => onClick(category.type)}
    >
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-full w-12 md:w-16 h-12 md:h-16",
          isSelected ? "bg-blue-400" : "bg-blue-100",
        )}
      >
        <Image
          src={category.icon}
          alt={category.label}
          fill
          className="scale-75"
          sizes="(min-width: 768px) 64px, 48px"
        />
      </div>
      <div className="w-full">
        <p className="text-xs md:text-sm truncate text-center">
          {category.label}
        </p>
      </div>
    </div>
  );
};

export default CategoryItem;
