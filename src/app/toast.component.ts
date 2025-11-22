import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from './services/toast.service';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnDestroy {
  toasts: ToastMessage[] = [];
  private sub: Subscription;

  constructor(private toast: ToastService) {
    this.sub = this.toast.messages$.subscribe((msg) => {
      this.toasts.push(msg);
      timer(3500).subscribe(() => this.dismiss(msg.id));
    });
  }

  dismiss(id: number) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}