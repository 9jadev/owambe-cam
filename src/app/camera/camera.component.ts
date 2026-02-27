import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Component, ElementRef, inject, PLATFORM_ID, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EventsHttpService } from '../services/events-http.service';

@Component({
  standalone: true,
  selector: 'app-camera',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.scss'
})
export class CameraComponent implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  constructor(private route: ActivatedRoute, private router: Router, private eventsApi: EventsHttpService) {}

  @ViewChild('videoEl') videoEl?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl') canvasEl?: ElementRef<HTMLCanvasElement>;

  stream?: MediaStream;
  mediaRecorder?: MediaRecorder;
  recordedChunks: BlobPart[] = [];
  isRecording = false;
  permissionError = '';
  infoMessage = '';
  uploading = false;
  slug = '';

  // Camera options
  facingMode: 'user' | 'environment' = 'environment';
  resolution: { width: number; height: number } = { width: 1280, height: 720 };

  // Enhancement effects
  enhanceEnabled = true;
  sharpenEnabled = false;

  get filterCss(): string {
    return this.enhanceEnabled ? 'contrast(1.15) saturate(1.2) brightness(1.05)' : 'none';
  }

  ngOnInit() {
    // Set initial message during the correct lifecycle to avoid NG0100 during SSR/hydration.
    if (!this.isBrowser) {
      this.infoMessage = 'Camera is unavailable during server rendering.';
    }

    // Read slug from query params (e.g., /camera?slug=nkjm)
    this.slug = this.route.snapshot.queryParamMap.get('slug') || '';
  }

  async ngAfterViewInit() {
    if (!this.isBrowser) {
      return;
    }
    await this.initCamera();
  }

  async initCamera() {
    try {
      this.permissionError = '';
      // Stop any existing stream
      this.stopCamera();

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: this.resolution.width },
          height: { ideal: this.resolution.height },
          facingMode: this.facingMode
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.stream = stream;

      if (this.videoEl?.nativeElement) {
        const video = this.videoEl.nativeElement;
        // Prevent audio playback while still recording audio: use a video-only stream for preview
        const playbackStream = new MediaStream(stream.getVideoTracks());
        video.srcObject = playbackStream;
        video.muted = true;
        video.volume = 0;
        await video.play().catch(() => {});
      }
    } catch (err: any) {
      this.permissionError = this.describeError(err);
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = undefined;
    }
  }

  async switchCamera() {
    this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
    await this.initCamera();
  }

  async setResolution(preset: '720p' | '1080p' | '4k') {
    if (preset === '720p') this.resolution = { width: 1280, height: 720 };
    if (preset === '1080p') this.resolution = { width: 1920, height: 1080 };
    if (preset === '4k') this.resolution = { width: 3840, height: 2160 };
    await this.initCamera();
  }

  capturePhoto() {
    if (!this.videoEl?.nativeElement || !this.canvasEl?.nativeElement) return;
    const video = this.videoEl.nativeElement;
    const canvas = this.canvasEl.nativeElement;

    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply CSS-like filter to canvas context for enhancement
    ctx.filter = this.filterCss;
    ctx.drawImage(video, 0, 0, width, height);

    if (this.sharpenEnabled) {
      // Simple unsharp mask-like pass
      try {
        const img = ctx.getImageData(0, 0, width, height);
        const sharpened = this.applySharpen(img);
        ctx.putImageData(sharpened, 0, 0);
      } catch {}
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      // If slug is present, upload to backend album; otherwise, download locally
      if (this.slug) {
        this.uploadCapturedBlob(blob);
      } else {
        this.downloadBlob(blob, `photo-${Date.now()}.png`);
      }
    }, 'image/png', 0.95);
  }

  startRecording() {
    if (!this.stream) return;
    this.recordedChunks = [];

    const mimeCandidates = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ];

    const mimeType = mimeCandidates.find(type => MediaRecorder.isTypeSupported(type)) || '';
    try {
      this.mediaRecorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
    } catch (e) {
      this.infoMessage = 'Recording not supported by this browser.';
      return;
    }

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) this.recordedChunks.push(e.data);
    };
    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: this.mediaRecorder?.mimeType || 'video/webm' });
      this.downloadBlob(blob, `video-${Date.now()}.webm`);
      this.isRecording = false;
    };
    this.mediaRecorder.start();
    this.isRecording = true;
  }

  stopRecording() {
    this.mediaRecorder?.stop();
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private describeError(err: any): string {
    if (!err) return 'Unknown error';
    const name = err.name || '';
    if (name === 'NotAllowedError') return 'Permission denied. Please allow camera and microphone access.';
    if (name === 'NotFoundError') return 'No suitable camera found.';
    if (name === 'NotReadableError') return 'Camera is in use by another application.';
    return err.message || String(err);
  }

  private applySharpen(img: ImageData): ImageData {
    const w = img.width, h = img.height;
    const src = img.data;
    const dst = new Uint8ClampedArray(src.length);
    // 3x3 sharpen kernel
    const k = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    const stride = 4;
    const index = (x: number, y: number) => (y * w + x) * stride;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let acc = 0;
          let ki = 0;
          for (let j = -1; j <= 1; j++) {
            for (let i = -1; i <= 1; i++) {
              acc += src[index(x + i, y + j) + c] * k[ki++];
            }
          }
          dst[index(x, y) + c] = Math.min(255, Math.max(0, acc));
        }
        // preserve alpha
        dst[index(x, y) + 3] = src[index(x, y) + 3];
      }
    }
    const out = new ImageData(dst, w, h);
    return out;
  }

  ngOnDestroy() {
    this.stopRecording();
    this.stopCamera();
  }

  private uploadCapturedBlob(blob: Blob) {
    if (!this.slug) {
      this.infoMessage = 'Missing album slug; saving photo locally.';
      this.downloadBlob(blob, `photo-${Date.now()}.png`);
      return;
    }

    const file = new File([blob], `photo-${Date.now()}.png`, { type: 'image/png' });
    this.uploading = true;
    this.infoMessage = 'Uploading photo to album...';

    this.eventsApi.uploadMedia(this.slug, [file], 'Guest', 'photo').subscribe({
      next: (res) => {
        this.uploading = false;
        this.infoMessage = res.message || 'Upload successful. Redirecting...';
        // Navigate back to add-to-album page for this slug
        this.router.navigate(['/add-to-album', this.slug]);
      },
      error: (err) => {
        console.error('Upload error:', err);
        this.uploading = false;
        this.infoMessage = 'Failed to upload photo. Please try again.';
      }
    });
  }
}