import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useNumerologyMeanings() {
  return useQuery({
    queryKey: [api.numerology.list.path],
    queryFn: async () => {
      const res = await fetch(api.numerology.list.path);
      if (!res.ok) throw new Error("Failed to fetch meanings");
      return api.numerology.list.responses[200].parse(await res.json());
    },
  });
}

export function useNumerologyMeaning(number: number | null) {
  return useQuery({
    queryKey: [api.numerology.get.path, number],
    queryFn: async () => {
      if (!number) return null;
      const url = buildUrl(api.numerology.get.path, { number });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch meaning");
      return api.numerology.get.responses[200].parse(await res.json());
    },
    enabled: !!number,
  });
}
