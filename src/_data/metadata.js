const { DateTime } = require("luxon");

module.exports = {
  // Helper function to format dates
  dateFormat: function(date, format) {
    return DateTime.fromJSDate(date).setLocale('nl-BE').toFormat(format);
  },
  
  // Current year for copyright notices
  currentYear: function() {
    return new Date().getFullYear();
  },
  
  // Helper to find object in array by property value
  find: function(array, value, property = "id") {
    return array.find(item => item[property] === value) || {};
  },
  
  // Helper to generate slugs
  slugify: function(text) {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  },
  
  // Helper to truncate text
  truncate: function(text, length) {
    if (text.length <= length) return text;
    return text.slice(0, length) + "...";
  },
  
  // Helper to get related posts
  related: function(collection, tags, currentUrl, limit = 3) {
    // Filter collection to only include items with matching tags
    // and exclude the current post
    const filteredCollection = collection.filter(item => {
      if (item.url === currentUrl) return false;
      
      // Get just the tags that match
      const matchingTags = (item.data.tags || []).filter(tag => 
        tags && tags.includes(tag)
      );
      
      return matchingTags.length > 0;
    });
    
    // Sort by number of matching tags (descending)
    filteredCollection.sort((a, b) => {
      const aMatchCount = (a.data.tags || []).filter(tag => 
        tags && tags.includes(tag)
      ).length;
      
      const bMatchCount = (b.data.tags || []).filter(tag => 
        tags && tags.includes(tag)
      ).length;
      
      return bMatchCount - aMatchCount;
    });
    
    // Return limited number of results
    return filteredCollection.slice(0, limit);
  }
};