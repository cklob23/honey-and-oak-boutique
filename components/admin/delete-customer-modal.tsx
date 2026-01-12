"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";

export default function DeleteCustomerModal({
  open,
  onClose,
  customer,
  onSuccess,
}: any) {
  const deleteCustomer = async () => {
    if (!customer) return;
    try {
      await apiClient.delete(`/square/customers/${customer.id}`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to delete customer");
    }
  };

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="p-6 space-y-6 max-h-[70vh]">
        <DrawerHeader>
          <DrawerTitle className="text-xl font-semibold text-red-600">
            Delete Customer
          </DrawerTitle>
        </DrawerHeader>

        <p className="text-muted-foreground leading-relaxed">
          Are you sure you want to delete{" "}
          <strong>
            {customer?.givenName} {customer?.familyName}
          </strong>
          ? This customer will also be deleted from Square.
        </p>

        <DrawerFooter>
          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={deleteCustomer}
          >
            Delete Customer
          </Button>

          <Button variant="outline" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
