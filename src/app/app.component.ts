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
  hideLayout = false;
  showOnboarding = false;

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

    private authService: AuthService,

    private router: Router,
  ) {
    // ROUTE CHANGES

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.hideLayout = event.urlAfterRedirects === '/auth';
      }
    });
  }

  ngOnInit() {
    this.authService.user$.subscribe(async (user) => {
      // NOT LOGGED IN

      if (!user) {
        this.router.navigate(['/auth']);

        return;
      }

      // RESTORE CLOUD DATA

      await this.transactionService.restoreFromCloud();

      // CHECK ACCOUNTS

      const accounts = this.transactionService.getAccounts();

      this.showOnboarding = accounts.length === 0;

      // IF SETUP COMPLETE

      if (!this.showOnboarding) {
        this.router.navigate(['/dashboard']);
      }
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
}
