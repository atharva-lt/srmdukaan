
import React from "react";
import { Link } from "react-router-dom";
import { Product } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <Link to={`/product/${product.id}`}>
        <AspectRatio ratio={4/3}>
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            className="object-cover w-full h-full"
          />
        </AspectRatio>
      </Link>
      <CardContent className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-medium line-clamp-1">{product.name}</h3>
        </Link>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        <p className="mt-2 text-lg font-bold">${product.price.toFixed(2)}</p>
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
