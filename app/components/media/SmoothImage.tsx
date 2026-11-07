'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'

/**
 * next/image with a soft loading state for CMS photos.
 *
 * While the image loads, a champagne shimmer "veil" covers it. The veil also
 * blurs whatever is behind it (backdrop-filter), so once the photo arrives it
 * first shows blurred, then sharpens as the veil fades out.
 *
 * The veil is a sibling layer, not a style on the <img>, so GSAP and hover
 * effects that animate the image's opacity/transform keep working untouched.
 * Like any `fill` image, the parent must be positioned (and should clip with
 * overflow-hidden).
 */
const SmoothImage = ({ onLoad, onError, alt, ...props }: ImageProps) => {
    const [loaded, setLoaded] = useState(false)

    return (
        <>
            <Image
                {...props}
                alt={alt}
                onLoad={(event) => {
                    setLoaded(true)
                    onLoad?.(event)
                }}
                onError={(event) => {
                    // Don't leave the shimmer running over a broken image.
                    setLoaded(true)
                    onError?.(event)
                }}
            />
            <span
                aria-hidden="true"
                className="smooth-image-veil"
                data-loaded={loaded || undefined}
            />
        </>
    )
}

export default SmoothImage
