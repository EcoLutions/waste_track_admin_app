import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {PasswordModule} from 'primeng/password';
import {ButtonModule} from 'primeng/button';
import {firstValueFrom} from 'rxjs';
import {
  getConfirmPasswordErrorMessage,
  getPasswordErrorMessage,
  passwordMatchValidator,
  strongPasswordValidator
} from '../../../../shared/lib/validators/password-validators';
import {AuthRedirectService} from '../../../../shared/services/auth-redirect.service';
import {AuthenticationService} from '../../../../entities';
import {
  ResetPasswordValidationResponse
} from '../../../../entities/user/api/types/reset-password-validation-response.type';

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
  private readonly redirectService = inject(AuthRedirectService);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);
  readonly countdown = signal(3);
  readonly redirectMessage = signal('');
  readonly showMobileWarning = signal(false);
  readonly appDownloadInfo = signal<{ appName: string; iosUrl: string; androidUrl: string } | null>(null);

  readonly resetForm: FormGroup = this.fb.group(
    {
      password: ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordMatchValidator() }
  );

  readonly passwordControl = computed(() => this.resetForm.get('password')!);
  readonly confirmPasswordControl = computed(() => this.resetForm.get('confirmPassword')!);

  private token = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'];
    if (!this.token) {
      this.router.navigate(['/login']).then();
      return;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const password = this.passwordControl().value;

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response: ResetPasswordValidationResponse = await firstValueFrom(
        this.authService.resetPassword(this.token, password)
      );

      this.success.set(true);

      const strategy = this.redirectService.getRedirectStrategy(response.roles);

      if (!strategy.shouldRedirect) {
        this.showMobileWarning.set(true);
        this.redirectMessage.set(strategy.message);
        this.appDownloadInfo.set(
          this.redirectService.getAppDownloadInfo(response.roles[0])
        );
      } else {
        this.redirectMessage.set(strategy.message);
        this.startCountdown();
        await this.redirectService.executeRedirect(strategy.url!, 3000);
      }

    } catch (error: any) {
      this.error.set(error.message || 'Error al restablecer la contraseña');
    } finally {
      this.isLoading.set(false);
    }
  }

  private startCountdown(): void {
    const interval = setInterval(() => {
      const current = this.countdown();
      if (current > 1) {
        this.countdown.set(current - 1);
      } else {
        clearInterval(interval);
      }
    }, 1000);
  }

  goToLogin(): void {
    this.router.navigate(['/login']).then();
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
