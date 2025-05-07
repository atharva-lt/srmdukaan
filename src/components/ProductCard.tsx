
import React from "react";
import { Link } from "react-router-dom";
import { Product } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  
  // Get a category-specific placeholder if no image is provided
  const getProductImage = () => {
    if (product.image_url) return product.image_url;
    
    const categoryImageMap: Record<string, string> = {
      "Electronics": "https://images.unsplash.com/photo-1498049794561-7780e7231661",
      "Clothing": "https://images.unsplash.com/photo-1562157873-818bc0726f68",
      "Home & Kitchen": "https://images.unsplash.com/photo-1556911220-bff31c812dba",
      "Books": "https://images.unsplash.com/photo-1512820790803-83ca734da794",
      "Sports": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211",
      "Beauty": "https://images.unsplash.com/photo-1596462502278-27bfdc403348"
    };
    
    return categoryImageMap[product.category || ""] || "https://images.unsplash.com/photo-1560343090-f0409e92791a";
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg border border-gray-200">
      <Link to={`/product/${product.id}`} className="block overflow-hidden">
        <AspectRatio ratio={4/3}>
          <img
            src={getProductImage()}
            alt={product.name}
            className="object-cover w-full h-full transition-transform hover:scale-105"
          />
        </AspectRatio>
      </Link>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/product/${product.id}`} className="block flex-1">
            <h3 className="font-medium text-lg hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
          </Link>
          {product.category && (
            <Badge variant="outline" className="text-xs ml-2 whitespace-nowrap">
              {product.category}
            </Badge>
          )}
        </div>
        
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2 h-10">
          {product.description}
        </p>
        
        <div className="flex justify-between items-center mt-3">
          <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
          {product.inventory_count && product.inventory_count > 0 ? (
            <span className="text-xs text-green-600">{product.inventory_count} in stock</span>
          ) : (
            <span className="text-xs text-red-500">Out of stock</span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={() => addItem(product)} 
          className="w-full"
          disabled={!product.inventory_count || product.inventory_count <= 0}
        >
          {!product.inventory_count || product.inventory_count <= 0
            ? "Out of Stock"
            : "Add to Cart"
          }
        </Button>
      </CardFooter>
    </Card>
  );
}
