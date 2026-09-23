'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FaCheck, FaShoppingBag } from 'react-icons/fa'

import { addToCart, useCartQuantity } from '../components/cart/cartStore'
import { openWhatsApp, productUrl } from '../components/cart/whatsapp'
import ProductGallery from '../components/products/ProductGallery'
import ProductCard from '../components/products/ProductCard'
import {
    finalPrice,
    formatPrice,
    type Product,
} from '../components/products/product'

gsap.registerPlugin(ScrollTrigger)

const labelStyles: Record<string, string> = {
    trending: 'bg-wine text-champagne',
    new: 'bg-charcoal text-ivory',
    bestseller: 'bg-champagne text-burgundy',
}

// Same for every piece in the range — kept here rather than repeated in
// each product's JSON entry.
const shippingDetails = [
    {
        title: 'Shipping & returns',
        copy: 'Shipping charges are calculated based on your delivery location. Orders are dispatched within 2–3 working days.',
    },
]

interface ProductViewProps {
    product: Product
    categorySlug: string
    categoryTitle: string
    related: Product[]
}

const ProductView = ({
    product,
    categorySlug,
    categoryTitle,
    related,
}: ProductViewProps) => {
    const pageRef = useRef<HTMLDivElement>(null)

    // Materials and care come from the product's JSON entry; empty ones
    // are left out rather than shown as a blank row.
    const details = [
        { title: 'Materials', copy: product.materials },
        { title: 'Care', copy: product.care },
        ...shippingDetails,
    ].filter((detail) => detail.copy)

    const price = finalPrice(product)
    const hasDiscount = product.discount_amount > 0
    const percentOff = hasDiscount
        ? Math.round((product.discount_amount / product.amount) * 100)
        : 0

    // Orders just this piece, straight to WhatsApp with the message typed out.
    const orderOnWhatsApp = () => {
        openWhatsApp(
            [
                `Hi nimi, I'd like to order:`,
                `${product.name}`,
                `Ref: ${product.ref_no}`,
                `Price: ${formatPrice(price)}`,
                productUrl(product.ref_no),
            ].join('\n'),
        )
    }

    // The button reads "Added to cart" for as long as the piece is in the
    // cart — it follows the cart itself, so removing it there resets this.
    const isInCart = useCartQuantity(product.ref_no) > 0

    useEffect(() => {
        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia()

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                const intro = gsap.timeline({
                    defaults: { ease: 'power3.out' },
                })

                intro
                    .from('[data-product-gallery]', {
                        x: -32,
                        opacity: 0,
                        duration: 0.8,
                    })
                    .from(
                        '[data-product-detail]',
                        { y: 24, opacity: 0, duration: 0.6, stagger: 0.08 },
                        '-=0.5',
                    )

                gsap.from('[data-related-card]', {
                    y: 40,
                    opacity: 0,
                    duration: 0.7,
                    stagger: 0.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '[data-related]',
                        start: 'top 88%',
                        once: true,
                    },
                })
            })
        }, pageRef)

        return () => ctx.revert()
    }, [])

    return (
        <div ref={pageRef}>
            {/* ---------------- Product ---------------- */}
            <section
                aria-labelledby="product-heading"
                className="
                    relative
                    overflow-hidden
                    bg-white
                    px-5 pt-24 pb-12
                    sm:px-8 sm:pt-32 sm:pb-16
                    lg:px-10
                "
            >
                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none
                        absolute -left-28 top-24
                        h-72 w-72
                        rounded-full
                        bg-champagne/20
                        blur-3xl
                    "
                />

                <div className="relative mx-auto max-w-7xl">
                    {/* Breadcrumb */}
                    <nav
                        data-product-detail
                        aria-label="Breadcrumb"
                        className="text-[10px] uppercase tracking-[0.2em] text-taupe"
                    >
                        <Link
                            href="/"
                            className="transition-colors duration-300 hover:text-burgundy"
                        >
                            Home
                        </Link>
                        <span aria-hidden="true" className="mx-2 text-champagne">
                            /
                        </span>
                        <Link
                            href={`/categories/${categorySlug}`}
                            className="transition-colors duration-300 hover:text-burgundy"
                        >
                            {categoryTitle}
                        </Link>
                        <span aria-hidden="true" className="mx-2 text-champagne">
                            /
                        </span>
                        <span className="text-burgundy">{product.ref_no}</span>
                    </nav>

                    <div
                        className="
                            mt-6
                            grid gap-8
                            lg:grid-cols-2
                            lg:gap-14
                        "
                    >
                        {/* ---- Images ---- */}
                        <div data-product-gallery>
                            <ProductGallery
                                images={product.image}
                                name={product.name}
                            />
                        </div>

                        {/* ---- Details ---- */}
                        <div className="lg:pt-4">
                            {product.label && (
                                <span
                                    data-product-detail
                                    className={`
                                        inline-block
                                        rounded-full
                                        px-3 py-1
                                        text-[9px]
                                        font-medium
                                        uppercase
                                        tracking-[0.16em]
                                        ${labelStyles[product.label] ??
                                        'bg-burgundy text-ivory'}
                                    `}
                                >
                                    {product.label}
                                </span>
                            )}

                            <h1
                                id="product-heading"
                                data-product-detail
                                className="
                                    mt-4
                                    font-heading
                                    text-3xl
                                    leading-tight
                                    text-burgundy
                                    xs:text-4xl
                                    sm:text-5xl
                                "
                            >
                                {product.name}
                            </h1>

                            <p
                                data-product-detail
                                className="mt-2 text-[10px] uppercase tracking-[0.2em] text-taupe"
                            >
                                Ref {product.ref_no}
                            </p>

                            {/* ---- Price ---- */}
                            <div
                                data-product-detail
                                className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-2"
                            >
                                <span className="font-heading text-3xl text-burgundy sm:text-4xl">
                                    {formatPrice(price)}
                                </span>

                                {hasDiscount && (
                                    <>
                                        <span className="text-sm text-taupe line-through">
                                            {formatPrice(product.amount)}
                                        </span>
                                        <span
                                            className="
                                                rounded-full
                                                border border-champagne/60
                                                bg-champagne/20
                                                px-2.5 py-1
                                                text-[10px]
                                                font-medium
                                                uppercase
                                                tracking-[0.12em]
                                                text-burgundy
                                            "
                                        >
                                            {percentOff}% off — save{' '}
                                            {formatPrice(
                                                product.discount_amount,
                                            )}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* <p
                                data-product-detail
                                className="mt-1 text-xs text-taupe"
                            >
                                Inclusive of all taxes
                            </p> */}

                            <div
                                data-product-detail
                                aria-hidden="true"
                                className="mt-7 flex items-center gap-3"
                            >
                                <span className="h-px w-12 bg-champagne sm:w-16" />
                                <span className="h-1.5 w-1.5 rotate-45 bg-champagne" />
                                <span className="h-px w-12 bg-champagne sm:w-16" />

                            </div>

                            {/* Only shown when the JSON entry has one. */}
                            {product.description?.trim() && (
                                <p
                                    data-product-detail
                                    className="mt-6 whitespace-pre-line text-sm leading-relaxed text-taupe sm:text-base"
                                >
                                    {product.description.trim()}
                                </p>
                            )}

                            {/* ---- CTAs ---- */}
                            <div
                                data-product-detail
                                className="mt-8 flex flex-col gap-3 sm:flex-row"
                            >
                                <button
                                    type="button"
                                    onClick={orderOnWhatsApp}
                                    className="
                                        group
                                        inline-flex items-center justify-center gap-3
                                        rounded-full
                                        bg-burgundy
                                        px-7 py-3.5
                                        text-[11px]
                                        font-medium
                                        uppercase
                                        tracking-[0.22em]
                                        text-ivory
                                        cursor-pointer
                                        shadow-[0_10px_30px_rgba(72,12,20,0.25)]
                                        transition-all duration-300
                                        hover:bg-wine
                                        hover:shadow-[0_16px_40px_rgba(72,12,20,0.35)]
                                    "
                                >
                                    Order
                                    <span
                                        aria-hidden="true"
                                        className="transition-transform duration-300 group-hover:translate-x-1"
                                    >
                                        →
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => addToCart(product)}
                                    className={`
                                        inline-flex items-center justify-center gap-3
                                        rounded-full
                                        border border-champagne
                                        px-7 py-3.5
                                        text-[11px]
                                        font-medium
                                        uppercase
                                        tracking-[0.22em]
                                        text-burgundy
                                        cursor-pointer
                                        transition-colors duration-300
                                        hover:bg-champagne/20
                                        ${isInCart ? 'bg-champagne/25' : ''}
                                    `}
                                >
                                    {isInCart ? (
                                        <FaCheck aria-hidden="true" className="h-3.5 w-3.5" />
                                    ) : (
                                        <FaShoppingBag aria-hidden="true" className="h-3.5 w-3.5" />
                                    )}
                                    <span aria-live="polite">
                                        {isInCart ? 'Added to cart' : 'Add to cart'}
                                    </span>
                                </button>
                            </div>

                            {/* <p className="mt-5 min-h-5 text-sm font-semibold text-taupe">
                                Tap “Order” — your order details open ready to send on WhatsApp.
                            </p> */}

                            {/* ---- Details list ---- */}
                            <dl className="mt-10 divide-y divide-champagne/40 border-y border-champagne/40">
                                {details.map((detail) => (
                                    <div
                                        key={detail.title}
                                        data-product-detail
                                        className="py-4"
                                    >
                                        <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-burgundy">
                                            {detail.title}
                                        </dt>
                                        <dd className="mt-1.5 text-xs leading-relaxed text-taupe sm:text-sm">
                                            {detail.copy}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------------- Related ---------------- */}
            {related.length > 0 && (
                <section
                    data-related
                    aria-labelledby="related-heading"
                    className="bg-ivory px-5 py-14 sm:px-8 sm:py-20 lg:px-10"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.35em] text-taupe">
                                    You may also like
                                </span>
                                <h2
                                    id="related-heading"
                                    className="mt-2 font-heading text-2xl text-burgundy sm:text-3xl"
                                >
                                    More {categoryTitle}
                                </h2>
                            </div>

                            <Link
                                href={`/categories/${categorySlug}`}
                                className="
                                    group shrink-0
                                    text-[10px]
                                    font-medium
                                    uppercase
                                    tracking-[0.2em]
                                    text-burgundy
                                    transition-colors duration-300
                                    hover:text-wine
                                "
                            >
                                View all
                                <span
                                    aria-hidden="true"
                                    className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1"
                                >
                                    →
                                </span>
                            </Link>
                        </div>

                        <div className="mt-8 grid auto-rows-fr grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                            {related.map((item) => (
                                <div key={item.ref_no} data-related-card>
                                    <ProductCard product={item} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

        </div>
    )
}

export default ProductView
