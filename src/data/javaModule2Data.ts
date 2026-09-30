import { JavaTopic } from './javaFundamentalsData';

export const JAVA_MODULE_2_TOPICS: JavaTopic[] = [
  // =========================================================================
  // LESSON 07: Variables and Constants
  // =========================================================================
  {
    id: 'top-java-variables-constants',
    number: 7,
    numberDisplay: '07',
    moduleId: 'mod-java-fundamentals-control',
    moduleTitle: 'Module 02: Java Fundamentals & Control Structures',
    title: 'Variables and Constants',
    slug: 'java-variables-constants-scope',
    language: 'java',
    shortDescription: 'Master variable declarations, initializations, assignments, identifiers, reserved keywords, local vs. instance vs. static scopes, and immutable constants using the final keyword.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-dev-environment',
    learningObjectives: [
      'Understand what a variable is and how memory is allocated for variables',
      'Distinguish declaration, initialization, assignment, and reassignment',
      'Identify valid Java identifiers and avoid reserved language keywords',
      'Differentiate local variables, instance variables, and static class variables',
      'Declare immutable constants using the final keyword'
    ],
    conceptExplanation: `### 1. What is a Variable?
A **variable** is a named storage location in memory capable of holding a value that may change during program execution. Think of a variable as a labeled container: the *name* identifies the container, the *type* dictates what shape of item can fit inside, and the *value* is the item currently inside.

### 2. Declaration, Initialization, and Assignment
* **Declaration**: Informs the compiler about the variable's name and type, reserving memory space.
  \`\`\`java
  int age; // Declared, but uninitialized in local scope
  \`\`\`
* **Initialization**: The first time a value is stored in a declared variable.
  \`\`\`java
  age = 20; // Initialized
  \`\`\`
* **Combined Declaration & Initialization**:
  \`\`\`java
  int score = 95; // Recommended standard style
  \`\`\`
* **Reassignment**: Overwriting the current value with a new value.
  \`\`\`java
  score = 98; // Previous 95 is replaced by 98
  \`\`\`

### 3. Java Identifiers & Reserved Keywords
An **identifier** is a custom name chosen by a developer for a variable, method, or class.
* **Rules for Identifiers**:
  - Must begin with a letter (A–Z, a–z), an underscore (\`_\`), or a dollar sign (\`$\`).
  - Cannot begin with a digit (e.g., \`1stPlace\` is illegal; \`place1\` is valid).
  - Can contain letters, digits, underscores, and dollar signs.
  - Cannot be a **reserved Java keyword** (such as \`class\`, \`public\`, \`static\`, \`int\`, \`void\`, \`final\`, \`new\`).
  - Identifiers are strictly case-sensitive (\`totalScore\` != \`TotalScore\`).

### 4. The Three Scopes of Variables
1. **Local Variables**: Declared inside a method, constructor, or block (\`{ ... }\`).
   - Stored in the Thread Stack frame.
   - **Crucial Rule**: Local variables *must* be explicitly initialized before reading. They do *not* receive default values!
2. **Instance Variables (Fields)**: Declared inside a class but outside methods, without the \`static\` keyword.
   - Stored in Heap memory inside the object instance.
   - Automatically receive default values (e.g., \`0\`, \`0.0\`, \`null\`, \`false\`).
3. **Static Variables (Class Variables)**: Declared with the \`static\` keyword inside a class.
   - Stored in the Method Area / Metaspace.
   - A single shared copy exists for the entire class across all instances.

### 5. Constants using the \`final\` Keyword
When you prepend the keyword \`final\` to a variable declaration, its value becomes **immutable** (read-only) once initialized. Any subsequent attempt to reassign it triggers a compile-time error.
By convention, constants are written in uppercase with underscore separators:
\`\`\`java
final double PI = 3.141592653589793;
final int MAX_LOGIN_ATTEMPTS = 5;
\`\`\``,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        int userAge = 21;
        final int VOTING_AGE = 18;
        System.out.println("User Age: " + userAge);
        System.out.println("Legal Threshold: " + VOTING_AGE);
    }
}`,
      explanation: 'Declares mutable variable userAge and immutable constant VOTING_AGE with final.'
    },
    syntax: `// Variable Declaration & Assignment:
dataType variableName = initialValue;

// Constant Declaration:
final dataType CONSTANT_NAME = constantValue;

// Scope examples:
public class ScopeDemo {
    static int globalCount = 0; // Static variable
    int instanceId = 101;       // Instance variable

    public void demo() {
        int localVal = 50;      // Local variable (Stack)
    }
}`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        // Variable declarations and operations
        String studentName = "Jinesh";
        int examScore = 88;
        double tuitionFee = 4250.75;
        final double SCHOLARSHIP_DISCOUNT = 500.00;

        double finalFee = tuitionFee - SCHOLARSHIP_DISCOUNT;

        System.out.println("=== Student Financial Profile ===");
        System.out.println("Student Name:    " + studentName);
        System.out.println("Exam Score:      " + examScore);
        System.out.println("Base Tuition:    $" + tuitionFee);
        System.out.println("Discount Rate:   $" + SCHOLARSHIP_DISCOUNT);
        System.out.println("Final Payable:   $" + finalFee);
    }
}`,
    expectedOutput: `=== Student Financial Profile ===
Student Name:    Jinesh
Exam Score:      88
Base Tuition:    $4250.75
Discount Rate:   $500.0
Final Payable:   $3750.75`,
    stepByStep: [
      '1. Local stack frame allocates memory for studentName, examScore, tuitionFee, and finalFee.',
      '2. SCHOLARSHIP_DISCOUNT is marked final, locking its value to 500.00.',
      '3. Arithmetic subtraction (tuitionFee - SCHOLARSHIP_DISCOUNT) evaluates to 3750.75.',
      '4. Output is formatted and printed to the terminal.',
      '5. Stack frame is automatically cleaned up when main exits.'
    ],
    commonMistakes: [
      {
        mistake: 'Using an uninitialized local variable',
        codeSnippet: `public static void main(String[] args) {
    int total;
    System.out.println(total); // Error: variable total might not have been initialized
}`,
        correction: 'Always assign an initial value to local variables before accessing them (e.g., int total = 0;).',
        explanation: 'Java protects against garbage memory reads by strictly requiring local variables to be definitely assigned.'
      },
      {
        mistake: 'Attempting to reassign a final variable',
        codeSnippet: `final double TAX_RATE = 0.08;
TAX_RATE = 0.09; // Error: cannot assign a value to final variable TAX_RATE`,
        correction: 'Remove final if the value must change, or create a new variable.',
        explanation: 'Variables marked final cannot be reassigned once initialized.'
      },
      {
        mistake: 'Starting a variable name with a digit',
        codeSnippet: `int 1stScore = 90; // Syntax Error: <identifier> expected`,
        correction: 'Start with a letter: int score1 = 90; or int firstScore = 90;.',
        explanation: 'Java syntax rules forbid identifiers from beginning with numeric characters.'
      }
    ],
    realWorldExample: {
      scenario: 'Banking Transaction Limits Security Engine',
      code: `public class Main {
    public static void main(String[] args) {
        final double DAILY_WITHDRAWAL_LIMIT = 5000.00;
        double attemptedWithdrawal = 1200.00;
        double currentTotalToday = 3400.00;

        if (currentTotalToday + attemptedWithdrawal <= DAILY_WITHDRAWAL_LIMIT) {
            System.out.println("Transaction Approved: Under daily limit of $" + DAILY_WITHDRAWAL_LIMIT);
        }
    }
}`,
      explanation: 'Financial institutions use final constants to enforce statutory limits and security parameters that must never be altered during runtime execution.'
    },
    practice: {
      prompt: 'Write a Java program that declares a variable rectangleLength = 12 and rectangleWidth = 5. Calculate and print "Area: 60" and "Perimeter: 34".',
      starterCode: `public class Main {
    public static void main(String[] args) {
        // Declare length and width, compute area and perimeter, and print
    }
}`,
      expectedOutputMatcher: 'Area: 60\nPerimeter: 34',
      hint: 'Area = length * width; Perimeter = 2 * (length + width);',
      solution: `public class Main {
    public static void main(String[] args) {
        int length = 12;
        int width = 5;
        int area = length * width;
        int perimeter = 2 * (length + width);
        System.out.println("Area: " + area);
        System.out.println("Perimeter: " + perimeter);
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-var-1',
        question: 'Which of the following is a legal Java identifier?',
        options: ['2ndVariable', 'total_amount', 'class', 'final-score'],
        correctIndex: 1,
        explanation: 'total_amount begins with a letter and contains valid underscore characters. "2ndVariable" starts with a digit, "class" is a keyword, and "-" is a minus operator.'
      },
      {
        id: 'mcq-java-var-2',
        question: 'What happens if a local variable declared inside a method is read before being initialized?',
        options: [
          'It defaults to 0 automatically',
          'It compiles but prints null at runtime',
          'A compile-time error occurs',
          'The computer reboots'
        ],
        correctIndex: 2,
        explanation: 'Java requires local variables to be explicitly initialized before use; reading an uninitialized local variable causes a compile-time error.'
      },
      {
        id: 'mcq-java-var-3',
        question: 'Which keyword creates an unchangeable constant variable in Java?',
        options: ['const', 'immutable', 'final', 'static'],
        correctIndex: 2,
        explanation: 'The final keyword makes a variable immutable once assigned.'
      },
      {
        id: 'mcq-java-var-4',
        question: 'Where are local variables declared inside a method allocated in JVM memory?',
        options: ['Metaspace', 'JVM Thread Stack frame', 'Garbage-Collected Heap', 'Disk swap space'],
        correctIndex: 1,
        explanation: 'Local variables and primitive values declared in methods reside directly in the executing thread\'s stack frame.'
      },
      {
        id: 'mcq-java-var-5',
        question: 'What is the standard naming convention for Java constants?',
        options: ['camelCase', 'PascalCase', 'UPPER_SNAKE_CASE', 'kebab-case'],
        correctIndex: 2,
        explanation: 'Java constants are conventionally written in ALL_CAPS with underscores separating words (e.g., MAX_BUFFER_SIZE).'
      }
    ],
    codingChallenge: {
      title: 'Circle Dimension Calculator',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program that defines a constant PI = 3.14159 and variable radius = 7.0. Calculate and print: Line 1: "Radius: 7.0", Line 2: "Circumference: 43.98", Line 3: "Area: 153.94" (formatted to two decimal places).',
      input_format: 'No input.',
      output_format: 'Three lines matching the exact formatted circle dimensions.',
      constraints: 'Use System.out.printf() or Math.round formatting.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        // Calculate circle dimensions and print
    }
}`,
      expected_output: `Radius: 7.0\nCircumference: 43.98\nArea: 153.94`,
      test_cases: [
        {
          input: '',
          expected_output: `Radius: 7.0\nCircumference: 43.98\nArea: 153.94`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Variables store data in named memory locations; type, name, and value define a variable.',
      'Java identifiers must begin with a letter, underscore, or dollar sign, and cannot be keywords.',
      'Local variables in methods must be initialized before use and live in the thread stack.',
      'The final modifier creates constants that cannot be reassigned after initialization.'
    ]
  },

  // =========================================================================
  // LESSON 08: Primitive Data Types
  // =========================================================================
  {
    id: 'top-java-primitive-types',
    number: 8,
    numberDisplay: '08',
    moduleId: 'mod-java-fundamentals-control',
    moduleTitle: 'Module 02: Java Fundamentals & Control Structures',
    title: 'Primitive Data Types',
    slug: 'java-primitive-data-types',
    language: 'java',
    shortDescription: 'Master all eight Java primitive data types: byte, short, int, long, float, double, char, and boolean. Understand exact bit sizes, value ranges, literals, and suffix notation.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-variables-constants',
    learningObjectives: [
      'Identify and describe the 8 primitive data types in Java',
      'Explain bit sizes, byte representations, and value ranges for all numeric types',
      'Apply numeric literal suffixes correctly (L for long, f for float, d for double)',
      'Understand 16-bit Unicode char representations and boolean true/false values'
    ],
    conceptExplanation: `### 1. The 8 Primitives in Java
Unlike pure object-oriented languages where everything is an object, Java retains **8 primitive data types** for raw computational speed and memory efficiency. Primitive variables store their literal values directly in memory (e.g., in the thread stack), rather than as pointer references to heap objects.

### 2. Complete Primitive Data Types Master Table
| Type | Category | Size (Bits / Bytes) | Min Value | Max Value | Default Value (Fields) | Example |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **\`byte\`** | Integer | 8 bits (1 byte) | \`-128\` | \`127\` | \`0\` | \`byte b = 100;\` |
| **\`short\`** | Integer | 16 bits (2 bytes) | \`-32,768\` | \`32,767\` | \`0\` | \`short s = 25000;\` |
| **\`int\`** | Integer | 32 bits (4 bytes) | \`-2,147,483,648\` | \`2,147,483,647\` | \`0\` | \`int count = 100000;\` |
| **\`long\`** | Integer | 64 bits (8 bytes) | \`-9.22 × 10¹⁸\` | \`9.22 × 10¹⁸\` | \`0L\` | \`long pop = 8000000000L;\` |
| **\`float\`** | Floating-point | 32 bits (4 bytes) | \`~1.4 × 10⁻⁴⁵\` | \`~3.4 × 10³⁸\` (6-7 digits precision) | \`0.0f\` | \`float price = 19.99f;\` |
| **\`double\`** | Floating-point | 64 bits (8 bytes) | \`~4.9 × 10⁻³²⁴\` | \`~1.8 × 10³⁰⁸\` (15-16 digits precision) | \`0.0d\` | \`double pi = 3.14159;\` |
| **\`char\`** | Character | 16 bits (2 bytes) | \`0\` (\`'\\u0000'\`) | \`65,535\` (\`'\\uffff'\`) | \`'\\u0000'\` | \`char grade = 'A';\` |
| **\`boolean\`** | Logical | 1 bit (effective) | \`false\` | \`true\` | \`false\` | \`boolean active = true;\` |

### 3. Key Concepts and Literal Rules
1. **Integer Literals Default to \`int\`**:
   Any whole number literal typed in Java code (e.g., \`42\`) is treated as a 32-bit \`int\`. If a number exceeds the \`int\` maximum (\`2,147,483,647\`), you **must** append an \`L\` or \`l\` suffix (always prefer uppercase \`L\` to avoid confusing lowercase \`l\` with the digit \`1\`):
   \`\`\`java
   long nationalDebt = 34_000_000_000_000L; // Underscores can improve readability!
   \`\`\`
2. **Floating-Point Literals Default to \`double\`**:
   Any decimal literal (e.g., \`3.14\`) is treated as a 64-bit \`double\`. To assign it to a 32-bit \`float\`, you must append an \`F\` or \`f\` suffix:
   \`\`\`java
   float temp = 98.6f; // Required suffix
   \`\`\`
3. **\`char\` is 16-bit Unicode**:
   Unlike C, where \`char\` is an 8-bit ASCII byte, Java \`char\` is an unsigned 16-bit type supporting international Unicode characters (UTF-16 code units):
   \`\`\`java
   char omega = '\u03A9'; // Greek capital letter Omega Ω
   \`\`\`
4. **\`boolean\` is Strictly True/False**:
   In Java, \`boolean\` is NOT an integer. You cannot use \`0\` or \`1\` in place of \`false\` or \`true\`. Writing \`if (1)\` will result in a compiler error!`,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        int age = 22;
        double gpa = 3.85;
        char grade = 'A';
        boolean enrolled = true;

        System.out.println("Age: " + age + ", GPA: " + gpa + ", Grade: " + grade + ", Active: " + enrolled);
    }
}`,
      explanation: 'Declares variables of four fundamental primitive types and prints them.'
    },
    syntax: `// Primitive declarations:
byte   b = 120;
short  s = 32000;
int    i = 500000;
long   l = 9000000000L;    // 'L' suffix required
float  f = 12.34f;         // 'f' suffix required
double d = 99.999;
char   c = 'Z';
boolean bool = true;`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Java Primitive Type Inspection ===");
        System.out.println("Byte Range:    " + Byte.MIN_VALUE + " to " + Byte.MAX_VALUE);
        System.out.println("Short Range:   " + Short.MIN_VALUE + " to " + Short.MAX_VALUE);
        System.out.println("Integer Range: " + Integer.MIN_VALUE + " to " + Integer.MAX_VALUE);
        System.out.println("Long Range:    " + Long.MIN_VALUE + " to " + Long.MAX_VALUE);
        System.out.println("Float Precision:  ~7 digits (" + Float.MIN_VALUE + " to " + Float.MAX_VALUE + ")");
        System.out.println("Double Precision: ~16 digits (" + Double.MIN_VALUE + " to " + Double.MAX_VALUE + ")");
        System.out.println("Char Bit Size: " + Character.SIZE + " bits (Unicode)");
    }
}`,
    expectedOutput: `=== Java Primitive Type Inspection ===
Byte Range:    -128 to 127
Short Range:   -32768 to 32767
Integer Range: -2147483648 to 2147483647
Long Range:    -9223372036854775808 to 9223372036854775807
Float Precision:  ~7 digits (1.4E-45 to 3.4028235E38)
Double Precision: ~16 digits (4.9E-324 to 1.7976931348623157E308)
Char Bit Size: 16 bits (Unicode)`,
    stepByStep: [
      '1. Java runtime evaluates wrapper class constants (e.g., Integer.MAX_VALUE).',
      '2. Values reflect strict IEEE 754 standards for floating-point and two\'s complement for integers.',
      '3. Character.SIZE confirms Java uses 16-bit UTF-16 characters.',
      '4. Output demonstrates platform-independent identical ranges across every operating system.'
    ],
    commonMistakes: [
      {
        mistake: 'Omitting the "f" suffix on float literals',
        codeSnippet: `float price = 19.99; // Compiler Error: incompatible types: possible lossy conversion from double to float`,
        correction: 'Append "f" or "F": float price = 19.99f;',
        explanation: 'In Java, 19.99 is a 64-bit double literal. Assigning it to a 32-bit float without a suffix or cast is forbidden.'
      },
      {
        mistake: 'Omitting the "L" suffix on large long integers',
        codeSnippet: `long worldPopulation = 8000000000; // Error: integer number too large`,
        correction: 'Append "L": long worldPopulation = 8000000000L;',
        explanation: 'Integer literals without L are parsed as 32-bit int, triggering an overflow error during compilation.'
      },
      {
        mistake: 'Treating boolean as numeric integer (0 or 1)',
        codeSnippet: `boolean flag = 1; // Error: incompatible types: int cannot be converted to boolean`,
        correction: 'Use explicit true or false: boolean flag = true;',
        explanation: 'Java strictly disallows implicit conversions between boolean and numeric types.'
      }
    ],
    realWorldExample: {
      scenario: 'High-Throughput Sensor Data Telemetry Engine',
      code: `public class Main {
    public static void main(String[] args) {
        // Embedded IoT sensor processing requires memory efficiency:
        byte sensorId = 14;                  // 1 byte instead of 4
        short temperatureReading = -45;      // 2 bytes
        long timestampMillis = 1711839600000L; // 8 bytes for Unix epoch
        boolean isAlertTriggered = false;

        System.out.println("Sensor [" + sensorId + "] Temp: " + temperatureReading + "C at " + timestampMillis);
    }
}`,
      explanation: 'Telemetry and IoT architectures optimize memory bandwidth by using byte and short buffers to store millions of sensor events per second with minimal RAM consumption.'
    },
    practice: {
      prompt: 'Write a Java program that declares an int population = 1400000, double rating = 4.8, char section = \'B\', and boolean isOpen = true. Print them on a single line formatted as: "Pop: 1400000 | Rating: 4.8 | Section: B | Open: true".',
      starterCode: `public class Main {
    public static void main(String[] args) {
        // Declare the 4 primitives and print formatted string
    }
}`,
      expectedOutputMatcher: 'Pop: 1400000 | Rating: 4.8 | Section: B | Open: true',
      hint: 'Concatenate the four primitive variables with string literals.',
      solution: `public class Main {
    public static void main(String[] args) {
        int population = 1400000;
        double rating = 4.8;
        char section = 'B';
        boolean isOpen = true;
        System.out.println("Pop: " + population + " | Rating: " + rating + " | Section: " + section + " | Open: " + isOpen);
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-prim-1',
        question: 'How many primitive data types are defined in the Java programming language?',
        options: ['4', '6', '8', '10'],
        correctIndex: 2,
        explanation: 'Java features exactly 8 primitives: byte, short, int, long, float, double, char, and boolean.'
      },
      {
        id: 'mcq-java-prim-2',
        question: 'What is the memory size and bit-width of the standard int data type in Java?',
        options: ['16 bits (2 bytes)', '32 bits (4 bytes)', '64 bits (8 bytes)', 'Platform dependent'],
        correctIndex: 1,
        explanation: 'In Java, an int is guaranteed to be 32 bits (4 bytes) signed two\'s complement across all platforms.'
      },
      {
        id: 'mcq-java-prim-3',
        question: 'What literal suffix must be appended to floating-point numbers to store them in a 32-bit float variable?',
        options: ['d', 'f', 'l', 'm'],
        correctIndex: 1,
        explanation: 'The f or F suffix explicitly denotes a 32-bit single-precision float literal.'
      },
      {
        id: 'mcq-java-prim-4',
        question: 'Why does Java use 16 bits for the char data type instead of 8 bits like C?',
        options: [
          'To waste memory',
          'To support international characters using the Unicode (UTF-16) character set',
          'To allow negative characters',
          'Because 8-bit math is slow'
        ],
        correctIndex: 1,
        explanation: 'Java was designed from the ground up for global software, using 16-bit Unicode characters to represent international alphabets.'
      },
      {
        id: 'mcq-java-prim-5',
        question: 'Which of the following lines will compile successfully in Java?',
        options: [
          'float x = 3.14;',
          'boolean active = 1;',
          'byte b = 127;',
          'int num = 3000000000;'
        ],
        correctIndex: 2,
        explanation: '127 is the maximum positive value for byte. 3.14 requires an f suffix, active = 1 is illegal in Java, and 3 billion overflows int without an L suffix.'
      }
    ],
    codingChallenge: {
      title: 'Primitive Storage Summary',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program that declares: byte b = 10, short s = 200, int i = 3000, long l = 40000L. Calculate their total sum and print "Primitive Sum: 43210".',
      input_format: 'No input.',
      output_format: 'One line showing the calculated sum.',
      constraints: 'Follow exact casing.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        // Declare variables, calculate sum, and print
    }
}`,
      expected_output: `Primitive Sum: 43210`,
      test_cases: [
        {
          input: '',
          expected_output: `Primitive Sum: 43210`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Java features 8 primitive types: byte (1B), short (2B), int (4B), long (8B), float (4B), double (8B), char (2B), boolean.',
      'Primitives store raw values directly on the stack without object allocation overhead.',
      'Decimals default to double (use f for float); integers default to int (use L for long).',
      'char is 16-bit Unicode, and boolean only accepts literal true or false.'
    ]
  },

  // =========================================================================
  // LESSON 09: Reference Data Types
  // =========================================================================
  {
    id: 'top-java-reference-types',
    number: 9,
    numberDisplay: '09',
    moduleId: 'mod-java-fundamentals-control',
    moduleTitle: 'Module 02: Java Fundamentals & Control Structures',
    title: 'Reference Data Types',
    slug: 'java-reference-types-objects-strings',
    language: 'java',
    shortDescription: 'Contrast primitive values with reference types. Understand memory addresses, heap object instantiation, array references, String objects, null references, and pass-by-reference misconceptions.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-primitive-types',
    learningObjectives: [
      'Contrast primitive types with reference types in memory allocation and assignment',
      'Understand how reference variables hold memory addresses pointing to objects on the Heap',
      'Analyze the special behavior of String objects and arrays as reference types',
      'Understand null references and diagnose NullPointerException causes',
      'Demonstrate how reference assignment copies the reference pointer, not the object'
    ],
    conceptExplanation: `### 1. Primitive vs. Reference Types
Java data types fall into two foundational categories:
1. **Primitive Types** (\`int\`, \`double\`, \`boolean\`, etc.):
   - Hold their raw data values directly in the memory allocated to that variable.
   - Default to \`0\`, \`0.0\`, or \`false\` when declared as class fields.
2. **Reference Types** (Classes, Interfaces, Arrays, Enums):
   - Do **not** store the object data directly inside the variable.
   - Instead, the variable holds a **reference** (a memory pointer handle) that points to the location of the object in the **Heap memory**.
   - Default to \`null\` when declared as class fields.

### 2. Memory Visualization: Value vs. Reference
Consider this comparison:
\`\`\`java
// Primitive Assignment:
int a = 10;
int b = a; // A fresh copy of the literal value 10 is copied into b.
b = 20;    // 'a' remains 10!
\`\`\`
In contrast:
\`\`\`java
// Reference Assignment:
int[] first = {10, 20};
int[] second = first; // 'second' copies the REFERENCE POINTER, not the array!
second[0] = 99;       // Modifying through 'second' modifies the shared array in Heap!
// first[0] is now ALSO 99!
\`\`\`

### 3. The \`null\` Reference
A reference variable that has not been initialized to point to an active object holds the special literal value \`null\`.
Attempting to invoke a method or access a field on a \`null\` reference triggers Java's most notorious runtime error:
\`\`\`java
String name = null;
int len = name.length(); // Crashes: java.lang.NullPointerException
\`\`\`

### 4. Common Reference Types
* **Strings**: \`String str = "Java";\` (String objects live in the JVM String Constant Pool on the Heap).
* **Arrays**: \`int[] numbers = new int[5];\` (All arrays in Java are first-class objects).
* **User-Defined Classes**: Instances created via \`new ClassName()\`.
* **Wrapper Classes**: Object counterparts of primitives (\`Integer\`, \`Double\`, \`Boolean\`).`,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        String greeting = "Hello";
        int[] scores = {90, 85, 95};

        System.out.println("Greeting: " + greeting);
        System.out.println("First Score: " + scores[0]);
    }
}`,
      explanation: 'Demonstrates reference variables greeting and scores pointing to Heap objects.'
    },
    syntax: `// Reference Variable Declaration & Instantiation:
ClassName variableName = new ClassName();

// Array Reference:
int[] arrayName = new int[size];

