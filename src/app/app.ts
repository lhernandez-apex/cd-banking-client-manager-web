import { Component, OnInit, OnDestroy }   from '@angular/core';
import { RouterOutlet, RouterLink,
         RouterLinkActive }               from '@angular/router';
import { CommonModule }                   from '@angular/common';
import { BreakpointObserver }             from '@angular/cdk/layout';
import { Subscription }                   from 'rxjs';
import { MatToolbarModule }               from '@angular/material/toolbar';
import { MatSidenavModule }               from '@angular/material/sidenav';
import { MatListModule }                  from '@angular/material/list';
import { MatIconModule }                  from '@angular/material/icon';
import { MatButtonModule }                from '@angular/material/button';
import { MatDividerModule }               from '@angular/material/divider';

/** Breakpoint below which the sidenav collapses to an overlay drawer. */
const MOBILE_BREAKPOINT = '(max-width: 768px)';

/**
 * Root application shell.
 *
 * Renders the persistent banking chrome:
 *   - Top toolbar with application title and hamburger toggle
 *   - Responsive sidenav drawer (side mode on desktop, over on mobile)
 *   - Router outlet inside sidenav content area
 *
 * The sidenav starts open on desktop and closed on mobile.
 * BreakpointObserver tracks viewport width and switches mode automatically.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './app.html',
  styleUrl:    './app.scss'
})
export class App implements OnInit, OnDestroy {

  /** Human-readable name shown in the toolbar. */
  readonly appTitle = 'Banking Client Manager';

  /** Controls whether the sidenav drawer is currently open. */
  sidenavOpened = true;

  /** Drawer mode: permanent rail on desktop, overlay on mobile. */
  sidenavMode: 'side' | 'over' = 'side';

  private bpSub!: Subscription;

  constructor(private readonly breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    this.bpSub = this.breakpointObserver
      .observe(MOBILE_BREAKPOINT)
      .subscribe(state => {
        const isMobile = state.matches;
        this.sidenavMode   = isMobile ? 'over' : 'side';
        this.sidenavOpened = !isMobile;
      });
  }

  ngOnDestroy(): void {
    this.bpSub?.unsubscribe();
  }

  /** Called when a sidenav nav item is clicked.
   *  In overlay mode (mobile) the drawer closes automatically after navigation. */
  onNavItemClick(): void {
    if (this.sidenavMode === 'over') {
      this.sidenavOpened = false;
    }
  }

  /** Called by the hamburger button in the toolbar. */
  onToggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  /** Syncs the opened flag when the sidenav is closed by backdrop click or ESC. */
  onSidenavOpenedChange(opened: boolean): void {
    this.sidenavOpened = opened;
  }
}
