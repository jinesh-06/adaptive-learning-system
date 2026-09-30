import { JavaTopic } from './javaFundamentalsData';

export const JAVA_MODULE_3_TOPICS: JavaTopic[] = [
  // =========================================================================
  // LESSON 18: Introduction to Methods
  // =========================================================================
  {
    id: 'top-java-methods-intro',
    number: 18,
    numberDisplay: '18',
    moduleId: 'mod-java-methods-arrays',
    moduleTitle: 'Module 03: Java Methods & Arrays',
    title: 'Introduction to Methods',
    slug: 'java-methods-introduction',
    language: 'java',
    shortDescription: 'Master procedural decomposition and modular reusability: method declarations, definitions, static invocation, parameter lists, return types, void methods, and execution flow.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-mod2-problems',
    learningObjectives: [
      'Explain what a method is and the benefits of modular programming (DRY principle)',
      'Analyze the structural components of a method header: access modifier, static keyword, return type, name, and parameters',
      'Invoke static methods from the main method entry point',
      'Distinguish void methods from value-returning methods'
    ],
    conceptExplanation: `### 1. What is a Method?
A **method** is a reusable block of code that performs a specific, well-defined task. Methods embody the fundamental software engineering principle: **DRY (Don't Repeat Yourself)**.
Instead of copying and pasting 20 lines of arithmetic logic in five different places, you write the logic once inside a method and call it whenever needed.

### 2. Anatomy of a Method Header
\`\`\`java
public static int calculateTotal(int price, int quantity) {
    int total = price * quantity;
    return total;
}
\`\`\`
Let's analyze every component:
1. **\`public\`**: Access modifier determining who can invoke this method.
2. **\`static\`**: Belongs to the class itself. Can be invoked directly from \`main()\` without instantiating an object using \`new\`.
3. **\`int\` (Return Type)**: The data type of the value the method sends back to its caller. If the method performs an action without sending data back, the return type is **\`void\`**.
4. **\`calculateTotal\` (Method Name)**: The identifier, conventionally written in **camelCase**.
5. **\`(int price, int quantity)\` (Parameter List)**: The variables that receive input values passed into the method.
6. **\`return total;\`**: Transmits the computed result back to the caller and terminates method execution.

### 3. Method Call Mechanics
When a method is called:
1. Execution of the calling method (e.g., \`main\`) pauses.
2. A new **Stack Frame** is pushed onto the thread call stack.
3. Arguments are copied into the method's parameters.
4. The method statements execute.
5. Upon reaching \`return\`, the stack frame is popped, and control returns to the caller with the result.`,
    simpleExample: {
      code: `public class Main {
    public static int add(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        int sum = add(15, 25);
        System.out.println("Sum: " + sum);
    }
}`,
      explanation: 'Defines static method add that returns the sum of two integers.'
    },
    syntax: `// Method Declaration Syntax:
modifier static returnType methodName(type1 param1, type2 param2) {
    // method body
    return value; // (omitted if returnType is void)
}

// Method Invocation:
returnType result = methodName(arg1, arg2);`,
    codeExample: `public class Main {
    // Reusable modular helper methods:
    public static int findMax(int num1, int num2) {
        return (num1 > num2) ? num1 : num2;
    }

    public static boolean isEven(int n) {
        return n % 2 == 0;
    }

    public static void printBanner(String title) {
        System.out.println("========================================");
        System.out.println("   " + title.toUpperCase());
        System.out.println("========================================");
    }

    public static void main(String[] args) {
        printBanner("Modular Math Engine");

        int a = 45, b = 78;
        int max = findMax(a, b);
        System.out.println("Between " + a + " and " + b + ", Maximum is: " + max);
        System.out.println("Is " + max + " even? " + isEven(max));
    }
}`,
    expectedOutput: `========================================
   MODULAR MATH ENGINE
========================================
Between 45 and 78, Maximum is: 78
Is 78 even? true`,
    stepByStep: [
      '1. main invokes printBanner("Modular Math Engine"); a new stack frame is created.',
      '2. printBanner formats title and prints to stdout, then returns (void).',
      '3. main calls findMax(45, 78); arguments 45 and 78 are passed to num1 and num2.',
      '4. findMax returns integer 78; returned value is stored in local variable max.',
      '5. isEven(78) computes 78 % 2 == 0 (true) and returns boolean true.'
    ],
    commonMistakes: [
      {
        mistake: 'Calling a non-static method directly from static main()',
        codeSnippet: `public int compute(int x) { return x * 2; }
public static void main(String[] args) {
    compute(5); // Error: non-static method compute cannot be referenced from a static context
}`,
        correction: 'Add the static keyword: public static int compute(int x).',
        explanation: 'Static methods exist at the class level and cannot call instance methods without creating an object instance.'
      },
      {
        mistake: 'Missing return statement in a non-void method',
        codeSnippet: `public static int getScore() {
    int s = 100;
    // Missing return! Error: missing return statement
}`,
        correction: 'Ensure all execution branches in a non-void method return an appropriate type.',
        explanation: 'The Java compiler verifies that every possible execution path yields a return value matching the signature.'
      }
    ],
    realWorldExample: {
      scenario: 'Enterprise Payment Tax Computation Module',
      code: `public class Main {
    public static double computeTax(double subtotal, double taxRate) {
        return Math.round(subtotal * taxRate * 100.0) / 100.0;
    }

    public static void main(String[] args) {
        double itemPrice = 129.99;
        double salesTax = computeTax(itemPrice, 0.0825);
        System.out.printf("Item: $%.2f | Tax: $%.2f | Total: $%.2f%n", itemPrice, salesTax, (itemPrice + salesTax));
    }
}`,
      explanation: 'E-commerce checkout platforms organize pricing, discounts, shipping, and tax into modular helper methods that can be unit-tested in isolation.'
    },
    practice: {
      prompt: 'Write a Java program with a static method cube(int n) that returns n * n * n. In main, calculate the cube of 4 and print "Cube: 64".',
      starterCode: `public class Main {
    // Define cube method

    public static void main(String[] args) {
        // Call cube(4) and print result
    }
}`,
      expectedOutputMatcher: 'Cube: 64',
      hint: 'public static int cube(int n) { return n * n * n; }',
      solution: `public class Main {
    public static int cube(int n) {
        return n * n * n;
    }

    public static void main(String[] args) {
        int result = cube(4);
        System.out.println("Cube: " + result);
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-meth-1',
        question: 'What return type is specified when a method performs an action but does not return any data to its caller?',
        options: ['null', 'void', 'empty', 'int'],
        correctIndex: 1,
        explanation: 'The void keyword declares that a method does not return a value.'
      },
      {
        id: 'mcq-java-meth-2',
        question: 'Why must helper methods called directly from main() be marked with the static modifier?',
        options: [
          'Because main() is static, and static contexts can only call other static members directly without an instance',
          'To make the method run faster',
          'To encrypt the method bytecode',
          'Because non-static methods are deprecated'
        ],
        correctIndex: 0,
        explanation: 'Static methods belong to the class; invoking a non-static method requires an object instance of the class.'
      },
      {
        id: 'mcq-java-meth-3',
        question: 'What happens in memory when a Java method is invoked?',
        options: [
          'The entire hard disk is indexed',
          'A new stack frame is pushed onto the thread call stack',
          'Heap memory is completely cleared',
          'Operating system reboots'
        ],
        correctIndex: 1,
        explanation: 'Each method call allocates a stack frame holding parameters, local variables, and return addresses.'
      },
      {
        id: 'mcq-java-meth-4',
        question: 'What keyword immediately exits a method and sends a value back to the caller?',
        options: ['break', 'continue', 'return', 'exit'],
        correctIndex: 2,
        explanation: 'The return statement terminates method execution and passes the return expression to the caller.'
      },
      {
        id: 'mcq-java-meth-5',
        question: 'Which principle of software engineering do methods promote by eliminating duplicated logic?',
        options: ['DRY (Don\'t Repeat Yourself)', 'KISS', 'YAGNI', 'SOLID'],
        correctIndex: 0,
        explanation: 'The DRY principle states that every piece of knowledge or logic must have a single, unambiguous representation in a system.'
      }
    ],
    codingChallenge: {
      title: 'Modular Celsius to Fahrenheit Converter',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program with a static method toFahrenheit(double celsius) that returns (celsius * 9.0 / 5.0) + 32.0. In main, call toFahrenheit(100.0) and print "100.0 C = 212.0 F".',
      input_format: 'No input.',
      output_format: 'One line showing the converted temperature.',
      constraints: 'Exact text match.',
      starter_code: `public class Main {
    // Define toFahrenheit

    public static void main(String[] args) {
        // Call and print
    }
}`,
      expected_output: `100.0 C = 212.0 F`,
      test_cases: [
        {
          input: '',
          expected_output: `100.0 C = 212.0 F`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Methods encapsulate reusable algorithmic logic following the DRY principle.',
      'A method signature defines its access modifier, static nature, return type, name, and parameter list.',
      'static methods can be called directly without instantiating objects.',
      'void methods perform actions without returning values; non-void methods require return statements on all paths.'
    ]
  },

  // =========================================================================
  // LESSON 19: Method Parameters and Return Values
  // =========================================================================
  {
    id: 'top-java-method-parameters',
    number: 19,
    numberDisplay: '19',
    moduleId: 'mod-java-methods-arrays',
    moduleTitle: 'Module 03: Java Methods & Arrays',
    title: 'Method Parameters and Return Values',
    slug: 'java-method-parameters-return-values',
    language: 'java',
    shortDescription: 'Master formal parameters vs. actual arguments, multi-parameter methods, return data passing, call stack frames, variable lifetime, and early return guards.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-methods-intro',
    learningObjectives: [
      'Distinguish formal parameters (in method definition) from actual arguments (at call site)',
      'Design methods accepting multiple diverse parameter types',
      'Implement guard clauses using early return statements to reduce nesting',
      'Trace call stack frames and understand variable lifetime and local scope'
    ],
    conceptExplanation: `### 1. Parameters vs. Arguments
While often used interchangeably in casual conversation, these terms have exact definitions in computer science:
* **Formal Parameters**: The variable declarations listed in the method definition header.
  \`\`\`java
  public static double calculateInterest(double principal, double rate, int years) // Parameters
  \`\`\`
* **Actual Arguments**: The concrete values or expressions supplied when the method is invoked at the call site.
  \`\`\`java
  double result = calculateInterest(10000.0, 0.05, 3); // Arguments
  \`\`\`

### 2. Return Values and Type Compatibility
A method must return a value compatible with its declared return type:
* If declared as \`double\`, it can return a \`double\`, \`float\`, or \`int\` (widening).
* It **cannot** return a wider type (e.g., an \`int\` method cannot return a \`double\` without a cast).
* In a \`void\` method, you can use an empty \`return;\` statement to exit early.

### 3. Guard Clauses (Early Return Pattern)
Instead of deeply nesting multiple \`if-else\` blocks, professional Java engineers use **guard clauses** to exit early when inputs are invalid:
\`\`\`java
public static double divide(double a, double b) {
    if (b == 0.0) {
        System.out.println("Error: Division by zero");
        return 0.0; // Early exit guard
    }
    return a / b;
}
\`\`\`

### 4. Call Stack Frame Lifecycle
1. When \`main()\` calls \`methodA()\`, a frame for \`methodA\` is placed on top of \`main\`.
2. When \`methodA()\` calls \`methodB()\`, another frame is pushed on top.
3. \`methodB()\` executes and returns; its frame is popped and destroyed.
4. \`methodA()\` resumes execution with the returned value.
5. All local variables declared inside a frame cease to exist once that frame is popped.`,
    simpleExample: {
      code: `public class Main {
    public static String greet(String name, boolean isVIP) {
        if (isVIP) return "Welcome, VIP " + name + "!";
        return "Hello, " + name + ".";
    }

    public static void main(String[] args) {
        System.out.println(greet("Sarah", true));
        System.out.println(greet("Bob", false));
    }
}`,
      explanation: 'Demonstrates a method with multiple parameters and different return strings.'
    },
    syntax: `// Method with multiple parameters:
public static ReturnType methodName(Type1 p1, Type2 p2, Type3 p3) {
    // Early guard:
    if (invalidCondition) {
        return fallbackValue;
    }
    return primaryResult;
}`,
    codeExample: `public class Main {
    public static double calculateSimpleInterest(double principal, double annualRate, int years) {
        if (principal <= 0 || annualRate <= 0 || years <= 0) {
            return 0.0; // Guard clause
        }
        return (principal * annualRate * years) / 100.0;
    }

    public static void main(String[] args) {
        double p = 5000.0;
        double rate = 6.5;
        int t = 3;

        double interest = calculateSimpleInterest(p, rate, t);
        double maturityAmount = p + interest;

        System.out.println("=== Fixed Deposit Maturity Calculator ===");
        System.out.printf("Principal Deposit: $%.2f%n", p);
        System.out.printf("Annual Rate:       %.1f%%%n", rate);
        System.out.printf("Term Duration:     %d years%n", t);
        System.out.printf("Interest Earned:   $%.2f%n", interest);
        System.out.printf("Total Maturity:    $%.2f%n", maturityAmount);
    }
}`,
    expectedOutput: `=== Fixed Deposit Maturity Calculator ===
Principal Deposit: $5000.00
Annual Rate:       6.5%
Term Duration:     3 years
Interest Earned:   $975.00
Total Maturity:    $5975.00`,
    stepByStep: [
      '1. main sets principal = 5000.0, rate = 6.5, t = 3.',
      '2. calculateSimpleInterest is called; actual arguments are copied into stack frame parameters.',
      '3. Guard clause checks inputs (all are positive).',
      '4. Formula (5000 * 6.5 * 3) / 100 evaluates to 975.0 and is returned.',
      '5. Results are printed using printf with two decimal places.'
    ],
    commonMistakes: [
      {
        mistake: 'Mismatched parameter order at call site',
        codeSnippet: `public static void createAccount(String email, int age) { ... }
createAccount(25, "user@mail.com"); // Compiler Error: incompatible types`,
        correction: 'Ensure actual arguments match the types and sequence of formal parameters.',
        explanation: 'Java matches method calls strictly by position and type.'
      },
      {
        mistake: 'Attempting to access a parameter outside its method',
        codeSnippet: `public static void calc(int x) { ... }
public static void main(String[] args) {
    System.out.println(x); // Error: cannot find symbol variable x
}`,
        correction: 'Parameters are strictly local to the method stack frame in which they are declared.',
        explanation: 'Variable scope restricts parameters to the method body; they do not exist in caller methods.'
      }
    ],
    realWorldExample: {
      scenario: 'Loan Underwriting Risk Assessment Engine',
      code: `public class Main {
    public static boolean evaluateCreditRisk(int creditScore, double debtToIncomeRatio) {
        if (creditScore < 620) return false; // Early rejection
        if (debtToIncomeRatio > 0.43) return false; // Excessive debt
        return true; // Approved
    }

    public static void main(String[] args) {
        boolean isApproved = evaluateCreditRisk(740, 0.28);
        System.out.println("[UNDERWRITING] Loan Application Approved? " + isApproved);
    }
}`,
      explanation: 'Financial risk assessment microservices rely on clean guard clauses to rapidly filter high-risk loan requests before triggering expensive database audits.'
    },
    practice: {
      prompt: 'Write a Java program with a method multiply(int a, int b) that returns a * b. In main, print "Product: " + multiply(6, 7).',
      starterCode: `public class Main {
    // Define multiply

    public static void main(String[] args) {
        // Call multiply(6, 7) and print
    }
}`,
      expectedOutputMatcher: 'Product: 42',
      hint: 'public static int multiply(int a, int b) { return a * b; }',
      solution: `public class Main {
    public static int multiply(int a, int b) {
        return a * b;
    }

    public static void main(String[] args) {
        System.out.println("Product: " + multiply(6, 7));
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-param-1',
        question: 'What is the technical term for the concrete values supplied to a method when it is called?',
        options: ['Formal parameters', 'Actual arguments', 'Return types', 'Access modifiers'],
        correctIndex: 1,
        explanation: 'Actual arguments are the concrete values passed into a method call at runtime.'
      },
      {
        id: 'mcq-java-param-2',
        question: 'What happens to local variables and parameters when a method finishes executing and returns?',
        options: [
          'They are saved to a file on disk',
          'Their stack frame is popped and they cease to exist in memory',
          'They become global variables',
          'They move to the Garbage Collector Heap'
        ],
        correctIndex: 1,
        explanation: 'Local variables and parameter handles exist only for the lifespan of their method stack frame.'
      },
      {
        id: 'mcq-java-param-3',
        question: 'Can a method return a double if its declared return type is int?',
        options: [
          'Yes, Java automatically converts it',
          'No, because double to int is a narrowing conversion requiring an explicit cast',
          'Yes, if the number is less than 100',
          'Only in Java 21'
        ],
        correctIndex: 1,
        explanation: 'Narrowing conversions require an explicit cast; returning a double from an int method is a compile-time error.'
      },
      {
        id: 'mcq-java-param-4',
        question: 'What is a "guard clause" in software engineering?',
        options: [
          'A security firewall',
          'An early return statement at the start of a method that checks for invalid inputs and exits immediately',
          'A comment that hides code',
          'A loop that guards memory'
        ],
        correctIndex: 1,
        explanation: 'Guard clauses handle boundary and invalid conditions up front, eliminating deeply nested if-else structures.'
      },
      {
        id: 'mcq-java-param-5',
        question: 'Can a method have zero parameters and still return a value?',
        options: ['No, every method must take at least one parameter', 'Yes, for example: public static int getRandomNumber()', 'Only if it is marked final', 'Only in abstract classes'],
        correctIndex: 1,
        explanation: 'Methods can take zero parameters and return a computed value, such as Math.random().'
      }
    ],
    codingChallenge: {
      title: 'Hypotenuse Calculator',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program with a method hypotenuse(double a, double b) that returns Math.sqrt(a*a + b*b). In main, call hypotenuse(3.0, 4.0) and print "Hypotenuse: 5.0".',
      input_format: 'No input.',
      output_format: 'One line showing the hypotenuse.',
      constraints: 'Exact text match.',
      starter_code: `public class Main {
    // Define hypotenuse

    public static void main(String[] args) {
        // Call and print
    }
}`,
      expected_output: `Hypotenuse: 5.0`,
      test_cases: [
        {
          input: '',
          expected_output: `Hypotenuse: 5.0`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Formal parameters are defined in method headers; actual arguments are passed at call sites.',
      'Return statements must supply data compatible with the method declared return type.',
      'Guard clauses improve code clarity by exiting early on invalid conditions.',
      'Local variables and parameters live in the thread stack frame and are destroyed upon method exit.'
    ]
  },

  // =========================================================================
  // LESSON 20: Method Overloading
  // =========================================================================
  {
    id: 'top-java-method-overloading',
    number: 20,
    numberDisplay: '20',
    moduleId: 'mod-java-methods-arrays',
    moduleTitle: 'Module 03: Java Methods & Arrays',
    title: 'Method Overloading',
    slug: 'java-method-overloading-polymorphism',
    language: 'java',
    shortDescription: 'Master compile-time polymorphism through method overloading: defining methods with identical names but distinct parameter counts, types, and sequences. Understand overload resolution and why return type alone cannot overload.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-method-parameters',
    learningObjectives: [
      'Define method overloading and explain compile-time (static) polymorphism',
      'Apply the three legal overloading mechanisms: differing parameter count, types, or order',
      'Explain why changing only the return type does not constitute a valid overload',
      'Understand how the compiler resolves overloaded methods using argument types'
    ],
    conceptExplanation: `### 1. What is Method Overloading?
In Java, **Method Overloading** allows multiple methods within the same class to share the **exact same name**, provided they have **different parameter lists** (different method signatures).
This is a form of **compile-time polymorphism** (also known as static polymorphism).
*Why is this useful?*
Instead of having awkwardly named methods like \`addTwoInts(int, int)\`, \`addThreeInts(int, int, int)\`, and \`addDoubles(double, double)\`, you provide a single intuitive method name: **\`add\`**.

### 2. What Constitutes a Method Signature?
In Java, a method's signature consists of:
\`\`\`text
Method Signature = Method Name + Parameter Type List (Order, Types, Count)
\`\`\`
Notice: **The return type is NOT part of the method signature!**

### 3. The Three Valid Ways to Overload a Method
1. **Different Number of Parameters**:
   \`\`\`java
   static int add(int a, int b) { return a + b; }
   static int add(int a, int b, int c) { return a + b + c; }
   \`\`\`
2. **Different Data Types of Parameters**:
   \`\`\`java
   static int add(int a, int b) { return a + b; }
   static double add(double a, double b) { return a + b; }
   \`\`\`
3. **Different Sequence of Parameter Types**:
   \`\`\`java
   static void log(String tag, int code) { ... }
   static void log(int code, String tag) { ... }
   \`\`\`

### 4. Why Return Type Alone Cannot Overload
Consider this illegal code:
\`\`\`java
public static int calculate(int x) { return x * 2; }
public static double calculate(int x) { return x * 2.0; } // COMPILE ERROR!
\`\`\`
Why does Java forbid this? Because when someone calls:
\`\`\`java
calculate(10); // The return value can be ignored!
\`\`\`
The compiler has **no way to know** which method you intended to invoke! Therefore, changing only the return type triggers a duplicate method compilation error.`,
    simpleExample: {
      code: `public class Main {
    public static int multiply(int a, int b) {
        return a * b;
    }

    public static double multiply(double a, double b) {
        return a * b;
    }

    public static void main(String[] args) {
        System.out.println("Int: " + multiply(4, 5));
        System.out.println("Double: " + multiply(2.5, 3.0));
    }
}`,
      explanation: 'Overloads multiply for int and double types.'
    },
    syntax: `// Overloading rules:
// Same name, DIFFERENT parameter types, counts, or order
public static void display(int a) { ... }
public static void display(String s) { ... }
public static void display(int a, String s) { ... }
public static void display(String s, int a) { ... }`,
    codeExample: `public class Main {
    // Area of a square:
    public static double computeArea(double side) {
        return side * side;
    }

    // Area of a rectangle:
    public static double computeArea(double length, double width) {
        return length * width;
    }

    // Area of a circle:
    public static double computeArea(double radius, boolean isCircle) {
        return Math.PI * radius * radius;
    }

    public static void main(String[] args) {
        System.out.println("=== Geometric Area Engine (Overloaded) ===");
        System.out.printf("Square Area (side=4.0):          %.2f%n", computeArea(4.0));
        System.out.printf("Rectangle Area (len=5.0, wid=3.0): %.2f%n", computeArea(5.0, 3.0));
        System.out.printf("Circle Area (rad=3.0):           %.2f%n", computeArea(3.0, true));
    }
}`,
    expectedOutput: `=== Geometric Area Engine (Overloaded) ===
Square Area (side=4.0):          16.00
Rectangle Area (len=5.0, wid=3.0): 15.00
Circle Area (rad=3.0):           28.27`,
    stepByStep: [
      '1. javac inspects call computeArea(4.0); argument is a single double, matching method #1.',
      '2. javac inspects call computeArea(5.0, 3.0); two double arguments match method #2.',
      '3. javac inspects call computeArea(3.0, true); double and boolean match method #3.',
      '4. Dispatch happens at compile time with zero runtime overhead.',
      '5. Output displays formatted calculations.'
    ],
    commonMistakes: [
      {
        mistake: 'Trying to overload by changing ONLY the return type',
        codeSnippet: `public static int getNum() { return 1; }
public static double getNum() { return 1.0; } // Compiler Error: method getNum() is already defined`,
        correction: 'Change the parameter list, or give the methods distinct names.',
        explanation: 'Method overloading requires differences in parameter count, types, or order; return type alone is not sufficient.'
      },
      {
        mistake: 'Ambiguous method call error',
        codeSnippet: `static void test(int a, double b) {}
static void test(double a, int b) {}
// test(5, 5); // Compiler Error: reference to test is ambiguous`,
        correction: 'Cast one of the literals explicitly: test(5, (double) 5);',
        explanation: 'Both methods can accept (5, 5) via automatic widening, causing the compiler to flag ambiguity.'
      }
    ],
    realWorldExample: {
      scenario: 'Enterprise Logging Framework API',
      code: `public class Main {
    public static void log(String msg) {
        System.out.println("[INFO] " + msg);
    }
    public static void log(String msg, int errorCode) {
        System.out.println("[ERROR " + errorCode + "] " + msg);
    }

    public static void main(String[] args) {
        log("System initialized.");
        log("Database connection timeout.", 504);
    }
}`,
      explanation: 'Standard Java libraries (like System.out.println) use overloading extensively: println(int), println(String), println(boolean), and println(double) all share one intuitive name.'
    },
    practice: {
      prompt: 'Write a Java program with overloaded methods add(int a, int b) returning int and add(int a, int b, int c) returning int. Print: Line 1: "Sum 2: 7", Line 2: "Sum 3: 12".',
      starterCode: `public class Main {
    // Define overloaded add methods

    public static void main(String[] args) {
        // Call add(3, 4) and add(3, 4, 5) and print
    }
}`,
      expectedOutputMatcher: 'Sum 2: 7\nSum 3: 12',
      hint: 'Define two methods named add with 2 and 3 int parameters.',
      solution: `public class Main {
    public static int add(int a, int b) {
        return a + b;
    }
    public static int add(int a, int b, int c) {
        return a + b + c;
    }

    public static void main(String[] args) {
        System.out.println("Sum 2: " + add(3, 4));
        System.out.println("Sum 3: " + add(3, 4, 5));
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-over-1',
        question: 'Which of the following is NOT part of a Java method signature?',
        options: ['Method Name', 'Parameter Types', 'Parameter Order', 'Return Type'],
        correctIndex: 3,
        explanation: 'In Java, a method signature consists strictly of the method name and the parameter types; the return type is excluded.'
      },
      {
        id: 'mcq-java-over-2',
        question: 'Can you overload a method by changing ONLY the return type while keeping parameter types identical?',
        options: [
          'Yes, Java permits this',
          'No, the compiler flags a duplicate method error',
          'Only if one is static and one is non-static',
          'Only for void methods'
        ],
        correctIndex: 1,
        explanation: 'Return type alone cannot distinguish two methods when called without assigning the result.'
      },
      {
        id: 'mcq-java-over-3',
        question: 'Method overloading is an example of which kind of polymorphism?',
        options: ['Runtime (Dynamic) Polymorphism', 'Compile-Time (Static) Polymorphism', 'Inheritance Polymorphism', 'Virtual Polymorphism'],
        correctIndex: 1,
        explanation: 'Overloading is resolved by the compiler at compile time based on argument types (static polymorphism).'
      },
      {
        id: 'mcq-java-over-4',
        question: 'Which of the following method pairs is validly overloaded?',
        options: [
          'int calc(int x) and double calc(int x)',
          'void print(String s) and void print(int x)',
          'void doWork() and int doWork()',
          'int sum(int a, int b) and int sum(int x, int y)'
        ],
        correctIndex: 1,
        explanation: 'void print(String) and void print(int) have distinct parameter types, creating a legal overload.'
      },
      {
        id: 'mcq-java-over-5',
        question: 'What happens if the compiler finds two overloaded methods that match an invocation equally well due to widening conversions?',
        options: [
          'It randomly picks one',
          'It throws an Ambiguous Method Call compile-time error',
          'It executes both in sequence',
          'It crashes the operating system'
        ],
        correctIndex: 1,
        explanation: 'Ambiguity causes a compilation error because the compiler cannot determine the most specific method.'
      }
    ],
    codingChallenge: {
      title: 'Overloaded Greeting Dispatcher',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program with two overloaded methods: greet(String name) printing "Hello, " + name, and greet(String name, String title) printing "Hello, " + title + " " + name. In main, call greet("Alice") and greet("Smith", "Dr.").',
      input_format: 'No input.',
      output_format: 'Two lines showing the greetings.',
      constraints: 'Exact text match.',
      starter_code: `public class Main {
    // Define overloaded greet methods

    public static void main(String[] args) {
        // Call both overloads
    }
}`,
      expected_output: `Hello, Alice\nHello, Dr. Smith`,
      test_cases: [
        {
          input: '',
          expected_output: `Hello, Alice\nHello, Dr. Smith`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Method overloading allows methods to share the same name with different parameter signatures.',
      'Overloading is compile-time (static) polymorphism with zero runtime overhead.',
      'Signatures depend on parameter count, types, and sequence; return type alone cannot overload.',
      'Overloading creates clean, unified APIs like System.out.println().'
    ]
  },

  // =========================================================================
  // LESSON 21: Java Pass-By-Value and Variable Scope
  // =========================================================================
  {
    id: 'top-java-pass-by-value',
    number: 21,
    numberDisplay: '21',
    moduleId: 'mod-java-methods-arrays',
    moduleTitle: 'Module 03: Java Methods & Arrays',
    title: 'Java Pass-By-Value and Variable Scope',
    slug: 'java-pass-by-value-variable-scope',
    language: 'java',
    shortDescription: 'Debunk the ultimate Java myth: Java is strictly 100% pass-by-value! Contrast primitive value copying with object reference handle copying, understand mutability, and master block and local variable scope.',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    prerequisiteId: 'top-java-method-overloading',
    learningObjectives: [
      'Prove that Java is strictly pass-by-value for all method arguments without exception',
      'Demonstrate why modifying a primitive parameter never alters the caller variable',
      'Explain how passing an object reference copies the pointer handle, allowing internal mutation but not caller reassignment',
      'Understand local scope, method scope, block scope, and variable shadowing'
    ],
    conceptExplanation: `### 1. The Cardinal Rule: Java is Strictly 100% Pass-By-Value
There is no "pass-by-reference" in Java. **Java is always and exclusively pass-by-value.**
When you pass an argument to a method, **a copy of whatever is stored inside that variable is passed**.

### 2. Passing Primitive Types
When passing a primitive (\`int\`, \`double\`, \`boolean\`):
- The value in the variable (e.g., \`10\`) is duplicated into the method's parameter stack frame.
- Changing the parameter inside the method changes **only that local copy**.
- The caller's original variable remains completely untouched!
\`\`\`java
public static void modify(int num) {
    num = 99; // Only changes local parameter 'num'
}
public static void main(String[] args) {
    int x = 10;
    modify(x);
    System.out.println(x); // STILL 10!
}
\`\`\`

### 3. Passing Reference Types (Objects & Arrays)
This is where beginners get confused!
For reference types, what value is stored in the variable? **A memory address handle pointing to the object on the Heap!**
Therefore, passing an object passes **a copy of the reference address**:
1. **Mutating Object State**: Because both the caller's variable and the method's parameter hold copies of the *same* address pointing to the *same* object in the Heap, modifying object data (e.g., \`arr[0] = 99\`) **will reflect** in the caller!
2. **Reassigning the Reference**: If the method reassigns its parameter (\`arr = new int[5]\`), it merely points its local parameter copy to a new object. The caller's variable still points to the original object!
\`\`\`java
public static void reassign(int[] arr) {
    arr = new int[]{99, 99}; // Reassigns local handle only!
}
public static void main(String[] args) {
    int[] list = {1, 2};
    reassign(list);
    System.out.println(list[0]); // STILL 1!
}
\`\`\`

### 4. Variable Scope Rules
* **Class Scope**: Fields declared in the class body are accessible throughout the class.
* **Method Scope**: Parameters and variables declared inside a method exist only while that method executes.
* **Block Scope**: Variables declared inside a block (\`{ ... }\`, such as inside an \`if\` or \`for\`) exist only within those curly braces.
* **Variable Shadowing**: When a local variable or parameter shares the same name as a class field, the local variable "shadows" (hides) the class field inside that block.`,
    simpleExample: {
      code: `public class Main {
    public static void doubleValue(int n) {
        n = n * 2;
    }

    public static void main(String[] args) {
        int val = 25;
        doubleValue(val);
        System.out.println("Value after method: " + val);
    }
}`,
      explanation: 'val remains 25 because Java passes a copy of primitive values.'
    },
    syntax: `// Pass-by-value demonstration:
void testPrimitive(int copy) {
    copy = 500; // Caller unaffected
}

void testReferenceMutation(int[] handle) {
    handle[0] = 999; // Caller object modified!
}

void testReferenceReassignment(int[] handle) {
    handle = new int[5]; // Caller unaffected!
}`,
    codeExample: `public class Main {
    public static void testPrimitive(int num) {
        num = 500;
    }

    public static void testArrayMutation(int[] data) {
        data[0] = 777; // Modifies shared Heap object
    }

    public static void testArrayReassignment(int[] data) {
        data = new int[]{999, 999}; // Reassigns local parameter copy only
    }

    public static void main(String[] args) {
        int x = 10;
        testPrimitive(x);

        int[] array = {1, 2, 3};
        testArrayMutation(array);

        testArrayReassignment(array);

        System.out.println("=== Pass-By-Value Proof ===");
        System.out.println("Primitive x after call:          " + x + " (Unchanged)");
        System.out.println("Array[0] after mutation call:    " + array[0] + " (Mutated in Heap)");
        System.out.println("Array[0] after reassignment call: " + array[0] + " (Caller handle unchanged)");
    }
}`,
    expectedOutput: `=== Pass-By-Value Proof ===
Primitive x after call:          10 (Unchanged)
Array[0] after mutation call:    777 (Mutated in Heap)
Array[0] after reassignment call: 777 (Caller handle unchanged)`,
    stepByStep: [
      '1. x is passed to testPrimitive; stack frame copy is set to 500; caller x remains 10.',
      '2. array address is copied into testArrayMutation; data[0] = 777 modifies the Heap object.',
      '3. In testArrayReassignment, data is assigned a new Heap address; caller array still points to 777.',
      '4. Output verifies that Java passed copies of values in every case.'
    ],
    commonMistakes: [
      {
        mistake: 'Believing Java is pass-by-reference for objects',
        codeSnippet: `// Misconception: "Java passes primitives by value and objects by reference"`,
        correction: 'Understand: Java passes object REFERENCES by VALUE (the pointer address is copied).',
        explanation: 'If Java had pass-by-reference, reassigning a parameter would reassign the caller variable outside the method.'
      },
      {
        mistake: 'Using a loop counter outside its loop block',
        codeSnippet: `for (int i = 0; i < 5; i++) { ... }
System.out.println(i); // Error: cannot find symbol variable i`,
        correction: 'Declare the variable before the loop if it needs to be read after the loop terminates.',
        explanation: 'Variables declared in a for loop header are strictly scoped to that loop block.'
      }
    ],
    realWorldExample: {
      scenario: 'Defensive Copying in Security Authentication Tokens',
      code: `public class Main {
    public static void inspectTokens(int[] tokens) {
        // Because parameters are reference handles, a malicious method could mutate the array.
        // Secure systems create defensive copies!
        int[] defensiveCopy = tokens.clone();
        defensiveCopy[0] = 0; // Safe mutation
    }

    public static void main(String[] args) {
        int[] authKeys = {101, 102};
        inspectTokens(authKeys);
        System.out.println("[SECURITY] Original Key Intact: " + authKeys[0]);
    }
}`,
      explanation: 'Secure enterprise applications make defensive copies of arrays and mutable objects passed as arguments to prevent untrusted code from modifying internal state.'
    },
    practice: {
      prompt: 'Write a Java program with a method swap(int a, int b) that sets int temp = a; a = b; b = temp;. In main, declare x = 5, y = 10, call swap(x, y), and print "x: 5, y: 10" proving primitives do not swap.',
      starterCode: `public class Main {
    // Define swap method

    public static void main(String[] args) {
        // Call swap and print x and y
    }
}`,
      expectedOutputMatcher: 'x: 5, y: 10',
      hint: 'Primitives are passed by value; x and y will remain 5 and 10.',
      solution: `public class Main {
    public static void swap(int a, int b) {
        int temp = a;
        a = b;
        b = temp;
    }

    public static void main(String[] args) {
        int x = 5;
        int y = 10;
        swap(x, y);
        System.out.println("x: " + x + ", y: " + y);
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-pbv-1',
        question: 'Is Java pass-by-value or pass-by-reference?',
        options: [
          'Strictly pass-by-value in all situations',
          'Pass-by-value for primitives, pass-by-reference for objects',
          'Strictly pass-by-reference',
          'Depends on the JVM vendor'
        ],
        correctIndex: 0,
        explanation: 'Java is strictly 100% pass-by-value. When passing objects, a copy of the reference address is passed by value.'
      },
      {
        id: 'mcq-java-pbv-2',
        question: 'If you reassign an object parameter inside a method (e.g., param = new MyClass()), does the caller variable point to the new object?',
        options: [
          'Yes, always',
          'No, because only the local copy of the reference pointer was reassigned',
          'Only if the class is public',
          'Only if the object has an int field'
        ],
        correctIndex: 1,
        explanation: 'Reassigning a parameter merely updates the local stack frame handle; the caller variable continues pointing to its original object.'
      },
      {
        id: 'mcq-java-pbv-3',
        question: 'Why does modifying array[0] = 99 inside a method alter the array visible to the caller?',
        options: [
          'Because arrays are primitives',
          'Because both the caller variable and method parameter copy point to the exact same array object on the Heap',
          'Because Java has pointers like C',
          'Because arrays bypass the stack'
        ],
        correctIndex: 1,
        explanation: 'Both reference handles point to the same underlying heap object; mutating contents through either handle changes the shared object.'
      },
      {
        id: 'mcq-java-pbv-4',
        question: 'What is the lifetime of a local variable declared inside a block: { int x = 10; } ?',
        options: [
          'The entire duration of the program',
          'Only within the curly braces { } of that block',
          'Until the Garbage Collector runs',
          'Until the computer shuts down'
        ],
        correctIndex: 1,
        explanation: 'Block scope dictates that variables declared inside { } cease to exist once control exits the block.'
      },
      {
        id: 'mcq-java-pbv-5',
        question: 'What is "variable shadowing" in Java?',
        options: [
          'When a variable is hidden behind a comment',
          'When a local variable shares the same name as an outer or field variable, hiding it in the local scope',
          'When a variable is copied to another thread',
          'When memory is exhausted'
        ],
        correctIndex: 1,
        explanation: 'Shadowing occurs when a variable declared in an inner scope has the same name as a variable in an outer scope.'
      }
    ],
    codingChallenge: {
      title: 'Pass-by-Value Verification Program',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program with a method mutate(int[] arr) that sets arr[0] = 55. In main, create int[] nums = {10}. Call mutate(nums) and print "Mutated: 55".',
      input_format: 'No input.',
      output_format: 'One line showing the mutated array element.',
      constraints: 'Exact text match.',
      starter_code: `public class Main {
    // Define mutate

    public static void main(String[] args) {
        // Call and print
    }
}`,
      expected_output: `Mutated: 55`,
      test_cases: [
        {
          input: '',
          expected_output: `Mutated: 55`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Java is strictly 100% pass-by-value for both primitives and reference types.',
      'Primitives pass a copy of the literal value; mutations do not affect the caller.',
      'Objects pass a copy of the reference address; mutations to object fields reflect in the shared heap object, but parameter reassignment does not affect the caller.',
      'Variables are scoped strictly to the block, method, or class in which they are declared.'
    ]
  },

  // =========================================================================
  // LESSON 22: Introduction to Arrays
  // =========================================================================
  {
    id: 'top-java-arrays-intro',
    number: 22,
    numberDisplay: '22',
    moduleId: 'mod-java-methods-arrays',
    moduleTitle: 'Module 03: Java Methods & Arrays',
    title: 'Introduction to Arrays',
    slug: 'java-arrays-declaration-indexing',
    language: 'java',
    shortDescription: 'Master contiguous single-dimensional array data structures in Java: declaration, instantiation via new, array literals, zero-based indexing, default values, fixed length property, and bounds checking.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-pass-by-value',
    learningObjectives: [
      'Understand what an array is and how elements are stored contiguously in Heap memory',
      'Declare, instantiate, and initialize single-dimensional arrays using both new and array literals',
      'Access and update elements using zero-based indexing',
      'Utilize the array .length property',
      'Diagnose and prevent ArrayIndexOutOfBoundsException'
    ],
    conceptExplanation: `### 1. What is an Array?
An **array** is a fixed-size, homogeneous container object that stores a collection of values of the **same data type** in **contiguous memory locations**.
* **Fixed Size**: Once an array is instantiated in Java, its length is permanent and cannot grow or shrink.
* **Zero-Based Indexing**: Elements are indexed from \`0\` to \`length - 1\`.
* **First-Class Objects**: In Java, arrays are true reference objects allocated on the **Garbage-Collected Heap**.

### 2. Declaration vs. Instantiation
1. **Declaration**: Informs the compiler of the array variable name and element type. (Reserves a reference variable on the Stack).
   \`\`\`java
   int[] numbers; // Preferred standard syntax
   int numbers[]; // Permitted C-style syntax (discouraged in modern Java)
   \`\`\`
2. **Instantiation via \`new\`**: Allocates the memory block on the Heap.
   \`\`\`java
   numbers = new int[5]; // Allocates space for 5 integers
   \`\`\`
3. **Combined Declaration & Instantiation**:
   \`\`\`java
   double[] prices = new double[10];
   \`\`\`
4. **Array Literal Initialization (Inline)**:
   \`\`\`java
   int[] primes = {2, 3, 5, 7, 11}; // Size 5 inferred automatically
   \`\`\`

### 3. Default Values in Arrays
When an array is created using \`new Type[size]\`, the JVM automatically initializes every element to that type's default value:
* Numeric types (\`byte\`, \`short\`, \`int\`, \`long\`): \`0\`
* Floating-point (\`float\`, \`double\`): \`0.0\`
* \`boolean\`: \`false\`
* \`char\`: \`'\\u0000'\` (null character)
* Reference types (Objects, \`String\`): \`null\`

### 4. The \`.length\` Property
Every array object contains a \`public final\` property called **\`length\`** (notice: it is a field, **not** a method, so there are no parentheses!):
\`\`\`java
int count = primes.length; // Returns 5
\`\`\`

### 5. \`ArrayIndexOutOfBoundsException\`
Attempting to access an index less than \`0\` or greater than or equal to \`length\` causes the JVM to throw \`ArrayIndexOutOfBoundsException\`:
\`\`\`java
int[] data = new int[3]; // Valid indices: 0, 1, 2
System.out.println(data[3]); // CRASH: Index 3 out of bounds for length 3!
\`\`\``,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        int[] scores = {92, 85, 88};
        System.out.println("First: " + scores[0]);
        System.out.println("Length: " + scores.length);
    }
}`,
      explanation: 'Declares an array of 3 elements and prints the first element and total length.'
    },
    syntax: `// Declaration and creation:
Type[] arrayName = new Type[size];

// Literal initialization:
Type[] arrayName = {val1, val2, val3};

// Access and update:
arrayName[index] = newValue;
Type val = arrayName[index];`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        // Declare and allocate array
        int[] marks = new int[4];
        marks[0] = 85;
        marks[1] = 92;
        marks[2] = 78;
        marks[3] = 96;

        int sum = marks[0] + marks[1] + marks[2] + marks[3];
        double average = (double) sum / marks.length;

        System.out.println("=== Student Marks Assessment Array ===");
        System.out.println("Subject 1: " + marks[0]);
        System.out.println("Subject 2: " + marks[1]);
        System.out.println("Subject 3: " + marks[2]);
        System.out.println("Subject 4: " + marks[3]);
        System.out.println("Total Subjects: " + marks.length);
        System.out.println("Aggregate Sum:  " + sum);
        System.out.printf("Average Score:  %.2f%n", average);
    }
}`,
    expectedOutput: `=== Student Marks Assessment Array ===
Subject 1: 85
Subject 2: 92
Subject 3: 78
Subject 4: 96
Total Subjects: 4
Aggregate Sum:  351
Average Score:  87.75`,
    stepByStep: [
      '1. new int[4] allocates a contiguous 4-integer block on the Heap initialized to 0.',
      '2. Array reference handle marks is placed on the local thread stack.',
      '3. Elements at indices 0, 1, 2, 3 are assigned integer test scores.',
      '4. marks.length returns 4.',
      '5. Sum (351) is divided by length with double casting to produce 87.75.'
    ],
    commonMistakes: [
      {
        mistake: 'Adding parentheses to array.length (treating it as a method)',
        codeSnippet: `int len = numbers.length(); // Error: cannot find symbol method length()`,
        correction: 'Use numbers.length without parentheses.',
        explanation: 'length is a public field on array objects. (String uses length(), but arrays use .length).'
      },
      {
        mistake: 'Accessing index equal to array length (off-by-one boundary)',
        codeSnippet: `int[] arr = new int[5];
arr[5] = 10; // Throws ArrayIndexOutOfBoundsException`,
        correction: 'The maximum index for an array of size N is N - 1 (e.g., arr[4]).',
        explanation: 'Because Java uses zero-based indexing, valid indices for size 5 are 0, 1, 2, 3, 4.'
      },
      {
        mistake: 'Specifying size when using an array literal initializer',
        codeSnippet: `int[] arr = new int[3]{1, 2, 3}; // Error: ';' expected`,
        correction: 'Either write: new int[]{1, 2, 3} or simply: {1, 2, 3}.',
        explanation: 'The size dimension must not be specified when an explicit array initializer is provided.'
      }
    ],
    realWorldExample: {
      scenario: 'High-Performance Financial Order Book Price Levels',
      code: `public class Main {
    public static void main(String[] args) {
        // High-frequency trading systems use primitive arrays rather than ArrayList
        // to prevent object overhead and ensure CPU L1/L2 cache locality.
        double[] bidPrices = {150.25, 150.20, 150.15, 150.10};
        System.out.println("[EXCHANGE] Top Bid: $" + bidPrices[0] + " across " + bidPrices.length + " market tiers.");
    }
}`,
      explanation: 'Trading engines and graphics processors store vectors and bid-ask prices in primitive arrays because contiguous heap memory maximizes CPU cache hits and minimizes garbage collection latency.'
    },
    practice: {
      prompt: 'Write a Java program that creates an array int[] nums = {10, 20, 30}. Print the first and last elements: "First: 10, Last: 30".',
      starterCode: `public class Main {
    public static void main(String[] args) {
        // Declare array and print first and last elements
    }
}`,
      expectedOutputMatcher: 'First: 10, Last: 30',
      hint: 'First is nums[0], last is nums[nums.length - 1].',
      solution: `public class Main {
    public static void main(String[] args) {
        int[] nums = {10, 20, 30};
        System.out.println("First: " + nums[0] + ", Last: " + nums[nums.length - 1]);
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-arr-1',
        question: 'What is the index of the first element in any Java array?',
        options: ['1', '0', '-1', 'Undefined'],
        correctIndex: 1,
        explanation: 'Java arrays are strictly zero-indexed; the first element is at index 0.'
      },
      {
        id: 'mcq-java-arr-2',
        question: 'What is the default value of elements in a new int[10] array before explicit assignment?',
        options: ['null', '0', '-1', 'Random memory garbage'],
        correctIndex: 1,
        explanation: 'Java initializes all integer array elements to 0 automatically upon heap allocation.'
      },
      {
        id: 'mcq-java-arr-3',
        question: 'How do you query the total number of elements in an array named items?',
        options: ['items.length()', 'items.length', 'items.size()', 'items.count'],
        correctIndex: 1,
        explanation: 'length is a public final property of array objects accessed without parentheses.'
      },
      {
        id: 'mcq-java-arr-4',
        question: 'What exception is thrown if you access index 4 in an array of size 4?',
        options: ['NullPointerException', 'ArrayIndexOutOfBoundsException', 'IllegalArgumentException', 'ArrayOverflowException'],
        correctIndex: 1,
        explanation: 'An array of size 4 has valid indices 0, 1, 2, and 3. Accessing index 4 is out of bounds.'
      },
      {
        id: 'mcq-java-arr-5',
        question: 'Can the size of a standard Java array be increased after it has been instantiated on the Heap?',
        options: [
          'Yes, by calling array.resize()',
          'No, Java array lengths are fixed permanently once allocated',
          'Yes, if memory is available',
          'Only if the array contains Strings'
        ],
        correctIndex: 1,
        explanation: 'Java arrays have a fixed size. To expand capacity, a new larger array must be allocated and elements copied.'
      }
    ],
    codingChallenge: {
      title: 'Array Extremes Identifier',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program with array int[] vals = {40, 10, 80, 20}. Print: Line 1: "First: 40", Line 2: "Last: 20", Line 3: "Length: 4".',
      input_format: 'No input.',
      output_format: 'Three lines matching the array properties.',
      constraints: 'Exact text match.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        int[] vals = {40, 10, 80, 20};
        // Print first, last, and length
    }
}`,
      expected_output: `First: 40\nLast: 20\nLength: 4`,
      test_cases: [
        {
          input: '',
          expected_output: `First: 40\nLast: 20\nLength: 4`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Arrays are contiguous homogeneous reference objects allocated on the Heap.',
      'Indexing begins at 0 and ends at length - 1.',
      'Array elements receive default zero/null values upon instantiation.',
      'The length field contains the fixed size; accessing out-of-range indices throws ArrayIndexOutOfBoundsException.'
    ]
  },

  // =========================================================================
  // LESSON 23: Array Traversal and Operations
  // =========================================================================
  {
    id: 'top-java-array-operations',
    number: 23,
    numberDisplay: '23',
    moduleId: 'mod-java-methods-arrays',
    moduleTitle: 'Module 03: Java Methods & Arrays',
    title: 'Array Traversal and Operations',
    slug: 'java-array-traversal-operations',
    language: 'java',
    shortDescription: 'Master array iteration techniques: indexed for loops vs. enhanced for-each loops, finding minimum and maximum values, linear searching, element frequency counting, and in-place array reversal.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-arrays-intro',
    learningObjectives: [
      'Traverse arrays using both traditional indexed for loops and enhanced for-each loops',
      'Implement algorithms to compute sum, average, min, and max across an array',
      'Find the second-largest element in an array in a single traversal',
      'Implement in-place two-pointer array reversal',
      'Understand the time complexity of basic array operations (O(n) linear time)'
    ],
    conceptExplanation: `### 1. Traditional \`for\` Loop vs. Enhanced \`for-each\` Loop
Java provides two ways to traverse an array:
1. **Indexed \`for\` Loop**:
   \`\`\`java
   for (int i = 0; i < arr.length; i++) {
       System.out.println("Index " + i + ": " + arr[i]);
   }
   \`\`\`
   - *Use when*: You need the index (e.g., updating elements, searching, two-pointer algorithms).
2. **Enhanced \`for-each\` Loop**:
   \`\`\`java
   for (int num : arr) {
       System.out.println(num);
   }
   \`\`\`
   - *Use when*: You simply want to read every element from start to finish without needing the index.

### 2. Finding Minimum and Maximum Values
To find the maximum element:
1. Initialize \`int max = arr[0];\` (always initialize with the first element, **not** \`0\`, to safely handle negative arrays).
2. Iterate through the remaining elements starting from index 1.
3. If \`arr[i] > max\`, update \`max = arr[i]\`.

### 3. Finding the Second-Largest Element
In a single pass:
\`\`\`java
int largest = Integer.MIN_VALUE;
int secondLargest = Integer.MIN_VALUE;

for (int num : arr) {
    if (num > largest) {
        secondLargest = largest;
        largest = num;
    } else if (num > secondLargest && num != largest) {
        secondLargest = num;
    }
}
\`\`\`

### 4. In-Place Array Reversal (Two-Pointer Technique)
Instead of allocating a new array, reverse elements in-place using two pointers:
\`\`\`java
int left = 0, right = arr.length - 1;
while (left < right) {
    int temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;
    left++;
    right--;
}
\`\`\``,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        int[] nums = {10, 20, 30, 40};
        int sum = 0;
        for (int n : nums) sum += n;
        System.out.println("Sum: " + sum);
    }
}`,
      explanation: 'Uses an enhanced for-each loop to calculate the sum of array elements.'
    },
    syntax: `// Enhanced for-each loop syntax:
for (ElementType variableName : arrayReference) {
    // Process variableName
}

// In-place two-pointer swap:
int temp = arr[left];
arr[left] = arr[right];
arr[right] = temp;`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        int[] scores = {45, 92, 78, 96, 64, 88};

        int min = scores[0];
        int max = scores[0];
        int sum = 0;

        for (int s : scores) {
            sum += s;
            if (s > max) max = s;
            if (s < min) min = s;
        }

        double avg = (double) sum / scores.length;

        System.out.println("=== Array Statistics Analytics ===");
        System.out.println("Total Scores: " + scores.length);
        System.out.println("Minimum:      " + min);
        System.out.println("Maximum:      " + max);
        System.out.printf("Average:      %.2f%n", avg);

        // In-place reversal demo:
        int[] data = {1, 2, 3, 4, 5};
        int left = 0, right = data.length - 1;
        while (left < right) {
            int tmp = data[left];
            data[left] = data[right];
            data[right] = tmp;
            left++;
            right--;
        }

        System.out.print("Reversed Array: ");
        for (int d : data) System.out.print(d + " ");
        System.out.println();
    }
}`,
    expectedOutput: `=== Array Statistics Analytics ===
Total Scores: 6
Minimum:      45
Maximum:      96
Average:      77.17
Reversed Array: 5 4 3 2 1 `,
    stepByStep: [
      '1. min and max are initialized to scores[0] (45).',
      '2. Enhanced for-each loop iterates through all 6 scores, updating min, max, and accumulating sum.',
      '3. Average is computed with precision floating-point cast.',
      '4. Two-pointer while loop swaps data[left] and data[right], reversing the array in place in O(n/2) operations.',
      '5. Output is printed to console stdout.'
    ],
    commonMistakes: [
      {
        mistake: 'Initializing min to 0 when searching an array with negative numbers',
        codeSnippet: `int[] arr = {-5, -12, -3};
int min = 0; // min will stay 0! The real minimum is -12!`,
        correction: 'Always initialize min and max with arr[0] or Integer.MAX_VALUE / Integer.MIN_VALUE.',
        explanation: 'If all elements are negative, a min initialized to 0 will never be updated.'
      },
      {
        mistake: 'Trying to modify array elements inside an enhanced for-each loop',
        codeSnippet: `for (int n : arr) {
    n = n * 2; // Does NOT modify the underlying array!
}`,
        correction: 'Use an indexed for loop if you need to update array elements: arr[i] = arr[i] * 2;.',
        explanation: 'In a for-each loop, n is a local copy of the element; reassigning n does not write back to the array.'
      }
    ],
    realWorldExample: {
      scenario: 'Sensor Telemetry Peak Anomaly Detection',
      code: `public class Main {
    public static void main(String[] args) {
        int[] vibrationReadings = {12, 14, 15, 98, 16, 14}; // 98 is a machinery anomaly
        int threshold = 80;

        for (int i = 0; i < vibrationReadings.length; i++) {
            if (vibrationReadings[i] > threshold) {
                System.out.println("[ALERT] Vibration anomaly detected at sensor index " + i + ": " + vibrationReadings[i] + " Hz");
            }
        }
    }
}`,
      explanation: 'Industrial IoT monitoring systems scan sensor arrays in real time to locate spike anomalies and mechanical stress points before hardware failure occurs.'
    },
    practice: {
      prompt: 'Write a Java program with array int[] nums = {5, 12, 9, 3}. Find the maximum value and print "Max: 12".',
      starterCode: `public class Main {
    public static void main(String[] args) {
        int[] nums = {5, 12, 9, 3};
        // Find max and print
    }
}`,
      expectedOutputMatcher: 'Max: 12',
      hint: 'int max = nums[0]; for(int n : nums) if(n > max) max = n;',
      solution: `public class Main {
    public static void main(String[] args) {
        int[] nums = {5, 12, 9, 3};
        int max = nums[0];
        for (int n : nums) {
            if (n > max) max = n;
        }
        System.out.println("Max: " + max);
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-arr-op-1',
        question: 'Can an enhanced for-each loop (for (int x : arr)) modify the elements of an array in place?',
        options: [
          'Yes, by reassigning x = newValue;',
          'No, because x is a local copy of the element value',
          'Only if the array is static',
          'Only for double arrays'
        ],
        correctIndex: 1,
        explanation: 'The iteration variable in a for-each loop is a local copy; modifying it does not alter the array element.'
      },
      {
        id: 'mcq-java-arr-op-2',
        question: 'Why should maximum and minimum variables be initialized to arr[0] rather than 0?',
        options: [
          'To save CPU power',
          'Because if the array contains only negative numbers, an initial value of 0 would produce an incorrect result',
          'Java forbids initializing min to 0',
          'Because 0 is reserved'
        ],
        correctIndex: 1,
        explanation: 'If all array elements are negative (e.g. -10, -20), initializing max to 0 will incorrectly report 0 as the maximum.'
      },
      {
        id: 'mcq-java-arr-op-3',
        question: 'What is the time complexity of finding the maximum element in an unsorted array of size N?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'],
        correctIndex: 2,
        explanation: 'In an unsorted array, every single element must be inspected at least once, giving O(N) linear time.'
      },
      {
        id: 'mcq-java-arr-op-4',
        question: 'How does the two-pointer in-place reversal algorithm reverse an array of size N?',
        options: [
          'By creating a second array',
          'By swapping elements at left and right pointers while moving them toward the center',
          'By sorting the array in descending order',
          'By shifting elements right by 1'
        ],
        correctIndex: 1,
        explanation: 'The two-pointer technique swaps arr[left] with arr[right] in-place with O(1) extra auxiliary memory.'
      },
      {
        id: 'mcq-java-arr-op-5',
        question: 'What is printed by: int[] a = {1, 2, 3}; for (int x : a) System.out.print(x * 2 + " "); ?',
        options: ['1 2 3 ', '2 4 6 ', '2 4 6 8 ', 'Compilation Error'],
        correctIndex: 1,
        explanation: 'Each element multiplied by 2 yields 2, 4, and 6.'
      }
    ],
    codingChallenge: {
      title: 'Second Largest Element Search',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program with array int[] numbers = {12, 35, 1, 10, 34, 1}. Find the second largest number and print "Second Largest: 34".',
      input_format: 'No input.',
      output_format: 'One line showing the second largest value.',
      constraints: 'Exact text match.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        int[] numbers = {12, 35, 1, 10, 34, 1};
        // Find second largest and print
    }
}`,
      expected_output: `Second Largest: 34`,
      test_cases: [
        {
          input: '',
          expected_output: `Second Largest: 34`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Use indexed for loops when element indices or modifications are needed; use for-each loops for read-only traversal.',
      'Initialize min and max with arr[0] to prevent logic bugs with negative numbers.',
      'In-place array reversal uses two pointers (left and right) with O(1) auxiliary space.',
      'Linear array traversal runs in O(N) time complexity.'
    ]
  },

  // =========================================================================
  // LESSON 24: Searching and Sorting Basics
  // =========================================================================
  {
    id: 'top-java-search-sort',
    number: 24,
    numberDisplay: '24',
    moduleId: 'mod-java-methods-arrays',
    moduleTitle: 'Module 03: Java Methods & Arrays',
    title: 'Searching and Sorting Basics',
    slug: 'java-searching-sorting-algorithms',
    language: 'java',
    shortDescription: 'Master fundamental array search and sort algorithms: Linear Search (O(n)), Binary Search (O(log n)), Bubble Sort, Selection Sort, and the production Arrays.sort() utility.',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    prerequisiteId: 'top-java-array-operations',
    learningObjectives: [
      'Implement Linear Search on unsorted arrays and analyze its O(n) complexity',
      'Implement Binary Search and explain why it strictly requires sorted data',
      'Understand and implement Bubble Sort and Selection Sort algorithms',
      'Utilize the built-in java.util.Arrays.sort() method for high-performance sorting'
    ],
    conceptExplanation: `### 1. Searching: Linear vs. Binary Search
* **Linear Search**:
  - Compares the target against every element sequentially from index 0 to \`length - 1\`.
  - Works on **any array** (sorted or unsorted).
  - Time Complexity: **O(n)**. In the worst case, all N elements must be checked.
* **Binary Search**:
  - **Prerequisite**: The array **must be sorted** beforehand!
  - Compares the target against the middle element (\`mid = left + (right - left) / 2\`).
  - If target is smaller, search the left half. If larger, search the right half.
  - Cuts the search space in half on every step!
  - Time Complexity: **O(log n)**. Searching 1,000,000 items takes at most **20 comparisons**!

### 2. Basic Sorting: Bubble Sort
Bubble Sort repeatedly steps through the array, compares adjacent elements, and swaps them if they are in the wrong order. After pass 1, the largest element "bubbles up" to the end:
\`\`\`java
for (int i = 0; i < n - 1; i++) {
    for (int j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
            int temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
        }
    }
}
\`\`\`
Time Complexity: **O(n²)**.

### 3. Production Sorting: \`Arrays.sort()\`
In real-world software, never write manual bubble sort for production. The Java standard library provides **\`Arrays.sort()\`** in \`java.util.Arrays\`.
For primitives, Java uses a **Dual-Pivot Quicksort** running in **O(n log n)** time, which is millions of times faster than Bubble Sort on large datasets!`,
    simpleExample: {
      code: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] nums = {45, 12, 85, 32, 89, 39};
        Arrays.sort(nums);
        System.out.println("Sorted: " + Arrays.toString(nums));
    }
}`,
      explanation: 'Uses java.util.Arrays.sort() to sort an array in ascending order.'
    },
    syntax: `// Built-in Sorting:
import java.util.Arrays;
Arrays.sort(array);

// Binary Search (array MUST be sorted first):
int index = Arrays.binarySearch(sortedArray, targetKey);`,
    codeExample: `import java.util.Arrays;

public class Main {
    // Linear Search:
    public static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) return i; // Found at index i
        }
        return -1; // Not found
    }

    // Binary Search:
    public static int binarySearch(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] data = {50, 20, 80, 10, 40, 90};

        int target = 40;
        int linearIndex = linearSearch(data, target);
        System.out.println("=== Search & Sort Operations ===");
        System.out.println("Linear Search: Target " + target + " found at unsorted index " + linearIndex);

        // Sort data for binary search
        Arrays.sort(data);
        System.out.println("Sorted Array:  " + Arrays.toString(data));

        int binaryIndex = binarySearch(data, target);
        System.out.println("Binary Search: Target " + target + " found at sorted index " + binaryIndex);
    }
}`,
    expectedOutput: `=== Search & Sort Operations ===
Linear Search: Target 40 found at unsorted index 4
Sorted Array:  [10, 20, 40, 50, 80, 90]
Binary Search: Target 40 found at sorted index 2`,
    stepByStep: [
      '1. linearSearch inspects elements sequentially and finds 40 at index 4.',
      '2. Arrays.sort() sorts the array in O(n log n) time into [10, 20, 40, 50, 80, 90].',
      '3. binarySearch checks mid index 2 (value 40); finds target in 1 step.',
      '4. Arrays.toString() formats array elements into a human-readable string.',
      '5. Output is printed to console stdout.'
    ],
    commonMistakes: [
      {
        mistake: 'Running Binary Search on an unsorted array',
        codeSnippet: `int[] unsorted = {40, 10, 90};
int idx = Arrays.binarySearch(unsorted, 10); // Produces undefined/negative result!`,
        correction: 'Always sort the array first: Arrays.sort(arr); before calling binarySearch.',
        explanation: 'Binary Search assumes elements are ordered; on unsorted data it will eliminate valid branches.'
      },
      {
        mistake: 'Integer overflow in binary search midpoint calculation',
        codeSnippet: `int mid = (left + right) / 2; // Can overflow integer max if left + right > 2,147,483,647!`,
        correction: 'Use: int mid = left + (right - left) / 2;',
        explanation: 'left + (right - left) / 2 computes the exact midpoint without risking 32-bit integer overflow.'
      }
    ],
    realWorldExample: {
      scenario: 'High-Volume E-Commerce Inventory Lookup',
      code: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        long[] skuCatalog = {100201L, 100205L, 100310L, 100450L, 100890L};
        long targetSKU = 100310L;

        int index = Arrays.binarySearch(skuCatalog, targetSKU);
        System.out.println("[INVENTORY] Product SKU " + targetSKU + " is In Stock at warehouse rack " + index);
    }
}`,
      explanation: 'Warehouse logistics and product catalogs index millions of SKU barcodes in sorted arrays so binary search lookups execute in microseconds on handheld barcode scanners.'
    },
    practice: {
      prompt: 'Write a Java program that sorts an array int[] nums = {9, 2, 7, 1} using Arrays.sort(). Print "Sorted: 1 2 7 9 ".',
      starterCode: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] nums = {9, 2, 7, 1};
        // Sort and print
    }
}`,
      expectedOutputMatcher: 'Sorted: 1 2 7 9 ',
      hint: 'Arrays.sort(nums); then print each with a space.',
      solution: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] nums = {9, 2, 7, 1};
        Arrays.sort(nums);
        System.out.print("Sorted: ");
        for (int n : nums) {
            System.out.print(n + " ");
        }
        System.out.println();
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-sort-1',
        question: 'What is the strict prerequisite before running Binary Search on an array?',
        options: ['The array must contain only positive numbers', 'The array must be sorted', 'The array must be larger than 100 elements', 'The array must contain no duplicates'],
        correctIndex: 1,
        explanation: 'Binary Search relies on sorted order to divide the search space in half.'
      },
      {
        id: 'mcq-java-sort-2',
        question: 'What is the time complexity of Binary Search on a sorted array of size N?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'],
        correctIndex: 1,
        explanation: 'Binary Search halves the remaining elements at each step, yielding logarithmic O(log N) time.'
      },
      {
        id: 'mcq-java-sort-3',
        question: 'Which method in java.util.Arrays sorts an array in ascending order?',
        options: ['Arrays.order()', 'Arrays.sort()', 'Arrays.bubble()', 'Arrays.arrange()'],
        correctIndex: 1,
        explanation: 'Arrays.sort() is the standard Java library method for sorting arrays.'
      },
      {
        id: 'mcq-java-sort-4',
        question: 'What does Linear Search return when the target element does not exist in the array?',
        options: ['0', '-1', 'null', 'Throws an exception'],
        correctIndex: 1,
        explanation: 'By standard convention, search algorithms return -1 to signal that the key was not found.'
      },
      {
        id: 'mcq-java-sort-5',
        question: 'What is the average time complexity of Bubble Sort?',
        options: ['O(log N)', 'O(N)', 'O(N log N)', 'O(N^2)'],
        correctIndex: 3,
        explanation: 'Bubble Sort uses nested loops to compare adjacent elements, resulting in quadratic O(N^2) complexity.'
      }
    ],
    codingChallenge: {
      title: 'Target Index Finder',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program that creates an array int[] nums = {15, 3, 9, 21}. Search for target = 9 using a loop. When found, print "Found at index: 2".',
      input_format: 'No input.',
      output_format: 'One line showing the index.',
      constraints: 'Exact text match.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        int[] nums = {15, 3, 9, 21};
        // Search and print index
    }
}`,
      expected_output: `Found at index: 2`,
      test_cases: [
        {
          input: '',
          expected_output: `Found at index: 2`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Linear search (O(n)) works on any array; Binary search (O(log n)) strictly requires sorted arrays.',
      'Bubble Sort and Selection Sort are quadratic O(n^2) algorithms useful for conceptual learning.',
      'Production Java uses java.util.Arrays.sort() running Dual-Pivot Quicksort in O(n log n).',
      'Calculate mid as left + (right - left) / 2 to avoid integer overflow.'
    ]
  },

  // =========================================================================
  // LESSON 25: Multidimensional Arrays
  // =========================================================================
  {
    id: 'top-java-multidimensional-arrays',
    number: 25,
    numberDisplay: '25',
    moduleId: 'mod-java-methods-arrays',
    moduleTitle: 'Module 03: Java Methods & Arrays',
    title: 'Multidimensional Arrays',
    slug: 'java-multidimensional-arrays-matrices',
    language: 'java',
    shortDescription: 'Master 2D arrays and matrices in Java: declaration, rows and columns layout, nested loop traversal, matrix addition, transpose operations, diagonals, and jagged (ragged) arrays.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-search-sort',
    learningObjectives: [
      'Understand how 2D arrays are implemented in Java as "arrays of arrays"',
      'Declare, instantiate, and initialize two-dimensional matrices',
      'Traverse matrices using nested for loops with row and column indices',
      'Perform matrix arithmetic: addition, transpose, and diagonal summation',
      'Understand jagged (ragged) arrays where rows have differing column lengths'
    ],
    conceptExplanation: `### 1. Two-Dimensional Arrays in Java
