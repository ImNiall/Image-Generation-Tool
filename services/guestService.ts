export const GUEST_ATTEMPT_LIMIT = 3;
const ATTEMPTS_KEY = 'driveDiagramGuestAttempts';

/**
 * Retrieves the number of guest attempts from localStorage.
 * @returns {number} The number of attempts, defaulting to 0.
 */
export const getGuestAttempts = (): number => {
  try {
    const attempts = localStorage.getItem(ATTEMPTS_KEY);
    // Ensure we handle null and NaN cases, defaulting to 0
    return attempts ? parseInt(attempts, 10) || 0 : 0;
  } catch (error) {
    console.error("Could not read guest attempts from localStorage", error);
    return 0;
  }
};

/**
 * Increments the guest attempt count in localStorage.
 * @returns {number} The new number of attempts.
 */
export const incrementGuestAttempts = (): number => {
  const currentAttempts = getGuestAttempts();
  const newAttempts = currentAttempts + 1;
  try {
    localStorage.setItem(ATTEMPTS_KEY, newAttempts.toString());
  } catch (error) {
    console.error("Failed to save guest attempts to localStorage", error);
  }
  return newAttempts;
};
