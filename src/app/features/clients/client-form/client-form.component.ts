import { Component, OnInit }          from '@angular/core';
import { CommonModule }                from '@angular/common';
import { ActivatedRoute, Router }      from '@angular/router';
import {
  FormBuilder, FormGroup,
  ReactiveFormsModule, Validators
}                                      from '@angular/forms';
import { ClientService }               from '../../../core/services/client.service';
import { AccountType, ACCOUNT_TYPE_LABELS } from '../../../shared/models/client.model';

/**
 * Dual-mode form component for creating and editing banking clients.
 *
 * Mode is determined at runtime by the presence of a numeric route param:
 *  - No param   → create mode  (/clients/new)
 *  - id present → edit mode    (/clients/:id/edit)
 *
 * On successful submission the user is redirected to the client list.
 */
@Component({
  selector:    'app-client-form',
  standalone:  true,
  imports:     [CommonModule, ReactiveFormsModule],
  templateUrl: './client-form.component.html',
  styleUrl:    './client-form.component.scss'
})
export class ClientFormComponent implements OnInit {

  /** Reactive form group containing all client fields. */
  clientForm!: FormGroup;

  /** Populated with the route id param when in edit mode, null otherwise. */
  editClientId: number | null = null;

  /** True while an API call is in-flight (disables the submit button). */
  isSubmitting = false;

  /** Non-null when the API returns an error after submit. */
  errorMessage: string | null = null;

  /** Expose account type options to the template select element. */
  readonly accountTypeOptions: AccountType[] = ['SAVINGS', 'CHECKING'];
  readonly accountTypeLabels = ACCOUNT_TYPE_LABELS;

  constructor(
    private readonly fb:            FormBuilder,
    private readonly route:         ActivatedRoute,
    private readonly router:        Router,
    private readonly clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.buildForm();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editClientId = Number(idParam);
      this.loadClientForEdit(this.editClientId);
    }
  }

  /** True when the form is in edit mode (an id was found in the route). */
  get isEditMode(): boolean {
    return this.editClientId !== null;
  }

  /** Page title derived from the current mode. */
  get pageTitle(): string {
    return this.isEditMode ? 'Edit Client' : 'New Client';
  }

  /** Returns a specific form control for use in the template. */
  field(name: string) {
    return this.clientForm.get(name);
  }

  /** True when a field has been touched and has a validation error. */
  fieldInvalid(name: string): boolean {
    const ctrl = this.field(name);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private buildForm(): void {
    this.clientForm = this.fb.group({
      name: [
        '',
        [Validators.required, Validators.maxLength(100)]
      ],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(150)]
      ],
      accountType: [
        null,
        [Validators.required]
      ],
      balance: [
        0,
        [Validators.required, Validators.min(0)]
      ]
    });
  }

  private loadClientForEdit(id: number): void {
    this.clientService.getClientById(id).subscribe({
      next:  (client) => this.clientForm.patchValue(client),
      error: ()       => { this.errorMessage = 'Could not load client data.'; }
    });
  }

  // ── Public form actions ────────────────────────────────────────────────────

  /** Marks all fields as touched to surface validation errors, then submits. */
  onSubmit(): void {
    this.clientForm.markAllAsTouched();
    if (this.clientForm.invalid) { return; }

    this.isSubmitting = true;
    this.errorMessage = null;
    const payload = this.clientForm.value;

    const request$ = this.isEditMode
      ? this.clientService.updateClient(this.editClientId!, payload)
      : this.clientService.createClient(payload);

    request$.subscribe({
      next:  () => this.router.navigate(['/clients']),
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'An error occurred. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  /** Navigates back to the client list without saving. */
  onCancel(): void {
    this.router.navigate(['/clients']);
  }
}
