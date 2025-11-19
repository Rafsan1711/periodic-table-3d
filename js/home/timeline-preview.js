/**
 * Timeline Preview Widget
 * Shows "On This Day" on home screen
 */

class TimelinePreview {
  constructor() {
    this.container = null;
    this.currentEvent = null;
  }

  /**
   * Initialize the preview widget
   */
  async init() {
    console.log('🎬 Initializing Timeline Preview...');
    
    // Get today's event
    this.currentEvent = getTodaysEvent();
    
    if (!this.currentEvent) {
      console.warn('⚠️ No event for today');
      return;
    }

    // Create container
    this.createContainer();
    
    // Fetch Wikipedia content in background
    this.fetchAndCacheContent();
    
    console.log('✅ Timeline Preview initialized');
  }

  /**
   * Create the preview container
   */
  createContainer() {
    const section = document.createElement('section');
    section.className = 'timeline-preview-section';
    section.setAttribute('data-aos', 'fade-up');
    
    const today = new Date();
    const dateStr = formatEventDate(today);
    
    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">
          <i class="fas fa-calendar-day"></i>
          On This Day in Chemistry
        </h2>
        <p class="section-subtitle">Discover the history behind the science</p>
      </div>
      
      <div class="timeline-preview-card">
        <div class="timeline-preview-icon" style="background: linear-gradient(135deg, ${this.currentEvent.color}, ${this.shadeColor(this.currentEvent.color, -20)})">
          <span>${this.currentEvent.icon}</span>
        </div>
        
        <div class="timeline-preview-content">
          <div class="timeline-preview-date">
            ${dateStr}
          </div>
          <h3 class="timeline-preview-title">
            ${this.currentEvent.title}
          </h3>
          <p class="timeline-preview-description">
            ${this.currentEvent.description}
          </p>
          <div class="timeline-preview-meta">
            <span class="meta-item">
              <i class="fas fa-user-circle"></i>
              ${this.currentEvent.scientist}
            </span>
            <span class="meta-item">
              <i class="fas fa-clock"></i>
              ${this.currentEvent.year}
            </span>
          </div>
        </div>
        
        <button class="timeline-view-full-btn" id="timeline-view-full">
          <span>View Full Story</span>
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
      
      <div class="timeline-fun-fact">
        <i class="fas fa-lightbulb"></i>
        <strong>Fun Fact:</strong> ${this.currentEvent.funFact}
      </div>
    `;
    
    // Insert before line counter section
    const lineCounterSection = document.querySelector('.line-counter-section');
    if (lineCounterSection) {
      lineCounterSection.parentNode.insertBefore(section, lineCounterSection);
    } else {
      document.querySelector('main').appendChild(section);
    }
    
    this.container = section;
    
    // Add click handler
    document.getElementById('timeline-view-full').addEventListener('click', () => {
      this.openFullStory();
    });
  }

  async fetchAndCacheContent() {
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Check if already cached
    const cached = await this.getCachedEvent(dateKey);
    if (cached && cached.wikiUrl) {
      console.log('✅ Using cached Wikipedia data');
      return;
    }
    
    console.log('📡 Fetching Wikipedia summary...');
    
    try {
      // Fetch Wikipedia summary (NOT full text)
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(this.currentEvent.wikiTitle)}`
      );
      
      if (!response.ok) throw new Error('Wikipedia fetch failed');
      
      const data = await response.json();
      
      // ✅ FIXED: Only save URL + short summary (NOT full text)
      const eventData = {
        ...this.currentEvent,
        dateKey: dateKey,
        wikiSummary: data.extract || '',  // Short summary only
        wikiUrl: data.content_urls?.desktop?.page || '',
        wikiThumbnail: data.thumbnail?.source || '',
        cachedAt: Date.now()
      };
      
      // Save to Firebase
      await this.cacheEvent(dateKey, eventData);
      
      console.log('✅ Wikipedia summary cached (URL + short text only)');
      
    } catch (error) {
      console.error('❌ Error fetching Wikipedia:', error);
    }
  }

  /**
   * Get cached event from Firebase
   */
  async getCachedEvent(dateKey) {
    try {
      const snapshot = await db.ref(`timeline/events/${dateKey}`).once('value');
      return snapshot.val();
    } catch (error) {
      console.error('Error getting cached event:', error);
      return null;
    }
  }

  /**
   * Cache event to Firebase
   */
  async cacheEvent(dateKey, eventData) {
    try {
      await db.ref(`timeline/events/${dateKey}`).set(eventData);
      console.log('✅ Event cached to Firebase');
    } catch (error) {
      console.error('Error caching event:', error);
    }
  }

  /**
   * Open full story modal
   */
  openFullStory() {
    if (typeof openTimelineModal === 'function') {
      openTimelineModal(this.currentEvent);
    } else {
      console.error('Timeline modal not loaded');
    }
  }

  /**
   * Utility: Shade color
   */
  shadeColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  const preview = new TimelinePreview();
  preview.init();
});

// Export for global use
window.TimelinePreview = TimelinePreview;

console.log('✅ Timeline Preview module loaded');
