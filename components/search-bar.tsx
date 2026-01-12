"use client";

import { useState, useRef, useEffect, forwardRef } from "react";
import { Search, X, ShoppingCart } from "lucide-react";
import apiClient from "@/lib/api-client";
import { debounce } from "@/lib/debounce";
import { useCart } from "@/context/cart-context";

const SearchBar = forwardRef<HTMLDivElement>((props, ref) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const { refreshCart } = useCart();

  // Focus input when opening
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!open) return;

      if (e.key === "ArrowDown") {
        setHighlightIndex((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        setHighlightIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter") {
        const product = results[highlightIndex];
        if (product) window.location.href = `/product/${product._id}`;
      }
      if (e.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, results, highlightIndex]);

  // Fetch suggestions & results
  const fetchResults = debounce(async (text: string) => {
    const res = await apiClient.get(`/search/suggestions?q=${encodeURIComponent(text)}`);

    setResults(res.data.products);
    setSuggestions(res.data.suggestions);
    setCategories(res.data.categories);
  }, 200);

  const handleChange = (value: string) => {
    setQuery(value);
    setOpen(true);
    fetchResults(value);
  };

  // Close search bar when clicking outside
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Highlight match
  const highlightText = (text: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "ig");
    return text.replace(regex, `<span class="text-accent font-semibold">$1</span>`);
  };

  const addToCart = async (productId: string) => {
    try {
      let cartId = localStorage.getItem("cartId");

      if (!cartId) {
        const sessionId = crypto.randomUUID();
        const res = await apiClient.post("/cart", { sessionId });

        cartId = res.data._id;
        localStorage.setItem("cartId", cartId!);
      }

      await apiClient.post(`/cart/${cartId}/items`, {
        productId,
        quantity: 1,
      });

      refreshCart();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* BACKDROP */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10"
          onClick={() => setOpen(false)}
        />
      )}

      <div ref={wrapperRef} className="relative z-20 flex items-center" {...props}>
        {/* SEARCH ICON */}
        <button onClick={() => setOpen((prev) => !prev)} className="p-2">
          <Search className="w-5 h-5 text-[#7a4a2e]" />
        </button>

        {/* SEARCH INPUT */}
        <div
          className={`
            absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-gray-200
            rounded-full shadow-md flex items-center transition-all overflow-hidden
            ${open ? "w-72 md:w-96 px-4 py-2 opacity-100" : "w-0 px-0 py-0 opacity-0 pointer-events-none"}
          `}
        >
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search products…"
            className="w-full bg-transparent outline-none text-sm"
          />

          {query ? (
            <X className="w-4 h-4 cursor-pointer" onClick={() => setQuery("")} />
          ) : (
            <Search className="w-4 h-4 text-gray-400" />
          )}
        </div>

        {/* DROPDOWN */}
        {open && (
          <div className="absolute right-0 top-14 w-80 md:w-96 bg-white border rounded-lg shadow-xl z-30 p-3 space-y-4">
            {/* SUGGESTIONS */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 mb-1">Suggestions</h4>
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  className="block w-full text-left p-2 hover:bg-gray-100 rounded"
                  onClick={() => handleChange(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* CATEGORIES */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 mb-1">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className="px-3 py-1 bg-gray-100 rounded-full text-xs hover:bg-gray-200"
                    onClick={() => {
                      window.location.href = `/search?category=${cat.toLowerCase()}`;
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* RESULTS */}
            <div className="space-y-2">
              {results.map((product, idx) => (
                <div
                  key={product._id}
                  className={`flex items-center justify-between p-2 rounded ${
                    idx === highlightIndex ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <a href={`/product/${product._id}`} className="flex items-center gap-3">
                    <img src={product.images?.[0]?.url} className="w-12 h-12 rounded" />
                    <div
                      dangerouslySetInnerHTML={{
                        __html: `
                          <p class="font-medium text-sm">${highlightText(product.name)}</p>
                          <p class="text-xs text-gray-500">$${product.price.toFixed(2)}</p>
                        `,
                      }}
                    />
                  </a>

                  <button onClick={() => addToCart(product._id)} className="p-2">
                    <ShoppingCart className="w-4 h-4 text-[#7a4a2e]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
});

SearchBar.displayName = "SearchBar";
export default SearchBar;
