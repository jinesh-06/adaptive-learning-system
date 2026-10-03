import { CppTopic } from './cppFundamentalsData';

export const CPP_MODULE_3_TOPICS: CppTopic[] = [
  // =========================================================================
  // LESSON 17: Functions in C++
  // =========================================================================
  {
    id: 'top-cpp-functions',
    number: 17,
    numberDisplay: '17',
    moduleId: 'mod-cpp-functions-memory',
    moduleTitle: 'Module 03: Functions, References & Memory Fundamentals',
    title: 'Functions in C++',
    slug: 'functions-in-cpp',
    language: 'cpp',
    shortDescription: 'Organize modular logic with functions: prototypes, definitions, parameters, return types, void routines, and stack activation records.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-cpp-strings-collections',
    learningObjectives: [
      'Decompose complex algorithms into modular, reusable, single-responsibility functions',
      'Distinguish function prototypes (declarations) from function definitions',
      'Manage input parameters and return types across scalar and void functions',
      'Explain how the CPU stack frame (activation record) manages local function variables'
    ],
    conceptExplanation: `### 1. What is a Function?
A function is a named, reusable block of statements that performs a dedicated task. Functions prevent code duplication, enhance testability, and isolate variable scopes.

### 2. Anatomy of a Function
\`\`\`cpp
return_type function_name(parameter_list) {
    // Function body
    return value; // (Omitted if return_type is void)
}
\`\`\`
* **Return Type**: The data type of the result yielded by the function (e.g., \`int\`, \`double\`, \`std::string\`, or \`void\` if nothing is returned).
* **Parameters**: Variable declarations in the function signature that receive incoming argument values.
* **Arguments**: The actual literal values or variables passed into the function call.

### 3. Function Prototypes (Forward Declarations)
In C++, the compiler reads source files from top to bottom. If function \`A()\` calls function \`B()\`, \`B\` must either be defined *above* \`A\`, or declared with a **function prototype** (forward declaration):
\`\`\`cpp
// 1. Function Prototype (Forward Declaration)
int add(int a, int b);

int main() {
    int sum = add(10, 20); // Compiler knows signature!
    return 0;
}

// 2. Function Definition
int add(int a, int b) {
    return a + b;
}
\`\`\`

### 4. Stack Activation Records (Stack Frames)
When a function is called:
1. The CPU allocates a new **stack frame** containing space for parameters, local variables, and the return address.
2. Control branches to the function's machine code.
3. Upon \`return\`, the stack frame is popped off the call stack, restoring the caller's execution environment.`,
    simpleExample: {
      code: `#include <iostream>

int multiply(int a, int b) {
    return a * b;
}

int main() {
    std::cout << "5 * 6 = " << multiply(5, 6) << "\\n";
    return 0;
}`,
      explanation: 'Defines multiply function taking two integers and returning their product.'
    },
    syntax: `// Function Prototype & Definition
ReturnType funcName(Type1 param1, Type2 param2);

ReturnType funcName(Type1 param1, Type2 param2) {
    // Body
    return result;
}`,
    codeExample: `#include <iostream>

// Function Prototypes
int calculateArea(int width, int height);
void printBanner(const std::string& title);

int main() {
    printBanner("Geometry Engine");
    int rectArea = calculateArea(8, 5);
    std::cout << "Rectangle Area: " << rectArea << " sq units" << std::endl;
    return 0;
}

void printBanner(const std::string& title) {
    std::cout << "=== " << title << " ===" << std::endl;
}

int calculateArea(int width, int height) {
    return width * height;
}`,
    expectedOutput: `=== Geometry Engine ===
Rectangle Area: 40 sq units`,
    stepByStep: [
      '1. Compiler registers function prototypes calculateArea and printBanner.',
      '2. Program starts in main(). printBanner("Geometry Engine") is called.',
      '3. A stack frame is pushed for printBanner; banner is printed; frame pops.',
      '4. calculateArea(8, 5) pushes stack frame with width = 8 and height = 5.',
      '5. 8 * 5 = 40 is returned and stored in rectArea.',
      '6. Output is displayed to console.'
    ],
    commonMistakes: [
      {
        mistake: 'Calling a function defined below main without a forward prototype',
        codeSnippet: `int main() { run(); } // Compiler Error: 'run' was not declared in this scope
void run() { ... }`,
        correction: 'Place a prototype void run(); above main() or define run() before main().',
        explanation: 'C++ is a single-pass compiler that requires declarations before identifier usage.'
      },
      {
        mistake: 'Forgetting to return a value from a non-void function',
        codeSnippet: `int getScore() {
    int s = 100;
    // Missing return s! Undefined behavior!
}`,
        correction: 'Ensure all code paths in a non-void function terminate with a return statement.',
        explanation: 'Reaching the end of a value-returning function without a return statement triggers undefined behavior.'
      }
    ],
    realWorldExample: {
      scenario: 'Robotic Arm Coordinate Kinematics Function',
      code: `#include <iostream>

double computeTorque(double massKg, double armLengthMeters) {
    constexpr double GRAVITY = 9.80665;
    return massKg * GRAVITY * armLengthMeters;
}

int main() {
    double torque = computeTorque(2.5, 0.75);
    std::cout << "Actuator Joint Torque: " << torque << " N*m\\n";
    return 0;
}`,
      explanation: 'Robotics control stacks encapsulate physics formulas in clean, modular calculation functions.'
    },
    practice: {
      prompt: 'Write a C++ program with a function int cube(int x) that returns x * x * x and prints "Cube: 27" for x = 3.',
      starterCode: `#include <iostream>

// Define cube function here

int main() {
    // Call cube(3) and print result
    return 0;
}`,
      expectedOutputMatcher: 'Cube: 27',
      hint: 'int cube(int x) { return x * x * x; } and std::cout << "Cube: " << cube(3) << "\\n";',
      solution: `#include <iostream>

int cube(int x) {
    return x * x * x;
}

int main() {
    std::cout << "Cube: " << cube(3) << "\\n";
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-fn-1',
        question: 'What return type is used for a function that does not return any value?',
        options: ['null', 'void', 'empty', 'int'],
        correctIndex: 1,
        explanation: 'void signifies the absence of a return value.'
      },
      {
        id: 'mcq-cpp-fn-2',
        question: 'What is a function prototype in C++?',
        options: [
          'A compiled binary executable',
          'A forward declaration of a function\'s name, return type, and parameters without its body',
          'A pointer to an array',
          'A comment block describing a class'
        ],
        correctIndex: 1,
        explanation: 'A prototype informs the compiler of a function\'s interface so it can be called before its definition.'
      },
      {
        id: 'mcq-cpp-fn-3',
        question: 'What structure on the CPU call stack holds a function\'s local variables and return address?',
        options: ['Heap chunk', 'Activation record (Stack frame)', 'Global data segment', 'Cache line'],
        correctIndex: 1,
        explanation: 'Each function invocation allocates a stack frame to manage local parameters and return flow.'
      },
      {
        id: 'mcq-cpp-fn-4',
        question: 'What happens when a non-void function reaches its closing brace without a return statement?',
        options: [
          'It automatically returns 0',
          'It throws a compile-time warning or triggers Undefined Behavior at runtime',
          'It re-runs the function from the beginning',
          'It exits main'
        ],
        correctIndex: 1,
        explanation: 'Failing to return a value from a non-void function (except main) results in Undefined Behavior.'
      },
      {
        id: 'mcq-cpp-fn-5',
        question: 'What is the relationship between parameters and arguments?',
        options: [
          'Parameters are defined in the function signature; arguments are the values supplied during the call',
          'Arguments are in the signature; parameters are supplied during the call',
          'They are exact synonyms with zero difference',
          'Parameters are on the heap; arguments are on the stack'
        ],
        correctIndex: 0,
        explanation: 'Parameters are placeholders in function signatures; arguments are the actual values passed.'
      }
    ],
    codingChallenge: {
      title: 'Modular Addition Calculator',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program that defines a function int add(int a, int b) which returns a + b, and calls add(25, 17) to print "Sum: 42".',
      input_format: 'No input.',
      output_format: 'One line: "Sum: 42".',
      constraints: 'Must implement and call function add.',
      starter_code: `#include <iostream>

// Define int add(int a, int b)

int main() {
    // Call add and print result
    return 0;
}`,
      expected_output: `Sum: 42`,
      test_cases: [
        {
          input: '',
          expected_output: `Sum: 42`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Functions encapsulate logic into modular, testable units of code.',
      'Function prototypes inform the compiler of signatures prior to call sites.',
      'void functions perform side effects without yielding return values.',
      'Each call allocates a stack frame containing local variables and return addresses.'
    ]
  },

  // =========================================================================
  // LESSON 18: Function Parameters and Passing Mechanisms
  // =========================================================================
  {
    id: 'top-cpp-parameter-passing',
    number: 18,
    numberDisplay: '18',
    moduleId: 'mod-cpp-functions-memory',
    moduleTitle: 'Module 03: Functions, References & Memory Fundamentals',
    title: 'Function Parameters and Passing Mechanisms',
    slug: 'function-parameters-and-passing-mechanisms',
    language: 'cpp',
    shortDescription: 'Master parameter passing techniques: pass by value (copying), pass by reference (aliasing), pass by pointer, and const references for efficiency.',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    prerequisiteId: 'top-cpp-functions',
    learningObjectives: [
      'Contrast pass-by-value vs pass-by-reference at the physical memory level',
      'Modify caller variables from within a function using references (&)',
      'Eliminate expensive copying of large structures using const references (const &)',
      'Analyze memory diagrams of actual vs formal parameter stack frames'
    ],
    conceptExplanation: `### 1. The Three Parameter Passing Mechanisms
When passing arguments to a function, C++ supports three distinct mechanisms:

#### 1. Pass by Value (Default)
A complete byte-for-byte **copy** of the argument is placed into the function's stack frame.
* **Effect**: Changes made inside the function do NOT affect the caller's original variable.
* **Downside**: For large objects (like \`std::vector\` or big \`std::string\`), copying entire buffers hurts performance.

#### 2. Pass by Reference (\`Type&\`)
The function parameter becomes an **alias** (an alternative name) for the caller's original variable in memory.
* **Effect**: Modifications inside the function directly alter the original variable!
* **Benefit**: Zero copying overhead.

#### 3. Pass by Const Reference (\`const Type&\`) - The Modern C++ Gold Standard
Passes by reference for zero-copy speed, but the \`const\` qualifier strictly prevents the function from modifying the data.
* **Rule of Thumb**: Pass primitives (\`int\`, \`double\`, \`char\`, \`bool\`) by value; pass objects (\`std::string\`, \`std::vector\`, structs) by \`const &\`.

### 2. Memory Visualization
\`\`\`text
Pass by Value:
main() stack frame:      [ x = 10 ]  (Address: 0x100)
swap(int a) frame:       [ a = 10 ]  (Address: 0x200) -> Copy made! Mutating a leaves x unchanged.

Pass by Reference:
main() stack frame:      [ x = 10 ]  (Address: 0x100)
swap(int& a) frame:      [ a points directly to 0x100 ] -> Mutating a changes x!
\`\`\`

### 3. Classic Swap Problem
\`\`\`cpp
void swapByVal(int a, int b) {
    int temp = a; a = b; b = temp; // Only swaps local copies!
}

void swapByRef(int& a, int& b) {
    int temp = a; a = b; b = temp; // Swaps original variables!
}
\`\`\``,
    simpleExample: {
      code: `#include <iostream>

void doubleIt(int& val) {
    val *= 2; // Directly updates caller variable
}

int main() {
    int num = 25;
    doubleIt(num);
    std::cout << "Doubled: " << num << "\\n"; // 50
    return 0;
}`,
      explanation: 'Passes num by reference (&), allowing doubleIt to directly modify num to 50.'
    },
    syntax: `// Parameter Passing Signatures
void byValue(int x);          // Receives independent copy
void byReference(int& x);     // Receives mutable alias
void byConstRef(const std::string& s); // Zero-copy read-only`,
    codeExample: `#include <iostream>

// Pass by reference enables swapping
void swap(int& x, int& y) {
    int temp = x;
    x = y;
    y = temp;
}

int main() {
    int a = 100;
    int b = 200;

    std::cout << "=== Pass by Reference Swap ===" << std::endl;
    std::cout << "Before Swap: a = " << a << ", b = " << b << std::endl;
    
    swap(a, b);

    std::cout << "After Swap:  a = " << a << ", b = " << b << std::endl;
    return 0;
}`,
    expectedOutput: `=== Pass by Reference Swap ===
Before Swap: a = 100, b = 200
After Swap:  a = 200, b = 100`,
    stepByStep: [
      '1. Variables a = 100, b = 200 exist in main() stack frame.',
      '2. swap(a, b) binds reference parameter x to a and y to b.',
      '3. Temporary variable temp receives value of a (100).',
      '4. x = y writes 200 directly into memory location of a.',
      '5. y = temp writes 100 directly into memory location of b.',
      '6. Control returns to main(); swapped values are verified.'
    ],
    commonMistakes: [
      {
        mistake: 'Trying to pass by value and expecting caller variables to update',
        codeSnippet: `void increment(int x) { x++; }
int main() { int a = 5; increment(a); /* a is still 5! */ }`,
        correction: 'Use a reference: void increment(int& x) { x++; }',
        explanation: 'Pass-by-value only modifies the temporary stack copy inside the function.'
      },
      {
        mistake: 'Passing large collections like std::vector by value',
        codeSnippet: `void process(std::vector<int> data) { ... } // Copies all 1,000,000 items!`,
        correction: 'Pass by const reference: void process(const std::vector<int>& data)',
        explanation: 'Copying large containers burns memory bandwidth and triggers heap reallocations.'
      }
    ],
    realWorldExample: {
      scenario: 'Financial Portfolio Currency Exchange Revaluation',
      code: `#include <iostream>

void applyExchangeRate(double& assetValueUsd, double exchangeMultiplier) {
    assetValueUsd *= exchangeMultiplier;
}

int main() {
    double portfolioBalance = 10000.00;
    double eurToUsdRate = 1.08;

    applyExchangeRate(portfolioBalance, eurToUsdRate);
    std::cout << "Revalued Balance: $" << portfolioBalance << "\\n";
    return 0;
}`,
      explanation: 'Trading engines pass portfolio balances by reference to update ledger positions in-place without reallocation.'
    },
    practice: {
      prompt: 'Write a C++ program with a function void square(int& n) that squares the integer passed by reference. For n = 4, print "Squared: 16".',
      starterCode: `#include <iostream>

// Define void square(int& n)

int main() {
    int n = 4;
    // Call square and print result
    return 0;
}`,
      expectedOutputMatcher: 'Squared: 16',
      hint: 'void square(int& n) { n = n * n; } and call square(n);',
      solution: `#include <iostream>

void square(int& n) {
    n = n * n;
}

int main() {
    int n = 4;
    square(n);
    std::cout << "Squared: " << n << "\\n";
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-param-1',
        question: 'What happens to the caller\'s original variable when passed by value?',
        options: [
          'It is deleted',
          'It remains completely unchanged because the function operates on a local copy',
          'It is automatically set to 0',
          'It is converted to a pointer'
        ],
        correctIndex: 1,
        explanation: 'Pass by value copies the argument; local mutations have zero effect on the caller.'
      },
      {
        id: 'mcq-cpp-param-2',
        question: 'Which symbol in a parameter type declaration indicates pass by reference?',
        options: ['*', '&', '%', '$'],
        correctIndex: 1,
        explanation: 'The ampersand (&) declares a reference parameter.'
      },
      {
        id: 'mcq-cpp-param-3',
        question: 'Why should large std::string and std::vector objects typically be passed as "const Type&"?',
        options: [
          'To convert them to integers',
          'To avoid expensive buffer copying while guaranteeing the function cannot modify the data',
          'To make them compatible with C compilers',
          'Because by-value passing is illegal for vectors'
        ],
        correctIndex: 1,
        explanation: 'const Type& achieves zero-copy performance while preserving read-only safety guarantees.'
      },
      {
        id: 'mcq-cpp-param-4',
        question: 'If you want a function to modify two separate caller variables and return both, which mechanism is best?',
        options: ['Return statement with comma operator', 'Pass both variables by reference (&)', 'Print both to cout', 'Exit the program'],
        correctIndex: 1,
        explanation: 'Pass by reference allows functions to modify multiple caller variables as out-parameters.'
      },
      {
        id: 'mcq-cpp-param-5',
        question: 'What is the standard practice for passing small primitive types like int or double?',
        options: ['Always pass by const reference', 'Pass by value', 'Always pass by pointer', 'Pass as void'],
        correctIndex: 1,
        explanation: 'Primitive types fit in CPU registers (4 to 8 bytes), making pass-by-value faster and cheaper than pointer dereferencing.'
      }
    ],
    codingChallenge: {
      title: 'In-Place Value Doubler',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program with a function void doubleScore(int& score) that multiplies score by 2 in-place. With initial score = 50, call doubleScore(score) and print "Score: 100".',
      input_format: 'No input.',
      output_format: 'One line: "Score: 100".',
      constraints: 'Pass score by reference (&).',
      starter_code: `#include <iostream>

// Define void doubleScore(int& score)

int main() {
    int score = 50;
    // Double score and print
    return 0;
}`,
      expected_output: `Score: 100`,
      test_cases: [
        {
          input: '',
          expected_output: `Score: 100`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Pass by value makes a copy; modifications are restricted to the local function frame.',
      'Pass by reference (&) aliases the caller variable, enabling in-place mutations.',
      'Pass by const reference (const &) eliminates copy overhead for large objects without sacrificing safety.',
      'Pass small primitives by value; pass compound classes and vectors by const reference.'
    ]
  },

  // =========================================================================
  // LESSON 19: Function Overloading
  // =========================================================================
  {
    id: 'top-cpp-function-overloading',
    number: 19,
    numberDisplay: '19',
    moduleId: 'mod-cpp-functions-memory',
    moduleTitle: 'Module 03: Functions, References & Memory Fundamentals',
    title: 'Function Overloading',
    slug: 'function-overloading-in-cpp',
    language: 'cpp',
    shortDescription: 'Define multiple functions with the same name differentiated by parameter signatures, understand name mangling, resolution rules, and ambiguities.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-cpp-parameter-passing',
    learningObjectives: [
      'Define multiple functions sharing the same identifier with distinct parameter types or counts',
      'Explain compiler name mangling and compile-time function overload resolution',
      'Identify what constitutes an invalid overload (e.g., varying only by return type)',
      'Resolve ambiguous function calls and type promotion conflicts'
    ],
    conceptExplanation: `### 1. What is Function Overloading?
Function overloading is a core C++ feature where two or more functions in the same scope share the **exact same name**, provided their **parameter lists (signatures) are different**.
It enables intuitive API design: instead of writing \`addInt()\`, \`addDouble()\`, and \`addThreeInts()\`, you simply define \`add()\`.

### 2. How Overload Resolution Works
The C++ compiler decides which overloaded function to invoke based on:
1. **Number of parameters**:
   \`int compute(int x)\` vs \`int compute(int x, int y)\`.
2. **Types of parameters**:
   \`int print(int x)\` vs \`void print(double x)\` vs \`void print(std::string s)\`.
3. **Sequence of parameter types**:
   \`void display(int a, double b)\` vs \`void display(double a, int b)\`.

### 3. What Does NOT Differentiate an Overload?
Crucial Rule: **Functions CANNOT be overloaded based on return type alone!**
\`\`\`cpp
int calculate(int x);
double calculate(int x); // Compiler Error: cannot overload functions distinguished by return type alone
\`\`\`
*Reason*: When calling \`calculate(5);\`, the compiler cannot determine which function to execute if the return value is not assigned.

### 4. Name Mangling Under the Hood
How does the binary linker distinguish overloaded functions?
During compilation, C++ performs **Name Mangling** (decorating symbols). The compiler encodes the parameter types into the binary symbol name:
* \`add(int, int)\` might become \`_Z3addii\` in GCC.
* \`add(double, double)\` might become \`_Z3adddd\`.
At the linker level, each overloaded function has a completely unique symbol name!`,
    simpleExample: {
      code: `#include <iostream>

int add(int a, int b) { return a + b; }
double add(double a, double b) { return a + b; }

int main() {
    std::cout << "Int: " << add(3, 4) << ", Double: " << add(2.5, 1.5) << "\\n";
    return 0;
}`,
      explanation: 'Compiler selects the int version for (3, 4) and the double version for (2.5, 1.5).'
    },
    syntax: `// Overloaded Function Signatures
ReturnType func(Type1 a);
ReturnType func(Type2 a);
ReturnType func(Type1 a, Type2 b);`,
    codeExample: `#include <iostream>
#include <string>

// Overload 1: Two integers
int add(int a, int b) {
    return a + b;
}

// Overload 2: Three integers
int add(int a, int b, int c) {
    return a + b + c;
}

// Overload 3: Two floating-point doubles
double add(double a, double b) {
    return a + b;
}

int main() {
    std::cout << "=== Function Overloading in Action ===" << std::endl;
    std::cout << "add(10, 20):         " << add(10, 20) << std::endl;
    std::cout << "add(10, 20, 30):     " << add(10, 20, 30) << std::endl;
    std::cout << "add(4.5, 2.5):       " << add(4.5, 2.5) << std::endl;
    return 0;
}`,
    expectedOutput: `=== Function Overloading in Action ===
add(10, 20):         30
add(10, 20, 30):     60
add(4.5, 2.5):       7`,
    stepByStep: [
      '1. add(10, 20) passes two int literals; compiler binds to int add(int, int).',
      '2. add(10, 20, 30) matches signature with three parameters.',
      '3. add(4.5, 2.5) passes two double literals; compiler binds to double add(double, double).',
      '4. Output shows each tailored overload executing seamlessly.'
    ],
    commonMistakes: [
      {
        mistake: 'Overloading solely by return type',
        codeSnippet: `int getValue();
double getValue(); // Compiler Error: conflicting declaration`,
        correction: 'Ensure the parameter types or parameter count differs.',
        explanation: 'C++ overload resolution relies strictly on argument types at the call site.'
      },
      {
        mistake: 'Creating ambiguous overloads with implicit promotions',
        codeSnippet: `void print(int x);
void print(double x);
print(3.14f); // Compiler Error: call to 'print' is ambiguous (float can promote to int or double)`,
        correction: 'Provide an exact overload void print(float x) or cast: print(static_cast<double>(3.14f));',
        explanation: 'When multiple conversions are equally ranked, the compiler rejects the call as ambiguous.'
      }
    ],
    realWorldExample: {
      scenario: 'Game Engine Logging Diagnostic System',
      code: `#include <iostream>
#include <string>

void logEvent(const std::string& message) {
    std::cout << "[INFO] " << message << "\\n";
}

void logEvent(int errorCode, const std::string& message) {
    std::cout << "[ERR " << errorCode << "] " << message << "\\n";
}

int main() {
    logEvent("Physics Engine Initialized");
    logEvent(404, "Texture Asset Not Found");
    return 0;
}`,
      explanation: 'Production game SDKs overload loggers to accept simple strings, error codes, or timestamps cleanly.'
    },
    practice: {
      prompt: 'Write a C++ program that overloads multiply: int multiply(int a, int b) returning a * b, and int multiply(int a, int b, int c) returning a * b * c. Print "Result: 24" for multiply(2, 3, 4).',
      starterCode: `#include <iostream>

// Define overloaded multiply functions

int main() {
    // Call multiply(2, 3, 4) and print
    return 0;
}`,
      expectedOutputMatcher: 'Result: 24',
      hint: 'Define int multiply(int a, int b, int c) { return a * b * c; }',
      solution: `#include <iostream>

int multiply(int a, int b) {
    return a * b;
}

int multiply(int a, int b, int c) {
    return a * b * c;
}

int main() {
    std::cout << "Result: " << multiply(2, 3, 4) << "\\n";
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-over-1',
        question: 'Which of the following differences is NOT sufficient to overload a function in C++?',
        options: [
          'Different number of parameters',
          'Different types of parameters',
          'Different return type only',
          'Different order of parameter types'
        ],
        correctIndex: 2,
        explanation: 'Functions cannot be overloaded based on return type alone.'
      },
      {
        id: 'mcq-cpp-over-2',
        question: 'What process does the C++ compiler perform to encode parameter types into unique linker symbol names?',
        options: ['Bytecode compiling', 'Name mangling', 'Static linking', 'Garbage collection'],
        correctIndex: 1,
        explanation: 'Name mangling translates overloaded C++ function signatures into unique symbol strings for the linker.'
      },
      {
        id: 'mcq-cpp-over-3',
        question: 'When is function overload resolution performed in C++?',
        options: ['At runtime', 'At compile time', 'During operating system launch', 'When memory is freed'],
        correctIndex: 1,
        explanation: 'Overload resolution is resolved entirely at compile time with zero runtime overhead.'
      },
      {
        id: 'mcq-cpp-over-4',
        question: 'What happens if a call matches two overloaded functions equally well due to type conversions?',
        options: [
          'The first one declared is chosen',
          'The compiler emits an "ambiguous call" compilation error',
          'The program crashes with a segmentation fault',
          'A random function is selected'
        ],
        correctIndex: 1,
        explanation: 'Ambiguous calls cannot be resolved conclusively, triggering a compilation error.'
      },
      {
        id: 'mcq-cpp-over-5',
        question: 'Can a function with signature "void f(int x)" be overloaded with "void f(double x)"?',
        options: ['Yes, parameter types differ', 'No, names are identical', 'Only if declared in different files', 'Only in C++20'],
        correctIndex: 0,
        explanation: 'Yes, parameter types are distinct, which is the textbook condition for overloading.'
      }
    ],
    codingChallenge: {
      title: 'Area Calculator Overloads',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program with two overloaded functions: int area(int side) returning side * side (square), and int area(int len, int wid) returning len * wid (rectangle). Call area(6) and area(5, 4), and print "Square: 36, Rect: 20".',
      input_format: 'No input.',
      output_format: 'One line: "Square: 36, Rect: 20".',
      constraints: 'Define both area overloads.',
      starter_code: `#include <iostream>

// Define int area(int side) and int area(int len, int wid)

int main() {
    // Print combined result
    return 0;
}`,
      expected_output: `Square: 36, Rect: 20`,
      test_cases: [
        {
          input: '',
          expected_output: `Square: 36, Rect: 20`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Function overloading allows identical function names with varying parameter signatures.',
      'Differences must exist in parameter count, types, or ordering.',
      'Return types alone cannot be used to differentiate overloads.',
      'The compiler uses name mangling to create unique symbol identifiers at link time.'
    ]
  },

  // =========================================================================
  // LESSON 20: Scope and Lifetime
  // =========================================================================
  {
    id: 'top-cpp-scope-lifetime',
    number: 20,
    numberDisplay: '20',
    moduleId: 'mod-cpp-functions-memory',
    moduleTitle: 'Module 03: Functions, References & Memory Fundamentals',
    title: 'Scope and Lifetime',
    slug: 'scope-and-lifetime-in-cpp',
    language: 'cpp',
    shortDescription: 'Master local vs global scope, block scoping, static local variables, variable shadowing, and the scope resolution operator (::).',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-cpp-function-overloading',
    learningObjectives: [
      'Differentiate between scope (visibility) and lifetime (duration in memory)',
      'Analyze local, block, function, and global variable lifecycles',
      'Preserve state between function invocations using static local variables',
      'Access shadowed global variables using the scope resolution operator (::)'
    ],
    conceptExplanation: `### 1. Scope vs Lifetime: Fundamental Distinction
* **Scope (Visibility)**: The region of source code where a variable's identifier is recognized and accessible.
* **Lifetime (Storage Duration)**: The actual duration during program execution that a variable occupies physical memory.

### 2. Variable Scope Categories
1. **Local Scope**: Variables declared inside a function or block \`{ ... }\`. Accessible only within that block; created upon entry and destroyed upon exit.
2. **Global Scope**: Variables declared outside of all functions. Visible throughout the entire translation unit; created when the program boots and destroyed when it exits.
3. **Block Scope**: Variables declared inside loop or \`if\` blocks (\`for (int i = 0; ...)\`). Destroyed at the closing brace \`}\`.

### 3. Static Local Variables (\`static\`)
Normally, local variables are destroyed when their enclosing function returns.
However, declaring a local variable with the **\`static\`** keyword alters its lifetime:
* **Lifetime**: Persists for the **entire duration of the program** in the data segment.
* **Scope**: Remains restricted to the enclosing function.
* **Initialization**: Initialized strictly **once**, on the first call to that function!
\`\`\`cpp
void countCalls() {
    static int calls = 0; // Initialized ONCE
    calls++;
    std::cout << "Call count: " << calls << "\\n";
}
\`\`\`

### 4. Variable Shadowing & Scope Resolution (\`::\`)
When a local variable shares the exact same name as a global variable, the local variable **shadows** (hides) the global variable within its scope.
To explicitly access the hidden global variable, prefix it with the **scope resolution operator \`::\`**:
\`\`\`cpp
int count = 100; // Global

int main() {
    int count = 5; // Local shadows global
    std::cout << count;   // Prints 5 (local)
    std::cout << ::count; // Prints 100 (global via ::)
}
\`\`\``,
    simpleExample: {
      code: `#include <iostream>

void counter() {
    static int count = 0;
    count++;
    std::cout << count << " ";
}

int main() {
    counter(); counter(); counter(); // Prints 1 2 3
    std::cout << "\\n";
    return 0;
}`,
      explanation: 'static int count retains its updated value across multiple counter() function calls.'
    },
    syntax: `// Scope Resolution Syntax
::globalVariable; // Access global scope

void func() {
    static int persistentVar = 0; // Static lifetime
    int stackVar = 10;            // Automatic lifetime
}`,
    codeExample: `#include <iostream>

int systemId = 999; // Global scope

void invokeService() {
    static int executionCount = 0; // Retained across calls
    executionCount++;
    std::cout << "Service Invocation #" << executionCount << std::endl;
}

int main() {
    int systemId = 101; // Local shadows global systemId

    std::cout << "=== Scope & Shadowing Resolution ===" << std::endl;
    std::cout << "Local systemId:  " << systemId << std::endl;
    std::cout << "Global systemId: " << ::systemId << " (via ::)" << std::endl;

    invokeService();
    invokeService();
    return 0;
}`,
    expectedOutput: `=== Scope & Shadowing Resolution ===
Local systemId:  101
Global systemId: 999 (via ::)
Service Invocation #1
Service Invocation #2`,
    stepByStep: [
      '1. Global variable systemId is allocated in data segment with value 999.',
      '2. Local variable systemId allocated on main() stack frame with value 101, shadowing global.',
      '3. systemId accesses local 101; ::systemId reaches past scope to global 999.',
      '4. invokeService() increments static executionCount from 0 to 1.',
      '5. Second call retains executionCount = 1 and increments to 2.',
      '6. Program finishes cleanly.'
    ],
    commonMistakes: [
      {
        mistake: 'Assuming local variables retain values between calls without static',
        codeSnippet: `void track() { int hits = 0; hits++; } // hits is recreated as 0 every time!`,
        correction: 'Mark it static: static int hits = 0;',
        explanation: 'Automatic stack variables are destroyed upon function exit and reallocated on next entry.'
      },
      {
        mistake: 'Accidental variable shadowing leading to subtle bugs',
        codeSnippet: `int total = 100;
void add() { int total = 0; total += 50; } // Global total remains 100!`,
        correction: 'Do not redeclare total inside add if modifying the global variable was intended.',
        explanation: 'Declaring a new local variable with the same name masks the outer variable completely.'
      }
    ],
    realWorldExample: {
      scenario: 'Unique Transaction ID Generator Microservice',
      code: `#include <iostream>

int generateNextTransactionId() {
    static int currentId = 5000;
    return ++currentId;
}

int main() {
    std::cout << "TX 1: " << generateNextTransactionId() << "\\n";
    std::cout << "TX 2: " << generateNextTransactionId() << "\\n";
    std::cout << "TX 3: " << generateNextTransactionId() << "\\n";
    return 0;
}`,
      explanation: 'Generators and stateful tickers use static local variables to guarantee monotonically increasing unique IDs.'
    },
    practice: {
      prompt: 'Write a C++ program that accesses a global int version = 2 using ::version inside main, printing "Global: 2".',
      starterCode: `#include <iostream>

int version = 2;

int main() {
    // Print global version using ::
    return 0;
}`,
      expectedOutputMatcher: 'Global: 2',
      hint: 'std::cout << "Global: " << ::version << "\\n";',
      solution: `#include <iostream>

int version = 2;

int main() {
    std::cout << "Global: " << ::version << "\\n";
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-scope-1',
        question: 'What is the lifetime of a regular automatic local variable inside a function?',
        options: [
          'From program start to program termination',
          'From when its declaration is executed until the enclosing block is exited',
          'Until the computer is rebooted',
          'Infinite'
        ],
        correctIndex: 1,
        explanation: 'Automatic local variables exist on the stack only while execution resides within their block.'
      },
      {
        id: 'mcq-cpp-scope-2',
        question: 'What happens to a local variable declared with the "static" keyword when its function exits?',
        options: [
          'It is deleted and re-initialized on the next call',
          'It retains its value in memory throughout the lifetime of the entire program',
          'It becomes a global variable accessible by any function',
          'It causes a memory leak error'
        ],
        correctIndex: 1,
        explanation: 'static local variables retain their values across function invocations for the duration of the program.'
      },
      {
        id: 'mcq-cpp-scope-3',
        question: 'Which operator allows accessing a global variable that is currently shadowed by a local variable?',
        options: ['->', '::', '.', '@'],
        correctIndex: 1,
        explanation: 'The unary scope resolution operator (::) accesses identifiers in the global namespace.'
      },
      {
        id: 'mcq-cpp-scope-4',
        question: 'How many times is a static local variable initialized during program execution?',
        options: ['Every time the function is called', 'Exactly once, on the first call to the function', 'Twice', 'Never'],
        correctIndex: 1,
        explanation: 'Initialization of static local variables occurs strictly once on the initial execution pass.'
      },
      {
        id: 'mcq-cpp-scope-5',
        question: 'What is "variable shadowing"?',
        options: [
          'When a variable is copied to the cloud',
          'When a local variable shares the name of an outer variable, temporarily hiding the outer one',
          'When two pointers reference the same memory',
          'When a variable is deleted by garbage collection'
        ],
        correctIndex: 1,
        explanation: 'Shadowing occurs when an inner scope identifier masks visibility of an outer scope identifier.'
      }
    ],
    codingChallenge: {
      title: 'Persistent Hit Counter',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program with a function void hit() containing a static int count = 0 that increments and prints count. Call hit() twice and output "Hit: 1" and "Hit: 2" on separate lines.',
      input_format: 'No input.',
      output_format: 'Two lines: "Hit: 1" then "Hit: 2".',
      constraints: 'Use static local variable inside hit().',
      starter_code: `#include <iostream>

// Define void hit() with static int count

int main() {
    // Call hit() twice
    return 0;
}`,
      expected_output: `Hit: 1\nHit: 2`,
      test_cases: [
        {
          input: '',
          expected_output: `Hit: 1\nHit: 2`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Scope governs visibility in code; lifetime dictates memory duration in execution.',
      'Automatic local stack variables are destroyed upon leaving their enclosing block.',
      'static local variables persist in memory across multiple function calls.',
      'The scope resolution operator (::) accesses global variables hidden by shadowing.'
    ]
  },

  // =========================================================================
  // LESSON 21: Introduction to References
  // =========================================================================
  {
    id: 'top-cpp-references',
    number: 21,
    numberDisplay: '21',
    moduleId: 'mod-cpp-functions-memory',
    moduleTitle: 'Module 03: Functions, References & Memory Fundamentals',
    title: 'Introduction to References',
    slug: 'introduction-to-references-in-cpp',
    language: 'cpp',
    shortDescription: 'Master C++ reference mechanics: aliases, binding rules, modifying values via references, references vs pointers, and const references.',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    prerequisiteId: 'top-cpp-scope-lifetime',
    learningObjectives: [
      'Define what a reference is as a permanent alias for an existing variable',
      'Explain the fundamental binding rules: must be initialized, cannot be null, and cannot be reseated',
      'Modify variable values indirectly through reference aliases',
      'Differentiate references from raw pointers in syntax, safety, and semantics'
    ],
    conceptExplanation: `### 1. What is a Reference?
In C++, a **reference** is an alias—an alternative name for an already-existing object in memory.
Once a reference is initialized, all operations applied to the reference affect the original object it aliases:
\`\`\`cpp
int original = 42;
int& ref = original; // ref is an alias for original

ref = 100; // original is now 100!
\`\`\`

### 2. The Three Invariant Rules of References
Unlike pointers, references are designed to be safer and simpler:
1. **Must be initialized upon declaration**: You cannot have an uninitialized reference (\`int& r;\` is a compiler error).
2. **Cannot be NULL**: A reference must always refer to a legitimate object.
3. **Cannot be reseated (rebound)**: Once a reference is bound to a variable, it cannot be changed to refer to another variable. Writing \`ref = other;\` assigns the *value* of \`other\` to the original variable!

### 3. References vs Pointers
| Feature | Reference (\`Type&\`) | Pointer (\`Type*\`) |
| :--- | :--- | :--- |
| **Syntax** | Clean dot/direct access (\`ref\`) | Requires dereferencing (\`*ptr\`) |
| **Nullability** | Cannot be null | Can be \`nullptr\` |
| **Rebinding** | Bound permanently to one object | Can be reassigned to point anywhere |
| **Initialization** | Mandatory upon declaration | Optional (can be initialized later) |
| **Arithmetic** | No arithmetic operations | Supports pointer arithmetic (\`ptr++\`) |

### 4. Const References
A reference to a const object cannot modify the underlying value:
\`\`\`cpp
int x = 50;
const int& ref = x;
// ref = 60; // Compiler Error: assignment of read-only reference
\`\`\`
Const references can also bind to temporary **rvalue literals** (\`const int& r = 10;\`), extending the lifetime of the temporary!`,
    simpleExample: {
      code: `#include <iostream>

int main() {
    int score = 75;
    int& scoreRef = score; // Alias

    scoreRef += 10;
    std::cout << "Original Score: " << score << "\\n"; // 85
    return 0;
}`,
      explanation: 'Mutating scoreRef directly alters the original variable score.'
    },
    syntax: `// Reference Declaration
Type original = value;
Type& referenceName = original;       // Mutable alias
const Type& readOnly = original;      // Const alias`,
    codeExample: `#include <iostream>

int main() {
    int originalValue = 10;
    int& ref = originalValue;

    std::cout << "=== C++ Reference Aliasing ===" << std::endl;
    std::cout << "Original Value:  " << originalValue << std::endl;
    std::cout << "Reference Value: " << ref << std::endl;

    // Mutate through reference
    ref = 50;

    std::cout << "\\nAfter ref = 50:" << std::endl;
    std::cout << "Original Value:  " << originalValue << " (Updated!)" << std::endl;
    std::cout << "Reference Value: " << ref << std::endl;

    // Both share the exact same memory address!
    std::cout << "\\nMemory Addresses:" << std::endl;
    std::cout << "&originalValue:  " << &originalValue << std::endl;
    std::cout << "&ref:            " << &ref << " (Identical!)" << std::endl;
    return 0;
}`,
    expectedOutput: `=== C++ Reference Aliasing ===
Original Value:  10
Reference Value: 10

After ref = 50:
Original Value:  50 (Updated!)
Reference Value: 50`,
    stepByStep: [
      '1. originalValue allocated at memory address with value 10.',
      '2. int& ref binds permanently as an alias to originalValue.',
      '3. Reading ref reads the memory of originalValue.',
      '4. Assigning ref = 50 writes 50 directly to originalValue address.',
      '5. Querying &originalValue and &ref reveals they share the identical address.'
    ],
    commonMistakes: [
      {
        mistake: 'Declaring an uninitialized reference',
        codeSnippet: `int& ref; // Compiler Error: 'ref' declared as reference but not initialized`,
        correction: 'Always bind a reference upon creation: int& ref = original;',
        explanation: 'A reference is not an independent storage object; it is an alias and must have a target.'
      },
      {
        mistake: 'Attempting to reseat a reference',
        codeSnippet: `int a = 1, b = 2;
int& ref = a;
ref = b; // Does NOT rebind ref to b! Assigns value of b into a!`,
        correction: 'If you need to change targets at runtime, use a pointer (Type*) instead of a reference.',
        explanation: 'References cannot be rebound after initialization.'
      },
      {
        mistake: 'Returning a reference to a local stack variable',
        codeSnippet: `int& getNumber() {
    int temp = 42;
    return temp; // Undefined Behavior: temp is destroyed upon function return!
}`,
        correction: 'Return by value (int) or return reference to an object with lifetime exceeding the call.',
        explanation: 'Dangling references point to destroyed stack memory.'
      }
    ],
    realWorldExample: {
      scenario: 'High-Performance Graphics Viewport Camera State Reference',
      code: `#include <iostream>

struct Camera {
    double x, y, z;
};

void panRight(Camera& cam, double delta) {
    cam.x += delta;
}

int main() {
    Camera mainCam{0.0, 10.0, 50.0};
    panRight(mainCam, 5.0);
    std::cout << "Camera Pos: (" << mainCam.x << ", " << mainCam.y << ", " << mainCam.z << ")\\n";
    return 0;
}`,
      explanation: '3D game engines pass camera and actor transforms by reference to update graphics matrices in real time.'
    },
    practice: {
      prompt: 'Write a C++ program that declares int x = 5, an alias int& ref = x, multiplies ref by 3, and prints "Value: 15".',
      starterCode: `#include <iostream>

int main() {
    int x = 5;
    // Create reference, multiply by 3, and print
    return 0;
}`,
      expectedOutputMatcher: 'Value: 15',
      hint: 'int& ref = x; ref *= 3; std::cout << "Value: " << x << "\\n";',
      solution: `#include <iostream>

int main() {
    int x = 5;
    int& ref = x;
    ref *= 3;
    std::cout << "Value: " << x << "\\n";
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-ref-1',
        question: 'What is a reference in C++?',
        options: [
          'A copy of a variable stored on the heap',
          'An alias (alternative name) for an existing variable',
          'A special floating point number',
          'A pointer that can be null'
        ],
        correctIndex: 1,
        explanation: 'A reference is an alias bound to an existing object.'
      },
      {
        id: 'mcq-cpp-ref-2',
        question: 'Which of the following is an invariant rule for C++ references?',
        options: [
          'References can be reassigned to different objects at runtime',
          'References must be initialized upon declaration and cannot be null',
          'References always consume 16 bytes of memory',
          'References cannot be used as function arguments'
        ],
        correctIndex: 1,
        explanation: 'References must be initialized upon declaration and cannot be null or rebound.'
      },
      {
        id: 'mcq-cpp-ref-3',
        question: 'What happens if you execute "int& ref;" without initialization?',
        options: [
          'It defaults to pointing to 0',
          'A compiler error is generated',
          'It is allocated on the heap',
          'A runtime segmentation fault occurs'
        ],
        correctIndex: 1,
        explanation: 'The C++ compiler requires every reference to be initialized upon declaration.'
      },
      {
        id: 'mcq-cpp-ref-4',
        question: 'What is the danger of returning a reference to a local stack variable from a function?',
        options: [
          'It doubles function execution time',
          'It produces a dangling reference to destroyed stack memory, causing undefined behavior',
          'It converts the reference into a pointer',
          'It causes a linker error'
        ],
        correctIndex: 1,
        explanation: 'Stack memory is reclaimed when the function returns, leaving the reference dangling.'
      },
      {
        id: 'mcq-cpp-ref-5',
        question: 'If you write "ref = b;" where ref is an existing reference to a, what occurs?',
        options: [
          'ref is rebound to alias b',
          'The value of b is copied into the variable a that ref aliases',
          'b is deleted',
          'A syntax error is thrown'
        ],
        correctIndex: 1,
        explanation: 'References cannot be rebound; assigning to a reference assigns the value to the aliased variable.'
      }
    ],
    codingChallenge: {
      title: 'Reference Mutation Verify',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program that initializes int energy = 80, binds int& energyRef = energy, adds 20 through energyRef, and prints "Energy: 100".',
      input_format: 'No input.',
      output_format: 'One line: "Energy: 100".',
      constraints: 'Mutate energy via energyRef.',
      starter_code: `#include <iostream>

int main() {
    int energy = 80;
    // Bind reference, add 20, and print energy
    return 0;
}`,
      expected_output: `Energy: 100`,
      test_cases: [
        {
          input: '',
          expected_output: `Energy: 100`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'A reference is an immutable alias bound permanently to an existing memory location.',
      'References must be initialized upon declaration and cannot be null or rebound.',
      'Modifying a reference directly modifies the aliased original object.',
      'Never return references to local stack variables that expire at function termination.'
    ]
  },

  // =========================================================================
  // LESSON 22: Introduction to Pointers
  // =========================================================================
  {
    id: 'top-cpp-pointers',
    number: 22,
    numberDisplay: '22',
    moduleId: 'mod-cpp-functions-memory',
    moduleTitle: 'Module 03: Functions, References & Memory Fundamentals',
    title: 'Introduction to Pointers',
    slug: 'introduction-to-pointers-in-cpp',
    language: 'cpp',
    shortDescription: 'Unpack low-level hardware memory: memory addresses, address-of (&), dereference (*), nullptr safety, pointer arithmetic, and pointers with arrays.',
    difficulty: 'Beginner',
    estimatedMinutes: 30,
    prerequisiteId: 'top-cpp-references',
    learningObjectives: [
      'Differentiate between a variable\'s stored value and its physical hardware memory address',
      'Use the address-of operator (&) and dereference operator (*) to inspect and mutate memory',
      'Initialize pointers safely using modern C++11 nullptr instead of raw NULL or 0',
      'Explain pointer arithmetic and the relationship between pointers and contiguous arrays'
    ],
    conceptExplanation: `### 1. What is a Pointer?
A **pointer** is a variable that stores the **memory address** of another variable as its value.
Every byte in computer RAM has a unique numerical address (expressed in hexadecimal, e.g., \`0x7ffeefbff568\`).
* A regular integer \`int x = 42;\` stores the number \`42\`.
* A pointer \`int* ptr = &x;\` stores the *address* where \`42\` lives.

### 2. The Two Essential Pointer Operators
1. **Address-Of Operator (\`&\`)**:
   Returns the memory address of its operand.
   \`\`\`cpp
   int score = 95;
   int* ptr = &score; // ptr holds address of score
   \`\`\`
2. **Dereference Operator (\`*\`)**:
   Reads or modifies the value stored at the address pointed to by the pointer.
   \`\`\`cpp
   *ptr = 100; // Directly writes 100 into score!
   std::cout << *ptr; // Prints 100
   \`\`\`

### 3. Null Pointers & Modern \`nullptr\` (C++11)
A pointer that does not currently point to valid memory should always be initialized to **\`nullptr\`**:
\`\`\`cpp
int* p = nullptr; // Modern C++11 safe null pointer
\`\`\`
* *Why \`nullptr\`*: In older C/C++, developers used \`NULL\` or \`0\`. Because \`0\` is an integer, it caused ambiguous function overloads. \`nullptr\` has its own strongly typed type \`std::nullptr_t\` that cannot be confused with integers.
* **Safety Rule**: Always verify \`if (p != nullptr)\` before dereferencing to prevent segmentation faults!

### 4. Pointers & Arrays: Decay & Pointer Arithmetic
In C++, an array name decays into a pointer to its first element:
\`\`\`cpp
int arr[] = {10, 20, 30};
int* p = arr; // p points to arr[0]

// Pointer arithmetic increments by sizeof(Type) bytes:
p++; // Now p points to arr[1] (20)!
\`\`\``,
    simpleExample: {
      code: `#include <iostream>

int main() {
    int val = 50;
    int* ptr = &val;

    std::cout << "Value via pointer: " << *ptr << "\\n"; // 50
    *ptr = 75;
    std::cout << "Updated original:  " << val << "\\n";  // 75
    return 0;
}`,
      explanation: 'Uses &val to obtain address and *ptr to dereference and modify val.'
    },
    syntax: `// Pointer Syntax
Type* pointerName = nullptr;  // Null pointer declaration
pointerName = &variable;      // Store address
*pointerName = newValue;      // Dereference to write value`,
    codeExample: `#include <iostream>

int main() {
    int count = 10;
    int* ptr = &count;

    std::cout << "=== Pointer Mechanics ===" << std::endl;
    std::cout << "Direct Value (count): " << count << std::endl;
    std::cout << "Memory Address (&count): " << &count << std::endl;
    std::cout << "Pointer Value (ptr):     " << ptr << std::endl;
    std::cout << "Dereferenced (*ptr):     " << *ptr << std::endl;

    // Mutate via pointer
    *ptr = 250;
    std::cout << "\\nAfter *ptr = 250:" << std::endl;
    std::cout << "New count value: " << count << std::endl;
    return 0;
}`,
    expectedOutput: `=== Pointer Mechanics ===
Direct Value (count): 10
Dereferenced (*ptr):     10

After *ptr = 250:
New count value: 250`,
    stepByStep: [
      '1. Variable count is allocated on stack initialized to 10.',
      '2. &count returns its physical RAM address.',
      '3. Pointer variable ptr stores this address.',
      '4. *ptr accesses memory at that address, reading 10.',
      '5. *ptr = 250 writes 250 directly into that location, updating count.',
      '6. New value 250 verified via count.'
    ],
    commonMistakes: [
      {
        mistake: 'Dereferencing a nullptr or uninitialized wild pointer',
        codeSnippet: `int* p; // Wild pointer (contains garbage address)
*p = 10; // Crash: Segmentation fault! Writing to arbitrary memory!`,
        correction: 'Always initialize pointers: int* p = nullptr; and check before use: if (p) { ... }',
        explanation: 'Dereferencing invalid memory violates OS page permissions and crashes the application.'
      },
      {
        mistake: 'Confusing pointer declaration * with dereferencing *',
        codeSnippet: `int* p = &x; // Here * is part of the type declaration: "pointer to int"
*p = 20;     // Here * is the dereference operator: "value at address p"`,
        correction: 'Keep the syntax distinct in your mental model.',
        explanation: 'The asterisk symbol serves two distinct syntactic roles in C++.'
      }
    ],
    realWorldExample: {
      scenario: 'Operating System Memory-Mapped I/O Hardware Control',
      code: `#include <iostream>

int main() {
    int hardwareRegister = 0x00; // Simulated device register
    int* mmioPtr = &hardwareRegister;

    // Set bit 2 (Power on peripheral)
    *mmioPtr |= (1 << 2);

    std::cout << "Hardware Register State: 0x0" << std::hex << *mmioPtr << "\\n";
    return 0;
}`,
      explanation: 'Embedded operating systems use pointers to manipulate hardware device registers mapped into physical memory.'
    },
    practice: {
      prompt: 'Write a C++ program that declares int num = 30, creates a pointer int* p = &num, updates the value to 90 using *p, and prints "Value: 90".',
      starterCode: `#include <iostream>

int main() {
    int num = 30;
    // Create pointer, update to 90, and print
    return 0;
}`,
      expectedOutputMatcher: 'Value: 90',
      hint: 'int* p = &num; *p = 90; std::cout << "Value: " << num << "\\n";',
      solution: `#include <iostream>

int main() {
    int num = 30;
    int* p = &num;
    *p = 90;
    std::cout << "Value: " << num << "\\n";
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-ptr-1',
        question: 'What does a pointer variable store?',
        options: ['A floating point number', 'The memory address of another variable', 'A string literal', 'The compiler version'],
        correctIndex: 1,
        explanation: 'A pointer stores the physical RAM address of an object.'
      },
      {
        id: 'mcq-cpp-ptr-2',
        question: 'Which operator is used to obtain the memory address of an existing variable?',
        options: ['*', '&', '->', '::'],
        correctIndex: 1,
        explanation: 'The address-of operator (&) retrieves the memory address of an operand.'
      },
      {
        id: 'mcq-cpp-ptr-3',
        question: 'What is the action of accessing the data stored at the address contained in a pointer called?',
        options: ['Mangling', 'Dereferencing', 'Compiling', 'Overloading'],
        correctIndex: 1,
        explanation: 'Dereferencing (using unary *) accesses the target object pointed to by the pointer.'
      },
      {
        id: 'mcq-cpp-ptr-4',
        question: 'What is the modern C++11 keyword for a null pointer?',
        options: ['NULL', '0', 'nullptr', 'nil'],
        correctIndex: 2,
        explanation: 'nullptr is the strongly typed null pointer literal introduced in C++11.'
      },
      {
        id: 'mcq-cpp-ptr-5',
        question: 'What fatal error occurs when you attempt to dereference a nullptr (*ptr)?',
        options: [
          'It returns 0 safely',
          'A segmentation fault (access violation crash) occurs at runtime',
          'The computer restarts',
          'A compiler warning is printed to std::clog'
        ],
        correctIndex: 1,
        explanation: 'Address 0 is protected by the operating system MMU; attempting to access it triggers a segmentation fault crash.'
      }
    ],
    codingChallenge: {
      title: 'Pointer Mutation Verification',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program with int val = 15, int* p = &val. Update val to 45 by dereferencing p, and print "Result: 45".',
      input_format: 'No input.',
      output_format: 'One line: "Result: 45".',
      constraints: 'Mutate val via *p.',
      starter_code: `#include <iostream>

int main() {
    int val = 15;
    // Use pointer to update val to 45 and print
    return 0;
}`,
      expected_output: `Result: 45`,
      test_cases: [
        {
          input: '',
          expected_output: `Result: 45`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Pointers store memory addresses of objects in RAM.',
      '& extracts an address; * dereferences an address to access or mutate values.',
      'Always initialize pointers with nullptr to guard against wild pointer memory corruption.',
      'Never dereference a pointer without checking for nullptr first.'
    ]
  },

  // =========================================================================
  // LESSON 23: Dynamic Memory Allocation
  // =========================================================================
  {
    id: 'top-cpp-dynamic-memory',
    number: 23,
    numberDisplay: '23',
    moduleId: 'mod-cpp-functions-memory',
    moduleTitle: 'Module 03: Functions, References & Memory Fundamentals',
    title: 'Dynamic Memory Allocation',
    slug: 'dynamic-memory-allocation-in-cpp',
    language: 'cpp',
    shortDescription: 'Master manual heap management: stack vs heap, new and delete operators, dynamic arrays, memory leaks, dangling pointers, and smart pointers.',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    prerequisiteId: 'top-cpp-pointers',
    learningObjectives: [
      'Contrast stack memory vs heap (free store) memory management models',
      'Allocate and deallocate single objects and dynamic arrays using new, delete, and delete[]',
      'Identify and eliminate critical memory leaks and dangling pointer vulnerabilities',
      'Understand Modern C++ RAII philosophy and introduce std::unique_ptr smart pointers'
    ],
    conceptExplanation: `### 1. Stack vs Heap (Free Store) Memory
A C++ application organizes memory into two primary runtime zones:
* **The Stack**:
  * Managed automatically by the CPU architecture.
  * Very fast allocation and deallocation (moving the stack pointer register).
  * Fixed, limited size (typically 1-8 MB).
  * Variables are destroyed automatically when their block ends.
* **The Heap (Free Store)**:
  * Managed manually by the programmer (or smart pointers).
  * Vast memory pool (limited only by available system RAM and virtual memory).
  * Slower allocation via OS memory allocators.
  * Memory remains allocated until **explicitly deleted**!

### 2. The \`new\` and \`delete\` Operators
* **Single Object Allocation**:
  \`\`\`cpp
  int* ptr = new int(42); // Allocates 4 bytes on heap, sets to 42
  std::cout << *ptr;
  delete ptr;             // Releases memory back to heap
  ptr = nullptr;          // Prevent dangling pointer
  \`\`\`
* **Dynamic Array Allocation**:
  \`\`\`cpp
  int size = 100;
  int* arr = new int[size]; // Allocates contiguous dynamic array
  arr[0] = 5;
  delete[] arr;             // MUST use delete[] for array allocations!
  arr = nullptr;
  \`\`\`

### 3. Critical Memory Hazards
1. **Memory Leak**: Allocating heap memory with \`new\` but failing to call \`delete\`. The memory remains occupied until the process terminates, consuming RAM.
2. **Dangling Pointer**: A pointer that still holds the memory address of an object that has already been \`delete\`d. Dereferencing it results in undefined behavior!
3. **Double Free**: Calling \`delete\` on the same pointer twice, corrupting the heap allocator's internal free-list.

### 4. Modern C++ Solution: RAII & Smart Pointers
Modern C++ advocates **RAII (Resource Acquisition Is Initialization)**: wrap heap pointers in smart pointer objects like **\`std::unique_ptr\`** (from \`<memory>\`). When the smart pointer leaves scope, its destructor automatically calls \`delete\`, eliminating memory leaks completely!`,
    simpleExample: {
      code: `#include <iostream>

int main() {
    int* p = new int(100);
    std::cout << "Heap Value: " << *p << "\\n";
    delete p; // Free memory
    p = nullptr;
    return 0;
}`,
      explanation: 'Allocates an integer on heap, accesses it, deallocates with delete, and clears pointer.'
    },
    syntax: `// Dynamic Allocation Syntax
Type* p = new Type(initValue);
delete p;
p = nullptr;

Type* arr = new Type[size];
delete[] arr; // Note the brackets!
arr = nullptr;`,
    codeExample: `#include <iostream>

int main() {
    // Dynamically allocate an array whose size is determined at runtime
    int count = 3;
    int* dynamicArr = new int[count];

    dynamicArr[0] = 10;
    dynamicArr[1] = 20;
    dynamicArr[2] = 30;

    std::cout << "=== Dynamic Heap Memory Array ===" << std::endl;
    for (int i = 0; i < count; i++) {
        std::cout << "Item " << i << ": " << dynamicArr[i] << std::endl;
    }

    // Clean up heap allocation
    delete[] dynamicArr;
    dynamicArr = nullptr;

    std::cout << "Heap Memory Safely Deallocated" << std::endl;
    return 0;
}`,
    expectedOutput: `=== Dynamic Heap Memory Array ===
Item 0: 10
Item 1: 20
Item 2: 30
Heap Memory Safely Deallocated`,
    stepByStep: [
      '1. new int[count] allocates 3 integers (12 bytes) on the heap.',
      '2. Pointer dynamicArr receives the starting base address of the heap block.',
      '3. Elements are populated and read using array index syntax.',
      '4. delete[] dynamicArr informs heap allocator to reclaim the block.',
      '5. dynamicArr is set to nullptr to eliminate dangling reference.',
      '6. Program exits cleanly with zero memory leaks.'
    ],
    commonMistakes: [
      {
        mistake: 'Using delete instead of delete[] on an array',
        codeSnippet: `int* arr = new int[50];
delete arr; // Undefined Behavior: missing brackets []!`,
        correction: 'Always pair new[] with delete[]: delete[] arr;',
        explanation: 'delete only destroys the first element; delete[] invokes destructors and deallocates the whole array.'
      },
      {
        mistake: 'Forgetting to set pointer to nullptr after delete',
        codeSnippet: `delete p;
// p still holds the old address! Accidentally using *p causes a crash!`,
        correction: 'Immediately assign p = nullptr; after delete p;',
        explanation: 'Clearing pointers prevents accidental dangling pointer dereferences.'
      },
      {
        mistake: 'Memory leak by overwriting pointer before deleting',
        codeSnippet: `int* p = new int(10);
p = new int(20); // Memory leak! The memory for 10 is lost forever!`,
        correction: 'Always delete the existing allocation before reassigning: delete p; p = new int(20);',
        explanation: 'Overwriting the pointer discards the only reference to the allocated heap memory.'
      }
    ],
    realWorldExample: {
      scenario: 'High-Resolution Audio Buffer Dynamic Stream Allocation',
      code: `#include <iostream>

int main() {
    int sampleRate = 48000; // 48 kHz audio
    float* audioBuffer = new float[sampleRate];

    audioBuffer[0] = 0.0f;
    audioBuffer[sampleRate - 1] = 0.99f;

    std::cout << "Audio Buffer Allocated: " << sampleRate << " samples ("
              << (sampleRate * sizeof(float)) / 1024 << " KB on Heap)\\n";

    delete[] audioBuffer;
    audioBuffer = nullptr;
    std::cout << "Audio Buffer Released\\n";
    return 0;
}`,
      explanation: 'Digital audio workstations dynamically allocate large PCM sample buffers on the heap rather than overflowing the stack.'
    },
    practice: {
      prompt: 'Write a C++ program that dynamically allocates an integer with value 77 on the heap, prints "Heap: 77", deallocates it with delete, and sets the pointer to nullptr.',
      starterCode: `#include <iostream>

int main() {
    // Allocate, print, delete, and clear pointer
    return 0;
}`,
      expectedOutputMatcher: 'Heap: 77',
      hint: 'int* p = new int(77); std::cout << "Heap: " << *p << "\\n"; delete p; p = nullptr;',
      solution: `#include <iostream>

int main() {
    int* p = new int(77);
    std::cout << "Heap: " << *p << "\\n";
    delete p;
    p = nullptr;
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-dyn-1',
        question: 'Which C++ operator allocates memory dynamically on the heap (free store)?',
        options: ['malloc', 'new', 'alloc', 'create'],
        correctIndex: 1,
        explanation: 'new is the C++ operator that allocates heap memory and calls constructors.'
      },
      {
        id: 'mcq-cpp-dyn-2',
        question: 'Which operator must be used to deallocate a dynamic array allocated with "new Type[N]"?',
        options: ['delete', 'delete[]', 'free()', 'remove'],
        correctIndex: 1,
        explanation: 'delete[] must be used to properly deallocate dynamic array allocations.'
      },
      {
        id: 'mcq-cpp-dyn-3',
        question: 'What is a "memory leak"?',
        options: [
          'A hardware malfunction where RAM loses electrical charge',
          'Heap memory allocated with new that is never freed with delete, wasting system memory',
          'When stack variables exceed 1 MB',
          'A compilation warning'
        ],
        correctIndex: 1,
        explanation: 'Failing to deallocate heap memory creates a memory leak that consumes RAM until process exit.'
      },
      {
        id: 'mcq-cpp-dyn-4',
        question: 'What is a "dangling pointer"?',
        options: [
          'A pointer that points to memory that has already been deallocated',
          'A pointer set to nullptr',
          'A pointer stored in an array',
          'A pointer inside a while loop'
        ],
        correctIndex: 0,
        explanation: 'A dangling pointer retains an address to memory that was freed, risking data corruption if dereferenced.'
      },
      {
        id: 'mcq-cpp-dyn-5',
        question: 'What core C++ principle states that resource ownership should be bound to object lifetimes?',
        options: ['OOP', 'RAII (Resource Acquisition Is Initialization)', 'AOT', 'WORA'],
        correctIndex: 1,
        explanation: 'RAII binds resource allocation to object constructors and deallocation to destructors for automatic cleanup.'
      }
    ],
    codingChallenge: {
      title: 'Heap Buffer Safe Lifecycle',
      difficulty: 'Beginner',
      problem_statement: 'Write a C++ program that dynamically allocates a 2-element integer array on the heap with values 100 and 200, prints "Total: 300", frees the memory using delete[], and sets the pointer to nullptr.',
      input_format: 'No input.',
      output_format: 'One line: "Total: 300".',
      constraints: 'Use new[] and delete[].',
      starter_code: `#include <iostream>

int main() {
    // Dynamically allocate array of size 2, sum, print, and clean up
    return 0;
}`,
      expected_output: `Total: 300`,
      test_cases: [
        {
          input: '',
          expected_output: `Total: 300`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Stack memory is fast and automatic; heap memory is large and manually managed.',
      'new allocates single objects; delete deallocates them.',
      'new[] allocates dynamic arrays; delete[] must be used to release them.',
      'Prevent memory leaks and dangling pointers by pairing every new with delete and resetting pointers to nullptr.'
    ]
  },

  // =========================================================================
  // LESSON 24: Final Mini Project – Student Management System
  // =========================================================================
  {
    id: 'top-cpp-student-management-project',
    number: 24,
    numberDisplay: '24',
    moduleId: 'mod-cpp-functions-memory',
    moduleTitle: 'Module 03: Functions, References & Memory Fundamentals',
    title: 'Final Mini Project: Student Management System',
    slug: 'final-mini-project-student-management-system',
    language: 'cpp',
    shortDescription: 'Build a comprehensive console Student Management System uniting all course concepts: structs, vectors, functions, loops, pass-by-reference, and grading algorithms.',
    difficulty: 'Intermediate',
    estimatedMinutes: 35,
    prerequisiteId: 'top-cpp-dynamic-memory',
    learningObjectives: [
      'Architect a modular C++ application combining structs, vectors, functions, and control flow',
      'Implement record storage, searching by student ID, and in-place grade calculation',
      'Pass collections by reference and const reference for optimal performance',
      'Handle edge cases: empty databases, non-existent records, and input validation'
    ],
    conceptExplanation: `### 1. Project Overview & Architecture
In this capstone mini project, you unite every concept learned across all 3 modules of **C++ Modern Fundamentals**:
* **Module 01**: Variables, data types, operators, formatted I/O, type conversions.
* **Module 02**: Conditionals, switch dispatch, loops, arrays, \`std::vector\`, \`std::string\`.
* **Module 03**: Modular functions, pass-by-reference, scope, and clean memory models.

### 2. Domain Data Model: \`struct Student\`
A C++ \`struct\` groups related data attributes into a custom user-defined type:
\`\`\`cpp
struct Student {
    int id;
    std::string name;
    double marks;
    char grade;
};
\`\`\`

### 3. System Capabilities & Workflow
1. **Add Student**: Appends a new \`Student\` record to a dynamic \`std::vector<Student>\`.
2. **Display All Records**: Formats and prints a tabular listing of all enrolled students.
3. **Calculate Average**: Iterates through records to compute aggregate class average.
4. **Determine Letter Grades**:
   * \`marks >= 90\` -> Grade \`'A'\`
   * \`marks >= 80\` -> Grade \`'B'\`
   * \`marks >= 70\` -> Grade \`'C'\`
   * \`marks < 70\`  -> Grade \`'F'\`
5. **Search Student**: Finds a student by numerical ID using linear search.
6. **Update Student**: Locates a student and modifies their marks in-place via reference.`,
    simpleExample: {
      code: `#include <iostream>
#include <string>
#include <vector>

struct Student {
    int id;
    std::string name;
    double marks;
};

int main() {
    std::vector<Student> roster = {
        {101, "Alice", 92.5},
        {102, "Bob", 84.0}
    };
    std::cout << "Enrolled Students: " << roster.size() << "\\n";
    return 0;
}`,
      explanation: 'Defines a Student struct and initializes a dynamic vector of student records.'
    },
    syntax: `// Capstone Architecture Pattern
struct Student { ... };

void addStudent(std::vector<Student>& db, int id, const std::string& name, double marks);
void displayRoster(const std::vector<Student>& db);
Student* findStudent(std::vector<Student>& db, int id);`,
    codeExample: `#include <iostream>
#include <string>
#include <vector>

// 1. Data Model
struct Student {
    int id;
    std::string name;
    double marks;
    char grade;
};

// 2. Business Logic Functions
char computeGrade(double marks) {
    if (marks >= 90.0) return 'A';
    if (marks >= 80.0) return 'B';
    if (marks >= 70.0) return 'C';
    return 'F';
}

void addStudent(std::vector<Student>& roster, int id, const std::string& name, double marks) {
    char grade = computeGrade(marks);
    roster.push_back({id, name, marks, grade});
}

void displayRoster(const std::vector<Student>& roster) {
    std::cout << "ID\\tName\\tMarks\\tGrade" << std::endl;
    std::cout << "---------------------------------" << std::endl;
    for (const auto& s : roster) {
        std::cout << s.id << "\\t" << s.name << "\\t" << s.marks << "\\t" << s.grade << std::endl;
    }
}

double computeClassAverage(const std::vector<Student>& roster) {
    if (roster.empty()) return 0.0;
    double sum = 0.0;
    for (const auto& s : roster) sum += s.marks;
    return sum / roster.size();
}

int main() {
    std::vector<Student> roster;

    std::cout << "=== Student Management System ===" << std::endl;
    addStudent(roster, 101, "Ada", 95.5);
    addStudent(roster, 102, "Alan", 88.0);
    addStudent(roster, 103, "Grace", 91.0);

    displayRoster(roster);

    double avg = computeClassAverage(roster);
    std::cout << "---------------------------------" << std::endl;
    std::cout << "Class Average: " << avg << std::endl;
    std::cout << "System Status: Online & Validated" << std::endl;
    return 0;
}`,
    expectedOutput: `=== Student Management System ===
ID	Name	Marks	Grade
---------------------------------
101	Ada	95.5	A
102	Alan	88	B
103	Grace	91	A
---------------------------------
Class Average: 91.5
System Status: Online & Validated`,
    stepByStep: [
      '1. Student struct blueprint encapsulates id, name, marks, and grade.',
      '2. addStudent receives roster by reference (&), calculating grade and appending record.',
      '3. displayRoster takes roster by const reference for zero-copy read-only tabular printing.',
      '4. computeClassAverage iterates through vector and calculates precise mean.',
      '5. Output displays formatted records and class statistics.'
    ],
    commonMistakes: [
      {
        mistake: 'Passing the student roster vector by value',
        codeSnippet: `void addStudent(std::vector<Student> roster, ...) {
    roster.push_back(...); // Bug: Modifies local copy; caller vector remains empty!
}`,
        correction: 'Pass the vector by reference: void addStudent(std::vector<Student>& roster, ...)',
        explanation: 'Passing by value creates a temporary copy; mutations are lost upon function return.'
      },
      {
        mistake: 'Division by zero when computing average on empty roster',
        codeSnippet: `double avg = sum / roster.size(); // If roster is empty, division by zero!`,
        correction: 'Check if (roster.empty()) return 0.0; before dividing.',
        explanation: 'Always guard against zero-element collections.'
      }
    ],
    realWorldExample: {
      scenario: 'Academic Registrar Enterprise Database Backend',
      code: `#include <iostream>
#include <string>
#include <vector>

struct CourseEnrollment {
    int studentId;
    std::string courseCode;
    bool feePaid;
};

int main() {
    std::vector<CourseEnrollment> enrollments = {
        {1001, "CS101", true},
        {1002, "CS101", false}
    };

    int activeCount = 0;
    for (const auto& e : enrollments) {
        if (e.feePaid) activeCount++;
    }

    std::cout << "Active Enrollments: " << activeCount << "/" << enrollments.size() << "\\n";
    return 0;
}`,
      explanation: 'University registrar systems process tens of thousands of student course enrollments using structured records and vector collections.'
    },
    practice: {
      prompt: 'Write a C++ program with a struct Student { int id; double marks; }; that initializes one student {101, 95.0} and prints "Student: 101, Marks: 95".',
      starterCode: `#include <iostream>

struct Student {
    int id;
    double marks;
};

int main() {
    // Create student and print details
    return 0;
}`,
      expectedOutputMatcher: 'Student: 101, Marks: 95',
      hint: 'Student s = {101, 95.0}; std::cout << "Student: " << s.id << ", Marks: " << s.marks << "\\n";',
      solution: `#include <iostream>

struct Student {
    int id;
    double marks;
};

int main() {
    Student s = {101, 95.0};
    std::cout << "Student: " << s.id << ", Marks: " << s.marks << "\\n";
    return 0;
}`
    },
    quiz: [
      {
        id: 'mcq-cpp-proj-1',
        question: 'Which container is best suited for storing an unknown number of student records that can grow at runtime?',
        options: ['Raw static array int[10]', 'std::vector<Student>', 'char string', 'int pointer'],
        correctIndex: 1,
        explanation: 'std::vector<Student> handles dynamic heap resizing, element insertion, and memory management automatically.'
      },
      {
        id: 'mcq-cpp-proj-2',
        question: 'Why should functions like displayRoster take "const std::vector<Student>&" instead of "std::vector<Student>"?',
        options: [
          'To avoid copying all student records while protecting them from accidental modification',
          'Because vectors cannot be passed by value in C++',
          'To sort the records alphabetically',
          'To delete the records after printing'
        ],
        correctIndex: 0,
        explanation: 'const & guarantees zero-copy efficiency and read-only protection.'
      },
      {
        id: 'mcq-cpp-proj-3',
        question: 'What is the role of a struct in C++?',
        options: [
          'To terminate program execution',
          'To encapsulate multiple related variables of different types into a single user-defined composite type',
          'To format text with cout',
          'To allocate heap memory'
        ],
        correctIndex: 1,
        explanation: 'A struct defines a custom composite data type grouping related fields together.'
      },
      {
        id: 'mcq-cpp-proj-4',
        question: 'How do you guard against division-by-zero when calculating class averages?',
        options: [
          'Verify if (roster.empty()) or if (roster.size() == 0) before performing the division',
          'Cast the sum to int',
          'Multiply by 0',
          'Use static_cast<double>'
        ],
        correctIndex: 0,
        explanation: 'Checking roster.empty() ensures you never divide by zero when no records exist.'
      },
      {
        id: 'mcq-cpp-proj-5',
        question: 'How do you update an existing student record inside a vector so that changes persist?',
        options: [
          'Find the element by index or reference (Student& s = roster[i];) and modify its fields',
          'Copy the student to a new variable and discard the vector',
          'Call delete on the vector',
          'Re-install the C++ compiler'
        ],
        correctIndex: 0,
        explanation: 'Accessing the student via index or reference permits direct in-place modification of vector elements.'
      }
    ],
    codingChallenge: {
      title: 'Student Roster Summary Card',
      difficulty: 'Intermediate',
      problem_statement: 'Write a C++ program that defines struct Student { std::string name; int score; }; creates a vector with {"Ada", 95} and {"Bob", 85}, computes the total score 180, and prints "Students: 2, Total: 180".',
      input_format: 'No input.',
      output_format: 'One line: "Students: 2, Total: 180".',
      constraints: 'Use struct and std::vector.',
      starter_code: `#include <iostream>
#include <string>
#include <vector>

struct Student {
    std::string name;
    int score;
};

int main() {
    // Create vector, calculate total score, and print
    return 0;
}`,
      expected_output: `Students: 2, Total: 180`,
      test_cases: [
        {
          input: '',
          expected_output: `Students: 2, Total: 180`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Congratulations on completing the C++ Modern Fundamentals course!',
      'You have mastered C++ syntax, types, operators, control flow, loops, arrays, vectors, and memory foundations.',
      'You applied modular architecture, structs, functions, and references to build a working Student Management System.',
      'You are now equipped with the core foundations to delve into Object-Oriented Programming and Advanced C++ STL!'
    ]
  }
];
