import { Component } from '@angular/core';

import { Investment, TransactionService } from '../../transaction.service';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { BaseChartDirective } from 'ng2-charts';

import { ChartConfiguration, ChartType } from 'chart.js';
import { MarketService } from '../../services/market.service';
import { STOCKS } from '../../data/assets';
@Component({
  selector: 'app-investments',

  imports: [CommonModule, FormsModule, BaseChartDirective],

  templateUrl: './investments.component.html',

  styleUrl: './investments.component.scss',
})
export class InvestmentsComponent {
  investments: Investment[] = [];

  showModal = false;
  // =====================================
  // PIE CHART
  // =====================================

  pieChartType: 'pie' = 'pie';

  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],

    datasets: [
      {
        data: [],
      },
    ],
  };
  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,

    plugins: {
      legend: {
        position: 'bottom',

        labels: {
          color: '#ffffff',

          padding: 20,

          font: {
            size: 14,
          },
        },
      },
    },
  };
  editMode = false;

  editIndex = -1;

  // FORM

  newInvestment: Investment = {
    type: 'Stock',

    name: '',

    symbol: '',

    quantity: 0,

    investedAmount: 0,

    currentValue: 0,

    avgPrice: 0,

    platform: '',

    notes: '',
  };

  searchResults: any[] = [];

  searchTimeout: any;

  groupedResults: any = {};

  constructor(
    private transactionService: TransactionService,
    private marketService: MarketService,
  ) {}

  ngOnInit() {
    // REACTIVE DATA

    this.transactionService.investments$.subscribe((data) => {
      this.investments = data;

      this.updateChart();
    });

    this.refreshInvestmentPrices();
  }

  addInvestment() {
    if (!this.newInvestment.name || !this.newInvestment.investedAmount) {
      return;
    }

    // =====================================
    // EDIT
    // =====================================

    if (this.editMode) {
      this.investments[this.editIndex] = {
        ...this.newInvestment,
      };

      this.transactionService.saveEditedInvestments(this.investments);
    }

    // =====================================
    // ADD
    // =====================================
    else {
      this.transactionService.addInvestment({
        ...this.newInvestment,
      });
    }

    this.resetForm();
  }

  deleteInvestment(index: number) {
    const confirmed = confirm('Delete investment?');

    if (!confirmed) {
      return;
    }

    this.transactionService.deleteInvestment(index);
  }

  resetForm() {
    this.showModal = false;

    this.editMode = false;

    this.editIndex = -1;

    this.newInvestment = {
      type: 'Stock',

      name: '',

      symbol: '',

      quantity: 0,

      investedAmount: 0,

      currentValue: 0,

      avgPrice: 0,

      platform: '',

      notes: '',
    };
  }

  // TOTAL PORTFOLIO

  getTotalInvested() {
    return this.investments.reduce(
      (sum, inv) => sum + Number(inv.investedAmount),

      0,
    );
  }

  getCurrentValue() {
    return Math.round(
      this.investments.reduce(
        (sum, inv) => sum + Number(inv.currentValue),

        0,
      ),
    );
  }

  getProfitLoss() {
    return Math.round(this.getCurrentValue() - this.getTotalInvested());
  }

  editInvestment(investment: Investment, index: number) {
    this.editMode = true;

    this.editIndex = index;

    this.newInvestment = {
      ...investment,
    };

    this.showModal = true;
  }

  updateChart() {
    const totals: Record<string, number> = {};

    this.investments.forEach((inv) => {
      totals[inv.type] = (totals[inv.type] || 0) + Number(inv.currentValue);
    });

    this.pieChartData = {
      labels: Object.keys(totals),

      datasets: [
        {
          data: Object.values(totals),

          backgroundColor: [
            '#4d7cff',

            '#22c55e',

            '#f59e0b',

            '#ef4444',

            '#a855f7',
          ],

          borderWidth: 0,
        },
      ],
    };
  }
  async refreshInvestmentPrices() {
    for (const inv of this.investments) {
      // NEED SYMBOL

      if (!inv.symbol) {
        continue;
      }

      try {
        const quote = await this.marketService.getQuote(inv.symbol);

        // SAVE LIVE PRICE

        inv.livePrice = quote.price;

        // AUTO CALCULATE

        inv.currentValue = Math.round(
          Number(inv.quantity) * Number(quote.price),
        );
      } catch (error) {
        console.error('Price fetch failed', inv.symbol);
      }
    }

    // REFRESH CHART

    this.updateChart();
  }

  async searchAssets() {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      const query = this.newInvestment.name.toLowerCase().trim();

      if (!query) {
        this.searchResults = [];

        this.groupedResults = {};

        return;
      }

      // FILTER RESULTS

      const filtered = STOCKS.filter(
        (stock) =>
          stock.name.toLowerCase().includes(query) ||
          stock.symbol.toLowerCase().includes(query) ||
          stock.type.toLowerCase().includes(query),
      ).slice(0, 8);

      // SAVE RESULTS

      this.searchResults = filtered;

      // GROUP RESULTS

      this.groupedResults = {
        Stocks: filtered.filter((a) => a.type === 'Stock'),

        ETFs: filtered.filter((a) => a.type === 'ETF'),

        'Mutual Funds': filtered.filter((a) => a.type === 'Mutual Fund'),
      };
    }, 200);
  }
  selectAsset(asset: any) {
    this.newInvestment.name = asset.name;

    this.newInvestment.symbol = asset.symbol;

    this.newInvestment.type = asset.type;

    this.searchResults = [];
  }
}
