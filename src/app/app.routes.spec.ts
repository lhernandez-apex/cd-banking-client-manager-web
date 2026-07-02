import { TestBed }             from '@angular/core/testing';
import { provideRouter }        from '@angular/router';
import { provideHttpClient }    from '@angular/common/http';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes }               from './app.routes';
import { ClientListComponent }   from './features/clients/client-list/client-list.component';
import { ClientFormComponent }   from './features/clients/client-form/client-form.component';
import { ClientDetailComponent } from './features/clients/client-detail/client-detail.component';

/**
 * Route configuration unit tests.
 *
 * Uses RouterTestingHarness to navigate the in-memory router and assert
 * which component is activated for each path — no real browser needed.
 */
describe('App Routes', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        // Required by ClientListComponent → ClientService → HttpClient
        provideHttpClient()
      ]
    });
  });

  // ── Redirect ──────────────────────────────────────────────────────────────

  it('/ should redirect to /clients', async () => {
    const harness = await RouterTestingHarness.create('/');
    expect(harness.routeDebugElement?.componentInstance)
      .toBeInstanceOf(ClientListComponent);
  });

  // ── /clients ──────────────────────────────────────────────────────────────

  it('/clients should activate ClientListComponent', async () => {
    const harness = await RouterTestingHarness.create('/clients');
    expect(harness.routeDebugElement?.componentInstance)
      .toBeInstanceOf(ClientListComponent);
  });

  // ── /clients/new ─────────────────────────────────────────────────────────

  it('/clients/new should activate ClientFormComponent', async () => {
    const harness = await RouterTestingHarness.create('/clients/new');
    expect(harness.routeDebugElement?.componentInstance)
      .toBeInstanceOf(ClientFormComponent);
  });

  // ── /clients/:id ─────────────────────────────────────────────────────────

  it('/clients/:id should activate ClientDetailComponent', async () => {
    const harness = await RouterTestingHarness.create('/clients/1');
    expect(harness.routeDebugElement?.componentInstance)
      .toBeInstanceOf(ClientDetailComponent);
  });

  // ── /clients/:id/edit ────────────────────────────────────────────────────

  it('/clients/:id/edit should activate ClientFormComponent', async () => {
    const harness = await RouterTestingHarness.create('/clients/1/edit');
    expect(harness.routeDebugElement?.componentInstance)
      .toBeInstanceOf(ClientFormComponent);
  });

  // ── Route ordering guard ─────────────────────────────────────────────────

  it('/clients/new should NOT activate ClientDetailComponent (order matters)', async () => {
    const harness = await RouterTestingHarness.create('/clients/new');
    expect(harness.routeDebugElement?.componentInstance)
      .not.toBeInstanceOf(ClientDetailComponent);
  });
});
