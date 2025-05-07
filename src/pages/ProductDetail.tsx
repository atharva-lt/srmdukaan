import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProductById } from "@/services/api";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Heart, Share, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id!),
  });

  const handleQuantityChange = (amount: number) => {
    const newQuantity = Math.max(1, quantity + amount);
    if (product?.inventory_count && newQuantity <= product.inventory_count) {
      setQuantity(newQuantity);
    } else if (product?.inventory_count && newQuantity > product.inventory_count) {
      toast({
        title: "Maximum stock reached",
        description: `Only ${product.inventory_count} units available`,
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      setQuantity(1);
    }
  };

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

  // Sample related product images based on categories
  const getRelatedProductImage = (index: number) => {
    const categoryImageMap: Record<string, string[]> = {
      "Electronics": [
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
        "https://images.unsplash.com/photo-1585792180666-f7347c490ee2",
        "https://images.unsplash.com/photo-1546054454-aa26e2b734c7",
        "https://images.unsplash.com/photo-1498049794561-7780e7231661"
      ],
      "Clothing": [
        "https://images.unsplash.com/photo-1562157873-818bc0726f68",
        "https://images.unsplash.com/photo-1582552938357-32b906df40cb",
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105",
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f"
      ],
      "Home & Kitchen": [
        "https://images.unsplash.com/photo-1584346133934-a3044a90bc56",
        "https://images.unsplash.com/photo-1600585152220-90363fe7e115",
        "https://images.unsplash.com/photo-1556911220-bff31c812dba",
        "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92"
      ]
    };
    
    // Default images if category doesn't match
    const defaultImages = [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      "https://images.unsplash.com/photo-1560343090-f0409e92791a"
    ];
    
    const category = product?.category || "";
    const images = categoryImageMap[category] || defaultImages;
    return images[index % images.length];
  };

  // Get placeholder image based on product category
  const getProductImage = () => {
    if (product.image_url) return product.image_url;
    
    const categoryImageMap: Record<string, string> = {
      "Electronics": "https://images.unsplash.com/photo-1498049794561-7780e7231661",
      "Clothing": "https://images.unsplash.com/photo-1562157873-818bc0726f68",
      "Home & Kitchen": "https://images.unsplash.com/photo-1556911220-bff31c812dba"
    };
    
    return categoryImageMap[product.category || ""] || "https://images.unsplash.com/photo-1560343090-f0409e92791a";
  };

  return (
    <div className="container p-8 mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center mb-6 text-sm">
        <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
          Home
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        {product.category && (
          <>
            <Link 
              to={`/?category=${product.category}`} 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {product.category}
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
          </>
        )}
        <span className="text-foreground font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <AspectRatio ratio={4/3}>
              <img
                src={getProductImage()}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            </AspectRatio>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <Badge variant="outline" className="mb-2">
                {product.category}
              </Badge>
            )}
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="mt-2 flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    className={`w-4 h-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-muted-foreground text-sm">(142 reviews)</span>
            </div>
          </div>
          
          <p className="text-3xl font-bold text-primary">
            ${product.price.toFixed(2)}
          </p>
          
          <p className="text-gray-700">
            {product.description}
          </p>
          
          {/* Stock and quantity */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div>
              {product.inventory_count && product.inventory_count > 0 ? (
                <span className="text-green-600 font-medium">
                  ✓ In Stock ({product.inventory_count} available)
                </span>
              ) : (
                <span className="text-red-500 font-medium">
                  ✕ Out of Stock
                </span>
              )}
            </div>
            
            {product.inventory_count && product.inventory_count > 0 && (
              <div className="flex items-center">
                <span className="mr-3 text-sm font-medium">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleQuantityChange(-1)} 
                    className="h-9 w-9 rounded-none"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-10 text-center">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleQuantityChange(1)} 
                    className="h-9 w-9 rounded-none"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleAddToCart}
              className="flex-1 md:flex-auto md:px-10"
              size="lg"
              disabled={!product.inventory_count || product.inventory_count <= 0}
            >
              {!product.inventory_count || product.inventory_count <= 0
                ? "Out of Stock"
                : "Add to Cart"
              }
            </Button>
            <Button variant="outline" size="icon" className="h-11 w-11">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="h-11 w-11">
              <Share className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Shipping and returns */}
          <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-200">
            <div className="flex items-start space-x-2">
              <Truck className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Free Shipping</h4>
                <p className="text-sm text-muted-foreground">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RotateCcw className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Free Returns</h4>
                <p className="text-sm text-muted-foreground">Within 30 days</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Secure Payment</h4>
                <p className="text-sm text-muted-foreground">Encrypted transactions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="p-4 border rounded-md mt-2">
            <h3 className="text-lg font-medium mb-2">Product Description</h3>
            <p>{product.description}</p>
          </TabsContent>
          <TabsContent value="specifications" className="p-4 border rounded-md mt-2">
            <h3 className="text-lg font-medium mb-2">Product Specifications</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-medium">Category</td>
                  <td className="py-2">{product.category || "N/A"}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Material</td>
                  <td className="py-2">Premium Quality</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Warranty</td>
                  <td className="py-2">1 Year</td>
                </tr>
              </tbody>
            </table>
          </TabsContent>
          <TabsContent value="reviews" className="p-4 border rounded-md mt-2">
            <h3 className="text-lg font-medium mb-2">Customer Reviews</h3>
            <p className="text-muted-foreground">
              Product has 142 reviews with an average rating of 4.2 stars.
            </p>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Related products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Link key={i} to="/" className="group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                <img 
                  src={getRelatedProductImage(i)} 
                  alt={`Related Product ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="font-medium group-hover:text-primary transition-colors">
                Related Product {i + 1}
              </h3>
              <p className="text-primary font-bold mt-1">$99.99</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
