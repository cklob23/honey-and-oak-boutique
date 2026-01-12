"use client";

import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";
import { Mail, Phone, User } from "lucide-react";

export default function CreateCustomerModal({ open, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const createCustomer = async () => {
    setLoading(true);

    try {
      const res = await apiClient.post("/square/customers", form);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error creating customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle className="text-xl font-semibold">Create Customer</DrawerTitle>
        </DrawerHeader>

        {/* FORM */}
        <div className="space-y-4">
          {/* First Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium">First Name</label>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <Input
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                placeholder="Enter first name"
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Last Name</label>
            <Input
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              placeholder="Enter last name"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <Input
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="Enter email"
                type="email"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Phone (optional)</label>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <Input
                value={form.phoneNumber}
                onChange={(e) => update("phoneNumber", e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>

        <DrawerFooter className="pt-4">
          <Button
            onClick={createCustomer}
            disabled={loading}
            className="w-full bg-primary text-white"
          >
            {loading ? "Creating..." : "Create Customer"}
          </Button>

          <Button variant="outline" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
