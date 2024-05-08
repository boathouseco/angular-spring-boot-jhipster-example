import { Component, inject, signal, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BoathouseService } from 'app/core/boathouse/boathouse.service';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  standalone: true,
  selector: 'jhi-home',
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss',
  imports: [SharedModule, RouterModule],
})
export default class SubscriptionComponent implements OnInit, OnDestroy {
  account = signal<Account | null>(null);
  boathouseResponse: any;

  private readonly destroy$ = new Subject<void>();

  private boathouseService = inject(BoathouseService);
  private router = inject(Router);

  constructor(
    private renderer: Renderer2,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.boathouseService.getBoathouseResponse().subscribe({
      next: data => {
        console.log(data);
        if (data == null) {
          console.log('User not logged in (Dummy Login)');
          this.router.navigate(['login']);
        } else {
          this.boathouseResponse = data;
          this.loadScripts();
        }
      },
    });
  }

  loadScripts(): void {
    const paddleScript = this.renderer.createElement('script');
    paddleScript.onload = () => {
      (window as any).Paddle.Environment.set('sandbox');
      (window as any).Paddle.Initialize({
        token: 'test_ad79b30a7bab65b54ee5213f2b5',
        eventCallback: (e: any) => {
          if (e.name == 'checkout.completed') {
            location.href = '/processing?pids=' + e.data.items.map((x: any) => x.price_id).join(',');
          }
        },
      });

      const boathouseScript = this.renderer.createElement('script');
      boathouseScript.src = this.boathouseResponse.pricingTableScript;
      this.renderer.appendChild(document.body, boathouseScript);
    };
    paddleScript.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    this.renderer.appendChild(document.body, paddleScript);
  }

  get boathousePortalUrl(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.boathouseResponse?.billingPortalUrl!);
  }

  get hasActiveSubscription(): boolean {
    return (
      this.boathouseResponse != null && this.boathouseResponse.activeSubscriptions && this.boathouseResponse.activeSubscriptions.length > 0
    );
  }

  get hasBoathouseHtml(): boolean {
    return this.boathouseResponse != null && this.boathouseResponse.pricingTableHtml != null;
  }

  get boathouseHtml(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.boathouseResponse?.pricingTableHtml);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
