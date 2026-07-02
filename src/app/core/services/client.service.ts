import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, ClientRequest } from '../../shared/models/client.model';

/**
 * Core service for all banking client REST operations.
 *
 * Wraps the Spring Boot API endpoints under /api/v1/clients.
 * The dev proxy (proxy.conf.json) forwards these calls to
 * http://localhost:8080 during local development, eliminating CORS issues.
 *
 * Every method returns an Observable so components can subscribe,
 * use the async pipe, or compose with RxJS operators as needed.
 */
@Injectable({
  providedIn: 'root'
})
export class ClientService {

  /** Base path shared by all client endpoints. */
  private readonly apiBase = '/api/v1/clients';

  constructor(private readonly http: HttpClient) {}

  // ── Read operations ────────────────────────────────────────────────────────

  /**
   * Fetches all banking client records.
   * Maps to: GET /api/v1/clients → 200 OK
   *
   * @returns observable of the full client array
   */
  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiBase);
  }

  /**
   * Fetches a single banking client by its unique id.
   * Maps to: GET /api/v1/clients/{id} → 200 OK | 404 Not Found
   *
   * @param id the database id of the client to retrieve
   * @returns observable of the matching client record
   */
  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiBase}/${id}`);
  }

  // ── Write operations ───────────────────────────────────────────────────────

  /**
   * Creates a new banking client.
   * Maps to: POST /api/v1/clients → 201 Created | 400 | 409
   *
   * @param payload the validated client data to persist
   * @returns observable of the saved client including the generated id
   */
  createClient(payload: ClientRequest): Observable<Client> {
    return this.http.post<Client>(this.apiBase, payload);
  }

  /**
   * Fully replaces an existing banking client's data.
   * Maps to: PUT /api/v1/clients/{id} → 200 OK | 400 | 404 | 409
   *
   * @param id      the id of the client to update
   * @param payload the new field values to apply
   * @returns observable of the updated client record
   */
  updateClient(id: number, payload: ClientRequest): Observable<Client> {
    return this.http.put<Client>(`${this.apiBase}/${id}`, payload);
  }

  /**
   * Permanently removes a banking client record.
   * Maps to: DELETE /api/v1/clients/{id} → 204 No Content | 404
   *
   * @param id the id of the client to delete
   * @returns observable that completes on success (no response body)
   */
  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/${id}`);
  }
}
