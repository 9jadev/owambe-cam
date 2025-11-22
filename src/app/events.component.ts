import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthHttpService } from './services/auth-http.service';
import { EventsHttpService, EventItemResponse } from './services/events-http.service';

interface EventItem {
  id: string;
  name: string;
  plan: 'Free' | 'Pro' | 'Premium';
  uploads: number;
  createdAt: Date;
  isCurrent: boolean;
}

@Component({
  standalone: true,
  selector: 'app-events',
  imports: [CommonModule, RouterModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent {
  user = {
    email: 'user@example.com'
  };

  sidebarCollapsed = false;

  constructor(private router: Router, private apiAuth: AuthHttpService, private eventsApi: EventsHttpService) { }

  // Initialize in ngOnInit at bottom to load events

  // Events list
  events: EventItem[] = [];
  loadingEvents = false;
  loadEvents() {
    this.loadingEvents = true;
    this.eventsApi.listEvents().subscribe({
      next: (items: EventItemResponse[]) => {
        console.log(items)
        this.events = (items || []).map((e) => ({
          id: String(e.id),
          name: e.name,
          plan: 'Free',
          uploads: 0,
          createdAt: new Date((e as any).date || Date.now()),
          isCurrent: false
        }));
        console.log(this.events)
        this.loadingEvents = false;
      },
      error: () => {
        this.loadingEvents = false;
      }
    });
  }

  get hasEvents() {
    return this.events.length > 0;
  }

  get currentEvent() {
    return this.events.find(e => e.isCurrent);
  }

  get currentEventName() {
    return this.currentEvent?.name || 'No event selected';
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  createNewEvent() {
    this.router.navigateByUrl('/dashboard/create');
  }

  viewEvent(eventId: string) {
    console.log('Viewing event:', eventId);
    // Navigate to event home
  }

  deleteEvent(eventId: string) {
    console.log('Deleting event:', eventId);
    this.events = this.events.filter(e => e.id !== eventId);
  }

  ngOnInit() {
    const stored = this.apiAuth.getStoredCustomer();
    if (stored) this.user = stored as any;
    this.apiAuth.getMe().subscribe({
      next: (customer) => (this.user = customer as any),
      error: () => { }
    });
    this.loadEvents();
  }
}
