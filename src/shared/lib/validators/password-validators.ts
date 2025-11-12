import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecial = /[#?!@$%^&*-]/.test(value);
    const hasMinLength = value.length >= 8;

    const passwordValid =
      hasUpperCase &&
      hasLowerCase &&
      hasNumeric &&
      hasSpecial &&
      hasMinLength;

    return !passwordValid ? { strongPassword: true } : null;
  };
}

export function passwordMatchValidator(passwordField: string = 'password', confirmPasswordField: string = 'confirmPassword'): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordField);
    const confirmPassword = group.get(confirmPasswordField);

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  };
}

export function getPasswordErrorMessage(errors: ValidationErrors | null): string {
  if (!errors) return '';

  if (errors['required']) {
    return 'La contraseña es requerida';
  }

  if (errors['strongPassword']) {
    return 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales';
  }

  return 'Contraseña inválida';
}

export function getConfirmPasswordErrorMessage(errors: ValidationErrors | null, formErrors: ValidationErrors | null): string {
  if (!errors && !formErrors) return '';

  if (errors?.['required']) {
    return 'La confirmación de contraseña es requerida';
  }

  if (formErrors?.['passwordMismatch']) {
    return 'Las contraseñas no coinciden';
  }

  return 'Error en confirmación';
}