// String Reference (literal syntax):
String text = "Direct Literal";`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        // Demonstrate reference copying
        int[] original = {100, 200, 300};
        int[] alias = original; // Copies reference handle

        alias[0] = 999; // Mutate through alias

        System.out.println("=== Reference Mutation Demonstration ===");
        System.out.println("Original[0]: " + original[0]);
        System.out.println("Alias[0]:    " + alias[0]);
        System.out.println("Both point to same Heap object: " + (original == alias));
    }
}`,
    expectedOutput: `=== Reference Mutation Demonstration ===
Original[0]: 999
Alias[0]:    999
Both point to same Heap object: true`,
    stepByStep: [
      '1. new int[] {100, 200, 300} allocates array object memory on the JVM Heap.',
      '2. original variable on the Stack stores the address of that Heap memory.',
      '3. alias = original copies that exact memory address into alias on the Stack.',
      '4. alias[0] = 999 follows the reference to the Heap and updates the first element.',
      '5. Inspecting original[0] sees the updated value 999 because both point to the same memory block.'
    ],
    commonMistakes: [
      {
        mistake: 'Assuming reference assignment copies the object itself',
        codeSnippet: `int[] copy = original; // Does NOT duplicate the array in memory`,
        correction: 'Use Arrays.copyOf() or .clone() to create an independent copy.',
        explanation: 'Assignment (=) in Java always copies the value stored in the variable. For reference types, that value is the memory pointer.'
      },
      {
        mistake: 'Calling methods on a null reference',
        codeSnippet: `String text = null;
if (text.equals("admin")) // Throws NullPointerException!`,
        correction: 'Check for null first, or write: if ("admin".equals(text)).',
        explanation: 'Invoking methods on literal constants ("admin".equals(text)) safely handles null arguments without throwing exceptions.'
      },
      {
        mistake: 'Using == to compare the contents of String objects',
        codeSnippet: `String s1 = new String("Java");
String s2 = new String("Java");
System.out.println(s1 == s2); // Prints false!`,
        correction: 'Use s1.equals(s2) to compare content.',
        explanation: '== compares reference addresses (whether both variables point to the identical Heap memory location).'
      }
    ],
    realWorldExample: {
      scenario: 'Distributed Cache Object Reference Management',
      code: `public class Main {
    public static void main(String[] args) {
        String sessionUser = "alice_ops";
        String cachedToken = "eyJhbGciOiJIUzI1NiJ9...";

        System.out.println("[AUTH] Authenticating session for user reference: " + sessionUser);
        System.out.println("[AUTH] Token memory footprint verified on Heap.");
    }
}`,
      explanation: 'Enterprise microservices cache user sessions and authentication tokens as reference objects on the JVM Heap, sharing handles across multiple service threads to conserve memory.'
    },
    practice: {
      prompt: 'Write a Java program that creates an array int[] data = {1, 2, 3}. Assign int[] ref = data. Modify ref[1] = 50. Print "Data[1]: 50".',
      starterCode: `public class Main {
    public static void main(String[] args) {
        // Create array, assign reference, modify element, and print
    }
}`,
      expectedOutputMatcher: 'Data[1]: 50',
      hint: 'ref[1] = 50 modifies the underlying array shared with data.',
      solution: `public class Main {
    public static void main(String[] args) {
        int[] data = {1, 2, 3};
        int[] ref = data;
        ref[1] = 50;
        System.out.println("Data[1]: " + data[1]);
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-ref-1',
        question: 'What does a reference variable in Java actually store in memory?',
        options: [
          'The complete object binary copy directly',
          'The memory reference (pointer) pointing to the object on the Heap',
          'The source code file path',
          'The database primary key'
        ],
        correctIndex: 1,
        explanation: 'Reference variables store the memory address pointing to the actual object instantiated on the Heap.'
      },
      {
        id: 'mcq-java-ref-2',
        question: 'What is the default value of an uninitialized instance reference variable in a class?',
        options: ['0', 'false', '"" (empty string)', 'null'],
        correctIndex: 3,
        explanation: 'All object reference fields default to null until an object instance is assigned.'
      },
      {
        id: 'mcq-java-ref-3',
        question: 'What runtime exception occurs when calling a method on a reference that is null?',
        options: ['ArithmeticException', 'NullPointerException', 'IllegalArgumentException', 'ClassCastException'],
        correctIndex: 1,
        explanation: 'NullPointerException is thrown whenever an application attempts to use null where an object instance is required.'
      },
      {
        id: 'mcq-java-ref-4',
        question: 'If int[] a = {5, 10}; int[] b = a; and then b[0] = 99; what is the value of a[0]?',
        options: ['5', '10', '99', 'null'],
        correctIndex: 2,
        explanation: 'Both a and b reference the exact same array object on the Heap. Modifying via b reflects in a.'
      },
      {
        id: 'mcq-java-ref-5',
        question: 'Which of the following is NOT a reference type in Java?',
        options: ['String', 'int[]', 'double', 'Scanner'],
        correctIndex: 2,
        explanation: 'double is one of the 8 primitive data types; String, arrays, and Scanner are reference types.'
      }
    ],
    codingChallenge: {
      title: 'Reference Pointer Verification',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program that demonstrates reference assignment: Create an array int[] list = {10, 20}. Create int[] copy = list. Change copy[0] = 77. Print: Line 1: "List[0]: 77", Line 2: "Copy[0]: 77".',
      input_format: 'No input.',
      output_format: 'Two lines showing the modified array elements.',
      constraints: 'Exact output match.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        // Implement reference mutation
    }
}`,
      expected_output: `List[0]: 77\nCopy[0]: 77`,
      test_cases: [
        {
          input: '',
          expected_output: `List[0]: 77\nCopy[0]: 77`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Primitive types store values directly; reference types store memory handles to objects on the Heap.',
      'Assigning one reference variable to another copies the pointer, not the underlying object.',
      'Unassigned reference fields hold null; attempting to dereference null throws NullPointerException.',
      'Strings and arrays in Java are first-class reference types.'
    ]
  },

  // =========================================================================
  // LESSON 10: Type Conversion and Casting
  // =========================================================================
  {
    id: 'top-java-type-casting',
    number: 10,
    numberDisplay: '10',
    moduleId: 'mod-java-fundamentals-control',
    moduleTitle: 'Module 02: Java Fundamentals & Control Structures',
    title: 'Type Conversion and Casting',
    slug: 'java-type-conversion-casting',
    language: 'java',
    shortDescription: 'Master numeric conversions in Java: implicit widening, explicit narrowing casting, numeric promotion in arithmetic expressions, data truncation, and string conversions.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-reference-types',
    learningObjectives: [
      'Differentiate implicit widening conversion from explicit narrowing casting',
      'Understand numeric promotion rules in binary arithmetic operations',
      'Recognize truncation, precision loss, and integer overflow during explicit casts',
      'Explain integer division truncation (e.g., 5 / 2 == 2) and how to avoid it',
      'Convert between numeric types and Strings using wrapper parsing methods'
    ],
    conceptExplanation: `### 1. What is Type Conversion?
**Type conversion** occurs when a value of one data type is transformed into another data type. In a strongly typed language like Java, data types cannot be mixed arbitrarily without following strict conversion rules.

### 2. Widening Conversion (Implicit / Automatic)
**Widening conversion** occurs automatically when converting a smaller data type to a larger data type. Because the destination type has a larger memory capacity, no data loss can occur.
The widening hierarchy is:
\`\`\`text
byte -> short -> int -> long -> float -> double
          char -> int
\`\`\`
Example:
\`\`\`java
int count = 100;
double price = count; // Automatic widening: 100 -> 100.0 (safe)
\`\`\`

### 3. Narrowing Conversion (Explicit Casting)
**Narrowing conversion** occurs when converting a larger data type to a smaller data type. Because data loss, truncation, or overflow is possible, Java requires an **explicit cast operator**: \`(targetType) value\`.
\`\`\`java
double exactPrice = 99.85;
int rounded = (int) exactPrice; // Explicit cast: truncates decimals -> 99
\`\`\`
*Warning*: Explicit casting truncates fractional parts; it does **not** round to the nearest whole integer!

### 4. Numeric Promotion in Arithmetic Expressions
When performing operations between different numeric types, Java automatically promotes operands before calculating:
1. If any operand is \`double\`, the other is converted to \`double\`.
2. Otherwise, if any operand is \`float\`, the other is converted to \`float\`.
3. Otherwise, if any operand is \`long\`, the other is converted to \`long\`.
4. Otherwise, both operands are promoted to **\`int\`** (even if both are \`byte\` or \`short\`).
\`\`\`java
byte a = 10;
byte b = 20;
// byte c = a + b; // COMPILE ERROR: a + b produces an int!
byte c = (byte) (a + b); // Requires explicit cast
\`\`\`

### 5. The Integer Division Trap
When dividing two integers in Java, the result is always truncated to an integer:
\`\`\`java
int result = 5 / 2; // Evaluates to 2, NOT 2.5!
\`\`\`
To retain decimal precision, at least one operand must be converted to a floating-point type:
\`\`\`java
double precise = (double) 5 / 2; // Evaluates to 2.5
\`\`\`

### 6. Converting Between Numbers and Strings
* **Number to String**: \`String.valueOf(num)\` or \`Integer.toString(num)\`
* **String to Number**: \`Integer.parseInt("123")\`, \`Double.parseDouble("45.67")\``,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        int original = 42;
        double widened = original;        // Implicit widening
        int narrowed = (int) 3.99;        // Explicit narrowing (truncates to 3)

        System.out.println("Widened: " + widened + " | Narrowed: " + narrowed);
    }
}`,
      explanation: 'Shows automatic widening from int to double and explicit casting from double to int.'
    },
    syntax: `// Explicit Casting Syntax:
targetType variable = (targetType) sourceValue;

// String to Primitive Parsing:
int num = Integer.parseInt("500");
double val = Double.parseDouble("99.99");

// Primitive to String:
String text = String.valueOf(num);`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        // Average score calculation demonstrating casting
        int score1 = 85;
        int score2 = 90;
        int score3 = 88;

        // Truncated integer division:
        int intAvg = (score1 + score2 + score3) / 3;

        // Exact floating-point division using explicit cast:
        double exactAvg = (double) (score1 + score2 + score3) / 3;

        System.out.println("=== Grade Calculation Diagnostics ===");
        System.out.println("Truncated Average (int):    " + intAvg);
        System.out.printf("Exact Precision Average:    %.2f\\n", exactAvg);

        // String parsing demo
        String inputStr = "250";
        int parsed = Integer.parseInt(inputStr);
        System.out.println("Parsed String + 50:         " + (parsed + 50));
    }
}`,
    expectedOutput: `=== Grade Calculation Diagnostics ===
Truncated Average (int):    87
Exact Precision Average:    87.67
Parsed String + 50:         300`,
    stepByStep: [
      '1. Sum of scores (85 + 90 + 88 = 263) is computed as an integer.',
      '2. (score1 + score2 + score3) / 3 performs integer division yielding 87.',
      '3. In (double) sum / 3, explicit cast promotes 263 to 263.0.',
      '4. Numeric promotion elevates the divisor 3 to 3.0; 263.0 / 3.0 yields 87.6666...',
      '5. Integer.parseInt("250") converts text into numeric integer 250, enabling addition.'
    ],
    commonMistakes: [
      {
        mistake: 'Casting the result after integer division already truncated',
        codeSnippet: `double avg = (double) (5 / 2); // Result: 2.0 instead of 2.5!`,
        correction: 'Cast an operand BEFORE division: double avg = (double) 5 / 2; or double avg = 5.0 / 2;',
        explanation: '5 / 2 evaluates to integer 2 first; casting 2 to double simply produces 2.0.'
      },
      {
        mistake: 'Assuming explicit casting rounds numbers',
        codeSnippet: `int val = (int) 9.99; // Value is 9, NOT 10!`,
        correction: 'Use Math.round(9.99) if mathematical rounding is desired.',
        explanation: 'Type casting unconditionally truncates the fractional digits toward zero.'
      },
      {
        mistake: 'NumberFormatException when parsing invalid strings',
        codeSnippet: `int num = Integer.parseInt("123abc"); // Crashes with java.lang.NumberFormatException`,
        correction: 'Ensure the string contains only valid numeric digits before parsing.',
        explanation: 'parseInt expects pure decimal characters; alphanumeric tokens trigger a runtime parsing exception.'
      }
    ],
    realWorldExample: {
      scenario: 'Financial Currency Conversion & Micro-Cents Engine',
      code: `public class Main {
    public static void main(String[] args) {
        double accountBalance = 1500.99;
        // Converting dollar currency to integer cents avoids floating-point precision errors
        long balanceInCents = (long) Math.round(accountBalance * 100);
        System.out.println("Audit Ledger: " + balanceInCents + " cents");
    }
}`,
      explanation: 'Fintech and e-commerce payment processors (Stripe, PayPal) convert floating-point currency to integer cents (or use BigDecimal) to avoid binary IEEE 754 precision rounding errors.'
    },
    practice: {
      prompt: 'Write a Java program that converts a double temperature = 98.6 into an int. Print: Line 1: "Double: 98.6", Line 2: "Truncated Int: 98".',
      starterCode: `public class Main {
    public static void main(String[] args) {
        // Cast double to int and print both values
    }
}`,
      expectedOutputMatcher: 'Double: 98.6\nTruncated Int: 98',
      hint: 'Use (int) temperature to cast.',
      solution: `public class Main {
    public static void main(String[] args) {
        double temperature = 98.6;
        int truncated = (int) temperature;
        System.out.println("Double: " + temperature);
        System.out.println("Truncated Int: " + truncated);
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-cast-1',
        question: 'Which of the following type conversions requires an explicit cast in Java?',
        options: ['int to double', 'byte to int', 'double to int', 'short to long'],
        correctIndex: 2,
        explanation: 'Converting from a 64-bit floating point double to a 32-bit integer is a narrowing conversion that risks data loss, requiring an explicit cast.'
      },
      {
        id: 'mcq-java-cast-2',
        question: 'What is the evaluated output of: (double) (7 / 2) ?',
        options: ['3.5', '3.0', '3', 'Compilation Error'],
        correctIndex: 1,
        explanation: '7 / 2 performs integer division first, producing 2. Casting 3 to double produces 3.0.'
      },
      {
        id: 'mcq-java-cast-3',
        question: 'What is the result of casting (int) 8.95 in Java?',
        options: ['9', '8', '8.95', '0'],
        correctIndex: 1,
        explanation: 'Casting to int truncates the decimal component completely, producing 8.'
      },
      {
        id: 'mcq-java-cast-4',
        question: 'Which method converts a String "543" into a primitive int in Java?',
        options: ['Integer.parseInt("543")', 'String.toInt("543")', '(int) "543"', 'Integer.cast("543")'],
        correctIndex: 0,
        explanation: 'Integer.parseInt(String) parses the string argument as a signed decimal integer.'
      },
      {
        id: 'mcq-java-cast-5',
        question: 'When adding a byte and a short in Java, what data type is the evaluated result promoted to?',
        options: ['byte', 'short', 'int', 'long'],
        correctIndex: 2,
        explanation: 'Java automatically promotes smaller integer types (byte, short, char) to 32-bit int in binary arithmetic expressions.'
      }
    ],
    codingChallenge: {
      title: 'Precision Average Calculator',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program that defines int a = 7, int b = 4. Calculate exact floating-point division a / b using casting. Print: "Result: 1.75".',
      input_format: 'No input.',
      output_format: 'One line showing the exact decimal quotient.',
      constraints: 'Follow exact casing.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        // Compute exact floating-point division
    }
}`,
      expected_output: `Result: 1.75`,
      test_cases: [
        {
          input: '',
          expected_output: `Result: 1.75`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Widening conversion (smaller to larger) happens automatically without data loss.',
      'Narrowing conversion (larger to smaller) requires explicit casting (type) and truncates values.',
      'Integer division truncates decimals; cast at least one operand to double to preserve fractions.',
      'Parse string inputs to primitives using Integer.parseInt() and Double.parseDouble().'
    ]
  },

  // =========================================================================
  // LESSON 11: Operators in Java
  // =========================================================================
  {
    id: 'top-java-operators',
    number: 11,
    numberDisplay: '11',
    moduleId: 'mod-java-fundamentals-control',
    moduleTitle: 'Module 02: Java Fundamentals & Control Structures',
    title: 'Operators in Java',
    slug: 'java-operators-precedence-logic',
    language: 'java',
    shortDescription: 'Master Java operator categories: arithmetic, assignment, relational, logical short-circuit, unary ++/--, bitwise, shift, ternary, and operator precedence rules.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-type-casting',
    learningObjectives: [
      'Categorize and apply arithmetic, relational, and logical operators in Java',
      'Distinguish prefix (++x) from postfix (x++) increment and decrement evaluation',
      'Understand short-circuit evaluation in logical AND (&&) and logical OR (||)',
      'Utilize compound assignment operators and the ternary operator (?:)',
      'Analyze operator precedence and associativity to evaluate complex expressions'
    ],
    conceptExplanation: `### 1. Categories of Java Operators
Operators are special symbols that perform specific operations on one, two, or three operands:
1. **Arithmetic**: \`+\` (addition), \`-\` (subtraction), \`*\` (multiplication), \`/\` (division), \`%\` (modulus / remainder).
2. **Relational (Comparison)**: \`==\` (equal), \`!=\` (not equal), \`>\` (greater than), \`<\` (less than), \`>=\` (greater or equal), \`<=\` (less or equal). Always return a \`boolean\`.
3. **Logical**: \`&&\` (logical AND), \`||\` (logical OR), \`!\` (logical NOT).
4. **Unary**: \`+\`, \`-\`, \`++\` (increment), \`--\` (decrement), \`!\` (boolean inversion), \`~\` (bitwise complement).
5. **Assignment**: \`=\`, and compound operators \`+=\`, \`-=\`, \`*=\`, \`/=\`, \`%=\`.
6. **Ternary**: \`condition ? trueValue : falseValue\` (compact inline decision).
7. **Bitwise & Shift**: \`&\` (AND), \`|\` (OR), \`^\` (XOR), \`<<\` (left shift), \`>>\` (signed right shift), \`>>>\` (unsigned right shift).

### 2. Prefix vs. Postfix Increment
* **Prefix (\`++x\`)**: Increments the variable value **before** using it in the surrounding expression.
* **Postfix (\`x++\`)**: Uses the current variable value in the surrounding expression **first**, and then increments it.
\`\`\`java
int a = 5;
int b = ++a; // a becomes 6, b is assigned 6

int c = 5;
int d = c++; // d is assigned 5, then c becomes 6
\`\`\`

### 3. Short-Circuit Logical Evaluation
* **\`&&\` (Logical AND)**: If the left-hand operand evaluates to \`false\`, the entire expression *must* be false. Java **skips** evaluating the right-hand operand entirely!
* **\`||\` (Logical OR)**: If the left-hand operand evaluates to \`true\`, the entire expression *must* be true. Java **skips** evaluating the right-hand operand!
This protects against null pointer exceptions and division by zero:
\`\`\`java
if (name != null && name.length() > 0) // Safe! If name is null, length() is never called
if (count != 0 && total / count > 50)  // Safe! Prevents divide-by-zero
\`\`\`

### 4. Operator Precedence Hierarchy (Highest to Lowest)
1. Postfix: \`expr++\`, \`expr--\`
2. Unary: \`++expr\`, \`--expr\`, \`+expr\`, \`-expr\`, \`!\`, \`~\`
3. Multiplicative: \`*\`, \`/\`, \`%\`
4. Additive: \`+\`, \`-\`
5. Shift: \`<<\`, \`>>\`, \`>>>\`
6. Relational: \`<\`, \`>\`, \`<=\`, \`>=\`, \`instanceof\`
7. Equality: \`==\`, \`!=\`
8. Bitwise AND: \`&\`
9. Bitwise XOR: \`^\`
10. Bitwise OR: \`|\`
11. Logical AND: \`&&\`
12. Logical OR: \`||\`
13. Ternary: \`? :\`
14. Assignment: \`=\`, \`+=\`, \`-=\`, \`*=\`, etc.`,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        int x = 10;
        int y = 3;
        int quotient = x / y;
        int remainder = x % y;

        System.out.println("Quotient: " + quotient + ", Remainder: " + remainder);
    }
}`,
      explanation: 'Demonstrates integer division (10 / 3 = 3) and modulus operator (10 % 3 = 1).'
    },
    syntax: `// Ternary syntax:
