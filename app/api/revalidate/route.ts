import { revalidatePath, revalidateTag } from 'next/cache'

import { CMS_CACHE_TAG } from '../../lib/cms'

/**
 * Called by the Payload CMS after a product or category is saved/deleted
 * (see thenimijewels-payload-app/src/hooks/revalidateFrontend.ts), so the
 * change shows on the site right away.
 */
export const POST = async (request: Request) => {
    const secret = process.env.REVALIDATE_SECRET
    if (!secret || request.headers.get('x-revalidate-secret') !== secret) {
        return Response.json({ revalidated: false }, { status: 401 })
    }

    // Drop cached CMS responses, then every prerendered page that used them.
    revalidateTag(CMS_CACHE_TAG, { expire: 0 })
    revalidatePath('/', 'layout')

    return Response.json({ revalidated: true, now: Date.now() })
}
