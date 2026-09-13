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
            description="Everyday bands, adjustable stacks and cocktail statements — sized to be forgiving, finished in skin-kind, anti-tarnish metal."
            products={rings as Product[]}
        />
    )
}

export default RingsPage
