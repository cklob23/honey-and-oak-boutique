"use client";

import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Phone, User } from "lucide-react";
import apiClient from "@/lib/api-client";

export default function EditCustomerModal({ open, onClose, customer, onSuccess }: any) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (customer) {
      setForm({
        firstName: customer.firstName || customer.givenName || "",
        lastName: customer.lastName || customer.familyName || "",
        email: customer.emailAddress || customer.email || "",
        phone: customer.phoneNumber || "",
      });
    }
  }, [customer]);

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveChanges = async () => {
    if (!customer) return;

    setLoading(true);
    try {
      const res = await apiClient.put(`/customers/${customer.id}`, form);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update customer");
    }
    setLoading(false);
  };

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="p-6 max-h-[90vh] overflow-y-auto space-y-6">
        <DrawerHeader>
          <DrawerTitle className="text-xl font-semibold">Edit Customer</DrawerTitle>
        </DrawerHeader>

        {/* FORM */}
        <div className="space-y-4">
          {/* First Name */}
          <div>
            <label className="text-sm font-medium">First Name</label>
            <Input
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="text-sm font-medium">Last Name</label>
            <Input
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              value={form.email}
              type="email"
              onChange={(e) => update("email", e.target.value)}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium">Phone</label>
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
        </div>

        <DrawerFooter>
          <Button className="w-full" disabled={loading} onClick={saveChanges}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>

          <Button variant="outline" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
