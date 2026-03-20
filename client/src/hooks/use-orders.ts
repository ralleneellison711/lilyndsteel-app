import { useMutation } from "@tanstack/react-query";
import { api, type InsertOrder } from "@shared/routes";

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (data: InsertOrder) => {
      const validated = api.orders.create.input.parse(data);
      const res = await fetch(api.orders.create.path, {
        method: api.orders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Invalid order data");
        }
        throw new Error("Failed to create order");
      }
      
      return api.orders.create.responses[201].parse(await res.json());
    },
  });
}