variable = (condition) ? valueIfTrue : valueIfFalse;

// Compound assignment:
x += 5; // Equivalent to: x = x + 5 (with implicit cast)`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        int score = 75;
        // Ternary Operator:
        String result = (score >= 50) ? "PASSED" : "FAILED";

        // Increment demonstration:
        int counter = 1;
        int post = counter++; // post = 1, counter becomes 2
        int pre = ++counter;  // counter becomes 3, pre = 3

        System.out.println("=== Operator Execution Diagnostics ===");
        System.out.println("Exam Status:       " + result);
        System.out.println("Postfix Assigned:  " + post);
        System.out.println("Prefix Assigned:   " + pre);
        System.out.println("Final Counter Val: " + counter);

        // Modulus parity test:
        boolean isEven = (score % 2 == 0);
        System.out.println("Is Score Even?     " + isEven);
    }
}`,
    expectedOutput: `=== Operator Execution Diagnostics ===
Exam Status:       PASSED
Postfix Assigned:  1
Prefix Assigned:   3
Final Counter Val: 3
Is Score Even?     false`,
    stepByStep: [
      '1. (score >= 50) evaluates to true, so ternary operator selects "PASSED".',
      '2. counter++ assigns current value 1 to post, then increments counter to 2.',
      '3. ++counter increments counter to 3 first, then assigns 3 to pre.',
      '4. 75 % 2 evaluates to remainder 1; (1 == 0) yields boolean false.',
      '5. Results are printed to console stdout.'
    ],
    commonMistakes: [
      {
        mistake: 'Using single = instead of == for comparison',
        codeSnippet: `int x = 5;
