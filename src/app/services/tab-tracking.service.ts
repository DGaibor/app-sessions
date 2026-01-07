import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, interval } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { ApiService } from './api.service';
import { TabsResponse } from '../interfaces/tab.interface';

export type { TabsResponse, TabInfo, DeviceGroup } from '../interfaces/tab.interface';

@Injectable({
  providedIn: 'root'
})
export class TabTrackingService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private tabsSubject = new BehaviorSubject<TabsResponse | null>(null);
  private isActiveSubject = new BehaviorSubject<boolean>(true);

  private readonly HEARTBEAT_INTERVAL_ACTIVE = 10000;
  private readonly HEARTBEAT_INTERVAL_BACKGROUND = 30000;
  private readonly DEVICE_ID_KEY = 'device_id';
  private readonly TAB_ID_KEY = 'tab_id';

  tabs$: Observable<TabsResponse | null> = this.tabsSubject.asObservable();

  private deviceId: string;
  private tabId: string;

  constructor(
    private apiService: ApiService,
    private supabaseService: SupabaseService
  ) {
    this.deviceId = this.getOrCreateDeviceId();
    this.tabId = this.getOrCreateTabId();
    this.setupVisibilityListener();
  }

  get currentDeviceId(): string {
    return this.deviceId;
  }

  get currentTabId(): string {
    return this.tabId;
  }

  get isActive(): boolean {
    return this.isActiveSubject.value;
  }

  startTracking(): void {
    this.sendHeartbeat();
    this.fetchTabs();

    interval(this.HEARTBEAT_INTERVAL_ACTIVE)
      .pipe(
        takeUntil(this.destroy$),
        filter(() => this.isActiveSubject.value)
      )
      .subscribe(() => {
        this.sendHeartbeat();
        this.fetchTabs();
      });

    interval(this.HEARTBEAT_INTERVAL_BACKGROUND)
      .pipe(
        takeUntil(this.destroy$),
        filter(() => !this.isActiveSubject.value)
      )
      .subscribe(() => {
        this.sendHeartbeat();
        this.fetchTabs();
      });
  }

  stopTracking(): void {
    this.destroy$.next();
  }

  async sendHeartbeat(): Promise<void> {
    const user = this.supabaseService.user;
    if (!user) return;

    const request = {
      deviceId: this.deviceId,
      tabId: this.tabId,
      userAgent: navigator.userAgent,
      isActive: this.isActiveSubject.value
    };

    (await this.apiService.upsertTab(request)).subscribe({
      error: (err: Error) => console.error('Heartbeat failed:', err)
    });
  }

  async fetchTabs(): Promise<void> {
    const user = this.supabaseService.user;
    if (!user) return;

    (await this.apiService.getTabs()).subscribe({
      next: (response: TabsResponse) => this.tabsSubject.next(response),
      error: (err: Error) => console.error('Fetch tabs failed:', err)
    });
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = this.generateUUID();
      localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }

  private getOrCreateTabId(): string {
    let tabId = sessionStorage.getItem(this.TAB_ID_KEY);
    if (!tabId) {
      tabId = this.generateUUID();
      sessionStorage.setItem(this.TAB_ID_KEY, tabId);
    }
    return tabId;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private setupVisibilityListener(): void {
    document.addEventListener('visibilitychange', () => {
      this.isActiveSubject.next(document.visibilityState === 'visible');
      if (document.visibilityState === 'visible') {
        this.sendHeartbeat();
        this.fetchTabs();
      }
    });

    window.addEventListener('focus', () => {
      this.isActiveSubject.next(true);
      this.sendHeartbeat();
    });

    window.addEventListener('blur', () => {
      this.isActiveSubject.next(false);
      this.sendHeartbeat();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
