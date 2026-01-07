import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable, filter, take } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private userSubject = new BehaviorSubject<User | null>(null);
  private initializedSubject = new BehaviorSubject<boolean>(false);

  user$: Observable<User | null> = this.userSubject.asObservable();
  initialized$: Observable<boolean> = this.initializedSubject.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.supabase.auth.onAuthStateChange((_, session) => {
      this.userSubject.next(session?.user ?? null);
    });
    this.loadUser();
  }

  private async loadUser(): Promise<void> {
    const { data } = await this.supabase.auth.getSession();
    this.userSubject.next(data.session?.user ?? null);
    this.initializedSubject.next(true);
  }

  waitForInit(): Observable<boolean> {
    return this.initialized$.pipe(filter(init => init), take(1));
  }

  get user(): User | null {
    return this.userSubject.value;
  }

  async signUp(email: string, password: string): Promise<{ error: Error | null }> {
    const { error } = await this.supabase.auth.signUp({ email, password });
    return { error };
  }

  async signIn(email: string, password: string): Promise<{ error: Error | null }> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  async getAccessToken(): Promise<string | null> {
    const { data } = await this.supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }
}
