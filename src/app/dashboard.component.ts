import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthHttpService } from './auth-http.service';

@Component({
    standalone: true,
    selector: 'app-dashboard',
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
    currentEvent = {
        name: 'Class',
        plan: 'Free',
        albumUrl: 'myowambe.cap/class',
        photoWallUrl: 'myowambe.cap/s/class'
    };

    user = {
        email: 'user@example.com',
        name: 'My Account'
    };

    sidebarCollapsed = false;

    constructor(private apiAuth: AuthHttpService) {}

    ngOnInit() {
        const stored = this.apiAuth.getStoredCustomer();
        if (stored) this.user = stored as any;
        this.apiAuth.getMe().subscribe({
            next: (customer) => (this.user = customer as any),
            error: () => {}
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
