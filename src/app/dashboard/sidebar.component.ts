import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-dashboard-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class DashboardSidebarComponent {
  @Input() collapsed = false;
  @Input() user: { email: string; name?: string } | null = null;
  @Input() currentEventName: string | null = null;
  @Input() hasEvents = false;
}