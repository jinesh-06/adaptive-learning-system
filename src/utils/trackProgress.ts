import { api } from '../services/api';
import { C_ADVANCED_TOPICS } from '../data/cAdvancedData';
import { C_INTERMEDIATE_TOPICS } from '../data/cIntermediateData';

export const isTopicCAdv = (topicId: string): boolean =>
  topicId.startsWith('top-c-adv-') || C_ADVANCED_TOPICS.some(t => t.id === topicId);

export const isTopicCInt = (topicId: string): boolean =>
  topicId.startsWith('top-c-int-') || C_INTERMEDIATE_TOPICS.some(t => t.id === topicId);

export const getTopicStorageKey = (topicId: string): string => {
  if (topicId.startsWith('top-cpp-adv-')) return 'cog_cpp_adv_progress';
  if (topicId.startsWith('top-cpp-oop-')) return 'cog_cpp_oop_progress';
  if (topicId.startsWith('top-cpp-')) return 'cog_cpp_progress';
  if (isTopicCAdv(topicId)) return 'cog_c_adv_progress';
  if (isTopicCInt(topicId)) return 'cog_c_int_progress';
  if (topicId.startsWith('top-c-')) return 'cog_c_progress';
  if (topicId.startsWith('top-java-adv-')) return 'cog_java_adv_progress';
  if (topicId.startsWith('top-java-oop-')) return 'cog_java_oop_progress';
  if (topicId.startsWith('top-java-')) return 'cog_java_progress';
  if (topicId.startsWith('top-py-adv-')) return 'cog_python_adv_progress';
  if (topicId.startsWith('top-py-int-')) return 'cog_python_int_progress';
  return 'cog_python_progress';
};

export const getUniversalTopicProgress = (topicId: string) => {
  const key = getTopicStorageKey(topicId);
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    if (!raw) return null;
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return null;
    return list.find((item: any) => item.topic_id === topicId) || null;
  } catch {
    return null;
  }
};

export const updateUniversalTopicProgress = async (
  topicId: string,
  options: {
    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    completion_pct?: number;
    quiz_score?: number;
    attempts_delta?: number;
    time_spent_delta?: number;
  }
) => {
  const payload = {
    topic_id: topicId,
    status: options.status,
    completion_pct: options.status === 'COMPLETED' ? 100 : options.completion_pct,
    quiz_score: options.quiz_score,
    attempts_delta: options.attempts_delta,
    time_spent_delta: options.time_spent_delta || 30
  };

  try {
    let result: any;
    if (isTopicCAdv(topicId)) {
      result = await api.updateCAdvProgress(payload);
    } else if (isTopicCInt(topicId)) {
      result = await api.updateCIntermediateProgress(payload);
    } else if (topicId.startsWith('top-c-')) {
      result = await api.updateCProgress(payload);
    } else if (topicId.startsWith('top-cpp-adv-')) {
      result = await api.updateCppAdvProgress(payload);
    } else if (topicId.startsWith('top-cpp-oop-')) {
      result = await api.updateCppOopProgress(payload);
    } else if (topicId.startsWith('top-cpp-')) {
      result = await api.updateCppProgress(payload);
    } else if (topicId.startsWith('top-java-adv-')) {
      result = await api.updateJavaAdvProgress(payload);
    } else if (topicId.startsWith('top-java-oop-')) {
      result = await api.updateJavaOopProgress(payload);
    } else if (topicId.startsWith('top-java-')) {
      result = await api.updateJavaProgress(payload);
    } else {
      result = await api.updatePythonProgress(payload);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('progress:updated', { detail: { topicId } }));
      window.dispatchEvent(new CustomEvent('streak:updated'));
    }
    return result;
  } catch (err) {
    console.warn('Failed to update progress via API:', err);
    return null;
  }
};