A **2D array** is conceptually a grid or table of data organized into **rows** and **columns**.
In Java, there are no "true" multidimensional contiguous blocks. Instead, Java implements multidimensional arrays as **arrays of arrays**:
- An outer array holds reference pointers.
- Each reference pointer points to an independent 1D array object on the Heap representing a row!

### 2. Declaration and Initialization
\`\`\`java
// 1. Fixed dimensions (3 rows, 4 columns):
int[][] matrix = new int[3][4];

// 2. Direct matrix literal initialization:
int[][] grid = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};
\`\`\`

### 3. Traversing a 2D Array
Use nested loops where the outer loop iterates over rows (\`grid.length\`) and the inner loop iterates over columns in that specific row (\`grid[r].length\`):
\`\`\`java
for (int r = 0; r < grid.length; r++) {
    for (int c = 0; c < grid[r].length; c++) {
        System.out.print(grid[r][c] + " ");
    }
    System.out.println();
}
\`\`\`

### 4. Jagged (Ragged) Arrays
Because Java 2D arrays are arrays of arrays, each row can have a **different length**:
\`\`\`java
int[][] jagged = new int[3][];
jagged[0] = new int[2]; // Row 0 has 2 columns
jagged[1] = new int[4]; // Row 1 has 4 columns
jagged[2] = new int[3]; // Row 2 has 3 columns
\`\`\`

### 5. Matrix Operations
* **Matrix Addition**: \`C[r][c] = A[r][c] + B[r][c]\` (both matrices must share identical dimensions).
* **Matrix Transpose**: Swapping rows with columns (\`T[c][r] = A[r][c]\`).
* **Main Diagonal**: Elements where row equals column (\`r == c\`).`,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        int[][] matrix = {
            {1, 2},
            {3, 4}
        };
        System.out.println("Top-Right: " + matrix[0][1]);
        System.out.println("Rows: " + matrix.length);
    }
}`,
      explanation: 'Accesses row 0, column 1 of a 2x2 matrix.'
    },
    syntax: `// 2D Array Syntax:
