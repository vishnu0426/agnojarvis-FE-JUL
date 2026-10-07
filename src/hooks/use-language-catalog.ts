/**
 * Loads the language catalog from the Agent Manager once and shares it.
 * Falls back to a built-in shortlist if the API cannot be reached.
 */

import { useEffect, useState } from "react";
import { apiClient, type LanguageCatalog } from "@/services/api";
import { FALLBACK_CATALOG } from "@/lib/languages";

let cached: LanguageCatalog | null = null;
let inflight: Promise<LanguageCatalog> | null = null;

function load(): Promise<LanguageCatalog> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = apiClient
      .getLanguages()
      .then((c) => {
        cached = c;
        return c;
      })
      .catch(() => {
        inflight = null; // allow a retry on the next mount
        return FALLBACK_CATALOG;
      });
  }
  return inflight;
}

export function useLanguageCatalog(): { catalog: LanguageCatalog; loaded: boolean } {
  const [catalog, setCatalog] = useState<LanguageCatalog>(cached ?? FALLBACK_CATALOG);
  const [loaded, setLoaded] = useState<boolean>(cached !== null);

  useEffect(() => {
    let alive = true;
    load().then((c) => {
      if (alive) {
        setCatalog(c);
        setLoaded(c !== FALLBACK_CATALOG);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  return { catalog, loaded };
}
