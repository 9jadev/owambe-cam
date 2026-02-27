import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { BackendService } from './backend.service';
import { ToastService } from './toast.service';

export interface CreateEventPayload {
  name: string;
  date: string; // ISO or YYYY-MM-DD
  type: string; // event type key
}

export interface EventItemResponse {
  id: string;
  name: string;
  date: string;
  type: string;
  slug?: string;
  // add fields as backend returns
}

export interface CreateEventResponse {
  message?: string;
  event?: EventItemResponse;
}

export interface MediaUploadResponse {
  message: string;
  data: {
    uploaded_count: number;
    media: MediaItem[];
    event: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export interface MediaItem {
  id: string;
  url: string;
  thumbnail_url?: string;
  type: 'photo' | 'video';
  author?: string;
  uploaded_at: string;
  file_size: number;
}

export interface TextPostResponse {
  message: string;
  data: {
    id: string;
    message: string;
    author?: string;
    created_at: string;
    event_slug: string;
    type: 'text';
  };
}

// --- Media album loader types ---
/** Media type classification after processing */
export type ProcessedMediaType = 'image' | 'video' | 'other';

/** Raw media item as received from the API. Fields are optional and preserved in metadata. */
export interface RawMediaApiItem {
  public_id?: string;
  url?: string;
  resource_type?: string; // 'image' | 'video' | other
  format?: string; // e.g. 'jpg', 'mp4'
  bytes?: number;
  width?: number;
  height?: number;
  duration?: number; // seconds if available for videos
  thumbnail_url?: string;
  secure_url?: string;
  [key: string]: any;
}

/** Normalized media item with type, URL, and preserved metadata fields. */
export interface ProcessedMediaItem {
  type: ProcessedMediaType;
  url: string;
  public_id?: string;
  resource_type?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail_url?: string;
  unsupported?: boolean;
  metadata?: any;
}

/** Pagination state synchronized with the API response. */
export interface PaginationState {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

/** Minimal event info used by album views. */
export interface EventInfo {
  id: string;
  slug: string;
  name: string;
}

/**
 * Final structured result returned by the media loader.
 * Includes event info, processed media array, pagination, and raw API response.
 */
export interface EventMediaResult {
  event: EventInfo;
  media: ProcessedMediaItem[];
  pagination: PaginationState;
  raw: any; // preserve original response
}

@Injectable({ providedIn: 'root' })
export class EventsHttpService {
  private eventsPath = '/customer/events';
  private publicEventsPath = '/events';

  constructor(private backend: BackendService, private toast: ToastService) { }

  createEvent(payload: CreateEventPayload): Observable<CreateEventResponse> {
    return this.backend
      .post<CreateEventResponse>(this.eventsPath, payload, this.backend.jsonOptions())
      .pipe(tap((res) => this.toast.success(res.message || 'Event created successfully')));
  }

  listEvents(): Observable<EventItemResponse[]> {
    return this.backend.get<any>(this.eventsPath).pipe(
      map((res) => (Array.isArray(res) ? res : (res?.events || res?.data || [])) as EventItemResponse[])
    );
  }

  getEventBySlug(slug: string): Observable<EventItemResponse> {
    // Using customer events endpoint - requires authentication
    return this.backend.get<any>(`${this.eventsPath}/${slug}`).pipe(
      map((res) => (res?.event || res?.data || res) as EventItemResponse)
    );
  }

  // Public endpoint for album/guest access (no authentication required)
  getPublicEventBySlug(slug: string): Observable<EventItemResponse> {
    return this.backend.get<any>(`${this.publicEventsPath}/${slug}`).pipe(
      map((res) => (res?.event || res?.data || res) as EventItemResponse)
    );
  }

  /**
   * Upload media files (photos/videos) to an event album
   * @param slug Event slug
   * @param files Array of files to upload
   * @param author Optional author name
   * @param type Optional media type (photo or video)
   */
  uploadMedia(
    slug: string,
    files: File[],
    author?: string,
    type?: 'photo' | 'video'
  ): Observable<MediaUploadResponse> {
    const formData = new FormData();

    // Append each file to the FormData
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file, file.name);
    });

    // Add optional fields
    if (author) {
      formData.append('author', author);
    }

    if (type) {
      formData.append('type', type);
    }

    return this.backend
      .post<MediaUploadResponse>(`${this.eventsPath}/${slug}/media`, formData)
      .pipe(
        tap((res) => {
          this.toast.success(res.message || 'Media uploaded successfully');
        })
      );
  }

  /**
   * Create a text post for an event album
   * @param slug Event slug
   * @param message Post message
   * @param author Optional author name
   */
  createTextPost(
    slug: string,
    message: string,
    author?: string
  ): Observable<TextPostResponse> {
    const payload = { message, author };

    return this.backend
      .post<TextPostResponse>(
        `${this.eventsPath}/${slug}/posts`,
        payload,
        this.backend.jsonOptions()
      )
      .pipe(
        tap((res) => {
          this.toast.success(res.message || 'Post created successfully');
        })
      );
  }

