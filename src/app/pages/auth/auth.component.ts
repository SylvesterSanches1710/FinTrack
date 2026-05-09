import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-auth',

  imports: [CommonModule, FormsModule],

  templateUrl: './auth.component.html',

  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  email = '';

  password = '';

  isLogin = true;

  loading = false;

  error = '';

  constructor(
    private authService: AuthService,

    private router: Router,
  ) {}

  async submitAuth() {
    this.error = '';

    this.loading = true;

    try {
      if (this.isLogin) {
        await this.authService.login(this.email, this.password);
      } else {
        await this.authService.signup(this.email, this.password);
      }

      // REDIRECT

      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }
}
