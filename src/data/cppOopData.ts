import { CommonMistake, PracticeChallenge, TopicQuizQuestion } from './pythonFundamentalsData';

export interface CppOopTopic {
  id: string;
  number: number;
  numberDisplay: string;
  moduleId?: string;
  moduleTitle?: string;
  title: string;
  slug: string;
  language: 'cpp';
  shortDescription: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced Project' | string;
  estimatedMinutes: number;
  prerequisiteId: string | null;

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
  codingChallenge?: {
    title?: string;
    difficulty?: string;
    problem_statement?: string;
    input_format?: string;
    output_format?: string;
    constraints?: string;
    starter_code?: string;
    expected_output?: string;
    test_cases?: any[];
    [key: string]: any;
  };
  summary: string[];
}

export interface CppOopModule {
  id: string;
  number: number;
  numberDisplay: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  topics: CppOopTopic[];
}

// Authoritative 16-Lesson Curriculum for Object-Oriented C++
export const CPP_OOP_TOPICS: CppOopTopic[] = [
  {
    "id": "top-cpp-oop-intro",
    "number": 1,
    "numberDisplay": "01",
    "moduleId": "mod-cpp-oop-core",
    "moduleTitle": "Module 01: Object-Oriented C++ Architecture & Design",
    "title": "Introduction to Object-Oriented Programming",
    "slug": "introduction-to-object-oriented-programming",
    "language": "cpp",
    "shortDescription": "Explore the fundamental paradigm shift from procedural code to object-oriented architecture, real-world entities, and the four foundational pillars of OOP in C++.",
    "difficulty": "Intermediate",
    "estimatedMinutes": 25,
    "prerequisiteId": null,
    "learningObjectives": [
      "Understand the limitations of procedural programming when building large-scale software systems",
      "Learn how real-world entities map to software classes and instantiated objects",
      "Master the definitions and conceptual roles of the Four Pillars of OOP: Encapsulation, Abstraction, Inheritance, and Polymorphism",
      "Analyze the structural differences between procedural record keeping and object-oriented encapsulation"
    ],
    "conceptExplanation": "### 1. What is Object-Oriented Programming (OOP)?\nObject-Oriented Programming (OOP) is a software design paradigm structured around **objects** rather than actions, and **data** rather than logic. Historically, procedural programming (such as pure C) divided programs into collections of global functions operating upon detached data structures. In contrast, OOP binds data together with the functions that operate on that data into unified computational entities called **objects**.\n\n### 2. Why Do We Need OOP?\nIn procedural code:\n1. **Unrestricted Global State**: Multiple functions across different translation units modify global variables, making debugging and concurrency unpredictable.\n2. **Poor Extensibility**: Adding new variations of an entity (e.g., adding a new type of employee or bank account) requires altering existing nested `switch` or `if-else` statements throughout the codebase.\n3. **High Coupling**: Logic and raw data representations are tightly coupled, so changing an internal struct member breaks all calling functions.\n\nOOP resolves these bottlenecks by providing **data encapsulation**, **strict access boundaries**, and **polymorphic extensibility**.\n\n### 3. Procedural vs Object-Oriented Programming\n| Dimension | Procedural Programming (e.g., C) | Object-Oriented Programming (e.g., C++) |\n| :--- | :--- | :--- |\n| **Primary Unit** | Functions and Procedures | Classes and Objects |\n| **Data Security** | Data moves freely and is globally vulnerable | Data is encapsulated and hidden behind access specifiers |\n| **Approach** | Top-Down decomposition | Bottom-Up design from foundational abstractions |\n| **Code Reuse** | Limited (macros, helper functions, copy-paste) | High (inheritance, composition, templates) |\n| **Polymorphism** | Manual function pointers in structs | Native virtual method tables (`vtable`) & dynamic dispatch |\n\n### 4. Real-World Objects and Software Objects\nA real-world object has **state** (attributes) and **behavior** (actions):\n* **Car**: State = {color, speed, fuelLevel}; Behavior = {accelerate(), brake(), refuel()}\n* **BankAccount**: State = {accountNumber, balance, owner}; Behavior = {deposit(), withdraw(), printStatement()}\n* **Student**: State = {studentId, name, gpa}; Behavior = {enrollCourse(), calculateHonorRoll()}\n\nIn C++, the blueprint is declared as a `class`, and individual active entities are allocated as `objects`.\n\n### 5. The Four Pillars of OOP\n1. **Encapsulation**: Wrapping data members and member functions into a single unit (`class`), shielding private data from direct external corruption.\n2. **Abstraction**: Exposing only the essential interface to the outside world while hiding complex internal implementation details.\n3. **Inheritance**: Creating new derived classes from existing base classes to promote code reuse and establish hierarchical relationships.\n4. **Polymorphism**: The ability of a single interface or base pointer to represent different underlying forms (compile-time overloading or runtime virtual overriding).",
    "simpleExample": {
      "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\n// Procedural representation: detached data and functions\nstruct StudentRecord {\n    string name;\n    int age;\n    double gpa;\n};\n\nvoid printStudent(const StudentRecord& s) {\n    cout << \"Procedural Student: \" << s.name << \", Age: \" << s.age << \", GPA: \" << s.gpa << endl;\n}\n\nint main() {\n    StudentRecord s1 = {\"Alex Rivera\", 20, 3.85};\n    printStudent(s1);\n    return 0;\n}",
      "explanation": "In procedural code, StudentRecord is passive data with no self-protection, and printStudent is an external function that must manually inspect internal fields."
    },
    "syntax": "// Standard C++ Class Structure\nclass ClassName {\nprivate:\n    // Hidden data members (State)\n    dataType memberVariable;\n\npublic:\n    // Public member functions (Behavior / Interface)\n    void memberFunction();\n};",
    "codeExample": "#include <iostream>\n#include <string>\nusing namespace std;\n\n// Object-Oriented representation: encapsulated state and behavior\nclass Student {\nprivate:\n    string name;\n    int age;\n    double gpa;\n\npublic:\n    Student(string n, int a, double g) : name(n), age(a), gpa(g) {}\n\n    void display() const {\n        cout << \"OOP Student: \" << name << \" | Age: \" << age << \" | GPA: \" << gpa << endl;\n    }\n\n    bool isHonorRoll() const {\n        return gpa >= 3.5;\n    }\n};\n\nint main() {\n    Student s1(\"Jinesh\", 19, 3.92);\n    Student s2(\"Sophia\", 20, 3.45);\n\n    s1.display();\n    cout << \"Jinesh Honor Roll: \" << (s1.isHonorRoll() ? \"Yes\" : \"No\") << endl;\n\n    s2.display();\n    cout << \"Sophia Honor Roll: \" << (s2.isHonorRoll() ? \"Yes\" : \"No\") << endl;\n\n    return 0;\n}",
    "expectedOutput": "OOP Student: Jinesh | Age: 19 | GPA: 3.92\nJinesh Honor Roll: Yes\nOOP Student: Sophia | Age: 20 | GPA: 3.45\nSophia Honor Roll: No",
    "stepByStep": [
      "1. The Student class definition declares private fields: name, age, and gpa.",
      "2. The public constructor Student(string, int, double) initializes internal member fields via member initializer list.",
      "3. In main(), object s1 is allocated on the stack with arguments 'Jinesh', 19, and 3.92.",
      "4. Object s2 is allocated independently on the stack with 'Sophia', 20, and 3.45.",
      "5. The member function s1.display() is called; within the call, the implicit this pointer resolves to s1.",
      "6. The boolean method s1.isHonorRoll() evaluates whether 3.92 >= 3.5 (returns true).",
      "7. Both objects maintain isolated states in their respective stack memory frames."
    ],
    "commonMistakes": [
      {
        "mistake": "Leaving class member variables public and unprotected",
        "codeSnippet": "class Student { public: double gpa; }; // External code can set gpa = -999.0",
        "correction": "Make member variables private and expose validated public setters/getters.",
        "explanation": "Direct field manipulation destroys data integrity and prevents class invariants from being maintained."
      },
      {
        "mistake": "Confusing a class (the blueprint) with an object (an instantiated instance)",
        "codeSnippet": "Student::display(); // Error: display() requires an active object instance",
        "correction": "Instantiate an object first: Student s('Jinesh', 19, 3.9); s.display();",
        "explanation": "A non-static member function requires an object instance to provide the this pointer."
      },
      {
        "mistake": "Forgetting the trailing semicolon after class declaration",
        "codeSnippet": "class Student { ... } // Compiler syntax error: expected ';' after class",
        "correction": "Always close class definitions with a semicolon: class Student { ... };",
        "explanation": "In C++, class declarations can optionally be followed by variable names, so the semicolon is syntactically mandatory."
      }
    ],
    "realWorldExample": {
      "scenario": "Autonomous Driving Telemetry - Entity Object Modeling",
      "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass VehicleTelemetry {\nprivate:\n    string vehicleVin;\n    double currentSpeedKmh;\n    double batteryLevelPct;\n\npublic:\n    VehicleTelemetry(string vin, double speed, double battery)\n        : vehicleVin(vin), currentSpeedKmh(speed), batteryLevelPct(battery) {}\n\n    void broadcastStatus() const {\n        cout << \"[VIN \" << vehicleVin << \"] Speed: \" << currentSpeedKmh \n             << \" km/h | Battery: \" << batteryLevelPct << \"%\" << endl;\n    }\n};\n\nint main() {\n    VehicleTelemetry car1(\"TESLA-CYBER-001\", 88.5, 78.0);\n    car1.broadcastStatus();\n    return 0;\n}",
      "explanation": "Autonomous vehicle systems encapsulate sensor telemetry inside dedicated objects, guaranteeing sensor data cannot be corrupted across threads."
    },
    "practice": {
      "prompt": "Write a C++ program defining an OOP class Book with private members title (string) and pages (int). Implement a public constructor Book(string t, int p) and a public method display() that prints 'Book: <title>, Pages: <pages>'. In main(), instantiate a book with 'The C++ Programming Language' and 1376 pages, and call display().",
      "starterCode": "#include <iostream>\n#include <string>\nusing namespace std;\n\n// Define class Book here\n\nint main() {\n    // Instantiate book and call display()\n    return 0;\n}",
      "expectedOutputMatcher": "Book: The C++ Programming Language, Pages: 1376",
      "hint": "Declare private: string title; int pages; and public: Book(string t, int p) : title(t), pages(p) {} and void display() const { ... }",
      "solution": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Book {\nprivate:\n    string title;\n    int pages;\n\npublic:\n    Book(string t, int p) : title(t), pages(p) {}\n\n    void display() const {\n        cout << \"Book: \" << title << \", Pages: \" << pages << endl;\n    }\n};\n\nint main() {\n    Book b(\"The C++ Programming Language\", 1376);\n    b.display();\n    return 0;\n}"
    },
    "quiz": [
      {
        "id": "mcq-cpp-oop-intro-1",
        "question": "Which of the following describes the core philosophical difference between procedural and object-oriented programming?",
        "options": [
          "Procedural programming compiles faster than OOP",
          "Procedural programming organizes code around functions and detached data, while OOP binds data and behavior into objects",
          "OOP cannot use primitive data types like int and float",
          "OOP only runs on 64-bit operating systems"
        ],
        "correctIndex": 1,
        "explanation": "Procedural code separates state and procedures, whereas OOP encapsulates state and operations into coherent objects."
      },
      {
        "id": "mcq-cpp-oop-intro-2",
        "question": "What are the Four Pillars of Object-Oriented Programming?",
        "options": [
          "Recursion, Iteration, Compilation, Linking",
          "Encapsulation, Abstraction, Inheritance, Polymorphism",
          "Stack, Heap, Data, BSS",
          "Pointers, References, Arrays, Vectors"
        ],
        "correctIndex": 1,
        "explanation": "Encapsulation, Abstraction, Inheritance, and Polymorphism form the foundational four pillars of OOP."
      },
      {
        "id": "mcq-cpp-oop-intro-3",
        "question": "What is the relationship between a class and an object in C++?",
        "options": [
          "A class is an instantiated entity in memory, while an object is the compile-time blueprint",
          "A class is the type blueprint or template, while an object is a concrete runtime instance of that class",
          "Class and object are exact synonyms in C++",
          "An object can only exist if declared as a global variable"
        ],
        "correctIndex": 1,
        "explanation": "The class defines the structure and behavior (blueprint); an object is an allocated instance with real data."
      },
      {
        "id": "mcq-cpp-oop-intro-4",
        "question": "What syntax character must terminate every class declaration in C++?",
        "options": [
          "Colon (:)",
          "Period (.)",
          "Semicolon (;)",
          "Exclamation point (!)"
        ],
        "correctIndex": 2,
        "explanation": "C++ class declarations must end with a semicolon after the closing curly brace."
      },
      {
        "id": "mcq-cpp-oop-intro-5",
        "question": "True or False: In procedural programming, multiple functions can directly access and mutate global variables without restriction.",
        "options": [
          "True",
          "False"
        ],
        "correctIndex": 0,
        "explanation": "True. A core flaw of procedural architectures is unrestricted global data mutation, which OOP resolves through encapsulation."
      }
    ],
    "codingChallenge": {
      "title": "Employee Record Encapsulation",
      "difficulty": "Intermediate",
      "problem_statement": "Create an Employee class with private fields: id (int), name (string), and salary (double). Provide a constructor Employee(int id, string name, double salary) and a method printSummary() that prints 'Employee #<id>: <name>, Annual Salary: $<salary>'. In main(), instantiate an employee with id 101, name 'Elena Vance', salary 85000, and invoke printSummary().",
      "input_format": "No input provided.",
      "output_format": "One line: Employee #101: Elena Vance, Annual Salary: $85000",
      "constraints": "Follow clean C++ OOP conventions with proper access specifiers.",
      "starter_code": "#include <iostream>\n#include <string>\nusing namespace std;\n\n// Implement Employee class here\n\nint main() {\n    // Instantiate Employee and print summary\n    return 0;\n}",
      "expected_output": "Employee #101: Elena Vance, Annual Salary: $85000",
      "test_cases": [
        {
          "input": "",
          "expected_output": "Employee #101: Elena Vance, Annual Salary: $85000",
          "is_hidden": false
        }
      ]
    },
    "summary": [
      "OOP replaces detached procedural records with cohesive, self-contained objects.",
      "A class acts as the user-defined type blueprint, while an object is an active instantiated instance.",
      "The four pillars of OOP are Encapsulation, Abstraction, Inheritance, and Polymorphism.",
      "Data hiding via private access ensures that data invariants cannot be violated externally.",
      "C++ enforces class declarations with a closing semicolon: class X { ... };"
    ]
  },
  {
    "id": "top-cpp-oop-classes-objects",
    "number": 2,
    "numberDisplay": "02",
    "moduleId": "mod-cpp-oop-core",
    "moduleTitle": "Module 01: Object-Oriented C++ Architecture & Design",
    "title": "Classes and Objects",
    "slug": "classes-and-objects",
    "language": "cpp",
    "shortDescription": "Master class declarations, object instantiation, member access using the dot operator, memory layout of objects, and how multiple instances maintain isolated states.",
    "difficulty": "Intermediate",
    "estimatedMinutes": 35,
    "prerequisiteId": "top-cpp-oop-intro",
    "learningObjectives": [
      "Define classes with member variables (data members) and member functions (methods)",
      "Instantiate single and multiple objects on the stack and understand their memory footprints",
      "Use the dot operator (.) to inspect and mutate accessible class members",
      "Understand how the implicit this pointer resolves member function calls to the calling instance"
    ],
    "conceptExplanation": "### 1. What is a Class?\nA **class** in C++ is a user-defined blueprint or data type. It specifies:\n1. **Data Members** (State / Attributes): The variables that hold the object's properties.\n2. **Member Functions** (Behavior / Methods): The functions that operate upon those data members.\n\n### 2. What is an Object?\nAn **object** is an instantiated runtime occurrence of a class. When a class is defined, no memory is allocated for variables (except static members). When an object is declared, the compiler allocates a block of memory sized to hold the non-static data members of that class.\n\n### 3. Syntax of Class and Object Declaration\n```cpp\nclass ClassName {\npublic:\n    dataType member1;\n    void function1();\n};\n\nint main() {\n    ClassName obj1; // Object declaration on the stack\n}\n```\n\n### 4. Memory Allocation for Objects\n* **Data Members**: Each object maintains its own unique copy of all non-static data members. If `sizeof(int) = 4` and `Student` contains two `int`s, each `Student` object consumes at least 8 bytes of stack or heap memory.\n* **Member Functions**: Functions are compiled into executable machine code stored in the **Code / Text segment**. Member functions are **not** duplicated for each object! Instead, a single copy of the function code exists, and the compiler automatically passes a hidden pointer named `this` pointing to the specific calling object.\n\n### 5. Memory Diagram: Multiple Objects\n```\nStack Memory:\n+------------------------+\n| Student s1             |\n|   name: \"Jinesh\"       |  --> Memory Address: 0x7fff01\n|   age: 19              |\n+------------------------+\n| Student s2             |\n|   name: \"Aarav\"        |  --> Memory Address: 0x7fff20\n|   age: 21              |\n+------------------------+\nShared Code Segment:\n+------------------------------------------------------+\n| void Student::display() { ... cout << name ... }    |\n+------------------------------------------------------+\n```\n\n### 6. The `this` Pointer Introduction\nInside any non-static member function, the keyword `this` is an implicit pointer to the object that invoked the method:\n```cpp\nvoid display() {\n    cout << this->name << \" \" << this->age << endl;\n}\n```",
    "simpleExample": {
      "code": "#include <iostream>\nusing namespace std;\n\nclass LightBulb {\npublic:\n    bool isOn;\n\n    void toggle() {\n        isOn = !isOn;\n    }\n};\n\nint main() {\n    LightBulb b1;\n    b1.isOn = false;\n    b1.toggle();\n    cout << \"Bulb is: \" << (b1.isOn ? \"ON\" : \"OFF\") << endl;\n    return 0;\n}",
      "explanation": "b1 is an object of class LightBulb. Member access uses the dot operator b1.isOn and b1.toggle()."
    },
    "syntax": "// Declaring and Accessing Class Members\nclass TypeName {\npublic:\n    type memberVar;\n    returnType memberFunc(params);\n};\n\nTypeName instanceName;\ninstanceName.memberVar = value;\ninstanceName.memberFunc(arguments);",
    "codeExample": "#include <iostream>\nusing namespace std;\n\nclass Student {\npublic:\n    string name;\n    int age;\n\n    void display() {\n        cout << name << \" \" << age << endl;\n    }\n};\n\nint main() {\n    Student s1;\n    s1.name = \"Jinesh\";\n    s1.age = 19;\n\n    s1.display();\n\n    return 0;\n}",
    "expectedOutput": "Jinesh 19",
    "stepByStep": [
      "1. The compiler parses class Student, defining two public data members (string name, int age) and one member function (display).",
      "2. In main(), Student s1 allocates stack memory for a string object and an integer.",
      "3. Statement s1.name = 'Jinesh' stores the string in s1's internal buffer.",
      "4. Statement s1.age = 19 assigns the integer value 19 to s1's age offset.",
      "5. The function call s1.display() invokes Student::display with this pointing to the address of s1 (&s1).",
      "6. The display function executes, printing s1.name and s1.age separated by a space and followed by a newline.",
      "7. The program reaches return 0 and destroys s1 upon exiting main scope."
    ],
    "commonMistakes": [
      {
        "mistake": "Using the arrow operator (->) on stack-allocated objects instead of the dot (.) operator",
        "codeSnippet": "Student s1; s1->display(); // Error: base operand of -> has non-pointer type",
        "correction": "Use . for direct objects (s1.display()) and -> for pointers (ptr->display()).",
        "explanation": "The dot operator accesses members of direct instances; the arrow operator dereferences pointers."
      },
      {
        "mistake": "Assuming member functions are duplicated in memory for each instantiated object",
        "codeSnippet": "// Misconception: 1000 Student objects duplicate 1000 copies of display() code",
        "correction": "Recognize that member functions live exclusively in the code text segment; only member variables consume instance memory.",
        "explanation": "C++ optimizes memory by sharing one copy of machine instructions across all instances via the hidden this pointer."
      },
      {
        "mistake": "Accessing uninitialized member variables in user-declared objects",
        "codeSnippet": "Student s; cout << s.age; // Undefined behavior: age contains garbage data",
        "correction": "Always initialize data members via constructors or in-class default initializers.",
        "explanation": "Fundamental types like int, double, and pointers declared on the stack are not zero-initialized by default in C++."
      }
    ],
    "realWorldExample": {
      "scenario": "Game Engine Entity Transform State",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Transform2D {\npublic:\n    float x;\n    float y;\n\n    void translate(float dx, float dy) {\n        x += dx;\n        y += dy;\n    }\n\n    void printCoordinates() const {\n        cout << \"Entity Position: (\" << x << \", \" << y << \")\" << endl;\n    }\n};\n\nint main() {\n    Transform2D player;\n    player.x = 100.0f;\n    player.y = 50.0f;\n\n    player.translate(15.5f, -10.0f);\n    player.printCoordinates();\n    return 0;\n}",
      "explanation": "Game engines instantiate thousands of Transform components per frame, updating their individual coordinate states via shared translate methods."
    },
    "practice": {
      "prompt": "Write a C++ program defining a class Rectangle with public double members width and height. Add public methods area() that returns width * height, and perimeter() that returns 2 * (width + height). In main(), instantiate a Rectangle r1 with width = 7.0 and height = 4.0, then print the area and perimeter formatted as 'Area: <area> | Perimeter: <perimeter>'.",
      "starterCode": "#include <iostream>\nusing namespace std;\n\n// Define Rectangle class here\n\nint main() {\n    // Instantiate r1, set dimensions, and print Area and Perimeter\n    return 0;\n}",
      "expectedOutputMatcher": "Area: 28 | Perimeter: 22",
      "hint": "Declare class Rectangle { public: double width; double height; double area() { return width * height; } double perimeter() { return 2 * (width + height); } };",
      "solution": "#include <iostream>\nusing namespace std;\n\nclass Rectangle {\npublic:\n    double width;\n    double height;\n\n    double area() const {\n        return width * height;\n    }\n\n    double perimeter() const {\n        return 2 * (width + height);\n    }\n};\n\nint main() {\n    Rectangle r1;\n    r1.width = 7.0;\n    r1.height = 4.0;\n\n    cout << \"Area: \" << r1.area() << \" | Perimeter: \" << r1.perimeter() << endl;\n    return 0;\n}"
    },
    "quiz": [
      {
        "id": "mcq-cpp-oop-class-1",
        "question": "When a C++ class is defined without creating any objects, how much data memory is allocated for its non-static member variables?",
        "options": [
          "4 bytes per variable",
          "0 bytes (memory is only allocated when an object is instantiated)",
          "Depends on the compiler optimization flag",
          "32 bytes default allocation"
        ],
        "correctIndex": 1,
        "explanation": "A class definition is merely a type specification. Memory is allocated only when an instance (object) is instantiated."
      },
      {
        "id": "mcq-cpp-oop-class-2",
        "question": "Which operator is used to access members of an object directly in C++?",
        "options": [
          "Arrow operator (->)",
          "Dot operator (.)",
          "Scope resolution operator (::)",
          "Tilde operator (~)"
        ],
        "correctIndex": 1,
        "explanation": "The dot operator (.) is used to access member variables and methods of a direct object reference."
      },
      {
        "id": "mcq-cpp-oop-class-3",
        "question": "What is the purpose of the implicit 'this' pointer inside a C++ member function?",
        "options": [
          "It points to the next class in the inheritance chain",
          "It points to the address of the specific object instance that called the member function",
          "It points to the heap memory manager",
          "It deletes the object when the function returns"
        ],
        "correctIndex": 1,
        "explanation": "this is a const pointer holding the address of the calling object, allowing the function to bind to that instance's data."
      },
      {
        "id": "mcq-cpp-oop-class-4",
        "question": "If two objects s1 and s2 of class Student are created, how many copies of the member function display() exist in memory?",
        "options": [
          "Two copies, one inside each object",
          "Only one copy, residing in the code/text segment and shared across all instances",
          "Zero copies, functions are always inlined",
          "It varies based on whether the object is in heap or stack"
        ],
        "correctIndex": 1,
        "explanation": "Member functions are stored once in the executable code segment; individual objects only allocate memory for their data members."
      },
      {
        "id": "mcq-cpp-oop-class-5",
        "question": "What will be the output of executing:\nStudent s1;\ns1.name = 'Jinesh';\ns1.age = 19;\ns1.display();\ngiven the lesson example?",
        "options": [
          "Jinesh",
          "19",
          "Jinesh 19",
          "Compilation Error"
        ],
        "correctIndex": 2,
        "explanation": "s1.display() outputs name followed by space and age: 'Jinesh 19'."
      }
    ],
    "codingChallenge": {
      "title": "Car Dashboard Monitor",
      "difficulty": "Intermediate",
      "problem_statement": "Define a class Car with public members: brand (string), model (string), and speed (int). Add a method accelerate(int amount) that increases speed by amount, and a method display() that prints '<brand> <model> running at <speed> km/h'. In main(), create a Car c1, set brand to 'Porsche', model to '911', initial speed to 60, accelerate by 45, and call display().",
      "input_format": "No input provided.",
      "output_format": "One line: Porsche 911 running at 105 km/h",
      "constraints": "Use standard class syntax and member function invocations.",
      "starter_code": "#include <iostream>\n#include <string>\nusing namespace std;\n\n// Define class Car here\n\nint main() {\n    // Instantiate Car, set members, accelerate and display\n    return 0;\n}",
      "expected_output": "Porsche 911 running at 105 km/h",
      "test_cases": [
        {
          "input": "",
          "expected_output": "Porsche 911 running at 105 km/h",
          "is_hidden": false
        }
      ]
    },
    "summary": [
      "A class is a user-defined blueprint containing data members and member functions.",
      "An object is an active instance of a class allocated in memory.",
      "The dot operator (.) provides access to accessible members of an object.",
      "Non-static member functions are shared in the code segment and access object state via the implicit this pointer.",
      "Multiple objects of the same class maintain independent, isolated states in memory."
    ]
  },
  {
    "id": "top-cpp-oop-access-specifiers",
    "number": 3,
    "numberDisplay": "03",
    "moduleId": "mod-cpp-oop-core",
    "moduleTitle": "Module 01: Object-Oriented C++ Architecture & Design",
    "title": "Access Specifiers",
    "slug": "access-specifiers",
    "language": "cpp",
    "shortDescription": "Explore public, private, and protected access boundaries, data hiding, default access in class vs struct, and why direct mutation of sensitive data causes security failures.",
    "difficulty": "Intermediate",
    "estimatedMinutes": 30,
    "prerequisiteId": "top-cpp-oop-classes-objects",
    "learningObjectives": [
      "Differentiate between public, private, and protected access specifiers in C++",
      "Understand default access control rules in C++ classes versus C++ structs",
      "Implement data hiding to prevent corruption of internal states",
      "Analyze why directly modifying sensitive fields like bank balances breaks system integrity"
    ],
    "conceptExplanation": "### 1. Access Specifiers in C++\nAccess specifiers control the visibility and accessibility of class members from outside the class boundary:\n* **`public`**: Members can be accessed and modified from **anywhere** in the program where the object is visible.\n* **`private`**: Members can **only** be accessed from within member functions (and friends) of the class itself. External code cannot read or modify them directly.\n* **`protected`**: Members cannot be accessed from arbitrary external code, but **can** be accessed by derived (child) classes through inheritance.\n\n### 2. Comparison Table: Member Accessibility\n| Access Specifier | Accessible Inside Same Class? | Accessible in Derived Classes? | Accessible by External World? |\n| :--- | :--- | :--- | :--- |\n| **`public`** | Yes | Yes | **Yes** |\n| **`protected`** | Yes | **Yes** | **No** |\n| **`private`** | Yes | **No** | **No** |\n\n### 3. Default Access: Class vs Struct in C++\nIn C++, the only fundamental distinction between a `class` and a `struct` is their default access level:\n* In a **`class`**, members default to **`private`**.\n* In a **`struct`**, members default to **`public`**.\n* Furthermore, inheritance defaults to `private` for classes and `public` for structs.\n\n```cpp\nclass MyClass {\n    int secret; // Defaults to PRIVATE\n};\n\nstruct MyStruct {\n    int visible; // Defaults to PUBLIC\n};\n```\n\n### 4. Why Is Data Hiding Essential?\nConsider a `BankAccount` with a `public double balance`. Any external module could write:\n```cpp\naccount.balance = -1000000.0; // Negative balance bypass!\naccount.balance += 50000.0;   // Injected funds without audit log!\n```\nBy marking `balance` as **`private`**, modifications can only happen through validated member functions (`deposit()` and `withdraw()`) that check business rules and maintain data integrity.",
    "simpleExample": {
      "code": "#include <iostream>\nusing namespace std;\n\nclass Vault {\nprivate:\n    int passcode;\n\npublic:\n    void setPasscode(int code) {\n        if (code >= 1000 && code <= 9999) {\n            passcode = code;\n            cout << \"Passcode successfully configured!\" << endl;\n        } else {\n            cout << \"Invalid passcode range!\" << endl;\n        }\n    }\n};\n\nint main() {\n    Vault v;\n    // v.passcode = 1234; // COMPILER ERROR: 'passcode' is private\n    v.setPasscode(4821);\n    return 0;\n}",
      "explanation": "Directly modifying v.passcode is prohibited by the compiler. Changes must pass through setPasscode validation."
    },
    "syntax": "class BankAccount {\nprivate:\n    // Sensitive data hidden from outside\n    double balance;\n\nprotected:\n    // Accessible by derived account tiers\n    string accountType;\n\npublic:\n    // Controlled public interface\n    void deposit(double amount);\n    double getBalance() const;\n};",
    "codeExample": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass BankAccount {\nprivate:\n    string accountNumber;\n    double balance;\n\npublic:\n    BankAccount(string accNum, double initialDeposit) {\n        accountNumber = accNum;\n        balance = (initialDeposit >= 0) ? initialDeposit : 0.0;\n    }\n\n    void deposit(double amount) {\n        if (amount > 0) {\n            balance += amount;\n            cout << \"Deposited: $\" << amount << \" | New Balance: $\" << balance << endl;\n        } else {\n            cout << \"Invalid deposit amount!\" << endl;\n        }\n    }\n\n    bool withdraw(double amount) {\n        if (amount > 0 && amount <= balance) {\n            balance -= amount;\n            cout << \"Withdrew: $\" << amount << \" | Remaining Balance: $\" << balance << endl;\n            return true;\n        } else {\n            cout << \"Withdrawal denied: Insufficient funds or invalid amount.\" << endl;\n            return false;\n        }\n    }\n\n    double getBalance() const {\n        return balance;\n    }\n};\n\nint main() {\n    BankAccount myAcc(\"ACC-98421\", 500.0);\n\n    myAcc.deposit(250.0);\n    myAcc.withdraw(100.0);\n    myAcc.withdraw(1000.0); // Denied by validation\n\n    cout << \"Final Verified Balance: $\" << myAcc.getBalance() << endl;\n\n    return 0;\n}",
    "expectedOutput": "Deposited: $250 | New Balance: $750\nWithdrew: $100 | Remaining Balance: $650\nWithdrawal denied: Insufficient funds or invalid amount.\nFinal Verified Balance: $650",
    "stepByStep": [
      "1. BankAccount defines private fields accountNumber and balance; external code cannot directly touch these variables.",
      "2. In main(), myAcc is initialized with initial balance 500.0.",
      "3. myAcc.deposit(250.0) checks (250.0 > 0), adds 250.0 to balance (750.0), and prints the new balance.",
      "4. myAcc.withdraw(100.0) checks (100.0 <= 750.0), subtracts 100.0 (balance is 650.0), and prints confirmation.",
      "5. myAcc.withdraw(1000.0) fails the condition (1000.0 <= 650.0), rejecting the transaction and printing a warning.",
      "6. myAcc.getBalance() provides safe, read-only access to the internal balance.",
      "7. Attempting myAcc.balance = 999999 would trigger a compile-time access violation error."
    ],
    "commonMistakes": [
      {
        "mistake": "Assuming struct in C++ cannot have member functions or private sections",
        "codeSnippet": "// Misconception: C++ structs can only contain plain old data like in C",
        "correction": "Recognize that C++ structs can have constructors, private sections, and methods just like classes.",
        "explanation": "In C++, class and struct are identical except for default access and inheritance."
      },
      {
        "mistake": "Returning a non-const reference to a private member variable from a getter",
        "codeSnippet": "double& getBalance() { return balance; } // External code: acc.getBalance() = -500;",
        "correction": "Return by value (double getBalance() const) or by const reference.",
        "explanation": "Returning a mutable reference to a private member bypasses encapsulation and grants external callers write access."
      },
      {
        "mistake": "Confusing protected with private",
        "codeSnippet": "// Misconception: protected members are accessible from arbitrary main() code",
        "correction": "Protected members are accessible only within the class hierarchy (base and derived classes).",
        "explanation": "External functions or unrelated classes cannot access protected members."
      }
    ],
    "realWorldExample": {
      "scenario": "Healthcare Patient Medical Record Access Security",
      "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass PatientRecord {\nprivate:\n    string ssn;\n    string medicalDiagnosis;\n\npublic:\n    PatientRecord(string id, string diag) : ssn(id), medicalDiagnosis(diag) {}\n\n    // Public sanitized interface: hides raw SSN\n    string getMaskedSSN() const {\n        return \"***-**-\" + ssn.substr(ssn.length() - 4);\n    }\n};\n\nint main() {\n    PatientRecord p(\"123-45-6789\", \"Hypertension Type II\");\n    cout << \"Patient ID: \" << p.getMaskedSSN() << endl;\n    return 0;\n}",
      "explanation": "HIPAA healthcare compliance requires strict data hiding. Raw identifiers remain private while sanitized public getters expose only masked strings."
    },
    "practice": {
      "prompt": "Create a class Thermostat with a private double field temperature. Provide a public constructor setting temperature to 20.0, a getter getTemperature(), and a setter setTemperature(double t) that only allows temperatures between 10.0 and 35.0 inclusive. If outside this range, print 'Temperature out of range!'. In main(), set temperature to 24.5, print it via getTemperature(), then attempt to set 50.0.",
      "starterCode": "#include <iostream>\nusing namespace std;\n\n// Define class Thermostat\n\nint main() {\n    // Instantiate thermostat, test valid and invalid temperatures\n    return 0;\n}",
      "expectedOutputMatcher": "Current Temp: 24.5 C\nTemperature out of range!",
      "hint": "Check if (t >= 10.0 && t <= 35.0) in setTemperature().",
      "solution": "#include <iostream>\nusing namespace std;\n\nclass Thermostat {\nprivate:\n    double temperature;\n\npublic:\n    Thermostat() : temperature(20.0) {}\n\n    double getTemperature() const {\n        return temperature;\n    }\n\n    void setTemperature(double t) {\n        if (t >= 10.0 && t <= 35.0) {\n            temperature = t;\n        } else {\n            cout << \"Temperature out of range!\" << endl;\n        }\n    }\n};\n\nint main() {\n    Thermostat t;\n    t.setTemperature(24.5);\n    cout << \"Current Temp: \" << t.getTemperature() << \" C\" << endl;\n    t.setTemperature(50.0);\n    return 0;\n}"
    },
    "quiz": [
      {
        "id": "mcq-cpp-oop-access-1",
        "question": "What is the default access specifier for members of a C++ class if none is explicitly specified?",
        "options": [
          "public",
          "private",
          "protected",
          "package-private"
        ],
        "correctIndex": 1,
        "explanation": "In a C++ class, members default to private until an access label like public: is encountered."
      },
      {
        "id": "mcq-cpp-oop-access-2",
        "question": "What is the default access specifier for members of a C++ struct?",
        "options": [
          "public",
          "private",
          "protected",
          "internal"
        ],
        "correctIndex": 0,
        "explanation": "In a C++ struct, members default to public to preserve backward compatibility with C."
      },
      {
        "id": "mcq-cpp-oop-access-3",
        "question": "Which access specifier allows member access to derived (child) classes while blocking access from external code?",
        "options": [
          "private",
          "public",
          "protected",
          "virtual"
        ],
        "correctIndex": 2,
        "explanation": "protected members are accessible within the base and derived classes, but inaccessible to arbitrary outside callers."
      },
      {
        "id": "mcq-cpp-oop-access-4",
        "question": "What happens at compile time if main() attempts to directly access a private variable obj.balance?",
        "options": [
          "The compiler emits a compilation error: member is inaccessible",
          "It compiles with a warning and reads 0 at runtime",
          "It throws a runtime AccessViolationException",
          "It automatically converts the variable to public"
        ],
        "correctIndex": 0,
        "explanation": "C++ enforces access specifiers statically at compile time; accessing private members causes a fatal compilation error."
      },
      {
        "id": "mcq-cpp-oop-access-5",
        "question": "Why should sensitive fields like balance be kept private rather than public?",
        "options": [
          "Private variables take less RAM than public variables",
          "Private variables prevent uncontrolled external mutations and maintain object invariants through validation",
          "Public variables cannot be printed with cout",
          "C++ compilers disallow mathematical operations on public variables"
        ],
        "correctIndex": 1,
        "explanation": "Data hiding prevents external code from putting the object into an illegal or corrupt state."
      }
    ],
    "codingChallenge": {
      "title": "Secure User Password Profile",
      "difficulty": "Intermediate",
      "problem_statement": "Implement a UserProfile class with private members: username (string) and passwordLength (int). In the public constructor UserProfile(string u, string password), set username and set passwordLength to the length of the string password (do NOT store the raw password!). Provide public methods getUsername() and getPasswordLength(), and a method verifyPasswordLength(int expected) that returns true if passwordLength == expected. In main(), create user 'admin_jinesh' with password 'SuperSecretKey99', and output 'User: <username>, Password Length: <length>'.",
      "input_format": "No input provided.",
      "output_format": "One line: User: admin_jinesh, Password Length: 16",
      "constraints": "The raw password must not be stored as a member variable.",
      "starter_code": "#include <iostream>\n#include <string>\nusing namespace std;\n\n// Implement UserProfile class\n\nint main() {\n    // Instantiate UserProfile and print output\n    return 0;\n}",
      "expected_output": "User: admin_jinesh, Password Length: 16",
      "test_cases": [
        {
          "input": "",
          "expected_output": "User: admin_jinesh, Password Length: 16",
          "is_hidden": false
        }
      ]
    },
    "summary": [
      "public members can be accessed anywhere; private members are restricted to the defining class.",
      "protected members are accessible within class inheritance hierarchies but hidden externally.",
      "In C++, class members default to private, while struct members default to public.",
      "Data hiding protects internal object invariants from illegal external state changes.",
      "Access specifiers are validated at compile time, eliminating runtime security overhead."
    ]
  },
  {
    "id": "top-cpp-oop-constructors",
    "number": 4,
    "numberDisplay": "04",
    "moduleId": "mod-cpp-oop-core",
    "moduleTitle": "Module 01: Object-Oriented C++ Architecture & Design",
    "title": "Constructors",
    "slug": "constructors",
    "language": "cpp",
    "shortDescription": "Master object lifecycle initialization: default constructors, parameterized constructors, constructor overloading, copy constructors, member initializer lists, and execution sequence.",
    "difficulty": "Intermediate",
    "estimatedMinutes": 40,
    "prerequisiteId": "top-cpp-oop-access-specifiers",
    "learningObjectives": [
      "Understand the role of constructors in establishing valid object states at creation time",
      "Implement default, parameterized, and copy constructors",
      "Use member initializer lists for direct and efficient member initialization",
      "Understand constructor execution sequence, delegating constructors, and common pitfalls"
    ],
    "conceptExplanation": "### 1. What is a Constructor?\nA **constructor** is a special member function that is automatically invoked whenever a new instance of a class is created. Its primary responsibility is to initialize the object's data members and acquire any resources required for the object to begin its lifecycle in a valid state.\n\n### 2. Constructor Naming and Rules\n1. **Name**: The constructor must have the **exact same name** as the enclosing class.\n2. **Return Type**: Constructors have **no return type**—not even `void`.\n3. **Automatic Invocation**: It is called automatically by the compiler during object instantiation; you cannot call it on an already existing object as a regular function.\n4. **Default Constructor**: If no constructor is written, the compiler generates a default synthesized constructor. However, if *any* parameterized constructor is written, the compiler-generated default constructor is suppressed unless explicitly declared.\n\n### 3. Types of Constructors\n* **Default Constructor**: Takes no arguments (or all arguments have defaults).\n* **Parameterized Constructor**: Takes arguments to initialize member variables to user-specified values.\n* **Overloaded Constructors**: Defining multiple constructors with different parameter signatures.\n* **Copy Constructor**: Initializes a new object as a copy of an existing object of the same class (`ClassName(const ClassName& other)`).\n* **Delegating Constructor (C++11)**: A constructor that calls another constructor within the same class using the member initializer list.\n\n### 4. Member Initializer Lists\nIn C++, initializing members inside the constructor body via assignment (`balance = b;`) performs **default construction followed by assignment**. \nA **member initializer list** initializes members directly during memory allocation:\n```cpp\nStudent(string n, int a) : name(n), age(a) {} // Direct initialization\n```\nAdvantages:\n1. **Performance**: Avoids temporary object creation and redundant assignments.\n2. **Mandatory for `const` and references**: Members declared `const` or reference types (`&`) **must** be initialized via member initializer list because they cannot be assigned after construction.\n\n### 5. Order of Constructor Execution\n1. Base class constructors (if inherited) execute first.\n2. Member variables execute in the **order they are declared in the class definition**, NOT the order in the initializer list!\n3. The body of the constructor executes last.",
    "simpleExample": {
      "code": "#include <iostream>\nusing namespace std;\n\nclass Point {\npublic:\n    int x;\n    int y;\n\n    // Default constructor\n    Point() : x(0), y(0) {}\n\n    // Parameterized constructor\n    Point(int px, int py) : x(px), y(py) {}\n};\n\nint main() {\n    Point origin;        // Calls default constructor\n    Point target(10, 20); // Calls parameterized constructor\n\n    cout << \"Origin: (\" << origin.x << \", \" << origin.y << \")\" << endl;\n    cout << \"Target: (\" << target.x << \", \" << target.y << \")\" << endl;\n    return 0;\n}",
      "explanation": "Point origin invokes the default constructor (0,0), while Point target(10,20) passes arguments to the parameterized constructor."
    },
    "syntax": "class Student {\nprivate:\n    string name;\n    int age;\n\npublic:\n    // Default constructor with member initializer list\n    Student() : name(\"Unknown\"), age(0) {}\n\n    // Parameterized constructor\n    Student(string n, int a) : name(n), age(a) {}\n};",
    "codeExample": "#include <iostream>\nusing namespace std;\n\nclass Student {\nprivate:\n    string name;\n    int age;\n\npublic:\n    Student() : name(\"Unknown\"), age(0) {}\n\n    Student(string n, int a) : name(n), age(a) {}\n\n    void display() {\n        cout << name << \" \" << age << endl;\n    }\n};\n\nint main() {\n    Student s1;\n    Student s2(\"Jinesh\", 19);\n\n    s1.display();\n    s2.display();\n\n    return 0;\n}",
    "expectedOutput": "Unknown 0\nJinesh 19",
    "stepByStep": [
      "1. Student s1 invokes the default constructor Student() : name('Unknown'), age(0).",
      "2. Memory for s1 is initialized with string 'Unknown' and integer 0.",
      "3. Student s2('Jinesh', 19) invokes the parameterized constructor.",
      "4. Member initializer list binds name to 'Jinesh' and age to 19 directly.",
      "5. s1.display() outputs 'Unknown 0'.",
      "6. s2.display() outputs 'Jinesh 19'.",
      "7. Both objects leave scope at the termination of main() and their resources are reclaimed."
    ],
    "commonMistakes": [
      {
        "mistake": "Adding empty parentheses when declaring an object with the default constructor",
        "codeSnippet": "Student s1(); // The Most Vexing Parse in C++!",
        "correction": "Write Student s1; without parentheses.",
        "explanation": "Student s1(); is interpreted by the C++ compiler as a function declaration named s1 returning Student, not an object instantiation."
      },
      {
        "mistake": "Assuming member initializer list evaluates in the order written in the constructor",
        "codeSnippet": "class Node { int y; int x; public: Node(int val) : x(val), y(x) {} };",
        "correction": "Always declare member variables in the class in the exact order you want them initialized.",
        "explanation": "Members are always initialized in the order of their class declaration. In the buggy code above, y is initialized before x has a value!"
      },
      {
        "mistake": "Trying to assign to const member variables inside the constructor body",
        "codeSnippet": "class X { const int id; X(int i) { id = i; } }; // Error: assignment of read-only member",
        "correction": "Initialize const members in the initializer list: X(int i) : id(i) {}",
        "explanation": "const variables cannot be assigned; they can only be directly initialized during memory binding."
      }
    ],
    "realWorldExample": {
      "scenario": "Database Connection Pool Configuration Lifecycle",
      "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass DbConnection {\nprivate:\n    string host;\n    int port;\n    int timeoutMs;\n\npublic:\n    // Delegating constructor: defaults timeout to 3000ms\n    DbConnection(string h, int p) : DbConnection(h, p, 3000) {}\n\n    DbConnection(string h, int p, int timeout)\n        : host(h), port(p), timeoutMs(timeout) {\n        cout << \"[DB Client] Connected to \" << host << \":\" << port \n             << \" (Timeout: \" << timeoutMs << \"ms)\" << endl;\n    }\n};\n\nint main() {\n    DbConnection conn1(\"db.prod.internal\", 5432);\n    DbConnection conn2(\"redis.cache.internal\", 6379, 1500);\n    return 0;\n}",
      "explanation": "Production connection managers use delegating constructors to supply authoritative default timeouts without duplicating socket handshake code."
    },
    "practice": {
      "prompt": "Write a C++ class Time with private members hours (int) and minutes (int). Implement 3 constructors: (1) Default constructor setting 0 hours, 0 minutes. (2) Constructor taking hours, setting minutes to 0. (3) Parameterized constructor taking both hours and minutes. Add display() printing '<hours>h <minutes>m'. In main(), instantiate t1 using default, t2 with 5 hours, and t3 with 10 hours and 45 minutes, then call display() on each.",
      "starterCode": "#include <iostream>\nusing namespace std;\n\n// Implement Time class with 3 overloaded constructors\n\nint main() {\n    // Instantiate t1, t2, t3 and call display()\n    return 0;\n}",
      "expectedOutputMatcher": "0h 0m\n5h 0m\n10h 45m",
      "hint": "Use initializer lists: Time() : hours(0), minutes(0) {} | Time(int h) : hours(h), minutes(0) {} | Time(int h, int m) : hours(h), minutes(m) {}",
      "solution": "#include <iostream>\nusing namespace std;\n\nclass Time {\nprivate:\n    int hours;\n    int minutes;\n\npublic:\n    Time() : hours(0), minutes(0) {}\n    Time(int h) : hours(h), minutes(0) {}\n    Time(int h, int m) : hours(h), minutes(m) {}\n\n    void display() const {\n        cout << hours << \"h \" << minutes << \"m\" << endl;\n    }\n};\n\nint main() {\n    Time t1;\n    Time t2(5);\n    Time t3(10, 45);\n\n    t1.display();\n    t2.display();\n    t3.display();\n    return 0;\n}"
    },
    "quiz": [
      {
        "id": "mcq-cpp-oop-ctor-1",
        "question": "What return type does a C++ constructor have?",
        "options": [
          "void",
          "int (status code)",
          "No return type at all",
          "Pointer to the created object"
        ],
        "correctIndex": 2,
        "explanation": "Constructors in C++ have no return type, not even void."
      },
      {
        "id": "mcq-cpp-oop-ctor-2",
        "question": "What is the 'Most Vexing Parse' in C++ when trying to invoke a default constructor?",
        "options": [
          "Writing Student s1(); which is parsed as a function declaration rather than object instantiation",
          "Omitting the semicolon at the end of main",
          "Naming the constructor lowercase",
          "Using double quotes instead of single quotes"
        ],
        "correctIndex": 0,
        "explanation": "Student s1(); is interpreted as a function prototype declaring function s1 taking no arguments and returning Student."
      },
      {
        "id": "mcq-cpp-oop-ctor-3",
        "question": "Why are member initializer lists preferred over assignment inside the constructor body?",
        "options": [
          "Initializer lists allow members to be directly initialized rather than constructed then overwritten",
          "Initializer lists are mandatory for const members and references",
          "Initializer lists avoid redundant temporary object allocations",
          "All of the above"
        ],
        "correctIndex": 3,
        "explanation": "Member initializer lists provide direct initialization, avoid redundant copies, and are mandatory for const and reference members."
      },
      {
        "id": "mcq-cpp-oop-ctor-4",
        "question": "In what order are member variables initialized during constructor execution?",
        "options": [
          "In the order they are listed in the member initializer list",
          "In alphabetical order",
          "In the order they are declared in the class definition",
          "In reverse order of declaration"
        ],
        "correctIndex": 2,
        "explanation": "C++ standards mandate that member variables are initialized strictly in the order they are declared within the class body."
      },
      {
        "id": "mcq-cpp-oop-ctor-5",
        "question": "What will be printed by the code:\nStudent s1;\nStudent s2('Jinesh', 19);\ns1.display(); s2.display();\nfrom the lesson example?",
        "options": [
          "Unknown 0 followed by Jinesh 19",
          "Jinesh 19 followed by Unknown 0",
          "0 0 followed by Jinesh 19",
          "Compilation Error"
        ],
        "correctIndex": 0,
        "explanation": "s1 uses default values 'Unknown' and 0, while s2 receives 'Jinesh' and 19."
      }
    ],
    "codingChallenge": {
      "title": "GPS Waypoint Initializer",
      "difficulty": "Intermediate",
      "problem_statement": "Define a class Waypoint with private members: name (string), latitude (double), and longitude (double). Provide: (1) Default constructor setting name='Home', latitude=0.0, longitude=0.0. (2) Parameterized constructor setting all 3 fields via member initializer list. (3) Method printCoordinates() printing 'Waypoint: <name> | Location: (<latitude>, <longitude>)'. In main(), create w1 with default constructor and w2 with ('Base Camp', 27.9881, 86.9250), then call printCoordinates() on both.",
      "input_format": "No input provided.",
      "output_format": "Two lines:\nWaypoint: Home | Location: (0, 0)\nWaypoint: Base Camp | Location: (27.9881, 86.925)",
      "constraints": "Use member initializer lists for all constructors.",
      "starter_code": "#include <iostream>\n#include <string>\nusing namespace std;\n\n// Implement Waypoint class\n\nint main() {\n    // Instantiate w1 and w2 and print coordinates\n    return 0;\n}",
      "expected_output": "Waypoint: Home | Location: (0, 0)\nWaypoint: Base Camp | Location: (27.9881, 86.925)",
      "test_cases": [
        {
          "input": "",
          "expected_output": "Waypoint: Home | Location: (0, 0)\nWaypoint: Base Camp | Location: (27.9881, 86.925)",
          "is_hidden": false
        }
      ]
    },
    "summary": [
      "Constructors are invoked automatically upon object creation to establish valid initial states.",
      "Constructors share the exact name of the class and have no return type.",
      "Member initializer lists provide direct, high-performance initialization and are required for const/references.",
      "Members initialize in the order of class declaration, irrespective of initializer list order.",
      "Writing Student s(); is parsed as a function declaration (Most Vexing Parse); use Student s; instead."
    ]
  },
  {
    "id": "top-cpp-oop-destructors-lifecycle",
    "number": 5,
    "numberDisplay": "05",
    "moduleId": "mod-cpp-oop-core",
    "moduleTitle": "Module 01: Object-Oriented C++ Architecture & Design",
    "title": "Destructors and Object Lifecycle",
    "slug": "destructors-and-object-lifecycle",
    "language": "cpp",
    "shortDescription": "Master object lifecycle termination: destructor syntax (~), scope-based deterministic destruction, dynamic heap objects with new/delete, and the RAII idiom.",
    "difficulty": "Intermediate",
    "estimatedMinutes": 30,
    "prerequisiteId": "top-cpp-oop-constructors",
    "learningObjectives": [
      "Understand the role of destructors in reclaiming dynamically acquired system resources",
      "Master destructor syntax (~ClassName) and invocation guarantees",
      "Trace deterministic destruction order for automatic stack objects vs dynamic objects",
      "Understand Resource Acquisition Is Initialization (RAII) and leak prevention"
    ],
    "conceptExplanation": "### 1. What is a Destructor?\nA **destructor** is a special member function that is automatically invoked when an object's lifetime ends—such as when a stack object leaves its enclosing block scope `{}`, or when a dynamically allocated object is explicitly deleted with `delete`. Its primary role is to release resources (dynamic heap memory, file handles, database connections, mutex locks) acquired during the object's lifetime.\n\n### 2. Destructor Syntax and Rules\n1. **Name**: The class name preceded by a tilde (`~ClassName()`).\n2. **Parameters**: Destructors **take no parameters** and have **no return type**.\n3. **Overloading**: Because they take no parameters, destructors **cannot be overloaded**. A class has exactly **one** destructor.\n4. **No Arguments**: You cannot pass values to a destructor.\n\n### 3. Constructor vs Destructor Comparison\n| Feature | Constructor | Destructor |\n| :--- | :--- | :--- |\n| **Purpose** | Initializes object state and acquires resources | Cleans up resources and releases memory |\n| **Syntax** | `ClassName(...)` | `~ClassName()` |\n| **Parameters** | Can accept parameters | Cannot accept parameters |\n| **Overloading** | Fully overloadable | Cannot be overloaded |\n| **Execution Order** | Base classes first, then derived classes | Derived classes first, then base classes |\n| **When Invoked** | When object is created (`new` or stack allocation) | When object leaves scope or is destroyed via `delete` |\n\n### 4. Automatic vs Dynamic Object Lifetimes\n* **Automatic (Stack) Objects**: Destroyed **automatically** in **reverse order of creation** as soon as control leaves the block scope `{}`.\n* **Dynamic (Heap) Objects**: Allocated with `new`. Their destructors are **never called automatically** by exiting scope! They remain in memory leaking until `delete` is explicitly executed.\n\n### 5. Introduction to RAII (Resource Acquisition Is Initialization)\nRAII is C++'s most celebrated idiom:\n* Acquire a resource in the constructor.\n* Release the resource in the destructor.\nBecause stack destruction is guaranteed by C++ exception handling and scope exit, wrapping raw resources in RAII classes ensures zero resource leaks!",
    "simpleExample": {
      "code": "#include <iostream>\nusing namespace std;\n\nclass Tracer {\npublic:\n    string tag;\n\n    Tracer(string t) : tag(t) {\n        cout << \"Constructor: \" << tag << endl;\n    }\n\n    ~Tracer() {\n        cout << \"Destructor: \" << tag << endl;\n    }\n};\n\nint main() {\n    cout << \"Entering main scope\" << endl;\n    {\n        Tracer t1(\"Inner Scope Block\");\n    } // t1 destroyed here immediately!\n    cout << \"Exited inner block\" << endl;\n    return 0;\n}",
      "explanation": "t1 leaves scope at the closing curly brace of the inner block, triggering its destructor deterministically."
    },
    "syntax": "class ResourceHolder {\nprivate:\n    int* dataBuffer;\n\npublic:\n    ResourceHolder(int size) {\n        dataBuffer = new int[size]; // Acquire\n    }\n\n    ~ResourceHolder() {\n        delete[] dataBuffer; // Release (RAII)\n    }\n};",
    "codeExample": "#include <iostream>\nusing namespace std;\n\nclass Entity {\nprivate:\n    int id;\n\npublic:\n    Entity(int identifier) : id(identifier) {\n        cout << \"Entity \" << id << \" created\" << endl;\n    }\n\n    ~Entity() {\n        cout << \"Entity \" << id << \" destroyed\" << endl;\n    }\n};\n\nint main() {\n    cout << \"--- Stack Scope Demo ---\" << endl;\n    Entity e1(1);\n    Entity e2(2);\n\n    cout << \"--- Dynamic Heap Demo ---\" << endl;\n    Entity* heapEntity = new Entity(3);\n    delete heapEntity; // Explicitly triggers destructor for entity 3\n\n    cout << \"--- End of main ---\" << endl;\n    return 0;\n}",
    "expectedOutput": "--- Stack Scope Demo ---\nEntity 1 created\nEntity 2 created\n--- Dynamic Heap Demo ---\nEntity 3 created\nEntity 3 destroyed\n--- End of main ---\nEntity 2 destroyed\nEntity 1 destroyed",
    "stepByStep": [
      "1. Entity e1(1) is allocated on the stack; prints 'Entity 1 created'.",
      "2. Entity e2(2) is allocated on the stack; prints 'Entity 2 created'.",
      "3. Entity* heapEntity = new Entity(3) allocates on the heap; prints 'Entity 3 created'.",
      "4. delete heapEntity executes, invoking ~Entity() for object 3 and printing 'Entity 3 destroyed'.",
      "5. main() terminates. Stack unwinding destroys automatic variables in reverse creation order.",
      "6. e2 destructor executes first; prints 'Entity 2 destroyed'.",
      "7. e1 destructor executes next; prints 'Entity 1 destroyed'."
    ],
    "commonMistakes": [
      {
        "mistake": "Failing to execute delete on a dynamically allocated object created with new",
        "codeSnippet": "void leaky() { Entity* e = new Entity(10); } // Destructor never runs! Memory leak!",
        "correction": "Use delete e; or prefer smart pointers (std::unique_ptr<Entity>).",
        "explanation": "Raw pointers allocated with new are never cleaned up automatically upon exiting scope."
      },
      {
        "mistake": "Using delete instead of delete[] for array allocations",
        "codeSnippet": "int* arr = new int[50]; delete arr; // Undefined behavior: should be delete[] arr;",
        "correction": "Match new with delete, and new[] with delete[].",
        "explanation": "delete without brackets only calls the destructor for the first element, causing memory corruption."
      },
      {
        "mistake": "Attempting to pass parameters or overload a destructor",
        "codeSnippet": "~Entity(int code); // Error: destructors may not have parameters",
        "correction": "A destructor always takes no arguments: ~Entity();",
        "explanation": "Because destructors are invoked implicitly by the runtime, arguments cannot be supplied."
      }
    ],
    "realWorldExample": {
      "scenario": "Scoped File Handle RAII Guard",
      "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass FileGuard {\nprivate:\n    string filename;\n\npublic:\n    FileGuard(string fname) : filename(fname) {\n        cout << \"[OS] Opening file handle: \" << filename << endl;\n    }\n\n    ~FileGuard() {\n        cout << \"[OS] Closing file handle and flushing buffers: \" << filename << endl;\n    }\n};\n\nvoid processLogs() {\n    FileGuard logFile(\"system_audit.log\");\n    cout << \"[Worker] Writing transaction records...\" << endl;\n} // logFile destructor guaranteed to run even if function exits or throws\n\nint main() {\n    processLogs();\n    return 0;\n}",
      "explanation": "RAII ensures that open file handles and network sockets are closed automatically upon function return, preventing operating system resource starvation."
    },
    "practice": {
      "prompt": "Write a class Tracker with private member string name. Implement constructor Tracker(string n) that prints 'Track: <name> UP' and destructor ~Tracker() that prints 'Track: <name> DOWN'. In main(), instantiate stack object t1('Alpha'), then inside a nested block {} instantiate t2('Beta'), then after the block print 'Done'. Observe the execution order.",
      "starterCode": "#include <iostream>\n#include <string>\nusing namespace std;\n\n// Implement Tracker class\n\nint main() {\n    // Instantiate t1, nested t2, and print Done\n    return 0;\n}",
      "expectedOutputMatcher": "Track: Alpha UP\nTrack: Beta UP\nTrack: Beta DOWN\nDone\nTrack: Alpha DOWN",
      "hint": "The nested block { Tracker t2('Beta'); } will destroy t2 before 'Done' is printed, while t1 is destroyed when main() finishes.",
      "solution": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Tracker {\nprivate:\n    string name;\n\npublic:\n    Tracker(string n) : name(n) {\n        cout << \"Track: \" << name << \" UP\" << endl;\n    }\n\n    ~Tracker() {\n        cout << \"Track: \" << name << \" DOWN\" << endl;\n    }\n};\n\nint main() {\n    Tracker t1(\"Alpha\");\n    {\n        Tracker t2(\"Beta\");\n    }\n    cout << \"Done\" << endl;\n    return 0;\n}"
    },
    "quiz": [
      {
        "id": "mcq-cpp-oop-dtor-1",
        "question": "What prefix character identifies a destructor in C++?",
        "options": [
          "Exclamation mark (!)",
          "Tilde (~)",
          "Ampersand (&)",
          "Asterisk (*)"
        ],
        "correctIndex": 1,
        "explanation": "A destructor is declared using a tilde followed by the class name (~ClassName())."
      },
      {
        "id": "mcq-cpp-oop-dtor-2",
        "question": "In what order are automatic stack objects destroyed when leaving a scope?",
        "options": [
          "In random order",
          "In the exact same order they were created",
          "In reverse order of creation (LIFO)",
          "All at the exact same instant"
        ],
        "correctIndex": 2,
        "explanation": "Stack objects follow Last-In, First-Out (LIFO); the last object created is the first destroyed."
      },
      {
        "id": "mcq-cpp-oop-dtor-3",
        "question": "Can a C++ destructor be overloaded to accept arguments?",
        "options": [
          "Yes, by defining multiple destructors with different parameter lists",
          "No, destructors cannot accept parameters and cannot be overloaded",
          "Only if the class has a virtual function",
          "Only if declared protected"
        ],
        "correctIndex": 1,
        "explanation": "Destructors take no arguments and can never be overloaded; every class has exactly one destructor."
      },
      {
        "id": "mcq-cpp-oop-dtor-4",
        "question": "What happens to a dynamically allocated object created with new if delete is never called?",
        "options": [
          "The C++ runtime automatically deletes it when its pointer goes out of scope",
          "The object destructor is never called, causing a memory and resource leak",
          "The compiler emits a warning and forces deletion",
          "It is converted to a stack object"
        ],
        "correctIndex": 1,
        "explanation": "C++ has no garbage collection; objects allocated with new persist until delete is executed, otherwise leaking."
      },
      {
        "id": "mcq-cpp-oop-dtor-5",
        "question": "What does the RAII idiom stand for in modern C++?",
        "options": [
          "Runtime Array Index Inspection",
          "Resource Acquisition Is Initialization",
          "Realtime Asynchronous Inter-process Integration",
          "Read Access Immediately Invalidated"
        ],
        "correctIndex": 1,
        "explanation": "RAII stands for Resource Acquisition Is Initialization, tying resource management to object scope lifetimes."
      }
    ],
    "codingChallenge": {
      "title": "Dynamic Integer Buffer RAII Manager",
      "difficulty": "Intermediate",
      "problem_statement": "Write a class DynamicArray with private members: int* ptr and int capacity. In the constructor DynamicArray(int cap), allocate heap memory ptr = new int[cap], set capacity, and print 'Allocated <cap> elements'. Provide set(int idx, int val) and get(int idx). In the destructor ~DynamicArray(), deallocate memory with delete[] ptr and print 'Deallocated <cap> elements'. In main(), create an instance with capacity 5, set index 0 to 42, print 'Value: ' << get(0), and allow the object to leave scope.",
      "input_format": "No input provided.",
      "output_format": "Three lines:\nAllocated 5 elements\nValue: 42\nDeallocated 5 elements",
      "constraints": "Always free heap memory using delete[] in the destructor.",
      "starter_code": "#include <iostream>\nusing namespace std;\n\n// Implement DynamicArray class\n\nint main() {\n    // Instantiate DynamicArray, test, and let destructor run\n    return 0;\n}",
      "expected_output": "Allocated 5 elements\nValue: 42\nDeallocated 5 elements",
      "test_cases": [
        {
          "input": "",
          "expected_output": "Allocated 5 elements\nValue: 42\nDeallocated 5 elements",
          "is_hidden": false
        }
      ]
    },
    "summary": [
      "Destructors release system and heap resources when an object's lifetime ends.",
      "Destructors take no arguments, return no value, and cannot be overloaded.",
      "Automatic stack objects are destructed deterministically in reverse order of construction.",
      "Dynamic objects allocated with new require explicit delete to trigger their destructors.",
      "RAII guarantees that resource management is safe and leak-free by tying cleanup to scope termination."
    ]
  },
  {
    "id": "top-cpp-oop-encapsulation-data-hiding",
    "number": 6,
    "numberDisplay": "06",
    "moduleId": "mod-cpp-oop-core",
    "moduleTitle": "Module 01: Object-Oriented C++ Architecture & Design",
    "title": "Encapsulation and Data Hiding",
    "slug": "encapsulation-and-data-hiding",
    "language": "cpp",
    "shortDescription": "Master the encapsulation pillar: bundling state and behavior, private data members, public interface design, validation inside setters, and maintaining invariant integrity.",
    "difficulty": "Intermediate",
    "estimatedMinutes": 35,
    "prerequisiteId": "top-cpp-oop-destructors-lifecycle",
    "learningObjectives": [
      "Understand the dual principles of encapsulation: grouping data with methods and hiding internal representation",
      "Implement defensive validation inside setter methods to preserve business rules and invariants",
      "Design clean, read-only getters using const member functions",
      "Analyze how encapsulation reduces coupling and enables safe code refactoring"
    ],
    "conceptExplanation": "### 1. What is Encapsulation?\n**Encapsulation** is the foundational pillar of object-oriented design that bundles data (attributes) and methods (behavior) operating on that data into a cohesive single unit—the **class**. \n\nA critical component of encapsulation is **data hiding**: hiding internal representation and implementation details behind a controlled public interface.\n\n### 2. The Core Mechanics of Encapsulation\n1. **Private Data Members**: Direct external access to instance variables is blocked.\n2. **Public Interface**: External consumers interact with the object strictly through validated public member functions (commonly known as *getters* and *setters* or operational methods).\n3. **Class Invariants**: Rules that must **always** hold true for an object to be in a valid state (e.g., `balance >= 0`, `age > 0`, `radius > 0`).\n\n### 3. Benefits of Encapsulation\n* **Data Integrity**: Invalid values cannot be forced onto internal fields.\n* **Flexibility & Refactoring**: Internal representations can be changed (e.g., storing temperature in Kelvin instead of Celsius, or caching calculations) without altering the external public API.\n* **Read-Only / Write-Only Controls**: By providing a getter without a setter, a property becomes completely read-only to external callers.\n* **Auditability**: Setters can log mutations, trigger notifications, or record telemetry.",
    "simpleExample": {
      "code": "#include <iostream>\nusing namespace std;\n\nclass TemperatureSensor {\nprivate:\n    double celsius;\n\npublic:\n    TemperatureSensor(double c) {\n        setCelsius(c);\n    }\n\n    void setCelsius(double c) {\n        if (c >= -273.15) {\n            celsius = c;\n        } else {\n            celsius = -273.15;\n            cout << \"Warning: Clamped to absolute zero!\" << endl;\n        }\n    }\n\n    double getCelsius() const {\n        return celsius;\n    }\n};\n\nint main() {\n    TemperatureSensor sensor(-300.0);\n    cout << \"Sensor Reading: \" << sensor.getCelsius() << \" C\" << endl;\n    return 0;\n}",
      "explanation": "The sensor validates that temperature cannot fall below absolute zero (-273.15 C), protecting invariant integrity."
    },
    "syntax": "class EncapsulatedEntity {\nprivate:\n    DataType internalState;\n\npublic:\n    // Getter: provides read-only inspection\n    DataType getState() const {\n        return internalState;\n    }\n\n    // Setter: enforces validation before mutating state\n    void setState(DataType newVal) {\n        if (isValid(newVal)) {\n            internalState = newVal;\n        }\n    }\n};",
    "codeExample": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass BankAccount {\nprivate:\n    string accountHolder;\n    double balance;\n\npublic:\n    BankAccount(string holder, double initialDeposit)\n        : accountHolder(holder), balance(0.0) {\n        if (initialDeposit > 0) {\n            balance = initialDeposit;\n        }\n    }\n\n    void deposit(double amount) {\n        if (amount <= 0) {\n            cout << \"Deposit Error: Amount must be positive.\" << endl;\n            return;\n        }\n        balance += amount;\n        cout << \"Deposited $\" << amount << \" | Balance: $\" << balance << endl;\n    }\n\n    bool withdraw(double amount) {\n        if (amount <= 0) {\n            cout << \"Withdraw Error: Amount must be positive.\" << endl;\n            return false;\n        }\n        if (amount > balance) {\n            cout << \"Withdraw Error: Overdraft rejected. Funds: $\" << balance << endl;\n            return false;\n        }\n        balance -= amount;\n        cout << \"Withdrew $\" << amount << \" | Remaining: $\" << balance << endl;\n        return true;\n    }\n\n    double getBalance() const {\n        return balance;\n    }\n\n    string getAccountHolder() const {\n        return accountHolder;\n    }\n};\n\nint main() {\n    BankAccount acc(\"Jinesh\", 1000.0);\n\n    acc.deposit(500.0);\n    acc.withdraw(200.0);\n    acc.withdraw(2000.0); // Invalid transaction rejected\n\n    cout << \"Final Verified Balance: $\" << acc.getBalance() << endl;\n\n    return 0;\n}",
    "expectedOutput": "Deposited $500 | Balance: $1500\nWithdrew $200 | Remaining: $1300\nWithdraw Error: Overdraft rejected. Funds: $1300\nFinal Verified Balance: $1300",
    "stepByStep": [
      "1. BankAccount initializes with accountHolder 'Jinesh' and verified balance 1000.0.",
      "2. acc.deposit(500.0) validates (500.0 > 0), increases balance to 1500.0, and prints confirmation.",
      "3. acc.withdraw(200.0) validates (200.0 <= 1500.0), reduces balance to 1300.0, and prints confirmation.",
      "4. acc.withdraw(2000.0) fails the condition (2000.0 > 1300.0); it rejects the overdraft without modifying balance.",
      "5. acc.getBalance() returns 1300.0 safely without allowing external writes.",
      "6. Encapsulation guarantees the balance can never be corrupted by arbitrary external callers."
    ],
    "commonMistakes": [
      {
        "mistake": "Writing trivial getters and setters for every single variable without validation",
        "codeSnippet": "class Point { private: int x; public: void setX(int val) { x = val; } int getX() { return x; } };",
        "correction": "If a variable has no invariants and requires unrestricted access, consider a plain struct or provide domain-specific operations instead of raw setters.",
        "explanation": "Mindlessly generating getters and setters without validation often provides little true encapsulation."
      },
      {
        "mistake": "Failing to declare read-only getters as const member functions",
        "codeSnippet": "double getBalance() { return balance; } // Cannot be called on const BankAccount objects",
        "correction": "Mark getters as const: double getBalance() const { return balance; }",
        "explanation": "const member functions guarantee they will not modify member variables and can be invoked on const instances."
      },
      {
        "mistake": "Modifying state inside a getter method",
        "codeSnippet": "int getCounter() { return ++counter; } // Side effect inside getter!",
        "correction": "Keep getters strictly idempotent and side-effect free.",
        "explanation": "Callers expect getters to inspect state without altering the object."
      }
    ],
    "realWorldExample": {
      "scenario": "High-Frequency Trading Limit Order Book Invariant Protection",
      "code": "#include <iostream>\nusing namespace std;\n\nclass OrderBookEntry {\nprivate:\n    int orderId;\n    double price;\n    int quantity;\n\npublic:\n    OrderBookEntry(int id, double p, int q) : orderId(id), price(0.0), quantity(0) {\n        if (p > 0.0 && q > 0) {\n            price = p;\n            quantity = q;\n        }\n    }\n\n    bool fillShares(int filled) {\n        if (filled > 0 && filled <= quantity) {\n            quantity -= filled;\n            return true;\n        }\n        return false;\n    }\n\n    int getRemainingQuantity() const { return quantity; }\n};\n\nint main() {\n    OrderBookEntry order(1001, 142.50, 500);\n    order.fillShares(200);\n    cout << \"Remaining Order Shares: \" << order.getRemainingQuantity() << endl;\n    return 0;\n}",
      "explanation": "In financial exchanges, orders must never have negative quantities or negative pricing. Strict encapsulation guarantees compliance across millions of daily trades."
    },
    "practice": {
      "prompt": "Create a class EmployeeSalary with private double monthlySalary. In the constructor EmployeeSalary(double s), use setMonthlySalary(s). In setMonthlySalary(double s), only accept s >= 1000.0; if invalid, set to 1000.0 and print 'Salary below minimum threshold!'. Provide getMonthlySalary() const and getAnnualSalary() const (which returns monthlySalary * 12). In main(), instantiate an employee with 3500.0, print monthly and annual salary, then create another with 500.0 and print monthly salary.",
      "starterCode": "#include <iostream>\nusing namespace std;\n\n// Implement EmployeeSalary class\n\nint main() {\n    // Instantiate and test EmployeeSalary\n    return 0;\n}",
      "expectedOutputMatcher": "Monthly: $3500 | Annual: $42000\nSalary below minimum threshold!\nMonthly: $1000",
      "hint": "Multiply getMonthlySalary() by 12 in getAnnualSalary(). Check if (s >= 1000.0) in setter.",
      "solution": "#include <iostream>\nusing namespace std;\n\nclass EmployeeSalary {\nprivate:\n    double monthlySalary;\n\npublic:\n    EmployeeSalary(double s) {\n        setMonthlySalary(s);\n    }\n\n    void setMonthlySalary(double s) {\n        if (s >= 1000.0) {\n            monthlySalary = s;\n        } else {\n            monthlySalary = 1000.0;\n            cout << \"Salary below minimum threshold!\" << endl;\n        }\n    }\n\n    double getMonthlySalary() const {\n        return monthlySalary;\n    }\n\n    double getAnnualSalary() const {\n        return monthlySalary * 12.0;\n    }\n};\n\nint main() {\n    EmployeeSalary emp1(3500.0);\n    cout << \"Monthly: $\" << emp1.getMonthlySalary() << \" | Annual: $\" << emp1.getAnnualSalary() << endl;\n\n    EmployeeSalary emp2(500.0);\n    cout << \"Monthly: $\" << emp2.getMonthlySalary() << endl;\n    return 0;\n}"
    },
    "quiz": [
      {
        "id": "mcq-cpp-oop-encap-1",
        "question": "What is the primary objective of data hiding within encapsulation?",
        "options": [
          "To compress the binary file size",
          "To prevent unauthorized direct external access and enforce data validity invariants",
          "To hide C++ code from decompilers",
          "To increase CPU cache bandwidth"
        ],
        "correctIndex": 1,
        "explanation": "Data hiding protects internal members from direct tampering, guaranteeing that state changes pass through validated methods."
      },
      {
        "id": "mcq-cpp-oop-encap-2",
        "question": "Why should getter methods generally be marked with the const keyword?",
        "options": [
          "Because const methods run faster in multi-threaded loops",
          "Because const guarantees the getter will not modify any member variables and allows calls on const objects",
          "Because non-const getters cannot return integers",
          "Because const automatically converts private variables to public"
        ],
        "correctIndex": 1,
        "explanation": "const methods guarantee immutability of the calling object and enable read-only access on const instances."
      },
      {
        "id": "mcq-cpp-oop-encap-3",
        "question": "What happens if a bank account balance is made public instead of private with deposit/withdraw validation?",
        "options": [
          "The code fails to compile",
          "Any external code can directly set balance to negative values, bypassing security and business rules",
          "The balance variable becomes read-only",
          "Memory allocation fails on 32-bit systems"
        ],
        "correctIndex": 1,
        "explanation": "Public fields allow unrestricted modification, enabling invalid states such as negative balances without audit trails."
      },
      {
        "id": "mcq-cpp-oop-encap-4",
        "question": "What is a 'class invariant'?",
        "options": [
          "A variable that can never be modified after compilation",
          "A condition or business rule regarding internal state that must always remain true throughout an object's valid lifetime",
          "A class that cannot be inherited",
          "A member function marked inline"
        ],
        "correctIndex": 1,
        "explanation": "A class invariant is a condition that must always hold true for an object to be considered in a valid state."
      },
      {
        "id": "mcq-cpp-oop-encap-5",
        "question": "True or False: Encapsulation allows internal class data structures (e.g., array to vector) to be rewritten without breaking existing calling code, provided public interface remains constant.",
        "options": [
          "True",
          "False"
        ],
        "correctIndex": 0,
        "explanation": "True. Encapsulation decouples internal representation from external interface, allowing safe internal refactoring."
      }
    ],
    "codingChallenge": {
      "title": "Audited Inventory Stock Manager",
      "difficulty": "Intermediate",
      "problem_statement": "Create an InventoryItem class with private members: sku (string) and stockCount (int). Provide constructor InventoryItem(string s, int initialStock) validating initialStock >= 0 (if negative, set to 0). Provide methods addStock(int qty), removeStock(int qty), and getStockCount() const. In addStock, reject non-positive quantities. In removeStock, verify qty > 0 and qty <= stockCount; if valid, subtract qty and return true; otherwise print 'Stock Error: Insufficient stock.' and return false. In main(), create item 'SKU-404' with 20 units, add 15, remove 10, attempt to remove 50, and print 'Final Stock: ' << getStockCount().",
      "input_format": "No input provided.",
      "output_format": "Two lines:\nStock Error: Insufficient stock.\nFinal Stock: 25",
      "constraints": "Follow strict encapsulation principles with validation.",
      "starter_code": "#include <iostream>\n#include <string>\nusing namespace std;\n\n// Implement InventoryItem class\n\nint main() {\n    // Instantiate InventoryItem, execute operations, and print final stock\n    return 0;\n}",
      "expected_output": "Stock Error: Insufficient stock.\nFinal Stock: 25",
      "test_cases": [
        {
          "input": "",
          "expected_output": "Stock Error: Insufficient stock.\nFinal Stock: 25",
          "is_hidden": false
        }
      ]
    },
    "summary": [
      "Encapsulation combines data members and member functions into a unified unit.",
      "Data hiding isolates internal state behind private access specifiers.",
      "Setters validate input against class invariants before committing mutations.",
      "Getters marked const ensure safe read-only inspection without side effects.",
      "Encapsulation reduces coupling and allows internal implementations to change safely."
    ]
  },
  {
    "id": "top-cpp-oop-this-pointer-static-members",
    "number": 7,
    "numberDisplay": "07",
    "moduleId": "mod-cpp-oop-core",
    "moduleTitle": "Module 01: Object-Oriented C++ Architecture & Design",
    "title": "The this Pointer and Static Members",
    "slug": "the-this-pointer-and-static-members",
    "language": "cpp",
    "shortDescription": "Master the implicit this pointer, resolving variable-name shadows, fluent method chaining via return *this, static class data, and static member functions.",
    "difficulty": "Intermediate",
    "estimatedMinutes": 35,
    "prerequisiteId": "top-cpp-oop-encapsulation-data-hiding",
    "learningObjectives": [
      "Understand the implicit this pointer passed to non-static member functions",
      "Disambiguate shadowed member variables when parameter names match member names",
      "Implement fluent API method chaining by returning *this by reference",
      "Declare, define, and access static data members and static member functions"
    ],
    "conceptExplanation": "### 1. What is the `this` Pointer?\nIn C++, every non-static member function receives a hidden, implicit parameter named **`this`**. The `this` pointer holds the memory address of the object instance on which the member function was invoked:\n* Type: Inside class `Widget`, `this` has type `Widget* const` (or `const Widget* const` inside a `const` member function).\n* It is a reserved keyword; you cannot declare or assign to `this`.\n\n### 2. Common Uses of the `this` Pointer\n1. **Resolving Parameter Shadowing**: When a constructor or method parameter has the exact same name as a member variable:\n```cpp\nvoid setAge(int age) {\n    this->age = age; // 'this->age' is the member; 'age' is the parameter\n}\n```\n2. **Method Chaining (Fluent Interfaces)**: Returning `*this` by reference enables chained invocations like `obj.setX(10).setY(20).render();`.\n3. **Passing Current Object to Other Subsystems**: Passing `*this` to callbacks, event dispatchers, or observer lists.\n\n### 3. Static Data Members\nA **static data member** belongs to the **class itself**, not to any individual object instance:\n* Only **one copy** exists in memory, shared across all instantiated objects of that class.\n* It must be declared inside the class header and **defined outside the class** in a `.cpp` file (or marked `inline static` in C++17).\n* It exists in the global/static data segment even if zero objects of the class have been created.\n\n### 4. Static Member Functions\nA **static member function** is a function associated with the class rather than an object:\n* Can be called without creating an instance: `ClassName::staticMethod()`.\n* **Has no `this` pointer!**\n* Consequently, static member functions **cannot access non-static data members or non-static member functions directly**. They can only access static members or objects passed to them as arguments.",
    "simpleExample": {
      "code": "#include <iostream>\nusing namespace std;\n\nclass Calculator {\nprivate:\n    double value;\n\npublic:\n    Calculator(double v = 0.0) : value(v) {}\n\n    // Method chaining: return reference to current object\n    Calculator& add(double n) {\n        value += n;\n        return *this;\n    }\n\n    Calculator& multiply(double n) {\n        value *= n;\n        return *this;\n    }\n\n    double getResult() const { return value; }\n};\n\nint main() {\n    Calculator calc(10);\n    // Fluent chaining\n    calc.add(5).multiply(2);\n    cout << \"Result: \" << calc.getResult() << endl; // (10 + 5) * 2 = 30\n    return 0;\n}",
      "explanation": "add() and multiply() return *this by reference, allowing successive method calls to chain together seamlessly."
    },
    "syntax": "class Sample {\nprivate:\n    int id;\n    static int objectCount; // Static member declaration\n\npublic:\n    Sample(int id) {\n        this->id = id; // Disambiguate member from param\n        objectCount++;\n    }\n\n    static int getCount() { // Static method (no this pointer)\n        return objectCount;\n    }\n};\n\nint Sample::objectCount = 0; // Static member definition outside class",
    "codeExample": "#include <iostream>\nusing namespace std;\n\nclass Counter {\nprivate:\n    int id;\n    static int totalCount; // Shared across all instances\n\npublic:\n    Counter(int id) {\n        this->id = id; // Disambiguate id\n        totalCount++;\n        cout << \"Object \" << this->id << \" created. Total: \" << totalCount << endl;\n    }\n\n    ~Counter() {\n        totalCount--;\n        cout << \"Object \" << id << \" destroyed. Remaining: \" << totalCount << endl;\n    }\n\n    // Static member function\n    static int getTotalCount() {\n        return totalCount;\n    }\n};\n\n// Definition of static member variable\nint Counter::totalCount = 0;\n\nint main() {\n    cout << \"Initial Count: \" << Counter::getTotalCount() << endl;\n\n    Counter c1(101);\n    Counter c2(102);\n\n    {\n        Counter c3(103);\n        cout << \"Active Count in block: \" << Counter::getTotalCount() << endl;\n    } // c3 destroyed here\n\n    cout << \"Final Active Count: \" << Counter::getTotalCount() << endl;\n\n    return 0;\n}",
    "expectedOutput": "Initial Count: 0\nObject 101 created. Total: 1\nObject 102 created. Total: 2\nObject 103 created. Total: 3\nActive Count in block: 3\nObject 103 destroyed. Remaining: 2\nFinal Active Count: 2\nObject 102 destroyed. Remaining: 1\nObject 101 destroyed. Remaining: 0",
    "stepByStep": [
      "1. Static member Counter::totalCount is allocated in the static data segment and initialized to 0.",
      "2. Counter::getTotalCount() is called via class scope resolution (Counter::); prints Initial Count: 0.",
      "3. Counter c1(101) initializes; this->id resolves to member id; totalCount increments to 1.",
      "4. Counter c2(102) initializes; totalCount increments to 2.",
      "5. Inside inner block, Counter c3(103) increments totalCount to 3.",
      "6. At end of inner block, c3 goes out of scope; its destructor decrements totalCount to 2.",
      "7. main() prints Final Active Count: 2 before destroying c2 and c1 on exit."
    ],
    "commonMistakes": [
      {
        "mistake": "Attempting to access non-static member variables inside a static member function",
        "codeSnippet": "static void print() { cout << id; } // Error: invalid use of member in static member function",
        "correction": "Only access static variables, or pass an object instance as a parameter.",
        "explanation": "Static member functions have no this pointer because they are called without an active object context."
      },
      {
        "mistake": "Forgetting to define the static member variable outside the class in global scope",
        "codeSnippet": "class A { static int count; }; // Linker error: undefined reference to A::count",
        "correction": "Add int A::count = 0; in the implementation file.",
        "explanation": "Declaring static int count inside a class only tells the compiler about its existence; memory must be defined globally."
      },
      {
        "mistake": "Returning *this by value instead of by reference in method chaining",
        "codeSnippet": "Calculator add(double n) { value += n; return *this; } // Returns a COPY!",
        "correction": "Return by reference: Calculator& add(double n)",
        "explanation": "Returning by value creates an ephemeral copy, so chained calls modify the discarded temporary copy."
      }
    ],
    "realWorldExample": {
      "scenario": "Singleton Hardware Device Driver Controller",
      "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass AudioEngine {\nprivate:\n    static int activeVoiceCount;\n    static const int MAX_VOICES = 64;\n\npublic:\n    static bool allocateVoice() {\n        if (activeVoiceCount < MAX_VOICES) {\n            activeVoiceCount++;\n            cout << \"[Audio Core] Voice assigned. Active: \" << activeVoiceCount << endl;\n            return true;\n        }\n        cout << \"[Audio Core] Error: Voice pool exhausted!\" << endl;\n        return false;\n    }\n\n    static int getActiveVoices() { return activeVoiceCount; }\n};\n\nint AudioEngine::activeVoiceCount = 0;\n\nint main() {\n    AudioEngine::allocateVoice();\n    AudioEngine::allocateVoice();\n    cout << \"Current Hardware Voices: \" << AudioEngine::getActiveVoices() << endl;\n    return 0;\n}",
      "explanation": "Audio and graphics drivers track hardware voice limits and GPU pipelines across all threads using static counters and static allocator functions."
    },
    "practice": {
      "prompt": "Write a class StringBuilder with private member string buffer. Implement: (1) Default constructor setting buffer = ''. (2) Method append(string s) that concatenates s to buffer and returns *this by reference. (3) Method appendLine(string s) that appends s + '\\n' and returns *this by reference. (4) Method str() const that returns buffer. In main(), create an instance and chain: sb.append('C++').append(' ').append('OOP').appendLine('!').append('Next Gen'); then print sb.str().",
      "starterCode": "#include <iostream>\n#include <string>\nusing namespace std;\n\n// Implement StringBuilder with method chaining\n\nint main() {\n    // Test StringBuilder chaining\n    return 0;\n}",
      "expectedOutputMatcher": "C++ OOP!\nNext Gen",
      "hint": "Return StringBuilder& from append and appendLine using return *this;",
      "solution": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass StringBuilder {\nprivate:\n    string buffer;\n\npublic:\n    StringBuilder() : buffer(\"\") {}\n\n    StringBuilder& append(string s) {\n        buffer += s;\n        return *this;\n    }\n\n    StringBuilder& appendLine(string s) {\n        buffer += s + \"\\n\";\n        return *this;\n    }\n\n    string str() const {\n        return buffer;\n    }\n};\n\nint main() {\n    StringBuilder sb;\n    sb.append(\"C++\").append(\" \").append(\"OOP\").appendLine(\"!\").append(\"Next Gen\");\n    cout << sb.str();\n    return 0;\n}"
    },
    "quiz": [
      {
        "id": "mcq-cpp-oop-this-1",
        "question": "What does the 'this' keyword represent inside a non-static C++ member function?",
        "options": [
          "A pointer to the base class",
          "A pointer to the current calling object instance",
          "A reference to the main() function",
          "A keyword that allocates memory on the heap"
        ],
        "correctIndex": 1,
        "explanation": "this is an implicit pointer storing the address of the object instance invoking the member function."
      },
      {
        "id": "mcq-cpp-oop-this-2",
        "question": "Why can a static member function NOT use the 'this' pointer?",
        "options": [
          "Static member functions are deprecated in C++",
          "Static member functions belong to the class itself and are not invoked on any specific object instance",
          "Because static member functions run before the operating system boots",
          "Because 'this' only works with integer data types"
        ],
        "correctIndex": 1,
        "explanation": "Static member functions are invoked at class scope without an instantiated object instance, so no this pointer exists."
      },
      {
        "id": "mcq-cpp-oop-this-3",
        "question": "How many copies of a static data member exist when 100 objects of that class are instantiated?",
        "options": [
          "100 copies",
          "Exactly 1 shared copy",
          "2 copies (stack and heap)",
          "0 copies until called"
        ],
        "correctIndex": 1,
        "explanation": "A static data member is shared globally across all instances of the class; only one copy exists in memory."
      },
      {
        "id": "mcq-cpp-oop-this-4",
        "question": "What must be returned from a member function to enable method chaining (e.g., obj.setA(1).setB(2))?",
        "options": [
          "return void;",
          "return this;",
          "return *this; with the function return type declared as a reference (ClassName&)",
          "return 0;"
        ],
        "correctIndex": 2,
        "explanation": "Returning *this by reference (ClassName&) allows chained member functions to modify the original calling object."
      },
      {
        "id": "mcq-cpp-oop-this-5",
        "question": "Where must a static data member typically be defined in C++ (prior to C++17 inline static)?",
        "options": [
          "Inside the main() function",
          "Outside the class declaration in namespace/global scope",
          "Inside the class constructor",
          "Inside the class destructor"
        ],
        "correctIndex": 1,
        "explanation": "Static data members are declared in the class header and must be explicitly defined outside the class in global scope."
      }
    ],
    "codingChallenge": {
      "title": "Unique ID Generator Service",
      "difficulty": "Intermediate",
      "problem_statement": "Create a TransactionTracker class with a static int nextTransactionId initialized to 1000, and instance variables int id and double amount. In constructor TransactionTracker(double amt), assign this->id = nextTransactionId++ and this->amount = amt. Provide a method printDetails() const printing 'Transaction #<id>: $<amount>' and a static method getNextId() that returns nextTransactionId. In main(), create t1 with 250.0, t2 with 890.50, call printDetails() on both, and print 'Upcoming ID: ' << TransactionTracker::getNextId().",
      "input_format": "No input provided.",
      "output_format": "Three lines:\nTransaction #1000: $250\nTransaction #1001: $890.5\nUpcoming ID: 1002",
      "constraints": "Maintain nextTransactionId strictly as private static data.",
      "starter_code": "#include <iostream>\nusing namespace std;\n\n// Implement TransactionTracker class\n\nint main() {\n    // Instantiate t1 and t2, print details and upcoming ID\n    return 0;\n}",
      "expected_output": "Transaction #1000: $250\nTransaction #1001: $890.5\nUpcoming ID: 1002",
      "test_cases": [
        {
          "input": "",
          "expected_output": "Transaction #1000: $250\nTransaction #1001: $890.5\nUpcoming ID: 1002",
          "is_hidden": false
        }
      ]
    },
    "summary": [
      "The this pointer is an implicit pointer to the invoking object instance in non-static methods.",
      "this->member resolves ambiguity when method parameters shadow member variable names.",
      "Returning *this by reference facilitates fluent method chaining APIs.",
      "Static data members exist once for the entire class and are shared across all instances.",
      "Static member functions have no this pointer and cannot access non-static members directly."
    ]
  },
  {
    "id": "top-cpp-oop-inheritance-fundamentals",
    "number": 8,
    "numberDisplay": "08",
    "moduleId": "mod-cpp-oop-core",
    "moduleTitle": "Module 01: Object-Oriented C++ Architecture & Design",
    "title": "Inheritance Fundamentals",
    "slug": "inheritance-fundamentals",
    "language": "cpp",
    "shortDescription": "Master inheritance in C++: base and derived classes, code reuse, single, multilevel, multiple, hierarchical, and hybrid inheritance hierarchies, and constructor/destructor execution order.",
    "difficulty": "Intermediate",
    "estimatedMinutes": 45,
    "prerequisiteId": "top-cpp-oop-this-pointer-static-members",
    "learningObjectives": [
      "Understand the core mechanics and motivations for inheritance (the 'Is-A' relationship)",
      "Implement base classes and derived classes using C++ inheritance syntax",
      "Classify the five types of inheritance: Single, Multilevel, Multiple, Hierarchical, and Hybrid",
      "Trace constructor initialization and destructor teardown order across inheritance hierarchies"
    ],
    "conceptExplanation": "### 1. What is Inheritance?\n**Inheritance** is the object-oriented mechanism allowing a new class (the **derived** or **child** class) to inherit attributes and behaviors from an existing class (the **base** or **parent** class). It establishes an **\"Is-A\"** relationship:\n* A `Student` **is a** `Person`.\n* A `Car` **is a** `Vehicle`.\n* A `Dog` **is an** `Animal`.\n\n### 2. Benefits of Inheritance\n1. **Code Reusability**: Common functionality is written once in the base class and shared by all derived classes.\n2. **Extensibility**: Specialized behaviors are added to derived classes without modifying tested base code.\n3. **Foundation for Polymorphism**: Establishes common base types enabling dynamic dispatch.\n\n### 3. Types of Inheritance in C++\n1. **Single Inheritance**: A derived class inherits from exactly one base class (`A -> B`).\n2. **Multilevel Inheritance**: A derived class acts as a base class for another class (`A -> B -> C`).\n3. **Multiple Inheritance**: A derived class inherits directly from two or more base classes (`A, B -> C`).\n4. **Hierarchical Inheritance**: Multiple derived classes inherit from a single common base class (`A -> B` and `A -> C`).\n5. **Hybrid Inheritance**: A combination of two or more inheritance types (e.g., diamond hierarchy).\n\n### 4. Constructor and Destructor Execution Sequence\nWhen an object of a derived class is instantiated:\n1. **Constructors execute Top-Down**:\n   * Base class constructor executes **first**.\n   * Derived class constructor executes **second**.\n2. **Destructors execute Bottom-Up**:\n   * Derived class destructor executes **first**.\n   * Base class destructor executes **second**.\n\n```\nCreation: Base() -----> Derived()\nTeardown: ~Derived() -> ~Base()\n```",
    "simpleExample": {
      "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\n// Base class\nclass Animal {\npublic:\n    void eat() const {\n        cout << \"Animal is eating...\" << endl;\n    }\n};\n\n// Derived class (Single Inheritance)\nclass Dog : public Animal {\npublic:\n    void bark() const {\n        cout << \"Dog barks: Woof!\" << endl;\n    }\n};\n\nint main() {\n    Dog myDog;\n    myDog.eat();  // Inherited from Animal\n    myDog.bark(); // Specific to Dog\n    return 0;\n}",
      "explanation": "Dog inherits eat() from Animal and adds its own specialized method bark()."
    },
    "syntax": "// C++ Derived Class Syntax\nclass BaseClass {\n    // Base members\n};\n\nclass DerivedClass : accessSpecifier BaseClass {\n    // Inherited members + specialized members\n};",
    "codeExample": "#include <iostream>\n#include <string>\nusing namespace std;\n\n// 1. Base Class: Person\nclass Person {\nprotected:\n    string name;\n    int age;\n\npublic:\n    Person(string n, int a) : name(n), age(a) {\n        cout << \"[Base Constructor] Person: \" << name << endl;\n    }\n\n    ~Person() {\n        cout << \"[Base Destructor] Person: \" << name << endl;\n    }\n\n    void introduce() const {\n        cout << \"Name: \" << name << \", Age: \" << age << endl;\n    }\n};\n\n// 2. Derived Class: Student (Single Inheritance)\nclass Student : public Person {\nprivate:\n    string studentId;\n    double gpa;\n\npublic:\n    Student(string n, int a, string id, double g)\n        : Person(n, a), studentId(id), gpa(g) {\n        cout << \"[Derived Constructor] Student ID: \" << studentId << endl;\n    }\n\n    ~Student() {\n        cout << \"[Derived Destructor] Student ID: \" << studentId << endl;\n    }\n\n    void displayDetails() const {\n        introduce(); // Calling inherited method\n        cout << \"ID: \" << studentId << \" | GPA: \" << gpa << endl;\n    }\n};\n\nint main() {\n    cout << \"--- Creating Student Object ---\" << endl;\n    Student s1(\"Jinesh\", 19, \"STU-8821\", 3.95);\n\n    cout << \"\\n--- Calling Student Methods ---\" << endl;\n    s1.displayDetails();\n\n    cout << \"\\n--- Exiting Scope ---\" << endl;\n    return 0;\n}",
    "expectedOutput": "--- Creating Student Object ---\n[Base Constructor] Person: Jinesh\n[Derived Constructor] Student ID: STU-8821\n\n--- Calling Student Methods ---\nName: Jinesh, Age: 19\nID: STU-8821 | GPA: 3.95\n\n--- Exiting Scope ---\n[Derived Destructor] Student ID: STU-8821\n[Base Destructor] Person: Jinesh",
    "stepByStep": [
      "1. When Student s1 is created, the derived constructor initializer list invokes Person(n, a) first.",
      "2. Base constructor Person prints '[Base Constructor] Person: Jinesh'.",
      "3. Derived constructor Student body executes next, printing '[Derived Constructor] Student ID: STU-8821'.",
      "4. s1.displayDetails() calls inherited introduce(), printing name and age, followed by ID and GPA.",
      "5. When main() completes, s1 is destroyed in reverse order.",
      "6. Derived destructor ~Student() executes first.",
      "7. Base destructor ~Person() executes second."
    ],
    "commonMistakes": [
      {
        "mistake": "Forgetting to initialize the base class constructor from the derived class constructor",
        "codeSnippet": "Student(string n, int a, string id) { name = n; age = a; studentId = id; }",
        "correction": "Call base constructor explicitly: Student(string n, int a, string id) : Person(n, a), studentId(id) {}",
        "explanation": "If no base constructor call is specified, the compiler attempts to call a default Person() constructor. If Person has no default constructor, compilation fails."
      },
      {
        "mistake": "Confusing 'Is-A' (inheritance) with 'Has-A' (composition)",
        "codeSnippet": "class Car : public Engine { ... }; // Anti-pattern: A car is NOT an engine!",
        "correction": "Use composition: class Car { private: Engine engine; };",
        "explanation": "Inheritance models specialization ('Is-A'). Subcomponents should be modeled with composition ('Has-A')."
      },
      {
        "mistake": "Assuming base class private members can be accessed directly by derived classes",
        "codeSnippet": "class Derived : public Base { void test() { privateVar = 5; } }; // Error: private member inaccessible",
        "correction": "Mark variables as protected in the base class or use public getters/setters.",
        "explanation": "Private members of a base class are never directly accessible by derived classes."
      }
    ],
    "realWorldExample": {
      "scenario": "Operating System Process Scheduling Hierarchy",
      "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Process {\nprotected:\n    int pid;\n    int priority;\n\npublic:\n    Process(int id, int prio) : pid(id), priority(prio) {}\n    int getPid() const { return pid; }\n};\n\nclass RealTimeTask : public Process {\nprivate:\n    double deadlineMs;\n\npublic:\n    RealTimeTask(int id, int prio, double deadline)\n        : Process(id, prio), deadlineMs(deadline) {}\n\n    void schedule() const {\n        cout << \"[RTOS] Dispatching PID \" << pid << \" (Priority: \" \n             << priority << \", Deadline: \" << deadlineMs << \"ms)\" << endl;\n    }\n};\n\nint main() {\n    RealTimeTask audioTask(402, 99, 2.5);\n    audioTask.schedule();\n    return 0;\n}",
      "explanation": "Real-time operating systems extend standard kernel process abstractions with specialized real-time scheduling constraints through inheritance."
    },
    "practice": {
      "prompt": "Create base class Vehicle with protected string brand and int speed, and a constructor Vehicle(string b, int s). Derive class Car : public Vehicle adding private int numDoors and constructor Car(string b, int s, int doors). Add method displayInfo() in Car that prints 'Brand: <brand>, Speed: <speed> km/h, Doors: <numDoors>'. In main(), instantiate Car c('BMW', 240, 4) and call displayInfo().",
      "starterCode": "#include <iostream>\n#include <string>\nusing namespace std;\n\n// Implement Vehicle and Car classes\n\nint main() {\n    // Instantiate Car and display info\n    return 0;\n}",
      "expectedOutputMatcher": "Brand: BMW, Speed: 240 km/h, Doors: 4",
      "hint": "Initialize Vehicle in Car constructor: Car(string b, int s, int d) : Vehicle(b, s), numDoors(d) {}",
      "solution": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Vehicle {\nprotected:\n    string brand;\n    int speed;\n\npublic:\n    Vehicle(string b, int s) : brand(b), speed(s) {}\n};\n\nclass Car : public Vehicle {\nprivate:\n    int numDoors;\n\npublic:\n    Car(string b, int s, int d) : Vehicle(b, s), numDoors(d) {}\n\n    void displayInfo() const {\n        cout << \"Brand: \" << brand << \", Speed: \" << speed << \" km/h, Doors: \" << numDoors << endl;\n    }\n};\n\nint main() {\n    Car c(\"BMW\", 240, 4);\n    c.displayInfo();\n    return 0;\n}"
    },
    "quiz": [
      {
        "id": "mcq-cpp-oop-inh-1",
        "question": "What type of relationship is modeled by inheritance in object-oriented programming?",
        "options": [
          "Has-A relationship",
          "Is-A relationship",
          "Uses-A relationship",
          "Depends-On relationship"
        ],
        "correctIndex": 1,
        "explanation": "Inheritance models an 'Is-A' relationship (e.g., a Dog is an Animal)."
      },
      {
        "id": "mcq-cpp-oop-inh-2",
        "question": "In what order are constructors executed when an object of a derived class is created?",
        "options": [
          "Derived constructor first, then Base constructor",
          "Base constructor first, then Derived constructor",
          "Simultaneously in parallel threads",
          "Only the derived constructor executes"
        ],
        "correctIndex": 1,
        "explanation": "Constructors execute from the top of the inheritance tree downwards: Base class constructor executes first."
      },
      {
        "id": "mcq-cpp-oop-inh-3",
        "question": "In what order are destructors executed when a derived class object is destroyed?",
        "options": [
          "Base destructor first, then Derived destructor",
          "Derived destructor first, then Base destructor",
          "In arbitrary order",
          "Destructors are never called for base classes"
        ],
        "correctIndex": 1,
        "explanation": "Destructors execute in reverse order of construction: Derived class destructor executes first."
      },
      {
        "id": "mcq-cpp-oop-inh-4",
        "question": "Which type of inheritance occurs when a derived class inherits directly from two or more base classes (e.g., class C : public A, public B)?",
        "options": [
          "Single inheritance",
          "Multilevel inheritance",
          "Multiple inheritance",
          "Hierarchical inheritance"
        ],
        "correctIndex": 2,
        "explanation": "Multiple inheritance allows a derived class to inherit directly from more than one base class."
      },
      {
        "id": "mcq-cpp-oop-inh-5",
        "question": "Can a derived class directly access private members of its base class?",
        "options": [
          "Yes, all base members are directly accessible",
          "No, private members remain strictly accessible only within the base class itself",
          "Only if using public inheritance",
          "Only if the member is an integer"
        ],
        "correctIndex": 1,
        "explanation": "Private members of a base class are hidden from derived classes; use protected for derived access."
      }
    ],
    "codingChallenge": {
      "title": "Multilevel Hierarchy: Manager Bonus Calculation",
      "difficulty": "Intermediate",
      "problem_statement": "Implement a 3-tier multilevel inheritance hierarchy: (1) Base class Employee with protected string name and double baseSalary. Constructor: Employee(string n, double s). (2) Derived class SalariedEmployee : public Employee adding protected string department. Constructor: SalariedEmployee(string n, double s, string dept) : Employee(n, s), department(dept). (3) Derived class Manager : public SalariedEmployee adding private double bonus. Constructor: Manager(string n, double s, string dept, double b). Add method printTotalComp() in Manager that prints 'Manager: <name> (<department>) | Total: $<baseSalary + bonus>'. In main(), instantiate Manager m('Sarah Connor', 110000, 'Security', 25000) and call printTotalComp().",
      "input_format": "No input provided.",
      "output_format": "One line: Manager: Sarah Connor (Security) | Total: $135000",
      "constraints": "Chain constructors correctly through the 3-level hierarchy.",
      "starter_code": "#include <iostream>\n#include <string>\nusing namespace std;\n\n// Implement Employee, SalariedEmployee, and Manager classes\n\nint main() {\n    // Instantiate Manager and print total compensation\n    return 0;\n}",
      "expected_output": "Manager: Sarah Connor (Security) | Total: $135000",
      "test_cases": [
        {
          "input": "",
          "expected_output": "Manager: Sarah Connor (Security) | Total: $135000",
          "is_hidden": false
        }
      ]
    },
    "summary": [
      "Inheritance allows derived classes to inherit state and behavior from base classes, modeling 'Is-A' relationships.",
      "C++ supports single, multilevel, multiple, hierarchical, and hybrid inheritance.",
      "Base constructors execute before derived constructors; derived destructors execute before base destructors.",
      "protected access specifiers allow derived classes to access base members while hiding them from external code.",
      "Derived constructors must pass parameters up to base constructors using member initializer lists."
    ]
  },
  {
    "id": "top-cpp-oop-access-control-inheritance",
    "number": 9,
    "numberDisplay": "09",
    "moduleId": "mod-cpp-oop-core",
    "moduleTitle": "Module 01: Object-Oriented C++ Architecture & Design",
    "title": "Access Control and Inheritance",
    "slug": "access-control-and-inheritance",
    "language": "cpp",
    "shortDescription": "Explore public, protected, and private inheritance modes, how base member accessibility changes in derived classes, using declarations, and resolving access violations.",
    "difficulty": "Intermediate",
    "estimatedMinutes": 35,
    "prerequisiteId": "top-cpp-oop-inheritance-fundamentals",
    "learningObjectives": [
      "Analyze how public, protected, and private inheritance alter member access levels in derived classes",
      "Understand when to choose public inheritance (Is-A) vs private inheritance (implemented-in-terms-of)",
      "Use using declarations to unhide or adjust accessibility of inherited members",
      "Diagnose and correct common compiler access control errors during inheritance"
    ],
    "conceptExplanation": "### 1. The Three Inheritance Modes\nWhen inheriting from a base class, C++ allows specifying an inheritance mode:\n```cpp\nclass Derived : accessMode Base {};\n```\nThe access mode acts as a **ceiling filter** on the members inherited from `Base`.\n\n### 2. The Comprehensive Accessibility Matrix\n| Base Member Access | Inherited via `public` | Inherited via `protected` | Inherited via `private` |\n| :--- | :--- | :--- | :--- |\n| **`public`** | Remains **`public`** in derived | Becomes **`protected`** in derived | Becomes **`private`** in derived |\n| **`protected`** | Remains **`protected`** in derived | Remains **`protected`** in derived | Becomes **`private`** in derived |\n| **`private`** | **Inaccessible** directly | **Inaccessible** directly | **Inaccessible** directly |\n\n*Key Takeaway*:\n* `public` inheritance preserves the original access categories.\n* `protected` inheritance caps all accessible members to `protected`.\n* `private` inheritance locks all inherited members down to `private` in the derived class.\n* Private members of the base class are **never directly accessible** in derived classes under any mode.\n\n### 3. When to Use Each Mode\n1. **Public Inheritance (`public Base`)**: Models genuine subtyping (\"Is-A\"). External callers can treat `Derived` as a `Base`. This represents 95%+ of production inheritance.\n2. **Private Inheritance (`private Base`)**: Models \"Implemented-In-Terms-Of\". The derived class reuses base implementation, but clients of `Derived` cannot treat it as `Base` and cannot call base methods directly.\n3. **Protected Inheritance (`protected Base`)**: Rare. Used when derived classes and their descendants need access, but the outside world should not see the relationship.\n\n### 4. Adjusting Access with the `using` Keyword\nIf a base class method was made private or protected by inheritance mode, a derived class can selectively promote it back to public using:\n```cpp\nclass Derived : private Base {\npublic:\n    using Base::commonFunction; // Expose specifically\n};\n```",
    "simpleExample": {
      "code": "#include <iostream>\nusing namespace std;\n\nclass Base {\npublic:\n    int pub = 1;\nprotected:\n    int prot = 2;\nprivate:\n    int priv = 3;\n};\n\nclass PubDerived : public Base {\n    // pub is public, prot is protected, priv is inaccessible\n};\n\nclass PrivDerived : private Base {\n    // pub becomes private, prot becomes private, priv is inaccessible\npublic:\n    void test() {\n        cout << \"Can access inside: \" << pub << \" and \" << prot << endl;\n    }\n};\n\nint main() {\n    PubDerived d1;\n    cout << \"d1.pub: \" << d1.pub << endl; // OK: public\n\n    PrivDerived d2;\n    // cout << d2.pub; // COMPILER ERROR: pub is private in PrivDerived\n    d2.test(); // OK\n    return 0;\n}",
      "explanation": "In PrivDerived, the public member pub is converted to private, preventing external access."
    },
    "syntax": "// Specifying Inheritance Modes\nclass DerivedPublic : public Base {};\nclass DerivedProtected : protected Base {};\nclass DerivedPrivate : private Base {};",
    "codeExample": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass PrinterEngine {\npublic:\n    void printRaw(const string& text) const {\n        cout << \"[Engine Output]: \" << text << endl;\n    }\n\n    void status() const {\n        cout << \"[Engine Status]: Ready\" << endl;\n    }\n};\n\n// Private inheritance: SecureOfficePrinter is implemented using PrinterEngine,\n// but does NOT want clients to call printRaw directly without auditing!\nclass SecureOfficePrinter : private PrinterEngine {\npublic:\n    void printSecureDocument(const string& doc, const string& userRole) {\n        if (userRole == \"Admin\" || userRole == \"Manager\") {\n            cout << \"Audit: Authorized by \" << userRole << endl;\n            printRaw(doc); // Accessible inside derived class\n        } else {\n            cout << \"Security Alert: Unauthorized print request by \" << userRole << \"!\" << endl;\n        }\n    }\n\n    // Selectively expose status() to public interface using 'using'\n    using PrinterEngine::status;\n};\n\nint main() {\n    SecureOfficePrinter printer;\n\n    // printer.printRaw(\"Secret Plan\"); // COMPILER ERROR: printRaw is private!\n    printer.status(); // OK: exposed via 'using'\n\n    printer.printSecureDocument(\"Q3 Financials\", \"Guest\");\n    printer.printSecureDocument(\"Q3 Financials\", \"Manager\");\n\n    return 0;\n}",
    "expectedOutput": "[Engine Status]: Ready\nSecurity Alert: Unauthorized print request by Guest!\nAudit: Authorized by Manager\n[Engine Output]: Q3 Financials",
    "stepByStep": [
      "1. PrinterEngine defines public methods printRaw and status.",
      "2. SecureOfficePrinter uses private inheritance: : private PrinterEngine.",
      "3. All public members of PrinterEngine become private inside SecureOfficePrinter.",
      "4. The directive 'using PrinterEngine::status;' selectively restores status() to the public interface.",
      "5. In main(), printer.status() executes successfully.",
      "6. Attempting printer.printRaw('...') directly fails at compile time because it was privatized.",
      "7. printSecureDocument validates user credentials before calling private printRaw internally."
    ],
    "commonMistakes": [
      {
        "mistake": "Omitting the inheritance mode in class declarations (e.g., class B : A {})",
        "codeSnippet": "class Derived : Base {}; // In a class, defaults to PRIVATE inheritance!",
        "correction": "Always specify : public Base if an Is-A subtyping relationship is desired.",
        "explanation": "Because class defaults to private, omitting the keyword makes all inherited members private, breaking polymorphism."
      },
      {
        "mistake": "Trying to access private base members in derived classes via protected inheritance",
        "codeSnippet": "class B : protected A { void f() { a_priv = 1; } }; // Error",
        "correction": "Base private members are NEVER accessible in derived classes regardless of inheritance mode.",
        "explanation": "Inheritance access specifiers can only restrict access (demote); they can never grant access to private base members."
      },
      {
        "mistake": "Using private inheritance when composition would be cleaner",
        "codeSnippet": "class Stack : private Vector { ... };",
        "correction": "Prefer composition (class Stack { private: Vector v; };) unless overriding virtual functions is required.",
        "explanation": "C++ Core Guidelines recommend composition over private inheritance for 'implemented-in-terms-of'."
      }
    ],
    "realWorldExample": {
      "scenario": "Network Protocol Stack Encapsulation",
      "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass RawSocketDriver {\npublic:\n    void sendPacketBytes(const string& bytes) const {\n        cout << \"[PHY Layer] Transmitting: \" << bytes << endl;\n    }\n};\n\n// HTTPClient is implemented in terms of RawSocketDriver, but callers must not inject raw bytes\nclass HTTPClient : private RawSocketDriver {\npublic:\n    void get(const string& url) const {\n        string packet = \"GET \" + url + \" HTTP/1.1\\r\\nHost: api\\r\\n\";\n        sendPacketBytes(packet);\n    }\n};\n\nint main() {\n    HTTPClient client;\n    client.get(\"/users/42\");\n    return 0;\n}",
      "explanation": "High-level networking libraries privately inherit from low-level socket drivers to utilize raw transmission facilities while shielding consumers from invalid packet injection."
    },
    "practice": {
      "prompt": "Create class Motor with public method void start() { cout << 'Motor humming...' << endl; }. Derive class Blender : private Motor. Inside Blender, provide a public method void blend() that calls start() and then prints 'Blending smoothie!'. In main(), instantiate Blender b, call b.blend(), and verify that calling b.start() from main() would be rejected by the compiler.",
      "starterCode": "#include <iostream>\nusing namespace std;\n\n// Implement Motor and Blender classes\n\nint main() {\n    // Instantiate Blender and call blend()\n    return 0;\n}",
      "expectedOutputMatcher": "Motor humming...\nBlending smoothie!",
      "hint": "In Blender : private Motor, start() is accessible inside blend() but hidden from main().",
      "solution": "#include <iostream>\nusing namespace std;\n\nclass Motor {\npublic:\n    void start() const {\n        cout << \"Motor humming...\" << endl;\n    }\n};\n\nclass Blender : private Motor {\npublic:\n    void blend() const {\n        start();\n        cout << \"Blending smoothie!\" << endl;\n    }\n};\n\nint main() {\n    Blender b;\n    b.blend();\n    return 0;\n}"
    },
    "quiz": [
      {
        "id": "mcq-cpp-oop-acc-inh-1",
        "question": "What is the default inheritance access mode for a C++ class if none is specified (e.g., class Derived : Base {})?",
        "options": [
          "public",
          "private",
          "protected",
          "virtual"
        ],
        "correctIndex": 1,
        "explanation": "In a C++ class, inheritance defaults to private; in a C++ struct, inheritance defaults to public."
      },
      {
        "id": "mcq-cpp-oop-acc-inh-2",
        "question": "When a derived class inherits using protected mode (class D : protected B), what does a public member of B become in D?",
        "options": [
          "public",
          "protected",
          "private",
          "Inaccessible"
        ],
        "correctIndex": 1,
        "explanation": "Protected inheritance demotes public members of the base class to protected members in the derived class."
      },
      {
        "id": "mcq-cpp-oop-acc-inh-3",
        "question": "When a derived class inherits using private mode (class D : private B), how can external callers in main() use public methods of B through an instance of D?",
        "options": [
          "They can access them freely",
          "They cannot access them unless D explicitly re-exposes them (e.g., via using B::method)",
          "By casting D to void*",
          "Only if B has a virtual destructor"
        ],
        "correctIndex": 1,
        "explanation": "Private inheritance makes all inherited members private in D, hiding them from external clients unless re-exposed."
      },
      {
        "id": "mcq-cpp-oop-acc-inh-4",
        "question": "Which inheritance mode is used to express a genuine 'Is-A' relationship supporting polymorphic subtyping?",
        "options": [
          "private inheritance",
          "protected inheritance",
          "public inheritance",
          "static inheritance"
        ],
        "correctIndex": 2,
        "explanation": "Public inheritance represents the Liskov substitution principle ('Is-A'), allowing derived instances to be treated as base objects."
      },
      {
        "id": "mcq-cpp-oop-acc-inh-5",
        "question": "Can private members of a base class be accessed by a derived class under public inheritance?",
        "options": [
          "Yes, public inheritance exposes everything",
          "No, private base members are never directly accessible by derived classes",
          "Only if using the this pointer",
          "Only in debug builds"
        ],
        "correctIndex": 1,
        "explanation": "Private base members are completely inaccessible to derived classes regardless of inheritance mode."
      }
    ],
    "codingChallenge": {
      "title": "Secure Encrypted Communicator",
      "difficulty": "Intermediate",
      "problem_statement": "Define a base class Transmitter with public method transmitRaw(string msg) that prints 'RAW TX: <msg>'. Create a class EncryptedTransmitter that inherits PRIVATELY from Transmitter. Inside EncryptedTransmitter, provide a public method sendEncrypted(string msg) that wraps msg with '[CIPHER: <msg>]' and calls transmitRaw internally. In main(), create an EncryptedTransmitter instance and call sendEncrypted('Nuclear Launch Code 779').",
      "input_format": "No input provided.",
      "output_format": "One line: RAW TX: [CIPHER: Nuclear Launch Code 779]",
      "constraints": "Transmitter must be privately inherited so transmitRaw cannot be called directly from main().",
      "starter_code": "#include <iostream>\n#include <string>\nusing namespace std;\n\n// Implement Transmitter and EncryptedTransmitter\n\nint main() {\n    // Instantiate EncryptedTransmitter and send message\n    return 0;\n}",
      "expected_output": "RAW TX: [CIPHER: Nuclear Launch Code 779]",
      "test_cases": [
        {
          "input": "",
          "expected_output": "RAW TX: [CIPHER: Nuclear Launch Code 779]",
          "is_hidden": false
        }
      ]
    },
    "summary": [
      "Inheritance modes (public, protected, private) act as filters on base member visibility.",
      "public inheritance preserves access levels and models true 'Is-A' relationships.",
      "protected inheritance demotes public members to protected in the derived class.",
      "private inheritance demotes all inherited members to private, modeling 'implemented-in-terms-of'.",
      "Private base members are never accessible directly in derived classes under any inheritance mode."
    ]
  },
  {
    "id": "top-cpp-oop-method-overriding-virtual",
    "number": 10,
    "numberDisplay": "10",
    "moduleId": "mod-cpp-oop-core",
    "moduleTitle": "Module 01: Object-Oriented C++ Architecture & Design",
    "title": "Method Overriding and the virtual Keyword",
    "slug": "method-overriding-and-virtual-keyword",
    "language": "cpp",
    "shortDescription": "Master runtime dispatch with the virtual keyword, dynamic binding, method overriding, override and final specifiers, virtual method tables (vtables), and virtual destructors.",
    "difficulty": "Intermediate",
    "estimatedMinutes": 40,
    "prerequisiteId": "top-cpp-oop-access-control-inheritance",
    "learningObjectives": [
      "Differentiate compile-time function overloading from runtime method overriding",
      "Understand the virtual keyword, dynamic dispatch, and the virtual method table (vtable)",
      "Use base class pointers to transparently invoke overridden derived class methods",
      "Apply override and final specifiers for compile-time safety, and understand virtual destructors"
    ],
    "conceptExplanation": "### 1. What is Method Overriding?\n**Method overriding** occurs when a derived class provides its own specific implementation of a function that has already been declared in its base class with the **exact same signature** (name, parameter list, and return type).\n\n### 2. Static Binding vs Dynamic Binding\n* **Static (Early) Binding**: Without the `virtual` keyword, the C++ compiler resolves function calls at compile time based on the **static type of the pointer or reference**, ignoring what type of object is actually pointed to!\n* **Dynamic (Late) Binding**: With the `virtual` keyword, the function call is resolved at runtime based on the **actual type of the object** being pointed to.\n\n### 3. How Virtual Functions Work (vtable & vptr)\nWhen a class declares or inherits at least one `virtual` function:\n1. The compiler creates a **Virtual Method Table (`vtable`)** for that class—an array of function pointers pointing to the most-derived implementations of the virtual functions.\n2. Every object of that class contains an invisible pointer called the **`vptr`** (typically at offset 0).\n3. At runtime, executing `animal->sound()` performs an indirect lookup: `animal -> vptr -> vtable[sound_index]()`\n4. This adds a tiny, negligible pointer dereference cost (typically a few CPU cycles), unlocking dynamic runtime polymorphism!\n\n### 4. The `override` and `final` Keywords (C++11)\n* **`override`**: Directs the compiler to verify that the function is indeed overriding a virtual function in the base class. If signatures mismatch (e.g., misspelled name or missing `const`), the compiler halts with an error instead of silently creating a new unrelated function.\n* **`final`**: Prevents a virtual function from being overridden further by descendant classes, or prevents a class from being inherited.\n\n### 5. Why Every Polymorphic Base Class Needs a Virtual Destructor!\nIf you delete a derived object through a base pointer (`Base* p = new Derived(); delete p;`), and `Base` has a **non-virtual destructor**, the compiler will **only call `~Base()`**! The derived class destructor `~Derived()` will never execute, causing leaks of any resources held by the child class.\nAlways declare:\n```cpp\nvirtual ~Base() = default;\n```",
    "simpleExample": {
      "code": "#include <iostream>\nusing namespace std;\n\nclass Base {\npublic:\n    virtual void show() { cout << \"Base show\" << endl; }\n};\n\nclass Derived : public Base {\npublic:\n    void show() override { cout << \"Derived show\" << endl; }\n};\n\nint main() {\n    Base* ptr = new Derived();\n    ptr->show(); // Prints \"Derived show\" because show() is virtual!\n    delete ptr;\n    return 0;\n}",
      "explanation": "Because show() is virtual, the call through Base* ptr is dynamically resolved to Derived::show at runtime."
    },
    "syntax": "class Base {\npublic:\n    virtual void methodName();\n    virtual ~Base() = default; // Mandatory for polymorphic bases\n};\n\nclass Derived : public Base {\npublic:\n    void methodName() override; // Compiler verifies override\n};",
    "codeExample": "#include <iostream>\nusing namespace std;\n\nclass Animal {\npublic:\n    virtual void sound() {\n        cout << \"Animal sound\" << endl;\n    }\n\n    virtual ~Animal() = default;\n};\n\nclass Dog : public Animal {\npublic:\n    void sound() override {\n        cout << \"Dog barks\" << endl;\n    }\n};\n\nint main() {\n    Animal* animal = new Dog();\n\n    animal->sound();\n\n    delete animal;\n\n    return 0;\n}",
    "expectedOutput": "Dog barks",
    "stepByStep": [
      "1. Class Animal declares virtual void sound() and a virtual destructor.",
      "2. Class Dog publicly inherits from Animal and overrides sound() with the override specifier.",
      "3. In main(), Animal* animal allocates a Dog object on the heap with 'new Dog()'.",
      "4. The invisible vptr inside the Dog instance points to Dog's vtable, where slot 0 points to Dog::sound.",
      "5. Statement animal->sound() performs dynamic dispatch through the vptr, executing Dog::sound().",
      "6. Output 'Dog barks' is emitted to standard output.",
      "7. delete animal triggers dynamic destruction: Dog destructor runs first, followed by Animal destructor."
    ],
    "commonMistakes": [
      {
        "mistake": "Omitting a virtual destructor in a base class deleted via base pointer",
        "codeSnippet": "class Base { public: ~Base() {} }; // Base* p = new Derived(); delete p; LEAK!",
        "correction": "Always declare virtual ~Base() = default; in polymorphic base classes.",
        "explanation": "Deleting through a base pointer without a virtual destructor causes undefined behavior and derived destructor suppression."
      },
      {
        "mistake": "Accidental signature mismatch when intending to override",
        "codeSnippet": "class Base { virtual void print(int x); }; class Derived : public Base { void print(double x); };",
        "correction": "Always append the override specifier: void print(int x) override;",
        "explanation": "Without override, the compiler treats print(double) as a completely different overloaded function, hiding the base version."
      },
      {
        "mistake": "Calling virtual functions inside base class constructors or destructors",
        "codeSnippet": "Base() { sound(); } // Does NOT call Dog::sound()!",
        "correction": "Avoid calling virtual methods in constructors/destructors if derived behavior is expected.",
        "explanation": "During base construction, the derived object has not yet been built; dynamic binding resolves only to the base implementation."
      }
    ],
    "realWorldExample": {
      "scenario": "GUI Framework Cross-Platform Widget Rendering",
      "code": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Widget {\npublic:\n    virtual void render() const = 0; // Pure virtual\n    virtual ~Widget() = default;\n};\n\nclass Button : public Widget {\npublic:\n    void render() const override { cout << \"[GUI] Rendering interactive Button\" << endl; }\n};\n\nclass Slider : public Widget {\npublic:\n    void render() const override { cout << \"[GUI] Rendering draggable Slider\" << endl; }\n};\n\nint main() {\n    vector<Widget*> screenWidgets;\n    screenWidgets.push_back(new Button());\n    screenWidgets.push_back(new Slider());\n\n    for (Widget* w : screenWidgets) {\n        w->render(); // Uniform runtime dispatch\n        delete w;\n    }\n    return 0;\n}",
      "explanation": "Windowing frameworks (Qt, Unreal Slate) store polymorphic Widget pointers in render lists, dynamically dispatching to specific button, slider, and text implementations."
    },
    "practice": {
      "prompt": "Create base class Notification with virtual void send() const { cout << 'Standard notification' << endl; } and virtual ~Notification() = default;. Derive class EmailNotification overriding send() to print 'Sending Email alert!'. In main(), declare Notification* n = new EmailNotification(), call n->send(), and delete n.",
      "starterCode": "#include <iostream>\nusing namespace std;\n\n// Implement Notification and EmailNotification classes\n\nint main() {\n    // Polymorphic invocation and cleanup\n    return 0;\n}",
      "expectedOutputMatcher": "Sending Email alert!",
      "hint": "Declare EmailNotification : public Notification and use void send() const override { ... }",
      "solution": "#include <iostream>\nusing namespace std;\n\nclass Notification {\npublic:\n    virtual void send() const {\n        cout << \"Standard notification\" << endl;\n    }\n    virtual ~Notification() = default;\n};\n\nclass EmailNotification : public Notification {\npublic:\n    void send() const override {\n        cout << \"Sending Email alert!\" << endl;\n    }\n};\n\nint main() {\n    Notification* n = new EmailNotification();\n    n->send();\n    delete n;\n    return 0;\n}"
    },
    "quiz": [
      {
        "id": "mcq-cpp-oop-virt-1",
        "question": "What keyword is required in C++ to enable runtime dynamic dispatch on a member function?",
        "options": [
          "override",
          "virtual",
          "dynamic",
          "polymorphic"
        ],
        "correctIndex": 1,
        "explanation": "The virtual keyword instructs the compiler to generate vtable dispatch for dynamic binding."
      },
      {
        "id": "mcq-cpp-oop-virt-2",
        "question": "What is the primary benefit of the C++11 'override' specifier?",
        "options": [
          "It makes the function run twice as fast",
          "It instructs the compiler to catch signature mismatches or spelling errors at compile time",
          "It forces the function to be inlined",
          "It makes the function accessible from other threads"
        ],
        "correctIndex": 1,
        "explanation": "override ensures compile-time validation that a matching virtual base function exists."
      },
      {
        "id": "mcq-cpp-oop-virt-3",
        "question": "What critical issue occurs if a polymorphic base class does NOT have a virtual destructor when deleting via base pointer?",
        "options": [
          "Compilation error occurs on line 1",
          "The derived class destructor is not called, causing resource and memory leaks",
          "The base class destructor is called twice",
          "The pointer is automatically set to nullptr"
        ],
        "correctIndex": 1,
        "explanation": "Non-virtual destructors cause static binding to ~Base(), skipping ~Derived() entirely and leaking derived resources."
      },
      {
        "id": "mcq-cpp-oop-virt-4",
        "question": "What data structure does the C++ compiler construct to manage virtual function lookups?",
        "options": [
          "Hash map",
          "Virtual Method Table (vtable)",
          "Linked list",
          "Binary search tree"
        ],
        "correctIndex": 1,
        "explanation": "The compiler creates a vtable containing pointers to the overridden virtual functions for each class."
      },
      {
        "id": "mcq-cpp-oop-virt-5",
        "question": "What will be printed by the lesson code example:\nAnimal* animal = new Dog();\nanimal->sound();\ndelete animal;",
        "options": [
          "Animal sound",
          "Dog barks",
          "Animal sound Dog barks",
          "Compilation Error"
        ],
        "correctIndex": 1,
        "explanation": "Because sound() is virtual, the call dynamically resolves to Dog's implementation: 'Dog barks'."
      }
    ],
    "codingChallenge": {
      "title": "Polymorphic Sensor Stream Processor",
      "difficulty": "Intermediate",
      "problem_statement": "Implement base class Sensor with virtual void readData() const and virtual ~Sensor() = default;. Create derived classes TemperatureSensor and PressureSensor. In TemperatureSensor::readData(), print 'Sensor [TEMP]: 23.5 C'. In PressureSensor::readData(), print 'Sensor [PRESSURE]: 1013 hPa'. In main(), create an array of Sensor* pointers containing one TemperatureSensor and one PressureSensor, iterate through and call readData(), then delete both objects.",
      "input_format": "No input provided.",
      "output_format": "Two lines:\nSensor [TEMP]: 23.5 C\nSensor [PRESSURE]: 1013 hPa",
      "constraints": "Use base class pointers and virtual dispatch.",
      "starter_code": "#include <iostream>\nusing namespace std;\n\n// Implement Sensor, TemperatureSensor, PressureSensor\n\nint main() {\n    // Array of Sensor* pointers, iterate and cleanup\n    return 0;\n}",
      "expected_output": "Sensor [TEMP]: 23.5 C\nSensor [PRESSURE]: 1013 hPa",
      "test_cases": [
        {
          "input": "",
          "expected_output": "Sensor [TEMP]: 23.5 C\nSensor [PRESSURE]: 1013 hPa",
          "is_hidden": false
        }
      ]
    },
    "summary": [
      "Method overriding allows derived classes to redefine base virtual function behaviors.",
      "The virtual keyword enables runtime dynamic dispatch using the virtual method table (vtable).",
      "The C++11 override specifier prevents subtle signature mismatches at compile time.",
      "Always provide a virtual destructor in any class with virtual functions.",
      "Base class pointers calling virtual functions resolve dynamically to the most-derived object implementation."
    ]
  },
  {
    "id": "top-cpp-oop-polymorphism",
    "number": 11,
    "numberDisplay": "11",
    "moduleId": "mod-cpp-oop-core",
    "moduleTitle": "Module 01: Object-Oriented C++ Architecture & Design",
    "title": "Polymorphism in C++",
    "slug": "polymorphism-in-cpp",
    "language": "cpp",
    "shortDescription": "Master compile-time polymorphism (function & operator overloading) vs runtime polymorphism (virtual overriding), uniform interface abstraction, and dynamic binding.",
    "difficulty": "Intermediate",
    "estimatedMinutes": 40,
    "prerequisiteId": "top-cpp-oop-method-overriding-virtual",
    "learningObjectives": [
      "Define polymorphism ('many forms') and analyze its two primary classifications in C++",
      "Compare compile-time (static) polymorphism with runtime (dynamic) polymorphism",
      "Design polymorphic class hierarchies where a single interface operates on distinct concrete subclasses",
      "Apply polymorphism to decouple high-level business logic from low-level implementation details"
    ],
    "conceptExplanation": "### 1. Meaning of Polymorphism\nThe word **polymorphism** is derived from Greek (*poly* = many, *morph* = form). In C++, polymorphism allows an entity—such as a function call, operator, or object pointer—to exhibit different behaviors depending on context and type.\n\n### 2. The Two Forms of Polymorphism in C++\n1. **Compile-Time (Static / Early Binding) Polymorphism**:\n   * Resolved at compile time by the compiler.\n   * Mechanisms: **Function Overloading**, **Operator Overloading**, and **Templates**.\n   * Advantages: Zero runtime performance overhead, fully inlinable by the optimizer.\n2. **Runtime (Dynamic / Late Binding) Polymorphism**:\n   * Resolved at execution time based on the runtime type of the object.\n   * Mechanisms: **Virtual Functions** and **Inheritance**.\n   * Advantages: Extensible at runtime; new derived classes can be added without recompiling callers.\n\n### 3. Compile-Time vs Runtime Polymorphism Comparison\n| Feature | Compile-Time Polymorphism | Runtime Polymorphism |\n| :--- | :--- | :--- |\n| **Resolution Time** | Compile time | Runtime |\n| **Mechanism** | Overloading & Templates | Virtual functions & vtables |\n| **Performance** | Maximum speed, zero runtime overhead | Minimal pointer indirection overhead via vptr |\n| **Flexibility** | High algorithmic flexibility | Dynamic plugin architecture & heterogeneous collections |\n| **Requirements** | Exact types known at compile time | Base class pointer or reference hierarchy |\n\n### 4. Designing Polymorphic Hierarchies (Shape Hierarchy)\nConsider a graphics rendering subsystem:\n```\n           [Shape] (Base Interface: draw(), area())\n           /      |          [Circle] [Rectangle] [Triangle]\n```\nA rendering loop simply processes `vector<Shape*> shapes; for (auto s : shapes) s->draw();`.\nThe client code does not know or care whether a shape is a circle or rectangle! The runtime vtable dynamically routes the call to the appropriate rendering logic.",
    "simpleExample": {
      "code": "#include <iostream>\nusing namespace std;\n\n// Compile-Time Polymorphism (Function Overloading)\nclass MathUtil {\npublic:\n    int add(int a, int b) { return a + b; }\n    double add(double a, double b) { return a + b; }\n    string add(string a, string b) { return a + b; }\n};\n\nint main() {\n    MathUtil m;\n    cout << m.add(5, 10) << endl;         // Calls int version\n    cout << m.add(3.5, 4.5) << endl;     // Calls double version\n    cout << m.add(\"C++\", \"OOP\") << endl; // Calls string version\n    return 0;\n}",
      "explanation": "Function overloading exhibits compile-time polymorphism: the compiler selects the matching overload based on argument types."
    },
    "syntax": "// Runtime Polymorphic Interface\nclass BaseInterface {\npublic:\n    virtual void execute() const = 0;\n    virtual ~BaseInterface() = default;\n};\n\nvoid runWorkflow(const BaseInterface& worker) {\n    worker.execute(); // Uniform polymorphic call\n}",
    "codeExample": "#include <iostream>\n#include <vector>\nusing namespace std;\n\n// Base polymorphic interface\nclass Shape {\npublic:\n    virtual void draw() const {\n        cout << \"Drawing Generic Shape\" << endl;\n    }\n    virtual ~Shape() = default;\n};\n\nclass Circle : public Shape {\npublic:\n    void draw() const override {\n        cout << \"Drawing Circle (Radius: 5)\" << endl;\n    }\n};\n\nclass Rectangle : public Shape {\npublic:\n    void draw() const override {\n        cout << \"Drawing Rectangle (10 x 20)\" << endl;\n    }\n};\n\nclass Triangle : public Shape {\npublic:\n    void draw() const override {\n        cout << \"Drawing Triangle (Base: 8, Height: 6)\" << endl;\n    }\n};\n\nint main() {\n    // Heterogeneous collection of shapes managed via base pointers\n    vector<Shape*> canvas;\n    canvas.push_back(new Circle());\n    canvas.push_back(new Rectangle());\n    canvas.push_back(new Triangle());\n\n    cout << \"--- Rendering Canvas ---\" << endl;\n    for (const Shape* shape : canvas) {\n        shape->draw(); // Polymorphic dispatch\n    }\n\n    // Clean up\n    for (Shape* shape : canvas) {\n        delete shape;\n    }\n\n    return 0;\n}",
    "expectedOutput": "--- Rendering Canvas ---\nDrawing Circle (Radius: 5)\nDrawing Rectangle (10 x 20)\nDrawing Triangle (Base: 8, Height: 6)",
    "stepByStep": [
      "1. Base class Shape defines virtual void draw() and a virtual destructor.",
      "2. Circle, Rectangle, and Triangle derive publicly from Shape and override draw().",
      "3. In main(), a std::vector<Shape*> holds pointers to dynamically allocated Circle, Rectangle, and Triangle objects.",
      "4. The loop iterates through each Shape* pointer and invokes shape->draw().",
      "5. For canvas[0], the vtable resolves to Circle::draw(); prints 'Drawing Circle (Radius: 5)'.",
      "6. For canvas[1], the vtable resolves to Rectangle::draw(); prints 'Drawing Rectangle (10 x 20)'.",
      "7. For canvas[2], the vtable resolves to Triangle::draw(); prints 'Drawing Triangle (Base: 8, Height: 6)'.",
      "8. The cleanup loop executes delete shape, properly invoking derived destructors thanks to virtual ~Shape()."
    ],
    "commonMistakes": [
      {
        "mistake": "Object slicing when storing derived objects by value in base containers",
        "codeSnippet": "vector<Shape> canvas; canvas.push_back(Circle()); // Object Slicing!",
        "correction": "Store pointers or references: vector<Shape*> or vector<unique_ptr<Shape>>.",
        "explanation": "Storing derived objects by value strips away derived data members and vtables, retaining only the base sub-object."
      },
      {
        "mistake": "Confusing function overloading (compile-time) with function overriding (runtime)",
        "codeSnippet": "// Overloading: same scope, different parameters; Overriding: derived scope, same parameter signature",
        "correction": "Use overloading for type variations within a class, and overriding for specialized polymorphic behaviors across inheritance.",
        "explanation": "Overloading is statically bound; overriding uses dynamic dispatch."
      },
      {
        "mistake": "Using manual type checks (dynamic_cast / typeid) instead of polymorphic methods",
        "codeSnippet": "if (typeid(*shape) == typeid(Circle)) { ... } else if (typeid(*shape) == typeid(Rectangle)) ...",
        "correction": "Encapsulate the differentiated behavior directly into a virtual method.",
        "explanation": "Cascading type checks defeat the purpose of object-oriented design and violate the Open-Closed Principle."
      }
    ],
    "realWorldExample": {
      "scenario": "Payment Processing Gateway",
      "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass PaymentMethod {\npublic:\n    virtual bool processPayment(double amount) const = 0;\n    virtual ~PaymentMethod() = default;\n};\n\nclass CreditCard : public PaymentMethod {\npublic:\n    bool processPayment(double amount) const override {\n        cout << \"[Gateway] Charged $\" << amount << \" to Credit Card (Visa).\" << endl;\n        return true;\n    }\n};\n\nclass CryptoWallet : public PaymentMethod {\npublic:\n    bool processPayment(double amount) const override {\n        cout << \"[Gateway] Sent $\" << amount << \" equivalent in Ethereum.\" << endl;\n        return true;\n    }\n};\n\nvoid checkout(const PaymentMethod& method, double total) {\n    method.processPayment(total);\n}\n\nint main() {\n    CreditCard cc;\n    CryptoWallet eth;\n\n    checkout(cc, 150.0);\n    checkout(eth, 89.99);\n    return 0;\n}",
      "explanation": "E-commerce checkout pipelines pass payment methods polymorphically, allowing new payment providers to be added without touching the checkout engine."
    },
    "practice": {
      "prompt": "Create base class Document with virtual void open() const and virtual ~Document() = default;. Create derived classes PDFDocument and WordDocument overriding open() to print 'Opening PDF file...' and 'Opening Word file...' respectively. In main(), create an array of Document* with one PDFDocument and one WordDocument, loop and call open(), then delete both.",
      "starterCode": "#include <iostream>\nusing namespace std;\n\n// Implement Document hierarchy\n\nint main() {\n    // Array of Document* pointers, call open, delete\n    return 0;\n}",
      "expectedOutputMatcher": "Opening PDF file...\nOpening Word file...",
      "hint": "Use Document* docs[2] = { new PDFDocument(), new WordDocument() };",
      "solution": "#include <iostream>\nusing namespace std;\n\nclass Document {\npublic:\n    virtual void open() const = 0;\n    virtual ~Document() = default;\n};\n\nclass PDFDocument : public Document {\npublic:\n    void open() const override {\n        cout << \"Opening PDF file...\" << endl;\n    }\n};\n\nclass WordDocument : public Document {\npublic:\n    void open() const override {\n        cout << \"Opening Word file...\" << endl;\n    }\n};\n\nint main() {\n    Document* docs[2] = { new PDFDocument(), new WordDocument() };\n    for (int i = 0; i < 2; i++) {\n        docs[i]->open();\n        delete docs[i];\n    }\n    return 0;\n}"
    },
    "quiz": [
      {
        "id": "mcq-cpp-oop-poly-1",
        "question": "What is the primary difference between compile-time polymorphism and runtime polymorphism?",
        "options": [
          "Compile-time polymorphism uses virtual functions, while runtime polymorphism uses templates",
          "Compile-time polymorphism is resolved during compilation (overloading/templates), while runtime polymorphism is resolved dynamically via vtables",
          "Compile-time polymorphism only works on integers",
          "Runtime polymorphism cannot use classes"
        ],
        "correctIndex": 1,
        "explanation": "Compile-time polymorphism resolves function signatures statically; runtime polymorphism resolves targets dynamically at execution time."
      },
      {
        "id": "mcq-cpp-oop-poly-2",
        "question": "What is 'Object Slicing' in C++?",
        "options": [
          "Splitting a string into characters",
          "Assigning a derived class object to a base class value object, which discards the derived member variables and vtable",
          "Dividing an array in half during binary search",
          "Deallocating half of an object's heap memory"
        ],
        "correctIndex": 1,
        "explanation": "Object slicing occurs when copying a derived object into a base value type, truncating derived state and polymorphic dispatch."
      },
      {
        "id": "mcq-cpp-oop-poly-3",
        "question": "Which of the following is an example of compile-time polymorphism?",
        "options": [
          "Function overloading",
          "Operator overloading",
          "C++ templates",
          "All of the above"
        ],
        "correctIndex": 3,
        "explanation": "Function overloading, operator overloading, and templates are all resolved at compile time with zero runtime overhead."
      },
      {
        "id": "mcq-cpp-oop-poly-4",
        "question": "How should polymorphic objects typically be stored in standard library containers like std::vector?",
        "options": [
          "By value: std::vector<Base>",
          "By pointer or smart pointer: std::vector<Base*> or std::vector<std::unique_ptr<Base>>",
          "By void pointer: std::vector<void*>",
          "Polymorphic objects cannot be stored in vectors"
        ],
        "correctIndex": 1,
        "explanation": "Pointers or smart pointers must be used to preserve dynamic dispatch and prevent object slicing."
      },
      {
        "id": "mcq-cpp-oop-poly-5",
        "question": "What is the key advantage of writing code against polymorphic base class interfaces?",
        "options": [
          "The code compiles in zero milliseconds",
          "New concrete derived classes can be added without modifying or breaking existing calling logic (Open-Closed Principle)",
          "Memory consumption is always zero",
          "It eliminates the need for header files"
        ],
        "correctIndex": 1,
        "explanation": "Polymorphism decouples client code from concrete implementations, adhering to the Open-Closed Principle."
      }
    ],
    "codingChallenge": {
      "title": "Polymorphic Audio Synthesizer Voices",
      "difficulty": "Intermediate",
      "problem_statement": "Create base class Oscillator with virtual void playWaveform() const = 0 and virtual ~Oscillator() = default;. Implement SineOscillator printing 'Playing Sine Wave (Pure Tone)' and SquareOscillator printing 'Playing Square Wave (Rich Harmonics)'. In main(), create a function playSynth(const Oscillator& osc) that calls osc.playWaveform(). Instantiate both oscillators and pass them by reference to playSynth().",
      "input_format": "No input provided.",
      "output_format": "Two lines:\nPlaying Sine Wave (Pure Tone)\nPlaying Square Wave (Rich Harmonics)",
      "constraints": "Pass by const reference to demonstrate polymorphism without pointers.",
      "starter_code": "#include <iostream>\nusing namespace std;\n\n// Implement Oscillator hierarchy and playSynth helper\n\nint main() {\n    // Instantiate oscillators and invoke playSynth\n    return 0;\n}",
      "expected_output": "Playing Sine Wave (Pure Tone)\nPlaying Square Wave (Rich Harmonics)",
      "test_cases": [
        {
          "input": "",
          "expected_output": "Playing Sine Wave (Pure Tone)\nPlaying Square Wave (Rich Harmonics)",
          "is_hidden": false
        }
      ]
    },
    "summary": [
      "Polymorphism enables a common interface to represent multiple distinct concrete forms.",
      "Compile-time polymorphism includes function overloading, operator overloading, and templates.",
      "Runtime polymorphism utilizes virtual functions, dynamic dispatch, and vtables.",
      "Pass polymorphic instances by pointer or reference to prevent object slicing.",
      "Polymorphic architectures satisfy the Open-Closed Principle by allowing extensions without modifying client code."
    ]
  },
  {
    "id": "top-cpp-oop-abstraction-abstract-classes",
    "number": 12,
    "numberDisplay": "12",
    "moduleId": "mod-cpp-oop-core",
    "moduleTitle": "Module 01: Object-Oriented C++ Architecture & Design",
    "title": "Abstraction and Abstract Classes",
    "slug": "abstraction-and-abstract-classes",
    "language": "cpp",
    "shortDescription": "Master data abstraction, pure virtual functions (= 0), abstract base classes, concrete implementations, interface-like design in C++, and architectural separation of concerns.",
    "difficulty": "Intermediate",
    "estimatedMinutes": 40,
    "prerequisiteId": "top-cpp-oop-polymorphism",
    "learningObjectives": [
      "Understand the abstraction pillar: displaying essential features while hiding implementation details",
      "Declare pure virtual functions using the = 0 syntax",
      "Understand why abstract classes cannot be directly instantiated",
      "Design clean C++ interface contracts that concrete derived classes must implement"
    ],
    "conceptExplanation": "### 1. What is Abstraction?\n**Abstraction** is the process of exposing only the essential, high-level features of an entity while concealing the complex, low-level implementation mechanics. For instance, when you drive a car, you interact with the steering wheel, accelerator, and brake pedals (the abstract interface). You do not need to manually regulate fuel injection timing or catalytic converter oxygen sensors (the hidden implementation).\n\n### 2. Pure Virtual Functions (`= 0`)\nA **pure virtual function** is a virtual function declared in a base class that has **no implementation provided in that class** (or serves strictly as a contract):\n```cpp\nvirtual double area() = 0; // Pure virtual function\n```\nThe `= 0` syntax syntax tells the C++ compiler:\n* This function has no default implementation here.\n* Any concrete derived class **must override this function** to be instantiable.\n\n### 3. Abstract Classes in C++\nA class that contains **at least one pure virtual function** is an **Abstract Class**:\n* **Cannot Be Instantiated**: The compiler strictly forbids creating direct objects of an abstract class (`Shape s; // COMPILER ERROR!`).\n* **Can Have Pointers & References**: You **can** declare pointers and references of the abstract class type (`Shape* ptr = new Rectangle();`).\n* **Can Contain Concrete Members**: An abstract class can have member variables, non-pure virtual functions, and regular concrete helper methods.\n\n### 4. Pure Abstract Classes as C++ Interfaces\nWhile C++ does not have an explicit `interface` keyword like Java, a class containing **only pure virtual functions and a virtual destructor** functions as a pure Interface contract:\n```cpp\nclass ISerializable {\npublic:\n    virtual string serialize() const = 0;\n    virtual void deserialize(const string& data) = 0;\n    virtual ~ISerializable() = default;\n};\n```",
    "simpleExample": {
      "code": "#include <iostream>\nusing namespace std;\n\n// Abstract base class\nclass Appliance {\npublic:\n    virtual void turnOn() = 0; // Pure virtual\n    virtual ~Appliance() = default;\n};\n\nclass Fan : public Appliance {\npublic:\n    void turnOn() override {\n        cout << \"Fan spinning blades...\" << endl;\n    }\n};\n\nint main() {\n    // Appliance a; // COMPILER ERROR: Cannot instantiate abstract class!\n    Appliance* app = new Fan();\n    app->turnOn();\n    delete app;\n    return 0;\n}",
      "explanation": "Appliance defines the contract turnOn(). Fan implements it concretely. Direct instantiation of Appliance is prohibited."
    },
    "syntax": "class AbstractBase {\npublic:\n    // Pure virtual function syntax\n    virtual returnType functionName(parameters) = 0;\n    virtual ~AbstractBase() = default;\n};\n\nclass ConcreteClass : public AbstractBase {\npublic:\n    returnType functionName(parameters) override {\n        // Required implementation\n    }\n};",
    "codeExample": "#include <iostream>\nusing namespace std;\n\nclass Shape {\npublic:\n    virtual double area() = 0;\n    virtual ~Shape() = default;\n};\n\nclass Rectangle : public Shape {\nprivate:\n    double width;\n    double height;\n\npublic:\n    Rectangle(double w, double h)\n        : width(w), height(h) {}\n\n    double area() override {\n        return width * height;\n    }\n};\n\nint main() {\n    Rectangle r(5, 4);\n\n    cout << r.area() << endl;\n\n    return 0;\n}",
    "expectedOutput": "20",
    "stepByStep": [
      "1. Class Shape declares 'virtual double area() = 0;', making Shape an abstract class.",
      "2. Class Rectangle inherits publicly from Shape and provides private dimensions width and height.",
      "3. Rectangle's constructor initializes width to 5 and height to 4.",
      "4. Rectangle overrides the pure virtual function area(), returning width * height (5 * 4 = 20).",
      "5. In main(), Rectangle r(5, 4) is instantiated on the stack.",
      "6. Statement cout << r.area() << endl evaluates Rectangle::area() and prints 20.",
      "7. At main exit, r is safely destroyed."
    ],
    "commonMistakes": [
      {
        "mistake": "Attempting to instantiate an abstract class directly",
        "codeSnippet": "Shape s; // Error: cannot declare variable 's' to be of abstract type 'Shape'",
        "correction": "Instantiate a concrete derived class that implements all pure virtual functions.",
        "explanation": "Abstract classes serve as incomplete blueprints and cannot exist as standalone instances."
      },
      {
        "mistake": "Forgetting to override one of multiple pure virtual functions in a derived class",
        "codeSnippet": "class Derived : public Base { /* implemented 2 of 3 pure virtuals */ }; Derived d; // Error!",
        "correction": "A derived class remains abstract until ALL inherited pure virtual functions are implemented.",
        "explanation": "Missing even a single pure virtual implementation leaves the derived class abstract."
      },
      {
        "mistake": "Omitting the virtual destructor in an abstract base class",
        "codeSnippet": "class Shape { virtual double area() = 0; }; // Missing virtual ~Shape()",
        "correction": "Always include virtual ~Shape() = default; in abstract base classes.",
        "explanation": "Abstract classes are designed for polymorphic deletion; missing virtual destructors cause memory leaks."
      }
    ],
    "realWorldExample": {
      "scenario": "Database Storage Engine Abstraction Layer",
      "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass IDatabaseEngine {\npublic:\n    virtual void executeQuery(const string& query) = 0;\n    virtual ~IDatabaseEngine() = default;\n};\n\nclass PostgresEngine : public IDatabaseEngine {\npublic:\n    void executeQuery(const string& query) override {\n        cout << \"[PostgreSQL Driver] Executing: \" << query << endl;\n    }\n};\n\nclass SQLiteEngine : public IDatabaseEngine {\npublic:\n    void executeQuery(const string& query) override {\n        cout << \"[SQLite In-Memory] Executing: \" << query << endl;\n    }\n};\n\nint main() {\n    IDatabaseEngine* db = new PostgresEngine();\n    db->executeQuery(\"SELECT * FROM users WHERE active = 1;\");\n    delete db;\n\n    db = new SQLiteEngine();\n    db->executeQuery(\"SELECT count(*) FROM orders;\");\n    delete db;\n    return 0;\n}",
      "explanation": "Enterprise applications communicate with databases exclusively through abstract driver interfaces, allowing switching between SQLite, PostgreSQL, or Oracle without rewriting business logic."
    },
    "practice": {
      "prompt": "Create an abstract class Speaker with pure virtual method virtual void speak() const = 0; and virtual destructor. Derive two concrete classes: FrenchSpeaker (printing 'Bonjour!') and SpanishSpeaker (printing 'Hola!'). In main(), declare a Speaker* pointer, point it to a FrenchSpeaker, call speak(), delete it, point it to a SpanishSpeaker, call speak(), and delete it.",
      "starterCode": "#include <iostream>\nusing namespace std;\n\n// Implement Speaker, FrenchSpeaker, SpanishSpeaker\n\nint main() {\n    // Test abstract speaker contract\n    return 0;\n}",
      "expectedOutputMatcher": "Bonjour!\nHola!",
      "hint": "Use Speaker* s = new FrenchSpeaker(); s->speak(); delete s; then repeat for SpanishSpeaker.",
      "solution": "#include <iostream>\nusing namespace std;\n\nclass Speaker {\npublic:\n    virtual void speak() const = 0;\n    virtual ~Speaker() = default;\n};\n\nclass FrenchSpeaker : public Speaker {\npublic:\n    void speak() const override {\n        cout << \"Bonjour!\" << endl;\n    }\n};\n\nclass SpanishSpeaker : public Speaker {\npublic:\n    void speak() const override {\n        cout << \"Hola!\" << endl;\n    }\n};\n\nint main() {\n    Speaker* s = new FrenchSpeaker();\n    s->speak();\n    delete s;\n\n    s = new SpanishSpeaker();\n    s->speak();\n    delete s;\n    return 0;\n}"
    },
    "quiz": [
      {
        "id": "mcq-cpp-oop-abst-1",
        "question": "What syntax makes a virtual function 'pure virtual' in C++?",
        "options": [
          "virtual void func() = pure;",
          "virtual void func() = 0;",
          "pure virtual void func();",
          "abstract void func();"
        ],
        "correctIndex": 1,
        "explanation": "The '= 0' suffix designates a virtual function as pure virtual."
      },
      {
        "id": "mcq-cpp-oop-abst-2",
        "question": "What is an abstract class in C++?",
        "options": [
          "A class with no member variables",
          "A class that contains at least one pure virtual function and cannot be directly instantiated",
          "A class written in assembly",
          "A class with only private members"
        ],
        "correctIndex": 1,
        "explanation": "Any class containing at least one pure virtual function is abstract and cannot be instantiated."
      },
      {
        "id": "mcq-cpp-oop-abst-3",
        "question": "Can you declare a pointer of an abstract class type (e.g., Shape* ptr;)?",
        "options": [
          "No, pointers to abstract classes cause a compilation error",
          "Yes, abstract pointers and references can point to concrete derived instances",
          "Only if the pointer is allocated on the heap",
          "Only if marked static"
        ],
        "correctIndex": 1,
        "explanation": "While abstract classes cannot be instantiated, pointers and references to them are widely used for polymorphic interfaces."
      },
      {
        "id": "mcq-cpp-oop-abst-4",
        "question": "What happens if a derived class fails to implement one of the pure virtual functions inherited from its base class?",
        "options": [
          "The compiler fills in an empty default body",
          "The derived class also becomes an abstract class and cannot be instantiated",
          "A runtime warning is emitted",
          "The missing function is deleted"
        ],
        "correctIndex": 1,
        "explanation": "If any pure virtual function remains unimplemented, the derived class is also considered abstract."
      },
      {
        "id": "mcq-cpp-oop-abst-5",
        "question": "What is the output of the lesson example:\nRectangle r(5, 4);\ncout << r.area() << endl;",
        "options": [
          "9",
          "20",
          "0",
          "Compilation Error"
        ],
        "correctIndex": 1,
        "explanation": "Rectangle implements area() as width * height: 5 * 4 = 20."
      }
    ],
    "codingChallenge": {
      "title": "Abstract Geometric Volume Engine",
      "difficulty": "Intermediate",
      "problem_statement": "Implement abstract class SolidBody with pure virtual function virtual double volume() const = 0; and virtual ~SolidBody() = default;. Create derived classes Cube (private double side; volume = side^3) and Sphere (private double radius; volume = (4.0/3.0) * 3.14159 * radius^3). In main(), instantiate Cube c(3.0) and Sphere s(2.0), and print their rounded volumes: 'Cube: <vol> | Sphere: <vol>'.",
      "input_format": "No input provided.",
      "output_format": "One line: Cube: 27 | Sphere: 33.5103",
      "constraints": "Compute volume accurately according to geometric formulas.",
      "starter_code": "#include <iostream>\nusing namespace std;\n\n// Implement SolidBody, Cube, and Sphere classes\n\nint main() {\n    // Instantiate Cube and Sphere, print volumes\n    return 0;\n}",
      "expected_output": "Cube: 27 | Sphere: 33.5103",
      "test_cases": [
        {
          "input": "",
          "expected_output": "Cube: 27 | Sphere: 33.5103",
          "is_hidden": false
        }
      ]
    },
    "summary": [
      "Abstraction hides implementation complexities, exposing only clean essential interfaces.",
      "Pure virtual functions are declared with '= 0' and define mandatory contract interfaces.",
      "Classes containing pure virtual functions are abstract and cannot be directly instantiated.",
      "Derived classes must implement all pure virtual functions to become concrete instantiable types.",
      "Abstract class pointers and references form the foundation of clean, modular C++ system design."
    ]
  },
  {
    "id": "top-cpp-oop-operator-overloading",
    "number": 13,
    "numberDisplay": "13",
    "moduleId": "mod-cpp-oop-core",
    "moduleTitle": "Module 01: Object-Oriented C++ Architecture & Design",
    "title": "Operator Overloading",
    "slug": "operator-overloading",
    "language": "cpp",
    "shortDescription": "Master operator overloading in C++: arithmetic (+, -), comparison (==, <), stream insertion (<<) and extraction (>>), member vs friend non-member functions, and operator design rules.",
    "difficulty": "Intermediate",
    "estimatedMinutes": 45,
    "prerequisiteId": "top-cpp-oop-abstraction-abstract-classes",
    "learningObjectives": [
      "Understand why operator overloading enables custom types to behave as natural first-class citizens",
      "Overload binary arithmetic operators (+, -) and comparison operators (==, !=, <)",
      "Implement stream insertion (<<) and extraction (>>) using friend non-member functions",
      "Understand operator overloading restrictions (cannot invent new symbols, cannot alter precedence)"
    ],
    "conceptExplanation": "### 1. What is Operator Overloading?\n**Operator overloading** in C++ allows user-defined types (classes and structs) to redefine the behavior of existing C++ operators (such as `+`, `-`, `*`, `==`, `<<`, `[]`). It enables custom objects to be used with standard, intuitive mathematical and stream expressions:\n```cpp\nComplexNumber c1(2, 3), c2(4, 5);\nComplexNumber c3 = c1 + c2; // Natural, intuitive syntax!\ncout << c3 << endl;\n```\n\n### 2. Member vs Non-Member Operator Functions\n1. **Member Operators**:\n   * Invoked on the left-hand operand: `a + b` resolves to `a.operator+(b)`.\n   * Left-hand operand **must** be an instance of the class.\n   * Operators like `=`, `[]`, `()`, and `->` **must** be member functions.\n2. **Non-Member (Friend) Operators**:\n   * Invoked with both operands as arguments: `operator+(a, b)`.\n   * Essential for symmetric operations (e.g., `5 + c1` where the left operand is an `int`).\n   * **Mandatory for stream operators `<<` and `>>`** because the left-hand operand is a stream (`std::ostream&` or `std::istream&`), not your custom class!\n\n### 3. Overloading Stream Insertion `<<`\nThe canonical pattern for `<<`:\n```cpp\nfriend ostream& operator<<(ostream& os, const MyClass& obj) {\n    os << obj.data;\n    return os; // Return stream by reference to allow chaining!\n}\n```\n\n### 4. Operator Overloading Restrictions\n1. **Cannot Invent New Operators**: You cannot create `**`, `<>`, or `@`.\n2. **Cannot Change Precedence or Associativity**: `+` will always have lower precedence than `*`.\n3. **Cannot Change Arity**: Binary operators remain binary; unary operators remain unary.\n4. **Cannot Overload Specific Core Operators**:\n   * `.` (member access)\n   * `.*` (pointer to member)\n   * `::` (scope resolution)\n   * `?:` (ternary conditional)\n   * `sizeof` (size of type)\n   * `typeid` (type info)",
    "simpleExample": {
      "code": "#include <iostream>\nusing namespace std;\n\nclass Vector2D {\npublic:\n    int x, y;\n    Vector2D(int a = 0, int b = 0) : x(a), y(b) {}\n\n    // Overload + operator\n    Vector2D operator+(const Vector2D& other) const {\n        return Vector2D(x + other.x, y + other.y);\n    }\n};\n\nint main() {\n    Vector2D v1(2, 4);\n    Vector2D v2(3, 1);\n    Vector2D v3 = v1 + v2; // v1.operator+(v2)\n    cout << \"(\" << v3.x << \", \" << v3.y << \")\" << endl;\n    return 0;\n}",
      "explanation": "Overloading operator+ enables vector addition syntax v1 + v2."
    },
    "syntax": "// Binary Arithmetic (Member):\nReturnType operator+(const ClassName& rhs) const;\n\n// Stream Insertion (Non-member Friend):\nfriend std::ostream& operator<<(std::ostream& os, const ClassName& obj);\n\n// Equality Comparison (Member):\nbool operator==(const ClassName& rhs) const;",
    "codeExample": "#include <iostream>\nusing namespace std;\n\nclass ComplexNumber {\nprivate:\n    double real;\n    double imag;\n\npublic:\n    ComplexNumber(double r = 0.0, double i = 0.0) : real(r), imag(i) {}\n\n    // Overload + operator\n    ComplexNumber operator+(const ComplexNumber& rhs) const {\n        return ComplexNumber(real + rhs.real, imag + rhs.imag);\n    }\n\n    // Overload == operator\n    bool operator==(const ComplexNumber& rhs) const {\n        return (real == rhs.real) && (imag == rhs.imag);\n    }\n\n    // Overload << stream insertion operator as friend function\n    friend ostream& operator<<(ostream& os, const ComplexNumber& c) {\n        os << c.real;\n        if (c.imag >= 0) os << \" + \" << c.imag << \"i\";\n        else os << \" - \" << -c.imag << \"i\";\n        return os;\n    }\n};\n\nint main() {\n    ComplexNumber c1(3.0, 4.0);\n    ComplexNumber c2(1.5, 2.5);\n\n    ComplexNumber c3 = c1 + c2; // Calls operator+\n    cout << \"c1: \" << c1 << endl;\n    cout << \"c2: \" << c2 << endl;\n    cout << \"c1 + c2 = \" << c3 << endl;\n\n    ComplexNumber c4(4.5, 6.5);\n    cout << \"c3 == c4? \" << (c3 == c4 ? \"Equal\" : \"Not Equal\") << endl;\n\n    return 0;\n}",
    "expectedOutput": "c1: 3 + 4i\nc2: 1.5 + 2.5i\nc1 + c2 = 4.5 + 6.5i\nc3 == c4? Equal",
    "stepByStep": [
      "1. ComplexNumber declares private double fields real and imag.",
      "2. operator+ takes const ComplexNumber& rhs and returns a new ComplexNumber with summed components.",
      "3. operator== compares real and imag components, returning boolean true or false.",
      "4. friend operator<< accepts ostream& and const ComplexNumber&, formats output as 'a + bi', and returns ostream&.",
      "5. In main(), c3 = c1 + c2 computes (3.0 + 1.5) and (4.0 + 2.5) = (4.5, 6.5).",
      "6. cout << 'c1 + c2 = ' << c3 chains stream output through operator<<.",
      "7. c3 == c4 evaluates (4.5 == 4.5 && 6.5 == 6.5), returning true ('Equal')."
    ],
    "commonMistakes": [
      {
        "mistake": "Trying to overload << as a member function of your class",
        "codeSnippet": "ostream& operator<<(ostream& os); // Wrong: requires writing c1 << cout;",
        "correction": "Declare stream operators as non-member friend functions: friend ostream& operator<<(ostream& os, const T& obj);",
        "explanation": "In stream expressions like cout << obj, the left operand is std::cout of type std::ostream."
      },
      {
        "mistake": "Returning ostream by value instead of by reference from operator<<",
        "codeSnippet": "ostream operator<<(ostream os, const T& obj); // Error: std::ostream copy constructor is deleted",
        "correction": "Always accept and return ostream& by reference.",
        "explanation": "Stream objects are non-copyable in C++; they must be passed and returned by reference."
      },
      {
        "mistake": "Violating intuitive mathematical conventions (e.g., making + mutate the left operand)",
        "codeSnippet": "Complex operator+(const Complex& rhs) { real += rhs.real; return *this; }",
        "correction": "Keep + const and return a new instance; use += for in-place mutation.",
        "explanation": "Users expect a + b to leave a unchanged, just like standard primitive numbers."
      }
    ],
    "realWorldExample": {
      "scenario": "Financial Currency and High-Precision Money Arithmetic",
      "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Money {\nprivate:\n    long long cents; // Store in cents to prevent floating point errors\n\npublic:\n    Money(long long dollars, int c) : cents(dollars * 100 + c) {}\n    Money(long long totalCents = 0) : cents(totalCents) {}\n\n    Money operator+(const Money& rhs) const {\n        return Money(cents + rhs.cents);\n    }\n\n    bool operator<(const Money& rhs) const {\n        return cents < rhs.cents;\n    }\n\n    friend ostream& operator<<(ostream& os, const Money& m) {\n        os << \"$\" << (m.cents / 100) << \".\" \n           << ((m.cents % 100 < 10) ? \"0\" : \"\") << (m.cents % 100);\n        return os;\n    }\n};\n\nint main() {\n    Money item1(19, 99);\n    Money item2(5, 50);\n    Money total = item1 + item2;\n    cout << \"Total Invoice: \" << total << endl;\n    return 0;\n}",
      "explanation": "Financial engines represent currency using integer cents and overload + and < to guarantee precise accounting arithmetic without rounding drift."
    },
    "practice": {
      "prompt": "Create a class Fraction with private int num and int den. Provide constructor Fraction(int n, int d). Overload operator* to return Fraction(num * rhs.num, den * rhs.den). Overload friend operator<< to output '<num>/<den>'. In main(), create f1(2, 3) and f2(4, 5), compute Fraction f3 = f1 * f2, and output 'Result: ' << f3.",
      "starterCode": "#include <iostream>\nusing namespace std;\n\n// Implement Fraction class with operator* and operator<<\n\nint main() {\n    // Instantiate fractions, multiply, and display\n    return 0;\n}",
      "expectedOutputMatcher": "Result: 8/15",
      "hint": "Fraction operator*(const Fraction& rhs) const { return Fraction(num * rhs.num, den * rhs.den); }",
      "solution": "#include <iostream>\nusing namespace std;\n\nclass Fraction {\nprivate:\n    int num;\n    int den;\n\npublic:\n    Fraction(int n = 0, int d = 1) : num(n), den(d) {}\n\n    Fraction operator*(const Fraction& rhs) const {\n        return Fraction(num * rhs.num, den * rhs.den);\n    }\n\n    friend ostream& operator<<(ostream& os, const Fraction& f) {\n        os << f.num << \"/\" << f.den;\n        return os;\n    }\n};\n\nint main() {\n    Fraction f1(2, 3);\n    Fraction f2(4, 5);\n    Fraction f3 = f1 * f2;\n    cout << \"Result: \" << f3 << endl;\n    return 0;\n}"
    },
    "quiz": [
      {
        "id": "mcq-cpp-oop-op-1",
        "question": "Which of the following operators CANNOT be overloaded in C++?",
        "options": [
          "operator+",
          "operator[]",
          "operator.",
          "operator<<"
        ],
        "correctIndex": 2,
        "explanation": "The dot (.) operator (member access) cannot be overloaded in C++."
      },
      {
        "id": "mcq-cpp-oop-op-2",
        "question": "Why must the stream insertion operator << be overloaded as a non-member (friend) function rather than a member function?",
        "options": [
          "Because member functions cannot use references",
          "Because the left-hand operand is a std::ostream, not an instance of the custom class",
          "Because friend functions are required for all math operators",
          "Because stream operators only work in C, not C++"
        ],
        "correctIndex": 1,
        "explanation": "In 'cout << obj', the left operand is std::cout (type std::ostream), so the function cannot be a member of obj's class."
      },
      {
        "id": "mcq-cpp-oop-op-3",
        "question": "Can operator overloading in C++ create entirely new operators such as '**' or '@@'?",
        "options": [
          "Yes, any ASCII combination can be created",
          "No, only existing C++ operators can have their behaviors overloaded",
          "Only if defined in a namespace",
          "Only in C++20"
        ],
        "correctIndex": 1,
        "explanation": "C++ strictly forbids creating new operator symbols; only existing operators can be overloaded."
      },
      {
        "id": "mcq-cpp-oop-op-4",
        "question": "Does operator overloading alter operator precedence or associativity in C++?",
        "options": [
          "Yes, you can change precedence using parentheses in declarations",
          "No, operator precedence and associativity are fixed by the language standard and cannot be altered",
          "Only for comparison operators",
          "Only when marked constexpr"
        ],
        "correctIndex": 1,
        "explanation": "Precedence and associativity rules remain unchanged regardless of how an operator is overloaded."
      },
      {
        "id": "mcq-cpp-oop-op-5",
        "question": "Why does operator<< return a reference to std::ostream (ostream&)?",
        "options": [
          "To allow stream operation chaining, such as cout << a << b << c;",
          "Because ostream cannot be declared as a pointer",
          "To flush the CPU buffer",
          "It is required by the Windows API"
        ],
        "correctIndex": 0,
        "explanation": "Returning ostream& allows successive stream insertions to chain together sequentially."
      }
    ],
    "codingChallenge": {
      "title": "2D Coordinate Vector Arithmetic",
      "difficulty": "Intermediate",
      "problem_statement": "Define a class Vec2 with private int x and int y. Implement: (1) Constructor Vec2(int x=0, int y=0). (2) Overload operator+ to add two Vec2 objects. (3) Overload operator- to subtract two Vec2 objects. (4) Overload operator== to check equality. (5) Friend operator<< to print '(x, y)'. In main(), create a(5, 8) and b(2, 3), compute sum = a + b and diff = a - b, then output 'Sum: ' << sum << ' | Diff: ' << diff.",
      "input_format": "No input provided.",
      "output_format": "One line: Sum: (7, 11) | Diff: (3, 5)",
      "constraints": "Keep member variables strictly private and adhere to operator overloading patterns.",
      "starter_code": "#include <iostream>\nusing namespace std;\n\n// Implement Vec2 class\n\nint main() {\n    // Instantiate Vec2 a and b, compute and print sum and diff\n    return 0;\n}",
      "expected_output": "Sum: (7, 11) | Diff: (3, 5)",
      "test_cases": [
        {
          "input": "",
          "expected_output": "Sum: (7, 11) | Diff: (3, 5)",
          "is_hidden": false
        }
      ]
    },
    "summary": [
      "Operator overloading allows custom types to work seamlessly with native C++ operators.",
      "Binary operators can be overloaded as member functions (left operand is this) or non-members.",
      "Stream operators (<<, >>) must be non-member friend functions because std::ostream is the left operand.",
      "Operator precedence, arity, and associativity cannot be altered.",
      "Operators like '.', '::', 'sizeof', and '?:' cannot be overloaded."
    ]
  },
  {
    "id": "top-cpp-oop-composition-relationships",
    "number": 14,
    "numberDisplay": "14",
    "moduleId": "mod-cpp-oop-core",
    "moduleTitle": "Module 01: Object-Oriented C++ Architecture & Design",
    "title": "Object Composition and Relationships",
    "slug": "object-composition-and-relationships",
    "language": "cpp",
    "shortDescription": "Master class relationships in C++: composition ('Has-A'), aggregation, association, object ownership, member initialization lists, and choosing composition over inheritance.",
    "difficulty": "Intermediate",
    "estimatedMinutes": 35,
    "prerequisiteId": "top-cpp-oop-operator-overloading",
    "learningObjectives": [
      "Differentiate between Association, Aggregation, and Composition object relationships",
      "Model strong ownership ('Has-A') through composition using member objects",
      "Properly initialize composed member objects using constructor member initializer lists",
      "Apply the industry design principle: 'Favor object composition over class inheritance'"
    ],
    "conceptExplanation": "### 1. Object Relationships Overview\nIn software engineering, objects do not exist in isolation. They interact through three primary relationships:\n1. **Association**: A loose \"uses-a\" relationship where objects know about each other without owning each other (e.g., a `Student` registers for a `Course`).\n2. **Aggregation**: A \"has-a\" relationship with **weak ownership**. The child object can exist independently of the parent container (e.g., a `Department` has `Teachers`; if the department closes, teachers still exist). Modeled via pointers or references.\n3. **Composition**: A \"has-a\" relationship with **strong ownership** and identical lifecycles. The part cannot exist without the whole (e.g., a `Car` has an `Engine`; if the car is destroyed, its engine is destroyed). Modeled via direct value member objects.\n\n### 2. Relationship Comparison Matrix\n| Relationship | Strength | Lifecycle Coupling | C++ Implementation | Example |\n| :--- | :--- | :--- | :--- | :--- |\n| **Association** | Weak | Completely independent | Pointer or reference parameter (`void f(Doctor* d)`) | Patient uses a Doctor |\n| **Aggregation** | Medium | Independent lifecycles | Container of pointers/references (`vector<Teacher*>`) | Department has Teachers |\n| **Composition** | Strong | Dependent (dies together) | Direct member value object (`Engine engine;`) | Car has an Engine |\n\n### 3. Constructor Initialization of Composed Objects\nWhen a class contains member objects, the member objects' constructors **execute before the body of the enclosing class constructor**.\nAlways initialize member objects in the member initializer list:\n```cpp\nclass Car {\nprivate:\n    Engine engine;\npublic:\n    Car(int hp) : engine(hp) {} // Direct initialization\n};\n```\n\n### 4. Composition vs Inheritance: \"Favor Composition Over Inheritance\"\nThe Gang of Four (GoF) design principle states:\n* Inheritance creates tight coupling and exposes base class internals (white-box reuse).\n* Composition creates loose coupling; behavior is assembled from small, interchangeable components with clean interfaces (black-box reuse).\n* Rule of thumb: If entity A **is a specialized type of** B, use Inheritance. If entity A **consists of** B, use Composition!",
    "simpleExample": {
      "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Engine {\npublic:\n    int horsepower;\n    Engine(int hp) : horsepower(hp) {}\n    void start() const { cout << \"Engine (\" << horsepower << \" HP) roaring!\" << endl; }\n};\n\n// Composition: Car OWNS its Engine\nclass Car {\nprivate:\n    string model;\n    Engine engine; // Member object (Composition)\n\npublic:\n    Car(string m, int hp) : model(m), engine(hp) {}\n\n    void drive() const {\n        cout << \"Driving \" << model << \"...\" << endl;\n        engine.start();\n    }\n};\n\nint main() {\n    Car myCar(\"Mustang GT\", 450);\n    myCar.drive();\n    return 0;\n}",
      "explanation": "Car has an Engine as a direct member object. When myCar is created, its Engine is constructed. When myCar is destroyed, the Engine is destroyed."
    },
    "syntax": "// Composition Syntax: Direct Member Object\nclass Part {\npublic:\n    Part(args);\n};\n\nclass Whole {\nprivate:\n    Part partInstance; // Whole owns Part\n\npublic:\n    Whole(args) : partInstance(args) {} // Initializer list\n};",
    "codeExample": "#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\n// 1. Part class: Engine (Used in Composition)\nclass Engine {\nprivate:\n    int cylinders;\n\npublic:\n    Engine(int c) : cylinders(c) {\n        cout << \"[Engine] \" << cylinders << \"-cylinder engine constructed.\" << endl;\n    }\n    ~Engine() {\n        cout << \"[Engine] Engine destroyed.\" << endl;\n    }\n    int getCylinders() const { return cylinders; }\n};\n\n// 2. Whole class: Car (Strong Composition)\nclass Car {\nprivate:\n    string brand;\n    Engine engine; // Composed directly by value\n\npublic:\n    Car(string b, int cyl) : brand(b), engine(cyl) {\n        cout << \"[Car] \" << brand << \" car assembled.\" << endl;\n    }\n    ~Car() {\n        cout << \"[Car] \" << brand << \" car dismantled.\" << endl;\n    }\n\n    void printSpecs() const {\n        cout << brand << \" equipped with a \" << engine.getCylinders() << \"-cylinder power unit.\" << endl;\n    }\n};\n\nint main() {\n    {\n        cout << \"--- Assembling Car ---\" << endl;\n        Car car1(\"Porsche\", 6);\n        car1.printSpecs();\n        cout << \"--- Leaving Scope ---\" << endl;\n    }\n    return 0;\n}",
    "expectedOutput": "--- Assembling Car ---\n[Engine] 6-cylinder engine constructed.\n[Car] Porsche car assembled.\nPorsche equipped with a 6-cylinder power unit.\n--- Leaving Scope ---\n[Car] Porsche car dismantled.\n[Engine] Engine destroyed.",
    "stepByStep": [
      "1. In Car constructor, member initializer list invokes Engine(cyl) before Car constructor body executes.",
      "2. Engine prints '[Engine] 6-cylinder engine constructed.'.",
      "3. Car constructor body executes; prints '[Car] Porsche car assembled.'.",
      "4. car1.printSpecs() reads cylinders from the encapsulated engine member.",
      "5. When car1 leaves block scope, destruction occurs in reverse order.",
      "6. Car destructor executes first; prints '[Car] Porsche car dismantled.'.",
      "7. Member object Engine destructor executes next; prints '[Engine] Engine destroyed.'."
    ],
    "commonMistakes": [
      {
        "mistake": "Using inheritance where composition is the semantically correct relationship",
        "codeSnippet": "class Car : public Engine { ... }; // Anti-pattern: Car is NOT an engine",
        "correction": "Use composition: class Car { private: Engine engine; };",
        "explanation": "Inheritance should only be used when Liskov substitution applies ('Is-A'). A car has an engine, so composition is appropriate."
      },
      {
        "mistake": "Failing to initialize composed member objects that lack default constructors in initializer list",
        "codeSnippet": "class Car { Engine e; Car(int hp) { e = Engine(hp); } }; // Error: no default constructor for Engine",
        "correction": "Initialize in the initializer list: Car(int hp) : e(hp) {}",
        "explanation": "If a member object has no default constructor, the compiler cannot allocate it before entering the constructor body."
      },
      {
        "mistake": "Confusing Aggregation (pointers to independent objects) with Composition (owned value objects)",
        "codeSnippet": "// Deleting parent object in aggregation destroys shared external objects mistakenly",
        "correction": "In aggregation, the parent does not own the lifetime of the pointed-to object.",
        "explanation": "Only delete child objects if the relationship dictates strict ownership."
      }
    ],
    "realWorldExample": {
      "scenario": "Computer Architecture Component Hierarchy",
      "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass CPU {\npublic:\n    string model;\n    CPU(string m) : model(m) {}\n};\n\nclass RAM {\npublic:\n    int gigabytes;\n    RAM(int gb) : gigabytes(gb) {}\n};\n\nclass Laptop {\nprivate:\n    string brand;\n    CPU processor; // Composition\n    RAM memory;    // Composition\n\npublic:\n    Laptop(string b, string cpuModel, int ramGb)\n        : brand(b), processor(cpuModel), memory(ramGb) {}\n\n    void displaySpecs() const {\n        cout << brand << \" Laptop | CPU: \" << processor.model \n             << \" | RAM: \" << memory.gigabytes << \"GB\" << endl;\n    }\n};\n\nint main() {\n    Laptop macbook(\"Apple M3 Max\", \"16-Core\", 36);\n    macbook.displaySpecs();\n    return 0;\n}",
      "explanation": "Hardware component architectures model motherboards and laptops through composition of CPUs, GPUs, and memory units."
    },
    "practice": {
      "prompt": "Create class Battery with private int capacityMah and constructor Battery(int cap). Add method int getCapacity() const. Create class Smartphone with private string model and member object Battery battery. Constructor: Smartphone(string m, int cap) : model(m), battery(cap) {}. Add method showDetails() printing 'Phone: <model> | Battery: <cap> mAh'. In main(), create Smartphone p('Galaxy S24', 4000) and call showDetails().",
      "starterCode": "#include <iostream>\n#include <string>\nusing namespace std;\n\n// Implement Battery and Smartphone composition\n\nint main() {\n    // Instantiate Smartphone and print details\n    return 0;\n}",
      "expectedOutputMatcher": "Phone: Galaxy S24 | Battery: 4000 mAh",
      "hint": "Initialize battery in Smartphone constructor: Smartphone(string m, int c) : model(m), battery(c) {}",
      "solution": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Battery {\nprivate:\n    int capacityMah;\n\npublic:\n    Battery(int cap) : capacityMah(cap) {}\n    int getCapacity() const { return capacityMah; }\n};\n\nclass Smartphone {\nprivate:\n    string model;\n    Battery battery;\n\npublic:\n    Smartphone(string m, int cap) : model(m), battery(cap) {}\n\n    void showDetails() const {\n        cout << \"Phone: \" << model << \" | Battery: \" << battery.getCapacity() << \" mAh\" << endl;\n    }\n};\n\nint main() {\n    Smartphone p(\"Galaxy S24\", 4000);\n    p.showDetails();\n    return 0;\n}"
    },
    "quiz": [
      {
        "id": "mcq-cpp-oop-comp-1",
        "question": "What type of relationship is represented by object composition in C++?",
        "options": [
          "Is-A relationship",
          "Has-A relationship",
          "Inherits-From relationship",
          "Static relationship"
        ],
        "correctIndex": 1,
        "explanation": "Composition represents a 'Has-A' ownership relationship (e.g., a Car has an Engine)."
      },
      {
        "id": "mcq-cpp-oop-comp-2",
        "question": "In what order are member objects constructed when an enclosing class instance is instantiated?",
        "options": [
          "The enclosing class constructor body executes before member objects are constructed",
          "Member objects are constructed first (in order of declaration) before the enclosing class constructor body executes",
          "At random times during program startup",
          "Member objects are only constructed when accessed"
        ],
        "correctIndex": 1,
        "explanation": "Member objects are fully initialized in the member initializer list before the enclosing class body begins execution."
      },
      {
        "id": "mcq-cpp-oop-comp-3",
        "question": "What is the key difference between Composition and Aggregation?",
        "options": [
          "Composition is weak ownership with independent lifecycles; Aggregation is strong ownership",
          "Composition is strong ownership where parts die with the whole; Aggregation is weak ownership where parts exist independently",
          "Composition only works with structs, while Aggregation only works with classes",
          "There is no difference; they are exact synonyms"
        ],
        "correctIndex": 1,
        "explanation": "In composition, the child cannot exist without the parent (bound lifecycles). In aggregation, children exist independently."
      },
      {
        "id": "mcq-cpp-oop-comp-4",
        "question": "Why does modern software engineering recommend 'Favor composition over inheritance'?",
        "options": [
          "Inheritance creates tight compile-time coupling, whereas composition creates loose, interchangeable modular components",
          "Composition executes with zero CPU cycles",
          "Inheritance is unsupported in 64-bit C++",
          "Composition allows variables to be renamed at runtime"
        ],
        "correctIndex": 0,
        "explanation": "Composition provides loose coupling and black-box reuse without exposing internal implementation details."
      },
      {
        "id": "mcq-cpp-oop-comp-5",
        "question": "If class Library has a member std::vector<Book*> books where books can exist outside the library, what relationship is this?",
        "options": [
          "Composition",
          "Aggregation",
          "Inheritance",
          "Polymorphism"
        ],
        "correctIndex": 1,
        "explanation": "Because books exist independently of the library and are stored via pointer references, this is an Aggregation relationship."
      }
    ],
    "codingChallenge": {
      "title": "Hospital Department Staffing Aggregation",
      "difficulty": "Intermediate",
      "problem_statement": "Implement class Doctor with public string name and string specialty, and constructor Doctor(string n, string s). Implement class Department with private string deptName and member std::vector<Doctor*> doctors (Aggregation). Provide addDoctor(Doctor* d) and showRoster() const printing 'Department: <deptName>' followed by each doctor '  - Dr. <name> (<specialty>)'. In main(), create two Doctor stack instances: d1('Alice Grey', 'Cardiology') and d2('Bob Vance', 'Neurology'). Add both to Department 'Trauma Center' and display the roster.",
      "input_format": "No input provided.",
      "output_format": "Three lines:\nDepartment: Trauma Center\n  - Dr. Alice Grey (Cardiology)\n  - Dr. Bob Vance (Neurology)",
      "constraints": "Model aggregation using pointers without transferring ownership.",
      "starter_code": "#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\n// Implement Doctor and Department classes\n\nint main() {\n    // Test hospital aggregation roster\n    return 0;\n}",
      "expected_output": "Department: Trauma Center\n  - Dr. Alice Grey (Cardiology)\n  - Dr. Bob Vance (Neurology)",
      "test_cases": [
        {
          "input": "",
          "expected_output": "Department: Trauma Center\n  - Dr. Alice Grey (Cardiology)\n  - Dr. Bob Vance (Neurology)",
          "is_hidden": false
        }
      ]
    },
    "summary": [
      "Composition represents strong 'Has-A' ownership where member lifecycles are bound to the enclosing object.",
      "Aggregation represents weak 'Has-A' ownership where referenced objects exist independently.",
      "Member objects must be initialized in the constructor's member initializer list.",
      "Member objects are constructed before the enclosing class constructor body and destroyed after the enclosing destructor.",
      "Favoring composition over inheritance results in loosely coupled, modular, and maintainable architectures."
    ]
  },
  {
    "id": "top-cpp-oop-copy-semantics-shallow-deep",
    "number": 15,
    "numberDisplay": "15",
    "moduleId": "mod-cpp-oop-core",
    "moduleTitle": "Module 01: Object-Oriented C++ Architecture & Design",
    "title": "Copy Semantics, Shallow Copy and Deep Copy",
    "slug": "copy-semantics-shallow-deep-copy",
    "language": "cpp",
    "shortDescription": "Master copy constructors, copy assignment operators, the double-deletion bug of shallow copies, deep copy allocation, Rule of Three, Rule of Five, and modern move semantics.",
    "difficulty": "Intermediate",
    "estimatedMinutes": 45,
    "prerequisiteId": "top-cpp-oop-composition-relationships",
    "learningObjectives": [
      "Understand default memberwise shallow copying and the catastrophic double-free pointer bug",
      "Implement deep copy constructors and copy assignment operators with self-assignment guards",
      "Master the classical Rule of Three (Destructor, Copy Constructor, Copy Assignment Operator)",
      "Understand modern C++ move semantics (std::move, rvalue references, Rule of Five and Rule of Zero)"
    ],
    "conceptExplanation": "### 1. The Peril of Default Shallow Copying\nBy default, the C++ compiler synthesizes a copy constructor and copy assignment operator that perform a **shallow copy** (memberwise copy of all fields):\n* For primitive types (`int`, `double`), a shallow copy works perfectly.\n* For **pointers**, a shallow copy merely copies the **memory address**, NOT the underlying heap data!\n* **Result**: Two independent objects point to the **exact same block of heap memory**!\n* When both objects leave scope, both destructors execute `delete ptr;` on the same address. This triggers a catastrophic **Double Deletion / Double Free** runtime crash!\n\n### 2. Deep Copying: The Solution\nA **deep copy** allocates a brand new, independent block of heap memory for the destination object and duplicates the actual values from the source object. Both objects maintain completely isolated memory allocations.\n\n### 3. The Canonical Rule of Three (C++98 / C++03)\nIf a class manages raw heap resources and defines any one of the following, it **must** explicitly define all three:\n1. **Destructor**: To free the resource (`~MyClass()`).\n2. **Copy Constructor**: To perform a deep copy upon initialization (`MyClass(const MyClass& other)`).\n3. **Copy Assignment Operator**: To clean up old resources, guard against self-assignment, and allocate deep copies (`MyClass& operator=(const MyClass& other)`).\n\n### 4. Introduction to Move Semantics (C++11 Rule of Five)\nDeep copying large dynamic buffers (like a 100MB string or vector) can be slow. In C++11, **move semantics** allows transferring ownership of heap memory from temporary (rvalue) objects rather than copying:\n```cpp\n// Move Constructor: Steals the pointer and nulls the source!\nMyClass(MyClass&& other) noexcept : ptr(other.ptr) {\n    other.ptr = nullptr;\n}\n```\nThe **Rule of Five** expands the Rule of Three to include:\n4. **Move Constructor** (`MyClass(MyClass&&)`)\n5. **Move Assignment Operator** (`MyClass& operator=(MyClass&&)`)\n\n### 5. The Rule of Zero\nIn Modern C++, use standard containers (`std::string`, `std::vector`) or smart pointers (`std::unique_ptr`, `std::shared_ptr`). They manage their own memory, meaning your class needs **zero** custom destructors or copy operators!",
    "simpleExample": {
      "code": "#include <iostream>\nusing namespace std;\n\nclass DeepCopyInt {\npublic:\n    int* data;\n\n    DeepCopyInt(int val) {\n        data = new int(val);\n    }\n\n    // Custom Deep Copy Constructor\n    DeepCopyInt(const DeepCopyInt& other) {\n        data = new int(*other.data); // Allocate separate memory!\n    }\n\n    ~DeepCopyInt() {\n        delete data;\n    }\n};\n\nint main() {\n    DeepCopyInt a(42);\n    DeepCopyInt b = a; // Deep copy!\n\n    *b.data = 99; // Mutating b does NOT affect a\n    cout << \"a: \" << *a.data << \" | b: \" << *b.data << endl;\n    return 0; // Both destructors run cleanly without double deletion!\n}",
      "explanation": "b gets its own separate heap integer initialized with a's value. Mutating b leaves a intact, and destruction is safe."
    },
    "syntax": "class DeepBuffer {\nprivate:\n    int* data;\n    int size;\n\npublic:\n    // 1. Destructor\n    ~DeepBuffer() { delete[] data; }\n\n    // 2. Copy Constructor\n    DeepBuffer(const DeepBuffer& other) : size(other.size) {\n        data = new int[size];\n        for (int i = 0; i < size; ++i) data[i] = other.data[i];\n    }\n\n    // 3. Copy Assignment Operator\n    DeepBuffer& operator=(const DeepBuffer& other) {\n        if (this == &other) return *this; // Self-assignment guard!\n        delete[] data;                    // Free existing buffer\n        size = other.size;\n        data = new int[size];             // Allocate new buffer\n        for (int i = 0; i < size; ++i) data[i] = other.data[i];\n        return *this;\n    }\n};",
    "codeExample": "#include <iostream>\nusing namespace std;\n\nclass IntArray {\nprivate:\n    int* arr;\n    int size;\n\npublic:\n    IntArray(int s) : size(s) {\n        arr = new int[size];\n        for (int i = 0; i < size; i++) arr[i] = (i + 1) * 10;\n        cout << \"[Allocated] Buffer of size \" << size << endl;\n    }\n\n    // Deep Copy Constructor\n    IntArray(const IntArray& other) : size(other.size) {\n        arr = new int[size];\n        for (int i = 0; i < size; i++) arr[i] = other.arr[i];\n        cout << \"[Deep Copy Ctor] Cloned buffer of size \" << size << endl;\n    }\n\n    // Deep Copy Assignment Operator\n    IntArray& operator=(const IntArray& other) {\n        cout << \"[Copy Assignment] Invoked\" << endl;\n        if (this == &other) return *this; // Guard against self-assignment!\n\n        delete[] arr; // Release old resource\n        size = other.size;\n        arr = new int[size];\n        for (int i = 0; i < size; i++) arr[i] = other.arr[i];\n        return *this;\n    }\n\n    ~IntArray() {\n        delete[] arr;\n        cout << \"[Destructor] Deallocated buffer\" << endl;\n    }\n\n    void print() const {\n        for (int i = 0; i < size; i++) cout << arr[i] << \" \";\n        cout << endl;\n    }\n};\n\nint main() {\n    cout << \"--- 1. Creating original array ---\" << endl;\n    IntArray a(3);\n    a.print();\n\n    cout << \"\\n--- 2. Deep Copy Construction ---\" << endl;\n    IntArray b = a; // Deep copy constructor\n    b.print();\n\n    cout << \"\\n--- 3. Deep Copy Assignment ---\" << endl;\n    IntArray c(2);\n    c = a; // Deep copy assignment\n    c.print();\n\n    cout << \"\\n--- 4. Exiting scope (All 3 freed safely) ---\" << endl;\n    return 0;\n}",
    "expectedOutput": "--- 1. Creating original array ---\n[Allocated] Buffer of size 3\n10 20 30 \n\n--- 2. Deep Copy Construction ---\n[Deep Copy Ctor] Cloned buffer of size 3\n10 20 30 \n\n--- 3. Deep Copy Assignment ---\n[Allocated] Buffer of size 2\n[Copy Assignment] Invoked\n10 20 30 \n\n--- 4. Exiting scope (All 3 freed safely) ---\n[Destructor] Deallocated buffer\n[Destructor] Deallocated buffer\n[Destructor] Deallocated buffer",
    "stepByStep": [
      "1. IntArray a(3) allocates a heap array of 3 ints: [10, 20, 30].",
      "2. IntArray b = a invokes the deep copy constructor, allocating a separate 3-element heap array for b.",
      "3. IntArray c(2) allocates a 2-element array.",
      "4. Statement c = a invokes the copy assignment operator; it checks self-assignment, deletes c's 2-element array, and allocates a new 3-element copy of a's data.",
      "5. When main exits, c, b, and a destruct in reverse order.",
      "6. Each object deletes its own distinct heap array pointer.",
      "7. Zero double-deletion faults occur, and zero bytes are leaked."
    ],
    "commonMistakes": [
      {
        "mistake": "Failing to check for self-assignment (if (this == &other)) in copy assignment operator",
        "codeSnippet": "IntArray& operator=(const IntArray& other) { delete[] arr; /* copy other.arr */ } // a = a CRASH!",
        "correction": "Always add if (this == &other) return *this; as the first line of operator=.",
        "explanation": "If a user writes a = a;, deleting arr first destroys the very source data you intend to copy!"
      },
      {
        "mistake": "Relying on compiler-generated copy constructor when raw pointers are managed",
        "codeSnippet": "class Buffer { int* p; public: Buffer() { p = new int; } ~Buffer() { delete p; } };",
        "correction": "Implement custom deep copy operations or use std::unique_ptr.",
        "explanation": "Default shallow copy duplicates the pointer address, causing immediate double-deletion crashes."
      },
      {
        "mistake": "Forgetting to return *this by reference from operator=",
        "codeSnippet": "void operator=(const IntArray& other); // Breaks chaining like a = b = c;",
        "correction": "Return IntArray& returning *this.",
        "explanation": "Returning *this allows assignment chaining as expected in standard C++."
      }
    ],
    "realWorldExample": {
      "scenario": "Game Engine Dynamic Texture Buffer Ownership Transfer",
      "code": "#include <iostream>\nusing namespace std;\n\nclass TextureBuffer {\nprivate:\n    int* pixelData;\n    int pixelCount;\n\npublic:\n    TextureBuffer(int count) : pixelCount(count) {\n        pixelData = new int[pixelCount];\n        cout << \"[GPU Texture] Allocated \" << pixelCount << \" pixels.\" << endl;\n    }\n\n    // Move constructor: transfer ownership with ZERO copy overhead!\n    TextureBuffer(TextureBuffer&& other) noexcept\n        : pixelData(other.pixelData), pixelCount(other.pixelCount) {\n        other.pixelData = nullptr; // Invalidate source\n        other.pixelCount = 0;\n        cout << \"[GPU Texture] Stole texture ownership via MOVE.\" << endl;\n    }\n\n    ~TextureBuffer() {\n        delete[] pixelData;\n    }\n};\n\nint main() {\n    TextureBuffer t1(1920 * 1080);\n    TextureBuffer t2 = std::move(t1); // Fast pointer steal, zero pixel copies!\n    return 0;\n}",
      "explanation": "In 3D game engines, move semantics transfer multi-megabyte 4K texture buffers instantaneously by swapping pointers, eliminating frame-rate drops."
    },
    "practice": {
      "prompt": "Write a class Box with private int* valuePtr. Implement constructor Box(int val) allocating valuePtr = new int(val). Implement deep copy constructor Box(const Box& other) allocating separate memory. Implement destructor ~Box() deleting valuePtr. Add method getValue() const returning *valuePtr. In main(), create Box b1(100), copy construct Box b2 = b1, and print 'b1: ' << b1.getValue() << ' | b2: ' << b2.getValue().",
      "starterCode": "#include <iostream>\nusing namespace std;\n\n// Implement Box with deep copy\n\nint main() {\n    // Instantiate b1, copy to b2, print values\n    return 0;\n}",
      "expectedOutputMatcher": "b1: 100 | b2: 100",
      "hint": "Box(const Box& other) : valuePtr(new int(*other.valuePtr)) {}",
      "solution": "#include <iostream>\nusing namespace std;\n\nclass Box {\nprivate:\n    int* valuePtr;\n\npublic:\n    Box(int val) {\n        valuePtr = new int(val);\n    }\n\n    Box(const Box& other) {\n        valuePtr = new int(*other.valuePtr);\n    }\n\n    ~Box() {\n        delete valuePtr;\n    }\n\n    int getValue() const {\n        return *valuePtr;\n    }\n};\n\nint main() {\n    Box b1(100);\n    Box b2 = b1;\n    cout << \"b1: \" << b1.getValue() << \" | b2: \" << b2.getValue() << endl;\n    return 0;\n}"
    },
    "quiz": [
      {
        "id": "mcq-cpp-oop-copy-1",
        "question": "What is the primary danger of a default compiler-generated shallow copy when a class manages raw heap pointers?",
        "options": [
          "The code runs too slowly",
          "Both objects point to the same memory address, causing a double-deletion crash when their destructors execute",
          "The pointer is automatically converted to null",
          "It causes a stack overflow error at compile time"
        ],
        "correctIndex": 1,
        "explanation": "Shallow copy copies the memory address; when both objects leave scope, both call delete on the same address (double-free bug)."
      },
      {
        "id": "mcq-cpp-oop-copy-2",
        "question": "What functions comprise the C++ 'Rule of Three'?",
        "options": [
          "Constructor, Getter, Setter",
          "Destructor, Copy Constructor, Copy Assignment Operator",
          "Virtual method, Pure virtual method, Static method",
          "Stack, Heap, Register"
        ],
        "correctIndex": 1,
        "explanation": "The Rule of Three specifies that any class managing a resource must define a Destructor, Copy Constructor, and Copy Assignment Operator."
      },
      {
        "id": "mcq-cpp-oop-copy-3",
        "question": "Why is the self-assignment check 'if (this == &other) return *this;' essential in a copy assignment operator?",
        "options": [
          "To satisfy the compiler optimizer",
          "To prevent deleting the object's own dynamic memory before copying from itself (e.g. a = a;)",
          "Because assignment operators cannot return void",
          "To prevent infinite recursion"
        ],
        "correctIndex": 1,
        "explanation": "In a self-assignment (a = a), deallocating existing resources would destroy the data before copying it."
      },
      {
        "id": "mcq-cpp-oop-copy-4",
        "question": "What does a Move Constructor do differently from a Copy Constructor in C++11?",
        "options": [
          "A move constructor duplicates every single byte in the buffer",
          "A move constructor transfers ownership of the resource pointer from a temporary source to the destination and nulls the source",
          "A move constructor only works on integers",
          "A move constructor cannot be declared noexcept"
        ],
        "correctIndex": 1,
        "explanation": "Move constructors steal pointer ownership from temporary rvalues without expensive deep copy allocations."
      },
      {
        "id": "mcq-cpp-oop-copy-5",
        "question": "What is the modern C++ 'Rule of Zero'?",
        "options": [
          "A program should contain zero classes",
          "Classes should use modern RAII abstractions (like std::string, std::vector, smart pointers) so they need zero custom destructors or copy operations",
          "Never allocate memory on the heap",
          "All integer variables must be initialized to 0"
        ],
        "correctIndex": 1,
        "explanation": "The Rule of Zero advises relying on standard library RAII types to avoid writing manual memory management code."
      }
    ],
    "codingChallenge": {
      "title": "Deep Cloned Dynamic String Container",
      "difficulty": "Intermediate",
      "problem_statement": "Implement class SimpleString managing a dynamically allocated char* buffer. Provide: (1) Constructor SimpleString(const char* s) calculating length via strlen, allocating new char[len + 1], and copying. (2) Deep copy constructor SimpleString(const SimpleString& other). (3) Destructor deallocating buffer with delete[]. (4) Method print() const that outputs the string. In main(), create s1('Hello Deep Copy'), copy to s2 using copy constructor, and call print() on both.",
      "input_format": "No input provided.",
      "output_format": "Two lines:\nHello Deep Copy\nHello Deep Copy",
      "constraints": "Deep copy must allocate independent heap memory.",
      "starter_code": "#include <iostream>\n#include <cstring>\nusing namespace std;\n\n// Implement SimpleString with deep copy\n\nint main() {\n    // Instantiate s1, copy to s2, and print both\n    return 0;\n}",
      "expected_output": "Hello Deep Copy\nHello Deep Copy",
      "test_cases": [
        {
          "input": "",
          "expected_output": "Hello Deep Copy\nHello Deep Copy",
          "is_hidden": false
        }
      ]
    },
    "summary": [
      "Default shallow copy duplicates pointer addresses, leading to catastrophic double-deletion bugs.",
      "Deep copying allocates distinct heap memory and duplicates underlying data.",
      "The Rule of Three mandates Destructor, Copy Constructor, and Copy Assignment Operator for resource owners.",
      "Always guard against self-assignment in copy assignment operators (if (this == &other) return *this;).",
      "Modern move semantics (Rule of Five) and standard RAII types (Rule of Zero) optimize memory efficiency."
    ]
  },
  {
    "id": "top-cpp-oop-banking-project",
    "number": 16,
    "numberDisplay": "16",
    "moduleId": "mod-cpp-oop-core",
    "moduleTitle": "Module 01: Object-Oriented C++ Architecture & Design",
    "title": "Final Mini Project – Object-Oriented Banking Management System",
    "slug": "final-mini-project-banking-management-system",
    "language": "cpp",
    "shortDescription": "Capstone Project: Design and build a complete console-based Banking Management System integrating classes, encapsulation, inheritance, polymorphism, composition, and transaction history.",
    "difficulty": "Intermediate",
    "estimatedMinutes": 60,
    "prerequisiteId": "top-cpp-oop-copy-semantics-shallow-deep",
    "learningObjectives": [
      "Design a real-world multi-class banking system integrating all core OOP pillars",
      "Implement base Account and derived SavingsAccount/CheckingAccount classes with polymorphic interest & fee calculations",
      "Use composition to record and track structured Transaction logs for each account",
      "Build a robust menu-driven interface with defensive transaction validation and search facilities"
    ],
    "conceptExplanation": "### 1. Project Overview & Requirements\nIn this capstone project, you will build an **Object-Oriented Banking Management System** in modern C++.\n\n#### Functional Requirements:\n1. **Create Customer Accounts**: Support multiple account tiers (Savings Account with interest and Checking Account with overdraft fees).\n2. **Generate Unique Account IDs**: Automatically assign unique IDs using static counter sequencing.\n3. **Deposit & Withdraw Money**: Safely update balances while enforcing business rules and overdraft limits.\n4. **Check Balance & Display Details**: Inspect account status and owner credentials safely.\n5. **Maintain Transaction History**: Use composition to log every credit and debit transaction with timestamps or identifiers.\n6. **Search for Accounts**: Locate accounts by unique account ID within a bank management repository.\n7. **Handle Invalid Transactions**: Reject negative amounts or unauthorized overdrafts gracefully.\n8. **Menu-Driven Interface**: Provide clean console navigation for banking operations.\n\n#### OOP Design Architecture:\n* **Encapsulation**: Account balances and transaction records are private; mutations occur only via validated methods.\n* **Inheritance**: `Account` (Base class) -> `SavingsAccount` and `CheckingAccount` (Derived classes).\n* **Polymorphism**: Base class pointer `Account*` uniformly invokes virtual methods `deposit()`, `withdraw()`, and `display()`.\n* **Composition**: `Account` **has a** `vector<Transaction>` recording its full statement history.\n* **Static Members**: Static variable generates globally unique account numbers.\n\n### 2. Class Architecture Diagram\n```\n                     +---------------------------+\n                     |        Transaction        |\n                     | - transId: int            |\n                     | - type: string            |\n                     | - amount: double          |\n                     +---------------------------+\n                                   ^\n                                   | (1 to many composition)\n                     +---------------------------+\n                     |      Account (Abstract)   |\n                     | - accountId: int          |\n                     | - ownerName: string       |\n                     | # balance: double         |\n                     | - history: vector<Trans>  |\n                     | + deposit(amt): virtual   |\n                     | + withdraw(amt): virtual  |\n                     +---------------------------+\n                                   ^\n                     +-------------+-------------+\n                     |                           |\n        +-------------------------+ +-------------------------+\n        |     SavingsAccount      | |     CheckingAccount     |\n        | - interestRate: double  | | - overdraftLimit: double|\n        | + applyInterest()       | | + withdraw(): override  |\n        +-------------------------+ +-------------------------+\n```",
    "simpleExample": {
      "code": "#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\n// Transaction record representation\nstruct Transaction {\n    int id;\n    string type;\n    double amount;\n};\n\nint main() {\n    vector<Transaction> ledger;\n    ledger.push_back({1, \"DEPOSIT\", 500.0});\n    ledger.push_back({2, \"WITHDRAW\", 150.0});\n\n    cout << \"--- Transaction Ledger ---\" << endl;\n    for (const auto& t : ledger) {\n        cout << \"#\" << t.id << \" [\" << t.type << \"] $\" << t.amount << endl;\n    }\n    return 0;\n}",
      "explanation": "Simple transaction ledger previewing the composition model used in the full banking system."
    },
    "syntax": "// Polymorphic Bank Core Architecture\nclass Account {\nprotected:\n    double balance;\npublic:\n    virtual bool withdraw(double amt) = 0;\n    virtual void printStatement() const = 0;\n    virtual ~Account() = default;\n};",
    "codeExample": "#include <iostream>\n#include <string>\n#include <vector>\n#include <memory>\nusing namespace std;\n\n// 1. Transaction Component (Used in Composition)\nclass Transaction {\npublic:\n    int id;\n    string type;\n    double amount;\n    double balanceAfter;\n\n    Transaction(int tid, string t, double amt, double bal)\n        : id(tid), type(t), amount(amt), balanceAfter(bal) {}\n\n    void print() const {\n        cout << \"  [TX #\" << id << \"] \" << type << \": $\" << amount \n             << \" | Balance: $\" << balanceAfter << endl;\n    }\n};\n\n// 2. Base Polymorphic Account Class\nclass Account {\nprotected:\n    int accountId;\n    string owner;\n    double balance;\n    vector<Transaction> history;\n    int nextTxId;\n    static int globalAccountCounter;\n\npublic:\n    Account(string ownerName, double initialDeposit)\n        : owner(ownerName), balance(initialDeposit), nextTxId(1) {\n        accountId = ++globalAccountCounter;\n        history.push_back(Transaction(nextTxId++, \"INITIAL_DEPOSIT\", initialDeposit, balance));\n    }\n\n    virtual ~Account() = default;\n\n    int getId() const { return accountId; }\n    string getOwner() const { return owner; }\n    double getBalance() const { return balance; }\n\n    virtual void deposit(double amount) {\n        if (amount > 0) {\n            balance += amount;\n            history.push_back(Transaction(nextTxId++, \"DEPOSIT\", amount, balance));\n            cout << \"Deposit successful! New Balance: $\" << balance << endl;\n        } else {\n            cout << \"Error: Deposit amount must be positive.\" << endl;\n        }\n    }\n\n    virtual bool withdraw(double amount) {\n        if (amount > 0 && amount <= balance) {\n            balance -= amount;\n            history.push_back(Transaction(nextTxId++, \"WITHDRAW\", amount, balance));\n            cout << \"Withdrawal successful! Remaining: $\" << balance << endl;\n            return true;\n        }\n        cout << \"Error: Insufficient funds.\" << endl;\n        return false;\n    }\n\n    virtual void displayDetails() const {\n        cout << \"========================================\" << endl;\n        cout << \"Account ID: \" << accountId << \" | Owner: \" << owner << endl;\n        cout << \"Current Balance: $\" << balance << endl;\n        cout << \"Transaction History (\" << history.size() << \" entries):\" << endl;\n        for (const auto& tx : history) {\n            tx.print();\n        }\n        cout << \"========================================\" << endl;\n    }\n};\n\nint Account::globalAccountCounter = 1000;\n\n// 3. Derived Savings Account (Earns Interest)\nclass SavingsAccount : public Account {\nprivate:\n    double interestRate; // e.g. 0.05 for 5%\n\npublic:\n    SavingsAccount(string ownerName, double initialDeposit, double rate = 0.04)\n        : Account(ownerName, initialDeposit), interestRate(rate) {}\n\n    void applyInterest() {\n        double interest = balance * interestRate;\n        balance += interest;\n        history.push_back(Transaction(nextTxId++, \"INTEREST_CREDIT\", interest, balance));\n        cout << \"Interest applied (Rate: \" << (interestRate * 100) << \"%): +$\" \n             << interest << \" | Balance: $\" << balance << endl;\n    }\n\n    void displayDetails() const override {\n        cout << \"[Account Type: SAVINGS (Interest Rate: \" << (interestRate * 100) << \"%)]\" << endl;\n        Account::displayDetails();\n    }\n};\n\n// 4. Derived Checking Account (Allows Overdraft)\nclass CheckingAccount : public Account {\nprivate:\n    double overdraftLimit;\n\npublic:\n    CheckingAccount(string ownerName, double initialDeposit, double overdraft = 500.0)\n        : Account(ownerName, initialDeposit), overdraftLimit(overdraft) {}\n\n    bool withdraw(double amount) override {\n        if (amount > 0 && amount <= (balance + overdraftLimit)) {\n            balance -= amount;\n            history.push_back(Transaction(nextTxId++, \"CHECKING_WITHDRAW\", amount, balance));\n            cout << \"Checking withdrawal approved: -$\" << amount \n                 << \" | Balance: $\" << balance << endl;\n            return true;\n        }\n        cout << \"Error: Overdraft limit exceeded.\" << endl;\n        return false;\n    }\n\n    void displayDetails() const override {\n        cout << \"[Account Type: CHECKING (Overdraft Limit: $\" << overdraftLimit << \")]\" << endl;\n        Account::displayDetails();\n    }\n};\n\nint main() {\n    cout << \"=== OOP BANKING MANAGEMENT SYSTEM ===\" << endl;\n\n    // Polymorphic Bank Portfolio\n    vector<Account*> bankAccounts;\n\n    SavingsAccount* acc1 = new SavingsAccount(\"Jinesh Patel\", 1500.0, 0.05);\n    CheckingAccount* acc2 = new CheckingAccount(\"Sarah Jenkins\", 300.0, 200.0);\n\n    bankAccounts.push_back(acc1);\n    bankAccounts.push_back(acc2);\n\n    cout << \"\\n--- Executing Transactions ---\" << endl;\n    acc1->deposit(500.0);\n    acc1->applyInterest();\n\n    acc2->withdraw(450.0); // Uses overdraft (300 - 450 = -150)\n    acc2->withdraw(500.0); // Exceeds overdraft limit ($200 max) -> Rejected\n\n    cout << \"\\n--- Printing Statements via Polymorphism ---\" << endl;\n    for (Account* acc : bankAccounts) {\n        acc->displayDetails();\n    }\n\n    // Cleanup\n    for (Account* acc : bankAccounts) {\n        delete acc;\n    }\n\n    cout << \"\\nSystem shut down successfully. All memory deallocated.\" << endl;\n    return 0;\n}",
    "expectedOutput": "=== OOP BANKING MANAGEMENT SYSTEM ===\n\n--- Executing Transactions ---\nDeposit successful! New Balance: $2000\nInterest applied (Rate: 5%): +$100 | Balance: $2100\nChecking withdrawal approved: -$450 | Balance: $-150\nError: Overdraft limit exceeded.\n\n--- Printing Statements via Polymorphism ---\n[Account Type: SAVINGS (Interest Rate: 5%)]\n========================================\nAccount ID: 1001 | Owner: Jinesh Patel\nCurrent Balance: $2100\nTransaction History (3 entries):\n  [TX #1] INITIAL_DEPOSIT: $1500 | Balance: $1500\n  [TX #2] DEPOSIT: $500 | Balance: $2000\n  [TX #3] INTEREST_CREDIT: $100 | Balance: $2100\n========================================\n[Account Type: CHECKING (Overdraft Limit: $200)]\n========================================\nAccount ID: 1002 | Owner: Sarah Jenkins\nCurrent Balance: $-150\nTransaction History (2 entries):\n  [TX #1] INITIAL_DEPOSIT: $300 | Balance: $300\n  [TX #2] CHECKING_WITHDRAW: $450 | Balance: $-150\n========================================\n\nSystem shut down successfully. All memory deallocated.",
    "stepByStep": [
      "1. Static counter Account::globalAccountCounter initializes to 1000.",
      "2. SavingsAccount acc1 is instantiated for 'Jinesh Patel' with $1500 deposit; account ID 1001 is assigned.",
      "3. CheckingAccount acc2 is instantiated for 'Sarah Jenkins' with $300 deposit; account ID 1002 is assigned.",
      "4. acc1 deposits $500 (balance $2000) and applies 5% interest (+$100, balance $2100). Each action logs a Transaction.",
      "5. acc2 withdraws $450; checking balance + $200 overdraft allows the transaction, resulting in balance $-150.",
      "6. acc2 attempts a $500 withdrawal; rejected because it exceeds the remaining overdraft allowance.",
      "7. Polymorphic loop iterates over vector<Account*>, invoking displayDetails() dynamically on each account type.",
      "8. Polymorphic destruction frees all heap accounts cleanly without resource leaks."
    ],
    "commonMistakes": [
      {
        "mistake": "Failing to declare virtual ~Account() = default in the base class",
        "codeSnippet": "class Account { ~Account() {} }; // Deleting via Account* leaks derived memory!",
        "correction": "Always declare virtual ~Account() = default; in polymorphic hierarchies.",
        "explanation": "Deleting derived accounts like SavingsAccount through Account* requires a virtual destructor."
      },
      {
        "mistake": "Storing transactions as plain text strings rather than structured objects",
        "codeSnippet": "vector<string> history; // Poor design: cannot query amount or type numerically",
        "correction": "Use composition with a dedicated Transaction class containing typed fields.",
        "explanation": "Structured classes allow auditing, filtering, summing, and serialization."
      },
      {
        "mistake": "Hardcoding account numbers instead of using a static sequence generator",
        "codeSnippet": "int accountId = 123; // Duplicate account numbers across users!",
        "correction": "Use a private static int nextId counter in the base class.",
        "explanation": "Static counters ensure guaranteed uniqueness for all instantiated accounts."
      }
    ],
    "realWorldExample": {
      "scenario": "Commercial Banking Core Transaction Processing",
      "code": "#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\n// Production banking cores utilize multi-tier auditing\nclass CoreBankingLedger {\npublic:\n    static void auditLog(int accountId, const string& action, double amount) {\n        cout << \"[AUDIT SECURE LOG] Acc #\" << accountId << \" | \" << action \n             << \" | Amount: $\" << amount << endl;\n    }\n};\n\nint main() {\n    CoreBankingLedger::auditLog(1001, \"INTERBANK_WIRE\", 1250000.00);\n    return 0;\n}",
      "explanation": "Modern core banking systems run C++ backend engines processing hundreds of thousands of transactions per second with strict audit logging."
    },
    "practice": {
      "prompt": "Extend the banking system: Write a simplified MiniBank with class Account having private int id, string name, double balance. Implement deposit(double amt), withdraw(double amt), and display() const. In main(), create account 5001 for 'Alex', deposit 300, withdraw 100, and display formatted as 'Acc #5001 (Alex): $200'.",
      "starterCode": "#include <iostream>\n#include <string>\nusing namespace std;\n\n// Implement MiniBank Account\n\nint main() {\n    // Test MiniBank Account\n    return 0;\n}",
      "expectedOutputMatcher": "Acc #5001 (Alex): $200",
      "hint": "Start with 0 balance, deposit 300, withdraw 100, print formatted output.",
      "solution": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Account {\nprivate:\n    int id;\n    string name;\n    double balance;\n\npublic:\n    Account(int i, string n) : id(i), name(n), balance(0.0) {}\n\n    void deposit(double amt) {\n        if (amt > 0) balance += amt;\n    }\n\n    void withdraw(double amt) {\n        if (amt > 0 && amt <= balance) balance -= amt;\n    }\n\n    void display() const {\n        cout << \"Acc #\" << id << \" (\" << name << \"): $\" << balance << endl;\n    }\n};\n\nint main() {\n    Account acc(5001, \"Alex\");\n    acc.deposit(300.0);\n    acc.withdraw(100.0);\n    acc.display();\n    return 0;\n}"
    },
    "quiz": [
      {
        "id": "mcq-cpp-oop-bank-1",
        "question": "Which OOP concept is utilized when Account contains a std::vector<Transaction> to record its statement history?",
        "options": [
          "Inheritance",
          "Composition",
          "Polymorphism",
          "Operator Overloading"
        ],
        "correctIndex": 1,
        "explanation": "Account 'has a' vector of Transaction objects, which is the definition of Object Composition."
      },
      {
        "id": "mcq-cpp-oop-bank-2",
        "question": "How are SavingsAccount and CheckingAccount related to the Account class in the project architecture?",
        "options": [
          "They inherit from Account using public inheritance ('Is-A' relationship)",
          "They are friend functions of Account",
          "They are completely unrelated classes",
          "They are declared inside main()"
        ],
        "correctIndex": 0,
        "explanation": "SavingsAccount and CheckingAccount extend the base Account class using public inheritance."
      },
      {
        "id": "mcq-cpp-oop-bank-3",
        "question": "How does the banking system guarantee that every created account receives a unique account ID?",
        "options": [
          "Users input their own ID numbers manually",
          "A static integer counter in the Account class auto-increments with each object construction",
          "By hashing the user's name",
          "By generating a random number without checking for collisions"
        ],
        "correctIndex": 1,
        "explanation": "A static counter shared across all instances increments during construction, guaranteeing uniqueness."
      },
      {
        "id": "mcq-cpp-oop-bank-4",
        "question": "Why is withdraw() declared as a virtual method in the base Account class?",
        "options": [
          "To allow derived classes like CheckingAccount to provide customized overdraft rules while being invoked via Account* pointers",
          "Because non-virtual methods cannot perform math",
          "To prevent anyone from calling withdraw",
          "To make the account read-only"
        ],
        "correctIndex": 0,
        "explanation": "virtual enables runtime dispatch so derived accounts can implement custom withdrawal limits (like overdraft) through base pointers."
      },
      {
        "id": "mcq-cpp-oop-bank-5",
        "question": "What is the result of attempting to withdraw $500 from Sarah's CheckingAccount with $300 balance and $200 overdraft limit, followed by another $500 withdrawal?",
        "options": [
          "Both succeed",
          "The first succeeds (balance becomes -$150) and the second is rejected for exceeding the overdraft limit",
          "Both fail",
          "The program crashes"
        ],
        "correctIndex": 1,
        "explanation": "The first $450 withdrawal uses $150 of the $200 overdraft allowance; the subsequent $500 withdrawal exceeds the remaining $50 limit and is rejected."
      }
    ],
    "codingChallenge": {
      "title": "Banking Core Account Transfer Engine",
      "difficulty": "Intermediate",
      "problem_statement": "Implement a transfer function between two BankAccount objects: bool transfer(Account& from, Account& to, double amount). If from.withdraw(amount) succeeds, call to.deposit(amount) and print 'Transfer of $<amount> from #<from.getId()> to #<to.getId()> successful!'. In main(), create SavingsAccount a1('Alice', 1000) and CheckingAccount a2('Bob', 200), execute transfer(a1, a2, 400), and print a1.getBalance() and a2.getBalance().",
      "input_format": "No input provided.",
      "output_format": "Three lines:\nTransfer of $400 from #1001 to #1002 successful!\na1 Balance: $600\na2 Balance: $600",
      "constraints": "Ensure the transfer is atomic: if withdrawal fails, no deposit occurs.",
      "starter_code": "#include <iostream>\n#include <string>\nusing namespace std;\n\n// Implement transfer function and test\n\nint main() {\n    // Test transfer between accounts\n    return 0;\n}",
      "expected_output": "Transfer of $400 from #1001 to #1002 successful!\na1 Balance: $600\na2 Balance: $600",
      "test_cases": [
        {
          "input": "",
          "expected_output": "Transfer of $400 from #1001 to #1002 successful!\na1 Balance: $600\na2 Balance: $600",
          "is_hidden": false
        }
      ]
    },
    "summary": [
      "The Banking Management System unites all four pillars of OOP into an industry-grade architecture.",
      "Encapsulation ensures financial invariants and account balances are strictly protected.",
      "Inheritance allows specialized tiers (Savings, Checking) to inherit shared base account properties.",
      "Polymorphism enables uniform account management and statement generation through base class pointers.",
      "Composition links structured Transaction audit logs directly to each individual account."
    ]
  }
];

// Authoritative Module definition
export const CPP_OOP_MODULES: CppOopModule[] = [
  {
    id: 'mod-cpp-oop-core',
    number: 1,
    numberDisplay: '01',
    title: 'Module 01: Object-Oriented C++ Architecture & Design',
    description: 'Master object-oriented programming in C++ by learning how to design reusable, modular, and maintainable software. Explore classes, objects, constructors, destructors, encapsulation, inheritance, polymorphism, abstraction, operator overloading, and runtime memory management.',
    estimatedMinutes: 600,
    topics: CPP_OOP_TOPICS
  }
];

// Helper to look up topic by ID
export const getCppOopTopicById = (id: string): CppOopTopic | undefined => {
  if (id === 'top-cpp-oop' || id === 'top-cpp-oop-intro') {
    return CPP_OOP_TOPICS[0];
  }
  return CPP_OOP_TOPICS.find(t => t.id === id);
};
