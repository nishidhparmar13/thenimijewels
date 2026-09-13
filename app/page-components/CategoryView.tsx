'use client'

import Link from 'next/link'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'

import ProductCard from '../components/products/ProductCard'
import { finalPrice, type Product } from '../components/products/product'

gsap.registerPlugin(ScrollTrigger, SplitText, Flip)

type SortKey = 'featured' | 'price-asc' | 'price-desc'

const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'featured', label: 'Featured' },
    { key: 'price-asc', label: 'Price: low to high' },
    { key: 'price-desc', label: 'Price: high to low' },
]

// Filter chips are derived from the data, so a new `type` in the JSON
// shows up here without touching this file.
const typeLabels: Record<string, string> = {
    oxidise: 'Oxidised',
    korean: 'Korean',
    jhumka: 'Jhumkas',
    stud: 'Studs',
    choker: 'Chokers',
    pendant: 'Pendants',
    layered: 'Layered',
    band: 'Bands',
    cocktail: 'Cocktail',
    adjustable: 'Adjustable',
}

interface CategoryViewProps {
    /** Shown as the page heading and the last breadcrumb crumb. */
    title: string
    /** One or two lines under the heading. */
    description: string
    /** The category's entries from app/data/categories/*.json */
    products: Product[]
    /** "piece" / "pieces" — override for categories that read oddly. */
    unit?: [singular: string, plural: string]
}

const labelFor = (type: string) =>
    typeLabels[type] ?? type.charAt(0).toUpperCase() + type.slice(1)

/**
 * The shared listing page for every jewellery category — hero, sticky
 * filter + sort bar, and an animated product grid. Each category route
 * supplies nothing but its copy and its JSON.
 */
