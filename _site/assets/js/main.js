/**
 * FactCheck Vlaanderen - Main JavaScript
 * Handles interactive elements and user experience enhancements
 */

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  initMobileMenu();
  
  // Header search functionality
  initHeaderSearch();
  
  // Copy link button functionality
  initCopyLinkButtons();
  
  // Verdict scale tooltips
  initVerdictScaleTooltips();
});

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.menu');
  
  if (!menuToggle || !menu) return;
  
  menuToggle.addEventListener('click', function() {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    menu.classList.toggle('is-active');
    
    // Toggle menu icon (hamburger to X)
    menuToggle.classList.toggle('is-active');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(event) {
    if (!menu.contains(event.target) && !menuToggle.contains(event.target) && menu.classList.contains('is-active')) {
      menu.classList.remove('is-active');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.classList.remove('is-active');
    }
  });
}

/**
 * Initialize header search functionality
 */
function initHeaderSearch() {
  const searchToggle = document.querySelector('.search-toggle');
  const headerSearch = document.querySelector('#header-search');
  const searchInput = document.querySelector('#header-search-input');
  const searchClose = document.querySelector('.search-close');
  
  if (!searchToggle || !headerSearch) return;
  
  searchToggle.addEventListener('click', function() {
    const isExpanded = searchToggle.getAttribute('aria-expanded') === 'true';
    
    searchToggle.setAttribute('aria-expanded', !isExpanded);
    headerSearch.hidden = isExpanded;
    
    if (!isExpanded && searchInput) {
      // Focus the search input when opened
      setTimeout(() => searchInput.focus(), 100);
    }
  });
  
  if (searchClose) {
    searchClose.addEventListener('click', function() {
      headerSearch.hidden = true;
      searchToggle.setAttribute('aria-expanded', 'false');
    });
  }
  
  // Close search when pressing Escape
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && !headerSearch.hidden) {
      headerSearch.hidden = true;
      searchToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Initialize copy link button functionality
 */
function initCopyLinkButtons() {
  const copyButtons = document.querySelectorAll('.copy-link');
  
  copyButtons.forEach(button => {
    button.addEventListener('click', function() {
      const url = this.dataset.url || window.location.href;
      
      // Create a temporary input to copy from
      const tempInput = document.createElement('input');
      tempInput.value = url;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      
      // Update button text temporarily
      const originalText = this.querySelector('.text').textContent;
      this.querySelector('.text').textContent = 'Gekopieerd!';
      
      // Revert button text after timeout
      setTimeout(() => {
        this.querySelector('.text').textContent = originalText;
      }, 2000);
    });
  });
}

/**
 * Initialize verdict scale tooltips
 */
function initVerdictScaleTooltips() {
  const scaleMarks = document.querySelectorAll('.scale-mark');
  
  scaleMarks.forEach(mark => {
    // Show tooltip on hover for better accessibility
    mark.addEventListener('mouseenter', function() {
      const tooltip = this.querySelector('.scale-tooltip');
      if (tooltip) {
        tooltip.style.visibility = 'visible';
        tooltip.style.opacity = '1';
      }
    });
    
    mark.addEventListener('mouseleave', function() {
      const tooltip = this.querySelector('.scale-tooltip');
      if (tooltip) {
        tooltip.style.visibility = 'hidden';
        tooltip.style.opacity = '0';
      }
    });
  });
}

/**
 * Handle lazy loading of images
 * Fallback for browsers that don't support native lazy loading
 */
function initLazyLoading() {
  // Check if native lazy loading is supported
  if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading, do nothing
    return;
  }
  
  // Fallback for browsers without native support
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  
  const lazyLoadObserver = new IntersectionObserver(function(entries, observer) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.srcset = img.dataset.srcset;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });
  
  lazyImages.forEach(function(image) {
    lazyLoadObserver.observe(image);
  });
}

/**
 * Track outbound links with Plausible Analytics
 * Only if Plausible is loaded and we're not in development
 */
function trackOutboundLinks() {
  if (typeof window.plausible !== 'function') return;
  
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (!link) return;
    
    // Check if this is an external link
    const isExternal = 
      link.hostname !== window.location.hostname && 
      !link.hostname.endsWith('factcheck-vlaanderen.be');
    
    if (isExternal) {
      window.plausible('Outbound Link', {
        props: {
          url: link.href
        }
      });
    }
  });
}

// Initialize tracking if in production
if (window.location.hostname === 'factcheck-vlaanderen.be') {
  trackOutboundLinks();
}