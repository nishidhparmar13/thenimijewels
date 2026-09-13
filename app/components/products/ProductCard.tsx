'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { finalPrice, formatPrice, type Product } from './product'

const labelStyles: Record<string, string> = {
    trending: 'bg-burgundy text-ivory',
    new: 'bg-champagne text-burgundy',
    bestseller: 'bg-wine text-ivory',
}

interface ProductCardProps {
    product: Product
}

/**
 * One product tile.
 *
 * The first image in `image[]` is the thumbnail; the second (when there is
 * one) cross-fades in on hover. Product photography isn't in `public/` yet,
 * so a failed load falls back to a champagne monogram rather than a broken
 * image icon.
 */
const ProductCard = ({ product }: ProductCardProps) => {
    const [thumbFailed, setThumbFailed] = useState(false)
    const [altFailed, setAltFailed] = useState(false)

    const thumb = product.image[0]
    const alt = product.image[1]

    const price = finalPrice(product)
    const hasDiscount = product.discount_amount > 0
    const percentOff = hasDiscount
        ? Math.round((product.discount_amount / product.amount) * 100)
        : 0

    return (
        <article
            data-product-card
            className="
                group
                relative
                flex h-full flex-col
                overflow-hidden
                rounded-xl
                border border-champagne/40
                bg-white
                shadow-[0_8px_24px_rgba(72,12,20,0.05)]
                transition-all duration-500
                sm:rounded-2xl
                hover:-translate-y-1.5
                hover:border-champagne
                hover:shadow-[0_20px_44px_rgba(72,12,20,0.14)]
            "
        >
            <div className="relative h-[350px] w-full overflow-hidden bg-ivory">
                {thumbFailed ? (
                    // Placeholder — swap disappears once real photos land.
                    <div
                        aria-hidden="true"
                        className="
                            flex h-full w-full
                            items-center justify-center
                            bg-gradient-to-br from-ivory via-champagne/20 to-champagne/45
                        "
                    >
                        <span className="font-heading text-5xl leading-none text-white/70 sm:text-6xl">
                            {product.name.charAt(0)}
                        </span>
                    </div>
                ) : (
                    <Image
                        src={thumb}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        onError={() => setThumbFailed(true)}
                        className="
                            object-cover
                            transition-transform duration-700
                            group-hover:scale-105
                        "
                    />
                )}

                {/* Second shot, revealed on hover */}
                {alt && !altFailed && !thumbFailed && (
                    <Image
                        src={alt}
                        alt=""
                        aria-hidden="true"
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        onError={() => setAltFailed(true)}
                        className="
                            object-cover
                            opacity-0
                            transition-all duration-700
                            group-hover:scale-105
                            group-hover:opacity-100
                        "
                    />
                )}

                {/* Label badge */}
                {product.label && (
                    <span
                        className={`
                            absolute left-2 top-2
                            rounded-full
                            px-2 py-0.5
                            text-[8px]
                            font-medium
                            uppercase
                            tracking-[0.12em]
                            sm:left-3 sm:top-3
                            sm:px-3 sm:py-1
                            sm:text-[9px] sm:tracking-[0.16em]
                            ${labelStyles[product.label] ?? 'bg-burgundy text-ivory'}
                        `}
                    >
                        {product.label}
                    </span>
                )}

                {/* Saving badge */}
                {hasDiscount && (
                    <span
                        className="
                            absolute right-2 top-2
                            rounded-full
                            border border-champagne/60
                            bg-ivory/90
                            px-2 py-0.5
                            text-[8px]
                            font-medium
                            uppercase
                            tracking-[0.1em]
                            text-burgundy
                            backdrop-blur-sm
                            sm:right-3 sm:top-3
                            sm:px-2.5 sm:py-1
                            sm:text-[9px] sm:tracking-[0.14em]
                        "
                    >
                        {percentOff}% off
                    </span>
                )}
            </div>

            {/* ---- Details ---- */}
            <div className="flex flex-1 flex-col p-3 sm:p-5">
                {/* Clamped to two lines so every card in a row is the
                    same height, however long the name runs. */}
                <h3
                    title={product.name}
                    className="
                        line-clamp-2
                        min-h-[2.5rem]
                        font-heading
                        text-base
                        leading-snug
                        text-burgundy
                        break-words
                        hyphens-auto
                        sm:min-h-[3.25rem]
                        sm:text-xl
                    "
                >
                    {product.name}
                </h3>

                <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-taupe sm:text-[10px] sm:tracking-[0.16em]">
                    {product.ref_no}
                </p>

                <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-3 sm:pt-4">
                    <span className="text-sm font-medium text-burgundy sm:text-lg">
                        {formatPrice(price)}
                    </span>

                    {hasDiscount && (
                        <>
                            <span className="text-[11px] text-taupe line-through sm:text-xs">
                                {formatPrice(product.amount)}
                            </span>

                            {/* Two columns on a phone leave no room for this
                                as well — the % badge already says it. */}
                            <span className="hidden text-[10px] font-medium uppercase tracking-[0.12em] text-wine sm:inline">
                                Save {formatPrice(product.discount_amount)}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Whole tile is the link. An overlay anchor keeps the markup
                flat, so FLIP still animates a single element per card. */}
            <Link
                href={`/products/${product.ref_no.toLowerCase()}`}
                className="absolute inset-0 z-10 rounded-xl sm:rounded-2xl"
            >
                <span className="sr-only">View {product.name}</span>
            </Link>

            {/* Champagne hairline that draws across the base on hover */}
            <span
                aria-hidden="true"
                className="
                    absolute inset-x-0 bottom-0
                    h-0.5
                    origin-left
                    scale-x-0
                    bg-champagne
                    transition-transform duration-500
                    group-hover:scale-x-100
                "
            />
        </article>
    )
}

export default ProductCard