  /**
   * Fetch event media with pagination and robust parsing.
   * - Handles images (jpg/png) and videos (mp4/mov, etc.)
   * - Preserves all metadata and placeholder URLs exactly
   * - Validates response structure and gracefully handles malformed items
   */
  getEventMedia(slug: string, page: number = 1, perPage: number = 20): Observable<EventMediaResult> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('per_page', String(perPage));

    // Use absolute API endpoint as requested; BackendService allows absolute URLs
    const path = `http://127.0.0.1:8000/api/events/${slug}/media`;
    return this.backend.get<any>(path, { params }).pipe(
      map((raw: any) => {
        // Basic content validation (no headers available via body-only observe)
        if (raw == null || typeof raw !== 'object') {
          throw new Error('Invalid response: expected JSON object');
        }
        // Extract event info
        const eventObj = (raw?.event || raw?.data?.event || raw?.data?.album || raw) as any;
        const event: EventInfo = {
          id: String(eventObj?.id ?? slug),
          slug: String(eventObj?.slug ?? slug),
          name: String(eventObj?.name ?? slug)
        };

        // Extract media array from common shapes
        const mediaSrc: RawMediaApiItem[] = (
          (Array.isArray(raw?.media) ? raw?.media : null) ||
          (Array.isArray(raw?.data?.media) ? raw?.data?.media : null) ||
          (Array.isArray(raw?.resources) ? raw?.resources : null) ||
          (Array.isArray(raw?.assets) ? raw?.assets : null) ||
          []
        ) as RawMediaApiItem[];

        // Determine pagination state
        const p = raw?.pagination || raw?.meta?.pagination || {};
        const totalVal = Number(p?.total ?? raw?.total ?? mediaSrc.length ?? 0);
        const perVal = Number(p?.per_page ?? raw?.per_page ?? perPage ?? 20);
        const pageVal = Number(p?.page ?? raw?.page ?? page ?? 1);
        const totalPagesVal = Number(p?.total_pages ?? raw?.total_pages ?? (perVal > 0 ? Math.ceil(totalVal / perVal) : 1));
        const pagination: PaginationState = {
          page: isFinite(pageVal) && pageVal > 0 ? pageVal : 1,
          per_page: isFinite(perVal) && perVal > 0 ? perVal : 20,
          total: isFinite(totalVal) && totalVal >= 0 ? totalVal : mediaSrc.length,
          total_pages: isFinite(totalPagesVal) && totalPagesVal > 0 ? totalPagesVal : 1
        };

        // Helpers for type detection
        const isImageFormat = (fmt?: string) => {
          const f = (fmt || '').toLowerCase();
          return f === 'jpg' || f === 'jpeg' || f === 'png';
        };
        const isVideoFormat = (fmt?: string) => {
          const f = (fmt || '').toLowerCase();
          return f === 'mp4' || f === 'mov' || f === 'webm' || f === 'mkv';
        };
        // Type predicate to narrow to string for safe assignment
        const looksLikeUrl = (u: string | undefined): u is string => typeof u === 'string' && /^https?:\/\//.test(u);

        // Map and validate items
        const processed: ProcessedMediaItem[] = mediaSrc
          .map((it: RawMediaApiItem): ProcessedMediaItem | null => {
            const urlCandidate = it?.url ?? it?.secure_url;
            if (!looksLikeUrl(urlCandidate)) {
              // Malformed: missing/invalid URL
              return null;
            }
            const url = urlCandidate; // narrowed to string by the predicate

            const resourceType = String(it?.resource_type || '').toLowerCase();
            const fmt = String(it?.format || '').toLowerCase();
            let type: ProcessedMediaType = 'other';

            if (resourceType === 'image' || isImageFormat(fmt)) {
              type = 'image';
            } else if (resourceType === 'video' || isVideoFormat(fmt)) {
              type = 'video';
            } else {
              type = 'other';
            }

            const width = typeof it?.width === 'number' ? it.width : undefined;
            const height = typeof it?.height === 'number' ? it.height : undefined;
            const duration = typeof it?.duration === 'number' ? it.duration : undefined;
            const bytes = typeof it?.bytes === 'number' ? it.bytes : undefined;

            const item: ProcessedMediaItem = {
              type,
              url, // preserve placeholder URL exactly
              public_id: it?.public_id,
              resource_type: it?.resource_type,
              format: it?.format,
              bytes,
              width,
              height,
              duration,
              thumbnail_url: it?.thumbnail_url,
              unsupported: type === 'other',
              metadata: it
            };

            // Fallback for unsupported formats: keep as 'other' with metadata
            return item;
          })
          .filter((v): v is ProcessedMediaItem => !!v);

        return { event, media: processed, pagination, raw } as EventMediaResult;
      })
    );
  }
}
