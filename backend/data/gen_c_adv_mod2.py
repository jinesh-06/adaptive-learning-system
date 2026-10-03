"""Module 2: File Handling and Preprocessor
Topics 05 - 07 for Advanced C Systems & Data Structures.
"""

true = True
false = False
null = None

def get_module_2_topics():
    return [
        {
            "id": "top-c-file-fundamentals",
            "number": 5,
            "numberDisplay": "05",
            "moduleId": "mod-c-adv-files",
            "moduleTitle": "Module 2: File Handling and Preprocessor",
            "title": "File Handling Fundamentals",
            "slug": "file-handling-fundamentals",
            "language": "c",
            "difficulty": "Advanced",
            "estimatedMinutes": 50,
            "prerequisiteId": "top-c-typedef-bitfields",
            "shortDescription": "Master the C standard I/O stream model, file pointers (FILE*), fopen modes (r, w, a, r+, w+, a+), safe error detection, and closing file streams with fclose.",
            "learningObjectives": [
                "Understand the operating system abstraction of streams and the FILE structure.",
                "Distinguish between text file streams and raw binary streams.",
                "Open files safely using fopen() with various access modes (r, w, a, r+, w+, a+).",
                "Verify file opening errors by checking for NULL pointers and interpreting errno.",
                "Flush and close file streams reliably using fclose() to prevent data corruption.",
                "Perform character-by-character reading and writing using fgetc() and fputc()."
            ],
            "conceptExplanation": """### 1. Introduction to File Handling in C
Programs in memory lose all data when terminated because RAM is volatile. **File handling** enables programs to store and retrieve data persistently on non-volatile secondary storage (SSDs, hard drives, flash media).

In C, file interactions do not talk directly to raw drive sectors; instead, the C Standard Library abstracts files as **streams** represented by a pointer to a `FILE` structure (`FILE *`).

### 2. Text Files vs Binary Files
- **Text Files (`.txt`, `.csv`)**: Store sequences of human-readable ASCII or UTF-8 characters. The C runtime performs automatic newline translations (e.g., converting Windows `\\r\\n` to `\\n` on read, and `\\n` to `\\r\\n` on write).
- **Binary Files (`.bin`, `.dat`, `.exe`)**: Store raw bytes exactly as they exist in CPU RAM. No newline or encoding transformations occur; integers, floats, and structs are stored byte-for-byte.

### 3. File Pointers (`FILE *`)
A `FILE *` (defined in `<stdio.h>`) tracks all state needed by the operating system stream buffer:
- The memory buffer address.
- The current read/write cursor position in the file.
- Error and End-of-File (EOF) status flags.

### 4. Opening Files: `fopen()` Modes
```c
FILE *fp = fopen("filename.txt", "mode");
```
| Mode | Meaning | File Exists | File Does Not Exist | File Position |
|---|---|---|---|---|
| `"r"` | Read text | Opens for reading | Returns `NULL` | Beginning |
| `"w"` | Write text | Truncates to 0 bytes! | Creates new file | Beginning |
| `"a"` | Append text | Opens for writing | Creates new file | End of file |
| `"r+"`| Read/Write update | Opens for read/write | Returns `NULL` | Beginning |
| `"w+"`| Read/Write update | Truncates to 0 bytes! | Creates new file | Beginning |
| `"a+"`| Read/Append update | Reads anywhere, writes append | Creates new file | End for writes |

*Append `'b'` (e.g., `"rb"`, `"wb"`, `"ab+"`) to open streams in binary mode.*

### 5. Checking for Errors
**Critical Rule**: Always check if `fopen()` returns `NULL` before performing any operations!
```c
FILE *fp = fopen("data.txt", "r");
if (fp == NULL) {
    perror("Error opening file");
    return 1;
}
```

### 6. Closing Files: `fclose()`
```c
fclose(fp);
fp = NULL;
```
Closing a file stream flushes unwritten buffered data to the operating system disk cache, frees the internal buffer memory, and releases OS file handle descriptors. Failing to close files causes file locks and resource leaks.""",
            "visualDiagram": """C STANDARD FILE STREAM PIPELINE:

  +---------------+                  +------------------------+                  +---------------+
  | User Program  |  fputc / fputs   | Standard I/O Buffer    |   OS write()     | Physical Disk |
  |   (RAM)       | ---------------> |  (Buffered Stream)     | ---------------> | Storage Block |
  |               |                  |  Tracks cursor & state |   fflush/fclose  | (data.txt)    |
  +---------------+                  +------------------------+                  +---------------+
        ^                                        |
        |               fgetc / fgets            |
        +----------------------------------------+

FILE MODES SUMMARY:
  "r"  --> [Read-Only] (Must exist, cursor at 0)
  "w"  --> [Write-Only] (TRUNCATES existing file to 0 bytes!)
  "a"  --> [Append-Only] (Writes always appended to EOF)""",
            "syntax": """// Opening a file
FILE *fp = fopen(const char *filename, const char *mode);

// Error check
if (fp == NULL) { /* handle error */ }

// Closing a file
int status = fclose(FILE *fp);

// Character I/O
int ch = fgetc(fp);      // Returns EOF on end or error
int res = fputc(ch, fp); // Writes character""",
            "simpleExample": {
                "code": """#include <stdio.h>

int main(void) {
    FILE *fp = fopen("greeting.txt", "w");
    if (fp == NULL) {
        printf("Failed to create file!\\n");
        return 1;
    }

    fputs("Hello, Systems Programming in C!\\n", fp);
    fclose(fp);

    printf("File written and stream closed successfully.\\n");
    return 0;
}""",
                "explanation": "Opens `greeting.txt` in write mode, writes a string with `fputs()`, and closes the stream with `fclose()`."
            },
            "codeExample": """#include <stdio.h>
#include <stdlib.h>

void writeLogFile(const char *path) {
    FILE *fp = fopen(path, "w");
    if (fp == NULL) {
        perror("Error creating file");
        exit(EXIT_FAILURE);
    }
    fputs("SYS_LOG: System boots at 00:00\\n", fp);
    fputs("SYS_LOG: Kernel modules initialized\\n", fp);
    fputs("SYS_LOG: Network stack online\\n", fp);
    fclose(fp);
}

void readAndEchoLogFile(const char *path) {
    FILE *fp = fopen(path, "r");
    if (fp == NULL) {
        perror("Error reading file");
        exit(EXIT_FAILURE);
    }

    printf("=== Streaming File Contents ===\\n");
    int ch;
    // fgetc returns int to represent both all char values and EOF (-1)
    while ((ch = fgetc(fp)) != EOF) {
        putchar(ch);
    }

    fclose(fp);
}

int main(void) {
    const char *testFile = "test_system.log";
    writeLogFile(testFile);
    readAndEchoLogFile(testFile);
    return 0;
}""",
            "expectedOutput": """=== Streaming File Contents ===
SYS_LOG: System boots at 00:00
SYS_LOG: Kernel modules initialized
SYS_LOG: Network stack online""",
            "stepByStep": [
                "Line 4-13: `writeLogFile` opens `test_system.log` in write mode (`\"w\"`), checks for `NULL`, writes 3 lines, and closes stream.",
                "Line 15-22: `readAndEchoLogFile` opens the file in read mode (`\"r\"`), verifying the file pointer.",
                "Line 24: Declare `int ch;` (an `int`, NOT `char`, to correctly store `EOF` which is `-1`).",
                "Line 26-28: Loop reading character by character with `fgetc(fp)` until encountering `EOF`, echoing with `putchar`.",
                "Line 30: Close stream via `fclose(fp)` to release the file descriptor."
            ],
            "dryRun": "writeLogFile writes 3 lines. readAndEchoLogFile loops char-by-char through the buffer, printing until EOF is reached, then closes cleanly.",
            "keyTakeaways": [
                "Files are accessed in C via FILE* stream handles defined in <stdio.h>.",
                "Always check if fopen() returns NULL to avoid segmentation faults on missing files.",
                "Mode 'w' truncates existing files to 0 bytes; use 'a' to preserve existing content.",
                "Always store fgetc() results in an int (not char) to reliably detect EOF.",
                "fclose() flushes internal write buffers and releases OS resource handles."
            ],
            "commonMistakes": [
                {
                    "mistake": "Using char ch instead of int ch when reading with fgetc(): char ch = fgetc(fp);",
                    "whyWrong": "EOF is -1. If char is unsigned on the target platform, (unsigned char)255 will never match EOF, creating an infinite loop.",
                    "correction": "Always declare: int ch; while ((ch = fgetc(fp)) != EOF)",
                    "explanation": "fgetc() returns int specifically so it can return every valid unsigned char (0..255) plus negative EOF (-1)."
                },
                {
                    "mistake": "Opening a file in write mode (\"w\") expecting to append to existing data.",
                    "whyWrong": "Mode \"w\" instantly deletes/truncates all existing file contents to length 0.",
                    "correction": "Use mode \"a\" (append) or \"a+\" to add new data to the end of an existing file.",
                    "explanation": "Operating systems open \"w\" files with O_TRUNC flag."
                }
            ],
            "realWorldExample": {
                "scenario": "Server Error Audit Log Appender",
                "code": """#include <stdio.h>
#include <time.h>

void appendAuditLog(const char *msg) {
    FILE *fp = fopen("audit.log", "a");
    if (!fp) return;
    time_t now = time(NULL);
    fprintf(fp, "[%ld] AUDIT: %s\\n", (long)now, msg);
    fclose(fp);
}

int main(void) {
    appendAuditLog("Admin logged in from 192.168.1.10");
    printf("Audit event appended.\\n");
    return 0;
}""",
                "explanation": "Web servers (like Nginx/Apache) and database engines use append mode streams to append telemetry and transaction records without reading earlier history."
            },
            "practice": {
                "prompt": "Write a program that opens \"stats.txt\" in write mode, writes \"Total: 100\\n\", closes the file, then opens it in read mode and prints it to the console.",
                "starterCode": """#include <stdio.h>

int main(void) {
    // Write and read stats.txt
    return 0;
}""",
                "solution": """#include <stdio.h>

int main(void) {
    FILE *fp = fopen("stats.txt", "w");
    if (!fp) return 1;
    fputs("Total: 100\\n", fp);
    fclose(fp);

    fp = fopen("stats.txt", "r");
    if (!fp) return 1;
    char buffer[64];
    if (fgets(buffer, sizeof(buffer), fp)) {
        printf("%s", buffer);
    }
    fclose(fp);
    return 0;
}""",
                "hints": [
                    "Open first with fopen(\"stats.txt\", \"w\")",
                    "fputs(\"Total: 100\\n\", fp); fclose(fp);",
                    "Reopen with \"r\" and use fgets(buffer, sizeof(buffer), fp)"
                ]
            },
            "quiz": [
                {
                    "id": "q-c-adv-file-1",
                    "question": "What does fopen() return when the requested file cannot be opened?",
                    "options": ["-1", "0", "NULL", "EOF"],
                    "correctIndex": 2,
                    "explanation": "fopen() returns a NULL pointer on failure, signaling an invalid stream."
                },
                {
                    "id": "q-c-adv-file-2",
                    "question": "What happens if you open an existing file in \"w\" mode?",
                    "options": [
                        "The file is opened for reading and writing",
                        "New writes are placed at the end",
                        "The existing file is immediately truncated to 0 bytes",
                        "fopen returns NULL because the file already exists"
                    ],
                    "correctIndex": 2,
                    "explanation": "Write mode (\"w\") creates a file if it does not exist, or truncates it to 0 bytes if it already exists."
                },
                {
                    "id": "q-c-adv-file-3",
                    "question": "Why must the variable holding fgetc()'s return value be declared as int instead of char?",
                    "options": [
                        "To conserve CPU memory",
                        "To distinguish all valid byte values (0..255) from the negative EOF sentinel (-1)",
                        "char variables cannot be compared with while loops in C",
                        "fgetc() reads 4 bytes at a time"
                    ],
                    "correctIndex": 1,
                    "explanation": "fgetc returns an int to accommodate both 256 distinct unsigned char values and EOF (-1) without collision."
                },
                {
                    "id": "q-c-adv-file-4",
                    "question": "What is the primary danger of forgetting to call fclose() on an output stream?",
                    "options": [
                        "The compiler will fail on next compile",
                        "Buffered data in RAM may not be flushed to disk, causing data loss",
                        "The file will automatically be converted to a binary file",
                        "The program will crash immediately upon return"
                    ],
                    "correctIndex": 1,
                    "explanation": "fclose() flushes the userspace stream buffer to disk; failing to close can leave data unwritten."
                }
            ],
            "codingChallenge": {
                "title": "Text File Line and Character Counter",
                "difficulty": "Easy",
                "problem_statement": "Write a C program that writes the following three lines to a file named `sample.txt`:\n\"Alpha\\nBeta\\nGamma\\n\"\nClose the file.\nThen, reopen `sample.txt` in read mode and count:\n1. Total characters read (including newlines).\n2. Total newline characters (`'\\n'`).\nClose the file and print:\n`Total Characters: 17 | Total Lines: 3`",
                "input_format": "None.",
                "output_format": "Exact string: Total Characters: 17 | Total Lines: 3",
                "constraints": "Must open, write, close, reopen, read with fgetc, and close.",
                "starter_code": """#include <stdio.h>

int main(void) {
    // Write sample.txt, then read and count characters & lines
    return 0;
}""",
                "expected_output": "Total Characters: 17 | Total Lines: 3",
                "test_cases": [
                    {
                        "input": "",
                        "expected_output": "Total Characters: 17 | Total Lines: 3",
                        "is_hidden": false
                    }
                ]
            },
            "summary": [
                "Files in C are accessed as streams through FILE* handles.",
                "Modes 'r', 'w', 'a', and '+' variants control read, truncate, and append behaviors.",
                "Always check for NULL pointers after calling fopen().",
                "Use int when storing fgetc() to properly catch EOF.",
                "fclose() flushes cached write buffers and releases OS file descriptors."
            ],
            "content_standard": "Comprehensive lesson on C file handling, file pointers, stream modes, error handling, and closing streams safely.",
            "content_detailed": "Low-level OS syscalls (open/read/write), standard C library buffering mechanics (setvbuf), and file descriptor lifecycle.",
            "content_simplified": "fopen opens a communication channel to a file, like making a phone call, and fclose hangs up so other programs can talk."
        },
        {
            "id": "top-c-file-operations",
            "number": 6,
            "numberDisplay": "06",
            "moduleId": "mod-c-adv-files",
            "moduleTitle": "Module 2: File Handling and Preprocessor",
            "title": "File Operations and Random Access",
            "slug": "file-operations-and-random-access",
            "language": "c",
            "difficulty": "Advanced",
            "estimatedMinutes": 55,
            "prerequisiteId": "top-c-file-fundamentals",
            "shortDescription": "Master formatted file I/O (fprintf, fscanf), binary block I/O (fread, fwrite), random access (fseek, ftell, rewind), and error detection with feof and ferror.",
            "learningObjectives": [
                "Perform formatted file reading and writing using fprintf() and fscanf().",
                "Read and write buffer-safe text lines using fgets() and fputs().",
                "Execute binary block operations with fread() and fwrite().",
                "Reposition stream file pointers using fseek() with SEEK_SET, SEEK_CUR, and SEEK_END.",
                "Measure current file offsets using ftell() and reset to beginning with rewind().",
                "Distinguish between EOF and stream read/write errors using feof() and ferror()."
            ],
            "conceptExplanation": """### 1. Formatted File I/O: `fprintf()` and `fscanf()`
Just like `printf` and `scanf` operate on standard console streams, `fprintf` and `fscanf` operate on arbitrary `FILE *` streams:
```c
fprintf(fp, "ID: %d, Score: %.2f\\n", studentId, score);
int count = fscanf(fp, "%d %f", &studentId, &score);
```
`fscanf()` returns the number of fields successfully converted and assigned, or `EOF` if input ends before conversion.

### 2. Line-Oriented Text I/O: `fgets()` vs Unsafe `gets()`
Never use `gets()` in C (it was officially removed in C11 due to buffer overflow vulnerabilities). Always use `fgets()`:
```c
char line[256];
while (fgets(line, sizeof(line), fp) != NULL) {
    printf("Read line: %s", line);
}
```
`fgets` guarantees it will never write more than `sizeof(line) - 1` bytes and guarantees null-termination.

### 3. Binary File Operations: `fwrite()` and `fread()`
Binary operations bypass string conversions, dumping raw memory structures directly to disk:
```c
size_t fwrite(const void *ptr, size_t size, size_t count, FILE *stream);
size_t fread(void *ptr, size_t size, size_t count, FILE *stream);
```
Example:
```c
struct Record r = {101, "Alice", 95.5f};
fwrite(&r, sizeof(struct Record), 1, fp); // Writes exact binary image of struct
fread(&r, sizeof(struct Record), 1, fp);  // Reads exact binary image back
```

### 4. Random Access: `fseek()`, `ftell()`, and `rewind()`
By default, files are read sequentially. **Random access** allows jumping to any byte position in O(1) time without reading intermediate data.

- `fseek(fp, offset, whence)`: Moves the stream cursor.
  - `SEEK_SET`: Offset is relative to the **beginning** of the file.
  - `SEEK_CUR`: Offset is relative to the **current** cursor position.
  - `SEEK_END`: Offset is relative to the **end** of the file.
- `ftell(fp)`: Returns the current cursor position in bytes from the start of the file.
- `rewind(fp)`: Resets cursor to the beginning (equivalent to `fseek(fp, 0L, SEEK_SET)`).

```c
// Seek directly to record #5 in a binary file:
fseek(fp, 4 * sizeof(struct Record), SEEK_SET);
fread(&record, sizeof(struct Record), 1, fp);
```

### 5. Error & EOF Detection: `feof()` vs `ferror()`
When a read function like `fread` or `fgetc` returns fewer items than requested, you must check why:
- `feof(fp)`: Returns non-zero if the stream reached **End of File**.
- `ferror(fp)`: Returns non-zero if a **hardware/filesystem I/O error** occurred.
- `clearerr(fp)`: Clears error and EOF indicators for the stream.""",
            "visualDiagram": """RANDOM ACCESS POINTER POSITIONING:

  File Byte Stream: [ Byte 0 | Byte 1 | Byte 2 | ... | Byte N ]
                      ^                        ^          ^
                      |                        |          |
                   SEEK_SET                 SEEK_CUR   SEEK_END
                  (Offset 0)               (Current)  (Last byte)

SEEKING RECORD #2 DIRECTLY:
  fseek(fp, 2 * sizeof(Record), SEEK_SET);

  [ Record 0 ] [ Record 1 ] [ Record 2 ] [ Record 3 ]
  |                       | ^
  0                       | Jumps directly here!
                          +---- No sequential scan needed!""",
            "syntax": """// Formatted I/O
int fprintf(FILE *fp, const char *format, ...);
int fscanf(FILE *fp, const char *format, ...);

// Binary block I/O
size_t fwrite(const void *ptr, size_t size, size_t nmemb, FILE *stream);
size_t fread(void *ptr, size_t size, size_t nmemb, FILE *stream);

// Random access navigation
int fseek(FILE *stream, long offset, int whence);
long ftell(FILE *stream);
void rewind(FILE *stream);

// Status checks
int feof(FILE *stream);
int ferror(FILE *stream);""",
            "simpleExample": {
                "code": """#include <stdio.h>

int main(void) {
    FILE *fp = fopen("numbers.dat", "wb+");
    if (!fp) return 1;

    int values[3] = {10, 20, 30};
    fwrite(values, sizeof(int), 3, fp);

    // Seek back to second integer (index 1)
    fseek(fp, 1 * sizeof(int), SEEK_SET);
    int readVal = 0;
    fread(&readVal, sizeof(int), 1, fp);

    printf("Second value read directly via fseek: %d\\n", readVal);
    fclose(fp);
    return 0;
}""",
                "explanation": "Writes 3 integers in binary mode, seeks directly to index 1 using `fseek()`, and reads back `20`."
            },
            "codeExample": """#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct Account {
    int id;
    char owner[32];
    double balance;
};

int main(void) {
    const char *dbPath = "accounts.bin";
    FILE *fp = fopen(dbPath, "wb+");
    if (!fp) {
        perror("Failed to create accounts DB");
        return 1;
    }

    struct Account initialAccounts[3] = {
        {101, "Alice Morgan", 4500.50},
        {102, "Bob Taylor",   2100.00},
        {103, "Clara Vance",  8900.75}
    };

    // Write all 3 accounts in a single binary block
    fwrite(initialAccounts, sizeof(struct Account), 3, fp);

    // Calculate total size using fseek & ftell
    fseek(fp, 0L, SEEK_END);
    long totalBytes = ftell(fp);
    printf("Total DB size: %ld bytes (expected: %zu)\\n", totalBytes, 3 * sizeof(struct Account));

    // Jump directly to Record #2 (Bob Taylor, index 1)
    fseek(fp, 1 * sizeof(struct Account), SEEK_SET);
    struct Account bob;
    fread(&bob, sizeof(struct Account), 1, fp);
    printf("Before Update: ID %d | %s | $%.2f\\n", bob.id, bob.owner, bob.balance);

    // Update Bob's balance
    bob.balance += 500.00;
    // Seek back to Bob's position to overwrite
    fseek(fp, 1 * sizeof(struct Account), SEEK_SET);
    fwrite(&bob, sizeof(struct Account), 1, fp);

    // Re-read Bob to verify update
    fseek(fp, 1 * sizeof(struct Account), SEEK_SET);
    struct Account updatedBob;
    fread(&updatedBob, sizeof(struct Account), 1, fp);
    printf("After Update:  ID %d | %s | $%.2f\\n", updatedBob.id, updatedBob.owner, updatedBob.balance);

    fclose(fp);
    return 0;
}""",
            "expectedOutput": """Total DB size: 144 bytes (expected: 144)
Before Update: ID 102 | Bob Taylor | $2100.00
After Update:  ID 102 | Bob Taylor | $2600.00""",
            "stepByStep": [
                "Line 5-9: Define `struct Account` with fixed-size types suitable for binary storage.",
                "Line 13: Open `accounts.bin` with `\"wb+\"` (read/write update in binary mode).",
                "Line 22: `fwrite(initialAccounts, sizeof(struct Account), 3, fp)` writes all 3 structs at once.",
                "Line 25-27: Seek to `SEEK_END` and query `ftell()` to measure total database file length.",
                "Line 30-33: `fseek` directly to offset `1 * sizeof(struct Account)` and read Record #2.",
                "Line 36-40: Mutate `bob.balance` and seek back to the same offset to overwrite record #2 in-place.",
                "Line 43-46: Verify in-place persistence by reading the updated record back."
            ],
            "dryRun": "3 accounts written (144 bytes). Seek to index 1 reads Bob ($2100.00). Balance changed to $2600.00, overwritten in place. Verification reads back $2600.00.",
            "keyTakeaways": [
                "fread() and fwrite() transfer raw binary memory directly between RAM and disk.",
                "fseek() allows O(1) random jumping to any byte offset using SEEK_SET, SEEK_CUR, or SEEK_END.",
                "ftell() returns the current cursor byte position, useful for file size calculations.",
                "Binary files require exact struct size and alignment agreement between reading and writing programs.",
                "Use feof() and ferror() to distinguish clean EOF from hardware read errors."
            ],
            "commonMistakes": [
                {
                    "mistake": "Writing structures containing pointers (like char *name) directly with fwrite().",
                    "whyWrong": "Pointers store RAM addresses; saving a pointer writes a transient memory address that becomes completely invalid once the program exits.",
                    "correction": "Use fixed-size character arrays inside structs (e.g. char name[32]) for binary file storage.",
                    "explanation": "Pointers cannot be persisted across program executions."
                },
                {
                    "mistake": "Using while (!feof(fp)) as the loop condition to read files.",
                    "whyWrong": "feof() only returns true AFTER a read operation has already attempted to read past the end and failed.",
                    "correction": "Check the return value of the read call: while (fread(&data, sizeof(data), 1, fp) == 1)",
                    "explanation": "Testing feof() before reading causes the loop to process the last item twice."
                }
            ],
            "realWorldExample": {
                "scenario": "Database Engine Page Cache Indexer",
                "code": """#include <stdio.h>

#define PAGE_SIZE 4096

void readDatabasePage(FILE *dbFile, int pageNumber, char *buffer) {
    long offset = (long)pageNumber * PAGE_SIZE;
    fseek(dbFile, offset, SEEK_SET);
    fread(buffer, PAGE_SIZE, 1, dbFile);
}

int main(void) {
    printf("DB Page Size: %d bytes\\n", PAGE_SIZE);
    return 0;
}""",
                "explanation": "Relational database engines like SQLite and PostgreSQL divide database storage files into 4096-byte pages and use `fseek` to jump directly to B-tree index nodes."
            },
            "practice": {
                "prompt": "Create a binary file with 4 integers (100, 200, 300, 400). Use fseek to jump to the last integer (index 3) and print it.",
                "starterCode": """#include <stdio.h>

int main(void) {
    // Write 4 ints, seek to 4th, print it
    return 0;
}""",
                "solution": """#include <stdio.h>

int main(void) {
    FILE *fp = fopen("arr.bin", "wb+");
    if (!fp) return 1;
    int data[4] = {100, 200, 300, 400};
    fwrite(data, sizeof(int), 4, fp);

    fseek(fp, 3 * sizeof(int), SEEK_SET);
    int lastVal = 0;
    fread(&lastVal, sizeof(int), 1, fp);
    printf("Last element: %d\\n", lastVal);
    fclose(fp);
    return 0;
}""",
                "hints": [
                    "fwrite(data, sizeof(int), 4, fp);",
                    "fseek(fp, 3 * sizeof(int), SEEK_SET);",
                    "fread(&lastVal, sizeof(int), 1, fp);"
                ]
            },
            "quiz": [
                {
                    "id": "q-c-adv-fileops-1",
                    "question": "What is the return value of fread() and fwrite()?",
                    "options": [
                        "The total number of bytes read or written",
                        "The total number of complete elements/items successfully read or written",
                        "0 on success and -1 on error",
                        "A pointer to the stream buffer"
                    ],
                    "correctIndex": 1,
                    "explanation": "fread and fwrite return the count of successfully transferred items (not bytes)."
                },
                {
                    "id": "q-c-adv-fileops-2",
                    "question": "Which constant is passed to fseek() to calculate an offset relative to the end of the file?",
                    "options": ["SEEK_TOP", "SEEK_START", "SEEK_END", "SEEK_CUR"],
                    "correctIndex": 2,
                    "explanation": "SEEK_END tells fseek to position the cursor relative to the end of the file."
                },
                {
                    "id": "q-c-adv-fileops-3",
                    "question": "How do you calculate the total byte size of an open file fp without reading all its data?",
                    "options": [
                        "sizeof(fp)",
                        "fseek(fp, 0, SEEK_END); long size = ftell(fp);",
                        "feof(fp)",
                        "ferror(fp)"
                    ],
                    "correctIndex": 1,
                    "explanation": "Seeking to SEEK_END and calling ftell() reports the total byte offset from the beginning."
                },
                {
                    "id": "q-c-adv-fileops-4",
                    "question": "Why should you never write a struct containing pointers (e.g. struct { char *str; }) directly with fwrite()?",
                    "options": [
                        "Compilers reject the code with a syntax error",
                        "The pointer address is temporary to the running process and points to garbage when reloaded later",
                        "fwrite only accepts primitive integers",
                        "Pointers increase file fragmentation"
                    ],
                    "correctIndex": 1,
                    "explanation": "Pointer values represent dynamic memory addresses in process address space, which become completely invalid in future runs."
                }
            ],
            "codingChallenge": {
                "title": "Binary Record Manager and In-Place Modifier",
                "difficulty": "Medium",
                "problem_statement": "Define a structure `Student`:\n- `id` (int)\n- `score` (int)\n\nIn `main()`:\n1. Open `students.bin` in `wb+` mode.\n2. Write two records:\n   - Student 1: id = 1, score = 70\n   - Student 2: id = 2, score = 85\n3. Use `fseek` to update Student 1's score to 95.\n4. Read both records sequentially and print:\n`ID: 1, Score: 95 | ID: 2, Score: 85`\n5. Close the file.",
                "input_format": "None.",
                "output_format": "ID: 1, Score: 95 | ID: 2, Score: 85",
                "constraints": "Must use fwrite, fseek, and fread in binary mode.",
                "starter_code": """#include <stdio.h>

// Define struct Student and implement test

int main(void) {
    return 0;
}""",
                "expected_output": "ID: 1, Score: 95 | ID: 2, Score: 85",
                "test_cases": [
                    {
                        "input": "",
                        "expected_output": "ID: 1, Score: 95 | ID: 2, Score: 85",
                        "is_hidden": false
                    }
                ]
            },
            "summary": [
                "fprintf and fscanf provide formatted string stream conversions.",
                "fread and fwrite perform high-speed binary block transfers directly from memory.",
                "fseek and ftell grant instantaneous O(1) random access to any byte offset.",
                "feof and ferror allow precise diagnosis between End-of-File and hardware I/O faults.",
                "Binary file formats must use fixed-size data structures without raw pointer members."
            ],
            "content_standard": "Mastery of binary file streams, random file cursor seeking, formatted streams, and error diagnostics in C.",
            "content_detailed": "Block-level filesystem alignment, seek performance, buffer flushing with fflush, and binary serialization caveats.",
            "content_simplified": "fseek is like skipping straight to track 5 on a music player without having to listen to tracks 1 through 4."
        },
        {
            "id": "top-c-preprocessor",
            "number": 7,
            "numberDisplay": "07",
            "moduleId": "mod-c-adv-files",
            "moduleTitle": "Module 2: File Handling and Preprocessor",
            "title": "Preprocessor Directives and Header Files",
            "slug": "preprocessor-directives-and-header-files",
            "language": "c",
            "difficulty": "Advanced",
            "estimatedMinutes": 50,
            "prerequisiteId": "top-c-file-operations",
            "shortDescription": "Master the C preprocessor pipeline, macro definitions, parameter hazards, conditional compilation, custom header files, header guards, and modular compilation.",
            "learningObjectives": [
                "Understand the preprocessor translation phase preceding C compilation.",
                "Define object-like and function-like macros with #define.",
                "Avoid critical macro expansion operator precedence pitfalls using comprehensive parenthesization.",
                "Apply conditional compilation directives (#ifdef, #ifndef, #if, #else, #endif) for portable builds.",
                "Design modular header files (.h) with include guards and #pragma once.",
                "Understand the multi-file compilation workflow: source files, object files (.o), and linking."
            ],
            "conceptExplanation": """### 1. Introduction to the C Preprocessor
The **C Preprocessor** is a text-substitution tool that runs before actual syntax parsing and code compilation. Directives begin with `#` and do NOT end with semicolons.

The preprocessor performs three main tasks:
1. **File Inclusion (`#include`)**: Injects the full text of header files into the current translation unit.
2. **Macro Expansion (`#define`)**: Replaces macro identifiers with replacement tokens.
3. **Conditional Compilation (`#if`, `#ifdef`)**: Compiles or discards blocks of code based on compile-time conditions.

### 2. `#include` Directives
- `#include <stdio.h>`: Searches **standard system directories** (compiler runtime headers).
- `#include "my_header.h"`: Searches the **current working directory** first, then falls back to system paths.

### 3. Object-Like vs Function-Like Macros
- **Object-like Macro**: Replaces a symbolic constant across code:
```c
#define MAX_BUFFER_SIZE 1024
#define PI 3.141592653589793
```
- **Function-like Macro**: Looks like a function call but expands inline textually without function call stack overhead:
```c
#define SQUARE(x) ((x) * (x))
```

### 4. Critical Macro Operator Precedence Pitfalls
Without strict parenthesization, macros lead to catastrophic bugs:
```c
// DANGEROUS:
#define BAD_SQUARE(x) x * x
int res = BAD_SQUARE(2 + 3); // Expands to: 2 + 3 * 2 + 3 = 2 + 6 + 3 = 11! NOT 25!

// SAFE:
#define SAFE_SQUARE(x) ((x) * (x))
int res = SAFE_SQUARE(2 + 3); // Expands to: ((2 + 3) * (2 + 3)) = 25
```
**Side Effect Hazard**: `SAFE_SQUARE(i++)` expands to `((i++) * (i++))` which increments `i` twice!

### 5. Conditional Compilation
Directives allow compiling different code for different platforms or debug modes:
```c
#ifdef DEBUG
    printf("Debug: variable x = %d\\n", x);
#endif

#if defined(_WIN32)
    #define PLATFORM_NAME "Windows"
#elif defined(__linux__)
    #define PLATFORM_NAME "Linux"
#else
    #define PLATFORM_NAME "Unknown"
#endif
```

### 6. Header Guards & Modular Architecture
When multiple files include the same header (or nested includes occur), types and structs would be defined multiple times, causing compiler redefinition errors.
**Header Guards** prevent double-inclusion:
```c
// my_module.h
#ifndef MY_MODULE_H
#define MY_MODULE_H

// Declarations, prototypes, and constants go here
void processData(int value);

#endif // MY_MODULE_H
```
Modern compilers also support `#pragma once` as a non-standard but universally supported single-line alternative.""",
            "visualDiagram": """C COMPILATION WORKFLOW:

  +-------------+       +---------------+
  | my_math.h   | ----> |  main.c       |
  +-------------+       +---------------+
                               |
                               v
                     [ 1. Preprocessor ]  (#include expanded, macros replaced)
                               |
                               v (Expanded Source: main.i)
                     [ 2. C Compiler   ]  (Generates assembly instructions)
                               |
                               v (Assembly: main.s)
                     [ 3. Assembler    ]  (Generates binary machine code)
                               |
                               v (Object File: main.o)
                     [ 4. Linker       ] <--- libc.a / other .o files
                               |
                               v
                    [ Executable: app.exe ]""",
            "syntax": """// Macro definitions
#define IDENTIFIER value
#define MACRO_FN(param) ((param) * 2)

// Stringification & Concatenation operators
#define STRINGIFY(x) #x
#define CONCAT(a, b) a ## b

// Conditional compilation
#ifndef HEADER_H
#define HEADER_H
// Header contents
#endif""",
            "simpleExample": {
                "code": """#include <stdio.h>

#define MAX(a, b) (((a) > (b)) ? (a) : (b))

int main(void) {
    int x = 45;
    int y = 90;
    printf("Max of %d and %d is: %d\\n", x, y, MAX(x, y));
    return 0;
}""",
                "explanation": "Expands `MAX(x, y)` textually to `(((x) > (y)) ? (x) : (y))` without any function call overhead."
            },
            "codeExample": """#include <stdio.h>

// Feature flag for conditional compilation
#define LOG_LEVEL_DEBUG 1

#if LOG_LEVEL_DEBUG
    #define LOG_DEBUG(msg) printf("[DEBUG] %s (Line: %d)\\n", msg, __LINE__)
#else
    #define LOG_DEBUG(msg) do {} while(0)
#endif

// Safe parameterized macro with full parenthesization
#define CLAMP(val, minVal, maxVal) (((val) < (minVal)) ? (minVal) : (((val) > (maxVal)) ? (maxVal) : (val)))

// Stringification (#) and Token-pasting (##)
#define PRINT_INT_VAR(var) printf(#var " = %d\\n", var)

int main(void) {
    LOG_DEBUG("Starting telemetry module");

    int rawSensor = 125;
    int safeSensor = CLAMP(rawSensor, 0, 100);

    PRINT_INT_VAR(rawSensor);
    PRINT_INT_VAR(safeSensor);

    printf("Compiled on: %s %s\\n", __DATE__, __TIME__);
    return 0;
}""",
            "expectedOutput": """[DEBUG] Starting telemetry module (Line: 18)
rawSensor = 125
safeSensor = 100""",
            "stepByStep": [
                "Line 4: Define `LOG_LEVEL_DEBUG` macro switch.",
                "Line 6-10: Conditionally define `LOG_DEBUG` using standard predefined macro `__LINE__`.",
                "Line 13: `CLAMP` macro safely parenthesizes all parameters and sub-expressions.",
                "Line 16: `PRINT_INT_VAR` uses `#var` (stringification operator) to convert variable names to string literals.",
                "Line 18: `LOG_DEBUG` logs source line number.",
                "Line 21: `CLAMP(125, 0, 100)` clamps the sensor value to maximum threshold `100`."
            ],
            "dryRun": "LOG_DEBUG prints line 18. rawSensor (125) clamped to (0, 100) becomes 100. PRINT_INT_VAR prints 'rawSensor = 125' and 'safeSensor = 100'.",
            "keyTakeaways": [
                "The preprocessor runs before compilation, performing textual substitution.",
                "Always wrap macro parameters and the entire macro expression in parentheses.",
                "Macros with side-effects (like ++ or --) evaluate parameters multiple times.",
                "Header guards (#ifndef / #define / #endif) prevent redefinition compiler errors.",
                "Conditional directives (#ifdef) enable cross-platform and debug-specific builds."
            ],
            "commonMistakes": [
                {
                    "mistake": "Adding a semicolon at the end of a #define: #define SIZE 100;",
                    "whyWrong": "The semicolon is included in the replacement text: int arr[SIZE]; becomes int arr[100;]; causing a syntax error.",
                    "correction": "Never end preprocessor directives with semicolons: #define SIZE 100",
                    "explanation": "Preprocessor directives are terminated by newlines, not semicolons."
                },
                {
                    "mistake": "Omitting parentheses around macro arguments: #define MULT(a, b) a * b",
                    "whyWrong": "MULT(1 + 2, 3 + 4) expands to 1 + 2 * 3 + 4 = 11 instead of (1 + 2) * (3 + 4) = 21.",
                    "correction": "Always write: #define MULT(a, b) ((a) * (b))",
                    "explanation": "Operator precedence rules bind multiplication (*) before addition (+)."
                }
            ],
            "realWorldExample": {
                "scenario": "Cross-Platform High-Resolution Monotonic Clock",
                "code": """#include <stdio.h>

#if defined(_WIN32)
    #define OS_NAME "Windows NT"
#elif defined(__APPLE__)
    #define OS_NAME "macOS Darwin"
#elif defined(__linux__)
    #define OS_NAME "GNU/Linux"
#else
    #define OS_NAME "Generic POSIX"
#endif

int main(void) {
    printf("Target Architecture OS: %s\\n", OS_NAME);
    return 0;
}""",
                "explanation": "Cross-platform libraries like SDL, OpenGL, and libuv use conditional preprocessor blocks to invoke platform-specific OS APIs."
            },
            "practice": {
                "prompt": "Write a safe function-like macro `CUBE(x)` that calculates `x * x * x` with full parenthesization. Test with `2 + 1`.",
                "starterCode": """#include <stdio.h>

// Define CUBE(x)

int main(void) {
    // Test CUBE(2 + 1)
    return 0;
}""",
                "solution": """#include <stdio.h>

#define CUBE(x) ((x) * (x) * (x))

int main(void) {
    int res = CUBE(2 + 1);
    printf("Result: %d\\n", res);
    return 0;
}""",
                "hints": [
                    "Use ((x) * (x) * (x))",
                    "Make sure (2 + 1) is evaluated as 3 before multiplying."
                ]
            },
            "quiz": [
                {
                    "id": "q-c-adv-prep-1",
                    "question": "What is the primary function of header guards (#ifndef MY_HEADER_H ... #endif)?",
                    "options": [
                        "To encrypt header code against reverse engineering",
                        "To prevent duplicate inclusion of the same header in a translation unit",
                        "To automatically allocate global variables",
                        "To link external libraries during assembly"
                    ],
                    "correctIndex": 1,
                    "explanation": "Header guards ensure that the contents of a header file are only processed once per translation unit, preventing redefinition errors."
                },
                {
                    "id": "q-c-adv-prep-2",
                    "question": "If #define DOUBLE(x) x + x is called with DOUBLE(5) * 2, what does it evaluate to?",
                    "options": ["20", "15", "10", "25"],
                    "correctIndex": 1,
                    "explanation": "DOUBLE(5) * 2 expands textually to 5 + 5 * 2. Multiplication binds first: 5 * 2 = 10, then 5 + 10 = 15! Parentheses were needed."
                },
                {
                    "id": "q-c-adv-prep-3",
                    "question": "What does the preprocessor stringification operator (#) do?",
                    "options": [
                        "Converts a macro argument into a quoted string literal",
                        "Concatenates two preprocessor tokens together",
                        "Calculates string length at runtime",
                        "Allocates string memory on the heap"
                    ],
                    "correctIndex": 0,
                    "explanation": "The # operator converts the following macro argument into a string literal (e.g. #x -> \"x\")."
                },
                {
                    "id": "q-c-adv-prep-4",
                    "question": "Which predefined macro provides the current line number in the source file?",
                    "options": ["__FILE__", "__DATE__", "__LINE__", "__TIME__"],
                    "correctIndex": 2,
                    "explanation": "__LINE__ expands to an integer constant representing the current line number in the source file."
                }
            ],
            "codingChallenge": {
                "title": "Robust Safe Math and Min-Max Macro Suite",
                "difficulty": "Easy",
                "problem_statement": "Define two fully parenthesized function-like macros:\n1. `MIN(a, b)`: returns the smaller of two values.\n2. `MAX(a, b)`: returns the larger of two values.\n\nIn `main()`:\nCompute:\n- `minVal = MIN(10 + 5, 20 - 8)`\n- `maxVal = MAX(4 * 3, 2 * 7)`\n\nPrint the output in exact format:\n`Min: 12 | Max: 14`",
                "input_format": "None.",
                "output_format": "Min: 12 | Max: 14",
                "constraints": "Must be macros using ternary operator with complete parenthesization.",
                "starter_code": """#include <stdio.h>

// Define MIN and MAX macros

int main(void) {
    // Implement verification
    return 0;
}""",
                "expected_output": "Min: 12 | Max: 14",
                "test_cases": [
                    {
                        "input": "",
                        "expected_output": "Min: 12 | Max: 14",
                        "is_hidden": false
                    }
                ]
            },
            "summary": [
                "The preprocessor performs source code textual replacement before compilation.",
                "Function-like macros require complete parenthesization around arguments and expressions.",
                "Conditional compilation (#ifdef, #if) enables portable multi-OS codebases.",
                "Header guards (#ifndef / #define) prevent fatal duplicate symbol definitions.",
                "The # and ## operators allow stringification and token pasting."
            ],
            "content_standard": "Comprehensive deep dive into the C preprocessor, macro expansion, header guards, and modular multi-file builds.",
            "content_detailed": "Macro expansion tracing, recursive macro prevention, translation units, and token concatenation mechanics.",
            "content_simplified": "The preprocessor is like a smart find-and-replace tool that prepares your code before the compiler reads it."
        }
    ]
