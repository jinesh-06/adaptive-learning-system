import { CommonMistake, PracticeChallenge, TopicQuizQuestion } from './pythonFundamentalsData';

export interface JavaTopic {
  id: string;
  number: number;
  numberDisplay: string;
  title: string;
  slug: string;
  language: 'java';
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

export const JAVA_FUNDAMENTALS_TOPICS: JavaTopic[] = [
  {
    id: 'top-java-fundamentals',
    number: 1,
    numberDisplay: '01',
    title: 'Java Core Architecture: JVM, Bytecode & Strong Typing',
    slug: 'java-core-architecture-basics',
    language: 'java',
    shortDescription: 'Master the JVM architecture, ClassLoader, bytecode compilation, 8 primitive data types, reference types, and console I/O.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: null,
    learningObjectives: [
      'Understand the WORA principle: javac compiler, bytecode (.class), and the Java Virtual Machine (JVM)',
      'Distinguish the 8 Java primitive types from reference types and wrapper classes',
      'Master the class entry point: public static void main(String[] args)',
      'Perform formatted console I/O using System.out.println() and System.out.printf()'
    ],
    conceptExplanation: `Java was released in 1995 by James Gosling at Sun Microsystems with the famous motto: "Write Once, Run Anywhere" (WORA).

The Java Execution Architecture:
1. **Source Code (\`*.java\`)**: Human-readable Java instructions.
2. **Compiler (\`javac\`)**: Translates source code into platform-independent intermediate **Bytecode** stored in \`*.class\` files.
3. **Java Virtual Machine (JVM)**: Loads bytecode via the **ClassLoader**, verifies byte safety, and executes instructions using the **Just-In-Time (JIT) Compiler** and interpreter directly on the underlying host OS.
4. **Automatic Memory Management**: The JVM Garbage Collector (GC) runs concurrently to track object references and deallocate unreferenced heap memory automatically.

Every Java application is composed of at least one \`class\`, and execution begins at the static entry point:
\`public static void main(String[] args)\`.`,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        int studentId = 101;
        double gpa = 3.92;
        boolean isEnrolled = true;
        System.out.println("ID: " + studentId + " | GPA: " + gpa + " | Active: " + isEnrolled);
    }
}`,
      explanation: 'Defines a class Main with primitive variables printed via System.out.println.'
    },
    syntax: `// Standard Java Program Structure
public class Main {
    public static void main(String[] args) {
        // 1. Eight Primitive Types:
        byte b = 127;                // 1 byte: -128 to 127
        short s = 32000;             // 2 bytes: -32,768 to 32,767
        int i = 2147483647;          // 4 bytes: standard integer
        long l = 9223372036854775807L;// 8 bytes (note 'L' suffix)
        float f = 3.14f;             // 4 bytes (note 'f' suffix)
        double d = 2.718281828459;   // 8 bytes (default float)
        char c = 'J';                // 2 bytes (16-bit Unicode)
        boolean flag = true;         // true or false

        // 2. Reference Types:
        String title = "Java Platform";

        // 3. Formatted Output:
        System.out.printf("Language: %s, Version: %d, Float: %.2f\\n", title, 21, d);
    }
}`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        String student = "Maya Lin";
        int credits = 15;
        double costPerCredit = 320.50;
        double totalTuition = credits * costPerCredit;

        System.out.println("=== Enrollment Invoice ===");
        System.out.println("Student Name:  " + student);
        System.out.println("Total Credits: " + credits);
        System.out.printf("Tuition Fee:   $%.2f\\n", totalTuition);
    }
}`,
    expectedOutput: `=== Enrollment Invoice ===
Student Name:  Maya Lin
Total Credits: 15
Tuition Fee:   $4807.50`,
    stepByStep: [
      '1. javac compiles Main.java into Main.class bytecode.',
      '2. JVM launches and calls public static void main(String[] args).',
      '3. Primitive variables (credits, costPerCredit) are stored in the local thread stack.',
      '4. String "Maya Lin" is stored in the JVM Heap String Constant Pool.',
      '5. System.out.printf applies formatted string output.'
    ],
    commonMistakes: [
      {
        mistake: 'if (name == "Alice") // Testing String equality with ==',
        correction: 'if (name.equals("Alice")) // Use .equals() for content comparison',
        explanation: 'In Java, == compares memory references (whether both variables point to the exact same heap address), while .equals() compares character values.'
      },
      {
        mistake: 'long bigNum = 3000000000; // Missing \'L\' suffix',
        correction: 'long bigNum = 3000000000L; // Append L to denote a 64-bit literal',
        explanation: 'Integer literals in Java default to 32-bit int. Numbers exceeding 2,147,483,647 must specify the L suffix.'
      }
    ],
    realWorldExample: {
      scenario: 'Enterprise Bank Transaction Ledger',
      code: `public class Main {
    public static void main(String[] args) {
        long accountId = 9876543210L;
        double balance = 5400.75;
        double withdrawal = 450.00;

        if (balance >= withdrawal) {
            balance -= withdrawal;
            System.out.println("[LEDGER AUDIT] Account: " + accountId);
            System.out.printf("Debited: $%.2f | New Balance: $%.2f\\n", withdrawal, balance);
        }
    }
}`,
      explanation: 'Enterprise banks use Java because the JVM guarantees zero buffer overflows, memory safety, and thread-safe garbage collection across mission-critical services.'
    },
    practice: {
      prompt: 'Write a Java program that declares an int variable score with value 98 and prints "Student Score: 98".',
      starterCode: `public class Main {
    public static void main(String[] args) {
        int score = 98;
        System.out.println("Student Score: " + score);
    }
}`,
      expectedOutputMatcher: 'Student Score: 98',
      hint: 'Use int score = 98; System.out.println("Student Score: " + score);',
      solution: `public class Main {
    public static void main(String[] args) {
        int score = 98;
        System.out.println("Student Score: " + score);
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-fund-1',
        question: 'What is the role of the Java Virtual Machine (JVM)?',
        options: [
          'Translates Java source code into C code',
          'Executes compiled Java bytecode (.class) on the host operating system',
          'Acts as an IDE code editor',
          'Manages network domains exclusively'
        ],
        correctIndex: 1,
        explanation: 'The JVM is the runtime engine that loads, verifies, and executes platform-independent bytecode.'
      },
      {
        id: 'mcq-java-fund-2',
        question: 'How should you compare the content of two String objects in Java?',
        options: ['Using == operator', 'Using .equals() method', 'Using .compare() operator', 'Using .isSame()'],
        correctIndex: 1,
        explanation: '== compares memory reference pointers. To compare text content, you must always use .equals().'
      },
      {
        id: 'mcq-java-fund-3',
        question: 'Which of the following is NOT one of Java\'s 8 primitive data types?',
        options: ['byte', 'boolean', 'String', 'float'],
        correctIndex: 2,
        explanation: 'String is a reference class type in java.lang, not a primitive.'
      }
    ],
    summary: [
      'Java code is compiled by javac into platform-neutral bytecode and executed by the JVM.',
      'Java features 8 primitive data types (byte, short, int, long, float, double, char, boolean).',
      'Reference objects live in the Garbage-Collected Heap; primitive variables live in Stack frames.',
      'Always compare object values with .equals(), never ==.'
    ]
  },
  {
    id: 'top-java-control-flow',
    number: 2,
    numberDisplay: '02',
    title: 'Control Flow, Switch Expressions & Loop Constructs',
    slug: 'java-control-flow-loops',
    language: 'java',
    shortDescription: 'Master structured branching, modern Java switch expressions (with arrow syntax ->), and while/for/for-each loop constructs.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-fundamentals',
    learningObjectives: [
      'Construct if-else chains and modern switch expressions without fallthrough bugs',
      'Iterate over collections using the enhanced for-each loop: for (Type x : collection)',
      'Manage loop termination with break and continue statements'
    ],
    conceptExplanation: `Java provides robust control flow structures.
Since Java 14, **Switch Expressions** support arrow syntax (\`case X -> Y\`), which eliminates the need for \`break\` statements and prevents accidental fallthrough bugs.
The **Enhanced for-each loop** (\`for (int n : numbers)\`) iterates through arrays and Iterable collections without manual index counters.`,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        int day = 3;
        String dayName = switch (day) {
            case 1 -> "Monday";
            case 2 -> "Tuesday";
            case 3 -> "Wednesday";
            default -> "Other";
        };
        System.out.println("Day: " + dayName);
    }
}`,
      explanation: 'Demonstrates modern Java switch expression.'
    },
    syntax: `// Enhanced for-each loop
int[] numbers = {10, 20, 30};
for (int num : numbers) {
    System.out.println(num);
}`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        int[] scores = {85, 92, 78, 96, 88};
        int sum = 0;
        int max = scores[0];

        for (int s : scores) {
            sum += s;
            if (s > max) max = s;
        }

        double average = (double) sum / scores.length;
        System.out.println("Total Scores: " + scores.length);
        System.out.println("Highest:      " + max);
        System.out.printf("Average:      %.1f\\n", average);
    }
}`,
    expectedOutput: `Total Scores: 5
Highest:      96
Average:      87.8`,
    stepByStep: [
      '1. Enhanced for-each loop iterates directly over integer array.',
      '2. sum accumulates all elements.',
      '3. if condition updates maximum value.',
      '4. Average is formatted to 1 decimal place.'
    ],
    commonMistakes: [
      {
        mistake: 'for (int i = 0; i <= arr.length; i++) // Array index out of bounds',
        correction: 'for (int i = 0; i < arr.length; i++) // Use strict less-than',
        explanation: 'In Java, arrays of length N are indexed from 0 to N-1. Using <= raises ArrayIndexOutOfBoundsException.'
      }
    ],
    realWorldExample: {
      scenario: 'E-Commerce Order Status Dispatcher',
      code: `public class Main {
    public static void main(String[] args) {
        String status = "SHIPPED";
        String message = switch (status) {
            case "PENDING" -> "Order received and queued.";
            case "SHIPPED" -> "Package in transit with tracking.";
            case "DELIVERED" -> "Delivered to customer address.";
            default -> "Unknown status.";
        };
        System.out.println("Status Update: " + message);
    }
}`,
      explanation: 'Modern microservices in Java use switch expressions with string keys for clear event-driven dispatch.'
    },
    practice: {
      prompt: 'Write a Java program with an array {2, 4, 6, 8}. Calculate their sum and print "Total: 20".',
      starterCode: `public class Main {
    public static void main(String[] args) {
        int[] nums = {2, 4, 6, 8};
        int sum = 0;
        for (int n : nums) sum += n;
        System.out.println("Total: " + sum);
    }
}`,
      expectedOutputMatcher: 'Total: 20',
      hint: 'Sum the numbers and print Total: 20',
      solution: `public class Main {
    public static void main(String[] args) {
        int[] nums = {2, 4, 6, 8};
        int sum = 0;
        for (int n : nums) sum += n;
        System.out.println("Total: " + sum);
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-flow-1',
        question: 'What exception is thrown if you access arr[5] on an array of length 5 in Java?',
        options: ['NullPointerException', 'ArrayIndexOutOfBoundsException', 'IllegalArgumentException', 'SegmentationFault'],
        correctIndex: 1,
        explanation: 'Java runtime enforces strict boundary checks, throwing ArrayIndexOutOfBoundsException on out-of-range indices.'
      }
    ],
    summary: [
      'Enhanced for-each loops iterate cleanly over arrays without manual indexing.',
      'Java 14+ switch expressions (case ->) prevent accidental fallthrough bugs.',
      'Arrays are bounds-checked at runtime by the JVM.'
    ]
  },
  {
    id: 'top-java-methods-arrays',
    number: 3,
    numberDisplay: '03',
    title: 'Static Methods, Memory Stack/Heap & Arrays',
    slug: 'java-methods-memory-arrays',
    language: 'java',
    shortDescription: 'Understand static method declarations, pass-by-value semantics, stack frames vs heap allocations, and array processing.',
    difficulty: 'Intermediate',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-control-flow',
    learningObjectives: [
      'Define modular reusable static helper methods with return values and parameters',
      'Understand Java\'s strict pass-by-value evaluation model',
      'Contrast primitive stack allocation with heap object instantiation'
    ],
    conceptExplanation: `In Java:
1. **Methods**: Functions declared inside a class. \`static\` methods belong to the class itself and can be invoked without instantiating an object.
2. **Pass-by-Value**: Java is **strictly pass-by-value**. When passing primitives, a copy of the value is passed. When passing object references, a copy of the reference pointer is passed.
3. **Memory Organization**:
   - **Stack**: Stores method call frames, local primitives, and reference handles. Stack memory is automatically reclaimed when a method returns.
   - **Heap**: Stores all objects and arrays. Managed by the JVM Garbage Collector.`,
    simpleExample: {
      code: `public class Main {
    public static int square(int n) {
        return n * n;
    }

    public static void main(String[] args) {
        int result = square(7);
        System.out.println("Square of 7: " + result);
    }
}`,
      explanation: 'Demonstrates static method declaration and invocation.'
    },
    syntax: `public static returnType methodName(ParamType p1, ParamType p2) {
    // method body
    return value;
}`,
    codeExample: `public class Main {
    public static double calculateBMI(double weightKg, double heightM) {
        return weightKg / (heightM * heightM);
    }

    public static void main(String[] args) {
        double weight = 70.0;
        double height = 1.75;
        double bmi = calculateBMI(weight, height);

        System.out.printf("Weight: %.1f kg, Height: %.2f m\\n", weight, height);
        System.out.printf("Calculated BMI: %.1f\\n", bmi);
    }
}`,
    expectedOutput: `Weight: 70.0 kg, Height: 1.75 m
Calculated BMI: 22.9`,
    stepByStep: [
      '1. calculateBMI is a static method returning a double precision float.',
      '2. Arguments (weight, height) are copied into the method\'s stack frame.',
      '3. The computed double value is returned to the caller main method.'
    ],
    commonMistakes: [
      {
        mistake: 'public void helper() { ... } // Calling non-static method directly from static main',
        correction: 'public static void helper() { ... } // Add static keyword or create an instance',
        explanation: 'Static methods exist without an instance. They cannot directly call instance methods or instance variables without creating an object.'
      }
    ],
    realWorldExample: {
      scenario: 'Cryptographic Hash Utility Validation',
      code: `public class Main {
    public static boolean validateChecksum(int[] data, int expectedSum) {
        int sum = 0;
        for (int val : data) sum += val;
        return sum == expectedSum;
    }

    public static void main(String[] args) {
        int[] packet = {10, 25, 40, 15};
        boolean isValid = validateChecksum(packet, 90);
        System.out.println("Packet Integrity Valid? " + isValid);
    }
}`,
      explanation: 'Microservice utilities use static helper methods for stateless, deterministic data verification.'
    },
    practice: {
      prompt: 'Write a static method cube(int n) that returns n*n*n. In main, print "Cube: " + cube(3).',
      starterCode: `public class Main {
    public static int cube(int n) {
        return n * n * n;
    }

    public static void main(String[] args) {
        System.out.println("Cube: " + cube(3));
    }
}`,
      expectedOutputMatcher: 'Cube: 27',
      hint: 'Define public static int cube(int n) { return n * n * n; }',
      solution: `public class Main {
    public static int cube(int n) {
        return n * n * n;
    }

    public static void main(String[] args) {
        System.out.println("Cube: " + cube(3));
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-meth-1',
        question: 'Is Java pass-by-value or pass-by-reference?',
        options: ['Always pass-by-value', 'Always pass-by-reference', 'Pass-by-value for primitives, pass-by-reference for objects', 'Depends on compiler flags'],
        correctIndex: 0,
        explanation: 'Java is strictly pass-by-value. For objects, a copy of the reference address is passed by value.'
      }
    ],
    summary: [
      'static methods belong to the class and require no object instantiation.',
      'Stack memory holds local variables; Heap memory stores all objects and arrays.',
      'Java is strictly pass-by-value in all function calls.'
    ]
  }
];
