import type { Metadata } from 'next'
import CategoryView from '../../page-components/CategoryView'
import necklaces from '../../data/categories/neckless.json'
import type { Product } from '../../components/products/product'

export const metadata: Metadata = {
    title: 'Necklaces | nimi',
    description:
        'Oxidised chokers, layered chains and temple pendants, hand-finished in skin-kind, anti-tarnish metal.',
}

const NecklacesPage = () => {
    return (
        <CategoryView
            title="Necklaces"
            description="Chokers and temple pendants. Weighted to sit beautifully."
            products={necklaces as Product[]}
        />
    )
}

export default NecklacesPage
