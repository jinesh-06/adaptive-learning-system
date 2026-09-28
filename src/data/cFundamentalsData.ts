import { CommonMistake, PracticeChallenge, TopicQuizQuestion } from './pythonFundamentalsData';

export interface CTopic {
  id: string;
  number: number;
  numberDisplay: string;
  title: string;
  slug: string;
  language: 'c';
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

export const C_FUNDAMENTALS_TOPICS: CTopic[] = [
  {
    id: 'top-c-fundamentals',
    number: 1,
    numberDisplay: '01',
    title: 'C Fundamentals, Data Types & Console I/O',
    slug: 'c-fundamentals-datatypes-io',
    language: 'c',
    shortDescription: 'Master the foundational C programming model, variable declarations, memory sizes, format specifiers, and standard I/O (printf, scanf).',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: null,
    learningObjectives: [
      'Understand the C compilation stages: Preprocessor, Compiler, Assembler, and Linker',
      'Declare primitive data types with exact memory byte widths (char, int, float, double)',
      'Perform formatted console I/O using printf() and scanf() with precise format specifiers',
      'Understand memory addresses and the importance of & in variable assignments'
    ],
    conceptExplanation: `C is a procedural, statically-typed programming language developed in 1972 by Dennis Ritchie at Bell Labs. It remains the lingua franca of system programming, operating system kernels (Linux, Windows, macOS), embedded hardware, and high-performance game engines.

Unlike interpreted languages, C source code (*.c) is compiled directly into native machine instructions via four distinct phases:
1. **Preprocessing (cpp)**: Header expansions (#include), macro substitutions (#define), and conditional compilation (#ifdef).
2. **Compilation**: Translates preprocessed source code into assembly language instructions.
3. **Assembly**: Translates assembly instructions into machine binary object files (*.o / *.obj).
4. **Linking (ld)**: Merges object files and standard library definitions into a single runnable executable.

Every C program begins execution at the main() function entry point:
\`int main(void)\` returns an integer exit status code back to the host operating system (where 0 indicates successful execution).`,
    simpleExample: {
      code: `#include <stdio.h>

int main(void) {
    int age = 21;
    double score = 95.5;
    printf("Age: %d, Score: %.1f\\n", age, score);
    return 0;
}`,
      explanation: 'The code includes standard input/output prototypes, declares integer and floating-point variables on the stack, and prints them with %d and %.1f format specifiers.'
    },
    syntax: `// Standard C Program Structure
#include <stdio.h>

int main(void) {
    // 1. Primitive Declarations & Sizes
    char letter = 'A';          // 1 byte: -128 to 127
    int count = 42;             // 4 bytes: -2,147,483,648 to 2,147,483,647
    float price = 19.99f;       // 4 bytes: ~7 decimal digits of precision
    double pi = 3.1415926535;   // 8 bytes: ~15 decimal digits of precision

    // 2. Formatted Output
    printf("Char: %c, Int: %d, Float: %.2f, Double: %.6f\\n", letter, count, price, pi);

    // 3. Address Inspection
    printf("Memory address of count: %p\\n", (void*)&count);

    return 0;
}`,
    codeExample: `#include <stdio.h>

int main(void) {
    int units = 5;
    double unit_price = 12.50;
    double total = units * unit_price;

    printf("=== Invoice Summary ===\\n");
    printf("Units Purchased: %d\\n", units);
    printf("Price per Unit:  $%.2f\\n", unit_price);
    printf("Total Cost:      $%.2f\\n", total);
    printf("Memory Size:     %zu bytes\\n", sizeof(total));

    return 0;
}`,
    expectedOutput: `=== Invoice Summary ===
Units Purchased: 5
Price per Unit:  $12.50
Total Cost:      $62.50
Memory Size:     8 bytes`,
    stepByStep: [
      '1. #include <stdio.h> provides function signatures for printf and scanf.',
      '2. Variables "units", "unit_price", and "total" are allocated in the local stack frame.',
      '3. Arithmetic multiplication (units * unit_price) promotes "units" to double precision automatically.',
      '4. printf interprets format specifiers: %d for signed integers and %.2f for double-precision floats formatted to 2 decimals.',
      '5. sizeof(total) returns the unsigned memory footprint (8 bytes on 64-bit architectures).'
    ],
    commonMistakes: [
      {
        mistake: 'scanf("%d", num); // Missing address-of & operator',
        correction: 'scanf("%d", &num); // Correctly passes the memory pointer',
        explanation: 'scanf expects the memory address where the read value should be stored. Passing a raw integer causes an invalid memory dereference (Segmentation Fault).'
      },
      {
        mistake: 'double result = 5 / 2; // Evaluates to 2.0 instead of 2.5',
        correction: 'double result = 5.0 / 2; // Or ((double)5 / 2)',
        explanation: 'In C, dividing two integers always performs integer truncation (dropping the remainder). At least one operand must be a float or double to trigger floating-point division.'
      }
    ],
    realWorldExample: {
      scenario: 'High-Frequency Embedded Temperature Sensor',
      code: `#include <stdio.h>

int main(void) {
    int sensor_id = 402;
    double raw_celsius = 28.4;
    double fahrenheit = (raw_celsius * 9.0 / 5.0) + 32.0;

    printf("[TELEMETRY NODE #%d]\\n", sensor_id);
    printf("Raw Reading:  %.1f C\\n", raw_celsius);
    printf("Fahrenheit:   %.1f F\\n", fahrenheit);
    printf("Status:       %s\\n", (raw_celsius > 30.0) ? "WARNING: HIGH TEMP" : "NORMAL");

    return 0;
}`,
      explanation: 'Embedded controllers and RTOS microcontrollers rely on clean C math and minimal memory consumption to process telemetry streams in real time.'
    },
    practice: {
      prompt: 'Write a C program that calculates the perimeter of a rectangle with length 14 and width 6. Print: "Perimeter: 40".',
      starterCode: `#include <stdio.h>

int main(void) {
    int length = 14;
    int width = 6;
    // Calculate perimeter: 2 * (length + width)
    int perimeter = 2 * (length + width);
    printf("Perimeter: %d\\n", perimeter);
    return 0;
}`,
      expectedOutputMatcher: 'Perimeter: 40',
      hint: 'Remember: perimeter = 2 * (length + width). Print using printf("Perimeter: %d\\n", perimeter);',
      solution: `#include <stdio.h>

int main(void) {
    int length = 14;
    int width = 6;
    int perimeter = 2 * (length + width);
    printf("Perimeter: %d\\n", perimeter);
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-c-fund-1',
        question: 'Which compilation phase is responsible for expanding #include directives and #define macros?',
        options: ['Compiler', 'Preprocessor', 'Assembler', 'Linker'],
        correctIndex: 1,
        explanation: 'The Preprocessor handles all directives beginning with # before compilation begins.'
      },
      {
        id: 'mcq-c-fund-2',
        question: 'What is the result of the expression 7 / 2 in C?',
        options: ['3.5', '3', '4', 'Compilation Error'],
        correctIndex: 1,
        explanation: 'Dividing two integer literals in C performs integer truncation, yielding 3.'
      },
      {
        id: 'mcq-c-fund-3',
        question: 'Why is the & operator required when calling scanf("%d", &val)?',
        options: [
          'It instructs scanf to format the number as decimal',
          'It passes the memory address of val so scanf can write the value into it',
          'It prevents buffer overflows in stdin',
          'It is purely optional syntax sugar'
        ],
        correctIndex: 1,
        explanation: 'C passes arguments by value. To allow a function to modify a caller variable, you must pass its memory address using &.'
      }
    ],
    summary: [
      'C compiles directly to machine code via preprocessing, compilation, assembly, and linking.',
      'int main(void) is the entry point, returning 0 to the OS to signify successful completion.',
      'Data types have explicit memory byte sizes: char (1B), int (4B), float (4B), double (8B).',
      'printf and scanf format data using specifiers (%d, %f, %lf, %c, %s) with strict pointer semantics.'
    ]
  },
  {
    id: 'top-c-operators',
    number: 2,
    numberDisplay: '02',
    title: 'Arithmetic, Relational & Conditional Operators',
    slug: 'c-operators-expressions',
    language: 'c',
    shortDescription: 'Master C operators, precedence, short-circuit boolean evaluation, ternary operator, and bitwise manipulation.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-c-fundamentals',
    learningObjectives: [
      'Master prefix vs postfix increment (++i vs i++) semantics',
      'Understand short-circuit evaluation in logical AND (&&) and logical OR (||)',
      'Apply ternary conditional operator for clean expression-level branching',
      'Avoid undefined behaviors caused by modifying a variable multiple times in a single expression'
    ],
    conceptExplanation: `Operators in C provide low-level arithmetic, relational, and bitwise evaluation with explicit operator precedence rules.

Key distinctions:
- **Prefix vs Postfix**: \`++i\` increments variable \`i\` before yielding the value, while \`i++\` yields the current value before incrementing.
- **Short-Circuit Evaluation**: In \`A && B\`, if \`A\` is 0 (false), \`B\` is NEVER evaluated. In \`A || B\`, if \`A\` is non-zero (true), \`B\` is NEVER evaluated.
- **Ternary Operator**: \`condition ? expr1 : expr2\` yields values as an inline expression.`,
    simpleExample: {
      code: `#include <stdio.h>

int main(void) {
    int a = 10, b = 20;
    int max = (a > b) ? a : b;
    printf("Maximum: %d\\n", max);
    return 0;
}`,
      explanation: 'Demonstrates the ternary conditional operator evaluating the maximum value.'
    },
    syntax: `int a = 5;
int x = ++a; // a becomes 6, x is 6 (prefix)
int y = a++; // y is 6, a becomes 7 (postfix)
int result = (x > 0 && y > 0) ? 1 : 0;`,
    codeExample: `#include <stdio.h>

int main(void) {
    int score = 85;
    char grade = (score >= 90) ? 'A' : (score >= 80) ? 'B' : 'C';

    int x = 5;
    int post = x++;
    int pre = ++x;

    printf("Grade: %c\\n", grade);
    printf("post: %d, pre: %d, final x: %d\\n", post, pre, x);
    return 0;
}`,
    expectedOutput: `Grade: B
post: 5, pre: 7, final x: 7`,
    stepByStep: [
      '1. Ternary operator chains determine letter grade based on numeric score threshold.',
      '2. x++ returns original 5, then increments x to 6.',
      '3. ++x increments x from 6 to 7, then returns 7.'
    ],
    commonMistakes: [
      {
        mistake: 'int result = i++ + ++i; // Undefined Behavior!',
        correction: 'i++; int result = i + 1; // Split into sequential statements',
        explanation: 'Modifying a variable multiple times between sequence points causes undefined behavior in standard C.'
      }
    ],
    realWorldExample: {
      scenario: 'Flag Masking & Bitwise Permission Validation',
      code: `#include <stdio.h>

#define READ_PERM  (1 << 0)
#define WRITE_PERM (1 << 1)
#define EXEC_PERM  (1 << 2)

int main(void) {
    int user_perms = READ_PERM | WRITE_PERM;
    printf("Can Read?  %s\\n", (user_perms & READ_PERM) ? "YES" : "NO");
    printf("Can Exec?  %s\\n", (user_perms & EXEC_PERM) ? "YES" : "NO");
    return 0;
}`,
      explanation: 'Operating system kernels like Linux use bitwise operators to evaluate file system permissions with zero performance overhead.'
    },
    practice: {
      prompt: 'Write a C program that uses ternary operator to check if an integer number 17 is even or odd. Print "Odd".',
      starterCode: `#include <stdio.h>

int main(void) {
    int n = 17;
    printf("%s\\n", (n % 2 == 0) ? "Even" : "Odd");
    return 0;
}`,
      expectedOutputMatcher: 'Odd',
      hint: 'Use (n % 2 == 0) ? "Even" : "Odd"',
      solution: `#include <stdio.h>

int main(void) {
    int n = 17;
    printf("%s\\n", (n % 2 == 0) ? "Even" : "Odd");
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-c-op-1',
        question: 'Given int x = 3; what is the value of int y = x++;?',
        options: ['y = 3, x = 4', 'y = 4, x = 4', 'y = 3, x = 3', 'Compilation Error'],
        correctIndex: 0,
        explanation: 'Postfix increment yields the original value (3) to y, then increments x to 4.'
      }
    ],
    summary: [
      'Prefix (++x) increments before value extraction; postfix (x++) extracts before incrementing.',
      'Short-circuit logic prevents evaluation of right operands when the result is already determined.',
      'Bitwise operators (&, |, ^, ~, <<, >>) manipulate individual register bits directly.'
    ]
  },
  {
    id: 'top-c-control-flow',
    number: 3,
    numberDisplay: '03',
    title: 'Decision Making & Branching (if-else, switch)',
    slug: 'c-control-flow-branching',
    language: 'c',
    shortDescription: 'Master structured decision making in C using if, else if, else, nested logic, and jump-table switch statements.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-c-operators',
    learningObjectives: [
      'Construct multi-way decision trees using if-else if-else chains',
      'Implement fast switch-case statements with break fallthrough control',
      'Understand how C evaluates 0 as false and any non-zero value as true'
    ],
    conceptExplanation: `In C, conditionals evaluate boolean truth based on integer representation: 0 is false, while any non-zero integer is true.

The \`switch\` statement creates a jump table in compiled assembly, executing O(1) jump jumps based on integral or character constants. Every case statement must be terminated with a \`break\` statement unless intentional fallthrough is desired.`,
    simpleExample: {
      code: `#include <stdio.h>

int main(void) {
    int code = 200;
    if (code == 200) {
        printf("HTTP Status: OK\\n");
    } else {
        printf("HTTP Status: Error\\n");
    }
    return 0;
}`,
      explanation: 'Evaluates status code with if-else branching.'
    },
    syntax: `switch (expression) {
    case CONST1:
        // statements
        break;
    case CONST2:
        // statements
        break;
    default:
        // fallback
        break;
}`,
    codeExample: `#include <stdio.h>

int main(void) {
    char command = 'S';

    switch (command) {
        case 'S':
        case 's':
            printf("Action: START_ENGINE\\n");
            break;
        case 'P':
        case 'p':
            printf("Action: PAUSE_ENGINE\\n");
            break;
        default:
            printf("Action: UNKNOWN_COMMAND\\n");
            break;
    }
    return 0;
}`,
    expectedOutput: 'Action: START_ENGINE',
    stepByStep: [
      '1. Switch evaluates character constant command.',
      '2. Case \'S\' falls through to case \'s\' sharing the print statement.',
      '3. break statement halts execution and jumps past the switch block.'
    ],
    commonMistakes: [
      {
        mistake: 'if (x = 5) { ... } // Single equals is ASSIGNMENT, always evaluates to true!',
        correction: 'if (x == 5) { ... } // Double equals tests equality',
        explanation: 'Single = assigns 5 to x, and because 5 is non-zero, the condition is always evaluated as true.'
      }
    ],
    realWorldExample: {
      scenario: 'Embedded Microcontroller State Machine',
      code: `#include <stdio.h>

typedef enum { STATE_IDLE, STATE_ACTIVE, STATE_FAULT } SystemState;

int main(void) {
    SystemState current = STATE_ACTIVE;
    switch (current) {
        case STATE_IDLE:   printf("System is idling.\\n"); break;
        case STATE_ACTIVE: printf("System is processing workload.\\n"); break;
        case STATE_FAULT:  printf("Safety lockdown initiated!\\n"); break;
    }
    return 0;
}`,
      explanation: 'State machines in embedded firmware use enums and switch-case jump tables for zero-latency deterministic dispatch.'
    },
    practice: {
      prompt: 'Write a C program that tests whether an integer month number 3 is in Spring (3, 4, 5). If so, print "Spring".',
      starterCode: `#include <stdio.h>

int main(void) {
    int month = 3;
    if (month >= 3 && month <= 5) {
        printf("Spring\\n");
    }
    return 0;
}`,
      expectedOutputMatcher: 'Spring',
      hint: 'Use if (month >= 3 && month <= 5)',
      solution: `#include <stdio.h>

int main(void) {
    int month = 3;
    if (month >= 3 && month <= 5) {
        printf("Spring\\n");
    }
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-c-flow-1',
        question: 'What happens if you omit the break statement at the end of a switch case in C?',
        options: [
          'The compiler throws a SyntaxError',
          'Execution falls through into the subsequent case block',
          'The switch terminates automatically',
          'The program crashes with a segmentation fault'
        ],
        correctIndex: 1,
        explanation: 'C switch statements feature intentional fallthrough; without break, control continues into the next case.'
      }
    ],
    summary: [
      'In C, 0 represents False and any non-zero value represents True.',
      'Always use == for equality comparison, never single =.',
      'switch statements provide jump-table optimization for discrete integral conditions.'
    ]
  },
  {
    id: 'top-c-loops',
    number: 4,
    numberDisplay: '04',
    title: 'Iteration & Loop Architecture (for, while, do-while)',
    slug: 'c-loops-iteration',
    language: 'c',
    shortDescription: 'Construct high-performance iterations with for, while, do-while loops, nested loops, break, and continue.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-c-control-flow',
    learningObjectives: [
      'Choose appropriately between for, while, and do-while loops',
      'Understand the guaranteed single-execution guarantee of do-while loops',
      'Control loop flow using break (early termination) and continue (skip iteration)'
    ],
    conceptExplanation: `Loops in C execute a block of statements repeatedly based on a continuation condition.
- **for loop**: Best when the exact number of iterations is known in advance (\`for(init; cond; step)\`).
- **while loop**: Best when iteration depends on a dynamic condition evaluated before entry.
- **do-while loop**: Evaluates condition at exit, guaranteeing the loop body executes AT LEAST once.`,
    simpleExample: {
      code: `#include <stdio.h>

int main(void) {
    for (int i = 1; i <= 3; i++) {
        printf("Iteration %d\\n", i);
    }
    return 0;
}`,
      explanation: 'Classic for loop counting from 1 to 3.'
    },
    syntax: `for (int i = 0; i < N; i++) { /* code */ }
while (condition) { /* code */ }
do { /* code */ } while (condition);`,
    codeExample: `#include <stdio.h>

int main(void) {
    int sum = 0;
    for (int i = 1; i <= 5; i++) {
        if (i == 3) continue; // Skip 3
        sum += i;
    }
    printf("Sum (excluding 3): %d\\n", sum);
    return 0;
}`,
    expectedOutput: 'Sum (excluding 3): 12',
    stepByStep: [
      '1. Counter i iterates from 1 through 5.',
      '2. When i == 3, continue skips the sum accumulation step.',
      '3. 1 + 2 + 4 + 5 = 12.'
    ],
    commonMistakes: [
      {
        mistake: 'while (count < 5); { count++; } // Semicolon creates infinite empty loop!',
        correction: 'while (count < 5) { count++; } // Remove the stray semicolon',
        explanation: 'A stray semicolon after while() creates a loop that repeatedly executes an empty statement, causing an infinite freeze.'
      }
    ],
    realWorldExample: {
      scenario: 'Buffer Checksum Computation',
      code: `#include <stdio.h>

int main(void) {
    unsigned char packet[] = { 0x10, 0x24, 0x05, 0x88 };
    int checksum = 0;
    int len = sizeof(packet) / sizeof(packet[0]);

    for (int i = 0; i < len; i++) {
        checksum ^= packet[i];
    }
    printf("Computed XOR Checksum: 0x%02X\\n", checksum);
    return 0;
}`,
      explanation: 'Network drivers iterate over incoming bytes using for loops to calculate XOR parity checksums for packet integrity.'
    },
    practice: {
      prompt: 'Write a C program that computes the factorial of 5 (1*2*3*4*5) using a loop and prints "Factorial: 120".',
      starterCode: `#include <stdio.h>

int main(void) {
    int fact = 1;
    for (int i = 1; i <= 5; i++) {
        fact *= i;
    }
    printf("Factorial: %d\\n", fact);
    return 0;
}`,
      expectedOutputMatcher: 'Factorial: 120',
      hint: 'Loop i from 1 to 5, accumulating fact *= i',
      solution: `#include <stdio.h>

int main(void) {
    int fact = 1;
    for (int i = 1; i <= 5; i++) {
        fact *= i;
    }
    printf("Factorial: %d\\n", fact);
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-c-loop-1',
        question: 'Which loop construct guarantees that its body will execute at least once?',
        options: ['for loop', 'while loop', 'do-while loop', 'nested loop'],
        correctIndex: 2,
        explanation: 'A do-while loop evaluates its condition at the bottom, guaranteeing at least one execution.'
      }
    ],
    summary: [
      'for loops are ideal for indexed counter iterations.',
      'do-while executes the loop body before evaluating the condition.',
      'break exits the loop immediately; continue skips to the next iteration step.'
    ]
  },
  {
    id: 'top-c-arrays',
    number: 5,
    numberDisplay: '05',
    title: 'Single & Multidimensional Array Processing',
    slug: 'c-arrays-memory-layout',
    language: 'c',
    shortDescription: 'Understand contiguous memory layouts, zero-indexed array access, multi-dimensional matrices, and boundary safety.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-c-loops',
    learningObjectives: [
      'Understand how C arrays occupy contiguous sequential memory slots',
      'Calculate array length safely using sizeof(arr) / sizeof(arr[0])',
      'Prevent catastrophic buffer overflow vulnerabilities by enforcing boundary safety'
    ],
    conceptExplanation: `In C, an array is a collection of elements of identical data type stored in contiguous memory locations.
Array indices are strictly 0-indexed: an array of size N has valid indices from 0 up to N-1.

Crucially, **C does NOT perform array boundary checks at runtime**. Accessing \`arr[10]\` on a 5-element array results in reading or corrupting adjacent memory (Undefined Behavior / Buffer Overflow), which is the leading cause of memory-corruption security vulnerabilities.`,
    simpleExample: {
      code: `#include <stdio.h>

int main(void) {
    int primes[4] = {2, 3, 5, 7};
    printf("First prime: %d, Fourth prime: %d\\n", primes[0], primes[3]);
    return 0;
}`,
      explanation: 'Demonstrates 0-indexed array access in C.'
    },
    syntax: `type array_name[SIZE]; // Uninitialized declaration
type array_name[] = {val1, val2, val3}; // Sized by initializer
size_t count = sizeof(array_name) / sizeof(array_name[0]);`,
    codeExample: `#include <stdio.h>

int main(void) {
    int scores[] = {88, 92, 79, 95, 84};
    int len = sizeof(scores) / sizeof(scores[0]);
    int sum = 0;

    for (int i = 0; i < len; i++) {
        sum += scores[i];
    }
    double average = (double)sum / len;
    printf("Total Students: %d\\n", len);
    printf("Class Average:  %.1f\\n", average);
    return 0;
}`,
    expectedOutput: `Total Students: 5
Class Average:  87.6`,
    stepByStep: [
      '1. Array scores allocates 5 * 4 = 20 contiguous bytes on the stack.',
      '2. sizeof(scores) yields 20 bytes; sizeof(scores[0]) yields 4 bytes; len evaluates to 5.',
      '3. Loop aggregates sum and casts to double for fractional division.'
    ],
    commonMistakes: [
      {
        mistake: 'int arr[5]; arr[5] = 100; // Out-of-bounds index (valid are 0-4)',
        correction: 'arr[4] = 100; // Correct last index for size 5',
        explanation: 'Accessing index equal to the array size writes past the boundary, causing stack corruption.'
      }
    ],
    realWorldExample: {
      scenario: '2D Pixel Grayscale Matrix Transformation',
      code: `#include <stdio.h>

int main(void) {
    int matrix[2][3] = {
        {10, 20, 30},
        {40, 50, 60}
    };
    printf("Row 1, Col 2: %d\\n", matrix[0][1]);
    printf("Row 2, Col 3: %d\\n", matrix[1][2]);
    return 0;
}`,
      explanation: 'Graphics, game rendering, and image filtering store pixel grids in row-major 2D contiguous arrays.'
    },
    practice: {
      prompt: 'Write a C program that finds the maximum value in an array {12, 45, 7, 89, 23} and prints "Max: 89".',
      starterCode: `#include <stdio.h>

int main(void) {
    int arr[] = {12, 45, 7, 89, 23};
    int max = arr[0];
    for (int i = 1; i < 5; i++) {
        if (arr[i] > max) max = arr[i];
    }
    printf("Max: %d\\n", max);
    return 0;
}`,
      expectedOutputMatcher: 'Max: 89',
      hint: 'Iterate through array and update max if arr[i] > max',
      solution: `#include <stdio.h>

int main(void) {
    int arr[] = {12, 45, 7, 89, 23};
    int max = arr[0];
    for (int i = 1; i < 5; i++) {
        if (arr[i] > max) max = arr[i];
    }
    printf("Max: %d\\n", max);
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-c-arr-1',
        question: 'If int nums[10]; is declared on a 64-bit system, what is the value of sizeof(nums)?',
        options: ['10 bytes', '40 bytes', '80 bytes', '8 bytes'],
        correctIndex: 1,
        explanation: 'An int is 4 bytes. 10 ints contiguous in memory take 10 * 4 = 40 bytes.'
      }
    ],
    summary: [
      'Arrays are contiguous memory blocks with 0-indexed elements.',
      'C never enforces array bounds automatically; safety must be maintained by the developer.',
      'sizeof(arr) / sizeof(arr[0]) calculates element count for stack-allocated arrays.'
    ]
  }
];
