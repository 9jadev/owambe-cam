import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private active = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  start(): void {
    this.active++;
    if (this.active === 1) {
      document.body.classList.add('http-loading');
      this.loadingSubject.next(true);
    }
  }

  stop(): void {
    if (this.active > 0) this.active--;
    if (this.active === 0) {
      document.body.classList.remove('http-loading');
      this.loadingSubject.next(false);
    }
  }
}