/**
 * Convert error object to pretty object with error message and severity.
 */
export function errorToPrettyError(error: any): {
  message: string;
  severity: "info" | "error" | undefined;
} {
  let message = JSON.stringify(error);
  let severity: "info" | "error" | undefined = undefined;
  if (error?.message) {
    message = error.message;
  }
  return {
    message: message,
    severity: severity,
  };
}
