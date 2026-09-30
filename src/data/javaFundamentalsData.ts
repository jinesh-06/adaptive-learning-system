import { CommonMistake, PracticeChallenge, TopicQuizQuestion } from './pythonFundamentalsData';
import { JAVA_MODULE_1_TOPICS } from './javaModule1Data';
import { JAVA_MODULE_2_TOPICS } from './javaModule2Data';
import { JAVA_MODULE_3_TOPICS } from './javaModule3Data';

export interface JavaTopic {
  id: string;
  number: number;
  numberDisplay: string;
  moduleId?: string;
  moduleTitle?: string;
  title: string;
  slug: string;
  language: 'java';
  shortDescription: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced Project' | string;
  estimatedMinutes: number;
  prerequisiteId: string | null;

  // 12-15 Section Curriculum
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

export interface JavaModule {
  id: string;
  number: number;
  numberDisplay: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  topics: JavaTopic[];
}

// Re-export individual module topics
export { JAVA_MODULE_1_TOPICS, JAVA_MODULE_2_TOPICS, JAVA_MODULE_3_TOPICS };

// All 28 Lessons combined in authoritative curriculum sequence
export const JAVA_FUNDAMENTALS_TOPICS: JavaTopic[] = [
  ...JAVA_MODULE_1_TOPICS,
  ...JAVA_MODULE_2_TOPICS,
  ...JAVA_MODULE_3_TOPICS
];

// The 3 Main Curriculum Modules specified in the course prompt
export const JAVA_MODULES: JavaModule[] = [
  {
    id: 'mod-java-architecture-basics',
    number: 1,
    numberDisplay: '01',
    title: 'Module 01: Java Core Architecture & Basics',
    description: "Understand Java's platform architecture, JVM execution process, development environment, and the structure of your first Java program.",
    estimatedMinutes: 125,
    topics: JAVA_MODULE_1_TOPICS
  },
  {
    id: 'mod-java-fundamentals-control',
    number: 2,
    numberDisplay: '02',
    title: 'Module 02: Java Fundamentals & Control Structures',
    description: 'Master variables, data types, operators, user input, conditional statements, and loops to build logical Java programs.',
    estimatedMinutes: 230,
    topics: JAVA_MODULE_2_TOPICS
  },
  {
    id: 'mod-java-methods-arrays',
    number: 3,
    numberDisplay: '03',
    title: 'Module 03: Java Methods & Arrays',
    description: 'Build reusable Java programs using methods, arrays, strings, and structured problem-solving techniques.',
    estimatedMinutes: 245,
    topics: JAVA_MODULE_3_TOPICS
  }
];

// Backward-compatibility lookup helper supporting older legacy IDs
export const getJavaTopicById = (id: string): JavaTopic | undefined => {
  if (id === 'top-java-fundamentals') {
    return JAVA_FUNDAMENTALS_TOPICS[0]; // maps to Lesson 01
  }
  if (id === 'top-java-control-flow') {
    return JAVA_FUNDAMENTALS_TOPICS[12]; // maps to Lesson 13 (Conditionals)
  }
  if (id === 'top-java-methods-arrays') {
    return JAVA_FUNDAMENTALS_TOPICS[17]; // maps to Lesson 18 (Methods)
  }
  return JAVA_FUNDAMENTALS_TOPICS.find(t => t.id === id);
};
