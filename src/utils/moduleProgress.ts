/**
 * Utility functions for module-level progress tracking and re-attempt functionality.
 */

export interface TopicProgressRecord {
  topic_id: string;
  status?: string;
  completion_pct?: number;
  quiz_score?: number;
  attempts?: number;
  time_spent_seconds?: number;
  updated_at?: string;
  [key: string]: any;
}

export interface ModuleProgressStats {
  totalTopics: number;
  completedTopics: number;
  completionPercentage: number;
  isCompleted: boolean;
}

/**
 * Calculates progress metrics for a specific subset of topic IDs within a module.
 */
export function getModuleProgressStats(
  moduleTopicIds: string[],
  progressRecords: TopicProgressRecord[]
): ModuleProgressStats {
  if (!moduleTopicIds || moduleTopicIds.length === 0) {
    return {
      totalTopics: 0,
      completedTopics: 0,
      completionPercentage: 0,
      isCompleted: false
    };
  }

  const progressMap = new Map<string, TopicProgressRecord>();
  if (Array.isArray(progressRecords)) {
    for (const record of progressRecords) {
      if (record && record.topic_id) {
        progressMap.set(record.topic_id, record);
      }
    }
  }

  let completedCount = 0;
  for (const topicId of moduleTopicIds) {
    const record = progressMap.get(topicId);
    if (record) {
      const isCompleted = record.status === 'COMPLETED' || Number(record.completion_pct || 0) >= 95;
      if (isCompleted) {
        completedCount++;
      }
    }
  }

  const total = moduleTopicIds.length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const isCompleted = completedCount === total && total > 0;

  return {
    totalTopics: total,
    completedTopics: completedCount,
    completionPercentage: percentage,
    isCompleted
  };
}

/**
 * Resets user progress for all topic IDs in a specified module to allow a fresh re-attempt.
 * Dispatches a 'progress:updated' event to trigger real-time dashboard refreshes.
 */
export function resetModuleProgress(storageKey: string, moduleTopicIds: string[]): boolean {
  if (typeof window === 'undefined' || !storageKey || !moduleTopicIds || moduleTopicIds.length === 0) {
    return false;
  }

  try {
    const raw = localStorage.getItem(storageKey);
    let stored: TopicProgressRecord[] = [];
    if (raw) {
      stored = JSON.parse(raw);
    }
    if (!Array.isArray(stored)) {
      stored = [];
    }

    const topicIdSet = new Set(moduleTopicIds);

    // Reset matching topic records to NOT_STARTED with 0% completion and reset quiz scores
    const updated = stored.map(record => {
      if (record && topicIdSet.has(record.topic_id)) {
        return {
          ...record,
          status: 'NOT_STARTED',
          completion_pct: 0,
          quiz_score: undefined,
          updated_at: new Date().toISOString()
        };
      }
      return record;
    });

    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Dispatch real-time reactive event across the application
    window.dispatchEvent(
      new CustomEvent('progress:updated', {
        detail: {
          storageKey,
          moduleTopicIds,
          action: 'reset_module'
        }
      })
    );

    return true;
  } catch (err) {
    console.error(`Failed to reset module progress for ${storageKey}:`, err);
    return false;
  }
}

