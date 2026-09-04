import { useEffect, useMemo, useState } from "react";
import { CartContext } from "./cartContext";

const storageKey = "sargam-wholesale-cart";

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  function addItem(product) {
    const batchSize = Number(product.batchSize) || 1;
    setItems((current) => {
      const existing = current.find((item) => item.id === product._id);
      if (existing) {
        return current.map((item) => item.id === product._id
          ? { ...item, quantity: item.quantity + batchSize }
          : item);
      }
      return [...current, {
        id: product._id,
        name: product.name,
        modelNumber: product.modelNumber || product.sku || "-",
        batchSize,
        quantity: batchSize,
        priceMin: product.priceMin ?? product.price,
        priceMax: product.priceMax,
        image: product.images?.[0] || "",
      }];
    });
  }

  function removeItem(id) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function changeQuantity(id, direction) {
    setItems((current) => current.flatMap((item) => {
      if (item.id !== id) return [item];
      const quantity = item.quantity + direction * item.batchSize;
      return quantity >= item.batchSize ? [{ ...item, quantity }] : [];
    }));
  }

  function clearCart() {
    setItems([]);
  }

  const value = useMemo(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    addItem,
    removeItem,
    changeQuantity,
    clearCart,
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