if (x = 10) // Error: int cannot be converted to boolean`,
        correction: 'Use == for comparison: if (x == 10).',
        explanation: '= is the assignment operator; == is the equality comparison operator.'
      },
      {
        mistake: 'Misunderstanding Modulus with negative numbers',
        codeSnippet: `int r = -10 % 3; // Evaluates to -1, NOT 2`,
        correction: 'Remember: In Java, the sign of the modulus result always matches the dividend (left operand).',
        explanation: '(-10 % 3) is -1 because -10 = (-3 * 3) + (-1).'
      },
      {
        mistake: 'Using non-short-circuit bitwise & when logical && was needed',
        codeSnippet: `if (obj != null & obj.isValid()) // May throw NullPointerException!`,
        correction: 'Use short-circuit &&: if (obj != null && obj.isValid()).',
        explanation: 'Single & always evaluates BOTH sides, even if the left side is false.'
      }
    ],
    realWorldExample: {
      scenario: 'High-Speed Packet Parity & Flag Checking',
      code: `public class Main {
    public static void main(String[] args) {
        int packetHeader = 0b00001010; // Flags: ACK (bit 1) and SYN (bit 3)
        int SYN_FLAG = 0b00001000;

        boolean isSyn = (packetHeader & SYN_FLAG) != 0;
        System.out.println("Network Packet SYN Active: " + isSyn);
    }
}`,
      explanation: 'Network protocol stacks and device drivers use bitwise AND (&) masks to check packet control flags in single clock cycles.'
    },
    practice: {
      prompt: 'Write a Java program that defines int n = 15. Use the ternary operator to check if n is even or odd, and print "15 is Odd".',
      starterCode: `public class Main {
    public static void main(String[] args) {
        // Use ternary operator to check parity
    }
}`,
      expectedOutputMatcher: '15 is Odd',
      hint: 'String status = (n % 2 == 0) ? "Even" : "Odd";',
      solution: `public class Main {
    public static void main(String[] args) {
        int n = 15;
        String parity = (n % 2 == 0) ? "Even" : "Odd";
        System.out.println(n + " is " + parity);
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-op-1',
        question: 'What is the value of y after: int x = 4; int y = x++; ?',
        options: ['4', '5', '3', '0'],
        correctIndex: 0,
        explanation: 'Postfix increment (x++) evaluates to the current value (4) before incrementing x to 5.'
      },
      {
        id: 'mcq-java-op-2',
        question: 'Why is && called a "short-circuit" logical operator in Java?',
        options: [
          'It runs on lower electrical voltage',
          'If the first condition is false, it skips evaluating the second condition',
          'It causes a compilation short circuit error',
          'It deletes variables from the stack'
        ],
        correctIndex: 1,
        explanation: 'Short-circuit AND avoids evaluating the right-hand operand if the left-hand operand is already false.'
      },
      {
        id: 'mcq-java-op-3',
        question: 'What will 17 % 5 evaluate to in Java?',
        options: ['3', '2', '3.4', '1'],
        correctIndex: 1,
        explanation: '17 divided by 5 is 3 with a remainder of 2 (17 = 5 * 3 + 2).'
      },
      {
        id: 'mcq-java-op-4',
        question: 'What is the syntax structure of the ternary operator in Java?',
        options: [
          'if (condition) -> value',
          'condition ? valueIfTrue : valueIfFalse',
          'condition : valueIfTrue ? valueIfFalse',
          'select(condition, true, false)'
        ],
        correctIndex: 1,
        explanation: 'The ternary operator uses condition ? trueBranch : falseBranch.'
      },
      {
        id: 'mcq-java-op-5',
        question: 'Which operator has higher precedence in Java: multiplication (*) or addition (+)?',
        options: ['Multiplication (*)', 'Addition (+)', 'They have identical precedence', 'Depends on JVM version'],
        correctIndex: 0,
        explanation: 'Multiplicative operators (*, /, %) have higher precedence than additive operators (+, -).'
      }
    ],
    codingChallenge: {
      title: 'Ternary Eligibility Decider',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program that defines int age = 20. Use a ternary operator to print "Eligible to Vote" if age is 18 or greater, otherwise "Not Eligible".',
      input_format: 'No input.',
      output_format: 'One line stating voting eligibility.',
      constraints: 'Follow exact casing.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        // Output voting eligibility
    }
}`,
      expected_output: `Eligible to Vote`,
      test_cases: [
        {
          input: '',
          expected_output: `Eligible to Vote`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Java operators: Arithmetic, Relational, Logical, Unary, Assignment, Ternary, and Bitwise.',
      'Prefix (++x) increments before evaluation; Postfix (x++) evaluates before incrementing.',
      'Short-circuit operators (&&, ||) skip right-hand evaluation when the outcome is already guaranteed.',
      'Use the ternary operator (?:) for concise conditional assignments.'
    ]
  },

  // =========================================================================
  // LESSON 12: User Input and Output (Scanner)
  // =========================================================================
  {
    id: 'top-java-user-input-scanner',
    number: 12,
    numberDisplay: '12',
    moduleId: 'mod-java-fundamentals-control',
    moduleTitle: 'Module 02: Java Fundamentals & Control Structures',
    title: 'User Input and Output',
    slug: 'java-user-input-scanner-printf',
    language: 'java',
    shortDescription: 'Read dynamic user console input with java.util.Scanner: nextInt(), nextDouble(), next(), and nextLine(). Master the newline consumption trap, resource closing, and formatted output with printf().',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-operators',
    learningObjectives: [
      'Import java.util.Scanner and instantiate a console input scanner on System.in',
      'Read integers, floating-point numbers, tokens, and complete text lines',
      'Explain and fix the notorious "Scanner newline consumption trap"',
      'Format output using System.out.printf() format specifiers (%d, %f, %s, %n)',
      'Manage input stream resources properly by closing the Scanner'
    ],
    conceptExplanation: `### 1. The \`java.util.Scanner\` Class
To write interactive console applications that read input from the keyboard, Java provides the **\`Scanner\`** class in the \`java.util\` package.
* **Import Statement**: \`import java.util.Scanner;\` placed at the very top of your source file.
* **Instantiating Scanner**:
  \`\`\`java
  Scanner scanner = new Scanner(System.in);
  \`\`\`
  \`System.in\` represents the standard keyboard input stream.

### 2. Core Scanner Reading Methods
| Method | Data Type Read | Behavior |
| :--- | :--- | :--- |
| **\`nextInt()\`** | \`int\` | Scans the next token as an integer |
| **\`nextLong()\`** | \`long\` | Scans the next token as a 64-bit integer |
| **\`nextDouble()\`** | \`double\` | Scans the next token as a double |
| **\`nextFloat()\`** | \`float\` | Scans the next token as a float |
| **\`nextBoolean()\`** | \`boolean\` | Scans the next token as a boolean (\`true\` / \`false\`) |
| **\`next()\`** | \`String\` | Reads the next single word (stops at whitespace) |
| **\`nextLine()\`** | \`String\` | Reads the entire remaining line until the user presses Enter |

### 3. The Infamous "Newline Consumption Trap"
This is the single most common pitfall encountered by beginner Java programmers:
\`\`\`java
System.out.print("Enter your age: ");
int age = scanner.nextInt(); // Reads integer 20, but leaves the newline character (\\n) in the input buffer!

System.out.print("Enter your full name: ");
String name = scanner.nextLine(); // Instantly consumes the leftover \\n and returns an EMPTY string!
\`\`\`
**The Solution**: Whenever calling \`nextLine()\` immediately after \`nextInt()\`, \`nextDouble()\`, or \`next()\`, insert an extra dummy \`scanner.nextLine()\` to consume the leftover newline:
\`\`\`java
int age = scanner.nextInt();
scanner.nextLine(); // Clears the leftover newline character from buffer
String name = scanner.nextLine(); // Now successfully waits for user input!
\`\`\`

### 4. Formatted Output with \`System.out.printf()\`
While \`println\` simply prints text, \`printf\` (print-formatted) allows precise alignment, decimal precision, and formatting using format specifiers:
* **\`%d\`**: Integer (decimal).
* **\`%.2f\`**: Floating-point formatted to 2 decimal places.
* **\`%s\`**: String.
* **\`%c\`**: Character.
* **\`%n\`**: Platform-independent newline character.
\`\`\`java
double price = 49.995;
System.out.printf("Item: %s | Cost: $%.2f%n", "Keyboard", price);
// Output: Item: Keyboard | Cost: $50.00
\`\`\`

### 5. Closing Scanner Resources
Always call \`scanner.close()\` when your application finishes reading input to prevent resource leaks.`,
    simpleExample: {
      code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        String mockInput = "Jinesh\\n21\\n";
        Scanner sc = new Scanner(mockInput);

        String name = sc.nextLine();
        int age = sc.nextInt();

        System.out.println("Name: " + name + " | Age: " + age);
        sc.close();
    }
}`,
      explanation: 'Demonstrates reading multiple data types from a Scanner stream.'
    },
    syntax: `// Standard Scanner template:
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Read numeric:
        int num = sc.nextInt();
        sc.nextLine(); // Consume leftover newline

        // Read text line:
        String line = sc.nextLine();

        sc.close();
    }
}`,
    codeExample: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        // Simulating console input stream for demonstration
        String inputBuffer = "Aarav Sharma\\n101\\n89.75\\n";
        Scanner sc = new Scanner(inputBuffer);

        String studentName = sc.nextLine();
        int rollNumber = sc.nextInt();
        double percentage = sc.nextDouble();

        System.out.println("=== Student Record Confirmation ===");
        System.out.printf("Student Name: %-15s%n", studentName);
        System.out.printf("Roll Number:  %d%n", rollNumber);
        System.out.printf("Percentage:   %.2f%%%n", percentage);
        System.out.println("===================================");

        sc.close();
    }
}`,
    expectedOutput: `=== Student Record Confirmation ===
Student Name: Aarav Sharma   
Roll Number:  101
Percentage:   89.75%
===================================`,
    stepByStep: [
      '1. Scanner sc is created wrapping the input stream.',
      '2. sc.nextLine() reads "Aarav Sharma" up to the newline delimiter.',
      '3. sc.nextInt() parses integer 101.',
      '4. sc.nextDouble() parses double 89.75.',
      '5. System.out.printf formats percentage to two decimal places (%.2f%%) with trailing percent escape.',
      '6. sc.close() releases underlying stream resources.'
    ],
    commonMistakes: [
      {
        mistake: 'Skipping user input due to unconsumed newline after nextInt()',
        codeSnippet: `int id = sc.nextInt();
String name = sc.nextLine(); // name is empty!`,
        correction: 'Add sc.nextLine() immediately after nextInt() to clear the buffer.',
        explanation: 'nextInt() parses the numeric token and leaves the \\n in the stream; the next nextLine() immediately consumes that \\n.'
      },
      {
        mistake: 'Typing letters when nextInt() expects an integer',
        codeSnippet: `// User enters "hello" when sc.nextInt() runs -> InputMismatchException`,
        correction: 'Check sc.hasNextInt() before calling sc.nextInt() to validate input safely.',
        explanation: 'Calling nextInt() on non-numeric text triggers java.util.InputMismatchException.'
      },
      {
        mistake: 'Using %f for integers in printf',
        codeSnippet: `System.out.printf("%f", 42); // IllegalFormatConversionException: f != java.lang.Integer`,
        correction: 'Use %d for integers and %f for floating point numbers.',
        explanation: 'Format specifiers must strictly correspond to the data type of the argument provided.'
      }
    ],
    realWorldExample: {
      scenario: 'Interactive ATM Console Terminal',
      code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        String testStream = "1000.50\\n";
        Scanner sc = new Scanner(testStream);

        double deposit = sc.nextDouble();
        System.out.printf("[ATM LEDGER] Successfully deposited: $%.2f%n", deposit);
        sc.close();
    }
}`,
      explanation: 'Console admin tools and interactive maintenance utilities utilize Scanner to collect configuration parameters and operator commands safely.'
    },
    practice: {
      prompt: 'Write a Java program that creates a Scanner reading "4 6". Calculate the sum and print "Sum: 10".',
      starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner("4 6");
        // Read the two integers, compute sum, and print
    }
}`,
      expectedOutputMatcher: 'Sum: 10',
      hint: 'int a = sc.nextInt(); int b = sc.nextInt(); System.out.println("Sum: " + (a + b));',
      solution: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner("4 6");
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println("Sum: " + (a + b));
        sc.close();
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-scan-1',
        question: 'Which package must be imported to use the Scanner class in Java?',
        options: ['java.io', 'java.util', 'java.lang', 'java.net'],
        correctIndex: 1,
        explanation: 'Scanner belongs to the java.util utility package and must be imported via import java.util.Scanner;.'
      },
      {
        id: 'mcq-java-scan-2',
        question: 'What happens if a user enters "Python" when sc.nextInt() is called?',
        options: [
          'It automatically converts the text to ASCII numbers',
          'It throws InputMismatchException',
          'It returns 0',
          'It ignores the input and continues'
        ],
        correctIndex: 1,
        explanation: 'InputMismatchException is thrown by Scanner when the retrieved token does not match the expected type pattern.'
      },
      {
        id: 'mcq-java-scan-3',
        question: 'Why does nextLine() immediately skip user input after a call to nextInt()?',
        options: [
          'Because nextInt() deletes the scanner object',
          'Because nextInt() leaves the trailing newline character in the input buffer, which nextLine() immediately consumes',
          'Because Java does not support reading strings after integers',
          'Because the keyboard disconnected'
        ],
        correctIndex: 1,
        explanation: 'nextInt() only consumes the integer characters, leaving \\n in the buffer. The following nextLine() consumes the leftover newline.'
      },
      {
        id: 'mcq-java-scan-4',
        question: 'Which format specifier formats a decimal number to two decimal places in System.out.printf()?',
        options: ['%2d', '%.2f', '%f.2', '%d.2'],
        correctIndex: 1,
        explanation: '%.2f formats a floating-point number with exactly 2 digits after the decimal point.'
      },
      {
        id: 'mcq-java-scan-5',
        question: 'Which method reads an entire line of text until the Enter key is pressed?',
        options: ['sc.next()', 'sc.read()', 'sc.nextLine()', 'sc.readLine()'],
        correctIndex: 2,
        explanation: 'sc.nextLine() advances the scanner past the current line and returns the input that was skipped.'
      }
    ],
    codingChallenge: {
      title: 'Formatted Receipt Printer',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program that reads two tokens from Scanner("Laptop 899.95"): a string product and a double price. Print: Line 1: "Product: Laptop", Line 2: "Price: $899.95" using printf.',
      input_format: 'None (use Scanner with "Laptop 899.95").',
      output_format: 'Two formatted lines.',
      constraints: 'Format price with %.2f.',
      starter_code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner("Laptop 899.95");
        // Read product and price and print
    }
}`,
      expected_output: `Product: Laptop\nPrice: $899.95`,
      test_cases: [
        {
          input: '',
          expected_output: `Product: Laptop\nPrice: $899.95`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Scanner in java.util provides nextInt(), nextDouble(), next(), and nextLine() for user input.',
      'Always add a dummy sc.nextLine() to clear the newline character buffer after nextInt() or nextDouble().',
      'System.out.printf() provides format specifiers: %d (integers), %.2f (decimals), %s (strings), %n (newlines).',
      'Always close the Scanner when done to prevent resource leaks.'
    ]
  },

  // =========================================================================
  // LESSON 13: Conditional Statements
  // =========================================================================
  {
    id: 'top-java-conditionals',
    number: 13,
    numberDisplay: '13',
    moduleId: 'mod-java-fundamentals-control',
    moduleTitle: 'Module 02: Java Fundamentals & Control Structures',
    title: 'Conditional Statements',
    slug: 'java-conditional-statements-switch',
    language: 'java',
    shortDescription: 'Master decision-making structures in Java: if, if-else, else-if ladders, nested conditions, traditional switch with break/fallthrough, and modern Java 14+ switch expressions (->).',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-user-input-scanner',
    learningObjectives: [
      'Implement structured decision logic using if, if-else, and else-if ladders',
      'Construct nested conditional logic and compound boolean expressions',
      'Explain traditional switch statements, case labels, break statements, and fallthrough bugs',
      'Utilize modern Java switch expressions with arrow syntax (case ->) to eliminate fallthrough'
    ],
    conceptExplanation: `### 1. Decision-Making in Java
Programs must make choices based on runtime conditions. Java provides two primary decision constructs:
1. **\`if\` / \`else\` Family**: Evaluates boolean conditions sequentially.
2. **\`switch\` Statements & Expressions**: Matches an expression against constant discrete case labels.

### 2. The \`if-else\` Hierarchy
* **Single \`if\`**: Executes a block only if the condition evaluates to \`true\`.
* **\`if-else\`**: Executes the \`if\` block when true, otherwise executes the \`else\` block.
* **\`else-if\` Ladder**: Evaluates conditions top-to-bottom; as soon as one evaluates to true, its block executes and the rest of the ladder is skipped.
\`\`\`java
if (score >= 90) {
    grade = 'A';
} else if (score >= 80) {
    grade = 'B';
} else if (score >= 70) {
    grade = 'C';
} else {
    grade = 'F';
}
\`\`\`

### 3. Traditional \`switch\` Statements & The Fallthrough Trap
In traditional Java switch statements:
\`\`\`java
int day = 2;
switch (day) {
    case 1:
        System.out.println("Monday");
        break; // Crucial! Prevents fallthrough to case 2
    case 2:
        System.out.println("Tuesday");
        break;
    default:
        System.out.println("Other day");
        break;
}
\`\`\`
**The Fallthrough Bug**: If you omit \`break\`, execution "falls through" into subsequent cases regardless of whether their condition matches, executing unexpected code.

### 4. Modern Java Switch Expressions (Java 14+)
Modern Java introduced **Switch Expressions** using arrow syntax (\`->\`).
Benefits:
- Eliminates the need for \`break\` statements.
- **Impossible to have accidental fallthrough bugs**.
- Can return a value directly into a variable!
\`\`\`java
int day = 3;
String dayName = switch (day) {
    case 1 -> "Monday";
    case 2 -> "Tuesday";
    case 3 -> "Wednesday";
    case 4 -> "Thursday";
    case 5 -> "Friday";
    default -> "Weekend / Invalid";
};
\`\`\`
Supported types for switch: \`byte\`, \`short\`, \`char\`, \`int\`, \`String\`, and \`enum\`. (Floats and doubles are not supported).`,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        int number = -5;

        if (number > 0) {
            System.out.println("Positive");
        } else if (number < 0) {
            System.out.println("Negative");
        } else {
            System.out.println("Zero");
        }
    }
}`,
      explanation: 'Evaluates whether a number is positive, negative, or zero using an else-if ladder.'
    },
    syntax: `// If-Else Ladder:
if (condition1) {
    // code
} else if (condition2) {
    // code
} else {
    // fallback
}