const CategoryView = ({
    title,
    description,
    products,
    unit = ['piece', 'pieces'],
}: CategoryViewProps) => {
    const [activeType, setActiveType] = useState<string>('all')
    const [sort, setSort] = useState<SortKey>('featured')
    // True while the grid is re-laying itself out — drives the loading bar.
    const [pending, setPending] = useState(false)

    const pageRef = useRef<HTMLDivElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    // Layout snapshot taken just before a filter/sort change, replayed by
    // Flip once React has re-rendered the grid.
    const flipState = useRef<Flip.FlipState | null>(null)
    // Grid height before the change, so the container can tween to its new
    // height instead of snapping (which is what made the page jump).
    const fromHeight = useRef<number>(0)

    const types = useMemo(() => {
        const counts = new Map<string, number>()
        products.forEach((p) => {
            counts.set(p.type, (counts.get(p.type) ?? 0) + 1)
        })
        return [...counts.entries()]
    }, [products])

    const visible = useMemo(() => {
        const list = products.filter(
            (p) => activeType === 'all' || p.type === activeType,
        )

        if (sort === 'price-asc') {
            return [...list].sort((a, b) => finalPrice(a) - finalPrice(b))
        }
        if (sort === 'price-desc') {
            return [...list].sort((a, b) => finalPrice(b) - finalPrice(a))
        }
        return list
    }, [products, activeType, sort])

    // Snapshot the grid before the state change so Flip can tween from it.
    const captureLayout = (willChange: boolean) => {
        const grid = gridRef.current
        if (!grid || !willChange) return

        flipState.current = Flip.getState(
            grid.querySelectorAll('[data-product-card]'),
        )
        fromHeight.current = grid.offsetHeight
        setPending(true)
    }

    useLayoutEffect(() => {
        const grid = gridRef.current
        if (!flipState.current || !grid) return

        // Measure the new natural height, then pin the grid back to the old
        // one so both the tiles AND the container can be animated.
        grid.style.height = 'auto'
        const toHeight = grid.offsetHeight
        grid.style.height = `${fromHeight.current}px`

        const timeline = Flip.from(flipState.current, {
            duration: 0.55,
            ease: 'power3.inOut',
            stagger: 0.025,
            absolute: true,
            onEnter: (els) =>
                gsap.fromTo(
                    els,
                    { opacity: 0, scale: 0.92 },
                    { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' },
                ),
            onLeave: (els) =>
                gsap.to(els, {
                    opacity: 0,
                    scale: 0.92,
                    duration: 0.28,
                    ease: 'power2.in',
                }),
        })

        // Container follows the tiles to the new height.
        gsap.to(grid, {
            height: toHeight,
            duration: 0.55,
            ease: 'power3.inOut',
        })

        // Height control only goes back to CSS once FLIP has finished and
        // put the tiles back in normal flow. Releasing it earlier — FLIP's
        // stagger outlasts the height tween — collapsed the grid to zero
        // while the tiles were still absolutely positioned, which yanked
        // the footer up the page.
        timeline.eventCallback('onComplete', () => {
            grid.style.height = ''
            setPending(false)
        })

        flipState.current = null
    }, [visible])

    // ------------------------------------------------------------------
    // Entrance animations
    // ------------------------------------------------------------------
    useEffect(() => {
        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia()

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                const split = new SplitText('[data-hero-title]', {
                    type: 'chars',
                    charsClass: 'inline-block',
                })

                const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })

                intro
                    .from(split.chars, {
                        yPercent: 110,
                        opacity: 0,
                        duration: 0.7,
                        stagger: 0.025,
                    })
                    .from(
                        '[data-hero-fade]',
                        { y: 22, opacity: 0, duration: 0.6, stagger: 0.1 },
                        '-=0.4',
                    )
                    .fromTo(
                        '[data-hero-rule]',
                        { scaleX: 0 },
                        { scaleX: 1, duration: 0.8, ease: 'power3.inOut' },
                        '-=0.5',
                    )

                // Cards batch in as you scroll, rather than all at once.
                ScrollTrigger.batch('[data-product-card]', {
                    start: 'top 92%',
                    once: true,
                    onEnter: (batch) =>
                        gsap.fromTo(
                            batch,
                            { y: 44, opacity: 0 },
                            {
                                y: 0,
                                opacity: 1,
                                duration: 0.7,
                                stagger: 0.08,
                                ease: 'power3.out',
                            },
                        ),
                })

                return () => split.revert()
            })
        }, pageRef)

        return () => ctx.revert()
    }, [])

    return (
        <div ref={pageRef}>
            {/* ---------------- Hero ---------------- */}
            <section
                aria-labelledby="category-heading"
                className="
                    relative
                    overflow-hidden
                    bg-ivory
                    px-5 pt-28 pb-12
                    sm:px-8 sm:pt-32 sm:pb-16
                    lg:px-10
                "
            >
                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none
                        absolute -right-24 -top-16
                        h-72 w-72
                        rounded-full
                        bg-champagne/25
                        blur-3xl
                    "
                />

                <div className="relative mx-auto max-w-7xl">
                    {/* Breadcrumb */}
                    <nav
                        data-hero-fade
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
                            href="/#categories"
                            className="transition-colors duration-300 hover:text-burgundy"
                        >
                            Categories
                        </Link>
                        <span aria-hidden="true" className="mx-2 text-champagne">
                            /
                        </span>
                        <span className="text-burgundy">{title}</span>
                    </nav>

                    {/* overflow-hidden clips the characters as they rise */}
                    <h1
                        id="category-heading"
                        className="mt-5 overflow-hidden py-1"
                    >
                        <span
                            data-hero-title
                            className="
                                block
                                font-heading
                                text-4xl
                                leading-tight
                                text-burgundy
                                xs:text-5xl
                                sm:text-6xl
                            "
                        >
                            {title}
                        </span>
                    </h1>

                    <p
                        data-hero-fade
                        className="mt-4 max-w-xl text-sm leading-relaxed text-taupe sm:text-base"
                    >
                        {description}
                    </p>

                    <div
                        data-hero-rule
                        aria-hidden="true"
                        className="mt-8 h-px w-full origin-left bg-champagne/50"
                    />
                </div>
            </section>

            {/* ---------------- Filters ---------------- */}
            <section
                aria-label="Filter and sort"
                className="
                    sticky top-16
                    z-30
                    relative
                    border-b border-champagne/30
                    bg-ivory/90
                    px-5
                    backdrop-blur-md
                    xs:top-[72px]
                    sm:top-[82px] sm:px-8
                    lg:px-10
                "
            >
                <div
                    className="
                        mx-auto flex
                        max-w-7xl
                        flex-col gap-3
                        py-4
                        sm:flex-row sm:items-center sm:justify-between
                    "
                >
                    {/* Type chips */}
                    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:pb-0">
                        {[['all', products.length] as const, ...types].map(
                            ([type, count]) => {
                                const active = activeType === type

                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        aria-pressed={active}
                                        onClick={() => {
                                            captureLayout(activeType !== type)
                                            setActiveType(type)
                                        }}
                                        className={`
                                            shrink-0
                                            rounded-full
                                            border
                                            px-4 py-2
                                            text-[10px]
                                            font-medium
                                            uppercase
                                            tracking-[0.16em]
                                            transition-all duration-300
                                            ${active
                                                ? 'border-burgundy bg-burgundy text-ivory'
                                                : 'border-champagne/50 bg-white text-burgundy hover:border-champagne hover:bg-champagne/15'
                                            }
                                        `}
                                    >
                                        {type === 'all' ? 'All' : labelFor(type)}
                                        <span className="ml-1.5 opacity-60">
                                            {count}
                                        </span>
                                    </button>
                                )
                            },
                        )}
                    </div>

                    {/* Sort */}
                    <label className="flex shrink-0 items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-taupe">
                        Sort
                        <select
                            value={sort}
                            onChange={(e) => {
                                captureLayout(sort !== e.target.value)
                                setSort(e.target.value as SortKey)
                            }}
                            className="
                                rounded-full
                                border border-champagne/50
                                bg-white
                                px-3 py-2
                                text-[10px]
                                uppercase
                                tracking-[0.14em]
                                text-burgundy
                                outline-none
                                transition-colors duration-300
                                hover:border-champagne
                                focus:border-burgundy
                            "
                        >
                            {sortOptions.map((option) => (
                                <option key={option.key} value={option.key}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {/* Indeterminate loading bar while the grid re-lays out */}
                <div
                    aria-hidden="true"
                    className={`
                        pointer-events-none
                        absolute inset-x-0 -bottom-px
                        h-0.5
                        overflow-hidden
                        transition-opacity duration-200
                        ${pending ? 'opacity-100' : 'opacity-0'}
                    `}
                >
                    <span className="filter-loading-bar block h-full w-1/3 bg-champagne" />
                </div>
            </section>

            {/* ---------------- Grid ---------------- */}
            <section
                aria-label={title}
                className="bg-white px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16"
            >
                <div className="mx-auto max-w-7xl">
                    <p
                        aria-live="polite"
                        className={`
                            text-[10px] uppercase tracking-[0.2em] text-taupe
                            transition-opacity duration-300
                            ${pending ? 'opacity-40' : 'opacity-100'}
                        `}
                    >
                        {visible.length}{' '}
                        {visible.length === 1 ? unit[0] : unit[1]}
                    </p>

                    <div
                        ref={gridRef}
                        aria-busy={pending}
                        className={`
                            relative
                            mt-6
                            ${pending ? 'pointer-events-none' : ''}
                            grid
                            auto-rows-fr
                            grid-cols-2
                            gap-4
                            sm:gap-6
                            lg:grid-cols-4
                        `}
                    >
                        {visible.map((product) => (
                            <ProductCard
                                key={product.ref_no}
                                product={product}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default CategoryView
