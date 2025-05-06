
import React from "react";
import { useForm } from "react-hook-form";
import { Customer } from "@/types";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  contact_number: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (customer: Omit<Customer, 'id' | 'created_at'>) => void;
  customer?: Customer;
  mode: "add" | "edit";
}

export function CustomerDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  customer, 
  mode 
}: CustomerDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: customer?.name || "",
      email: customer?.email || "",
      contact_number: customer?.contact_number || "",
    },
  });

  React.useEffect(() => {
    if (open && customer) {
      form.reset({
        name: customer.name,
        email: customer.email,
        contact_number: customer.contact_number || "",
      });
    } else if (open && !customer) {
      form.reset({
        name: "",
        email: "",
        contact_number: "",
      });
    }
  }, [open, customer, form]);

  const onSubmit = (values: FormValues) => {
    onSave({
      name: values.name,
      email: values.email,
      contact_number: values.contact_number || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Customer" : "Edit Customer"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact number (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {mode === "add" ? "Add Customer" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
