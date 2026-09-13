import type { Product } from '../components/products/product'

import earrings from './categories/earings.json'
import necklaces from './categories/neckless.json'
import rings from './categories/rings.json'

/**
 * The whole catalogue in one place.
 *
 * Each category's JSON only describes products; the category itself (its
 * title and URL) lives here, so a product always knows where it came from.
 * To add a category: import its JSON and add one entry below.
 */
export interface Catalogue {
    slug: string
    title: string
    products: Product[]
}

export const catalogue: Catalogue[] = [
    { slug: 'earrings', title: 'Earrings', products: earrings as Product[] },
    { slug: 'necklaces', title: 'Necklaces', products: necklaces as Product[] },
    { slug: 'rings', title: 'Rings', products: rings as Product[] },
]

/** A product plus the category it belongs to. */
export interface CatalogueEntry {
    product: Product
    categorySlug: string
    categoryTitle: string
}

/**
 * The URL for a product detail page. `ref_no` is already unique per piece
 * (NIMI-EAR-001), so it doubles as the route segment.
 */
export const productHref = (product: Product) =>
    `/products/${product.ref_no.toLowerCase()}`

export const allEntries: CatalogueEntry[] = catalogue.flatMap((category) =>
    category.products.map((product) => ({
        product,
        categorySlug: category.slug,
        categoryTitle: category.title,
    })),
)

export const findEntry = (ref: string): CatalogueEntry | undefined =>
    allEntries.find(
        (entry) => entry.product.ref_no.toLowerCase() === ref.toLowerCase(),
    )

/** Other pieces from the same category, for the "you may also like" row. */
export const relatedProducts = (entry: CatalogueEntry, limit = 4): Product[] =>
    catalogue
        .find((category) => category.slug === entry.categorySlug)
        ?.products.filter((p) => p.ref_no !== entry.product.ref_no)
        .slice(0, limit) ?? []
