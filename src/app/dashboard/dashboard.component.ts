import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthHttpService } from '../services/auth-http.service';
import { EventsHttpService, EventItemResponse } from '../services/events-http.service';
import { DashboardSidebarComponent } from './sidebar.component';

@Component({
    standalone: true,
    selector: 'app-dashboard',
    imports: [CommonModule, RouterModule, DashboardSidebarComponent],
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

    constructor(
        private apiAuth: AuthHttpService,
        private eventsApi: EventsHttpService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    eventSlug: string | null = null;

    ngOnInit() {
        const stored = this.apiAuth.getStoredCustomer();
        if (stored) this.user = stored as any;
        this.apiAuth.getMe().subscribe({
            next: (customer) => (this.user = customer as any),
            error: () => {}
        });

        // Capture event slug from route if present
        this.eventSlug = this.route.snapshot.paramMap.get('slug');

        if (this.eventSlug) {
            this.eventsApi.getEventBySlug(this.eventSlug).subscribe({
                next: (e) => {
                    const slug = e.slug || this.eventSlug || (e.name || 'event').toLowerCase().replace(/\s+/g, '-');
                    this.currentEvent = {
                        name: e.name,
                        plan: 'Free',
                        albumUrl: `myowambe.cap/${slug}`,
                        photoWallUrl: `myowambe.cap/s/${slug}`
                    };
                },
                error: (err) => {
                    if (err && err.status === 404) {
                        this.router.navigate(['/dashboard']);
                    } else {
                        // Fallback: keep defaults
                    }
                }
            });
        } else {
            this.eventsApi.listEvents().subscribe({
                next: (events) => {
                    if (events && events.length) {
                        const e = events[0];
                        const slug = (e.slug || e.name || 'event').toLowerCase().replace(/\s+/g, '-');
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
