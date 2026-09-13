'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/#categories' },
    { label: 'About Us', href: '/#about' },
]

const Header = () => {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    const headerRef = useRef<HTMLElement>(null)
    const shellRef = useRef<HTMLDivElement>(null)
    const accentRef = useRef<HTMLDivElement>(null)
    const logoRef = useRef<HTMLAnchorElement>(null)
    const desktopNavRef = useRef<HTMLElement>(null)
    const burgerRef = useRef<HTMLButtonElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)
    const line1Ref = useRef<HTMLSpanElement>(null)
    const line2Ref = useRef<HTMLSpanElement>(null)
    const line3Ref = useRef<HTMLSpanElement>(null)

    // Menu timeline is built once and then played / reversed, so an
    // interrupted open animation rewinds instead of snapping.
    const menuTl = useRef<gsap.core.Timeline | null>(null)
    const burgerTl = useRef<gsap.core.Timeline | null>(null)

    // ------------------------------------------------------------------
    // Intro + menu timelines
    // ------------------------------------------------------------------
    useEffect(() => {
        const ctx = gsap.context(() => {
            const reduced = window.matchMedia(
                '(prefers-reduced-motion: reduce)',
            ).matches

            const navLinks =
                desktopNavRef.current?.querySelectorAll('a') ?? []
            const overlayLinks =
                overlayRef.current?.querySelectorAll('[data-menu-link]') ?? []
            const overlayFades =
                overlayRef.current?.querySelectorAll('[data-menu-fade]') ?? []
            const overlayRings =
                overlayRef.current?.querySelectorAll('[data-menu-ring]') ?? []

            // The overlay lives in the DOM at all times so GSAP can drive it;
            // autoAlpha keeps it out of the a11y tree and untouchable while closed.
            gsap.set(overlayRef.current, { autoAlpha: 0 })

            if (reduced) {
                // No motion: the menu just appears / disappears.
                menuTl.current = gsap
                    .timeline({ paused: true })
                    .to(overlayRef.current, { autoAlpha: 1, duration: 0.01 })
                    .eventCallback('onReverseComplete', () => {
                        gsap.set(overlayRef.current, { autoAlpha: 0 })
                    })
                return
            }

            // ---- Intro: shell drops in, logo and nav follow ----
            const intro = gsap.timeline({
                defaults: { ease: 'power3.out' },
            })

            intro
                .from(shellRef.current, {
                    yPercent: -100,
                    opacity: 0,
                    duration: 0.9,
                    ease: 'power4.out',
                })
                .from(
                    logoRef.current,
                    { y: -14, opacity: 0, duration: 0.6 },
                    '-=0.45',
                )
                .from(
                    navLinks,
                    { y: -12, opacity: 0, duration: 0.5, stagger: 0.08 },
                    '<0.05',
                )
                .from(
                    burgerRef.current,
                    { scale: 0.6, opacity: 0, duration: 0.5, ease: 'back.out(2)' },
                    '<',
                )
                .fromTo(
                    accentRef.current,
                    { width: 0 },
                    { width: '100%', duration: 1.1, ease: 'power2.inOut' },
                    '-=0.3',
                )

            // ---- Hamburger → X, driven by the same open/close toggle ----
            burgerTl.current = gsap
                .timeline({ paused: true, defaults: { duration: 0.3, ease: 'power2.inOut' } })
                .to(line1Ref.current, { y: 8, rotate: 45 }, 0)
                .to(line2Ref.current, { opacity: 0, x: 8 }, 0)
                .to(line3Ref.current, { y: -8, rotate: -45 }, 0)

            // ---- Mobile menu: circular reveal out of the burger button ----
            // Start states are set explicitly (rather than with .from()) so the
            // timeline is deterministic whether it's played, reversed, or
            // interrupted halfway through.
            const closedClip = 'circle(0% at calc(100% - 2.75rem) 2.5rem)'

            gsap.set(overlayRef.current, { clipPath: closedClip })
            gsap.set(overlayRings, { scale: 0.6, opacity: 0 })
            gsap.set(overlayLinks, { yPercent: 120, opacity: 0, rotate: 3 })
            gsap.set(overlayFades, { y: 16, opacity: 0 })

            menuTl.current = gsap
                .timeline({ paused: true })
                .set(overlayRef.current, { autoAlpha: 1 })
                .to(overlayRef.current, {
                    clipPath: 'circle(150% at calc(100% - 2.75rem) 2.5rem)',
                    duration: 0.75,
                    ease: 'power3.inOut',
                })
                .to(
                    overlayRings,
                    { scale: 1, opacity: 1, duration: 0.9, ease: 'power2.out' },
                    '-=0.5',
                )
                .to(
                    overlayLinks,
                    {
                        yPercent: 0,
                        opacity: 1,
                        rotate: 0,
                        duration: 0.55,
                        stagger: 0.07,
                        ease: 'power3.out',
                    },
                    '-=0.45',
                )
                .to(
                    overlayFades,
                    { y: 0, opacity: 1, duration: 0.45, stagger: 0.1 },
                    '-=0.35',
                )
                // Hide it again once the close animation has fully rewound.
                .eventCallback('onReverseComplete', () => {
                    gsap.set(overlayRef.current, { autoAlpha: 0 })
                })

        }, headerRef)

        return () => ctx.revert()
    }, [])

    // Play / reverse the menu on toggle, and lock the page behind it.
    useEffect(() => {
        menuTl.current?.[menuOpen ? 'play' : 'reverse']()
        burgerTl.current?.[menuOpen ? 'play' : 'reverse']()

        document.body.style.overflow = menuOpen ? 'hidden' : ''

        return () => {
            document.body.style.overflow = ''
        }
    }, [menuOpen])

    // Close on Escape — easy to hit the button by accident on a phone.
    useEffect(() => {
        if (!menuOpen) return

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMenuOpen(false)
        }

        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [menuOpen])

    // ------------------------------------------------------------------
    // Scroll: the header is always on screen (sticky); past 20px it shrinks
    // into a floating pill.
    // ------------------------------------------------------------------
    useEffect(() => {
        let ticking = false

        const update = () => {
            ticking = false
            setScrolled(window.scrollY > 20)
        }

        const onScroll = () => {
            if (ticking) return
            ticking = true
            requestAnimationFrame(update)
        }

        update()
        window.addEventListener('scroll', onScroll, { passive: true })

        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <>
            <header
                ref={headerRef}
                className={`
                    fixed inset-x-0 top-0 z-50
                    transition-[padding] duration-500 ease-out
                    ${scrolled ? 'px-2 pt-2 xs:px-3 xs:pt-3 sm:px-5' : 'px-0 pt-0'}
                `}
            >
                <div
                    ref={shellRef}
                    className={`
                        relative mx-auto
                        h-16 xs:h-[72px] sm:h-[82px]
                        transition-all duration-500
                        ${scrolled
                            ? `
                                max-w-7xl
                                rounded-2xl
                                border border-champagne/40
                                bg-white
                                shadow-[0_12px_45px_rgba(72,12,20,0.12)]
                            `
                            : `
                                w-full
                                border-b border-champagne/30
                                bg-ivory
                            `
                        }
                    `}
                >
                    {/* Champagne top accent — drawn open by the intro timeline */}
                    <div
                        ref={accentRef}
                        className="
                            pointer-events-none
                            absolute left-1/2 top-0
                            h-px w-0
                            -translate-x-1/2
                            bg-champagne/70
                        "
                    />

                    <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 xs:px-5 sm:px-8 lg:px-10">

                        {/* Logo */}
                        <Link
                            ref={logoRef}
                            href="/"
                            aria-label="nimi home"
                            className="
                                group relative flex h-full
                                items-center
                                outline-none
                            "
                        >
                            <div
                                className="
                                    relative
                                    transition-transform duration-500
                                    group-hover:scale-[1.03]
                                "
                            >
                                <Image
                                    src="/logos/marron-name-logo-transparent-nimi.png"
                                    width={145}
                                    height={145}
                                    alt="nimi"
                                    priority
                                    className="
                                        h-auto
                                        w-[92px]
                                        xs:w-[104px]
                                        sm:w-[125px]
                                        lg:w-[140px]
                                        object-contain
                                    "
                                />

                                {/* Small champagne underline */}
                                <span
                                    className="
                                        absolute -bottom-1 left-1/2
                                        h-px w-0
                                        -translate-x-1/2
                                        bg-champagne
                                        transition-all duration-500
                                        group-hover:w-3/4
                                    "
                                />
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav
                            ref={desktopNavRef}
                            className="
                                hidden
                                items-center
                                gap-8
                                md:flex
                                lg:gap-11
                            "
                            aria-label="Main navigation"
                        >
                            {navItems.map((item, index) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="
                                        group relative
                                        py-2
                                        font-body
                                        text-[11px]
                                        font-medium
                                        uppercase
                                        tracking-[0.22em]
                                        text-burgundy
                                        transition-colors duration-300
                                        hover:text-wine
                                    "
                                >
                                    {item.label}

                                    {/* Animated champagne line */}
                                    <span
                                        className="
                                            absolute
                                            -bottom-0.5
                                            left-1/2
                                            h-px
                                            w-0
                                            -translate-x-1/2
                                            bg-champagne
                                            transition-all duration-300
                                            group-hover:w-full
                                        "
                                    />

                                    {/* Tiny diamond separator */}
                                    {index < navItems.length - 1 && (
                                        <span
                                            className="
                                                pointer-events-none
                                                absolute
                                                -right-5
                                                top-1/2
                                                h-1
                                                w-1
                                                -translate-y-1/2
                                                rotate-45
                                                bg-champagne/70
                                            "
                                        />
                                    )}
                                </Link>
                            ))}
                        </nav>

                        {/* Mobile menu button — sits above the overlay so it can close it */}
                        <button
                            ref={burgerRef}
                            type="button"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={menuOpen}
                            className={`
                                relative z-50
                                flex h-10 w-10
                                items-center justify-center
                                rounded-full
                                border
                                transition-colors duration-300
                                md:hidden
                                ${menuOpen
                                    ? 'border-burgundy/30 bg-white text-burgundy shadow-[0_4px_14px_rgba(72,12,20,0.18)]'
                                    : 'border-champagne/50 bg-white/50 text-burgundy hover:border-burgundy/40 hover:bg-white'
                                }
                            `}
                        >
                            <span className="relative block h-4 w-5">
                                <span
                                    ref={line1Ref}
                                    className="absolute left-0 top-0 h-px w-5 bg-current"
                                />
                                <span
                                    ref={line2Ref}
                                    className="absolute left-0 top-2 h-px w-5 bg-current"
                                />
                                <span
                                    ref={line3Ref}
                                    className="absolute left-0 top-4 h-px w-5 bg-current"
                                />
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation.
                Always mounted (GSAP owns its visibility) and sized with dvh +
                safe-area padding so it behaves with mobile browser chrome. */}
            <div
                ref={overlayRef}
                id="mobile-menu"
                aria-hidden={!menuOpen}
                className="
                    invisible
                    fixed inset-0 z-40
                    h-dvh
                    overflow-hidden
                    bg-burgundy
                    md:hidden
                "
            >
                {/* Decorative circles */}
                <div
                    data-menu-ring
                    className="
                        pointer-events-none
                        absolute -right-24 -top-16
                        h-64 w-64 xs:h-80 xs:w-80
                        rounded-full
                        border border-champagne/10
                    "
                />

                <div
                    data-menu-ring
                    className="
                        pointer-events-none
                        absolute -left-28 bottom-0
                        h-72 w-72 xs:h-96 xs:w-96
                        rounded-full
                        border border-champagne/10
                    "
                />

                <div
                    className="
                        flex h-full flex-col
                        overflow-y-auto
                        overscroll-contain
                        px-6 xs:px-8
                        pb-[max(1.5rem,env(safe-area-inset-bottom))]
                        pt-24 xs:pt-28
                    "
                >
                    <div data-menu-fade className="mb-8 xs:mb-12">
                        <span
                            className="
                                text-[10px]
                                uppercase
                                tracking-[0.35em] xs:tracking-[0.4em]
                                text-champagne
                            "
                        >
                            JEWELS WITH SOUL
                        </span>

                        <div className="mt-4 h-px w-12 bg-champagne/50" />
                    </div>

                    <nav className="flex flex-col" aria-label="Mobile navigation">
                        {navItems.map((item, index) => (
                            // Wrapper clips the link so it can slide up from below.
                            <div
                                key={item.label}
                                className="overflow-hidden border-b border-white/10"
                            >
                                <Link
                                    data-menu-link
                                    href={item.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="
                                        group
                                        flex items-center
                                        py-5 xs:py-6
                                        font-heading
                                        text-3xl xs:text-4xl
                                        text-ivory
                                        transition-all duration-300
                                        hover:pl-3
                                        hover:text-champagne
                                    "
                                >
                                    <span className="mr-4 text-xs text-champagne/60">
                                        0{index + 1}
                                    </span>

                                    {item.label}

                                    <span
                                        className="
                                            ml-auto
                                            translate-x-2
                                            opacity-0
                                            transition-all duration-300
                                            group-hover:translate-x-0
                                            group-hover:opacity-100
                                        "
                                    >
                                        →
                                    </span>
                                </Link>
                            </div>
                        ))}
                    </nav>

                    <div data-menu-fade className="mt-auto pt-10">
                        <p
                            className="
                                text-[10px]
                                uppercase
                                tracking-[0.3em]
                                text-white/40
                            "
                        >
                            Timeless pieces. For your next chapter.
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Header
