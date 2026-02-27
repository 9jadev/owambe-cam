import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { BackendService } from './backend.service';

export interface HeroImageResponse {
  slug: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  thumbnail_url?: string;
}

@Injectable({ providedIn: 'root' })
export class HeroHttpService {
  private cache = new Map<string, Observable<HeroImageResponse>>();

  constructor(private backend: BackendService) {}

  /**
   * Fetch hero image for an album slug.
   * Tries local server endpoint first and falls back to upstream event media.
   */
  getAlbumHero(slug: string): Observable<HeroImageResponse> {
    const key = slug.trim().toLowerCase();
    if (this.cache.has(key)) return this.cache.get(key)!;

    const req$ = this.backend.get<HeroImageResponse>(`http://localhost:4000/api/album/${encodeURIComponent(key)}/hero`).pipe(
      // Fallback to upstream parsing when local endpoint is unavailable in dev
      catchError(() => this.fetchFromUpstream(key)),
      shareReplay(1)
    );

    this.cache.set(key, req$);
    return req$;
  }

  private fetchFromUpstream(slug: string): Observable<HeroImageResponse> {
    // Use existing upstream event media endpoint, pick first image
    const path = `http://127.0.0.1:8000/api/events/${encodeURIComponent(slug)}/media?page=1&per_page=20`;
    return this.backend.get<any>(path).pipe(
      map((raw) => {
        if (!raw || typeof raw !== 'object') throw new Error('Invalid upstream response');
        const media: any[] = (Array.isArray(raw.media) ? raw.media : Array.isArray(raw.data?.media) ? raw.data.media : []);
        const isImage = (item: any): boolean => {
          const rt = String(item?.resource_type || '').toLowerCase();
          const fmt = String(item?.format || '').toLowerCase();
          const url: string | undefined = item?.url || item?.secure_url;
          const looksLikeImage = (u?: string) => !!u && /(\.jpg|\.jpeg|\.png)(\?.*)?$/i.test(u);
          return rt === 'image' || fmt === 'jpg' || fmt === 'jpeg' || fmt === 'png' || looksLikeImage(url);
        };
        const hero = media.find(isImage);
        if (!hero) throw new Error('No hero image available');
        const url: string = (hero.url || hero.secure_url) as string;
        return {
          slug,
          url,
          alt: `${slug} album hero image`,
          width: hero.width || undefined,
          height: hero.height || undefined,
          thumbnail_url: hero.thumbnail_url || undefined
        } as HeroImageResponse;
      })
    );
  }
}