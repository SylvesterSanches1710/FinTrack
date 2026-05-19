import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarketService {
  private apiKey = 'NS5BG34109OWTQ8Y';

  constructor(private http: HttpClient) {}

  async getQuote(symbol: string): Promise<any> {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`;

    const response: any = await firstValueFrom(this.http.get(url));

    const quote = response['Global Quote'];

    return {
      price: Number(quote['05. price']),

      previousClose: Number(quote['08. previous close']),

      change: Number(quote['09. change']),
    };
  }

  async searchAssets(keyword: string): Promise<any[]> {
    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keyword}&apikey=${this.apiKey}`;

    const response: any = await firstValueFrom(this.http.get(url));

    return (response.bestMatches || []).filter((asset: any) =>
      asset['1. symbol'].includes('.NS'),
    );
  }
}
