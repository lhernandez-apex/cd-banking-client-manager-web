import { ComponentFixture, TestBed }   from '@angular/core/testing';
import { ActivatedRoute, Router }       from '@angular/router';
import { of, throwError, Subject }      from 'rxjs';

import { ClientDetailComponent }        from './client-detail.component';
import { ClientService }                from '../../../core/services/client.service';
import { Client }                       from '../../../shared/models/client.model';

/** Minimal stub client used across all test cases. */
const STUB_CLIENT: Client = {
  id:          7,
  name:        'Helena Vasquez',
  email:       'helena@example.com',
  accountType: 'SAVINGS',
  balance:     4200.50
};

/** Creates a fake ActivatedRoute with a snapshot containing the given id. */
function makeRoute(id: string | null) {
  return {
    snapshot: { paramMap: { get: (_key: string) => id } }
  };
}

describe('ClientDetailComponent', () => {

  let fixture:    ComponentFixture<ClientDetailComponent>;
  let component:  ClientDetailComponent;
  let serviceSpy: jasmine.SpyObj<ClientService>;
  let routerSpy:  jasmine.SpyObj<Router>;

  /** Builds the TestBed and returns the compiled fixture. */
  async function buildBed(routeId: string | null, clientObservable = of(STUB_CLIENT)) {
    serviceSpy = jasmine.createSpyObj<ClientService>('ClientService', ['getClientById']);
    routerSpy  = jasmine.createSpyObj<Router>('Router', ['navigate']);
    serviceSpy.getClientById.and.returnValue(clientObservable);

    await TestBed.configureTestingModule({
      imports:   [ClientDetailComponent],
      providers: [
        { provide: ClientService,  useValue: serviceSpy },
        { provide: Router,         useValue: routerSpy  },
        { provide: ActivatedRoute, useValue: makeRoute(routeId) }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(ClientDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    return fixture;
  }

  // ── 1. Creation ────────────────────────────────────────────────────────────
  it('should create the component', async () => {
    await buildBed('7');
    expect(component).toBeTruthy();
  });

  // ── 2. API call ────────────────────────────────────────────────────────────
  it('should call getClientById with the route id on init', async () => {
    await buildBed('7');
    expect(serviceSpy.getClientById).toHaveBeenCalledOnceWith(7);
  });

  // ── 3. Client name display ─────────────────────────────────────────────────
  it('should display the client name in the card header', async () => {
    const fix = await buildBed('7');
    const titleEl: HTMLElement = fix.nativeElement.querySelector('.detail-card__title');
    expect(titleEl?.textContent?.trim()).toBe('Helena Vasquez');
  });

  // ── 4. Email display ───────────────────────────────────────────────────────
  it('should display the client email in the fields section', async () => {
    const fix = await buildBed('7');
    const bodyText: string = fix.nativeElement.querySelector('.detail-card__fields').textContent;
    expect(bodyText).toContain('helena@example.com');
  });

  // ── 5. Account type label ──────────────────────────────────────────────────
  it('should display the human-readable account type label', async () => {
    const fix = await buildBed('7');
    const badgeEl: HTMLElement = fix.nativeElement.querySelector('.detail-card__badge');
    expect(badgeEl?.textContent?.trim()).toBe('Savings');
  });

  // ── 6. Balance display ─────────────────────────────────────────────────────
  it('should display the formatted balance', async () => {
    const fix = await buildBed('7');
    const balanceEl: HTMLElement = fix.nativeElement.querySelector('.detail-card__value--balance');
    expect(balanceEl?.textContent?.trim()).toContain('4,200.50');
  });

  // ── 7. Loading state ───────────────────────────────────────────────────────
  it('should show the loading banner before the API responds', async () => {
    // Use a never-completing observable so the component stays in loading state
    serviceSpy = jasmine.createSpyObj<ClientService>('ClientService', ['getClientById']);
    routerSpy  = jasmine.createSpyObj<Router>('Router', ['navigate']);
    serviceSpy.getClientById.and.returnValue(new Subject<Client>().asObservable());

    await TestBed.configureTestingModule({
      imports:   [ClientDetailComponent],
      providers: [
        { provide: ClientService,  useValue: serviceSpy },
        { provide: Router,         useValue: routerSpy  },
        { provide: ActivatedRoute, useValue: makeRoute('7') }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientDetailComponent);
    fixture.detectChanges();

    const banner: HTMLElement = fixture.nativeElement.querySelector('.status-banner--loading');
    expect(banner).toBeTruthy();
    expect(banner?.textContent?.trim()).toContain('Loading client details');
  });

  // ── 8. 404 error state ─────────────────────────────────────────────────────
  it('should show a not-found error message when the API returns 404', async () => {
    const notFoundErr = { status: 404, error: {} };
    const fix = await buildBed('99', throwError(() => notFoundErr));
    const errorEl: HTMLElement = fix.nativeElement.querySelector('.status-banner--error');
    expect(errorEl).toBeTruthy();
    expect(errorEl?.textContent).toContain('99');
    expect(errorEl?.textContent).toContain('not found');
  });

  // ── 9. Generic API error state ─────────────────────────────────────────────
  it('should show a generic error message on non-404 API failure', async () => {
    const serverErr = { status: 500 };
    const fix = await buildBed('7', throwError(() => serverErr));
    const errorEl: HTMLElement = fix.nativeElement.querySelector('.status-banner--error');
    expect(errorEl?.textContent).toContain('Failed to load');
  });

  // ── 10. Back navigation ────────────────────────────────────────────────────
  it('should navigate to /clients when the Back button is clicked', async () => {
    const fix = await buildBed('7');
    const backBtn: HTMLButtonElement = fix.nativeElement.querySelector('.btn--secondary');
    backBtn.click();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/clients']);
  });

  // ── 11. Edit navigation ────────────────────────────────────────────────────
  it('should navigate to /clients/:id/edit when Edit is clicked', async () => {
    const fix = await buildBed('7');
    const editBtn: HTMLButtonElement = fix.nativeElement.querySelector('.btn--primary');
    editBtn.click();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/clients', 7, 'edit']);
  });

  // ── 12. Loading cleared after error ───────────────────────────────────────
  it('should clear the loading flag after an API error', async () => {
    await buildBed('7', throwError(() => ({ status: 500 })));
    expect(component.isLoading).toBeFalse();
  });
});
