/**
 * Shared domain models for the Banking Client Manager.
 *
 * These interfaces mirror the Spring Boot DTOs exactly:
 *   - AccountType     ↔  com.bankingapp.clientmanager.model.AccountType
 *   - ClientRequest   ↔  com.bankingapp.clientmanager.dto.ClientRequestDTO
 *   - Client          ↔  com.bankingapp.clientmanager.dto.ClientResponseDTO
 *
 * Keeping all types in one file ensures every component and service
 * imports from a single source of truth.
 */

// ── Account type ─────────────────────────────────────────────────────────────

/**
 * The two supported banking account categories.
 * Values must match the Java enum exactly (upper-case).
 */
export type AccountType = 'SAVINGS' | 'CHECKING';

/** Human-readable labels for display in dropdowns and detail views. */
export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  SAVINGS:  'Savings',
  CHECKING: 'Checking',
};

// ── Outbound model (read) ────────────────────────────────────────────────────

/**
 * Represents a banking client record returned by the REST API.
 * Maps 1-to-1 with {@code ClientResponseDTO} from the backend.
 */
export interface Client {
  /** Database-generated unique identifier. */
  id: number;

  /** Full display name of the client. */
  name: string;

  /** Unique contact email address. */
  email: string;

  /** Type of the bank account: SAVINGS or CHECKING. */
  accountType: AccountType;

  /** Current account balance — always ≥ 0. */
  balance: number;
}

// ── Inbound model (write) ────────────────────────────────────────────────────

/**
 * Payload sent to the API when creating or updating a client.
 * Maps 1-to-1 with {@code ClientRequestDTO} from the backend.
 * The {@code id} field is omitted — the backend generates it on create
 * and receives it as a path variable on update.
 */
export interface ClientRequest {
  /** Full display name of the client. Required, max 100 characters. */
  name: string;

  /** Contact email address. Required, must be a valid email format. */
  email: string;

  /** Type of the bank account. Required: SAVINGS or CHECKING. */
  accountType: AccountType;

  /** Account balance. Required, must be zero or greater. */
  balance: number;
}
