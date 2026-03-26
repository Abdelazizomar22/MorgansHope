/**
 * Retry utility with exponential backoff and jitter.
 *
 * Retries on HTTP 429 (Too Many Requests) and 5xx server errors.
 * Uses a multiplier-based backoff with ±10% random jitter to prevent
 * thundering herd problems when multiple requests retry simultaneously.
 */

import axios, { AxiosError } from 'axios';

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 5) */
  maxRetries?: number;
  /** Initial delay in milliseconds before the first retry (default: 1000) */
  initialDelayMs?: number;
  /** Maximum delay cap in milliseconds (default: 30000) */
  maxDelayMs?: number;
  /** Multiplier applied to the delay after each attempt (default: 2) */
  backoffMultiplier?: number;
  /** Jitter factor as a fraction of the computed delay (default: 0.1 = ±10%) */
  jitterFactor?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 5,
  initialDelayMs: 1000,
  maxDelayMs: 30_000,
  backoffMultiplier: 2,
  jitterFactor: 0.1,
};

/**
 * Returns true if the error is retryable (429 or 5xx HTTP status, or a
 * network-level error with no response).
 */
function isRetryable(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (!axiosError.response) {
      // Network error / timeout — worth retrying
      return true;
    }
    const status = axiosError.response.status;
    return status === 429 || (status >= 500 && status <= 599);
  }
  return false;
}

/**
 * Computes the delay for a given attempt index with exponential backoff and
 * ±jitterFactor random jitter, capped at maxDelayMs.
 *
 * @param attempt  Zero-based attempt index (0 = first retry)
 * @param options  Resolved retry options
 */
function computeDelay(attempt: number, options: Required<RetryOptions>): number {
  const base = options.initialDelayMs * Math.pow(options.backoffMultiplier, attempt);
  const capped = Math.min(base, options.maxDelayMs);

  // Apply ±jitterFactor jitter
  const jitterRange = capped * options.jitterFactor;
  const jitter = (Math.random() * 2 - 1) * jitterRange; // value in [-jitterRange, +jitterRange]

  return Math.round(Math.max(0, capped + jitter));
}

/**
 * Wraps an async function with exponential backoff retry logic.
 *
 * @param fn       Async function to execute and potentially retry
 * @param options  Optional retry configuration
 * @returns        The resolved value of `fn` on success
 * @throws         The last error if all retry attempts are exhausted
 *
 * @example
 * const data = await retryWithBackoff(() =>
 *   axios.post('https://openrouter.ai/api/v1/chat/completions', body, config)
 * );
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> {
  const opts: Required<RetryOptions> = { ...DEFAULT_OPTIONS, ...options };

  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === opts.maxRetries;

      if (isLastAttempt || !isRetryable(error)) {
        throw error;
      }

      const delayMs = computeDelay(attempt, opts);
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;

      console.warn(
        `[retryWithBackoff] Attempt ${attempt + 1}/${opts.maxRetries} failed` +
          (status ? ` (HTTP ${status})` : '') +
          `. Retrying in ${delayMs}ms…`,
      );

      await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // This line is unreachable but satisfies TypeScript's control-flow analysis.
  throw lastError;
}
