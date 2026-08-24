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
  nombres = '';
  apellidos = '';
  isRegisterMode = false;
  errorMessage = '';
  successMessage = '';
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

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
    this.successMessage = '';
    this.email = '';
    this.password = '';
    this.nombres = '';
    this.apellidos = '';
  }

  async onSubmit() {
    if (this.isRegisterMode) {
      if (!this.email || !this.password || !this.nombres) {
        this.errorMessage = 'Por favor, complete todos los campos obligatorios.';
        return;
      }
    } else {
      if (!this.email || !this.password) {
        this.errorMessage = 'Por favor, complete todos los campos.';
        return;
      }
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      if (this.isRegisterMode) {
        const { data, error } = await this.supabaseService.signUp(
          this.email,
          this.password,
          this.nombres,
          this.apellidos
        );
        if (error) {
          this.errorMessage = error.message;
        } else if (data.user) {
          // Si el usuario requiere confirmación de email
          if (data.session) {
            // Autologin directo si confirmación está desactivada
            this.router.navigate(['/dashboard']);
          } else {
            this.successMessage = '¡Registro exitoso! Revisa tu correo para confirmar la cuenta o inicia sesión.';
            this.isRegisterMode = false;
            this.password = '';
          }
        }
      } else {
        const { data, error } = await this.supabaseService.signIn(this.email, this.password);
        if (error) {
          this.errorMessage = error.message === 'Invalid login credentials' 
            ? 'Email o contraseña incorrectos.' 
            : error.message;
        } else if (data.user) {
          this.router.navigate(['/dashboard']);
        }
      }
    } catch (err: any) {
      console.error(err);
      this.errorMessage = 'Ocurrió un error. Por favor, intente nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }
}
