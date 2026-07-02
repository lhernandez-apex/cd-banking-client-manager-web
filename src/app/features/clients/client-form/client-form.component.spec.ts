import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router }     from '@angular/router';
import { ActivatedRoute }            from '@angular/router';
import { of, throwError }            from 'rxjs';
import { ClientFormComponent }       from './client-form.component';
import { ClientService }             from '../../../core/services/client.service';
import { Client, AccountType }       from '../../../shared/models/client.model';
import { routes }                    from '../../../app.routes';

describe('ClientFormComponent', () => {
  let component:           ClientFormComponent;
  let fixture:             ComponentFixture<ClientFormComponent>;
  let mockClientService:   jasmine.SpyObj<ClientService>;
  let router:              Router;

  // ── Shared fixture data ────────────────────────────────────────────────────

  const existingClient: Client = {
    id: 1,
    name: 'Jane Doe',
    email: 'jane@bankapp.com',
    accountType: 'SAVINGS' as AccountType,
    balance: 1500
  };

  // ── Helper: setup TestBed with optional route params ──────────────────────

  async function setupComponent(paramId?: string): Promise<void> {
    mockClientService = jasmine.createSpyObj<ClientService>(
      'ClientService',
      ['getClientById', 'createClient', 'updateClient']
    );

    mockClientService.getClientById.and.returnValue(of(existingClient));
    mockClientService.createClient.and.returnValue(of(existingClient));
    mockClientService.updateClient.and.returnValue(of(existingClient));

    await TestBed.configureTestingModule({
      imports:   [ClientFormComponent],
      providers: [
        { provide: ClientService, useValue: mockClientService },
        provideRouter(routes),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: (_: string) => paramId ?? null } }
          }
        }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(ClientFormComponent);
    component = fixture.componentInstance;
    router    = TestBed.inject(Router);
    fixture.detectChanges();
  }

  // ── Create mode ──────────────────────────────────────────────────────────

  describe('Create mode (/clients/new)', () => {

    beforeEach(async () => setupComponent()); // no id param

    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should be in create mode when no id param is present', () => {
      expect(component.isEditMode).toBeFalse();
    });

    it('should display "New Client" as the page title', () => {
      expect(component.pageTitle).toBe('New Client');
    });

    it('should initialise with an empty, invalid form', () => {
      expect(component.clientForm.valid).toBeFalse();
    });

    it('should mark all fields touched but NOT submit when form is invalid', () => {
      component.onSubmit();
      expect(mockClientService.createClient).not.toHaveBeenCalled();
    });

    it('should call createClient and navigate to /clients on valid submit', () => {
      const navigateSpy = spyOn(router, 'navigate');
      component.clientForm.setValue({
        name: 'Test User', email: 'test@bankapp.com',
        accountType: 'SAVINGS', balance: 100
      });
      component.onSubmit();
      expect(mockClientService.createClient).toHaveBeenCalledWith(
        component.clientForm.value
      );
      expect(navigateSpy).toHaveBeenCalledWith(['/clients']);
    });

    it('should set errorMessage when createClient fails', () => {
      mockClientService.createClient.and.returnValue(
        throwError(() => ({ error: { message: 'Email already registered' } }))
      );
      component.clientForm.setValue({
        name: 'Test User', email: 'test@bankapp.com',
        accountType: 'SAVINGS', balance: 100
      });
      component.onSubmit();
      expect(component.errorMessage).toContain('Email already registered');
    });

    it('should navigate to /clients when Cancel is clicked', () => {
      const navigateSpy = spyOn(router, 'navigate');
      component.onCancel();
      expect(navigateSpy).toHaveBeenCalledWith(['/clients']);
    });
  });

  // ── Edit mode ────────────────────────────────────────────────────────────

  describe('Edit mode (/clients/:id/edit)', () => {

    beforeEach(async () => setupComponent('1')); // id param = '1'

    it('should be in edit mode when an id param is present', () => {
      expect(component.isEditMode).toBeTrue();
    });

    it('should display "Edit Client" as the page title', () => {
      expect(component.pageTitle).toBe('Edit Client');
    });

    it('should call getClientById with the route id on init', () => {
      expect(mockClientService.getClientById).toHaveBeenCalledWith(1);
    });

    it('should pre-fill the form with the loaded client data', () => {
      expect(component.clientForm.value.name).toBe('Jane Doe');
      expect(component.clientForm.value.email).toBe('jane@bankapp.com');
    });

    it('should call updateClient and navigate to /clients on valid submit', () => {
      const navigateSpy = spyOn(router, 'navigate');
      component.onSubmit();
      expect(mockClientService.updateClient).toHaveBeenCalledWith(
        1, component.clientForm.value
      );
      expect(navigateSpy).toHaveBeenCalledWith(['/clients']);
    });

    it('should set errorMessage when updateClient fails', () => {
      mockClientService.updateClient.and.returnValue(
        throwError(() => ({ error: { message: 'Email conflict' } }))
      );
      component.onSubmit();
      expect(component.errorMessage).toContain('Email conflict');
    });
  });

  // ── Field validation ─────────────────────────────────────────────────────

  describe('Field validation', () => {

    beforeEach(async () => setupComponent());

    it('fieldInvalid() should return false for untouched invalid field', () => {
      expect(component.fieldInvalid('name')).toBeFalse();
    });

    it('fieldInvalid() should return true after touching an empty required field', () => {
      component.field('name')!.markAsTouched();
      expect(component.fieldInvalid('name')).toBeTrue();
    });

    it('balance field should be invalid when value is negative', () => {
      component.field('balance')!.setValue(-1);
      component.field('balance')!.markAsTouched();
      expect(component.fieldInvalid('balance')).toBeTrue();
    });

    it('email field should be invalid with malformed email', () => {
      component.field('email')!.setValue('not-an-email');
      component.field('email')!.markAsTouched();
      expect(component.fieldInvalid('email')).toBeTrue();
    });
  });
});
