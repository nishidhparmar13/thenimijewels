'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FaInstagram } from 'react-icons/fa'

import mainCategories from '../../data/main-categories.json'

gsap.registerPlugin(ScrollTrigger)

interface MainCategory {
    title: string
    slug: string
}

const categories = mainCategories as MainCategory[]

const exploreLinks = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/#categories' },
    { label: 'About Us', href: '/#about' },
]

// Placeholder handles — swap for the real profiles when they're live.
const socials = [
    { label: 'Instagram', icon: FaInstagram, href: 'https://www.instagram.com/thenimijewels/' },
    // { label: 'Facebook', short: 'FB', href: 'https://facebook.com' },
    // { label: 'WhatsApp', short: 'WA', href: 'https://wa.me/' },
]

const Footer = () => {
    const footerRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia()

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                // Columns rise as the footer comes into view.
                gsap.from('[data-foot-col]', {
                    y: 36,
                    opacity: 0,
                    duration: 0.7,
                    stagger: 0.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: footerRef.current,
                        start: 'top 88%',
                        once: true,
                    },
                })

                // Champagne rule draws across.
                gsap.from('[data-foot-rule]', {
                    scaleX: 0,
                    duration: 1.1,
                    ease: 'power3.inOut',
                    scrollTrigger: {
                        trigger: footerRef.current,
                        start: 'top 85%',
                        once: true,
                    },
                })

                // Oversized watermark drifts as the page scrolls past.
                gsap.to('[data-foot-mark]', {
                    yPercent: -18,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: footerRef.current,
                        start: 'top bottom',
                        end: 'bottom bottom',
                        scrub: true,
                    },
                })
            })

            // Magnetic social buttons — pointer devices only.
            mm.add(
                '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
                () => {
                    const cleanups = gsap.utils
                        .toArray<HTMLElement>('[data-foot-magnet]')
                        .map((el) => {
                            const xTo = gsap.quickTo(el, 'x', {
                                duration: 0.5,
                                ease: 'power3.out',
                            })
                            const yTo = gsap.quickTo(el, 'y', {
                                duration: 0.5,
                                ease: 'power3.out',
                            })

                            const onMove = (e: PointerEvent) => {
                                const r = el.getBoundingClientRect()
                                // Pull the button toward the cursor, capped
                                // at a third of its own size.
                                xTo((e.clientX - (r.left + r.width / 2)) * 0.35)
                                yTo((e.clientY - (r.top + r.height / 2)) * 0.35)
                            }

                            const onLeave = () => {
                                xTo(0)
                                yTo(0)
                            }

                            el.addEventListener('pointermove', onMove)
                            el.addEventListener('pointerleave', onLeave)

                            return () => {
                                el.removeEventListener('pointermove', onMove)
                                el.removeEventListener('pointerleave', onLeave)
                            }
                        })

                    return () => cleanups.forEach((fn) => fn())
                },
            )
        }, footerRef)

        return () => ctx.revert()
    }, [])

    return (
        <footer
            ref={footerRef}
            className="
                relative
                overflow-hidden
                bg-burgundy
                px-5 pt-16 pb-8
                text-ivory
                sm:px-8 sm:pt-20
                lg:px-10 lg:pt-24
            "
        >
            {/* Decorative rings */}
            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute -right-28 -top-24
                    h-72 w-72
                    rounded-full
                    border border-champagne/10
                "
            />
            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute -left-32 bottom-0
                    h-80 w-80
                    rounded-full
                    border border-champagne/10
                "
            />

            {/* Oversized watermark */}
            <span
                data-foot-mark
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute inset-x-0 -bottom-6
                    text-center
                    font-heading
                    text-[28vw]
                    leading-none
                    text-white/[0.04]
                    select-none
                "
            >
                nimi
            </span>

            <div className="relative mx-auto max-w-7xl">
                <div
                    className="
                        grid
                        gap-10
                        sm:grid-cols-2
                        lg:grid-cols-12
                        lg:gap-8
                    "
                >
                    {/* ---- Brand ---- */}
                    <div data-foot-col className="lg:col-span-5">
                        <Image
                            src="/logos/white-name-logo-transparent-nimi.png"
                            width={160}
                            height={160}
                            alt="nimi"
                            className="h-auto w-[120px] object-contain sm:w-[140px]"
                        />

                        <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/60">
                            Jewellery made for your moments. Thoughtfully chosen,
                            beautifully finished, and made to become part of your story.
                        </p>

                        {/* ---- Socials ---- */}
                        <ul className="mt-7 flex items-center gap-3">
                            {socials.map((social) => (
                                <li key={social.label}>
                                    <a
                                        data-foot-magnet
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.label}
                                        className="
                                            flex h-11 w-11
                                            items-center justify-center
                                            rounded-full
                                            border border-champagne/30
                                            text-[11px]
                                            font-medium
                                            tracking-[0.1em]
                                            text-champagne
                                            transition-colors duration-300
                                            hover:border-champagne
                                            hover:bg-champagne
                                            hover:text-burgundy
                                        "
                                    >
                                        <social.icon
                                            aria-hidden="true"
                                            className="h-4.5 w-4.5"
                                        />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ---- Explore ---- */}
                    <nav
                        data-foot-col
                        aria-label="Footer navigation"
                        className="lg:col-span-3"
                    >
                        <h2 className="text-[10px] font-medium uppercase tracking-[0.3em] text-champagne">
                            Explore
                        </h2>

                        <ul className="mt-5 space-y-3">
                            {exploreLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="
                                            group relative
                                            inline-block
                                            text-sm
                                            text-ivory/70
                                            transition-colors duration-300
                                            hover:text-champagne
                                        "
                                    >
                                        {link.label}
                                        <span
                                            aria-hidden="true"
                                            className="
                                                absolute -bottom-0.5 left-0
                                                h-px w-0
                                                bg-champagne
                                                transition-all duration-300
                                                group-hover:w-full
                                            "
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* ---- Categories (same JSON as the home grid) ---- */}
                    <nav
                        data-foot-col
                        aria-label="Shop by category"
                        className="lg:col-span-2"
                    >
                        <h2 className="text-[10px] font-medium uppercase tracking-[0.3em] text-champagne">
                            Shop
                        </h2>

                        <ul className="mt-5 space-y-3">
                            {categories.map((category) => (
                                <li key={category.slug}>
                                    <Link
                                        href={`/categories/${category.slug}`}
                                        className="
                                            group relative
                                            inline-block
                                            text-sm
                                            text-ivory/70
                                            transition-colors duration-300
                                            hover:text-champagne
                                        "
                                    >
                                        {category.title}
                                        <span
                                            aria-hidden="true"
                                            className="
                                                absolute -bottom-0.5 left-0
                                                h-px w-0
                                                bg-champagne
                                                transition-all duration-300
                                                group-hover:w-full
                                            "
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* ---- Contact ---- */}
                    <div data-foot-col className="lg:col-span-2">
                        <h2 className="text-[10px] font-medium uppercase tracking-[0.3em] text-champagne">
                            Get in touch
                        </h2>

                        <ul className="mt-5 space-y-3 text-sm text-ivory/70">
                            <li>
                                <a
                                    href="mailto:thenimijewels@gmail.com"
                                    className="transition-colors duration-300 hover:text-champagne"
                                >
                                    thenimijewels@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* ---- Rule + bottom bar ---- */}
                <div
                    data-foot-rule
                    aria-hidden="true"
                    className="mt-14 h-px w-full origin-left bg-champagne/30"
                />

                <div
                    className="
                        mt-6
                        flex flex-col-reverse items-center gap-4
                        text-center
                        sm:flex-row sm:justify-between sm:text-left
                    "
                >
                    <p className="text-[11px] tracking-[0.08em] text-ivory/40">
                        © {new Date().getFullYear()} nimi. All rights reserved.
                    </p>

                    <p className="text-[10px] uppercase tracking-[0.3em] text-champagne/70">
                        Jewels with soul
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
