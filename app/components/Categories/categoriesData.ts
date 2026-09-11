/**
 * All the content for the "Shop by Category" section lives here.
 *
 * Why a separate data file?
 * The components in this folder (CategoryCard, CategoryGroupSection,
 * CategoriesView) only know how to RENDER a list — they don't know what's
 * in it. To add a new jewellery type or a new sub-category, you only need
 * to edit the plain data below. No JSX, no component code to touch.
 */

// One clickable tile inside a group, e.g. "Oxidised" under "Rings".
export interface SubCategory {
    name: string
    href: string
}

// One top-level section, e.g. "Earrings" with all its sub-categories.
export interface CategoryGroup {
    title: string
    // URL-friendly id, e.g. "earrings". Used both for the sub-category
    // links AND as the anchor id the Header's dropdown scrolls to
    // (see CategoryGroupSection's `id={category-${slug}}`).
    slug: string
    description: string
    items: SubCategory[]
}

/**
 * Turns "Stone Studded" into "stone-studded" so we can build a clean URL.
 * Kept here (next to the data) since it's only ever used to build hrefs below.
 */
const slugify = (label: string): string =>
    label.toLowerCase().trim().replace(/\s+/g, '-')

/**
 * Builds the sub-category list for one group, so every group's items
 * end up with a consistent href pattern: /categories/<group>/<item>.
 */
const buildItems = (groupSlug: string, names: string[]): SubCategory[] =>
    names.map((name) => ({
        name,
        href: `/categories/${groupSlug}/${slugify(name)}`,
    }))

export const categoryGroups: CategoryGroup[] = [
    {
        title: 'Earrings',
        slug: 'earrings',
        description: 'Jhumkas, studs and statement drops',
        items: buildItems('earrings', [
            'Oxidised',
            'Korean',
            'Jhumkas',
            'Studs',
            'Chandbali',
            'Danglers',
        ]),
    },
    {
        title: 'Necklace',
        slug: 'necklace',
        description: 'Chokers, layered chains and pendants',
        items: buildItems('necklace', [
            'Oxidised',
            'Korean',
            'Chokers',
            'Layered',
            'Pendant',
            'Temple',
        ]),
    },
    {
        title: 'Ring',
        slug: 'ring',
        description: 'Everyday bands to statement cocktail rings',
        items: buildItems('ring', [
            'Oxidised',
            'Korean',
            'Adjustable',
            'Stone Studded',
            'Band',
            'Cocktail',
        ]),
    },
]
