/**
 * Reusable helper functions for CineMatch AI
 */

/**
 * Formats a runtime in minutes into a string like "2h 12m"
 * @param {number} minutes 
 * @returns {string}
 */
export const formatRuntime = (minutes) => {
  if (!minutes) return 'N/A';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};

/**
 * Truncates text to a specified length and appends ellipses
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Rounds movie rating to one decimal place
 * @param {number} rating 
 * @returns {string}
 */
export const formatRating = (rating) => {
  if (rating === undefined || rating === null) return '0.0';
  return parseFloat(rating).toFixed(1);
};

/**
 * Formats a number with commas
 * @param {number} num 
 * @returns {string}
 */
export const formatNumber = (num) => {
  if (!num) return '0';
  return num.toLocaleString();
};

/**
 * Safely parses JSON strings
 * @param {string} jsonString 
 * @param {any} fallback 
 * @returns {any}
 */
export const safeParseJSON = (jsonString, fallback = []) => {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse JSON:", jsonString, e);
    return fallback;
  }
};
