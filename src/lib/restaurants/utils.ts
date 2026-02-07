import { GooglePlacesApiResponse } from "@/types/data";
import { Restaurant } from "@/types/data";
// import { getRestaurantPhotoUrl } from "./api";

export async function transformRestaurantResults({ places }: GooglePlacesApiResponse):Promise<Restaurant[]> {
    if (!places) return [];

    return await Promise.all(
    places.map(async (place) => ({
      id: place.id,
      restaurantName: place.displayName?.text ?? "",
      primaryType: place.primaryType ?? "",
    //   photoUrl: place.photos?.[0]?.name
    //     ? await getRestaurantPhotoUrl(place.photos[0].name)
    //     : "/no_image.png",
        photoUrl: "/no_image.png",
    }))
  )
}