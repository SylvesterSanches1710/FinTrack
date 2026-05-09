import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../transaction.service';

@Component({
  selector: 'app-insights',
  imports: [],
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.scss',
})
export class InsightsComponent implements OnInit {
  totalExpense = 0;
  topCategory = '';
  highestExpense = 0;
  transactionCount = 0;

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.transactionService.transactions$.subscribe((data) => {
      this.calculateInsights(data);
    });
  }

  calculateInsights(transactions: any[]) {
    this.totalExpense = 0;
    this.highestExpense = 0;
    this.transactionCount = transactions.length;

    const categoryMap: any = {};

    transactions.forEach((t) => {
      if (t.type === 'Expense') {
        const amount = Number(t.amount);

        this.totalExpense += amount;

        if (amount > this.highestExpense) {
          this.highestExpense = amount;
        }

        categoryMap[t.category] = (categoryMap[t.category] || 0) + amount;
      }
    });

    // Find top category
    let max = 0;

    for (let category in categoryMap) {
      if (categoryMap[category] > max) {
        max = categoryMap[category];
        this.topCategory = category;
      }
    }
  }
}
