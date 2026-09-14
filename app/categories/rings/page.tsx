import type { Metadata } from 'next'
import CategoryView from '../../page-components/CategoryView'
import rings from '../../data/categories/rings.json'
import type { Product } from '../../components/products/product'

export const metadata: Metadata = {
    title: 'Rings | nimi',
    description:
        'Everyday oxidised bands, adjustable stacks and cocktail statements in skin-kind, anti-tarnish metal.',
}

const RingsPage = () => {
    return (
        <CategoryView
            title="Rings"
            description="Statement rings and everyday stacks. Thoughtfully designed to add a little soul to every look."
            products={rings as Product[]}
        />
    )
}

export default RingsPage
