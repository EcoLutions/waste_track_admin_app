import {Component, inject} from '@angular/core';
import {AuthStore} from '../../../../../shared';
import {Router} from '@angular/router';
import {SignInCredentials} from '../../../../../entities';
import {FormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {Password} from 'primeng/password';
import {MessageModule} from 'primeng/message';

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
export class LoginPage {
  readonly authStore = inject(AuthStore);
  private router = inject(Router);

  credentials: SignInCredentials = {
    username: '',
    password: ''
  };

  ngOnInit() {
    if (this.authStore.isAuthenticated()) {
      this.router.navigate(['/dashboard']).then(() => {});
    }
  }

  onSignIn() {
    if (this.credentials.username && this.credentials.password) {
      this.authStore.signIn(this.credentials);
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSignIn();
    }
  }

  get isFormValid(): boolean {
    return !!(this.credentials.username && this.credentials.password);
  }
}
