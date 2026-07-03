import { TestBed }              from '@angular/core/testing';
import { provideRouter }       from '@angular/router';
import { provideHttpClient }   from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { App }                 from './app';
import { routes }              from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:   [App],
      providers: [
        provideRouter(routes),
        // Required by Material sidenav/toolbar animation system
        provideNoopAnimations(),
        // Required by ClientListComponent (routed child) → ClientService → HttpClient
        provideHttpClient()
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should contain a router-outlet inside the sidenav content area', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });
});
