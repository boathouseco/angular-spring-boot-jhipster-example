import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BoathouseService {
  constructor(private http: HttpClient) {}

  dummylogin(): Observable<Object> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      withCredentials: true, // This is important for keeping session cookies
    };

    return this.http.post('/api/dummylogin', {}, httpOptions);
  }

  getBoathouseResponse(): Observable<BoathouseResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      withCredentials: true, // This is important for keeping session cookies
    };

    return this.http.post<BoathouseResponse>('/api/boathouse', {}, httpOptions);
  }
}

export class BoathouseResponse {
  paddleCustomerID: string | undefined;
  billingPortalUrl: string | undefined;
  pricingTableHtml: string | undefined;
  pricingTableScript: string | undefined;
  activeSubscriptions: any[] | undefined;
}
