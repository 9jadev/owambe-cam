import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface MediaItem {
    id: string;
    type: 'image' | 'video';
    url: string;
    thumbnail: string;
    status: 'published' | 'pending' | 'hidden';
    uploadedAt: Date;
    fileName: string;
}

@Component({
    standalone: true,
    selector: 'app-media',
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './media.component.html',
    styleUrls: ['./media.component.scss']
})
export class MediaComponent {
    currentEvent = {
        name: 'Class',
        plan: 'Free'
    };

    user = {
        email: 'user@example.com'
    };

    sidebarCollapsed = false;

    // Upload stats
    uploadStats = {
        used: 0,
        limit: 100
    };

    // Filter states
    activeFilter: 'all' | 'published' | 'pending' | 'hidden' = 'all';
    sortBy: 'date-added' | 'name' = 'date-added';

    // Media items
    mediaItems: MediaItem[] = [];

    get publishedCount() {
        return this.mediaItems.filter(item => item.status === 'published').length;
    }

    get pendingCount() {
        return this.mediaItems.filter(item => item.status === 'pending').length;
    }

    get hiddenCount() {
        return this.mediaItems.filter(item => item.status === 'hidden').length;
    }

    get filteredMedia() {
        let items = this.mediaItems;

        if (this.activeFilter !== 'all') {
            items = items.filter(item => item.status === this.activeFilter);
        }

        // Sort
        if (this.sortBy === 'date-added') {
            items = items.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
        } else {
            items = items.sort((a, b) => a.fileName.localeCompare(b.fileName));
        }

        return items;
    }

    toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
    }

    setFilter(filter: 'all' | 'published' | 'pending' | 'hidden') {
        this.activeFilter = filter;
    }

    uploadPhotos() {
        // Stub: Open file picker for upload
        console.log('Opening file picker for upload...');
    }

    downloadAll() {
        // Stub: Download all media
        console.log('Downloading all media...');
    }

    getMore() {
        // Stub: Navigate to upgrade page
        console.log('Get more uploads...');
    }
}
