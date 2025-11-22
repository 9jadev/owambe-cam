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
    displayLanguage: 'en' | 'yo' | 'fr' = 'en';
    welcomeScreenEnabled = false;
    removeBranding = false;

    // Photo Wall settings
    imageDuration = 8; // seconds
    videoDuration = 12; // seconds
    wallBackground = '';
    hideSideImages = false;
    hideQrCode = false;
    hideCaption = false;

    // Moderation settings
    requireApproval = false;
    allowComments = true;
    profanityFilter = true;
    moderators: string[] = [];
    newModeratorEmail = '';

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
        const payload = {
            primaryColor: this.primaryColor,
            displayLanguage: this.displayLanguage,
            welcomeScreenEnabled: this.welcomeScreenEnabled,
            removeBranding: this.removeBranding,
            logoImage: this.logoImage,
            coverImage: this.coverImage
        };
        try {
            localStorage.setItem('eventAppearance', JSON.stringify(payload));
            console.log('Appearance saved', payload);
        } catch (e) {
            console.error('Failed to save appearance', e);
        }
    }

    savePhotoWall() {
        const payload = {
            imageDuration: this.imageDuration,
            videoDuration: this.videoDuration,
            wallBackground: this.wallBackground,
            hideSideImages: this.hideSideImages,
            hideQrCode: this.hideQrCode,
            hideCaption: this.hideCaption
        };
        try {
            localStorage.setItem('photoWallSettings', JSON.stringify(payload));
            console.log('Photo Wall settings saved', payload);
        } catch (e) {
            console.error('Failed to save Photo Wall settings', e);
        }
    }

    saveModeration() {
        const payload = {
            requireApproval: this.requireApproval,
            allowComments: this.allowComments,
            profanityFilter: this.profanityFilter,
            moderators: this.moderators
        };
        try {
            localStorage.setItem('moderationSettings', JSON.stringify(payload));
            console.log('Moderation settings saved', payload);
        } catch (e) {
            console.error('Failed to save moderation settings', e);
        }
    }

    addModerator() {
        const email = (this.newModeratorEmail || '').trim().toLowerCase();
        if (!email) return;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.warn('Invalid email address');
            return;
        }
        if (this.moderators.includes(email)) {
            console.warn('Moderator already added');
            this.newModeratorEmail = '';
            return;
        }
        this.moderators.push(email);
        this.newModeratorEmail = '';
    }

    removeModerator(index: number) {
        this.moderators.splice(index, 1);
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

    uploadPhotoWallBackground() {
        console.log('Uploading photo wall background...');
    }

    uploadLogo() {
        console.log('Uploading logo...');
    }

    toggleWelcomeScreen() {
        this.welcomeScreenEnabled = !this.welcomeScreenEnabled;
    }

    upgradeToPro() {
        console.log('Upgrade flow not implemented yet.');
    }
}
