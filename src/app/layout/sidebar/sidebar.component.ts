import { Component, EventEmitter, HostListener, Output } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Output()
  closeMenu = new EventEmitter<void>();

  isMobile = false;

  constructor(
    public authService: AuthService,

    private router: Router,
  ) {}

  ngOnInit() {
    this.checkScreen();
  }

  @HostListener('window:resize')
  checkScreen() {
    this.isMobile = window.innerWidth <= 900;
  }

  closeSidebar() {
    this.closeMenu.emit();
  }

  navigateAndClose() {
    if (this.isMobile) {
      this.closeMenu.emit();
    }
  }
  async logout() {
    await this.authService.logout();

    this.router.navigate(['/auth']);
  }
}
