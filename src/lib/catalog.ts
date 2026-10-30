import { queryOptions, useQuery } from "@tanstack/react-query";

import { listProducts } from "./catalog.functions";
import { products as sampleProducts, type Product } from "./products";

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProducts(),
  staleTime: 30_000,
});

/** Live catalogue from the database; shows the sample list for a moment while loading. */
export function useProducts(): Product[] {
  const { data } = useQuery({ ...productsQuery, placeholderData: sampleProducts });
  return data ?? sampleProducts;
}
