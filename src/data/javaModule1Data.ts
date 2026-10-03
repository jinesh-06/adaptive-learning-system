import { JavaTopic } from './javaFundamentalsData';

export const JAVA_MODULE_1_TOPICS: JavaTopic[] = [
  // =========================================================================
  // LESSON 01: Introduction to Java
  // =========================================================================
  {
    id: 'top-java-intro',
    number: 1,
    numberDisplay: '01',
    moduleId: 'mod-java-architecture-basics',
    moduleTitle: 'Module 01: Java Core Architecture & Basics',
    title: 'Introduction to Java',
    slug: 'introduction-to-java',
    language: 'java',
    shortDescription: 'Explore the origin of Java, Sun Microsystems, James Gosling, the "Write Once, Run Anywhere" philosophy, and core architectural features across enterprise software.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: null,
    learningObjectives: [
      'Understand the definition and historical background of Java created by James Gosling at Sun Microsystems',
      'Explain the "Write Once, Run Anywhere" (WORA) principle and platform independence',
      'Identify and describe the 11 core features of the Java programming language',
      'Compare real-world Java applications across banking, enterprise, Android, and cloud ecosystems'
    ],
    conceptExplanation: `### 1. Definition and Origin of Java
Java is a high-level, class-based, object-oriented, robust, and secure programming language created in 1991 by **James Gosling**, Mike Sheridan, and Patrick Naughton at Sun Microsystems (now owned by Oracle Corporation). Originally named *Oak* for the tree outside Gosling's office, it was later renamed **Java** and officially released to the world in 1995.

### 2. The Core Philosophy: "Write Once, Run Anywhere" (WORA)
Before Java, languages like C and C++ compiled code directly into CPU-specific machine instructions. A program compiled on Windows x86 could not run on Linux ARM without complete recompilation and platform-specific adjustments.
Java introduced an revolutionary two-step process:
1. **Compilation to Bytecode**: The Java compiler (\`javac\`) converts human-readable source code (\`.java\`) into intermediate binary instructions called **Bytecode** stored in \`.class\` files.
2. **Execution via Virtual Machine**: Any computer equipped with a **Java Virtual Machine (JVM)** for its specific operating system can execute that exact same bytecode without modification.

### 3. Java Features individually Explained
* **Simple**: Eliminates complex and error-prone low-level features such as explicit pointers, operator overloading, and manual memory deletion.
* **Object-Oriented**: Everything in Java (except 8 primitive data types) is organized around modular objects encapsulating state and behavior.
* **Platform-Independent**: Software is compiled into platform-neutral bytecode, decoupling logic from underlying processor hardware.
* **Portable**: Bytecode specification and primitive data type sizes (e.g., \`int\` is always 32 bits) are strictly identical across every operating system and architecture.
* **Secure**: Runs inside a protected JVM sandbox without raw pointer access; bytecode is verified before execution to prevent memory corruption and unauthorized hardware tampering.
* **Robust**: Employs strong compile-time type checking, strict runtime exception handling, and automatic garbage collection to eliminate memory leaks.
* **Multithreaded**: Built-in native support for concurrent threads allows servers to process thousands of simultaneous client transactions.
* **Architecture-Neutral**: Execution does not depend on CPU byte-ordering (endianness) or machine word size.
* **High Performance**: The JVM's **Just-In-Time (JIT) Compiler** detects frequently executed code ("hot spots") and dynamically compiles them into native machine instructions at runtime.
* **Distributed**: Core networking libraries (\`java.net\`, RMI, HTTP clients) simplify building distributed services across TCP/IP networks.
* **Dynamic**: Classes are loaded into memory on-demand at runtime via the ClassLoader rather than linked in one massive executable.

### 4. Real-World Applications Comparison
* **Enterprise Banking**: Over 90% of Fortune 500 banks (JPMorgan, Citi, Barclays) run their core transaction processing and ledger systems on Java because of memory safety and high concurrency.
* **Android OS**: Android applications and APIs are predominantly built using Java and Kotlin.
* **Cloud & Microservices**: Frameworks like Spring Boot and Quarkus power cloud-native backends handling millions of requests per second.
* **Big Data Ecosystems**: Apache Hadoop, Apache Spark, and Apache Kafka are natively written in Java and Scala.`,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Java: Write Once, Run Anywhere!");
    }
}`,
      explanation: 'Defines class Main with the static entry method main() which outputs a string to the console via System.out.println.'
    },
    syntax: `// Standard Java Class Boilerplate
