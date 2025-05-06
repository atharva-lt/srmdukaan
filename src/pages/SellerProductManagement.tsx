
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomer } from "@/context/CustomerContext";
import { useRole } from "@/context/RoleContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product } from "@/types";
import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  bulkUpdateProducts, 
  searchProducts 
} from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { RefreshCw, Plus, Pencil, Trash2, Save, Search, Package, ImagePlus } from "lucide-react";

// Form schema for product validation
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  image_url: z.string().optional(),
  category: z.string().optional(),
  inventory_count: z.coerce.number().min(0, "Inventory must be a positive number"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function SellerProductManagement() {
  const { isAuthenticated } = useCustomer();
  const { userRole } = useRole();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Create form for adding/editing products
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image_url: "",
      category: "",
      inventory_count: 0,
    },
  });

  // Check authentication and role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { redirect: "/seller/products" } });
      return;
    }

    if (userRole !== "seller") {
      navigate("/");
      return;
    }

    loadProducts();
  }, [isAuthenticated, navigate, userRole]);

  // Load products and extract unique categories
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
      
      // Extract and set unique categories
      const uniqueCategories = Array.from(
        new Set(data.map(product => product.category).filter(Boolean))
      ) as string[];
      
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Search products
  const handleSearch = async () => {
    try {
      setLoading(true);
      const results = await searchProducts(searchQuery, selectedCategory);
      setProducts(results);
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset search
  const handleResetSearch = () => {
    setSearchQuery("");
    setSelectedCategory(undefined);
    loadProducts();
  };

  // Handle form submission for create/edit
  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (editingProduct) {
        // Update existing product
        const updated = await updateProduct(editingProduct.id, values);
        if (updated) {
          setProducts(products.map(p => (p.id === editingProduct.id ? updated : p)));
          setIsEditDialogOpen(false);
        }
      } else {
        // Create new product - ensure all required fields are present
        const productData: Omit<Product, 'id'> = {
          name: values.name, // Name is required
          description: values.description || null,
          price: values.price, // Price is required
          image_url: values.image_url || null,
          category: values.category || null,
          inventory_count: values.inventory_count || 0,
        };
        
        const created = await createProduct(productData);
        if (created) {
          setProducts([...products, created]);
          setIsAddDialogOpen(false);
        }
      }
      form.reset();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  // Open edit dialog and populate form
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description || "",
      price: product.price,
      image_url: product.image_url || "",
      category: product.category || "",
      inventory_count: product.inventory_count || 0,
    });
    setIsEditDialogOpen(true);
  };

  // Delete product
  const handleDelete = async (id: string) => {
    const success = await deleteProduct(id);
    if (success) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Handle bulk selection
  const toggleSelection = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(p => p !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  // Bulk update inventory (simple example)
  const handleBulkUpdateInventory = async (increment: number) => {
    if (selectedProducts.length === 0) {
      toast({
        title: "No Products Selected",
        description: "Please select products to update",
        variant: "destructive",
      });
      return;
    }

    // Get current inventory for selected products
    const selectedItems = products.filter(p => selectedProducts.includes(p.id));
    const updates = selectedItems.map(p => ({
      id: p.id,
      inventory_count: Math.max(0, (p.inventory_count || 0) + increment) // Ensure not negative
    }));
    
    // Update each product
    const success = await Promise.all(
      updates.map(u => updateProduct(u.id, { inventory_count: u.inventory_count }))
    );
    
    if (success.every(Boolean)) {
      await loadProducts();
      setSelectedProducts([]);
      toast({
        title: "Success",
        description: `Updated inventory for ${selectedProducts.length} products`,
      });
    }
  };

  // Open add dialog
  const handleAddNew = () => {
    setEditingProduct(null);
    form.reset({
      name: "",
      description: "",
      price: 0,
      image_url: "",
      category: "",
      inventory_count: 0,
    });
    setIsAddDialogOpen(true);
  };

  return (
    <div className="container p-8 mx-auto">
      <Card className="mb-6 border-srm-100">
        <CardHeader className="bg-gradient-to-r from-srm-600 to-srm-400 text-white">
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6" />
            Product Management
          </CardTitle>
          <CardDescription className="text-white/80">
            Add, edit, and manage your product inventory
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex gap-2">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64"
            />
            <Button onClick={handleSearch} variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
          
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || undefined)}
            className="rounded-md border border-input px-3 py-2 bg-background"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          
          <Button onClick={handleResetSearch} variant="ghost" size="sm">
            Reset
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew} className="bg-srm-500 hover:bg-srm-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Fill in the product details below to add a new product.
                </DialogDescription>
              </DialogHeader>
              <ProductForm 
                form={form} 
                onSubmit={onSubmit} 
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>
                  Update product details below.
                </DialogDescription>
              </DialogHeader>
              <ProductForm 
                form={form} 
                onSubmit={onSubmit} 
                isEditing={true}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {selectedProducts.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{selectedProducts.length} product(s) selected</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleBulkUpdateInventory(1)}
                >
                  +1 Stock
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleBulkUpdateInventory(-1)}
                >
                  -1 Stock
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setSelectedProducts([])}
                >
                  Clear selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-srm-100">
        <CardHeader className="pb-3 bg-srm-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-srm-700">Products</CardTitle>
            <Button 
              variant="outline" 
              onClick={loadProducts} 
              disabled={loading}
              className="flex items-center gap-2 border-srm-200 text-srm-600"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-srm-100">
            <Table>
              <TableHeader>
                <TableRow className="bg-srm-50">
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-srm-500" />
                        <span>Loading products...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="w-8 h-8 text-muted-foreground" />
                        <span>No products found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id} className="group hover:bg-srm-50/50">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleSelection(product.id)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell>
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-md text-gray-400">
                            <ImagePlus size={16} />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category || "-"}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={product.inventory_count && product.inventory_count < 10 ? "text-red-500 font-medium" : ""}>
                          {product.inventory_count || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(product.id)}
                                  className="bg-red-500 text-white hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Product Form Component
function ProductForm({ 
  form, 
  onSubmit, 
  isEditing = false 
}: { 
  form: any; 
  onSubmit: (values: ProductFormValues) => void; 
  isEditing?: boolean; 
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter product name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)*</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="inventory_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock*</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Electronics, Clothing" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://example.com/image.jpg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter product description" rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="submit" className="bg-srm-500 hover:bg-srm-600">
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? "Update Product" : "Save Product"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
