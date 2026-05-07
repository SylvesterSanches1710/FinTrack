import { Routes } from "@angular/router";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { AccountsComponent } from "./pages/accounts/accounts.component";
import { AnalyticsComponent } from "./pages/analytics/analytics.component";
import { TransactionsComponent } from "./pages/transactions/transactions.component";
import { TransfersComponent } from "./pages/transfers/transfers.component";
import { GoalsComponent } from "./pages/goals/goals.component";
import { RecurringComponent } from "./pages/recurring/recurring.component";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full",
  },

  {
    path: "dashboard",
    component: DashboardComponent,
  },

  {
    path: "transactions",
    component: TransactionsComponent,
  },

  {
    path: "analytics",
    component: AnalyticsComponent,
  },

  {
    path: "accounts",
    component: AccountsComponent,
  },

  {
    path: "transfers",
    component: TransfersComponent,
  },

  {
    path: "budgets",
    loadComponent: () =>
      import("./pages/budgets/budgets.component").then(
        (m) => m.BudgetsComponent,
      ),
  },

  {
    path: "goals",
    component: GoalsComponent,
  },

  {
    path: "recurring",
    component: RecurringComponent,
  },
];
