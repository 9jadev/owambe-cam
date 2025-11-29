import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private active = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  start(): void {
    this.active++;
    if (this.active === 1) {
      if (this.isBrowser) {
        document.body.classList.add('http-loading');
      }
      this.loadingSubject.next(true);
    }
  }

  stop(): void {
    if (this.active > 0) this.active--;
    if (this.active === 0) {
      if (this.isBrowser) {
        document.body.classList.remove('http-loading');
      }
      this.loadingSubject.next(false);
    }
  }
}
