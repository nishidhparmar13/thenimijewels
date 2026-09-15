'use client'

import Image from 'next/image'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { FaShoppingBag, FaTimes, FaTrashAlt, FaWhatsapp } from 'react-icons/fa'

import { formatPrice } from '../products/product'
import {
    MIN_CART_QUANTITY,
    clearCart,
    removeFromCart,
    setCartQuantity,
    useCart,
} from './cartStore'
import { openWhatsApp, productUrl } from './whatsapp'

const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** The sheet is a bottom drawer on phones and a centred dialog from `sm` up. */
const isDesktop = () => window.matchMedia('(min-width: 640px)').matches

/**
 * Floating cart bar pinned to the bottom of every page. Hidden while the
 * cart is empty; tapping it opens a sheet listing the items with an order
 * button that sends the whole cart to WhatsApp.
 *
 * Motion (all skipped under prefers-reduced-motion):
 * - the bar springs up when it appears, and bounces with a badge pop and a
 *   ring pulse whenever something is added
 * - totals roll to their new value
 * - the sheet slides up (phone) or scales in (desktop), then staggers its
 *   rows in; closing plays it back out before unmounting
 * - removed rows slide away and collapse
 */
const CartBar = () => {
    const items = useCart()
    const [sheetOpen, setSheetOpen] = useState(false)

    const count = items.reduce((sum, item) => sum + item.quantity, 0)
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const hasItems = count > 0
    const barShown = hasItems && !sheetOpen

    const barRef = useRef<HTMLButtonElement>(null)
    const badgeRef = useRef<HTMLSpanElement>(null)
    const ringRef = useRef<HTMLSpanElement>(null)
    const barTotalRef = useRef<HTMLSpanElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const sheetTotalRef = useRef<HTMLSpanElement>(null)

    const openTimeline = useRef<gsap.core.Timeline>(null)
    const closing = useRef(false)
    const prevCount = useRef(count)
    const prevTotal = useRef(total)

    // ---- Bar entrance: springs up whenever it (re)appears ----
    useLayoutEffect(() => {
        const bar = barRef.current
        if (!barShown || !bar || prefersReducedMotion()) return

        gsap.fromTo(
            bar,
            { y: 120, opacity: 0, scale: 0.9 },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.7,
                ease: 'back.out(1.6)',
                overwrite: true,
            },
        )
    }, [barShown])

    // ---- Count change: badge pop, plus bounce and ring pulse on add ----
    useEffect(() => {
        const prev = prevCount.current
        prevCount.current = count
        // From zero the entrance animation already covers it.
        if (prev === 0 || count === prev || prefersReducedMotion()) return

        if (badgeRef.current) {
            gsap.fromTo(
                badgeRef.current,
                { scale: 1.7 },
                { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.35)', overwrite: true },
            )
        }

        if (count > prev && barRef.current) {
            gsap.fromTo(
                barRef.current,
                { y: -12 },
                { y: 0, duration: 0.6, ease: 'bounce.out', overwrite: 'auto' },
            )
        }

        if (count > prev && ringRef.current) {
            gsap.fromTo(
                ringRef.current,
                { scale: 1, opacity: 0.9 },
                { scale: 1.35, opacity: 0, duration: 0.8, ease: 'power2.out', overwrite: true },
            )
        }
    }, [count])

    // ---- Total change: numbers roll in from the direction of travel ----
    useEffect(() => {
        const prev = prevTotal.current
        prevTotal.current = total
        if (prev === 0 || prev === total || prefersReducedMotion()) return

        const targets = [barTotalRef.current, sheetTotalRef.current].filter(
            (el): el is HTMLSpanElement => el !== null,
        )
        if (targets.length === 0) return

        const direction = total > prev ? 1 : -1
        gsap.fromTo(
            targets,
            { yPercent: -70 * direction, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.45, ease: 'power3.out', overwrite: true },
        )
    }, [total])

    // ---- Sheet open: lock scroll, then play the entrance ----
    useLayoutEffect(() => {
        if (!sheetOpen) return

        closing.current = false
        document.body.classList.add('overflow-hidden')

        const overlay = overlayRef.current
        const panel = panelRef.current

        if (overlay && panel && !prefersReducedMotion()) {
            const desktop = isDesktop()

            openTimeline.current = gsap
                .timeline({ defaults: { ease: 'power3.out' } })
                .fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.35 })
                .fromTo(
                    panel,
                    desktop
                        ? { y: 40, scale: 0.94, opacity: 0 }
                        : { yPercent: 100 },
                    desktop
                        ? { y: 0, scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.4)' }
                        : { yPercent: 0, duration: 0.6, ease: 'expo.out' },
                    0.05,
                )
                .fromTo(
                    panel.querySelectorAll('[data-cart-row]'),
                    { x: 36, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.45, stagger: 0.06 },
                    0.25,
                )
                .fromTo(
                    panel.querySelectorAll('[data-cart-foot]'),
                    { y: 24, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.45 },
                    0.35,
                )
        }

        return () => {
            openTimeline.current?.kill()
            document.body.classList.remove('overflow-hidden')
        }
    }, [sheetOpen])

    if (!hasItems) return null

    /** Plays the sheet out, then unmounts it and runs `after`. */
    const closeSheet = (after?: () => void) => {
        if (closing.current) return

        const finish = () => {
            setSheetOpen(false)
            after?.()
        }

        const overlay = overlayRef.current
        const panel = panelRef.current
        if (!overlay || !panel || prefersReducedMotion()) {
            finish()
            return
        }

        closing.current = true
        openTimeline.current?.kill()

        gsap.timeline({ onComplete: finish })
            .to(
                panel,
                isDesktop()
                    ? { y: 30, scale: 0.95, opacity: 0, duration: 0.3, ease: 'power2.in' }
                    : { yPercent: 100, duration: 0.4, ease: 'power3.in' },
            )
            .to(overlay, { opacity: 0, duration: 0.3, ease: 'power1.in' }, 0.1)
    }

    const removeItem = (refNo: string, row: HTMLElement | null) => {
        // Last one out: close the sheet first, then empty the cart.
        if (items.length === 1) {
            closeSheet(() => removeFromCart(refNo))
            return
        }

        if (!row || prefersReducedMotion()) {
            removeFromCart(refNo)
            return
        }

        // Slide the row away, collapse the gap, then drop it from the cart.
        gsap.timeline({ onComplete: () => removeFromCart(refNo) })
            .set(row, { overflow: 'hidden', pointerEvents: 'none' })
            .to(row, { x: 80, opacity: 0, duration: 0.28, ease: 'power2.in' })
            .to(row, {
                height: 0,
                paddingTop: 0,
                paddingBottom: 0,
                borderTopWidth: 0,
                duration: 0.28,
                ease: 'power2.inOut',
            })
    }

    const order = () => {
        const lines = items.map(
            (item, index) =>
                `${index + 1}. ${item.name} (${item.ref_no}) × ${item.quantity} — ${formatPrice(item.price * item.quantity)}\n   ${productUrl(item.ref_no)}`,
        )

        openWhatsApp(
            [
                `Hi nimi, I'd like to order:`,
                '',
                ...lines,
                '',
                `Total: ${formatPrice(total)}`,
            ].join('\n'),
        )
    }

    return (
        <>
            {/* Keeps the bar from covering the bottom of the footer. */}
            <div aria-hidden="true" className="h-24 bg-burgundy" />

            {/* ---------------- Floating bar ---------------- */}
            {barShown && (
                <button
                    ref={barRef}
                    type="button"
                    onClick={() => setSheetOpen(true)}
                    aria-haspopup="dialog"
                    className="
                        group
                        fixed inset-x-4 bottom-4 z-40
                        mx-auto
                        flex max-w-md items-center gap-3
                        rounded-full
                        border border-champagne/40
                        bg-burgundy
                        py-2.5 pl-2.5 pr-5
                        text-left text-ivory
                        cursor-pointer
                        shadow-[0_16px_40px_rgba(72,12,20,0.35)]
                        transition-colors duration-300
                        hover:bg-wine
                        sm:bottom-6
                    "
                >
                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-champagne text-burgundy">
                        {/* Pulse ring, fired on every add */}
                        <span
                            ref={ringRef}
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 rounded-full border-2 border-champagne opacity-0"
                        />
                        <FaShoppingBag
                            aria-hidden="true"
                            className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110"
                        />
                        <span
                            ref={badgeRef}
                            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ivory px-1 text-[10px] font-semibold tabular-nums text-burgundy"
                        >
                            {count}
                        </span>
                    </span>

                    <span className="flex min-w-0 flex-1 flex-col overflow-hidden">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-champagne">
                            {count} {count === 1 ? 'item' : 'items'}
                        </span>
                        <span
                            ref={barTotalRef}
                            className="text-sm font-medium tabular-nums"
                        >
                            {formatPrice(total)}
                        </span>
                    </span>

                    <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.2em]">
                        View cart{' '}
                        <span
                            aria-hidden="true"
                            className="inline-block transition-transform duration-300 group-hover:-translate-y-1"
                        >
                            ↑
                        </span>
                    </span>
                </button>
            )}

            {/* ---------------- Cart sheet ---------------- */}
            {sheetOpen && (
                <div
                    ref={overlayRef}
                    className="fixed inset-0 z-50 flex items-end justify-center bg-burgundy/40 backdrop-blur-sm sm:items-center sm:px-5"
                    onClick={() => closeSheet()}
                    onKeyDown={(event) => {
                        if (event.key === 'Escape') closeSheet()
                    }}
                >
                    <div
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cart-heading"
                        onClick={(event) => event.stopPropagation()}
                        className="
                            flex max-h-[85vh] w-full max-w-lg flex-col
                            overflow-hidden
                            rounded-t-3xl
                            border border-champagne/40
                            bg-ivory
                            shadow-[0_-12px_50px_rgba(72,12,20,0.3)]
                            sm:rounded-3xl
                        "
                    >
                        {/* Grab handle — phone drawer affordance */}
                        <span
                            aria-hidden="true"
                            className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-champagne/60 sm:hidden"
                        />

                        {/* Header */}
                        <div className="flex items-center justify-between gap-4 border-b border-champagne/40 px-5 py-4 sm:px-6">
                            <div>
                                <h2
                                    id="cart-heading"
                                    className="font-heading text-2xl text-burgundy"
                                >
                                    Your cart
                                </h2>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-taupe">
                                    {count} {count === 1 ? 'item' : 'items'}
                                </p>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => closeSheet(clearCart)}
                                    className="cursor-pointer rounded-full px-3 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-taupe transition-colors duration-300 hover:bg-champagne/20 hover:text-burgundy"
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    aria-label="Close cart"
                                    autoFocus
                                    onClick={() => closeSheet()}
                                    className="group/close flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-taupe transition-colors duration-300 hover:bg-champagne/20 hover:text-burgundy"
                                >
                                    <FaTimes
                                        aria-hidden="true"
                                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover/close:rotate-90"
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Items */}
                        <ul className="flex-1 divide-y divide-champagne/30 overflow-y-auto overflow-x-hidden px-5 sm:px-6">
                            {items.map((item) => (
                                <li
                                    key={item.ref_no}
                                    data-cart-row
                                    className="flex gap-3 py-4"
                                >
                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-champagne/40 bg-white">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                sizes="64px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="flex h-full items-center justify-center font-heading text-2xl text-champagne">
                                                {item.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="truncate font-heading text-lg leading-snug text-burgundy">
                                                    {item.name}
                                                </p>
                                                <p className="text-[9px] uppercase tracking-[0.16em] text-taupe">
                                                    {item.ref_no}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={(event) =>
                                                    removeItem(
                                                        item.ref_no,
                                                        event.currentTarget.closest('li'),
                                                    )
                                                }
                                                aria-label={`Remove ${item.name}`}
                                                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-taupe transition-colors duration-300 hover:bg-champagne/20 hover:text-wine"
                                            >
                                                <FaTrashAlt aria-hidden="true" className="h-3 w-3" />
                                            </button>
                                        </div>

                                        <div className="mt-2 flex items-center justify-between gap-2">
                                            <div className="inline-flex items-center rounded-full border border-champagne">
                                                <button
                                                    type="button"
                                                    onClick={() => setCartQuantity(item.ref_no, item.quantity - 1)}
                                                    disabled={item.quantity <= MIN_CART_QUANTITY}
                                                    aria-label={`Decrease ${item.name} quantity`}
                                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-burgundy transition-colors duration-300 hover:bg-champagne/20 active:scale-90 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:active:scale-100"
                                                >
                                                    −
                                                </button>
                                                <span
                                                    aria-live="polite"
                                                    className="min-w-6 text-center text-sm font-medium tabular-nums text-burgundy"
                                                >
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setCartQuantity(item.ref_no, item.quantity + 1)}
                                                    aria-label={`Increase ${item.name} quantity`}
                                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-burgundy transition-colors duration-300 hover:bg-champagne/20 active:scale-90"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <span className="text-sm font-medium tabular-nums text-burgundy">
                                                {formatPrice(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {/* Footer */}
                        <div
                            data-cart-foot
                            className="border-t border-champagne/40 px-5 pt-4 pb-5 sm:px-6"
                        >
                            <div className="flex items-baseline justify-between overflow-hidden">
                                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-burgundy">
                                    Total
                                </span>
                                <span
                                    ref={sheetTotalRef}
                                    className="font-heading text-3xl tabular-nums text-burgundy"
                                >
                                    {formatPrice(total)}
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-taupe">
                                Shipping is calculated based on your delivery location.
                            </p>

                            <button
                                type="button"
                                onClick={order}
                                className="
                                    group
                                    mt-4
                                    inline-flex w-full items-center justify-center gap-3
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
                                    active:scale-[0.98]
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
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default CartBar
