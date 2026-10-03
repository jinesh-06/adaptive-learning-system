"""Module 1: Structures and Data Organization
Topics 01 - 04 for Advanced C Systems & Data Structures.
"""

true = True
false = False
null = None

def get_module_1_topics():
    return [
        {
            "id": "top-c-advanced-structures",
            "number": 1,
            "numberDisplay": "01",
            "moduleId": "mod-c-adv-structures",
            "moduleTitle": "Module 1: Structures and Data Organization",
            "title": "Structures in C",
            "slug": "structures-in-c",
            "language": "c",
            "difficulty": "Advanced",
            "estimatedMinutes": 50,
            "prerequisiteId": None,
            "shortDescription": "Master user-defined composite data types in C using structs, memory alignment, member offsets, nested records, and arrays of structures.",
            "learningObjectives": [
                "Define and declare structures using the struct keyword.",
                "Instantiate structure variables and initialize them with designated initializers.",
                "Access structure members using the dot (.) operator.",
                "Understand hardware memory alignment, structure padding, and sizeof calculations.",
                "Compose complex data representations using nested structures and arrays of structures.",
                "Pass structures to functions by value and inspect runtime copy overhead."
            ],
            "conceptExplanation": """### 1. Introduction to Structures in C
In C, primitive types (`int`, `float`, `char`) represent solitary scalar values. However, real-world systems deal with composite entities: a student record possesses a name (`char[]`), roll number (`int`), and grade-point average (`float`). An array cannot store these because arrays are strictly homogeneous. 

A **structure** (`struct`) is a user-defined composite data type that groups variables of different data types into a contiguous, single record under a unified name.

### 2. Declaring and Defining Structures
```c
struct Student {
    int rollNumber;
    char name[50];
    float gpa;
};
```
- The `struct` keyword informs the compiler of a user-defined record format.
- `Student` is the **structure tag**. No memory is allocated during tag definition; it defines a type blueprint.
- `rollNumber`, `name`, and `gpa` are called **members** or **fields**.

### 3. Structure Variables & Instantiation
Memory is allocated only when structure variables are instantiated:
```c
struct Student s1; // Stack allocation of sizeof(struct Student) bytes
struct Student s2 = {101, "Alice Smith", 3.92f}; // Positional initialization
struct Student s3 = {.name = "Bob Jones", .rollNumber = 102, .gpa = 3.75f}; // C99 Designated Initializer
```

### 4. Member Access & The Dot Operator (`.`)
Individual fields are read or modified using the direct member selection dot (`.`) operator:
```c
s1.rollNumber = 103;
snprintf(s1.name, sizeof(s1.name), "Charlie Brown");
s1.gpa = 3.85f;
```
The dot operator has high precedence (`level 1` along with array brackets `[]` and parentheses `()`).

### 5. Memory Alignment & Structure Padding
CPUs access memory most efficiently when data types reside at memory addresses divisible by their natural alignment (e.g., 4-byte `int` on a multiple of 4, 8-byte `double` on a multiple of 8).
```c
struct Example {
    char a;      // 1 byte
    // 3 bytes padding inserted here by compiler!
    int b;       // 4 bytes
    short c;     // 2 bytes
    // 2 bytes trailing padding to round up to multiple of largest member (4)!
};
// Total sizeof(struct Example) == 12 bytes, NOT 7 bytes!
```

### 6. Nested Structures & Arrays of Structures
Structures can contain other structures as members (composition), and programs routinely create arrays of structures:
```c
struct Date { int day, month, year; };
struct Employee {
    int id;
    char name[32];
    struct Date hireDate; // Nested structure
};
struct Employee staff[100]; // Array of 100 employee structures
staff[0].hireDate.year = 2024;
```""",
            "visualDiagram": """STRUCTURE MEMORY LAYOUT & COMPILER PADDING:

  struct Record {
      char  code;     // 1 byte
      // [PAD: 3B]   // Compiler inserts 3 bytes padding
      int   id;       // 4 bytes
      short level;    // 2 bytes
      // [PAD: 2B]   // 2 bytes tail padding (total multiple of 4)
  };

  Memory Address Offset:
  +0x00       +0x01 ... +0x03   +0x04 ... +0x07   +0x08 ... +0x09   +0x0A ... +0x0B
  [ code (1B) | PADDING (3B)   | id (4B)         | level (2B)      | PADDING (2B)   ]
  <-------------------------- Total Size: 12 Bytes --------------------------------->

NESTED STRUCTURE COMPOSITION:
  struct Student {
      int id;
      struct Address addr; ---> [ int zip | char city[20] ]
      float gpa;
  };""",
            "syntax": """// Defining structure blueprint
struct TagName {
    type member1;
    type member2;
};

// Declaring & Initializing
struct TagName var = { val1, val2 };
struct TagName var = { .member2 = val2, .member1 = val1 }; // C99

// Dot operator access
var.member1 = newValue;""",
            "simpleExample": {
                "code": """#include <stdio.h>

struct Point {
    int x;
    int y;
};

int main(void) {
    struct Point p1 = {10, 20};
    printf("Point coordinates: (%d, %d)\\n", p1.x, p1.y);
    p1.x += 5;
    p1.y += 10;
    printf("Shifted coordinates: (%d, %d)\\n", p1.x, p1.y);
    return 0;
}""",
                "explanation": "Initializes `Point` with `x = 10, y = 20`. Modifies fields using the dot operator and outputs coordinates."
            },
            "codeExample": """#include <stdio.h>
#include <string.h>

struct Date {
    int day;
    int month;
    int year;
};

struct Student {
    int id;
    char name[40];
    float marks;
    struct Date dob; // Nested structure
};

void displayStudent(struct Student s) {
    printf("ID: %d | Name: %s | Marks: %.2f | DOB: %02d/%02d/%04d\\n",
           s.id, s.name, s.marks, s.dob.day, s.dob.month, s.dob.year);
}

int main(void) {
    // Array of structures with designated initializers
    struct Student classroom[2] = {
        {
            .id = 101,
            .name = "Alice Rivera",
            .marks = 94.50f,
            .dob = {.day = 14, .month = 5, .year = 2004}
        },
        {
            .id = 102,
            .name = "Brian Chen",
            .marks = 88.25f,
            .dob = {.day = 22, .month = 11, .year = 2003}
        }
    };

    printf("=== Academic Roster ===\\n");
    for (int i = 0; i < 2; i++) {
        displayStudent(classroom[i]);
    }
    return 0;
}""",
            "expectedOutput": """=== Academic Roster ===
ID: 101 | Name: Alice Rivera | Marks: 94.50 | DOB: 14/05/2004
ID: 102 | Name: Brian Chen | Marks: 88.25 | DOB: 22/11/2003""",
            "stepByStep": [
                "Line 4-8: Define nested `struct Date` storing day, month, and year.",
                "Line 10-15: Define `struct Student` containing primitive fields and a nested `struct Date dob` member.",
                "Line 17-20: `displayStudent(struct Student s)` accepts student by value, demonstrating member access.",
                "Line 24-38: Declare an array of 2 `struct Student` records, initialized with designated member syntax.",
                "Line 41-43: Iterate through the array using index `i` and pass each struct to `displayStudent`."
            ],
            "dryRun": "At i=0: classroom[0] (Alice, id 101, DOB 14/05/2004) passed to displayStudent -> printed. At i=1: classroom[1] (Brian, id 102, DOB 22/11/2003) passed -> printed.",
            "keyTakeaways": [
                "Structures group heterogeneous data types into contiguous memory blocks.",
                "The dot operator (.) provides direct access to structure fields.",
                "Compilers insert invisible padding bytes to satisfy hardware alignment constraints.",
                "Nested structures support domain data modeling through composition.",
                "Passing structures by value copies every single byte; for large structs, pointers should be used."
            ],
            "commonMistakes": [
                {
                    "mistake": "Using direct string assignment like s.name = \"Alice\"; on character array members.",
                    "whyWrong": "Arrays cannot be targets of the assignment operator in C after initialization.",
                    "correction": "Use strcpy(s.name, \"Alice\") or snprintf(s.name, sizeof(s.name), \"%s\", \"Alice\");",
                    "explanation": "In C, string literals require copying into character arrays using standard library functions."
                },
                {
                    "mistake": "Assuming sizeof(struct) is always equal to the sum of sizeof() of its individual members.",
                    "whyWrong": "Hardware alignment rules cause compilers to inject padding bytes between fields.",
                    "correction": "Order members from largest to smallest type to minimize padding waste.",
                    "explanation": "Padding ensures members land on word-aligned hardware memory boundaries."
                }
            ],
            "realWorldExample": {
                "scenario": "Network Packet Header Decoder",
                "code": """#include <stdio.h>

struct IPv4Header {
    unsigned char versionAndIHL;
    unsigned char typeOfService;
    unsigned short totalLength;
    unsigned short identification;
    unsigned short flagsAndOffset;
    unsigned char  timeToLive;
    unsigned char  protocol;
    unsigned short headerChecksum;
    unsigned int   srcIP;
    unsigned int   destIP;
};

int main(void) {
    printf("IPv4 Header Memory footprint: %zu bytes\\n", sizeof(struct IPv4Header));
    return 0;
}""",
                "explanation": "Network device drivers and packet capture tools use C structures to parse raw packet byte streams directly into structured memory headers."
            },
            "practice": {
                "prompt": "Define a struct named `Book` with `title` (char array 40), `pages` (int), and `price` (float). Create a book variable, assign values, and print them.",
                "starterCode": """#include <stdio.h>
#include <string.h>

// Define struct Book here

int main(void) {
    // Instantiate and print book details
    return 0;
}""",
                "solution": """#include <stdio.h>
#include <string.h>

struct Book {
    char title[40];
    int pages;
    float price;
};

int main(void) {
    struct Book b1;
    strcpy(b1.title, "The C Programming Language");
    b1.pages = 272;
    b1.price = 45.50f;

    printf("Book: %s | Pages: %d | Price: $%.2f\\n", b1.title, b1.pages, b1.price);
    return 0;
}""",
                "hints": [
                    "Define struct Book with char title[40], int pages, float price;",
                    "Use strcpy to copy string into title array."
                ]
            },
            "quiz": [
                {
                    "id": "q-c-adv-struct-1",
                    "question": "What is the primary difference between an array and a structure in C?",
                    "options": [
                        "Arrays are allocated in the heap, structures in the stack",
                        "Arrays hold homogeneous data, while structures can hold heterogeneous data",
                        "Structures cannot hold primitive types",
                        "Arrays have padding, structures never have padding"
                    ],
                    "correctIndex": 1,
                    "explanation": "Arrays require all elements to have the exact same type; structures group disparate types under a single identifier."
                },
                {
                    "id": "q-c-adv-struct-2",
                    "question": "Given: struct Data { char a; int b; }; on a 32-bit aligned system, what is sizeof(struct Data)?",
                    "options": ["5 bytes", "8 bytes", "4 bytes", "6 bytes"],
                    "correctIndex": 1,
                    "explanation": "char takes 1 byte, followed by 3 bytes of padding so that int b aligns on a 4-byte boundary, totaling 8 bytes."
                },
                {
                    "id": "q-c-adv-struct-3",
                    "question": "Which operator is used to access structure members from a direct structure variable?",
                    "options": ["Arrow (->)", "Dot (.)", "Colon (:)", "Ampersand (&)"],
                    "correctIndex": 1,
                    "explanation": "The dot (.) operator selects members directly from a structure variable."
                },
                {
                    "id": "q-c-adv-struct-4",
                    "question": "What happens when a large structure (e.g. 500 bytes) is passed to a function by value?",
                    "options": [
                        "Only the first member is copied to save memory",
                        "A pointer is implicitly created by the compiler",
                        "All 500 bytes are pushed onto the call stack as a full copy",
                        "A compiler error is raised"
                    ],
                    "correctIndex": 2,
                    "explanation": "Passing by value in C always creates an exact bitwise copy of the entire structure on the function call stack."
                }
            ],
            "codingChallenge": {
                "title": "Employee Payroll & Tax Deductor",
                "difficulty": "Easy",
                "problem_statement": "Define a structure `Employee` containing:\n- `id` (int)\n- `name` (char array 30)\n- `grossSalary` (float)\n\nIn `main()`, initialize an Employee with id 1001, name \"David Clark\", and grossSalary 65000.00.\nCompute net salary after deducting 15% tax: `netSalary = grossSalary * 0.85f`.\nPrint the result in the exact format:\n`ID: 1001 | Name: David Clark | Gross: $65000.00 | Net: $55250.00`",
                "input_format": "None (hardcoded structure values in main).",
                "output_format": "Formatted payroll line with exact values.",
                "constraints": "Calculate tax strictly using float arithmetic.",
                "starter_code": """#include <stdio.h>
#include <string.h>

// Define struct Employee

int main(void) {
    // Instantiate struct Employee and compute net salary
    return 0;
}""",
                "expected_output": "ID: 1001 | Name: David Clark | Gross: $65000.00 | Net: $55250.00",
                "test_cases": [
                    {
                        "input": "",
                        "expected_output": "ID: 1001 | Name: David Clark | Gross: $65000.00 | Net: $55250.00",
                        "is_hidden": false
                    }
                ]
            },
            "summary": [
                "Structures allow combining multiple disparate data types into a cohesive record.",
                "The dot operator accesses members directly from structure variables.",
                "Memory padding ensures members reside on hardware-friendly alignment boundaries.",
                "Structures can be nested and grouped into arrays for scalable domain modeling.",
                "Passing structures by reference via pointers avoids expensive stack memory copying."
            ],
            "content_standard": "Comprehensive study of C structures, syntax, memory padding, alignment rules, nested records, and arrays of structures.",
            "content_detailed": "In-depth breakdown of structure member offsets, offsetof macro, CPU alignment penalties, and cacheline utilization in C structures.",
            "content_simplified": "Think of a structure like a custom registration form with slots for name, ID, and score grouped neatly in one folder."
        },
        {
            "id": "top-c-structure-pointers",
            "number": 2,
            "numberDisplay": "02",
            "moduleId": "mod-c-adv-structures",
            "moduleTitle": "Module 1: Structures and Data Organization",
            "title": "Pointers to Structures",
            "slug": "pointers-to-structures",
            "language": "c",
            "difficulty": "Advanced",
            "estimatedMinutes": 55,
            "prerequisiteId": "top-c-advanced-structures",
            "shortDescription": "Master structure pointers, the arrow (->) operator, dynamic memory allocation with malloc for structs, and self-referential structures for linked nodes.",
            "learningObjectives": [
                "Declare and initialize pointers to structures.",
                "Use the arrow operator (->) for member access through pointers.",
                "Understand the precedence difference between (*ptr).member and *ptr.member.",
                "Pass structure pointers to functions to avoid stack frame copies and modify records.",
                "Dynamically allocate and deallocate structures on the heap using malloc() and free().",
                "Construct self-referential structures as the foundation for linked lists and trees."
            ],
            "conceptExplanation": """### 1. Introduction to Structure Pointers
Passing large structures by value copies every byte onto the stack frame, causing CPU overhead and preventing functions from mutating caller records. 

A **structure pointer** stores the memory address of a structure instance:
```c
struct Student s1 = {101, "Alice", 3.9f};
struct Student *ptr = &s1; // ptr stores address of s1
```

### 2. The Arrow Operator (`->`)
To access fields through a structure pointer, we can dereference the pointer and use the dot operator:
```c
(*ptr).gpa = 4.0f; // Parentheses are mandatory due to precedence!
```
Because the dot (`.`) operator has higher precedence than the dereference (`*`) operator, writing `*ptr.gpa` is parsed as `*(ptr.gpa)` which causes a compile error.

To avoid cumbersome parentheses, C introduces the **arrow operator** (`->`):
```c
ptr->gpa = 4.0f; // Exactly equivalent to (*ptr).gpa = 4.0f
```

### 3. Passing Structure Pointers to Functions
Passing by pointer achieves two critical goals:
1. **Performance**: Only 8 bytes (pointer address on 64-bit architectures) are pushed onto the call stack regardless of whether the structure is 10 bytes or 10 megabytes.
2. **Mutability**: The function can modify original structure members directly.
```c
void updateGpa(struct Student *s, float newGpa) {
    if (s != NULL && newGpa >= 0.0f && newGpa <= 4.0f) {
        s->gpa = newGpa;
    }
}
```

### 4. Dynamic Memory Allocation for Structures
Structures can be instantiated at runtime on the heap using `malloc()`:
```c
struct Student *sPtr = (struct Student *)malloc(sizeof(struct Student));
if (sPtr == NULL) {
    fprintf(stderr, "Heap memory allocation failed!\\n");
    return -1;
}
sPtr->id = 201;
snprintf(sPtr->name, sizeof(sPtr->name), "Emma");
sPtr->gpa = 3.95f;

// Always release memory when finished:
free(sPtr);
sPtr = NULL;
```

### 5. Self-Referential Structures
A structure is **self-referential** if it contains a pointer to an instance of its own type. Self-referential structures are the absolute foundation of all linked lists, trees, graphs, and dynamic data structures in C:
```c
struct Node {
    int data;
    struct Node *next; // Pointer to another node of the same struct type!
};
```
Note: A structure cannot contain a direct *variable* of its own type (infinite size recursion), but it CAN contain a *pointer* to its own type because all pointers have a fixed memory size (4 or 8 bytes).""",
            "visualDiagram": """STACK vs HEAP STRUCTURE ALLOCATION:

  STACK MEMORY:
  +--------------------------------+
  | ptr: 0x7FFF0040 (8-byte addr)  | --------+
  +--------------------------------+         |
                                             | Points to heap block
  HEAP MEMORY:                               |
  Address: 0x7FFF0040 <----------------------+
  +-------------------------------------------------------------+
  | id: 201 (4B) | name: "Emma" (40B) | gpa: 3.95f (4B)         |
  +-------------------------------------------------------------+

SELF-REFERENTIAL NODE LINKING:
  Node A (0x1000)                  Node B (0x2000)
  +----------+--------------+      +----------+--------------+
  | data: 10 | next: 0x2000 | ---> | data: 20 | next: NULL   |
  +----------+--------------+      +----------+--------------+""",
            "syntax": """// Pointer declaration
struct Student *ptr = &s1;

// Arrow operator member access
ptr->member = value;
// Equivalent to: (*ptr).member = value;

// Heap allocation
struct Student *p = malloc(sizeof(struct Student));
free(p);""",
            "simpleExample": {
                "code": """#include <stdio.h>

struct Vector2D {
    int x;
    int y;
};

int main(void) {
    struct Vector2D v = {100, 200};
    struct Vector2D *ptr = &v;

    printf("Original: (%d, %d)\\n", ptr->x, ptr->y);
    ptr->x += 50;
    ptr->y += 50;
    printf("Updated via arrow: (%d, %d)\\n", v.x, v.y);
    return 0;
}""",
                "explanation": "Declares `ptr` pointing to structure `v`. Modifies coordinates using `ptr->x` and `ptr->y`, directly altering `v`."
            },
            "codeExample": """#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct ServerNode {
    int serverId;
    char hostname[32];
    int activeConnections;
    struct ServerNode *next; // Self-referential pointer
};

struct ServerNode* createNode(int id, const char *host, int conns) {
    struct ServerNode *newNode = (struct ServerNode *)malloc(sizeof(struct ServerNode));
    if (newNode == NULL) {
        printf("Memory allocation error!\\n");
        return NULL;
    }
    newNode->serverId = id;
    strncpy(newNode->hostname, host, sizeof(newNode->hostname) - 1);
    newNode->hostname[sizeof(newNode->hostname) - 1] = '\\0';
    newNode->activeConnections = conns;
    newNode->next = NULL;
    return newNode;
}

int main(void) {
    // Chain two nodes dynamically
    struct ServerNode *head = createNode(1, "gateway-us-east", 1420);
    head->next = createNode(2, "gateway-us-west", 980);

    // Traverse and display chain
    struct ServerNode *curr = head;
    printf("=== Cluster Nodes ===\\n");
    while (curr != NULL) {
        printf("Node #%d [%s] Active Connections: %d\\n",
               curr->serverId, curr->hostname, curr->activeConnections);
        curr = curr->next;
    }

    // Free heap memory
    curr = head;
    while (curr != NULL) {
        struct ServerNode *temp = curr;
        curr = curr->next;
        free(temp);
    }
    printf("Cluster memory successfully released.\\n");
    return 0;
}""",
            "expectedOutput": """=== Cluster Nodes ===
Node #1 [gateway-us-east] Active Connections: 1420
Node #2 [gateway-us-west] Active Connections: 980
Cluster memory successfully released.""",
            "stepByStep": [
                "Line 5-10: Define `struct ServerNode` containing primitive metrics and a self-referential `struct ServerNode *next` pointer.",
                "Line 12-24: `createNode` allocates heap memory using `malloc`, initializes members via `->`, and sets `next = NULL`.",
                "Line 28-29: Create `head` and link a second node dynamically via `head->next = createNode(...)`.",
                "Line 32-38: Traverse the linked node chain using a temporary pointer `curr` until reaching `NULL`.",
                "Line 41-46: Traverse and `free()` each allocated node safely using a temporary pointer to avoid dangling references."
            ],
            "dryRun": "head created at heap addr A (id=1, next=B). head->next created at heap addr B (id=2, next=NULL). Loop prints A then B. Second loop frees A then B.",
            "keyTakeaways": [
                "Structure pointers avoid costly stack copying when passing structs to functions.",
                "The arrow operator (->) provides clean syntax for (*ptr).member.",
                "Dynamic memory allocation (malloc) allows creating structures whose lifecycles outlive the creating function.",
                "Self-referential structures enable linked lists, trees, and dynamic graphs.",
                "Every malloc() on a structure must be paired with free() to prevent memory leaks."
            ],
            "commonMistakes": [
                {
                    "mistake": "Writing *ptr.member instead of (*ptr).member or ptr->member.",
                    "whyWrong": "The dot operator has higher precedence than unary *, causing the compiler to attempt dereferencing the member itself.",
                    "correction": "Always use ptr->member or (*ptr).member.",
                    "explanation": "Operator precedence evaluates member selection (.) before dereference (*)."
                },
                {
                    "mistake": "Forgetting to check if malloc() returned NULL before accessing struct members.",
                    "whyWrong": "Accessing NULL->member causes an immediate Segmentation Fault crash.",
                    "correction": "Always check: if (ptr == NULL) { /* handle error */ }",
                    "explanation": "Heap allocation fails when the operating system exhausts available memory."
                }
            ],
            "realWorldExample": {
                "scenario": "Operating System Kernel Process Control Block (PCB)",
                "code": """#include <stdio.h>

struct PCB {
    int pid;
    int priority;
    struct PCB *nextProcess; // Run-queue pointer
};

void promoteProcess(struct PCB *proc) {
    if (proc) proc->priority += 10;
}

int main(void) {
    struct PCB p1 = {1042, 20, NULL};
    promoteProcess(&p1);
    printf("PID %d updated priority: %d\\n", p1.pid, p1.priority);
    return 0;
}""",
                "explanation": "Operating systems like Linux maintain kernel task structures (task_struct) linked together via pointers in scheduling run-queues."
            },
            "practice": {
                "prompt": "Create a dynamically allocated structure `Box` with `length` and `width`. Allocate it with malloc, set values to 8 and 5 via arrow operator, print area, and free memory.",
                "starterCode": """#include <stdio.h>
#include <stdlib.h>

// Define struct Box

int main(void) {
    // Dynamically allocate Box, compute area, free
    return 0;
}""",
                "solution": """#include <stdio.h>
#include <stdlib.h>

struct Box {
    int length;
    int width;
};

int main(void) {
    struct Box *b = (struct Box *)malloc(sizeof(struct Box));
    if (!b) return 1;
    b->length = 8;
    b->width = 5;

    int area = b->length * b->width;
    printf("Box Area: %d\\n", area);
    free(b);
    return 0;
}""",
                "hints": [
                    "Allocate with malloc(sizeof(struct Box))",
                    "Use b->length and b->width to assign values",
                    "Remember to call free(b)"
                ]
            },
            "quiz": [
                {
                    "id": "q-c-adv-ptr-1",
                    "question": "What is ptr->name completely equivalent to in C?",
                    "options": [
                        "*ptr.name",
                        "*(ptr.name)",
                        "(*ptr).name",
                        "&(ptr.name)"
                    ],
                    "correctIndex": 2,
                    "explanation": "The arrow operator ptr->name is syntactic sugar for (*ptr).name."
                },
                {
                    "id": "q-c-adv-ptr-2",
                    "question": "Why can't a structure contain an actual variable of its own type (e.g. struct Node n;)?",
                    "options": [
                        "C syntax reserves the keyword Node",
                        "It would cause infinite recursive size definition at compile-time",
                        "Structures can only hold primitive types",
                        "The compiler cannot assign memory addresses to nested types"
                    ],
                    "correctIndex": 1,
                    "explanation": "A direct member of its own type requires infinite recursive memory; a pointer has a known, fixed size (4 or 8 bytes)."
                },
                {
                    "id": "q-c-adv-ptr-3",
                    "question": "What is the primary benefit of passing a structure pointer to a function?",
                    "options": [
                        "It makes the structure read-only",
                        "It avoids copying the entire structure onto the call stack and allows modifying original data",
                        "It converts the structure into an array automatically",
                        "It moves the structure from stack to heap memory"
                    ],
                    "correctIndex": 1,
                    "explanation": "Passing an address (8 bytes) eliminates stack copy overhead and enables direct mutation."
                },
                {
                    "id": "q-c-adv-ptr-4",
                    "question": "What dangerous bug occurs if you access ptr->field after calling free(ptr)?",
                    "options": [
                        "Stack overflow",
                        "Dangling pointer dereference / Use-After-Free undefined behavior",
                        "Type mismatch error",
                        "Buffer underflow"
                    ],
                    "correctIndex": 1,
                    "explanation": "Dereferencing memory after releasing it leads to Use-After-Free undefined behavior and security exploits."
                }
            ],
            "codingChallenge": {
                "title": "Dynamic Rectangle Perimeter and Area via Pointer",
                "difficulty": "Easy",
                "problem_statement": "Define a structure `Rectangle` with `width` (float) and `height` (float).\nWrite a function `void computeMetrics(const struct Rectangle *r, float *area, float *perim)` that calculates:\n- `*area = r->width * r->height`\n- `*perim = 2 * (r->width + r->height)`\n\nIn `main()`, dynamically allocate a Rectangle with `width = 12.5f` and `height = 4.0f`.\nCompute the metrics, print:\n`Width: 12.50 | Height: 4.00 | Area: 50.00 | Perimeter: 33.00`\nand free the allocated memory.",
                "input_format": "None.",
                "output_format": "Exact formatted line with Width, Height, Area, and Perimeter to two decimal places.",
                "constraints": "Must allocate Rectangle dynamically with malloc and release with free.",
                "starter_code": """#include <stdio.h>
#include <stdlib.h>

// Define struct Rectangle and computeMetrics function

int main(void) {
    // Implement test
    return 0;
}""",
                "expected_output": "Width: 12.50 | Height: 4.00 | Area: 50.00 | Perimeter: 33.00",
                "test_cases": [
                    {
                        "input": "",
                        "expected_output": "Width: 12.50 | Height: 4.00 | Area: 50.00 | Perimeter: 33.00",
                        "is_hidden": false
                    }
                ]
            },
            "summary": [
                "Structure pointers provide high-efficiency member access via the arrow (->) operator.",
                "(*ptr).member and ptr->member are identical; arrow notation avoids precedence bugs.",
                "Passing structure pointers to functions enables mutation and eliminates stack copy costs.",
                "Heap allocation with malloc() allows runtime dynamic sizing of structures.",
                "Self-referential structures form the backbone of linked lists, trees, and graphs."
            ],
            "content_standard": "Complete guide to structure pointers, arrow syntax, heap allocation, and self-referential linked data architecture.",
            "content_detailed": "Deep technical coverage of pointer indirection, cache misses during pointer chasing, and memory layout of self-referential nodes.",
            "content_simplified": "An arrow operator -> lets you open a box using its address key rather than carrying the entire heavy box with you."
        },
        {
            "id": "top-c-unions-enums",
            "number": 3,
            "numberDisplay": "03",
            "moduleId": "mod-c-adv-structures",
            "moduleTitle": "Module 1: Structures and Data Organization",
            "title": "Unions and Enumerations",
            "slug": "unions-and-enumerations",
            "language": "c",
            "difficulty": "Advanced",
            "estimatedMinutes": 45,
            "prerequisiteId": "top-c-structure-pointers",
            "shortDescription": "Understand memory sharing in unions, tagged variant patterns, enumeration constants, and switch-driven state machines in C systems programming.",
            "learningObjectives": [
                "Declare, define, and initialize unions using the union keyword.",
                "Understand mutual memory exclusion where union members share the exact same byte offsets.",
                "Calculate union memory footprint based on the largest member and alignment rules.",
                "Construct tagged unions (variants) using an enum discriminator.",
                "Define enumeration constants (enum) and customize their integer values.",
                "Implement clean, type-safe state machines using enums and switch statements."
            ],
            "conceptExplanation": """### 1. Introduction to Unions in C
In a `struct`, every member has its own distinct memory offset; the total size is at least the sum of all members.
In a `union`, **all members share the exact same memory location**. A union can hold data for only ONE member at any given moment. Writing to one member overwrites the others.

```c
union SensorValue {
    int rawInt;       // 4 bytes
    float voltage;    // 4 bytes
    char statusChar;  // 1 byte
};
```

### 2. Understanding Union Memory Size
The size of a union is determined by the size of its **largest member**, rounded up to satisfy alignment:
- In `SensorValue`, `rawInt` is 4 bytes, `voltage` is 4 bytes, `statusChar` is 1 byte.
- `sizeof(union SensorValue)` is exactly **4 bytes**!
- In contrast, a struct with the same members would occupy 12 bytes.

### 3. Mutual Exclusion & Overwriting
```c
union SensorValue val;
val.rawInt = 42;
printf("%d\\n", val.rawInt); // Prints 42

val.voltage = 3.3f; // Overwrites rawInt's bytes!
printf("%f\\n", val.voltage); // Prints 3.300000
// Reading val.rawInt now yields undefined/garbage bit interpretation
```

### 4. Tagged Unions (Variant Pattern)
Because a bare union does not know which member is currently active, production C systems pair a union with an `enum` in a structure. This is known as a **tagged union** or **discriminated union**:
```c
enum ValueType { TYPE_INT, TYPE_FLOAT, TYPE_STRING };

struct Variant {
    enum ValueType type; // Discriminator tag
    union {
        int iVal;
        float fVal;
        char strVal[32];
    } data;
};
```

### 5. Enumerations (`enum`) in C
An enumeration defines a set of named integer constants, dramatically improving code readability and maintainability over magic numbers:
```c
enum ConnectionState {
    DISCONNECTED = 0,
    CONNECTING = 1,
    CONNECTED = 2,
    DISCONNECTING = 3
};
```
If values are omitted, C assigns `0` to the first identifier, and increments each subsequent identifier by `1`.

### 6. Enums with Switch Statements
Enums pair naturally with `switch` statements to build deterministic state machines:
```c
switch (currentState) {
    case DISCONNECTED:  connect(); break;
    case CONNECTED:     transmit(); break;
    default:            handleError(); break;
}
```""",
            "visualDiagram": """STRUCT vs UNION MEMORY ALLOCATION:

  struct DataStruct {
      char a;   // 1B at offset 0
      int b;    // 4B at offset 4
      float c;  // 4B at offset 8
  };
  Offset:  0   1   2   3   4   5   6   7   8   9  10  11
          [a| pad (3B)   |     b (4B)    |     c (4B)    ] -> Total: 12 Bytes

  union DataUnion {
      char a;   // 1B
      int b;    // 4B
      float c;  // 4B
  };
  Offset:  0   1   2   3
          [a|           ]  (If accessing a)
          [    b (4B)   ]  (If accessing b - overwrites a)
          [    c (4B)   ]  (If accessing c - overwrites b) -> Total: 4 Bytes!""",
            "syntax": """// Union definition
union Tag {
    int i;
    float f;
};

// Enum definition
enum State {
    OFF = 0,
    ON = 1,
    STANDBY = 5
};

// Tagged union
struct Token {
    enum State tag;
    union Tag val;
};""",
            "simpleExample": {
                "code": """#include <stdio.h>

union Number {
    int i;
    float f;
};

int main(void) {
    union Number n;
    n.i = 100;
    printf("As integer: %d\\n", n.i);
    n.f = 99.5f;
    printf("As float: %.1f\\n", n.f);
    printf("Size of union: %zu bytes\\n", sizeof(n));
    return 0;
}""",
                "explanation": "Demonstrates union size matching its largest member (4 bytes) and updating fields over the shared memory slot."
            },
            "codeExample": """#include <stdio.h>

enum DataType {
    DATA_INT = 1,
    DATA_FLOAT = 2,
    DATA_CHAR = 3
};

struct DynamicValue {
    enum DataType type;
    union {
        int i;
        float f;
        char c;
    } payload;
};

void printValue(const struct DynamicValue *v) {
    switch (v->type) {
        case DATA_INT:
            printf("[INTEGER] Value: %d\\n", v->payload.i);
            break;
        case DATA_FLOAT:
            printf("[FLOAT] Value: %.2f\\n", v->payload.f);
            break;
        case DATA_CHAR:
            printf("[CHAR] Value: '%c'\\n", v->payload.c);
            break;
        default:
            printf("[UNKNOWN] Invalid type\\n");
            break;
    }
}

int main(void) {
    struct DynamicValue v1;
    v1.type = DATA_INT;
    v1.payload.i = 2048;

    struct DynamicValue v2;
    v2.type = DATA_FLOAT;
    v2.payload.f = 3.14159f;

    struct DynamicValue v3;
    v3.type = DATA_CHAR;
    v3.payload.c = 'Z';

    printValue(&v1);
    printValue(&v2);
    printValue(&v3);
    return 0;
}""",
            "expectedOutput": """[INTEGER] Value: 2048
[FLOAT] Value: 3.14
[CHAR] Value: 'Z'""",
            "stepByStep": [
                "Line 3-7: Define `enum DataType` with explicit integer constant identifiers for INT, FLOAT, and CHAR.",
                "Line 9-16: Define tagged union `struct DynamicValue` containing type tag and anonymous union payload.",
                "Line 18-33: `printValue` switches on `v->type` discriminator to safely access the active union member.",
                "Line 36-47: Instantiate 3 dynamic values, populate distinct payload types, and invoke `printValue`."
            ],
            "dryRun": "v1 has type DATA_INT -> switch hits case DATA_INT -> prints 2048. v2 has DATA_FLOAT -> prints 3.14. v3 has DATA_CHAR -> prints 'Z'.",
            "keyTakeaways": [
                "Union members share a single common memory buffer.",
                "Union size equals the size of its largest member plus any necessary padding.",
                "Writing to one union member overwrites the values of all other members.",
                "Enums replace magic numbers with human-readable integer constant identifiers.",
                "Tagged unions combine an enum tag with a union to create type-safe polymorphic variants."
            ],
            "commonMistakes": [
                {
                    "mistake": "Writing to member A of a union and subsequently reading member B, expecting both to be valid.",
                    "whyWrong": "All union members occupy the exact same memory bytes; writing A overwrites B's bit pattern.",
                    "correction": "Only read from the member that was most recently written, or track active member via tagged enum.",
                    "explanation": "Type punning without strict aliasing awareness produces compiler-dependent undefined behavior."
                },
                {
                    "mistake": "Assuming enums in C enforce strong compile-time type separation like in C++ or Rust.",
                    "whyWrong": "In C, enums are essentially named integer constants and can be implicitly cast to int.",
                    "correction": "Use enum types in function signatures and validate ranges in switch default blocks.",
                    "explanation": "C standard treats enum values as compatible with integer arithmetic."
                }
            ],
            "realWorldExample": {
                "scenario": "Hardware Sensor Bus Packet Parser",
                "code": """#include <stdio.h>

enum SensorId { TEMPERATURE = 1, PRESSURE = 2, LIGHT = 3 };

struct SensorPacket {
    unsigned char sensorId;
    union {
        float tempCelsius;
        int pressurePascals;
        unsigned short lightLux;
    } reading;
};

int main(void) {
    struct SensorPacket p = {TEMPERATURE, {.tempCelsius = 24.6f}};
    printf("Sensor %d reading: %.1f C\\n", p.sensorId, p.reading.tempCelsius);
    return 0;
}""",
                "explanation": "Embedded microcontrollers communicate with heterogeneous sensors over shared I2C/SPI buses using tagged unions to conserve RAM."
            },
            "practice": {
                "prompt": "Create an enum `Status` with values `SUCCESS = 0`, `WARNING = 1`, `ERROR = 2`. Write a function `printStatus` using switch to print \"OK\", \"WARN\", or \"ERR\".",
                "starterCode": """#include <stdio.h>

// Define enum Status and printStatus

int main(void) {
    // Test printStatus
    return 0;
}""",
                "solution": """#include <stdio.h>

enum Status {
    SUCCESS = 0,
    WARNING = 1,
    ERROR = 2
};

void printStatus(enum Status s) {
    switch(s) {
        case SUCCESS: printf("OK\\n"); break;
        case WARNING: printf("WARN\\n"); break;
        case ERROR: printf("ERR\\n"); break;
    }
}

int main(void) {
    printStatus(SUCCESS);
    printStatus(ERROR);
    return 0;
}""",
                "hints": [
                    "Define enum Status { SUCCESS = 0, WARNING = 1, ERROR = 2 };",
                    "Use switch(s) with case SUCCESS: ... break;"
                ]
            },
            "quiz": [
                {
                    "id": "q-c-adv-union-1",
                    "question": "What is the primary memory characteristic of a union in C?",
                    "options": [
                        "Each member has its own separate stack frame",
                        "All members share the same starting memory address",
                        "The size is the sum of all members",
                        "Union memory cannot be dynamically allocated"
                    ],
                    "correctIndex": 1,
                    "explanation": "All members of a union overlap at the same starting memory location."
                },
                {
                    "id": "q-c-adv-union-2",
                    "question": "If a union contains a double (8 bytes), an int (4 bytes), and a char array of 10 bytes, what is its minimum size?",
                    "options": ["10 bytes", "16 bytes", "22 bytes", "8 bytes"],
                    "correctIndex": 1,
                    "explanation": "Largest member is 10 bytes (char[10]). It must align on a multiple of 8 (alignment requirement of double), so the compiler rounds up to 16 bytes."
                },
                {
                    "id": "q-c-adv-union-3",
                    "question": "If an enum is declared as enum Flag { LOW, MID = 5, HIGH }; what is the integer value of HIGH?",
                    "options": ["2", "6", "5", "7"],
                    "correctIndex": 1,
                    "explanation": "LOW is 0. MID is explicitly 5. In C, unassigned identifiers increment from the previous value, so HIGH is 5 + 1 = 6."
                },
                {
                    "id": "q-c-adv-union-4",
                    "question": "What is a 'tagged union' (discriminated union)?",
                    "options": [
                        "A union containing only pointer members",
                        "A struct containing an enum tag indicating which union member is active, alongside the union",
                        "A union encrypted with a digital signature",
                        "An enum nested inside another enum"
                    ],
                    "correctIndex": 1,
                    "explanation": "A tagged union pairs an enum discriminator with a union to safely determine which field is currently valid."
                }
            ],
            "codingChallenge": {
                "title": "Tagged Packet Inspector",
                "difficulty": "Easy",
                "problem_statement": "Implement an enum `PacketType` with values `PKT_TEXT = 1` and `PKT_NUMERIC = 2`.\nCreate a tagged union `struct Packet` containing:\n- `type` (enum PacketType)\n- a union holding `textMsg` (char array 32) and `numericCode` (int)\n\nIn `main()`, instantiate two packets:\n1. A text packet with textMsg: \"SYSTEM_READY\"\n2. A numeric packet with numericCode: 200\n\nPrint both packets using a helper function:\n`[TEXT PACKET] Message: SYSTEM_READY`\n`[NUMERIC PACKET] Code: 200`",
                "input_format": "None.",
                "output_format": "Two lines matching the expected packet printout.",
                "constraints": "Must use tagged union architecture with switch statement.",
                "starter_code": """#include <stdio.h>
#include <string.h>

// Define enum PacketType and struct Packet

int main(void) {
    // Implement packets and display
    return 0;
}""",
                "expected_output": "[TEXT PACKET] Message: SYSTEM_READY\n[NUMERIC PACKET] Code: 200",
                "test_cases": [
                    {
                        "input": "",
                        "expected_output": "[TEXT PACKET] Message: SYSTEM_READY\n[NUMERIC PACKET] Code: 200",
                        "is_hidden": false
                    }
                ]
            },
            "summary": [
                "Unions conserve memory by overlapping all member variables in the same memory slot.",
                "Union size equals its largest member aligned to the strictest member alignment.",
                "Enums supply type-friendly named integer constants for states and identifiers.",
                "Tagged unions combine an enum tag with a union to create safe variant types.",
                "Switch statements on enum tags provide robust state machine transitions."
            ],
            "content_standard": "Comprehensive analysis of C unions, memory overlapping, enumerations, tagged variants, and state machine design.",
            "content_detailed": "Hardware register mapping, endianness considerations, and low-level bit representation in shared union buffers.",
            "content_simplified": "A union is like a single parking space that can hold a bike, car, or truck, but only one vehicle at any given time."
        },
        {
            "id": "top-c-typedef-bitfields",
            "number": 4,
            "numberDisplay": "04",
            "moduleId": "mod-c-adv-structures",
            "moduleTitle": "Module 1: Structures and Data Organization",
            "title": "Typedef and Bit Fields",
            "slug": "typedef-and-bit-fields",
            "language": "c",
            "difficulty": "Advanced",
            "estimatedMinutes": 45,
            "prerequisiteId": "top-c-unions-enums",
            "shortDescription": "Master type aliasing with typedef, pointer aliases, bit-field member declarations, hardware register emulation, and memory-efficient bit-packing in C.",
            "learningObjectives": [
                "Create expressive type aliases using the typedef keyword.",
                "Simplify structure and pointer declarations using typedef aliases.",
                "Understand bit fields and declare bit-width constraints on struct members.",
                "Pack multiple flags and small integers into single-byte and multi-byte words.",
                "Recognize hardware register emulation patterns using bit fields.",
                "Understand bit field limitations: address-of (&) restrictions, sign extensions, and endianness."
            ],
            "conceptExplanation": """### 1. The `typedef` Keyword in C
The `typedef` keyword creates a new identifier (alias) for an existing data type. It does NOT create a new type; it introduces a synonym that makes code clearer and reduces typing repetition.

```c
typedef unsigned long long uint64;
uint64 maxUsers = 5000000000ULL;
```

### 2. Simplifying Structure Declarations with `typedef`
Without `typedef`, declaring structure variables requires prefixing every variable with `struct`:
```c
struct ComplexNumber { double real, imag; };
struct ComplexNumber c1; // Verbose
```
With `typedef`:
```c
typedef struct {
    double real;
    double imag;
} ComplexNumber;

ComplexNumber c1; // Clean, concise type name
```

### 3. `typedef` with Pointers
`typedef` can encapsulate pointer syntax:
```c
typedef struct Node* NodePtr;
NodePtr head = NULL; // Exactly equivalent to: struct Node *head = NULL;
```

### 4. Introduction to Bit Fields
In standard C, the smallest addressable type is `char` (1 byte = 8 bits). If a program needs to store a boolean flag (0 or 1), using a 4-byte `int` wastes 31 bits. If you have 30 boolean flags, that requires 120 bytes.

**Bit fields** allow declaring structure members with an explicit width in bits:
```c
struct DeviceConfig {
    unsigned int isEnabled     : 1; // 1 bit (0 or 1)
    unsigned int mode          : 3; // 3 bits (0 to 7)
    unsigned int errorFlag     : 1; // 1 bit (0 or 1)
    unsigned int channelNumber : 4; // 4 bits (0 to 15)
};
```
Total bits: 1 + 3 + 1 + 4 = 9 bits. The compiler packs these into a single 2-byte or 4-byte word instead of requiring 16 separate bytes!

### 5. Hardware Register Emulation
Embedded systems and device drivers interact with memory-mapped hardware registers where individual bits or bit groups control chip hardware:
```c
typedef struct {
    unsigned char powerOn   : 1; // bit 0
    unsigned char txReady   : 1; // bit 1
    unsigned char rxReady   : 1; // bit 2
    unsigned char baudRate  : 3; // bits 3..5
    unsigned char parity    : 2; // bits 6..7
} UartControlRegister;
```

### 6. Limitations of Bit Fields
1. **No Address-of Operator**: You **cannot** use the address-of operator `&` on a bit field (`&config.isEnabled` is a compiler error) because memory addresses in hardware point to bytes, not individual bits.
2. **Endianness & Ordering**: The C standard does not specify whether bit fields are laid out left-to-right (MSB to LSB) or right-to-left (LSB to MSB). Bit-field ordering is architecture- and compiler-dependent.
3. **No Arrays of Bit Fields**: You cannot declare an array of bit fields directly.""",
            "visualDiagram": """BIT FIELD PACKING IN A SINGLE BYTE (8 BITS):

  struct Flags {
      unsigned char active   : 1;  // Bit 0
      unsigned char priority : 3;  // Bits 1..3
      unsigned char mode     : 4;  // Bits 4..7
  };

  Bit Position:
  7     6     5     4     3     2     1     0
  +-----+-----+-----+-----+-----+-----+-----+-----+
  |       mode (4 bits)   | priority (3 bits) |act|
  +-----+-----+-----+-----+-----+-----+-----+-----+
  <------------------ 1 Single Byte (8 bits) ----->

WITHOUT BIT FIELDS:
  3 unsigned int variables = 3 x 4 bytes = 12 Bytes (96 bits) -> 91.7% wasted memory!""",
            "syntax": """// Typedef syntax
typedef existing_type AliasName;

// Bit field syntax
struct Tag {
    type member_name : bit_width;
};""",
            "simpleExample": {
                "code": """#include <stdio.h>

typedef unsigned int uint;

struct StatusRegister {
    uint powerOn : 1;
    uint sleepMode : 1;
    uint errorCode : 6;
};

int main(void) {
    struct StatusRegister reg = {1, 0, 15};
    printf("Power: %u | Sleep: %u | Error: %u\\n", reg.powerOn, reg.sleepMode, reg.errorCode);
    printf("Footprint: %zu bytes\\n", sizeof(reg));
    return 0;
}""",
                "explanation": "Packs 3 fields (1 + 1 + 6 = 8 bits) into a structure taking only 4 bytes (or 1 byte when using unsigned char) instead of 12 bytes."
            },
            "codeExample": """#include <stdio.h>

// Typedef with Bit Fields for a File Permissions and Attribute Mask
typedef struct {
    unsigned char readPerm    : 1; // Bit 0
    unsigned char writePerm   : 1; // Bit 1
    unsigned char execPerm    : 1; // Bit 2
    unsigned char isDirectory : 1; // Bit 3
    unsigned char isHidden    : 1; // Bit 4
    unsigned char isSystem    : 1; // Bit 5
    unsigned char reserved    : 2; // Bits 6..7
} FileAttributes;

void inspectFile(FileAttributes attr, const char *fileName) {
    printf("File: %s\\n", fileName);
    printf("  Permissions: [%c%c%c]\\n",
           attr.readPerm ? 'r' : '-',
           attr.writePerm ? 'w' : '-',
           attr.execPerm ? 'x' : '-');
    printf("  Attributes: Directory=%d, Hidden=%d, System=%d\\n",
           attr.isDirectory, attr.isHidden, attr.isSystem);
}

int main(void) {
    FileAttributes doc = {
        .readPerm = 1,
        .writePerm = 1,
        .execPerm = 0,
        .isDirectory = 0,
        .isHidden = 0,
        .isSystem = 0,
        .reserved = 0
    };

    FileAttributes sysDir = {
        .readPerm = 1,
        .writePerm = 0,
        .execPerm = 1,
        .isDirectory = 1,
        .isHidden = 1,
        .isSystem = 1,
        .reserved = 0
    };

    printf("Total size of FileAttributes: %zu byte(s)\\n", sizeof(FileAttributes));
    inspectFile(doc, "resume.pdf");
    inspectFile(sysDir, "boot_config");
    return 0;
}""",
            "expectedOutput": """Total size of FileAttributes: 1 byte(s)
File: resume.pdf
  Permissions: [rw-]
  Attributes: Directory=0, Hidden=0, System=0
File: boot_config
  Permissions: [r-x]
  Attributes: Directory=1, Hidden=1, System=1""",
            "stepByStep": [
                "Line 4-12: `typedef struct` declares `FileAttributes` packing 7 distinct flags into exactly 8 bits (1 byte).",
                "Line 14-22: `inspectFile` inspects the 1-bit flags and outputs standard POSIX-style `[rwx]` permission masks.",
                "Line 25-34: Initialize `doc` file attributes with read/write access using designated initializers.",
                "Line 36-45: Initialize `sysDir` as a hidden read-only executable system directory.",
                "Line 47-49: Display the compact 1-byte footprint and test both file inspection calls."
            ],
            "dryRun": "doc has read=1, write=1, exec=0 -> prints [rw-]. sysDir has read=1, write=0, exec=1 -> prints [r-x] with Directory=1, Hidden=1.",
            "keyTakeaways": [
                "typedef provides meaningful type aliases without adding runtime overhead.",
                "Bit fields allow micro-optimizing memory by restricting integer fields to specific bit counts.",
                "Multiple bit fields are co-located into a single storage unit by the compiler.",
                "You cannot take the memory address (&) of a bit field member.",
                "Bit fields are essential in operating systems, networking headers, and embedded device drivers."
            ],
            "commonMistakes": [
                {
                    "mistake": "Attempting to take the address of a bit field member like scanf(\"%d\", &reg.flag);",
                    "whyWrong": "Memory hardware address lines address bytes, not individual sub-byte bit ranges.",
                    "correction": "Read into a temporary variable: int temp; scanf(\"%d\", &temp); reg.flag = temp;",
                    "explanation": "Bit fields lack individual byte memory addresses."
                },
                {
                    "mistake": "Using signed int for 1-bit bit fields: int flag : 1; and expecting values 0 and 1.",
                    "whyWrong": "In two's complement, a 1-bit signed int represents only 0 and -1 (because the single bit is the sign bit!).",
                    "correction": "Always use unsigned int or unsigned char for bit fields unless negative values are specifically needed.",
                    "explanation": "Signed 1-bit variables interpret a 1 bit as a negative sign."
                }
            ],
            "realWorldExample": {
                "scenario": "Graphics Engine Sprite Rendering Flags",
                "code": """#include <stdio.h>

typedef struct {
    unsigned int visible   : 1;
    unsigned int flippedX  : 1;
    unsigned int flippedY  : 1;
    unsigned int blendMode : 3; // 8 blending modes
    unsigned int layer     : 4; // 16 rendering layers
} SpriteFlags;

int main(void) {
    SpriteFlags hero = {1, 0, 0, 2, 5};
    printf("Hero sprite layer: %u, blend: %u\\n", hero.layer, hero.blendMode);
    return 0;
}""",
                "explanation": "Game engines render thousands of sprites per frame and pack transform, visibility, and blending flags into single words to fit within GPU cache limits."
            },
            "practice": {
                "prompt": "Use typedef to create an alias `Byte` for `unsigned char`. Then define a bit-field struct `RGB222` with `r: 2`, `g: 2`, `b: 2` (6 bits total). Create an instance and print size.",
                "starterCode": """#include <stdio.h>

// Define Byte typedef and struct RGB222

int main(void) {
    // Print size of RGB222
    return 0;
}""",
                "solution": """#include <stdio.h>

typedef unsigned char Byte;

typedef struct {
    Byte r : 2;
    Byte g : 2;
    Byte b : 2;
} RGB222;

int main(void) {
    RGB222 pixel = {3, 2, 1};
    printf("RGB: (%u, %u, %u) | Size: %zu byte\\n", pixel.r, pixel.g, pixel.b, sizeof(pixel));
    return 0;
}""",
                "hints": [
                    "typedef unsigned char Byte;",
                    "struct { Byte r : 2; Byte g : 2; Byte b : 2; };"
                ]
            },
            "quiz": [
                {
                    "id": "q-c-adv-bit-1",
                    "question": "What is the purpose of the typedef keyword in C?",
                    "options": [
                        "To define a brand new hardware primitive type",
                        "To create an alias or synonym for an existing data type",
                        "To allocate heap memory for a pointer",
                        "To restrict variable scope to the current file"
                    ],
                    "correctIndex": 1,
                    "explanation": "typedef creates clean aliases for existing types, improving readability and portability."
                },
                {
                    "id": "q-c-adv-bit-2",
                    "question": "Why is it illegal to write &var.bit_field_member in C?",
                    "options": [
                        "Bit fields are stored in CPU registers only",
                        "Memory addresses can only reference byte boundaries, not individual bits",
                        "Bit fields are always constant",
                        "The ampersand operator is reserved for bitwise AND"
                    ],
                    "correctIndex": 1,
                    "explanation": "CPUs address memory in byte increments; individual bits within a byte do not have distinct memory addresses."
                },
                {
                    "id": "q-c-adv-bit-3",
                    "question": "What happens if you declare signed int flag : 1; and assign flag = 1;?",
                    "options": [
                        "flag equals 1",
                        "flag equals -1 due to two's complement sign-bit representation",
                        "Compiler throws a syntax error",
                        "flag overflows to 2"
                    ],
                    "correctIndex": 1,
                    "explanation": "A 1-bit signed integer has only a sign bit: 0 is positive 0, and 1 represents -1. Use unsigned for 0 and 1 flags."
                },
                {
                    "id": "q-c-adv-bit-4",
                    "question": "What is the maximum integer value that can be stored in an unsigned bit field of width 4 (unsigned int x : 4)?",
                    "options": ["4", "8", "15", "16"],
                    "correctIndex": 2,
                    "explanation": "4 unsigned bits can store 2^4 = 16 values, spanning from 0 to 15 (0b1111)."
                }
            ],
            "codingChallenge": {
                "title": "Compact Hardware Status Register Packer",
                "difficulty": "Easy",
                "problem_statement": "Define a typedef structure `StatusRegister` using `unsigned char` members:\n- `ready` : 1 (bit 0)\n- `busy` : 1 (bit 1)\n- `mode` : 2 (bits 2..3, range 0..3)\n- `errorCode` : 4 (bits 4..7, range 0..15)\n\nIn `main()`:\n1. Initialize `StatusRegister` with `ready = 1`, `busy = 0`, `mode = 2`, `errorCode = 9`.\n2. Print the size of `StatusRegister` in bytes.\n3. Print the packed configuration in the exact format:\n`Size: 1 byte | Ready: 1 | Busy: 0 | Mode: 2 | Error: 9`",
                "input_format": "None.",
                "output_format": "Exact string: Size: 1 byte | Ready: 1 | Busy: 0 | Mode: 2 | Error: 9",
                "constraints": "Structure must use bit fields and occupy 1 byte.",
                "starter_code": """#include <stdio.h>

// Define typedef struct StatusRegister

int main(void) {
    // Implement verification
    return 0;
}""",
                "expected_output": "Size: 1 byte | Ready: 1 | Busy: 0 | Mode: 2 | Error: 9",
                "test_cases": [
                    {
                        "input": "",
                        "expected_output": "Size: 1 byte | Ready: 1 | Busy: 0 | Mode: 2 | Error: 9",
                        "is_hidden": false
                    }
                ]
            },
            "summary": [
                "typedef simplifies complex type names and pointer syntax.",
                "Bit fields allow allocating specific bit-widths for structure fields.",
                "Bit fields drastically compress memory for flags and small integer configurations.",
                "Bit fields cannot be targeted with the address-of (&) operator.",
                "Always use unsigned types for bit fields to avoid surprising negative sign extensions."
            ],
            "content_standard": "In-depth reference for typedef aliasing, bit-field packing, hardware registers, and bit manipulation in C.",
            "content_detailed": "Compiler bit-packing layout, MSB vs LSB bit order, memory-mapped I/O, and ABI specifications for bit fields.",
            "content_simplified": "Bit fields let you divide a single byte of memory into individual bit switches like a compact control panel."
        }
    ]