public class ClassName {
    // Program execution starts strictly inside main()
    public static void main(String[] args) {
        // Output statement terminated by semicolon
        System.out.println("Your message here");
    }
}`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Java Ecosystem Overview ===");
        System.out.println("Creator:      James Gosling (Sun Microsystems, 1995)");
        System.out.println("Philosophy:   Write Once, Run Anywhere (WORA)");
        System.out.println("Key Strength: Robust Memory Management & Strong Typing");
        System.out.println("Standard:     LTS Releases (Java 8, 11, 17, 21)");
        System.out.println("=================================");
    }
}`,
    expectedOutput: `=== Java Ecosystem Overview ===
Creator:      James Gosling (Sun Microsystems, 1995)
Philosophy:   Write Once, Run Anywhere (WORA)
Key Strength: Robust Memory Management & Strong Typing
Standard:     LTS Releases (Java 8, 11, 17, 21)
=================================`,
    stepByStep: [
      '1. Java compiler (javac) reads Main.java and generates Main.class bytecode.',
      '2. The JVM launches, and the ClassLoader loads Main.class into the JVM Method Area.',
      '3. Bytecode Verifier ensures the class does not violate security constraints or stack limits.',
      '4. The Execution Engine invokes public static void main(String[] args).',
      '5. System.out.println sends character stream output to the standard console stdout.'
    ],
    commonMistakes: [
      {
        mistake: 'Mismatch between class name and source file name',
        codeSnippet: `// Inside file named App.java
public class Main { // Compiler Error: class Main is public, should be declared in file Main.java
    public static void main(String[] args) {}
}`,
        correction: 'Ensure the file name exactly matches the public class name: Main.java for public class Main.',
        explanation: 'In Java, a source file can contain at most one public class, and the file name must match that class name exactly, including letter casing.'
      },
      {
        mistake: 'Assuming Java is pure interpretation like Python',
        codeSnippet: `// Misconception: Java executes directly line-by-line from source code`,
        correction: 'Understand that Java is compiled to bytecode first (javac), then executed by the JVM (java).',
        explanation: 'Java achieves high performance because bytecode is optimized and frequently converted to native machine code via the JIT compiler.'
      },
      {
        mistake: 'Forgetting Java is case-sensitive',
        codeSnippet: `system.out.println("Hello"); // Error: package system does not exist
Main vs main // Main is not identical to main`,
        correction: 'Always use proper casing: System.out.println with a capital S.',
        explanation: 'Java identifiers are strictly case-sensitive. "System" refers to the built-in java.lang.System class; "system" will fail compilation.'
      }
    ],
    realWorldExample: {
      scenario: 'Enterprise Bank Core Transaction Processing Engine',
      code: `public class Main {
    public static void main(String[] args) {
        String bankName = "Global Federal Reserve";
        long dailyTransactions = 450_000_000L;
        boolean securityAuditPassed = true;

        System.out.println("Bank: " + bankName);
        System.out.println("Daily Processed Transactions: " + dailyTransactions);
        System.out.println("Security Compliance Audit: " + (securityAuditPassed ? "PASSED" : "FAILED"));
    }
}`,
      explanation: 'Enterprise banks trust Java because automatic memory garbage collection, strict type guarantees, and sandbox security prevent buffer overflow attacks and memory leaks.'
    },
    practice: {
      prompt: 'Write a Java program that prints your development track: print "Track: Java Core Architecture" on the first line and "Level: Beginner to Professional" on the second line.',
      starterCode: `public class Main {
    public static void main(String[] args) {
        // Print the two required lines
    }
}`,
      expectedOutputMatcher: 'Track: Java Core Architecture\nLevel: Beginner to Professional',
      hint: 'Use two separate System.out.println() statements.',
      solution: `public class Main {
    public static void main(String[] args) {
        System.out.println("Track: Java Core Architecture");
        System.out.println("Level: Beginner to Professional");
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-intro-1',
        question: 'Who is recognized as the father of the Java programming language?',
        options: ['Bjarne Stroustrup', 'James Gosling', 'Dennis Ritchie', 'Guido van Rossum'],
        correctIndex: 1,
        explanation: 'James Gosling developed Java in the early 1990s while working at Sun Microsystems.'
      },
      {
        id: 'mcq-java-intro-2',
        question: 'What does the WORA acronym stand for in Java engineering?',
        options: [
          'Write Once, Run Anywhere',
          'Windows Operating Runtime Architecture',
          'Web Oriented Reliable Applications',
          'Write Object Reusable Algorithms'
        ],
        correctIndex: 0,
        explanation: 'WORA stands for "Write Once, Run Anywhere", symbolizing Java\'s cross-platform bytecode portability.'
      },
      {
        id: 'mcq-java-intro-3',
        question: 'What does the Java compiler (javac) produce from source code (.java files)?',
        options: ['Native machine executable (.exe)', 'Java Bytecode (.class)', 'Assembly code (.s)', 'C source code (.c)'],
        correctIndex: 1,
        explanation: 'javac translates .java source files into platform-neutral bytecode packaged in .class files.'
      },
      {
        id: 'mcq-java-intro-4',
        question: 'Which component is responsible for dynamically converting frequently executed bytecode to native machine code at runtime?',
        options: ['ClassLoader', 'Bytecode Verifier', 'Just-In-Time (JIT) Compiler', 'Preprocessor'],
        correctIndex: 2,
        explanation: 'The JIT Compiler analyzes hot spots during program execution and translates them directly into native CPU instructions for near-native performance.'
      },
      {
        id: 'mcq-java-intro-5',
        question: 'Which of the following is NOT a characteristic feature of Java?',
        options: ['Object-oriented', 'Platform-independent', 'Manual pointer arithmetic', 'Multithreaded'],
        correctIndex: 2,
        explanation: 'Java deliberately excludes manual pointer arithmetic to maintain memory safety and eliminate memory corruption vulnerabilities.'
      }
    ],
    codingChallenge: {
      title: 'Console Identity Banner',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program that outputs the system identity banner with three lines: "System: Adaptive Learning Engine", "Module: Java Architecture", and "Status: Online".',
      input_format: 'None (no standard input needed).',
      output_format: 'Three lines of text exactly matching the required banner strings.',
      constraints: 'Must be written inside public class Main with a public static void main method.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        // Output the three banner lines
    }
}`,
      expected_output: `System: Adaptive Learning Engine\nModule: Java Architecture\nStatus: Online`,
      test_cases: [
        {
          input: '',
          expected_output: `System: Adaptive Learning Engine\nModule: Java Architecture\nStatus: Online`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Java was developed by James Gosling at Sun Microsystems in 1995 with the WORA philosophy.',
      'Java code compiles to platform-neutral Bytecode (.class) executed by any platform-specific JVM.',
      'Key language pillars include OOP, automatic garbage collection, platform independence, and JIT compilation.',
      'Java powers mission-critical enterprise systems, banking engines, cloud backends, and Android.'
    ]
  },

  // =========================================================================
  // LESSON 02: JDK, JRE, and JVM
  // =========================================================================
  {
    id: 'top-java-jdk-jre-jvm',
    number: 2,
    numberDisplay: '02',
    moduleId: 'mod-java-architecture-basics',
    moduleTitle: 'Module 01: Java Core Architecture & Basics',
    title: 'JDK, JRE, and JVM',
    slug: 'jdk-jre-jvm-comparison',
    language: 'java',
    shortDescription: 'Unpack the foundational tri-part architecture of Java: the Java Development Kit (JDK), Java Runtime Environment (JRE), and Java Virtual Machine (JVM).',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-intro',
    learningObjectives: [
      'Differentiate the core roles and contents of JDK, JRE, and JVM',
      'Explain how the three components nest within one another (JDK ⊃ JRE ⊃ JVM)',
      'Analyze the tools provided in the JDK: javac, java, jar, jdb, and javadoc',
      'Execute and interpret the output of java -version and javac -version commands'
    ],
    conceptExplanation: `### 1. The Core Triad Defined
Java developers and end-users interact with three interrelated components:
1. **JVM (Java Virtual Machine)**: The abstract execution engine. It provides the runtime environment in which Java bytecode can be executed. It allocates memory, manages the garbage collector, and translates bytecode into host CPU instructions.
2. **JRE (Java Runtime Environment)**: The software package needed by end-users to *run* compiled Java applications. It contains the JVM plus core runtime class libraries (e.g., \`java.lang\`, \`java.util\`, \`java.io\`) and supporting configuration files.
3. **JDK (Java Development Kit)**: The full developer toolset needed to *write, compile, debug, and run* Java programs. It contains the complete JRE plus developer tools such as \`javac\` (compiler), \`jar\` (archiver), \`jdb\` (debugger), and \`javadoc\` (documentation generator).

### 2. Nested Relationship
\`\`\`text
+-------------------------------------------------------------+
| JDK (Java Development Kit)                                  |
|   - Development Tools: javac, jar, jdb, javadoc, etc.       |
|   +-------------------------------------------------------+ |
|   | JRE (Java Runtime Environment)                        | |
|   |   - Java Standard Class Libraries (rt.jar / modules)  | |
|   |   - Configuration & Security files                    | |
|   |   +-------------------------------------------------+ | |
|   |   | JVM (Java Virtual Machine)                      | | |
|   |   |   - ClassLoader Subsystem                       | | |
|   |   |   - Memory Areas (Heap, Stack, Method Area)     | | |
|   |   |   - Execution Engine (Interpreter + JIT + GC)   | | |
|   |   +-------------------------------------------------+ | |
|   +-------------------------------------------------------+ |
+-------------------------------------------------------------+
\`\`\`

### 3. Comparison Table
| Component | Primary Purpose | Key Contents | Target User |
| :--- | :--- | :--- | :--- |
| **JVM** | Executes bytecode on host OS | Interpreter, JIT, GC, Memory manager | Internal Runtime Engine |
| **JRE** | Runs compiled applications | JVM + Core Standard Libraries | End Users / Production Servers |
| **JDK** | Compiles, develops, and tests code | JRE + \`javac\`, \`jar\`, \`jdb\`, \`javadoc\` | Software Developers |

### 4. Modern Packaging (Java 9+ and Jlink)
In legacy Java (Java 8 and earlier), users often installed a standalone JRE. Since Java 9 (Project Jigsaw modularization), Oracle and OpenJDK distribute the JDK as the primary package, allowing developers to create minimal custom runtimes using the \`jlink\` tool rather than shipping a bloated global JRE.

### 5. Essential Command Line Verification
* \`java -version\`: Informs you which JVM runtime is active on your system PATH.
* \`javac -version\`: Confirms whether the Java compiler is accessible in your environment.`,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println("JVM Vendor: " + System.getProperty("java.vendor"));
        System.out.println("Java Version: " + System.getProperty("java.version"));
    }
}`,
      explanation: 'Uses System.getProperty to query the active JVM version and vendor at runtime.'
    },
    syntax: `// Terminal commands for tool verification:
// 1. Check runtime version:
// java -version

// 2. Check compiler version:
// javac -version

// 3. Compile source code to bytecode:
// javac MyClass.java

// 4. Launch the JVM with the compiled class:
// java MyClass`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        String runtimeVersion = System.getProperty("java.version");
        String vmName = System.getProperty("java.vm.name");
        String osName = System.getProperty("os.name");

        System.out.println("=== Java Runtime Environment Diagnostics ===");
        System.out.println("Active Java Version: " + runtimeVersion);
        System.out.println("Active Virtual Machine: " + vmName);
        System.out.println("Host Operating System: " + osName);
        System.out.println("Architecture Status: JDK tools linked successfully.");
    }
}`,
    expectedOutput: `=== Java Runtime Environment Diagnostics ===