// Modern Switch Expression:
String result = switch (key) {
    case VAL1 -> "Option 1";
    case VAL2, VAL3 -> "Option 2";
    default -> "Default";
};`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        int score = 85;
        char grade;

        // 1. Grade Determination via else-if ladder
        if (score >= 90) {
            grade = 'A';
        } else if (score >= 80) {
            grade = 'B';
        } else if (score >= 70) {
            grade = 'C';
        } else {
            grade = 'F';
        }

        // 2. Feedback via Modern Switch Expression
        String feedback = switch (grade) {
            case 'A' -> "Exceptional Mastery!";
            case 'B' -> "Strong Performance.";
            case 'C' -> "Satisfactory Completion.";
            default  -> "Needs Review & Remediation.";
        };

        System.out.println("=== Academic Evaluation Result ===");
        System.out.println("Score:    " + score);
        System.out.println("Grade:    " + grade);
        System.out.println("Remarks:  " + feedback);
    }
}`,
    expectedOutput: `=== Academic Evaluation Result ===
Score:    85
Grade:    B
Remarks:  Strong Performance.`,
    stepByStep: [
      '1. score is initialized to 85.',
      '2. First condition (score >= 90) evaluates to false.',
      '3. Second condition (score >= 80) evaluates to true; grade is assigned \'B\'; ladder terminates.',
      '4. Switch expression matches grade \'B\' directly and yields "Strong Performance.".',
      '5. Results are printed to console stdout.'
    ],
    commonMistakes: [
      {
        mistake: 'Forgetting break in traditional switch statements',
        codeSnippet: `switch (choice) {
    case 1: System.out.println("One"); // Missing break!
    case 2: System.out.println("Two");
}`,
        correction: 'Add break, or upgrade to modern arrow syntax (case 1 ->).',
        explanation: 'Without break, execution spills over into case 2, printing both "One" and "Two".'
      },
      {
        mistake: 'Accidental semicolon after if statement',
        codeSnippet: `if (score >= 50); // Semicolon creates an empty statement!
{
    System.out.println("Passed"); // Always executes regardless of condition!
}`,
        correction: 'Never put a semicolon directly after the if condition: if (score >= 50) { ... }',
        explanation: 'The semicolon terminates the if branch immediately, making the following brace block unconditional.'
      },
      {
        mistake: 'Switching on floating-point double or float',
        codeSnippet: `double temp = 98.6;
switch (temp) { ... } // Compiler Error: cannot switch on a value of type double`,
        correction: 'Use if-else ladders for floating point comparisons.',
        explanation: 'Java switch only supports integer types (byte, short, char, int), String, and enum.'
      }
    ],
    realWorldExample: {
      scenario: 'Cloud HTTP Microservice Response Router',
      code: `public class Main {
    public static void main(String[] args) {
        int httpStatusCode = 404;

        String statusMessage = switch (httpStatusCode) {
            case 200 -> "OK: Request succeeded.";
            case 400 -> "BAD REQUEST: Invalid client payload.";
            case 401 -> "UNAUTHORIZED: Token missing or expired.";
            case 404 -> "NOT FOUND: Requested endpoint does not exist.";
            case 500 -> "INTERNAL SERVER ERROR: Unexpected exception.";
            default  -> "STATUS CODE: " + httpStatusCode;
        };

        System.out.println("[GATEWAY] " + statusMessage);
    }
}`,
      explanation: 'Modern microservices and API gateways use switch expressions for fast, bug-free HTTP status dispatching and routing.'
    },
    practice: {
      prompt: 'Write a Java program that defines int day = 1. Use a switch statement or expression to print "Monday" if day is 1, and "Other" otherwise.',
      starterCode: `public class Main {
    public static void main(String[] args) {
        // Output day name using switch
    }
}`,
      expectedOutputMatcher: 'Monday',
      hint: 'switch (day) { case 1 -> "Monday"; default -> "Other"; }',
      solution: `public class Main {
    public static void main(String[] args) {
        int day = 1;
        String name = switch (day) {
            case 1 -> "Monday";
            default -> "Other";
        };
        System.out.println(name);
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-cond-1',
        question: 'Which of the following data types CANNOT be used as the selector expression in a Java switch statement?',
        options: ['int', 'String', 'double', 'char'],
        correctIndex: 2,
        explanation: 'Floating-point types (float, double) cannot be used in a switch statement due to precision representation issues.'
      },
      {
        id: 'mcq-java-cond-2',
        question: 'What happens in a traditional switch statement if a matching case does not end with a break statement?',
        options: [
          'A compilation error is generated',
          'Execution continues into subsequent cases regardless of their condition (fallthrough)',
          'The program terminates immediately',
          'The switch restarts from the top'
        ],
        correctIndex: 1,
        explanation: 'Fallthrough occurs when break is omitted, causing execution to continue down into following cases.'
      },
      {
        id: 'mcq-java-cond-3',
        question: 'What major advantage do modern Java switch expressions (case ->) provide over traditional switch statements?',
        options: [
          'They allow division by zero',
          'They prevent accidental fallthrough bugs and can return values directly',
          'They execute in Python instead of Java',
          'They remove the need for classes'
        ],
        correctIndex: 1,
        explanation: 'Arrow syntax (case ->) automatically isolates case execution, preventing fallthrough bugs and allowing direct expression assignment.'
      },
      {
        id: 'mcq-java-cond-4',
        question: 'In an else-if ladder with four conditions, how many branches will execute if the first two conditions are both true?',
        options: ['Both branches', 'Only the first branch', 'All four branches', 'None'],
        correctIndex: 1,
        explanation: 'An else-if ladder executes only the first matching branch whose condition evaluates to true, skipping all subsequent branches.'
      },
      {
        id: 'mcq-java-cond-5',
        question: 'What is printed by: int x = 10; if (x > 5) System.out.print("A"); else System.out.print("B"); ?',
        options: ['A', 'B', 'AB', 'Compilation Error'],
        correctIndex: 0,
        explanation: 'Since 10 > 5 is true, the if branch executes, printing "A".'
      }
    ],
    codingChallenge: {
      title: 'Number Parity and Sign Classifier',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program that defines int num = 14. If num is greater than 0 and even, print "Positive Even". If greater than 0 and odd, print "Positive Odd". Otherwise print "Other".',
      input_format: 'No input.',
      output_format: 'One line showing the classification.',
      constraints: 'Exact text match.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        // Implement conditional classification
    }
}`,
      expected_output: `Positive Even`,
      test_cases: [
        {
          input: '',
          expected_output: `Positive Even`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Use if, if-else, and else-if ladders to execute code based on boolean conditions.',
      'Traditional switch statements require break to prevent accidental fallthrough execution bugs.',
      'Modern Java switch expressions with arrow syntax (case ->) prevent fallthrough and return values directly.',
      'Switch supports byte, short, char, int, String, and enum, but not float or double.'
    ]
  },

  // =========================================================================
  // LESSON 14: For Loop
  // =========================================================================
  {
    id: 'top-java-for-loop',
    number: 14,
    numberDisplay: '14',
    moduleId: 'mod-java-fundamentals-control',
    moduleTitle: 'Module 02: Java Fundamentals & Control Structures',
    title: 'For Loop',
    slug: 'java-for-loop-iteration-patterns',
    language: 'java',
    shortDescription: 'Master definite iteration with the Java for loop: initialization, boolean condition, update expression, trace tables, accumulator patterns, nested loops, and pattern printing.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-conditionals',
    learningObjectives: [
      'Construct standard for loops with initialization, condition, and update expressions',
      'Trace step-by-step loop iterations using trace tables',
      'Implement accumulator patterns for sums, products, and factorials',
      'Design nested for loops to generate multi-dimensional grids and geometric patterns',
      'Identify and prevent off-by-one errors and infinite loops'
    ],
    conceptExplanation: `### 1. The Anatomy of a \`for\` Loop
A **\`for\` loop** is an entry-controlled loop designed for **definite iteration**—when the exact number of repetitions is known in advance.
\`\`\`java
for (initialization; condition; update) {
    // Body statements
}
\`\`\`
Follow the precise execution lifecycle:
1. **Initialization**: Executes **only once** when the loop first begins. Usually declares a counter variable (e.g., \`int i = 0\`).
2. **Condition**: Evaluated before *every* iteration. If \`true\`, the body executes. If \`false\`, the loop terminates immediately.
3. **Body Execution**: Statements inside the curly braces execute.
4. **Update**: Executes after the body finishes (e.g., \`i++\`). Control then jumps back to Step 2 (Condition).

### 2. Trace Table Demonstration
Let's trace: \`for (int i = 1; i <= 3; i++) { sum += i; }\` with initial \`sum = 0\`:
| Iteration | Counter \`i\` | Condition (\`i <= 3\`) | Action (\`sum += i\`) | New \`sum\` | Update (\`i++\`) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 1 | 1 <= 3 (True) | 0 + 1 | 1 | 2 |
| 2 | 2 | 2 <= 3 (True) | 1 + 2 | 3 | 3 |
| 3 | 3 | 3 <= 3 (True) | 3 + 3 | 6 | 4 |
| 4 | 4 | 4 <= 3 (False) | Loop Terminates | 6 | - |

### 3. Accumulator Pattern
A standard programming pattern where a variable outside the loop accumulates results on each iteration:
* **Sum Accumulation**: \`int sum = 0; for (...) { sum += val; }\`
* **Factorial / Product**: \`long product = 1; for (...) { product *= val; }\`

### 4. Nested \`for\` Loops
Loops can be placed inside loops. For every single iteration of the outer loop, the inner loop executes its complete set of iterations:
\`\`\`java
for (int row = 1; row <= 3; row++) {
    for (int col = 1; col <= 3; col++) {
        System.out.print("* ");
    }
    System.out.println(); // Newline after row completes
}
\`\`\`
This produces a 3x3 square grid of asterisks.`,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            System.out.println("Iteration: " + i);
        }
    }
}`,
      explanation: 'Prints numbers 1 through 5 using a standard counter loop.'
    },
    syntax: `// Standard for loop:
for (int i = 0; i < count; i++) {
    // Body code
}

// Counting backwards:
for (int i = count; i >= 1; i--) {
    // Body code
}`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        int n = 5;
        int sum = 0;
        long factorial = 1;

        for (int i = 1; i <= n; i++) {
            sum += i;
            factorial *= i;
        }

        System.out.println("=== Loop Accumulator Results ===");
        System.out.println("Count N:              " + n);
        System.out.println("Sum of 1 to " + n + ":       " + sum);
        System.out.println("Factorial of " + n + "!:      " + factorial);

        // Pattern generation:
        System.out.println("Triangle Pattern:");
        for (int r = 1; r <= 3; r++) {
            for (int c = 1; c <= r; c++) {
                System.out.print("* ");
            }
            System.out.println();
        }
    }
}`,
    expectedOutput: `=== Loop Accumulator Results ===
Count N:              5
Sum of 1 to 5:       15
Factorial of 5!:      120
Triangle Pattern:
* 
* * 
* * * `,
    stepByStep: [
      '1. Loop counter i is initialized to 1.',
      '2. In each iteration, sum adds i and factorial multiplies by i.',
      '3. When i reaches 6, condition (6 <= 5) is false; accumulator loop exits.',
      '4. Nested loops run: row 1 prints 1 star, row 2 prints 2 stars, row 3 prints 3 stars.',
      '5. Output is displayed cleanly on console stdout.'
    ],
    commonMistakes: [
      {
        mistake: 'Off-by-one error (using <= instead of < when iterating array indices)',
        codeSnippet: `int[] arr = new int[5];
for (int i = 0; i <= arr.length; i++) // Throws ArrayIndexOutOfBoundsException at i = 5`,
        correction: 'Use i < arr.length for zero-indexed collections.',
        explanation: 'An array of size 5 has valid indices 0, 1, 2, 3, 4. Accessing index 5 crashes at runtime.'
      },
      {
        mistake: 'Accidental semicolon after for loop header',
        codeSnippet: `for (int i = 0; i < 5; i++); // Empty statement!
{
    System.out.println("Hi"); // Only runs ONCE after the loop finishes!
}`,
        correction: 'Do not put a semicolon after the loop header.',
        explanation: 'The semicolon tells the compiler that the loop body is empty.'
      },
      {
        mistake: 'Creating an infinite loop with wrong update expression',
        codeSnippet: `for (int i = 1; i <= 5; i--) // Decrementing means i <= 5 is always true!`,
        correction: 'Ensure the update moves the counter toward terminating the condition.',
        explanation: 'If the counter moves away from the termination boundary, the loop runs infinitely.'
      }
    ],
    realWorldExample: {
      scenario: 'Cryptographic Hash Block Iteration',
      code: `public class Main {
    public static void main(String[] args) {
        int rounds = 4;
        System.out.println("[CRYPTO] Beginning 4-round cryptographic permutation:");
        for (int round = 1; round <= rounds; round++) {
            System.out.println(" -> Round " + round + ": Key schedule transformed.");
        }
        System.out.println("[CRYPTO] Block encryption finalized.");
    }
}`,
      explanation: 'Symmetric encryption algorithms (such as AES) use fixed-iteration for loops to execute substitution-permutation rounds across cipher data blocks.'
    },
    practice: {
      prompt: 'Write a Java program that uses a for loop to calculate the sum of numbers from 1 to 4 and prints "Total: 10".',
      starterCode: `public class Main {
    public static void main(String[] args) {
        // Compute sum using for loop
    }
}`,
      expectedOutputMatcher: 'Total: 10',
      hint: 'int sum = 0; for (int i = 1; i <= 4; i++) sum += i;',
      solution: `public class Main {
    public static void main(String[] args) {
        int sum = 0;
        for (int i = 1; i <= 4; i++) {
            sum += i;
        }
        System.out.println("Total: " + sum);
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-for-1',
        question: 'How many times will this loop execute: for (int i = 0; i < 5; i++) ?',
        options: ['4 times', '5 times', '6 times', 'Infinite times'],
        correctIndex: 1,
        explanation: 'The loop executes for i = 0, 1, 2, 3, 4, which is exactly 5 iterations.'
      },
      {
        id: 'mcq-java-for-2',
        question: 'When is the update expression (e.g., i++) in a standard for loop executed?',
        options: [
          'Before the condition is checked',
          'At the very beginning of the loop only',
          'After the loop body executes in each iteration',
          'Never'
        ],
        correctIndex: 2,
        explanation: 'In every iteration, the loop body executes first, and then the update expression runs before the condition is checked again.'
      },
      {
        id: 'mcq-java-for-3',
        question: 'What is an "off-by-one" error?',
        options: [
          'A hardware memory failure',
          'A logic bug where a loop iterates one time too many or one time too few',
          'A syntax error caused by missing braces',
          'A division by zero'
        ],
        correctIndex: 1,
        explanation: 'Off-by-one errors happen when boundary conditions (< vs <= or 0 vs 1) cause loops to execute one too many or few times.'
      },
      {
        id: 'mcq-java-for-4',
        question: 'What is printed by: for (int i = 1; i <= 3; i++) System.out.print(i + " "); ?',
        options: ['1 2 3 ', '0 1 2 ', '1 2 3 4 ', '3 2 1 '],
        correctIndex: 0,
        explanation: 'i takes values 1, 2, and 3, printing "1 2 3 ".'
      },
      {
        id: 'mcq-java-for-5',
        question: 'In a nested loop with an outer loop running 3 times and an inner loop running 4 times, how many times does the inner loop body execute in total?',
        options: ['7 times', '12 times', '4 times', '3 times'],
        correctIndex: 1,
        explanation: '3 outer iterations * 4 inner iterations = 12 total inner executions.'
      }
    ],
    codingChallenge: {
      title: 'Even Numbers Generator',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program using a for loop that prints even numbers from 2 to 8 separated by spaces: "2 4 6 8 ".',
      input_format: 'No input.',
      output_format: 'One line containing the even numbers separated by spaces.',
      constraints: 'Exact output match.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        // Output even numbers
    }
}`,
      expected_output: `2 4 6 8 `,
      test_cases: [
        {
          input: '',
          expected_output: `2 4 6 8 `,
          is_hidden: false
        }
      ]
    },
    summary: [
      'for loops are designed for definite iteration with known repetition counts.',
      'Loop lifecycle: Initialization -> Condition Check -> Body Execution -> Update Expression.',
      'Accumulator patterns collect sums or products across iterations.',
      'Nested loops enable multi-dimensional grid navigation and pattern generation.'
    ]
  },

  // =========================================================================
  // LESSON 15: While and Do-While Loops
  // =========================================================================
  {
    id: 'top-java-while-loops',
    number: 15,
    numberDisplay: '15',
    moduleId: 'mod-java-fundamentals-control',
    moduleTitle: 'Module 02: Java Fundamentals & Control Structures',
    title: 'While and Do-While Loops',
    slug: 'java-while-dowhile-loops',
    language: 'java',
    shortDescription: 'Master indefinite iteration with while and do-while loops: entry-controlled vs. exit-controlled loops, guaranteed execution, digit reversal, palindrome numbers, and menu loops.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-for-loop',
    learningObjectives: [
      'Implement indefinite iteration using while loops',
      'Understand exit-controlled do-while loops that guarantee at least one execution',
      'Compare for, while, and do-while loops to choose the optimal construct',
      'Solve classic mathematical problems: sum of digits, reversing numbers, and palindrome checks',
      'Build robust menu-driven console applications that loop until user exit'
    ],
    conceptExplanation: `### 1. Indefinite Iteration: The \`while\` Loop
When you do not know the exact number of iterations in advance—such as reading until the end of a file or waiting for a user to guess a secret number—use a **\`while\` loop**.
A \`while\` loop is an **entry-controlled loop**: the boolean condition is checked **before** every iteration. If the condition is false initially, the body will execute **zero times**.
\`\`\`java
while (condition) {
    // Body code
    // Must update condition variable to prevent infinite loop!
}
\`\`\`

### 2. The Exit-Controlled \`do-while\` Loop
A **\`do-while\` loop** is an **exit-controlled loop**: the body executes **first**, and the condition is evaluated **after** each iteration.
*Key Guarantee*: A \`do-while\` loop is **guaranteed to execute at least once**, even if the condition is false from the very start!
\`\`\`java
do {
    // Body code - guaranteed to execute at least once!
} while (condition); // Notice the required terminating semicolon!
\`\`\`

### 3. Comparison of Java Loops
| Loop Type | Control Type | When Condition is Evaluated | Minimum Iterations | Ideal Use Case |
| :--- | :--- | :--- | :---: | :--- |
| **\`for\`** | Entry-controlled | Before each iteration | \`0\` | Known number of repetitions (counters, arrays) |
| **\`while\`** | Entry-controlled | Before each iteration | \`0\` | Unknown number of repetitions dependent on state |
| **\`do-while\`** | Exit-controlled | After each iteration | \`1\` | Menus, input prompts that must display at least once |

### 4. Mathematical Problem Solving: Digit Processing
A fundamental programming technique uses \`while (n > 0)\` combined with \`% 10\` and \`/ 10\`:
* \`lastDigit = n % 10;\` extracts the rightmost digit.
* \`n = n / 10;\` removes the rightmost digit (integer division).
* \`reversed = (reversed * 10) + lastDigit;\` builds the reversed number.`,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        int count = 1;
        while (count <= 3) {
            System.out.println("While Count: " + count);
            count++;
        }
    }
}`,
      explanation: 'A basic while loop counting from 1 to 3.'
    },
    syntax: `// while syntax:
