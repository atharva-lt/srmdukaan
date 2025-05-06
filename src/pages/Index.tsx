
import React, { useState, useEffect } from "react";
import { fetchProducts, fetchProductsByCategory } from "@/services/api";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  // Filter products based on search query
  const filteredProducts = searchQuery
    ? products.filter((product: Product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
      )
    : products;

  return (
    <div className="container py-8 mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/40 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?q=80&w=2070" 
          alt="Hero" 
          className="w-full h-80 object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center z-20 p-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to QuickOrderVerse
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Discover amazing products at amazing prices
          </p>
          <div className="mt-6">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Shop Now
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search for products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Category Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="flex overflow-x-auto pb-2 mb-2 w-full h-auto space-x-2">
            <TabsTrigger 
              value="all" 
              onClick={() => handleCategorySelect(null)}
              className="px-4 py-2 rounded-md"
            >
              All Products
            </TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                onClick={() => handleCategorySelect(category)}
                className="px-4 py-2 rounded-md whitespace-nowrap"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium">No products found</h3>
          <p className="text-muted-foreground mt-2">Try another search term or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Featured Categories */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((category) => (
            <div 
              key={category} 
              className="relative overflow-hidden rounded-lg cursor-pointer group h-40"
              onClick={() => handleCategorySelect(category)}
            >
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all z-10"></div>
              <img 
                src={`https://source.unsplash.com/featured/?${category}`}
                alt={category}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <h3 className="text-xl font-bold text-white">{category}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