Active Java Version: 1.8.0_111
Active Virtual Machine: Java HotSpot(TM) 64-Bit Server VM
Host Operating System: Windows 10
Architecture Status: JDK tools linked successfully.`,
    stepByStep: [
      '1. Developer writes Java source file using text editor.',
      '2. javac compiler (located in JDK /bin) inspects code grammar and writes .class bytecode.',
      '3. java launcher (in JDK/JRE /bin) starts the JVM process.',
      '4. JVM loads the java.lang.System class from standard libraries and queries system properties.',
      '5. Properties are displayed to stdout and the JVM cleans up memory on thread termination.'
    ],
    commonMistakes: [
      {
        mistake: 'Attempting to compile with "java" instead of "javac"',
        codeSnippet: `java Main.java // Fails on older Java versions without single-file source runner`,
        correction: 'Use javac Main.java to compile, and java Main to execute.',
        explanation: 'javac is the Java Compiler; java is the Java Application Launcher that executes bytecode.'
      },
      {
        mistake: 'Adding .class extension when running with java',
        codeSnippet: `java Main.class // Error: Could not find or load main class Main.class`,
        correction: 'Execute with the class name only: java Main.',
        explanation: 'The java launcher expects a fully qualified class name, not a file system path with the .class extension.'
      },
      {
        mistake: 'Assuming JRE is sufficient for development',
        codeSnippet: `javac: command not found (when only JRE is installed)`,
        correction: 'Always download and install the JDK (Java Development Kit) for programming.',
        explanation: 'The JRE only includes runtime execution libraries; the compiler (javac) is bundled exclusively inside the JDK.'
      }
    ],
    realWorldExample: {
      scenario: 'Cloud Deployment Docker Container Configuration',
      code: `public class Main {
    public static void main(String[] args) {
        // Cloud microservices often build using JDK container,
        // then copy compiled bytecode into a lightweight JRE base image.
        System.out.println("Stage 1: Build & Unit Test using JDK 21 (javac + Maven)");
        System.out.println("Stage 2: Package JAR artifact");
        System.out.println("Stage 3: Deploy to production Alpine Linux with minimal JRE / Jlink");
    }
}`,
      explanation: 'Modern DevOps uses multi-stage Docker builds: compile with the full JDK (containing javac), then deploy into a slim JRE container to reduce attack surface and memory footprint.'
    },
    practice: {
      prompt: 'Write a Java program that displays the relationship between the three components in three print statements: "JDK = JRE + Development Tools", "JRE = JVM + Class Libraries", and "JVM = Execution Engine + Memory Areas".',
      starterCode: `public class Main {
    public static void main(String[] args) {
        // Output the three component equations
    }
}`,
      expectedOutputMatcher: 'JDK = JRE + Development Tools\nJRE = JVM + Class Libraries\nJVM = Execution Engine + Memory Areas',
      hint: 'Print the three formulas using System.out.println.',
      solution: `public class Main {
    public static void main(String[] args) {
        System.out.println("JDK = JRE + Development Tools");
        System.out.println("JRE = JVM + Class Libraries");
        System.out.println("JVM = Execution Engine + Memory Areas");
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-jdk-1',
        question: 'Which component is required by a developer to compile Java source code into bytecode?',
        options: ['Only the JVM', 'Only the JRE', 'The JDK (Java Development Kit)', 'The Web Browser'],
        correctIndex: 2,
        explanation: 'The JDK contains the compiler tool javac; neither standalone JRE nor JVM includes the compiler.'
      },
      {
        id: 'mcq-java-jdk-2',
        question: 'What is the correct mathematical nesting of the Java environment components?',
        options: ['JVM ⊃ JRE ⊃ JDK', 'JDK ⊃ JRE ⊃ JVM', 'JRE ⊃ JDK ⊃ JVM', 'JVM ⊃ JDK ⊃ JRE'],
        correctIndex: 1,
        explanation: 'The JDK contains the JRE plus development tools; the JRE contains the JVM plus runtime libraries.'
      },
      {
        id: 'mcq-java-jdk-3',
        question: 'Which tool included in the JDK packages multiple compiled class files and assets into a single archive?',
        options: ['javac', 'jar', 'jdb', 'javadoc'],
        correctIndex: 1,
        explanation: 'The jar (Java Archive) tool bundles multiple class files and metadata into an executable or library archive.'
      },
      {
        id: 'mcq-java-jdk-4',
        question: 'When running a compiled Java program called Solution, which terminal command should be executed?',
        options: ['javac Solution', 'java Solution.class', 'java Solution', 'run Solution.java'],
        correctIndex: 2,
        explanation: 'java Solution instructs the JVM to load the class named Solution and invoke its main method.'
      },
      {
        id: 'mcq-java-jdk-5',
        question: 'What is the primary role of the Java Runtime Environment (JRE)?',
        options: [
          'To edit source code files',
          'To provide the runtime libraries and JVM necessary to execute Java programs',
          'To translate Java into Python code',
          'To debug network cables'
        ],
        correctIndex: 1,
        explanation: 'The JRE packages the JVM and core runtime class libraries (java.lang, java.util, etc.) needed to run software.'
      }
    ],
    codingChallenge: {
      title: 'Environment Specification Formatter',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program that formats and prints the standard component comparison table header and row: Line 1: "COMPONENT | PURPOSE", Line 2: "JDK       | Compile & Develop", Line 3: "JRE       | Run Applications", Line 4: "JVM       | Execute Bytecode".',
      input_format: 'No input.',
      output_format: 'Four lines matching the component specifications.',
      constraints: 'Follow exact casing and spacing.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        // Output formatted component rows
    }
}`,
      expected_output: `COMPONENT | PURPOSE\nJDK       | Compile & Develop\nJRE       | Run Applications\nJVM       | Execute Bytecode`,
      test_cases: [
        {
          input: '',
          expected_output: `COMPONENT | PURPOSE\nJDK       | Compile & Develop\nJRE       | Run Applications\nJVM       | Execute Bytecode`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'JVM is the abstract runtime machine that executes bytecode and manages memory.',
      'JRE bundles the JVM with standard class libraries so end users can run Java applications.',
      'JDK is the complete developer toolkit containing JRE, javac compiler, jar archiver, and debugger.',
      'Modern Java (9+) modularizes runtimes via jlink, packaging lightweight custom images for production.'
    ]
  },

  // =========================================================================
  // LESSON 03: Java Architecture and Execution Flow
  // =========================================================================
  {
    id: 'top-java-jvm-architecture',
    number: 3,
    numberDisplay: '03',
    moduleId: 'mod-java-architecture-basics',
    moduleTitle: 'Module 01: Java Core Architecture & Basics',
    title: 'Java Architecture and Execution Flow',
    slug: 'java-architecture-execution-flow',
    language: 'java',
    shortDescription: 'Trace the complete internal pipeline of Java execution: from javac source compilation, ClassLoader subsystem, Bytecode Verifier, to the 5 JVM Runtime Memory Areas and Execution Engine.',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    prerequisiteId: 'top-java-jdk-jre-jvm',
    learningObjectives: [
      'Diagram the complete Java execution pipeline from .java source to CPU instruction',
      'Explain the three phases of the ClassLoader: Loading, Linking, and Initialization',
      'Describe the role of the Bytecode Verifier in ensuring memory and type safety',
      'Identify the 5 JVM Runtime Data Areas: Heap, Stack, Method Area, PC Register, and Native Method Stack',
      'Explain the difference between the Interpreter and the Just-In-Time (JIT) Compiler'
    ],
    conceptExplanation: `### 1. The Complete Java Execution Pipeline
How does high-level Java code become electrical signals on physical CPU silicon? Follow the step-by-step pipeline:
\`\`\`text
Java Source Code (.java)
        |
        v [javac compiler]
Platform-Independent Bytecode (.class)
        |
        v [ClassLoader Subsystem]
     Loading -> Linking (Verify, Prepare, Resolve) -> Initialization
        |
        v
JVM Runtime Data Areas (Method Area, Heap, Java Stacks, PC Registers, Native Stacks)
        |
        v
Execution Engine (Interpreter + JIT Compiler + Garbage Collector)
        |
        v [JNI / OS System Calls]
Hardware Machine CPU Execution
\`\`\`

### 2. The ClassLoader Subsystem
When you run \`java Main\`, the JVM doesn't load every Java class on your computer into memory at once. It loads classes lazily on demand through three phases:
1. **Loading**: Reads the binary stream of the \`.class\` file from disk into memory. It follows a delegation hierarchy:
   - *Bootstrap ClassLoader*: Loads core JDK classes (\`java.lang.*\` from \`rt.jar\` or \`java.base\`).
   - *Extension / Platform ClassLoader*: Loads extension libraries.
   - *Application / System ClassLoader*: Loads classes from your project classpath.
2. **Linking**:
   - *Verification (Bytecode Verifier)*: Checks that code adheres to JVM specification, does not cause stack overflows, does not forge pointers, and respects type constraints.
   - *Preparation*: Allocates memory for \`static\` fields and sets them to default zero values.
   - *Resolution*: Replaces symbolic references with direct memory references.
3. **Initialization**: Executes static initializers and assigns initial values to static variables.

### 3. The 5 JVM Runtime Data Areas
The memory allocated to the JVM by the operating system is partitioned into five distinct regions:
* **Method Area (Metaspace in Java 8+)**: Shared across all threads. Stores class-level data: runtime constant pool, field and method descriptions, static variables, and compiled bytecode.
* **Heap Memory**: Shared across all threads. The runtime data area where all **objects** and **arrays** are allocated. Managed automatically by the Garbage Collector (GC).
* **Java Thread Stacks**: Created per thread. Each time a method is invoked, a new **Stack Frame** is pushed. It stores local primitive variables, partial results, and object reference pointers. Popped automatically when the method returns.
* **Program Counter (PC) Registers**: Each thread has its own PC register containing the address of the JVM instruction currently being executed.
* **Native Method Stack**: Holds state for native methods written in C or C++ accessed via the Java Native Interface (JNI).

### 4. The Execution Engine: Interpreter vs. JIT Compiler
* **Interpreter**: Reads bytecode instructions one by one and executes them immediately. It starts applications quickly but executes slower in repetitive loops.
* **JIT (Just-In-Time) Compiler**: Identifies "hot spots" (frequently executed loops and methods) and compiles that bytecode directly into native machine code. Subsequent invocations execute at hardware speeds!
* **Garbage Collector (GC)**: Continuously tracks live object references on the Heap and frees unreferenced memory automatically.`,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        // Local primitive stored in Stack frame
        int x = 42;
        // String object allocated on Heap; reference stored on Stack
        String message = "Memory Architecture";
        System.out.println(message + ": " + x);
    }
}`,
      explanation: 'Demonstrates how the Stack stores primitive value x and object handle message, while the actual String object resides on the Heap.'
    },
    syntax: `// Memory allocation pattern:
public class MemoryDemo {
    static int classCounter = 0;       // Method Area (Metaspace)

    public static void main(String[] args) {
        int localVal = 100;            // Thread Stack Frame
        int[] data = new int[5];       // 'data' reference in Stack; array object in Heap
    }
}`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== JVM Runtime Memory Inspector ===");
        Runtime runtime = Runtime.getRuntime();

        long maxMemoryMB = runtime.maxMemory() / (1024 * 1024);
        long totalMemoryMB = runtime.totalMemory() / (1024 * 1024);
        long freeMemoryMB = runtime.freeMemory() / (1024 * 1024);

        System.out.println("Max Heap Memory:    " + maxMemoryMB + " MB");
        System.out.println("Current Total Heap: " + totalMemoryMB + " MB");
        System.out.println("Free Heap Memory:   " + freeMemoryMB + " MB");
        System.out.println("Available CPU Cores: " + runtime.availableProcessors());
    }
}`,
    expectedOutput: `=== JVM Runtime Memory Inspector ===
Max Heap Memory:    3641 MB
Current Total Heap: 245 MB
Free Heap Memory:   241 MB
Available CPU Cores: 8`,
    stepByStep: [
      '1. javac compiles Main.java into bytecode containing the main method instructions.',
      '2. Application ClassLoader loads Main.class into the JVM Metaspace / Method Area.',
      '3. Bytecode Verifier validates instruction safety and ensures no buffer overruns.',
      '4. Main thread is created with its own Program Counter register and Thread Stack.',
      '5. main() stack frame is pushed; calls to Runtime.getRuntime() allocate objects on the Heap.',
      '6. Execution engine translates bytecode to native code via JIT and executes print calls.'
    ],
    commonMistakes: [
      {
        mistake: 'Assuming local variables live on the Heap',
        codeSnippet: `int count = 10; // Stored in the Thread Stack frame, NOT the Garbage-Collected Heap`,
        correction: 'Remember: Primitive local variables in methods live in Stack memory; Objects live on the Heap.',
        explanation: 'Stack frames are allocated per method call and automatically deallocated upon return without GC overhead.'
      },
      {
        mistake: 'Believing the Bytecode Verifier runs during compilation',
        codeSnippet: `// Misconception: Bytecode verification happens in javac`,
        correction: 'Bytecode verification occurs at RUNTIME inside the JVM ClassLoader before execution.',
        explanation: 'Because bytecode can be loaded over a network or generated dynamically, the JVM must independently verify safety before executing.'
      },
      {
        mistake: 'Confusing the Interpreter with the JIT Compiler',
        codeSnippet: `// Misconception: The JVM only interprets bytecode`,
        correction: 'Modern JVMs use adaptive execution: they interpret initially and JIT-compile hot code to native binary.',
        explanation: 'This hybrid model gives Java fast startup times combined with peak execution speeds competitive with C++.'
      }
    ],
    realWorldExample: {
      scenario: 'High-Frequency Trading JVM Tuning',
      code: `public class Main {
    public static void main(String[] args) {
        // High-frequency trading systems tune JVM memory flags:
        // -Xms4g -Xmx4g (fixed heap size prevents dynamic resizing)
        // -XX:+UseG1GC (low-latency concurrent garbage collection)
        System.out.println("Trading Engine: Heap pinned to prevent GC pauses.");
        System.out.println("JIT Tiered Compilation: Warmup loops optimized to native CPU instructions.");
    }
}`,
      explanation: 'Fintech trading firms optimize JVM memory areas and JIT compiler flags to achieve sub-millisecond latency for order matching engines without garbage collection pauses.'
    },
    practice: {
      prompt: 'Write a Java program that prints the 5 JVM Runtime Data Areas, each on a new line: "1. Method Area", "2. Heap Memory", "3. Java Thread Stack", "4. Program Counter Register", and "5. Native Method Stack".',
      starterCode: `public class Main {
    public static void main(String[] args) {
        // Print the 5 JVM runtime data areas
    }
}`,
      expectedOutputMatcher: '1. Method Area\n2. Heap Memory\n3. Java Thread Stack\n4. Program Counter Register\n5. Native Method Stack',
      hint: 'Print the numbered list items in order using System.out.println.',
      solution: `public class Main {
    public static void main(String[] args) {
        System.out.println("1. Method Area");
        System.out.println("2. Heap Memory");
        System.out.println("3. Java Thread Stack");
        System.out.println("4. Program Counter Register");
        System.out.println("5. Native Method Stack");
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-arch-1',
        question: 'Which JVM memory area is shared across all threads and stores all instantiated objects and arrays?',
        options: ['Java Thread Stack', 'Heap Memory', 'Program Counter (PC) Register', 'Native Method Stack'],
        correctIndex: 1,
        explanation: 'Heap memory is the universal shared pool where all Java objects and arrays are allocated and managed by the Garbage Collector.'
      },
      {
        id: 'mcq-java-arch-2',
        question: 'What is the primary role of the Bytecode Verifier within the JVM ClassLoader subsystem?',
        options: [
          'To format source code indentation',
          'To verify that bytecode is safe, does not overflow the stack, and does not violate memory boundaries',
          'To connect to remote SQL databases',
          'To compress image files'
        ],
        correctIndex: 1,
        explanation: 'The Bytecode Verifier prevents malicious or corrupted bytecode from compromising the host system or bypassing type safety.'
      },
      {
        id: 'mcq-java-arch-3',
        question: 'What does each Java Thread Stack frame hold during execution?',
        options: [
          'All static global variables',
          'Local primitive variables, partial results, and references to Heap objects for the executing method',
          'The compiled native binary of the operating system',
          'The source code comments'
        ],
        correctIndex: 1,
        explanation: 'Each method invocation creates a stack frame holding local variables, method arguments, and intermediate evaluation operands.'
      },
      {
        id: 'mcq-java-arch-4',
        question: 'How does the JIT (Just-In-Time) compiler improve Java application throughput?',
        options: [
          'By deleting unused source files',
          'By converting frequently executed bytecode chunks directly into native machine instructions at runtime',
          'By decreasing internet bandwidth',
          'By disabling type checking'
        ],
        correctIndex: 1,
        explanation: 'The JIT compiler profiles running bytecode and compiles heavily used "hot spots" into machine code, allowing direct CPU execution.'
      },
      {
        id: 'mcq-java-arch-5',
        question: 'What are the three sequential phases of the JVM ClassLoader subsystem?',
        options: [
          'Loading, Linking, and Initialization',
          'Interpreting, Compiling, and Running',
          'Parsing, Lexing, and Scaffolding',
          'Allocating, Freeing, and Deleting'
        ],
        correctIndex: 0,
        explanation: 'The ClassLoader sequentially executes Loading (reading bytecode), Linking (verify, prepare, resolve), and Initialization (executing static blocks).'
      }
    ],
    codingChallenge: {
      title: 'Execution Pipeline Visualizer',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program that outputs the 4 core steps of the Java execution sequence: "Step 1: javac compiles .java to .class bytecode", "Step 2: ClassLoader loads and verifies bytecode", "Step 3: JVM allocates memory across Stack and Heap", and "Step 4: Execution Engine interprets & JIT compiles to native code".',
      input_format: 'No input.',
      output_format: 'Four lines describing the steps in order.',
      constraints: 'Exact text match.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        // Output the 4 steps
    }
}`,
      expected_output: `Step 1: javac compiles .java to .class bytecode\nStep 2: ClassLoader loads and verifies bytecode\nStep 3: JVM allocates memory across Stack and Heap\nStep 4: Execution Engine interprets & JIT compiles to native code`,
      test_cases: [
        {
          input: '',
          expected_output: `Step 1: javac compiles .java to .class bytecode\nStep 2: ClassLoader loads and verifies bytecode\nStep 3: JVM allocates memory across Stack and Heap\nStep 4: Execution Engine interprets & JIT compiles to native code`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Java execution pipeline: Source (.java) -> javac -> Bytecode (.class) -> ClassLoader -> Memory Areas -> Execution Engine.',
      'The ClassLoader subsystem performs Loading, Linking (Verify, Prepare, Resolve), and Initialization.',
      'JVM allocates 5 runtime memory areas: Method Area, Heap, Java Stacks, PC Registers, and Native Stacks.',
      'The Execution Engine balances immediate startup via the Interpreter with peak performance via the JIT compiler.'
    ]
  },

  // =========================================================================
  // LESSON 04: Java Program Structure
  // =========================================================================
  {
    id: 'top-java-program-structure',
    number: 4,
    numberDisplay: '04',
    moduleId: 'mod-java-architecture-basics',
    moduleTitle: 'Module 01: Java Core Architecture & Basics',
    title: 'Java Program Structure',
    slug: 'java-program-structure-syntax',
    language: 'java',
    shortDescription: 'Dissect the anatomy of every Java program keyword by keyword: public, class, static, void, main(String[] args), and System.out.println(), plus naming conventions and comments.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-jvm-architecture',
    learningObjectives: [
      'Deconstruct and explain every keyword in: public static void main(String[] args)',
      'Analyze the System.out.println() hierarchy (System class, out PrintStream, println method)',
      'Apply standard Java naming conventions (PascalCase for classes, camelCase for variables/methods)',
      'Utilize single-line (//), multi-line (/* */), and Javadoc (/** */) comments correctly'
    ],
    conceptExplanation: `### 1. The Canonical Java Program
Every Java program begins with a structured template:
\`\`\`java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

### 2. Dissecting Every Single Token
Let's analyze every word and symbol in this code:
1. **\`public\`**: An access modifier. It specifies that the class or method is accessible from any other package or environment (such as the external JVM launcher).
2. **\`class\`**: The keyword used to declare a class blueprint in Java.
3. **\`Main\`**: The name of the class identifier. In Java, if a class is declared \`public\`, the source file must be named identically: \`Main.java\`.
4. **\`{\` and \`}\`**: Curly braces delineate the beginning and end of a code block (class body, method body, control block).
5. **\`static\`**: Means the method belongs to the class itself rather than to an instantiated object instance. The JVM can invoke \`Main.main()\` directly without first creating an instance using \`new Main()\`.
6. **\`void\`**: The return type indicating that this method does not return any value back to its caller.
7. **\`main\`**: The predefined identifier name of the entry point method recognized by the JVM specification.
8. **\`String[] args\`**: Parameter array of String objects. It captures command-line arguments passed to the program when launched (e.g., \`java Main arg1 arg2\`).
9. **\`System\`**: A built-in final class in the standard \`java.lang\` package that provides access to system resources.
10. **\`out\`**: A \`public static final\` field in the \`System\` class of type \`java.io.PrintStream\`, representing standard output.
11. **\`println()\`**: A method of \`PrintStream\` that prints the passed data to the console followed by a newline character (\`\\n\`).
12. **\`;\` (Semicolon)**: Every statement in Java must terminate with a semicolon. It tells the compiler where an instruction ends.

### 3. Java Naming Conventions
* **Classes & Interfaces**: **PascalCase** (e.g., \`StudentProfile\`, \`PaymentGateway\`, \`Main\`).
* **Methods & Variables**: **camelCase** (e.g., \`calculateInterest\`, \`studentScore\`, \`firstName\`).
* **Constants**: **UPPER_SNAKE_CASE** (e.g., \`MAX_CAPACITY\`, \`PI\`, \`DEFAULT_TIMEOUT\`).
* **Package Names**: All lowercase, reverse domain notation (e.g., \`com.company.project.service\`).

### 4. Java Comment Styles
\`\`\`java
// 1. Single-line comment: Explains immediate line or clause

/* 2. Multi-line comment:
      Useful for temporarily commenting out blocks of code
      or writing extended explanations. */

/**
 * 3. Javadoc documentation comment:
 * Extracted automatically by the javadoc tool to generate HTML API docs.
 * @param args Command line arguments
 */
\`\`\``,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        // Output two formatted lines
        System.out.println("First line of execution.");
        System.out.println("Second line of execution.");
    }
}`,
      explanation: 'Illustrates statement order, sequential execution, and termination with semicolons.'
    },
    syntax: `// Standard Java Structural Template
