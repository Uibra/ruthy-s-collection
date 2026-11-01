import { queryOptions, useQuery } from "@tanstack/react-query";

import { listProducts } from "./catalog.functions";
import type { Product } from "./products";

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProducts(),
  staleTime: 30_000,
});

/** Real catalogue from the database. If the shop has no rows yet, it stays empty until the owner adds products. */
export function useProducts(): Product[] {
  const { data } = useQuery(productsQuery);
  return data ?? [];
}
