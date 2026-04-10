import type { IntlShape } from "react-intl";
import type { AxiosError } from "axios";

type MessageValues = Record<string, string | number | boolean | null | undefined>;

export type ApiErrorMessage = {
  id: string;
  values?: MessageValues;
};

function isAxiosError(e: unknown): e is AxiosError<any> {
  return typeof e === "object" && e !== null && (e as any).isAxiosError === true;
}

/**
 * Convert an unknown error (usually Axios) into a localized, user-friendly message.
 *
 * Contract:
 * - 401 (login): invalid credentials
 * - network errors: cannot reach server
 * - everything else: generic
 */
export function getApiErrorMessage(error: unknown): ApiErrorMessage {
  if (!error) return { id: "api.error.unknown" };

  if (isAxiosError(error)) {
    // Axios provides status on response.
    const status = error.response?.status;

    // Network / CORS / server down.
    if (!error.response) {
      return { id: "api.error.network" };
    }

    if (status === 401) return { id: "auth.login.error.invalidCredentials" };
    if (status === 403) return { id: "api.error.forbidden" };
    if (status === 404) return { id: "api.error.notFound" };
    if (status && status >= 500) return { id: "api.error.server" };

    return { id: "api.error.generic", values: { status } };
  }

  return { id: "api.error.unknown" };
}

export function formatApiError(intl: IntlShape, error: unknown): string {
  const msg = getApiErrorMessage(error);
  return intl.formatMessage({ id: msg.id, defaultMessage: msg.id }, msg.values);
}
