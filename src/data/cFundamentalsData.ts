import { CommonMistake, PracticeChallenge, TopicQuizQuestion } from './pythonFundamentalsData';
import { C_MODULE_1_TOPICS } from './cModule1Data';
import { C_MODULE_2_TOPICS } from './cModule2Data';
import { C_MODULE_3_TOPICS } from './cModule3Data';
import { C_MODULE_4_TOPICS } from './cModule4Data';

export interface CTopic {
  id: string;
  number: number;
  numberDisplay: string;
  moduleId?: string;
  moduleTitle?: string;
  title: string;
  slug: string;
  language: 'c';
  shortDescription: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced Project' | string;
  estimatedMinutes: number;
  prerequisiteId: string | null;

  // 12-Section Curriculum
  learningObjectives: string[];
  conceptExplanation: string;
  simpleExample: {
    code: string;
    explanation: string;
  };
  syntax: string;
  codeExample: string;
  expectedOutput: string;
  stepByStep: string[];
  commonMistakes: CommonMistake[];
  realWorldExample: {
    scenario: string;
    code: string;
    explanation: string;
  };
  practice: PracticeChallenge;
  quiz: TopicQuizQuestion[];
  codingChallenge?: {
    title?: string;
    difficulty?: string;
    problem_statement?: string;
    input_format?: string;
    output_format?: string;
    constraints?: string;
    starter_code?: string;
    expected_output?: string;
    test_cases?: any[];
    [key: string]: any;
  };
  summary: string[];
}

export interface CModule {
  id: string;
  number: number;
  numberDisplay: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  topics: CTopic[];
}

// All 16 Topics combined in authoritative order
export const C_FUNDAMENTALS_TOPICS: CTopic[] = [
  ...C_MODULE_1_TOPICS,
  ...C_MODULE_2_TOPICS,
  ...C_MODULE_3_TOPICS,
  ...C_MODULE_4_TOPICS
];

// The 4 Curriculum Modules
export const C_MODULES: CModule[] = [
  {
    id: 'mod-c-foundations',
    number: 1,
    numberDisplay: '01',
    title: 'Core Language Foundations',
    description: 'Compilation pipeline, primitive data types, memory representations, standard console I/O, format specifiers, and arithmetic operators.',
    estimatedMinutes: 110,
    topics: C_MODULE_1_TOPICS
  },
  {
    id: 'mod-c-control-flow',
    number: 2,
    numberDisplay: '02',
    title: 'Control Flow & Modular Design',
    description: 'Decision trees, jump-table switch statements, high-performance iteration loops, stack-frame function calls, and recursion call stack traces.',
    estimatedMinutes: 130,
    topics: C_MODULE_2_TOPICS
  },
  {
    id: 'mod-c-memory-pointers',
    number: 3,
    numberDisplay: '03',
    title: 'Memory Architecture, Arrays & Pointers',
    description: 'Contiguous arrays, null-terminated strings, hardware memory addresses, pointer arithmetic, dereferencing, and heap dynamic memory allocation.',
    estimatedMinutes: 145,
    topics: C_MODULE_3_TOPICS
  },
  {
    id: 'mod-c-systems-capstone',
    number: 4,
    numberDisplay: '04',
    title: 'Advanced Systems, Files & Capstone',
    description: 'Heterogeneous structures, memory unions, file stream persistence, preprocessor macros, header guards, multi-file builds, and the Student Record System.',
    estimatedMinutes: 160,
    topics: C_MODULE_4_TOPICS
  }
];

// Helper lookup
export const getCTopicById = (id: string): CTopic | undefined => {
  if (id === 'top-c-fundamentals') {
    return C_FUNDAMENTALS_TOPICS[0]; // backward compatibility alias
  }
  return C_FUNDAMENTALS_TOPICS.find(t => t.id === id);
};
