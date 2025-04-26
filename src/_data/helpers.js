/**
 * Utility helper functions for templates
 */

module.exports = {
  /**
   * Returns the current year as a number
   * @returns {number} Current year
   */
  currentYear: () => new Date().getFullYear(),
  
  /**
   * Format a date with a specified format
   * @param {Date} date - The date to format
   * @param {string} format - Format string (e.g., "yyyy-MM-dd")
   * @returns {string} Formatted date string
   */
  formatDate: (date, format = "yyyy-MM-dd") => {
    if (!date) return "";
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    
    // Simple formatter - expand as needed
    return format
      .replace("yyyy", year)
      .replace("MM", month)
      .replace("dd", day);
  },
  
  /**
   * Simple slugify function
   * @param {string} text - Text to slugify
   * @returns {string} URL-friendly slug
   */
  slugify: (text) => {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
  },
  
  /**
   * Find item in an array by property
   * @param {Array} array - Array to search
   * @param {*} value - Value to find
   * @param {string} prop - Property name to match against
   * @returns {*} Found item or undefined
   */
  find: (array, value, prop = "id") => {
    if (!array || !Array.isArray(array)) return {};
    return array.find(item => item[prop] === value) || {};
  }
};