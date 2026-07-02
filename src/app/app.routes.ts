import { Routes } from '@angular/router';
import { ClientListComponent }   from './features/clients/client-list/client-list.component';
import { ClientFormComponent }   from './features/clients/client-form/client-form.component';
import { ClientDetailComponent } from './features/clients/client-detail/client-detail.component';

/**
 * Application route definitions.
 *
 * Route map:
 *  /                      → redirects to /clients
 *  /clients               → ClientListComponent   (all clients table)
 *  /clients/new           → ClientFormComponent   (create mode)
 *  /clients/:id           → ClientDetailComponent (read-only view)
 *  /clients/:id/edit      → ClientFormComponent   (edit mode)
 *
 * Note: /clients/new must be declared before /clients/:id so the router
 * matches the literal "new" path before trying to parse it as a numeric id.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'clients',
    pathMatch: 'full'
  },
  {
    path: 'clients',
    component: ClientListComponent
  },
  {
    path: 'clients/new',
    component: ClientFormComponent
  },
  {
    path: 'clients/:id',
    component: ClientDetailComponent
  },
  {
    path: 'clients/:id/edit',
    component: ClientFormComponent
  }
];

