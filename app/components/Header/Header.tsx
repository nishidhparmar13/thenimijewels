'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { categoryGroups } from '../Categories/categoriesData'

/**
 * The dropdown/accordion below is built from the SAME data as the
 * "Shop by Category" section on the homepage (categoriesData.ts), so the
 * two never drift out of sync. Each link jumps straight to that group's
 * heading in the CategoriesView section via its anchor id.
 */
const categories = categoryGroups.map((group) => ({
    name: group.title,
    href: `/#category-${group.slug}`,
}))

const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Categories', href: '/#categories', dropdown: true },
]

const Header = () => {
    const headerRef = useRef<HTMLElement>(null)
    const logoRef = useRef<HTMLDivElement>(null)
    const navRef = useRef<HTMLDivElement>(null)
    const mobileMenuRef = useRef<HTMLDivElement>(null)
    const mobileBackdropRef = useRef<HTMLDivElement>(null)
    const mobileItemsRef = useRef<HTMLElement[]>([])
    const mobileCategoryListRef = useRef<HTMLDivElement>(null)

    const [menuOpen, setMenuOpen] = useState(false)
    const [categoryOpen, setCategoryOpen] = useState(false)
    const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false)

    /*
     * Initial premium reveal
     */
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                defaults: {
                    ease: 'power4.out',
                },
            })

            tl.fromTo(
                headerRef.current,
                {
                    y: -40,
                    opacity: 0,
                },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                }
            )

                .fromTo(
                    logoRef.current,
                    {
                        opacity: 0,
                        y: 15,
                        scale: 0.92,
                        filter: 'blur(8px)',
                    },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: 'blur(0px)',
                        duration: 1,
                    },
                    '-=0.65'
                )

                .fromTo(
                    navRef.current?.querySelectorAll('.nav-item') || [],
                    {
                        opacity: 0,
                        y: 12,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        stagger: 0.08,
                    },
                    '-=0.65'
                )

            // Small luxury logo movement
            gsap.to(logoRef.current, {
                y: -2,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: 1,
            })
        }, headerRef)

        return () => ctx.revert()
    }, [])

    /*
     * Mobile menu animation
     */
    useEffect(() => {
        if (!mobileMenuRef.current) return

        const ctx = gsap.context(() => {
            if (menuOpen) {
                gsap.set(mobileBackdropRef.current, {
                    pointerEvents: 'auto',
                })
                gsap.to(mobileBackdropRef.current, {
                    opacity: 1,
                    duration: 0.4,
                    ease: 'power2.out',
                })

                gsap.to(mobileMenuRef.current, {
                    height: 'auto',
                    opacity: 1,
                    duration: 0.5,
                    ease: 'power3.out',
                })

                gsap.fromTo(
                    mobileItemsRef.current,
                    {
                        opacity: 0,
                        x: -20,
                    },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.45,
                        stagger: 0.06,
                        delay: 0.1,
                        ease: 'power3.out',
                    }
                )
            } else {
                gsap.set(mobileBackdropRef.current, {
                    pointerEvents: 'none',
                })
                gsap.to(mobileBackdropRef.current, {
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power2.inOut',
                })

                gsap.to(mobileMenuRef.current, {
                    height: 0,
                    opacity: 0,
                    duration: 0.35,
                    ease: 'power3.inOut',
                })
                setMobileCategoryOpen(false)
            }
        }, mobileMenuRef)

        return () => ctx.revert()
    }, [menuOpen])

    /*
     * Mobile categories accordion animation
     */
    useEffect(() => {
        if (!mobileCategoryListRef.current) return

        const ctx = gsap.context(() => {
            if (mobileCategoryOpen) {
                gsap.to(mobileCategoryListRef.current, {
                    height: 'auto',
                    opacity: 1,
                    duration: 0.4,
                    ease: 'power3.out',
                })
            } else {
                gsap.to(mobileCategoryListRef.current, {
                    height: 0,
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power3.inOut',
                })
            }
        }, mobileCategoryListRef)

        return () => ctx.revert()
    }, [mobileCategoryOpen])

    const addMobileItem = (el: HTMLElement | null) => {
        if (el && !mobileItemsRef.current.includes(el)) {
            mobileItemsRef.current.push(el)
        }
    }

    return (
        <header
            ref={headerRef}
            className="
                sticky md:fixed top-0 z-50
                w-full
                px-3 xs:px-4 sm:px-6 lg:px-8
                pt-2 xs:py-3 sm:pt-4
            "
        >
            {/* Mobile menu backdrop */}
            <div
                ref={mobileBackdropRef}
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
                className="
                    fixed
                    inset-0
                    z-40
                    opacity-0
                    pointer-events-none
                    lg:hidden
                "
            />

            <div
                className="
                    relative
                    mx-auto
                    w-full
                    max-w-7xl
                    overflow-visible
                    rounded-xl
                    sm:rounded-2xl
                    border border-champagne/30
                    bg-ivory/90
                    backdrop-blur-xl
                    shadow-[0_10px_40px_rgba(72,12,20,0.07)]
                "
            >
                {/* Main Header */}
                <div className="flex h-16 sm:h-18 items-center justify-between px-3 xs:px-4 sm:px-6 lg:px-8">

                    {/* Logo */}
                    <Link
                        href="/"
                        aria-label="nimi home"
                        className="group relative flex h-full items-center"
                    >
                        <div
                            ref={logoRef}
                            className="relative flex items-center"
                        >
                            <Image
                                src="/logos/marron-name-logo-transparent-nimi.png"
                                alt="nimi"
                                width={150}
                                height={150}
                                priority
                                className="
                                    h-auto
                                    w-20
                                    xs:w-[92px]
                                    sm:w-[105px]
                                    lg:w-[120px]
                                    object-contain
                                    transition-transform
                                    duration-500
                                    group-hover:scale-[1.04]
                                "
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav
                        ref={navRef}
                        className="
                            hidden
                            lg:flex
                            items-center
                            gap-8
                            xl:gap-10
                            ml-auto
                            mr-10
                        "
                    >
                        {navItems.map((item) => (
                            <div
                                key={item.name}
                                className="nav-item relative"
                                onMouseEnter={() =>
                                    item.dropdown && setCategoryOpen(true)
                                }
                                onMouseLeave={() =>
                                    item.dropdown && setCategoryOpen(false)
                                }
                            >
                                <Link
                                    href={item.href}
                                    className="
                                        group
                                        relative
                                        flex
                                        items-center
                                        gap-1.5
                                        py-2
                                        text-[13px]
                                        font-medium
                                        tracking-[0.12em]
                                        text-burgundy
                                        uppercase
                                    "
                                >
                                    <span>{item.name}</span>

                                    {item.dropdown && (
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            className="
                                                transition-transform
                                                duration-300
                                                group-hover:rotate-180
                                            "
                                        >
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    )}

                                    {/* Animated underline */}
                                    <span
                                        className="
                                            absolute
                                            bottom-0
                                            left-0
                                            h-px
                                            w-full
                                            origin-left
                                            scale-x-0
                                            bg-champagne
                                            transition-transform
                                            duration-500
                                            ease-out
                                            group-hover:scale-x-100
                                        "
                                    />
                                </Link>

                                {/* Categories Dropdown */}
                                {item.dropdown && categoryOpen && (
                                    <div
                                        className="
                                            absolute
                                            left-1/2
                                            top-full
                                            w-64
                                            -translate-x-1/2
                                            pt-4
                                        "
                                    >
                                        <div
                                            className="
                                                overflow-hidden
                                                rounded-xl
                                                border
                                                border-champagne/30
                                                bg-white
                                                p-2
                                                shadow-[0_20px_50px_rgba(72,12,20,0.12)]
                                            "
                                        >
                                            {categories.map((category) => (
                                                <Link
                                                    key={category.name}
                                                    href={category.href}
                                                    className="
                                                        block
                                                        rounded-lg
                                                        px-4
                                                        py-3
                                                        text-sm
                                                        text-charcoal
                                                        transition-all
                                                        duration-300
                                                        hover:bg-ivory
                                                        hover:pl-5
                                                        hover:text-burgundy
                                                    "
                                                >
                                                    {category.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>



                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                        className="
                            relative
                            flex
                            h-10
                            w-10
                            xs:h-11
                            xs:w-11
                            shrink-0
                            flex-col
                            items-center
                            justify-center
                            gap-1.5
                            rounded-full
                            border
                            border-champagne/40
                            text-burgundy
                            transition-colors
                            duration-300
                            active:bg-champagne/10
                            lg:hidden
                        "
                    >
                        <span
                            className={`
                                block
                                h-px
                                w-5
                                bg-current
                                transition-all
                                duration-300
                                ${menuOpen
                                    ? 'translate-y-[4px] rotate-45'
                                    : ''
                                }
                            `}
                        />

                        <span
                            className={`
                                block
                                h-px
                                w-5
                                bg-current
                                transition-all
                                duration-300
                                ${menuOpen
                                    ? '-translate-y-[3px] -rotate-45'
                                    : ''
                                }
                            `}
                        />
                    </button>
                </div>

                {/* Mobile Navigation */}
                <div
                    ref={mobileMenuRef}
                    className="
                        absolute
                        left-0
                        right-0
                        top-full
                        z-10
                        h-0
                        overflow-hidden
                        rounded-b-xl
                        sm:rounded-b-2xl
                        border-x
                        border-b
                        border-champagne/30
                        bg-ivory
                        opacity-0
                        shadow-[0_20px_50px_rgba(72,12,20,0.15)]
                        lg:hidden
                    "
                >
                    <div
                        className="
                            max-h-[calc(100vh-6rem)]
                            overflow-y-auto
                            border-t
                            border-champagne/20
                            px-4
                            xs:px-5
                            pb-5
                            pt-2
                        "
                    >
                        {navItems.map((item) =>
                            item.dropdown ? (
                                <div
                                    key={item.name}
                                    ref={(el) => addMobileItem(el)}
                                    className="border-b border-champagne/15"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMobileCategoryOpen(
                                                (prev) => !prev
                                            )
                                        }
                                        aria-expanded={mobileCategoryOpen}
                                        className="
                                            flex
                                            w-full
                                            items-center
                                            justify-between
                                            py-4
                                            text-sm
                                            font-medium
                                            tracking-[0.12em]
                                            text-burgundy
                                            uppercase
                                        "
                                    >
                                        <span>{item.name}</span>

                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            className={`
                                                shrink-0
                                                text-champagne
                                                transition-transform
                                                duration-300
                                                ${mobileCategoryOpen
                                                    ? 'rotate-180'
                                                    : ''
                                                }
                                            `}
                                        >
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    </button>

                                    <div
                                        ref={mobileCategoryListRef}
                                        className="h-0 overflow-hidden opacity-0"
                                    >
                                        <div className="flex flex-col gap-1 pb-3 pl-2">
                                            {categories.map((category) => (
                                                <Link
                                                    key={category.name}
                                                    href={category.href}
                                                    onClick={() =>
                                                        setMenuOpen(false)
                                                    }
                                                    className="
                                                        rounded-lg
                                                        px-3
                                                        py-2.5
                                                        text-sm
                                                        text-taupe
                                                        transition-all
                                                        duration-300
                                                        active:bg-ivory
                                                        active:text-burgundy
                                                    "
                                                >
                                                    {category.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    key={item.name}
                                    ref={(el) => addMobileItem(el)}
                                    href={item.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        border-b
                                        border-champagne/15
                                        py-4
                                        text-sm
                                        font-medium
                                        tracking-[0.12em]
                                        text-burgundy
                                        uppercase
                                    "
                                >
                                    <span>{item.name}</span>

                                    <span className="text-champagne">
                                        →
                                    </span>
                                </Link>
                            )
                        )}

                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
