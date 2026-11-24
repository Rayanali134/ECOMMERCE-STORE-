import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("store_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("store_cart", JSON.stringify(cartItems));
    } catch (err) {
      console.error("Cart storage error:", err);
    }
  }, [cartItems]);

  const getItemKey = (productId, variant) => {
    if (!variant) return String(productId);
    const variantStr = Object.entries(variant)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join("|");
    return `${productId}_${variantStr}`;
  };

  const addToCart = (product, quantity = 1, selectedVariant = {}) => {
    const activePrice =
      product.salePrice && product.salePrice < product.price
        ? product.salePrice
        : product.price;

    const itemKey = getItemKey(product._id || product.id, selectedVariant);

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.key === itemKey
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      }

      const newItem = {
        key: itemKey,
        id: product._id || product.id,
        title: product.title || product.name,
        price: activePrice,
        regularPrice: product.price,
        image:
          product.images?.[0] ||
          product.image ||
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        quantity,
        selectedVariant: selectedVariant || {},
        stock: product.stock !== undefined ? product.stock : 99,
      };

      return [...prevItems, newItem];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (itemKey) => {
    setCartItems((prev) => prev.filter((item) => item.key !== itemKey));
  };

  const updateQuantity = (itemKey, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.key === itemKey) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem("store_cart");
    } catch {
      // ignore
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
