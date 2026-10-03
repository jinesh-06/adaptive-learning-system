import { CppTopic } from './cppFundamentalsData';

export const CPP_MODULE_2_TOPICS: CppTopic[] = [
  // =========================================================================
  // LESSON 09: Conditional Statements
  // =========================================================================
  {
    id: 'top-cpp-conditional-statements',
    number: 9,
    numberDisplay: '09',
    moduleId: 'mod-cpp-control-problem-solving',
    moduleTitle: 'Module 02: Control Flow & Problem Solving',
    title: 'Conditional Statements',
    slug: 'conditional-statements-in-cpp',
    language: 'cpp',
    shortDescription: 'Master boolean decision branching: if, if-else, else-if ladders, nested conditions, short-circuiting, and ternary expressions.',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    prerequisiteId: 'top-cpp-type-conversion',
    learningObjectives: [
      'Implement single-branch, dual-branch, and multi-branch decision trees using if, if-else, and else-if ladders',
      'Construct safe nested conditional blocks avoiding dangling-else ambiguities',
      'Solve practical problems: number parity, largest of three numbers, and grading systems',
      'Optimize conditional logic using C++17 if statements with initializers'
    ],
    conceptExplanation: `### 1. The Decision-Making Process
Computers make decisions by evaluating boolean expressions. In C++, conditional statements divert control flow along different code paths depending on whether a predicate resolves to \`true\` or \`false\`.

### 2. Forms of Conditional Statements
1. **Single Branch (\`if\`)**:
   \`\`\`cpp
   if (condition) {
       // Executes only when condition is true
   }
   \`\`\`
2. **Dual Branch (\`if-else\`)**:
   \`\`\`cpp
   if (condition) {
       // Executes when condition is true
   } else {
       // Executes when condition is false
   }
   \`\`\`
3. **Multi-Way Branch (\`else-if\` ladder)**:
   Evaluated sequentially from top to bottom. As soon as one branch evaluates to \`true\`, its block executes, and the remainder of the ladder is skipped.

### 3. Nested If Statements
An \`if\` or \`else\` block can contain another \`if\` statement inside it.
* *Dangling Else Rule*: An \`else\` clause is always paired with the closest preceding unmatched \`if\` in the same block. Always use curly braces \`{ ... }\` to avoid ambiguity.

### 4. Modern C++17: \`if\` with Initializer
Since C++17, you can declare and initialize a variable strictly within the scope of the \`if\` statement:
\`\`\`cpp
if (int status = checkSystem(); status == 0) {
    std::cout << "System Healthy\\n";
} else {
    std::cout << "Error Code: " << status << "\\n";
}
// status is automatically cleaned up and out of scope here!
\`\`\`

### 5. Practical Decision Logic: Grade Determination
\`\`\`text
Score >= 90  -> Grade A
Score >= 80  -> Grade B
Score >= 70  -> Grade C
Score >= 60  -> Grade D
Score < 60   -> Grade F
\`\`\``,
    simpleExample: {
      code: `#include <iostream>

int main() {
    int score = 85;
    if (score >= 90) {
        std::cout << "Grade: A\\n";
    } else if (score >= 80) {
        std::cout << "Grade: B\\n";
    } else {
        std::cout << "Grade: C or below\\n";
    }
    return 0;
}`,
      explanation: 'Evaluates score 85 sequentially: falls through the first branch and triggers Grade: B.'
    },
    syntax: `// Conditional Branch Syntax
if (condition1) {
    // Branch 1
} else if (condition2) {
    // Branch 2
} else {
    // Default fallback
}`,
    codeExample: `#include <iostream>

int main() {
    int n1 = 45, n2 = 82, n3 = 67;
    int largest;

    if (n1 >= n2 && n1 >= n3) {
        largest = n1;
    } else if (n2 >= n1 && n2 >= n3) {
        largest = n2;
    } else {
        largest = n3;
    }

    std::cout << "=== Largest of Three Numbers ===" << std::endl;
    std::cout << "Numbers: " << n1 << ", " << n2 << ", " << n3 << std::endl;
    std::cout << "Largest: " << largest << std::endl;
    return 0;
}`,
    expectedOutput: `=== Largest of Three Numbers ===
Numbers: 45, 82, 67
Largest: 82`,
    stepByStep: [
      '1. Variables n1, n2, n3 are assigned 45, 82, 67.',
      '2. First test (45 >= 82) fails immediately via short-circuit evaluation.',
      '3. Second test (82 >= 45 && 82 >= 67) evaluates to true && true, resolving to true.',
      '4. Variable largest is assigned 82.',
      '5. The else branch is skipped entirely.',
      '6. Output is printed to console.'
    ],
    commonMistakes: [
      {
        mistake: 'Using assignment = instead of comparison == in condition',
        codeSnippet: `if (isValid = true) { ... } // Bug: sets isValid to true, always executes!`,
        correction: 'Use == for comparison: if (isValid == true) or simply if (isValid)',
        explanation: 'Assignment expressions in C++ return the assigned value, which evaluates as boolean true.'
      },
      {
        mistake: 'Dangling else misunderstanding without curly braces',
        codeSnippet: `if (a > 0)
    if (b > 0) std::cout << "Both positive";
else std::cout << "What does this attach to?";`,
        correction: 'Always enclose if and else bodies in explicit curly braces {}.',
        explanation: 'The else binds to the closest if (b > 0), not the outer if (a > 0).'
      },
      {
        mistake: 'Writing chained comparisons like 0 < x < 10',
        codeSnippet: `if (0 < x < 10) { ... } // Bug: (0 < x) evaluates to 0 or 1, which is always < 10!`,
        correction: 'Use logical AND: if (x > 0 && x < 10)',
        explanation: 'C++ evaluates (0 < x) first to a boolean (0 or 1), then compares that boolean against 10.'
      }
    ],
    realWorldExample: {
      scenario: 'Autonomous Flight Control Altitude Warning System',
      code: `#include <iostream>

int main() {
    double altitudeMeters = 120.0;
    double groundClearanceMeters = 15.0;

    if (groundClearanceMeters < 20.0) {
        std::cout << "[TERRAIN ALERT] Pull Up! Clearance: " << groundClearanceMeters << " m\\n";
    } else if (altitudeMeters > 10000.0) {
        std::cout << "[ALTITUDE NOTICE] Maximum flight level reached\\n";
    } else {
        std::cout << "[FLIGHT] Cruising within normal envelope\\n";
    }
    return 0;
}`,
      explanation: 'Avionics software employs tiered priority checks to alert pilots to imminent ground collisions.'
    },
    practice: {
      prompt: 'Write a C++ program that checks if integer number = 14 is positive, negative, or zero, printing "Number: Positive".',
      starterCode: `#include <iostream>

int main() {
    int number = 14;
    // Check polarity and print result
    return 0;
}`,
      expectedOutputMatcher: 'Number: Positive',
      hint: 'Use if (number > 0) { std::cout << "Number: Positive\\n"; }',
      solution: `#include <iostream>

int main() {
    int number = 14;
    if (number > 0) {
        std::cout << "Number: Positive\\n";
    } else if (number < 0) {
        std::cout << "Number: Negative\\n";
    } else {
        std::cout << "Number: Zero\\n";
    }
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-cond-1',
        question: 'Which clause in an else-if ladder executes when none of the specified conditions are met?',
        options: ['default', 'else', 'finally', 'fallback'],
        correctIndex: 1,
        explanation: 'The else block serves as the default fallback branch when all preceding if and else-if conditions evaluate to false.'
      },
      {
        id: 'mcq-cpp-cond-2',
        question: 'In C++, what does an else clause bind to in the absence of curly braces?',
        options: [
          'The first if statement in the file',
          'The closest preceding unmatched if statement in the same scope',
          'The main() function',
          'It triggers a mandatory syntax error'
        ],
        correctIndex: 1,
        explanation: 'According to the C++ grammar rules, an else binds to the nearest preceding if.'
      },
      {
        id: 'mcq-cpp-cond-3',
        question: 'What is the correct way to test if a variable x lies between 10 and 20 inclusive in C++?',
        options: ['10 <= x <= 20', 'x >= 10 && x <= 20', 'x in (10, 20)', 'x between 10 and 20'],
        correctIndex: 1,
        explanation: 'C++ requires connecting the two separate relational tests using the logical AND operator (&&).'
      },
      {
        id: 'mcq-cpp-cond-4',
        question: 'What C++17 feature allows declaring a variable scoped exclusively to an if statement?',
        options: ['auto if', 'if with initializer', 'scoped if', 'let if'],
        correctIndex: 1,
        explanation: 'C++17 introduced "if with initializer", written as if (init; condition) { ... }.'
      },
      {
        id: 'mcq-cpp-cond-5',
        question: 'If int x = 0, what does "if (x) { ... } else { std::cout << \"Zero\"; }" output?',
        options: ['Compilation Error', 'Zero', 'Nothing', '1'],
        correctIndex: 1,
        explanation: 'In C++, integer 0 converts to boolean false, triggering the else branch.'
      }
    ],
    codingChallenge: {
      title: 'Voting Eligibility Verifier',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program with int age = 21 that checks eligibility (minimum age 18) and outputs "Status: Eligible to Vote". If under 18, it would output "Status: Not Eligible".',
      input_format: 'No input.',
      output_format: 'One line: "Status: Eligible to Vote".',
      constraints: 'Use if-else statement.',
      starter_code: `#include <iostream>

int main() {
    int age = 21;
    // Check eligibility and print
    return 0;
}`,
      expected_output: `Status: Eligible to Vote`,
      test_cases: [
        {
          input: '',
          expected_output: `Status: Eligible to Vote`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Conditional branching diverts program flow based on boolean predicate evaluations.',
      'else-if ladders evaluate sequentially until the first true branch is found.',
      'Always use explicit curly braces to eliminate dangling else bugs.',
      'C++17 if-with-initializer limits variable lifetimes to the conditional block.'
    ]
  },

  // =========================================================================
  // LESSON 10: Switch Statements
  // =========================================================================
  {
    id: 'top-cpp-switch-statements',
    number: 10,
    numberDisplay: '10',
    moduleId: 'mod-cpp-control-problem-solving',
    moduleTitle: 'Module 02: Control Flow & Problem Solving',
    title: 'Switch Statements',
    slug: 'switch-statements-in-cpp',
    language: 'cpp',
    shortDescription: 'Master multi-way constant branching with switch, case labels, break control, deliberate fallthrough, and C++17 [[fallthrough]] attribute.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-cpp-conditional-statements',
    learningObjectives: [
      'Implement multi-way jump branching using switch, case, and default statements',
      'Explain the crucial role of the break statement and analyze fall-through behavior',
      'Compare when to use switch vs if-else ladders in terms of performance and compiler jump tables',
      'Use modern C++17 [[fallthrough]] attribute to document intentional case fallthrough'
    ],
    conceptExplanation: `### 1. What is a Switch Statement?
A \`switch\` statement is a control flow construct that routes execution to one of multiple \`case\` labels based on the value of a single integral or enumeration expression.

### 2. Syntax & Mechanics
\`\`\`cpp
switch (expression) {
    case CONSTANT_1:
        // Statements
        break;
    case CONSTANT_2:
        // Statements
        break;
    default:
        // Fallback statements
        break;
}
\`\`\`

#### Key Rules:
* The \`expression\` must evaluate to an **integral type** (\`int\`, \`char\`, \`short\`, \`long\`) or an **enumeration (\`enum\`)**. Floating-point numbers and strings are NOT allowed.
* Every \`case\` label must be a **compile-time constant expression**.
* **\`break\`** causes the program to jump completely out of the \`switch\` block.
* **\`default\`** executes when no \`case\` matches.

### 3. Fall-Through Behavior
If you omit the \`break\` statement, execution **falls through** directly into the subsequent case statements, executing them regardless of whether their condition matches!
While occasionally useful (e.g., grouping multiple cases together), accidental fallthrough is a notorious source of bugs.
In modern C++17, intentional fallthrough can be annotated with the **\`[[fallthrough]];\`** attribute to silence compiler warnings.

### 4. Switch vs If-Else: Performance & Jump Tables
When a \`switch\` has many consecutive cases, the C++ compiler can generate a **Jump Table** (or branch table) in machine code.
* **\`if-else\`**: Must evaluate each condition sequentially ($O(N)$ comparisons in worst case).
* **\`switch\`**: Uses an indexed jump table to branch directly to the target code in constant time ($O(1)$).`,
    simpleExample: {
      code: `#include <iostream>

int main() {
    int day = 3;
    switch (day) {
        case 1: std::cout << "Monday\\n"; break;
        case 2: std::cout << "Tuesday\\n"; break;
        case 3: std::cout << "Wednesday\\n"; break;
        default: std::cout << "Other day\\n"; break;
    }
    return 0;
}`,
      explanation: 'Evaluates day 3 and immediately jumps to case 3, outputs Wednesday, and breaks.'
    },
    syntax: `// Switch Statement Structure
switch (integral_variable) {
    case VALUE_A:
        // Executed for VALUE_A
        break;
    case VALUE_B:
    case VALUE_C: // Multiple cases grouped
        // Executed for VALUE_B or VALUE_C
        break;
    default:
        // Executed if no case matched
        break;
}`,
    codeExample: `#include <iostream>

int main() {
    char op = '+';
    int a = 20, b = 5;

    std::cout << "=== Switch Arithmetic Calculator ===" << std::endl;
    switch (op) {
        case '+':
            std::cout << a << " + " << b << " = " << (a + b) << std::endl;
            break;
        case '-':
            std::cout << a << " - " << b << " = " << (a - b) << std::endl;
            break;
        case '*':
            std::cout << a << " * " << b << " = " << (a * b) << std::endl;
            break;
        case '/':
            std::cout << a << " / " << b << " = " << (a / b) << std::endl;
            break;
        default:
            std::cout << "Unknown operation" << std::endl;
            break;
    }
    return 0;
}`,
    expectedOutput: `=== Switch Arithmetic Calculator ===
20 + 20 = 25
20 + 5 = 25`,
    stepByStep: [
      '1. Operator variable op is initialized to character \'+\' (ASCII 43).',
      '2. Switch expression tests op and jumps directly to matching case \'+\'.',
      '3. 20 + 5 = 25 is streamed to stdout.',
      '4. break statement terminates the switch block immediately.',
      '5. Subsequent cases (-, *, /) are skipped entirely.',
      '6. Function exits cleanly with return code 0.'
    ],
    commonMistakes: [
      {
        mistake: 'Forgetting the break statement (unintended fall-through)',
        codeSnippet: `switch (val) {
    case 1: std::cout << "One"; // Missing break!
    case 2: std::cout << "Two"; break;
}`,
        correction: 'Always include break; at the end of each case unless deliberate fall-through is required.',
        explanation: 'Without break, execution continues uninterrupted into the next case body.'
      },
      {
        mistake: 'Using strings or floating-point values in switch expression',
        codeSnippet: `std::string command = "START";
switch (command) { ... } // Compiler Error: switch quantity not an integer`,
        correction: 'Use if-else ladders or enums/hashes when switching on strings.',
        explanation: 'The C++ switch statement only accepts integral types or enumerations.'
      },
      {
        mistake: 'Declaring and initializing variables inside a case without braces',
        codeSnippet: `switch (x) {
    case 1: int y = 10; break; // Compiler Error: jump to case label crosses initialization
    case 2: ...
}`,
        correction: 'Enclose the case block in curly braces: case 1: { int y = 10; break; }',
        explanation: 'Braces restrict the variable scope to that case, preventing scope contamination across labels.'
      }
    ],
    realWorldExample: {
      scenario: 'Embedded Telemetry Command Packet Dispatcher',
      code: `#include <iostream>

int main() {
    enum CommandCode { CMD_IDLE = 0, CMD_START = 1, CMD_RESET = 2 };
    CommandCode command = CMD_START;

    switch (command) {
        case CMD_IDLE:
            std::cout << "[SYSTEM] Standby Mode\\n";
            break;
        case CMD_START:
            std::cout << "[SYSTEM] Actuators Engaged\\n";
            break;
        case CMD_RESET:
            std::cout << "[SYSTEM] Soft Reset Initiated\\n";
            break;
        default:
            std::cout << "[SYSTEM] Invalid Command\\n";
            break;
    }
    return 0;
}`,
      explanation: 'Microcontroller firmware processes network command packets using enum-based switch jump tables.'
    },
    practice: {
      prompt: 'Write a C++ program using a switch on int level = 2 that prints "Access: Moderated". Case 1 prints "Access: Guest", Case 2 prints "Access: Moderated", Default prints "Access: Admin".',
      starterCode: `#include <iostream>

int main() {
    int level = 2;
    // Write switch statement
    return 0;
}`,
      expectedOutputMatcher: 'Access: Moderated',
      hint: 'Use case 2: std::cout << "Access: Moderated\\n"; break;',
      solution: `#include <iostream>

int main() {
    int level = 2;
    switch (level) {
        case 1:
            std::cout << "Access: Guest\\n";
            break;
        case 2:
            std::cout << "Access: Moderated\\n";
            break;
        default:
            std::cout << "Access: Admin\\n";
            break;
    }
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-switch-1',
        question: 'Which of the following data types CANNOT be used as a switch expression in C++?',
        options: ['int', 'char', 'double', 'enum'],
        correctIndex: 2,
        explanation: 'Floating-point types (float, double) cannot be used in a switch expression.'
      },
      {
        id: 'mcq-cpp-switch-2',
        question: 'What occurs if a break statement is omitted from a matched case block?',
        options: [
          'The compiler rejects the code with a fatal syntax error',
          'Execution falls through into the next case, executing its statements regardless of condition',
          'The program terminates immediately',
          'The default case is invoked'
        ],
        correctIndex: 1,
        explanation: 'Execution falls through to the following case statements sequentially until a break is encountered.'
      },
      {
        id: 'mcq-cpp-switch-3',
        question: 'What compiler optimization makes switch faster than long if-else ladders for dense cases?',
        options: ['Garbage collection', 'Jump Table (Branch Table)', 'Dynamic linking', 'Heap caching'],
        correctIndex: 1,
        explanation: 'Compilers construct indexed jump tables that allow jumping to the matching address in O(1) time.'
      },
      {
        id: 'mcq-cpp-switch-4',
        question: 'What C++17 attribute explicitly indicates that a fall-through between cases is intentional?',
        options: ['[[continue]]', '[[fallthrough]]', '[[next]]', '[[no_break]]'],
        correctIndex: 1,
        explanation: '[[fallthrough]] informs the compiler that fallthrough is intended, silencing compiler warnings.'
      },
      {
        id: 'mcq-cpp-switch-5',
        question: 'Which keyword executes when no case matches the tested switch value?',
        options: ['fallback', 'else', 'default', 'otherwise'],
        correctIndex: 2,
        explanation: 'The default label catches all unmatched values.'
      }
    ],
    codingChallenge: {
      title: 'Menu Action Dispatcher',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program with int choice = 3 that switches on choice: Case 1 prints "Action: Start", Case 2 prints "Action: Pause", Case 3 prints "Action: Stop".',
      input_format: 'No input.',
      output_format: 'One line: "Action: Stop".',
      constraints: 'Use a switch statement with break statements.',
      starter_code: `#include <iostream>

int main() {
    int choice = 3;
    // Dispatch menu action
    return 0;
}`,
      expected_output: `Action: Stop`,
      test_cases: [
        {
          input: '',
          expected_output: `Action: Stop`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'switch provides fast multi-way branching for integral and enum values.',
      'Always use break to prevent accidental case fall-through.',
      'Compilers optimize dense switch statements into O(1) jump tables.',
      'default acts as the catch-all fallback block for unmatched values.'
    ]
  },

  // =========================================================================
  // LESSON 11: Loops in C++
  // =========================================================================
  {
    id: 'top-cpp-loops',
    number: 11,
    numberDisplay: '11',
    moduleId: 'mod-cpp-control-problem-solving',
    moduleTitle: 'Module 02: Control Flow & Problem Solving',
    title: 'Loops in C++',
    slug: 'loops-in-cpp',
    language: 'cpp',
    shortDescription: 'Master iteration constructs: for loops, while loops, do-while loops, entry vs exit controlled loops, and dry-run iteration tables.',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    prerequisiteId: 'top-cpp-switch-statements',
    learningObjectives: [
      'Construct deterministic iteration loops using the for statement',
      'Implement condition-driven iteration using entry-controlled while loops',
      'Guarantee at least one execution pass using exit-controlled do-while loops',
      'Trace loop variable states using structured dry-run iteration tables'
    ],
    conceptExplanation: `### 1. Why Loops are Needed
Loops automate repetitive execution of statements until a termination condition is reached, avoiding copy-paste code and reducing complexity.

### 2. The Three Primary C++ Loops
1. **\`for\` Loop (Entry-Controlled)**:
   Best when the number of iterations is known in advance:
   \`\`\`cpp
   for (initialization; condition; increment/decrement) {
       // Loop body
   }
   \`\`\`
2. **\`while\` Loop (Entry-Controlled)**:
   Best when repeating based on a condition whose duration is dynamic:
   \`\`\`cpp
   while (condition) {
       // Loop body
   }
   \`\`\`
3. **\`do-while\` Loop (Exit-Controlled)**:
   Evaluates the condition at the END of the loop body. It is **guaranteed to execute at least once**:
   \`\`\`cpp
   do {
       // Loop body (runs at least once)
   } while (condition);
   \`\`\`

### 3. Dry-Run Iteration Table
Tracing \`for (int i = 1; i <= 4; i++)\`:
| Iteration | Variable \`i\` | Condition \`i <= 4\` | Body Action | Post-Increment |
| :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | true | Print 1 | \`i\` becomes 2 |
| 2 | 2 | true | Print 2 | \`i\` becomes 3 |
| 3 | 3 | true | Print 3 | \`i\` becomes 4 |
| 4 | 4 | true | Print 4 | \`i\` becomes 5 |
| 5 | 5 | false | Loop Terminates | - |

### 4. Preventing Infinite Loops
An infinite loop occurs when the termination condition never evaluates to \`false\`:
* Forgetting to increment the loop variable (\`while (count < 10) { /* missing count++ */ }\`).
* Unsigned underflow (\`for (unsigned int i = 10; i >= 0; i--)\`).`,
    simpleExample: {
      code: `#include <iostream>

int main() {
    for (int i = 1; i <= 3; i++) {
        std::cout << "Cycle: " << i << "\\n";
    }
    return 0;
}`,
      explanation: 'Executes for loop exactly 3 times, printing Cycle: 1, 2, and 3.'
    },
    syntax: `// Loop Syntax Forms
for (int i = 0; i < n; i++) { ... }
while (condition) { ... }
do { ... } while (condition);`,
    codeExample: `#include <iostream>

int main() {
    int sum = 0;
    std::cout << "=== Sum of First 5 Natural Numbers ===" << std::endl;

    for (int i = 1; i <= 5; i++) {
        sum += i;
        std::cout << "Added: " << i << " -> Running Sum: " << sum << std::endl;
    }

    std::cout << "Final Total: " << sum << std::endl;
    return 0;
}`,
    expectedOutput: `=== Sum of First 5 Natural Numbers ===
Added: 1 -> Running Sum: 1
Added: 2 -> Running Sum: 3
Added: 3 -> Running Sum: 6
Added: 4 -> Running Sum: 10
Added: 5 -> Running Sum: 15
Final Total: 15`,
    stepByStep: [
      '1. Variable sum is initialized to 0.',
      '2. Loop counter i is initialized to 1.',
      '3. At each step, i is added to sum and running sum is logged.',
      '4. i increments by 1 until i reaches 6.',
      '5. Condition 6 <= 5 evaluates to false, terminating loop.',
      '6. Final sum 15 is printed.'
    ],
    commonMistakes: [
      {
        mistake: 'Putting a semicolon right after the for or while header',
        codeSnippet: `for (int i = 0; i < 5; i++); // Semicolon creates an empty loop!
{
    std::cout << i; // Only executes once after loop finishes!
}`,
        correction: 'Never put a semicolon after for(...) or while(...) headers.',
        explanation: 'A semicolon creates a null statement, meaning the loop repeatedly executes nothing.'
      },
      {
        mistake: 'Off-by-one boundary errors (< vs <=)',
        codeSnippet: `for (int i = 0; i <= 5; i++) // Runs 6 times (0, 1, 2, 3, 4, 5)`,
        correction: 'To loop n times starting at 0, use strictly less than: for (int i = 0; i < n; i++)',
        explanation: '0 through n-1 constitutes exactly n iterations.'
      },
      {
        mistake: 'Forgetting the semicolon at the end of a do-while loop',
        codeSnippet: `do { ... } while (x < 10) // Compiler Error: expected ';' before 'return'`,
        correction: 'Always terminate do-while loops with a semicolon: do { ... } while (cond);',
        explanation: 'The C++ grammar requires a semicolon after the while condition of do-while.'
      }
    ],
    realWorldExample: {
      scenario: 'Network Socket Connection Retry with Exponential Backoff',
      code: `#include <iostream>

int main() {
    int attempts = 0;
    const int maxAttempts = 3;

    while (attempts < maxAttempts) {
        attempts++;
        std::cout << "[NETWORK] Connecting to Server... Attempt " << attempts << "\\n";
    }
    std::cout << "[NETWORK] Connection Established successfully\\n";
    return 0;
}`,
      explanation: 'Network clients use while loops with attempt limits to establish stable TCP connections.'
    },
    practice: {
      prompt: 'Write a C++ program that uses a for loop to print numbers from 1 to 3 separated by spaces: "1 2 3 ".',
      starterCode: `#include <iostream>

int main() {
    // Print 1 2 3 with a for loop
    return 0;
}`,
      expectedOutputMatcher: '1 2 3',
      hint: 'for (int i = 1; i <= 3; i++) std::cout << i << " ";',
      solution: `#include <iostream>

int main() {
    for (int i = 1; i <= 3; i++) {
        std::cout << i << " ";
    }
    std::cout << "\\n";
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-loop-1',
        question: 'Which loop construct is exit-controlled and guaranteed to execute at least once?',
        options: ['for loop', 'while loop', 'do-while loop', 'range-based for loop'],
        correctIndex: 2,
        explanation: 'do-while tests its condition at the bottom, guaranteeing at least one execution of its body.'
      },
      {
        id: 'mcq-cpp-loop-2',
        question: 'How many times does "for (int i = 0; i < 5; i++)" execute its body?',
        options: ['4 times', '5 times', '6 times', '0 times'],
        correctIndex: 1,
        explanation: 'The loop executes for i = 0, 1, 2, 3, 4, which is exactly 5 iterations.'
      },
      {
        id: 'mcq-cpp-loop-3',
        question: 'What is the consequence of placing a semicolon immediately after "while (condition);"?',
        options: [
          'It compiles into an empty loop that may hang indefinitely if condition is true',
          'It doubles loop speed',
          'It causes a mandatory compiler crash',
          'It automatically converts the loop to a do-while'
        ],
        correctIndex: 0,
        explanation: 'The semicolon creates a null statement as the loop body, repeating indefinitely without executing subsequent blocks.'
      },
      {
        id: 'mcq-cpp-loop-4',
        question: 'Which loop is typically preferred when iterating over a fixed, known count of steps?',
        options: ['while loop', 'for loop', 'do-while loop', 'goto loop'],
        correctIndex: 1,
        explanation: 'for loops package initialization, condition, and increment in one clean header.'
      },
      {
        id: 'mcq-cpp-loop-5',
        question: 'What is the value of i after exiting "for (int i = 1; i <= 3; i++)" if i were declared outside?',
        options: ['3', '4', '2', '5'],
        correctIndex: 1,
        explanation: 'The loop terminates when i becomes 4, failing 4 <= 3.'
      }
    ],
    codingChallenge: {
      title: 'Factorial Calculator Loop',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program that computes the factorial of 5 (5! = 5 * 4 * 3 * 2 * 1) using a loop and outputs "5! = 120".',
      input_format: 'No input.',
      output_format: 'One line: "5! = 120".',
      constraints: 'Compute factorial using an iterative loop.',
      starter_code: `#include <iostream>

int main() {
    int n = 5;
    int fact = 1;
    // Calculate factorial and print
    return 0;
}`,
      expected_output: `5! = 120`,
      test_cases: [
        {
          input: '',
          expected_output: `5! = 120`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'for loops are ideal for deterministic counting iterations.',
      'while loops repeat as long as a condition holds true.',
      'do-while loops guarantee at least one execution pass before testing condition.',
      'Dry-run iteration tables trace variable states and prevent off-by-one mistakes.'
    ]
  },

  // =========================================================================
  // LESSON 12: Break and Continue
  // =========================================================================
  {
    id: 'top-cpp-break-continue',
    number: 12,
    numberDisplay: '12',
    moduleId: 'mod-cpp-control-problem-solving',
    moduleTitle: 'Module 02: Control Flow & Problem Solving',
    title: 'Break and Continue',
    slug: 'break-and-continue-in-cpp',
    language: 'cpp',
    shortDescription: 'Control loop execution flow using break to abort iteration early and continue to skip to the next iteration cycle.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-cpp-loops',
    learningObjectives: [
      'Use the break statement to immediately terminate loop execution upon meeting early exit conditions',
      'Apply the continue statement to skip the remainder of the current iteration pass',
      'Analyze break and continue behavior inside nested loops',
      'Write clean, readable loop termination logic avoiding deep nested flags'
    ],
    conceptExplanation: `### 1. Loop Control Jump Statements
C++ provides two primary jump keywords to modify loop execution on the fly:
* **\`break\`**: Immediately breaks out of the enclosing loop or switch statement. Execution continues at the statement immediately following the loop block.
* **\`continue\`**: Immediately skips the remaining statements in the *current iteration* and jumps directly to the loop's next increment/test step.

### 2. Difference Between Break & Continue
| Feature | \`break\` | \`continue\` |
| :--- | :--- | :--- |
| **Action** | Aborts the loop completely | Skips current pass, starts next pass |
| **Loop Condition** | Never tested again | Evaluated again for next cycle |
| **Remaining Code** | Skipped | Skipped for current cycle only |
| **Common Use** | Early exit (target found, error) | Filter out invalid or unwanted items |

### 3. Behavior in Nested Loops
Crucial Rule: **\`break\` and \`continue\` only affect the innermost loop** in which they are placed.
\`\`\`cpp
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (j == 1) break; // Exits only the inner j loop!
    }
    // Outer i loop continues!
}
\`\`\``,
    simpleExample: {
      code: `#include <iostream>

int main() {
    for (int i = 1; i <= 5; i++) {
        if (i == 3) continue; // Skip 3
        if (i == 5) break;    // Stop at 5
        std::cout << i << " ";
    }
    return 0;
}`,
      explanation: 'Prints "1 2 4 ", skipping 3 due to continue and stopping before 5 due to break.'
    },
    syntax: `// Break and Continue
while (condition) {
    if (exitEarly) break;
    if (skipItem) continue;
    // Process item
}`,
    codeExample: `#include <iostream>

int main() {
    std::cout << "=== Filtering Odd Numbers (Continue) ===" << std::endl;
    for (int i = 1; i <= 6; i++) {
        if (i % 2 != 0) {
            continue; // Skip odd numbers
        }
        std::cout << "Even: " << i << std::endl;
    }

    std::cout << "=== Early Search Exit (Break) ===" << std::endl;
    int target = 4;
    for (int i = 1; i <= 10; i++) {
        if (i == target) {
            std::cout << "Found target " << target << " at step " << i << "! Exiting loop." << std::endl;
            break;
        }
    }
    return 0;
}`,
    expectedOutput: `=== Filtering Odd Numbers (Continue) ===
Even: 2
Even: 4
Even: 6
=== Early Search Exit (Break) ===
Found target 4 at step 4! Exiting loop.`,
    stepByStep: [
      '1. Loop 1: For i = 1, i % 2 != 0 is true -> continue skips printing.',
      '2. For i = 2, even number 2 is printed.',
      '3. Loop 2: Iterates from i = 1 until i == 4 matches target.',
      '4. break statement triggers, terminating the loop immediately without executing steps 5-10.',
      '5. Output displayed cleanly.'
    ],
    commonMistakes: [
      {
        mistake: 'Using continue in a while loop and bypassing the variable increment',
        codeSnippet: `int i = 0;
while (i < 5) {
    if (i == 2) continue; // Infinite loop! i is never incremented!
    i++;
}`,
        correction: 'Increment the counter before calling continue in while loops: if (i == 2) { i++; continue; }',
        explanation: 'In while loops, continue jumps to the condition test, bypassing any increment placed at the bottom.'
      },
      {
        mistake: 'Expecting break to exit all levels of nested loops',
        codeSnippet: `for (int r = 0; r < 5; r++) {
    for (int c = 0; c < 5; c++) {
        if (found) break; // Only exits the c loop!
    }
}`,
        correction: 'Use a boolean flag, return from a function, or multiple breaks.',
        explanation: 'break only terminates the immediately enclosing loop.'
      }
    ],
    realWorldExample: {
      scenario: 'Database Transaction Log Scanner with Early Stop',
      code: `#include <iostream>

int main() {
    int errorLogId = 103;

    for (int logId = 100; logId <= 105; logId++) {
        if (logId == 101) {
            // Corrupt heartbeat, skip processing
            continue;
        }
        if (logId == errorLogId) {
            std::cout << "[ALERT] Fatal Log " << errorLogId << " detected! Aborting scan.\\n";
            break;
        }
        std::cout << "[LOG] Transaction " << logId << " OK\\n";
    }
    return 0;
}`,
      explanation: 'Data loggers skip corrupted frames using continue and abort upon critical error using break.'
    },
    practice: {
      prompt: 'Write a C++ program that loops from 1 to 5, skipping number 2 using continue, and stops the loop at 4 using break. Output: "1 3 ".',
      starterCode: `#include <iostream>

int main() {
    // Write loop with continue and break
    return 0;
}`,
      expectedOutputMatcher: '1 3',
      hint: 'if (i == 2) continue; if (i == 4) break; std::cout << i << " ";',
      solution: `#include <iostream>

int main() {
    for (int i = 1; i <= 5; i++) {
        if (i == 2) continue;
        if (i == 4) break;
        std::cout << i << " ";
    }
    std::cout << "\\n";
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-break-1',
        question: 'What does the break statement do when executed inside a loop?',
        options: [
          'Skips the rest of the current iteration pass',
          'Terminates the entire loop immediately and transfers control past the loop',
          'Restarts the loop from the initial value',
          'Halts the operating system'
        ],
        correctIndex: 1,
        explanation: 'break causes an immediate premature termination of the enclosing loop.'
      },
      {
        id: 'mcq-cpp-break-2',
        question: 'What does the continue statement do when executed in a for loop?',
        options: [
          'Terminates the program with exit code 0',
          'Skips the remaining body statements of the current iteration and jumps to the increment step',
          'Breaks out of the loop',
          'Pauses execution for 1 second'
        ],
        correctIndex: 1,
        explanation: 'continue skips the rest of the current iteration and triggers the loop update/increment step.'
      },
      {
        id: 'mcq-cpp-break-3',
        question: 'Inside nested loops, how many loops does a single break statement exit?',
        options: ['All enclosing loops', 'Only the innermost loop containing the break', 'Two loops', 'Zero loops'],
        correctIndex: 1,
        explanation: 'break only exits the immediately enclosing loop.'
      },
      {
        id: 'mcq-cpp-break-4',
        question: 'Why is using continue inside a while loop risky if not coded carefully?',
        options: [
          'It can cause memory leaks',
          'It may skip the variable increment statement, leading to an accidental infinite loop',
          'It triggers a linker error',
          'It is unsupported in C++20'
        ],
        correctIndex: 1,
        explanation: 'If the counter increment is located at the bottom of the while loop, continue bypasses it, locking the variable.'
      },
      {
        id: 'mcq-cpp-break-5',
        question: 'Which statement is commonly used for early exit in linear searches when the target is found?',
        options: ['continue', 'break', 'switch', 'default'],
        correctIndex: 1,
        explanation: 'Once the search target is located, break halts unnecessary further iterations.'
      }
    ],
    codingChallenge: {
      title: 'First Even Number Search',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program that loops through numbers 7, 9, 11, 14, 15 and finds the first even number, prints "First Even: 14", and immediately breaks.',
      input_format: 'No input.',
      output_format: 'One line: "First Even: 14".',
      constraints: 'Use a loop with if (num % 2 == 0) and break.',
      starter_code: `#include <iostream>

int main() {
    int nums[] = {7, 9, 11, 14, 15};
    // Find first even and break
    return 0;
}`,
      expected_output: `First Even: 14`,
      test_cases: [
        {
          input: '',
          expected_output: `First Even: 14`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'break terminates the enclosing loop prematurely.',
      'continue skips the current iteration pass and proceeds to the next cycle.',
      'In nested loops, break only affects the innermost loop.',
      'In while loops, ensure loop counters are incremented before continue to avoid infinite loops.'
    ]
  },

  // =========================================================================
  // LESSON 13: Pattern Programming
  // =========================================================================
  {
    id: 'top-cpp-pattern-programming',
    number: 13,
    numberDisplay: '13',
    moduleId: 'mod-cpp-control-problem-solving',
    moduleTitle: 'Module 02: Control Flow & Problem Solving',
    title: 'Pattern Programming',
    slug: 'pattern-programming-in-cpp',
    language: 'cpp',
    shortDescription: 'Master nested loops through visual pattern generation: right triangles, inverted pyramids, star matrices, and number sequences.',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    prerequisiteId: 'top-cpp-break-continue',
    learningObjectives: [
      'Deconstruct geometric 2D patterns into row and column nested loop coordinates',
      'Implement right-angled star triangles and inverted star triangles',
      'Generate sequential and palindromic number patterns',
      'Build symmetric pyramid patterns managing leading space offsets'
    ],
    conceptExplanation: `### 1. The Matrix Mindset of Pattern Programming
Pattern programming is the premier training ground for developing logical reasoning with **nested loops**.
Every visual pattern can be conceptualized as a 2D matrix of $R$ rows and $C$ columns:
* **Outer Loop (\`r\`)**: Controls the current row (vertical axis).
* **Inner Loop (\`c\`)**: Controls the columns or characters printed within that row (horizontal axis).
* **Row Transition**: Printing \`'\\n'\` after the inner loop finishes to move to the next row.

### 2. Fundamental Patterns
#### Pattern 1: Right-Angled Star Triangle
For $N = 4$:
\`\`\`text
*
* *
* * *
* * * *
\`\`\`
* Row $r$ runs from 1 to $N$.
* Column $c$ runs from 1 to $r$.

#### Pattern 2: Inverted Right Triangle
For $N = 4$:
\`\`\`text
* * * *
* * *
* *
*
\`\`\`
* Row $r$ runs from $N$ down to 1.
* Column $c$ runs from 1 to $r$.

#### Pattern 3: Number Triangle
For $N = 4$:
\`\`\`text
1
1 2
1 2 3
1 2 3 4
\`\`\`
* Instead of printing \`*\`, print the column index \`c\`.`,
    simpleExample: {
      code: `#include <iostream>

int main() {
    for (int r = 1; r <= 3; r++) {
        for (int c = 1; c <= r; c++) {
            std::cout << "* ";
        }
        std::cout << "\\n";
    }
    return 0;
}`,
      explanation: 'Prints a 3-row right triangle with outer loop r and inner loop c.'
    },
    syntax: `// Pattern Generation Boilerplate
for (int r = 1; r <= totalRows; r++) {
    // 1. Optional leading spaces loop
    // 2. Stars / Numbers columns loop
    for (int c = 1; c <= r; c++) {
        std::cout << "* ";
    }
    std::cout << "\\n"; // Advance to next row
}`,
    codeExample: `#include <iostream>

int main() {
    int n = 4;
    std::cout << "=== Right Star Triangle ===" << std::endl;
    for (int r = 1; r <= n; r++) {
        for (int c = 1; c <= r; c++) {
            std::cout << "* ";
        }
        std::cout << std::endl;
    }

    std::cout << "=== Number Matrix ===" << std::endl;
    for (int r = 1; r <= n; r++) {
        for (int c = 1; c <= r; c++) {
            std::cout << c << " ";
        }
        std::cout << std::endl;
    }
    return 0;
}`,
    expectedOutput: `=== Right Star Triangle ===
* 
* * 
* * * 
* * * * 
=== Number Matrix ===
1 
1 2 
1 2 3 
1 2 3 4 `,
    stepByStep: [
      '1. Outer loop sets row r = 1. Inner loop runs c from 1 to 1: prints "* ". Newline.',
      '2. Row r = 2. Inner loop runs c from 1 to 2: prints "* * ". Newline.',
      '3. Row r = 3. Inner loop prints "* * * ". Newline.',
      '4. Row r = 4. Inner loop prints "* * * * ". Newline.',
      '5. Second pattern repeats using numeric variable c instead of asterisk.',
      '6. Program completes successfully.'
    ],
    commonMistakes: [
      {
        mistake: 'Forgetting the newline after the inner loop',
        codeSnippet: `for (int r = 1; r <= 3; r++) {
    for (int c = 1; c <= r; c++) std::cout << "*";
} // All stars printed on a single continuous line!`,
        correction: 'Add std::cout << "\\n"; immediately after the inner loop terminates.',
        explanation: 'Without a newline, the next row is appended horizontally on the same line.'
      },
      {
        mistake: 'Using outer loop counter inside inner loop condition incorrectly',
        codeSnippet: `for (int r = 1; r <= 4; r++) {
    for (int c = 1; c <= 4; c++) // Always prints a 4x4 square instead of triangle!
}`,
        correction: 'For a triangle, bound the column loop to the current row index: c <= r',
        explanation: 'If column count is constant 4, you generate a rectangular grid instead of a triangle.'
      }
    ],
    realWorldExample: {
      scenario: 'Text-Based Console Hierarchy Tree Visualizer',
      code: `#include <iostream>

int main() {
    std::cout << "Project Folder Structure:\\n";
    for (int depth = 1; depth <= 3; depth++) {
        for (int tab = 1; tab < depth; tab++) {
            std::cout << "  ";
        }
        std::cout << "|-- Level_" << depth << "_Subsystem\\n";
    }
    return 0;
}`,
      explanation: 'CLI utilities format file system directory trees using nested loop indentation spaces.'
    },
    practice: {
      prompt: 'Write a C++ program that prints a 2-row star triangle: Row 1 "* ", Row 2 "* * ".',
      starterCode: `#include <iostream>

int main() {
    // Generate 2-row star triangle
    return 0;
}`,
      expectedOutputMatcher: '* \n* * ',
      hint: 'Outer loop r from 1 to 2, inner loop c from 1 to r, with newline.',
      solution: `#include <iostream>

int main() {
    for (int r = 1; r <= 2; r++) {
        for (int c = 1; c <= r; c++) {
            std::cout << "* ";
        }
        std::cout << "\\n";
    }
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-pat-1',
        question: 'In a standard 2D pattern nested loop, what does the outer loop typically represent?',
        options: ['The current column', 'The current row (vertical axis)', 'The number of characters per second', 'The text color'],
        correctIndex: 1,
        explanation: 'The outer loop iterates through the rows from top to bottom.'
      },
      {
        id: 'mcq-cpp-pat-2',
        question: 'To generate a right-angled triangle of height N, what should the inner column loop condition be?',
        options: ['c <= N', 'c <= r (where r is current row)', 'c == r', 'c >= r'],
        correctIndex: 1,
        explanation: 'c <= r ensures row 1 has 1 item, row 2 has 2 items, up to row N with N items.'
      },
      {
        id: 'mcq-cpp-pat-3',
        question: 'What statement must be called after the inner loop finishes to move to the next row?',
        options: ['std::cin >> x', 'std::cout << "\\n"', 'break', 'return 1'],
        correctIndex: 1,
        explanation: 'A newline character advances the cursor to the start of the next row.'
      },
      {
        id: 'mcq-cpp-pat-4',
        question: 'How do you invert a triangle pattern of height N?',
        options: [
          'Run the outer row loop from N down to 1',
          'Multiply all numbers by -1',
          'Use a while loop instead of for',
          'Omit the inner loop'
        ],
        correctIndex: 0,
        explanation: 'Iterating row r from N down to 1 prints N items on line 1, N-1 on line 2, down to 1 item on line N.'
      },
      {
        id: 'mcq-cpp-pat-5',
        question: 'If you print the column variable c in each inner iteration of a triangle, what pattern is produced?',
        options: ['A star triangle', 'A number sequence triangle (1, 1 2, 1 2 3...)', 'A hollow square', 'A diagonal line'],
        correctIndex: 1,
        explanation: 'Printing c outputs sequential numbers starting from 1 up to the current row count.'
      }
    ],
    codingChallenge: {
      title: 'Right-Angled Star Triangle',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program that prints a 3-row right-angled star triangle with a trailing space after each asterisk: line 1 "* ", line 2 "* * ", line 3 "* * * ".',
      input_format: 'No input.',
      output_format: 'Three lines representing the star triangle.',
      constraints: 'Use nested loops.',
      starter_code: `#include <iostream>

int main() {
    // Generate 3-row star triangle
    return 0;
}`,
      expected_output: `* \n* * \n* * * `,
      test_cases: [
        {
          input: '',
          expected_output: `* \n* * \n* * * `,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Pattern programming builds strong spatial and logical mental models of nested iteration.',
      'Outer loops govern row transitions, while inner loops dictate horizontal column elements.',
      'Bounding column loops to row indices (c <= r) produces triangular geometry.',
      'Careful management of newlines and space padding enables symmetric pyramids and diamonds.'
    ]
  },

  // =========================================================================
  // LESSON 14: Basic Number Problems
  // =========================================================================
  {
    id: 'top-cpp-basic-number-problems',
    number: 14,
    numberDisplay: '14',
    moduleId: 'mod-cpp-control-problem-solving',
    moduleTitle: 'Module 02: Control Flow & Problem Solving',
    title: 'Basic Number Problems',
    slug: 'basic-number-problems-in-cpp',
    language: 'cpp',
    shortDescription: 'Solve classic interview number algorithms: Prime checking, Factorial, Fibonacci sequence, Number Reversal, Palindromes, Armstrong numbers, and GCD/LCM.',
    difficulty: 'Beginner',
    estimatedMinutes: 30,
    prerequisiteId: 'top-cpp-pattern-programming',
    learningObjectives: [
      'Implement an optimized prime number verification algorithm testing divisors up to sqrt(N)',
      'Extract, count, and sum digits using modulus (% 10) and integer division (/ 10)',
      'Reverse integer values mathematically and determine palindrome number symmetry',
      'Compute Greatest Common Divisor (GCD) using the Euclidean algorithm'
    ],
    conceptExplanation: `### 1. Essential Number-Crunching Paradigms
Classic mathematical and numeric algorithms form the bedrock of coding interviews and problem-solving.

### 2. Digit Extraction Paradigm: \`% 10\` and \`/ 10\`
To process an integer digit by digit from right to left:
1. **Extract last digit**: \`lastDigit = num % 10;\`
2. **Remove last digit**: \`num = num / 10;\`
3. Repeat in a \`while (num > 0)\` loop.

### 3. Reversing a Number & Palindrome Check
By accumulating extracted digits:
\`\`\`cpp
int rev = 0;
while (num > 0) {
    rev = (rev * 10) + (num % 10);
    num /= 10;
}
\`\`\`
If \`originalNum == rev\`, the number is a **Palindrome** (e.g., \`121\`, \`1331\`).

### 4. Prime Number Verification
A prime number is greater than 1 and divisible only by 1 and itself.
* **Brute Force**: Test division from 2 to $N-1$ ($O(N)$).
* **Optimization**: Any composite number $N$ must have a factor $\le \sqrt{N}$. Therefore, loop only while $i \times i \le N$ ($O(\sqrt{N})$).

### 5. Fibonacci Sequence
Each term is the sum of the preceding two: $F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)$.
Iterative generation updates two variables: \`next = a + b; a = b; b = next;\`.

### 6. Euclidean Algorithm for GCD (Greatest Common Divisor)
Repeatedly replace $(a, b)$ with $(b, a \% b)$ until $b = 0$. The remaining $a$ is the GCD.
Then $\text{LCM}(a, b) = (a \times b) / \text{GCD}(a, b)$.`,
    simpleExample: {
      code: `#include <iostream>

int main() {
    int n = 1234, sum = 0;
    while (n > 0) {
        sum += (n % 10);
        n /= 10;
    }
    std::cout << "Sum of Digits: " << sum << "\\n"; // 1 + 2 + 3 + 4 = 10
    return 0;
}`,
      explanation: 'Repeatedly strips off the rightmost digit using % 10 and adds it to running sum.'
    },
    syntax: `// Digit Reversal Loop
int rev = 0;
while (n > 0) {
    rev = rev * 10 + (n % 10);
    n /= 10;
}

// Euclidean GCD
int gcd(int a, int b) {
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}`,
    codeExample: `#include <iostream>

int main() {
    // 1. Prime Check
    int num = 29;
    bool isPrime = (num > 1);
    for (int i = 2; i * i <= num; i++) {
        if (num % i == 0) {
            isPrime = false;
            break;
        }
    }

    // 2. Number Reversal
    int original = 12345;
    int temp = original;
    int reversed = 0;
    while (temp > 0) {
        reversed = reversed * 10 + (temp % 10);
        temp /= 10;
    }

    std::cout << "=== Classic Number Problem Solutions ===" << std::endl;
    std::cout << "Number:   " << num << " is " << (isPrime ? "PRIME" : "COMPOSITE") << std::endl;
    std::cout << "Original: " << original << std::endl;
    std::cout << "Reversed: " << reversed << std::endl;
    return 0;
}`,
    expectedOutput: `=== Classic Number Problem Solutions ===
Number:   29 is PRIME
Original: 12345
Reversed: 54321`,
    stepByStep: [
      '1. Prime test checks i = 2, 3, 4, 5 (since 5 * 5 = 25 <= 29). No divisor divides 29 evenly.',
      '2. isPrime remains true.',
      '3. Reversal loop extracts 5, shifts reversed to 5.',
      '4. Next step extracts 4, updates reversed to 54, and continues through 54321.',
      '5. Results logged to console.'
    ],
    commonMistakes: [
      {
        mistake: 'Checking primes up to N instead of sqrt(N)',
        codeSnippet: `for (int i = 2; i < N; i++) // Very slow for large numbers!`,
        correction: 'Use i * i <= N to achieve O(sqrt(N)) time complexity.',
        explanation: 'If a number has no factors <= sqrt(N), it cannot have any factors > sqrt(N).'
      },
      {
        mistake: 'Forgetting to preserve original number before digit extraction',
        codeSnippet: `while (num > 0) { ... num /= 10; }
if (num == rev) // Bug: num is now 0!`,
        correction: 'Store a copy of num: int temp = num; and manipulate temp in the loop.',
        explanation: 'The extraction loop consumes num down to 0, destroying its original value.'
      }
    ],
    realWorldExample: {
      scenario: 'Cryptographic Hash Checksum & Luhn Algorithm',
      code: `#include <iostream>

int main() {
    int creditCardSuffix = 4532;
    int checksum = 0;
    int temp = creditCardSuffix;

    while (temp > 0) {
        checksum += (temp % 10);
        temp /= 10;
    }

    std::cout << "Card Suffix: " << creditCardSuffix << "\\n";
    std::cout << "Checksum:    " << checksum << "\\n";
    return 0;
}`,
      explanation: 'Financial cards verify integrity using Luhn checksum formulas based on digit extraction.'
    },
    practice: {
      prompt: 'Write a C++ program that reverses integer 4321 and prints "Reversed: 1234".',
      starterCode: `#include <iostream>

int main() {
    int num = 4321;
    // Reverse num and print
    return 0;
}`,
      expectedOutputMatcher: 'Reversed: 1234',
      hint: 'Use while (num > 0) { rev = rev * 10 + (num % 10); num /= 10; }',
      solution: `#include <iostream>

int main() {
    int num = 4321;
    int rev = 0;
    while (num > 0) {
        rev = rev * 10 + (num % 10);
        num /= 10;
    }
    std::cout << "Reversed: " << rev << "\\n";
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-num-1',
        question: 'Which operation extracts the rightmost single digit of a positive integer N?',
        options: ['N / 10', 'N % 10', 'N * 10', 'N ^ 10'],
        correctIndex: 1,
        explanation: 'N % 10 produces the remainder when divided by 10, which is the last digit.'
      },
      {
        id: 'mcq-cpp-num-2',
        question: 'What is the optimal time complexity to determine if an integer N is prime?',
        options: ['O(N)', 'O(N^2)', 'O(sqrt(N))', 'O(1)'],
        correctIndex: 2,
        explanation: 'Testing factors up to sqrt(N) achieves O(sqrt(N)) time complexity.'
      },
      {
        id: 'mcq-cpp-num-3',
        question: 'What is a palindrome number?',
        options: [
          'A number that has only two factors',
          'A number that reads identically forwards and backwards (e.g., 121)',
          'A number whose digits sum to a prime',
          'A negative floating point number'
        ],
        correctIndex: 1,
        explanation: 'A palindrome number equals its exact mathematical reverse.'
      },
      {
        id: 'mcq-cpp-num-4',
        question: 'In the Euclidean algorithm for GCD(a, b), what operation updates b in each step?',
        options: ['b = a - b', 'b = a % b', 'b = a / b', 'b = sqrt(a)'],
        correctIndex: 1,
        explanation: 'The Euclidean algorithm repeatedly computes the remainder a % b.'
      },
      {
        id: 'mcq-cpp-num-5',
        question: 'What are the first 5 terms of the Fibonacci sequence starting with 0 and 1?',
        options: ['0, 1, 2, 3, 4', '0, 1, 1, 2, 3', '1, 2, 3, 5, 8', '0, 2, 4, 6, 8'],
        correctIndex: 1,
        explanation: '0 + 1 = 1, 1 + 1 = 2, 1 + 2 = 3: the terms are 0, 1, 1, 2, 3.'
      }
    ],
    codingChallenge: {
      title: 'Palindrome Number Checker',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program with int num = 1221 that reverses the number and prints "1221 is Palindrome".',
      input_format: 'No input.',
      output_format: 'One line: "1221 is Palindrome".',
      constraints: 'Test mathematical reversal against original.',
      starter_code: `#include <iostream>

int main() {
    int num = 1221;
    // Check if palindrome and print
    return 0;
}`,
      expected_output: `1221 is Palindrome`,
      test_cases: [
        {
          input: '',
          expected_output: `1221 is Palindrome`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Modulo (% 10) extracts the rightmost digit, and division (/ 10) truncates it.',
      'Checking prime divisors up to sqrt(N) delivers an optimal O(sqrt(N)) algorithm.',
      'A number is a palindrome if its reversed digits equal the original value.',
      'The Euclidean algorithm provides a fast logarithmic computation for GCD.'
    ]
  },

  // =========================================================================
  // LESSON 15: Introduction to Arrays
  // =========================================================================
  {
    id: 'top-cpp-arrays',
    number: 15,
    numberDisplay: '15',
    moduleId: 'mod-cpp-control-problem-solving',
    moduleTitle: 'Module 02: Control Flow & Problem Solving',
    title: 'Introduction to Arrays',
    slug: 'introduction-to-arrays-in-cpp',
    language: 'cpp',
    shortDescription: 'Explore contiguous fixed-size memory storage: declaration, zero-based indexing, traversal with range-based for loops, finding min/max, and bounds safety.',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    prerequisiteId: 'top-cpp-basic-number-problems',
    learningObjectives: [
      'Explain how arrays store elements in a contiguous block of physical RAM',
      'Declare and initialize fixed-size stack arrays with zero-based indexing',
      'Iterate through arrays using traditional index loops and modern C++11 range-based for loops',
      'Solve fundamental array problems: find maximum, minimum, sum, average, and search'
    ],
    conceptExplanation: `### 1. What is an Array?
An array is a fixed-size, homogeneous sequence of elements stored in **contiguous** (adjacent) memory locations.
If an array of \`int\` (4 bytes each) starts at memory address \`0x1000\`:
* \`arr[0]\` is at \`0x1000\`
* \`arr[1]\` is at \`0x1004\`
* \`arr[2]\` is at \`0x1008\`
Because memory is contiguous, accessing any element \`arr[i]\` by index takes constant time **$O(1)$** via the formula:
$$\\text{Address}(arr[i]) = \\text{BaseAddress} + (i \\times \\text{sizeof}(Type))$$

### 2. Declaration & Initialization
\`\`\`cpp
// 1. Declare with fixed capacity (uninitialized garbage values)
int scores[5];

// 2. Initialize with element list
int primes[5] = {2, 3, 5, 7, 11};

// 3. Compiler deduces size
int values[] = {10, 20, 30}; // Size 3 deduced

// 4. Zero-initialization
int zeros[100] = {0}; // All 100 elements set to 0
\`\`\`

### 3. Traversal: Index vs Range-Based For Loop
* **Traditional Index Loop**:
  \`\`\`cpp
  for (int i = 0; i < 5; i++) {
      std::cout << primes[i] << " ";
  }
  \`\`\`
* **Modern C++11 Range-Based For Loop**:
  \`\`\`cpp
  for (const auto& p : primes) {
      std::cout << p << " ";
  }
  \`\`\`

### 4. Critical Warning: No Automatic Bounds Checking!
Raw C++ arrays do NOT perform bounds checking. Accessing \`arr[10]\` on an array of size 5 results in **Undefined Behavior (UB)**—it reads whatever bytes happen to sit in adjacent RAM, potentially corrupting memory or causing a segmentation fault!`,
    simpleExample: {
      code: `#include <iostream>

int main() {
    int numbers[] = {10, 20, 30, 40, 50};
    std::cout << "First: " << numbers[0] << ", Last: " << numbers[4] << "\\n";
    return 0;
}`,
      explanation: 'Accesses elements at index 0 and 4 using zero-based indexing.'
    },
    syntax: `// Array Syntax
Type arrayName[CAPACITY];
Type arrayName[] = { val1, val2, val3 };

// Range-based iteration
for (const auto& item : arrayName) { ... }`,
    codeExample: `#include <iostream>

int main() {
    int marks[] = {78, 92, 85, 64, 99};
    int n = sizeof(marks) / sizeof(marks[0]);

    int maxVal = marks[0];
    int minVal = marks[0];
    int total = 0;

    for (int i = 0; i < n; i++) {
        total += marks[i];
        if (marks[i] > maxVal) maxVal = marks[i];
        if (marks[i] < minVal) minVal = marks[i];
    }

    double average = static_cast<double>(total) / n;

    std::cout << "=== Array Statistics ===" << std::endl;
    std::cout << "Count:   " << n << std::endl;
    std::cout << "Max:     " << maxVal << std::endl;
    std::cout << "Min:     " << minVal << std::endl;
    std::cout << "Average: " << average << std::endl;
    return 0;
}`,
    expectedOutput: `=== Array Statistics ===
Count:   5
Max:     99
Min:     64
Average: 83.6`,
    stepByStep: [
      '1. Array marks is allocated with 5 integers on stack.',
      '2. Array size n is computed using sizeof(marks) / sizeof(marks[0]) = 20 / 4 = 5.',
      '3. Loop traverses each element, maintaining running sum, maxVal, and minVal.',
      '4. Average computed using static_cast<double> to preserve 83.6.',
      '5. Statistics printed to console.'
    ],
    commonMistakes: [
      {
        mistake: 'Off-by-one index out of bounds error',
        codeSnippet: `int arr[5];
arr[5] = 100; // Undefined Behavior! Valid indices are 0 to 4!`,
        correction: 'Remember an array of size N has indices from 0 up to N - 1.',
        explanation: 'Writing to arr[5] overwrites adjacent memory on the stack.'
      },
      {
        mistake: 'Trying to resize a static array',
        codeSnippet: `int data[10];
data.resize(20); // Compiler Error: static arrays cannot be resized`,
        correction: 'Use std::vector<int> for dynamically resizable collections.',
        explanation: 'C-style stack arrays have their size permanently fixed at compile time.'
      }
    ],
    realWorldExample: {
      scenario: 'Industrial Temperature Sensor Array Monitoring',
      code: `#include <iostream>

int main() {
    double zoneTemps[4] = {21.5, 23.0, 28.4, 22.1};

    std::cout << "=== Factory Zone Thermals ===\\n";
    for (int zone = 0; zone < 4; zone++) {
        std::cout << "Zone " << (zone + 1) << ": " << zoneTemps[zone] << " C\\n";
    }
    return 0;
}`,
      explanation: 'Factory automation monitors multi-channel thermocouple arrays across assembly lines.'
    },
    practice: {
      prompt: 'Write a C++ program with int values[] = {5, 12, 3} that calculates and prints "Sum: 20".',
      starterCode: `#include <iostream>

int main() {
    int values[] = {5, 12, 3};
    // Calculate and print sum
    return 0;
}`,
      expectedOutputMatcher: 'Sum: 20',
      hint: 'Sum the elements in a loop and print with std::cout << "Sum: " << sum << "\\n";',
      solution: `#include <iostream>

int main() {
    int values[] = {5, 12, 3};
    int sum = 0;
    for (int i = 0; i < 3; i++) {
        sum += values[i];
    }
    std::cout << "Sum: " << sum << "\\n";
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-arr-1',
        question: 'What is the starting index of an array in C++?',
        options: ['1', '0', '-1', 'Configurable by compiler'],
        correctIndex: 1,
        explanation: 'C++ utilizes zero-based indexing, where the initial element is at index 0.'
      },
      {
        id: 'mcq-cpp-arr-2',
        question: 'Why does accessing an element by index in an array take O(1) constant time?',
        options: [
          'Because the CPU guesses the answer',
          'Because elements are stored contiguously, allowing direct address arithmetic',
          'Because arrays are stored on the hard drive',
          'Because of recursive search'
        ],
        correctIndex: 1,
        explanation: 'Contiguous memory allows the CPU to calculate memory addresses with a single multiplication and addition.'
      },
      {
        id: 'mcq-cpp-arr-3',
        question: 'What happens if you access index 10 in an array of size 5 in raw C++?',
        options: [
          'An ArrayIndexOutOfBoundsException is thrown',
          'Undefined Behavior occurs (reading or corrupting out-of-bounds memory)',
          'The array automatically expands to size 11',
          'It returns 0 safely'
        ],
        correctIndex: 1,
        explanation: 'Raw C++ arrays do not perform bounds checking; out-of-bounds access is Undefined Behavior.'
      },
      {
        id: 'mcq-cpp-arr-4',
        question: 'How do you determine the element count of a raw stack array "int arr[10];"?',
        options: ['arr.length()', 'arr.size()', 'sizeof(arr) / sizeof(arr[0])', 'count(arr)'],
        correctIndex: 2,
        explanation: 'sizeof(arr) yields total array bytes; dividing by sizeof(arr[0]) gives the element count.'
      },
      {
        id: 'mcq-cpp-arr-5',
        question: 'Which modern C++ loop syntax iterates over array elements without manual index counters?',
        options: ['for (auto item : arr)', 'foreach (item in arr)', 'loop (arr)', 'while (arr.next())'],
        correctIndex: 0,
        explanation: 'C++11 introduced range-based for loops: for (const auto& item : arr).'
      }
    ],
    codingChallenge: {
      title: 'Maximum Element Finder',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program that finds the maximum value in array int nums[] = {14, 52, 38, 91, 27} and prints "Max: 91".',
      input_format: 'No input.',
      output_format: 'One line: "Max: 91".',
      constraints: 'Traverse array elements using a loop.',
      starter_code: `#include <iostream>

int main() {
    int nums[] = {14, 52, 38, 91, 27};
    // Find maximum and print
    return 0;
}`,
      expected_output: `Max: 91`,
      test_cases: [
        {
          input: '',
          expected_output: `Max: 91`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Arrays store homogeneous elements contiguously in RAM with O(1) random access.',
      'C++ arrays are zero-indexed from 0 to N-1.',
      'Raw arrays lack bounds checking; accessing out-of-bounds indices triggers undefined behavior.',
      'Range-based for loops (C++11) provide clean, boundary-safe iteration over containers.'
    ]
  },

  // =========================================================================
  // LESSON 16: Strings and Basic Collections
  // =========================================================================
  {
    id: 'top-cpp-strings-collections',
    number: 16,
    numberDisplay: '16',
    moduleId: 'mod-cpp-control-problem-solving',
    moduleTitle: 'Module 02: Control Flow & Problem Solving',
    title: 'Strings and Basic Collections',
    slug: 'strings-and-basic-collections-in-cpp',
    language: 'cpp',
    shortDescription: 'Master standard strings (std::string) vs C char arrays, concatenation, length, substrings, and introduce dynamic collections with std::vector.',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    prerequisiteId: 'top-cpp-arrays',
    learningObjectives: [
      'Compare legacy null-terminated C char arrays with modern standard std::string',
      'Perform common string operations: concatenation, size(), substr(), and element access',
      'Understand the architecture of std::vector as a dynamically resizable array',
      'Contrast fixed-size raw arrays with std::vector in terms of flexibility and safety'
    ],
    conceptExplanation: `### 1. Modern \`std::string\` vs Legacy C-Strings
In C, strings were represented as raw character arrays terminated by a null byte \`'\\0'\` (e.g., \`char name[] = "Ada";\`), prone to buffer overflows.
Modern C++ provides **\`std::string\`** from the \`<string>\` header:
* Dynamically manages its own heap memory.
* Automatically resizes as text is appended.
* Provides rich member functions and bounds checking via \`.at()\`.

### 2. Common \`std::string\` Operations
\`\`\`cpp
#include <string>

std::string s1 = "Modern";
std::string s2 = "C++";

// 1. Concatenation
std::string s3 = s1 + " " + s2; // "Modern C++"

// 2. Length / Size
int len = s3.size(); // or s3.length()

// 3. Character Access
char first = s3[0];       // Fast, unchecked
char safe = s3.at(0);     // Throws out_of_range exception if invalid

// 4. Substrings
std::string sub = s3.substr(0, 6); // "Modern" (start index, length)
\`\`\`

### 3. Introduction to \`std::vector\`
\`std::vector\` (from \`<vector>\`) is the most important container in modern C++: a **dynamically resizable array**.
* Unlike fixed stack arrays, \`std::vector\` grows and shrinks at runtime.
* Elements remain contiguous in memory, maintaining $O(1)$ random access.
\`\`\`cpp
#include <vector>

std::vector<int> numbers = {10, 20, 30};
numbers.push_back(40); // Appends 40 to the end
numbers.pop_back();    // Removes last element
std::cout << "Count: " << numbers.size() << "\\n";
\`\`\`

### 4. Array vs Vector Comparison
| Feature | Raw Array (\`int arr[N]\`) | \`std::vector<int>\` |
| :--- | :--- | :--- |
| **Size** | Fixed at compile time | Dynamically resizable at runtime |
| **Memory** | Stack (local) or data segment | Heap (automatic memory management) |
| **Size Knowledge** | Lost when passed to functions (decays to pointer) | Preserved via \`.size()\` |
| **Safety** | No bounds checking | \`.at()\` provides bounds checking |`,
    simpleExample: {
      code: `#include <iostream>
#include <string>
#include <vector>

int main() {
    std::string greeting = "Hello";
    greeting += " World!";
    
    std::vector<int> scores = {90, 85, 95};
    scores.push_back(100);

    std::cout << greeting << " Score count: " << scores.size() << "\\n";
    return 0;
}`,
      explanation: 'Demonstrates std::string string concatenation and std::vector dynamic element addition.'
    },
    syntax: `// Standard String & Vector Headers
#include <string>
#include <vector>

std::string text = "Content";
text += " appended";

std::vector<Type> vec = { item1, item2 };
vec.push_back(newItem);`,
    codeExample: `#include <iostream>
#include <string>
#include <vector>

int main() {
    // 1. Strings
    std::string firstName = "Margaret";
    std::string lastName = "Hamilton";
    std::string fullName = firstName + " " + lastName;

    std::cout << "=== String Operations ===" << std::endl;
    std::cout << "Full Name: " << fullName << std::endl;
    std::cout << "Length:    " << fullName.length() << " chars" << std::endl;

    // 2. Vector Collections
    std::vector<std::string> languages = {"C++", "Python", "Rust"};
    languages.push_back("Go");

    std::cout << "\\n=== Dynamic Vector Collection ===" << std::endl;
    for (const auto& lang : languages) {
        std::cout << "- " << lang << std::endl;
    }
    return 0;
}`,
    expectedOutput: `=== String Operations ===
Full Name: Margaret Hamilton
Length:    17 chars

=== Dynamic Vector Collection ===
- C++
- Python
- Rust
- Go`,
    stepByStep: [
      '1. std::string objects firstName and lastName concatenate with space using + operator.',
      '2. fullName.length() returns total character count 17.',
      '3. std::vector<std::string> initializes with 3 strings.',
      '4. languages.push_back("Go") expands capacity and appends "Go".',
      '5. Range-based for loop prints all vector elements.',
      '6. Memory is automatically cleaned up when objects leave scope.'
    ],
    commonMistakes: [
      {
        mistake: 'Trying to concatenate two raw string literals with +',
        codeSnippet: `std::string s = "Hello " + "World"; // Compiler Error: invalid operands of types 'const char*' to binary '+'`,
        correction: 'Ensure at least one operand is a std::string: std::string s = std::string("Hello ") + "World";',
        explanation: 'In C++, "Hello " and "World" are raw C string arrays (const char*); you cannot add two pointers.'
      },
      {
        mistake: 'Index out of bounds on vector using [] instead of .at()',
        codeSnippet: `std::vector<int> v = {1, 2};
int val = v[5]; // Undefined Behavior: [] does not check bounds!`,
        correction: 'Use v.at(5) if you want an exception thrown on out-of-bounds access.',
        explanation: 'operator[] prioritizes raw speed without bounds checks, whereas .at() validates indices.'
      }
    ],
    realWorldExample: {
      scenario: 'Web Server Request Header Parser',
      code: `#include <iostream>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> allowedOrigins = {
        "https://cognitive.edu",
        "https://api.cognitive.edu"
    };

    std::string origin = "https://cognitive.edu";
    bool authorized = false;

    for (const auto& allowed : allowedOrigins) {
        if (allowed == origin) {
            authorized = true;
            break;
        }
    }

    std::cout << "Origin: " << origin << "\\n";
    std::cout << "Access: " << (authorized ? "GRANTED" : "DENIED") << "\\n";
    return 0;
}`,
      explanation: 'HTTP routers and CORS middleware store allowed domains in dynamic vectors and compare strings.'
    },
    practice: {
      prompt: 'Write a C++ program that creates a std::vector<int> with elements {10, 20}, pushes 30, and prints "Total: 3".',
      starterCode: `#include <iostream>
#include <vector>

int main() {
    // Create vector, push 30, and print size
    return 0;
}`,
      expectedOutputMatcher: 'Total: 3',
      hint: 'Use vec.push_back(30); std::cout << "Total: " << vec.size() << "\\n";',
      solution: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {10, 20};
    v.push_back(30);
    std::cout << "Total: " << v.size() << "\\n";
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-str-1',
        question: 'Which header file must be included to use the modern std::string class?',
        options: ['<cstring>', '<string>', '<string.h>', '<iostream>'],
        correctIndex: 1,
        explanation: '<string> defines the standard std::string class.'
      },
      {
        id: 'mcq-cpp-str-2',
        question: 'Which method appends an element to the end of a std::vector in C++?',
        options: ['append()', 'add()', 'push_back()', 'insert_last()'],
        correctIndex: 2,
        explanation: 'push_back() appends a new element to the back of the vector.'
      },
      {
        id: 'mcq-cpp-str-3',
        question: 'Why is std::vector preferred over raw C arrays in modern C++?',
        options: [
          'It automatically manages its own dynamic memory and size',
          'It is compiled by a different compiler',
          'It stores elements in backwards order',
          'It requires no header file'
        ],
        correctIndex: 0,
        explanation: 'std::vector handles dynamic memory allocation, resizing, and cleanup automatically.'
      },
      {
        id: 'mcq-cpp-str-4',
        question: 'What is the return type and meaning of str.size() on a std::string?',
        options: [
          'A boolean indicating if empty',
          'An unsigned integer representing the number of characters in the string',
          'The byte memory address of the string',
          'The number of words in the string'
        ],
        correctIndex: 1,
        explanation: 'str.size() returns the character count as a size_t.'
      },
      {
        id: 'mcq-cpp-str-5',
        question: 'What does "std::string(\"Hello \") + \"World\"" evaluate to?',
        options: [
          'A runtime error',
          'A concatenated std::string containing "Hello World"',
          'A memory pointer',
          'Boolean true'
        ],
        correctIndex: 1,
        explanation: 'Operator + concatenates the C-string literal onto the std::string object.'
      }
    ],
    codingChallenge: {
      title: 'Vector Aggregator',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program that creates a std::vector<std::string> containing "Alpha", "Beta", "Gamma", and prints "Count: 3".',
      input_format: 'No input.',
      output_format: 'One line: "Count: 3".',
      constraints: 'Use std::vector and .size().',
      starter_code: `#include <iostream>
#include <vector>
#include <string>

int main() {
    // Declare vector of strings and print count
    return 0;
}`,
      expected_output: `Count: 3`,
      test_cases: [
        {
          input: '',
          expected_output: `Count: 3`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'std::string provides safe, dynamic, and expressive text manipulation replacing risky char arrays.',
      'std::vector is the workhorse container in C++, offering contiguous memory and dynamic resizing.',
      'push_back() appends items dynamically; size() reports current element count.',
      'Vector elements can be safely accessed with .at() or high-performance [] operators.'
    ]
  }
];
