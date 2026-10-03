import { CTopic } from './cFundamentalsData';

export const C_MODULE_4_TOPICS: CTopic[] = [
  // =========================================================================
  // TOPIC 13: Structures, Unions & Enumerations
  // =========================================================================
  {
    id: 'top-c-structures',
    number: 13,
    numberDisplay: '13',
    moduleId: 'mod-c-systems',
    moduleTitle: 'Module 04: Advanced Systems & Capstone Project',
    title: 'Structures, Unions & Enumerations',
    slug: 'structures-unions-and-enumerations',
    language: 'c',
    shortDescription: 'Construct complex user-defined composite data models in C. Master struct declaration, dot (.) vs arrow (->) member access, typedef aliases, memory alignment padding, unions, and enums.',
    difficulty: 'Intermediate',
    estimatedMinutes: 35,
    prerequisiteId: 'top-c-dynamic-memory',
    learningObjectives: [
      'Define, instantiate, and initialize composite data structures using struct',
      'Access structure members using the dot (.) operator for values and arrow (->) for pointers',
      'Simplify complex type syntax using typedef and define named constants with enum',
      'Contrast the independent memory layout of structures with the shared memory overlay of unions'
    ],
    conceptExplanation: `### User-Defined Composite Types
While arrays store homogeneous elements of the same type, a **structure (\`struct\`)** bundles heterogeneous data elements under a single cohesive entity.

### Defining and Accessing Structures
\`\`\`c
struct Student {
    int id;
    char name[32];
    double gpa;
};

struct Student s1 = {101, "Alice", 3.92};
printf("Name: %s, GPA: %.2f\\n", s1.name, s1.gpa); // Dot (.) operator
\`\`\`

### The \`typedef\` Specifier
\`typedef\` creates convenient type aliases, eliminating the need to write the \`struct\` keyword repeatedly:
\`\`\`c
typedef struct {
    int x;
    int y;
} Point;

Point p1 = {10, 20}; // Clean syntax!
\`\`\`

### Pointers to Structures & The Arrow (\`->\`) Operator
When passing structures to functions, passing by pointer avoids copying the entire structure. The arrow operator (\`->\`) is syntactic sugar for dereferencing and accessing a member:
\`\`\`c
void print_student(const struct Student *s) {
    // (*s).gpa is identical to s->gpa
    printf("ID: %d, GPA: %.2f\\n", s->id, s->gpa);
}
\`\`\`

### Structures vs. Unions
- **\`struct\`**: Each member has its own dedicated memory slot. Total size >= sum of member sizes (plus alignment padding).
- **\`union\`**: All members **share the same memory location**. Total size = size of the largest member. Writing to one member overwrites other members:
\`\`\`c
union DataPacket {
    int integer_val;    // 4 bytes
    float float_val;    // 4 bytes
    char raw_bytes[4];  // 4 bytes
}; // Total size is exactly 4 bytes!
\`\`\`

### Enumerations (\`enum\`)
Enums define a set of named integer constants, dramatically improving code readability:
\`\`\`c
typedef enum {
    LOG_DEBUG = 0,
    LOG_INFO,
    LOG_WARN,
    LOG_ERROR
} LogLevel;
\`\`\``,
    simpleExample: {
      code: `#include <stdio.h>

typedef struct {
    int id;
    double gpa;
} Student;

int main(void) {
    Student s = {101, 3.85};
    Student *ptr = &s;
    printf("Direct: %d | Via Pointer: %.2f\\n", s.id, ptr->gpa);
    return 0;
}`,
      explanation: 'Defines a Student struct, initializes it, and demonstrates member access via dot (.) and arrow (->).'
    },
    syntax: `// Struct with typedef
typedef struct {
    int id;
    char name[30];
    float salary;
} Employee;

// Union definition
union Variant {
    int i;
    float f;
    char c;
};

// Enum definition
enum Status { PENDING, ACTIVE, SUSPENDED };`,
    codeExample: `#include <stdio.h>
#include <string.h>

typedef enum {
    ROLE_STUDENT,
    ROLE_TEACHING_ASSISTANT,
    ROLE_PROFESSOR
} UniversityRole;

typedef struct {
    int id;
    char name[32];
    double gpa;
    UniversityRole role;
} AcademicMember;

void display_member(const AcademicMember *m) {
    const char *role_str = "Unknown";
    switch (m->role) {
        case ROLE_STUDENT: role_str = "Undergraduate Student"; break;
        case ROLE_TEACHING_ASSISTANT: role_str = "Teaching Assistant"; break;
        case ROLE_PROFESSOR: role_str = "Tenured Professor"; break;
    }
    printf("ID: %d | Name: %-15s | GPA: %.2f | Role: %s\\n",
           m->id, m->name, m->gpa, role_str);
}

int main(void) {
    AcademicMember dept[2];
    
    dept[0].id = 401;
    strcpy(dept[0].name, "Elena Rostova");
    dept[0].gpa = 3.95;
    dept[0].role = ROLE_STUDENT;
    
    dept[1].id = 102;
    strcpy(dept[1].name, "Dr. Alan Turing");
    dept[1].gpa = 4.00;
    dept[1].role = ROLE_PROFESSOR;
    
    printf("--- Academic Department Records ---\\n");
    for (int i = 0; i < 2; i++) {
        display_member(&dept[i]);
    }
    
    printf("\\n--- Memory Footprint Comparison ---\\n");
    printf("sizeof(AcademicMember struct): %zu bytes\\n", sizeof(AcademicMember));
    
    return 0;
}`,
    expectedOutput: `--- Academic Department Records ---
ID: 401 | Name: Elena Rostova   | GPA: 3.95 | Role: Undergraduate Student
ID: 102 | Name: Dr. Alan Turing | GPA: 4.00 | Role: Tenured Professor

--- Memory Footprint Comparison ---
sizeof(AcademicMember struct): 48 bytes`,
    stepByStep: [
      '1. typedef struct creates a new compound type AcademicMember combining integer, char array, double, and enum.',
      '2. Memory is organized sequentially with compiler alignment padding between members.',
      '3. Array of structures dept[2] allocates contiguous blocks for each record.',
      '4. display_member(&dept[i]) passes a const pointer to avoid copying the 48-byte record.',
      '5. m->role dereferences the pointer and accesses the member via hardware offset.'
    ],
    commonMistakes: [
      {
        mistake: 'Using dot (.) on a structure pointer instead of arrow (->)',
        codeSnippet: `Student *s = &alice;
printf("%d\\n", s.id); // Error: request for member in something not a structure`,
        correction: 'Use the arrow operator: s->id or (*s).id with parentheses.',
        explanation: 'The dot operator has higher precedence than *; (*s).id or s->id is required for pointers.'
      },
      {
        mistake: 'Assuming a union retains values of multiple members simultaneously',
        codeSnippet: `union Data d;
d.x = 10;
d.y = 20.5; // Overwrites d.x! d.x is now corrupted bit patterns!`,
        correction: 'Remember that unions store only one active member at any single moment in time.',
        explanation: 'All union members occupy the exact same memory bytes.'
      }
    ],
    realWorldExample: {
      scenario: 'Operating System Process Control Block (PCB)',
      code: `#include <stdio.h>

typedef enum { READY, RUNNING, BLOCKED, TERMINATED } ProcessState;

typedef struct {
    int pid;
    ProcessState state;
    unsigned int priority;
    unsigned long cpu_time_ms;
} PCB;

int main(void) {
    PCB p1 = {1042, RUNNING, 10, 4820};
    printf("Process [%d]: State=%d, Priority=%u, CPU=%lu ms\\n",
           p1.pid, p1.state, p1.priority, p1.cpu_time_ms);
    return 0;
}`,
      explanation: 'Kernel schedulers in Unix and Windows manage running tasks using Process Control Block structures tracking execution registers and state.'
    },
    practice: {
      prompt: 'Define a struct Rectangle with int width and int height. Create a function int area(const struct Rectangle *r) that calculates width * height. Print area for a 8x5 rectangle.',
      starterCode: `#include <stdio.h>

// Define struct Rectangle and area function:

int main(void) {
    // Instantiate, calculate, and print area:
    
    return 0;
}`,
      expectedOutputMatcher: 'Area: 40',
      hint: 'return r->width * r->height; in area().',
      solution: `#include <stdio.h>

struct Rectangle {
    int width;
    int height;
};

int area(const struct Rectangle *r) {
    return r->width * r->height;
}

int main(void) {
    struct Rectangle rect = {8, 5};
    printf("Area: %d\\n", area(&rect));
    return 0;
}`
    },
    quiz: [
      {
        id: 'q-c-struct-1',
        question: 'Which operator is used to access a structure member through a pointer to that structure?',
        options: [
          '. (dot)',
          '-> (arrow)',
          ':: (scope resolution)',
          '* (asterisk)'
        ],
        correctIndex: 1,
        explanation: 'The arrow operator (->) is syntactic sugar for dereferencing a structure pointer: ptr->member.'
      },
      {
        id: 'q-c-struct-2',
        question: 'What is the primary architectural difference between a struct and a union in C?',
        options: [
          'structs can only store integers, while unions store any type',
          'In a struct each member has its own memory space; in a union all members share the same memory location',
          'unions can contain functions, while structs cannot',
          'structs are allocated on the heap, while unions are on the stack'
        ],
        correctIndex: 1,
        explanation: 'A struct allocates separate memory for all members; a union overlays all members at the same base memory address.'
      },
      {
        id: 'q-c-struct-3',
        question: 'What keyword allows creating a custom type synonym or alias in C?',
        options: [
          'alias',
          'typedef',
          'using',
          'define'
        ],
        correctIndex: 1,
        explanation: 'typedef establishes a new mnemonic identifier alias for an existing data type.'
      },
      {
        id: 'q-c-struct-4',
        question: 'Why is the sizeof() a structure sometimes larger than the mathematical sum of its individual member sizes?',
        options: [
          'Because of compiler memory alignment padding bytes inserted for CPU efficiency',
          'Because C stores the member names in the struct',
          'Because structs automatically contain a pointer to main',
          'Because of dynamic heap allocation'
        ],
        correctIndex: 0,
        explanation: 'CPUs access memory faster when data is aligned on 4-byte or 8-byte boundaries; compilers insert padding bytes to satisfy alignment requirements.'
      },
      {
        id: 'q-c-struct-5',
        question: 'By default, what integer value is assigned to the first identifier in an enum if not explicitly specified?',
        options: [
          '1',
          '0',
          '-1',
          'Undefined'
        ],
        correctIndex: 1,
        explanation: 'In C, enum members start at integer 0 and increment sequentially by 1 unless explicitly assigned.'
      }
    ],
    codingChallenge: {
      title: 'Student Grade Record Processor',
      difficulty: 'Medium',
      problem_statement: 'Define a struct Student with int id, char name[20], and int score. Create a function that prints "Student ID: 101 | Name: Alice | Status: PASSED" if score >= 60, otherwise "FAILED". Test with score = 85.',
      input_format: 'No input needed.',
      output_format: 'Student ID: 101 | Name: Alice | Status: PASSED',
      constraints: 'Use struct pointer as function argument.',
      starter_code: `#include <stdio.h>

struct Student {
    int id;
    char name[20];
    int score;
};

void evaluate(const struct Student *s) {
    const char *status = (s->score >= 60) ? "PASSED" : "FAILED";
    printf("Student ID: %d | Name: %s | Status: %s\\n", s->id, s->name, status);
}

int main(void) {
    struct Student s = {101, "Alice", 85};
    evaluate(&s);
    return 0;
}`,
      solution_code: `#include <stdio.h>

struct Student {
    int id;
    char name[20];
    int score;
};

void evaluate(const struct Student *s) {
    const char *status = (s->score >= 60) ? "PASSED" : "FAILED";
    printf("Student ID: %d | Name: %s | Status: %s\\n", s->id, s->name, status);
}

int main(void) {
    struct Student s = {101, "Alice", 85};
    evaluate(&s);
    return 0;
}`,
      test_cases: [
        {
          input: '',
          expected_output: 'Student ID: 101 | Name: Alice | Status: PASSED'
        }
      ]
    },
    summary: [
      'struct bundles heterogeneous data types into a single composite entity.',
      'Use dot (.) for direct structure access and arrow (->) for structure pointers.',
      'typedef creates clean type aliases, avoiding repeated struct keywords.',
      'union shares a single memory buffer across all members; size equals the largest member.',
      'enum provides type-safe symbolic names for integer states and flags.'
    ]
  },

  // =========================================================================
  // TOPIC 14: File Handling in C
  // =========================================================================
  {
    id: 'top-c-files',
    number: 14,
    numberDisplay: '14',
    moduleId: 'mod-c-systems',
    moduleTitle: 'Module 04: Advanced Systems & Capstone Project',
    title: 'File Handling in C',
    slug: 'file-handling-in-c',
    language: 'c',
    shortDescription: 'Persist application data to non-volatile disk storage. Master the FILE structure pointer, fopen(), fclose(), file access modes (r, w, a, rb, wb), formatted I/O (fprintf, fscanf), and binary block I/O (fread, fwrite).',
    difficulty: 'Intermediate',
    estimatedMinutes: 35,
    prerequisiteId: 'top-c-structures',
    learningObjectives: [
      'Manage file streams using the FILE pointer type and handle fopen() and fclose() safely',
      'Select proper file open modes: "r" (read), "w" (overwrite), "a" (append), and binary flags ("rb", "wb")',
      'Perform formatted text I/O with fprintf() and fscanf() and line I/O with fgets() and fputs()',
      'Read and write raw binary structures to disk using fread() and fwrite()'
    ],
    conceptExplanation: `### The C File Stream Abstraction
In C, file interactions are abstracted through an opaque operating system handle: the **\`FILE*\` pointer** (defined in \`<stdio.h>\`). A \`FILE\` structure tracks the operating system file descriptor, read/write stream buffer, current byte position, and error/EOF flags.

### Opening and Closing Streams
\`\`\`c
FILE *fp = fopen("records.txt", "w");
if (fp == NULL) {
    perror("Error opening file");
    return 1;
}
// Perform I/O operations...
fclose(fp); // Flushes buffers and releases OS file descriptor!
\`\`\`

### File Access Modes
| Mode | Meaning | File Exists | File Does Not Exist |
| :--- | :--- | :--- | :--- |
| \`"r"\` | Read text | Opens at start | Fails (returns \`NULL\`) |
| \`"w"\` | Write text | **Truncates to 0 bytes** | Creates new file |
| \`"a"\` | Append text | Preserves data; writes at end | Creates new file |
| \`"r+"\`| Read & Write | Opens at start | Fails |
| \`"rb"\`, \`"wb"\` | Raw binary mode | Binary representation without CRLF translation |

### Formatted File I/O
- \`fprintf(fp, "%d %s\\n", id, name)\`: Writes formatted ASCII text to file stream.
- \`fscanf(fp, "%d %s", &id, name)\`: Parses formatted ASCII text from file stream.

### Binary File I/O with \`fread()\` and \`fwrite()\`
For complex records (such as structs), writing ASCII text is slow and requires parsing. **Binary I/O** directly dumps raw memory bytes to disk:
\`\`\`c
// Write entire struct in 1 operation:
fwrite(&student, sizeof(Student), 1, fp);

// Read entire struct in 1 operation:
fread(&student, sizeof(Student), 1, fp);
\`\`\`

### File Positioning: \`fseek()\` and \`ftell()\`
- \`ftell(fp)\`: Returns current byte offset from the start of file.
- \`fseek(fp, offset, origin)\`: Moves the file position indicator (\`SEEK_SET\`, \`SEEK_CUR\`, \`SEEK_END\`).
- \`rewind(fp)\`: Resets position indicator back to beginning (\`0\`).`,
    simpleExample: {
      code: `#include <stdio.h>

int main(void) {
    FILE *fp = fopen("note.txt", "w");
    if (!fp) return 1;
    fprintf(fp, "System initialized.\\n");
    fclose(fp);
    printf("File written successfully.\\n");
    return 0;
}`,
      explanation: 'Opens note.txt in write mode, writes a text line with fprintf, closes the file stream, and flushes bytes to disk.'
    },
    syntax: `#include <stdio.h>

FILE *fp = fopen("data.txt", "r");
if (fp == NULL) { /* handle error */ }

// Text I/O
fprintf(fp, "Score: %d\\n", 95);
fscanf(fp, "%d", &val);

// Binary I/O
fwrite(buffer, sizeof(Type), count, fp);
fread(buffer, sizeof(Type), count, fp);

fclose(fp);`,
    codeExample: `#include <stdio.h>
#include <string.h>

typedef struct {
    int id;
    char name[20];
    double score;
} StudentRecord;

int main(void) {
    StudentRecord s_write = {101, "Marcus Aurelius", 98.5};
    const char *filename = "student_record.bin";
    
    // 1. Write binary struct to disk
    FILE *fp_out = fopen(filename, "wb");
    if (fp_out == NULL) {
        printf("Error opening file for write.\\n");
        return 1;
    }
    fwrite(&s_write, sizeof(StudentRecord), 1, fp_out);
    fclose(fp_out);
    printf("Binary record written: %zu bytes\\n", sizeof(StudentRecord));
    
    // 2. Read binary struct back from disk
    StudentRecord s_read;
    FILE *fp_in = fopen(filename, "rb");
    if (fp_in == NULL) {
        printf("Error opening file for read.\\n");
        return 1;
    }
    fread(&s_read, sizeof(StudentRecord), 1, fp_in);
    fclose(fp_in);
    
    printf("Record Recovered from Disk:\\n");
    printf("  ID:    %d\\n", s_read.id);
    printf("  Name:  %s\\n", s_read.name);
    printf("  Score: %.1f\\n", s_read.score);
    
    return 0;
}`,
    expectedOutput: `Binary record written: 32 bytes
Record Recovered from Disk:
  ID:    101
  Name:  Marcus Aurelius
  Score: 98.5`,
    stepByStep: [
      '1. fopen("filename", "wb") requests a binary write stream handle from the OS kernel.',
      '2. fwrite() dumps the raw 32 bytes of the StudentRecord struct directly to disk.',
      '3. fclose() flushes cached write buffers and closes the file descriptor.',
      '4. fopen("filename", "rb") re-opens the file stream for reading.',
      '5. fread() reconstructs the struct memory state identically in one CPU operation.'
    ],
    commonMistakes: [
      {
        mistake: 'Forgetting to close open files with fclose()',
        codeSnippet: `FILE *fp = fopen("data.txt", "w");
fprintf(fp, "Data");
// fclose(fp) forgotten!`,
        correction: 'Always close files: fclose(fp); before exiting.',
        explanation: 'Failing to close files causes memory leaks, locks files on Windows, and risks data loss if buffers were not flushed.'
      },
      {
        mistake: 'Using "w" mode expecting to append data',
        codeSnippet: `FILE *fp = fopen("log.txt", "w"); // Truncates log.txt to 0 bytes, erasing all previous history!`,
        correction: 'Use append mode "a" or "ab" to preserve existing content and write at the end.',
        explanation: 'Opening with "w" immediately deletes existing contents.'
      }
    ],
    realWorldExample: {
      scenario: 'Database Write-Ahead Logging (WAL)',
      code: `#include <stdio.h>
#include <time.h>

int main(void) {
    FILE *wal = fopen("db_wal.log", "a");
    if (!wal) return 1;
    
    fprintf(wal, "[TXN-8092] INSERT INTO accounts VALUES (101, 500.00)\\n");
    fflush(wal); // Force immediate flush to disk platter
    fclose(wal);
    printf("WAL commit persisted.\\n");
    return 0;
}`,
      explanation: 'Databases (SQLite, PostgreSQL) achieve ACID durability by appending transaction log entries to disk before committing memory state.'
    },
    practice: {
      prompt: 'Write a program that writes the string "C File Handling Mastery" to a file named "out.txt", closes it, re-opens it in read mode, reads the line with fgets(), and prints it.',
      starterCode: `#include <stdio.h>

int main(void) {
    // Write to out.txt, then read and print:
    
    return 0;
}`,
      expectedOutputMatcher: 'C File Handling Mastery',
      hint: 'Use fprintf(fp, "C File Handling Mastery\\n") and fgets(buffer, sizeof(buffer), fp).',
      solution: `#include <stdio.h>

int main(void) {
    FILE *fp = fopen("out.txt", "w");
    if (!fp) return 1;
    fprintf(fp, "C File Handling Mastery\\n");
    fclose(fp);
    
    char buffer[64];
    fp = fopen("out.txt", "r");
    if (!fp) return 1;
    if (fgets(buffer, sizeof(buffer), fp)) {
        printf("%s", buffer);
    }
    fclose(fp);
    return 0;
}`
    },
    quiz: [
      {
        id: 'q-c-file-1',
        question: 'What return value from fopen() signifies that the file could not be opened?',
        options: [
          '0',
          'EOF (-1)',
          'NULL',
          '-2'
        ],
        correctIndex: 2,
        explanation: 'fopen() returns NULL if the file does not exist, permissions are denied, or path is invalid.'
      },
      {
        id: 'q-c-file-2',
        question: 'What happens to existing file contents if a file is opened with mode "w"?',
        options: [
          'New text is appended to the bottom',
          'The existing contents are completely truncated and wiped to 0 bytes',
          'The file becomes read-only',
          'The file generates a runtime permission error'
        ],
        correctIndex: 1,
        explanation: 'Opening with "w" truncates an existing file to zero length.'
      },
      {
        id: 'q-c-file-3',
        question: 'Which function directly writes raw binary blocks of memory (such as structs) to disk without string formatting?',
        options: [
          'fprintf()',
          'fwrite()',
          'fputs()',
          'write_line()'
        ],
        correctIndex: 1,
        explanation: 'fwrite() copies raw memory bytes directly to the file stream.'
      },
      {
        id: 'q-c-file-4',
        question: 'What does the function rewind(fp) do?',
        options: [
          'Deletes the last written line',
          'Resets the file position indicator back to the start of the file (offset 0)',
          'Closes and re-opens the file in append mode',
          'Reverses the bytes of the file'
        ],
        correctIndex: 1,
        explanation: 'rewind(fp) resets the stream offset back to byte 0 (equivalent to fseek(fp, 0L, SEEK_SET)).'
      },
      {
        id: 'q-c-file-5',
        question: 'Why is calling fclose() essential when writing to files in C?',
        options: [
          'It clears global variables',
          'It flushes memory buffers to disk and frees the operating system file descriptor handle',
          'It deletes temporary compiler files',
          'It prevents infinite loops'
        ],
        correctIndex: 1,
        explanation: 'Standard I/O is buffered; fclose() ensures all remaining unwritten bytes in RAM buffers are flushed to disk before closing.'
      }
    ],
    codingChallenge: {
      title: 'Persistent Counter File Store',
      difficulty: 'Medium',
      problem_statement: 'Write an integer 42 to a file named "counter.dat" in binary mode using fwrite. Re-read it with fread and print "Recovered Counter: 42".',
      input_format: 'No input needed.',
      output_format: 'Recovered Counter: 42',
      constraints: 'Must use binary "wb" and "rb" modes.',
      starter_code: `#include <stdio.h>

int main(void) {
    int val = 42;
    FILE *out = fopen("counter.dat", "wb");
    if (!out) return 1;
    fwrite(&val, sizeof(int), 1, out);
    fclose(out);
    
    int read_val = 0;
    FILE *in = fopen("counter.dat", "rb");
    if (!in) return 1;
    fread(&read_val, sizeof(int), 1, in);
    fclose(in);
    
    printf("Recovered Counter: %d\\n", read_val);
    return 0;
}`,
      solution_code: `#include <stdio.h>

int main(void) {
    int val = 42;
    FILE *out = fopen("counter.dat", "wb");
    if (!out) return 1;
    fwrite(&val, sizeof(int), 1, out);
    fclose(out);
    
    int read_val = 0;
    FILE *in = fopen("counter.dat", "rb");
    if (!in) return 1;
    fread(&read_val, sizeof(int), 1, in);
    fclose(in);
    
    printf("Recovered Counter: %d\\n", read_val);
    return 0;
}`,
      test_cases: [
        {
          input: '',
          expected_output: 'Recovered Counter: 42'
        }
      ]
    },
    summary: [
      'File operations are coordinated through the FILE* stream pointer abstraction.',
      'Check if (fp == NULL) after fopen() to handle missing files and permissions safely.',
      'Use "r" for read, "w" to overwrite, and "a" to append without truncating.',
      'Use fwrite() and fread() for fast binary structure serialization.',
      'Always call fclose() to flush buffers and release OS file descriptor handles.'
    ]
  },

  // =========================================================================
  // TOPIC 15: Preprocessor, Header Files & Compilation
  // =========================================================================
  {
    id: 'top-c-preprocessor',
    number: 15,
    numberDisplay: '15',
    moduleId: 'mod-c-systems',
    moduleTitle: 'Module 04: Advanced Systems & Capstone Project',
    title: 'Preprocessor, Header Files & Compilation',
    slug: 'preprocessor-header-files-and-compilation',
    language: 'c',
    shortDescription: 'Master the C preprocessor and multi-file architecture. Learn #include, #define macros, conditional compilation (#ifdef, #ifndef), header guards, translation units, and linking multi-file projects.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisiteId: 'top-c-files',
    learningObjectives: [
      'Understand how the C preprocessor manipulates source code before the compiler executes',
      'Construct function-like macros and avoid classic operator precedence pitfalls with parentheses',
      'Use conditional compilation (#ifdef, #ifndef, #endif) for debug logging and cross-platform targets',
      'Architect modular multi-file C programs with .h headers, header guards, and separate .c source files'
    ],
    conceptExplanation: `### The Preprocessor Phase
The C Preprocessor (\`cpp\`) is a text-processing engine that operates on your source code **before syntax analysis and compilation begin**. All preprocessor directives begin with a hash symbol (\`#\`) and do not end with a semicolon.

### Core Preprocessor Directives
1. **\`#include\`**: Copies the entire contents of a specified file directly into the current translation unit:
   - \`#include <stdio.h>\`: Searches system library directories.
   - \`#include "my_header.h"\`: Searches local project directories first, then system paths.
2. **\`#define\` Object-like Macros**: Simple text substitution:
   \`#define MAX_BUFFER 4096\`
3. **Function-like Macros**:
   \`\`\`c
   #define SQUARE(x) ((x) * (x))
   \`\`\`
   *Crucial Rule*: Always wrap macro parameters and the entire replacement expression in parentheses! Without them, \`SQUARE(2 + 3)\` expands to \`2 + 3 * 2 + 3\` (which is 11, not 25!).

### Conditional Compilation
Directives like \`#ifdef\`, \`#ifndef\`, and \`#endif\` instruct the compiler to include or exclude specific blocks of code depending on whether a macro flag is defined:
\`\`\`c
#ifdef DEBUG
    printf("Debug trace: var = %d\\n", var);
#endif
\`\`\`

### Header Guards
When multiple files include the same header file, declarations can be duplicated, causing "redefinition of type" compiler errors. **Header guards** guarantee that a header's contents are expanded exactly once per translation unit:
\`\`\`c
#ifndef MY_HEADER_H
#define MY_HEADER_H

// Declarations, prototypes, and types go here

#endif // MY_HEADER_H
\`\`\`
Alternatively, modern compilers support the non-standard but ubiquitous directive:
\`#pragma once\``,
    simpleExample: {
      code: `#include <stdio.h>

#define MAX(a, b) (((a) > (b)) ? (a) : (b))

int main(void) {
    int m = MAX(10, 25);
    printf("Maximum: %d\\n", m);
    return 0;
}`,
      explanation: 'Uses a function-like macro MAX with defensive parentheses to compute the larger of two values at compile-time.'
    },
    syntax: `// Header Guard Template
#ifndef MODULE_NAME_H
#define MODULE_NAME_H

#define VERSION_MAJOR 2
#define VERSION_MINOR 1

int compute_checksum(const char *data);

#endif

// Conditional Compilation
#if defined(DEBUG) && DEBUG == 1
#define LOG(msg) printf("[DEBUG] %s\\n", msg)
#else
#define LOG(msg) /* no-op */
#endif`,
    codeExample: `#include <stdio.h>

// Function-like macro with defensive parentheses
#define CLAMP(x, min, max) (((x) < (min)) ? (min) : (((x) > (max)) ? (max) : (x)))

// Conditional compilation feature flag
#define ENABLE_VERBOSE_LOGS 1

int main(void) {
    int raw_input = 145;
    int bounded = CLAMP(raw_input, 0, 100);
    
    printf("Raw Value: %d -> Clamped Value: %d\\n", raw_input, bounded);
    
    #if ENABLE_VERBOSE_LOGS
    printf("[TELEMETRY] Sensor signal normalization confirmed.\\n");
    #else
    printf("[TELEMETRY] Minimal trace.\\n");
    #endif
    
    // Built-in Preprocessor Macros
    printf("Compiled from File: %s\\n", __FILE__);
    printf("Compiled on Date:   %s\\n", __DATE__);
    
    return 0;
}`,
    expectedOutput: `Raw Value: 145 -> Clamped Value: 100
[TELEMETRY] Sensor signal normalization confirmed.
Compiled from File: [filename].c
Compiled on Date:   [date]`,
    stepByStep: [
      '1. Preprocessor scans source for # directives.',
      '2. CLAMP macro text-substitutes parameters into ternary expression before syntax check.',
      '3. #if ENABLE_VERBOSE_LOGS evaluates; true branch is emitted into token stream, false branch discarded.',
      '4. Built-in macros __FILE__ and __DATE__ expand to literal strings.',
      '5. Resulting translation unit is forwarded to the compiler phase.'
    ],
    commonMistakes: [
      {
        mistake: 'Failing to parenthesize macro arguments',
        codeSnippet: `#define MULTIPLY(a, b) a * b
int val = MULTIPLY(2 + 3, 4); // Expands to 2 + 3 * 4 = 14 instead of (2+3)*4 = 20!`,
        correction: 'Always parenthesize arguments and whole expression: #define MULTIPLY(a, b) ((a) * (b))',
        explanation: 'Macros perform naive textual replacement without respecting operator precedence.'
      },
      {
        mistake: 'Omitting header guards in custom .h files',
        codeSnippet: `// In my_struct.h (no guard)
struct Node { int val; }; // Included by two files -> "redefinition of struct Node" error!`,
        correction: 'Wrap every header file in #ifndef HEADER_NAME_H ... #define HEADER_NAME_H ... #endif.',
        explanation: 'Header guards prevent multiple inclusions in the same compilation unit.'
      }
    ],
    realWorldExample: {
      scenario: 'Cross-Platform Operating System API Abstraction',
      code: `#include <stdio.h>

#if defined(_WIN32) || defined(_WIN64)
    #define PLATFORM_NAME "Microsoft Windows"
#elif defined(__linux__)
    #define PLATFORM_NAME "Linux Kernel"
#elif defined(__APPLE__)
    #define PLATFORM_NAME "Apple macOS / Darwin"
#else
    #define PLATFORM_NAME "Generic POSIX"
#endif

int main(void) {
    printf("Build Target Architecture: %s\\n", PLATFORM_NAME);
    return 0;
}`,
      explanation: 'Major cross-platform frameworks (Chromium, Qt, SDL) use preprocessor platform definitions to compile OS-specific syscalls.'
    },
    practice: {
      prompt: 'Define a function-like macro MIN(a, b) that returns the smaller of two values. In main(), compute MIN(45, 18) and print "Min: 18".',
      starterCode: `#include <stdio.h>

// Define MIN macro:

int main(void) {
    // Print minimum of 45 and 18:
    
    return 0;
}`,
      expectedOutputMatcher: 'Min: 18',
      hint: '#define MIN(a, b) (((a) < (b)) ? (a) : (b))',
      solution: `#include <stdio.h>

#define MIN(a, b) (((a) < (b)) ? (a) : (b))

int main(void) {
    printf("Min: %d\\n", MIN(45, 18));
    return 0;
}`
    },
    quiz: [
      {
        id: 'q-c-prep-1',
        question: 'What is the primary role of a header guard (#ifndef HEADER_H ... #endif) in C?',
        options: [
          'To encrypt the header file on disk',
          'To prevent duplicate definitions when the same header file is included multiple times',
          'To convert C code into C++',
          'To allocate global static storage'
        ],
        correctIndex: 1,
        explanation: 'Header guards prevent redefinition errors by ensuring header declarations are expanded only once per translation unit.'
      },
      {
        id: 'q-c-prep-2',
        question: 'Why should macro parameters always be enclosed in parentheses (e.g. #define SQUARE(x) ((x) * (x)))?',
        options: [
          'The C compiler throws a syntax error without them',
          'To prevent operator precedence errors when passing complex expressions like (a + b)',
          'To allocate extra stack registers',
          'To force inline assembly'
        ],
        correctIndex: 1,
        explanation: 'Without parentheses, expressions like 2 + 3 expand to 2 + 3 * 2 + 3, yielding incorrect arithmetic results.'
      },
      {
        id: 'q-c-prep-3',
        question: 'What is the difference between #include <file.h> and #include "file.h"?',
        options: [
          '<file.h> searches system include paths; "file.h" searches the current local project directory first',
          '<file.h> is for C++; "file.h" is for C',
          '<file.h> compiles in debug mode; "file.h" in release mode',
          'There is no difference'
        ],
        correctIndex: 0,
        explanation: 'Angle brackets < > look in system/standard library headers; quotation marks " " search the local directory first.'
      },
      {
        id: 'q-c-prep-4',
        question: 'Which built-in preprocessor macro expands to the current source code filename as a string literal?',
        options: [
          '__LINE__',
          '__FILE__',
          '__DATE__',
          '__PATH__'
        ],
        correctIndex: 1,
        explanation: '__FILE__ expands to the full path or filename of the current translation unit.'
      },
      {
        id: 'q-c-prep-5',
        question: 'Which preprocessor directive checks if a macro has NOT been defined previously?',
        options: [
          '#ifdef',
          '#ifndef',
          '#undef',
          '#error'
        ],
        correctIndex: 1,
        explanation: '#ifndef stands for "if not defined".'
      }
    ],
    codingChallenge: {
      title: 'Conditional Debug Tracer Macro',
      difficulty: 'Medium',
      problem_statement: 'Define a macro DEBUG_LOG(msg) that prints "[TRACE] " followed by msg if DEBUG_MODE is defined as 1. Test with message "System Online".',
      input_format: 'No input needed.',
      output_format: '[TRACE] System Online',
      constraints: 'Use #if DEBUG_MODE == 1.',
      starter_code: `#include <stdio.h>

#define DEBUG_MODE 1

#if DEBUG_MODE == 1
#define DEBUG_LOG(msg) printf("[TRACE] %s\\n", msg)
#else
#define DEBUG_LOG(msg)
#endif

int main(void) {
    DEBUG_LOG("System Online");
    return 0;
}`,
      solution_code: `#include <stdio.h>

#define DEBUG_MODE 1

#if DEBUG_MODE == 1
#define DEBUG_LOG(msg) printf("[TRACE] %s\\n", msg)
#else
#define DEBUG_LOG(msg)
#endif

int main(void) {
    DEBUG_LOG("System Online");
    return 0;
}`,
      test_cases: [
        {
          input: '',
          expected_output: '[TRACE] System Online'
        }
      ]
    },
    summary: [
      'The preprocessor executes textual transformation before compilation.',
      'Always use defensive parentheses around macro parameters: ((x) * (x)).',
      'Header guards (#ifndef / #define / #endif) prevent duplicate declaration collisions.',
      'Conditional compilation (#ifdef, #if) tailors builds for debug and multi-platform targets.',
      'Use #include <...> for system headers and #include "..." for local project modules.'
    ]
  },

  // =========================================================================
  // TOPIC 16: Final Mini Project: Student Record Management System
  // =========================================================================
  {
    id: 'top-c-project',
    number: 16,
    numberDisplay: '16',
    moduleId: 'mod-c-systems',
    moduleTitle: 'Module 04: Advanced Systems & Capstone Project',
    title: 'Final Mini Project: Student Record Management System',
    slug: 'final-mini-project-student-record-management-system',
    language: 'c',
    shortDescription: 'Construct a complete, production-quality menu-driven Student Record Management System in C. Synthesizes structs, dynamic arrays, pointer parameter passing, binary file persistence, grade calculation, and defensive input validation.',
    difficulty: 'Advanced Project',
    estimatedMinutes: 60,
    prerequisiteId: 'top-c-preprocessor',
    learningObjectives: [
      'Synthesize fundamental C programming concepts into a cohesive, interactive terminal application',
      'Implement full CRUD capabilities (Create, Read, Update, Delete) on structured records',
      'Compute aggregate statistical metrics (total marks, averages, letter grade assignment)',
      'Persist structured application data across sessions using binary disk I/O (fwrite/fread)'
    ],
    conceptExplanation: `### Capstone Project Architecture
The **Student Record Management System** integrates every core discipline learned across the 16 lessons into a complete real-world software utility.

### System Requirements Breakdown
1. **Data Model (\`struct Student\`)**: Stores Student ID, Full Name, Marks in 3 Subjects, Total, Average, and Letter Grade.
2. **Dynamic In-Memory Database**: Manages an array of records with live count tracking and capacity limits.
3. **Menu-Driven Interface**: Interactive command dispatcher using loops and switch statements.
4. **Calculations**: Automatically computes total scores, floating-point averages, and assigns letter grades (\`A\`, \`B\`, \`C\`, \`D\`, \`F\`).
5. **Search & Update**: Fast linear search by Student ID with in-place pointer mutation.
6. **Deletion**: Deletes records by shifting subsequent elements left to maintain contiguous order.
7. **Non-Volatile File Persistence**: Saves database state to disk using \`fwrite()\` and reloads on startup via \`fread()\`.

### Data Flow Diagram
\`\`\`
[ User Command ] 
       │
       ▼
[ Menu Dispatcher (switch) ]
       ├── 1. Add Record ───────────► [ Validate & Compute Grade ] ──► [ Append to Array ]
       ├── 2. Display All Records ──► [ Formatted Table Output ]
       ├── 3. Search by ID ─────────► [ Linear Pointer Search ]
       ├── 4. Update Details ───────► [ Find & Mutate Memory ]
       ├── 5. Delete Record ────────► [ Shift Array Left (O(N)) ]
       ├── 6. Save to Disk ─────────► [ Binary fwrite() to File ]
       └── 7. Load from Disk ───────► [ Binary fread() from File ]
\`\`\`

### Technical Highlights
- **Modularity**: Every action is encapsulated in a separate function passing \`Student*\` pointers.
- **Defensive Programming**: Validates array capacity, file handle null checks, and divisor-by-zero protection.
- **Robust Persistence**: Binary serialization directly dumps the in-memory array to disk for instant restoration.`,
    simpleExample: {
      code: `#include <stdio.h>

typedef struct {
    int id;
    char name[20];
    double avg;
} SimpleStudent;

int main(void) {
    SimpleStudent s = {101, "Alice", 92.5};
    printf("Record: ID=%d | Name=%s | Average=%.1f\\n", s.id, s.name, s.avg);
    return 0;
}`,
      explanation: 'Illustrates the foundational record struct concept used by the Student Record Management System.'
    },
    syntax: `// Capstone Record Data Model
typedef struct {
    int id;
    char name[32];
    float marks[3];
    float total;
    float average;
    char grade;
} Student;

// Core CRUD Signatures
void add_student(Student list[], int *count, int max_capacity);
void display_all(const Student list[], int count);
int find_student_by_id(const Student list[], int count, int target_id);
int delete_student(Student list[], int *count, int target_id);
int save_database(const Student list[], int count, const char *filepath);
int load_database(Student list[], int *count, const char *filepath);`,
    codeExample: `#include <stdio.h>
#include <string.h>

#define MAX_STUDENTS 10

typedef struct {
    int id;
    char name[32];
    float m1, m2, m3;
    float total;
    float average;
    char grade;
} Student;

void compute_grades(Student *s) {
    s->total = s->m1 + s->m2 + s->m3;
    s->average = s->total / 3.0f;
    if (s->average >= 90.0f) s->grade = 'A';
    else if (s->average >= 80.0f) s->grade = 'B';
    else if (s->average >= 70.0f) s->grade = 'C';
    else if (s->average >= 60.0f) s->grade = 'D';
    else s->grade = 'F';
}

void print_table_header(void) {
    printf("-----------------------------------------------------------------------\\n");
    printf("%-6s | %-16s | %-6s %-6s %-6s | %-6s | %-6s | %s\\n",
           "ID", "NAME", "M1", "M2", "M3", "TOTAL", "AVG", "GRADE");
    printf("-----------------------------------------------------------------------\\n");
}

void print_student_row(const Student *s) {
    printf("%-6d | %-16s | %5.1f  %5.1f  %5.1f | %6.1f | %5.1f%% | %c\\n",
           s->id, s->name, s->m1, s->m2, s->m3, s->total, s->average, s->grade);
}

int main(void) {
    Student database[MAX_STUDENTS];
    int count = 0;
    
    printf("=======================================================================\\n");
    printf("            STUDENT RECORD MANAGEMENT SYSTEM - VERSION 1.0             \\n");
    printf("=======================================================================\\n");
    
    // 1. Add sample records
    database[0].id = 101;
    strcpy(database[0].name, "Ada Lovelace");
    database[0].m1 = 98.0f; database[0].m2 = 95.0f; database[0].m3 = 100.0f;
    compute_grades(&database[0]);
    count++;
    
    database[1].id = 102;
    strcpy(database[1].name, "Claude Shannon");
    database[1].m1 = 88.0f; database[1].m2 = 92.0f; database[1].m3 = 85.0f;
    compute_grades(&database[1]);
    count++;
    
    database[2].id = 103;
    strcpy(database[2].name, "Grace Hopper");
    database[2].m1 = 94.0f; database[2].m2 = 96.0f; database[2].m3 = 91.0f;
    compute_grades(&database[2]);
    count++;
    
    // 2. Display All Records
    printf("\\n[ACTION: DISPLAY ALL ACTIVE RECORDS]\\n");
    print_table_header();
    for (int i = 0; i < count; i++) {
        print_student_row(&database[i]);
    }
    printf("-----------------------------------------------------------------------\\n");
    
    // 3. Search by ID
    int search_id = 102;
    printf("\\n[ACTION: SEARCH BY ID %d]\\n", search_id);
    int found_idx = -1;
    for (int i = 0; i < count; i++) {
        if (database[i].id == search_id) {
            found_idx = i;
            break;
        }
    }
    if (found_idx != -1) {
        printf("Record Found: %s with average %.1f%% (Grade %c)\\n",
               database[found_idx].name, database[found_idx].average, database[found_idx].grade);
    }
    
    // 4. Persistence Test (Write & Read Binary)
    const char *db_file = "student_records.bin";
    FILE *fp = fopen(db_file, "wb");
    if (fp) {
        fwrite(&count, sizeof(int), 1, fp);
        fwrite(database, sizeof(Student), count, fp);
        fclose(fp);
        printf("\\n[ACTION: PERSISTENCE] Successfully saved %d records to %s\\n", count, db_file);
    }
    
    return 0;
}`,
    expectedOutput: `=======================================================================
            STUDENT RECORD MANAGEMENT SYSTEM - VERSION 1.0             
=======================================================================

[ACTION: DISPLAY ALL ACTIVE RECORDS]
-----------------------------------------------------------------------
ID     | NAME             | M1     M2     M3     | TOTAL  | AVG    | GRADE
-----------------------------------------------------------------------
101    | Ada Lovelace     |  98.0   95.0  100.0 |  293.0 |  97.7% | A
102    | Claude Shannon   |  88.0   92.0   85.0 |  265.0 |  88.3% | B
103    | Grace Hopper     |  94.0   96.0   91.0 |  281.0 |  93.7% | A
-----------------------------------------------------------------------

[ACTION: SEARCH BY ID 102]
Record Found: Claude Shannon with average 88.3% (Grade B)

[ACTION: PERSISTENCE] Successfully saved 3 records to student_records.bin`,
    stepByStep: [
      '1. Database array of Student structures is allocated on memory stack.',
      '2. Records are populated with raw scores; compute_grades() calculates totals, averages, and assigns letter grades.',
      '3. Formatted tabular output prints aligned columns matching standard reporting standards.',
      '4. Linear search scans array identifiers O(N) to locate matching Student ID.',
      '5. fwrite() serializes integer count and all struct records to binary disk file in a single operation.'
    ],
    commonMistakes: [
      {
        mistake: 'Failing to decrement record count after deleting a student',
        codeSnippet: `// After shifting elements left:
// count was not decremented! database still prints phantom last element!`,
        correction: 'Always decrement (*count)-- after deleting a record and shifting array elements.',
        explanation: 'The count variable defines the active boundary of the in-memory array.'
      },
      {
        mistake: 'Direct struct assignment over network or incompatible compiler builds without packing',
        codeSnippet: `// Binary written on 32-bit machine read on 64-bit machine with different padding`,
        correction: 'In production systems, use standardized serialization formats or explicit fixed-width types.',
        explanation: 'Padding bytes can differ across compiler optimization levels and CPU architectures.'
      }
    ],
    realWorldExample: {
      scenario: 'Academic Registrar Enterprise Database Core',
      code: `#include <stdio.h>

typedef struct {
    int student_id;
    char major[16];
    int credits;
    float cumulative_gpa;
} UniversityRecord;

int main(void) {
    UniversityRecord r = {2026001, "Computer Science", 120, 3.88f};
    printf("Degree Audit: ID=%d, Major=%s, Credits=%d, GPA=%.2f -> STATUS: GRADUATED\\n",
           r.student_id, r.major, r.credits, r.cumulative_gpa);
    return 0;
}`,
      explanation: 'Campus enterprise systems (Banner, PeopleSoft) manage millions of academic student records backed by compiled C high-throughput transaction engines.'
    },
    practice: {
      prompt: 'Write a program that takes three subject marks (80, 90, 70), computes total and average, and assigns grade \'B\' (since avg is 80.0). Print "Total: 240, Avg: 80.0, Grade: B".',
      starterCode: `#include <stdio.h>

int main(void) {
    float m1 = 80, m2 = 90, m3 = 70;
    // Calculate total, average, grade and print:
    
    return 0;
}`,
      expectedOutputMatcher: 'Total: 240.0, Avg: 80.0, Grade: B',
      hint: 'total = m1 + m2 + m3; avg = total / 3.0f; char grade = (avg >= 80) ? \'B\' : \'C\';',
      solution: `#include <stdio.h>

int main(void) {
    float m1 = 80.0f, m2 = 90.0f, m3 = 70.0f;
    float total = m1 + m2 + m3;
    float avg = total / 3.0f;
    char grade = (avg >= 90) ? 'A' : (avg >= 80) ? 'B' : 'C';
    printf("Total: %.1f, Avg: %.1f, Grade: %c\\n", total, avg, grade);
    return 0;
}`
    },
    quiz: [
      {
        id: 'q-c-proj-1',
        question: 'Which algorithmic complexity characterizes searching for a student record by ID in an unsorted array of size N?',
        options: [
          'O(1) constant time',
          'O(N) linear time',
          'O(log N) logarithmic time',
          'O(N^2) quadratic time'
        ],
        correctIndex: 1,
        explanation: 'Linear search must examine up to N elements sequentially to locate the matching ID in an unsorted array.'
      },
      {
        id: 'q-c-proj-2',
        question: 'How do you delete a record at index k in a contiguous array of N elements while maintaining order?',
        options: [
          'Set array[k] to NULL and leave a gap',
          'Shift all elements from index k+1 down to N-1 one position to the left, then decrement count',
          'Re-allocate the entire array using calloc',
          'Multiply all subsequent IDs by -1'
        ],
        correctIndex: 1,
        explanation: 'Shifting subsequent elements left by one position fills the vacant slot and preserves contiguous ordering.'
      },
      {
        id: 'q-c-proj-3',
        question: 'Why is fwrite(&database, sizeof(Student), count, fp) more efficient than writing each field as ASCII with fprintf()?',
        options: [
          'Because fwrite compresses the data using gzip',
          'Because fwrite dumps the raw memory byte representation directly without performing number-to-ASCII character conversions',
          'Because fwrite encrypts the file',
          'Because fwrite does not use OS buffers'
        ],
        correctIndex: 1,
        explanation: 'Binary I/O transfers memory bytes directly between RAM and disk buffers without parsing overhead.'
      },
      {
        id: 'q-c-proj-4',
        question: 'What is the primary benefit of passing a pointer (const Student *s) instead of the structure value (Student s) to a display function?',
        options: [
          'It allows modifying the student even when marked const',
          'It avoids copying all bytes of the struct onto the stack frame, saving time and memory',
          'It automatically converts the struct into JSON',
          'It is required by the C standard'
        ],
        correctIndex: 1,
        explanation: 'Passing a pointer passes a single 8-byte memory address instead of duplicating the entire struct payload.'
      },
      {
        id: 'q-c-proj-5',
        question: 'What condition should be verified before attempting to add a new student into a fixed-capacity database array?',
        options: [
          'Check that count < MAX_CAPACITY to prevent buffer overflow',
          'Check that all existing students have grade A',
          'Check that the file pointer is closed',
          'Check that the operating system is 64-bit'
        ],
        correctIndex: 0,
        explanation: 'Always check that the current element count has not reached maximum capacity to avoid buffer overflow.'
      }
    ],
    codingChallenge: {
      title: 'Full Student Record Grade Calculator',
      difficulty: 'Hard',
      problem_statement: 'Write a C program that computes total, average, and assigns grades for two students: Student 1 (90, 85, 95) -> Total: 270.0, Avg: 90.0, Grade: A. Student 2 (70, 75, 65) -> Total: 210.0, Avg: 70.0, Grade: C. Print both records.',
      input_format: 'No input needed.',
      output_format: 'Student 1: Total=270.0, Avg=90.0, Grade=A\nStudent 2: Total=210.0, Avg=70.0, Grade=C',
      constraints: 'Compute with floating point division.',
      starter_code: `#include <stdio.h>

typedef struct {
    float m1, m2, m3;
    float total;
    float avg;
    char grade;
} Rec;

void calc(Rec *r) {
    r->total = r->m1 + r->m2 + r->m3;
    r->avg = r->total / 3.0f;
    if (r->avg >= 90) r->grade = 'A';
    else if (r->avg >= 80) r->grade = 'B';
    else if (r->avg >= 70) r->grade = 'C';
    else if (r->avg >= 60) r->grade = 'D';
    else r->grade = 'F';
}

int main(void) {
    Rec r1 = {90.0f, 85.0f, 95.0f};
    Rec r2 = {70.0f, 75.0f, 65.0f};
    calc(&r1);
    calc(&r2);
    printf("Student 1: Total=%.1f, Avg=%.1f, Grade=%c\\n", r1.total, r1.avg, r1.grade);
    printf("Student 2: Total=%.1f, Avg=%.1f, Grade=%c\\n", r2.total, r2.avg, r2.grade);
    return 0;
}`,
      solution_code: `#include <stdio.h>

typedef struct {
    float m1, m2, m3;
    float total;
    float avg;
    char grade;
} Rec;

void calc(Rec *r) {
    r->total = r->m1 + r->m2 + r->m3;
    r->avg = r->total / 3.0f;
    if (r->avg >= 90) r->grade = 'A';
    else if (r->avg >= 80) r->grade = 'B';
    else if (r->avg >= 70) r->grade = 'C';
    else if (r->avg >= 60) r->grade = 'D';
    else r->grade = 'F';
}

int main(void) {
    Rec r1 = {90.0f, 85.0f, 95.0f};
    Rec r2 = {70.0f, 75.0f, 65.0f};
    calc(&r1);
    calc(&r2);
    printf("Student 1: Total=%.1f, Avg=%.1f, Grade=%c\\n", r1.total, r1.avg, r1.grade);
    printf("Student 2: Total=%.1f, Avg=%.1f, Grade=%c\\n", r2.total, r2.avg, r2.grade);
    return 0;
}`,
      test_cases: [
        {
          input: '',
          expected_output: 'Student 1: Total=270.0, Avg=90.0, Grade=A\nStudent 2: Total=210.0, Avg=70.0, Grade=C'
        }
      ]
    },
    summary: [
      'The Student Record Management System combines structs, arrays, pointers, and file I/O.',
      'Always pass struct pointers to avoid stack memory copying overhead.',
      'Maintain contiguous array order during deletion by shifting elements left.',
      'Binary I/O (fwrite/fread) provides instant record persistence to non-volatile disk.',
      'Validating capacity and boundaries guarantees system stability.'
    ]
  }
];
