import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { TabTrackingService, TabsResponse, DeviceGroup, TabInfo } from '../../services/tab-tracking.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  tabs$: Observable<TabsResponse | null>;
  userEmail: string = '';

  constructor(
    private supabaseService: SupabaseService,
    private tabTrackingService: TabTrackingService,
    private router: Router
  ) {
    this.tabs$ = this.tabTrackingService.tabs$;
  }

  ngOnInit(): void {
    this.userEmail = this.supabaseService.user?.email ?? '';
    this.tabTrackingService.startTracking();
  }

  ngOnDestroy(): void {
    this.tabTrackingService.stopTracking();
  }

  get currentDeviceId(): string {
    return this.tabTrackingService.currentDeviceId;
  }

  get currentTabId(): string {
    return this.tabTrackingService.currentTabId;
  }

  isCurrentTab(tab: TabInfo): boolean {
    return tab.deviceId === this.currentDeviceId && tab.tabId === this.currentTabId;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      active: 'badge-success',
      idle: 'badge-warning',
      stale: 'badge-neutral'
    };
    return classes[status] || 'badge-neutral';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Active',
      idle: 'Idle',
      stale: 'Stale'
    };
    return labels[status] || status;
  }

  formatLastSeen(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSeconds < 10) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return d.toLocaleTimeString();
  }

  parseUserAgent(ua: string): string {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Browser';
  }

  async signOut(): Promise<void> {
    await this.supabaseService.signOut();
    this.router.navigate(['/login']);
  }

  trackByDevice(_: number, device: DeviceGroup): string {
    return device.deviceId;
  }

  trackByTab(_: number, tab: TabInfo): string {
    return `${tab.deviceId}-${tab.tabId}`;
  }
}
