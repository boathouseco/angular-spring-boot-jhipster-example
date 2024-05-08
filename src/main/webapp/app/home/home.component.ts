import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  standalone: true,
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [SharedModule, RouterModule],
})
export default class HomeComponent implements OnInit, OnDestroy {
  account = signal<Account | null>(null);
  pricingTableUrl: SafeResourceUrl | null = null;

  private readonly destroy$ = new Subject<void>();

  private accountService = inject(AccountService);
  private router = inject(Router);

  constructor(private sanitizer: DomSanitizer) {
    this.pricingTableUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://my.boathouse.pro/api/v1/pricingtableiframe?p=7844a538-d99e-4dee-b296-08dc57f5b69a&l=${encodeURIComponent(`${window.location.protocol}//${window.location.host}/login`)}&s=https%3A%2F%2Fmy.boathouse.pro%2Fcss%2Fpricing-table-default.css`,
    );
  }

  ngOnInit(): void {
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => this.account.set(account));
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
