'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LOGO_SRC = '/logos/marron-name-logo-transparent-nimi.png'

const NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: 'About Us', href: '/about' },
] as const

const Header = () => {
    const headerRef = useRef<HTMLElement>(null)
    const logoRef = useRef<HTMLAnchorElement>(null)
    const navRef = useRef<HTMLUListElement>(null)
    const barTopRef = useRef<HTMLSpanElement>(null)
    const barMidRef = useRef<HTMLSpanElement>(null)
    const barBottomRef = useRef<HTMLSpanElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const panelLinksRef = useRef<HTMLUListElement>(null)

    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

    // Entrance reveal + scroll-reactive compact / hide-on-scroll-down behaviour.
    useGSAP(
        () => {
            const mm = gsap.matchMedia()

            // Compact styling only touches React state + a CSS transition, so it's fine
            // to run for every viewer regardless of motion preference.
            let compact = false
            const compactTrigger = ScrollTrigger.create({
                start: 'top -80',
                end: 99999,
                onUpdate: (self) => {
                    const next = self.scroll() > 80
                    if (next !== compact) {
                        compact = next
                        setScrolled(next)
                    }
                },
            })

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                const navItems = navRef.current ? gsap.utils.toArray<HTMLElement>(navRef.current.children) : []

                gsap.set(headerRef.current, { yPercent: -100 })
                gsap.set(logoRef.current, { opacity: 0, y: -8 })
                gsap.set(navItems, { opacity: 0, y: -8 })

                gsap
                    .timeline({ defaults: { ease: 'power3.out' } })
                    .to(headerRef.current, { yPercent: 0, duration: 0.9, ease: 'expo.out' })
                    .to(logoRef.current, { opacity: 1, y: 0, duration: 0.6 }, '-=0.5')
                    .to(navItems, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, '-=0.4')

                // Smart sticky: slide out of view when scrolling down past the fold, reveal on scroll up.
                let hidden = false
                const hideTrigger = ScrollTrigger.create({
                    start: 'top -80',
                    end: 99999,
                    onUpdate: (self) => {
                        const shouldHide = self.direction === 1 && self.scroll() > 220
                        if (shouldHide !== hidden) {
                            hidden = shouldHide
                            gsap.to(headerRef.current, { yPercent: shouldHide ? -100 : 0, duration: 0.45, ease: 'power2.inOut' })
                        }
                    },
                })

                return () => hideTrigger.kill()
            })

            mm.add('(prefers-reduced-motion: reduce)', () => {
                gsap.set(headerRef.current, { yPercent: 0 })
                gsap.set(logoRef.current, { opacity: 1, y: 0 })
                gsap.set(navRef.current ? navRef.current.children : [], { opacity: 1, y: 0 })
            })

            return () => {
                compactTrigger.kill()
                mm.revert()
            }
        },
        { scope: headerRef }
    )

    // Hamburger <-> close morph, independent of whether the panel is mounted.
    useGSAP(
        () => {
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
            const duration = reduce ? 0 : 0.35

            gsap.to(barTopRef.current, { rotate: open ? 45 : 0, y: open ? 6 : 0, duration, ease: 'power2.inOut' })
            gsap.to(barMidRef.current, { opacity: open ? 0 : 1, duration: reduce ? 0 : 0.2 })
            gsap.to(barBottomRef.current, { rotate: open ? -45 : 0, y: open ? -6 : 0, duration, ease: 'power2.inOut' })
        },
        { dependencies: [open], scope: headerRef }
    )

    // Mobile panel entrance, staggered — only mounted while open.
    useGSAP(
        () => {
            if (!open || !panelRef.current) return
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

            const links = panelLinksRef.current ? gsap.utils.toArray<HTMLElement>(panelLinksRef.current.children) : []
            gsap.fromTo(panelRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
            gsap.fromTo(links, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: 'power3.out', delay: 0.1 })
        },
        { dependencies: [open], scope: headerRef }
    )

    // Lock page scroll while the mobile panel is open.
    useEffect(() => {
        document.documentElement.style.overflow = open ? 'hidden' : ''
        return () => {
            document.documentElement.style.overflow = ''
        }
    }, [open])

    // Close on Escape, and if the viewport grows past the mobile breakpoint. (Clicking a link
    // inside the panel already closes it via its own onClick, below — no effect needed for that.)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    useEffect(() => {
        const mql = window.matchMedia('(min-width: 768px)')
        const onChange = (e: MediaQueryListEvent) => e.matches && setOpen(false)
        mql.addEventListener('change', onChange)
        return () => mql.removeEventListener('change', onChange)
    }, [])

    return (
        <header
            ref={headerRef}
            className={`sticky top-0 z-50 w-full border-b transition-[padding,box-shadow,background-color,border-color] duration-300 ${
                scrolled
                    ? 'border-champagne/50 bg-ivory/90 py-2 shadow-[0_1px_24px_rgba(72,12,20,0.08)] backdrop-blur-md'
                    : 'border-transparent bg-ivory py-4'
            }`}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10">
                <Link ref={logoRef} href="/" aria-label="nimi — home" className="relative block w-[132px] shrink-0 sm:w-[152px]">
                    <Image src={LOGO_SRC} alt="nimi" width={600} height={300} priority className="h-auto w-full object-contain" />
                </Link>

                <nav aria-label="Primary" className="hidden md:block">
                    <ul ref={navRef} className="flex items-center gap-10">
                        {NAV_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    aria-current={isActive(link.href) ? 'page' : undefined}
                                    className={`group relative inline-block py-1 text-[11px] font-medium uppercase tracking-[0.28em] transition-colors ${
                                        isActive(link.href) ? 'text-burgundy' : 'text-charcoal/80 hover:text-burgundy'
                                    }`}
                                >
                                    {link.label}
                                    <span
                                        className={`absolute inset-x-0 -bottom-0.5 h-px origin-center bg-burgundy transition-transform duration-300 ${
                                            isActive(link.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                        }`}
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    aria-expanded={open}
                    aria-controls="mobile-nav"
                    className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] md:hidden"
                >
                    <span ref={barTopRef} className="block h-px w-6 bg-charcoal" />
                    <span ref={barMidRef} className="block h-px w-6 bg-charcoal" />
                    <span ref={barBottomRef} className="block h-px w-6 bg-charcoal" />
                </button>
            </div>

            {open && (
                <div
                    id="mobile-nav"
                    ref={panelRef}
                    className="fixed inset-x-0 top-full z-40 flex max-h-[80dvh] flex-col overflow-y-auto border-t border-champagne/40 bg-ivory px-6 py-10 shadow-lg md:hidden"
                >
                    <nav aria-label="Mobile">
                        <ul ref={panelLinksRef} className="flex flex-col gap-6">
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        onClick={() => setOpen(false)}
                                        aria-current={isActive(link.href) ? 'page' : undefined}
                                        className={`font-heading text-3xl ${isActive(link.href) ? 'text-burgundy' : 'text-charcoal'}`}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            )}
        </header>
    )
}

export default Header
