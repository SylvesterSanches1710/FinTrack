import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardComponent } from "./dashboard/dashboard.component";
import { TransactionFormComponent } from "./transaction-form/transaction-form.component";
import { TransactionListComponent } from "./transaction-list/transaction-list.component";
import { ChartsComponent } from './charts/charts.component';
import { InsightsComponent } from './insights/insights.component';
import { AccountManagerComponent } from './account-manager/account-manager.component';
import { TransferComponent } from './transfer/transfer.component';

@Component({
  selector: 'app-root',
  imports: [DashboardComponent, TransactionFormComponent, TransactionListComponent, ChartsComponent,InsightsComponent, AccountManagerComponent, TransferComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'finance-tracker-angular';
}
