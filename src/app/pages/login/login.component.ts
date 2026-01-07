import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  isSignUp = false;
  loading = false;
  error = '';
  success = '';

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async submit(): Promise<void> {
    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      const { error } = this.isSignUp
        ? await this.supabaseService.signUp(this.email, this.password)
        : await this.supabaseService.signIn(this.email, this.password);

      if (error) {
        this.error = error.message;
      } else {
        if (this.isSignUp) {
          this.success = 'Account created successfully! Please sign in.';
          this.isSignUp = false;
          this.password = '';
        } else {
          this.router.navigate(['/app']);
        }
      }
    } catch (e: any) {
      this.error = e.message || 'An error occurred';
    } finally {
      this.loading = false;
    }
  }

  toggleMode(): void {
    this.isSignUp = !this.isSignUp;
    this.error = '';
  }
}
