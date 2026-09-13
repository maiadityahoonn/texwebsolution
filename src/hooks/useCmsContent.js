"use client";

import { useEffect, useMemo, useState } from "react";
import { getCmsContent } from "@/services/supabaseService";

export function useCmsContent() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    getCmsContent().then((data) => {
      if (mounted) setItems(data || []);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return useMemo(() => {
    const map = new Map(items.map((item) => [item.key, item.content_json || {}]));
    return {
      items,
      block: (key, fallback = {}) => ({ ...fallback, ...(map.get(key) || {}) }),
      list: (key, field, fallback = []) => {
        const value = map.get(key)?.[field];
        return Array.isArray(value) && value.length ? value : fallback;
      },
    };
  }, [items]);
}
