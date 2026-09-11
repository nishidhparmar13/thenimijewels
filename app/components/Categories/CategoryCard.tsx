import Link from 'next/link'
import React from 'react'
import type { SubCategory } from './categoriesData'

interface CategoryCardProps {
    category: SubCategory
}

/**
 * A single clickable tile, e.g. "Oxidised" or "Korean".
 *
 * We don't have real product photos for every sub-category yet, so instead
 * of a broken <img>, each card shows the category's first letter as a big
 * decorative monogram on a soft brand-coloured background. Swap in a real
 * <Image> here later without touching any other file.
 */
const CategoryCard = ({ category }: CategoryCardProps) => {
    const monogram = category.name.charAt(0)

    return (
        <Link
            href={category.href}
            className="
                group
                relative
                flex
                aspect-square
                flex-col
                items-center
                justify-center
                gap-2
                overflow-hidden
                rounded-2xl
                border
                border-champagne/30
                bg-white
                p-4
                text-center
                shadow-[0_6px_20px_rgba(72,12,20,0.06)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-champagne/60
                hover:shadow-[0_16px_36px_rgba(72,12,20,0.14)]
            "
        >
            {/* Decorative background monogram */}
            <span
                aria-hidden="true"
                className="
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                    font-heading
                    text-[6rem]
                    leading-none
                    text-champagne/25
                    transition-transform
                    duration-500
                    group-hover:scale-110
                "
            >
                {monogram}
            </span>

            {/* Category name, sits above the monogram */}
            <span
                className="
                    relative
                    text-sm
                    font-medium
                    tracking-[0.08em]
                    text-burgundy
                    uppercase
                "
            >
                {category.name}
            </span>
        </Link>
    )
}

export default CategoryCard
