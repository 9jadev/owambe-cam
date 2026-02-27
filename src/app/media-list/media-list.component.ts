import { Component, Input, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export type MediaType = 'photo' | 'video';
export interface MediaItem {
  type: MediaType;
  src: string;
  poster?: string;
  title?: string;
  mime?: string;
}

@Component({
  standalone: true,
  selector: 'app-media-list',
  imports: [CommonModule],
  templateUrl: './media-list.component.html',
  styleUrls: ['./media-list.component.scss']
})
export class MediaListComponent implements OnInit, OnDestroy {
  @Input() items: MediaItem[] = [];
  @Input() transitionMs = 600;
  @Input() preloadStrategy: 'none' | 'metadata' | 'auto' = 'metadata';

  @ViewChildren('videoEl') videoEls?: QueryList<ElementRef<HTMLVideoElement>>;

  currentIndex = 0;
  prevIndex = 0;
  transitioning = false;
  isPlaying = false;
  isMuted = true;
  volume = 1.0;
  loadingCurrent = false;
  errorMessage = '';
  generatedPosters: Record<number, string> = {};

  ngOnInit(): void {
    // Initialize based on first item type
    const first = this.items[0];
    if (first && first.type === 'video') {
      this.isMuted = true;
      this.isPlaying = true; // default autoplay muted policy
    }
  }

  ngOnDestroy(): void {
    this.pauseAll();
  }

  get current(): MediaItem | undefined {
    return this.items[this.currentIndex];
  }

  get isVideo(): boolean {
    return this.current?.type === 'video';
  }

  goTo(index: number) {
    if (index === this.currentIndex || index < 0 || index >= this.items.length) return;
    this.prevIndex = this.currentIndex;
    const wasPlaying = this.isPlaying;
    const wasMuted = this.isMuted;
    this.transitioning = true;

    // Prepare next item
    this.currentIndex = index;
    const next = this.items[this.currentIndex];
    if (next?.type === 'video') {
      const v = this.getVideoRef(this.currentIndex);
      if (v) {
        v.muted = true; // start muted during transition
        v.preload = this.preloadStrategy;
        if (wasPlaying) {
          v.play().catch(() => {});
        }
      }
    }

    // Keep previous video audio during transition
    const prev = this.items[this.prevIndex];
    if (prev?.type === 'video') {
      const pv = this.getVideoRef(this.prevIndex);
      if (pv && wasPlaying) {
        pv.muted = wasMuted ? true : false;
      }
    }

    // Complete transition after duration
    setTimeout(() => {
      this.transitioning = false;
      // After transition, finalize playback state
      const p = this.items[this.prevIndex];
      const c = this.items[this.currentIndex];
      if (p?.type === 'video') {
        const pv = this.getVideoRef(this.prevIndex);
        if (pv) {
          pv.pause();
        }
      }
      if (c?.type === 'video') {
        const cv = this.getVideoRef(this.currentIndex);
        if (cv) {
          cv.muted = this.isMuted;
          if (wasPlaying) {
            cv.play().catch(() => {});
          } else {
            cv.pause();
          }
        }
      }
    }, this.transitionMs);
  }

  togglePlay() {
    const v = this.getVideoRef(this.currentIndex);
    if (!v) return;
    if (v.paused) {
      v.play().then(() => {
        this.isPlaying = true;
        this.errorMessage = '';
      }).catch(() => {
        this.errorMessage = 'Playback failed. Tap to retry.';
      });
    } else {
      v.pause();
      this.isPlaying = false;
    }
  }

  toggleMute() {
    const v = this.getVideoRef(this.currentIndex);
    this.isMuted = !this.isMuted;
    if (v) v.muted = this.isMuted;
  }

  setVolume(vol: number) {
    this.volume = Math.min(1, Math.max(0, vol));
    const v = this.getVideoRef(this.currentIndex);
    if (v) v.volume = this.volume;
  }

  onVideoCanPlay(index: number) {
    if (index === this.currentIndex) {
      this.loadingCurrent = false;
    }
    this.capturePoster(index);
  }

  onVideoWaiting(index: number) {
    if (index === this.currentIndex) {
      this.loadingCurrent = true;
    }
  }

  onVideoError(index: number) {
    if (index === this.currentIndex) {
      this.errorMessage = 'Video error. Skipping…';
    }
  }

  private getVideoRef(index: number): HTMLVideoElement | undefined {
    const el = this.videoEls?.get(index)?.nativeElement;
    return el;
  }

  private pauseAll() {
    this.videoEls?.forEach(v => v.nativeElement.pause());
  }

  private capturePoster(index: number) {
    const item = this.items[index];
    if (!item || item.type !== 'video' || item.poster) return;
    const v = this.getVideoRef(index);
    if (!v) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = v.videoWidth || 320;
      canvas.height = v.videoHeight || 180;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      this.generatedPosters[index] = dataUrl;
    } catch (_) {
      // Ignore cross-origin or canvas errors
    }
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      // Resume playback if it was playing
      if (this.isPlaying && this.isVideo) {
        const v = this.getVideoRef(this.currentIndex);
        v?.play().catch(() => {});
      }
    }
  }
}