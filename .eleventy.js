const { DateTime } = require("luxon");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const CleanCSS = require("clean-css");
const htmlmin = require("html-minifier");
const path = require("path");
const sass = require("sass");

module.exports = function(eleventyConfig) {
  // Add plugins
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  
  // Add SCSS processing
  eleventyConfig.addTemplateFormats("scss");
  
  // Set up the scss extension
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    
    // opt-out of Eleventy Layouts
    useLayouts: false,
    
    compile: async function(inputContent, inputPath) {
      let parsed = path.parse(inputPath);
      // Don't compile file names that start with an underscore
      if(parsed.name.startsWith("_")) {
        return;
      }
      
      let result = sass.compileString(inputContent, {
        loadPaths: [
          parsed.dir || ".",
          this.config.dir.includes,
        ]
      });
      
      // Map dependencies for incremental builds
      this.addDependencies(inputPath, result.loadedUrls);
      
      return async (data) => {
        return result.css;
      };
    },
  });
  
  // Pass through assets
  eleventyConfig.addPassthroughCopy("src/assets/css");
  eleventyConfig.addPassthroughCopy("src/assets/js");
  eleventyConfig.addPassthroughCopy("src/assets/fonts");
  eleventyConfig.addPassthroughCopy("src/assets/images");
  
  // Date filters
  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: 'Europe/Brussels'})
      .setLocale('nl-BE')
      .toFormat("d MMMM yyyy");
  });
  
  eleventyConfig.addFilter("isoDate", dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: 'Europe/Brussels'}).toISO();
  });
  
  // CSS minification filter
  eleventyConfig.addFilter("cssmin", function(code) {
    return new CleanCSS({}).minify(code).styles;
  });
  
  // HTML minification for production
  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if(process.env.ELEVENTY_ENV === "production" && outputPath && outputPath.endsWith(".html")) {
      return htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
    }
    return content;
  });
  
  // Find filter - used to find an object in an array by property value
  eleventyConfig.addFilter("find", function(array, value, property = "id") {
    if (!array || !Array.isArray(array)) return {};
    return array.find(item => item[property] === value) || {};
  });
  
  // Related filter - used to find related content by tags
  eleventyConfig.addFilter("related", function(collection, tags, currentUrl, limit = 3) {
    if (!collection || !tags) return [];
    
    // Filter collection to only include items with matching tags
    // and exclude the current post
    const filtered = collection.filter(item => {
      if (item.url === currentUrl) return false;
      
      // Get just the tags that match
      const matchingTags = (item.data.tags || []).filter(tag => 
        tags && tags.includes(tag)
      );
      
      return matchingTags.length > 0;
    });
    
    // Sort by number of matching tags (descending)
    filtered.sort((a, b) => {
      const aMatchCount = (a.data.tags || []).filter(tag => 
        tags && tags.includes(tag)
      ).length;
      
      const bMatchCount = (b.data.tags || []).filter(tag => 
        tags && tags.includes(tag)
      ).length;
      
      return bMatchCount - aMatchCount;
    });
    
    // Return limited number of results
    return filtered.slice(0, limit);
  });
  
  // Verdict classification filter
  eleventyConfig.addFilter("verdictClass", function(verdict) {
    const verdictMap = {
      "waar": "verdict-true",
      "grotendeels waar": "verdict-mostly-true",
      "half waar": "verdict-half-true",
      "grotendeels onwaar": "verdict-mostly-false",
      "onwaar": "verdict-false",
      "misleidend": "verdict-misleading"
    };
    return verdictMap[verdict.toLowerCase()] || "verdict-unknown";
  });
  
  // Verdict icon filter
  eleventyConfig.addFilter("verdictIcon", function(verdict) {
    const verdictMap = {
      "waar": "check-circle",
      "grotendeels waar": "check-circle-dashed",
      "half waar": "divide-circle",
      "grotendeels onwaar": "x-circle-dashed",
      "onwaar": "x-circle",
      "misleidend": "alert-circle"
    };
    return verdictMap[verdict.toLowerCase()] || "help-circle";
  });
  
  // Create a collection for fact checks
  eleventyConfig.addCollection("factchecks", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/factchecks/**/*.md");
  });
  
  // Create collections by category
eleventyConfig.addCollection("politiek", function(collectionApi) {
  return collectionApi.getFilteredByGlob("src/factchecks/politiek/*.md");
});

eleventyConfig.addCollection("economie", function(collectionApi) {
  return collectionApi.getFilteredByGlob("src/factchecks/economie/*.md");
});

eleventyConfig.addCollection("gezondheid", function(collectionApi) {
  return collectionApi.getFilteredByGlob("src/factchecks/gezondheid/*.md");
});

eleventyConfig.addCollection("europa", function(collectionApi) {
  return collectionApi.getFilteredByGlob("src/factchecks/europa/*.md");
});

eleventyConfig.addCollection("migratie", function(collectionApi) {
  return collectionApi.getFilteredByGlob("src/factchecks/migratie/*.md");
});

// Alternative collection method by category tag
eleventyConfig.addCollection("categoriesByTag", function(collectionApi) {
  const categories = ["Politiek", "Economie", "Gezondheid", "Europa", "Migratie"];
  let result = {};
  
  categories.forEach(category => {
    result[category.toLowerCase()] = collectionApi.getFilteredByTags("factchecks", category);
  });
  
  return result;
});
  
  // Utility filters
  eleventyConfig.addFilter("slice", function(array, start, end) {
    if (!array || !Array.isArray(array)) return [];
    return array.slice(start, end);
  });
  
  eleventyConfig.addFilter("sort", function(array, key, direction = 'asc') {
    if (!array || !Array.isArray(array)) return [];
    const dir = direction === 'desc' ? -1 : 1;
    
    return [...array].sort((a, b) => {
      const valueA = key ? a[key] : a;
      const valueB = key ? b[key] : b;
      
      if (valueA < valueB) return -1 * dir;
      if (valueA > valueB) return 1 * dir;
      return 0;
    });
  });
  
  eleventyConfig.addFilter("limit", function(array, limit) {
    if (!array || !Array.isArray(array)) return [];
    return array.slice(0, limit);
  });
  
  eleventyConfig.addFilter("where", function(array, key, value) {
    if (!array || !Array.isArray(array)) return [];
    return array.filter(item => item[key] === value);
  });
  
  eleventyConfig.addFilter("slugify", function(text) {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
  });
  
  // Base config
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html", "scss"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};