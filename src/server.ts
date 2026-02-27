import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * API: Album Hero Image
 * Serves a hero image for a given album slug by fetching the event media
 * from the upstream API and selecting the first valid image.
 *
 * Response shape:
 * {
 *   slug: string,
 *   url: string,
 *   alt: string,
 *   width?: number,
 *   height?: number,
 *   thumbnail_url?: string
 * }
 */
app.get('/api/album/:slug/hero', async (req, res) => {
  const slug = String(req.params.slug || '').trim();
  if (!slug) {
    return res.status(400).json({ error: 'Missing album slug' });
  }

  // Helper: check if media item is an image
  const isImage = (item: any): boolean => {
    const rt = String(item?.resource_type || '').toLowerCase();
    const fmt = String(item?.format || '').toLowerCase();
    const url: string | undefined = item?.url || item?.secure_url;
    const looksLikeImage = (u?: string) => !!u && /(\.jpg|\.jpeg|\.png)(\?.*)?$/i.test(u);
    return rt === 'image' || fmt === 'jpg' || fmt === 'jpeg' || fmt === 'png' || looksLikeImage(url);
  };

  try {
    const upstream = `http://127.0.0.1:8000/api/events/${encodeURIComponent(slug)}/media?page=1&per_page=20`;
    const resp = await fetch(upstream, { headers: { Accept: 'application/json' } });
    if (!resp.ok) {
      const status = resp.status;
      return res.status(status === 404 ? 404 : 502).json({ error: 'Upstream API error', status });
    }
    const raw = await resp.json().catch(() => null);
    if (!raw || typeof raw !== 'object') {
      return res.status(422).json({ error: 'Corrupted upstream data' });
    }
    const media: any[] = (Array.isArray((raw as any).media) ? (raw as any).media
      : Array.isArray((raw as any).data?.media) ? (raw as any).data.media : []);

    const hero = media.find(isImage);
    if (!hero) {
      return res.status(404).json({ error: 'No hero image found for album', slug });
    }

    const url: string = (hero.url || hero.secure_url) as string;
    const payload = {
      slug,
      url,
      alt: `${slug} album hero image`,
      width: hero.width || undefined,
      height: hero.height || undefined,
      thumbnail_url: hero.thumbnail_url || undefined
    };

    // Basic caching headers for performance
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    return res.json(payload);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', detail: (err as Error)?.message || String(err) });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
