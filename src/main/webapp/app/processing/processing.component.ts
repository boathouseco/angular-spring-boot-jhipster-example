import { Component, inject, signal, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  templateUrl: './processing.component.html',
  styleUrl: './processing.component.scss',
  imports: [SharedModule, RouterModule],
})
export default class ProcessingComponent implements OnInit, OnDestroy {
  account = signal<Account | null>(null);
  boathouseResponse: any;
  pids: string[] | null = null;
  private readonly destroy$ = new Subject<void>();

  private boathouseService = inject(BoathouseService);
  private router = inject(Router);

  constructor(
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private sanitizer: DomSanitizer,
  ) {}

  checkBoathouse(): void {
    console.log('Checking Boathouse');
    if (this.pids == null || this.pids.length == 0) {
      console.log('No price_ids passed to page');
      this.router.navigate(['']);
    }

    this.boathouseService.getBoathouseResponse().subscribe({
      next: data => {
        console.log(data);
        if (data == null) {
          console.log('User not logged in (Dummy Login)');
          this.router.navigate(['login']);
        } else {
          if (
            data.activeSubscriptions &&
            data.activeSubscriptions.length > 0 &&
            this.pids?.every(pid => data.activeSubscriptions?.includes(pid))
          ) {
            this.router.navigate(['']);
          } else {
            setTimeout(() => this.checkBoathouse(), 2000);
          }
        }
      },
    });
  }

  ngOnInit(): void {
    // Accessing query parameters
    this.route.queryParamMap.subscribe(params => {
      // params is a map-like object containing all the query parameters
      // You can access individual parameters using their keys
      this.pids = params.get('pids')?.split(',') || null;
    });
    this.checkBoathouse();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
