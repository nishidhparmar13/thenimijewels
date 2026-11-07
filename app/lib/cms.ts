import type { Product } from '../components/products/product'

/**
 * Read-only client for the Payload CMS (thenimijewels-payload-app).
 *
 * Everything runs on the server: pages call these helpers, and only plain
 * data reaches client components. Payload documents are mapped to the
 * storefront's own `Product` / `Category` shapes here, so no component
 * needs to know field names on the CMS side.
 *
 * Caching: responses are tagged `cms` and refreshed every 60s at most.
 * The CMS also calls /api/revalidate after every save, which refreshes
 * them immediately.
 */

export const CMS_URL = (process.env.CMS_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export const CMS_CACHE_TAG = 'cms'

export interface Category {
    title: string
    slug: string
    description: string
    pageDescription: string
    metaDescription: string
    /** Absolute image URL, or '' when the category has no image. */
    image: string
}

/** A product plus the category it belongs to. */
export interface CatalogueEntry {
    product: Product
    categorySlug: string
    categoryTitle: string
}

// ---------------------------------------------------------------------------
// Raw Payload shapes (only the fields we read)
// ---------------------------------------------------------------------------

interface CmsMedia {
    url?: string | null
}

interface CmsCategory {
    title: string
    slug: string
    description?: string | null
    pageDescription?: string | null
    metaDescription?: string | null
    image?: CmsMedia | string | null
}

interface CmsProduct {
    title: string
    refNo?: string | null
    category?: CmsCategory | string | null
    price: number
    discountAmount?: number | null
    discountDescription?: string | null
    description?: string | null
    type: string
    label?: string | null
    materials?: string | null
    care?: string | null
    isAvailable?: boolean | null
    images?: (CmsMedia | string)[] | null
}

interface CmsList<T> {
    docs: T[]
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

const cmsFetch = async <T>(path: string, params: Record<string, string>): Promise<T> => {
    const url = new URL(`/api/${path}`, CMS_URL)
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)

    const res = await fetch(url, {
        next: { revalidate: 60, tags: [CMS_CACHE_TAG] },
    })
    if (!res.ok) {
        throw new Error(`CMS request failed: ${res.status} ${res.statusText} (${url})`)
    }
    return res.json() as Promise<T>
}

/** Payload returns `/api/media/file/x.png`; next/image needs an absolute URL. */
const mediaUrl = (media: CmsMedia | string | null | undefined): string => {
    if (!media || typeof media === 'string' || !media.url) return ''
    return media.url.startsWith('http') ? media.url : `${CMS_URL}${media.url}`
}

const toCategory = (doc: CmsCategory): Category => ({
    title: doc.title,
    slug: doc.slug,
    description: doc.description ?? '',
    pageDescription: doc.pageDescription ?? '',
    metaDescription: doc.metaDescription ?? '',
    image: mediaUrl(doc.image),
})

const toProduct = (doc: CmsProduct): Product => ({
    name: doc.title,
    ref_no: doc.refNo ?? '',
    amount: doc.price,
    discount_amount: doc.discountAmount ?? 0,
    discount_description: doc.discountDescription ?? undefined,
    description: doc.description ?? undefined,
    type: doc.type,
    label: doc.label ?? '',
    materials: doc.materials ?? undefined,
    care: doc.care ?? undefined,
    is_available: doc.isAvailable !== false,
    image: (doc.images ?? []).map(mediaUrl).filter(Boolean),
})

const toEntry = (doc: CmsProduct): CatalogueEntry | undefined => {
    if (!doc.refNo || !doc.category || typeof doc.category === 'string') return undefined
    return {
        product: toProduct(doc),
        categorySlug: doc.category.slug,
        categoryTitle: doc.category.title,
    }
}

const fetchProducts = async (where: Record<string, string> = {}, limit = 0) => {
    const { docs } = await cmsFetch<CmsList<CmsProduct>>('products', {
        ...where,
        depth: '1',
        sort: 'displayOrder',
        // limit=0 → every match (Payload disables pagination)
        limit: String(limit),
    })
    return docs.map(toEntry).filter((e): e is CatalogueEntry => Boolean(e))
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

export const getCategories = async (): Promise<Category[]> => {
    const { docs } = await cmsFetch<CmsList<CmsCategory>>('categories', {
        depth: '1',
        sort: 'displayOrder',
        limit: '0',
    })
    return docs.map(toCategory)
}

export const getCategory = async (slug: string): Promise<Category | undefined> => {
    const { docs } = await cmsFetch<CmsList<CmsCategory>>('categories', {
        'where[slug][equals]': slug,
        depth: '1',
        limit: '1',
    })
    return docs[0] ? toCategory(docs[0]) : undefined
}

export const getProductsByCategory = async (slug: string): Promise<Product[]> =>
    (await fetchProducts({ 'where[category.slug][equals]': slug })).map((e) => e.product)

export const getAllEntries = (): Promise<CatalogueEntry[]> => fetchProducts()

/** `ref` is the URL segment, e.g. "nimi-ear-001". */
export const getEntry = async (ref: string): Promise<CatalogueEntry | undefined> =>
    (await fetchProducts({ 'where[refNo][equals]': ref.toUpperCase() }, 1))[0]

/** Other pieces from the same category, for the "you may also like" row. */
export const getRelatedProducts = async (
    entry: CatalogueEntry,
    limit = 4,
): Promise<Product[]> =>
    (
        await fetchProducts(
            {
                'where[category.slug][equals]': entry.categorySlug,
                'where[refNo][not_equals]': entry.product.ref_no,
            },
            limit,
        )
    ).map((e) => e.product)

/**
 * The URL for a product detail page. `ref_no` is already unique per piece
 * (NIMI-EAR-001), so it doubles as the route segment.
 */
export const productHref = (product: Product) => `/products/${product.ref_no.toLowerCase()}`
