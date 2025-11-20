import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthHttpService } from './auth-http.service';

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

    constructor(private router: Router, private apiAuth: AuthHttpService) { }

    ngOnInit() {
        const stored = this.apiAuth.getStoredCustomer();
        if (stored) this.user = stored as any;
        this.apiAuth.getMe().subscribe({
            next: (customer) => (this.user = customer as any),
            error: () => {}
        });
    }

    // Events list
    events: EventItem[] = [
        {
            id: '1',
            name: 'Class',
            plan: 'Free',
            uploads: 0,
            createdAt: new Date('2025-11-18'),
            isCurrent: false
        },
        {
            id: '2',
            name: 'Class',
            plan: 'Free',
            uploads: 2,
            createdAt: new Date('2025-11-16'),
            isCurrent: true
        }
    ];

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
}
