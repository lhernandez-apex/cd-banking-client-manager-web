import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter }             from '@angular/router';
import { of, throwError }            from 'rxjs';
import { ClientListComponent }       from './client-list.component';
import { ClientService }             from '../../../core/services/client.service';
import { Client, AccountType }       from '../../../shared/models/client.model';
import { routes }                    from '../../../app.routes';

describe('ClientListComponent', () => {
  let component: ClientListComponent;
  let fixture:   ComponentFixture<ClientListComponent>;
  let mockClientService: jasmine.SpyObj<ClientService>;

  // ── Shared fixtures ───────────────────────────────────────────────────────

  const sampleClients: Client[] = [
    { id: 1, name: 'Jane Doe',   email: 'jane@bankapp.com',  accountType: 'SAVINGS'  as AccountType, balance: 1500 },
    { id: 2, name: 'John Smith', email: 'john@bankapp.com',  accountType: 'CHECKING' as AccountType, balance: 3200 }
  ];

  beforeEach(async () => {
    mockClientService = jasmine.createSpyObj<ClientService>(
      'ClientService',
      ['getAllClients', 'deleteClient']
    );

    // Default: return the sample list
    mockClientService.getAllClients.and.returnValue(of(sampleClients));
    mockClientService.deleteClient.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports:   [ClientListComponent],
      providers: [
        { provide: ClientService, useValue: mockClientService },
        provideRouter(routes)
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(ClientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Creation ──────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Data loading ──────────────────────────────────────────────────────────

  it('should call getAllClients on init and populate clients array', () => {
    expect(mockClientService.getAllClients).toHaveBeenCalledTimes(1);
    expect(component.clients.length).toBe(2);
  });

  it('should render one table row per client', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should display client name in the table row', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('Jane Doe');
  });

  it('should display human-readable account type label', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    // SAVINGS → 'Savings'
    expect(rows[0].textContent).toContain('Savings');
  });

  it('should show empty-state message when client list is empty', () => {
    mockClientService.getAllClients.and.returnValue(of([]));
    component.loadClients();
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).not.toBeNull();
  });

  it('should show error banner when API call fails', () => {
    mockClientService.getAllClients.and.returnValue(throwError(() => new Error('server error')));
    component.loadClients();
    fixture.detectChanges();

    const errorBanner = fixture.nativeElement.querySelector('.error-banner');
    expect(errorBanner).not.toBeNull();
    expect(component.errorMessage).toContain('Failed to load');
  });

  // ── Delete ────────────────────────────────────────────────────────────────

  it('should call deleteClient and reload list when user confirms deletion', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.onDelete(1, 'Jane Doe');

    expect(mockClientService.deleteClient).toHaveBeenCalledWith(1);
    // After delete, getAllClients is called again to refresh
    expect(mockClientService.getAllClients).toHaveBeenCalledTimes(2);
  });

  it('should NOT call deleteClient when user cancels the confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.onDelete(1, 'Jane Doe');

    expect(mockClientService.deleteClient).not.toHaveBeenCalled();
  });

  it('should set errorMessage when delete API call fails', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockClientService.deleteClient.and.returnValue(
      throwError(() => new Error('delete failed'))
    );

    component.onDelete(1, 'Jane Doe');

    expect(component.errorMessage).toContain('Failed to delete');
  });
});
