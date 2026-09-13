import type { Metadata } from 'next'
import CategoryView from '../../page-components/CategoryView'
import earrings from '../../data/categories/earings.json'
import type { Product } from '../../components/products/product'

export const metadata: Metadata = {
    title: 'Earrings | nimi',
    description:
        'Hand-finished oxidised jhumkas, studs and statement drops in skin-kind, anti-tarnish metal.',
}

const EarringsPage = () => {
    return (
        <CategoryView
            title="Earrings"
            description="Jhumkas, studs and statement drops — hand-finished in skin-kind, anti-tarnish metal. Light enough for a full day, heavy enough on presence."
            products={earrings as Product[]}
        />
    )
}

export default EarringsPage
