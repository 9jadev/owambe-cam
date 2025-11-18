import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

type SettingsTab = 'general' | 'appearance' | 'photo-wall' | 'moderation' | 'collaborators';
type EventType = 'wedding' | 'party' | 'conference' | 'birthday' | 'other';

@Component({
    standalone: true,
    selector: 'app-settings',
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
    currentEvent = {
        name: 'Class',
        plan: 'Free'
    };

    user = {
        email: 'user@example.com'
    };

    sidebarCollapsed = false;
    activeTab: SettingsTab = 'general';

    // General settings
    eventName = 'Class';
    eventDate = '';
    eventType: EventType = 'conference';
    customLink = 'x8l9om';

    // Appearance settings
    primaryColor = '#fd0a90';
    coverImage = '';
    logoImage = '';

    // Photo Wall settings
    autoApprove = true;
    showGuestNames = true;
    slideshowSpeed = 5;

    // Moderation settings
    requireApproval = false;
    allowComments = true;
    profanityFilter = true;

    // Collaborators
    collaborators: Array<{ email: string, role: 'admin' | 'editor' | 'viewer' }> = [];
    newCollaboratorEmail = '';

    toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
    }

    setTab(tab: SettingsTab) {
        this.activeTab = tab;
    }

    setEventType(type: EventType) {
        this.eventType = type;
    }

    saveGeneral() {
        console.log('Saving general settings...', {
            eventName: this.eventName,
            eventDate: this.eventDate,
            eventType: this.eventType,
            customLink: this.customLink
        });
    }

    suggestLink() {
        // Generate random suggestion
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.customLink = result;
    }

    saveAppearance() {
        console.log('Saving appearance settings...');
    }

    savePhotoWall() {
        console.log('Saving photo wall settings...');
    }

    saveModeration() {
        console.log('Saving moderation settings...');
    }

    addCollaborator() {
        if (this.newCollaboratorEmail) {
            this.collaborators.push({
                email: this.newCollaboratorEmail,
                role: 'editor'
            });
            this.newCollaboratorEmail = '';
        }
    }

    removeCollaborator(index: number) {
        this.collaborators.splice(index, 1);
    }

    uploadCoverImage() {
        console.log('Uploading cover image...');
    }

    uploadLogo() {
        console.log('Uploading logo...');
    }
}
