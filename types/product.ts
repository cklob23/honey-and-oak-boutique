// types/product.ts

export interface ProductImage {
  url: string
  alt?: string
  _id?: string
}

export interface ProductSize {
  size: string
  stock: number
  _id?: string
}

export interface ProductSizeChart {
  measurements: Record<string, any>   // e.g. { S: { bust: 34, length: 24 } }
  image?: string
}

export interface Product {
  _id: string
  sku: string
  name: string
  description: string
  price: number
  salePrice?: number
  category: "tops" | "bottoms" | "dresses" | "sets" | "accessories" | "self-care"
  images: ProductImage[]
  sizes: ProductSize[]
  colors: string[]
  material?: string
  care?: string
  rating: number
  reviews?: number
  sizeChart?: ProductSizeChart
  isNewArrival: boolean
  isSale: boolean
  createdAt: string | Date
  updatedAt: string | Date
}
