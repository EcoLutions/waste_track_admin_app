import {Component, inject, input, output} from '@angular/core';
import {Router} from '@angular/router';

interface UserInfo {
  name: string;
  initials: string;
  role: string;
  avatar?: string;
}

@Component({
  selector: 'app-header',
  imports: [],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private router = inject(Router);

  // Inputs
  userInfo = input.required<UserInfo>();

  // Outputs
  toggleSidebar = output<void>();
  logout = output<void>();

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }

  goToProfile(): void {
    this.router.navigate(['/settings/profile']);
  }
}
