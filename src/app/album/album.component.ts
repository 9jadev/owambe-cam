import { Component, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventsHttpService, EventItemResponse } from '../services/events-http.service';

@Component({
  standalone: true,
  selector: 'app-album',
  imports: [CommonModule, RouterModule],
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss']
})
export class AlbumComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  slug = '';
  loading = true;
  event: EventItemResponse | null = null;
  error = '';
  photoCount = 2; // TODO: Get from API
  imagesLoaded = 0;
  totalImages = 5; // Number of hero images

  // Slideshow properties
  currentImageIndex = 0;
  private slideshowInterval: any;
  heroImages = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=800&fit=crop&q=75', // Wedding celebration
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&h=800&fit=crop&q=75', // Party/Event
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1200&h=800&fit=crop&q=75', // Birthday celebration
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=800&fit=crop&q=75', // Event crowd
    'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200&h=800&fit=crop&q=75'  // Happy gathering
  ];

  // Gallery photos
  galleryPhotos = [
    {
      url: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=600&h=600&fit=crop&q=75',
      author: 'Guest 1'
    },
    {
      url: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&h=600&fit=crop&q=75',
      author: 'Guest 2'
    },
    {
      url: 'https://images.unsplash.com/photo-1464047736614-af63643285bf?w=600&h=600&fit=crop&q=75',
      author: 'Guest 3'
    },
    {
      url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=600&fit=crop&q=75',
      author: 'Guest 4'
    }
  ];

  constructor(
    private eventsApi: EventsHttpService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    if (!this.slug) {
      this.error = 'Missing album slug.';
      this.loading = false;
      if (this.isBrowser) {
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      }
      return;
    }

    console.log('Loading album with slug:', this.slug);

    // Only fetch data and start slideshow in browser
    if (this.isBrowser) {
      this.fetchBySlug(this.slug);
      // Start slideshow after a brief delay to allow images to start loading
      setTimeout(() => {
        this.startSlideshow();
      }, 1000);
    } else {
      // In SSR, use mock data immediately
      this.useMockData(this.slug);
    }
  }

  ngOnDestroy() {
    // Clean up interval on component destroy
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
    }
  }

  startSlideshow() {
    // Change image every 4 seconds
    this.slideshowInterval = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.heroImages.length;
    }, 4000);
  }

  goToSlide(index: number) {
    this.currentImageIndex = index;
    // Reset interval when manually changing
    clearInterval(this.slideshowInterval);
    this.startSlideshow();
  }

  addToAlbum() {
    // Navigate to add-to-album component
    this.router.navigate(['/add-to-album', this.slug]);
  }

  onImageLoad() {
    this.imagesLoaded++;
    console.log(`Image loaded: ${this.imagesLoaded}/${this.totalImages}`);
  }

  onImageError(event: any) {
    console.error('Image failed to load:', event);
    // Continue loading even if some images fail
    this.imagesLoaded++;
  }

  private useMockData(slug: string) {
    this.event = {
      id: slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      date: new Date().toISOString(),
      type: 'event',
      slug: slug
    };
    this.loading = false;
  }

  private fetchBySlug(slug: string) {
    if (!slug) {
      this.error = 'Invalid album slug.';
      return;
    }
    this.loading = true;
    this.error = '';

    // Use public endpoint for guest access (no authentication required)
    this.eventsApi.getPublicEventBySlug(slug).subscribe({
      next: (e) => {
        console.log('Event loaded:', e);
        this.event = e;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading event:', err);

        // If API fails (401, 404, network error, or endpoint doesn't exist), use mock data
        console.log('Using mock event data for demo purposes');
        this.useMockData(slug);
      }
    });
  }
}
