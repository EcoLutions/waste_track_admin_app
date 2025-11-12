import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
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
  SetInitialPasswordValidationResponse
} from '../../../../entities/user/api/types/set-initial-password-validation-response.type';

@Component({
  selector: 'app-active-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PasswordModule,
    ButtonModule,
    RouterLink
  ],
  templateUrl: './active-account.page.html',
  styleUrl: './active-account.page.css'
})
export class ActiveAccountPage implements OnInit {
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

  readonly activationForm: FormGroup = this.fb.group(
    {
      password: ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordMatchValidator() }
  );

  readonly passwordControl = computed(() => this.activationForm.get('password')!);
  readonly confirmPasswordControl = computed(() => this.activationForm.get('confirmPassword')!);

  private token = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'];
    if (!this.token) {
      this.router.navigate(['/login']).then();
      return;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.activationForm.invalid) {
      this.activationForm.markAllAsTouched();
      return;
    }

    const password = this.passwordControl().value;

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response: SetInitialPasswordValidationResponse = await firstValueFrom(
        this.authService.setInitialPassword(this.token, password)
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
      this.error.set(error.message || 'Error al activar la cuenta');
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
      this.activationForm.errors
    );
  }
}
