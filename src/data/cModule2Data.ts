import { CTopic } from './cFundamentalsData';

export const C_MODULE_2_TOPICS: CTopic[] = [
  // =========================================================================
  // TOPIC 05: Conditional Statements
  // =========================================================================
  {
    id: 'top-c-conditionals',
    number: 5,
    numberDisplay: '05',
    moduleId: 'mod-c-control',
    moduleTitle: 'Module 02: Control Flow & Modular Logic',
    title: 'Conditional Statements',
    slug: 'conditional-statements',
    language: 'c',
    shortDescription: 'Master selective code branch execution in C with if, if-else, else-if ladders, nested conditions, and switch-case jump tables with fallthrough mechanics.',
    difficulty: 'Beginner',
    estimatedMinutes: 30,
    prerequisiteId: 'top-c-operators',
    learningObjectives: [
      'Implement multi-branch decision structures using if, if-else, and else-if ladders',
      'Construct switch-case dispatch blocks and control execution fallthrough using break',
      'Identify boolean truth evaluation in C (0 is false, any non-zero value is true)',
      'Avoid classic logic bugs including accidental assignment in conditions (= vs ==) and dangling else'
    ],
    conceptExplanation: `### Truth and Falsehood in C
Unlike languages with a native boolean primitive type, standard C treats **any integer expression** as a condition:
- An expression evaluating to \`0\` is **False**.
- Any non-zero numeric value (positive or negative, e.g. \`1\`, \`-42\`, \`100\`) is **True**.

### Branching Structures
1. **Simple \`if\`**: Executes a statement block only if the test expression evaluates to non-zero.
2. **\`if-else\`**: Executes block A if non-zero, or block B if zero.
3. **\`else-if\` ladder**: Tests a series of mutually exclusive conditions sequentially until the first true condition fires.
4. **Nested \`if\`**: Places conditions within conditions for hierarchical decision boundaries.

### The \`switch-case\` Statement
\`switch\` evaluates an integral expression (int or char) against constant case labels:
\`\`\`c
switch (command) {
    case 'R':
        start_run();
        break; // Exits the switch block immediately
    case 'S':
        stop_run();
        break;
    default:
        handle_unknown();
        break;
}
\`\`\`

### Switch Fallthrough
If you omit the \`break\` statement, execution **falls through** to subsequent case labels regardless of whether their condition matches. While fallthrough can be intentionally used to group identical cases, forgetting \`break\` is a notorious source of bugs.`,
    simpleExample: {
      code: `#include <stdio.h>

int main(void) {
    int score = 88;
    if (score >= 90) {
        printf("Grade: A\\n");
    } else if (score >= 80) {
        printf("Grade: B\\n");
    } else {
        printf("Grade: C\\n");
    }
    return 0;
}`,
      explanation: 'Evaluates score through an else-if ladder and prints Grade: B because 88 is between 80 and 89.'
    },
    syntax: `// if - else if - else
if (condition1) {
    // statement1
} else if (condition2) {
    // statement2
} else {
    // default statement
}

// switch case
switch (expression) {
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
    int score = 84;
    char grade;
    
    // Multi-branch grading ladder
    if (score >= 90) {
        grade = 'A';
    } else if (score >= 80) {
        grade = 'B';
    } else if (score >= 70) {
        grade = 'C';
    } else if (score >= 60) {
        grade = 'D';
    } else {
        grade = 'F';
    }
    
    printf("Score: %d -> Grade: %c\\n", score, grade);
    
    // Switch dispatch block with intentional grouping
    switch (grade) {
        case 'A':
            printf("Standing: Honors Excellence\\n");
            break;
        case 'B':
        case 'C':
            printf("Standing: Satisfactory Academic Progress\\n");
            break;
        case 'D':
            printf("Standing: Academic Warning\\n");
            break;
        case 'F':
            printf("Standing: Remediation Required\\n");
            break;
        default:
            printf("Invalid grade recorded.\\n");
            break;
    }
    
    return 0;
}`,
    expectedOutput: `Score: 84 -> Grade: B
Standing: Satisfactory Academic Progress`,
    stepByStep: [
      '1. CPU evaluates (score >= 90); evaluates to 0 (false), jumping to next else if.',
      '2. (score >= 80) evaluates to 1 (true); grade is assigned \'B\'.',
      '3. Remainder of ladder is skipped; execution proceeds directly to switch statement.',
      '4. switch(grade) jumps to case \'B\'; having no break, it falls through into case \'C\'.',
      '5. Prints "Standing: Satisfactory Academic Progress" and encounters break, exiting the switch.'
    ],
    commonMistakes: [
      {
        mistake: 'Accidental assignment in condition',
        codeSnippet: `int auth = 0;
if (auth = 1) { // Sets auth to 1 and evaluates to true!
    grant_access();
}`,
        correction: 'Use == for comparison: if (auth == 1). Many developers write (1 == auth) as a defensive guard.',
        explanation: 'In C, assignment evaluates to the assigned value, which is non-zero (true).'
      },
      {
        mistake: 'Dangling else ambiguity without curly braces',
        codeSnippet: `if (a > 0)
    if (b > 0)
        printf("Both positive");
else
    printf("a is not positive?"); // Bug! else attaches to the nearest if (b > 0)`,
        correction: 'Always enclose if and else bodies in curly braces { } even for single lines.',
        explanation: 'In C grammar, an else always binds to the closest preceding if without an else.'
      }
    ],
    realWorldExample: {
      scenario: 'Flight Control Surface Error Code Dispatcher',
      code: `#include <stdio.h>

#define ERR_OK       0
#define ERR_PRESSURE 101
#define ERR_HYDRAULIC 202
#define ERR_ACTUATOR 303

int main(void) {
    int fault_code = ERR_HYDRAULIC;
    
    switch (fault_code) {
        case ERR_OK:
            printf("STATUS: Systems Nominal.\\n");
            break;
        case ERR_PRESSURE:
            printf("WARNING: Cabin Pressure Differential Exceeded.\\n");
            break;
        case ERR_HYDRAULIC:
            printf("CRITICAL: Auxiliary Hydraulic Pump Engaged.\\n");
            break;
        case ERR_ACTUATOR:
            printf("CRITICAL: Secondary Elevator Actuator Lockout.\\n");
            break;
        default:
            printf("ALERT: Unmapped telemetry error code: %d\\n", fault_code);
            break;
    }
    return 0;
}`,
      explanation: 'Avionics software and flight telemetry computers use strict switch statements to dispatch hardware fault codes into redundant recovery loops.'
    },
    practice: {
      prompt: 'Write a program that takes an integer temperature (say 35). If temp > 30, print "Hot". If between 15 and 30 inclusive, print "Pleasant". If less than 15, print "Cold".',
      starterCode: `#include <stdio.h>

int main(void) {
    int temp = 35;
    // Write your conditional ladder here:
    
    return 0;
}`,
      expectedOutputMatcher: 'Hot',
      hint: 'Use if (temp > 30) ... else if (temp >= 15) ... else ...',
      solution: `#include <stdio.h>

int main(void) {
    int temp = 35;
    if (temp > 30) {
        printf("Hot\\n");
    } else if (temp >= 15) {
        printf("Pleasant\\n");
    } else {
        printf("Cold\\n");
    }
    return 0;
}`
    },
    quiz: [
      {
        id: 'q-c-cond-1',
        question: 'In C, which integer value represents a false condition in an if statement?',
        options: [
          'Any negative number',
          '0 only',
          '-1 only',
          'Any number other than 1'
        ],
        correctIndex: 1,
        explanation: 'In C, exactly 0 represents false; any non-zero value (positive or negative) evaluates to true.'
      },
      {
        id: 'q-c-cond-2',
        question: 'What happens if a case in a switch statement does not contain a break statement?',
        options: [
          'The compiler rejects the program with an error',
          'Execution continues directly into the subsequent case (fallthrough)',
          'The switch immediately exits with status 0',
          'An infinite loop occurs'
        ],
        correctIndex: 1,
        explanation: 'Without break, C continues executing the statements of subsequent cases until encountering a break or the end of the switch block.'
      },
      {
        id: 'q-c-cond-3',
        question: 'What will be printed by this code?\n\nint x = 0;\nif (x = 5) {\n    printf("Yes");\n} else {\n    printf("No");\n}',
        options: [
          'No',
          'Yes',
          'Compilation error',
          'Undefined behavior'
        ],
        correctIndex: 1,
        explanation: 'x = 5 assigns 5 to x and yields 5, which is non-zero (true), printing "Yes".'
      },
      {
        id: 'q-c-cond-4',
        question: 'Can a float variable be used as the controlling expression in a switch statement in C?',
        options: [
          'Yes, in C99 and later',
          'No, switch expressions must evaluate to an integral type (int, char, enum)',
          'Yes, if explicitly cast to double',
          'Yes, as long as case labels are floats'
        ],
        correctIndex: 1,
        explanation: 'In C, the controlling expression of a switch must be an integer, character, or enumeration type.'
      },
      {
        id: 'q-c-cond-5',
        question: 'In an else-if ladder, when is the final else block executed?',
        options: [
          'Always, as cleanup',
          'Only when all preceding if and else-if conditions evaluate to 0 (false)',
          'Whenever the first condition is false',
          'Whenever a break statement is triggered'
        ],
        correctIndex: 1,
        explanation: 'The else block acts as the fallback default, executing only when every preceding test evaluates to false.'
      }
    ],
    codingChallenge: {
      title: 'Menu-Driven Arithmetic Calculator',
      difficulty: 'Easy',
      problem_statement: 'Write a C program that uses a switch statement on an operator character (\'+\', \'-\', \'*\', \'/\'). Given a = 20 and b = 5 with op = \'*\', print the calculated result.',
      input_format: 'No input needed.',
      output_format: '20 * 5 = 100',
      constraints: 'Must handle division by zero safely.',
      starter_code: `#include <stdio.h>

int main(void) {
    int a = 20, b = 5;
    char op = '*';
    
    switch (op) {
        case '+':
            printf("%d + %d = %d\\n", a, b, a + b);
            break;
        case '-':
            printf("%d - %d = %d\\n", a, b, a - b);
            break;
        case '*':
            printf("%d * %d = %d\\n", a, b, a * b);
            break;
        case '/':
            if (b != 0) printf("%d / %d = %d\\n", a, b, a / b);
            break;
    }
    return 0;
}`,
      solution_code: `#include <stdio.h>

int main(void) {
    int a = 20, b = 5;
    char op = '*';
    
    switch (op) {
        case '+':
            printf("%d + %d = %d\\n", a, b, a + b);
            break;
        case '-':
            printf("%d - %d = %d\\n", a, b, a - b);
            break;
        case '*':
            printf("%d * %d = %d\\n", a, b, a * b);
            break;
        case '/':
            if (b != 0) printf("%d / %d = %d\\n", a, b, a / b);
            break;
    }
    return 0;
}`,
      test_cases: [
        {
          input: '',
          expected_output: '20 * 5 = 100'
        }
      ]
    },
    summary: [
      'In C, 0 evaluates to false; any non-zero value evaluates to true.',
      'Use if-else ladders for complex boolean and range conditions.',
      'Use switch statements for multi-way integer or character jump dispatch.',
      'Always terminate switch cases with break unless intentional fallthrough is required.',
      'Enclose control blocks in curly braces { } to avoid dangling else bugs.'
    ]
  },

  // =========================================================================
  // TOPIC 06: Loops & Iteration
  // =========================================================================
  {
    id: 'top-c-loops',
    number: 6,
    numberDisplay: '06',
    moduleId: 'mod-c-control',
    moduleTitle: 'Module 02: Control Flow & Modular Logic',
    title: 'Loops & Iteration',
    slug: 'loops-and-iteration',
    language: 'c',
    shortDescription: 'Master repetitive computation in C: for, while, and do-while loops. Learn entry-controlled vs exit-controlled semantics, nested loops, break, continue, and loop termination guarantees.',
    difficulty: 'Beginner',
    estimatedMinutes: 35,
    prerequisiteId: 'top-c-conditionals',
    learningObjectives: [
      'Implement for, while, and do-while loop constructs with proper initialization, condition, and increment',
      'Distinguish entry-controlled (for, while) from exit-controlled (do-while) loop execution guarantees',
      'Control iteration flow precisely using break (early exit) and continue (skip remaining body statements)',
      'Construct nested loops for matrix grids and pattern generation without off-by-one errors'
    ],
    conceptExplanation: `### The Three C Loop Constructs
1. **\`while\` Loop (Entry-Controlled)**:
   Tests the condition **before** executing the loop body. If false initially, the body executes zero times:
   \`\`\`c
   while (condition) {
       // statements;
   }
   \`\`\`
2. **\`for\` Loop (Entry-Controlled)**:
   Consolidates initialization, condition check, and iteration update into a single readable header:
   \`\`\`c
   for (int i = 0; i < n; i++) {
       // statements;
   }
   \`\`\`
3. **\`do-while\` Loop (Exit-Controlled)**:
   Executes the loop body **first**, then checks the condition at the end. The body is **guaranteed to run at least once**:
   \`\`\`c
   do {
       // statements;
   } while (condition);
   \`\`\`

### Controlling Loop Execution
- **\`break\`**: Immediately terminates the innermost loop and transfers control to the statement following the loop.
- **\`continue\`**: Skips the remaining statements in the current iteration and jumps directly to the loop update step.

### Off-By-One Errors
In zero-indexed languages like C, iterating \`N\` times requires:
\`\`\`c
for (int i = 0; i < N; i++) // Runs exactly N times: i = 0, 1, ..., N - 1
\`\`\`
Using \`i <= N\` by mistake causes the loop to run \`N + 1\` times, often corrupting adjacent memory when indexing arrays.`,
    simpleExample: {
      code: `#include <stdio.h>

int main(void) {
    for (int i = 1; i <= 5; i++) {
        printf("Iteration %d\\n", i);
    }
    return 0;
}`,
      explanation: 'Initializes counter i = 1, repeats while i <= 5, increments i by 1 each cycle, and prints iterations 1 through 5.'
    },
    syntax: `// for loop
for (init; condition; update) {
    // body
}

// while loop
while (condition) {
    // body
    // update
}

// do-while loop (semicolon required at end!)
do {
    // body
} while (condition);`,
    codeExample: `#include <stdio.h>

int main(void) {
    // 1. For loop: Multiplication Table for 7
    printf("--- Table of 7 ---\\n");
    for (int i = 1; i <= 5; i++) {
        printf("7 x %d = %2d\\n", i, 7 * i);
    }
    
    // 2. While loop: Factorial of 5
    int n = 5;
    int factorial = 1;
    int temp = n;
    while (temp > 1) {
        factorial *= temp;
        temp--;
    }
    printf("\\nFactorial of %d = %d\\n", n, factorial);
    
    // 3. Nested loop: 4x4 Triangle Pattern
    printf("\\n--- Triangle Pattern ---\\n");
    for (int row = 1; row <= 4; row++) {
        for (int col = 1; col <= row; col++) {
            printf("* ");
        }
        printf("\\n");
    }
    
    return 0;
}`,
    expectedOutput: `--- Table of 7 ---
7 x 1 =  7
7 x 2 = 14
7 x 3 = 21
7 x 4 = 28
7 x 5 = 35

Factorial of 5 = 120

--- Triangle Pattern ---
* 
* * 
* * * 
* * * * `,
    stepByStep: [
      '1. for loop initializes int i = 1 on stack.',
      '2. Tests i <= 5 (true); executes printf("7 x %d = %2d", i, 7 * i).',
      '3. Executes update expression i++; tests condition again.',
      '4. When i becomes 6, condition evaluates to 0, terminating loop.',
      '5. Nested loop: outer loop governs rows, inner loop executes col iterations per row.'
    ],
    commonMistakes: [
      {
        mistake: 'Accidental semicolon after for or while header',
        codeSnippet: `for (int i = 0; i < 5; i++); { // Semicolon creates an empty loop body!
    printf("%d\\n", i);
}`,
        correction: 'Never place a semicolon directly after for(...) or while(...) headers.',
        explanation: 'A semicolon after for creates a null statement that loops 5 times doing nothing, then executes the block once with i = 5.'
      },
      {
        mistake: 'Missing loop variable update causing an infinite loop',
        codeSnippet: `int count = 0;
while (count < 5) {
    printf("%d\\n", count);
    // count++ forgotten!
}`,
        correction: 'Always ensure the loop variable is modified inside the body to reach termination.',
        explanation: 'Without updating count, (count < 5) remains true forever.'
      }
    ],
    realWorldExample: {
      scenario: 'High-Frequency Financial Moving Average Window',
      code: `#include <stdio.h>

int main(void) {
    double prices[] = {101.5, 102.0, 101.8, 103.2, 104.1, 103.9, 105.0};
    int total_points = 7;
    int window = 3;
    
    printf("3-Point Simple Moving Average:\\n");
    for (int i = 0; i <= total_points - window; i++) {
        double sum = 0.0;
        for (int j = 0; j < window; j++) {
            sum += prices[i + j];
        }
        double sma = sum / window;
        printf("Window [%d-%d]: SMA = %.2f\\n", i, i + window - 1, sma);
    }
    return 0;
}`,
      explanation: 'Quantitative trading engines slide mathematical windows over tick streams using nested loops to compute rolling indicators in microseconds.'
    },
    practice: {
      prompt: 'Write a loop that prints the sum of all even numbers between 1 and 20 inclusive.',
      starterCode: `#include <stdio.h>

int main(void) {
    int sum = 0;
    // Calculate sum of even numbers from 1 to 20:
    
    printf("Even sum: %d\\n", sum);
    return 0;
}`,
      expectedOutputMatcher: 'Even sum: 110',
      hint: 'Loop from i = 2; i <= 20; i += 2 and accumulate into sum.',
      solution: `#include <stdio.h>

int main(void) {
    int sum = 0;
    for (int i = 2; i <= 20; i += 2) {
        sum += i;
    }
    printf("Even sum: %d\\n", sum);
    return 0;
}`
    },
    quiz: [
      {
        id: 'q-c-loop-1',
        question: 'Which C loop construct guarantees that its body will execute at least once regardless of the condition?',
        options: [
          'for loop',
          'while loop',
          'do-while loop',
          'nested loop'
        ],
        correctIndex: 2,
        explanation: 'do-while is exit-controlled; the body runs first, and the condition is evaluated at the end.'
      },
      {
        id: 'q-c-loop-2',
        question: 'What is the effect of the continue statement when executed inside a for loop?',
        options: [
          'It immediately exits the loop',
          'It skips the remainder of the current body and jumps directly to the update expression (e.g. i++)',
          'It resets the loop counter to 0',
          'It terminates the entire C program'
        ],
        correctIndex: 1,
        explanation: 'continue skips the rest of the current iteration and invokes the update expression before re-testing the condition.'
      },
      {
        id: 'q-c-loop-3',
        question: 'How many times will this loop execute?\n\nfor (int i = 0; i < 10; i += 2) { ... }',
        options: [
          '10 times',
          '5 times (i = 0, 2, 4, 6, 8)',
          '4 times',
          'Infinite times'
        ],
        correctIndex: 1,
        explanation: 'i starts at 0 and increments by 2 each step, taking values 0, 2, 4, 6, 8 (exactly 5 iterations).'
      },
      {
        id: 'q-c-loop-4',
        question: 'What is wrong with this code?\n\nint x = 10;\ndo {\n    printf("%d", x);\n    x--;\n} while (x > 0)',
        options: [
          'do-while cannot count downwards',
          'Missing semicolon after the while(...) condition',
          'x is declared as an invalid type',
          'printf requires %i instead of %d'
        ],
        correctIndex: 1,
        explanation: 'In C, a do-while loop must conclude with a semicolon after the while condition: } while (x > 0);'
      },
      {
        id: 'q-c-loop-5',
        question: 'Which statement terminates the entire innermost loop immediately?',
        options: [
          'return',
          'continue',
          'break',
          'goto end'
        ],
        correctIndex: 2,
        explanation: 'break terminates execution of the innermost enclosing loop or switch.'
      }
    ],
    codingChallenge: {
      title: 'Prime Number Verification Filter',
      difficulty: 'Easy',
      problem_statement: 'Given an integer n = 29, write a loop to determine if n is prime (divisible only by 1 and itself). Print "29 is PRIME" if prime.',
      input_format: 'No input needed.',
      output_format: '29 is PRIME',
      constraints: 'Test divisors from 2 up to n - 1.',
      starter_code: `#include <stdio.h>

int main(void) {
    int n = 29;
    int is_prime = 1;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) {
            is_prime = 0;
            break;
        }
    }
    if (is_prime && n > 1) {
        printf("%d is PRIME\\n", n);
    } else {
        printf("%d is NOT PRIME\\n", n);
    }
    return 0;
}`,
      solution_code: `#include <stdio.h>

int main(void) {
    int n = 29;
    int is_prime = 1;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) {
            is_prime = 0;
            break;
        }
    }
    if (is_prime && n > 1) {
        printf("%d is PRIME\\n", n);
    } else {
        printf("%d is NOT PRIME\\n", n);
    }
    return 0;
}`,
      test_cases: [
        {
          input: '',
          expected_output: '29 is PRIME'
        }
      ]
    },
    summary: [
      'for loops are ideal for counter-controlled loops with known boundaries.',
      'while loops repeat while a condition holds true; checked before each iteration.',
      'do-while guarantees at least one execution and requires a trailing semicolon.',
      'break exits the loop immediately; continue skips to the next iteration update.',
      'Watch out for off-by-one errors and accidental semicolons after loop headers.'
    ]
  },

  // =========================================================================
  // TOPIC 07: Functions & Modular Programming
  // =========================================================================
  {
    id: 'top-c-functions',
    number: 7,
    numberDisplay: '07',
    moduleId: 'mod-c-control',
    moduleTitle: 'Module 02: Control Flow & Modular Logic',
    title: 'Functions & Modular Programming',
    slug: 'functions-and-modular-programming',
    language: 'c',
    shortDescription: 'Decompose complex programs into clean, reusable functions. Master function prototypes, pass-by-value argument semantics, return types, local vs global scope, and static storage duration.',
    difficulty: 'Beginner',
    estimatedMinutes: 35,
    prerequisiteId: 'top-c-loops',
    learningObjectives: [
      'Declare function prototypes to inform the compiler of signatures before implementation',
      'Understand pass-by-value mechanics where functions receive independent copies of arguments',
      'Differentiate local variable scope, global scope, and static local lifetime persistence',
      'Build modular, reusable multi-function applications with clean input and output contracts'
    ],
    conceptExplanation: `### Why Modular Functions?
Functions break large monolithic codebases into isolated, testable, and reusable blocks. In C, every function must declare its return type, parameter list, and unique identifier.

### The Three Elements of a C Function
1. **Function Declaration (Prototype)**: Tells the compiler the function name, return type, and parameter types before \`main()\`:
   \`\`\`c
   int calculate_area(int length, int width); // Prototype
   \`\`\`
2. **Function Call**: Invokes the function with actual arguments:
   \`\`\`c
   int area = calculate_area(10, 5);
   \`\`\`
3. **Function Definition**: The actual code implementation:
   \`\`\`c
   int calculate_area(int length, int width) {
       return length * width;
   }
   \`\`\`

### Pass-By-Value Semantics
In standard C, all arguments are passed **strictly by value**. The function receives a copy of each argument placed onto its new stack frame. Any modification to parameters inside the function has **no effect** on the caller's original variables.

### Variable Scope and Storage Duration
- **Local Variables (Automatic)**: Allocated on the call stack when the block is entered; deallocated immediately when the function returns.
- **Global Variables**: Declared outside all functions; accessible everywhere in the translation unit; persists for the entire program lifetime.
- **\`static\` Local Variables**: Declared inside a function with the \`static\` keyword. Retains its value across multiple function calls:
  \`\`\`c
  void counter(void) {
      static int calls = 0; // Initialized once!
      calls++;
      printf("Call count: %d\\n", calls);
  }
  \`\`\``,
    simpleExample: {
      code: `#include <stdio.h>

// Function prototype
int add(int a, int b);

int main(void) {
    int sum = add(15, 27);
    printf("15 + 27 = %d\\n", sum);
    return 0;
}

int add(int a, int b) {
    return a + b;
}`,
      explanation: 'Declares prototype add, invokes it from main with two arguments, computes sum on child stack frame, and returns 42.'
    },
    syntax: `// ReturnType FunctionName(ParameterType param1, ...);
int compute_max(int a, int b); // Prototype

void print_status(const char *msg); // Void function (no return value)

// Definition
int compute_max(int a, int b) {
    return (a > b) ? a : b;
}`,
    codeExample: `#include <stdio.h>

// Function prototypes
double calculate_circle_area(double radius);
void print_separator(char symbol, int count);
void record_transaction(double amount);

int main(void) {
    print_separator('=', 40);
    printf("   FINANCIAL TRANSACTION ENGINE\\n");
    print_separator('=', 40);
    
    double r = 7.0;
    printf("Area of radius %.1f = %.2f\\n", r, calculate_circle_area(r));
    
    print_separator('-', 40);
    record_transaction(150.00);
    record_transaction(85.50);
    record_transaction(420.25);
    print_separator('=', 40);
    
    return 0;
}

double calculate_circle_area(double radius) {
    const double PI = 3.141592653589793;
    return PI * radius * radius;
}

void print_separator(char symbol, int count) {
    for (int i = 0; i < count; i++) {
        putchar(symbol);
    }
    putchar('\\n');
}

void record_transaction(double amount) {
    // Static local variable preserves state between calls
    static double total_processed = 0.0;
    static int transaction_count = 0;
    
    transaction_count++;
    total_processed += amount;
    
    printf("Txn #%d: +$%-8.2f | Running Total: $%.2f\\n",
           transaction_count, amount, total_processed);
}`,
    expectedOutput: `========================================
   FINANCIAL TRANSACTION ENGINE
========================================
Area of radius 7.0 = 153.94
----------------------------------------
Txn #1: +$150.00   | Running Total: $150.00
Txn #2: +$85.50    | Running Total: $235.50
Txn #3: +$420.25   | Running Total: $655.75
========================================`,
    stepByStep: [
      '1. Prototype declarations allow main() to call functions defined further down in the file.',
      '2. When calculate_circle_area(r) is called, value 7.0 is copied into the function parameter radius.',
      '3. Stack frame is allocated with local constant PI; returns 153.94 into the caller register.',
      '4. record_transaction() static variables are allocated in the data segment once, retaining running totals across invocations.',
      '5. Stack frame is popped clean upon return.'
    ],
    commonMistakes: [
      {
        mistake: 'Assuming pass-by-value allows modifying caller variables',
        codeSnippet: `void swap(int a, int b) {
    int temp = a;
    a = b;
    b = temp; // Only swaps the local parameter copies!
}`,
        correction: 'To modify caller variables, pass memory pointers (addresses) using pointers: void swap(int *a, int *b).',
        explanation: 'In C, arguments are copies; modifying copies does not change the caller variables.'
      },
      {
        mistake: 'Omitting function prototypes before calling functions below main',
        codeSnippet: `int main(void) {
    calc(); // Error / Warning: implicit declaration of function calc
}
void calc(void) { }`,
        correction: 'Always declare a prototype void calc(void); above main().',
        explanation: 'The compiler needs prototype signatures to check argument types and return types.'
      }
    ],
    realWorldExample: {
      scenario: 'Cryptographic Hash Block Processing',
      code: `#include <stdio.h>

unsigned int rotate_left(unsigned int value, int shift) {
    return (value << shift) | (value >> (32 - shift));
}

unsigned int sha1_round_op(unsigned int b, unsigned int c, unsigned int d) {
    return (b & c) | ((~b) & d);
}

int main(void) {
    unsigned int word = 0x89ABCDEF;
    unsigned int rotated = rotate_left(word, 5);
    printf("Original: 0x%08X -> Rotated: 0x%08X\\n", word, rotated);
    return 0;
}`,
      explanation: 'Cryptographic security libraries (OpenSSL, Libsodium) encapsulate bit-level primitives into modular static inline functions.'
    },
    practice: {
      prompt: 'Write a function int square(int n) that returns the square of an integer. Call it in main() with n = 12 and print "Square of 12 is 144".',
      starterCode: `#include <stdio.h>

// Declare prototype:

int main(void) {
    // Call square and print result:
    
    return 0;
}

// Define square:
`,
      expectedOutputMatcher: 'Square of 12 is 144',
      hint: 'Define int square(int n) { return n * n; } and call it in printf.',
      solution: `#include <stdio.h>

int square(int n);

int main(void) {
    int num = 12;
    printf("Square of %d is %d\\n", num, square(num));
    return 0;
}

int square(int n) {
    return n * n;
}`
    },
    quiz: [
      {
        id: 'q-c-func-1',
        question: 'What is the purpose of a function prototype in C?',
        options: [
          'To allocate dynamic memory for the function body',
          'To notify the compiler of a function\'s name, parameter types, and return type before its definition',
          'To instruct the linker to generate an object file',
          'To make the function execute automatically at startup'
        ],
        correctIndex: 1,
        explanation: 'Prototypes allow the compiler to perform compile-time type verification on function calls before seeing the full definition.'
      },
      {
        id: 'q-c-func-2',
        question: 'What happens to local variables declared inside a function when that function returns?',
        options: [
          'They remain permanently stored on the heap',
          'Their stack memory frame is deallocated and their values are lost',
          'They are automatically converted to global variables',
          'They are saved to the hard disk'
        ],
        correctIndex: 1,
        explanation: 'Local automatic variables exist on the function stack frame and are destroyed upon returning.'
      },
      {
        id: 'q-c-func-3',
        question: 'Which keyword allows a local variable to retain its value between successive calls to the same function?',
        options: [
          'extern',
          'volatile',
          'static',
          'register'
        ],
        correctIndex: 2,
        explanation: 'A static local variable is stored in the data segment rather than the stack, preserving its value throughout program execution.'
      },
      {
        id: 'q-c-func-4',
        question: 'What is the return type of a function that does not return any value to its caller?',
        options: [
          'int',
          'null',
          'void',
          'empty'
        ],
        correctIndex: 2,
        explanation: 'In C, void indicates the absence of a return value.'
      },
      {
        id: 'q-c-func-5',
        question: 'If you pass an integer variable x = 10 to a function void modify(int x) { x = 20; }, what is the value of x in main() after the function returns?',
        options: [
          '20',
          '10',
          '0',
          'Undefined'
        ],
        correctIndex: 1,
        explanation: 'Because C is strictly pass-by-value, modify() receives a copy; the original x in main() remains 10.'
      }
    ],
    codingChallenge: {
      title: 'Power Function Implementation',
      difficulty: 'Easy',
      problem_statement: 'Implement a function long long power(int base, int exp) that calculates base raised to exp using a loop. In main(), compute 2^10 and print "2^10 = 1024".',
      input_format: 'No input needed.',
      output_format: '2^10 = 1024',
      constraints: 'exp >= 0.',
      starter_code: `#include <stdio.h>

long long power(int base, int exp) {
    long long res = 1;
    for (int i = 0; i < exp; i++) {
        res *= base;
    }
    return res;
}

int main(void) {
    int b = 2, e = 10;
    printf("%d^%d = %lld\\n", b, e, power(b, e));
    return 0;
}`,
      solution_code: `#include <stdio.h>

long long power(int base, int exp) {
    long long res = 1;
    for (int i = 0; i < exp; i++) {
        res *= base;
    }
    return res;
}

int main(void) {
    int b = 2, e = 10;
    printf("%d^%d = %lld\\n", b, e, power(b, e));
    return 0;
}`,
      test_cases: [
        {
          input: '',
          expected_output: '2^10 = 1024'
        }
      ]
    },
    summary: [
      'Function prototypes declare signatures so the compiler can verify argument counts and types.',
      'C uses pass-by-value argument passing; functions operate on independent parameter copies.',
      'void functions perform actions without returning values.',
      'static local variables persist their values across repeated function invocations.',
      'Decompose complex tasks into small, self-contained modular functions for clarity.'
    ]
  },

  // =========================================================================
  // TOPIC 08: Recursion & Call Stack
  // =========================================================================
  {
    id: 'top-c-recursion',
    number: 8,
    numberDisplay: '08',
    moduleId: 'mod-c-control',
    moduleTitle: 'Module 02: Control Flow & Modular Logic',
    title: 'Recursion & Call Stack',
    slug: 'recursion-and-call-stack',
    language: 'c',
    shortDescription: 'Master recursive problem solving. Understand the anatomy of recursive functions (base case vs. recursive step), stack frame growth, call stack unwinding, and preventing stack overflow.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisiteId: 'top-c-functions',
    learningObjectives: [
      'Define recursive functions with explicit base cases and converging recursive steps',
      'Trace how the CPU call stack pushes activation records on descent and pops them on unwind',
      'Analyze the time and space complexity of recursive algorithms versus iterative solutions',
      'Diagnose and prevent stack overflow caused by missing or unreachable base cases'
    ],
    conceptExplanation: `### What is Recursion?
A function is recursive if it **solves a problem by calling a smaller instance of itself**. Every recursive function must contain two essential components:
1. **The Base Case**: A trivial stopping condition that returns directly without further recursive calls.
2. **The Recursive Step**: Breaks the problem into smaller sub-problems and calls itself, moving closer to the base case.

### The Call Stack & Activation Records
When a function calls itself, the CPU creates a new **stack frame (activation record)** on top of the call stack. Each frame contains:
- Local variable storage for that call level
- The parameter arguments passed to that invocation
- The **Return Address** (the instruction pointer to resume when this frame returns)

### Stack Descent vs. Unwinding
- **Descent Phase**: Function calls descend deeper, stacking frames: \`fact(4) -> fact(3) -> fact(2) -> fact(1)\`.
- **Base Case Reached**: \`fact(1)\` returns \`1\` directly.
- **Unwinding Phase**: Frames pop in reverse (LIFO) order, multiplying accumulated values on the way back up: \`1 * 2 = 2\`, \`2 * 3 = 6\`, \`6 * 4 = 24\`.

### Recursion vs. Iteration
| Characteristic | Recursion | Iteration |
| :--- | :--- | :--- |
| **Control** | Repeated function calls | Loop counters and conditions |
| **Memory** | O(N) stack memory overhead | O(1) auxiliary space |
| **Risk** | Stack Overflow if too deep | Infinite loops if condition fails |
| **Elegance** | Natural for trees, graphs, divide-and-conquer | Ideal for linear traversals |`,
    simpleExample: {
      code: `#include <stdio.h>

int factorial(int n) {
    if (n <= 1) return 1; // Base case
    return n * factorial(n - 1); // Recursive step
}

int main(void) {
    printf("5! = %d\\n", factorial(5));
    return 0;
}`,
      explanation: 'factorial(5) calls factorial(4)... down to factorial(1). Once the base case returns 1, the stack unwinds to yield 120.'
    },
    syntax: `// Recursive Function Structure
ReturnType recursive_func(ParamType param) {
    // 1. BASE CASE: Immediate return
    if (base_condition) {
        return base_value;
    }
    
    // 2. RECURSIVE STEP: Move towards base case
    return combine(param, recursive_func(smaller_param));
}`,
    codeExample: `#include <stdio.h>

// 1. Recursive Factorial
long long factorial(int n) {
    if (n <= 1) return 1;
    return (long long)n * factorial(n - 1);
}

// 2. Recursive Fibonacci
int fibonacci(int n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// 3. Recursive Sum of Digits
int sum_of_digits(int n) {
    if (n == 0) return 0;
    return (n % 10) + sum_of_digits(n / 10);
}

int main(void) {
    printf("--- Factorial Computation ---\\n");
    for (int i = 1; i <= 6; i++) {
        printf("%d! = %lld\\n", i, factorial(i));
    }
    
    printf("\\n--- Fibonacci Sequence (First 8 Terms) ---\\n");
    for (int i = 0; i < 8; i++) {
        printf("%d ", fibonacci(i));
    }
    printf("\\n");
    
    int number = 48291;
    printf("\\nSum of digits of %d = %d\\n", number, sum_of_digits(number));
    
    return 0;
}`,
    expectedOutput: `--- Factorial Computation ---
1! = 1
2! = 2
3! = 6
4! = 24
5! = 120
6! = 720

--- Fibonacci Sequence (First 8 Terms) ---
0 1 1 2 3 5 8 13 

Sum of digits of 48291 = 24`,
    stepByStep: [
      '1. Call factorial(4): pushes frame 1 with n=4; calls factorial(3).',
      '2. Pushes frame 2 with n=3; calls factorial(2).',
      '3. Pushes frame 3 with n=2; calls factorial(1).',
      '4. Frame 4 hits base case (n <= 1); returns 1 without pushing more frames.',
      '5. Stack unwinds: frame 3 returns 2*1=2; frame 2 returns 3*2=6; frame 1 returns 4*6=24.'
    ],
    commonMistakes: [
      {
        mistake: 'Missing or unreachable base case causing Stack Overflow',
        codeSnippet: `int countdown(int n) {
    // Missing if (n <= 0) return 0;
    return countdown(n - 1); // Crashes with Segmentation Fault!
}`,
        correction: 'Always verify the base case handles boundary conditions and is guaranteed to be reached.',
        explanation: 'Each call allocates stack space; unbounded recursion exhausts stack memory limits, causing a segmentation fault crash.'
      },
      {
        mistake: 'Naive exponential Fibonacci recursion for large n',
        codeSnippet: `int fib = fibonacci(45); // Takes tens of seconds due to 2^45 redundant calls!`,
        correction: 'Use memoization or iterative loops for linear O(N) computation of Fibonacci numbers.',
        explanation: 'Double recursion without caching recalculates identical subtrees repeatedly, causing O(2^N) exponential time complexity.'
      }
    ],
    realWorldExample: {
      scenario: 'Recursive File Directory Hierarchy Traversal',
      code: `#include <stdio.h>

void print_indent(int level) {
    for (int i = 0; i < level; i++) printf("  ");
}

void traverse_filesystem(const char *name, int depth) {
    print_indent(depth);
    printf("📁 %s/\\n", name);
    
    if (depth >= 2) return; // Simulated base case stopping at depth 2
    
    print_indent(depth + 1);
    printf("📄 config.sys\\n");
    traverse_filesystem("sub_module", depth + 1);
}

int main(void) {
    traverse_filesystem("root", 0);
    return 0;
}`,
      explanation: 'Operating system file managers and Git indexers traverse nested directory trees using recursive traversal algorithms.'
    },
    practice: {
      prompt: 'Write a recursive function int sum_to_n(int n) that computes 1 + 2 + ... + n. In main(), calculate sum_to_n(10) and print "Sum 1 to 10 is 55".',
      starterCode: `#include <stdio.h>

int sum_to_n(int n) {
    // Base case: if n <= 1 return n
    // Recursive step: n + sum_to_n(n - 1)
    return 0;
}

int main(void) {
    printf("Sum 1 to 10 is %d\\n", sum_to_n(10));
    return 0;
}`,
      expectedOutputMatcher: 'Sum 1 to 10 is 55',
      hint: 'if (n <= 1) return n; return n + sum_to_n(n - 1);',
      solution: `#include <stdio.h>

int sum_to_n(int n) {
    if (n <= 1) return n;
    return n + sum_to_n(n - 1);
}

int main(void) {
    printf("Sum 1 to 10 is %d\\n", sum_to_n(10));
    return 0;
}`
    },
    quiz: [
      {
        id: 'q-c-rec-1',
        question: 'What are the two mandatory components of every correct recursive function?',
        options: [
          'An iteration loop and a pointer',
          'A base case and a recursive step',
          'A global variable and a static counter',
          'A switch statement and an exit code'
        ],
        correctIndex: 1,
        explanation: 'Every recursive algorithm requires a base case to terminate and a recursive step that progresses toward the base case.'
      },
      {
        id: 'q-c-rec-2',
        question: 'What happens when a recursive function fails to hit its base case and continues calling itself indefinitely?',
        options: [
          'The compiler automatically optimizes it into a loop',
          'The call stack runs out of memory, causing a Stack Overflow crash',
          'The program pauses and prompts the user',
          'The return value defaults to 0'
        ],
        correctIndex: 1,
        explanation: 'Each function invocation allocates a stack frame; infinite recursion exhausts the process stack limit, triggering a segmentation fault.'
      },
      {
        id: 'q-c-rec-3',
        question: 'What is the return value of mystery(3)?\n\nint mystery(int n) {\n    if (n == 0) return 0;\n    return n + mystery(n - 1);\n}',
        options: [
          '3',
          '6',
          '0',
          '9'
        ],
        correctIndex: 1,
        explanation: 'mystery(3) = 3 + mystery(2) = 3 + 2 + mystery(1) = 3 + 2 + 1 + mystery(0) = 3 + 2 + 1 + 0 = 6.'
      },
      {
        id: 'q-c-rec-4',
        question: 'In what order are recursive activation records popped off the call stack during the unwinding phase?',
        options: [
          'First-In First-Out (FIFO)',
          'Last-In First-Out (LIFO)',
          'Random order',
          'Alphabetical order'
        ],
        correctIndex: 1,
        explanation: 'The call stack is a LIFO (Last-In First-Out) structure; the most recently pushed frame returns and pops first.'
      },
      {
        id: 'q-c-rec-5',
        question: 'What is the auxiliary space complexity of calculating factorial(N) recursively?',
        options: [
          'O(1) constant space',
          'O(N) stack memory proportional to call depth',
          'O(N^2) quadratic space',
          'O(log N) logarithmic space'
        ],
        correctIndex: 1,
        explanation: 'Recursive factorial pushes N activation frames onto the call stack simultaneously, requiring O(N) auxiliary stack memory.'
      }
    ],
    codingChallenge: {
      title: 'Recursive Greatest Common Divisor (Euclid\'s Algorithm)',
      difficulty: 'Medium',
      problem_statement: 'Implement Euclid\'s algorithm recursively: gcd(a, b) = if b == 0 return a, else return gcd(b, a % b). Calculate gcd(48, 18) and print "GCD of 48 and 18 is 6".',
      input_format: 'No input needed.',
      output_format: 'GCD of 48 and 18 is 6',
      constraints: 'Must be implemented recursively.',
      starter_code: `#include <stdio.h>

int gcd(int a, int b) {
    if (b == 0) return a;
    return gcd(b, a % b);
}

int main(void) {
    int a = 48, b = 18;
    printf("GCD of %d and %d is %d\\n", a, b, gcd(a, b));
    return 0;
}`,
      solution_code: `#include <stdio.h>

int gcd(int a, int b) {
    if (b == 0) return a;
    return gcd(b, a % b);
}

int main(void) {
    int a = 48, b = 18;
    printf("GCD of %d and %d is %d\\n", a, b, gcd(a, b));
    return 0;
}`,
      test_cases: [
        {
          input: '',
          expected_output: 'GCD of 48 and 18 is 6'
        }
      ]
    },
    summary: [
      'Recursion decomposes complex problems into smaller self-similar sub-problems.',
      'Always implement and test the base case first to avoid stack overflow crashes.',
      'Activation records hold local variables, arguments, and return addresses on the call stack.',
      'Unwinding happens in Last-In First-Out (LIFO) order as frames return.',
      'Consider iterative alternatives when O(N) stack space overhead is prohibitive.'
    ]
  }
];
