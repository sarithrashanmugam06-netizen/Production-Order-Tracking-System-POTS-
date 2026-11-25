import { useEffect, useState } from "react";

import api from "../services/api";

// Loads the product list (for dropdowns). Pass `enabled` so a modal only
// fetches while it is open and always shows fresh data.
export default function useProductOptions(enabled = true) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;

    api
      .get("/products/")
      .then((response) => {
        if (!cancelled) setProducts(response.data);
      })
      .catch((error) => console.error("Error loading products:", error));

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return products;
}
