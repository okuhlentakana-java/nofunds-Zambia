import { useState, useEffect } from "react";
import { ENDPOINTS, apiFetch } from "../api";
import { normalizeBundle } from "../api/bundleHelpers";

export function useBundles(filters = {}) {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: 100,
          page: 1,
          ...filters,
        });

        const res = await apiFetch(`${ENDPOINTS.bundles}?${params}`);
        const all = [...(res.data ?? [])];

        const totalPages = res.pagination?.total_pages ?? 1;

        if (totalPages > 1) {
          const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) => {
              const p = new URLSearchParams({
                ...filters,
                limit: 100,
                page: i + 2,
              });
              return apiFetch(`${ENDPOINTS.bundles}?${p}`).then(r => r.data ?? []);
            })
          );
          all.push(...rest.flat());
        }

        
        const filtered = all
          .filter(b => b.active)
          .filter(b =>
            !filters.network_operator_country ||
            b.network_operator_country === filters.network_operator_country
          );

        if (!cancelled) {
          
          setBundles(filtered.map(normalizeBundle));
        }

      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [JSON.stringify(filters)]);

  return { bundles, loading, error };
}

// useBundles.js (or wherever useBundlesByCategory is defined)

export function useBundlesByCategory(category) {
  // Fetch ALL bundles (no category filter, but keep other filters like country)
  const { bundles: allBundles, loading, error } = useBundles({
    network_operator_country: "ZM",
  });

  // Filter client‑side by category (case‑insensitive)
  const filtered = allBundles.filter(b => b.category?.toLowerCase() === category.toLowerCase());

  return { bundles: filtered, loading, error };
}