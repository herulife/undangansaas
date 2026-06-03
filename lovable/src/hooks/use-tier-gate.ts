import { useCallback, useEffect, useMemo, useState } from "react";
import { getMeFeatures, type MeFeaturesResponse, type TierFeatureSet } from "@/lib/api";

const fallbackMaxGallery = 3;

const fallbackFeatures: TierFeatureSet = {
  analytics: "basic",
  apiAccess: false,
  bulkCreate: false,
  clientDashboard: false,
  customDomain: false,
  dynamicOg: false,
  exportCsv: false,
  flags: ["analytics:basic"],
  maxGallery: fallbackMaxGallery,
  prioritySupport: false,
  revenueShare: 0,
  rsvpLimit: 50,
  unlimitedGallery: false,
  watermark: true,
  whiteLabel: false,
};

export function useTierGate() {
  const [data, setData] = useState<MeFeaturesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await getMeFeatures({ force: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat fitur paket.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getMeFeatures()
      .then((value) => {
        if (!cancelled) setData(value);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Gagal memuat fitur paket.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const features = data?.features ?? fallbackFeatures;
  const can = useCallback((flag: keyof TierFeatureSet) => Boolean(features[flag]), [features]);
  const hasFlag = useCallback((flag: string) => features.flags.includes(flag), [features.flags]);

  return useMemo(
    () => ({
      can,
      data,
      error,
      features,
      galleryLimit: features.unlimitedGallery ? Infinity : features.maxGallery ?? fallbackMaxGallery,
      hasFlag,
      loading,
      reload,
      tier: data?.effectiveTier ?? "free",
    }),
    [can, data, error, features, hasFlag, loading, reload],
  );
}
