import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {AuthStore} from '../../../../shared';
import {Router} from '@angular/router';
import {AuthenticationService, SignInCredentials} from '../../../../entities';
import {firstValueFrom} from 'rxjs';
import {Password} from 'primeng/password';
import {PrimeTemplate} from 'primeng/api';
import {InputText} from 'primeng/inputtext';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, Password, PrimeTemplate, InputText],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css'
})
export class LoginPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthenticationService);

  readonly authStore = inject(AuthStore);
  readonly showForgot = signal(false);
  readonly forgotLoading = signal(false);
  readonly forgotError = signal<string | null>(null);
  readonly forgotSuccess = signal<string | null>(null);

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(3)]]
  });

  readonly forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  readonly emailControl = computed(() => this.loginForm.get('email')!);
  readonly passwordControl = computed(() => this.loginForm.get('password')!);
  readonly forgotEmailControl = computed(() => this.forgotForm.get('email')!);

  constructor() {
    effect(() => {
      if (this.loginForm.valueChanges) {
        this.authStore.clearError();
      }
    });
  }

  ngOnInit(): void {
    if (this.authStore.isAuthenticated()) {
      this.router.navigate(['/dashboard']).then();
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials: SignInCredentials = {
      email: this.emailControl().value.trim(),
      password: this.passwordControl().value
    };

    this.authStore.signIn(credentials);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.loginForm.valid) {
      this.onSubmit();
    }
  }

  clearError(): void {
    this.authStore.clearError();
  }

  // Forgot Password
  openForgot(): void {
    this.forgotError.set(null);
    this.forgotSuccess.set(null);
    this.forgotForm.reset();
    this.showForgot.set(true);
  }

  closeForgot(): void {
    this.showForgot.set(false);
    this.forgotForm.reset();
    this.forgotError.set(null);
    this.forgotSuccess.set(null);
  }

  async submitForgot(): Promise<void> {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    const email = this.forgotEmailControl().value.trim();

    try {
      this.forgotLoading.set(true);
      this.forgotError.set(null);
      this.forgotSuccess.set(null);

      await firstValueFrom(this.authService.forgotPassword(email));

      this.forgotSuccess.set(
        'Si existe una cuenta con ese email, recibirás instrucciones para restablecer tu contraseña.'
      );
      this.forgotLoading.set(false);

      // Autocerrar después de 3 segundos
      setTimeout(() => {
        this.closeForgot();
      }, 3000);
    } catch (error: any) {
      this.forgotLoading.set(false);
      this.forgotError.set(
        error?.message || 'Error al solicitar restablecimiento de contraseña'
      );
    }
  }
}
