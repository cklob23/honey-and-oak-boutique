// types/product.ts

export interface ProductImage {
  url: string
  alt?: string
  _id?: string
}

export interface ProductSize {
  size: string
  stock: number
  sku: number
}

export interface Product {
  _id: string
  name: string
  description: string
  price: number
  salePrice?: number
  category: "tops" | "bottoms" | "dresses" | "sets" | "accessories" | "self-care"
  images: ProductImage[]
  sizes: ProductSize[]
  colors: string[]
  material?: string
  rating?: number
  reviews?: number
  sizeChart?: {
    measurements: any
    image?: string
  }
  care?: string
  isNewArrival: boolean
  isSale: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductSizeChart {
  measurements: Record<string, any>   // e.g. { S: { bust: 34, length: 24 } }
  image?: string
}