package my.package.name; // Optional package declaration

import java.util.Scanner; // Optional import declarations

public class ClassName {
    // 1. Fields / Variables
    // 2. Constructors
    // 3. Methods

    public static void main(String[] args) {
        // Method body statements here
    }
}`,
    codeExample: `public class Main {
    /**
     * Entry point for College Registration System demonstration.
     * @param args Command line inputs
     */
    public static void main(String[] args) {
        // Student identity details
        String studentName = "Aarav Sharma";
        int studentId = 202401;
        String major = "Computer Science & Engineering";

        System.out.println("========================================");
        System.out.println("     COLLEGE REGISTRATION PORTAL");
        System.out.println("========================================");
        System.out.println("Student Name: " + studentName);
        System.out.println("Student ID:   " + studentId);
        System.out.println("Department:   " + major);
        System.out.println("========================================");
    }
}`,
    expectedOutput: `========================================
     COLLEGE REGISTRATION PORTAL
========================================
Student Name: Aarav Sharma
Student ID:   202401
Department:   Computer Science & Engineering
========================================`,
    stepByStep: [
      '1. JVM finds and verifies public class Main.',
      '2. JVM locates the exact method signature: public static void main(String[] args).',
      '3. Execution begins at the opening brace { of main.',
      '4. Local variables studentName, studentId, and major are declared and assigned values in the stack frame.',
      '5. String concatenation with + creates composite strings passed to System.out.println.',
      '6. Execution reaches the closing brace } of main; the JVM exits cleanly with status 0.'
    ],
    commonMistakes: [
      {
        mistake: 'Declaring main method without the static keyword',
        codeSnippet: `public void main(String[] args) { ... } // Error: Main method is not static`,
        correction: 'Always include static: public static void main(String[] args).',
        explanation: 'Without static, the JVM cannot call main() without creating an object instance first, which violates the language launch contract.'
      },
      {
        mistake: 'Incorrect casing on System (e.g., system.out.println)',
        codeSnippet: `system.out.println("Error"); // Error: package system does not exist`,
        correction: 'Use uppercase S: System.out.println().',
        explanation: 'Java is strictly case-sensitive. The System class belongs to java.lang and must be capitalized.'
      },
      {
        mistake: 'Using print() when println() was intended',
        codeSnippet: `System.out.print("Line 1");
System.out.print("Line 2"); // Output: Line 1Line 2 on a single combined line`,
        correction: 'Use System.out.println() to automatically append a newline character after printing.',
        explanation: 'print() leaves the console cursor at the end of the current line, while println() moves the cursor to the next line.'
      }
    ],
    realWorldExample: {
      scenario: 'Command-Line Microservice Configuration Bootstrapper',
      code: `public class Main {
    public static void main(String[] args) {
        // Microservices inspect command line args for environment profiles
        String env = args.length > 0 ? args[0] : "PRODUCTION";
        System.out.println("[BOOTSTRAP] Launching microservice in mode: " + env);
        System.out.println("[BOOTSTRAP] Initializing connection pool...");
    }
}`,
      explanation: 'The String[] args parameter allows production Docker containers to pass arguments such as "--port=8080" or "PRODUCTION" directly into the application main method.'
    },
    practice: {
      prompt: 'Write a Java program that displays your name, roll number, and department on three distinct lines with labels "Name: ", "Roll: ", and "Dept: ".',
      starterCode: `public class Main {
    public static void main(String[] args) {
        // Output the three labeled lines
    }
}`,
      expectedOutputMatcher: 'Name: Jinesh\nRoll: 101\nDept: Computer Science',
      hint: 'Use three System.out.println() statements with string concatenation.',
      solution: `public class Main {
    public static void main(String[] args) {
        System.out.println("Name: Jinesh");
        System.out.println("Roll: 101");
        System.out.println("Dept: Computer Science");
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-struct-1',
        question: 'Why is the main method in Java declared as static?',
        options: [
          'To make it private to the class',
          'So the JVM can invoke it directly without instantiating an object of the class first',
          'To speed up arithmetic calculations',
          'To prevent anyone from reading the code'
        ],
        correctIndex: 1,
        explanation: 'The static modifier allows the JVM entry point to be called directly on the class (Main.main()) without calling a constructor.'
      },
      {
        id: 'mcq-java-struct-2',
        question: 'What is the return type of the main entry point method in Java?',
        options: ['int', 'boolean', 'void', 'String'],
        correctIndex: 2,
        explanation: 'In Java, main() returns void. Unlike C, exit status is not returned from main; System.exit(int) is used if an explicit exit code is required.'
      },
      {
        id: 'mcq-java-struct-3',
        question: 'What does String[] args represent in public static void main(String[] args)?',
        options: [
          'An array of command-line arguments passed into the program as strings',
          'A list of JVM memory addresses',
          'The error log file location',
          'The Java compiler version'
        ],
        correctIndex: 0,
        explanation: 'args is an array of String objects capturing any arguments supplied in the terminal when launching the application.'
      },
      {
        id: 'mcq-java-struct-4',
        question: 'Which of the following adheres to official Java naming conventions for a class?',
        options: ['student_data', 'studentData', 'StudentData', 'STUDENTDATA'],
        correctIndex: 2,
        explanation: 'Java classes must be written in PascalCase (UpperCamelCase), starting with a capital letter for each word.'
      },
      {
        id: 'mcq-java-struct-5',
        question: 'Which comment syntax is recognized by the javadoc tool to generate HTML API documentation?',
        options: ['// Comment', '/* Comment */', '/** Comment */', '# Comment'],
        correctIndex: 2,
        explanation: '/** Documentation */ is the standard Javadoc comment syntax processed by the javadoc utility.'
      }
    ],
    codingChallenge: {
      title: 'Formatted Receipt Generator',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program that prints a formatted receipt with three lines: "Item: Textbook", "Price: $45", and "Tax: $3".',
      input_format: 'No input.',
      output_format: 'Three lines of formatted itemized output.',
      constraints: 'Follow exact casing and spacing.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        // Output receipt lines
    }
}`,
      expected_output: `Item: Textbook\nPrice: $45\nTax: $3`,
      test_cases: [
        {
          input: '',
          expected_output: `Item: Textbook\nPrice: $45\nTax: $3`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Every Java program requires at least one class and an entry method: public static void main(String[] args).',
      'System.out.println() prints to standard console output and automatically adds a newline character.',
      'Java identifiers follow strict naming standards: PascalCase for classes, camelCase for methods/variables, UPPER_SNAKE for constants.',
      'Three comment styles exist: single-line (//), multi-line (/* */), and documentation (/** */).'
    ]
  },

  // =========================================================================
  // LESSON 05: First Java Program
  // =========================================================================
  {
    id: 'top-java-first-program',
    number: 5,
    numberDisplay: '05',
    moduleId: 'mod-java-architecture-basics',
    moduleTitle: 'Module 01: Java Core Architecture & Basics',
    title: 'First Java Program: Writing, Compiling, Running & Debugging',
    slug: 'first-java-program-compile-run',
    language: 'java',
    shortDescription: 'Write your first complete Java program from scratch. Master the command-line compilation and execution lifecycle with javac and java, and diagnose compilation vs runtime vs logical errors.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-program-structure',
    learningObjectives: [
      'Create, save, compile, and execute a Java source file using the terminal',
      'Understand the role of the generated .class bytecode file',
      'Distinguish between compilation errors, runtime exceptions, and logical errors',
      'Diagnose and fix common beginner syntax errors with confidence'
    ],
    conceptExplanation: `### 1. The Step-by-Step Program Lifecycle
Creating and executing a Java application consists of four distinct stages:
1. **Creation**: Write your Java code in a plain text file and save it with the \`.java\` extension (e.g., \`Main.java\`).
2. **Compilation**: In your terminal, run the Java compiler:
   \`\`\`bash
   javac Main.java
   \`\`\`
   If there are no syntax errors, \`javac\` finishes silently and generates \`Main.class\` containing bytecode.
3. **Execution**: Launch the Java Virtual Machine:
   \`\`\`bash
   java Main
   \`\`\`
   Notice: You pass the class name \`Main\`, **not** \`Main.class\` or \`Main.java\`.
4. **Output**: The JVM executes \`main()\`, printing output to your terminal:
   \`\`\`text
   Hello, World!
   \`\`\`

### 2. The Three Types of Programming Errors
Every software engineer encounters three broad categories of bugs:
* **Compilation (Syntax) Errors**:
  - Occur at compile time when code violates Java language grammar rules.
  - Examples: Missing semicolons, unmatched curly braces, mismatched variable types, undeclared variables.
  - *The compiler refuses to produce a \`.class\` file until all syntax errors are resolved.*
* **Runtime Errors (Exceptions)**:
  - The program compiles successfully into bytecode, but crashes while running because it attempts an illegal operation.
  - Examples: Dividing an integer by zero (\`ArithmeticException\`), accessing an array index out of bounds (\`ArrayIndexOutOfBoundsException\`), or dereferencing a null pointer (\`NullPointerException\`).
* **Logical Errors (Semantic Bugs)**:
  - The program compiles and runs to completion without crashing, but produces incorrect results due to flawed logic.
  - Examples: Using \`+\` instead of \`*\` when computing an area, or writing \`<\` instead of \`<=\` in a loop condition.

### 3. Debugging Strategy for Beginners
When the compiler reports an error:
1. Look at the **file name and line number** indicated in the message.
2. Read the specific error description (e.g., \`';' expected\` or \`cannot find symbol\`).
3. Inspect that specific line—and the line directly above it—for typos, missing symbols, or mismatched variable names.`,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World! Welcome to Java Engineering.");
    }
}`,
      explanation: 'The classic Hello World program that verifies working compilation and execution tooling.'
    },
    syntax: `// Terminal command pattern:
