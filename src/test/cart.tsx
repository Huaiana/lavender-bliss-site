import { createContext, useContext, useState, type ReactNode } from "react";

export type CheckoutData = {
  quantity: number;
  address: {
    cep: string;
    rua: string;
    bairro: string;
    estado: string;
    cidade: string;
    numero: string;
    complemento: string;
  };
  payment: "debito" | "credito" | "pix" | "";
};

const empty: CheckoutData = {
  quantity: 1,
  address: { cep: "", rua: "", bairro: "", estado: "", cidade: "", numero: "", complemento: "" },
  payment: "",
};

type CartCtx = {
  data: CheckoutData;
  setQuantity: (n: number) => void;
  setAddress: (a: CheckoutData["address"]) => void;
  setPayment: (p: CheckoutData["payment"]) => void;
  reset: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CheckoutData>(empty);
  return (
    <Ctx.Provider
      value={{
        data,
        setQuantity: (n) => setData((d) => ({ ...d, quantity: Math.max(1, n) })),
        setAddress: (a) => setData((d) => ({ ...d, address: a })),
        setPayment: (p) => setData((d) => ({ ...d, payment: p })),
        reset: () => setData(empty),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}

export const PRODUCT = {
  name: "Óleo Bifásico de Lavada",
  price: 49.90,
  ml: 120,
};
