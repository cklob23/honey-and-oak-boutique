"use client";

import { useEffect, useState, useCallback, useRef } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  Mail,
  Phone,
  ChevronRight,
  Pencil,
  Trash,
  Plus,
  Key,
  RotateCw,
  Trash2,
  Tag,
  RefreshCw,
} from "lucide-react";

import apiClient from "@/lib/api-client";
import CreateCustomerModal from "./create-customer-modal";
import EditCustomerModal from "./edit-customer-modal";
import DeleteCustomerModal from "./delete-customer-modal";

export function CustomerDirectory() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("A-Z");

  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState("");

  // This ref defines the *scrollable* section
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Bulk actions
  const selectedCount = customers.filter(c => c._checked).length;
  const anySelected = selectedCount > 0;

  const toggleSelectAll = (checked: boolean) => {
    setCustomers(prev =>
      prev.map(c => ({ ...c, _checked: checked }))
    );
  };

  const bulkDelete = () => {
    const ids = customers.filter(c => c._checked).map(c => c.id);
    console.log("Bulk delete:", ids);
  };

  const loadInitial = useCallback(async () => {
    setLoading(true);

    const response = await apiClient.get("/square/customers", {
      params: { search: searchTerm, sort: sortBy },
    });

    setCustomers(response.data.customers || []);
    setCursor(response.data.cursor || null);
    setLoading(false);
  }, [searchTerm, sortBy]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);

    const response = await apiClient.get("/square/customers", {
      params: { cursor, search: searchTerm, sort: sortBy },
    });

    setCustomers(prev => [...prev, ...(response.data.customers || [])]);
    setCursor(response.data.cursor || null);

    setLoadingMore(false);
  };

  // Infinite scroll INSIDE CARD — not page scroll
  useEffect(() => {
    if (!bottomRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && cursor) {
          loadMore();
        }
      },
      { root: scrollRef.current, threshold: 0.1 }
    );

    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [cursor, loadingMore]);

  // Password reset form
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const handlePasswordReset = async (e: any) => {
    e.preventDefault()
    setError("")

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      await apiClient.post("/auth/admin-reset-password", {
        email: selectedCustomer.emailAddress,
        newPassword: formData.newPassword
      })

      setShowPasswordModal(false)

    } catch (err: any) {
      setError(err.response?.data?.message || "Password reset failed")
    }
  }

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 1) return "Today";
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  };

  const openCustomer = async (customerId: string) => {
    const res = await apiClient.get(`/square/customers/${customerId}`);
    setSelectedCustomer(res.data);
  };

  return (
    <div className="p-8 space-y-8">
      {/* PAGE HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            View and manage your customer base
          </p>
        </div>

        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Customer
        </Button>
      </div>

      {/* Search + Sort */}
      <div className="flex items-center gap-4 max-w-xl">
        <Input
          placeholder="Search customers by name, email or phone..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A-Z">A → Z</SelectItem>
            <SelectItem value="Z-A">Z → A</SelectItem>
            <SelectItem value="NEWEST">Newest</SelectItem>
            <SelectItem value="OLDEST">Oldest</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={loadInitial} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* MAIN CARD */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            {loading ? "Loading customers..." : `Showing ${customers.length} customers`}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">

          {/* Bulk Actions Bar */}
          {anySelected && (
            <div className="sticky top-0 z-50 bg-white border-b p-3 shadow-sm flex justify-between items-center">
              <span className="font-medium">{selectedCount} selected</span>
              <div className="flex gap-3">
                <Button variant="destructive" onClick={bulkDelete}>
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
                <Button variant="outline">
                  <Tag className="w-4 h-4 mr-1" /> Add to Group
                </Button>
              </div>
            </div>
          )}

          {/* Scroll container */}
          <div
            ref={scrollRef}
            className="max-h-[70vh] overflow-y-auto relative"
          >

            {/* Sticky Header INSIDE scroll */}
            <div
              className="
                sticky top-0 z-40 bg-white
                border-b py-2 px-4
                grid grid-cols-[40px_1.2fr_1.2fr_1fr_1fr_40px]
                text-sm font-medium text-muted-foreground
              "
            >
              <div>
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={customers.length > 0 && customers.every(c => c._checked)}
                  onChange={e => toggleSelectAll(e.target.checked)}
                />
              </div>
              <div>Name</div>
              <div>Email</div>
              <div>Phone</div>
              <div>Created</div>
              <div></div>
            </div>

            {/* Customer Rows */}
            <div className="divide-y">
              {loading &&
                [...Array(12)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}

              {!loading &&
                customers.map(cust => (
                  <div
                    key={cust.id}
                    className="
                      grid grid-cols-[40px_1.2fr_1.2fr_1fr_1fr_40px]
                      items-center px-4 py-3 hover:bg-muted/40 cursor-pointer
                    "
                    onClick={e => {
                      if ((e.target as HTMLElement).tagName !== "INPUT") {
                        openCustomer(cust.id);
                      }
                    }}
                  >
                    <div>
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={cust._checked || false}
                        onChange={e => {
                          const checked = e.target.checked;
                          setCustomers(prev =>
                            prev.map(c =>
                              c.id === cust.id ? { ...c, _checked: checked } : c
                            )
                          );
                        }}
                      />
                    </div>

                    <div className="font-medium">
                      {cust.givenName} {cust.familyName}
                    </div>

                    <div className="text-muted-foreground">{cust.emailAddress}</div>

                    <div className="text-muted-foreground">
                      {cust.phoneNumber || "—"}
                    </div>

                    <div className="text-muted-foreground">
                      {timeAgo(cust.createdAt)}
                    </div>

                    <div className="flex justify-end pr-2">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}

              {/* Intersection Observer Trigger */}
              <div ref={bottomRef} className="h-12 flex justify-center items-center">
                {loadingMore && <span className="text-sm text-muted-foreground">Loading…</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right-Side Detail Drawer */}
      <Sheet open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <SheetContent side="right" className="w-[450px] overflow-y-auto p-5">
          {selectedCustomer ? (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  <span>
                    {selectedCustomer.givenName} {selectedCustomer.familyName}
                  </span>

                  <div className="flex items-center gap-3">
                    <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
                      <DialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setShowPasswordModal(true)}
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>

                      <DialogContent>
                        <DialogHeader><DialogTitle>Reset Customer Password</DialogTitle></DialogHeader>

                        {error && <p className="text-red-500">{error}</p>}

                        <form className="space-y-4" onSubmit={handlePasswordReset}>
                          <Input type="password" name="newPassword" placeholder="New password" onChange={e => setFormData({ ...formData, newPassword: e.target.value })} required />
                          <Input type="password" name="confirmPassword" placeholder="Confirm new password" onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} required />

                          <Button type="submit" className="w-full">Reset Password</Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowEditModal(true)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <Trash className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="p-4 space-y-8">
                {/* Contact */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Contact
                  </p>

                  <div className="mt-2 space-y-2">
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {selectedCustomer.emailAddress}
                    </p>

                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {selectedCustomer.phoneNumber || "No phone provided"}
                    </p>
                  </div>
                </div>

                {/* Groups */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Groups
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCustomer.groupIds?.map((g: string) => (
                      <Badge key={g} variant="secondary">
                        {g}
                      </Badge>
                    )) || <p>No groups</p>}
                  </div>
                </div>

                {/* Transactions */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Transactions
                  </p>

                  <div className="mt-3 space-y-3">
                    {selectedCustomer.transactions?.slice(0, 5).map((txn: any) => (
                      <div className="flex items-center justify-between p-2 border rounded-lg">
                        <span>${(txn.amount / 100).toFixed(2)}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}

                    {!selectedCustomer.transactions?.length && (
                      <p className="text-muted-foreground text-sm">
                        No transactions recorded
                      </p>
                    )}
                  </div>
                </div>

                {/* Frequent Purchases */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Frequent Purchases
                  </p>

                  <div className="mt-3 space-y-2">
                    {selectedCustomer.frequentItems?.map((item: any) => (
                      <div
                        key={item.name}
                        className="flex justify-between text-sm"
                      >
                        <span>{item.name}</span>
                        <span className="text-muted-foreground">
                          {item.count}×
                        </span>
                      </div>
                    )) || (
                        <p className="text-sm text-muted-foreground">
                          No frequent purchases
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </>
          ) : null}

        </SheetContent>
      </Sheet>

      {/* Modals */}
      <CreateCustomerModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={loadInitial} />
      <EditCustomerModal open={showEditModal} customer={selectedCustomer} onClose={() => setShowEditModal(false)} onSuccess={loadInitial} />
      <DeleteCustomerModal open={showDeleteModal} customer={selectedCustomer} onClose={() => setShowDeleteModal(false)} onSuccess={loadInitial} />
    </div>
  );
}
