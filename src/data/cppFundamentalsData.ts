import { CommonMistake, PracticeChallenge, TopicQuizQuestion } from './pythonFundamentalsData';
import { CPP_MODULE_1_TOPICS } from './cppModule1Data';
import { CPP_MODULE_2_TOPICS } from './cppModule2Data';
import { CPP_MODULE_3_TOPICS } from './cppModule3Data';

export interface CppTopic {
  id: string;
  number: number;
  numberDisplay: string;
  moduleId?: string;
  moduleTitle?: string;
  title: string;
  slug: string;
  language: 'cpp';
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

export interface CppModule {
  id: string;
  number: number;
  numberDisplay: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  topics: CppTopic[];
}

// Re-export individual module topics
export { CPP_MODULE_1_TOPICS, CPP_MODULE_2_TOPICS, CPP_MODULE_3_TOPICS };

// All 24 Lessons combined in authoritative curriculum sequence
export const CPP_FUNDAMENTALS_TOPICS: CppTopic[] = [
  ...CPP_MODULE_1_TOPICS,
  ...CPP_MODULE_2_TOPICS,
  ...CPP_MODULE_3_TOPICS
];

// The 3 Main Curriculum Modules
export const CPP_MODULES: CppModule[] = [
  {
    id: 'mod-cpp-intro-foundations',
    number: 1,
    numberDisplay: '01',
    title: 'Module 01: C++ Introduction & Programming Foundations',
    description: 'Understand the fundamentals of C++, its development environment, program structure, compilation process, variables, data types, operators, and type conversion.',
    estimatedMinutes: 120,
    topics: CPP_MODULE_1_TOPICS
  },
  {
    id: 'mod-cpp-control-problem-solving',
    number: 2,
    numberDisplay: '02',
    title: 'Module 02: Control Flow & Problem Solving',
    description: 'Develop logical thinking using decision-making statements, loops, break/continue, pattern programming, classic number problems, arrays, and strings.',
    estimatedMinutes: 180,
    topics: CPP_MODULE_2_TOPICS
  },
  {
    id: 'mod-cpp-functions-memory',
    number: 3,
    numberDisplay: '03',
    title: 'Module 03: Functions, References & Memory Fundamentals',
    description: 'Master modular programming with functions, parameters, function overloading, scope/lifetime, references, pointers, dynamic memory allocation, and the capstone Student Management System.',
    estimatedMinutes: 180,
    topics: CPP_MODULE_3_TOPICS
  }
];

// Backward-compatibility lookup helper supporting older legacy IDs
export const getCppTopicById = (id: string): CppTopic | undefined => {
  if (id === 'top-cpp-fundamentals' || id === 'top-cpp-intro') {
    return CPP_FUNDAMENTALS_TOPICS[0]; // maps to Lesson 01
  }
  if (id === 'top-cpp-control-functions') {
    return CPP_FUNDAMENTALS_TOPICS[8]; // maps to Lesson 09 (Conditional Statements)
  }
  if (id === 'top-cpp-references-memory') {
    return CPP_FUNDAMENTALS_TOPICS[20]; // maps to Lesson 21 (References)
  }
  if (id === 'top-cpp-oop') {
    return CPP_FUNDAMENTALS_TOPICS[23]; // maps to Lesson 24 (Student Management System)
  }
  return CPP_FUNDAMENTALS_TOPICS.find(t => t.id === id);
};
