import { CppTopic } from './cppFundamentalsData';

export const CPP_MODULE_1_TOPICS: CppTopic[] = [
  // =========================================================================
  // LESSON 01: Introduction to C++
  // =========================================================================
  {
    id: 'top-cpp-intro',
    number: 1,
    numberDisplay: '01',
    moduleId: 'mod-cpp-intro-foundations',
    moduleTitle: 'Module 01: C++ Introduction & Programming Foundations',
    title: 'Introduction to C++',
    slug: 'introduction-to-cpp',
    language: 'cpp',
    shortDescription: 'Explore the origin of C++, Bjarne Stroustrup, modern standards (C++11/17/20), zero-overhead abstractions, and real-world high-performance applications.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: null,
    learningObjectives: [
      'Understand the history, origins, and design goals of C++ created by Bjarne Stroustrup at Bell Labs',
      'Compare procedural vs object-oriented programming paradigms in C vs C++',
      'Recognize key modern C++ standards from C++11, C++14, C++17 to C++20',
      'Identify real-world applications in game engines, operating systems, embedded hardware, and high-frequency trading'
    ],
    conceptExplanation: `### 1. What is C++?
C++ is a powerful, general-purpose, statically typed, compiled programming language designed for performance, efficiency, and flexibility. It was created in 1979 by **Bjarne Stroustrup** at Bell Laboratories as an enhancement to the C language, originally called **"C with Classes"** before being renamed **C++** in 1983 (referencing the increment operator \`++\`).

### 2. History & Evolution of C++
* **1979**: Bjarne Stroustrup begins work on "C with Classes" to combine the hardware-level control of C with the object-oriented abstractions of Simula.
* **1985**: First commercial release of C++ and publication of *The C++ Programming Language*.
* **1998 (C++98)**: First standardized ISO specification, introducing the Standard Template Library (STL).
* **2011 (C++11)**: The "Modern C++" revolution—introduced \`auto\`, lambda expressions, smart pointers, range-based for loops, and move semantics.
* **2014 & 2017 (C++14 / C++17)**: Generic lambdas, structured bindings, \`std::optional\`, filesystem library.
* **2020 (C++20)**: Major leap introducing Concepts, Ranges, Coroutines, and Modules.

### 3. Core Philosophy: Zero-Overhead Abstraction
Bjarne Stroustrup defined the zero-overhead principle:
1. **What you don't use, you don't pay for.**
2. **What you do use, you couldn't hand-code any better.**

### 4. C vs C++ Comparison
| Feature | C | C++ |
| :--- | :--- | :--- |
| **Paradigm** | Procedural | Multi-paradigm (Procedural, OOP, Generic, Functional) |
| **Type Safety** | Moderate | Very Strict |
| **Memory Model** | \`malloc\` / \`free\` | \`new\` / \`delete\`, RAII, Smart Pointers |
| **Namespaces** | None (global scope pollution) | Standard \`namespace\` support |
| **Standard Library** | Minimal C standard library | Rich STL (containers, algorithms, streams) |

### 5. Real-World Applications of C++
* **Game Development**: Unreal Engine, Unity runtime, CryEngine, AAA game titles.
* **Operating Systems**: Windows NT kernel, macOS XNU, Linux device drivers.
* **High-Frequency Finance**: Wall Street algorithmic trading systems requiring sub-microsecond latency.
* **Web Browsers**: Google Chrome (V8 engine), Mozilla Firefox (Gecko), WebKit.
* **Embedded & Aerospace**: Mars Rover flight software, automotive ECUs, autonomous drones.`,
    simpleExample: {
      code: `#include <iostream>

int main() {
    std::cout << "Welcome to Modern C++!" << std::endl;
    return 0;
}`,
      explanation: 'Includes the iostream header and uses std::cout to print text to the console, exiting with status code 0.'
    },
    syntax: `// Standard Modern C++ Entry Format
#include <iostream>

int main() {
    // Statements executed sequentially
    std::cout << "Output message\\n";
    return 0; // 0 indicates successful termination
}`,
    codeExample: `#include <iostream>
#include <string>

int main() {
    std::cout << "=== Modern C++ Architecture ===" << std::endl;
    std::cout << "Creator:      Bjarne Stroustrup (Bell Labs, 1979)" << std::endl;
    std::cout << "Standard:     C++20 / C++23" << std::endl;
    std::cout << "Key Strength: Zero-overhead abstractions & speed" << std::endl;
    std::cout << "Ecosystem:    Unreal Engine, Operating Systems, FinTech" << std::endl;
    std::cout << "================================" << std::endl;
    return 0;
}`,
    expectedOutput: `=== Modern C++ Architecture ===
Creator:      Bjarne Stroustrup (Bell Labs, 1979)
Standard:     C++20 / C++23
Key Strength: Zero-overhead abstractions & speed
Ecosystem:    Unreal Engine, Operating Systems, FinTech
================================`,
    stepByStep: [
      '1. Preprocessor expands #include <iostream> into declarations for standard streams.',
      '2. The C++ compiler translates source code into machine-executable binary instructions.',
      '3. Operating system invokes the main() function as the designated program entry point.',
      '4. std::cout stream insertion operator (<<) pushes formatted text to standard stdout.',
      '5. std::endl flushes the stream buffer and inserts a newline character.',
      '6. return 0 returns exit status 0 to the operating system shell.'
    ],
    commonMistakes: [
      {
        mistake: 'Confusing C++ compilation with Python-style interpretation',
        codeSnippet: `// Misconception: Running "c++ main.cpp" without generating binary executable`,
        correction: 'Remember C++ is natively compiled ahead-of-time (AOT) into raw CPU instructions.',
        explanation: 'A C++ compiler (g++, clang++, MSVC) emits native machine code; there is no bytecode VM or runtime interpreter.'
      },
      {
        mistake: 'Using antiquated C header files like <stdio.h> in modern C++',
        codeSnippet: `#include <stdio.h> // Old C-style header`,
        correction: 'Use modern C++ stream headers: #include <iostream> or <cstdio>.',
        explanation: 'Modern C++ provides type-safe stream operations and templated formatting that avoid unsafe format specifiers.'
      },
      {
        mistake: 'Omitting return 0 in older standards (pre-C++98)',
        codeSnippet: `void main() { ... } // Illegal in standard C++`,
        correction: 'Always declare main as returning int: int main()',
        explanation: 'The C++ standard mandates that main() must return an integer exit code to the operating system.'
      }
    ],
    realWorldExample: {
      scenario: 'AAA Game Engine Frame Renderer Telemetry',
      code: `#include <iostream>

int main() {
    double targetFps = 120.0;
    double frameTimeMs = 1000.0 / targetFps;
    
    std::cout << "Game Engine: Unreal Core Renderer\\n";
    std::cout << "Target Frame Rate: " << targetFps << " FPS\\n";
    std::cout << "Frame Budget: " << frameTimeMs << " ms\\n";
    return 0;
}`,
      explanation: 'In game development, C++ is chosen because predictable memory management and zero runtime garbage collection prevent frame stutter.'
    },
    practice: {
      prompt: 'Write a C++ program that prints "Language: Modern C++" on line 1 and "Standard: C++20" on line 2.',
      starterCode: `#include <iostream>

int main() {
    // Print the two required lines
    return 0;
}`,
      expectedOutputMatcher: 'Language: Modern C++\nStandard: C++20',
      hint: 'Use std::cout << ... << std::endl; or include \\n inside your strings.',
      solution: `#include <iostream>

int main() {
    std::cout << "Language: Modern C++\\n";
    std::cout << "Standard: C++20\\n";
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-intro-1',
        question: 'Who designed and developed the C++ programming language?',
        options: ['Dennis Ritchie', 'Bjarne Stroustrup', 'James Gosling', 'Ken Thompson'],
        correctIndex: 1,
        explanation: 'Bjarne Stroustrup created C++ at Bell Labs in 1979 as an extension of C.'
      },
      {
        id: 'mcq-cpp-intro-2',
        question: 'What was the original working name of C++ in 1979?',
        options: ['C with Classes', 'Objective-C', 'Modern C', 'D Language'],
        correctIndex: 0,
        explanation: 'It was originally titled "C with Classes" before being renamed C++ in 1983.'
      },
      {
        id: 'mcq-cpp-intro-3',
        question: 'What does the "zero-overhead principle" in C++ signify?',
        options: [
          'Programs cost zero dollars to deploy',
          'What you do not use you do not pay for, and what you use is as optimal as hand-written assembly',
          'C++ requires zero compiler memory during builds',
          'Variables consume zero memory until accessed'
        ],
        correctIndex: 1,
        explanation: 'The zero-overhead principle means unused language features add no runtime overhead, and abstractions compile to optimal machine code.'
      },
      {
        id: 'mcq-cpp-intro-4',
        question: 'Which C++ standard is widely considered the launchpad of "Modern C++"?',
        options: ['C++98', 'C++03', 'C++11', 'C++95'],
        correctIndex: 2,
        explanation: 'C++11 introduced auto type deduction, lambdas, smart pointers, and move semantics, initiating the modern era.'
      },
      {
        id: 'mcq-cpp-intro-5',
        question: 'Which of the following domains predominantly relies on C++ due to strict real-time latency needs?',
        options: ['High-Frequency Financial Trading', 'Video Game Engines', 'Operating System Kernels', 'All of the above'],
        correctIndex: 3,
        explanation: 'All of these domains require deterministic execution without unpredictable garbage collection pauses, making C++ the industry standard.'
      }
    ],
    codingChallenge: {
      title: 'Platform Welcome Banner',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program that prints a three-line welcome banner: line 1 "Course: C++ Modern Fundamentals", line 2 "Module: 01 Foundations", and line 3 "Status: Ready".',
      input_format: 'No input provided.',
      output_format: 'Three lines of text matching the requested banner exactly.',
      constraints: 'Use standard C++ stream output with iostream.',
      starter_code: `#include <iostream>

int main() {
    // Output the 3 required banner lines
    return 0;
}`,
      expected_output: `Course: C++ Modern Fundamentals\nModule: 01 Foundations\nStatus: Ready`,
      test_cases: [
        {
          input: '',
          expected_output: `Course: C++ Modern Fundamentals\nModule: 01 Foundations\nStatus: Ready`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'C++ was created in 1979 by Bjarne Stroustrup at Bell Labs as "C with Classes".',
      'The zero-overhead principle guarantees that high-level abstractions incur no unnecessary runtime cost.',
      'C++ is natively compiled to machine code, providing deterministic performance without garbage collector pauses.',
      'Modern C++ (C++11 through C++20) modernizes the language with safety, expressive typing, and modularity.'
    ]
  },

  // =========================================================================
  // LESSON 02: Installing and Setting Up C++
  // =========================================================================
  {
    id: 'top-cpp-install-setup',
    number: 2,
    numberDisplay: '02',
    moduleId: 'mod-cpp-intro-foundations',
    moduleTitle: 'Module 01: C++ Introduction & Programming Foundations',
    title: 'Installing and Setting Up C++',
    slug: 'installing-and-setting-up-cpp',
    language: 'cpp',
    shortDescription: 'Set up GCC/MinGW, Clang, or MSVC, configure Visual Studio Code, understand the compilation pipeline, and troubleshoot compiler errors.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-cpp-intro',
    learningObjectives: [
      'Install and verify a modern C++ compiler (GCC/MinGW, Clang, or MSVC)',
      'Configure Visual Studio Code with the C/C++ extension pack and launch tasks',
      'Understand how source code (.cpp) transforms into an executable (.exe / binary)',
      'Differentiate between preprocessor errors, compilation errors, and linker errors'
    ],
    conceptExplanation: `### 1. The C++ Compiler Ecosystem
Unlike languages that run in a virtual machine, C++ code must be compiled into native machine code by a platform compiler:
* **GCC (GNU Compiler Collection)**: The standard open-source compiler on Linux, available on Windows via **MinGW-w64** (\`g++\`).
* **Clang / LLVM**: High-performance modern compiler known for clear diagnostics and fast build times (\`clang++\`).
* **MSVC (Microsoft Visual C++)**: Default compiler on Windows integrated with Visual Studio.

### 2. The Four Stages of C++ Compilation
When you execute \`g++ -std=c++20 main.cpp -o main.exe\`, the toolchain executes 4 sequential stages:
1. **Preprocessing (\`cpp\`)**: Expands header directives (\`#include\`), resolves macros (\`#define\`), and evaluates conditional code (\`#ifdef\`). Output: Pure expanded C++ text.
2. **Compilation (\`cc1plus\`)**: Parses and validates syntax, performs type checking, and translates source code into assembly instructions (\`.s\`).
3. **Assembly (\`as\`)**: Assembles instructions into binary machine code packaged in relocatable object files (\`.o\` or \`.obj\`).
4. **Linking (\`ld\`)**: Resolves external references, connects standard library definitions (like \`std::cout\`), and packages everything into an executable (\`.exe\` or ELF binary).

### 3. Setting Up Visual Studio Code
1. Install **Visual Studio Code**.
2. Install the **C/C++ Extension Pack** (by Microsoft).
3. On Windows, install **MSYS2** or **MinGW-w64** and add \`C:\\msys64\\mingw64\\bin\` to your system PATH.
4. Verify compiler installation in your terminal:
\`\`\`bash
g++ --version
\`\`\`
5. Compile and run from the terminal:
\`\`\`bash
g++ -std=c++20 -Wall -Wextra main.cpp -o main
./main
\`\`\`

### 4. Categorizing Development Errors
* **Compiler Error (Syntax / Type)**: Code violates C++ grammar rules (e.g., missing semicolon, undefined identifier). Detected at compile time.
* **Linker Error**: Compiler compiled the object file, but a function definition cannot be found (e.g., \`undefined reference to main\` or missing library).
* **Runtime Error**: Program crashes during execution (e.g., division by zero, null pointer dereference, segmentation fault).
* **Logic Error**: Program compiles and runs without crashing, but produces incorrect results.`,
    simpleExample: {
      code: `// Verify compiler version and environment
#include <iostream>

int main() {
    std::cout << "Compiler Build Check: SUCCESS" << std::endl;
    std::cout << "C++ Standard Macro: " << __cplusplus << std::endl;
    return 0;
}`,
      explanation: '__cplusplus is a built-in preprocessor macro holding the current C++ version date stamp.'
    },
    syntax: `// Standard Command Line Compilation
// g++ -std=c++20 -O2 -Wall source.cpp -o program
#include <iostream>

int main() {
    std::cout << "Executable compiled successfully\\n";
    return 0;
}`,
    codeExample: `#include <iostream>

int main() {
    std::cout << "=== Compiler Toolchain Diagnostics ===" << std::endl;
    std::cout << "Pipeline Step 1: Preprocessor  (#include expansions)" << std::endl;
    std::cout << "Pipeline Step 2: Compiler      (Syntax & Assembly)" << std::endl;
    std::cout << "Pipeline Step 3: Assembler     (Binary Object Files)" << std::endl;
    std::cout << "Pipeline Step 4: Linker        (Executable Binary)" << std::endl;
    std::cout << "Result: Execution Ready" << std::endl;
    return 0;
}`,
    expectedOutput: `=== Compiler Toolchain Diagnostics ===
Pipeline Step 1: Preprocessor  (#include expansions)
Pipeline Step 2: Compiler      (Syntax & Assembly)
Pipeline Step 3: Assembler     (Binary Object Files)
Pipeline Step 4: Linker        (Executable Binary)
Result: Execution Ready`,
    stepByStep: [
      '1. Developer writes source code in main.cpp.',
      '2. Preprocessor replaces #include <iostream> with full header declarations.',
      '3. Compiler generates intermediate machine instructions and validates typing.',
      '4. Assembler produces the relocatable object file main.o.',
      '5. Linker resolves symbols against libstdc++ and outputs the final executable binary.',
      '6. Operating system loads binary into RAM and begins execution at entry point.'
    ],
    commonMistakes: [
      {
        mistake: 'Forgetting to link standard library or missing function definitions',
        codeSnippet: `// Declaration without definition
void calculate();
int main() { calculate(); } // Linker Error: undefined reference to calculate()`,
        correction: 'Ensure every declared function has a matching definition either in a .cpp file or library.',
        explanation: 'The compiler accepts declarations, but the linker fails if it cannot find the machine instructions for that function.'
      },
      {
        mistake: 'Ignoring compiler warnings (-Wall -Wextra)',
        codeSnippet: `int x; // Uninitialized variable used later`,
        correction: 'Always compile with -Wall -Wextra to catch potential bugs and undefined behaviors early.',
        explanation: 'Compiler warnings point out dangerous patterns like uninitialized memory and unused variables.'
      },
      {
        mistake: 'Naming a source file with an invalid extension',
        codeSnippet: `main.c // Treated by g++ as pure C instead of C++`,
        correction: 'Use .cpp or .cxx extensions for C++ source files.',
        explanation: 'Compilers invoke the C front-end for .c files and the C++ front-end for .cpp files.'
      }
    ],
    realWorldExample: {
      scenario: 'Automated CI/CD Build Pipeline Verification',
      code: `#include <iostream>

int main() {
    std::cout << "CI/CD Pipeline: GitHub Actions C++ Runner\\n";
    std::cout << "Compiler: GCC 13 (MinGW-w64 x86_64)\\n";
    std::cout << "Optimization Flag: -O3 (Max Performance)\\n";
    std::cout << "Build Status: PASSED (0 errors, 0 warnings)\\n";
    return 0;
}`,
      explanation: 'Production software teams run automated build scripts that compile C++ code across Windows, Linux, and macOS simultaneously.'
    },
    practice: {
      prompt: 'Write a C++ program that prints "Toolchain: MinGW GCC" and "Status: Configured" on separate lines.',
      starterCode: `#include <iostream>

int main() {
    // Print the required toolchain status lines
    return 0;
}`,
      expectedOutputMatcher: 'Toolchain: MinGW GCC\nStatus: Configured',
      hint: 'Use std::cout with newline characters.',
      solution: `#include <iostream>

int main() {
    std::cout << "Toolchain: MinGW GCC\\n";
    std::cout << "Status: Configured\\n";
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-setup-1',
        question: 'Which tool translates preprocessed C++ source code into assembly language?',
        options: ['The Preprocessor', 'The C++ Compiler', 'The Linker', 'The Debugger'],
        correctIndex: 1,
        explanation: 'The compiler parses syntax and generates assembly instructions for the target CPU architecture.'
      },
      {
        id: 'mcq-cpp-setup-2',
        question: 'What is the role of the Linker in the C++ build process?',
        options: [
          'It deletes unused variable comments',
          'It combines object files and standard libraries into a runnable executable',
          'It converts C++ into Python bytecode',
          'It executes the program in a sandbox'
        ],
        correctIndex: 1,
        explanation: 'The linker binds function calls to their definitions across multiple object files and external libraries.'
      },
      {
        id: 'mcq-cpp-setup-3',
        question: 'Which compiler flag instructs g++ to enforce the Modern C++20 standard?',
        options: ['-std=c++20', '-version=20', '--enable-cpp20', '-c20'],
        correctIndex: 0,
        explanation: '-std=c++20 specifies the ISO C++ 2020 language standard.'
      },
      {
        id: 'mcq-cpp-setup-4',
        question: 'What kind of error occurs when a function is declared in a header file but its implementation is never provided?',
        options: ['Preprocessing Error', 'Compiler Syntax Error', 'Linker Error', 'Runtime Division Error'],
        correctIndex: 2,
        explanation: 'Linker errors ("undefined reference") occur when the linker cannot find the compiled body of a declared symbol.'
      },
      {
        id: 'mcq-cpp-setup-5',
        question: 'What is the purpose of the -Wall compiler flag?',
        options: [
          'Wall-off memory to prevent crashes',
          'Enable all common compiler warning diagnostics',
          'Write all output to a wall log file',
          'Disable compilation warnings'
        ],
        correctIndex: 1,
        explanation: '-Wall turns on all common compiler diagnostic warnings, alerting you to potential bugs.'
      }
    ],
    codingChallenge: {
      title: 'Environment Verification Report',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program that prints a two-line environment report: line 1 "Compiler: Ready", line 2 "Optimization: Enabled".',
      input_format: 'None.',
      output_format: 'Two lines of text matching the expected report.',
      constraints: 'Follow standard C++ structure with return 0.',
      starter_code: `#include <iostream>

int main() {
    // Print verification report
    return 0;
}`,
      expected_output: `Compiler: Ready\nOptimization: Enabled`,
      test_cases: [
        {
          input: '',
          expected_output: `Compiler: Ready\nOptimization: Enabled`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'The C++ build pipeline comprises Preprocessing, Compilation, Assembly, and Linking.',
      'Compilers like GCC (g++), Clang (clang++), and MSVC compile source files directly to native machine code.',
      'Compiler flags like -std=c++20, -Wall, and -Wextra enforce modern standards and high code quality.',
      'Understanding the distinction between compilation and linker errors dramatically accelerates debugging.'
    ]
  },

  // =========================================================================
  // LESSON 03: Structure of a C++ Program
  // =========================================================================
  {
    id: 'top-cpp-program-structure',
    number: 3,
    numberDisplay: '03',
    moduleId: 'mod-cpp-intro-foundations',
    moduleTitle: 'Module 01: C++ Introduction & Programming Foundations',
    title: 'Structure of a C++ Program',
    slug: 'structure-of-a-cpp-program',
    language: 'cpp',
    shortDescription: 'Deconstruct every line of a standard C++ program: preprocessor directives, header files, namespaces, main() function, statements, and return codes.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-cpp-install-setup',
    learningObjectives: [
      'Dissect every component of the canonical "Hello, World!" program line-by-line',
      'Explain the purpose of preprocessor directives like #include <iostream>',
      'Understand namespaces, scope resolution operator (::), and the risks of "using namespace std;"',
      'Describe the role of the main() function and OS return codes'
    ],
    conceptExplanation: `### 1. Anatomy of the Canonical C++ Program
Consider this foundational program:
\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!";
    return 0;
}
\`\`\`

Let's dissect each component individually:

#### Line 1: \`#include <iostream>\`
* \`#\` denotes a **preprocessor directive**, executed before actual compilation begins.
* \`include\` instructs the preprocessor to copy the contents of the header file \`<iostream>\` into this file.
* \`<iostream>\` stands for **Standard Input/Output Stream**, declaring objects like \`std::cout\`, \`std::cin\`, and \`std::endl\`.

#### Line 2: \`using namespace std;\`
* All standard library identifiers in C++ live inside the \`std\` **namespace** to prevent naming collisions with user code.
* Writing \`using namespace std;\` brings all identifiers from \`std\` into the current scope, allowing you to write \`cout\` instead of \`std::cout\`.
* *Best Practice Note*: In professional C++, avoid putting \`using namespace std;\` in header files or large projects to prevent namespace pollution. Prefer \`std::cout\` or selective imports like \`using std::cout;\`.

#### Line 4: \`int main()\`
* Every C++ program must contain exactly one **\`main()\`** function. It serves as the official operating system entry point.
* \`int\` specifies the return type. When the program finishes, it returns an integer status code back to the shell.
* The empty parentheses \`()\` mean \`main\` accepts no command-line arguments in this basic form.

#### Line 4: Curly Braces \`{ ... }\`
* The opening brace \`{\` marks the beginning of the function body.
* The closing brace \`}\` marks the termination of the block.

#### Line 5: \`cout << "Hello, World!";\`
* **\`cout\`** (pronounced "see-out") is the standard output stream object representing the console screen.
* **\`<<\`** is the **stream insertion operator**. It directs the string literal \`"Hello, World!"\` into the output stream.
* The semicolon **\`;\`** terminates the statement. Every executable expression statement in C++ must end with a semicolon.

#### Line 6: \`return 0;\`
* Terminate the \`main()\` function and returns the integer \`0\` to the operating system.
* By convention in Unix and Windows, \`0\` indicates normal, successful execution. Non-zero codes signify an error.`,
    simpleExample: {
      code: `#include <iostream>

int main() {
    // Explicit namespace qualification (Recommended)
    std::cout << "Clean C++ Architecture!" << std::endl;
    return 0;
}`,
      explanation: 'Uses explicit std:: prefix to maintain namespace hygiene without global pollution.'
    },
    syntax: `// General C++ Program Template
#include <header_name>

int main() {
    // Statements terminated by semicolons
    return 0;
}`,
    codeExample: `#include <iostream>

// Entry point
int main() {
    // Multiple chained stream insertion operators
    std::cout << "Line 1: Preprocessor #include processed" << std::endl;
    std::cout << "Line 2: Namespace std accessed" << std::endl;
    std::cout << "Line 3: main() executed with exit code 0" << std::endl;
    return 0;
}`,
    expectedOutput: `Line 1: Preprocessor #include processed
Line 2: Namespace std accessed
Line 3: main() executed with exit code 0`,
    stepByStep: [
      '1. Preprocessor loads <iostream> header definitions.',
      '2. Program execution begins strictly at int main().',
      '3. String literals are streamed to standard output via std::cout and << operator.',
      '4. std::endl outputs a newline character and flushes the output buffer.',
      '5. return 0 signals successful completion to the operating system shell.',
      '6. Program process terminates cleanly and releases its memory.'
    ],
    commonMistakes: [
      {
        mistake: 'Missing semicolon at the end of a statement',
        codeSnippet: `std::cout << "Hello" // Error: expected ';' before 'return'`,
        correction: 'Ensure every executable statement ends with a semicolon (;).',
        explanation: 'In C++, semicolons are statement terminators, not optional separators.'
      },
      {
        mistake: 'Using quotes on numbers when arithmetic output is intended',
        codeSnippet: `std::cout << "10 + 20"; // Prints literal string "10 + 20" instead of 30`,
        correction: 'Omit quotation marks for arithmetic expressions: std::cout << 10 + 20;',
        explanation: 'Enclosing characters in double quotes creates a string literal rather than an evaluable expression.'
      },
      {
        mistake: 'Placing using namespace std; inside header files (.h / .hpp)',
        codeSnippet: `// Inside Common.h
using namespace std; // Anti-pattern: forces namespace onto every file including Common.h`,
        correction: 'Use explicit std:: in header files; only use using declarations in localized .cpp files.',
        explanation: 'Global namespace directives in headers cause namespace clashes across large codebases.'
      }
    ],
    realWorldExample: {
      scenario: 'Embedded Telemetry Initialization Sequence',
      code: `#include <iostream>

int main() {
    std::cout << "[SYSTEM] Initializing Sensor Bus I2C... OK\\n";
    std::cout << "[SYSTEM] Calibrating Gyroscope... OK\\n";
    std::cout << "[SYSTEM] Mission Control Link Established\\n";
    return 0;
}`,
      explanation: 'Industrial systems use structured console logging to trace the hardware bootstrap sequence.'
    },
    practice: {
      prompt: 'Write a C++ program using std::cout that prints "Hello, C++ World!" followed by a newline.',
      starterCode: `#include <iostream>

int main() {
    // Write your output statement
    return 0;
}`,
      expectedOutputMatcher: 'Hello, C++ World!',
      hint: 'Use std::cout << "Hello, C++ World!\\n";',
      solution: `#include <iostream>

int main() {
    std::cout << "Hello, C++ World!\\n";
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-struct-1',
        question: 'What does the # symbol before include <iostream> indicate?',
        options: ['It is a comment line', 'It is a preprocessor directive', 'It allocates memory on the stack', 'It defines a pointer'],
        correctIndex: 1,
        explanation: 'Lines starting with # are directives evaluated by the preprocessor before compilation.'
      },
      {
        id: 'mcq-cpp-struct-2',
        question: 'What is the stream insertion operator used with cout?',
        options: ['>>', '<<', '==', '::'],
        correctIndex: 1,
        explanation: '<< is the stream insertion operator that pushes data into output streams like cout.'
      },
      {
        id: 'mcq-cpp-struct-3',
        question: 'Why is "using namespace std;" often discouraged in header files?',
        options: [
          'It slows down program execution at runtime',
          'It causes global namespace pollution and naming collisions in files that include the header',
          'It prevents the program from compiling with g++',
          'It requires extra CPU memory'
        ],
        correctIndex: 1,
        explanation: 'Injecting the entire std namespace into headers pollutes every translation unit that includes that header.'
      },
      {
        id: 'mcq-cpp-struct-4',
        question: 'What does a return value of 0 from main() signify to the host operating system?',
        options: ['An unknown runtime crash', 'Successful program execution without error', 'Division by zero occurred', 'The program ran out of memory'],
        correctIndex: 1,
        explanation: 'Exit code 0 is the universal Unix and Windows standard for successful termination.'
      },
      {
        id: 'mcq-cpp-struct-5',
        question: 'What must every executable statement in C++ terminate with?',
        options: ['A period .', 'A colon :', 'A semicolon ;', 'A closing curly brace }'],
        correctIndex: 2,
        explanation: 'C++ syntax strictly requires a semicolon (;) to terminate expressions and statements.'
      }
    ],
    codingChallenge: {
      title: 'Structured Output Card',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program that prints exactly three lines: "Language: C++", "File: main.cpp", and "Exit: 0".',
      input_format: 'No input.',
      output_format: 'Three lines of text as specified.',
      constraints: 'Include <iostream> and return 0.',
      starter_code: `#include <iostream>

int main() {
    // Print the three required lines
    return 0;
}`,
      expected_output: `Language: C++\nFile: main.cpp\nExit: 0`,
      test_cases: [
        {
          input: '',
          expected_output: `Language: C++\nFile: main.cpp\nExit: 0`,
          is_hidden: false
        }
      ]
    },
    summary: [
      '#include <iostream> brings in standard stream input/output capabilities.',
      'int main() is the mandatory operating system entry point for every executable C++ program.',
      'std::cout with << outputs text to the standard console stdout stream.',
      'return 0 passes an exit code of zero back to the operating system, confirming error-free execution.'
    ]
  },

  // =========================================================================
  // LESSON 04: Input and Output Operations
  // =========================================================================
  {
    id: 'top-cpp-input-output',
    number: 4,
    numberDisplay: '04',
    moduleId: 'mod-cpp-intro-foundations',
    moduleTitle: 'Module 01: C++ Introduction & Programming Foundations',
    title: 'Input and Output Operations',
    slug: 'input-and-output-operations',
    language: 'cpp',
    shortDescription: 'Master standard stream I/O using std::cin, std::cout, std::cerr, chained stream operators, formatting, and buffer management.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-cpp-program-structure',
    learningObjectives: [
      'Perform user console input using std::cin and the stream extraction operator (>>)',
      'Compare std::endl with the newline escape character (\\n) and understand buffer flushing',
      'Read multiple variables across different data types from a single input stream',
      'Differentiate standard output (std::cout) from unbuffered error logging (std::cerr)'
    ],
    conceptExplanation: `### 1. Standard Streams in C++
The C++ \`<iostream>\` library provides four predefined stream objects:
* **\`std::cout\`**: Standard buffered character output stream (stdout).
* **\`std::cin\`**: Standard character input stream (stdin).
* **\`std::cerr\`**: Standard **unbuffered** error stream (stderr) for immediate error alerts.
* **\`std::clog\`**: Standard buffered error/logging stream.

### 2. Reading Input with \`std::cin\`
The stream extraction operator **\`>>\`** reads whitespace-delimited tokens from the input buffer into variables:
\`\`\`cpp
int age;
std::cin >> age;
\`\`\`
* The \`>>\` operator automatically skips leading whitespace (spaces, tabs, newlines).
* It parses characters until it encounters another whitespace or a character invalid for the target type.

### 3. Reading Multiple Input Values
You can chain multiple extractions in one expressive statement:
\`\`\`cpp
std::string name;
int age;
double marks;
std::cin >> name >> age >> marks;
\`\`\`
If user types \`Alice 20 95.5\`, each token is parsed and stored in its respective typed variable.

### 4. \`std::endl\` vs \`'\\n'\`: Performance & Flushing
* **\`'\\n'\`**: Simply inserts a newline character into the output buffer. It is much faster in tight loops or competitive programming.
* **\`std::endl\`**: Inserts a newline character AND explicitly **flushes** the stream buffer immediately to the screen. Frequent use of \`std::endl\` can cause massive I/O performance bottlenecks.

### 5. Error Reporting with \`std::cerr\`
When logging errors or warnings, use \`std::cerr\` instead of \`std::cout\`. Because \`std::cerr\` is unbuffered, its messages appear on the console immediately even if the program crashes a microsecond later.`,
    simpleExample: {
      code: `#include <iostream>
#include <string>

int main() {
    std::string name = "Ada";
    int score = 98;
    std::cout << "Student: " << name << ", Score: " << score << "\\n";
    return 0;
}`,
      explanation: 'Streams multiple values of different types seamlessly using the chained insertion operator.'
    },
    syntax: `// Standard Input Extraction
#include <iostream>

int main() {
    int age;
    std::cin >> age; // Reads integer from standard input
    std::cout << "Age: " << age << "\\n";
    return 0;
}`,
    codeExample: `#include <iostream>
#include <string>

int main() {
    // Demonstration reading student records
    std::string studentName = "Alex";
    int studentAge = 19;
    double marks = 92.5;

    std::cout << "=== Student Information ===" << std::endl;
    std::cout << "Name:  " << studentName << std::endl;
    std::cout << "Age:   " << studentAge << std::endl;
    std::cout << "Marks: " << marks << std::endl;
    std::cout << "Grade: A" << std::endl;
    std::cout << "===========================" << std::endl;
    return 0;
}`,
    expectedOutput: `=== Student Information ===
Name:  Alex
Age:   19
Marks: 92.5
Grade: A
===========================`,
    stepByStep: [
      '1. Variables studentName, studentAge, and marks are allocated on the stack.',
      '2. std::cout stream receives the banner text and inserts a newline via std::endl.',
      '3. Stream insertion chains labels and variables into the stdout buffer.',
      '4. std::endl flushes each line onto the console output device.',
      '5. Program completes successfully with code 0.'
    ],
    commonMistakes: [
      {
        mistake: 'Confusing insertion (<<) and extraction (>>) operators',
        codeSnippet: `std::cin << age; // Compiler Error: no match for operator<<
std::cout >> name; // Compiler Error`,
        correction: 'Remember: << points TO cout (output), >> points INTO variables from cin (input).',
        explanation: 'Think of arrows pointing in the direction of data flow: cin >> variable and cout << data.'
      },
      {
        mistake: 'Using std::endl inside high-frequency loops',
        codeSnippet: `for (int i = 0; i < 100000; i++) std::cout << i << std::endl; // Extremely slow`,
        correction: 'Use "\\n" instead of std::endl for fast bulk stream output.',
        explanation: 'Flushing the hardware I/O buffer 100,000 times triggers excessive OS context switches.'
      },
      {
        mistake: 'Trying to read a full line with spaces using cin >> str',
        codeSnippet: `std::string fullName;
std::cin >> fullName; // If user enters "Ada Lovelace", fullName only holds "Ada"`,
        correction: 'Use std::getline(std::cin, fullName) to read complete lines containing spaces.',
        explanation: 'The >> operator stops extracting at the first whitespace character.'
      }
    ],
    realWorldExample: {
      scenario: 'Point of Sale (POS) Receipt Generator',
      code: `#include <iostream>
#include <string>

int main() {
    std::string item = "SSD 1TB";
    int qty = 2;
    double unitPrice = 79.99;
    double total = qty * unitPrice;

    std::cout << "=== Store Receipt ===\\n";
    std::cout << "Item:  " << item << "\\n";
    std::cout << "Qty:   " << qty << "\\n";
    std::cout << "Total: $" << total << "\\n";
    return 0;
}`,
      explanation: 'Commercial POS terminals format stream output with precision calculations for customer billing.'
    },
    practice: {
      prompt: 'Write a C++ program that prints a user card: line 1 "User: Developer", line 2 "Level: 1", and line 3 "XP: 100".',
      starterCode: `#include <iostream>

int main() {
    // Print the three card lines
    return 0;
}`,
      expectedOutputMatcher: 'User: Developer\nLevel: 1\nXP: 100',
      hint: 'Use std::cout with \\n.',
      solution: `#include <iostream>

int main() {
    std::cout << "User: Developer\\n";
    std::cout << "Level: 1\\n";
    std::cout << "XP: 100\\n";
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-io-1',
        question: 'Which standard stream object is used to extract keyboard input in C++?',
        options: ['std::cout', 'std::cin', 'std::cerr', 'std::clog'],
        correctIndex: 1,
        explanation: 'std::cin is the standard character input stream.'
      },
      {
        id: 'mcq-cpp-io-2',
        question: 'What is the key difference between std::endl and \'\\n\'?',
        options: [
          'std::endl works only on Windows, while \'\\n\' works only on Linux',
          'std::endl inserts a newline AND flushes the stream buffer, while \'\\n\' only inserts a newline',
          '\'\\n\' is deprecated in C++20',
          'There is zero difference; they are exact aliases'
        ],
        correctIndex: 1,
        explanation: 'std::endl explicitly forces an operating system buffer flush in addition to printing a newline.'
      },
      {
        id: 'mcq-cpp-io-3',
        question: 'Which operator is the stream extraction operator used with std::cin?',
        options: ['<<', '>>', '::', '->'],
        correctIndex: 1,
        explanation: '>> extracts tokens from the input stream into variables.'
      },
      {
        id: 'mcq-cpp-io-4',
        question: 'Which standard stream is unbuffered and designed for immediate error messages?',
        options: ['std::cout', 'std::cin', 'std::cerr', 'std::endl'],
        correctIndex: 2,
        explanation: 'std::cerr is unbuffered, ensuring error output appears immediately even if a crash occurs.'
      },
      {
        id: 'mcq-cpp-io-5',
        question: 'If a user inputs "42 99" into "std::cin >> a >> b;", how are values assigned?',
        options: [
          'a receives 42, b receives 99',
          'a receives "42 99", b is empty',
          'A compilation error occurs',
          'b receives 42, a receives 99'
        ],
        correctIndex: 0,
        explanation: 'cin skips the whitespace separator and assigns the first integer token 42 to a and the second token 99 to b.'
      }
    ],
    codingChallenge: {
      title: 'Student Grade Record Card',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program that outputs three lines displaying a student record: "Student: Morgan", "Score: 98", "Status: Honors".',
      input_format: 'No input required.',
      output_format: 'Three lines matching the record exactly.',
      constraints: 'Use std::cout formatting.',
      starter_code: `#include <iostream>

int main() {
    // Print the student grade record
    return 0;
}`,
      expected_output: `Student: Morgan\nScore: 98\nStatus: Honors`,
      test_cases: [
        {
          input: '',
          expected_output: `Student: Morgan\nScore: 98\nStatus: Honors`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'std::cout with << outputs to stdout; std::cin with >> extracts from stdin.',
      'Multiple extraction operators can be chained to parse multiple values sequentially.',
      'Prefer \\n over std::endl in high-frequency output scenarios to avoid buffer flushing overhead.',
      'std::cerr provides an unbuffered error stream that displays diagnostics immediately.'
    ]
  },

  // =========================================================================
  // LESSON 05: Variables and Constants
  // =========================================================================
  {
    id: 'top-cpp-variables-constants',
    number: 5,
    numberDisplay: '05',
    moduleId: 'mod-cpp-intro-foundations',
    moduleTitle: 'Module 01: C++ Introduction & Programming Foundations',
    title: 'Variables and Constants',
    slug: 'variables-and-constants',
    language: 'cpp',
    shortDescription: 'Understand variable memory allocation, initialization techniques, naming rules, the const qualifier, and compile-time constexpr evaluation.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-cpp-input-output',
    learningObjectives: [
      'Define what a variable is from a hardware and memory address perspective',
      'Compare C++ initialization forms: copy initialization, direct initialization, and uniform brace initialization',
      'Apply proper identifier naming conventions (camelCase, snake_case) and identifier rules',
      'Protect immutability using the const qualifier and compile-time constexpr'
    ],
    conceptExplanation: `### 1. What is a Variable?
At the hardware level, a variable is a named storage location in physical RAM. When you declare:
\`\`\`cpp
int score = 100;
\`\`\`
The compiler reserves 4 bytes of memory (on typical 32/64-bit systems) at a specific memory address (e.g., \`0x7ffeeb54\`), associates the symbolic identifier \`score\` with that address, and writes the binary pattern for \`100\` into those bytes.

### 2. Variable Initialization Forms
Modern C++ provides three ways to initialize a variable:
1. **Copy Initialization**: \`int a = 10;\` (Inherited from C)
2. **Direct Initialization**: \`int b(20);\`
3. **Uniform Brace Initialization (C++11)**: \`int c{30};\` or \`int d = {30};\`.
   * *Best Practice*: Brace initialization prevents accidental **narrowing conversions** (e.g., \`int x{3.14};\` causes a compiler error rather than silently truncating to 3).

### 3. Naming Conventions & Identifiers
* Identifiers may contain letters (\`a-z\`, \`A-Z\`), digits (\`0-9\`), and underscores (\`_\`).
* Must NOT start with a digit (\`2score\` is illegal).
* C++ is strictly **case-sensitive** (\`score\`, \`Score\`, and \`SCORE\` are three different variables).
* Cannot use reserved C++ keywords (e.g., \`int\`, \`class\`, \`return\`, \`const\`).

### 4. Constants: \`const\` vs \`constexpr\`
* **\`const\`**: Marks a variable as read-only after initialization. Its value can be determined either at compile time or at runtime:
  \`\`\`cpp
  const int maxUsers = 100; // Compile-time constant
  const int userAge = readAgeFromDatabase(); // Runtime constant
  \`\`\`
* **\`constexpr\` (C++11)**: Strictly guarantees that the expression is evaluated at **compile time**. If the compiler cannot compute the value during compilation, it rejects the code:
  \`\`\`cpp
  constexpr int SECONDS_PER_DAY = 24 * 60 * 60; // Computed during compilation!
  \`\`\`
Using \`constexpr\` shifts runtime computation into zero-cost compile-time constants.`,
    simpleExample: {
      code: `#include <iostream>

int main() {
    const double PI = 3.14159;
    constexpr int BUFFER_SIZE = 1024;
    int activeConnections = 5;

    std::cout << "Buffer: " << BUFFER_SIZE << ", Active: " << activeConnections << "\\n";
    return 0;
}`,
      explanation: 'Demonstrates mutable variables alongside const and compile-time constexpr constants.'
    },
    syntax: `// Variable Declaration & Initialization
type identifier = initial_value;
const type CONSTANT_NAME = value;
constexpr type COMPILE_TIME_CONST = value;`,
    codeExample: `#include <iostream>

int main() {
    // 1. Variable with brace initialization
    int playerHealth{100};
    double moveSpeed = 5.75;
    
    // 2. Constants
    const int maxLives = 3;
    constexpr int MAX_INVENTORY_SLOTS = 16;

    std::cout << "=== Player Status ===" << std::endl;
    std::cout << "Health:    " << playerHealth << std::endl;
    std::cout << "Speed:     " << moveSpeed << std::endl;
    std::cout << "Max Lives: " << maxLives << std::endl;
    std::cout << "Slots:     " << MAX_INVENTORY_SLOTS << std::endl;
    return 0;
}`,
    expectedOutput: `=== Player Status ===
Health:    100
Speed:     5.75
Max Lives: 3
Slots:     16`,
    stepByStep: [
      '1. Memory allocated on stack for playerHealth (4 bytes) initialized to 100.',
      '2. Memory allocated for moveSpeed (8 bytes) initialized to 5.75.',
      '3. maxLives initialized as read-only constant; subsequent modifications cause compiler errors.',
      '4. MAX_INVENTORY_SLOTS resolved at compile time with zero runtime allocation overhead.',
      '5. Output streamed to console cleanly.'
    ],
    commonMistakes: [
      {
        mistake: 'Declaring a const variable without initializing it',
        codeSnippet: `const int maxLimit; // Compiler Error: uninitialized const 'maxLimit'`,
        correction: 'Always provide an initial value when declaring a const variable: const int maxLimit = 100;',
        explanation: 'Because const variables can never be assigned later, they must receive their value upon declaration.'
      },
      {
        mistake: 'Using uninitialized local variables',
        codeSnippet: `int count;
std::cout << count; // Undefined Behavior: prints garbage memory contents`,
        correction: 'Always initialize variables: int count = 0; or int count{};',
        explanation: 'Local stack variables in C++ are NOT automatically zeroed out; they hold whatever residual bits were left in memory.'
      },
      {
        mistake: 'Attempting to reassign a const variable',
        codeSnippet: `const int score = 50;
score = 60; // Compiler Error: assignment of read-only variable`,
        correction: 'If a variable must change over time, do not mark it const.',
        explanation: 'const enforces compile-time immutability.'
      }
    ],
    realWorldExample: {
      scenario: 'Financial Tax Rate Calculator',
      code: `#include <iostream>

int main() {
    constexpr double SALES_TAX_RATE = 0.0825; // 8.25% State Tax
    double subtotal = 120.00;
    double taxAmount = subtotal * SALES_TAX_RATE;
    double grandTotal = subtotal + taxAmount;

    std::cout << "Subtotal:    $" << subtotal << "\\n";
    std::cout << "Tax (8.25%): $" << taxAmount << "\\n";
    std::cout << "Grand Total: $" << grandTotal << "\\n";
    return 0;
}`,
      explanation: 'Financial constants like tax rates and interest caps must be guarded with constexpr/const to prevent accidental alteration.'
    },
    practice: {
      prompt: 'Write a C++ program that declares a const int DAYS_IN_WEEK = 7, an int hoursPerDay = 24, and prints "Weekly Hours: 168".',
      starterCode: `#include <iostream>

int main() {
    // Declare constants and print the weekly hours
    return 0;
}`,
      expectedOutputMatcher: 'Weekly Hours: 168',
      hint: 'Multiply DAYS_IN_WEEK by hoursPerDay and print the result.',
      solution: `#include <iostream>

int main() {
    const int DAYS_IN_WEEK = 7;
    int hoursPerDay = 24;
    std::cout << "Weekly Hours: " << DAYS_IN_WEEK * hoursPerDay << "\\n";
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-var-1',
        question: 'What is stored in an uninitialized local primitive variable in C++?',
        options: ['Zero (0)', 'Null', 'Undefined garbage data left in memory', 'NaN'],
        correctIndex: 2,
        explanation: 'Local variables in C++ are not zero-initialized by default; they contain whatever arbitrary bytes were previously in that stack location.'
      },
      {
        id: 'mcq-cpp-var-2',
        question: 'Which initialization syntax is known as uniform brace initialization in modern C++?',
        options: ['int x = 10;', 'int x(10);', 'int x{10};', 'int x := 10;'],
        correctIndex: 2,
        explanation: 'int x{10}; is uniform brace initialization introduced in C++11, which prevents narrowing conversions.'
      },
      {
        id: 'mcq-cpp-var-3',
        question: 'What happens if you try to assign a new value to a variable marked const?',
        options: [
          'The program crashes at runtime',
          'The compiler emits a compilation error',
          'The value changes silently',
          'A warning is printed to cerr'
        ],
        correctIndex: 1,
        explanation: 'const immutability is enforced at compile time; any reassignment causes a compilation error.'
      },
      {
        id: 'mcq-cpp-var-4',
        question: 'What is the primary guarantee provided by constexpr in C++?',
        options: [
          'The variable can only be accessed by one thread',
          'The expression must be computable at compile time',
          'The variable is stored on the heap',
          'The variable cannot be read by pointers'
        ],
        correctIndex: 1,
        explanation: 'constexpr enforces compile-time evaluation, ensuring values and functions can be computed during compilation.'
      },
      {
        id: 'mcq-cpp-var-5',
        question: 'Which of the following identifier names is ILLEGAL in C++?',
        options: ['_playerScore', 'score_2', '2playerScore', 'playerScore2'],
        correctIndex: 2,
        explanation: 'Identifiers in C++ cannot begin with a numeric digit.'
      }
    ],
    codingChallenge: {
      title: 'Server Configuration Metrics',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program that declares a constexpr int PORT = 8080 and an int maxConnections = 1000, then prints "Port: 8080" on line 1 and "Connections: 1000" on line 2.',
      input_format: 'No input.',
      output_format: 'Two lines displaying the configuration values.',
      constraints: 'Use PORT and maxConnections variables.',
      starter_code: `#include <iostream>

int main() {
    // Declare variables and print configuration
    return 0;
}`,
      expected_output: `Port: 8080\nConnections: 1000`,
      test_cases: [
        {
          input: '',
          expected_output: `Port: 8080\nConnections: 1000`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'A variable represents a typed, named memory allocation on the stack or heap.',
      'Uniform brace initialization int x{10}; prevents narrowing type conversions.',
      'const prevents modification of variables after initialization.',
      'constexpr guarantees compile-time constant computation with zero runtime performance cost.'
    ]
  },

  // =========================================================================
  // LESSON 06: Data Types
  // =========================================================================
  {
    id: 'top-cpp-data-types',
    number: 6,
    numberDisplay: '06',
    moduleId: 'mod-cpp-intro-foundations',
    moduleTitle: 'Module 01: C++ Introduction & Programming Foundations',
    title: 'Data Types',
    slug: 'data-types-in-cpp',
    language: 'cpp',
    shortDescription: 'Explore fundamental data types, sizes, signed/unsigned modifiers, characters, booleans, floating-point IEEE-754 precision, and sizeof().',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-cpp-variables-constants',
    learningObjectives: [
      'Categorize primitive C++ data types: integer, floating-point, character, boolean, and void',
      'Explain signed vs unsigned integer modifiers and binary overflow behavior',
      'Determine data type storage size using the sizeof() operator',
      'Choose the optimal data type balancing memory footprint with numeric range'
    ],
    conceptExplanation: `### 1. Primitive Data Types Overview
C++ is a strongly typed language where every variable must have a declared type determining its memory footprint and valid operations:

| Category | Type | Typical Size | Typical Value Range |
| :--- | :--- | :--- | :--- |
| **Boolean** | \`bool\` | 1 byte | \`true\` (1) or \`false\` (0) |
| **Character** | \`char\` | 1 byte | -128 to 127 (ASCII characters) |
| **Integer (Short)** | \`short\` | 2 bytes | -32,768 to 32,767 |
| **Integer (Standard)** | \`int\` | 4 bytes | -2,147,483,648 to 2,147,483,647 |
| **Integer (Long)** | \`long long\` | 8 bytes | ~ -9.22 × 10¹⁸ to +9.22 × 10¹⁸ |
| **Floating Point** | \`float\` | 4 bytes | ~7 decimal digits of precision |
| **Double Precision** | \`double\` | 8 bytes | ~15-17 decimal digits of precision |

### 2. Type Modifiers: \`signed\` vs \`unsigned\`
By default, integer types are signed (capable of representing negative and positive numbers using two's complement):
* **\`signed int\`**: Uses the most significant bit (MSB) as the sign bit. Range: \`-2³¹\` to \`2³¹ - 1\`.
* **\`unsigned int\`**: All 32 bits represent magnitude. Range: \`0\` to \`2³² - 1\` (0 to 4,294,967,295).
* *Caution*: Unsigned underflow (\`0u - 1u\`) wraps around to \`4294967295\`, a frequent source of infinite loops.

### 3. Characters & Booleans
* **\`char\`**: Holds a single ASCII character enclosed in single quotes (e.g., \`'A'\` has an ASCII integer value of \`65\`).
* **\`bool\`**: Evaluates to boolean \`true\` (stored internally as 1) or \`false\` (stored as 0). You can use \`std::boolalpha\` to format boolean output as "true"/"false" instead of 1/0.

### 4. The \`sizeof()\` Operator
The built-in compile-time operator \`sizeof()\` returns the storage size of a type or variable in bytes:
\`\`\`cpp
std::cout << "int size: " << sizeof(int) << " bytes\\n"; // Typically prints 4
\`\`\``,
    simpleExample: {
      code: `#include <iostream>

int main() {
    int count = 42;
    double price = 19.99;
    char grade = 'A';
    bool passed = true;

    std::cout << "Type sizes: int=" << sizeof(count) 
              << "B, double=" << sizeof(price) << "B\\n";
    return 0;
}`,
      explanation: 'Demonstrates declarations across primitive types and queries their byte sizes using sizeof.'
    },
    syntax: `// Data Type Declarations
bool flag = true;
char initial = 'Z';
int count = 100;
double ratio = 3.14159;
sizeof(type_name); // Returns size_t byte count`,
    codeExample: `#include <iostream>

int main() {
    std::cout << "=== C++ Primitive Type Footprint ===" << std::endl;
    std::cout << "bool:        " << sizeof(bool) << " byte" << std::endl;
    std::cout << "char:        " << sizeof(char) << " byte" << std::endl;
    std::cout << "int:         " << sizeof(int) << " bytes" << std::endl;
    std::cout << "double:      " << sizeof(double) << " bytes" << std::endl;
    std::cout << "long long:   " << sizeof(long long) << " bytes" << std::endl;
    std::cout << "====================================" << std::endl;
    return 0;
}`,
    expectedOutput: `=== C++ Primitive Type Footprint ===
bool:        1 byte
char:        1 byte
int:         4 bytes
double:      8 bytes
long long:   8 bytes
====================================`,
    stepByStep: [
      '1. sizeof(bool) resolves at compile time to 1 byte.',
      '2. sizeof(char) is defined by the C++ standard to be strictly 1 byte.',
      '3. sizeof(int) resolves to 4 bytes on standard x86/x64 architectures.',
      '4. sizeof(double) provides 8 bytes (64-bit IEEE 754 floating point).',
      '5. sizeof(long long) guarantees at least 64 bits (8 bytes) of integer range.'
    ],
    commonMistakes: [
      {
        mistake: 'Using single quotes for strings or double quotes for characters',
        codeSnippet: `char grade = "A"; // Error: invalid conversion from 'const char*' to 'char'`,
        correction: 'Use single quotes for single characters (\'A\') and double quotes for strings ("A").',
        explanation: '\'A\' is a 1-byte char; "A" is a null-terminated string literal array containing \'A\' and \'\\0\'.'
      },
      {
        mistake: 'Unsigned integer underflow in decrementing loops',
        codeSnippet: `for (unsigned int i = 5; i >= 0; i--) { ... } // Infinite loop!`,
        correction: 'Use signed int or write condition i > 0 with post-decrement.',
        explanation: 'Because an unsigned int cannot be negative, 0 - 1 wraps around to 4,294,967,295, never satisfying i < 0.'
      },
      {
        mistake: 'Assuming float and double have exact precision',
        codeSnippet: `float f = 0.1f + 0.2f; if (f == 0.3f) { ... } // May evaluate to false`,
        correction: 'Use an epsilon comparison threshold (std::abs(a - b) < 1e-6) for floating points.',
        explanation: 'Binary floating-point representations cannot represent decimal fractions like 0.1 exactly.'
      }
    ],
    realWorldExample: {
      scenario: 'High-Altitude Weather Balloon Sensor Telemetry',
      code: `#include <iostream>

int main() {
    short sensorId = 104;
    double altitudeMeters = 32450.75;
    float temperatureCelsius = -52.4f;
    bool parachuteDeployed = false;

    std::cout << "Sensor ID:   " << sensorId << "\\n";
    std::cout << "Altitude:    " << altitudeMeters << " m\\n";
    std::cout << "Temperature: " << temperatureCelsius << " C\\n";
    std::cout << "Parachute:   " << (parachuteDeployed ? "DEPLOYED" : "ARMED") << "\\n";
    return 0;
}`,
      explanation: 'Aerospace firmware optimizes bandwidth by transmitting compact primitive data types across radio links.'
    },
    practice: {
      prompt: 'Write a C++ program that prints "char: 1 byte" on line 1 and "int: 4 bytes" on line 2.',
      starterCode: `#include <iostream>

int main() {
    // Print the required type sizes
    return 0;
}`,
      expectedOutputMatcher: 'char: 1 byte\nint: 4 bytes',
      hint: 'Use std::cout << "char: " << sizeof(char) << " byte\\n";',
      solution: `#include <iostream>

int main() {
    std::cout << "char: 1 byte\\n";
    std::cout << "int: 4 bytes\\n";
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-type-1',
        question: 'What is the size of char guaranteed to be by the C++ standard on all compliant platforms?',
        options: ['Exactly 1 byte', '2 bytes', '4 bytes', 'Architecture dependent'],
        correctIndex: 0,
        explanation: 'The C++ standard defines sizeof(char) as strictly 1 by definition.'
      },
      {
        id: 'mcq-cpp-type-2',
        question: 'Which integer modifier doubles the maximum positive range by disallowing negative values?',
        options: ['signed', 'unsigned', 'const', 'static'],
        correctIndex: 1,
        explanation: 'unsigned integers repurpose the sign bit for numeric magnitude, doubling the positive capacity.'
      },
      {
        id: 'mcq-cpp-type-3',
        question: 'What does the sizeof() operator evaluate to?',
        options: [
          'The number of bits in a variable',
          'The size of a type or variable in bytes',
          'The maximum numeric value of a variable',
          'The memory address of a variable'
        ],
        correctIndex: 1,
        explanation: 'sizeof() returns the size of its operand in bytes as an unsigned integer of type size_t.'
      },
      {
        id: 'mcq-cpp-type-4',
        question: 'Which floating-point type provides 8 bytes of storage and ~15 decimal digits of precision?',
        options: ['float', 'double', 'short', 'long'],
        correctIndex: 1,
        explanation: 'double represents 64-bit IEEE 754 double-precision floating-point numbers.'
      },
      {
        id: 'mcq-cpp-type-5',
        question: 'What is the correct syntax for a single character literal in C++?',
        options: ['"X"', '\'X\'', '[X]', '{X}'],
        correctIndex: 1,
        explanation: 'Single quotes (\'X\') denote single character literals in C++.'
      }
    ],
    codingChallenge: {
      title: 'Telemetry Type Reporter',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program that prints a three-line summary: "Type: double", "Size: 8 bytes", "Precision: High".',
      input_format: 'No input.',
      output_format: 'Three lines matching the required summary.',
      constraints: 'Follow standard C++ layout.',
      starter_code: `#include <iostream>

int main() {
    // Print telemetry type summary
    return 0;
}`,
      expected_output: `Type: double\nSize: 8 bytes\nPrecision: High`,
      test_cases: [
        {
          input: '',
          expected_output: `Type: double\nSize: 8 bytes\nPrecision: High`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Primitive C++ types include bool, char, int, float, double, and long long.',
      'The sizeof() operator computes the storage size of types and variables in bytes at compile time.',
      'Unsigned integers cannot hold negative numbers and wrap to their maximum limit upon underflow.',
      'double offers 8-byte precision suitable for scientific and high-accuracy engineering computations.'
    ]
  },

  // =========================================================================
  // LESSON 07: Operators in C++
  // =========================================================================
  {
    id: 'top-cpp-operators',
    number: 7,
    numberDisplay: '07',
    moduleId: 'mod-cpp-intro-foundations',
    moduleTitle: 'Module 01: C++ Introduction & Programming Foundations',
    title: 'Operators in C++',
    slug: 'operators-in-cpp',
    language: 'cpp',
    shortDescription: 'Master arithmetic, relational, logical, assignment, increment/decrement, conditional ternary operators, precedence, and associativity.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-cpp-data-types',
    learningObjectives: [
      'Perform calculations using arithmetic (+, -, *, /, %) and compound assignment operators',
      'Evaluate boolean logic using relational (==, !=, <, >, <=, >=) and logical (&&, ||, !) operators',
      'Differentiate prefix (++x) from postfix (x++) increment behavior in expressions',
      'Apply operator precedence and associativity rules to solve complex expressions'
    ],
    conceptExplanation: `### 1. Categories of C++ Operators
An operator is a symbol that commands the compiler to perform a specific mathematical, logical, or relational manipulation:
1. **Arithmetic**: \`+\`, \`-\`, \`*\`, \`/\`, \`%\` (modulus / remainder).
2. **Relational**: \`==\` (equal), \`!=\` (not equal), \`<\`, \`>\`, \`<=\`, \`>=\`.
3. **Logical**: \`&&\` (AND), \`||\` (OR), \`!\` (NOT).
4. **Assignment**: \`=\`, \`+=\`, \`-=\`, \`*=\`, \`/=\`, \`%=\`.
5. **Conditional (Ternary)**: \`condition ? expr1 : expr2\`.

### 2. Modulus & Integer Division Nuances
* **Integer Division**: When dividing two integers, C++ performs integer division and truncates towards zero (\`7 / 2\` evaluates to \`3\`).
* **Modulus (\`%\`)**: Computes the integer remainder (\`7 % 2\` evaluates to \`1\`). Modulus only operates on integer types.

### 3. Prefix vs Postfix Increment/Decrement
* **Prefix (\`++x\`)**: Increments the variable FIRST, then returns the updated value.
  \`\`\`cpp
  int a = 5;
  int b = ++a; // a becomes 6, b receives 6
  \`\`\`
* **Postfix (\`x++\`)**: Yields the current value FIRST, then increments the variable afterwards.
  \`\`\`cpp
  int a = 5;
  int b = a++; // b receives 5, a becomes 6
  \`\`\`

### 4. Short-Circuit Evaluation in Logical Operators
C++ uses **short-circuit evaluation**:
* In \`A && B\`, if \`A\` is \`false\`, \`B\` is NEVER evaluated because the whole expression cannot be true.
* In \`A || B\`, if \`A\` is \`true\`, \`B\` is NEVER evaluated.
This is heavily used for safe pointer and bounds checks: \`if (ptr != nullptr && *ptr > 0)\`.

### 5. Operator Precedence Hierarchy
Operators are evaluated in order of precedence:
1. Parentheses: \`()\`
2. Increment/Decrement, Logical NOT: \`++\`, \`--\`, \`!\`
3. Multiplicative: \`*\`, \`/\`, \`%\`
4. Additive: \`+\`, \`-\`
5. Relational: \`<\`, \`<=\`, \`>\`, \`>=\`
6. Equality: \`==\`, \`!=\`
7. Logical AND: \`&&\`
8. Logical OR: \`||\`
9. Assignment: \`=\`, \`+=\``,
    simpleExample: {
      code: `#include <iostream>

int main() {
    int a = 10, b = 3;
    std::cout << "Quotient: " << a / b << ", Remainder: " << a % b << "\\n";
    return 0;
}`,
      explanation: 'Integer division yields 3, while modulus computes remainder 1.'
    },
    syntax: `// Arithmetic and Logic Syntax
result = a + b * c;     // Multiplication precedes addition
bool valid = (x > 0) && (x < 100);
int maxVal = (a > b) ? a : b; // Ternary operator`,
    codeExample: `#include <iostream>

int main() {
    int x = 5;
    int y = 2;

    int sum = x + y;
    int diff = x - y;
    int prod = x * y;
    int quot = x / y;
    int rem = x % y;

    std::cout << "=== Operator Arithmetic ===" << std::endl;
    std::cout << "5 + 2 = " << sum << std::endl;
    std::cout << "5 - 2 = " << diff << std::endl;
    std::cout << "5 * 2 = " << prod << std::endl;
    std::cout << "5 / 2 = " << quot << " (Integer Truncated)" << std::endl;
    std::cout << "5 % 2 = " << rem << " (Remainder)" << std::endl;
    return 0;
}`,
    expectedOutput: `=== Operator Arithmetic ===
5 + 2 = 7
5 - 2 = 3
5 * 2 = 10
5 / 2 = 2 (Integer Truncated)
5 % 2 = 1 (Remainder)`,
    stepByStep: [
      '1. 5 + 2 computes integer 7 and stores it in sum.',
      '2. 5 - 2 computes integer 3 and stores it in diff.',
      '3. 5 * 2 computes integer 10 and stores it in prod.',
      '4. 5 / 2 truncates fractional component 0.5 and returns 2.',
      '5. 5 % 2 computes remainder 1.',
      '6. Output streamed to console cleanly.'
    ],
    commonMistakes: [
      {
        mistake: 'Using = (assignment) instead of == (equality test)',
        codeSnippet: `if (x = 5) { ... } // Bug: assigns 5 to x, evaluates to true!`,
        correction: 'Use == for comparison: if (x == 5) { ... }',
        explanation: 'Single = assigns the right value to the left operand and returns the assigned value, which evaluates as non-zero (true).'
      },
      {
        mistake: 'Expecting 5 / 2 to yield 2.5 when variables are integers',
        codeSnippet: `double result = 5 / 2; // Result is 2.0, not 2.5!`,
        correction: 'Ensure at least one operand is floating-point: double result = 5.0 / 2;',
        explanation: 'Integer division executes first (yielding integer 2), which is only then converted to double 2.0.'
      },
      {
        mistake: 'Modulus on floating-point numbers using %',
        codeSnippet: `double rem = 5.5 % 2.0; // Compiler Error: invalid operands to %`,
        correction: 'Use std::fmod from <cmath> for floating point modulus.',
        explanation: 'The C++ % operator is strictly restricted to integer types.'
      }
    ],
    realWorldExample: {
      scenario: 'Autonomous Driving Speed Gate Safety Interlock',
      code: `#include <iostream>

int main() {
    double vehicleSpeedKph = 65.0;
    double speedLimitKph = 60.0;
    bool cameraClear = true;

    bool isOverspeed = vehicleSpeedKph > speedLimitKph;
    bool emergencyBrakeNeeded = isOverspeed && !cameraClear;

    std::cout << "Vehicle Speed: " << vehicleSpeedKph << " km/h\\n";
    std::cout << "Overspeed:     " << (isOverspeed ? "YES" : "NO") << "\\n";
    std::cout << "Brake Active:  " << (emergencyBrakeNeeded ? "ENGAGED" : "OFF") << "\\n";
    return 0;
}`,
      explanation: 'Control systems combine relational comparisons and boolean logic to trigger safety actuators.'
    },
    practice: {
      prompt: 'Write a C++ program that calculates the remainder of 29 divided by 5 and prints "Remainder: 4".',
      starterCode: `#include <iostream>

int main() {
    // Calculate and print the remainder
    return 0;
}`,
      expectedOutputMatcher: 'Remainder: 4',
      hint: 'Use the modulus operator: 29 % 5.',
      solution: `#include <iostream>

int main() {
    int rem = 29 % 5;
    std::cout << "Remainder: " << rem << "\\n";
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-op-1',
        question: 'What is the result of the integer division expression "17 / 5" in C++?',
        options: ['3.4', '3', '4', '2'],
        correctIndex: 1,
        explanation: 'Integer division truncates the fractional portion, resulting in 3.'
      },
      {
        id: 'mcq-cpp-op-2',
        question: 'If int x = 10, what value is assigned to y in "int y = ++x;"?',
        options: ['10', '11', '9', 'Undefined'],
        correctIndex: 1,
        explanation: 'Prefix ++x increments x to 11 first, and then evaluates to 11, assigning 11 to y.'
      },
      {
        id: 'mcq-cpp-op-3',
        question: 'What is the phenomenon where the second operand of && is skipped if the first operand is false?',
        options: ['Deadlock', 'Short-circuit evaluation', 'Narrowing conversion', 'Lazy linkage'],
        correctIndex: 1,
        explanation: 'Short-circuit evaluation stops evaluating logical expressions as soon as the outcome is guaranteed.'
      },
      {
        id: 'mcq-cpp-op-4',
        question: 'Which of the following operators has higher precedence than addition (+)?',
        options: ['Logical AND (&&)', 'Assignment (=)', 'Multiplication (*)', 'Equality (==)'],
        correctIndex: 2,
        explanation: 'Multiplication (*) has higher precedence than addition (+).'
      },
      {
        id: 'mcq-cpp-op-5',
        question: 'What does the conditional ternary expression "(10 > 5) ? 100 : 200" evaluate to?',
        options: ['100', '200', 'true', 'false'],
        correctIndex: 0,
        explanation: 'Because 10 > 5 is true, the ternary operator returns the expression following the ?, which is 100.'
      }
    ],
    codingChallenge: {
      title: 'Expression Evaluation Engine',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program that evaluates the expression (12 * 4) - (15 / 3) and outputs "Result: 43".',
      input_format: 'No input.',
      output_format: 'One line: "Result: 43".',
      constraints: 'Compute using arithmetic operators.',
      starter_code: `#include <iostream>

int main() {
    // Compute and print expression result
    return 0;
}`,
      expected_output: `Result: 43`,
      test_cases: [
        {
          input: '',
          expected_output: `Result: 43`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'C++ provides arithmetic, relational, logical, assignment, and ternary operators.',
      'Integer division truncates decimals toward zero; modulus (%) yields the integer remainder.',
      'Prefix (++x) increments prior to evaluation, whereas postfix (x++) increments after yield.',
      'Short-circuit evaluation guarantees efficiency and memory safety when checking chained boolean guards.'
    ]
  },

  // =========================================================================
  // LESSON 08: Type Conversion and Expressions
  // =========================================================================
  {
    id: 'top-cpp-type-conversion',
    number: 8,
    numberDisplay: '08',
    moduleId: 'mod-cpp-intro-foundations',
    moduleTitle: 'Module 01: C++ Introduction & Programming Foundations',
    title: 'Type Conversion and Expressions',
    slug: 'type-conversion-and-expressions',
    language: 'cpp',
    shortDescription: 'Demystify implicit type promotion, explicit C-style casting vs static_cast, integer division traps (5/2 vs 5.0/2), and safe type conversions.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-cpp-operators',
    learningObjectives: [
      'Differentiate between implicit type promotion and explicit type casting',
      'Explain why 5 / 2 and 5.0 / 2 yield radically different computational results',
      'Use modern C++ static_cast<Type>(expr) in place of risky C-style casts',
      'Detect and prevent narrowing and precision loss across numeric conversions'
    ],
    conceptExplanation: `### 1. What is Type Conversion?
Type conversion changes an expression of one data type into another. There are two primary mechanisms:
1. **Implicit Conversion (Type Coercion)**: Executed automatically by the compiler to prevent data mismatch during operations.
2. **Explicit Conversion (Type Casting)**: Explicitly commanded by the programmer to change how binary representations are interpreted.

### 2. The Integer Division Trap: \`5 / 2\` vs \`5.0 / 2\`
A classic beginner pitfall is expecting fractional results from integer division:
* \`5 / 2\`: Both \`5\` and \`2\` are integer literals. The C++ compiler invokes integer division, computing \`2\` and dropping \`0.5\`.
* \`5.0 / 2\`: Here, \`5.0\` is a double literal. C++'s arithmetic promotion rule promotes \`2\` to \`2.0\`, performing double division and yielding \`2.5\`.

### 3. Implicit Type Promotion Hierarchy
When expressions mix different types, C++ promotes the narrower type to the wider type to preserve accuracy:
\`\`\`text
int -> unsigned int -> long -> unsigned long -> long long -> float -> double -> long double
\`\`\`
For instance, in \`int a = 10; double b = 2.5; auto c = a + b;\`, \`a\` is implicitly promoted to \`10.0\`, and \`c\` becomes \`12.5\` of type \`double\`.

### 4. Modern C++: \`static_cast\` vs C-Style Casts
In traditional C, developers wrote:
\`\`\`cpp
double x = 9.87;
int y = (int)x; // Risky, unchecked C-style cast
\`\`\`
Modern C++ introduces **\`static_cast<Type>(expression)\`**:
\`\`\`cpp
int y = static_cast<int>(x); // Safe, type-checked compile-time cast
\`\`\`
#### Why \`static_cast\` is Superior:
1. **Compile-Time Checking**: It ensures the conversion is mathematically and architecturally valid (it refuses to cast an unrelated pointer into an integer).
2. **Readability & Searchability**: You can easily search your codebase for \`static_cast\` to audit all explicit type conversions.`,
    simpleExample: {
      code: `#include <iostream>

int main() {
    int total = 17;
    int count = 5;
    
    // Explicit static_cast enables floating-point division
    double avg = static_cast<double>(total) / count;
    std::cout << "Accurate Average: " << avg << "\\n"; // 3.4
    return 0;
}`,
      explanation: 'static_cast<double>(total) converts total to 17.0, triggering floating-point division.'
    },
    syntax: `// Modern C++ Explicit Cast
target_type variable = static_cast<target_type>(source_expression);`,
    codeExample: `#include <iostream>

int main() {
    int intDiv = 5 / 2;
    double floatDiv = 5.0 / 2;
    double castDiv = static_cast<double>(5) / 2;

    std::cout << "=== Type Conversion & Division ===" << std::endl;
    std::cout << "5 / 2       = " << intDiv << "   (Integer division)" << std::endl;
    std::cout << "5.0 / 2     = " << floatDiv << " (Floating-point promotion)" << std::endl;
    std::cout << "static_cast = " << castDiv << " (Explicit static_cast)" << std::endl;
    return 0;
}`,
    expectedOutput: `=== Type Conversion & Division ===
5 / 2       = 2   (Integer division)
5.0 / 2     = 2.5 (Floating-point promotion)
static_cast = 2.5 (Explicit static_cast)`,
    stepByStep: [
      '1. 5 / 2 divides integer by integer, yielding truncated integer 2.',
      '2. In 5.0 / 2, operand 2 is implicitly promoted to 2.0 double.',
      '3. Floating-point division produces 2.5.',
      '4. static_cast<double>(5) explicitly casts integer 5 to double 5.0 prior to division.',
      '5. Output demonstrates exact mathematical difference on console.'
    ],
    commonMistakes: [
      {
        mistake: 'Casting the result after integer division has already occurred',
        codeSnippet: `int a = 5, b = 2;
double avg = static_cast<double>(a / b); // Bug: a/b evaluates to 2 first, then casts to 2.0!`,
        correction: 'Cast an operand BEFORE dividing: static_cast<double>(a) / b;',
        explanation: 'Casting the result of a / b is too late because the fractional part was already truncated.'
      },
      {
        mistake: 'Using raw C-style (type) casts in modern C++',
        codeSnippet: `int x = (int)3.14159; // Obsolete C-style cast`,
        correction: 'Use static_cast<int>(3.14159); to ensure compile-time type safety.',
        explanation: 'C-style casts can inadvertently perform dangerous reinterpret_cast or const_cast under the hood.'
      },
      {
        mistake: 'Silent integer overflow during implicit promotion',
        codeSnippet: `int a = 2000000000;
int b = 2000000000;
long long c = a + b; // Bug: a + b overflows as 32-bit int before being assigned to c!`,
        correction: 'Cast before addition: long long c = static_cast<long long>(a) + b;',
        explanation: 'The right-hand side a + b is evaluated in int arithmetic unless one operand is already long long.'
      }
    ],
    realWorldExample: {
      scenario: 'High-Accuracy Sensor Sample Averaging',
      code: `#include <iostream>

int main() {
    int totalSensorSamples = 495;
    int sampleCount = 100;

    double meanMeasurement = static_cast<double>(totalSensorSamples) / sampleCount;

    std::cout << "Samples Collected: " << sampleCount << "\\n";
    std::cout << "Raw Sum:           " << totalSensorSamples << "\\n";
    std::cout << "Calibrated Mean:   " << meanMeasurement << " units\\n";
    return 0;
}`,
      explanation: 'DSP sensor processing requires explicit casting to prevent loss of floating-point calibration fractions.'
    },
    practice: {
      prompt: 'Write a C++ program that computes the floating-point division of 7 by 2 using static_cast<double> and prints "Result: 3.5".',
      starterCode: `#include <iostream>

int main() {
    // Perform cast division and print
    return 0;
}`,
      expectedOutputMatcher: 'Result: 3.5',
      hint: 'Use static_cast<double>(7) / 2.',
      solution: `#include <iostream>

int main() {
    double res = static_cast<double>(7) / 2;
    std::cout << "Result: " << res << "\\n";
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-cast-1',
        question: 'Why does "5 / 2" produce 2 instead of 2.5 in C++?',
        options: [
          'Because C++ has a bug in its division logic',
          'Because both operands are integers, triggering integer division with truncated remainder',
          'Because 2 is rounded to the nearest even number',
          'Because cout cannot display fractions'
        ],
        correctIndex: 1,
        explanation: 'In C++, division between two integer operands always invokes integer division, truncating fractional digits.'
      },
      {
        id: 'mcq-cpp-cast-2',
        question: 'Which cast is the standard, type-safe explicit conversion operator in modern C++?',
        options: ['(int)x', 'static_cast<int>(x)', 'dynamic_cast<int>(x)', 'convert<int>(x)'],
        correctIndex: 1,
        explanation: 'static_cast<Type>(expr) is the standard modern C++ operator for well-defined compile-time conversions.'
      },
      {
        id: 'mcq-cpp-cast-3',
        question: 'What occurs when you assign double 9.99 to an int variable via "int x = 9.99;"?',
        options: [
          'The value is rounded up to 10',
          'The fractional portion is truncated, leaving 9',
          'A compilation error occurs',
          'The value becomes 0'
        ],
        correctIndex: 1,
        explanation: 'Implicit floating-to-integer conversion truncates the decimal part towards zero.'
      },
      {
        id: 'mcq-cpp-cast-4',
        question: 'What is the correct way to compute the accurate double average of two int variables a and b?',
        options: [
          'double avg = (a + b) / 2;',
          'double avg = static_cast<double>(a + b) / 2;',
          'double avg = static_cast<double>((a + b) / 2);',
          'double avg = a + b / 2.0;'
        ],
        correctIndex: 1,
        explanation: 'Casting (a + b) to double BEFORE dividing by 2 triggers floating-point division.'
      },
      {
        id: 'mcq-cpp-cast-5',
        question: 'In an expression involving an int and a double, what implicit conversion occurs?',
        options: [
          'The double is truncated to an int',
          'The int is promoted to a double',
          'Both are converted to float',
          'No conversion occurs; an error is raised'
        ],
        correctIndex: 1,
        explanation: 'Under C++ type promotion rules, the int is promoted to double to preserve arithmetic precision.'
      }
    ],
    codingChallenge: {
      title: 'Precision Division Calculator',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program that takes total marks 435 across 5 subjects and computes the exact floating-point average using static_cast, printing "Average: 87".',
      input_format: 'No input.',
      output_format: 'One line: "Average: 87".',
      constraints: 'Use static_cast<double> with variables total = 435 and subjects = 5.',
      starter_code: `#include <iostream>

int main() {
    int total = 435;
    int subjects = 5;
    // Calculate and print average
    return 0;
}`,
      expected_output: `Average: 87`,
      test_cases: [
        {
          input: '',
          expected_output: `Average: 87`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Integer division between two integer types always drops fractional portions (5 / 2 = 2).',
      'Having at least one floating-point operand (5.0 / 2) triggers floating-point division.',
      'Use static_cast<Type>(expr) for explicit, safe, and audited type conversions.',
      'Avoid casting after an integer operation has already discarded precision.'
    ]
  }
];
