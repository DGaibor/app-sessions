import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SupabaseService } from './supabase.service';
import { TabInfo, TabsResponse, UpsertTabRequest } from '../interfaces/tab.interface';

export type { TabInfo, DeviceGroup, TabsResponse, UpsertTabRequest } from '../interfaces/tab.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private supabaseService: SupabaseService
  ) {}

  async getTabs(): Promise<Observable<TabsResponse>> {
    const headers = await this.getHeaders();
    return this.http.get<TabsResponse>(`${this.baseUrl}/tabs`, { headers });
  }

  async upsertTab(request: UpsertTabRequest): Promise<Observable<TabInfo>> {
    const headers = await this.getHeaders();
    return this.http.post<TabInfo>(`${this.baseUrl}/tabs`, request, { headers });
  }

  private async getHeaders(): Promise<HttpHeaders> {
    const user = this.supabaseService.user;
    const token = await this.supabaseService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-User-Id': user?.id ?? '',
      'Authorization': `Bearer ${token ?? ''}`
    });
  }
}
