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

    return {
        title: `${entry.product.name} | nimi`,
        description: `${entry.product.name} (${entry.product.ref_no}) — ${formatPrice(
            finalPrice(entry.product),
        )}. Hand-finished ${entry.categoryTitle.toLowerCase()} in skin-kind, anti-tarnish metal.`,
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
