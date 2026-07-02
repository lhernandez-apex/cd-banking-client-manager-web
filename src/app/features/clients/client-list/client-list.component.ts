import { Component, OnInit }        from '@angular/core';
import { Router, RouterLink }        from '@angular/router';
import { CommonModule }              from '@angular/common';
import { ClientService }             from '../../../core/services/client.service';
import { Client }                    from '../../../shared/models/client.model';
import { ACCOUNT_TYPE_LABELS }       from '../../../shared/models/client.model';

/**
 * Displays all banking clients in a tabular layout.
 *
 * Responsibilities:
 *  - Loads the full client list on initialisation via ClientService.
 *  - Provides navigation to create, view, and edit routes.
 *  - Handles delete with a browser confirmation dialog before calling the API.
 *  - Shows an empty-state message when no clients exist.
 *  - Exposes a loading flag to prevent stale data interactions.
 */
@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-list.component.html',
  styleUrl:    './client-list.component.scss'
})
export class ClientListComponent implements OnInit {

  /** All client records retrieved from the API. */
  clients: Client[] = [];

  /** True while the API call is in-flight. */
  isLoading = false;

  /** Non-null when the last API call produced an error. */
  errorMessage: string | null = null;

  /** Expose label map to the template. */
  readonly accountTypeLabels = ACCOUNT_TYPE_LABELS;

  constructor(
    private readonly clientService: ClientService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  /** Fetches all clients from the backend and populates the table. */
  loadClients(): void {
    this.isLoading    = true;
    this.errorMessage = null;

    this.clientService.getAllClients().subscribe({
      next:  (data) => { this.clients   = data;                          this.isLoading = false; },
      error: ()     => { this.errorMessage = 'Failed to load clients.';  this.isLoading = false; }
    });
  }

  /** Navigates to the create-client form. */
  onNewClient(): void {
    this.router.navigate(['/clients/new']);
  }

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