Type[][] matrix = new Type[rows][cols];

// Accessing an element:
Type val = matrix[rowIndex][colIndex];

// Row count:
int numRows = matrix.length;

// Column count of row r:
int numCols = matrix[r].length;`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        int[][] A = {
            {1, 2, 3},
            {4, 5, 6}
        };

        int[][] B = {
            {10, 20, 30},
            {40, 50, 60}
        };

        int rows = A.length;
        int cols = A[0].length;
        int[][] sum = new int[rows][cols];

        System.out.println("=== Matrix Addition (2x3) ===");
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                sum[r][c] = A[r][c] + B[r][c];
                System.out.printf("%4d", sum[r][c]);
            }
            System.out.println();
        }

        // Transpose of matrix A (becomes 3x2)
        int[][] transpose = new int[cols][rows];
        System.out.println("\n=== Transpose of Matrix A (3x2) ===");
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                transpose[c][r] = A[r][c];
            }
        }

        for (int r = 0; r < cols; r++) {
            for (int c = 0; c < rows; c++) {
                System.out.printf("%4d", transpose[r][c]);
            }
            System.out.println();
        }
    }
}`,
    expectedOutput: `=== Matrix Addition (2x3) ===
  11  22  33
  44  55  66

=== Transpose of Matrix A (3x2) ===
   1   4
   2   5
   3   6`,
    stepByStep: [
      '1. A and B are instantiated as 2-row, 3-column matrices.',
      '2. Nested loops iterate through r from 0 to 1 and c from 0 to 2.',
      '3. Corresponding cells are summed: A[r][c] + B[r][c] -> sum[r][c].',
      '4. Transpose flips indices: transpose[c][r] = A[r][c], converting 2x3 into 3x2.',
      '5. Formatted output displays aligned mathematical matrices.'
    ],
    commonMistakes: [
      {
        mistake: 'Confusing rows with columns (matrix[col][row])',
        codeSnippet: `int val = matrix[c][r]; // Incorrect indexing order!`,
        correction: 'Always use [row][column]: matrix[row][col].',
        explanation: 'The first bracket indexes the outer row array; the second bracket indexes the inner column array.'
      },
      {
        mistake: 'Assuming all rows in a 2D array have identical length',
        codeSnippet: `for (int c = 0; c < matrix[0].length; c++) // Fails on jagged arrays where row 1 might be shorter!`,
        correction: 'Use matrix[r].length for each specific row: for (int c = 0; c < matrix[r].length; c++).',
        explanation: 'In Java, each row is an independent array; using row 0 length causes ArrayIndexOutOfBoundsException on jagged arrays.'
      }
    ],
    realWorldExample: {
      scenario: 'Game Development 2D Tilemap Grid Rendering Engine',
      code: `public class Main {
    public static void main(String[] args) {
        // 0 = Grass, 1 = Water, 2 = Obstacle
        int[][] gameMap = {
            {0, 0, 1, 1},
            {0, 2, 0, 1},
            {0, 0, 0, 0}
        };

        System.out.println("[TILEMAP] World Grid Loaded: " + gameMap.length + "x" + gameMap[0].length);
        System.out.println("[PLAYER] Spawn location tile type: " + gameMap[0][0]);
    }
}`,
      explanation: 'Game development engines (like Chess, Roguelikes, Minecraft chunks) represent boards and 2D terrain grids as two-dimensional arrays of coordinate cells.'
    },
    practice: {
      prompt: 'Write a Java program that creates a 2x2 matrix: {{1, 2}, {3, 4}}. Calculate and print the sum of its main diagonal elements (1 + 4): "Diagonal Sum: 5".',
      starterCode: `public class Main {
    public static void main(String[] args) {
        int[][] m = {{1, 2}, {3, 4}};
        // Sum main diagonal where r == c and print
    }
}`,
      expectedOutputMatcher: 'Diagonal Sum: 5',
      hint: 'int diag = m[0][0] + m[1][1]; System.out.println("Diagonal Sum: " + diag);',
      solution: `public class Main {
    public static void main(String[] args) {
        int[][] m = {{1, 2}, {3, 4}};
        int diag = m[0][0] + m[1][1];
        System.out.println("Diagonal Sum: " + diag);
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-multi-1',
        question: 'How are 2D arrays implemented under the hood in Java?',
        options: [
          'As a single flat C-style pointer block',
          'As an array of arrays (an outer array of references pointing to row arrays)',
          'As a linked list',
          'As a hash map'
        ],
        correctIndex: 1,
        explanation: 'Java implements multidimensional arrays as arrays of arrays, where each row is an independent heap array object.'
      },
      {
        id: 'mcq-java-multi-2',
        question: 'What expression gives the number of rows in a 2D array named grid?',
        options: ['grid.length', 'grid[0].length', 'grid.rows', 'grid.size()'],
        correctIndex: 0,
        explanation: 'grid.length returns the size of the outer array, which equals the number of rows.'
      },
      {
        id: 'mcq-java-multi-3',
        question: 'What expression gives the number of columns in row r of a 2D array named grid?',
        options: ['grid.columns', 'grid[r].length', 'grid.length', 'grid[r].size()'],
        correctIndex: 1,
        explanation: 'grid[r].length queries the length of the specific 1D array representing row r.'
      },
      {
        id: 'mcq-java-multi-4',
        question: 'What is a "jagged array" in Java?',
        options: [
          'An array with corrupted memory',
          'A 2D array where different rows have different numbers of columns',
          'An array of floating-point numbers',
          'An array sorted backwards'
        ],
        correctIndex: 1,
        explanation: 'Because rows are independent arrays, a jagged (ragged) array can have rows of varying lengths.'
      },
      {
        id: 'mcq-java-multi-5',
        question: 'What is the mathematical condition for an element matrix[r][c] to be on the main diagonal of a square matrix?',
        options: ['r + c == 0', 'r == c', 'r > c', 'c == 0'],
        correctIndex: 1,
        explanation: 'The main diagonal consists of cells where the row index equals the column index (e.g., [0][0], [1][1], [2][2]).'
      }
    ],
    codingChallenge: {
      title: '2x2 Matrix Trace Calculator',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program that defines a 2x2 matrix int[][] mat = {{5, 8}, {3, 9}}. Sum the diagonal elements (5 + 9) and print "Trace: 14".',
      input_format: 'No input.',
      output_format: 'One line showing the matrix trace.',
      constraints: 'Exact text match.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        int[][] mat = {{5, 8}, {3, 9}};
        // Calculate trace and print
    }
}`,
      expected_output: `Trace: 14`,
      test_cases: [
        {
          input: '',
          expected_output: `Trace: 14`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Java 2D arrays are arrays of arrays allocated on the Heap.',
      'Access cells via matrix[row][col]; matrix.length gives row count, matrix[r].length gives column count.',
      'Jagged arrays allow rows of differing lengths.',
      'Matrix transpose and arithmetic operations use nested for loops to transform coordinate indices.'
    ]
  },

  // =========================================================================
  // LESSON 26: Strings Fundamentals
  // =========================================================================
  {
    id: 'top-java-strings',
    number: 26,
    numberDisplay: '26',
    moduleId: 'mod-java-methods-arrays',
    moduleTitle: 'Module 03: Java Methods & Arrays',
    title: 'Strings Fundamentals',
    slug: 'java-strings-immutability-methods',
    language: 'java',
    shortDescription: 'Master text processing with the java.lang.String class: String Constant Pool, immutability, equals() vs ==, charAt(), length(), substring(), search, case conversion, trim(), and StringBuilder intro.',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    prerequisiteId: 'top-java-multidimensional-arrays',
    learningObjectives: [
      'Understand the String class and explain String immutability and the String Constant Pool',
      'Differentiate value equality (.equals()) from reference pointer equality (==)',
      'Apply essential String manipulation methods: charAt(), length(), substring(), toUpperCase(), trim()',
      'Implement string reversal, palindrome testing, and character frequency counting',
      'Understand when to use StringBuilder for high-performance string concatenation'
    ],
    conceptExplanation: `### 1. What is a String in Java?
In Java, a **String** is not a primitive data type; it is an instantiated object of the built-in \`java.lang.String\` class. A String represents an immutable sequence of characters.

### 2. The String Constant Pool & Immutability
* **Immutability**: Once a String object is created in Java, **its contents can never be changed**. Any method that appears to modify a String (like \`.toUpperCase()\` or \`.replace()\`) actually instantiates and returns a **brand-new String object**!
* **String Constant Pool (SCP)**: A special cached memory area inside the JVM Heap.
  - When you declare a string literal: \`String s1 = "Java";\`
  - The JVM checks the pool. If \`"Java"\` already exists, \`s1\` simply references the existing object!
  - If you use \`new String("Java")\`, a separate object is forced outside the pool in normal heap memory.

### 3. The Number One Java Mistake: \`==\` vs. \`.equals()\`
* **\`==\` (Reference Comparison)**: Compares whether two variables point to the **exact same memory address** on the Heap.
* **\`.equals()\` (Content Comparison)**: Compares the **actual character values** inside the Strings.
\`\`\`java
String a = new String("Java");
String b = new String("Java");
System.out.println(a == b);      // FALSE! Different objects in Heap memory
System.out.println(a.equals(b)); // TRUE! Both hold identical characters 'J', 'a', 'v', 'a'
\`\`\`

### 4. Essential String Methods Master List
| Method | Description | Example |
| :--- | :--- | :--- |
| **\`length()\`** | Total number of characters | \`"Code".length()\` -> \`4\` |
| **\`charAt(int i)\`** | Returns character at index \`i\` (0-based) | \`"Code".charAt(0)\` -> \`'C'\` |
| **\`substring(int start, int end)\`** | Extracts characters from \`start\` up to \`end - 1\` | \`"Java".substring(1, 3)\` -> \`"av"\` |
| **\`contains(CharSequence s)\`** | Checks if substring exists | \`"Tech".contains("ec")\` -> \`true\` |
| **\`startsWith()\` / \`endsWith()\`** | Checks prefix / suffix | \`"App.java".endsWith(".java")\` -> \`true\` |
| **\`toUpperCase()\` / \`toLowerCase()\`** | Converts letter casing | \`"Hi".toUpperCase()\` -> \`"HI"\` |
| **\`trim()\` / \`strip()\`** | Strips leading and trailing whitespace | \`" hi ".trim()\` -> \`"hi"\` |

### 5. \`StringBuilder\` for Performance
Because Strings are immutable, concatenating strings in a loop (\`s += "a"\`) creates thousands of discarded temporary objects in the Heap, degrading performance.
For heavy string building, use **\`StringBuilder\`**, which mutates an internal character buffer in place:
\`\`\`java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) sb.append(i);
String result = sb.toString();
\`\`\``,
    simpleExample: {
      code: `public class Main {
    public static void main(String[] args) {
        String greeting = "Hello, World!";
        System.out.println("Length: " + greeting.length());
        System.out.println("First Char: " + greeting.charAt(0));
        System.out.println("Substring: " + greeting.substring(0, 5));
    }
}`,
      explanation: 'Demonstrates length, charAt, and substring extraction.'
    },
    syntax: `// String methods:
String s = "  Java Architecture  ";
int len = s.length();
char c = s.charAt(0);
String sub = s.substring(2, 6);
String clean = s.trim();
boolean match = s.equals(otherString);`,
    codeExample: `public class Main {
    public static void main(String[] args) {
        String rawEmail = "  Student.Engineering@University.EDU  ";
        // String normalization pipeline
        String normalizedEmail = rawEmail.trim().toLowerCase();

        System.out.println("=== String Manipulation Diagnostics ===");
        System.out.println("Raw Input:         '" + rawEmail + "'");
        System.out.println("Normalized Email:  '" + normalizedEmail + "'");
        System.out.println("Is University EDU? " + normalizedEmail.endsWith(".edu"));
        System.out.println("Contains Domain?   " + normalizedEmail.contains("university"));

        // Palindrome Verification:
        String word = "radar";
        String reversed = "";
        for (int i = word.length() - 1; i >= 0; i--) {
            reversed += word.charAt(i);
        }
        System.out.println("Word: '" + word + "' | Reversed: '" + reversed + "'");
        System.out.println("Is Palindrome? " + word.equals(reversed));
    }
}`,
    expectedOutput: `=== String Manipulation Diagnostics ===
Raw Input:         '  Student.Engineering@University.EDU  '
Normalized Email:  'student.engineering@university.edu'
Is University EDU? true
Contains Domain?   true
Word: 'radar' | Reversed: 'radar'
Is Palindrome? true`,
    stepByStep: [
      '1. rawEmail holds leading/trailing whitespace and mixed casing.',
      '2. .trim() removes whitespace; .toLowerCase() converts letters; results assigned to normalizedEmail.',
      '3. .endsWith(".edu") tests true.',
      '4. word is iterated backwards via charAt(i) to assemble reversed string.',
      '5. word.equals(reversed) tests character equality, confirming palindrome.'
    ],
    commonMistakes: [
      {
        mistake: 'Using == to compare String values',
        codeSnippet: `String input = sc.next();
if (input == "yes") // Fails! == tests reference memory pointers, NOT text content!`,
        correction: 'Always use .equals(): if ("yes".equals(input)).',
        explanation: 'String literals and dynamic user inputs are allocated at different memory addresses; == will return false.'
      },
      {
        mistake: 'Ignoring String immutability',
        codeSnippet: `String text = "hello";
text.toUpperCase(); // Returned value is discarded! text remains "hello"`,
        correction: 'Assign the returned new string: text = text.toUpperCase();',
        explanation: 'String methods never modify the existing object; they return a newly constructed String object.'
      },
      {
        mistake: 'StringIndexOutOfBoundsException in substring',
        codeSnippet: `String s = "Java";
String sub = s.substring(0, 5); // Crashes: endIndex 5 exceeds length 4`,
        correction: 'Ensure endIndex <= s.length().',
        explanation: 'substring indices must be within 0 and string length inclusive.'
      }
    ],
    realWorldExample: {
      scenario: 'Enterprise User Input Sanitization & Authentication Gateway',
      code: `public class Main {
    public static void main(String[] args) {
        String username = "  Admin_Ops  ";
        String cleanUser = username.trim().toLowerCase();

        if ("admin_ops".equals(cleanUser)) {
            System.out.println("[AUTH GATEWAY] User: " + cleanUser + " authenticated with ROOT privileges.");
        }
    }
}`,
      explanation: 'Security gateways sanitize and normalize emails and usernames using trim() and toLowerCase() to prevent duplicate account creation and SQL/JSON injection attacks.'
    },
    practice: {
      prompt: 'Write a Java program that defines String text = "Adaptive". Print the uppercase version: "ADAPTIVE".',
      starterCode: `public class Main {
    public static void main(String[] args) {
        String text = "Adaptive";
        // Convert to uppercase and print
    }
}`,
      expectedOutputMatcher: 'ADAPTIVE',
      hint: 'System.out.println(text.toUpperCase());',
      solution: `public class Main {
    public static void main(String[] args) {
        String text = "Adaptive";
        System.out.println(text.toUpperCase());
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-str-1',
        question: 'Why are String objects called "immutable" in Java?',
        options: [
          'Because their length cannot exceed 10 characters',
          'Because once created, their character contents can never be altered',
          'Because they are stored on read-only hard drives',
          'Because they cannot be converted to uppercase'
        ],
        correctIndex: 1,
        explanation: 'Immutability means a String instance\'s character data can never be modified after instantiation.'
      },
      {
        id: 'mcq-java-str-2',
        question: 'What is the correct way to compare the character text of two Strings for equality in Java?',
        options: ['string1 == string2', 'string1.equals(string2)', 'string1.compare(string2)', 'string1 = string2'],
        correctIndex: 1,
        explanation: '.equals() compares the character sequence; == only checks if both point to the identical memory address.'
      },
      {
        id: 'mcq-java-str-3',
        question: 'What does "Java".substring(1, 3) evaluate to?',
        options: ['"Jav"', '"av"', '"ava"', '"a"'],
        correctIndex: 1,
        explanation: 'substring(start, end) includes index start (1 -> \'a\') and excludes index end (up to index 2 -> \'v\'), yielding "av".'
      },
      {
        id: 'mcq-java-str-4',
        question: 'What is the purpose of the String Constant Pool in JVM Heap memory?',
        options: [
          'To conserve memory by sharing identical string literal instances',
          'To encrypt strings against hackers',
          'To format text with colors',
          'To speed up arithmetic'
        ],
        correctIndex: 0,
        explanation: 'The pool caches string literals so multiple variables referencing the same text share a single Heap object.'
      },
      {
        id: 'mcq-java-str-5',
        question: 'Which class should be used instead of String when performing heavy string concatenation inside loops?',
        options: ['StringList', 'StringBuffer / StringBuilder', 'TextHolder', 'CharStream'],
        correctIndex: 1,
        explanation: 'StringBuilder avoids creating thousands of discarded intermediate String objects by mutating an internal buffer.'
      }
    ],
    codingChallenge: {
      title: 'Vowel Counter Engine',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program with String text = "Cognitive". Count the vowels (a, e, i, o, u case-insensitive) and print "Vowels: 4".',
      input_format: 'No input.',
      output_format: 'One line showing the vowel count.',
      constraints: 'Exact text match.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        String text = "Cognitive";
        // Count vowels and print
    }
}`,
      expected_output: `Vowels: 4`,
      test_cases: [
        {
          input: '',
          expected_output: `Vowels: 4`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'String objects in Java are immutable reference types stored in the JVM String Constant Pool.',
      'Always use .equals() for content comparison; never use ==.',
      'Key methods: length(), charAt(), substring(), toUpperCase(), toLowerCase(), trim().',
      'Use StringBuilder when concatenating many strings in loops for maximum memory performance.'
    ]
  },

  // =========================================================================
  // LESSON 27: Structured Problem Solving
  // =========================================================================
  {
    id: 'top-java-problem-solving',
    number: 27,
    numberDisplay: '27',
    moduleId: 'mod-java-methods-arrays',
    moduleTitle: 'Module 03: Java Methods & Arrays',
    title: 'Structured Problem Solving',
    slug: 'java-structured-problem-solving',
    language: 'java',
    shortDescription: 'Master the engineering methodology of breaking complex challenges into modular Java components: requirement analysis, pseudocode, algorithm design, dry runs, boundary testing, and refactoring.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-java-strings',
    learningObjectives: [
      'Deconstruct complex software problem statements into inputs, outputs, and constraints',
      'Design algorithms using structured pseudocode and flowcharts before writing code',
      'Select optimal data structures (primitives, arrays, strings) and control structures',
      'Apply defensive boundary testing to eliminate edge case defects'
    ],
    conceptExplanation: `### 1. The 6-Step Software Problem-Solving Framework
Professional software engineers do not jump straight into typing code. They follow a disciplined 6-step engineering methodology:
1. **Understand the Requirements**: Identify exact inputs, required outputs, and edge-case constraints.
2. **Design the Algorithm**: Write step-by-step logic in human-readable **Pseudocode**.
3. **Select Data Structures**: Choose appropriate primitives, arrays, or strings based on memory and access patterns.
4. **Decompose into Modular Methods**: Break the problem down so each method has a single responsibility.
5. **Dry Run with Test Cases**: Trace variables manually through your pseudocode with typical and edge-case inputs.
6. **Implement, Test & Refactor**: Write clean Java code and eliminate duplicate logic.

### 2. Case Study: Expense Tracker and Budget Alert System
* **Requirements**:
  - Accept daily expenses for 7 days in an array.
  - Compute total weekly expenditure.
  - Identify the day with the highest expense.
  - Check if total exceeds budget threshold.
* **Pseudocode**:
  \`\`\`text
  FUNCTION computeTotal(expenses):
      total = 0
      FOR EACH expense IN expenses:
          total = total + expense
      RETURN total

  FUNCTION findPeakDay(expenses):
      maxIndex = 0
      FOR i = 1 TO expenses.length - 1:
          IF expenses[i] > expenses[maxIndex]:
              maxIndex = i
      RETURN maxIndex + 1
  \`\`\``,
    simpleExample: {
      code: `public class Main {
    public static int sumArray(int[] data) {
        int s = 0;
        for (int v : data) s += v;
        return s;
    }

    public static void main(String[] args) {
        int[] numbers = {10, 20, 30};
        System.out.println("Total: " + sumArray(numbers));
    }
}`,
      explanation: 'A clean, modular method dedicated to a single task (summing an array).'
    },
    syntax: `// Problem-Solving Modular Architecture:
public class Solution {
    // 1. Core calculation method
    // 2. Validation method
    // 3. Presentation / display method
    // 4. main() coordinator
}`,
    codeExample: `public class Main {
    public static double computeTotal(double[] expenses) {
        double total = 0;
        for (double e : expenses) total += e;
        return total;
    }

    public static int findPeakDay(double[] expenses) {
        int peakIdx = 0;
        for (int i = 1; i < expenses.length; i++) {
            if (expenses[i] > expenses[peakIdx]) {
                peakIdx = i;
            }
        }
        return peakIdx + 1; // 1-based day
    }

    public static void main(String[] args) {
        double[] weeklyExpenses = {45.50, 120.00, 35.25, 210.75, 50.00, 85.00, 15.00};
        double budgetLimit = 500.00;

        double total = computeTotal(weeklyExpenses);
        int peakDay = findPeakDay(weeklyExpenses);
        boolean isOverBudget = total > budgetLimit;

        System.out.println("=== Weekly Expense Ledger Analysis ===");
        System.out.printf("Total Spent:        $%.2f%n", total);
        System.out.printf("Budget Limit:       $%.2f%n", budgetLimit);
        System.out.println("Peak Expense Day:   Day " + peakDay + " ($" + weeklyExpenses[peakDay - 1] + ")");
        System.out.println("Budget Status:      " + (isOverBudget ? "OVER BUDGET WARNING" : "WITHIN BUDGET"));
    }
}`,
    expectedOutput: `=== Weekly Expense Ledger Analysis ===
Total Spent:        $561.50
Budget Limit:       $500.00
Peak Expense Day:   Day 4 ($210.75)
Budget Status:      OVER BUDGET WARNING`,
    stepByStep: [
      '1. weeklyExpenses array is initialized with 7 daily expenditure figures.',
      '2. computeTotal iterates through array summing values to 561.50.',
      '3. findPeakDay locates index 3 ($210.75), returning Day 4.',
      '4. Total is compared with budgetLimit ($500.00), triggering OVER BUDGET alert.',
      '5. Formatted analytics output is sent to console stdout.'
    ],
    commonMistakes: [
      {
        mistake: 'Putting all logic inside main() without helper methods',
        codeSnippet: `// 200 lines of mixed input, calculation, and formatting inside main()`,
        correction: 'Break functionality into discrete, testable helper methods.',
        explanation: 'Monolithic code is difficult to debug, test, and maintain.'
      },
      {
        mistake: 'Failing to test empty or single-element inputs',
        codeSnippet: `double max = expenses[1]; // Crashes if array length is 0 or 1!`,
        correction: 'Always check array boundary conditions: if (arr.length == 0) return 0;.',
        explanation: 'Boundary defects occur when code assumes input collections always have multiple items.'
      }
    ],
    realWorldExample: {
      scenario: 'Cloud Data Pipeline Batch Record Ingestion Validator',
      code: `public class Main {
    public static boolean validateBatch(int[] batchIds) {
        if (batchIds == null || batchIds.length == 0) return false;
        for (int id : batchIds) {
            if (id <= 0) return false; // Invalid ID
        }
        return true;
    }

    public static void main(String[] args) {
        int[] batch = {101, 102, 103};
        System.out.println("[INGEST] Batch Valid: " + validateBatch(batch));
    }
}`,
      explanation: 'Enterprise data pipelines use modular validator methods to inspect thousands of incoming messages against data contracts before persisting to databases.'
    },
    practice: {
      prompt: 'Write a Java program with a method isEvenSum(int[] arr) that returns true if the sum of array elements is even. In main with int[] a = {2, 4, 6}, print "Even Sum: true".',
      starterCode: `public class Main {
    // Define isEvenSum

    public static void main(String[] args) {
        // Call and print
    }
}`,
      expectedOutputMatcher: 'Even Sum: true',
      hint: 'Sum elements, then return sum % 2 == 0.',
      solution: `public class Main {
    public static boolean isEvenSum(int[] arr) {
        int sum = 0;
        for (int n : arr) sum += n;
        return sum % 2 == 0;
    }

    public static void main(String[] args) {
        int[] a = {2, 4, 6};
        System.out.println("Even Sum: " + isEvenSum(a));
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-prob-1',
        question: 'What is the first step in the structured problem-solving framework?',
        options: ['Writing code in Java', 'Understanding requirements, inputs, outputs, and constraints', 'Running the debugger', 'Creating classes'],
        correctIndex: 1,
        explanation: 'Thoroughly understanding problem requirements is the essential starting point for software engineering.'
      },
      {
        id: 'mcq-java-prob-2',
        question: 'Why should methods adhere to the Single Responsibility Principle?',
        options: [
          'Because each method is easier to read, test, debug, and reuse',
          'To make the file as long as possible',
          'To use more RAM',
          'Java forbids methods from doing more than one line'
        ],
        correctIndex: 0,
        explanation: 'Single-responsibility methods improve modularity, reusability, and unit testability.'
      },
      {
        id: 'mcq-java-prob-3',
        question: 'What is "pseudocode"?',
        options: [
          'Fake computer virus code',
          'An informal, language-agnostic step-by-step description of an algorithm',
          'Encrypted bytecode',
          'Compiled machine instructions'
        ],
        correctIndex: 1,
        explanation: 'Pseudocode allows developers to design and verify algorithms before translating them into actual syntax.'
      },
      {
        id: 'mcq-java-prob-4',
        question: 'What is an "edge case" in software testing?',
        options: [
          'The borders of your computer monitor',
          'A boundary condition (such as empty arrays, 0, or negative numbers) that can trigger unexpected bugs',
          'A hardware memory failure',
          'A font size issue'
        ],
        correctIndex: 1,
        explanation: 'Edge cases occur at the extreme boundaries of input ranges where code is most likely to fail.'
      },
      {
        id: 'mcq-java-prob-5',
        question: 'What is the process of improving code structure without changing its external behavior called?',
        options: ['Compiling', 'Refactoring', 'Debugging', 'Interpreting'],
        correctIndex: 1,
        explanation: 'Refactoring cleans up design, eliminates duplicate code, and enhances readability while preserving behavior.'
      }
    ],
    codingChallenge: {
      title: 'Array Range Calculator',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program with a method getRange(int[] arr) that returns (max - min). In main with int[] data = {15, 3, 22, 8}, print "Range: 19".',
      input_format: 'No input.',
      output_format: 'One line showing the range.',
      constraints: 'Exact text match.',
      starter_code: `public class Main {
    // Define getRange

    public static void main(String[] args) {
        int[] data = {15, 3, 22, 8};
        // Print range
    }
}`,
      expected_output: `Range: 19`,
      test_cases: [
        {
          input: '',
          expected_output: `Range: 19`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'Structured problem solving follows: Requirements -> Algorithm -> Data Structures -> Methods -> Test -> Refactor.',
      'Single-responsibility methods keep programs modular, maintainable, and testable.',
      'Defensive programming handles boundary edge cases (null, empty arrays, division by zero).',
      'Refactoring improves code clarity without altering functional behavior.'
    ]
  },

  // =========================================================================
  // LESSON 28: Final Mini Project — Student Marks Management System & Assessment
  // =========================================================================
  {
    id: 'top-java-final-project',
    number: 28,
    numberDisplay: '28',
    moduleId: 'mod-java-methods-arrays',
    moduleTitle: 'Module 03: Java Methods & Arrays',
    title: 'Final Mini Project — Student Marks Management System & Assessment',
    slug: 'java-final-mini-project-student-marks-system',
    language: 'java',
    shortDescription: 'Build the comprehensive capstone application synthesizing all 3 beginner modules: student name storage, subject scores in 2D arrays, totals, averages, letter grades, highest/lowest marks, search, and formatted reporting + Module 03 Assessment.',
    difficulty: 'Intermediate',
    estimatedMinutes: 35,
    prerequisiteId: 'top-java-problem-solving',
    learningObjectives: [
      'Architect a complete console-based Java application combining variables, arrays, strings, loops, conditionals, and methods',
      'Manage parallel data arrays and 2D matrices to track student names and multi-subject marks',
      'Implement modular methods for totals, averages, grade thresholds, and student search',
      'Format professional tabular reports using System.out.printf()',
      'Demonstrate mastery of all 28 lessons through the comprehensive Module 03 Final Assessment'
    ],
    conceptExplanation: `### 1. Project Overview: Student Marks Management System
This capstone project synthesizes all concepts learned across Module 01, Module 02, and Module 03 into a complete, structured console application.

### 2. Functional Requirements
1. **Multi-Student & Multi-Subject Storage**: Store names in a \`String[]\` array and marks in a 2D \`int[][]\` matrix (rows = students, columns = subjects).
2. **Total & Average Calculation**: Compute each student's aggregate score and percentage.
3. **Grade Assignment**: Determine letter grades (\`A\`, \`B\`, \`C\`, \`F\`) based on percentage.
4. **Class Analytics**: Find the overall class topper and the highest/lowest subject scores.
5. **Student Search**: Allow searching for a student by name (case-insensitive) using String methods.
6. **Formatted Report**: Display a clean tabular grade sheet with headers and aligned columns using \`printf()\`.
7. **Strict Architectural Constraint**: All functionality must be organized into clean, reusable \`static\` methods—avoiding unstructured monolithic code!

---

### MODULE 03 COMPREHENSIVE ASSESSMENT SPECIFICATION
This lesson concludes the entire course with a comprehensive assessment covering:
- Method declarations, signatures, return types, and static invocation
- Formal parameters vs. actual arguments and guard clauses
- Method overloading rules and overload resolution
- The 100% pass-by-value model in Java (primitives vs. reference handles)
- Array declaration, instantiation, length property, and zero-based indexing
- Array traversal (indexed for loop vs. enhanced for-each loop)
- Linear Search vs. Binary Search and java.util.Arrays.sort()
- 2D arrays, matrices, and jagged arrays
- String immutability, String Constant Pool, .equals() vs. ==, and core methods
- Structured algorithmic problem solving and modular architecture`,
    simpleExample: {
      code: `public class Main {
    public static char calculateGrade(double avg) {
        if (avg >= 90) return 'A';
        if (avg >= 80) return 'B';
        if (avg >= 70) return 'C';
        return 'F';
    }

    public static void main(String[] args) {
        System.out.println("Grade for 85.5: " + calculateGrade(85.5));
    }
}`,
      explanation: 'Grade determination method used in the final project.'
    },
    syntax: `// Capstone Architecture:
public class StudentSystem {
    public static int calculateTotal(int[] marks) { ... }
    public static double calculateAverage(int total, int count) { ... }
    public static char assignGrade(double average) { ... }
    public static int searchStudent(String[] names, String query) { ... }
    public static void displayReport(...) { ... }
}`,
    codeExample: `public class Main {
    // 1. Calculate student total score
    public static int calculateTotal(int[] studentMarks) {
        int total = 0;
        for (int mark : studentMarks) {
            total += mark;
        }
        return total;
    }

    // 2. Calculate student average percentage
    public static double calculateAverage(int total, int subjectsCount) {
        return (double) total / subjectsCount;
    }

    // 3. Assign letter grade based on percentage
    public static char assignGrade(double avg) {
        if (avg >= 90.0) return 'A';
        if (avg >= 80.0) return 'B';
        if (avg >= 70.0) return 'C';
        return 'F';
    }

    // 4. Search student index by name (case-insensitive)
    public static int searchStudent(String[] names, String target) {
        for (int i = 0; i < names.length; i++) {
            if (names[i].equalsIgnoreCase(target.trim())) {
                return i;
            }
        }
        return -1;
    }

    // 5. Generate and print tabular performance report
    public static void printReport(String[] names, int[][] marks, String[] subjects) {
        System.out.println("==========================================================================");
        System.out.printf("%-15s %-8s %-8s %-8s %-8s %-8s %-6s%n", "STUDENT NAME", subjects[0], subjects[1], subjects[2], "TOTAL", "AVG (%)", "GRADE");
        System.out.println("--------------------------------------------------------------------------");

        int topStudentIdx = 0;
        double highestAvg = -1.0;

        for (int i = 0; i < names.length; i++) {
            int total = calculateTotal(marks[i]);
            double avg = calculateAverage(total, subjects.length);
            char grade = assignGrade(avg);

            if (avg > highestAvg) {
                highestAvg = avg;
                topStudentIdx = i;
            }

            System.out.printf("%-15s %-8d %-8d %-8d %-8d %-8.2f %-6c%n",
                names[i], marks[i][0], marks[i][1], marks[i][2], total, avg, grade);
        }

        System.out.println("==========================================================================");
        System.out.println("CLASS TOPPER: " + names[topStudentIdx] + " with Average: " + String.format("%.2f", highestAvg) + "%");
        System.out.println("==========================================================================");
    }

    public static void main(String[] args) {
        String[] subjects = {"Math", "Java", "Physics"};
        String[] studentNames = {"Aarav Sharma", "Maya Lin", "Jinesh Patel", "Sophia Chen"};

        // Marks matrix: 4 students x 3 subjects
        int[][] studentMarks = {
            {92, 95, 88},
            {85, 89, 91},
            {78, 82, 80},
            {95, 98, 94}
        };

        // Display comprehensive grade sheet
        printReport(studentNames, studentMarks, subjects);

        // Search demonstration
        String query = "Maya Lin";
        int idx = searchStudent(studentNames, query);
        System.out.println("\n[SEARCH QUERY] Target: '" + query + "'");
        if (idx != -1) {
            int total = calculateTotal(studentMarks[idx]);
            double avg = calculateAverage(total, subjects.length);
            System.out.println(" -> Record located: " + studentNames[idx] + " | Total: " + total + " | Average: " + String.format("%.2f", avg) + "%");
        }
    }
}`,
    expectedOutput: `==========================================================================
STUDENT NAME    Math     Java     Physics  TOTAL    AVG (%)  GRADE 
--------------------------------------------------------------------------
Aarav Sharma    92       95       88       275      91.67    A     
Maya Lin        85       89       91       265      88.33    B     
Jinesh Patel    78       82       80       240      80.00    B     
Sophia Chen     95       98       94       287      95.67    A     
==========================================================================
CLASS TOPPER: Sophia Chen with Average: 95.67%
==========================================================================

[SEARCH QUERY] Target: 'Maya Lin'
 -> Record located: Maya Lin | Total: 265 | Average: 88.33%`,
    stepByStep: [
      '1. studentNames array and studentMarks 2D array model institutional grade records.',
      '2. printReport iterates through each student row, delegating math to calculateTotal and calculateAverage.',
      '3. assignGrade classifies student percentages into standardized academic tiers.',
      '4. Table is formatted using %-15s and %-8d format specifiers for clean alignment.',
      '5. searchStudent uses equalsIgnoreCase() to locate record without casing sensitivity.',
      '6. System demonstrates complete full-stack procedural Java architecture.'
    ],
    commonMistakes: [
      {
        mistake: 'Hardcoding subject counts instead of using array length',
        codeSnippet: `double avg = total / 3; // Breaks if subjects array expands!`,
        correction: 'Use subjects.length dynamically: (double) total / subjects.length.',
        explanation: 'Dynamic sizing ensures algorithms adapt if more subjects or students are added.'
      },
      {
        mistake: 'Case-sensitive search failing on valid user input',
        codeSnippet: `if (names[i].equals(query)) // "maya lin" would fail to match "Maya Lin"`,
        correction: 'Use names[i].equalsIgnoreCase(query.trim()).',
        explanation: 'User console input often contains minor casing differences; equalsIgnoreCase prevents search misses.'
      }
    ],
    realWorldExample: {
      scenario: 'Academic Information System & Grading Portal Core Engine',
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println("[ENTERPRISE SIS] Student Information System Engine online.");
        System.out.println("[ENTERPRISE SIS] Transcripts compiled and verified.");
        System.out.println("[ENTERPRISE SIS] Academic standing honors list generated.");
    }
}`,
      explanation: 'University Student Information Systems (SIS) like Canvas, Blackboard, and Banner use modular gradebook calculation engines running on enterprise Java backends.'
    },
    practice: {
      prompt: 'Write a Java program that defines int[] marks = {80, 90}. Calculate the average (85.0) and print "Average: 85.0".',
      starterCode: `public class Main {
    public static void main(String[] args) {
        int[] marks = {80, 90};
        // Compute average and print
    }
}`,
      expectedOutputMatcher: 'Average: 85.0',
      hint: 'double avg = (marks[0] + marks[1]) / 2.0; System.out.println("Average: " + avg);',
      solution: `public class Main {
    public static void main(String[] args) {
        int[] marks = {80, 90};
        double avg = (marks[0] + marks[1]) / 2.0;
        System.out.println("Average: " + avg);
    }
}`
    },
    quiz: [
      {
        id: 'mcq-java-final-1',
        question: 'Why is it advantageous to store student marks in a 2D array int[][] marks rather than multiple separate arrays?',
        options: [
          'Because 2D arrays can be traversed easily with nested loops where each row represents one student',
          'Because 2D arrays use no RAM',
          'Because Java restricts programs to one array',
          'Because 2D arrays execute in C'
        ],
        correctIndex: 0,
        explanation: 'In a 2D matrix, row i neatly encapsulates all subject marks for student i, allowing concise loop iteration.'
      },
      {
        id: 'mcq-java-final-2',
        question: 'Which method should be used to compare student names without worrying about upper/lowercase differences?',
        options: ['name1 == name2', 'name1.equals(name2)', 'name1.equalsIgnoreCase(name2)', 'name1.match(name2)'],
        correctIndex: 2,
        explanation: 'equalsIgnoreCase() checks string content while ignoring casing differences.'
      },
      {
        id: 'mcq-java-final-3',
        question: 'What is the primary benefit of breaking the Student Management System into separate methods (calculateTotal, assignGrade, etc.)?',
        options: [
          'It makes the code longer',
          'Modularity: each method has a single responsibility, making the code testable and easy to maintain',
          'It forces the JVM to use multiple threads',
          'It encrypts student grades'
        ],
        correctIndex: 1,
        explanation: 'Modularity adheres to clean architecture principles, making each function independently testable and reusable.'
      },
      {
        id: 'mcq-java-final-4',
        question: 'What format specifier in printf creates a left-aligned 15-character text column?',
        options: ['%15s', '%-15s', '%s15', '%.15s'],
        correctIndex: 1,
        explanation: '%-15s formats a string left-justified within a 15-character wide column.'
      },
      {
        id: 'mcq-java-final-5',
        question: 'Which of the following confirms complete mastery of the Java Core Architecture & Basics course?',
        options: [
          'Copying code from the internet without understanding it',
          'Understanding JVM architecture, compiling with javac, using control flow, modularizing with methods, and manipulating arrays and strings',
          'Knowing how to turn off the monitor',
          'Writing programs with no semicolons'
        ],
        correctIndex: 1,
        explanation: 'Mastering architecture, compilation, data types, control flow, methods, arrays, and strings forms a rock-solid foundation for advanced Java development.'
      }
    ],
    codingChallenge: {
      title: 'Capstone Student Grade Reporter',
      difficulty: 'Beginner',
      problem_statement: 'Write a Java program that defines int[] scores = {85, 95}. Compute total (180), average (90.0), and print: Line 1: "Total: 180", Line 2: "Average: 90.0", Line 3: "Grade: A".',
      input_format: 'No input.',
      output_format: 'Three lines matching the calculated results.',
      constraints: 'Exact text match.',
      starter_code: `public class Main {
    public static void main(String[] args) {
        int[] scores = {85, 95};
        // Compute and print total, average, and grade
    }
}`,
      expected_output: `Total: 180\nAverage: 90.0\nGrade: A`,
      test_cases: [
        {
          input: '',
          expected_output: `Total: 180\nAverage: 90.0\nGrade: A`,
          is_hidden: false
        }
      ]
    },
    summary: [
      'The Student Marks Management System brings together variables, arrays, strings, loops, conditionals, and methods.',
      'Modular architecture delegates specific tasks (totals, averages, grades, search) to dedicated static methods.',
      '2D arrays cleanly organize multi-student, multi-subject data grids.',
      'Congratulations! You have completed all 28 lessons of Java Core Architecture & Basics!'
    ]
  }
];
