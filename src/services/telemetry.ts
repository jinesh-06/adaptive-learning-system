import { api } from './api';

export class TelemetryCollector {
  private topicId: string | null = null;
  private sessionStartTime: number = Date.now();
  private lastScrollTime: number = Date.now();
  private totalScrollDuration: number = 0;
  private isScrolling: boolean = false;
  private keystrokeCount: number = 0;
  private pasteCount: number = 0;

  // Client-Side Aggregation Buffer (Section 88 & 89)
  private aggregatedScrollSeconds: number = 0;
  private sectionsViewed: Set<string> = new Set();
  private revisitsCount: number = 0;
  private periodicFlushTimer: any = null;

  constructor() {
    // Start background periodic flush interval every 20 seconds
    if (typeof window !== 'undefined') {
      this.periodicFlushTimer = setInterval(() => {
        this.flushAggregatedBatch();
      }, 20000);

      // Flush before window unloads
      window.addEventListener('beforeunload', () => {
        this.flushSession();
      });
    }
  }

  public initTopicSession(topicId: string) {
    if (this.topicId === topicId) return;

    // Send aggregated event for previous topic if switching
    if (this.topicId) {
      this.flushSession();
    }

    this.topicId = topicId;
    this.sessionStartTime = Date.now();
    this.totalScrollDuration = 0;
    this.keystrokeCount = 0;
    this.pasteCount = 0;
    this.aggregatedScrollSeconds = 0;
    this.sectionsViewed.clear();

    // Check if this is a revisit
    const visitKey = `visited_topic_${topicId}`;
    const previousVisits = parseInt(sessionStorage.getItem(visitKey) || '0', 10);
    sessionStorage.setItem(visitKey, (previousVisits + 1).toString());
    this.revisitsCount = previousVisits;

    if (previousVisits > 0) {
      api.sendTelemetryEvent({
        topic_id: topicId,
        event_type: 'PAGE_REVISIT',
        duration: 0,
        metadata: { visit_count: previousVisits + 1 }
      });
    } else {
      api.sendTelemetryEvent({
        topic_id: topicId,
        event_type: 'PAGE_VIEW',
        duration: 0,
        metadata: { first_visit: true }
      });
    }
  }

  public recordSectionView(sectionId: string) {
    this.sectionsViewed.add(sectionId);
  }

  public recordScroll() {
    if (!this.topicId) return;

    const now = Date.now();
    if (!this.isScrolling) {
      this.isScrolling = true;
      this.lastScrollTime = now;
    }

    const scrollChunk = Math.max(0.5, (now - this.lastScrollTime) / 1000);
    if (scrollChunk < 10) { // Discard absurd jumps
      this.totalScrollDuration += scrollChunk;
      this.aggregatedScrollSeconds += scrollChunk;
    }
    this.lastScrollTime = now;
  }

  public recordKeystroke() {
    this.keystrokeCount += 1;
  }

  public recordPaste() {
    this.pasteCount += 1;
  }

  public logEvent(eventType: string, duration: number = 0, metadata: Record<string, any> = {}) {
    const targetTopic = metadata.topic_id || this.topicId;
    if (!targetTopic) return;
    api.sendTelemetryEvent({
      topic_id: targetTopic,
      event_type: eventType,
      duration,
      metadata
    }).catch(() => {});
  }

  public getCodeTelemetry() {
    return {
      keystrokes: this.keystrokeCount,
      paste_events: this.pasteCount
    };
  }

  /**
   * Periodically flush aggregated batch (Section 89)
   */
  public flushAggregatedBatch() {
    if (!this.topicId || (this.aggregatedScrollSeconds < 1 && this.sectionsViewed.size === 0)) return;

    const scrollTime = Math.round(this.aggregatedScrollSeconds);
    const sectionsCount = this.sectionsViewed.size;
    this.aggregatedScrollSeconds = 0;

    api.sendTelemetryEvent({
      topic_id: this.topicId,
      event_type: 'AGGREGATED_BEHAVIOR',
      duration: scrollTime,
      metadata: {
        scroll_time: scrollTime,
        sections_viewed: sectionsCount,
        revisits: this.revisitsCount,
        keystrokes: this.keystrokeCount
      }
    }).catch(() => {});
  }

  public flushSession() {
    if (!this.topicId) return;
    this.flushAggregatedBatch();
    const duration = Math.round((Date.now() - this.sessionStartTime) / 1000);
    if (duration > 2) {
      api.sendTelemetryEvent({
        topic_id: this.topicId,
        event_type: 'TOPIC_COMPLETE',
        duration,
        metadata: {
          total_scroll_seconds: Math.round(this.totalScrollDuration),
          sections_viewed: this.sectionsViewed.size,
          keystrokes: this.keystrokeCount,
          paste_events: this.pasteCount
        }
      }).catch(() => {});
    }
  }
}

export const telemetry = new TelemetryCollector();