while (booleanCondition) {
    // statements
}

// do-while syntax:
do {
    // statements (runs at least once)
} while (booleanCondition);`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        int originalNumber = 12321;
        int n = originalNumber;
        int reversed = 0;
        int sumOfDigits = 0;

        // Process digits with while loop
        while (n > 0) {
            int digit = n % 10;
            sumOfDigits += digit;
            reversed = (reversed * 10) + digit;
            n /= 10;
        }

        boolean isPalindrome = (originalNumber == reversed);

        System.out.println("=== Number Analysis Diagnostics ===");
        System.out.println("Original Number: " + originalNumber);
        System.out.println("Reversed Number: " + reversed);
        System.out.println("Sum of Digits:   " + sumOfDigits);
        System.out.println("Is Palindrome?   " + isPalindrome);
    }
}`,
    expectedOutput: `=== Number Analysis Diagnostics ===
Original Number: 12321
Reversed Number: 12321
Sum of Digits:   9
Is Palindrome?   true`,
    stepByStep: [
      '1. n is initialized to 12321.',
      '2. In iteration 1: digit = 1, sum = 1, reversed = 1, n becomes 1232.',
      '3. In iteration 2: digit = 2, sum = 3, reversed = 12, n becomes 123.',
      '4. Iterations continue until n becomes 0; while loop terminates.',
      '5. originalNumber == reversed evaluates to true, proving 12321 is a palindrome.'
    ],
    commonMistakes: [
      {
        mistake: 'Forgetting to update the loop condition variable inside a while loop',
        codeSnippet: `int i = 1;
while (i <= 5) {
    System.out.println(i);
    // Missing i++; -> Infinite loop!
}`,
        correction: 'Always ensure the loop body modifies state so the condition eventually becomes false.',
        explanation: 'Without updating the counter, i remains 1 indefinitely, freezing the program.'
      },
      {
        mistake: 'Forgetting the semicolon at the end of a do-while loop',
        codeSnippet: `do {
    System.out.println("Hello");
} while (x < 5) // Syntax Error: ';' expected`,
        correction: 'Always terminate do-while with a semicolon: } while (x < 5);',
        explanation: 'Unlike for and while, the do-while loop ends with a statement that requires a semicolon.'
      }
    ],
    realWorldExample: {
      scenario: 'Retry Policy for Network Microservice Connections',
      code: `public class Main {
    public static void main(String[] args) {
        int maxAttempts = 3;
        int attempts = 0;
        boolean connected = false;

        do {
            attempts++;
            System.out.println("[RETRY] Attempt " + attempts + " connecting to database...");
            if (attempts == 2) {
                connected = true;
            }
        } while (!connected && attempts < maxAttempts);

        System.out.println("[STATUS] Database connected successfully on attempt: " + attempts);
    }
}`,
      explanation: 'Microservice resilient connection retry policies use do-while loops because they must attempt a network handshake at least once before inspecting the return code.'
    },
    practice: {
      prompt: 'Write a Java program that reverses the number 456 using a while loop and prints "Reversed: 654".',
      starterCode: `public class Main {
    public static void main(String[] args) {
        int n = 456;
        // Reverse n and print
    }
}`,
      expectedOutputMatcher: 'Reversed: 654',
      hint: 'int rev = 0; while(n > 0) { rev = rev * 10 + n % 10; n /= 10; }',
      solution: `public class Main {
    public static void main(String[] args) {
        int n = 456;
        int rev = 0;
        while (n > 0) {
            rev = rev * 10 + (n % 10);
            n /= 10;
        }
        System.out.println("Reversed: " + rev);
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-while-1',
        question: 'What is the minimum number of times a while loop can execute?',
        options: ['0 times', '1 time', '2 times', 'Infinite times'],
        correctIndex: 0,
        explanation: 'A while loop checks its condition before the first iteration; if false initially, it executes 0 times.'
      },
      {
        id: 'mcq-java-while-2',
        question: 'What is the minimum number of times a do-while loop is guaranteed to execute?',
        options: ['0 times', '1 time', 'Depends on condition', '2 times'],
        correctIndex: 1,
        explanation: 'Because do-while is exit-controlled, the body executes before the condition is evaluated, guaranteeing at least 1 execution.'
      },
      {
        id: 'mcq-java-while-3',
        question: 'Which operation extracts the rightmost single digit of an integer in Java?',
        options: ['n / 10', 'n % 10', 'n - 10', 'n * 10'],
        correctIndex: 1,
        explanation: 'The modulus operator n % 10 yields the remainder after division by 10, which is the last digit.'
      },
      {
        id: 'mcq-java-while-4',
        question: 'Which loop construct is preferred when the number of iterations depends on user input or state change rather than a fixed count?',
        options: ['for loop', 'while loop', 'enhanced for-each', 'switch statement'],
        correctIndex: 1,
        explanation: 'while loops are ideal for indefinite repetition where the stopping condition depends on external events.'
      },
      {
        id: 'mcq-java-while-5',
        question: 'What must be placed at the end of a do-while loop header: do { ... } while (condition) ?',
        options: ['A colon (:)', 'A semicolon (;)', 'A closing curly brace', 'Nothing'],
        correctIndex: 1,
        explanation: 'do-while is unique among Java loops in requiring a closing semicolon (;).'
      }
    ],
    codingChallenge: {
      title: 'Digit Counter Engine',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program that defines int number = 98765. Use a while loop to count how many digits it contains. Print: "Digits: 5".',
      input_format: 'No input.',
      output_format: 'One line showing the digit count.',
      constraints: 'Exact text match.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        int number = 98765;
        // Count digits and print
    }
}`,
      expected_output: `Digits: 5`,
      test_cases: [
        {
          input: '',
          expected_output: `Digits: 5`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'while is an entry-controlled loop suitable for indefinite iteration (minimum 0 executions).',
      'do-while is an exit-controlled loop that guarantees at least 1 execution.',
      'Modulo 10 (% 10) and integer division (/ 10) are the fundamental algorithms for number parsing.',
      'Always ensure loop bodies modify state to prevent infinite loops.'
    ]
  },

  // =========================================================================
  // LESSON 16: Break, Continue, and Nested Loops
  // =========================================================================
  {
    id: 'top-java-loop-control',
    number: 16,
    numberDisplay: '16',
    moduleId: 'mod-java-fundamentals-control',
    moduleTitle: 'Module 02: Java Fundamentals & Control Structures',
    title: 'Break, Continue, and Nested Loops',
    slug: 'java-break-continue-labeled-loops',
    language: 'java',
    shortDescription: 'Master control flow alteration inside loops: the break statement for early termination, continue for skipping iterations, nested loop coordination, and labeled breaks.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-while-loops',
    learningObjectives: [
      'Control loop termination immediately using the break statement',
      'Skip the remainder of the current iteration using the continue statement',
      'Differentiate the behavioral impact of break versus continue',
      'Coordinate nested loops to search matrices and multidimensional data',
      'Utilize labeled break and continue statements to break out of outer loops'
    ],
    conceptExplanation: `### 1. The \`break\` Statement
The **\`break\`** statement immediately aborts the loop or switch construct enclosing it. Execution resumes at the statement immediately following the loop.
*Common Use Case*: Early exit when a searched item is located:
\`\`\`java
for (int i = 0; i < items.length; i++) {
    if (items[i] == target) {
        found = true;
        break; // Stop searching! No need to check the rest of the array.
    }
}
\`\`\`

### 2. The \`continue\` Statement
The **\`continue\`** statement skips the rest of the current iteration's body and jumps immediately to the next iteration (evaluating the update expression in a \`for\` loop or the condition in a \`while\` loop).
*Common Use Case*: Filtering unwanted data:
\`\`\`java
for (int i = 1; i <= 10; i++) {
    if (i % 2 != 0) {
        continue; // Skip odd numbers
    }
    System.out.println(i); // Only prints even numbers
}
\`\`\`

### 3. Comparing \`break\` vs. \`continue\`
* **\`break\`**: "I am completely done with this entire loop. Exit right now."
* **\`continue\`**: "I am done with this specific turn. Skip to the next iteration."

### 4. Labeled \`break\` and \`continue\`
By default, \`break\` only exits the **innermost** loop. In nested loops, if an inner loop needs to break all the way out of an outer loop, Java provides **labeled statements**:
\`\`\`java
outerLoop:
for (int r = 0; r < 5; r++) {
    for (int c = 0; c < 5; c++) {
        if (matrix[r][c] == target) {
            System.out.println("Found at row " + r + ", col " + c);
            break outerLoop; // Exits BOTH loops simultaneously!
        }
    }
}
\`\`\``,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            if (i == 3) break; // Exits when i is 3
            System.out.print(i + " ");
        }
    }
}`,
      explanation: 'Prints "1 2 " and stops completely when i reaches 3.'
    },
    syntax: `// Break syntax:
if (exitCondition) {
    break;
}

// Continue syntax:
if (skipCondition) {
    continue;
}

