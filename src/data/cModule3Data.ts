import { CTopic } from './cFundamentalsData';

export const C_MODULE_3_TOPICS: CTopic[] = [
  // =========================================================================
  // TOPIC 09: Arrays & Multidimensional Arrays
  // =========================================================================
  {
    id: 'top-c-arrays',
    number: 9,
    numberDisplay: '09',
    moduleId: 'mod-c-memory',
    moduleTitle: 'Module 03: Data Structures & Memory Mastery',
    title: 'Arrays & Multidimensional Arrays',
    slug: 'arrays-and-multidimensional-arrays',
    language: 'c',
    shortDescription: 'Master contiguous memory sequencing in C. Understand 1D and 2D arrays, matrix arithmetic, zero-based indexing arithmetic (base + i * size), passing arrays to functions, and lack of bounds checking.',
    difficulty: 'Intermediate',
    estimatedMinutes: 35,
    prerequisiteId: 'top-c-recursion',
    learningObjectives: [
      'Declare, initialize, and traverse one-dimensional and two-dimensional arrays',
      'Explain contiguous memory layouts and address calculation: Address(arr[i]) = base + i * sizeof(type)',
      'Pass arrays into functions correctly using pointer decay and explicit size parameters',
      'Recognize the danger of out-of-bounds array access and buffer overflow vulnerabilities'
    ],
    conceptExplanation: `### What is an Array in C?
An array is a fixed-size, homogeneous collection of elements stored in **contiguous (unbroken) memory locations**. 

### Memory Layout and Indexing Arithmetic
Because elements sit adjacent to one another in physical RAM, accessing any element \`arr[i]\` is an O(1) constant-time direct pointer arithmetic offset:
\`\`\`c
Address(arr[i]) = Base_Address + (i * sizeof(element_type))
\`\`\`
For an \`int arr[5]\` where \`int\` is 4 bytes and base address is \`0x1000\`:
- \`arr[0]\`: \`0x1000\`
- \`arr[1]\`: \`0x1004\`
- \`arr[2]\`: \`0x1008\`
- \`arr[3]\`: \`0x100C\`
- \`arr[4]\`: \`0x1010\`

### No Bounds Checking in C
C compilers **do not check array boundaries at compile time or runtime**. If you declare \`int arr[5]\` and access \`arr[10]\`, C reads whatever raw bytes happen to reside in memory at \`base + 10 * 4\`. Writing to \`arr[10]\` overwrites adjacent memory on the stack (buffer overflow), potentially corrupting other variables or crash handlers.

### Multidimensional Arrays (2D Matrices)
A 2D array is an array of arrays. In C, multidimensional arrays are laid out in **Row-Major Order** (row 0 in contiguous memory, immediately followed by row 1, etc.):
\`\`\`c
int matrix[2][3] = {
    {1, 2, 3}, // Row 0
    {4, 5, 6}  // Row 1
};
// Memory layout: [1, 2, 3, 4, 5, 6]
\`\`\`

### Passing Arrays to Functions
When you pass an array to a function, C automatically **decays** the array name into a pointer to its first element (\`&arr[0]\`). Because the function receives only a pointer without size information, you **must always pass the array length as a separate argument**:
\`\`\`c
void print_array(const int arr[], int size);
\`\`\``,
    simpleExample: {
      code: `#include <stdio.h>

int main(void) {
    int scores[4] = {85, 92, 78, 90};
    for (int i = 0; i < 4; i++) {
        printf("Score[%d] = %d\\n", i, scores[i]);
    }
    return 0;
}`,
      explanation: 'Declares an array of 4 integers on the stack and iterates through elements using zero-based index indexing.'
    },
    syntax: `// 1D Array Declaration and Initialization
int numbers[5] = {10, 20, 30, 40, 50};
int uninit[10]; // Contains garbage memory until assigned!
int zeroes[5] = {0}; // All 5 initialized to 0

// 2D Array (Matrix)
int grid[2][3] = {
    {1, 2, 3},
    {4, 5, 6}
};

// Function signature receiving array
void process(int arr[], int length);`,
    codeExample: `#include <stdio.h>

void print_vector(const int arr[], int length) {
    printf("[ ");
    for (int i = 0; i < length; i++) {
        printf("%d ", arr[i]);
    }
    printf("]\\n");
}

int main(void) {
    // 1. One-dimensional array analysis
    int numbers[] = {14, 82, 35, 91, 48, 63};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    
    printf("Array elements: ");
    print_vector(numbers, n);
    
    int max = numbers[0], min = numbers[0], sum = 0;
    for (int i = 0; i < n; i++) {
        if (numbers[i] > max) max = numbers[i];
        if (numbers[i] < min) min = numbers[i];
        sum += numbers[i];
    }
    double average = (double)sum / n;
    
    printf("Max: %d | Min: %d | Avg: %.2f\\n", max, min, average);
    
    // 2. Multidimensional Matrix Addition
    printf("\\n--- Matrix Addition (2x3) ---\\n");
    int A[2][3] = {{1, 2, 3}, {4, 5, 6}};
    int B[2][3] = {{7, 8, 9}, {1, 2, 3}};
    int C[2][3];
    
    for (int r = 0; r < 2; r++) {
        for (int c = 0; c < 3; c++) {
            C[r][c] = A[r][c] + B[r][c];
            printf("%3d ", C[r][c]);
        }
        printf("\\n");
    }
    
    return 0;
}`,
    expectedOutput: `Array elements: [ 14 82 35 91 48 63 ]
Max: 91 | Min: 14 | Avg: 55.50

--- Matrix Addition (2x3) ---
  8  10  12 
  5   7   9 `,
    stepByStep: [
      '1. sizeof(numbers) / sizeof(numbers[0]) calculates length: 24 bytes / 4 bytes = 6 elements.',
      '2. Array elements are mapped into continuous stack memory offsets.',
      '3. Loop scans linear offsets, updating minimum, maximum, and accumulating total sum.',
      '4. Matrix loops iterate row-major order: outer loop steps through rows, inner loop through columns.',
      '5. In C[r][c] = A[r][c] + B[r][c], matrix arithmetic performs component-wise addition.'
    ],
    commonMistakes: [
      {
        mistake: 'Array bounds violation (Off-by-one index)',
        codeSnippet: `int data[5];
for (int i = 0; i <= 5; i++) { // Error: data[5] is out of bounds!
    data[i] = i * 10;
}`,
        correction: 'Valid indices for an array of size N are 0 to N - 1. Loop with i < 5.',
        explanation: 'In C, accessing data[5] on an array of length 5 reads or writes outside the allocated memory.'
      },
      {
        mistake: 'Attempting to determine array size inside a function via sizeof()',
        codeSnippet: `void print_size(int arr[]) {
    int count = sizeof(arr) / sizeof(arr[0]); // Bug! sizeof(arr) is sizeof(int*) = 8 bytes!
}`,
        correction: 'Always pass array size as an explicit parameter: void print_size(int arr[], int size).',
        explanation: 'Arrays decay into pointer references when passed as parameters; sizeof(arr) evaluates pointer size.'
      }
    ],
    realWorldExample: {
      scenario: 'Digital Audio Signal Filter Processing',
      code: `#include <stdio.h>

int main(void) {
    short audio_samples[6] = {120, -450, 890, 1024, -320, 50};
    int sample_count = 6;
    
    // Apply 50% gain attenuation filter
    printf("Attenuated Audio Samples:\\n");
    for (int i = 0; i < sample_count; i++) {
        audio_samples[i] = (short)(audio_samples[i] * 0.5);
        printf("[%d] %d\\n", i, audio_samples[i]);
    }
    return 0;
}`,
      explanation: 'Digital signal processors (DSPs) process contiguous PCM audio buffers using tight vector loops for real-time sound processing.'
    },
    practice: {
      prompt: 'Write a program that reverses an array of 5 integers {1, 2, 3, 4, 5} in-place or into a second array and prints the reversed elements separated by spaces.',
      starterCode: `#include <stdio.h>

int main(void) {
    int arr[5] = {1, 2, 3, 4, 5};
    // Print in reverse order:
    
    return 0;
}`,
      expectedOutputMatcher: '5 4 3 2 1',
      hint: 'Loop backwards from i = 4 down to i >= 0 with i--.',
      solution: `#include <stdio.h>

int main(void) {
    int arr[5] = {1, 2, 3, 4, 5};
    for (int i = 4; i >= 0; i--) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
    return 0;
}`
    },
    quiz: [
      {
        id: 'q-c-arr-1',
        question: 'How are multidimensional arrays stored in memory in C?',
        options: [
          'Column-Major Order',
          'Row-Major Order (consecutive rows in contiguous memory)',
          'Linked node lists',
          'Hash tables'
        ],
        correctIndex: 1,
        explanation: 'C stores multidimensional arrays in row-major order: row 0 elements are followed immediately by row 1.'
      },
      {
        id: 'q-c-arr-2',
        question: 'If int is 4 bytes and arr[0] is at memory address 0x2000, what is the address of arr[3]?',
        options: [
          '0x2003',
          '0x200C (0x2000 + 3 * 4)',
          '0x2004',
          '0x2012'
        ],
        correctIndex: 1,
        explanation: 'Address = base + (index * sizeof(type)) = 0x2000 + (3 * 4) = 0x2000 + 12 = 0x200C.'
      },
      {
        id: 'q-c-arr-3',
        question: 'What happens when an array name is passed as an argument to a function in C?',
        options: [
          'A complete copy of the entire array is duplicated onto the stack',
          'The array name decays into a pointer to its first element',
          'The array is automatically converted into a dynamic vector',
          'The function throws a compile-time error'
        ],
        correctIndex: 1,
        explanation: 'In C, array parameters decay into a pointer to the initial element (int*), requiring an explicit size parameter.'
      },
      {
        id: 'q-c-arr-4',
        question: 'What is the correct idiom to calculate the element count of an array declared in local scope?',
        options: [
          'sizeof(arr)',
          'sizeof(arr) / sizeof(arr[0])',
          'arr.length',
          'length(arr)'
        ],
        correctIndex: 1,
        explanation: 'Dividing the total byte footprint sizeof(arr) by the single-element byte footprint sizeof(arr[0]) yields the element count.'
      },
      {
        id: 'q-c-arr-5',
        question: 'What error occurs if you write to arr[10] when int arr[10] was declared?',
        options: [
          'IndexOutOfBoundsException',
          'Buffer overflow / out-of-bounds memory write',
          'Segmentation Fault automatically thrown by compiler',
          'The array dynamically expands to length 11'
        ],
        correctIndex: 1,
        explanation: 'arr[10] is the 11th element (valid indices are 0 to 9); writing to it causes an out-of-bounds memory overwrite.'
      }
    ],
    codingChallenge: {
      title: 'Array Min-Max & Average Compute Engine',
      difficulty: 'Medium',
      problem_statement: 'Given an array of 5 integers {10, 50, 30, 90, 20}, compute and print the minimum, maximum, and average formatted as "Min: 10 | Max: 90 | Avg: 40.00".',
      input_format: 'No input required.',
      output_format: 'Min: 10 | Max: 90 | Avg: 40.00',
      constraints: 'Average must be calculated using floating-point division.',
      starter_code: `#include <stdio.h>

int main(void) {
    int arr[5] = {10, 50, 30, 90, 20};
    int min = arr[0], max = arr[0], sum = 0;
    for (int i = 0; i < 5; i++) {
        if (arr[i] < min) min = arr[i];
        if (arr[i] > max) max = arr[i];
        sum += arr[i];
    }
    double avg = (double)sum / 5.0;
    printf("Min: %d | Max: %d | Avg: %.2f\\n", min, max, avg);
    return 0;
}`,
      solution_code: `#include <stdio.h>

int main(void) {
    int arr[5] = {10, 50, 30, 90, 20};
    int min = arr[0], max = arr[0], sum = 0;
    for (int i = 0; i < 5; i++) {
        if (arr[i] < min) min = arr[i];
        if (arr[i] > max) max = arr[i];
        sum += arr[i];
    }
    double avg = (double)sum / 5.0;
    printf("Min: %d | Max: %d | Avg: %.2f\\n", min, max, avg);
    return 0;
}`,
      test_cases: [
        {
          input: '',
          expected_output: 'Min: 10 | Max: 90 | Avg: 40.00'
        }
      ]
    },
    summary: [
      'Arrays are contiguous sequences of identical types with O(1) index access.',
      'C performs no runtime bounds checking; exceeding array boundaries causes memory corruption.',
      '2D arrays are stored in row-major order.',
      'Array arguments decay into pointer addresses; always pass size explicitly to functions.',
      'Use sizeof(arr) / sizeof(arr[0]) to calculate array length in local scope.'
    ]
  },

  // =========================================================================
  // TOPIC 10: Strings & Character Handling
  // =========================================================================
  {
    id: 'top-c-strings',
    number: 10,
    numberDisplay: '10',
    moduleId: 'mod-c-memory',
    moduleTitle: 'Module 03: Data Structures & Memory Mastery',
    title: 'Strings & Character Handling',
    slug: 'strings-and-character-handling',
    language: 'c',
    shortDescription: 'Master null-terminated character strings in C. Learn memory representation (\\0 terminator), standard string.h library functions (strlen, strcpy, strcat, strcmp), <ctype.h> utilities, and safe input parsing.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisiteId: 'top-c-arrays',
    learningObjectives: [
      'Explain how C represents strings as null-terminated (\'\\0\') char arrays',
      'Use standard <string.h> functions: strlen(), strcpy(), strcat(), and strcmp() safely',
      'Classify and transform single characters using <ctype.h> (isalpha, isdigit, toupper)',
      'Differentiate safe string reading (fgets) from dangerous buffer overflow functions (gets)'
    ],
    conceptExplanation: `### Strings as Null-Terminated Character Arrays
C has no native primitive "string" object. A string in C is simply an **array of \`char\` elements terminated by a special null character (\`'\\0'\`, ASCII value 0)**.
\`\`\`c
char name[6] = {'H', 'e', 'l', 'l', 'o', '\\0'};
// Or using shorthand string literal:
char name[] = "Hello"; // Automatically reserves 6 bytes: 'H','e','l','l','o','\\0'
\`\`\`
Every standard C string function relies on \`'\\0'\` to know where the text ends. If the null terminator is missing, functions continue scanning adjacent memory until a zero byte is encountered, causing memory leaks or segmentation faults.

### Standard String Utilities (\`<string.h>\`)
1. **\`strlen(s)\`**: Returns the count of characters up to (but not including) the \`'\\0'\` terminator.
2. **\`strcpy(dest, src)\`**: Copies the source string into the destination buffer (including \`'\\0'\`). Destination must be large enough!
3. **\`strcat(dest, src)\`**: Appends the source string to the end of the destination string.
4. **\`strcmp(s1, s2)\`**: Compares two strings lexicographically:
   - Returns \`0\` if identical.
   - Returns \`< 0\` if \`s1\` is lexicographically smaller than \`s2\`.
   - Returns \`> 0\` if \`s1\` is greater than \`s2\`.

### Safe Input: Why \`gets()\` is Banned
The deprecated function \`gets()\` reads stdin until a newline without knowing the destination buffer size. A user entering 100 characters into an 8-byte buffer overwrites the stack frame return address—the historic basis for countless cyber exploits.
**Modern Best Practice**: Always use \`fgets(buffer, sizeof(buffer), stdin)\` to enforce buffer limits!`,
    simpleExample: {
      code: `#include <stdio.h>
#include <string.h>

int main(void) {
    char greeting[] = "Hello";
    printf("String: %s | Length: %zu\\n", greeting, strlen(greeting));
    return 0;
}`,
      explanation: 'Uses strlen() from <string.h> to calculate string length (5 characters), ignoring the trailing null byte.'
    },
    syntax: `// Declarations
char str1[20] = "Universal";
char str2[] = "Systems";

// Common string.h functions
size_t len = strlen(str1);          // 9
strcpy(str1, "New Value");          // Overwrites str1
strcat(str1, " Added");             // Concatenates
int diff = strcmp(str1, str2);      // Comparison

// Character tests from <ctype.h>
#include <ctype.h>
int is_letter = isalpha('A'); // Non-zero
char lower = tolower('B');     // 'b'`,
    codeExample: `#include <stdio.h>
#include <string.h>
#include <ctype.h>

int main(void) {
    char text[64] = "C Programming 2026";
    
    printf("Original String: \"%s\"\\n", text);
    printf("Length (strlen): %zu characters\\n", strlen(text));
    printf("Memory Size:     %zu bytes\\n", sizeof(text));
    
    // Character categorization using <ctype.h>
    int vowels = 0, digits = 0, spaces = 0;
    for (int i = 0; text[i] != '\\0'; i++) {
        char ch = tolower(text[i]);
        if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') {
            vowels++;
        }
        if (isdigit(text[i])) {
            digits++;
        }
        if (isspace(text[i])) {
            spaces++;
        }
    }
    printf("Vowels: %d | Digits: %d | Spaces: %d\\n", vowels, digits, spaces);
    
    // String concatenation
    char status[64];
    strcpy(status, "Status: ");
    strcat(status, "VERIFIED");
    printf("%s\\n", status);
    
    // Comparison
    if (strcmp(status, "Status: VERIFIED") == 0) {
        printf("Integrity Check Passed.\\n");
    }
    
    return 0;
}`,
    expectedOutput: `Original String: "C Programming 2026"
Length (strlen): 18 characters
Memory Size:     64 bytes
Vowels: 4 | Digits: 4 | Spaces: 2
Status: VERIFIED
Integrity Check Passed.`,
    stepByStep: [
      '1. char text[64] allocates 64 contiguous bytes on stack; initialized with ASCII characters plus \\0.',
      '2. strlen() iterates through memory until byte value 0 is reached, returning 18.',
      '3. sizeof(text) returns full buffer allocation (64 bytes).',
      '4. Loop terminates when text[i] == \\0.',
      '5. strcmp() verifies character equality byte-by-byte, returning 0 on exact match.'
    ],
    commonMistakes: [
      {
        mistake: 'Forgetting to allocate space for the null terminator',
        codeSnippet: `char word[5] = "Hello"; // Bug! "Hello" requires 6 bytes: 5 letters + '\\0'`,
        correction: 'Always reserve at least length + 1 bytes: char word[6] = "Hello"; or char word[] = "Hello";',
        explanation: 'Without room for \\0, string functions overrun the buffer into neighboring memory.'
      },
      {
        mistake: 'Using == to compare two strings',
        codeSnippet: `char s1[] = "test";
char s2[] = "test";
if (s1 == s2) { } // False! Compares pointer memory addresses, not string text!`,
        correction: 'Use strcmp(s1, s2) == 0 to compare string contents.',
        explanation: 'In C, array names evaluate to memory addresses; s1 == s2 compares whether they point to the exact same memory location.'
      }
    ],
    realWorldExample: {
      scenario: 'HTTP Header Request Method Validation',
      code: `#include <stdio.h>
#include <string.h>

int main(void) {
    char method[] = "POST";
    char uri[] = "/api/v1/auth";
    
    if (strcmp(method, "POST") == 0) {
        printf("Routing payload to handler for: %s\\n", uri);
    } else if (strcmp(method, "GET") == 0) {
        printf("Serving cached entity for: %s\\n", uri);
    } else {
        printf("405 Method Not Allowed\\n");
    }
    return 0;
}`,
      explanation: 'Web server engines (Nginx, Apache) parse and route incoming HTTP protocol requests by comparing method and route string tokens.'
    },
    practice: {
      prompt: 'Write a program that counts the total number of vowels in the string "Cognitive Engine" and prints "Vowels: 6".',
      starterCode: `#include <stdio.h>
#include <ctype.h>

int main(void) {
    char s[] = "Cognitive Engine";
    int count = 0;
    // Count vowels (a, e, i, o, u):
    
    printf("Vowels: %d\\n", count);
    return 0;
}`,
      expectedOutputMatcher: 'Vowels: 6',
      hint: 'Loop while s[i] != \'\\0\', use tolower(s[i]), and test for a, e, i, o, u.',
      solution: `#include <stdio.h>
#include <ctype.h>

int main(void) {
    char s[] = "Cognitive Engine";
    int count = 0;
    for (int i = 0; s[i] != '\\0'; i++) {
        char c = tolower(s[i]);
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {
            count++;
        }
    }
    printf("Vowels: %d\\n", count);
    return 0;
}`
    },
    quiz: [
      {
        id: 'q-c-str-1',
        question: 'What special sentinel character terminates all standard C strings in memory?',
        options: [
          '\'\\n\' (newline)',
          '\'\\0\' (null character, ASCII 0)',
          'EOF (-1)',
          '\'\\t\' (tab)'
        ],
        correctIndex: 1,
        explanation: 'C strings are null-terminated by the \'\\0\' character, which marks the end of text.'
      },
      {
        id: 'q-c-str-2',
        question: 'What does the expression strcmp("apple", "banana") return?',
        options: [
          '0',
          'A negative integer (because \'a\' comes before \'b\')',
          'A positive integer',
          '1'
        ],
        correctIndex: 1,
        explanation: 'strcmp compares ASCII values character-by-character; since \'a\' < \'b\', it returns a negative value.'
      },
      {
        id: 'q-c-str-3',
        question: 'Why does evaluating (str1 == str2) fail to compare string contents in C?',
        options: [
          'C does not support the == operator',
          'It compares the memory addresses of the two arrays rather than their text contents',
          'It only checks the first character',
          'It produces a syntax compilation error'
        ],
        correctIndex: 1,
        explanation: 'Array names decay into pointers; == tests pointer address equality, not string character contents.'
      },
      {
        id: 'q-c-str-4',
        question: 'How many bytes of memory are required to store the string literal "KERNEL"?',
        options: [
          '6 bytes',
          '7 bytes (6 characters + \'\\0\' terminator)',
          '8 bytes',
          '12 bytes'
        ],
        correctIndex: 1,
        explanation: 'The 6 text characters \'K\',\'E\',\'R\',\'N\',\'E\',\'L\' require 6 bytes, plus 1 byte for \'\\0\', totaling 7 bytes.'
      },
      {
        id: 'q-c-str-5',
        question: 'Which function is the safe alternative to gets() that prevents buffer overflow by enforcing buffer length?',
        options: [
          'scanf("%s", buf)',
          'fgets(buf, sizeof(buf), stdin)',
          'strcpy()',
          'puts()'
        ],
        correctIndex: 1,
        explanation: 'fgets accepts a maximum byte count, guaranteeing it will never write past the allocated buffer bounds.'
      }
    ],
    codingChallenge: {
      title: 'String Palindrome Verifier',
      difficulty: 'Medium',
      problem_statement: 'Write a C program that tests whether the string "racecar" is a palindrome (reads identically forwards and backwards). Print "racecar is a PALINDROME".',
      input_format: 'No input needed.',
      output_format: 'racecar is a PALINDROME',
      constraints: 'Compare characters from start and end inward.',
      starter_code: `#include <stdio.h>
#include <string.h>

int main(void) {
    char s[] = "racecar";
    int len = strlen(s);
    int is_pal = 1;
    for (int i = 0; i < len / 2; i++) {
        if (s[i] != s[len - 1 - i]) {
            is_pal = 0;
            break;
        }
    }
    if (is_pal) {
        printf("%s is a PALINDROME\\n", s);
    } else {
        printf("%s is NOT a palindrome\\n", s);
    }
    return 0;
}`,
      solution_code: `#include <stdio.h>
#include <string.h>

int main(void) {
    char s[] = "racecar";
    int len = strlen(s);
    int is_pal = 1;
    for (int i = 0; i < len / 2; i++) {
        if (s[i] != s[len - 1 - i]) {
            is_pal = 0;
            break;
        }
    }
    if (is_pal) {
        printf("%s is a PALINDROME\\n", s);
    } else {
        printf("%s is NOT a palindrome\\n", s);
    }
    return 0;
}`,
      test_cases: [
        {
          input: '',
          expected_output: 'racecar is a PALINDROME'
        }
      ]
    },
    summary: [
      'C strings are char arrays ending with a null terminator (\'\\0\').',
      'Always reserve at least length + 1 bytes of storage for the null byte.',
      'Use strlen() to query string length and strcmp() for content comparison.',
      'Never use gets(); use fgets() to prevent stack buffer overflow vulnerabilities.',
      '<ctype.h> provides fast character testing and case conversions (isalpha, isdigit, tolower).'
    ]
  },

  // =========================================================================
  // TOPIC 11: Pointers & Memory Addresses
  // =========================================================================
  {
    id: 'top-c-pointers',
    number: 11,
    numberDisplay: '11',
    moduleId: 'mod-c-memory',
    moduleTitle: 'Module 03: Data Structures & Memory Mastery',
    title: 'Pointers & Memory Addresses',
    slug: 'pointers-and-memory-addresses',
    language: 'c',
    shortDescription: 'Master the defining superpower of C. Learn memory addresses, pointer declaration, address-of (&), dereferencing (*), pointer arithmetic, passing pointers to functions, and preventing dangling/null pointer errors.',
    difficulty: 'Intermediate',
    estimatedMinutes: 40,
    prerequisiteId: 'top-c-strings',
    learningObjectives: [
      'Explain what a pointer is: a variable holding a raw hardware memory address',
      'Use the address-of (&) and dereferencing (*) operators to read and modify remote memory',
      'Perform pointer arithmetic (+1 advances by sizeof(type) bytes)',
      'Simulate pass-by-reference in functions to swap or mutate caller variables directly'
    ],
    conceptExplanation: `### What is a Pointer?
A pointer in C is simply **a variable whose value is the memory address of another variable**. Pointers allow low-level hardware access, high-efficiency data passing without copying, and dynamic memory allocation.

### The Two Core Operators
1. **Address-of Operator (\`&\`)**: Returns the memory address of a variable:
   \`\`\`c
   int val = 42;
   int *ptr = &val; // ptr stores the address of val (e.g. 0x7ffd50)
   \`\`\`
2. **Dereference Operator (\`*\`)**: Accesses the value stored at the memory address pointed to:
   \`\`\`c
   printf("Value via pointer: %d\\n", *ptr); // Reads 42
   *ptr = 99; // Writes directly into val's memory cell! val is now 99!
   \`\`\`

### Pointer Syntax Disambiguation
- In a **declaration** (\`int *p;\`), the asterisk means "p is a pointer to an int".
- In an **expression** (\`*p = 10;\`), the asterisk is the dereference operator ("value at address p").

### Pointer Arithmetic
Pointers do not advance by single bytes; they advance by **multiples of the underlying data type size**:
\`\`\`c
int *p = (int*)0x1000;
p = p + 1; // p is now 0x1004 (advanced by sizeof(int) = 4 bytes)
\`\`\`

### Simulating Pass-By-Reference
Because C passes arguments by value, functions cannot mutate caller variables directly. However, by passing a **pointer to the variable**, the function dereferences the address and modifies the original memory cell:
\`\`\`c
void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}
\`\`\`

### Dangerous Pointer States
- **NULL Pointer**: Points to address 0 (\`int *p = NULL;\`). Dereferencing causes an immediate segmentation fault.
- **Uninitialized (Wild) Pointer**: Contains random garbage memory addresses. Modifying it corrupts random RAM!
- **Dangling Pointer**: Points to memory that has already been deallocated or freed.`,
    simpleExample: {
      code: `#include <stdio.h>

int main(void) {
    int num = 10;
    int *ptr = &num;
    
    printf("Value: %d | Address: %p\\n", num, (void*)&num);
    *ptr = 25; // Modify num through pointer
    printf("Updated num: %d\\n", num);
    return 0;
}`,
      explanation: 'Assigns address of num to pointer ptr. Modifying *ptr directly changes num in memory to 25.'
    },
    syntax: `// Pointer Declaration & Initialization
int x = 100;
int *p = &x;     // p holds address of x
int **pp = &p;   // pp is pointer-to-pointer

// Dereferencing
*p = 200;        // x becomes 200
int val = *p;    // val is 200

// NULL Pointer Guard
if (p != NULL) {
    // Safe to dereference
}`,
    codeExample: `#include <stdio.h>

// Pass-by-pointer to mutate caller variables
void swap_integers(int *x, int *y) {
    int temp = *x;
    *x = *y;
    *y = temp;
}

int main(void) {
    int a = 10, b = 20;
    printf("Before swap: a = %d, b = %d\\n", a, b);
    
    swap_integers(&a, &b);
    printf("After swap:  a = %d, b = %d\\n", a, b);
    
    // Pointer Arithmetic on Array
    int arr[4] = {100, 200, 300, 400};
    int *ptr = arr; // Equivalent to &arr[0]
    
    printf("\\n--- Pointer Arithmetic Traversal ---\\n");
    for (int i = 0; i < 4; i++) {
        printf("*(ptr + %d) at address %p = %d\\n", i, (void*)(ptr + i), *(ptr + i));
    }
    
    return 0;
}`,
    expectedOutput: `Before swap: a = 10, b = 20
After swap:  a = 20, b = 10

--- Pointer Arithmetic Traversal ---
*(ptr + 0) at address [addr0] = 100
*(ptr + 1) at address [addr1] = 200
*(ptr + 2) at address [addr2] = 300
*(ptr + 3) at address [addr3] = 400`,
    stepByStep: [
      '1. &a and &b pass memory addresses 0x7ffd00 and 0x7ffd04 into function swap_integers.',
      '2. Inside swap, *x accesses the value at 0x7ffd00 and writes 20; *y writes 10.',
      '3. Array name arr decays into pointer &arr[0].',
      '4. ptr + i advances the pointer address by i * sizeof(int) (4 bytes each step).',
      '5. Dereferencing *(ptr + i) extracts the integer value directly from contiguous memory.'
    ],
    commonMistakes: [
      {
        mistake: 'Dereferencing an uninitialized or NULL pointer',
        codeSnippet: `int *ptr; // Wild pointer (contains garbage address)
*ptr = 50; // CRASH! Segmentation fault!`,
        correction: 'Always initialize pointers to NULL or a valid address: int *ptr = NULL;',
        explanation: 'Writing through an uninitialized pointer attempts to write to an arbitrary memory address, causing OS memory protection faults.'
      },
      {
        mistake: 'Returning the address of a local stack variable from a function',
        codeSnippet: `int* get_data(void) {
    int val = 42;
    return &val; // Bug! val is destroyed as soon as get_data returns!
}`,
        correction: 'Allocate dynamically on the heap with malloc(), or have caller pass a pointer to fill.',
        explanation: 'Local stack frames are recycled upon return; returning their address creates a dangling pointer.'
      }
    ],
    realWorldExample: {
      scenario: 'High-Performance Zero-Copy DMA Network Packet Processing',
      code: `#include <stdio.h>

void parse_packet_header(const unsigned char *buffer) {
    unsigned char version = (buffer[0] >> 4) & 0x0F;
    unsigned short length = (buffer[2] << 8) | buffer[3];
    printf("IP Version: %u | Packet Length: %u bytes\\n", version, length);
}

int main(void) {
    unsigned char raw_packet[20] = {0x45, 0x00, 0x00, 0x3C, 0x1C, 0x46};
    parse_packet_header(raw_packet);
    return 0;
}`,
      explanation: 'Network drivers in Linux (DPDK, eBPF) pass raw memory pointers across kernel boundaries without copying payload bytes.'
    },
    practice: {
      prompt: 'Write a function void double_value(int *p) that doubles the integer pointed to by p. In main(), declare int n = 21, call double_value(&n), and print "Double: 42".',
      starterCode: `#include <stdio.h>

// Declare double_value:

int main(void) {
    int n = 21;
    // Call double_value:
    
    printf("Double: %d\\n", n);
    return 0;
}`,
      expectedOutputMatcher: 'Double: 42',
      hint: 'In the function: *p = (*p) * 2;',
      solution: `#include <stdio.h>

void double_value(int *p) {
    *p = (*p) * 2;
}

int main(void) {
    int n = 21;
    double_value(&n);
    printf("Double: %d\\n", n);
    return 0;
}`
    },
    quiz: [
      {
        id: 'q-c-ptr-1',
        question: 'What does the unary operator & return when applied to a variable in C?',
        options: [
          'The value stored in the variable',
          'The memory address where the variable is located',
          'The bitwise inverted representation',
          'The size of the variable in bytes'
        ],
        correctIndex: 1,
        explanation: '& is the address-of operator, yielding the memory address of its operand.'
      },
      {
        id: 'q-c-ptr-2',
        question: 'If int *ptr points to address 0x5000 and sizeof(int) is 4 bytes, what address does (ptr + 2) point to?',
        options: [
          '0x5002',
          '0x5008 (0x5000 + 2 * 4)',
          '0x5004',
          '0x5010'
        ],
        correctIndex: 1,
        explanation: 'Pointer arithmetic scales additions by sizeof(type): 0x5000 + (2 * 4) = 0x5008.'
      },
      {
        id: 'q-c-ptr-3',
        question: 'What is a "dangling pointer" in C programming?',
        options: [
          'A pointer set to NULL',
          'A pointer that references memory that has already been deallocated or freed',
          'A pointer that points to another pointer',
          'A pointer declared inside a struct'
        ],
        correctIndex: 1,
        explanation: 'A dangling pointer still holds the memory address of an object whose lifetime has expired or been deallocated.'
      },
      {
        id: 'q-c-ptr-4',
        question: 'What will be printed?\n\nint a = 15;\nint *p = &a;\n*p = 30;\nprintf("%d", a);',
        options: [
          '15',
          '30',
          'The memory address of a',
          'Compilation error'
        ],
        correctIndex: 1,
        explanation: '*p dereferences the pointer to modify the contents of a directly, setting it to 30.'
      },
      {
        id: 'q-c-ptr-5',
        question: 'Why does passing an address &val to a function allow the function to modify the caller\'s variable?',
        options: [
          'Because the function receives a copy of the memory address and dereferences it to modify original memory',
          'Because C functions automatically share stack frames',
          'Because & turns the variable into a global variable',
          'Because the compiler inlines the function'
        ],
        correctIndex: 0,
        explanation: 'Passing the address gives the function direct access to write into the caller\'s memory location via dereferencing.'
      }
    ],
    codingChallenge: {
      title: 'In-Place Array Reversal via Pointers',
      difficulty: 'Medium',
      problem_statement: 'Write a function void reverse_array(int *start, int *end) that reverses an array in-place by swapping *start and *end and advancing pointers inward until start >= end. Reverse {1, 2, 3, 4, 5} and print "5 4 3 2 1".',
      input_format: 'No input needed.',
      output_format: '5 4 3 2 1',
      constraints: 'Must use pointer arithmetic and dereferencing.',
      starter_code: `#include <stdio.h>

void reverse_array(int *start, int *end) {
    while (start < end) {
        int temp = *start;
        *start = *end;
        *end = temp;
        start++;
        end--;
    }
}

int main(void) {
    int arr[5] = {1, 2, 3, 4, 5};
    reverse_array(arr, arr + 4);
    for (int i = 0; i < 5; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
    return 0;
}`,
      solution_code: `#include <stdio.h>

void reverse_array(int *start, int *end) {
    while (start < end) {
        int temp = *start;
        *start = *end;
        *end = temp;
        start++;
        end--;
    }
}

int main(void) {
    int arr[5] = {1, 2, 3, 4, 5};
    reverse_array(arr, arr + 4);
    for (int i = 0; i < 5; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
    return 0;
}`,
      test_cases: [
        {
          input: '',
          expected_output: '5 4 3 2 1'
        }
      ]
    },
    summary: [
      'Pointers hold memory addresses; declared with type *ptr.',
      '& extracts memory address; * dereferences to read/write the target cell.',
      'Pointer arithmetic scales automatically by sizeof(type) bytes.',
      'Pointers enable pass-by-reference simulation in C functions.',
      'Never dereference uninitialized or NULL pointers to avoid segmentation faults.'
    ]
  },

  // =========================================================================
  // TOPIC 12: Dynamic Memory Allocation
  // =========================================================================
  {
    id: 'top-c-dynamic-memory',
    number: 12,
    numberDisplay: '12',
    moduleId: 'mod-c-memory',
    moduleTitle: 'Module 03: Data Structures & Memory Mastery',
    title: 'Dynamic Memory Allocation',
    slug: 'dynamic-memory-allocation',
    language: 'c',
    shortDescription: 'Master heap memory management in C. Learn malloc(), calloc(), realloc(), and free() from <stdlib.h>, NULL verification guards, memory leak diagnostics, and avoiding use-after-free bugs.',
    difficulty: 'Intermediate',
    estimatedMinutes: 35,
    prerequisiteId: 'top-c-pointers',
    learningObjectives: [
      'Contrast stack memory (automatic, fixed) with heap memory (dynamic, manual lifetime)',
      'Allocate memory using malloc() and zero-initialized calloc() with sizeof() calculations',
      'Resize existing heap blocks using realloc() and always release memory with free()',
      'Detect and prevent memory leaks, double free faults, and use-after-free vulnerabilities'
    ],
    conceptExplanation: `### Stack vs. Heap Memory
- **Stack**: Fast, automatic allocation managed by function call frames. Fixed size at compile time; deallocated automatically upon function return.
- **Heap**: Large pool of memory managed manually at runtime by the programmer. Remains allocated until explicitly released using \`free()\`.

### The Four Heap Memory Functions (\`<stdlib.h>\`)
1. **\`malloc(size_t bytes)\`**:
   Allocates an uninitialized contiguous block of the specified byte size. Returns a \`void*\` pointer to the block, or \`NULL\` if allocation fails:
   \`\`\`c
   int *arr = (int*)malloc(n * sizeof(int));
   \`\`\`
2. **\`calloc(size_t count, size_t size)\`**:
   Allocates memory for \`count\` elements of \`size\` bytes each and **initializes every byte to zero**:
   \`\`\`c
   int *arr = (int*)calloc(n, sizeof(int));
   \`\`\`
3. **\`realloc(void *ptr, size_t new_size)\`**:
   Resizes an existing heap block. It may expand in-place or allocate a new block elsewhere, copy the old contents, and free the old block automatically:
   \`\`\`c
   int *temp = (int*)realloc(arr, new_n * sizeof(int));
   if (temp != NULL) arr = temp;
   \`\`\`
4. **\`free(void *ptr)\`**:
   Returns allocated heap memory back to the operating system memory allocator.

### The Mandatory NULL Check
System memory can be exhausted. **Always check** if dynamic allocation succeeded before dereferencing:
\`\`\`c
int *data = (int*)malloc(100 * sizeof(int));
if (data == NULL) {
    fprintf(stderr, "Error: Memory allocation failed!\\n");
    return 1;
}
\`\`\`

### Common Dynamic Memory Vulnerabilities
- **Memory Leak**: Allocating memory and losing the pointer without calling \`free()\`. Over time, the process consumes excessive RAM.
- **Dangling Pointer**: Accessing memory after calling \`free(ptr)\` (Use-After-Free). Always set \`ptr = NULL;\` immediately after freeing.
- **Double Free**: Calling \`free()\` twice on the same memory address, corrupting the heap allocator tables.`,
    simpleExample: {
      code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *ptr = (int*)malloc(sizeof(int));
    if (ptr == NULL) return 1;
    
    *ptr = 100;
    printf("Dynamically allocated value: %d\\n", *ptr);
    
    free(ptr); // Release memory
    ptr = NULL; // Prevent dangling pointer
    return 0;
}`,
      explanation: 'Allocates memory on the heap for one integer, checks for NULL, writes 100, frees the block, and sets pointer to NULL.'
    },
    syntax: `#include <stdlib.h>

// Allocate
int *p = (int*)malloc(count * sizeof(int));
int *zero_p = (int*)calloc(count, sizeof(int));

// NULL Check
if (p == NULL) { /* Handle error */ }

// Reallocate
p = (int*)realloc(p, new_count * sizeof(int));

// Free & Neutralize
free(p);
p = NULL;`,
    codeExample: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int initial_size = 3;
    int *arr = (int*)malloc(initial_size * sizeof(int));
    
    if (arr == NULL) {
        printf("Allocation failed!\\n");
        return 1;
    }
    
    arr[0] = 10;
    arr[1] = 20;
    arr[2] = 30;
    printf("Initial Heap Block (size %d): %d %d %d\\n", initial_size, arr[0], arr[1], arr[2]);
    
    // Resize array to hold 5 elements using realloc
    int new_size = 5;
    int *temp = (int*)realloc(arr, new_size * sizeof(int));
    if (temp == NULL) {
        free(arr);
        return 1;
    }
    arr = temp;
    arr[3] = 40;
    arr[4] = 50;
    
    printf("Resized Heap Block (size %d): ", new_size);
    for (int i = 0; i < new_size; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
    
    // Free dynamic memory
    free(arr);
    arr = NULL;
    printf("Heap memory successfully freed and pointer neutralized.\\n");
    
    return 0;
}`,
    expectedOutput: `Initial Heap Block (size 3): 10 20 30
Resized Heap Block (size 5): 10 20 30 40 50 
Heap memory successfully freed and pointer neutralized.`,
    stepByStep: [
      '1. malloc(3 * sizeof(int)) requests 12 bytes from heap memory pool.',
      '2. OS allocator returns heap base address; program verifies pointer != NULL.',
      '3. realloc(arr, 5 * sizeof(int)) expands memory block to 20 bytes.',
      '4. Array elements [0..2] are preserved intact; new slots [3..4] are populated.',
      '5. free(arr) returns heap memory to the allocator; arr = NULL prevents dangling pointer access.'
    ],
    commonMistakes: [
      {
        mistake: 'Failing to check for NULL after malloc/realloc',
        codeSnippet: `int *data = malloc(1000000000000ULL);
data[0] = 1; // Immediate crash if allocation failed!`,
        correction: 'Always check if (data == NULL) before accessing allocated memory.',
        explanation: 'If the operating system cannot satisfy an allocation request, malloc returns NULL.'
      },
      {
        mistake: 'Overwriting the pointer with realloc result directly without temporary check',
        codeSnippet: `arr = realloc(arr, new_size); // If realloc fails, returns NULL and the original memory is LEAKED!`,
        correction: 'Use a temporary pointer: int *temp = realloc(arr, new_size); if (temp) arr = temp;',
        explanation: 'If realloc fails, it returns NULL but leaves the original memory intact; assigning directly to arr loses the only handle to the old memory.'
      }
    ],
    realWorldExample: {
      scenario: 'Dynamic HTTP Request Buffer Ingestion',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void) {
    size_t capacity = 16;
    char *buffer = (char*)malloc(capacity);
    if (!buffer) return 1;
    
    strcpy(buffer, "GET /index.html");
    printf("Buffer: %s (Cap: %zu)\\n", buffer, capacity);
    
    // Need more room for headers
    capacity = 64;
    char *new_buf = (char*)realloc(buffer, capacity);
    if (new_buf) {
        buffer = new_buf;
        strcat(buffer, " HTTP/1.1\\r\\nHost: localhost");
    }
    printf("Expanded: %s\\n", buffer);
    free(buffer);
    return 0;
}`,
      explanation: 'Web gateways dynamic parse variable-length HTTP headers and JSON bodies by dynamically resizing buffers with realloc.'
    },
    practice: {
      prompt: 'Dynamically allocate an array of 3 integers using malloc(). Store values 100, 200, 300. Calculate and print their average "Average: 200.00", then free the memory.',
      starterCode: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    // Allocate, populate, compute average, and free:
    
    return 0;
}`,
      expectedOutputMatcher: 'Average: 200.00',
      hint: 'int *arr = malloc(3 * sizeof(int)); arr[0] = 100; ... free(arr);',
      solution: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *arr = (int*)malloc(3 * sizeof(int));
    if (arr == NULL) return 1;
    
    arr[0] = 100;
    arr[1] = 200;
    arr[2] = 300;
    
    double avg = (double)(arr[0] + arr[1] + arr[2]) / 3.0;
    printf("Average: %.2f\\n", avg);
    
    free(arr);
    arr = NULL;
    return 0;
}`
    },
    quiz: [
      {
        id: 'q-c-dyn-1',
        question: 'Which header file must be included to use malloc(), calloc(), realloc(), and free() in C?',
        options: [
          '<stdio.h>',
          '<stdlib.h>',
          '<string.h>',
          '<memory.h>'
        ],
        correctIndex: 1,
        explanation: 'Dynamic memory allocation utilities are declared in <stdlib.h>.'
      },
      {
        id: 'q-c-dyn-2',
        question: 'What is the primary difference between malloc() and calloc()?',
        options: [
          'malloc allocates on the stack, while calloc allocates on the heap',
          'calloc initializes all allocated bytes to zero, whereas malloc leaves memory uninitialized',
          'malloc is faster and cannot fail',
          'calloc cannot be resized with realloc'
        ],
        correctIndex: 1,
        explanation: 'calloc clears and zeroes the allocated memory block; malloc leaves existing garbage memory untouched.'
      },
      {
        id: 'q-c-dyn-3',
        question: 'What value does malloc() return if the operating system cannot satisfy the memory request?',
        options: [
          '0xFFFFFFFF',
          '-1',
          'NULL (0)',
          'Throws a MemoryException'
        ],
        correctIndex: 2,
        explanation: 'malloc returns NULL when memory allocation fails.'
      },
      {
        id: 'q-c-dyn-4',
        question: 'What is a "memory leak" in C?',
        options: [
          'Writing data past the end of an array',
          'Failing to free dynamically allocated heap memory before losing all pointer references to it',
          'Accessing a dangling pointer',
          'Calling free() twice on the same pointer'
        ],
        correctIndex: 1,
        explanation: 'A memory leak occurs when heap memory is allocated but never released, causing orphaned RAM usage.'
      },
      {
        id: 'q-c-dyn-5',
        question: 'Why should you set a pointer to NULL immediately after calling free(ptr)?',
        options: [
          'To deallocate memory a second time',
          'To prevent accidental "use-after-free" access through a dangling pointer',
          'Because the C standard requires it for compilation',
          'To clear the system swap file'
        ],
        correctIndex: 1,
        explanation: 'Setting ptr = NULL ensures that any subsequent accidental dereference causes an immediate clean crash rather than silent memory corruption.'
      }
    ],
    codingChallenge: {
      title: 'Dynamic Vector Array Accumulator',
      difficulty: 'Medium',
      problem_statement: 'Dynamically allocate an array for n = 4 integers using calloc. Store values 5, 10, 15, 20. Print the sum as "Dynamic Sum = 50", then free the memory.',
      input_format: 'No input needed.',
      output_format: 'Dynamic Sum = 50',
      constraints: 'Must allocate with calloc and release with free.',
      starter_code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 4;
    int *arr = (int*)calloc(n, sizeof(int));
    if (!arr) return 1;
    
    arr[0] = 5;
    arr[1] = 10;
    arr[2] = 15;
    arr[3] = 20;
    
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += arr[i];
    }
    printf("Dynamic Sum = %d\\n", sum);
    
    free(arr);
    arr = NULL;
    return 0;
}`,
      solution_code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 4;
    int *arr = (int*)calloc(n, sizeof(int));
    if (!arr) return 1;
    
    arr[0] = 5;
    arr[1] = 10;
    arr[2] = 15;
    arr[3] = 20;
    
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += arr[i];
    }
    printf("Dynamic Sum = %d\\n", sum);
    
    free(arr);
    arr = NULL;
    return 0;
}`,
      test_cases: [
        {
          input: '',
          expected_output: 'Dynamic Sum = 50'
        }
      ]
    },
    summary: [
      'Heap memory offers dynamic runtime sizing and programmer-controlled lifetime.',
      'malloc() leaves bytes uninitialized; calloc() zeroes all allocated memory.',
      'Always verify if (ptr == NULL) before dereferencing allocated memory.',
      'Resize existing blocks with realloc() using temporary pointers to guard against failures.',
      'Every malloc/calloc/realloc call must be matched with free(ptr) to prevent memory leaks.'
    ]
  }
];
