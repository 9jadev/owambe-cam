import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EventsHttpService, EventItemResponse } from '../services/events-http.service';

@Component({
  standalone: true,
  selector: 'app-album',
  imports: [CommonModule, RouterModule],
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss']
})
export class AlbumComponent {
  private route = inject(ActivatedRoute);
  private eventsApi = inject(EventsHttpService);
  slug = '';
  loading = false;
  event: EventItemResponse | null = null;
  error = '';

  ngOnInit() {
    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    // If the slug could change without recreating the component, subscribe to changes
    this.route.paramMap.subscribe(pm => {
      this.slug = pm.get('slug') || '';
      if (this.slug) this.fetchBySlug(this.slug);
    });
    if (this.slug) this.fetchBySlug(this.slug);
  }

  private fetchBySlug(slug: string) {
    this.loading = true;
    this.error = '';
    this.eventsApi.getEventBySlug(slug).subscribe({
      next: (evt) => {
        this.event = evt;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Unable to load album.';
      }
    });
  }
}