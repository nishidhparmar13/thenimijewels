import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import CategoryView from '../../page-components/CategoryView'
import { getCategories, getCategory, getProductsByCategory } from '../../lib/cms'

// Known categories are prerendered; ones added in the CMS later render on
// first visit.
export const generateStaticParams = async () =>
    (await getCategories()).map((category) => ({ slug: category.slug }))

export const generateMetadata = async ({
    params,
}: PageProps<'/categories/[slug]'>): Promise<Metadata> => {
    const { slug } = await params
    const category = await getCategory(slug)

    if (!category) return { title: 'Category not found | nimi' }

    return {
        title: `${category.title} | nimi`,
        description: category.metaDescription || category.description,
    }
}

const CategoryPage = async ({ params }: PageProps<'/categories/[slug]'>) => {
    const { slug } = await params
    const [category, products] = await Promise.all([
        getCategory(slug),
        getProductsByCategory(slug),
    ])

    if (!category) notFound()

    return (
        <CategoryView
            title={category.title}
            description={category.pageDescription || category.description}
            products={products}
        />
    )
}

export default CategoryPage
