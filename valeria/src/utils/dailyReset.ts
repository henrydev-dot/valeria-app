/**
 * Check if daily reset should happen (compares last reset date to today).
 */
export function shouldResetDaily(lastResetDate: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return lastResetDate !== today;
}

/**
 * Get time until next midnight in human-readable format.
 */
export function getTimeUntilReset(): string {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours} saat ${minutes} dakika`;
}
