import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    const session = await this.supabaseService.getSession();
    if (session) {
      this.router.navigate(['/dashboard']);
    }
  }

  async onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, complete todos los campos.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const { data, error } = await this.supabaseService.signIn(this.email, this.password);
      if (error) {
        this.errorMessage = error.message === 'Invalid login credentials' 
          ? 'Email o contraseña incorrectos.' 
          : error.message;
      } else if (data.user) {
        this.router.navigate(['/dashboard']);
      }
    } catch (err: any) {
      console.error(err);
      this.errorMessage = 'Ocurrió un error. Por favor, intente nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }
}
