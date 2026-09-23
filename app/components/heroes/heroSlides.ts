/**
 * The hero banners, in the order they appear in the carousel.
 *
 * Files live in `public/hero-banners/`, so the src is the path from the
 * site root. To add a banner: drop the file in that folder and add a line
 * here — no component code to touch.
 */
export interface HeroSlide {
    src: string
    alt: string
}

export const heroSlides: HeroSlide[] = [
    { src: '/hero-banners/b4.png', alt: 'nimi jewellery collection banner' },
    { src: '/hero-banners/b6.png', alt: 'nimi festive collection banner' },
    { src: '/hero-banners/b5.png', alt: 'nimi handcrafted earrings banner' },
]
