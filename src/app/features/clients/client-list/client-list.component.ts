import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink }                          from '@angular/router';
import { CommonModule }                                from '@angular/common';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort }             from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator }   from '@angular/material/paginator';
import { MatCardModule }                      from '@angular/material/card';
import { MatButtonModule }                    from '@angular/material/button';
import { MatIconModule }                      from '@angular/material/icon';
import { MatInputModule }                     from '@angular/material/input';
import { MatFormFieldModule }                 from '@angular/material/form-field';
import { MatProgressSpinnerModule }           from '@angular/material/progress-spinner';
import { MatTooltipModule }                   from '@angular/material/tooltip';
import { MatDividerModule }                   from '@angular/material/divider';

import { ClientService }               from '../../../core/services/client.service';
import { Client, ACCOUNT_TYPE_LABELS, AccountType } from '../../../shared/models/client.model';

/**
 * Dashboard-style client list using Angular Material.
 *
 * Responsibilities:
 *  - Summary stat cards (Total / Savings / Checking / Balance)
 *  - Live search filtering by name or email
 *  - MatTable with server-side sorting and client-side pagination
 *  - Delete confirmation via window.confirm then API call + refresh
 *  - Loading spinner and error banner states
 *
 * Public API (clients, isLoading, errorMessage, loadClients, onDelete)
 * is preserved for full backward-compat with the existing test suite.
 */
@Component({
  selector:    'app-client-list',
  standalone:  true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './client-list.component.html',
  styleUrl:    './client-list.component.scss'
})
export class ClientListComponent implements OnInit, AfterViewInit {

  // ── Original public API — preserved for test compatibility ────────────────

  /** All client records retrieved from the API. */
  clients: Client[] = [];

  /** True while the API call is in-flight. */
  isLoading = false;

  /** Non-null when the last API call produced an error. */
  errorMessage: string | null = null;

  /** Expose label map to the template. */
  readonly accountTypeLabels = ACCOUNT_TYPE_LABELS;

  // ── Material table ─────────────────────────────────────────────────────────

  /** MatTableDataSource wraps the client array for sort/pagination/filter. */
  dataSource = new MatTableDataSource<Client>([]);

  /** Columns rendered left-to-right in the table. */
  displayedColumns: string[] = ['id', 'name', 'email', 'accountType', 'balance', 'actions'];

  @ViewChild(MatSort)      sort!:      MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private readonly clientService: ClientService,
    private readonly router:        Router
  ) {}

  ngOnInit(): void {
    // Restrict search to name + email fields only
    this.dataSource.filterPredicate = (client: Client, filter: string): boolean => {
      const term = filter.toLowerCase();
      return client.name.toLowerCase().includes(term)
          || client.email.toLowerCase().includes(term);
    };
    this.loadClients();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort      = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  // ── Computed summary stats ─────────────────────────────────────────────────

  get totalClients():  number { return this.clients.length; }
  get savingsCount():  number { return this.clients.filter(c => c.accountType === 'SAVINGS').length; }
  get checkingCount(): number { return this.clients.filter(c => c.accountType === 'CHECKING').length; }
  get totalBalance():  number { return this.clients.reduce((sum, c) => sum + c.balance, 0); }

  // ── Data loading ───────────────────────────────────────────────────────────

  /** Fetches all clients from the backend and populates the table. */
  loadClients(): void {
    this.isLoading    = true;
    this.errorMessage = null;

    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients        = data;
        this.dataSource.data = data;
        this.isLoading      = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load clients.';
        this.isLoading    = false;
      }
    });
  }

  // ── Search ─────────────────────────────────────────────────────────────────

  /** Applies the search term to the data source and resets to page 1. */
  applySearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  /** Returns the display label for an account type string from a mat-cell context. */
  accountTypeLabel(type: string): string {
    return ACCOUNT_TYPE_LABELS[type as AccountType] ?? type;
  }

  /** Navigates to the create-client form. */
  onNewClient(): void {
    this.router.navigate(['/clients/new']);
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  /**
   * Prompts for confirmation then deletes the client and refreshes the list.
   *
   * @param id   the id of the client to delete
   * @param name the display name used in the confirmation message
   */
  onDelete(id: number, name: string): void {
    if (!confirm(`Delete client "${name}"? This action cannot be undone.`)) {
      return;
    }

    this.clientService.deleteClient(id).subscribe({
      next:  () => this.loadClients(),
      error: () => { this.errorMessage = `Failed to delete client "${name}".`; }
    });
  }
}
