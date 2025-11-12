import {Component} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [],
  templateUrl: './not-found.page.html',
  styleUrl: './not-found.page.css',
})
export class NotFoundPage {
  constructor(private router: Router) {}

  goToDashboard(): void {
    this.router.navigate(['/dashboard']).then();
  }

  goBack(): void {
    window.history.back();
  }
}
