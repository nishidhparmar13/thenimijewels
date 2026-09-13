'use client'

import Image from 'next/image'
import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

const Loader = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const logoRef = useRef<HTMLDivElement>(null)
    const glowRef = useRef<HTMLDivElement>(null)
    const ringRef = useRef<SVGCircleElement>(null)
    const ringOuterRef = useRef<SVGCircleElement>(null)
    const counterRef = useRef<HTMLSpanElement>(null)
    const statusRef = useRef<HTMLDivElement>(null)
    const particlesRef = useRef<HTMLDivElement>(null)
    const orbitRef = useRef<HTMLDivElement>(null)
    const dividerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            const particles =
                particlesRef.current?.querySelectorAll('.particle')

            // --------------------------------------------------
            // SETUP
            // --------------------------------------------------

            gsap.set(logoRef.current, {
                opacity: 0,
                scale: 0.78,
                y: 30,
                rotateX: 14,
                transformPerspective: 1200,
                clipPath: 'circle(0% at 50% 50%)',
            })

            gsap.set(glowRef.current, {
                opacity: 0,
                scale: 0.4,
            })

            gsap.set(orbitRef.current, {
                opacity: 0,
                scale: 0.7,
            })

            gsap.set(dividerRef.current, {
                scaleX: 0,
                transformOrigin: 'center',
            })

            gsap.set(statusRef.current, {
                opacity: 0,
                y: 10,
            })

            gsap.set(counterRef.current, {
                opacity: 0,
            })

            gsap.set(particles || [], {
                opacity: 0,
                scale: 0,
            })

            // --------------------------------------------------
            // MAIN INTRO
            // --------------------------------------------------

            const intro = gsap.timeline({
                defaults: {
                    ease: 'power3.out',
                },
            })

            intro
                // Ambient glow
                .to(glowRef.current, {
                    opacity: 0.65,
                    scale: 1,
                    duration: 1.4,
                    ease: 'power2.out',
                })

                // Orbit appears
                .to(
                    orbitRef.current,
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 1.1,
                        ease: 'back.out(1.4)',
                    },
                    '-=0.8'
                )

                // Logo reveal
                .to(
                    logoRef.current,
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        rotateX: 0,
                        clipPath: 'circle(80% at 50% 50%)',
                        duration: 1.7,
                        ease: 'expo.out',
                    },
                    '-=0.65'
                )

                // Divider
                .to(
                    dividerRef.current,
                    {
                        scaleX: 1,
                        duration: 0.9,
                        ease: 'power3.inOut',
                    },
                    '-=0.9'
                )

                // Status
                .to(
                    statusRef.current,
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                    },
                    '-=0.4'
                )

                // Particles
                .to(
                    particles || [],
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.6,
                        stagger: {
                            each: 0.07,
                            from: 'random',
                        },
                        ease: 'back.out(2)',
                    },
                    '-=0.4'
                )

            // --------------------------------------------------
            // LOGO BREATHING
            // --------------------------------------------------

            gsap.to(logoRef.current, {
                scale: 1.015,
                duration: 2.6,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            })

            // --------------------------------------------------
            // GLOW ANIMATION
            // --------------------------------------------------

            gsap.to(glowRef.current, {
                scale: 1.12,
                opacity: 0.42,
                duration: 3.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            })

            // --------------------------------------------------
            // OUTER ORBIT
            // --------------------------------------------------

            gsap.to(orbitRef.current, {
                rotation: 360,
                duration: 18,
                repeat: -1,
                ease: 'none',
            })

            // Counter orbit in opposite direction
            gsap.to('.orbit-inner', {
                rotation: -360,
                duration: 11,
                repeat: -1,
                ease: 'none',
            })

            // --------------------------------------------------
            // FLOATING PARTICLES
            // --------------------------------------------------

            particles?.forEach((particle, index) => {
                gsap.to(particle, {
                    x: gsap.utils.random(-18, 18),
                    y: gsap.utils.random(-30, 30),
                    opacity: gsap.utils.random(0.25, 0.85),
                    duration: gsap.utils.random(2, 4),
                    delay: index * 0.12,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                })
            })

            // --------------------------------------------------
            // CIRCULAR PROGRESS
            // --------------------------------------------------

            const circumference = 2 * Math.PI * 42

            if (ringRef.current) {
                ringRef.current.style.strokeDasharray = `${circumference}`
                ringRef.current.style.strokeDashoffset = `${circumference}`
            }

            if (ringOuterRef.current) {
                ringOuterRef.current.style.strokeDasharray = `${circumference}`
                ringOuterRef.current.style.strokeDashoffset = `${circumference}`
            }

            const progress = { value: 0 }

            gsap.to(progress, {
                value: 100,
                duration: 3.8,
                ease: 'power2.inOut',

                onUpdate: () => {
                    const value = Math.round(progress.value)

                    // Percentage
                    if (counterRef.current) {
                        counterRef.current.textContent = `${value}%`
                    }

                    // Progress ring
                    if (ringRef.current) {
                        ringRef.current.style.strokeDashoffset =
                            `${circumference - (circumference * value) / 100}`
                    }

                    // Outer ring slightly delayed
                    if (ringOuterRef.current) {
                        const delayedValue = Math.max(0, value - 8)

                        ringOuterRef.current.style.strokeDashoffset =
                            `${circumference - (circumference * delayedValue) / 100}`
                    }
                },

                onStart: () => {
                    gsap.to(counterRef.current, {
                        opacity: 1,
                        duration: 0.5,
                    })
                },

                onComplete: () => {
                    if (statusRef.current) {
                        statusRef.current.innerHTML = 'welcome to nimi'
                    }
                },
            })

            // --------------------------------------------------
            // EXIT
            // --------------------------------------------------

            const exitTimer = window.setTimeout(() => {
                const exit = gsap.timeline()

                exit.to(
                    particles || [],
                    {
                        scale: 0,
                        opacity: 0,
                        duration: 0.4,
                        stagger: 0.025,
                    },
                    0
                )

                exit.to(
                    orbitRef.current,
                    {
                        scale: 1.3,
                        opacity: 0,
                        duration: 0.7,
                        ease: 'power2.in',
                    },
                    0
                )

                exit.to(
                    logoRef.current,
                    {
                        scale: 1.08,
                        opacity: 0,
                        y: -15,
                        duration: 0.85,
                        ease: 'power3.in',
                    },
                    0.1
                )

                exit.to(
                    glowRef.current,
                    {
                        scale: 1.5,
                        opacity: 0,
                        duration: 0.8,
                        ease: 'power2.in',
                    },
                    0
                )

                exit.to(
                    [dividerRef.current, statusRef.current],
                    {
                        opacity: 0,
                        y: 10,
                        duration: 0.45,
                    },
                    '-=0.45'
                )

                exit.to(
                    containerRef.current,
                    {
                        opacity: 0,
                        duration: 0.65,
                        pointerEvents: 'none',
                        ease: 'power2.inOut',
                    },
                    '-=0.2'
                )
            }, 4300)

            return () => {
                window.clearTimeout(exitTimer)
            }
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[9999] flex h-dvh w-full items-center justify-center overflow-hidden bg-burgundy"
        >
            {/* -----------------------------------------------
                AMBIENT GLOW
            ------------------------------------------------ */}

            <div
                ref={glowRef}
                className="pointer-events-none absolute left-1/2 top-1/2 h-[55vw] w-[55vw] max-h-[700px] max-w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                    background:
                        'radial-gradient(circle, rgba(255,255,255,0.14) 0%, rgba(120,10,30,0.08) 38%, transparent 72%)',
                    filter: 'blur(45px)',
                }}
            />

            {/* -----------------------------------------------
                VIGNETTE
            ------------------------------------------------ */}

            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(circle at center, transparent 15%, rgba(15,0,5,0.35) 100%)',
                }}
            />

            {/* -----------------------------------------------
                ORBITAL SYSTEM
            ------------------------------------------------ */}

            <div
                ref={orbitRef}
                className="pointer-events-none absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                    border: '1px solid rgba(255,255,255,0.10)',
                }}
            >
                {/* Inner orbit */}
                <div
                    className="orbit-inner absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                        border: '1px solid rgba(255,255,255,0.06)',
                    }}
                >
                    {/* Diamond 1 */}
                    <span
                        className="absolute left-0 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white"
                        style={{
                            boxShadow: '0 0 14px rgba(255,255,255,0.7)',
                        }}
                    />

                    {/* Diamond 2 */}
                    <span
                        className="absolute right-0 top-1/2 h-1.5 w-1.5 translate-x-1/2 -translate-y-1/2 rotate-45 bg-white/80"
                        style={{
                            boxShadow: '0 0 12px rgba(255,255,255,0.6)',
                        }}
                    />

                    {/* Diamond 3 */}
                    <span
                        className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white/70"
                    />

                    {/* Diamond 4 */}
                    <span
                        className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45 bg-white"
                        style={{
                            boxShadow: '0 0 14px rgba(255,255,255,0.7)',
                        }}
                    />
                </div>
            </div>

            {/* -----------------------------------------------
                FLOATING PARTICLES
            ------------------------------------------------ */}

            <div
                ref={particlesRef}
                className="pointer-events-none absolute inset-0"
            >
                {[...Array(16)].map((_, index) => (
                    <span
                        key={index}
                        className="particle absolute h-[2px] w-[2px] rounded-full bg-white"
                        style={{
                            left: `${8 + ((index * 17) % 84)}%`,
                            top: `${10 + ((index * 29) % 78)}%`,
                            boxShadow:
                                '0 0 7px rgba(255,255,255,0.8)',
                        }}
                    />
                ))}
            </div>

            {/* -----------------------------------------------
                LOGO
            ------------------------------------------------ */}

            <div
                ref={logoRef}
                className="relative z-20 flex w-[72vw] max-w-[520px] flex-col items-center"
            >
                <Image
                    width={600}
                    height={600}
                    priority
                    alt="nimi"
                    src="/logos/white-name-logo-transparent-nimi.png"
                    className="h-auto w-full object-contain"
                />

                {/* Divider */}
                <div
                    ref={dividerRef}
                    className="h-px w-[42%] "
                />

                {/* -------------------------------------------
                    LOADING AREA
                -------------------------------------------- */}

                <div className="flex items-center gap-4">
                    {/* Circular progress */}
                    <div className="relative h-11 w-11">
                        <svg
                            className="h-full w-full -rotate-90"
                            viewBox="0 0 100 100"
                        >
                            {/* Background */}
                            <circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="none"
                                stroke="rgba(255,255,255,0.10)"
                                strokeWidth="1.5"
                            />

                            {/* Outer progress */}
                            <circle
                                ref={ringOuterRef}
                                cx="50"
                                cy="50"
                                r="42"
                                fill="none"
                                stroke="rgba(255,255,255,0.20)"
                                strokeWidth="1"
                                strokeLinecap="round"
                            />

                            {/* Main progress */}
                            <circle
                                ref={ringRef}
                                cx="50"
                                cy="50"
                                r="42"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>

                        {/* Percentage */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span
                                ref={counterRef}
                                className="text-[9px] font-medium tracking-wide text-white"
                            >
                                0%
                            </span>
                        </div>
                    </div>

                    {/* Loading status */}
                    <div
                        ref={statusRef}
                        className="text-[9px] font-medium uppercase tracking-[0.28em] text-white/65 sm:text-[14px]"
                    >
                        crafting your experience
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Loader