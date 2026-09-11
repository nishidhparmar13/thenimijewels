import React from 'react'
import { categoryGroups } from './categoriesData'
import CategoryGroupSection from './CategoryGroupSection'

/**
 * "Shop by Category" section for the homepage.
 *
 * This component just lays out the page section and loops over
 * `categoryGroups` (Earrings, Necklace, Ring, ...). All the actual
 * content lives in `categoriesData.ts`, and the visuals are split into:
 *   - CategoryGroupSection -> one group's heading + grid
 *   - CategoryCard         -> one clickable sub-category tile
 *
 * To add a new group or sub-category, edit categoriesData.ts only.
 */
const CategoriesView = () => {
    return (
        <section
            id="categories"
            // scroll-mt-* stops this section's top from hiding under the
            // sticky/fixed Header when the Header's "Categories" link
            // jumps here via #categories.
            className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
            {/* Section intro */}
            <div className="mb-10 text-center sm:mb-14">
                <span className="text-xs font-medium tracking-[0.25em] text-champagne uppercase">
                    Shop by Category
                </span>
                <h2 className="mt-2 font-heading text-3xl text-burgundy sm:text-4xl">
                    Find Your Piece
                </h2>
            </div>

            {/* One block per category group, stacked vertically */}
            <div className="flex flex-col gap-12 sm:gap-16">
                {categoryGroups.map((group) => (
                    <CategoryGroupSection key={group.title} group={group} />
                ))}
            </div>
        </section>
    )
}

export default CategoriesView
