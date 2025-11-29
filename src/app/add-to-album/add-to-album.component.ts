import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventsHttpService } from '../services/events-http.service';

type UploadType = 'gallery' | 'camera' | 'text' | null;

interface TextPost {
    message: string;
    author: string;
}

@Component({
    standalone: true,
    selector: 'app-add-to-album',
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './add-to-album.component.html',
    styleUrls: ['./add-to-album.component.scss']
})
export class AddToAlbumComponent implements OnInit {
    slug = '';
    eventName = '';
    selectedType: UploadType = null;

    // Text post properties
    textPost: TextPost = {
        message: '',
        author: ''
    };

    // Gallery upload properties
    selectedFiles: File[] = [];
    previewUrls: string[] = [];

    // Upload state
    uploading = false;
    uploadProgress = 0;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private eventsApi: EventsHttpService
    ) { }

    ngOnInit() {
        // Try to get slug from route params first, then query params
        this.slug = this.route.snapshot.paramMap.get('slug') || this.route.snapshot.queryParamMap.get('slug') || '';
        this.eventName = this.slug.charAt(0).toUpperCase() + this.slug.slice(1);

        if (!this.slug) {
            this.router.navigate(['/']);
        }
    }

    selectType(type: UploadType) {
        this.selectedType = type;

        if (type === 'camera') {
            // Navigate to camera component
            this.router.navigate(['/camera'], { queryParams: { slug: this.slug } });
        }
    }

    goBack() {
        if (this.selectedType) {
            this.selectedType = null;
            this.resetForm();
        } else {
            this.router.navigate(['/album', this.slug]);
        }
    }

    onFileSelect(event: any) {
        const files = event.target.files;
        if (files && files.length > 0) {
            this.selectedFiles = Array.from(files);
            this.generatePreviews();
        }
    }

    generatePreviews() {
        this.previewUrls = [];
        this.selectedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.previewUrls.push(e.target.result);
            };
            reader.readAsDataURL(file);
        });
    }

    removeFile(index: number) {
        this.selectedFiles.splice(index, 1);
        this.previewUrls.splice(index, 1);
    }

    triggerFileInput() {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        fileInput?.click();
    }

    submitTextPost() {
        if (!this.textPost.message.trim()) {
            return;
        }

        this.uploading = true;
        this.uploadProgress = 0;

        // Call the API to create text post
        this.eventsApi.createTextPost(
            this.slug,
            this.textPost.message.trim(),
            this.textPost.author || undefined
        ).subscribe({
            next: (response) => {
                console.log('Text post created:', response);
                this.uploadProgress = 100;
                setTimeout(() => {
                    this.uploading = false;
                    this.router.navigate(['/album', this.slug]);
                }, 500);
            },
            error: (error) => {
                console.error('Failed to create text post:', error);
                this.uploading = false;
                this.uploadProgress = 0;
                // Error is already shown by toast service
            }
        });
    }

    submitGalleryPhotos() {
        if (this.selectedFiles.length === 0) {
            return;
        }

        this.uploading = true;
        this.uploadProgress = 0;

        // Determine media type from first file
        const firstFile = this.selectedFiles[0];
        const mediaType = firstFile.type.startsWith('video') ? 'video' : 'photo';

        // Upload files to API
        this.eventsApi.uploadMedia(
            this.slug,
            this.selectedFiles,
            undefined, // No author for gallery uploads (authenticated user)
            mediaType
        ).subscribe({
            next: (response) => {
                console.log('Media uploaded:', response);
                this.uploadProgress = 100;
                setTimeout(() => {
                    this.uploading = false;
                    this.router.navigate(['/album', this.slug]);
                }, 500);
            },
            error: (error) => {
                console.error('Failed to upload media:', error);
                this.uploading = false;
                this.uploadProgress = 0;
                // Error is already shown by toast service
            }
        });

        // Simulate progress for better UX (since actual upload happens via observable)
        const progressInterval = setInterval(() => {
            if (this.uploadProgress < 90 && this.uploading) {
                this.uploadProgress += 5;
            } else {
                clearInterval(progressInterval);
            }
        }, 200);
    }

    private resetForm() {
        this.textPost = { message: '', author: '' };
        this.selectedFiles = [];
        this.previewUrls = [];
        this.uploading = false;
        this.uploadProgress = 0;
    }
}
