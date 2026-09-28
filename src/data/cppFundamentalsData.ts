import { CommonMistake, PracticeChallenge, TopicQuizQuestion } from './pythonFundamentalsData';

export interface CppTopic {
  id: string;
  number: number;
  numberDisplay: string;
  title: string;
  slug: string;
  language: 'cpp';
  shortDescription: string;
  difficulty: 'Beginner' | 'Intermediate';
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
  summary: string[];
}

export const CPP_FUNDAMENTALS_TOPICS: CppTopic[] = [
  {
    id: 'top-cpp-fundamentals',
    number: 1,
    numberDisplay: '01',
    title: 'C++ Modern Fundamentals: Type Deduction, Streams & Namespaces',
    slug: 'cpp-modern-fundamentals',
    language: 'cpp',
    shortDescription: 'Discover modern C++ (C++17/20), type deduction with auto, stream I/O via std::cin/cout, strings, and standard namespaces.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: null,
    learningObjectives: [
      'Understand the modern C++ philosophy: zero-overhead abstractions and strong static typing',
      'Use type deduction with auto to write readable, expressive, refactor-resilient code',
      'Perform type-safe console stream I/O using std::cin, std::cout, and std::endl',
      'Manage symbol visibility using namespaces and avoid "using namespace std;" anti-patterns'
    ],
    conceptExplanation: `C++ was created by Bjarne Stroustrup in 1979 as an enhancement to the C language ("C with Classes"). Since C++11, C++ has undergone a massive modernization, emphasizing type safety, RAII (Resource Acquisition Is Initialization), smart pointers, and zero-cost abstractions.

Core Modern C++ Highlights:
1. **Type Deduction (\`auto\`)**: The compiler deduces the exact type from the initialization expression at compile time with zero runtime overhead.
2. **Standard Streams (\`<iostream>\`)**: Type-safe stream insertion (\`<<\`) and extraction (\`>>\`) replace error-prone C format specifiers.
3. **Namespaces**: The standard library is housed in the \`std::\` namespace, preventing global identifier collisions.
4. **Standard Strings (\`std::string\`)**: Safe, dynamically-resized string objects with rich member functions replacing raw null-terminated C char arrays.`,
    simpleExample: {
      code: `#include <iostream>
#include <string>

int main() {
    auto language = std::string("Modern C++");
    auto version = 20;
    std::cout << "Welcome to " << language << " " << version << "!" << std::endl;
    return 0;
}`,
      explanation: 'Uses auto type deduction and type-safe stream output with std::cout and std::endl.'
    },
    syntax: `// Standard Modern C++ Entry
#include <iostream>
#include <string>
#include <vector>

int main() {
    // 1. auto type deduction
    auto count = 100;                 // deduced as int
    auto ratio = 3.14159;             // deduced as double
    auto name = std::string("Ada");   // deduced as std::string

    // 2. Stream I/O
    std::cout << name << " counted " << count << " items." << std::endl;

    // 3. Range-based for loop
    std::vector<int> numbers = {10, 20, 30};
    for (const auto& num : numbers) {
        std::cout << num << " ";
    }
    std::cout << "\\n";

    return 0;
}`,
    codeExample: `#include <iostream>
#include <string>

int main() {
    std::string product = "Quantum Core Processor";
    auto stock = 42;
    auto price = 299.99;
    auto is_available = stock > 0;

    std::cout << "=== Product Overview ===" << std::endl;
    std::cout << "Item:      " << product << std::endl;
    std::cout << "Stock:     " << stock << " units" << std::endl;
    std::cout << "Price:     $" << price << std::endl;
    std::cout << "Available: " << (is_available ? "YES" : "NO") << std::endl;

    return 0;
}`,
    expectedOutput: `=== Product Overview ===
Item:      Quantum Core Processor
Stock:     42 units
Price:     $299.99
Available: YES`,
    stepByStep: [
      '1. #include <iostream> and <string> import standard stream and string classes.',
      '2. Variables use auto for clean, type-deduced initialization without manual verbosity.',
      '3. Stream insertion operator << chains multiple types (strings, ints, doubles) seamlessly without format specifiers.',
      '4. std::endl flushes the output buffer and emits a newline character.'
    ],
    commonMistakes: [
      {
        mistake: 'using namespace std; // Placed at top of headers or global scope',
        correction: 'std::cout << ...; // Explicit namespace prefix or scoped using std::cout;',
        explanation: '"using namespace std;" imports thousands of standard library symbols into global scope, leading to unexpected name collision errors (e.g. std::size vs local variable size).'
      },
      {
        mistake: 'auto x; // Uninitialized auto variable',
        correction: 'auto x = 0; // auto requires an initializer to deduce the type',
        explanation: 'Because auto deduces types at compile time, it cannot exist without an explicit initialization expression.'
      }
    ],
    realWorldExample: {
      scenario: 'High-Throughput Financial Order Stream',
      code: `#include <iostream>
#include <string>

int main() {
    auto ticker = std::string("NVDA");
    auto shares = 150;
    auto bid_price = 118.75;
    auto total_value = shares * bid_price;

    std::cout << "[ORDER ROUTER] BOUGHT " << shares << " of " << ticker
              << " @ $" << bid_price << " | Total: $" << total_value << std::endl;
    return 0;
}`,
      explanation: 'Electronic trading algorithms utilize modern C++ streams and type deductions to achieve microsecond latency with complete type guarantees.'
    },
    practice: {
      prompt: 'Write a modern C++ program that stores your name in an auto variable and prints "Hello Modern C++".',
      starterCode: `#include <iostream>
#include <string>

int main() {
    auto message = std::string("Hello Modern C++");
    std::cout << message << std::endl;
    return 0;
}`,
      expectedOutputMatcher: 'Hello Modern C++',
      hint: 'Use std::cout << message << std::endl;',
      solution: `#include <iostream>
#include <string>

int main() {
    auto message = std::string("Hello Modern C++");
    std::cout << message << std::endl;
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-fund-1',
        question: 'When is the type of an auto variable determined in modern C++?',
        options: ['At runtime by dynamic inspection', 'At compile-time based on the initializer', 'At program launch by the OS loader', 'When the variable is first accessed'],
        correctIndex: 1,
        explanation: 'In C++, auto is strictly compile-time type deduction with zero runtime overhead or performance penalty.'
      },
      {
        id: 'mcq-cpp-fund-2',
        question: 'Why is "using namespace std;" discouraged in professional C++ codebases?',
        options: [
          'It degrades runtime performance by 50%',
          'It causes global symbol namespace pollution and name collisions',
          'It disables compiler optimizations',
          'It is deprecated in C++20'
        ],
        correctIndex: 1,
        explanation: 'Importing the entire standard library into global scope causes ambiguous symbol conflicts with user-defined identifiers.'
      },
      {
        id: 'mcq-cpp-fund-3',
        question: 'What is the primary difference between \\n and std::endl in C++?',
        options: [
          '\\n only works on Linux; std::endl works everywhere',
          'std::endl inserts a newline AND explicitly flushes the output stream buffer',
          'std::endl is 10x faster than \\n',
          'There is zero difference'
        ],
        correctIndex: 1,
        explanation: 'std::endl writes a newline and triggers a stream flush (std::flush), which can cause performance overhead in tight loops.'
      }
    ],
    summary: [
      'Modern C++ combines low-level hardware performance with expressive high-level abstractions.',
      'auto deduces types at compile-time with zero runtime penalty.',
      'Streams (std::cin, std::cout) provide safe, extensible, type-checked input/output.',
      'Always prefix standard library classes with std:: to maintain clean identifier hygiene.'
    ]
  },
  {
    id: 'top-cpp-control-functions',
    number: 2,
    numberDisplay: '02',
    title: 'Control Flow, Function Overloading & Default Arguments',
    slug: 'cpp-functions-overloading',
    language: 'cpp',
    shortDescription: 'Master modern control flow (init-statements in if/switch), function overloading, default parameters, and inline functions.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-cpp-fundamentals',
    learningObjectives: [
      'Apply function overloading based on argument signatures',
      'Configure default parameter values in function prototypes',
      'Use C++17 if-statements with initializers: if (auto val = expr; cond)'
    ],
    conceptExplanation: `C++ enhances standard functions with:
1. **Function Overloading**: Multiple functions can share the exact same name as long as their parameter types or argument counts differ.
2. **Default Arguments**: Trailing parameters can declare fallback values.
3. **C++17 Init Statements**: Scope variables directly within \`if\` and \`switch\` headers: \`if (auto status = check(); status.ok()) { ... }\`.`,
    simpleExample: {
      code: `#include <iostream>

void greet(std::string name, std::string prefix = "Hello") {
    std::cout << prefix << ", " << name << "!" << std::endl;
}

int main() {
    greet("Alice");
    greet("Bob", "Good morning");
    return 0;
}`,
      explanation: 'Demonstrates default argument fallback in modern C++.'
    },
    syntax: `// Function Overloading
int add(int a, int b) { return a + b; }
double add(double a, double b) { return a + b; }

// C++17 if with initializer
if (auto count = getItems(); count > 0) {
    std::cout << "Items found: " << count << std::endl;
}`,
    codeExample: `#include <iostream>

int multiply(int a, int b) { return a * b; }
double multiply(double a, double b) { return a * b; }

int main() {
    std::cout << "Int Mult:    " << multiply(4, 5) << std::endl;
    std::cout << "Double Mult: " << multiply(2.5, 4.0) << std::endl;
    return 0;
}`,
    expectedOutput: `Int Mult:    20
Double Mult: 10`,
    stepByStep: [
      '1. Compiler inspects parameter signatures at the call site.',
      '2. multiply(4, 5) dispatches to the (int, int) overload.',
      '3. multiply(2.5, 4.0) dispatches to the (double, double) overload.'
    ],
    commonMistakes: [
      {
        mistake: 'void func(int a = 10, int b); // Non-trailing default argument',
        correction: 'void func(int b, int a = 10); // Defaults must be trailing on the right',
        explanation: 'Default arguments must appear on the rightmost parameters so arguments align unambiguously at the call site.'
      }
    ],
    realWorldExample: {
      scenario: 'High-Performance Graphics Color Blender',
      code: `#include <iostream>

unsigned int blend(unsigned int c1, unsigned int c2) { return (c1 + c2) / 2; }
double blend(double c1, double c2, double alpha = 0.5) { return c1 * alpha + c2 * (1.0 - alpha); }

int main() {
    std::cout << "Int Blend: " << blend(200, 100) << std::endl;
    std::cout << "Alpha Blend: " << blend(1.0, 0.0, 0.75) << std::endl;
    return 0;
}`,
      explanation: 'Rendering pipelines overload math functions to optimize between integer hardware registers and floating-point shader pipelines.'
    },
    practice: {
      prompt: 'Write a C++ program with an overloaded function "square" that works for int (3 -> 9) and double (2.5 -> 6.25). Print square(4).',
      starterCode: `#include <iostream>

int square(int n) { return n * n; }
double square(double n) { return n * n; }

int main() {
    std::cout << square(4) << std::endl;
    return 0;
}`,
      expectedOutputMatcher: '16',
      hint: 'Call square(4)',
      solution: `#include <iostream>

int square(int n) { return n * n; }
double square(double n) { return n * n; }

int main() {
    std::cout << square(4) << std::endl;
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-over-1',
        question: 'Which of the following functions can NOT legally overload int calc(int a)?',
        options: ['double calc(double a)', 'double calc(int a)', 'int calc(int a, int b)', 'int calc(double a)'],
        correctIndex: 1,
        explanation: 'Functions cannot be overloaded based solely on return type in C++; their parameter lists must differ.'
      }
    ],
    summary: [
      'Function overloading selects implementations based on parameter types and counts.',
      'Default arguments must be the rightmost trailing parameters.',
      'C++17 scoped initializers keep variables localized inside if and switch statements.'
    ]
  },
  {
    id: 'top-cpp-references-memory',
    number: 3,
    numberDisplay: '03',
    title: 'Pointers, References & Dynamic Memory (new/delete)',
    slug: 'cpp-references-pointers-memory',
    language: 'cpp',
    shortDescription: 'Master lvalue references (&), pointers (*), dynamic heap allocation with new and delete, and the foundation of RAII.',
    difficulty: 'Intermediate',
    estimatedMinutes: 20,
    prerequisiteId: 'top-cpp-control-functions',
    learningObjectives: [
      'Distinguish between pass-by-value, pass-by-pointer, and pass-by-reference',
      'Understand that references cannot be null and cannot be reseated after initialization',
      'Manage heap memory safely using new and delete without memory leaks'
    ],
    conceptExplanation: `In C++, a **Reference (\`type&\`)** is an alias for an existing object in memory.
Unlike pointers:
1. References **cannot be null**.
2. References **must be initialized upon declaration**.
3. References **cannot be reassigned** to refer to a different object after binding.

Passing by \`const type&\` avoids expensive copy constructors while preserving read-only safety.`,
    simpleExample: {
      code: `#include <iostream>

void swap(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int x = 10, y = 20;
    swap(x, y);
    std::cout << "x: " << x << ", y: " << y << std::endl;
    return 0;
}`,
      explanation: 'Demonstrates pass-by-reference altering caller variables without explicit pointer dereferencing.'
    },
    syntax: `int val = 42;
int& ref = val;        // Alias to val (&ref == &val)
const int& cRef = val; // Read-only alias

int* ptr = new int(100); // Heap allocation
delete ptr;              // Free memory
ptr = nullptr;`,
    codeExample: `#include <iostream>

int main() {
    int original = 50;
    int& alias = original;

    alias = 99; // Modifies original directly
    std::cout << "Original Value: " << original << std::endl;
    std::cout << "Same Address?   " << (&original == &alias ? "YES" : "NO") << std::endl;

    return 0;
}`,
    expectedOutput: `Original Value: 99
Same Address?   YES`,
    stepByStep: [
      '1. original is allocated on the stack with value 50.',
      '2. alias is bound as an lvalue reference to original (sharing the identical memory address).',
      '3. Mutating alias changes original immediately without pointer dereference syntax.'
    ],
    commonMistakes: [
      {
        mistake: 'int* p = new int[10]; delete p; // Mismatched delete operator',
        correction: 'delete[] p; // Array allocations must use delete[]',
        explanation: 'Allocations made with new[] must be freed with delete[] to ensure all destructors run.'
      }
    ],
    realWorldExample: {
      scenario: 'Zero-Copy Matrix Pass in Physics Simulation',
      code: `#include <iostream>
#include <vector>

void computePhysics(const std::vector<double>& largeMesh) {
    std::cout << "Processing " << largeMesh.size() << " vertices without copying memory!\\n";
}

int main() {
    std::vector<double> mesh(100000, 1.0);
    computePhysics(mesh); // Fast zero-copy reference pass
    return 0;
}`,
      explanation: 'Passing large collections by const reference avoids cloning gigabytes of data on the heap.'
    },
    practice: {
      prompt: 'Write a C++ function increment(int& n) that adds 10 to its argument. In main, pass an int initialized to 15, then print "Result: 25".',
      starterCode: `#include <iostream>

void increment(int& n) {
    n += 10;
}

int main() {
    int val = 15;
    increment(val);
    std::cout << "Result: " << val << std::endl;
    return 0;
}`,
      expectedOutputMatcher: 'Result: 25',
      hint: 'Use void increment(int& n) { n += 10; }',
      solution: `#include <iostream>

void increment(int& n) {
    n += 10;
}

int main() {
    int val = 15;
    increment(val);
    std::cout << "Result: " << val << std::endl;
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-ref-1',
        question: 'Which of the following is TRUE regarding C++ references compared to pointers?',
        options: [
          'References can be assigned to nullptr',
          'References cannot be reseated to point to another object after initialization',
          'References require explicit * dereferencing',
          'References consume 8 bytes of stack memory each time'
        ],
        correctIndex: 1,
        explanation: 'Once bound to an object, a C++ reference is permanently linked to that object.'
      }
    ],
    summary: [
      'References are permanent aliases to existing objects and cannot be null.',
      'Pass by const reference (const T&) achieves zero-copy efficiency with read-only safety.',
      'new and delete manage dynamic heap memory; always pair new[] with delete[].'
    ]
  }
];
