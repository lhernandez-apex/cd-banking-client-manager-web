import { Component, OnInit }    from '@angular/core';
import { CommonModule }         from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientService }        from '../../../core/services/client.service';
import { Client, ACCOUNT_TYPE_LABELS } from '../../../shared/models/client.model';

/**
 * Read-only detail view for a single banking client.
 *
 * Loaded via route param :id from /clients/:id.
 * Provides navigation back to the list or forward to the edit form.
 */
@Component({
  selector:    'app-client-detail',
  standalone:  true,
  imports:     [CommonModule, RouterLink],
  templateUrl: './client-detail.component.html',
  styleUrl:    './client-detail.component.scss'
})
export class ClientDetailComponent implements OnInit {

  /** The fully resolved client record from the API. */
  client: Client | null = null;

  /** True while the API request is in-flight. */
  isLoading = false;

  /** Non-null when the API call fails (404, network error, etc.). */
  errorMessage: string | null = null;

  /** Expose label map so the template can render human-readable account types. */
  readonly accountTypeLabels = ACCOUNT_TYPE_LABELS;

  /** Holds the numeric route id for the Edit navigation link. */
  clientId: number | null = null;

  constructor(
    private readonly route:         ActivatedRoute,
    private readonly router:        Router,
    private readonly clientService: ClientService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.errorMessage = 'No client ID provided in the route.';
      return;
    }
    this.clientId = Number(idParam);
    this.fetchClient(this.clientId);
  }

  /** Navigates the user back to the full client list. */
  onBack(): void {
    this.router.navigate(['/clients']);
  }

  /** Navigates to the edit form for the currently viewed client. */
  onEdit(): void {
    if (this.clientId !== null) {
      this.router.navigate(['/clients', this.clientId, 'edit']);
    }
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private fetchClient(id: number): void {
    this.isLoading    = true;
    this.errorMessage = null;

    this.clientService.getClientById(id).subscribe({
      next:  (data) => { this.client    = data; this.isLoading = false; },
      error: (err)  => {
        this.errorMessage = err?.status === 404
          ? `Client with ID ${id} was not found.`
          : 'Failed to load client details. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
