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
  // add fields as backend returns
}

export interface CreateEventResponse {
  message?: string;
  event?: EventItemResponse;
}

@Injectable({ providedIn: 'root' })
export class EventsHttpService {
  private eventsPath = '/customer/events';

  constructor(private backend: BackendService, private toast: ToastService) {}

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
}