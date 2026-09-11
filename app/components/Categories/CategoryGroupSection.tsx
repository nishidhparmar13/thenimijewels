import React from 'react'
import type { CategoryGroup } from './categoriesData'
import CategoryCard from './CategoryCard'

interface CategoryGroupSectionProps {
    group: CategoryGroup
}

/**
 * Renders ONE section, e.g. everything under "Earrings":
 * a heading + a responsive grid of its sub-category cards.
 */
const CategoryGroupSection = ({ group }: CategoryGroupSectionProps) => {
    return (
        // `scroll-mt-*` keeps this heading from hiding under the sticky/
        // fixed Header when the Header's dropdown links here via #anchor.
        <div id={`category-${group.slug}`} className="scroll-mt-28">
            {/* Section heading */}
            <div className="mb-5 sm:mb-6">
                <h3 className="font-heading text-2xl text-burgundy sm:text-3xl">
                    {group.title}
                </h3>
                <p className="mt-1 text-sm text-taupe">{group.description}</p>
            </div>

            {/* Grid of sub-category cards.
                2 columns on phones, 3 on small tablets, 6 on large screens
                so a 6-item group like Earrings fills exactly one row. */}
            <div
                className="
                    grid
                    grid-cols-2
                    gap-3
                    sm:grid-cols-3
                    sm:gap-4
                    lg:grid-cols-6
                "
            >
                {group.items.map((item) => (
                    <CategoryCard key={item.href} category={item} />
                ))}
            </div>
        </div>
    )
}

export default CategoryGroupSection