// Step 1: Save as HelloWorld.java
// public class HelloWorld {
//     public static void main(String[] args) {
//         System.out.println("Hello");
//     }
// }

// Step 2: Compile
// javac HelloWorld.java

// Step 3: Run
// java HelloWorld`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        System.out.println("=========================================");
        System.out.println("        MY FIRST JAVA APPLICATION        ");
        System.out.println("=========================================");
        System.out.println("Hello World! My coding journey has begun.");
        System.out.println("Simple Math: 25 + 75 = " + (25 + 75));
        System.out.println("Status: Compilation and Execution Success!");
        System.out.println("=========================================");
    }
}`,
    expectedOutput: `=========================================
        MY FIRST JAVA APPLICATION        
=========================================
Hello World! My coding journey has begun.
Simple Math: 25 + 75 = 100
Status: Compilation and Execution Success!
=========================================`,
    stepByStep: [
      '1. javac parses Main.java and performs lexical and syntactic analysis.',
      '2. Expression (25 + 75) is evaluated to integer 100 at runtime and converted to text via string concatenation.',
      '3. Output is flushed to standard terminal output buffer.',
      '4. Process terminates cleanly with zero error signals.'
    ],
    commonMistakes: [
      {
        mistake: 'Typing "javac Main" without the .java extension',
        codeSnippet: `javac Main // Error: Class names, 'Main', are only accepted if annotation processing is explicitly requested`,
        correction: 'Always include the file extension when compiling: javac Main.java.',
        explanation: 'javac requires a physical source file name on disk; java requires the logical class name.'
      },
      {
        mistake: 'Forgetting parentheses around arithmetic in print statements',
        codeSnippet: `System.out.println("Result: " + 25 + 75); // Output: Result: 2575 instead of Result: 100`,
        correction: 'Use parentheses around calculations: System.out.println("Result: " + (25 + 75));',
        explanation: 'Without parentheses, + operates from left to right as string concatenation rather than numeric addition.'
      },
      {
        mistake: 'Misunderstanding Division by Zero at runtime',
        codeSnippet: `int result = 10 / 0; // Compiles fine, but crashes with java.lang.ArithmeticException: / by zero`,
        correction: 'Ensure the denominator is non-zero before performing integer division.',
        explanation: 'Integer division by zero is an illegal arithmetic operation that triggers a runtime exception.'
      }
    ],
    realWorldExample: {
      scenario: 'Automated CI/CD Build Pipeline Script',
      code: `public class Main {
    public static void main(String[] args) {
        // Continuous Integration build agents run javac and verify zero exit codes
        System.out.println("[CI/CD] Compiling source tree with javac...");
        System.out.println("[CI/CD] Verifying bytecode integrity...");
        System.out.println("[CI/CD] Executing smoke test suite...");
        System.out.println("[CI/CD] Build: SUCCESSFUL (Exit Code 0)");
    }
}`,
      explanation: 'In real-world software engineering, build servers (GitHub Actions, Jenkins) automatically execute javac to catch syntax bugs before code is ever merged to production.'
    },
    practice: {
      prompt: 'Write a Java program that displays your name on the first line and your favorite programming language on the second line.',
      starterCode: `public class Main {
    public static void main(String[] args) {
        // Output your introduction
    }
}`,
      expectedOutputMatcher: 'Name: Jinesh\nLanguage: Java',
      hint: 'Use two println statements.',
      solution: `public class Main {
    public static void main(String[] args) {
        System.out.println("Name: Jinesh");
        System.out.println("Language: Java");
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-first-1',
        question: 'Which terminal command compiles a Java file named Calculator.java into bytecode?',
        options: ['java Calculator.java', 'javac Calculator.java', 'compile Calculator', 'javac Calculator'],
        correctIndex: 1,
        explanation: 'javac Calculator.java instructs the compiler to generate Calculator.class bytecode.'
      },
      {
        id: 'mcq-java-first-2',
        question: 'What is generated on disk after running javac Main.java successfully?',
        options: ['Main.exe', 'Main.class', 'Main.obj', 'Main.bin'],
        correctIndex: 1,
        explanation: 'The Java compiler produces a .class file containing platform-independent bytecode.'
      },
      {
        id: 'mcq-java-first-3',
        question: 'What type of error occurs when your code violates language syntax rules like forgetting a closing brace }?',
        options: ['Compilation (Syntax) Error', 'Runtime Error', 'Logical Error', 'Network Timeout'],
        correctIndex: 0,
        explanation: 'Grammar and structural violations prevent compilation and are classified as compilation/syntax errors.'
      },
      {
        id: 'mcq-java-first-4',
        question: 'What type of error is present when a program compiles and runs without crashing, but calculates the wrong total due to an incorrect math formula?',
        options: ['Compilation Error', 'Runtime Exception', 'Logical Error', 'Out of Memory Error'],
        correctIndex: 2,
        explanation: 'Logical errors occur when the algorithm itself is incorrect, yielding invalid results despite legal syntax.'
      },
      {
        id: 'mcq-java-first-5',
        question: 'What will be printed by: System.out.println("Sum: " + 10 + 20); ?',
        options: ['Sum: 30', 'Sum: 1020', 'Sum: 10 20', 'Compilation Error'],
        correctIndex: 1,
        explanation: 'String concatenation associates left-to-right, turning 10 into "10", then concatenating 20 to produce "Sum: 1020". Use (10 + 20) for addition.'
      }
    ],
    codingChallenge: {
      title: 'Arithmetic Output Formatter',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program that prints: Line 1: "Multiplication: 8 * 9 = 72", Line 2: "Division: 100 / 4 = 25".',
      input_format: 'No input.',
      output_format: 'Two lines showing the calculated arithmetic operations.',
      constraints: 'Follow exact casing and spacing.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        // Output arithmetic results
    }
}`,
      expected_output: `Multiplication: 8 * 9 = 72\nDivision: 100 / 4 = 25`,
      test_cases: [
        {
          input: '',
          expected_output: `Multiplication: 8 * 9 = 72\nDivision: 100 / 4 = 25`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Java lifecycle: Edit .java source -> Compile with javac -> Run bytecode with java -> Output on JVM.',
      'Three error categories: Compilation errors (syntax), Runtime exceptions (crashes), and Logical errors (wrong output).',
      'The .class file stores portable bytecode that executes across any operating system equipped with a JVM.',
      'Always use parentheses around numeric calculations when concatenating with strings in print statements.'
    ]
  },

  // =========================================================================
  // LESSON 06: Java Development Environment & Module 01 Assessment
  // =========================================================================
  {
    id: 'top-java-dev-environment',
    number: 6,
    numberDisplay: '06',
    moduleId: 'mod-java-architecture-basics',
    moduleTitle: 'Module 01: Java Core Architecture & Basics',
    title: 'Java Development Environment & Module 01 Assessment',
    slug: 'java-development-environment-setup',
    language: 'java',
    shortDescription: 'Configure your professional Java developer workstation: JDK installation, setting PATH and JAVA_HOME, VS Code setup with Extension Pack for Java, and complete the comprehensive Module 01 Assessment.',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    prerequisiteId: 'top-java-first-program',
    learningObjectives: [
      'Install and configure a modern JDK distribution (OpenJDK, Temurin, Oracle JDK)',
      'Set and verify system environment variables: JAVA_HOME and the PATH system variable',
      'Set up Visual Studio Code with the Extension Pack for Java',
      'Create, build, and debug Java projects inside modern IDEs',
      'Demonstrate mastery of Module 01 concepts through the comprehensive final assessment'
    ],
    conceptExplanation: `### 1. Choosing a JDK Distribution
Java is governed by the OpenJDK open-source reference specification. Several trusted enterprise distributions are available for free:
* **Eclipse Temurin (Adoptium)**: Highly popular, community-driven, enterprise-grade build.
* **Amazon Corretto**: Amazon's multiplatform, production-ready OpenJDK distribution.
* **Microsoft Build of OpenJDK**: Tuned for cloud and Windows/Azure workloads.
* **Oracle OpenJDK**: Official reference releases.

### 2. Configuring System Environment Variables
For your command line and IDEs to find the compiler and runtime tools:
1. **JAVA_HOME**: Points to the root directory where the JDK is installed.
   - Example Windows: \`C:\\Program Files\\Java\\jdk-21\`
   - Example macOS: \`/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home\`
   - Example Linux: \`/usr/lib/jvm/java-21-openjdk-amd64\`
2. **PATH**: Appends the \`bin\` directory (\`%JAVA_HOME%\\bin\` or \`$JAVA_HOME/bin\`) to the operating system path so commands like \`javac\` and \`java\` can be invoked from any terminal directory.

### 3. Setting Up Visual Studio Code for Java
1. Install **Visual Studio Code**.
2. Open the Extensions marketplace (\`Ctrl+Shift+X\` / \`Cmd+Shift+X\`).
3. Search for and install **Extension Pack for Java** (published by Microsoft). It includes:
   - *Language Support for Java™ by Red Hat*: Syntax, autocomplete, diagnostics.
   - *Debugger for Java*: Interactive breakpoints, variable watches, step-over/into.
   - *Test Runner for Java*: Run and debug JUnit/TestNG tests.
   - *Project Manager for Java*: Manage project dependencies and classpath.
   - *Maven for Java*: Build automation support.

### 4. Common Environment Setup Pitfalls
* **"javac is not recognized as an internal or external command"**: The JDK \`bin\` folder has not been added to your system \`PATH\` variable.
* **Version Mismatch**: Running \`javac -version\` and \`java -version\` returns different numbers. This happens when an older JRE exists earlier in the PATH search order.
* **Source Level Incompatibility**: Compiling with a newer JDK (e.g., 21) and running on an older JVM (e.g., 17) results in \`java.lang.UnsupportedClassVersionError\`.

---

### MODULE 01 COMPREHENSIVE ASSESSMENT SPECIFICATION
This lesson concludes Module 01 with a comprehensive assessment covering:
- Java definition, origin, and James Gosling at Sun Microsystems
- The "Write Once, Run Anywhere" (WORA) philosophy
- 11 core language features
- JDK vs. JRE vs. JVM comparison
- Java execution pipeline, ClassLoader, Bytecode Verifier, and JIT compilation
- JVM Memory areas (Method Area, Heap, Stacks, PC Registers)
- Anatomy of \`public static void main(String[] args)\`
- Compiling with \`javac\` and running with \`java\`
- Diagnosing syntax vs. runtime vs. logical errors`,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Environment: Java Development Kit Configured.");
        System.out.println("Ready for Module 01 Final Assessment!");
    }
}`,
      explanation: 'Verifies complete toolchain readiness before taking the Module 01 final assessment.'
    },
    syntax: `// Verifying Environment in Windows PowerShell:
