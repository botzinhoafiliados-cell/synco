'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SelectedProduct {
  id: string;
  name: string;
  image_url?: string;
  current_price: number;
  original_price: number;
  discount_percent: number;
  commission_percent: number;
  marketplace: string;
  original_link: string;
}

interface SelectedProductsContextValue {
  selectedProducts: SelectedProduct[];
  addProduct: (product: SelectedProduct) => void;
  removeProduct: (productId: string) => void;
  toggleProduct: (product: SelectedProduct) => void;
  isSelected: (productId: string) => boolean;
  clearProducts: () => void;
  count: number;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const SelectedProductsContext = createContext<SelectedProductsContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * SelectedProductsProvider
 *
 * Migrado de: scr/lib/selectedProductsContext.jsx
 * Adicionado: tipagem TypeScript, toggleProduct, isSelected
 */
export function SelectedProductsProvider({ children }: { children: ReactNode }) {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  const addProduct = useCallback((product: SelectedProduct) => {
    setSelectedProducts((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const toggleProduct = useCallback((product: SelectedProduct) => {
    setSelectedProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      return [...prev, product];
    });
  }, []);

  const isSelected = useCallback(
    (productId: string) => selectedProducts.some((p) => p.id === productId),
    [selectedProducts]
  );

  const clearProducts = useCallback(() => {
    setSelectedProducts([]);
  }, []);

  return (
    <SelectedProductsContext.Provider
      value={{
        selectedProducts,
        addProduct,
        removeProduct,
        toggleProduct,
        isSelected,
        clearProducts,
        count: selectedProducts.length,
      }}
    >
      {children}
    </SelectedProductsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSelectedProducts(): SelectedProductsContextValue {
  const context = useContext(SelectedProductsContext);
  if (!context) {
    throw new Error('useSelectedProducts deve ser usado dentro de <SelectedProductsProvider>');
  }
  return context;
}
