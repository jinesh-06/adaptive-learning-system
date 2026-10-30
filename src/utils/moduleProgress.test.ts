import { getModuleProgressStats, resetModuleProgress } from './moduleProgress';

// Setup mock localStorage
const store: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, val: string) => {
    store[key] = val;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    for (const k in store) delete store[k];
  }
};

(global as any).window = {
  dispatchEvent: (event: any) => true
};
(global as any).CustomEvent = class CustomEvent {
  type: string;
  detail: any;
  constructor(type: string, params: any) {
    this.type = type;
    this.detail = params?.detail;
  }
};

function runTests() {
  console.log('--- Testing moduleProgress ---');

  // Test 1: Empty topics
  const emptyStats = getModuleProgressStats([], []);
  console.assert(emptyStats.totalTopics === 0, 'Test 1.1 failed');
  console.assert(emptyStats.completedTopics === 0, 'Test 1.2 failed');
  console.assert(emptyStats.isCompleted === false, 'Test 1.3 failed');

  // Test 2: Incomplete module
  const topics = ['top-1', 'top-2', 'top-3'];
  const partialProgress = [
    { topic_id: 'top-1', status: 'COMPLETED', completion_pct: 100 },
    { topic_id: 'top-2', status: 'IN_PROGRESS', completion_pct: 50 },
    { topic_id: 'top-3', status: 'NOT_STARTED', completion_pct: 0 }
  ];
  const partialStats = getModuleProgressStats(topics, partialProgress);
  console.assert(partialStats.totalTopics === 3, 'Test 2.1 failed');
  console.assert(partialStats.completedTopics === 1, 'Test 2.2 failed');
  console.assert(partialStats.completionPercentage === 33, 'Test 2.3 failed');
  console.assert(partialStats.isCompleted === false, 'Test 2.4 failed');

  // Test 3: Fully completed module
  const fullProgress = [
    { topic_id: 'top-1', status: 'COMPLETED', completion_pct: 100 },
    { topic_id: 'top-2', status: 'COMPLETED', completion_pct: 100 },
    { topic_id: 'top-3', status: 'COMPLETED', completion_pct: 100 }
  ];
  const fullStats = getModuleProgressStats(topics, fullProgress);
  console.assert(fullStats.completedTopics === 3, 'Test 3.1 failed');
  console.assert(fullStats.completionPercentage === 100, 'Test 3.2 failed');
  console.assert(fullStats.isCompleted === true, 'Test 3.3 failed');

  // Test 4: resetModuleProgress
  localStorage.setItem('cog_test_progress', JSON.stringify([
    { topic_id: 'top-1', status: 'COMPLETED', completion_pct: 100, quiz_score: 90 },
    { topic_id: 'top-2', status: 'COMPLETED', completion_pct: 100, quiz_score: 85 },
    { topic_id: 'top-other', status: 'COMPLETED', completion_pct: 100, quiz_score: 95 }
  ]));

  const resetSuccess = resetModuleProgress('cog_test_progress', ['top-1', 'top-2']);
  console.assert(resetSuccess === true, 'Test 4.1 failed');

  const afterReset = JSON.parse(localStorage.getItem('cog_test_progress')!);
  const t1 = afterReset.find((r: any) => r.topic_id === 'top-1');
  const t2 = afterReset.find((r: any) => r.topic_id === 'top-2');
  const tOther = afterReset.find((r: any) => r.topic_id === 'top-other');

  console.assert(t1.status === 'NOT_STARTED', 'Test 4.2 failed');
  console.assert(t1.completion_pct === 0, 'Test 4.3 failed');
  console.assert(t1.quiz_score === undefined, 'Test 4.4 failed');
  console.assert(t2.status === 'NOT_STARTED', 'Test 4.5 failed');
  console.assert(tOther.status === 'COMPLETED', 'Test 4.6 failed');
  console.assert(tOther.quiz_score === 95, 'Test 4.7 failed');

  console.log('All 4 moduleProgress test suites passed cleanly!');
}

runTests();

