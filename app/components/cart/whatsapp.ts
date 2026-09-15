/**
 * WhatsApp ordering, shared by the product page and the cart.
 */

// +91 82006 18171 — digits only, country code first, as wa.me expects.
export const WHATSAPP_NUMBER = '918200618171'

/**
 * Opens a WhatsApp chat with nimi, `message` already typed in — the customer
 * only has to hit send. Call it from a click handler so it isn't blocked.
 */
export const openWhatsApp = (message: string) => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

    // New tab on desktop. In-app browsers (Instagram, Facebook) and popup
    // blockers return null from window.open — navigate in place instead,
    // which also lets the phone hand the link straight to the WhatsApp app.
    const tab = window.open(url, '_blank')
    if (tab) {
        tab.opener = null
    } else {
        window.location.assign(url)
    }
}

/** Absolute product URL — WhatsApp turns the first one into a preview. */
export const productUrl = (refNo: string) =>
    `${window.location.origin}/products/${refNo.toLowerCase()}`
