import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ClientService } from './client.service';
import { Client, ClientRequest, AccountType } from '../../shared/models/client.model';

/**
 * Unit tests for {@link ClientService}.
 *
 * HttpTestingController intercepts every HTTP call made by the service
 * so no real network request ever leaves the test. Each test:
 *  1. Calls the service method and subscribes to capture the result.
 *  2. Expects exactly one matching HTTP request via expectOne().
 *  3. Flushes a mock response to resolve the observable.
 *  4. Asserts the result matches the mock data.
 *  5. Calls verify() to ensure no unexpected requests were made.
 */
describe('ClientService', () => {
  let service: ClientService;
  let httpMock: HttpTestingController;

  // ── Shared fixtures ────────────────────────────────────────────────────────

  const BASE_URL = '/api/v1/clients';

  const mockClient: Client = {
    id: 1,
    name: 'Jane Doe',
    email: 'jane.doe@bankapp.com',
    accountType: 'SAVINGS' as AccountType,
    balance: 1500.00
  };

  const mockRequest: ClientRequest = {
    name: 'Jane Doe',
    email: 'jane.doe@bankapp.com',
    accountType: 'SAVINGS' as AccountType,
    balance: 1500.00
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service  = TestBed.inject(ClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Fail the test if any unexpected HTTP calls were made
    httpMock.verify();
  });

  // ── Service instantiation ──────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── getAllClients ──────────────────────────────────────────────────────────

  it('getAllClients() should issue GET to /api/v1/clients and return client array', () => {
    const mockList: Client[] = [mockClient];

    service.getAllClients().subscribe(result => {
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Jane Doe');
    });

    const req = httpMock.expectOne(BASE_URL);
    expect(req.request.method).toBe('GET');
    req.flush(mockList);
  });

  it('getAllClients() should return empty array when no clients exist', () => {
    service.getAllClients().subscribe(result => {
      expect(result).toEqual([]);
    });

    const req = httpMock.expectOne(BASE_URL);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // ── getClientById ──────────────────────────────────────────────────────────

  it('getClientById() should issue GET to /api/v1/clients/1 and return single client', () => {
    service.getClientById(1).subscribe(result => {
      expect(result.id).toBe(1);
      expect(result.email).toBe('jane.doe@bankapp.com');
    });

    const req = httpMock.expectOne(`${BASE_URL}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockClient);
  });

  // ── createClient ───────────────────────────────────────────────────────────

  it('createClient() should issue POST to /api/v1/clients with payload and return created client', () => {
    service.createClient(mockRequest).subscribe(result => {
      expect(result.id).toBe(1);
      expect(result.name).toBe('Jane Doe');
    });

    const req = httpMock.expectOne(BASE_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockClient);
  });

  it('createClient() should send the exact payload fields to the API', () => {
    service.createClient(mockRequest).subscribe();

    const req = httpMock.expectOne(BASE_URL);
    expect(req.request.body.name).toBe('Jane Doe');
    expect(req.request.body.email).toBe('jane.doe@bankapp.com');
    expect(req.request.body.accountType).toBe('SAVINGS');
    expect(req.request.body.balance).toBe(1500.00);
    req.flush(mockClient);
  });

  // ── updateClient ───────────────────────────────────────────────────────────

  it('updateClient() should issue PUT to /api/v1/clients/1 with payload and return updated client', () => {
    const updatedClient: Client = { ...mockClient, name: 'Jane Updated', balance: 2500 };
    const updatePayload: ClientRequest = { ...mockRequest, name: 'Jane Updated', balance: 2500 };

    service.updateClient(1, updatePayload).subscribe(result => {
      expect(result.name).toBe('Jane Updated');
      expect(result.balance).toBe(2500);
    });

    const req = httpMock.expectOne(`${BASE_URL}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatePayload);
    req.flush(updatedClient);
  });

  // ── deleteClient ───────────────────────────────────────────────────────────

  it('deleteClient() should issue DELETE to /api/v1/clients/1', () => {
    service.deleteClient(1).subscribe(result => {
      // void response — only care that the call completes, not the value
      expect(result).toBeFalsy();
    });

    const req = httpMock.expectOne(`${BASE_URL}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('deleteClient() should send no request body', () => {
    service.deleteClient(1).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/1`);
    expect(req.request.body).toBeNull();
    req.flush(null);
  });
});
