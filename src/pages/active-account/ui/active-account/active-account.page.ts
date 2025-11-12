import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
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

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);

  readonly activationForm: FormGroup = this.fb.group(
    {
      password: ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordMatchValidator() }
  );

  // Computed signals para controles
  readonly passwordControl = computed(() => this.activationForm.get('password')!);
  readonly confirmPasswordControl = computed(() => this.activationForm.get('confirmPassword')!);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.activationForm.invalid) {
      this.activationForm.markAllAsTouched();
      return;
    }

    const token = this.route.snapshot.queryParams['token'];
    const password = this.passwordControl().value;

    this.isLoading.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(this.authService.setInitialPassword(token, password));
      this.success.set(true);

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } catch (error: any) {
      this.error.set(error.message || 'Error al activar la cuenta');
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
      this.activationForm.errors
    );
  }
}
