
import React, { useState, useEffect } from "react";
import { fetchProducts, fetchProductsByCategory } from "@/services/api";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: () => selectedCategory 
      ? fetchProductsByCategory(selectedCategory) 
      : fetchProducts(),
  });

  // Extract unique categories from products
  useEffect(() => {
    if (products.length > 0) {
      const uniqueCategories = Array.from(
        new Set(
          products
            .map((product: Product) => product.category)
            .filter((category): category is string => category !== null)
        )
      );
      setCategories(uniqueCategories);
    }
  }, [products]);

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  return (
    <div className="container py-8 mx-auto">
      {/* Hero Section */}
      <div className="p-8 mb-8 text-center bg-primary/10 rounded-lg">
        <h1 className="text-4xl font-bold text-primary">Welcome to QuickOrderVerse</h1>
        <p className="mt-4 text-xl">
          Your one-stop shop for high-quality products
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <span className="text-sm font-medium text-gray-700">Categories:</span>
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => handleCategorySelect(null)}
          size="sm"
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => handleCategorySelect(category)}
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
