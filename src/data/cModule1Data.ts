import { CTopic } from './cFundamentalsData';

export const C_MODULE_1_TOPICS: CTopic[] = [
  // =========================================================================
  // TOPIC 01: Introduction to C Programming
  // =========================================================================
  {
    id: 'top-c-intro',
    number: 1,
    numberDisplay: '01',
    moduleId: 'mod-c-foundations',
    moduleTitle: 'Module 01: Core Language Foundations',
    title: 'Introduction to C Programming',
    slug: 'introduction-to-c-programming',
    language: 'c',
    shortDescription: 'Discover the roots of modern computing with C. Learn how code compiles directly into machine instructions, the role of main(), and how printf() interacts with the operating system.',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    prerequisiteId: null,
    learningObjectives: [
      'Explain the origin, historical significance, and ongoing relevance of C in system software',
      'Distinguish compiled languages from interpreted languages and identify the four stages of compilation',
      'Analyze the structural components of a standard C source file (#include, main, return)',
      'Write, compile, and execute your first C program using printf() and standard escape sequences'
    ],
    conceptExplanation: `### What is C?
C is a general-purpose, procedural programming language developed in 1972 by Dennis Ritchie at Bell Laboratories for the Unix operating system. Nearly every modern operating system (Linux, Windows, macOS, Android, iOS), database engine (PostgreSQL, SQLite, MySQL), and game engine runtime contains extensive C code.

### Compiler vs. Interpreter
Unlike Python or JavaScript, which rely on a runtime interpreter or JIT virtual machine to execute source statements, C is an **ahead-of-time compiled language**. A C compiler translates human-readable source text (*.c) directly into native CPU machine instructions.

### The Four Stages of C Compilation
1. **Preprocessing (\`cpp\`)**: Expands directives beginning with \`#\`. It copies header declarations (\`#include <stdio.h>\`), substitutes symbolic constants (\`#define\`), and strips away comments.
2. **Compilation (\`cc1\` / Clang)**: Analyzes the preprocessed code, checks grammar and type validity, and translates C constructs into target-specific assembly language (*.s).
3. **Assembly (\`as\`)**: Translates assembly instructions into relocatable machine-code object files (*.o or *.obj) containing raw binary opcodes.
4. **Linking (\`ld\`)**: Resolves external references, connects standard library binary implementations (such as the actual implementation of \`printf\`), and generates a standalone runnable executable file (*.exe on Windows, ELF binary on Linux).

### Anatomy of a C Program
\`\`\`c
#include <stdio.h> // Preprocessor directive importing standard I/O declarations

int main(void) {   // Entry point of every C program; returns integer exit status
    printf("Hello, World!\\n"); // Standard library function printing to stdout
    return 0;      // 0 indicates successful termination to the host OS
}
\`\`\`
Every C program requires exactly one \`main()\` function. Returning \`0\` signifies that the process finished without error. Non-zero values signify error codes to the operating system shell.`,
    simpleExample: {
      code: `#include <stdio.h>

int main(void) {
    printf("C is fast, reliable, and powerful.\\n");
    return 0;
}`,
      explanation: 'Includes the standard I/O header for printf, starts the main execution thread, prints a line of text terminated by a newline character (\\n), and exits with status 0.'
    },
    syntax: `// Basic C Program Template
#include <stdio.h> // Header inclusion

int main(void) {
    // Single-line comment
    /* Multi-line
       comment */
    printf("Formatted output with newline: %s\\n", "Hello C");
    return 0; // Return exit code 0 to operating system
}`,
    codeExample: `#include <stdio.h>

int main(void) {
    printf("=========================================\\n");
    printf("  COGNITIVE LEARNING SYSTEM - C FOUNDATIONS\\n");
    printf("=========================================\\n");
    printf("Status: Compiler active and calibrated.\\n");
    printf("Language: Standard C (C99 / C11 / C17)\\n");
    printf("Architecture: Native Subprocess Execution\\n");
    printf("=========================================\\n");
    return 0;
}`,
    expectedOutput: `=========================================
  COGNITIVE LEARNING SYSTEM - C FOUNDATIONS
=========================================
Status: Compiler active and calibrated.
Language: Standard C (C99 / C11 / C17)
Architecture: Native Subprocess Execution
=========================================`,
    stepByStep: [
      '1. Preprocessor loads <stdio.h> function signatures into the translation unit.',
      '2. Compiler parses the token stream and verifies that main returns an integer.',
      '3. Assembler converts the assembly instructions into machine binary object code.',
      '4. Linker hooks printf to the C runtime library and outputs the executable.',
      '5. Operating system loads the executable into memory, allocates stack frames, and jumps to main().'
    ],
    commonMistakes: [
      {
        mistake: 'Forgetting the semicolon at the end of a statement',
        codeSnippet: `int main(void) {
    printf("Hello") // Error: missing semicolon
    return 0;
}`,
        correction: 'Ensure every statement in C terminates with a semicolon (;).',
        explanation: 'In C, statements are semicolon-delimited, not newline-delimited.'
      },
      {
        mistake: 'Missing #include <stdio.h>',
        codeSnippet: `int main(void) {
    printf("Hello\\n"); // Warning/Error: implicit declaration of function printf
    return 0;
}`,
        correction: 'Always include <stdio.h> when using printf, scanf, puts, or file utilities.',
        explanation: 'The compiler needs the prototype signature to verify argument types.'
      },
      {
        mistake: 'Using single quotes instead of double quotes for strings',
        codeSnippet: `printf('Hello\\n'); // Error: character constant must be a single char`,
        correction: 'Use double quotes ("...") for string literals and single quotes (\'...\') for single characters.',
        explanation: 'In C, "text" creates a null-terminated char array; \'a\' is an integer character literal.'
      }
    ],
    realWorldExample: {
      scenario: 'Operating System Kernel Boot Message',
      code: `#include <stdio.h>

int main(void) {
    printf("[    0.000000] Linux version 6.5.0-generic\\n");
    printf("[    0.000001] Command line: BOOT_IMAGE=/vmlinuz root=/dev/nvme0n1p2 ro\\n");
    printf("[    0.000002] Memory: 16298340K/16777216K available\\n");
    printf("[    0.000003] System initialization complete.\\n");
    return 0;
}`,
      explanation: 'Operating system bootloaders use direct C entry points to write formatted diagnostic timestamps and kernel state to serial consoles.'
    },
    practice: {
      prompt: 'Write a program that prints your name on the first line, your programming track ("C Programming Foundations") on the second line, and "Ready to build high-performance software!" on the third line.',
      starterCode: `#include <stdio.h>

int main(void) {
    // Write your printf statements here:
    
    return 0;
}`,
      expectedOutputMatcher: 'C Programming Foundations',
      hint: 'Use three separate printf() calls, each ending with the newline escape sequence \\n.',
      solution: `#include <stdio.h>

int main(void) {
    printf("Alex Mercer\\n");
    printf("C Programming Foundations\\n");
    printf("Ready to build high-performance software!\\n");
    return 0;
}`
    },
    quiz: [
      {
        id: 'q-c-intro-1',
        question: 'Who originally designed and implemented the C programming language at Bell Labs?',
        options: [
          'Bjarne Stroustrup',
          'Dennis Ritchie',
          'Guido van Rossum',
          'James Gosling'
        ],
        correctIndex: 1,
        explanation: 'Dennis Ritchie created C in 1972 at Bell Labs to re-implement the Unix operating system kernel.'
      },
      {
        id: 'q-c-intro-2',
        question: 'Which compilation phase is responsible for expanding #include directives and stripping comments?',
        options: [
          'Assembler',
          'Linker',
          'Preprocessor',
          'Code Optimizer'
        ],
        correctIndex: 2,
        explanation: 'The C preprocessor (cpp) operates directly on source text, performing macro substitution and header inclusion before compilation begins.'
      },
      {
        id: 'q-c-intro-3',
        question: 'What does returning 0 from the main() function conventionally signify to the operating system?',
        options: [
          'The program completed with a generic runtime fault',
          'The program terminated successfully without error',
          'The program requires manual memory cleanup',
          'The program returned an empty output stream'
        ],
        correctIndex: 1,
        explanation: 'In POSIX and Windows shell environments, an exit code of 0 universally indicates that the process concluded successfully.'
      },
      {
        id: 'q-c-intro-4',
        question: 'What is the expected output of this code snippet?\\n\\n#include <stdio.h>\\nint main(void) {\\n    printf("Alpha\\\\nBeta\\\\tGamma\\\\n");\\n    return 0;\\n}',
        options: [
          'Alpha Beta Gamma on a single line',
          'Alpha on line 1, then Beta followed by a tab space and Gamma on line 2',
          'Compilation error due to invalid escape sequences',
          'Alpha\\nBeta\\tGamma literally'
        ],
        correctIndex: 1,
        explanation: '\\n prints a newline and \\t prints a horizontal tab space, placing Alpha on line 1, then "Beta    Gamma" on line 2.'
      },
      {
        id: 'q-c-intro-5',
        question: 'Which of the following files represents the final standalone executable binary generated by the linker on Windows?',
        options: [
          'program.c',
          'program.i',
          'program.obj',
          'program.exe'
        ],
        correctIndex: 3,
        explanation: '.c is source, .i is preprocessed code, .obj is compiled object code, and .exe is the linked standalone executable.'
      }
    ],
    codingChallenge: {
      title: 'Console Identity Card Generator',
      difficulty: 'Easy',
      problem_statement: 'Construct a standalone C program that outputs a formatted Developer Credential card with specific borders and fields.',
      input_format: 'No input required.',
      output_format: 'Exact boxed text matching the required specification.',
      constraints: 'Must use valid printf formatting and return 0.',
      starter_code: `#include <stdio.h>

int main(void) {
    printf("+--------------------------------+\\n");
    printf("| DEVELOPER: Linus Torvalds      |\\n");
    printf("| ROLE:      System Architect    |\\n");
    printf("| LANGUAGE:  C Language          |\\n");
    printf("+--------------------------------+\\n");
    return 0;
}`,
      solution_code: `#include <stdio.h>

int main(void) {
    printf("+--------------------------------+\\n");
    printf("| DEVELOPER: Linus Torvalds      |\\n");
    printf("| ROLE:      System Architect    |\\n");
    printf("| LANGUAGE:  C Language          |\\n");
    printf("+--------------------------------+\\n");
    return 0;
}`,
      test_cases: [
        {
          input: '',
          expected_output: '+--------------------------------+\n| DEVELOPER: Linus Torvalds      |\n| ROLE:      System Architect    |\n| LANGUAGE:  C Language          |\n+--------------------------------+'
        }
      ]
    },
    summary: [
      'C is a statically-typed, ahead-of-time compiled systems programming language.',
      'The four compilation steps are Preprocessing, Compilation, Assembly, and Linking.',
      'Every executable C application begins execution at the main() function.',
      'Always terminate statements with semicolons and enclose strings in double quotes.',
      'Header files like <stdio.h> provide declarations for standard library functions like printf().'
    ]
  },

  // =========================================================================
  // TOPIC 02: Variables, Data Types & Constants
  // =========================================================================
  {
    id: 'top-c-variables-types',
    number: 2,
    numberDisplay: '02',
    moduleId: 'mod-c-foundations',
    moduleTitle: 'Module 01: Core Language Foundations',
    title: 'Variables, Data Types & Constants',
    slug: 'variables-data-types-constants',
    language: 'c',
    shortDescription: 'Master memory allocation for fundamental C types. Learn int, char, float, double byte widths, format specifiers, signed/unsigned modifiers, type casting, and const qualifiers.',
    difficulty: 'Beginner',
    estimatedMinutes: 30,
    prerequisiteId: 'top-c-intro',
    learningObjectives: [
      'Declare, initialize, and name variables following strict C identifier rules',
      'Explain the memory width and range of char (1B), int (4B), float (4B), and double (8B)',
      'Apply signed and unsigned integer modifiers and check exact sizes with sizeof()',
      'Distinguish #define preprocessor constants from const variables, and perform explicit type casting'
    ],
    conceptExplanation: `### Variables as Named Memory Locations
A variable in C is a designated memory location on the stack or data segment that holds a value of a specific data type. In C, you **must declare the type** of every variable before using it.

### Fundamental Data Types & Typical Sizes
| Type | Typical Size | Value Range | Format Specifier |
| :--- | :--- | :--- | :--- |
| \`char\` | 1 byte (8 bits) | -128 to 127 (or 0 to 255 unsigned) | \`%c\` |
| \`int\` | 4 bytes (32 bits) | -2,147,483,648 to 2,147,483,647 | \`%d\` or \`%i\` |
| \`float\` | 4 bytes (32 bits) | ~1.2E-38 to 3.4E+38 (6-7 digits precision) | \`%f\` |
| \`double\` | 8 bytes (64 bits) | ~2.3E-308 to 1.7E+308 (15-17 digits precision) | \`%lf\` |

*Note: The C standard only guarantees minimum widths. Exact sizes can vary between microcontrollers (16-bit int) and 64-bit desktop processors.*

### Integer Modifiers
- \`unsigned\`: Shifts the range to strictly non-negative numbers, doubling the positive capacity (\`unsigned int\` is 0 to 4,294,967,295; specifier \`%u\`).
- \`short\`: Usually 2 bytes (-32,768 to 32,767; specifier \`%hd\`).
- \`long\`: 4 or 8 bytes depending on platform (specifier \`%ld\`).
- \`long long\`: At least 8 bytes (specifier \`%lld\`).

### The sizeof() Operator
\`sizeof\` is a compile-time unary operator that returns the memory footprint of a type or variable in bytes:
\`\`\`c
printf("Size of int: %zu bytes\\n", sizeof(int));
\`\`\`

### Constants: #define vs. const
- **\`#define\`**: Preprocessor symbolic replacement. Has no type safety and does not allocate memory: \`#define MAX_USERS 1000\`
- **\`const\` keyword**: Declares a read-only variable enforced by compiler type checks: \`const double PI = 3.141592653589793;\`

### Type Conversion & Explicit Casting
- **Implicit conversion**: The compiler automatically promotes lower types (e.g. \`int\` to \`double\`) in mixed expressions.
- **Explicit casting**: \`(type)expression\` manually forces a type change to avoid integer truncation:
  \`double avg = (double)total_score / student_count;\``,
    simpleExample: {
      code: `#include <stdio.h>

int main(void) {
    int age = 22;
    float gpa = 3.85f;
    char grade = 'A';
    
    printf("Age: %d, GPA: %.2f, Grade: %c\\n", age, gpa, grade);
    return 0;
}`,
      explanation: 'Declares an integer, a floating-point number, and a single character, printing each with its respective format specifier.'
    },
    syntax: `// Declarations and Modifiers
int count = 10;
unsigned int positive_only = 4000000000U;
short small_num = 32000;
long long large_num = 9000000000000000000LL;

// Floating Point
float temp = 98.6f;
double precise_val = 3.141592653589793;

// Constants
#define BUFFER_SIZE 1024
const int DAYS_IN_WEEK = 7;

// Explicit Type Cast
int a = 7, b = 2;
double ratio = (double)a / b; // Evaluates to 3.5 instead of 3`,
    codeExample: `#include <stdio.h>

#define SCHOOL_CODE "TECH-2026"

int main(void) {
    const int PASSING_SCORE = 60;
    
    int student_id = 1042;
    char letter_grade = 'B';
    float raw_score = 84.75f;
    double weighted_gpa = 3.4258;
    unsigned int credits_completed = 48;
    
    printf("--- Student Information Card ---\\n");
    printf("School Code:   %s\\n", SCHOOL_CODE);
    printf("Student ID:    %d\\n", student_id);
    printf("Letter Grade:  %c\\n", letter_grade);
    printf("Raw Score:     %.2f\\n", raw_score);
    printf("Weighted GPA:  %.4f\\n", weighted_gpa);
    printf("Credits:       %u\\n", credits_completed);
    printf("Passing Score: %d\\n", PASSING_SCORE);
    
    printf("\\n--- Memory Footprint Analysis ---\\n");
    printf("sizeof(char):   %zu byte\\n", sizeof(char));
    printf("sizeof(int):    %zu bytes\\n", sizeof(int));
    printf("sizeof(float):  %zu bytes\\n", sizeof(float));
    printf("sizeof(double): %zu bytes\\n", sizeof(double));
    
    return 0;
}`,
    expectedOutput: `--- Student Information Card ---
School Code:   TECH-2026
Student ID:    1042
Letter Grade:  B
Raw Score:     84.75
Weighted GPA:  3.4258
Credits:       48
Passing Score: 60

--- Memory Footprint Analysis ---
sizeof(char):   1 byte
sizeof(int):    4 bytes
sizeof(float):  4 bytes
sizeof(double): 8 bytes`,
    stepByStep: [
      '1. Compiler registers variable identifiers student_id, letter_grade, raw_score on the stack frame.',
      '2. Memory is allocated: 1 byte for char, 4 bytes for int/float, 8 bytes for double.',
      '3. Formatted string replacements (%d, %c, %.2f) format stack values into ASCII characters.',
      '4. sizeof() evaluates at compile time and yields byte quantities without runtime overhead.',
      '5. Const variables prevent any subsequent reassignment statements during compilation.'
    ],
    commonMistakes: [
      {
        mistake: 'Integer division truncation bug',
        codeSnippet: `int a = 5, b = 2;
double result = a / b; // Result is 2.0, not 2.5!`,
        correction: 'Cast at least one operand to double: double result = (double)a / b;',
        explanation: 'In C, dividing two integers always discards the fractional remainder before assignment.'
      },
      {
        mistake: 'Using incorrect format specifiers',
        codeSnippet: `double pi = 3.14159;
printf("%d\\n", pi); // Garbage or undefined output!`,
        correction: 'Always pair %d with int, %f with float, %lf with double, and %c with char.',
        explanation: 'Format specifiers tell printf how many bytes to read and how to decode the bit pattern.'
      }
    ],
    realWorldExample: {
      scenario: 'Embedded Sensor Reading & Telemetry Record',
      code: `#include <stdio.h>

int main(void) {
    unsigned short sensor_id = 0x0A2F;
    float temperature_celsius = 24.65f;
    float temp_fahrenheit = (temperature_celsius * 9.0f / 5.0f) + 32.0f;
    
    printf("Sensor ID: 0x%04X | Temp: %.1f C (%.1f F)\\n", sensor_id, temperature_celsius, temp_fahrenheit);
    return 0;
}`,
      explanation: 'IoT firmware and automotive ECUs use strictly typed integers and floats to encode analog sensor packets before wireless transmission.'
    },
    practice: {
      prompt: 'Declare an int for total items (25), a double for item price (19.99), and calculate total cost. Print item count, unit price, and total cost formatted to two decimal places.',
      starterCode: `#include <stdio.h>

int main(void) {
    // Declare items, price, calculate total, and print:
    
    return 0;
}`,
      expectedOutputMatcher: 'Total Cost: $499.75',
      hint: 'Multiply items by price into a double total variable, and print with $%.2f.',
      solution: `#include <stdio.h>

int main(void) {
    int items = 25;
    double price = 19.99;
    double total = items * price;
    printf("Items: %d\\n", items);
    printf("Unit Price: $%.2f\\n", price);
    printf("Total Cost: $%.2f\\n", total);
    return 0;
}`
    },
    quiz: [
      {
        id: 'q-c-var-1',
        question: 'What is the standard byte size of the char data type in C on all compliant architectures?',
        options: ['4 bytes', '2 bytes', '1 byte', '8 bytes'],
        correctIndex: 2,
        explanation: 'By C standard definition, sizeof(char) is always guaranteed to be exactly 1 byte.'
      },
      {
        id: 'q-c-var-2',
        question: 'What will be the value stored in the result variable?\\n\\nint a = 9;\\nint b = 4;\\ndouble result = a / b;',
        options: ['2.25', '2.0', '2', 'Undefined Behavior'],
        correctIndex: 1,
        explanation: 'Since both a and b are integers, integer division yields 2, which is then implicitly converted to double 2.0.'
      },
      {
        id: 'q-c-var-3',
        question: 'Which keyword creates an immutable variable whose value cannot be reassigned after initialization?',
        options: ['static', 'volatile', 'const', 'register'],
        correctIndex: 2,
        explanation: 'The const qualifier tells the compiler that the identifier is read-only.'
      },
      {
        id: 'q-c-var-4',
        question: 'Which format specifier is correct for displaying an unsigned int?',
        options: ['%d', '%u', '%c', '%f'],
        correctIndex: 1,
        explanation: '%u displays an unsigned decimal integer; %d expects a signed int.'
      },
      {
        id: 'q-c-var-5',
        question: 'Which of the following is an INVALID variable name in C?',
        options: ['_systemValue', 'total_marks_2026', '2nd_attempt', 'taxRatePercentage'],
        correctIndex: 2,
        explanation: 'C identifiers cannot begin with a numeric digit. They must start with an alphabet letter or an underscore.'
      }
    ],
    codingChallenge: {
      title: 'Precision Temperature Converter',
      difficulty: 'Easy',
      problem_statement: 'Given a temperature in Celsius as a float, convert it to Fahrenheit using F = (C * 9.0 / 5.0) + 32.0. Print both values formatted to exactly two decimal places.',
      input_format: 'No input needed (use 100.0f for boiling point test).',
      output_format: 'Celsius: 100.00 C, Fahrenheit: 212.00 F',
      constraints: 'Use proper floating-point literals (9.0f, 5.0f).',
      starter_code: `#include <stdio.h>

int main(void) {
    float c = 100.00f;
    float f = (c * 9.0f / 5.0f) + 32.0f;
    printf("Celsius: %.2f C, Fahrenheit: %.2f F\\n", c, f);
    return 0;
}`,
      solution_code: `#include <stdio.h>

int main(void) {
    float c = 100.00f;
    float f = (c * 9.0f / 5.0f) + 32.0f;
    printf("Celsius: %.2f C, Fahrenheit: %.2f F\\n", c, f);
    return 0;
}`,
      test_cases: [
        {
          input: '',
          expected_output: 'Celsius: 100.00 C, Fahrenheit: 212.00 F'
        }
      ]
    },
    summary: [
      'C variables must be declared with an explicit type before use.',
      'char is 1 byte, int is typically 4 bytes, float is 4 bytes, double is 8 bytes.',
      'Use sizeof() to query the byte footprint of variables and types at compile time.',
      'Perform explicit casts like (double)a / b to avoid accidental integer truncation.',
      'Prefer const variables over #define for typed, scope-aware constants.'
    ]
  },

  // =========================================================================
  // TOPIC 03: Input, Output & Format Specifiers
  // =========================================================================
  {
    id: 'top-c-io-format',
    number: 3,
    numberDisplay: '03',
    moduleId: 'mod-c-foundations',
    moduleTitle: 'Module 01: Core Language Foundations',
    title: 'Input, Output & Format Specifiers',
    slug: 'input-output-format-specifiers',
    language: 'c',
    shortDescription: 'Master console communication with printf() and scanf(). Understand the address-of operator (&), input buffer mechanics, format width/precision modifiers, and safe input parsing.',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    prerequisiteId: 'top-c-variables-types',
    learningObjectives: [
      'Format output with field widths, left/right alignment, zero-padding, and precision specifiers',
      'Read user input safely using scanf() and understand why & is required for primitive types',
      'Explain how the standard input stream (stdin) buffers keystrokes and newline characters',
      'Detect input parsing errors by evaluating the return value of scanf()'
    ],
    conceptExplanation: `### Standard Streams in C
Every C program begins with three open standard streams:
1. **\`stdin\`**: Standard input stream (usually keyboard).
2. **\`stdout\`**: Standard output stream (buffered console output).
3. **\`stderr\`**: Standard error stream (unbuffered diagnostic output).

### Advanced printf() Formatting
The format specifier structure follows:
\`%[flags][width][.precision]specifier\`
- **Width**: \`%10d\` right-aligns an integer in a 10-character field.
- **Left-alignment**: \`%-10d\` left-aligns in a 10-character field.
- **Zero-padding**: \`%05d\` prints \`00042\` instead of space-padding.
- **Precision**: \`%.2f\` rounds a float to exactly 2 decimal places.

### Reading Data with scanf()
\`scanf()\` parses formatted input from \`stdin\`:
\`\`\`c
int age;
scanf("%d", &age); // Pass the address of age using &
\`\`\`

### The Crucial Address-of Operator (\`&\`)
Why is \`&\` required in \`scanf\`?
C passes function arguments **by value** (copies are made). If you passed \`age\`, \`scanf\` would receive a copy of whatever value was in \`age\`, and modifying that copy would not change the original variable. By passing \`&age\` (the memory address of \`age\`), \`scanf\` can directly write the parsed input bytes into that exact memory cell!

### Checking the Return Value of scanf()
\`scanf()\` returns the **number of successfully matched and assigned items**:
\`\`\`c
if (scanf("%d", &age) != 1) {
    printf("Invalid input! Expected a valid integer.\\n");
}
\`\`\`
If a user enters letters when \`%d\` was requested, \`scanf\` leaves the invalid text in the input stream and returns \`0\`.`,
    simpleExample: {
      code: `#include <stdio.h>

int main(void) {
    int id = 42;
    double price = 129.5;
    printf("Item ID: [%06d] | Price: [$%8.2f]\\n", id, price);
    return 0;
}`,
      explanation: 'Demonstrates zero-padding with %06d (prints 000042) and width-precision formatting with %8.2f.'
    },
    syntax: `// Standard Formatting
printf("%d", 100);          // Standard integer
printf("%08d\\n", 42);       // 00000042 (8-width, zero padded)
printf("%-10s: %5.2f\\n", "Tax", 8.25); // Left-aligned string, width float

// Input parsing with Address-of (&)
int user_id;
float score;
char code;
scanf("%d %f %c", &user_id, &score, &code);`,
    codeExample: `#include <stdio.h>

int main(void) {
    char student_name[] = "Sophia Vance";
    int math_score = 94;
    int science_score = 88;
    int english_score = 92;
    
    int total = math_score + science_score + english_score;
    double average = (double)total / 3.0;
    
    printf("========================================\\n");
    printf("         STUDENT ACADEMIC REPORT        \\n");
    printf("========================================\\n");
    printf("Student: %-20s\\n", student_name);
    printf("----------------------------------------\\n");
    printf("SUBJECT          MARKS    MAX    PERCENT\\n");
    printf("----------------------------------------\\n");
    printf("%-14s   %3d    100     %5.1f%%\\n", "Mathematics", math_score, (double)math_score);
    printf("%-14s   %3d    100     %5.1f%%\\n", "Science", science_score, (double)science_score);
    printf("%-14s   %3d    100     %5.1f%%\\n", "English", english_score, (double)english_score);
    printf("----------------------------------------\\n");
    printf("Total Marks:      %3d / 300\\n", total);
    printf("Overall Average:   %6.2f%%\\n", average);
    printf("========================================\\n");
    
    return 0;
}`,
    expectedOutput: `========================================
         STUDENT ACADEMIC REPORT        
========================================
Student: Sophia Vance        
----------------------------------------
SUBJECT          MARKS    MAX    PERCENT
----------------------------------------
Mathematics       94    100      94.0%
Science           88    100      88.0%
English           92    100      92.0%
----------------------------------------
Total Marks:      274 / 300
Overall Average:    91.33%
========================================`,
    stepByStep: [
      '1. printf() parses format string characters until encountering % format flags.',
      '2. %[flags][width] reserves the specified columns and applies alignment rules.',
      '3. %.2f rounds floating-point numbers to two decimal places using standard rounding.',
      '4. scanf() reads characters from stdin buffer and parses ASCII digits into binary integers.',
      '5. The memory address &variable tells scanf the exact target memory destination.'
    ],
    commonMistakes: [
      {
        mistake: 'Omitting the & operator in scanf for primitive variables',
        codeSnippet: `int num;
scanf("%d", num); // CRASH / Segmentation fault!`,
        correction: 'Always pass the address: scanf("%d", &num);',
        explanation: 'Without &, scanf interprets the uninitialized value of num as a memory pointer and attempts to write to an invalid address.'
      },
      {
        mistake: 'Leftover newline character when mixing scanf and getchar',
        codeSnippet: `int age;
char grade;
scanf("%d", &age);
scanf("%c", &grade); // Reads leftover newline!`,
        correction: 'Add a leading space in format: scanf(" %c", &grade);',
        explanation: 'A space before %c instructs scanf to consume any trailing whitespace or newline characters.'
      }
    ],
    realWorldExample: {
      scenario: 'Financial Transaction Receipt Ledger',
      code: `#include <stdio.h>

int main(void) {
    int txn_id = 9021;
    char merchant[] = "Quantum Cloud Services";
    double subtotal = 149.99;
    double tax = subtotal * 0.0825;
    double total = subtotal + tax;
    
    printf("RECEIPT #%08d\\n", txn_id);
    printf("Merchant: %s\\n", merchant);
    printf("Subtotal:  $%8.2f\\n", subtotal);
    printf("Tax (8.25%%):$%8.2f\\n", tax);
    printf("Total:     $%8.2f\\n", total);
    return 0;
}`,
      explanation: 'Point-of-sale systems and billing gateways align currency figures with field-width modifiers so decimals line up cleanly.'
    },
    practice: {
      prompt: 'Format a tabular report for three products: "Laptop" ($999.00), "Mouse" ($25.50), and "Keyboard" ($75.25) with left-aligned names (12 chars wide) and right-aligned prices (8 chars wide with two decimals).',
      starterCode: `#include <stdio.h>

int main(void) {
    // Print table with %-12s and %8.2f:
    
    return 0;
}`,
      expectedOutputMatcher: 'Laptop',
      hint: 'Use printf("%-12s $%8.2f\\n", name, price); for each row.',
      solution: `#include <stdio.h>

int main(void) {
    printf("%-12s %8s\\n", "PRODUCT", "PRICE");
    printf("---------------------\\n");
    printf("%-12s $%8.2f\\n", "Laptop", 999.00);
    printf("%-12s $%8.2f\\n", "Mouse", 25.50);
    printf("%-12s $%8.2f\\n", "Keyboard", 75.25);
    return 0;
}`
    },
    quiz: [
      {
        id: 'q-c-io-1',
        question: 'Why is the & operator required when reading an integer with scanf("%d", &val)?',
        options: [
          'Because scanf requires an integer value',
          'Because C uses pass-by-value; & passes the memory address so scanf can write the result directly',
          'Because & acts as a format specifier for integers',
          'Because & allocates dynamic heap memory for the input'
        ],
        correctIndex: 1,
        explanation: '& produces the pointer address of the variable, enabling scanf to write directly into that memory slot.'
      },
      {
        id: 'q-c-io-2',
        question: 'What output is produced by printf("%06d", 35)?',
        options: ['350000', '000035', '    35', 'Error: 06 is an invalid octal specifier'],
        correctIndex: 1,
        explanation: '%06d specifies a minimum width of 6 characters, padded with leading zeroes.'
      },
      {
        id: 'q-c-io-3',
        question: 'What does scanf() return upon receiving valid input matching two integers: scanf("%d %d", &a, &b)?',
        options: ['0', '1', '2', 'The sum of a and b'],
        correctIndex: 2,
        explanation: 'scanf() returns the total count of successfully matched and assigned input items (2 in this case).'
      },
      {
        id: 'q-c-io-4',
        question: 'How do you force scanf() to ignore any preceding whitespace or newline when reading a character?',
        options: ['scanf("\\n%c", &ch);', 'scanf(" %c", &ch);', 'scanf("%c!", &ch);', 'scanf("%[char]", &ch);'],
        correctIndex: 1,
        explanation: 'A leading whitespace character in the format string (" %c") instructs scanf to discard any leading whitespace including newlines.'
      },
      {
        id: 'q-c-io-5',
        question: 'Which escape sequence produces a standard horizontal tab space in C console output?',
        options: ['\\n', '\\r', '\\t', '\\b'],
        correctIndex: 2,
        explanation: '\\t prints an ASCII horizontal tab.'
      }
    ],
    codingChallenge: {
      title: 'Formatted Receipt Calculator',
      difficulty: 'Easy',
      problem_statement: 'Write a C program that prints an invoice for 3 units of "Processor" at $299.99 each. Show the quantity, unit price, and total formatted to two decimal places.',
      input_format: 'No input required.',
      output_format: 'Exact receipt lines with subtotal calculation.',
      constraints: 'Total must equal 3 * 299.99.',
      starter_code: `#include <stdio.h>

int main(void) {
    int qty = 3;
    double price = 299.99;
    double total = qty * price;
    printf("QTY: %d | PRICE: $%.2f | TOTAL: $%.2f\\n", qty, price, total);
    return 0;
}`,
      solution_code: `#include <stdio.h>

int main(void) {
    int qty = 3;
    double price = 299.99;
    double total = qty * price;
    printf("QTY: %d | PRICE: $%.2f | TOTAL: $%.2f\\n", qty, price, total);
    return 0;
}`,
      test_cases: [
        {
          input: '',
          expected_output: 'QTY: 3 | PRICE: $299.99 | TOTAL: $899.97'
        }
      ]
    },
    summary: [
      'printf() handles formatted stdout; scanf() parses standard input from stdin.',
      'Always pass pointers (&variable) to scanf() for primitive values so it can modify memory.',
      'Use width, alignment, and precision modifiers (%10s, %-10s, %.2f) for clean output.',
      'Inspect scanf() return values to catch user input parsing errors.',
      'Use leading space in " %c" to bypass lingering newline characters in the input stream buffer.'
    ]
  },

  // =========================================================================
  // TOPIC 04: Operators & Expressions
  // =========================================================================
  {
    id: 'top-c-operators',
    number: 4,
    numberDisplay: '04',
    moduleId: 'mod-c-foundations',
    moduleTitle: 'Module 01: Core Language Foundations',
    title: 'Operators & Expressions',
    slug: 'operators-and-expressions',
    language: 'c',
    shortDescription: 'Master C operators: arithmetic, relational, logical, bitwise, assignment, and ternary. Understand operator precedence, associativity, and prefix vs. postfix increment nuances.',
    difficulty: 'Beginner',
    estimatedMinutes: 30,
    prerequisiteId: 'top-c-variables-types',
    learningObjectives: [
      'Evaluate arithmetic, relational, and logical expressions using standard C rules',
      'Distinguish prefix (++i) from postfix (i++) increment behavior in assignments and loops',
      'Perform bitwise manipulation (&, |, ^, ~, <<, >>) on binary representations',
      'Apply operator precedence and associativity rules to write unambiguous compound expressions'
    ],
    conceptExplanation: `### Operator Classification in C
C provides a rich set of operators divided into six primary categories:
1. **Arithmetic**: \`+\`, \`-\`, \`*\`, \`/\`, \`%\` (modulus only works on integers).
2. **Relational**: \`==\`, \`!=\`, \`<\`, \`>\`, \`<=\`, \`>=\` (evaluate to \`1\` for true, \`0\` for false).
3. **Logical**: \`&&\` (AND), \`||\` (OR), \`!\` (NOT) with short-circuit evaluation.
4. **Bitwise**: \`&\` (AND), \`|\` (OR), \`^\` (XOR), \`~\` (NOT), \`<<\` (left shift), \`>>\` (right shift).
5. **Assignment & Compound**: \`=\`, \`+=\`, \`-=\`, \`*=\`, \`/=\`, \`%=\`, \`<<=\`, \`>>=\`.
6. **Conditional (Ternary)**: \`condition ? expr_if_true : expr_if_false\`.

### Prefix (++x) vs. Postfix (x++)
- **Prefix (\`++x\`)**: Increments the variable **before** its value is evaluated in the enclosing expression.
- **Postfix (\`x++\`)**: Yields the **current value** first for the enclosing expression, then increments the variable.

### Short-Circuit Evaluation
Logical operators in C execute from left to right and stop evaluating as soon as the final truth value is determined:
- In \`A && B\`: If \`A\` is false (\`0\`), \`B\` is never evaluated.
- In \`A || B\`: If \`A\` is true (\`1\`), \`B\` is never evaluated.

### Bitwise Operator Mechanics
- **Left Shift (\`x << n\`)**: Shifts bits left by \`n\`, equivalent to multiplying by \`2^n\`.
- **Right Shift (\`x >> n\`)**: Shifts bits right by \`n\`, equivalent to dividing by \`2^n\`.
- **Masking with AND (\`x & mask\`)**: Isolates specific bits.
- **Setting bits with OR (\`x | mask\`)**: Sets specific bits to \`1\`.`,
    simpleExample: {
      code: `#include <stdio.h>

int main(void) {
    int x = 10, y = 3;
    printf("Quotient: %d, Remainder: %d\\n", x / y, x % y);
    int max = (x > y) ? x : y;
    printf("Max value: %d\\n", max);
    return 0;
}`,
      explanation: 'Shows integer division, the modulus operator, and the conditional ternary operator.'
    },
    syntax: `// Arithmetic & Compound
int a = 14, b = 4;
int sum = a + b, diff = a - b, prod = a * b, div = a / b, rem = a % b;
a += 5; // a = a + 5

// Bitwise
int flags = 0b00000101;
flags = flags | 0b00000010; // Set bit 1
flags = flags & ~0b00000001; // Clear bit 0

// Ternary Operator
int status = (score >= 60) ? 1 : 0;`,
    codeExample: `#include <stdio.h>

int main(void) {
    int a = 5;
    int b = 10;
    
    printf("Initial: a = %d, b = %d\\n", a, b);
    
    int post = a++;
    printf("After a++: evaluated = %d, new a = %d\\n", post, a);
    
    int pre = ++b;
    printf("After ++b: evaluated = %d, new b = %d\\n", pre, b);
    
    unsigned char mask = 0x0F;
    unsigned char data = 0x55;
    
    printf("\\n--- Bitwise Operations ---\\n");
    printf("data & mask  = 0x%02X\\n", data & mask);
    printf("data | mask  = 0x%02X\\n", data | mask);
    printf("data ^ mask  = 0x%02X\\n", data ^ mask);
    printf("data << 1    = 0x%02X\\n", (data << 1) & 0xFF);
    printf("data >> 1    = 0x%02X\\n", data >> 1);
    
    int score = 85;
    char grade = (score >= 90) ? 'A' : (score >= 80) ? 'B' : 'C';
    printf("\\nScore %d receives grade %c\\n", score, grade);
    
    return 0;
}`,
    expectedOutput: `Initial: a = 5, b = 10
After a++: evaluated = 5, new a = 6
After ++b: evaluated = 11, new b = 11

--- Bitwise Operations ---
data & mask  = 0x05
data | mask  = 0x5F
data ^ mask  = 0x5A
data << 1    = 0xAA
data >> 1    = 0x2A

Score 85 receives grade B`,
    stepByStep: [
      '1. Postfix operator a++ yields current value 5 into assignment register, then increments a to 6.',
      '2. Prefix operator ++b increments b from 10 to 11 first, then yields 11 into assignment register.',
      '3. Bitwise AND (&) performs logical conjunction on each corresponding pair of bits.',
      '4. Left shift (<< 1) shifts bit patterns left by one position, multiplying integer value by 2.',
      '5. Ternary operator evaluates condition boolean; branch selection incurs no function call overhead.'
    ],
    commonMistakes: [
      {
        mistake: 'Using assignment (=) instead of equality (==) in conditions',
        codeSnippet: `int status = 0;
if (status = 1) { // Bug: assigns 1 to status and always evaluates to true!
    printf("Active\\n");
}`,
        correction: 'Always use == for comparison: if (status == 1). Many compilers warn on single = in if.',
        explanation: 'In C, assignment returns the assigned value, so (status = 1) evaluates to 1 (true).'
      },
      {
        mistake: 'Assuming left-to-right evaluation order of function arguments',
        codeSnippet: `int i = 1;
printf("%d %d\\n", i++, i++); // Undefined Behavior!`,
        correction: 'Do not modify the same variable multiple times within a single sequence point.',
        explanation: 'C standard does not specify whether printf arguments evaluate left-to-right or right-to-left.'
      }
    ],
    realWorldExample: {
      scenario: 'Hardware Device Register Bit Masking',
      code: `#include <stdio.h>

#define POWER_ON_BIT   (1 << 0)
#define TX_ENABLE_BIT  (1 << 1)
#define RX_ENABLE_BIT  (1 << 2)

int main(void) {
    unsigned char control_reg = 0x00;
    control_reg |= (POWER_ON_BIT | TX_ENABLE_BIT);
    printf("Control Register: 0x%02X\\n", control_reg);
    
    if (control_reg & TX_ENABLE_BIT) {
        printf("Status: Transmitter is ACTIVE.\\n");
    }
    
    control_reg &= ~TX_ENABLE_BIT;
    printf("After TX Disable: 0x%02X\\n", control_reg);
    return 0;
}`,
      explanation: 'Microcontroller drivers configure physical hardware registers using bitwise OR and bitwise AND with bitmasks.'
    },
    practice: {
      prompt: 'Write an expression that checks if a given integer n is both even and greater than 50 using relational and logical operators. Print "Valid" if true or "Invalid" if false.',
      starterCode: `#include <stdio.h>

int main(void) {
    int n = 64;
    // Check if n is even and > 50:
    
    return 0;
}`,
      expectedOutputMatcher: 'Valid',
      hint: 'Use (n % 2 == 0) && (n > 50).',
      solution: `#include <stdio.h>

int main(void) {
    int n = 64;
    if ((n % 2 == 0) && (n > 50)) {
        printf("Valid\\n");
    } else {
        printf("Invalid\\n");
    }
    return 0;
}`
    },
    quiz: [
      {
        id: 'q-c-op-1',
        question: 'What is the output of the following code?\\n\\nint x = 5;\\nint y = ++x * 2;\\nprintf("%d %d", x, y);',
        options: ['5 10', '6 12', '6 10', '5 12'],
        correctIndex: 1,
        explanation: '++x increments x to 6 before evaluation, then 6 * 2 gives 12. Both x is 6 and y is 12.'
      },
      {
        id: 'q-c-op-2',
        question: 'Which of the following is equivalent to multiplying an unsigned integer x by 8 using bitwise operations?',
        options: ['x >> 3', 'x << 3', 'x & 8', 'x ^ 8'],
        correctIndex: 1,
        explanation: 'Shifting left by 3 bits multiplies by 2^3 = 8.'
      },
      {
        id: 'q-c-op-3',
        question: 'What is the result of 17 % 5 in C?',
        options: ['3.4', '3', '2', '1'],
        correctIndex: 2,
        explanation: '17 divided by 5 is 3 with a remainder of 2 (17 = 5 * 3 + 2).'
      },
      {
        id: 'q-c-op-4',
        question: 'What is the phenomenon called when the second operand of && is skipped because the first operand evaluates to false?',
        options: ['Static dispatch', 'Short-circuit evaluation', 'Lazy recursion', 'Early binding'],
        correctIndex: 1,
        explanation: 'Short-circuit evaluation stops evaluating logical operators once the overall boolean value is determined.'
      },
      {
        id: 'q-c-op-5',
        question: 'Which operator has the highest precedence among the following?',
        options: ['+', '==', '*', '&&'],
        correctIndex: 2,
        explanation: 'Multiplication (*) has higher precedence than addition (+), relational (==), and logical (&&) operators.'
      }
    ],
    codingChallenge: {
      title: 'Bitwise Odd/Even and Power-of-Two Validator',
      difficulty: 'Easy',
      problem_statement: 'Write a C program that tests whether an integer is even using the bitwise & operator ((n & 1) == 0). Print "EVEN" or "ODD".',
      input_format: 'No input needed (test with n = 42).',
      output_format: '42 is EVEN',
      constraints: 'Must use bitwise & 1 instead of % 2.',
      starter_code: `#include <stdio.h>

int main(void) {
    int n = 42;
    if ((n & 1) == 0) {
        printf("%d is EVEN\\n", n);
    } else {
        printf("%d is ODD\\n", n);
    }
    return 0;
}`,
      solution_code: `#include <stdio.h>

int main(void) {
    int n = 42;
    if ((n & 1) == 0) {
        printf("%d is EVEN\\n", n);
    } else {
        printf("%d is ODD\\n", n);
    }
    return 0;
}`,
      test_cases: [
        {
          input: '',
          expected_output: '42 is EVEN'
        }
      ]
    },
    summary: [
      'Understand prefix (++i) vs postfix (i++) evaluation order in expressions.',
      'Modulus (%) works strictly on integers to compute remainders.',
      'Logical operators (&&, ||) employ short-circuit evaluation to skip redundant tests.',
      'Bitwise operators (&, |, ^, ~, <<, >>) manipulate binary bit patterns directly.',
      'Use parentheses to guarantee expected precedence and prevent ambiguity.'
    ]
  }
];
