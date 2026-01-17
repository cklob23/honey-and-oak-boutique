// Product types matching backend model
export interface ProductImage {
  url: string
  alt?: string
  _id?: string
}

export interface ProductSize {
  size: string
  stock: number
  sku?: string // Added sku field to ProductSize for variant-level SKUs
}

export type ProductCategory =
  | "tops"
  | "bottoms"
  | "dresses"
  | "sets"
  | "accessories"
  | "hair-accessories"
  | "jewelry"
  | "self-care" // Updated category type to include hair-accessories and jewelry sub-categories

export interface Product {
  _id: string
  sku?: string // Made optional since SKUs are now at size level
  name: string
  description: string
  price: number
  salePrice?: number
  category: ProductCategory
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