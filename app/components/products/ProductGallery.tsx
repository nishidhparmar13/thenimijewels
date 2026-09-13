'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface ProductGalleryProps {
    images: string[]
    /** Product name — used for alt text and the fallback monogram. */
    name: string
}

/**
 * Product imagery: one large frame plus a strip of thumbnails. Clicking a
 * thumbnail swaps the large image, cross-fading between the two.
 *
 * Photography isn't in `public/` yet, so any image that fails to load is
 * replaced by a champagne monogram instead of a broken-image icon.
 */
const ProductGallery = ({ images, name }: ProductGalleryProps) => {
    const [active, setActive] = useState(0)
    const [failed, setFailed] = useState<Record<number, boolean>>({})

    const frameRef = useRef<HTMLDivElement>(null)
    // Skip the cross-fade on first paint — there's nothing to fade from.
    const mounted = useRef(false)

    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true
            return
        }

        const reduced = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches

        if (reduced) return

        const ctx = gsap.context(() => {
            gsap.fromTo(
                '[data-gallery-active]',
                { opacity: 0, scale: 1.06 },
                { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
            )
        }, frameRef)

        return () => ctx.revert()
    }, [active])

    const markFailed = (index: number) =>
        setFailed((prev) => ({ ...prev, [index]: true }))

    const monogram = (className: string) => (
        <div
            aria-hidden="true"
            className={`
                flex h-full w-full
                items-center justify-center
                bg-gradient-to-br from-ivory via-champagne/20 to-champagne/45
                ${className}
            `}
        >
            <span className="font-heading leading-none text-white/70">
                {name.charAt(0)}
            </span>
        </div>
    )

    return (
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row-reverse lg:items-start">
            {/* ---------------- Large frame ---------------- */}
            <div
                ref={frameRef}
                className="
                    relative
h-[750px]
                    w-full
                    overflow-hidden
                    rounded-2xl
                    border border-champagne/40
                    bg-ivory
                    shadow-[0_16px_44px_rgba(72,12,20,0.10)]
                    sm:rounded-3xl
                    lg:flex-1
                "
            >
                {failed[active] ? (
                    <div data-gallery-active className="h-full w-full">
                        {monogram('text-7xl sm:text-8xl')}
                    </div>
                ) : (
                    <Image
                        key={images[active]}
                        data-gallery-active
                        src={images[active]}
                        alt={`${name} — view ${active + 1}`}
                        fill
                        priority
                        sizes="(min-width: 1024px) 45vw, 100vw"
                        onError={() => markFailed(active)}
                        className="object-cover"
                    />
                )}
            </div>

            {/* ---------------- Thumbnails ----------------
                A row under the frame on phones, a column beside it on
                desktop. Only worth showing when there's a choice. */}
            {images.length > 1 && (
                <div
                    role="group"
                    aria-label={`${name} images`}
                    className="
                        flex gap-3
                        overflow-x-auto
                        pb-1
                        lg:w-20
                        lg:flex-col
                        lg:overflow-visible
                        lg:pb-0
                    "
                >
                    {images.map((image, index) => {
                        const isActive = index === active

                        return (
                            <button
                                key={image}
                                type="button"
                                onClick={() => setActive(index)}
                                aria-label={`Show view ${index + 1}`}
                                aria-current={isActive}
                                className={`
                                    relative
                                    aspect-square
                                    w-16
                                    shrink-0
                                    overflow-hidden
                                    rounded-lg
                                    border
                                    bg-ivory
                                    transition-all duration-300
                                    sm:w-20 sm:rounded-xl
                                    lg:w-full
                                    ${isActive
                                        ? 'border-burgundy opacity-100 ring-1 ring-burgundy/30'
                                        : 'border-champagne/40 opacity-70 hover:border-champagne hover:opacity-100'
                                    }
                                `}
                            >
                                {failed[index] ? (
                                    monogram('text-2xl')
                                ) : (
                                    <Image
                                        src={image}
                                        alt=""
                                        fill
                                        sizes="80px"
                                        onError={() => markFailed(index)}
                                        className="object-cover"
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default ProductGallery
