import { Injectable } from '@angular/core';
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
}
