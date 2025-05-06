
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProductById } from "@/services/api";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id!),
  });

  if (isLoading) {
    return (
      <div className="container p-8 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
            <div className="h-6 bg-gray-200 animate-pulse rounded-md"></div>
            <div className="h-24 bg-gray-200 animate-pulse rounded-md"></div>
            <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container p-8 mx-auto">
        <Card>
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold text-red-500">Error</h1>
            <p className="mt-4">Failed to load product details.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container p-8 mx-auto">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-lg">
          <AspectRatio ratio={4/3}>
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          </AspectRatio>
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-bold text-primary">
            ${product.price.toFixed(2)}
          </p>
          <div className="pt-4 border-t border-gray-200">
            <h2 className="text-xl font-semibold">Description</h2>
            <p className="mt-2 text-gray-700">{product.description}</p>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <h2 className="text-xl font-semibold">Details</h2>
            <div className="mt-2 space-y-2">
              <p>
                <span className="font-medium">Category:</span>{" "}
                {product.category || "N/A"}
              </p>
              <p>
                <span className="font-medium">Availability:</span>{" "}
                {product.inventory_count && product.inventory_count > 0
                  ? `${product.inventory_count} in stock`
                  : "Out of stock"}
              </p>
            </div>
          </div>
          <Button
            onClick={() => addItem(product)}
            className="w-full mt-8"
            size="lg"
            disabled={!product.inventory_count || product.inventory_count <= 0}
          >
            {!product.inventory_count || product.inventory_count <= 0
              ? "Out of Stock"
              : "Add to Cart"
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