// Labeled break:
labelName:
for (...) {
    for (...) {
        if (...) break labelName;
    }
}`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Search with Early Break ===");
        int target = 7;
        for (int i = 1; i <= 10; i++) {
            if (i == target) {
                System.out.println("Target " + target + " found at position " + i + ". Aborting loop.");
                break;
            }
        }

        System.out.println("\n=== Skipping Multiples with Continue ===");
        System.out.print("Numbers not divisible by 3: ");
        for (int i = 1; i <= 10; i++) {
            if (i % 3 == 0) {
                continue; // Skip multiples of 3
            }
            System.out.print(i + " ");
        }
        System.out.println();
    }
}`,
    expectedOutput: `=== Search with Early Break ===
Target 7 found at position 7. Aborting loop.

=== Skipping Multiples with Continue ===
Numbers not divisible by 3: 1 2 4 5 7 8 10 `,
    stepByStep: [
      '1. First loop searches for target 7.',
      '2. When i == 7, break executes, terminating the loop after 7 steps rather than 10.',
      '3. Second loop iterates i from 1 to 10.',
      '4. When i is 3, 6, or 9, continue jumps directly to the next iteration.',
      '5. Output reflects filtered sequence: 1 2 4 5 7 8 10.'
    ],
    commonMistakes: [
      {
        mistake: 'Expecting break to exit an outer loop without a label',
        codeSnippet: `for (int r = 0; r < 3; r++) {
    for (int c = 0; c < 3; c++) {
        if (c == 1) break; // Only exits the inner loop!
    }
}`,
        correction: 'Use a labeled break (e.g., break outerLoop;) to break out of multiple nested loops.',
        explanation: 'An unlabeled break statement strictly terminates only the innermost loop in which it resides.'
      },
      {
        mistake: 'Using continue in a while loop and forgetting to update the counter',
        codeSnippet: `int i = 0;
while (i < 5) {
    if (i == 2) continue; // Infinite loop! i remains 2 forever!
    i++;
}`,
        correction: 'Increment the counter before calling continue in a while loop: i++; continue;',
        explanation: 'In a while loop, continue skips to the condition check; if counter increment is bypassed, it loops forever.'
      }
    ],
    realWorldExample: {
      scenario: 'Database Record Stream Linear Search Filter',
      code: `public class Main {
    public static void main(String[] args) {
        String[] transactionIds = {"TX-101", "TX-102", "CORRUPTED", "TX-104"};

        for (String tx : transactionIds) {
            if ("CORRUPTED".equals(tx)) {
                System.out.println("[AUDIT] Corrupted packet detected. Skipping.");
                continue; // Skip invalid records
            }
            System.out.println("[LEDGER] Processed valid: " + tx);
        }
    }
}`,
      explanation: 'Data ingest pipelines use continue to filter out malformed or corrupted records without stopping processing for the rest of the stream.'
    },
    practice: {
      prompt: 'Write a Java program that iterates from 1 to 6. If i == 4, break out of the loop. Print: "1 2 3 ".',
      starterCode: `public class Main {
    public static void main(String[] args) {
        // Loop and break at 4
    }
}`,
      expectedOutputMatcher: '1 2 3 ',
      hint: 'if (i == 4) break; System.out.print(i + " ");',
      solution: `public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 6; i++) {
            if (i == 4) break;
            System.out.print(i + " ");
        }
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-ctrl-1',
        question: 'What is the effect of the break statement inside a loop?',
        options: [
          'Skips the current turn and continues to the next iteration',
          'Terminates the loop immediately and jumps to the code following the loop',
          'Restarts the computer',
          'Deletes all loop variables'
        ],
        correctIndex: 1,
        explanation: 'break unconditionally aborts loop execution.'
      },
      {
        id: 'mcq-java-ctrl-2',
        question: 'What is the effect of the continue statement inside a loop?',
        options: [
          'Aborts the entire loop permanently',
          'Skips the rest of the current iteration and advances to the next iteration',
          'Pauses execution for 5 seconds',
          'Exits the main method'
        ],
        correctIndex: 1,
        explanation: 'continue skips any code remaining in the current iteration and jumps directly to the update/condition check.'
      },
      {
        id: 'mcq-java-ctrl-3',
        question: 'How do you break out of both an inner loop and an outer loop simultaneously in Java?',
        options: [
          'Using double break; break;',
          'Using a labeled break statement (e.g., break myLabel;)',
          'Calling System.exit(0)',
          'Java does not support breaking nested loops'
        ],
        correctIndex: 1,
        explanation: 'Java supports labeled statements (label: for (...)) so a break label; can exit multiple enclosing loops.'
      },
      {
        id: 'mcq-java-ctrl-4',
        question: 'What is printed by: for (int i = 1; i <= 4; i++) { if (i == 2) continue; System.out.print(i + " "); } ?',
        options: ['1 2 3 4 ', '1 3 4 ', '1 ', '2 3 4 '],
        correctIndex: 1,
        explanation: 'When i is 2, continue skips the print statement, printing "1 3 4 ".'
      },
      {
        id: 'mcq-java-ctrl-5',
        question: 'Which statement is legal inside both a loop and a switch block?',
        options: ['continue', 'break', 'return only', 'goto'],
        correctIndex: 1,
        explanation: 'The break statement is valid inside both loops (for, while, do-while) and switch blocks.'
      }
    ],
    codingChallenge: {
      title: 'First Prime Matcher with Break',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program that searches numbers from 10 to 20 for the first number divisible by 7. When found, print "Found: 14" and break.',
      input_format: 'No input.',
      output_format: 'One line showing the matched number.',
      constraints: 'Exact output match.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        // Find first number divisible by 7 and break
    }
}`,
      expected_output: `Found: 14`,
      test_cases: [
        {
          input: '',
          expected_output: `Found: 14`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'break terminates loop execution immediately and resumes code after the loop.',
      'continue skips the rest of the current iteration and advances to the next turn.',
      'Unlabeled break only affects the innermost loop; labeled breaks can exit nested outer loops.',
      'Be careful with continue in while loops: update loop counters before continuing to prevent infinite loops.'
    ]
  },

  // =========================================================================
  // LESSON 17: Module 02 Practical Problem Solving & Assessment
  // =========================================================================
  {
    id: 'top-java-mod2-problems',
    number: 17,
    numberDisplay: '17',
    moduleId: 'mod-java-fundamentals-control',
    moduleTitle: 'Module 02: Java Fundamentals & Control Structures',
    title: 'Module 02 Practical Problem Solving & Assessment',
    slug: 'java-fundamentals-problem-solving-assessment',
    language: 'java',
    shortDescription: 'Synthesize variables, operators, conditions, and loops through 10 canonical algorithmic challenges: Electricity Bill, Grading, ATM Menu, Guessing Game, Prime Check, Fibonacci, Factorial, Armstrong, Palindrome, and Pattern Printing + Module 02 Assessment.',
    difficulty: 'Beginner',
    estimatedMinutes: 30,
    prerequisiteId: 'top-java-loop-control',
    learningObjectives: [
      'Combine variables, operators, conditionals, and loops into robust algorithmic solutions',
      'Solve 10 canonical beginner programming problems with clean, production-quality Java',
      'Perform dry runs and identify edge cases and boundary constraints',
      'Demonstrate mastery of Module 02 concepts through the comprehensive final assessment'
    ],
    conceptExplanation: `### 1. Algorithmic Synthesis: Connecting the Building Blocks
In Module 02, you mastered:
- Variables, Data Types, and Type Conversion
- Arithmetic, Relational, and Logical Operators
- User Input & Formatted Output
- Decisions (\`if-else\`, \`switch\`)
- Repetition (\`for\`, \`while\`, \`do-while\`)

Real software engineering is the art of **synthesizing** these fundamental concepts to solve real-world problems.

### 2. The 10 Canonical Problems Breakdown
1. **Electricity Bill Calculator**: Tiered rate calculations using else-if ladders.
2. **Student Grading System**: Score aggregation and letter grade assignment.
3. **ATM Simulation Menu**: Loop-driven state machine with deposit, withdraw, and check balance.
4. **Number Guessing Game**: Random number generator and high/low feedback loop.
5. **Prime Number Checker**: Divisibility testing up to \`sqrt(N)\` with early break.
6. **Fibonacci Sequence**: Iterative state transfer (\`next = a + b; a = b; b = next\`).
7. **Factorial Calculator**: Accumulator product using long integers.
8. **Armstrong Number Checker**: Sum of digits raised to the power of digit count.
9. **Palindrome Number**: Reversing integers and comparing with original.
10. **Pattern Printing**: Nested loops creating pyramids and grids.

---

### MODULE 02 COMPREHENSIVE ASSESSMENT SPECIFICATION
This lesson concludes Module 02 with a comprehensive assessment covering:
- Primitive data type boundaries, ranges, and literal suffixes
- Reference variables and heap object pointers vs stack primitives
- Widening vs narrowing casting and integer division truncation
- Prefix vs postfix increment and short-circuit evaluation
- Scanner newline consumption trap
- Traditional switch fallthrough vs modern switch expressions
- for, while, and do-while mechanics
- Break, continue, and labeled statements`,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        // Fibonacci First 5 Terms: 0, 1, 1, 2, 3
        int a = 0, b = 1;
        System.out.print("Fibonacci: " + a + " " + b + " ");
        for (int i = 2; i < 5; i++) {
            int next = a + b;
            System.out.print(next + " ");
            a = b;
            b = next;
        }
        System.out.println();
    }
}`,
      explanation: 'Iterative Fibonacci sequence generator using state transfer variables.'
    },
    syntax: `// Algorithmic template:
int n = 153; // Armstrong check: 1^3 + 5^3 + 3^3 = 1 + 125 + 27 = 153
int temp = n, sum = 0;
while (temp > 0) {
    int d = temp % 10;
    sum += (d * d * d);
    temp /= 10;
}`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== 1. Electricity Bill Calculation ===");
        int units = 250;
        double bill = 0;
        if (units <= 100) {
            bill = units * 1.50;
        } else if (units <= 200) {
            bill = (100 * 1.50) + (units - 100) * 2.00;
        } else {
            bill = (100 * 1.50) + (100 * 2.00) + (units - 200) * 3.00;
        }
        System.out.printf("Units: %d | Total Bill: $%.2f%n", units, bill);

        System.out.println("\n=== 2. Prime Number Validation ===");
        int checkNum = 29;
        boolean isPrime = true;
        for (int i = 2; i * i <= checkNum; i++) {
            if (checkNum % i == 0) {
                isPrime = false;
                break;
            }
        }
        System.out.println(checkNum + " is Prime? " + isPrime);

        System.out.println("\n=== 3. Armstrong Number Validation ===");
        int armstrongCandidate = 153;
        int t = armstrongCandidate, armstrongSum = 0;
        while (t > 0) {
            int digit = t % 10;
            armstrongSum += (digit * digit * digit);
            t /= 10;
        }
        System.out.println(armstrongCandidate + " is Armstrong? " + (armstrongSum == armstrongCandidate));
    }
}`,
    expectedOutput: `=== 1. Electricity Bill Calculation ===
Units: 250 | Total Bill: $500.00

=== 2. Prime Number Validation ===
29 is Prime? true

=== 3. Armstrong Number Validation ===
153 is Armstrong? true`,
    stepByStep: [
      '1. Electricity bill applies tiered calculation: 100 @ 1.50 ($150) + 100 @ 2.00 ($200) + 50 @ 3.00 ($150) = $500.00.',
      '2. Prime check tests divisors up to sqrt(29) (i.e. i <= 5); no factor divides 29 evenly, confirming it is prime.',
      '3. Armstrong check computes 1^3 + 5^3 + 3^3 = 1 + 125 + 27 = 153; equality with candidate confirms Armstrong property.',
      '4. Output displays all test outcomes with exact precision.'
    ],
    commonMistakes: [
      {
        mistake: 'Testing prime numbers by checking all the way up to N',
        codeSnippet: `for (int i = 2; i < n; i++) // Inefficient for large numbers`,
        correction: 'Check only up to i * i <= n (the square root of n).',
        explanation: 'If a number has a factor larger than its square root, it must also have a paired factor smaller than its square root.'
      },
      {
        mistake: 'Destroying original input variable during digit processing',
        codeSnippet: `while (n > 0) { ... n /= 10; }
if (n == reversed) // n is now 0! Comparison always fails!`,
        correction: 'Store a copy: int temp = n; and manipulate temp in the loop.',
        explanation: 'Loops that divide by 10 reduce the variable to 0; preserve the original number in a separate variable for comparison.'
      }
    ],
    realWorldExample: {
      scenario: 'Utility Billing and Consumption Rating Engine',
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println("[RATING ENGINE] Processing municipal utility consumption...");
        System.out.println("[RATING ENGINE] Tier 1 Base: Calibrated.");
        System.out.println("[RATING ENGINE] Tier 2 Peak: Calibrated.");
        System.out.println("[RATING ENGINE] Tier 3 Surcharge: Calibrated.");
        System.out.println("[STATUS] Rating engine calculation verified.");
    }
}`,
      explanation: 'Public utility companies and cloud providers (AWS, Azure) employ tiered algorithmic calculators to meter bandwidth and compute electricity tariffs across millions of consumer accounts.'
    },
    practice: {
      prompt: 'Write a Java program that prints the first 4 terms of the Fibonacci sequence: "0 1 1 2 ".',
      starterCode: `public class Main {
    public static void main(String[] args) {
        // Output first 4 Fibonacci numbers
    }
}`,
      expectedOutputMatcher: '0 1 1 2 ',
      hint: 'int a = 0, b = 1; print a and b, then loop twice for next terms.',
      solution: `public class Main {
    public static void main(String[] args) {
        int a = 0, b = 1;
        System.out.print(a + " " + b + " ");
        for (int i = 2; i < 4; i++) {
            int next = a + b;
            System.out.print(next + " ");
            a = b;
            b = next;
        }
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-mod2-1',
        question: 'What is an Armstrong number (for a 3-digit number)?',
        options: [
          'A number whose digits are all even',
          'A number equal to the sum of the cubes of its digits (e.g., 153 = 1^3 + 5^3 + 3^3)',
          'A number divisible by 7',
          'A number that ends in 0'
        ],
        correctIndex: 1,
        explanation: 'An Armstrong number equals the sum of its own digits each raised to the power of the number of digits.'
      },
      {
        id: 'mcq-java-mod2-2',
        question: 'Why is it sufficient to test divisors only up to sqrt(N) when checking if N is prime?',
        options: [
          'Because numbers greater than sqrt(N) are not real',
          'Because any composite factor larger than sqrt(N) must have a corresponding factor smaller than sqrt(N)',
          'To save battery life on laptops',
          'Because Java cannot divide beyond square roots'
        ],
        correctIndex: 1,
        explanation: 'Factors occur in pairs (p * q = N). At least one factor in any pair must be <= sqrt(N).'
      },
      {
        id: 'mcq-java-mod2-3',
        question: 'What is the next number in the Fibonacci sequence after 0, 1, 1, 2, 3, 5, 8, ...?',
        options: ['10', '11', '13', '15'],
        correctIndex: 2,
        explanation: 'Each Fibonacci term is the sum of the preceding two terms (5 + 8 = 13).'
      },
      {
        id: 'mcq-java-mod2-4',
        question: 'Which of the following numbers is a palindrome?',
        options: ['12345', '12321', '1000', '12210'],
        correctIndex: 1,
        explanation: '12321 reads identically forwards and backwards.'
      },
      {
        id: 'mcq-java-mod2-5',
        question: 'In a tiered electricity bill calculation, why is an else-if ladder preferred over multiple independent if statements?',
        options: [
          'To ensure only the appropriate rate tier is charged for each consumption bracket without overlapping',
          'Because Java forbids multiple if statements',
          'To make the code run in C++',
          'Because switch cannot run loops'
        ],
        correctIndex: 0,
        explanation: 'An else-if ladder guarantees mutual exclusivity between consumption tiers.'
      }
    ],
    codingChallenge: {
      title: 'Factorial Calculator Engine',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program that defines int n = 6. Calculate its factorial (6!) using a loop and print "Factorial of 6: 720".',
      input_format: 'No input.',
      output_format: 'One line showing the factorial result.',
      constraints: 'Exact text match.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        int n = 6;
        // Compute factorial and print
    }
}`,
      expected_output: `Factorial of 6: 720`,
      test_cases: [
        {
          input: '',
          expected_output: `Factorial of 6: 720`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Problem solving combines variables, conditions, and loops into structured algorithmic workflows.',
      'Preserve original variables when manipulating values via loops.',
      'Optimize prime checks by checking divisors up to the square root of N.',
      'Module 02 mastery certifies control flow readiness for Methods and Arrays in Module 03.'
    ]
  }
];
