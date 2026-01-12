"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Package, Bell, X, Shirt } from "lucide-react"
import Link from "next/link"
import apiClient from "@/lib/api-client"
import { Product } from "@/types/product"
import { Order } from "@/types/order"
import { Customer } from "@/types/customer"
import { toast } from 'sonner';

type ClothingCategory = "tops" | "bottoms" | "sets" | "dresses";

const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  tops: "Top",
  bottoms: "Bottom",
  sets: "Set",
  dresses: "Dress",
};

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];
const COLOR_OPTIONS = ["Black", "White", "Beige", "Brown", "Blue", "Pink"];

export default function AccountPage() {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [favorites, setFavorites] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPasswordReset, setShowPasswordReset] = useState(false)

  const customerId = typeof window !== "undefined" ? localStorage.getItem("customerId") : null

  // Password reset form
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    email: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
  })
  const [originalProfile, setOriginalProfile] = useState(profileData)
  const [lastPasswordReset, setLastPasswordReset] = useState<Date>()

  useEffect(() => {
    if (!customerId) return;

    const load = async () => {
      try {
        const res = await apiClient.get(`/customers/${customerId}`)
        const c = res.data

        // Ensure preferences always exist
        c.preferences = safePreferences(c.preferences)

        setCustomer(c)
        setOrders(c.orders || [])
        setLastPasswordReset(c.lastPasswordReset)
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [customerId])

  useEffect(() => {
    if (!customer) return

    setProfileData({
      email: customer.email || "",
      phoneNumber: customer.phoneNumber || "",
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
    })
    setOriginalProfile(profileData)
  }, [customer])


  // Load favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!customerId) return
      try {
        const response = await apiClient.get(`/customers/${customerId}/favorites/products`)
        setFavorites(response.data)
      } catch (error) {
        console.error("Favorites error:", error)
      }
    }
    fetchFavorites()
  }, [])


  const handleProfileChange = (e: any) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const saveProfile = async () => {
    try {
      const res = await apiClient.put(`/customers/${customerId}`, profileData)
      setCustomer({ ...res.data, preferences: safePreferences(res.data.preferences) })
      setIsEditing(false)
      toast.success("Profile updated successfully!")
    } catch (err) {
      console.error("Failed to update profile:", err)
      toast.error("Failed to update profile.")
    }
  }

  const cancelProfileEdit = () => {
    setProfileData(originalProfile)
    setIsEditing(false)
  }


  const handlePasswordReset = async (e: any) => {
    e.preventDefault()
    setError("")

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      const response = await apiClient.post("/auth/reset-password", {
        email: customer?.email,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      })

      setLastPasswordReset(response.data.lastPasswordReset)
      setShowPasswordReset(false)
      toast.success("Password reset successfully!")
    } catch (err: any) {
      setError(err.response?.data?.message || "Password reset failed")
      toast.error("Password reset failed.")
    }
  }

  const removeFavorite = async (id: string) => {
    try {
      setFavorites(prev => prev.filter(f => f._id !== id))
      await apiClient.delete(`/customers/${customerId}/favorites/${id}`)
    } catch (err) {
      console.error("Remove favorite failed:", err)
    }
  }

  // --------------------------
  // SAFE preference structure
  // --------------------------
  const safePreferences = (prefs: any) => ({
    colors: prefs?.colors ?? [],
    sizes: {
      tops: prefs?.sizes?.tops ?? [],
      bottoms: prefs?.sizes?.bottoms ?? [],
      sets: prefs?.sizes?.sets ?? [],
      dresses: prefs?.sizes?.dresses ?? [],
    },
  });

  // --------------------------
  // TOGGLE SIZE
  // --------------------------
  function toggleSize(category: ClothingCategory, size: string) {
    setCustomer(prev => {
      if (!prev) return prev;

      const current = safePreferences(prev.preferences);

      const exists = current.sizes[category].includes(size);

      return {
        ...prev,
        preferences: {
          ...current,
          sizes: {
            ...current.sizes,
            [category]: exists
              ? current.sizes[category].filter((s: string) => s !== size)
              : [...current.sizes[category], size]
          }
        }
      };
    });
  }

  // --------------------------
  // TOGGLE COLOR
  // --------------------------
  function toggleColor(color: string) {
    setCustomer(prev => {
      if (!prev) return prev;

      const current = safePreferences(prev.preferences);
      const exists = current.colors.includes(color);

      return {
        ...prev,
        preferences: {
          ...current,
          colors: exists
            ? current.colors.filter((c: string) => c !== color)
            : [...current.colors, color],
        },
      };
    });
  }

  // --------------------------
  // SAVE TO BACKEND
  // --------------------------
  async function savePreferences() {
    if (!customerId || !customer) return;

    await apiClient.put(
      `/customers/${customerId}/preferences`,
      safePreferences(customer.preferences)
    );
    toast.success("Preferences saved successfully!")
  }

  const prefs = safePreferences(customer?.preferences);

  if (!customerId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full p-6">
          <CardHeader>
            <CardTitle>Please Log In</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You must be logged in to view your account.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="absolute top-0 left-15 right-0 p-4 border-t border-sidebar-border bg-sidebar">
          <Link href="/shop" className="text-sm text-sidebar-foreground hover:underline">
            Back to Store
          </Link>
        </div>
        <h1 className="text-3xl font-bold">My Account</h1>
        <p className="text-muted-foreground">Manage your profile, orders, and preferences</p>


        {/* ---------------------------------------- */}
        {/* PROFILE SECTION */}
        {/* ---------------------------------------- */}

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Profile Information</CardTitle>

            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={cancelProfileEdit}>Cancel</Button>
                <Button onClick={saveProfile}>Save</Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Email / Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Email</label>
                <Input name="email" value={profileData.email} disabled={!isEditing} onChange={handleProfileChange} />
              </div>

              <div>
                <label className="font-medium">Phone</label>
                <Input name="phoneNumber" value={profileData.phoneNumber} disabled={!isEditing} onChange={handleProfileChange} />
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium">First Name</label>
                <Input name="firstName" value={profileData.firstName} disabled={!isEditing} onChange={handleProfileChange} />
              </div>

              <div>
                <label className="font-medium">Last Name</label>
                <Input name="lastName" value={profileData.lastName} disabled={!isEditing} onChange={handleProfileChange} />
              </div>
            </div>

            {/* Password section */}
            <div className="flex items-center justify-between pt-4 pb-4 border-t">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground p-2">
                  Last changed {new Date(lastPasswordReset || customer?.createdAt || "").toDateString()}
                </p>
              </div>

              <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
                <DialogTrigger asChild>
                  <Button variant="outline">Update</Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader><DialogTitle>Reset Password</DialogTitle></DialogHeader>

                  {error && <p className="text-red-500">{error}</p>}

                  <form className="space-y-4" onSubmit={handlePasswordReset}>
                    <Input type="password" name="oldPassword" placeholder="Old password" onChange={e => setFormData({ ...formData, oldPassword: e.target.value })} required />
                    <Input type="password" name="newPassword" placeholder="New password" onChange={e => setFormData({ ...formData, newPassword: e.target.value })} required />
                    <Input type="password" name="confirmPassword" placeholder="Confirm new password" onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} required />

                    <Button type="submit" className="w-full">Reset Password</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Gift Card Balance */}
            <div className="bg-accent/10 p-4 rounded-lg flex items-center justify-between mt-4">
              <div>
                <p>Gift Card Balance</p>
                <p className="text-2xl font-bold text-accent">${((customer?.giftCardBalance ?? 0) / 100).toFixed(2)}</p>
              </div>

              <Link href="/gift-cards">
                <Button>View Gift Cards</Button>
              </Link>
            </div>

          </CardContent>
        </Card>
  {/* ---------------------------------------------- */}
      {/* CLOTHING PREFERENCES */}
      {/* ---------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shirt className="w-5 h-5" />
            Clothing Preferences
          </CardTitle>
          <CardDescription>
            Used for quick add-to-cart selections
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* OPEN MODAL */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Update Preferences</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Update Clothing Preferences</DialogTitle>
              </DialogHeader>

              {/* CATEGORY SIZES */}
              <div className="mt-4 space-y-6">
                {(Object.keys(CATEGORY_LABELS) as ClothingCategory[]).map(cat => (
                  <div key={cat}>
                    <label className="font-medium text-sm">
                      {CATEGORY_LABELS[cat]} Size
                    </label>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {SIZE_OPTIONS.map(size => (
                        <button
                          key={size}
                          onClick={() => toggleSize(cat, size)}
                          className={`px-3 py-1 rounded-full border text-sm
                            ${prefs.sizes[cat].includes(size)
                              ? "bg-accent text-white border-accent"
                              : "bg-muted text-foreground border-border"}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* COLORS */}
              <div className="mt-6">
                <label className="font-medium text-sm">Preferred Colors</label>

                <div className="flex flex-wrap gap-2 mt-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      className={`px-3 py-1 rounded-full border text-sm
                        ${prefs.colors.includes(color)
                          ? "bg-accent text-white border-accent"
                          : "bg-muted text-foreground border-border"}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={savePreferences} className="w-full mt-6">
                Save Preferences
              </Button>
            </DialogContent>
          </Dialog>

          {/* ---------------------------------------------- */}
          {/* SHOW CURRENT PREFERENCES */}
          {/* ---------------------------------------------- */}
          <div className="mt-8 space-y-4">
            {(Object.keys(CATEGORY_LABELS) as ClothingCategory[]).map(cat => (
              <div key={cat}>
                <p className="font-medium text-sm">{CATEGORY_LABELS[cat]} Size</p>
                <p className="text-muted-foreground">
                  {prefs.sizes[cat].length
                    ? prefs.sizes[cat].join(", ")
                    : "None selected"}
                </p>
              </div>
            ))}

            <div className="mt-4">
              <p className="font-medium text-sm">Preferred Colors</p>
              <p className="text-muted-foreground">
                {prefs.colors.length
                  ? prefs.colors.join(", ")
                  : "None selected"}
              </p>
            </div>
          </div>

        </CardContent>
      </Card>

        {/* ---------------------------------------- */}
        {/* ORDER HISTORY */}
        {/* ---------------------------------------- */}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" /> Order History
            </CardTitle>
          </CardHeader>

          <CardContent>
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o._id} className="border rounded-lg p-4 flex justify-between">
                    <div>
                      <p className="font-medium">Order #{o._id?.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">${(o.total / 100).toFixed(2)}</p>
                      <p className="text-muted-foreground capitalize">{o.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>



        {/* ---------------------------------------- */}
        {/* WISHLIST */}
        {/* ---------------------------------------- */}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Saved Items
            </CardTitle>
            <CardDescription>Your bookmarked favorites</CardDescription>
          </CardHeader>

          <CardContent>
            {favorites.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No saved items yet</p>
            ) : (
              <div className="space-y-6">
                {favorites.map((item) => (
                  <div key={item._id} className="flex gap-4 border p-4 rounded-lg relative">

                    {/* Remove */}
                    <button onClick={() => removeFavorite(item._id)} className="absolute right-2 top-2 hover:bg-gray-200 rounded">
                      <X className="w-4 h-4" />
                    </button>

                    <Link href={`/product/${item._id}`} className="flex gap-4">
                      <img src={item.images[0].url} className="w-20 h-20 rounded-md object-cover" />

                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="font-bold">${item.price.toFixed(2)}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
