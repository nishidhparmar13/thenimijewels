/**
 * Shared product shape and price helpers.
 *
 * These live outside ProductCard because that file is a client component —
 * anything exported from it can't be called during a server render (page
 * metadata, static params, and so on).
 */

/** One entry from app/data/categories/*.json */
export interface Product {
    name: string
    description?: string
    amount: number
    image: string[]
    ref_no: string
    discount_amount: number
    discount_description?: string
    type: string
    label: string
}

/** ₹1,299 — Indian grouping, no decimals. */
export const formatPrice = (value: number) =>
    `₹${value.toLocaleString('en-IN')}`

/** `amount` is the MRP; `discount_amount` is the money taken off it. */
export const finalPrice = (product: Product) =>
    Math.max(product.amount - product.discount_amount, 0)