// $env:JAVA_HOME
// java -version
// javac -version

// Verifying Environment in macOS / Linux:
// echo $JAVA_HOME
// which javac
// which java`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        System.out.println("==========================================");
        System.out.println("   MODULE 01: ARCHITECTURE MILESTONE CHECK");
        System.out.println("==========================================");
        System.out.println("[x] Lesson 01: Introduction to Java (WORA)");
        System.out.println("[x] Lesson 02: JDK, JRE, and JVM Architecture");
        System.out.println("[x] Lesson 03: JVM Internals & Memory Layout");
        System.out.println("[x] Lesson 04: Program Structure & Syntax");
        System.out.println("[x] Lesson 05: Compiling, Running & Debugging");
        System.out.println("[x] Lesson 06: Environment Setup & Tooling");
        System.out.println("==========================================");
        System.out.println("Result: Module 01 Certified & Ready for Module 02!");
    }
}`,
    expectedOutput: `==========================================
   MODULE 01: ARCHITECTURE MILESTONE CHECK
==========================================
[x] Lesson 01: Introduction to Java (WORA)
[x] Lesson 02: JDK, JRE, and JVM Architecture
[x] Lesson 03: JVM Internals & Memory Layout
[x] Lesson 04: Program Structure & Syntax
[x] Lesson 05: Compiling, Running & Debugging
[x] Lesson 06: Environment Setup & Tooling
==========================================
Result: Module 01 Certified & Ready for Module 02!`,
    stepByStep: [
      '1. Development workstation verifies presence of JDK bin in system PATH.',
      '2. javac compiles the milestone verification class into verified bytecode.',
      '3. JVM initializes runtime memory areas and launches the main thread.',
      '4. Progress summary checks are sent to console stdout.',
      '5. Learner is prepared for the interactive module assessment.'
    ],
    commonMistakes: [
      {
        mistake: 'Setting JAVA_HOME to the bin folder instead of the JDK root directory',
        codeSnippet: `JAVA_HOME = C:\\Program Files\\Java\\jdk-21\\bin // Incorrect`,
        correction: 'Set JAVA_HOME to the JDK root: C:\\Program Files\\Java\\jdk-21, then add %JAVA_HOME%\\bin to PATH.',
        explanation: 'Build tools like Maven and Gradle look for %JAVA_HOME%\\lib and %JAVA_HOME%\\bin; setting JAVA_HOME to bin breaks these tools.'
      },
      {
        mistake: 'Failing to restart terminal after updating PATH',
        codeSnippet: `javac: command not found (in an old terminal window open before editing PATH)`,
        correction: 'Close and reopen your terminal or VS Code to reload updated environment variables.',
        explanation: 'Environment variable changes only take effect in new terminal sessions spawned after the edit.'
      },
      {
        mistake: 'UnsupportedClassVersionError when sharing class files across machines',
        codeSnippet: `java.lang.UnsupportedClassVersionError: Has been compiled by a more recent version of the Java Runtime`,
        correction: 'Ensure the target runtime JVM version is equal to or newer than the compiler version used.',
        explanation: 'A JVM cannot execute bytecode compiled by a newer compiler unless targeted with --release flags.'
      }
    ],
    realWorldExample: {
      scenario: 'Enterprise Developer Onboarding Configuration Script',
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println("[SETUP] Verifying Developer Workstation Configuration...");
        System.out.println("[CHECK 1] JAVA_HOME defined: YES");
        System.out.println("[CHECK 2] PATH contains %JAVA_HOME%/bin: YES");
        System.out.println("[CHECK 3] VS Code Language Server connected: YES");
        System.out.println("[STATUS] Workstation calibrated for Enterprise Java Development.");
    }
}`,
      explanation: 'Enterprise software organizations use automated workstation audit scripts to verify that every engineer has standardized JDK versions and IDE plugins installed.'
    },
    practice: {
      prompt: 'Write a Java program that displays three environment configuration checklist items: "1. Install JDK", "2. Configure PATH", and "3. Setup IDE".',
      starterCode: `public class Main {
    public static void main(String[] args) {
        // Output the setup checklist
    }
}`,
      expectedOutputMatcher: '1. Install JDK\n2. Configure PATH\n3. Setup IDE',
      hint: 'Print the three checklist items on consecutive lines.',
      solution: `public class Main {
    public static void main(String[] args) {
        System.out.println("1. Install JDK");
        System.out.println("2. Configure PATH");
        System.out.println("3. Setup IDE");
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-env-1',
        question: 'Which environment variable specifies the root directory of the installed Java Development Kit?',
        options: ['PATH', 'JAVA_HOME', 'CLASSPATH', 'JDK_ROOT'],
        correctIndex: 1,
        explanation: 'JAVA_HOME points to the JDK installation root directory and is utilized by build tools like Maven and Gradle.'
      },
      {
        id: 'mcq-java-env-2',
        question: 'Which directory inside the JDK installation must be appended to the system PATH variable?',
        options: ['/lib', '/bin', '/include', '/conf'],
        correctIndex: 1,
        explanation: 'The /bin directory contains the executable binaries (javac, java, jar, jdb) that need to be accessible from any terminal.'
      },
      {
        id: 'mcq-java-env-3',
        question: 'What is the root cause of the error: "javac is not recognized as an internal or external command"?',
        options: [
          'The computer has run out of RAM',
          'The JDK bin directory has not been added to the system PATH environment variable',
          'The Java program has a syntax error',
          'The monitor resolution is too low'
        ],
        correctIndex: 1,
        explanation: 'The shell cannot locate the javac executable file because its folder path is missing from the PATH variable.'
      },
      {
        id: 'mcq-java-env-4',
        question: 'What causes java.lang.UnsupportedClassVersionError at runtime?',
        options: [
          'The program ran out of disk space',
          'The .class file was compiled with a newer JDK than the JVM trying to execute it',
          'A variable was spelled incorrectly',
          'The internet connection disconnected'
        ],
        correctIndex: 1,
        explanation: 'Older JVM runtimes cannot execute bytecode created by newer compilers with higher major class file versions.'
      },
      {
        id: 'mcq-java-env-5',
        question: 'Which VS Code extension pack is officially recommended for full Java development support?',
        options: ['Python Extension Pack', 'C/C++ Extension Pack', 'Extension Pack for Java (Microsoft)', 'Docker Extension'],
        correctIndex: 2,
        explanation: 'Microsoft\'s Extension Pack for Java provides language server support, debugging, test running, and Maven integration.'
      }
    ],
    codingChallenge: {
      title: 'Module 01 Certification Summary',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program that outputs the Module 01 completion banner: Line 1: "MODULE 01 COMPLETE", Line 2: "Java Core Architecture & Basics: PASSED", Line 3: "Proceeding to Module 02: Fundamentals & Control Structures".',
      input_format: 'No input.',
      output_format: 'Three lines matching the exact certification text.',
      constraints: 'Exact text match.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        // Output certification summary
    }
}`,
      expected_output: `MODULE 01 COMPLETE\nJava Core Architecture & Basics: PASSED\nProceeding to Module 02: Fundamentals & Control Structures`,
      test_cases: [
        {
          input: '',
          expected_output: `MODULE 01 COMPLETE\nJava Core Architecture & Basics: PASSED\nProceeding to Module 02: Fundamentals & Control Structures`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'JAVA_HOME should point to the JDK root; PATH should include %JAVA_HOME%/bin.',
      'VS Code with the Extension Pack for Java provides full language intelligence, debugging, and testing.',
      'Module 01 established the core foundations: Java history, WORA, JDK/JRE/JVM, memory layout, program structure, and compilation lifecycle.',
      'Learners are now fully equipped to master variables, data types, operators, and control flow in Module 02.'
    ]
  }
];
