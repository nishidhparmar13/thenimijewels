'use client'

import { useSyncExternalStore } from 'react'

import { finalPrice, type Product } from '../products/product'

/**
 * The cart: a tiny external store kept in localStorage, so it survives page
 * navigation and reloads and stays in sync across tabs.
 *
 * `useSyncExternalStore` renders an empty cart on the server and during
 * hydration, then swaps in the saved one — no hydration mismatch.
 */

export interface CartItem {
    ref_no: string
    name: string
    image: string
    /** Unit price after discount, captured when the item was added. */
    price: number
    quantity: number
}

const STORAGE_KEY = 'nimi-cart'
const EMPTY: CartItem[] = []

let items: CartItem[] = EMPTY
let loaded = false
const listeners = new Set<() => void>()

const load = () => {
    loaded = true
    try {
        const parsed: unknown = JSON.parse(
            localStorage.getItem(STORAGE_KEY) ?? '[]',
        )
        items = Array.isArray(parsed) ? (parsed as CartItem[]) : EMPTY
    } catch {
        items = EMPTY
    }
}

const emit = () => listeners.forEach((listener) => listener())

const commit = (next: CartItem[]) => {
    items = next
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
        // Private mode or full storage — the cart still works for this visit.
    }
    emit()
}

const subscribe = (listener: () => void) => {
    listeners.add(listener)

    // Another tab changed the cart.
    const onStorage = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY) return
        load()
        emit()
    }
    window.addEventListener('storage', onStorage)

    return () => {
        listeners.delete(listener)
        window.removeEventListener('storage', onStorage)
    }
}

const getSnapshot = () => {
    if (!loaded) load()
    return items
}

const getServerSnapshot = () => EMPTY

/** Current cart contents; re-renders whenever the cart changes. */
export const useCart = () =>
    useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

/** How many of one product are in the cart (0 when it isn't). */
export const useCartQuantity = (refNo: string) =>
    useCart().find((item) => item.ref_no === refNo)?.quantity ?? 0

/** Adds one of `product`, or bumps its quantity if it's already in. */
export const addToCart = (product: Product) => {
    const current = getSnapshot()
    const existing = current.find((item) => item.ref_no === product.ref_no)

    commit(
        existing
            ? current.map((item) =>
                item.ref_no === product.ref_no
                    ? { ...item, quantity: item.quantity + 1 }
                    : item,
            )
            : [
                ...current,
                {
                    ref_no: product.ref_no,
                    name: product.name,
                    image: product.image[0] ?? '',
                    price: finalPrice(product),
                    quantity: 1,
                },
            ],
    )
}

/** Lowest quantity an item can have; below that it must be removed. */
export const MIN_CART_QUANTITY = 1

/** Sets an item's quantity, never below MIN_CART_QUANTITY. */
export const setCartQuantity = (refNo: string, quantity: number) => {
    const next = Math.max(quantity, MIN_CART_QUANTITY)
    commit(
        getSnapshot().map((item) =>
            item.ref_no === refNo ? { ...item, quantity: next } : item,
        ),
    )
}

export const removeFromCart = (refNo: string) =>
    commit(getSnapshot().filter((item) => item.ref_no !== refNo))

export const clearCart = () => commit(EMPTY)
