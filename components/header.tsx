"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShoppingBag, Menu, X, User, LogOut, ChevronDown } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/context/cart-context"
import SearchBar from "@/components/search-bar"
import apiClient from "@/lib/api-client"
import { Customer } from "@/types"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [clothingOpen, setClothingOpen] = useState(false) // Mobile only
  const [clothingHover, setClothingHover] = useState(false) // Desktop hover
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)

  const router = useRouter()
  const { cartCount } = useCart()
  const accountRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const id = localStorage.getItem("customerId")
    if (id) {
      apiClient.get(`/customers/${id}`).then(res => setCustomer(res.data))
    }
    setCustomerId(id)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("customerId")
    localStorage.removeItem("customerEmail")
    localStorage.removeItem("authToken")
    setCustomerId(null)
    router.push("/shop")
  }

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex-shrink-0 mr-10">
          <Image
            src="/honey-oak-logo.png"
            alt="Honey & Oak Boutique"
            width={180}
            height={80}
            className="h-18 w-auto p-2"
            priority
          />
        </Link>

        {/* ----------------------------- */}
        {/* DESKTOP NAV                   */}
        {/* ----------------------------- */}
        <nav className="hidden md:flex items-center gap-8">

          <Link href="/shop" className="hover:text-accent transition-colors">
            Shop All
          </Link>

          {/* CLOTHING DROPDOWN (DESKTOP) */}
          <div
            className="relative"
            onMouseEnter={() => setClothingHover(true)}
            onMouseLeave={() => setClothingHover(false)}
          >
            <button className="hover:text-accent flex items-center gap-1 transition">
              Clothing <ChevronDown size={16} />
            </button>

            {clothingHover && (
              <div className="absolute left-0 mr-3 bg-white border shadow-lg rounded-lg py-2 w-40 z-50">
                <Link href="/shop?category=tops" className="block px-4 py-2 hover:bg-gray-100">
                  Tops
                </Link>
                <Link href="/shop?category=bottoms" className="block px-4 py-2 hover:bg-gray-100">
                  Bottoms
                </Link>
                <Link href="/shop?category=dresses" className="block px-4 py-2 hover:bg-gray-100">
                  Dresses
                </Link>
                <Link href="/shop?category=sets" className="block px-4 py-2 hover:bg-gray-100">
                  Sets
                </Link>
              </div>
            )}
          </div>

          <Link href="/shop?category=accessories" className="hover:text-accent">
            Accessories
          </Link>
          <Link href="/shop?category=self-care" className="hover:text-accent">
            Self Care
          </Link>
          <Link href="/shop?category=sale" className="hover:text-accent">
            Sale
          </Link>
          {customer?.role === "admin" ? <Link href="/admin" className="hover:text-accent">
            Admin Dashboard
          </Link> : null}
        </nav>

        {/* ----------------------------- */}
        {/* RIGHT BUTTONS                 */}
        {/* ----------------------------- */}
        <div className="flex items-center gap-4">

          {/* SEARCH */}
          <SearchBar />

          {/* ACCOUNT DROPDOWN */}
          <div ref={accountRef} className="relative">
            <button
              onClick={() => setAccountOpen(prev => !prev)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <User className="w-5 h-5 text-[#7a4a2e]" />
            </button>

            {accountOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg p-3 z-50">
                {customerId ? (
                  <>
                    <Link
                      href="/account"
                      className="block px-2 py-2 text-sm hover:bg-gray-100 rounded-md"
                    >
                      My Account
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 rounded-md text-red-600 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="block px-2 py-2 text-sm hover:bg-gray-100 rounded-md">
                      Sign In
                    </Link>
                    <Link href="/auth/signup" className="block px-2 py-2 text-sm hover:bg-gray-100 rounded-md">
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* CART */}
          <Link href="/cart">
            <button className="p-2 rounded-full hover:bg-gray-100 relative transition-colors">
              <ShoppingBag className="w-5 h-5 text-[#7a4a2e]" />
              {cartCount > 0 ? (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              ) : null}
            </button>
          </Link>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* ----------------------------- */}
      {/* MOBILE MENU                   */}
      {/* ----------------------------- */}
      {isOpen && (
        <nav className="md:hidden pb-4 space-y-2 border-t bg-white px-4">

          <Link href="/shop" className="block py-2 hover:text-accent">Shop All</Link>

          {/* Clothing Mobile Accordion */}
          <button
            className="w-full flex justify-between items-center py-2 hover:text-accent"
            onClick={() => setClothingOpen(!clothingOpen)}
          >
            Clothing
            <ChevronDown className={`w-4 h-4 transition ${clothingOpen ? "rotate-180" : ""}`} />
          </button>

          {clothingOpen && (
            <div className="ml-4 space-y-1">
              <Link href="/shop?category=tops" className="block py-1 hover:text-accent">Tops</Link>
              <Link href="/shop?category=bottoms" className="block py-1 hover:text-accent">Bottoms</Link>
              <Link href="/shop?category=dresses" className="block py-1 hover:text-accent">Dresses</Link>
              <Link href="/shop?category=sets" className="block py-1 hover:text-accent">Sets</Link>
            </div>
          )}

          <Link href="/shop?category=accessories" className="block py-2 hover:text-accent">Accessories</Link>
          <Link href="/shop?category=self-care" className="block py-2 hover:text-accent">Self Care</Link>
          <Link href="/shop?category=sale" className="block py-2 hover:text-accent">Sale</Link>
          {customer?.role === "admin" ? <Link href="/admin" className="hover:text-accent">
            Admin Dashboard
          </Link> : null}
        </nav>
      )}
    </header>
  )
}
