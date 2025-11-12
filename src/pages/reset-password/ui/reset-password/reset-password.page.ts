import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {AuthenticationService} from '../../../../entities';
import {PasswordModule} from 'primeng/password';
import {ButtonModule} from 'primeng/button';
import {firstValueFrom} from 'rxjs';
import {
  getConfirmPasswordErrorMessage,
  getPasswordErrorMessage,
  passwordMatchValidator,
  strongPasswordValidator
} from '../../../../shared/lib/validators/password-validators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    PasswordModule,
    ButtonModule
  ],
  templateUrl: './reset-password.page.html',
  styleUrl: './reset-password.page.css'
})
export class ResetPasswordPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthenticationService);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);

  readonly resetForm: FormGroup = this.fb.group(
    {
      password: ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordMatchValidator() }
  );

  // Computed signals para controles
  readonly passwordControl = computed(() => this.resetForm.get('password')!);
  readonly confirmPasswordControl = computed(() => this.resetForm.get('confirmPassword')!);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    if (!token) {
      this.router.navigate(['/login']).then();
      return;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const token = this.route.snapshot.queryParams['token'];
    const password = this.passwordControl().value;

    this.isLoading.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(this.authService.resetPassword(token, password));
      this.success.set(true);

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } catch (error: any) {
      this.error.set(error.message || 'Error al restablecer la contraseña');
    } finally {
      this.isLoading.set(false);
    }
  }

  getPasswordError(): string {
    return getPasswordErrorMessage(this.passwordControl().errors);
  }

  getConfirmPasswordError(): string {
    return getConfirmPasswordErrorMessage(
      this.confirmPasswordControl().errors,
      this.resetForm.errors
    );
  }
}
