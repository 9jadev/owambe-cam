import { Component, OnInit, OnDestroy, PLATFORM_ID, inject, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventsHttpService, EventItemResponse, EventMediaResult, PaginationState } from '../services/events-http.service';
// Removed HeroHttpService: poster will derive from mediaItems
import { MediaListComponent, MediaItem } from '../media-list/media-list.component';

@Component({
  standalone: true,
  selector: 'app-album',
  imports: [CommonModule, RouterModule, MediaListComponent],
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
  // Media pagination state
  mediaPagination: PaginationState = { page: 1, per_page: 20, total: 0, total_pages: 1 };

  // Slideshow properties
  currentImageIndex = 0;
  private slideshowInterval: any;
  // Removed heroImage state; using derived poster from mediaItems
  // Dynamic media show state
  currentMediaIndex = 0;
  transitioning = false;
  currentImageSrc: string | null = null;
  currentVideoSrc: string | null = null;
  currentVideoPoster: string | null = null;
  transitionIntervalMs = 6000;

  // Background video state
  @ViewChild('bgVideo') bgVideoRef?: ElementRef<HTMLVideoElement>;
  useVideo = true;
  isVideoReady = false;
  isVideoPlaying = false;
  isMuted = true;
  videoError = '';

  // Gallery photos
  galleryPhotos: { url: string; author?: string }[] = [];
  // Combined gallery media (images first, then videos)
  galleryAll: { type: 'photo' | 'video'; url: string; poster?: string; author?: string }[] = [];

  // Modal gallery state
  showModal = false;
  modalIndex = 0;
  modalTransitioning = false;

  // Multimedia items sample
  mediaItems: MediaItem[] = [
    { type: 'photo', src: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&h=600&fit=crop&q=75' },
    { type: 'video', src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', poster: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop&q=75' },
    { type: 'photo', src: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=600&fit=crop&q=75' }
  ];

  constructor(
    private eventsApi: EventsHttpService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  // Derive hero poster from first photo in mediaItems
  get heroPosterUrl(): string | null {
    const firstPhoto = this.mediaItems.find(i => i.type === 'photo' && !!i.src);
    return firstPhoto ? firstPhoto.src : null;
  }

  private applyCurrentMedia() {
    const items = this.mediaItems;
    if (!items || items.length === 0) {
      this.useVideo = false;
      this.currentImageSrc = this.heroPosterUrl;
      this.currentVideoSrc = null;
      this.currentVideoPoster = this.heroPosterUrl;
      return;
    }
    const idx = ((this.currentMediaIndex % items.length) + items.length) % items.length;
    const item = items[idx];
    this.transitioning = true;
    if (item.type === 'photo') {
      this.useVideo = false;
      this.currentImageSrc = item.src;
      this.currentVideoSrc = null;
      this.currentVideoPoster = this.heroPosterUrl;
    } else {
      this.useVideo = true;
      this.currentVideoSrc = item.src;
      this.currentVideoPoster = item.poster || this.heroPosterUrl;
      setTimeout(() => {
        const v = this.bgVideoRef?.nativeElement;
        if (v) {
          try {
            v.pause();
            v.load();
            const p = v.play();
            if (p && typeof (p as any).then === 'function') {
              (p as Promise<void>).catch(() => { });
            }
          } catch (_) {}
        }
      }, 50);
    }
    setTimeout(() => { this.transitioning = false; }, 200);
  }

  private startMediaShow() {
    if (this.slideshowInterval) clearInterval(this.slideshowInterval);
    if (this.mediaItems.length <= 1) return;
    this.slideshowInterval = setInterval(() => {
      this.nextMedia();
    }, this.transitionIntervalMs);
  }

  private nextMedia() {
    this.currentMediaIndex = (this.currentMediaIndex + 1) % (this.mediaItems.length || 1);
    this.applyCurrentMedia();
  }

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

    // Only fetch data and start media in browser
    if (this.isBrowser) {
      this.fetchBySlug(this.slug);
      this.fetchMedia(this.slug, this.mediaPagination.page, this.mediaPagination.per_page);
      // if (this.useVideo) {
      //   this.initBackgroundVideo();
      // } else {
      //   setTimeout(() => {
      //     this.startSlideshow();
      //   }, 1000);
      // }
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
    // Slideshow disabled: hero now uses a single dynamic image
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
      this.slideshowInterval = null;
    }
  }

  goToSlide(index: number) {
    // No-op: single hero image, keep index at 0
    this.currentImageIndex = 0;
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

  initBackgroundVideo() {
    const v = this.bgVideoRef?.nativeElement;
    if (!v) {
      this.useVideo = false;
      setTimeout(() => this.startSlideshow(), 300);
      return;
    }
    v.muted = true;
    this.isMuted = true;
    const tryPlay = () => {
      v.play().then(() => {
        this.isVideoPlaying = true;
        this.videoError = '';
      }).catch(() => {
        this.isVideoPlaying = false;
        this.videoError = 'Autoplay blocked. Click play to start.';
      });
    };
    if (v.readyState >= 2) {
      this.isVideoReady = true;
      tryPlay();
    }
    setTimeout(() => tryPlay(), 0);
  }

  onVideoCanPlay() {
    this.isVideoReady = true;
  }

  onVideoCanPlayThrough() {
    const v = this.bgVideoRef?.nativeElement;
    if (v && !this.isVideoPlaying) {
      v.play().catch(() => { });
    }
  }

  onVideoError(_: any) {
    this.videoError = 'Video playback error. Falling back to image.';
    this.useVideo = false;
    this.currentImageSrc = this.currentVideoPoster || this.heroPosterUrl;
  }

  onVideoEnded() {
    this.isVideoPlaying = false;
  }

  onVideoPause() {
    this.isVideoPlaying = false;
  }

  onVideoPlay() {
    this.isVideoPlaying = true;
  }

  togglePlay() {
    const v = this.bgVideoRef?.nativeElement;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => {
        this.isVideoPlaying = true;
        this.videoError = '';
      }).catch(() => {
        this.videoError = 'Cannot start playback. Please try again.';
      });
    } else {
      v.pause();
      this.isVideoPlaying = false;
    }
  }

  toggleMute() {
    const v = this.bgVideoRef?.nativeElement;
    if (!v) return;
    v.muted = !v.muted;
    this.isMuted = v.muted;
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      const v = this.bgVideoRef?.nativeElement;
      if (v && v.paused) {
        v.play().catch(() => { });
      }
    }
  }

  // Modal gallery controls
  openModal(index: number) {
    if (!this.galleryAll || this.galleryAll.length === 0) return;
    this.modalIndex = Math.max(0, Math.min(index, this.galleryAll.length - 1));
    this.showModal = true;
    this.modalTransitioning = true;
    setTimeout(() => { this.modalTransitioning = false; }, 200);
  }

  closeModal() {
    this.modalTransitioning = true;
    setTimeout(() => {
      this.showModal = false;
      this.modalTransitioning = false;
    }, 200);
  }

  prevModal() {
    if (!this.galleryAll || this.galleryAll.length === 0) return;
    this.modalTransitioning = true;
    this.modalIndex = (this.modalIndex - 1 + this.galleryAll.length) % this.galleryAll.length;
    setTimeout(() => { this.modalTransitioning = false; }, 200);
  }

  nextModal() {
    if (!this.galleryAll || this.galleryAll.length === 0) return;
    this.modalTransitioning = true;
    this.modalIndex = (this.modalIndex + 1) % this.galleryAll.length;
    setTimeout(() => { this.modalTransitioning = false; }, 200);
  }

  goToModal(index: number) {
    if (!this.galleryAll || this.galleryAll.length === 0) return;
    this.modalTransitioning = true;
    this.modalIndex = Math.max(0, Math.min(index, this.galleryAll.length - 1));
    setTimeout(() => { this.modalTransitioning = false; }, 200);
  }
  
  get modalItem(): { type: 'photo' | 'video'; url: string; poster?: string } | null {
    if (!this.galleryAll || this.galleryAll.length === 0) return null;
    return this.galleryAll[this.modalIndex] || null;
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(ev: KeyboardEvent) {
    if (!this.showModal) return;
    if (ev.key === 'Escape') {
      ev.preventDefault();
      this.closeModal();
    } else if (ev.key === 'ArrowLeft') {
      ev.preventDefault();
      this.prevModal();
    } else if (ev.key === 'ArrowRight') {
      ev.preventDefault();
      this.nextModal();
    }
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

  private mimeFor(format?: string, type?: 'photo' | 'video'): string | undefined {
    const f = (format || '').toLowerCase();
    if (type === 'photo') {
      if (f === 'jpg' || f === 'jpeg') return 'image/jpeg';
      if (f === 'png') return 'image/png';
    }
    if (type === 'video') {
      if (f === 'mp4') return 'video/mp4';
      if (f === 'mov') return 'video/quicktime';
      if (f === 'webm') return 'video/webm';
      if (f === 'mkv') return 'video/x-matroska';
    }
    return undefined;
  }

  private fetchMedia(slug: string, page: number = 1, perPage: number = 20) {
    this.eventsApi.getEventMedia(slug, page, perPage).subscribe({
      next: (res: EventMediaResult) => {
        console.log(res)
        // Update event info from media response if missing
        if (!this.event) {
          this.event = { id: res.event.id, name: res.event.name, slug: res.event.slug, date: new Date().toISOString(), type: 'event' };
        }
        this.mediaPagination = res.pagination;
        // Update count
        this.photoCount = res.media.length;
        // Replace galleryPhotos source: use images from API, preserve placeholder URLs exactly
        const imageEntries = res.media
          .filter(m => m.type === 'image')
          .map(m => ({ url: m.url, author: (m.metadata?.author as string) || 'Guest' }));
        this.galleryPhotos = imageEntries;

        // Build combined gallery (images first, then videos)
        const galleryImages = imageEntries.map(({ url, author }) => ({ type: 'photo' as const, url, author }));
        const galleryVideos = res.media
          .filter(m => m.type === 'video')
          .map(m => ({ type: 'video' as const, url: m.url, poster: (m.thumbnail_url as string) || undefined }));
        this.galleryAll = [...galleryImages, ...galleryVideos];

        // If API returns no media, fall back to entries from mediaItems
        if ((!this.galleryPhotos || this.galleryPhotos.length === 0) && (!this.galleryAll || this.galleryAll.length === 0)) {
          this.galleryPhotos = this.mediaItems
            .filter(i => i.type === 'photo' && !!i.src)
            .map(i => ({ url: i.src!, author: 'Guest' }));
          this.galleryAll = this.mediaItems
            .filter(i => (i.type === 'photo' || i.type === 'video') && !!i.src)
            .map(i => ({ type: i.type, url: i.src!, poster: i.poster }));
        }
        // Map processed media to MediaListComponent items
        this.mediaItems = res.media.filter(m => m.type === 'image' || m.type === 'video').map((m) => {
          if (m.type === 'image') {
            const item: MediaItem = {
              type: 'photo',
              src: m.url,
              mime: this.mimeFor(m.format, 'photo')
            };
            return item;
          }
          if (m.type === 'video') {
            const item: MediaItem = {
              type: 'video',
              src: m.url,
              poster: m.thumbnail_url,
              mime: this.mimeFor(m.format, 'video')
            };
            return item;
          }
          // Skip unsupported formats in viewer (kept in raw result)
          return { type: 'photo', src: m.url } as MediaItem; // unreachable due to filter
        });
        // Initialize current media and start transitions
        this.currentMediaIndex = 0;
        this.applyCurrentMedia();
        this.startMediaShow();
        console.log(this.mediaItems);
        console.log(this.galleryPhotos);
      },
      error: (err) => {
        console.error('Error loading media:', err);
        // Keep existing sample mediaItems if API fails
        // Fallback: ensure we have something to display
        this.applyCurrentMedia();
        // Populate gallery with photo items from existing mediaItems so modal can open
        this.galleryPhotos = this.mediaItems
          .filter(i => i.type === 'photo' && !!i.src)
          .map(i => ({ url: i.src!, author: 'Guest' }));
      }
    });
  }
  // Removed fetchHero: hero poster is derived from mediaItems

}
