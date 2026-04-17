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

type BackendFieldError = {
  field?: string;
  message?: string;
  rejectedValue?: unknown;
};

type ProblemDetailLike = {
  title?: string;
  detail?: string;
  status?: number;
  errorCode?: string;
  errors?: BackendFieldError[];
  violations?: Array<{ path?: string; message?: string }>;
};

function asProblemDetail(data: unknown): ProblemDetailLike | undefined {
  if (!data || typeof data !== "object") return undefined;
  return data as any;
}

function mapValidationFieldErrorToMessageId(fe: BackendFieldError): ApiErrorMessage | undefined {
  const field = fe.field ?? "";
  const msg = fe.message ?? "";

  // Numeric positive constraints from @Positive (BigDecimal/Integer).
  // Hibernate Validator message: "must be greater than 0".
  if (msg === "must be greater than 0") {
    return { id: "validation.transaction.splitValueMustBePositive" };
  }

  // Transactions: paid/split sums.
  if (field === "paidBy" && msg.includes("Sum of fixed amounts in paidBy must equal totalAmount")) {
    return { id: "validation.transaction.paidBySumMismatch" };
  }

  if (field === "splitBetween" && msg.includes("Sum of fixed amounts in splitBetween must equal totalAmount")) {
    return { id: "validation.transaction.splitBetweenSumMismatch" };
  }

  // Percentage sums.
  if (field === "paidBy" && msg.includes("Sum of percentage values in paidBy must be 100")) {
    return { id: "validation.transaction.paidByPercentageSumMismatch" };
  }

  if (field === "splitBetween" && msg.includes("Sum of percentage values in splitBetween must be 100")) {
    return { id: "validation.transaction.splitBetweenPercentageSumMismatch" };
  }

  // Generic refine message used in some schemas on backend.
  if (msg === "Validation failed") {
    return { id: "api.error.validation" };
  }

  return undefined;
}

function getFirstMeaningfulValidationError(pd: ProblemDetailLike): BackendFieldError | undefined {
  const errors = pd.errors ?? [];
  if (errors.length === 0) return undefined;

  // Prefer the most actionable items first.
  // 1) Any explicit numeric/required constraint on an indexed field (e.g., splitBetween[0].fixed)
  const indexed = errors.find((e) => typeof e.field === "string" && e.field.includes("[") && !!mapValidationFieldErrorToMessageId(e));
  if (indexed) return indexed;

  // 2) Any mappable message.
  const mappable = errors.find((e) => !!mapValidationFieldErrorToMessageId(e));
  if (mappable) return mappable;

  // 3) Fallback to first.
  return errors[0];
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
    const status = error.response?.status;

    if (!error.response) {
      return { id: "api.error.network" };
    }

    const pd = asProblemDetail(error.response?.data);

    // Registration: email already exists (backend returns 400 + plain string message).
    // Example: "Email already exists: string@g.com"
    if (status === 400) {
      const data = error.response?.data;
      const maybeText = typeof data === "string" ? data : typeof (data as any)?.message === "string" ? (data as any).message : undefined;
      if (maybeText && maybeText.toLowerCase().includes("email already exists")) {
        return { id: "auth.register.error.emailAlreadyExists" };
      }

      // Some endpoints return ProblemDetail with .detail set to the message.
      if (pd?.detail && pd.detail.toLowerCase().includes("email already exists")) {
        return { id: "auth.register.error.emailAlreadyExists" };
      }
    }

    // Handle backend validation errors.
    if (status === 400 && pd?.errorCode === "VALIDATION_ERROR") {
      const first = getFirstMeaningfulValidationError(pd);
      if (first) {
        const mapped = mapValidationFieldErrorToMessageId(first);
        if (mapped) return mapped;

        return { id: "api.error.validation" };
      }
      return { id: "api.error.validation" };
    }

    if (status === 401) return { id: "auth.login.error.invalidCredentials" };
    if (status === 403) return { id: "api.error.forbidden" };
    if (status === 404) return { id: "api.error.notFound" };
    if (status && status >= 500) return { id: "api.error.server" };

    // If backend sends ProblemDetail detail, prefer it over generic.
    if (pd?.detail && typeof pd.detail === "string" && pd.detail.trim().length > 0) {
      return { id: "api.error.message", values: { message: pd.detail } };
    }

    return { id: "api.error.generic", values: { status } };
  }

  return { id: "api.error.unknown" };
}

export function formatApiError(intl: IntlShape, error: unknown): string {
  const msg = getApiErrorMessage(error);
  return intl.formatMessage({ id: msg.id, defaultMessage: msg.id }, msg.values);
}
