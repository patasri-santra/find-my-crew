import { useCallback, useEffect, useState } from "react";

// Handles loading / error / data / retry so pages don't repeat it
export default function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false; // stops a stale response from overwriting a newer one
    setLoading(true);
    setError("");

    fetcher()
      .then((res) => {
        if (!ignore) setData(res.data);
      })
      .catch((err) => {
        if (!ignore) setError(err.response?.data?.message || "Something went wrong. Please try again.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { data, loading, error, reload };
}