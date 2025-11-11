import {Component, inject, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {Password} from 'primeng/password';
import {MessageModule} from 'primeng/message';
import {AuthStore} from '../../../../shared';
import {Router} from '@angular/router';
import {SignInCredentials} from '../../../../entities';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    InputText,
    Password,
    MessageModule
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css'
})
export class LoginPage implements OnInit{
  readonly authStore = inject(AuthStore);
  private router = inject(Router);

  credentials: SignInCredentials = {
    email: '',
    password: '',
  };

  ngOnInit() {
    if (this.authStore.isAuthenticated()) {
      this.router.navigate(['/dashboard']).then(() => {});
    }
  }

  onSignIn() {
    if (this.credentials.email && this.credentials.password) {
      this.authStore.signIn(this.credentials);
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSignIn();
    }
  }

  get isFormValid(): boolean {
    return !!(this.credentials.email && this.credentials.password);
  }
}
