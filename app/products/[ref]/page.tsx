import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import ProductView from '../../page-components/ProductView'
import {
    allEntries,
    findEntry,
    relatedProducts,
} from '../../data/catalogue'
import { finalPrice, formatPrice } from '../../components/products/product'

// Every piece in the catalogue is prerendered at build time.
export const generateStaticParams = async () =>
    allEntries.map((entry) => ({ ref: entry.product.ref_no.toLowerCase() }))

export const generateMetadata = async ({
    params,
}: PageProps<'/products/[ref]'>): Promise<Metadata> => {
    const { ref } = await params
    const entry = findEntry(ref)

    if (!entry) return { title: 'Product not found | nimi' }

    const title = `${entry.product.name} | nimi`
    const description = `${entry.product.name} (${entry.product.ref_no}) — ${formatPrice(
        finalPrice(entry.product),
    )}. Hand-finished ${entry.categoryTitle.toLowerCase()} in skin-kind, anti-tarnish metal.`

    return {
        title,
        description,
        // The link preview shown when the order message is pasted into a chat.
        openGraph: {
            title,
            description,
            url: `/products/${entry.product.ref_no.toLowerCase()}`,
            siteName: 'nimi',
            type: 'website',
            images: entry.product.image.slice(0, 1).map((url) => ({
                url,
                alt: entry.product.name,
            })),
        },
    }
}

const ProductPage = async ({ params }: PageProps<'/products/[ref]'>) => {
    const { ref } = await params
    const entry = findEntry(ref)

    if (!entry) notFound()

    return (
        <ProductView
            product={entry.product}
            categorySlug={entry.categorySlug}
            categoryTitle={entry.categoryTitle}
            related={relatedProducts(entry)}
        />
    )
}

export default ProductPage
