import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TransactionService } from './transaction.service';
import { AuthService } from './auth/auth.service';

import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  showNameModal = false;

  displayName = '';

  hideLayout = false;

  showOnboarding = false;

  appReady = false;

  accountName = '';

  accountBalance = 0;

  title = 'finance-tracker-angular';

  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  banks = [
    'HDFC Bank',

    'ICICI Bank',

    'Canara Bank',

    'SBI',

    'Axis Bank',

    'Kotak Mahindra',

    'Bank of Baroda',

    'Cash Wallet',
  ];

  selectInput(event: any) {
    event.target.select();
  }

  constructor(
    private transactionService: TransactionService,

    public authService: AuthService,

    private router: Router,
  ) {
    // ROUTE CHANGES

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.hideLayout = event.urlAfterRedirects === '/auth';
      }
    });
  }

  async ngOnInit() {
    this.authService.user$.subscribe(async (user) => {
      // WAIT UNTIL
      // FIREBASE FINISHES CHECKING

      if (!this.authService.authReady) {
        return;
      }

      // NOT LOGGED IN

      if (!user) {
        this.appReady = true;

        this.router.navigate(['/auth']);

        return;
      }

      // RESTORE CLOUD DATA

      await this.transactionService.restoreFromCloud();
      this.transactionService.startRealtimeSync();

      // CHECK DISPLAY NAME

      const savedName = localStorage.getItem('displayName');

      if (!savedName) {
        this.showNameModal = true;
      }

      // CHECK ACCOUNTS

      const accounts = this.transactionService.getAccounts();

      this.showOnboarding = accounts.length === 0;

      // SETUP COMPLETE

      if (!this.showOnboarding && !this.showNameModal) {
        this.router.navigate(['/dashboard']);
      }

      // APP READY

      this.appReady = true;
    });
  }

  createFirstAccount() {
    if (!this.accountName || this.accountBalance < 0) {
      return;
    }

    this.transactionService.addAccount({
      name: this.accountName,

      balance: this.accountBalance,

      color: 'blue',
    });

    this.showOnboarding = false;
  }

  saveDisplayName() {
    if (!this.displayName.trim()) {
      return;
    }

    localStorage.setItem('displayName', this.displayName);

    this.showNameModal = false;

    const accounts = this.transactionService.getAccounts();

    this.showOnboarding = accounts.length === 0;

    if (!this.showOnboarding) {
      this.router.navigate(['/dashboard']);
    }
  }
}
