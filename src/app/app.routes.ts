import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AccountsComponent } from './pages/accounts/accounts.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { TransfersComponent } from './pages/transfers/transfers.component';
import { GoalsComponent } from './pages/goals/goals.component';
import { RecurringComponent } from './pages/recurring/recurring.component';
import { LentMoneyComponent } from './pages/lent-money/lent-money.component';
import { BudgetsComponent } from './pages/budgets/budgets.component';
import { AuthComponent } from './pages/auth/auth.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },

  {
    path: 'auth',
    component: AuthComponent,
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },

  {
    path: 'transactions',
    component: TransactionsComponent,
    canActivate: [authGuard],
  },

  {
    path: 'analytics',
    component: AnalyticsComponent,
    canActivate: [authGuard],
  },

  {
    path: 'accounts',
    component: AccountsComponent,
    canActivate: [authGuard],
  },

  {
    path: 'transfers',
    component: TransfersComponent,
    canActivate: [authGuard],
  },

  {
    path: 'budgets',
    component: BudgetsComponent,
    canActivate: [authGuard],
  },

  {
    path: 'goals',
    component: GoalsComponent,
    canActivate: [authGuard],
  },

  {
    path: 'recurring',
    component: RecurringComponent,
    canActivate: [authGuard],
  },

  {
    path: 'lent-money',
    component: LentMoneyComponent,
    canActivate: [authGuard],
  },
];
