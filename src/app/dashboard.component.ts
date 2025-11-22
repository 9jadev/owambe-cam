import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthHttpService } from './services/auth-http.service';
import { EventsHttpService, EventItemResponse } from './services/events-http.service';

@Component({
    standalone: true,
    selector: 'app-dashboard',
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
    currentEvent = {
        name: 'Loading…',
        plan: 'Free',
        albumUrl: 'myowambe.cap/loading',
        photoWallUrl: 'myowambe.cap/s/loading'
    };

    user: { email: string; name?: string } = {
        email: 'user@example.com',
        name: 'My Account'
    };

    sidebarCollapsed = false;

    constructor(private apiAuth: AuthHttpService, private eventsApi: EventsHttpService) {}

    ngOnInit() {
        const stored = this.apiAuth.getStoredCustomer();
        if (stored) this.user = stored as any;
        this.apiAuth.getMe().subscribe({
            next: (customer) => (this.user = customer as any),
            error: () => {}
        });

        this.eventsApi.listEvents().subscribe({
            next: (events) => {
                if (events && events.length) {
                    const e = events[0];
                    const slug = (e.name || 'event').toLowerCase().replace(/\s+/g, '-');
                    this.currentEvent = {
                        name: e.name,
                        plan: 'Free',
                        albumUrl: `myowambe.cap/${slug}`,
                        photoWallUrl: `myowambe.cap/s/${slug}`
                    };
                }
            },
            error: () => {
                // Keep defaults if loading events fails
            }
        });
    }

    toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
    }

    copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
        // You can add a toast notification here
        console.log('Copied to clipboard:', text);
    }

    downloadQR() {
        // Stub: Generate and download QR code
        console.log('Downloading QR code...');
    }
}
