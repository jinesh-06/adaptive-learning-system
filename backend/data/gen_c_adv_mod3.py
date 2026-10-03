"""Module 3: Core Data Structures
Topics 08 - 12 for Advanced C Systems & Data Structures.
"""

true = True
false = False
null = None

def get_module_3_topics():
    return [
        {
            "id": "top-c-data-structures-intro",
            "number": 8,
            "numberDisplay": "08",
            "moduleId": "mod-c-adv-data-structures",
            "moduleTitle": "Module 3: Core Data Structures",
            "title": "Introduction to Data Structures",
            "slug": "introduction-to-data-structures",
            "language": "c",
            "difficulty": "Advanced",
            "estimatedMinutes": 50,
            "prerequisiteId": "top-c-preprocessor",
            "shortDescription": "Understand computational complexity, Big O notation (O(1), O(log n), O(n), O(n log n), O(n^2)), abstract data types (ADTs), and memory layout trade-offs in C.",
            "learningObjectives": [
                "Define what a data structure is and distinguish linear from non-linear structures.",
                "Differentiate static compile-time allocations from dynamic heap-allocated structures.",
                "Understand the Abstract Data Type (ADT) separation between interface and implementation.",
                "Analyze time complexity and space complexity using formal Big O asymptotic notation.",
                "Compare growth rates: O(1), O(log n), O(n), O(n log n), and O(n^2).",
                "Evaluate cache locality and performance trade-offs between contiguous arrays and pointer-linked nodes."
            ],
            "conceptExplanation": """### 1. What are Data Structures?
A **data structure** is a specialized format for organizing, processing, retrieving, and storing data in computer memory efficiently. The choice of data structure directly dictates whether an algorithm executes in microseconds or takes hours.

### 2. Taxonomy of Data Structures
1. **Linear Structures**: Elements form a sequential sequence where each element has a unique predecessor and successor (except head and tail).
   - *Examples*: Arrays, Linked Lists, Stacks, Queues.
2. **Non-Linear Structures**: Elements have hierarchical or interconnected relationships with multiple paths.
   - *Examples*: Trees (Binary Trees, BSTs, Heaps), Graphs.
3. **Static Structures**: Fixed memory size allocated at compile time (e.g. `int arr[100];`). Fast and simple, but risks buffer overflow or wasted space.
4. **Dynamic Structures**: Shrink and expand on the heap at runtime using `malloc()` and `free()`. Memory scales with workload, but introduces pointer memory overhead and fragmentation.

### 3. Abstract Data Types (ADTs)
An **Abstract Data Type (ADT)** is a mathematical model for data types defined strictly by their **behavior** (operations and contracts) rather than their internal implementation.
- *Example*: A Stack ADT specifies `push()`, `pop()`, `peek()`, and `isEmpty()`. 
- The user of the Stack ADT does not know or care whether the stack is implemented using a fixed array, dynamic array, or singly linked list.

### 4. Big O Asymptotic Complexity Analysis
Algorithm efficiency is measured as input size $n$ approaches infinity:
- **$O(1)$ Constant Time**: Execution time is independent of input size (e.g., array index lookup `arr[i]`).
- **$O(\\log n)$ Logarithmic Time**: Search space is halved each step (e.g., Binary Search on sorted data).
- **$O(n)$ Linear Time**: Execution scales directly with $n$ (e.g., linear scan of an unsorted list).
- **$O(n \\log n)$ Linearithmic Time**: Optimal comparison-based sorting (e.g., Merge Sort, Quick Sort average).
- **$O(n^2)$ Quadratic Time**: Nested iterations over the data (e.g., Bubble Sort, Selection Sort).

### 5. Memory Locality: Arrays vs Linked Structures
- **Arrays**: Occupy contiguous physical memory. Modern CPU L1/L2 caches prefetch adjacent cache lines (typically 64 bytes). Iterating over an array is blisteringly fast due to high cache spatial locality. However, inserting in the middle requires shifting elements ($O(n)$).
- **Linked Structures**: Nodes are scattered across non-contiguous heap memory addresses. Each node requires pointer storage overhead (8 bytes per pointer on 64-bit). Dereferencing pointers incurs CPU cache misses, but insertion and deletion given a node pointer are instantaneous $O(1)$.""",
            "visualDiagram": """BIG O GROWTH RATES COMPARISON:

  Operations
      ^
      |                                              O(n^2) Quadratic
      |                                      :      /
      |                                      :     /
      |                                     /     /  O(n log n)
      |                                    /     /
      |                                   /     /    O(n) Linear
      |                                  /     /
      |                                 /     /
      |                                /  _--'
      |                     _..-------'--'           O(log n) Logarithmic
      |            _..------                         O(1) Constant
      +------------------------------------------------------------> Elements (n)

CACHE LOCALITY:
  Array (Contiguous RAM):      [ Node 0 ][ Node 1 ][ Node 2 ][ Node 3 ] -> 1 Cache Line!
  Linked List (Scattered RAM): [ Node 0 ] ----> [ Node 1 ] ----> [ Node 2 ] -> Cache Misses!""",
            "syntax": """// Typical ADT Interface in C (stack_adt.h)
typedef struct Stack Stack;

Stack* stack_create(int capacity);
void   stack_push(Stack *s, int val);
int    stack_pop(Stack *s);
int    stack_peek(const Stack *s);
void   stack_destroy(Stack *s);""",
            "simpleExample": {
                "code": """#include <stdio.h>

// O(1) Constant Time Operation
int getFirst(const int arr[]) {
    return arr[0];
}

// O(n) Linear Time Operation
int findMax(const int arr[], int n) {
    int max = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > max) max = arr[i];
    }
    return max;
}

int main(void) {
    int sample[5] = {14, 82, 35, 99, 41};
    printf("O(1) First: %d\\n", getFirst(sample));
    printf("O(n) Max:   %d\\n", findMax(sample, 5));
    return 0;
}""",
                "explanation": "Illustrates the contrast between an $O(1)$ constant time direct array lookup and an $O(n)$ linear traversal."
            },
            "codeExample": """#include <stdio.h>
#include <stdlib.h>

// Dynamic Vector ADT demonstrating amortized O(1) resizing
typedef struct {
    int *data;
    int size;
    int capacity;
} IntVector;

IntVector* vectorCreate(int initialCapacity) {
    IntVector *v = (IntVector *)malloc(sizeof(IntVector));
    v->size = 0;
    v->capacity = initialCapacity > 0 ? initialCapacity : 2;
    v->data = (int *)malloc(v->capacity * sizeof(int));
    return v;
}

void vectorPush(IntVector *v, int value) {
    if (v->size == v->capacity) {
        v->capacity *= 2; // Geometric resizing strategy
        v->data = (int *)realloc(v->data, v->capacity * sizeof(int));
        printf("Resized vector buffer to %d slots\\n", v->capacity);
    }
    v->data[v->size++] = value;
}

void vectorFree(IntVector *v) {
    free(v->data);
    free(v);
}

int main(void) {
    IntVector *vec = vectorCreate(2);
    printf("Initial Capacity: %d\\n", vec->capacity);

    for (int i = 10; i <= 50; i += 10) {
        vectorPush(vec, i);
    }

    printf("Vector elements: ");
    for (int i = 0; i < vec->size; i++) {
        printf("%d ", vec->data[i]);
    }
    printf("\\nFinal Size: %d, Capacity: %d\\n", vec->size, vec->capacity);

    vectorFree(vec);
    return 0;
}""",
            "expectedOutput": """Initial Capacity: 2
Resized vector buffer to 4 slots
Resized vector buffer to 8 slots
Vector elements: 10 20 30 40 50 
Final Size: 5, Capacity: 8""",
            "stepByStep": [
                "Line 5-9: Define `IntVector` encapsulation data pointer, current `size`, and allocated `capacity`.",
                "Line 11-17: `vectorCreate` allocates vector controller struct and underlying data buffer on the heap.",
                "Line 19-26: `vectorPush` checks if full; doubles capacity (`capacity *= 2`) and reallocates memory, ensuring amortized O(1) insertions.",
                "Line 32-37: Push 5 elements into a vector starting with capacity 2, triggering dynamic geometric doubling.",
                "Line 45: Free both underlying array and controller struct."
            ],
            "dryRun": "Push 10 (size=1), 20 (size=2, full). Push 30 triggers resize to 4 slots. Push 40 (size=4, full). Push 50 triggers resize to 8 slots. Final size 5, capacity 8.",
            "keyTakeaways": [
                "Data structures organize data to optimize algorithmic time and space complexity.",
                "Big O notation characterizes worst-case and asymptotic growth rates.",
                "ADTs define interface contracts independently of internal implementation.",
                "Arrays offer O(1) indexed lookup and high cache locality.",
                "Geometric resizing (doubling capacity) achieves amortized O(1) append time."
            ],
            "commonMistakes": [
                {
                    "mistake": "Resizing dynamic arrays by +1 slot each time instead of doubling: realloc(ptr, (size + 1) * sizeof(int)).",
                    "whyWrong": "Adding 1 slot causes each insertion to take O(n) memory reallocations, resulting in horrible O(n^2) total insertion time.",
                    "correction": "Use geometric doubling (capacity *= 2) to guarantee amortized O(1) append efficiency.",
                    "explanation": "Geometric scaling ensures reallocations happen exponentially less frequently."
                },
                {
                    "mistake": "Assuming linked lists are always faster than arrays for small collections.",
                    "whyWrong": "Pointer chasing causes CPU cache misses; iterating an array of 1,000 items is often 5-10x faster than a linked list due to CPU hardware cachelines.",
                    "correction": "Default to contiguous arrays unless frequent mid-list insertions or unbounded node splicing are required.",
                    "explanation": "Modern hardware architecture rewards spatial memory locality."
                }
            ],
            "realWorldExample": {
                "scenario": "Linux Kernel Cgroups Memory Hierarchy",
                "code": """#include <stdio.h>

// Complexity classification in resource accounting
int checkMemoryLimit(long usedBytes, long maxLimit) {
    return usedBytes <= maxLimit; // O(1) constant bound check
}

int main(void) {
    printf("Memory check: %s\\n", checkMemoryLimit(2048, 4096) ? "PASS" : "EXCEEDED");
    return 0;
}""",
                "explanation": "Container virtualization engines (Docker, Kubernetes) perform O(1) constant-time resource accounting checks on every kernel memory allocation."
            },
            "practice": {
                "prompt": "Write a function `isSorted(const int arr[], int n)` that returns 1 if an array is in non-decreasing order and 0 otherwise. What is its Big O time complexity?",
                "starterCode": """#include <stdio.h>

int isSorted(const int arr[], int n) {
    // Return 1 if sorted, 0 otherwise
    return 1;
}

int main(void) {
    int a[4] = {1, 3, 5, 2};
    printf("Sorted: %d\\n", isSorted(a, 4));
    return 0;
}""",
                "solution": """#include <stdio.h>

int isSorted(const int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        if (arr[i] > arr[i + 1]) return 0;
    }
    return 1;
}

int main(void) {
    int a[4] = {1, 3, 5, 2};
    printf("Sorted: %d\\n", isSorted(a, 4)); // Prints 0
    return 0;
}""",
                "hints": [
                    "Compare arr[i] with arr[i + 1] in a loop up to n - 1.",
                    "Worst case scans all elements once: O(n) linear time."
                ]
            },
            "quiz": [
                {
                    "id": "q-c-adv-ds-1",
                    "question": "What is an Abstract Data Type (ADT)?",
                    "options": [
                        "A data type that has no physical memory implementation",
                        "A specification of a data structure defined by its operations and behavior, independent of implementation",
                        "A data structure that only stores floating-point numbers",
                        "An encrypted structure stored in disk files"
                    ],
                    "correctIndex": 1,
                    "explanation": "An ADT specifies what operations can be performed (the interface) without dictating how they are implemented."
                },
                {
                    "id": "q-c-adv-ds-2",
                    "question": "What is the Big O time complexity of accessing an element in an array by its index (e.g. arr[k])?",
                    "options": ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
                    "correctIndex": 0,
                    "explanation": "Array indexing uses base address arithmetic (base + k * sizeof(type)), taking O(1) constant time."
                },
                {
                    "id": "q-c-adv-ds-3",
                    "question": "Why do modern CPUs process contiguous arrays significantly faster than pointer-based linked lists during iteration?",
                    "options": [
                        "Arrays consume zero stack memory",
                        "CPUs utilize hardware cache prefetching because array elements reside in adjacent memory addresses",
                        "Linked lists cannot store 32-bit integers",
                        "Arrays bypass the operating system kernel"
                    ],
                    "correctIndex": 1,
                    "explanation": "Contiguous memory exhibits high spatial locality, allowing CPU L1/L2 caches to prefetch cache lines and avoid RAM memory stalls."
                },
                {
                    "id": "q-c-adv-ds-4",
                    "question": "What is the worst-case time complexity of an algorithm that uses two nested loops, each iterating n times?",
                    "options": ["O(n)", "O(2n)", "O(n log n)", "O(n^2)"],
                    "correctIndex": 3,
                    "explanation": "Two nested loops running n iterations execute n * n = n^2 operations, which is O(n^2) quadratic time."
                }
            ],
            "codingChallenge": {
                "title": "Complexity Benchmark: Constant vs Linear Time",
                "difficulty": "Easy",
                "problem_statement": "Implement two functions:\n1. `int getMidpoint(const int arr[], int n)`: returns element at index `n / 2` (O(1)).\n2. `int countEvens(const int arr[], int n)`: counts how many numbers in `arr` are even (O(n)).\n\nIn `main()`:\nGiven `int data[6] = {12, 17, 24, 33, 40, 55};`:\n- Call `getMidpoint(data, 6)`\n- Call `countEvens(data, 6)`\n- Print exact line:\n`Midpoint: 33 | Even Count: 3`",
                "input_format": "None.",
                "output_format": "Midpoint: 33 | Even Count: 3",
                "constraints": "Strictly O(1) for getMidpoint, O(n) for countEvens.",
                "starter_code": """#include <stdio.h>

// Implement getMidpoint and countEvens

int main(void) {
    int data[6] = {12, 17, 24, 33, 40, 55};
    // Call and print
    return 0;
}""",
                "expected_output": "Midpoint: 33 | Even Count: 3",
                "test_cases": [
                    {
                        "input": "",
                        "expected_output": "Midpoint: 33 | Even Count: 3",
                        "is_hidden": false
                    }
                ]
            },
            "summary": [
                "Data structures determine the efficiency and scalability of software systems.",
                "Big O notation quantifies worst-case asymptotic time and space resource usage.",
                "Linear structures form ordered sequences; non-linear structures form hierarchical trees and graphs.",
                "ADTs separate functional contracts from concrete memory implementations.",
                "Cache spatial locality makes contiguous arrays faster than pointer structures for sequential processing."
            ],
            "content_standard": "Comprehensive introduction to data structure taxonomy, asymptotic analysis, Big O complexities, and memory locality.",
            "content_detailed": "CPU L1/L2 cacheline behavior, spatial vs temporal locality, amortized analysis, and mathematical proofs for Big O bounds.",
            "content_simplified": "Data structures are like different toolboxes: some let you grab things instantly by number, while others let you connect things like a train."
        },
        {
            "id": "top-c-singly-linked-list",
            "number": 9,
            "numberDisplay": "09",
            "moduleId": "mod-c-adv-data-structures",
            "moduleTitle": "Module 3: Core Data Structures",
            "title": "Singly Linked Lists",
            "slug": "singly-linked-lists",
            "language": "c",
            "difficulty": "Advanced",
            "estimatedMinutes": 55,
            "prerequisiteId": "top-c-data-structures-intro",
            "shortDescription": "Master singly linked lists in C: dynamic node creation, head/tail insertion, traversal, deletion, search, in-place reversal with 3 pointers, and leak-free destruction.",
            "learningObjectives": [
                "Define a singly linked list node structure using self-referential pointers.",
                "Dynamically allocate nodes on the heap with malloc() and maintain the head pointer.",
                "Traverse and search a linked list in O(n) time.",
                "Implement O(1) insertion at head and O(n) insertion at tail and arbitrary positions.",
                "Delete nodes by value or position and safely stitch neighbor pointers.",
                "Reverse a singly linked list in-place using the classic 3-pointer algorithm (prev, curr, next).",
                "Free all allocated nodes safely without memory leaks or use-after-free faults."
            ],
            "conceptExplanation": """### 1. Introduction to Singly Linked Lists
A **singly linked list** is a linear dynamic data structure composed of distinct nodes allocated on the heap. Unlike arrays, nodes are not stored in contiguous memory; each node explicitly points to the next node in the sequence.

### 2. Node Representation in C
```c
struct Node {
    int data;           // Payload value
    struct Node *next;  // Pointer to subsequent node (or NULL)
};
```
The list is anchored by a **head pointer** (`struct Node *head`), which stores the address of the first node. An empty list is represented by `head == NULL`.

### 3. Traversal Algorithm
To visit every node, we start at `head` and advance using a temporary pointer until `curr == NULL`:
```c
void traverse(struct Node *head) {
    struct Node *curr = head;
    while (curr != NULL) {
        printf("%d -> ", curr->data);
        curr = curr->next; // Advance to next node
    }
    printf("NULL\\n");
}
```

### 4. Insertion Operations
- **Insert at Head ($O(1)$)**:
  1. Allocate new node: `newNode = malloc(sizeof(struct Node))`.
  2. Assign payload: `newNode->data = val`.
  3. Point new node to current head: `newNode->next = head`.
  4. Update head: `head = newNode`.
- **Insert at Tail ($O(n)$)**:
  1. Allocate new node with `next = NULL`.
  2. If `head == NULL`, set `head = newNode`.
  3. Otherwise, traverse to last node (`curr->next == NULL`) and set `curr->next = newNode`.

### 5. Deletion Operation ($O(n)$)
To delete a node with target value `key`:
1. Check if `head->data == key`. If so, save `head`, set `head = head->next`, and `free(temp)`.
2. Otherwise, maintain two pointers: `prev` and `curr`.
3. When found, stitch: `prev->next = curr->next`.
4. Release deleted node: `free(curr)`.

### 6. In-Place Reversal Algorithm ($O(n)$ Time, $O(1)$ Space)
Reversing a linked list requires changing every node's `next` pointer to point backwards. This is accomplished using **three pointers**: `prev`, `curr`, and `next`:
```c
struct Node* reverseList(struct Node *head) {
    struct Node *prev = NULL;
    struct Node *curr = head;
    struct Node *next = NULL;

    while (curr != NULL) {
        next = curr->next;  // 1. Store next node
        curr->next = prev;  // 2. Reverse pointer to point backwards
        prev = curr;        // 3. Move prev forward
        curr = next;        // 4. Move curr forward
    }
    return prev; // prev is the new head!
}
```

### 7. Safe Memory Deallocation
Never free `head` without saving `head->next`, or the remaining list becomes an unreachable memory leak:
```c
void freeList(struct Node *head) {
    struct Node *curr = head;
    while (curr != NULL) {
        struct Node *temp = curr;
        curr = curr->next;
        free(temp);
    }
}
```""",
            "visualDiagram": """SINGLY LINKED LIST STRUCTURE:
  head
    |
    v
  +----+------+     +----+------+     +----+------+
  | 10 | next |---> | 20 | next |---> | 30 | NULL |
  +----+------+     +----+------+     +----+------+

IN-PLACE REVERSAL 3-POINTER DANCE:
  Step 1: Save next    --> next = curr->next
  Step 2: Reverse link --> curr->next = prev
  Step 3: Advance prev --> prev = curr
  Step 4: Advance curr --> curr = next

  NULL <--- [ 10 ] <--- [ 20 ] <--- [ 30 ] (new head = prev)""",
            "syntax": """// Node definition
typedef struct Node {
    int data;
    struct Node *next;
} Node;

// Basic operations prototypes
Node* insertHead(Node *head, int val);
Node* insertTail(Node *head, int val);
Node* deleteNode(Node *head, int key);
Node* reverseList(Node *head);
void  freeList(Node *head);""",
            "simpleExample": {
                "code": """#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node *next;
};

int main(void) {
    struct Node *first = (struct Node *)malloc(sizeof(struct Node));
    struct Node *second = (struct Node *)malloc(sizeof(struct Node));

    first->data = 10;
    first->next = second;

    second->data = 20;
    second->next = NULL;

    printf("List: %d -> %d -> NULL\\n", first->data, first->next->data);

    free(second);
    free(first);
    return 0;
}""",
                "explanation": "Manually allocates two linked nodes, establishes the pointer chain, prints values, and frees both."
            },
            "codeExample": """#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node *next;
};

struct Node* insertHead(struct Node *head, int val) {
    struct Node *newNode = (struct Node *)malloc(sizeof(struct Node));
    newNode->data = val;
    newNode->next = head;
    return newNode;
}

struct Node* reverseList(struct Node *head) {
    struct Node *prev = NULL;
    struct Node *curr = head;
    struct Node *next = NULL;

    while (curr != NULL) {
        next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}

void printList(struct Node *head) {
    struct Node *curr = head;
    while (curr != NULL) {
        printf("%d -> ", curr->data);
        curr = curr->next;
    }
    printf("NULL\\n");
}

void freeList(struct Node *head) {
    struct Node *curr = head;
    while (curr != NULL) {
        struct Node *temp = curr;
        curr = curr->next;
        free(temp);
    }
}

int main(void) {
    struct Node *head = NULL;
    head = insertHead(head, 30);
    head = insertHead(head, 20);
    head = insertHead(head, 10);

    printf("Original List: ");
    printList(head);

    head = reverseList(head);
    printf("Reversed List: ");
    printList(head);

    freeList(head);
    return 0;
}""",
            "expectedOutput": """Original List: 10 -> 20 -> 30 -> NULL
Reversed List: 30 -> 20 -> 10 -> NULL""",
            "stepByStep": [
                "Line 4-7: Declare self-referential `struct Node`.",
                "Line 9-14: `insertHead` creates a node and prepends it in O(1) time.",
                "Line 16-28: `reverseList` uses `prev`, `curr`, and `next` to reverse pointers in-place.",
                "Line 30-37: `printList` traverses the chain until reaching `NULL`.",
                "Line 39-46: `freeList` steps through and safely releases heap nodes.",
                "Line 49-59: Build list `10 -> 20 -> 30`, print, reverse to `30 -> 20 -> 10`, print, and free."
            ],
            "dryRun": "head starts NULL. Insert 30, then 20, then 10. List is 10->20->30. reverseList flips pointers: 10->NULL, 20->10, 30->20. Returns 30 as new head.",
            "keyTakeaways": [
                "Singly linked lists grow dynamically in heap memory without contiguous allocation.",
                "Head insertion is O(1) constant time; tail insertion is O(n) unless a tail pointer is maintained.",
                "In-place list reversal takes O(n) time and O(1) auxiliary space using 3 pointers.",
                "Always preserve curr->next before modifying curr->next or freeing curr.",
                "Every malloc() node must be freed to avoid heap memory leaks."
            ],
            "commonMistakes": [
                {
                    "mistake": "Writing free(curr); curr = curr->next;",
                    "whyWrong": "Once free(curr) is called, curr's memory is released. Accessing curr->next is a Use-After-Free bug that crashes or reads garbage.",
                    "correction": "Save next first: struct Node *temp = curr; curr = curr->next; free(temp);",
                    "explanation": "Always extract members before releasing ownership of the parent structure."
                },
                {
                    "mistake": "Losing the head pointer when traversing: while (head != NULL) { head = head->next; }",
                    "whyWrong": "Overwriting head causes you to permanently lose reference to the start of the list.",
                    "correction": "Use a temporary iterator pointer: struct Node *curr = head;",
                    "explanation": "Never mutate the head pointer unless intentionally removing the first node."
                }
            ],
            "realWorldExample": {
                "scenario": "Operating System Kernel Free-List Memory Allocator",
                "code": """#include <stdio.h>

struct FreeBlock {
    size_t blockSize;
    struct FreeBlock *nextFree;
};

void showFreeBlocks(struct FreeBlock *head) {
    int count = 0;
    while (head) { count++; head = head->nextFree; }
    printf("Active free heap chunks: %d\\n", count);
}

int main(void) {
    struct FreeBlock b1 = {1024, NULL};
    showFreeBlocks(&b1);
    return 0;
}""",
                "explanation": "Embedded memory managers and malloc implementations maintain a singly linked 'free-list' of unallocated memory chunks."
            },
            "practice": {
                "prompt": "Write a function `int countNodes(struct Node *head)` that counts and returns the number of nodes in a linked list.",
                "starterCode": """#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node *next;
};

int countNodes(struct Node *head) {
    // Implement count
    return 0;
}

int main(void) {
    // Test countNodes
    return 0;
}""",
                "solution": """#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node *next;
};

int countNodes(struct Node *head) {
    int count = 0;
    struct Node *curr = head;
    while (curr != NULL) {
        count++;
        curr = curr->next;
    }
    return count;
}

int main(void) {
    struct Node a = {1, NULL};
    struct Node b = {2, NULL};
    a.next = &b;
    printf("Total nodes: %d\\n", countNodes(&a));
    return 0;
}""",
                "hints": [
                    "Loop with while (curr != NULL)",
                    "Increment a count variable on each step"
                ]
            },
            "quiz": [
                {
                    "id": "q-c-adv-sll-1",
                    "question": "What is the time complexity of inserting a new node at the head of a singly linked list?",
                    "options": ["O(n)", "O(1)", "O(log n)", "O(n^2)"],
                    "correctIndex": 1,
                    "explanation": "Inserting at head only requires creating the node, setting its next to head, and repointing head, taking O(1) constant time."
                },
                {
                    "id": "q-c-adv-sll-2",
                    "question": "In the standard 3-pointer linked list reversal algorithm, which pointers are maintained?",
                    "options": [
                        "first, second, third",
                        "prev, curr, next",
                        "left, mid, right",
                        "start, pivot, end"
                    ],
                    "correctIndex": 1,
                    "explanation": "prev, curr, and next allow tracking the previous node, current node being reversed, and saving the upcoming node."
                },
                {
                    "id": "q-c-adv-sll-3",
                    "question": "What happens if you free(head) before updating head = head->next during list deletion?",
                    "options": [
                        "Nothing, C manages pointer recovery",
                        "A Use-After-Free bug occurs when trying to access head->next",
                        "The entire list is deleted automatically",
                        "A compiler warning is printed"
                    ],
                    "correctIndex": 1,
                    "explanation": "Freeing head invalidates its memory, making head->next undefined behavior."
                },
                {
                    "id": "q-c-adv-sll-4",
                    "question": "What condition marks the end of a standard singly linked list?",
                    "options": [
                        "curr->data == 0",
                        "curr->next == NULL",
                        "curr == head",
                        "curr->next == head"
                    ],
                    "correctIndex": 1,
                    "explanation": "The tail node of a singly linked list has its next pointer set to NULL."
                }
            ],
            "codingChallenge": {
                "title": "Singly Linked List Append and Sum",
                "difficulty": "Easy",
                "problem_statement": "Define `struct Node` with `int data` and `struct Node *next`.\nImplement:\n- `struct Node* append(struct Node *head, int val)`: appends node with `val` at the end of list.\n- `int computeSum(struct Node *head)`: traverses and returns sum of all node values.\n\nIn `main()`:\n1. Create empty list `head = NULL`.\n2. Append values: 15, 25, 35.\n3. Compute sum and count of nodes.\n4. Print in exact format:\n`List Sum: 75 | Node Count: 3`\n5. Free all allocated nodes.",
                "input_format": "None.",
                "output_format": "List Sum: 75 | Node Count: 3",
                "constraints": "Must allocate nodes dynamically and free all memory.",
                "starter_code": """#include <stdio.h>
#include <stdlib.h>

// Define struct Node, append, and computeSum

int main(void) {
    // Implement verification
    return 0;
}""",
                "expected_output": "List Sum: 75 | Node Count: 3",
                "test_cases": [
                    {
                        "input": "",
                        "expected_output": "List Sum: 75 | Node Count: 3",
                        "is_hidden": false
                    }
                ]
            },
            "summary": [
                "Singly linked lists connect dynamic nodes via single next pointers.",
                "Head insertion is O(1); tail and middle operations take O(n) traversal.",
                "In-place list reversal uses 3 pointers (prev, curr, next) in O(n) time and O(1) space.",
                "Deleting nodes requires stitching previous pointers to next pointers.",
                "Memory deallocation requires saving next pointers before freeing current nodes."
            ],
            "content_standard": "Comprehensive study of singly linked lists, pointer manipulation, CRUD operations, reversal, and memory cleanup in C.",
            "content_detailed": "Pointer-to-pointer (**head) double indirection techniques, memory leak detection with Valgrind, and cache performance implications.",
            "content_simplified": "A linked list is like a scavenger hunt where each clue contains a message and a note pointing to where the next clue is hidden."
        },
        {
            "id": "top-c-doubly-circular-list",
            "number": 10,
            "numberDisplay": "10",
            "moduleId": "mod-c-adv-data-structures",
            "moduleTitle": "Module 3: Core Data Structures",
            "title": "Doubly and Circular Linked Lists",
            "slug": "doubly-and-circular-linked-lists",
            "language": "c",
            "difficulty": "Advanced",
            "estimatedMinutes": 55,
            "prerequisiteId": "top-c-singly-linked-list",
            "shortDescription": "Master doubly linked lists (prev and next pointers), bidirectional traversal, circular singly linked lists, circular doubly linked lists, and round-robin scheduler design.",
            "learningObjectives": [
                "Design doubly linked list (DLL) nodes with prev and next pointers.",
                "Perform forward and backward traversal on doubly linked lists.",
                "Execute O(1) deletion of a node given its direct pointer in a DLL.",
                "Construct Circular Singly Linked Lists (CSLL) where tail points back to head.",
                "Construct Circular Doubly Linked Lists (CDLL) with seamless wrap-around navigation.",
                "Identify termination conditions for circular lists to avoid infinite traversal loops.",
                "Compare trade-offs between singly, doubly, and circular linked list variations."
            ],
            "conceptExplanation": """### 1. Doubly Linked Lists (DLL)
In a singly linked list, traversal is strictly forward; finding the previous node requires traversing from the head ($O(n)$).
A **Doubly Linked List (DLL)** equips each node with two pointers:
- `next`: points to the subsequent node.
- `prev`: points to the antecedent node.

```c
struct DNode {
    int data;
    struct DNode *prev;
    struct DNode *next;
};
```
For the head node, `prev == NULL`. For the tail node, `next == NULL`.

### 2. Bidirectional Traversal & $O(1)$ Deletion
- **Bidirectional Traversal**: DLLs can be traversed forwards from `head` to `tail`, or backwards from `tail` to `head`.
- **$O(1)$ Direct Deletion**: In a singly linked list, deleting node `X` requires finding `prev`. In a DLL, `X` already holds a pointer to its previous node (`X->prev`):
```c
void deleteDNode(struct DNode **head, struct DNode *del) {
    if (*head == NULL || del == NULL) return;
    if (*head == del) *head = del->next;
    if (del->next != NULL) del->next->prev = del->prev;
    if (del->prev != NULL) del->prev->next = del->next;
    free(del);
}
```

### 3. Circular Singly Linked Lists (CSLL)
In a **Circular Singly Linked List**, the `next` pointer of the last node points back to the `head` node instead of `NULL`:
- There is no `NULL` terminator.
- Traversal terminates when `curr->next == head` or by using a `do-while` loop.
- Useful in round-robin schedulers and cyclic turn-based game turns.

### 4. Circular Doubly Linked Lists (CDLL)
A **Circular Doubly Linked List** unifies both paradigms:
- `head->prev` points directly to the `tail` node!
- `tail->next` points directly to the `head` node!
This allows accessing both the first and last elements in $O(1)$ time using just the `head` pointer.

### 5. Architectural Comparison
| Feature | Singly Linked | Doubly Linked | Circular Doubly |
|---|---|---|---|
| Memory Overhead | 1 Pointer / node | 2 Pointers / node | 2 Pointers / node |
| Backward Traversal | Impossible ($O(n)$ re-scan) | Easy ($O(1)$ per step) | Easy ($O(1)$ per step) |
| Access Tail from Head | $O(n)$ | $O(n)$ (or $O(1)$ with tail ptr) | $O(1)$ (`head->prev`) |
| Deletion given node | $O(n)$ | $O(1)$ | $O(1)$ |
| Complexity & Bugs | Low | Moderate | High (loop traps) |""",
            "visualDiagram": """DOUBLY LINKED LIST (DLL):
         +---------+---------+---------+
  NULL <-| prev:NULL| 10 | next |--------->+
         +---------+---------+---------+   |
              ^                            |
              +----------------------------+
              |   +---------+---------+---------+
              +---| prev:*   | 20 | next |---------> NULL
                  +---------+---------+---------+

CIRCULAR DOUBLY LINKED LIST (CDLL):
       +---------------------------------------------+
       |                                             |
       v                                             |
  +---------+---------+---------+     +---------+---------+---------+
  | prev:*  | Head:10 | next:*  |<--->| prev:*  | Tail:20 | next:*  |
  +---------+---------+---------+     +---------+---------+---------+
       |                                             ^
       +---------------------------------------------+""",
            "syntax": """// Doubly linked node
typedef struct DNode {
    int data;
    struct DNode *prev;
    struct DNode *next;
} DNode;

// Insertion at head in DLL
DNode* insertDHead(DNode *head, int val);

// Circular traversal idiom
DNode *curr = head;
if (head != NULL) {
    do {
        // process curr
        curr = curr->next;
    } while (curr != head);
}""",
            "simpleExample": {
                "code": """#include <stdio.h>
#include <stdlib.h>

struct DNode {
    int data;
    struct DNode *prev;
    struct DNode *next;
};

int main(void) {
    struct DNode *n1 = (struct DNode *)malloc(sizeof(struct DNode));
    struct DNode *n2 = (struct DNode *)malloc(sizeof(struct DNode));

    n1->data = 10; n1->prev = NULL; n1->next = n2;
    n2->data = 20; n2->prev = n1;   n2->next = NULL;

    printf("Forward:  %d -> %d\\n", n1->data, n1->next->data);
    printf("Backward: %d -> %d\\n", n2->data, n2->prev->data);

    free(n2); free(n1);
    return 0;
}""",
                "explanation": "Builds a 2-node DLL with reciprocal `prev` and `next` links and demonstrates bidirectional printing."
            },
            "codeExample": """#include <stdio.h>
#include <stdlib.h>

struct DNode {
    int data;
    struct DNode *prev;
    struct DNode *next;
};

struct DNode* insertDHead(struct DNode *head, int val) {
    struct DNode *newNode = (struct DNode *)malloc(sizeof(struct DNode));
    newNode->data = val;
    newNode->prev = NULL;
    newNode->next = head;

    if (head != NULL) {
        head->prev = newNode;
    }
    return newNode;
}

void printForwardAndBackward(struct DNode *head) {
    struct DNode *curr = head;
    struct DNode *tail = NULL;

    printf("Forward:  ");
    while (curr != NULL) {
        printf("%d ", curr->data);
        if (curr->next == NULL) tail = curr; // Capture tail
        curr = curr->next;
    }
    printf("\\n");

    printf("Backward: ");
    curr = tail;
    while (curr != NULL) {
        printf("%d ", curr->data);
        curr = curr->prev;
    }
    printf("\\n");
}

void freeDList(struct DNode *head) {
    struct DNode *curr = head;
    while (curr != NULL) {
        struct DNode *temp = curr;
        curr = curr->next;
        free(temp);
    }
}

int main(void) {
    struct DNode *head = NULL;
    head = insertDHead(head, 30);
    head = insertDHead(head, 20);
    head = insertDHead(head, 10);

    printForwardAndBackward(head);
    freeDList(head);
    return 0;
}""",
            "expectedOutput": """Forward:  10 20 30 
Backward: 30 20 10 """,
            "stepByStep": [
                "Line 4-8: Define `struct DNode` with `prev` and `next` pointers.",
                "Line 10-19: `insertDHead` sets `newNode->next = head` and updates `head->prev = newNode` if list was non-empty.",
                "Line 21-39: `printForwardAndBackward` walks forward to print and locate `tail`, then uses `prev` to traverse backward.",
                "Line 41-48: `freeDList` safely releases all nodes.",
                "Line 51-58: Insert 30, 20, 10 at head. Prints forward: 10 20 30, backward: 30 20 10."
            ],
            "dryRun": "Head created with 10. n1=10, n2=20, n3=30. Forward prints 10, 20, 30. Backward prints 30, 20, 10.",
            "keyTakeaways": [
                "Doubly linked lists enable bidirectional traversal and O(1) node deletion.",
                "Each DLL node incurs 2 pointers of memory overhead (16 bytes on 64-bit systems).",
                "Circular singly linked lists loop tail->next back to head.",
                "Circular doubly linked lists allow O(1) access to both head and tail from a single pointer.",
                "Always use do-while loops or stop checks (curr != head) to prevent infinite loops in circular lists."
            ],
            "commonMistakes": [
                {
                    "mistake": "Updating only one pointer during DLL node insertion (e.g. updating next but forgetting to update prev).",
                    "whyWrong": "Asymmetric pointer links corrupt backward traversal and cause segfaults during deletion.",
                    "correction": "Ensure both directions are stitched: newNode->next = head; head->prev = newNode;",
                    "explanation": "DLL consistency invariants require: if A->next == B, then B->prev == A."
                },
                {
                    "mistake": "Using while (curr != NULL) to traverse a circular linked list.",
                    "whyWrong": "In a circular list, next is NEVER NULL. The loop will run infinitely and hang the program.",
                    "correction": "Use do { curr = curr->next; } while (curr != head);",
                    "explanation": "Circular lists terminate when the cursor cycles back to the starting node."
                }
            ],
            "realWorldExample": {
                "scenario": "Browser History Tab (Back and Forward Navigation)",
                "code": """#include <stdio.h>

struct HistoryNode {
    char url[64];
    struct HistoryNode *prev;
    struct HistoryNode *next;
};

int main(void) {
    printf("DLL is the standard data structure for browser history undo/redo stacks.\\n");
    return 0;
}""",
                "explanation": "Web browsers use doubly linked lists to track session history: clicking Back moves along `prev`, clicking Forward moves along `next`."
            },
            "practice": {
                "prompt": "Create a circular singly linked list with 3 nodes (1, 2, 3) where node 3 points back to node 1. Print all 3 elements using a do-while loop.",
                "starterCode": """#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node *next;
};

int main(void) {
    // Build circular list 1 -> 2 -> 3 -> (back to 1) and print
    return 0;
}""",
                "solution": """#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node *next;
};

int main(void) {
    struct Node n1 = {1, NULL};
    struct Node n2 = {2, NULL};
    struct Node n3 = {3, NULL};

    n1.next = &n2;
    n2.next = &n3;
    n3.next = &n1; // Circular loop!

    struct Node *curr = &n1;
    printf("Circular List: ");
    do {
        printf("%d ", curr->data);
        curr = curr->next;
    } while (curr != &n1);
    printf("\\n");
    return 0;
}""",
                "hints": [
                    "Set n3.next = &n1 to close the loop",
                    "Traverse with do { ... curr = curr->next; } while (curr != &n1);"
                ]
            },
            "quiz": [
                {
                    "id": "q-c-adv-dll-1",
                    "question": "What is the primary advantage of a Doubly Linked List over a Singly Linked List?",
                    "options": [
                        "It requires half the memory",
                        "It allows bidirectional traversal and O(1) deletion of a node without scanning from head",
                        "It automatically sorts elements",
                        "It stores elements in contiguous CPU cache"
                    ],
                    "correctIndex": 1,
                    "explanation": "A DLL allows stepping backward via prev, making node deletion O(1) since the previous node is known directly."
                },
                {
                    "id": "q-c-adv-dll-2",
                    "question": "In a Circular Doubly Linked List (CDLL) with head pointer head, what does head->prev point to?",
                    "options": ["NULL", "head", "The tail (last) node of the list", "Undefined memory"],
                    "correctIndex": 2,
                    "explanation": "In a CDLL, head->prev wraps around directly to the tail node, providing O(1) tail access."
                },
                {
                    "id": "q-c-adv-dll-3",
                    "question": "What happens if a while (curr != NULL) loop is run on a circular linked list?",
                    "options": [
                        "The loop exits after 1 iteration",
                        "An infinite loop occurs because NULL is never reached",
                        "The compiler refuses to build",
                        "A segmentation fault occurs on the first node"
                    ],
                    "correctIndex": 1,
                    "explanation": "Circular lists have no NULL pointer; without a break or cycle test, the loop will spin indefinitely."
                },
                {
                    "id": "q-c-adv-dll-4",
                    "question": "Which real-world operating system task is best implemented using a Circular Linked List?",
                    "options": [
                        "Binary search trees",
                        "Round-Robin CPU process scheduling",
                        "Static global variable initialization",
                        "Compiler lexical tokenization"
                    ],
                    "correctIndex": 1,
                    "explanation": "Round-Robin scheduling gives each active process equal time slices in a continuous cycle, ideally modeled by a circular list."
                }
            ],
            "codingChallenge": {
                "title": "Round-Robin Task Scheduler Simulation",
                "difficulty": "Medium",
                "problem_statement": "Define a Circular Singly Linked List node `Task` with:\n- `taskId` (int)\n- `burstTime` (int)\n- `struct Task *next`\n\nIn `main()`:\n1. Construct a circular list of 3 tasks: (Task 1: burst=10), (Task 2: burst=20), (Task 3: burst=15), looping back to Task 1.\n2. Simulate 2 complete round-robin cycles where each task executes a quantum of 5 units (subtract 5 from burstTime on each visit).\n3. Print the remaining burst times after 2 full rounds:\n`T1: 0 | T2: 10 | T3: 5`",
                "input_format": "None.",
                "output_format": "T1: 0 | T2: 10 | T3: 5",
                "constraints": "Must use circular pointer loop and update burst times.",
                "starter_code": """#include <stdio.h>
#include <stdlib.h>

// Define struct Task and implement simulation

int main(void) {
    return 0;
}""",
                "expected_output": "T1: 0 | T2: 10 | T3: 5",
                "test_cases": [
                    {
                        "input": "",
                        "expected_output": "T1: 0 | T2: 10 | T3: 5",
                        "is_hidden": false
                    }
                ]
            },
            "summary": [
                "Doubly linked lists provide bidirectional navigation via next and prev pointers.",
                "DLLs achieve O(1) deletion when given a pointer directly to the target node.",
                "Circular singly linked lists eliminate NULL by linking the tail node back to the head.",
                "Circular doubly linked lists provide O(1) access to both head and tail nodes.",
                "Round-robin schedulers and browser history navigation are classic applications of circular and doubly linked lists."
            ],
            "content_standard": "Comprehensive analysis of doubly linked lists, circular list topologies, boundary stitching, and scheduling simulations in C.",
            "content_detailed": "Sentinel/dummy head node architectures, XOR linked list memory compression, and cache behavior of bidirectional pointers.",
            "content_simplified": "A doubly linked list gives you two hands: your right hand holds the next friend, and your left hand holds the friend behind you."
        },
        {
            "id": "top-c-stacks-queues",
            "number": 11,
            "numberDisplay": "11",
            "moduleId": "mod-c-adv-data-structures",
            "moduleTitle": "Module 3: Core Data Structures",
            "title": "Stacks and Queues",
            "slug": "stacks-and-queues",
            "language": "c",
            "difficulty": "Advanced",
            "estimatedMinutes": 55,
            "prerequisiteId": "top-c-doubly-circular-list",
            "shortDescription": "Master Stacks (LIFO) and Queues (FIFO) in C: array-based stacks, linked list stacks, push/pop/peek operations, circular queues with modulo arithmetic, and expression parsing.",
            "learningObjectives": [
                "Implement a Stack using the Last-In First-Out (LIFO) principle.",
                "Build array-based and linked-list-based Stack implementations in C.",
                "Detect and prevent Stack Overflow and Stack Underflow boundary conditions.",
                "Implement a Queue using the First-In First-Out (FIFO) principle.",
                "Solve the linear queue element drift problem using Circular Queues and modulo arithmetic.",
                "Apply stacks to expression validation and balanced parentheses verification."
            ],
            "conceptExplanation": """### 1. The Stack Abstract Data Type (LIFO)
A **Stack** is a linear data structure that adheres to the **Last-In, First-Out (LIFO)** principle: the element added most recently is the first element removed.
Operations:
- `push(x)`: Inserts element `x` onto the top of the stack ($O(1)$).
- `pop()`: Removes and returns the top element ($O(1)$).
- `peek()` or `top()`: Inspects the top element without removing it ($O(1)$).
- `isEmpty()`: Returns true if stack contains 0 items ($O(1)$).

Boundary Errors:
- **Stack Overflow**: Attempting to `push` onto a fixed stack that is already full.
- **Stack Underflow**: Attempting to `pop` or `peek` from an empty stack.

### 2. Array-Based vs Linked-List-Based Stack
- **Array Stack**: Fast, uses an integer index `top = -1`. Limited by fixed capacity unless resized dynamically.
- **Linked-List Stack**: Dynamic capacity; `push` is `insertHead()`, `pop` is `removeHead()`. Both are strictly $O(1)$.

### 3. The Queue Abstract Data Type (FIFO)
A **Queue** is a linear data structure that adheres to the **First-In, First-Out (FIFO)** principle: the first element added is the first element removed.
Operations:
- `enqueue(x)`: Inserts element `x` at the rear/tail ($O(1)$).
- `dequeue()`: Removes and returns element from the front/head ($O(1)$).
- `front()`: Inspects the front element without removing ($O(1)$).

### 4. Circular Queues & Modulo Arithmetic
In a simple linear array queue, `dequeue()` advances `front`. After several enqueues and dequeues, `rear` reaches the end of the array even if spaces have opened up at the front! This is called **false overflow** or queue drift.

A **Circular Queue** solves this by wrapping indices around to the beginning using modulo arithmetic (`% CAPACITY`):
- Advance rear: `rear = (rear + 1) % CAPACITY;`
- Advance front: `front = (front + 1) % CAPACITY;`
- Full condition: `(rear + 1) % CAPACITY == front;`
- Empty condition: `front == -1;`

### 5. Applications of Stacks and Queues
- **Stack**: Function call stack (call frames & recursion), undo/redo history, syntax parsing, balanced bracket validation, expression evaluation (infix to postfix).
- **Queue**: CPU process scheduling (FIFO queues), printer spooling, packet buffering in network routers, Breadth-First Search (BFS) graph traversals.""",
            "visualDiagram": """STACK (LIFO) vs QUEUE (FIFO):

  STACK (Canister):
        |  Push  |  Pop  |
        v        ^       |
      +------------+     |
  Top | Element 3  | <---+ (Only Top is accessible)
      +------------+
      | Element 2  |
      +------------+
      | Element 1  |
      +------------+

  QUEUE (Pipeline):
                 +------------+------------+------------+
  Enqueue (Rear) | Element 3  | Element 2  | Element 1  | Dequeue (Front)
  -------------> +------------+------------+------------+ ------------->
                    (Rear)                     (Front)""",
            "syntax": """// Array Stack
#define STACK_CAP 100
typedef struct {
    int items[STACK_CAP];
    int top;
} Stack;

// Circular Queue
#define QUEUE_CAP 5
typedef struct {
    int items[QUEUE_CAP];
    int front;
    int rear;
} CircularQueue;""",
            "simpleExample": {
                "code": """#include <stdio.h>

#define MAX 5

struct Stack {
    int arr[MAX];
    int top;
};

void push(struct Stack *s, int val) {
    if (s->top == MAX - 1) return; // Overflow
    s->arr[++(s->top)] = val;
}

int pop(struct Stack *s) {
    if (s->top == -1) return -1; // Underflow
    return s->arr[(s->top)--];
}

int main(void) {
    struct Stack s = {.top = -1};
    push(&s, 10);
    push(&s, 20);
    push(&s, 30);

    printf("Popped: %d\\n", pop(&s));
    printf("Popped: %d\\n", pop(&s));
    return 0;
}""",
                "explanation": "Pushes 10, 20, 30 onto stack. Pops 30 (LIFO), then pops 20."
            },
            "codeExample": """#include <stdio.h>
#include <stdbool.h>

#define QUEUE_SIZE 4

typedef struct {
    int data[QUEUE_SIZE];
    int front;
    int rear;
    int count;
} CircularQueue;

void initQueue(CircularQueue *q) {
    q->front = 0;
    q->rear = -1;
    q->count = 0;
}

bool enqueue(CircularQueue *q, int value) {
    if (q->count == QUEUE_SIZE) {
        printf("Queue Full! Cannot enqueue %d\\n", value);
        return false;
    }
    q->rear = (q->rear + 1) % QUEUE_SIZE;
    q->data[q->rear] = value;
    q->count++;
    return true;
}

int dequeue(CircularQueue *q) {
    if (q->count == 0) {
        printf("Queue Empty!\\n");
        return -1;
    }
    int val = q->data[q->front];
    q->front = (q->front + 1) % QUEUE_SIZE;
    q->count--;
    return val;
}

int main(void) {
    CircularQueue q;
    initQueue(&q);

    enqueue(&q, 10);
    enqueue(&q, 20);
    enqueue(&q, 30);
    enqueue(&q, 40);

    printf("Dequeued: %d\\n", dequeue(&q)); // Removes 10, opens slot 0
    printf("Dequeued: %d\\n", dequeue(&q)); // Removes 20, opens slot 1

    // Wrap around: enqueue into previously freed slots
    enqueue(&q, 50);
    enqueue(&q, 60);

    printf("Final Queue drain: ");
    while (q.count > 0) {
        printf("%d ", dequeue(&q));
    }
    printf("\\n");
    return 0;
}""",
            "expectedOutput": """Dequeued: 10
Dequeued: 20
Final Queue drain: 30 40 50 60 """,
            "stepByStep": [
                "Line 6-11: Declare `CircularQueue` with array `data`, `front`, `rear`, and element tracker `count`.",
                "Line 18-27: `enqueue` checks `count == QUEUE_SIZE` to prevent overflow, uses modulo `(rear + 1) % QUEUE_SIZE` to advance circularly.",
                "Line 29-38: `dequeue` retrieves item at `front`, advances `front = (front + 1) % QUEUE_SIZE`, and decrements `count`.",
                "Line 43-47: Enqueue 10, 20, 30, 40 (filling queue).",
                "Line 49-50: Dequeue 10 and 20, demonstrating FIFO removal.",
                "Line 53-54: Enqueue 50 and 60, wrapping around to slots 0 and 1 without reallocation."
            ],
            "dryRun": "Enqueue 10,20,30,40. Dequeue 10,20. Queue holds 30,40. Enqueue 50,60 wraps around. Drain prints 30, 40, 50, 60.",
            "keyTakeaways": [
                "Stacks enforce Last-In First-Out (LIFO); Queues enforce First-In First-Out (FIFO).",
                "All primary stack and queue operations execute in O(1) constant time.",
                "Circular queues solve the linear drift problem using modulo index arithmetic.",
                "Stack applications include syntax bracket matching and recursive call frames.",
                "Queue applications include BFS traversals, asynchronous event buffers, and task spooling."
            ],
            "commonMistakes": [
                {
                    "mistake": "Failing to check for underflow before popping from a stack or dequeuing from a queue.",
                    "whyWrong": "Popping an empty stack reads invalid memory at index -1, corrupting memory.",
                    "correction": "Always check if (isEmpty(s)) before decrementing top or accessing elements.",
                    "explanation": "Negative indexing in C accesses out-of-bounds stack frame memory."
                },
                {
                    "mistake": "In circular queues, calculating index as (rear + 1) / CAPACITY instead of (rear + 1) % CAPACITY.",
                    "whyWrong": "Division (/) produces the quotient (0 or 1) rather than the remainder (0..CAPACITY-1).",
                    "correction": "Always use the modulo operator (%) for circular wrapping.",
                    "explanation": "Modulo calculates remainder, restricting values to the range [0, CAPACITY-1]."
                }
            ],
            "realWorldExample": {
                "scenario": "Network Socket Ring Buffer Driver",
                "code": """#include <stdio.h>

#define RING_BUF_SIZE 1024

struct RingBuffer {
    char buffer[RING_BUF_SIZE];
    int head;
    int tail;
};

int main(void) {
    printf("Network NIC drivers use circular ring buffers for high-speed packet ingestion.\\n");
    return 0;
}""",
                "explanation": "Network Interface Cards (NICs) use hardware DMA circular ring buffers to continuously stream incoming Ethernet packets into OS kernel memory."
            },
            "practice": {
                "prompt": "Write a function `bool isBalanced(const char *expr)` using an array-based char stack to check if parentheses `()` in a string are balanced.",
                "starterCode": """#include <stdio.h>
#include <stdbool.h>

bool isBalanced(const char *expr) {
    // Implement parentheses check
    return true;
}

int main(void) {
    printf("Balanced: %d\\n", isBalanced("(())"));
    printf("Balanced: %d\\n", isBalanced("(()"));
    return 0;
}""",
                "solution": """#include <stdio.h>
#include <stdbool.h>

bool isBalanced(const char *expr) {
    char stack[100];
    int top = -1;

    for (int i = 0; expr[i] != '\\0'; i++) {
        if (expr[i] == '(') {
            stack[++top] = '(';
        } else if (expr[i] == ')') {
            if (top == -1) return false;
            top--;
        }
    }
    return top == -1;
}

int main(void) {
    printf("Balanced: %d\\n", isBalanced("(())")); // 1
    printf("Balanced: %d\\n", isBalanced("(()"));  // 0
    return 0;
}""",
                "hints": [
                    "Push '(' onto stack",
                    "On ')', check top == -1; if not, top--",
                    "Return top == -1 at the end"
                ]
            },
            "quiz": [
                {
                    "id": "q-c-adv-stk-1",
                    "question": "What is the time complexity of the push and pop operations on a properly implemented stack?",
                    "options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
                    "correctIndex": 0,
                    "explanation": "Push and pop operate solely on the top element, executing in O(1) constant time."
                },
                {
                    "id": "q-c-adv-stk-2",
                    "question": "What problem does a Circular Queue solve that occurs in a simple linear array queue?",
                    "options": [
                        "It prevents integers from overflowing",
                        "It solves false overflow (element drift) by reusing slots vacated at the front",
                        "It makes enqueue O(log n)",
                        "It automatically expands without dynamic memory"
                    ],
                    "correctIndex": 1,
                    "explanation": "Linear queues drift to the right, wasting front space; circular queues wrap indices around to reuse freed slots."
                },
                {
                    "id": "q-c-adv-stk-3",
                    "question": "In a 0-indexed circular queue of size 8, if rear is currently at index 7, where will the next enqueue place the element?",
                    "options": ["Index 8", "Index 0", "Index 7", "Index 1"],
                    "correctIndex": 1,
                    "explanation": "(7 + 1) % 8 = 8 % 8 = 0. The cursor wraps around to index 0."
                },
                {
                    "id": "q-c-adv-stk-4",
                    "question": "Which data structure is fundamentally used by language compilers to manage recursive function calls?",
                    "options": ["FIFO Queue", "Call Stack", "Binary Tree", "Circular Linked List"],
                    "correctIndex": 1,
                    "explanation": "The call stack tracks active stack frames, pushing frames upon invocation and popping them upon return."
                }
            ],
            "codingChallenge": {
                "title": "Balanced Parentheses and Expression Validator",
                "difficulty": "Easy",
                "problem_statement": "Implement an array-based stack in C to validate if parentheses in an expression string are strictly balanced.\nWrite a function `int validateBrackets(const char *str)` returning `1` if balanced and `0` if unbalanced.\nIn `main()`:\nTest the following three expressions:\n1. `\"((a+b)*(c-d))\"` -> Valid\n2. `\"((a+b)\"` -> Invalid\n3. `\"(a+b)*(c)\"` -> Valid\n\nPrint the output in exact format:\n`Expr 1: Valid | Expr 2: Invalid | Expr 3: Valid`",
                "input_format": "None.",
                "output_format": "Expr 1: Valid | Expr 2: Invalid | Expr 3: Valid",
                "constraints": "Must use stack push/pop logic.",
                "starter_code": """#include <stdio.h>

// Implement validateBrackets

int main(void) {
    // Implement validation tests
    return 0;
}""",
                "expected_output": "Expr 1: Valid | Expr 2: Invalid | Expr 3: Valid",
                "test_cases": [
                    {
                        "input": "",
                        "expected_output": "Expr 1: Valid | Expr 2: Invalid | Expr 3: Valid",
                        "is_hidden": false
                    }
                ]
            },
            "summary": [
                "Stacks follow LIFO; Queues follow FIFO.",
                "Both structures offer O(1) insertion and removal guarantees.",
                "Circular queues eliminate array slot wastage using modulo arithmetic.",
                "Underflow and overflow guards protect memory integrity.",
                "Expression parsing and recursive execution rely directly on stacks."
            ],
            "content_standard": "Comprehensive analysis of LIFO stacks, FIFO queues, circular buffer mechanics, and expression validation in C.",
            "content_detailed": "Double-ended queues (deque), lock-free ring buffers in concurrent systems, and cacheline alignment of queue heads and tails.",
            "content_simplified": "A stack is like a stack of plates (you take from the top); a queue is like a line at the movies (first person in line gets served first)."
        },
        {
            "id": "top-c-trees-bst",
            "number": 12,
            "numberDisplay": "12",
            "moduleId": "mod-c-adv-data-structures",
            "moduleTitle": "Module 3: Core Data Structures",
            "title": "Trees and Binary Search Trees",
            "slug": "trees-and-binary-search-trees",
            "language": "c",
            "difficulty": "Advanced",
            "estimatedMinutes": 60,
            "prerequisiteId": "top-c-stacks-queues",
            "shortDescription": "Master hierarchical trees, Binary Search Tree (BST) ordering properties, dynamic node creation, recursive insertion, search, tree traversals (inorder, preorder, postorder), and deletion.",
            "learningObjectives": [
                "Define hierarchical tree concepts: root, parent, child, leaf, depth, and height.",
                "Understand Binary Search Tree (BST) ordering invariants: left < root < right.",
                "Dynamically allocate tree nodes using self-referential left and right child pointers.",
                "Implement recursive BST insertion and search algorithms in O(log n) average time.",
                "Execute the three fundamental depth-first traversals: Inorder, Preorder, and Postorder.",
                "Prove why Inorder traversal on a BST produces elements in strictly ascending sorted order.",
                "Implement BST node deletion handling all 3 cases (leaf node, single child, two children via in-order successor)."
            ],
            "conceptExplanation": """### 1. Introduction to Tree Data Structures
Linear structures (arrays, linked lists) have a single sequential path. A **tree** is a non-linear, hierarchical data structure composed of nodes connected by directed edges.
- **Root**: The topmost node without any parent.
- **Parent / Child**: A node is parent to the nodes directly below it.
- **Leaf Node**: A node with 0 children.
- **Height**: The number of edges on the longest path from the root down to a leaf.

### 2. Binary Search Tree (BST) Invariant
A **Binary Tree** restricts every node to at most two children (`left` and `right`).
A **Binary Search Tree (BST)** adds the fundamental **ordering invariant**:
For every node `N`:
1. All values in the **left subtree** must be strictly **less than** `N->data`.
2. All values in the **right subtree** must be strictly **greater than** `N->data`.
3. Both left and right subtrees must themselves be valid binary search trees.

```c
struct TreeNode {
    int data;
    struct TreeNode *left;
    struct TreeNode *right;
};
```

### 3. Insertion and Search ($O(\\log n)$ Average)
Searching a BST is equivalent to binary search:
- If `key == root->data`: Found!
- If `key < root->data`: Search recursively in `root->left`.
- If `key > root->data`: Search recursively in `root->right`.

```c
struct TreeNode* insert(struct TreeNode *root, int val) {
    if (root == NULL) {
        struct TreeNode *n = (struct TreeNode *)malloc(sizeof(struct TreeNode));
        n->data = val;
        n->left = n->right = NULL;
        return n;
    }
    if (val < root->data) root->left = insert(root->left, val);
    else if (val > root->data) root->right = insert(root->right, val);
    return root;
}
```

### 4. Tree Traversal Algorithms
Depth-first traversals visit every node systematically:
1. **Inorder Traversal (Left, Root, Right)**:
   - Evaluates left subtree, visits root, evaluates right subtree.
   - **Crucial Fact**: Inorder traversal of a BST visits keys in **strictly ascending sorted order**!
2. **Preorder Traversal (Root, Left, Right)**:
   - Visits root first, then left, then right. Used to serialize or clone trees.
3. **Postorder Traversal (Left, Right, Root)**:
   - Evaluates children before parent. Used to delete/free trees from leaves up to root!

### 5. Deletion in a Binary Search Tree
Deleting a node `X` involves three distinct topological scenarios:
1. **Case 1: Node is a Leaf (0 children)**:
   - Simply free node and set parent's pointer to `NULL`.
2. **Case 2: Node has 1 child**:
   - Bypass node: connect parent directly to `X`'s only child, then free `X`.
3. **Case 3: Node has 2 children**:
   - Find the **In-order Successor** (the smallest value in the right subtree: `minNode(X->right)`).
   - Copy the successor's data into `X`.
   - Recursively delete the successor node from the right subtree (which is now Case 1 or Case 2)!""",
            "visualDiagram": """BINARY SEARCH TREE (BST) HIERARCHY:

                 [ 50 ]  <--- Root
                /      \\
            [ 30 ]    [ 70 ]
           /     \\    /    \\
        [ 20 ] [ 40 ][ 60 ] [ 80 ]  <--- Leaves

  Invariant Check:
  Left subtree of 50: {20, 30, 40} < 50  (Valid!)
  Right subtree of 50: {60, 70, 80} > 50 (Valid!)

INORDER TRAVERSAL (Left -> Root -> Right):
  Traversing left: 20 -> 30 -> 40
  Root: 50
  Traversing right: 60 -> 70 -> 80
  Result: 20, 30, 40, 50, 60, 70, 80 (Sorted order!)""",
            "syntax": """// Node definition
typedef struct TreeNode {
    int data;
    struct TreeNode *left;
    struct TreeNode *right;
} TreeNode;

// Prototypes
TreeNode* insertBST(TreeNode *root, int val);
bool      searchBST(TreeNode *root, int key);
void      inorder(TreeNode *root);
TreeNode* deleteBST(TreeNode *root, int key);
void      freeTree(TreeNode *root);""",
            "simpleExample": {
                "code": """#include <stdio.h>
#include <stdlib.h>

struct TreeNode {
    int data;
    struct TreeNode *left;
    struct TreeNode *right;
};

void inorder(struct TreeNode *root) {
    if (root == NULL) return;
    inorder(root->left);
    printf("%d ", root->data);
    inorder(root->right);
}

int main(void) {
    struct TreeNode n2 = {20, NULL, NULL};
    struct TreeNode n3 = {70, NULL, NULL};
    struct TreeNode root = {50, &n2, &n3};

    printf("Inorder Traversal: ");
    inorder(&root);
    printf("\\n");
    return 0;
}""",
                "explanation": "Manually builds a small 3-node BST and traverses it Inorder (Left, Root, Right), printing elements sorted: 20 50 70."
            },
            "codeExample": """#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

struct TreeNode {
    int data;
    struct TreeNode *left;
    struct TreeNode *right;
};

struct TreeNode* insert(struct TreeNode *root, int val) {
    if (root == NULL) {
        struct TreeNode *n = (struct TreeNode *)malloc(sizeof(struct TreeNode));
        n->data = val;
        n->left = n->right = NULL;
        return n;
    }
    if (val < root->data) {
        root->left = insert(root->left, val);
    } else if (val > root->data) {
        root->right = insert(root->right, val);
    }
    return root;
}

bool search(struct TreeNode *root, int key) {
    if (root == NULL) return false;
    if (root->data == key) return true;
    if (key < root->data) return search(root->left, key);
    return search(root->right, key);
}

void inorder(struct TreeNode *root) {
    if (root == NULL) return;
    inorder(root->left);
    printf("%d ", root->data);
    inorder(root->right);
}

void freeTree(struct TreeNode *root) {
    if (root == NULL) return;
    freeTree(root->left);   // Postorder cleanup
    freeTree(root->right);
    free(root);
}

int main(void) {
    struct TreeNode *root = NULL;
    int keys[] = {50, 30, 70, 20, 40, 60, 80};
    for (int i = 0; i < 7; i++) {
        root = insert(root, keys[i]);
    }

    printf("BST Inorder (Sorted): ");
    inorder(root);
    printf("\\n");

    printf("Search for 40: %s\\n", search(root, 40) ? "FOUND" : "NOT FOUND");
    printf("Search for 99: %s\\n", search(root, 99) ? "FOUND" : "NOT FOUND");

    freeTree(root);
    printf("BST memory successfully freed.\\n");
    return 0;
}""",
            "expectedOutput": """BST Inorder (Sorted): 20 30 40 50 60 70 80 
Search for 40: FOUND
Search for 99: NOT FOUND
BST memory successfully freed.""",
            "stepByStep": [
                "Line 5-9: Define `struct TreeNode` containing payload and left/right child pointers.",
                "Line 11-24: `insert` recursively finds the correct insertion leaf to preserve the BST invariant.",
                "Line 26-31: `search` leverages BST property, eliminating half the remaining tree each step in O(log n) time.",
                "Line 33-38: `inorder` recursively visits Left, Root, Right, producing strictly ascending output.",
                "Line 40-45: `freeTree` uses Postorder traversal (children freed before parent) to safely clean heap memory.",
                "Line 48-60: Insert 7 keys, execute inorder walk, test searches for 40 and 99, and free."
            ],
            "dryRun": "Insert 50, then 30 (left), 70 (right), 20, 40, 60, 80. Inorder produces 20 30 40 50 60 70 80. Search 40 traces 50->30->40 (found). Search 99 traces 50->70->80->NULL (not found).",
            "keyTakeaways": [
                "A Binary Search Tree enforces left < root < right for all nodes.",
                "Average search, insertion, and deletion complexity is O(log n).",
                "Inorder traversal on a BST yields keys in strictly ascending sorted order.",
                "Postorder traversal is required for safe memory deallocation (bottom-up free).",
                "Deleting a node with two children requires replacing it with its in-order successor."
            ],
            "commonMistakes": [
                {
                    "mistake": "Freeing a parent tree node before freeing its children: free(root); free(root->left);",
                    "whyWrong": "Once free(root) executes, root->left is an illegal use-after-free pointer dereference.",
                    "correction": "Always use Postorder traversal to free trees: free(root->left); free(root->right); free(root);",
                    "explanation": "Tree deallocation must proceed bottom-up from leaf nodes up to the root."
                },
                {
                    "mistake": "Assuming BST search is always O(log n) in the worst case.",
                    "whyWrong": "Inserting sorted numbers (1, 2, 3, 4, 5) degenerates the BST into a linked list with O(n) height.",
                    "correction": "Use balanced trees (AVL or Red-Black trees) for guaranteed O(log n) worst-case performance.",
                    "explanation": "Unbalanced BSTs degenerate into linear linked lists."
                }
            ],
            "realWorldExample": {
                "scenario": "Database Index B-Tree Foundation",
                "code": """#include <stdio.h>

struct IndexNode {
    int primaryKey;
    long fileOffset;
    struct IndexNode *left;
    struct IndexNode *right;
};

int main(void) {
    printf("Relational databases use tree invariants to locate table records in logarithmic time.\\n");
    return 0;
}""",
                "explanation": "File system directory trees (ext4, NTFS) and database primary key indexes use balanced tree variants derived directly from BST properties."
            },
            "practice": {
                "prompt": "Write a recursive function `int countLeaves(struct TreeNode *root)` that counts how many leaf nodes (nodes with left == NULL and right == NULL) exist in a binary tree.",
                "starterCode": """#include <stdio.h>
#include <stdlib.h>

struct TreeNode {
    int data;
    struct TreeNode *left;
    struct TreeNode *right;
};

int countLeaves(struct TreeNode *root) {
    // Return count of leaf nodes
    return 0;
}

int main(void) {
    // Test countLeaves
    return 0;
}""",
                "solution": """#include <stdio.h>
#include <stdlib.h>

struct TreeNode {
    int data;
    struct TreeNode *left;
    struct TreeNode *right;
};

int countLeaves(struct TreeNode *root) {
    if (root == NULL) return 0;
    if (root->left == NULL && root->right == NULL) return 1;
    return countLeaves(root->left) + countLeaves(root->right);
}

int main(void) {
    struct TreeNode leaf1 = {10, NULL, NULL};
    struct TreeNode leaf2 = {30, NULL, NULL};
    struct TreeNode root = {20, &leaf1, &leaf2};

    printf("Leaf count: %d\\n", countLeaves(&root)); // 2
    return 0;
}""",
                "hints": [
                    "Base case 1: if root == NULL return 0",
                    "Base case 2: if root->left == NULL && root->right == NULL return 1",
                    "Recursive case: return countLeaves(root->left) + countLeaves(root->right)"
                ]
            },
            "quiz": [
                {
                    "id": "q-c-adv-bst-1",
                    "question": "Which tree traversal order on a Binary Search Tree produces values in strictly ascending sorted order?",
                    "options": ["Preorder", "Inorder", "Postorder", "Level-order"],
                    "correctIndex": 1,
                    "explanation": "Inorder traversal visits Left subtree, then Root, then Right subtree, strictly following the BST ordering invariant."
                },
                {
                    "id": "q-c-adv-bst-2",
                    "question": "What is the average time complexity of searching for a value in a balanced BST containing n nodes?",
                    "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
                    "correctIndex": 1,
                    "explanation": "Each comparison cuts the search space in half, yielding O(log n) logarithmic search time."
                },
                {
                    "id": "q-c-adv-bst-3",
                    "question": "When deleting a node with two children in a BST, what node is typically used to replace it?",
                    "options": [
                        "The root node",
                        "The In-order Successor (smallest node in right subtree) or In-order Predecessor",
                        "Any random leaf node",
                        "The deepest left child"
                    ],
                    "correctIndex": 1,
                    "explanation": "Replacing with the in-order successor preserves the BST invariant because it is larger than all left nodes and smaller than all remaining right nodes."
                },
                {
                    "id": "q-c-adv-bst-4",
                    "question": "Which traversal order must be used to safely delete and free all nodes of a dynamic binary tree?",
                    "options": ["Preorder", "Inorder", "Postorder", "Random order"],
                    "correctIndex": 2,
                    "explanation": "Postorder frees both children before freeing the parent node, completely avoiding use-after-free errors."
                }
            ],
            "codingChallenge": {
                "title": "Binary Search Tree Insertion, Search, and Height",
                "difficulty": "Medium",
                "problem_statement": "Define `struct TreeNode` with `int data`, `left`, and `right` pointers.\nImplement:\n- `struct TreeNode* insert(struct TreeNode *root, int val)`\n- `int getHeight(struct TreeNode *root)`: returns tree height (height of single-node tree is 1; empty tree is 0).\n- `int searchCount(struct TreeNode *root, int key)`: returns 1 if key exists, 0 otherwise.\n\nIn `main()`:\n1. Insert keys: 40, 20, 60, 10, 30, 50, 70.\n2. Compute `height = getHeight(root)`.\n3. Check `found = searchCount(root, 30)`.\n4. Print exact line:\n`BST Height: 3 | Found 30: 1`\n5. Free tree.",
                "input_format": "None.",
                "output_format": "BST Height: 3 | Found 30: 1",
                "constraints": "Must use recursive BST logic and free all nodes.",
                "starter_code": """#include <stdio.h>
#include <stdlib.h>

// Define struct TreeNode and functions

int main(void) {
    // Implement verification
    return 0;
}""",
                "expected_output": "BST Height: 3 | Found 30: 1",
                "test_cases": [
                    {
                        "input": "",
                        "expected_output": "BST Height: 3 | Found 30: 1",
                        "is_hidden": false
                    }
                ]
            },
            "summary": [
                "Binary Search Trees enforce left < root < right ordering for efficient logarithmic search.",
                "Inorder traversal visits BST keys in sorted ascending order.",
                "Postorder traversal must be used to free tree memory bottom-up.",
                "Deleting a node with two children utilizes its in-order successor.",
                "Unbalanced BSTs risk degrading to O(n) linear linked lists if inserted in pre-sorted order."
            ],
            "content_standard": "Comprehensive study of binary trees, BST invariants, recursive search, insertion, traversal orders, and deletion in C.",
            "content_detailed": "Tree balancing principles, recursive call stack consumption, AVL rotations, and B-tree disk indexing foundations.",
            "content_simplified": "A binary search tree is like a guessing game: every step asks 'is it higher or lower?' and immediately eliminates half the remaining numbers."
        }
    ]
