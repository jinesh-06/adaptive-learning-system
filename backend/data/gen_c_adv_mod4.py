"""Module 4: Algorithms and Systems Programming
Topics 13 - 16 for Advanced C Systems & Data Structures.
"""

true = True
false = False
null = None

def get_module_4_topics():
    return [
        {
            "id": "top-c-searching",
            "number": 13,
            "numberDisplay": "13",
            "moduleId": "mod-c-adv-algorithms-systems",
            "moduleTitle": "Module 4: Algorithms and Systems Programming",
            "title": "Searching Algorithms",
            "slug": "searching-algorithms",
            "language": "c",
            "difficulty": "Advanced",
            "estimatedMinutes": 50,
            "prerequisiteId": "top-c-trees-bst",
            "shortDescription": "Master linear search and binary search algorithms in C: iterative vs recursive approaches, integer overflow prevention in midpoint calculation, and Big O complexity analysis.",
            "learningObjectives": [
                "Implement Linear Search for unsorted and sorted datasets in O(n) time.",
                "Understand the strict prerequisite of sorted data for Binary Search.",
                "Implement Binary Search iteratively using two-pointer low/high bounds in O(log n) time.",
                "Implement Binary Search recursively and analyze call-stack space complexity.",
                "Prevent catastrophic integer overflow in midpoint calculation using low + (high - low) / 2.",
                "Compare time and space complexities between linear search and binary search across scale."
            ],
            "conceptExplanation": """### 1. Introduction to Searching Algorithms
Searching is the algorithmic task of finding the location of a target element within a collection, or determining that the element does not exist.

### 2. Linear Search ($O(n)$)
Linear search inspects every element sequentially from the first index to the last.
- **Preconditions**: None. Works on unsorted, sorted, arrays, and linked lists.
- **Time Complexity**:
  - Best Case: $O(1)$ (target is at index 0).
  - Worst Case: $O(n)$ (target is at last index or absent).
  - Average Case: $O(n)$.
- **Space Complexity**: $O(1)$ auxiliary memory.

### 3. Binary Search ($O(\\log n)$)
Binary search is a divide-and-conquer algorithm that operates on **sorted arrays**. It repeatedly compares the target with the middle element:
1. If `arr[mid] == target`: Found at index `mid`.
2. If `target < arr[mid]`: Search the left half (`high = mid - 1`).
3. If `target > arr[mid]`: Search the right half (`low = mid + 1`).
Each comparison eliminates half of the remaining candidates.
- **Preconditions**: Array **must be sorted**.
- **Time Complexity**:
  - Best Case: $O(1)$ (target is at exact middle).
  - Worst Case: $O(\\log_2 n)$.
  - Average Case: $O(\\log_2 n)$.
- On 1,000,000 elements:
  - Linear Search worst case: 1,000,000 comparisons.
  - Binary Search worst case: $\\approx 20$ comparisons!

### 4. Preventing Integer Overflow in Midpoint Calculation
In classic textbooks, midpoint is often written as:
```c
int mid = (low + high) / 2; // BUG!
```
In systems programming, if `low + high` exceeds `INT_MAX` (2,147,483,647), it causes integer overflow, turning negative and causing illegal out-of-bounds memory accesses!
The robust standard implementation is:
```c
int mid = low + (high - low) / 2; // Mathematically equivalent, 100% overflow-safe!
```

### 5. Iterative vs Recursive Binary Search
- **Iterative**: Uses a `while (low <= high)` loop. Space complexity is strictly $O(1)$. Highly preferred in systems code.
- **Recursive**: Invokes itself with updated sub-ranges. Space complexity is $O(\\log n)$ due to recursive stack frames.""",
            "visualDiagram": """BINARY SEARCH STEP-BY-STEP (Target: 77):

  Initial Sorted Array:
  Index:   0    1    2    3    4    5    6    7    8
  Data:  [ 11 | 23 | 34 | 45 | 56 | 67 | 77 | 89 | 95 ]
           ^                   ^                   ^
          low                 mid                 high

  Step 1: mid = 4 (value: 56). 77 > 56 -> Eliminate left half!
          New search range: low = mid + 1 = 5

  Index:   5    6    7    8
  Data:  [ 67 | 77 | 89 | 95 ]
           ^         ^    ^
          low       mid  high

  Step 2: mid = 5 + (8 - 5)/2 = 6 (value: 77).
          77 == 77 -> TARGET LOCATED AT INDEX 6! (Found in only 2 comparisons!)""",
            "syntax": """// Iterative Binary Search
int binarySearchIterative(const int arr[], int n, int target) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2; // Safe midpoint
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1; // Not found
}""",
            "simpleExample": {
                "code": """#include <stdio.h>

int linearSearch(const int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}

int main(void) {
    int nums[5] = {42, 17, 88, 33, 99};
    int idx = linearSearch(nums, 5, 88);
    printf("Found 88 at index: %d\\n", idx);
    return 0;
}""",
                "explanation": "Iterates through `nums` sequentially and locates `88` at index 2."
            },
            "codeExample": """#include <stdio.h>

// Overflow-safe Iterative Binary Search
int binarySearch(const int arr[], int size, int target, int *comparisons) {
    int low = 0;
    int high = size - 1;
    *comparisons = 0;

    while (low <= high) {
        (*comparisons)++;
        int mid = low + (high - low) / 2; // Overflow-safe

        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1;
}

int main(void) {
    int sortedData[10] = {12, 19, 25, 33, 47, 58, 64, 71, 88, 95};
    int cmpCount = 0;

    int idx = binarySearch(sortedData, 10, 71, &cmpCount);
    if (idx != -1) {
        printf("Found target 71 at index %d in %d comparisons\\n", idx, cmpCount);
    } else {
        printf("Target not found\\n");
    }

    idx = binarySearch(sortedData, 10, 50, &cmpCount);
    printf("Search for absent 50: %s (Comparisons: %d)\\n",
           idx == -1 ? "NOT FOUND" : "FOUND", cmpCount);
    return 0;
}""",
            "expectedOutput": """Found target 71 at index 7 in 3 comparisons
Search for absent 50: NOT FOUND (Comparisons: 4)""",
            "stepByStep": [
                "Line 4: `binarySearch` takes array, size, target, and a pointer to track comparison count.",
                "Line 9: Loop while `low <= high` keeps sub-array bounds valid.",
                "Line 11: `mid = low + (high - low) / 2` calculates the median index without integer overflow.",
                "Line 13-19: Compare `arr[mid]` with `target` to return index or adjust `low` or `high`.",
                "Line 28: Search for 71 finds it at index 7 in only 3 comparisons across 10 elements.",
                "Line 34: Search for absent 50 terminates in 4 comparisons, returning -1."
            ],
            "dryRun": "Target 71: low=0, high=9. mid=4 (val=47<71)-> low=5. mid=7 (val=71==71)-> found at 7 in 2 loop iterations! Cmp count = 2 or 3 depending on branch trace.",
            "keyTakeaways": [
                "Linear search operates on any collection in O(n) time.",
                "Binary search requires sorted data and executes in O(log n) time.",
                "Always calculate midpoint with low + (high - low) / 2 to prevent integer overflow.",
                "Iterative binary search is O(1) space, avoiding recursive stack frame consumption.",
                "Binary search is exponentially faster than linear search on large datasets."
            ],
            "commonMistakes": [
                {
                    "mistake": "Calculating midpoint as int mid = (low + high) / 2;",
                    "whyWrong": "For large arrays (e.g. over 1 billion elements), low + high overflows positive 32-bit signed int, causing a negative index crash.",
                    "correction": "Always write: int mid = low + (high - low) / 2;",
                    "explanation": "This famous bug existed in standard libraries (including Java's Arrays.binarySearch) for nearly a decade."
                },
                {
                    "mistake": "Running Binary Search on an unsorted array.",
                    "whyWrong": "Binary search assumes sorted order; on unsorted data it will randomly fail to locate elements that are present.",
                    "correction": "Ensure the array is sorted before invoking binary search.",
                    "explanation": "The mathematical proof of divide-and-conquer search relies on the transitivity of sorted order."
                }
            ],
            "realWorldExample": {
                "scenario": "Operating System Kernel Symbol Table Resolver",
                "code": """#include <stdio.h>

struct KernelSymbol {
    unsigned long address;
    const char *name;
};

int main(void) {
    printf("Kernel debuggers and crash dump analyzers binary search sorted symbol tables.\\n");
    return 0;
}""",
                "explanation": "Linux kernel panic reporters binary-search the sorted `System.map` symbol table to convert raw memory fault addresses into function names."
            },
            "practice": {
                "prompt": "Write a recursive binary search function `int binarySearchRecursive(const int arr[], int low, int high, int target)`.",
                "starterCode": """#include <stdio.h>

int binarySearchRecursive(const int arr[], int low, int high, int target) {
    // Implement recursive binary search
    return -1;
}

int main(void) {
    int sorted[5] = {10, 20, 30, 40, 50};
    printf("Index of 40: %d\\n", binarySearchRecursive(sorted, 0, 4, 40));
    return 0;
}""",
                "solution": """#include <stdio.h>

int binarySearchRecursive(const int arr[], int low, int high, int target) {
    if (low > high) return -1;
    int mid = low + (high - low) / 2;
    if (arr[mid] == target) return mid;
    if (arr[mid] < target) return binarySearchRecursive(arr, mid + 1, high, target);
    return binarySearchRecursive(arr, low, mid - 1, target);
}

int main(void) {
    int sorted[5] = {10, 20, 30, 40, 50};
    printf("Index of 40: %d\\n", binarySearchRecursive(sorted, 0, 4, 40)); // 3
    return 0;
}""",
                "hints": [
                    "Base case: if (low > high) return -1;",
                    "Calculate mid = low + (high - low) / 2",
                    "Recursively search left or right partition"
                ]
            },
            "quiz": [
                {
                    "id": "q-c-adv-srch-1",
                    "question": "What is the mandatory prerequisite before applying Binary Search to an array?",
                    "options": [
                        "The array must be dynamically allocated with malloc",
                        "The array elements must be sorted in order",
                        "The array size must be an exact power of 2",
                        "The array must contain unique values"
                    ],
                    "correctIndex": 1,
                    "explanation": "Binary Search requires elements to be sorted so that comparing with the middle element eliminates half the remaining space."
                },
                {
                    "id": "q-c-adv-srch-2",
                    "question": "Why is int mid = low + (high - low) / 2 preferred over int mid = (low + high) / 2?",
                    "options": [
                        "It uses fewer CPU cycles",
                        "It avoids 32-bit signed integer overflow when low + high exceeds INT_MAX",
                        "It supports floating point values",
                        "It converts the loop to constant time"
                    ],
                    "correctIndex": 1,
                    "explanation": "When low + high > 2^31 - 1, (low + high) overflows to negative, corrupting the index. low + (high - low)/2 never overflows."
                },
                {
                    "id": "q-c-adv-srch-3",
                    "question": "Approximately how many comparisons does binary search take in the worst case on an array of 1,000,000 sorted elements?",
                    "options": ["1,000,000", "500,000", "20", "100"],
                    "correctIndex": 2,
                    "explanation": "log2(1,000,000) is approximately 19.93, meaning at most 20 comparisons are needed."
                },
                {
                    "id": "q-c-adv-srch-4",
                    "question": "What is the auxiliary space complexity of iterative binary search?",
                    "options": ["O(log n)", "O(1)", "O(n)", "O(n log n)"],
                    "correctIndex": 1,
                    "explanation": "Iterative binary search uses only a few index variables (low, high, mid), requiring O(1) constant auxiliary space."
                }
            ],
            "codingChallenge": {
                "title": "Binary Search First Occurrence Finder",
                "difficulty": "Easy",
                "problem_statement": "Implement an overflow-safe binary search function `int findFirstOccurrence(const int arr[], int n, int target)` that returns the index of the FIRST occurrence of `target` in a sorted array containing potential duplicates (or `-1` if absent).\n\nIn `main()`:\nGiven sorted array `int data[8] = {10, 20, 20, 20, 30, 40, 50, 60};`\n1. Search for 20 (first occurrence is index 1).\n2. Search for 50 (first occurrence is index 6).\n3. Print in exact format:\n`Target 20: Index 1 | Target 50: Index 6`",
                "input_format": "None.",
                "output_format": "Target 20: Index 1 | Target 50: Index 6",
                "constraints": "Must run in O(log n) time.",
                "starter_code": """#include <stdio.h>

// Implement findFirstOccurrence

int main(void) {
    int data[8] = {10, 20, 20, 20, 30, 40, 50, 60};
    // Call and print
    return 0;
}""",
                "expected_output": "Target 20: Index 1 | Target 50: Index 6",
                "test_cases": [
                    {
                        "input": "",
                        "expected_output": "Target 20: Index 1 | Target 50: Index 6",
                        "is_hidden": false
                    }
                ]
            },
            "summary": [
                "Linear search scans sequentially in O(n) without preconditions.",
                "Binary search achieves O(log n) efficiency on sorted collections.",
                "Always use low + (high - low) / 2 to avoid integer overflow bugs.",
                "Iterative binary search uses O(1) space; recursive search uses O(log n) stack space.",
                "Binary search is a cornerstone primitive in database index and kernel symbol lookups."
            ],
            "content_standard": "Comprehensive analysis of linear search, binary search mechanics, overflow-safe midpoint formulas, and complexity curves in C.",
            "content_detailed": "Branch prediction impact on binary search loops, cacheline misses during binary subdivision, and ternary search comparisons.",
            "content_simplified": "Binary search is like opening a dictionary in the middle: if your word starts with M, you can immediately throw away the entire first half."
        },
        {
            "id": "top-c-sorting",
            "number": 14,
            "numberDisplay": "14",
            "moduleId": "mod-c-adv-algorithms-systems",
            "moduleTitle": "Module 4: Algorithms and Systems Programming",
            "title": "Sorting Algorithms",
            "slug": "sorting-algorithms",
            "language": "c",
            "difficulty": "Advanced",
            "estimatedMinutes": 60,
            "prerequisiteId": "top-c-searching",
            "shortDescription": "Master fundamental and advanced sorting algorithms in C: Bubble, Selection, Insertion, Merge Sort, and Quick Sort with partition analysis, stability, and in-place trade-offs.",
            "learningObjectives": [
                "Implement Bubble Sort and optimize with early-exit swapped flags in O(n^2) worst case.",
                "Implement Selection Sort and analyze its minimal memory write property.",
                "Implement Insertion Sort and understand its optimal O(n) performance on nearly-sorted data.",
                "Implement Merge Sort using divide-and-conquer with guaranteed O(n log n) stable execution.",
                "Implement Quick Sort using Lomuto or Hoare partitioning schemes in O(n log n) average time.",
                "Distinguish between stable and unstable sorting algorithms.",
                "Evaluate memory footprints: in-place sorting vs auxiliary buffer overhead."
            ],
            "conceptExplanation": """### 1. Introduction to Sorting Algorithms in C
Sorting reorganizes elements into non-decreasing or non-increasing order. Sorting is the bedrock of database query execution, search optimization, and graphics pipelines.

### 2. Algorithmic Classifications
- **In-Place**: Requires only $O(1)$ auxiliary memory (modifies input array directly). Examples: Bubble, Selection, Insertion, Quick Sort.
- **Stable**: Preserves the original relative order of elements with equal keys. Examples: Insertion Sort, Merge Sort.
- **Unstable**: May reorder identical elements. Examples: Selection Sort, Quick Sort, Heap Sort.

### 3. Comparison of Core Sorting Algorithms
| Algorithm | Best Time | Average Time | Worst Time | Space | Stable? | In-Place? |
|---|---|---|---|---|---|---|
| **Bubble Sort** | $O(n)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | Yes | Yes |
| **Selection Sort** | $O(n^2)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | No | Yes |
| **Insertion Sort** | $O(n)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | Yes | Yes |
| **Merge Sort** | $O(n \\log n)$ | $O(n \\log n)$ | $O(n \\log n)$ | $O(n)$ | Yes | No |
| **Quick Sort** | $O(n \\log n)$ | $O(n \\log n)$ | $O(n^2)$ | $O(\\log n)$ | No | Yes |

### 4. Insertion Sort (The Fast In-Place Sorter for Small Lists)
Insertion sort maintains a sorted prefix and inserts the next element into its correct location by shifting larger elements right:
- Best case on nearly sorted data: $O(n)$ linear time!
- Many industrial standard libraries (like glibc's `qsort`) switch to Insertion Sort for sub-arrays with size $< 16$.

### 5. Merge Sort (Divide-and-Conquer Guaranteed $O(n \\log n)$)
1. **Divide**: Divide array into two halves at `mid = low + (high - low) / 2`.
2. **Conquer**: Recursively sort left and right halves.
3. **Combine**: Merge the two sorted subarrays into a temporary buffer, then copy back.
- Guaranteed $O(n \\log n)$ worst-case runtime. Stable. Requires $O(n)$ auxiliary buffer.

### 6. Quick Sort (Cache-Friendly Partitioning Champion)
1. Select a **pivot** element (e.g. `arr[high]`).
2. **Partition**: Rearrange array so all elements $\\le$ pivot are to its left, and all elements $>$ pivot are to its right.
3. Recursively quicksort the left and right partitions.
- Blisteringly fast in practice due to in-place cache locality. Worst case $O(n^2)$ if pivot is repeatedly minimal/maximal (mitigated with random pivot or median-of-three).""",
            "visualDiagram": """MERGE SORT DIVIDE-AND-CONQUER TREE:

                  [ 38, 27, 43, 3, 9, 82, 10 ]
                         /              \\
             [ 38, 27, 43 ]            [ 3, 9, 82, 10 ]
              /          \\              /            \\
           [ 38 ]      [ 27, 43 ]    [ 3, 9 ]      [ 82, 10 ]
                         /    \\       /    \\        /      \\
                      [ 27 ] [ 43 ] [ 3 ]  [ 9 ]  [ 82 ]   [ 10 ]
             -------------------------------------------------- (Divided to base cases)
                         \\    /       \\    /        \\      /
           [ 38 ]      [ 27, 43 ]    [ 3, 9 ]      [ 10, 82 ]
              \\          /              \\            /
             [ 27, 38, 43 ]            [ 3, 9, 10, 82 ]
                         \\              /
                  [ 3, 9, 10, 27, 38, 43, 82 ] (Merged and Sorted!)""",
            "syntax": """// QuickSort signature
void quickSort(int arr[], int low, int high);
int  partition(int arr[], int low, int high);

// MergeSort signature
void mergeSort(int arr[], int low, int high);
void merge(int arr[], int low, int mid, int high);""",
            "simpleExample": {
                "code": """#include <stdio.h>

void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

int main(void) {
    int nums[5] = {64, 25, 12, 22, 11};
    bubbleSort(nums, 5);
    for (int i = 0; i < 5; i++) printf("%d ", nums[i]);
    printf("\\n");
    return 0;
}""",
                "explanation": "Iteratively bubbles the largest unsorted element to the end using adjacent swaps."
            },
            "codeExample": """#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

// Lomuto Partition Scheme
int partition(int arr[], int low, int high) {
    int pivot = arr[high]; // Choose last element as pivot
    int i = low - 1;       // Index of smaller element

    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(&arr[i], &arr[j]);
        }
    }
    swap(&arr[i + 1], &arr[high]);
    return i + 1;
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int main(void) {
    int data[7] = {38, 27, 43, 3, 9, 82, 10};

    printf("Original: ");
    for (int i = 0; i < 7; i++) printf("%d ", data[i]);
    printf("\\n");

    quickSort(data, 0, 6);

    printf("Sorted:   ");
    for (int i = 0; i < 7; i++) printf("%d ", data[i]);
    printf("\\n");
    return 0;
}""",
            "expectedOutput": """Original: 38 27 43 3 9 82 10 
Sorted:   3 9 10 27 38 43 82 """,
            "stepByStep": [
                "Line 3-7: Standard `swap` helper exchanging two integer values via pointers.",
                "Line 10-21: `partition` places pivot in its correct sorted position and returns its index `pi`.",
                "Line 23-29: `quickSort` recursively partitions and sorts left and right sub-ranges.",
                "Line 32: Initialize array with 7 unsorted values.",
                "Line 37: Call `quickSort(data, 0, 6)` sorting the array in-place.",
                "Line 39-41: Print the verified ascending sequence: `3 9 10 27 38 43 82`."
            ],
            "dryRun": "Array [38, 27, 43, 3, 9, 82, 10]. Pivot=10. Partition rearranges <=10 to left, >10 to right. Recursion sorts subproblems. Final array is 3, 9, 10, 27, 38, 43, 82.",
            "keyTakeaways": [
                "Insertion Sort is optimal for small or nearly sorted collections (O(n) best case).",
                "Merge Sort guarantees O(n log n) worst-case runtime and stability at the cost of O(n) memory.",
                "Quick Sort is typically the fastest in-place algorithm in practice due to hardware cache locality.",
                "A sorting algorithm is stable if it preserves the original relative order of identical keys.",
                "Worst-case Quick Sort O(n^2) can be avoided with randomized or median pivot selection."
            ],
            "commonMistakes": [
                {
                    "mistake": "Using uninitialized temporary arrays inside Merge Sort on every single recursive call.",
                    "whyWrong": "Calling malloc() inside recursive merge calls creates thousands of memory allocations and degrades performance.",
                    "correction": "Allocate a single auxiliary buffer of size n once in the driver and pass it down the recursion tree.",
                    "explanation": "Eliminating repeated dynamic memory allocations dramatically speeds up Merge Sort."
                },
                {
                    "mistake": "Selecting array[0] as pivot on already sorted arrays in Quick Sort.",
                    "whyWrong": "If the array is already sorted, picking the first element generates 0 elements on the left and n-1 on the right, degrading to O(n^2).",
                    "correction": "Use median-of-three or randomized pivot selection.",
                    "explanation": "Balanced partitions are required to achieve O(n log n) recursion depth."
                }
            ],
            "realWorldExample": {
                "scenario": "C Standard Library qsort() Comparator Engine",
                "code": """#include <stdio.h>
#include <stdlib.h>

int cmpInt(const void *a, const void *b) {
    return (*(const int*)a - *(const int*)b);
}

int main(void) {
    int arr[5] = {50, 10, 40, 20, 30};
    qsort(arr, 5, sizeof(int), cmpInt);
    printf("qsort: %d %d %d %d %d\\n", arr[0], arr[1], arr[2], arr[3], arr[4]);
    return 0;
}""",
                "explanation": "The C standard library provides `qsort()` in `<stdlib.h>`, an optimized hybrid quicksort/insertion sort using function pointers for custom comparators."
            },
            "practice": {
                "prompt": "Implement Insertion Sort on an array of 5 integers and print the sorted array.",
                "starterCode": """#include <stdio.h>

void insertionSort(int arr[], int n) {
    // Implement insertion sort
}

int main(void) {
    int a[5] = {25, 10, 80, 40, 5};
    insertionSort(a, 5);
    for (int i = 0; i < 5; i++) printf("%d ", a[i]);
    printf("\\n");
    return 0;
}""",
                "solution": """#include <stdio.h>

void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

int main(void) {
    int a[5] = {25, 10, 80, 40, 5};
    insertionSort(a, 5);
    for (int i = 0; i < 5; i++) printf("%d ", a[i]); // 5 10 25 40 80 
    printf("\\n");
    return 0;
}""",
                "hints": [
                    "Outer loop from i = 1 to n - 1",
                    "Store key = arr[i], shift larger elements right in inner while loop"
                ]
            },
            "quiz": [
                {
                    "id": "q-c-adv-sort-1",
                    "question": "What is the guaranteed worst-case time complexity of Merge Sort?",
                    "options": ["O(n^2)", "O(n log n)", "O(n)", "O(log n)"],
                    "correctIndex": 1,
                    "explanation": "Merge Sort always divides in half (log n levels) and performs O(n) work per level, guaranteeing O(n log n) even in the worst case."
                },
                {
                    "id": "q-c-adv-sort-2",
                    "question": "What does it mean for a sorting algorithm to be 'stable'?",
                    "options": [
                        "It never causes a stack overflow crash",
                        "It maintains the relative order of elements that have equal keys",
                        "It runs in O(1) space",
                        "It produces identical output on 32-bit and 64-bit CPUs"
                    ],
                    "correctIndex": 1,
                    "explanation": "A stable sort preserves the initial relative positioning of equal elements."
                },
                {
                    "id": "q-c-adv-sort-3",
                    "question": "Why is Quick Sort often faster in practice than Merge Sort, despite both having O(n log n) average complexity?",
                    "options": [
                        "Quick Sort has a lower constant factor and operates in-place with high cache locality",
                        "Quick Sort uses hardware parallelism automatically",
                        "Quick Sort does not use comparisons",
                        "Merge Sort is written in interpreted bytecode"
                    ],
                    "correctIndex": 0,
                    "explanation": "Quick Sort partitions in-place in continuous cache lines without auxiliary buffer copy overhead, giving it smaller constant factors."
                },
                {
                    "id": "q-c-adv-sort-4",
                    "question": "Which sorting algorithm performs in O(n) linear time when the input array is already almost sorted?",
                    "options": ["Selection Sort", "Insertion Sort", "Heap Sort", "Merge Sort"],
                    "correctIndex": 1,
                    "explanation": "Insertion Sort only executes its inner shift loop when elements are out of order; if nearly sorted, it performs an O(n) scan."
                }
            ],
            "codingChallenge": {
                "title": "In-Place QuickSort with Descending Order",
                "difficulty": "Medium",
                "problem_statement": "Implement Quick Sort in C to sort an array in strictly **descending** order (largest to smallest).\n\nIn `main()`:\nGiven `int data[6] = {15, 82, 34, 91, 23, 56};`\n1. Sort `data` descending using Quick Sort.\n2. Print the array formatted as:\n`Descending: 91 82 56 34 23 15`",
                "input_format": "None.",
                "output_format": "Descending: 91 82 56 34 23 15",
                "constraints": "Must use in-place quicksort logic.",
                "starter_code": """#include <stdio.h>

// Implement descending QuickSort

int main(void) {
    int data[6] = {15, 82, 34, 91, 23, 56};
    // Implement sort and print
    return 0;
}""",
                "expected_output": "Descending: 91 82 56 34 23 15",
                "test_cases": [
                    {
                        "input": "",
                        "expected_output": "Descending: 91 82 56 34 23 15",
                        "is_hidden": false
                    }
                ]
            },
            "summary": [
                "Sorting algorithms vary by asymptotic complexity, stability, and in-place memory usage.",
                "Insertion Sort is optimal for small and nearly sorted collections.",
                "Merge Sort provides guaranteed O(n log n) stable sorting with O(n) memory.",
                "Quick Sort offers the fastest practical in-place sorting due to cache locality.",
                "Understanding sorting trade-offs is essential for designing high-performance systems."
            ],
            "content_standard": "Comprehensive analysis of Bubble, Selection, Insertion, Merge, and Quick Sort algorithms in C.",
            "content_detailed": "Lomuto vs Hoare partitioning schemes, dual-pivot quicksort, introsort hybrid architectures, and stability proofs.",
            "content_simplified": "Sorting is like arranging playing cards in your hand: you can scan and swap, insert one card at a time, or split the deck into smaller piles."
        },
        {
            "id": "top-c-command-line-modular",
            "number": 15,
            "numberDisplay": "15",
            "moduleId": "mod-c-adv-algorithms-systems",
            "moduleTitle": "Module 4: Algorithms and Systems Programming",
            "title": "Command-Line Arguments and Modular Programming",
            "slug": "command-line-arguments-and-modular-programming",
            "language": "c",
            "difficulty": "Advanced",
            "estimatedMinutes": 55,
            "prerequisiteId": "top-c-sorting",
            "shortDescription": "Master argc and argv parameter parsing, string-to-number conversions (strtol), multi-file compilation, modular header organization, and memory leak diagnostics in C.",
            "learningObjectives": [
                "Parse user input through int main(int argc, char *argv[]).",
                "Understand the memory organization of argv as an array of null-terminated string pointers.",
                "Perform safe numerical conversions using strtol() and avoid brittle atoi() functions.",
                "Structure modular C programs across header (.h) and implementation (.c) files.",
                "Compile and link multi-file projects using GCC/Clang commands.",
                "Apply memory diagnostic tools (AddressSanitizer, Valgrind) to detect memory leaks and buffer overruns."
            ],
            "conceptExplanation": """### 1. Command-Line Arguments: `argc` and `argv`
In systems programming, tools are invoked from terminal shells with arguments (e.g. `gcc -O2 main.c -o app`).
In C, the entry point receives arguments through `main`:
```c
int main(int argc, char *argv[])
```
- `argc` (**Argument Count**): An integer holding the number of command-line arguments passed. `argc` is guaranteed to be at least `1`.
- `argv` (**Argument Vector**): An array of character pointers (`char *`), where each pointer references a null-terminated string.
  - `argv[0]`: The name/path of the executable itself.
  - `argv[1]` through `argv[argc - 1]`: The user-supplied arguments.
  - `argv[argc]`: Guaranteed by the C standard to be `NULL`.

### 2. Memory Organization of `argv`
`argv` is allocated by the operating system kernel on the program's initial call stack before entering `main()`:
```
argv --------> [ ptr0 ] -------> "app.exe\\0"
               [ ptr1 ] -------> "--verbose\\0"
               [ ptr2 ] -------> "100\\0"
               [ ptr3 ] -------> NULL
```

### 3. Safe Parsing: `strtol()` vs Deprecated `atoi()`
Avoid using `atoi()`: it cannot detect errors (returns 0 if conversion fails or if the string is \"0\") and exhibits undefined behavior on integer overflow.
Use `strtol()` (**String to Long**):
```c
char *endptr;
long val = strtol(argv[2], &endptr, 10);
if (*endptr != '\\0') {
    printf("Error: Invalid numerical argument!\\n");
}
```

### 4. Modular Programming: Header vs Implementation Files
Professional C applications split code into decoupled modules:
1. **Header File (`math_utils.h`)**: The public interface. Contains function prototypes, struct definitions, enum tags, and macros. Protected with header guards.
2. **Implementation File (`math_utils.c`)**: The private implementation. Includes `math_utils.h` and implements functions.
3. **Application Driver (`main.c`)**: Consumes the module by including `math_utils.h`.

### 5. Multi-File Compilation Workflow
```bash
# Compile each source file into an object file (.o)
gcc -c math_utils.c -o math_utils.o
gcc -c main.c -o main.o

# Link object files together into the final executable
gcc math_utils.o main.o -o my_app
```

### 6. Debugging & Memory Diagnostics
Memory bugs (leaks, buffer overruns, use-after-free) can be caught automatically using AddressSanitizer:
```bash
gcc -fsanitize=address -g main.c -o my_app
```""",
            "visualDiagram": """ARGC AND ARGV MEMORY LAYOUT (Executed: ./calc --add 40 60):

  argc = 4

  argv (Array of Pointers on Stack):
  Index       Memory Pointer                  Target String in Environment Stack
  +---------+-------------------------------+ +--------------------------------+
  | argv[0] | 0x7FFF0010                    | | "./calc\\0"                     |
  +---------+-------------------------------+ +--------------------------------+
  | argv[1] | 0x7FFF0018                    | | "--add\\0"                      |
  +---------+-------------------------------+ +--------------------------------+
  | argv[2] | 0x7FFF0020                    | | "40\\0"                         |
  +---------+-------------------------------+ +--------------------------------+
  | argv[3] | 0x7FFF0025                    | | "60\\0"                         |
  +---------+-------------------------------+ +--------------------------------+
  | argv[4] | NULL (Guaranteed sentinel)    |
  +---------+-------------------------------+""",
            "syntax": """// Main signature with arguments
int main(int argc, char *argv[]);
int main(int argc, char **argv); // Equivalent

// Safe integer conversion
long strtol(const char *nptr, char **endptr, int base);""",
            "simpleExample": {
                "code": """#include <stdio.h>

int main(int argc, char *argv[]) {
    printf("Total arguments (argc): %d\\n", argc);
    for (int i = 0; i < argc; i++) {
        printf("argv[%d]: %s\\n", i, argv[i]);
    }
    return 0;
}""",
                "explanation": "Prints `argc` and loops through `argv`, displaying the program name and all arguments."
            },
            "codeExample": """#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Simulated command-line parser function
int runCliTool(int argc, char *argv[]) {
    if (argc < 2) {
        printf("Usage: %s <command> [args...]\\n", argv[0]);
        return 1;
    }

    if (strcmp(argv[1], "--help") == 0) {
        printf("CLI Utility Help Menu: Commands: --sum, --echo\\n");
        return 0;
    }

    if (strcmp(argv[1], "--sum") == 0) {
        if (argc < 4) {
            printf("Error: --sum requires two integer operands\\n");
            return 1;
        }
        char *end1, *end2;
        long a = strtol(argv[2], &end1, 10);
        long b = strtol(argv[3], &end2, 10);

        if (*end1 != '\\0' || *end2 != '\\0') {
            printf("Error: Non-numeric argument detected\\n");
            return 1;
        }
        printf("Sum Result: %ld\\n", a + b);
        return 0;
    }

    printf("Unknown command: %s\\n", argv[1]);
    return 1;
}

int main(void) {
    // Simulate invocation: ./cli_app --sum 150 250
    char *mockArgv[] = {"cli_app", "--sum", "150", "250", NULL};
    int mockArgc = 4;

    printf("Executing CLI Command simulation...\\n");
    runCliTool(mockArgc, mockArgv);
    return 0;
}""",
            "expectedOutput": """Executing CLI Command simulation...
Sum Result: 400""",
            "stepByStep": [
                "Line 5: `runCliTool` accepts standard `argc` and `argv` signatures.",
                "Line 6-9: Validate that at least one argument was passed.",
                "Line 11-14: Support `--help` command flag.",
                "Line 16-30: Check for `--sum` command, convert arguments using `strtol`, validate `endptr`, and print sum.",
                "Line 34-39: `main` demonstrates passing mock argument strings to `runCliTool` to simulate terminal execution."
            ],
            "dryRun": "mockArgv has 4 tokens. argv[1] matches '--sum'. strtol parses 150 and 250. Sum Result: 400 printed.",
            "keyTakeaways": [
                "argc reports total argument count; argv is an array of string pointers.",
                "argv[0] is the program name; argv[argc] is always NULL.",
                "strtol() is the robust, safe standard for string-to-integer conversion.",
                "Modular programming isolates interfaces into .h headers and code into .c source files.",
                "AddressSanitizer (-fsanitize=address) detects memory leaks and out-of-bounds errors at runtime."
            ],
            "commonMistakes": [
                {
                    "mistake": "Accessing argv[1] without first checking if argc >= 2.",
                    "whyWrong": "If the user runs the program without arguments, accessing argv[1] dereferences NULL, causing an immediate crash.",
                    "correction": "Always guard: if (argc < 2) { /* handle error */ return 1; }",
                    "explanation": "Never access array indices without verifying bounds."
                },
                {
                    "mistake": "Placing function definitions in header files (.h) instead of declarations.",
                    "whyWrong": "If two .c files include that header, the compiler outputs 'multiple definition' linker errors.",
                    "correction": "Put function prototypes in .h files and function definitions in .c files (unless marked inline).",
                    "explanation": "Headers declare the interface; source files provide the concrete implementation."
                }
            ],
            "realWorldExample": {
                "scenario": "Git Command-Line Subcommand Dispatcher",
                "code": """#include <stdio.h>
#include <string.h>

void dispatchGitCommand(const char *subcmd) {
    if (strcmp(subcmd, "commit") == 0) printf("Executing git-commit\\n");
    else if (strcmp(subcmd, "push") == 0) printf("Executing git-push\\n");
    else printf("Unknown git subcommand\\n");
}

int main(void) {
    dispatchGitCommand("commit");
    return 0;
}""",
                "explanation": "Production CLI utilities like Git, Docker, and Kubectl use argv[1] to dispatch subcommands to specialized subsystem modules."
            },
            "practice": {
                "prompt": "Write a function `long parseAndDouble(const char *str)` using `strtol` that converts a string to integer and returns double its value.",
                "starterCode": """#include <stdio.h>
#include <stdlib.h>

long parseAndDouble(const char *str) {
    // Use strtol to parse and multiply by 2
    return 0;
}

int main(void) {
    printf("Result: %ld\\n", parseAndDouble("42"));
    return 0;
}""",
                "solution": """#include <stdio.h>
#include <stdlib.h>

long parseAndDouble(const char *str) {
    char *endptr;
    long val = strtol(str, &endptr, 10);
    return val * 2;
}

int main(void) {
    printf("Result: %ld\\n", parseAndDouble("42")); // 84
    return 0;
}""",
                "hints": [
                    "char *endptr; long val = strtol(str, &endptr, 10);",
                    "return val * 2;"
                ]
            },
            "quiz": [
                {
                    "id": "q-c-adv-cli-1",
                    "question": "What is argv[0] in a standard C program?",
                    "options": [
                        "The first user-supplied argument",
                        "The program's executable name or invocation path",
                        "The total number of arguments",
                        "A NULL pointer"
                    ],
                    "correctIndex": 1,
                    "explanation": "argv[0] holds the string representing the program name or path used to invoke the binary."
                },
                {
                    "id": "q-c-adv-cli-2",
                    "question": "What does the C standard guarantee about argv[argc]?",
                    "options": [
                        "It is an empty string \"\"",
                        "It is guaranteed to be a NULL pointer",
                        "It contains the environment variables",
                        "It is an uninitialized dangling pointer"
                    ],
                    "correctIndex": 1,
                    "explanation": "The C standard explicitly requires argv[argc] to be a NULL pointer sentinel."
                },
                {
                    "id": "q-c-adv-cli-3",
                    "question": "Why is strtol() preferred over atoi() for parsing integer arguments?",
                    "options": [
                        "strtol() supports error detection via endptr and handles integer overflow",
                        "atoi() is deprecated in C99",
                        "strtol() uses stack memory while atoi() uses heap",
                        "strtol() is faster"
                    ],
                    "correctIndex": 0,
                    "explanation": "strtol provides the endptr to verify full conversion and sets errno on overflow, whereas atoi cannot distinguish failure from 0."
                },
                {
                    "id": "q-c-adv-cli-4",
                    "question": "In modular C programming, what should be placed inside header files (.h)?",
                    "options": [
                        "Executable function bodies and global variable definitions",
                        "Function prototypes, typedef aliases, macro constants, and struct definitions",
                        "Main function implementation",
                        "Assembly instructions"
                    ],
                    "correctIndex": 1,
                    "explanation": "Headers declare the public types, prototypes, and constants without generating multiple definition errors."
                }
            ],
            "codingChallenge": {
                "title": "Command-Line Flag Evaluator",
                "difficulty": "Easy",
                "problem_statement": "Write a function `int evaluateArgs(int argc, char *argv[])` that parses:\n- If `argv[1]` is `\"--multiply\"`: multiplies `argv[2]` and `argv[3]` (parsed with `strtol`), and prints:\n`Product: <result>`\n\nIn `main()`:\nPass mock arguments: `{\"app\", \"--multiply\", \"7\", \"8\", NULL}` with `argc = 4`.\nOutput exact format:\n`Product: 56`",
                "input_format": "None.",
                "output_format": "Product: 56",
                "constraints": "Must use strtol for conversion and strcmp for flag check.",
                "starter_code": """#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Implement evaluateArgs

int main(void) {
    char *mockArgv[] = {"app", "--multiply", "7", "8", NULL};
    // Call evaluateArgs
    return 0;
}""",
                "expected_output": "Product: 56",
                "test_cases": [
                    {
                        "input": "",
                        "expected_output": "Product: 56",
                        "is_hidden": false
                    }
                ]
            },
            "summary": [
                "argc and argv grant programs access to terminal CLI arguments.",
                "strtol() provides safe, error-checked string-to-number parsing.",
                "Modular programming decouples headers (.h) from implementation source (.c).",
                "AddressSanitizer and Valgrind detect memory corruption and leaks.",
                "Command-line arguments form the foundation of Unix philosophy utility design."
            ],
            "content_standard": "Comprehensive analysis of command-line argument parsing, strtol, modular multi-file compilation, and memory sanitizers.",
            "content_detailed": "Process environment vectors (char **envp), getopt/getopt_long POSIX parsing, static vs dynamic library linking (.a vs .so).",
            "content_simplified": "argc and argv let you pass options and numbers to your program when you launch it from the terminal."
        },
        {
            "id": "top-c-library-project",
            "number": 16,
            "numberDisplay": "16",
            "moduleId": "mod-c-adv-algorithms-systems",
            "moduleTitle": "Module 4: Algorithms and Systems Programming",
            "title": "Final Mini Project – Library Management System",
            "slug": "library-management-system-project",
            "language": "c",
            "difficulty": "Advanced Project",
            "estimatedMinutes": 80,
            "prerequisiteId": "top-c-command-line-modular",
            "shortDescription": "Capstone Project: Build a complete, production-grade Library Management System in C combining structs, dynamic linked lists, persistent file I/O, search, and memory management.",
            "learningObjectives": [
                "Architect a multi-component C systems application using structures and dynamic linked lists.",
                "Implement full CRUD operations: Add, Display, Search, Update, and Delete records.",
                "Implement library transactions: Issue and Return books with user ID associations.",
                "Persist catalog data across executions using text and binary file operations.",
                "Handle dynamic memory allocation failures and prevent heap leaks with clean deallocation.",
                "Build an interactive menu-driven command interface with rigorous input validation."
            ],
            "conceptExplanation": """### 1. Project Overview & Architecture
The **Library Management System** is the capstone project uniting all 16 topics of the Advanced C Systems & Data Structures course. It represents an industrial-grade, menu-driven systems application.

### 2. Core Data Structures Used
1. **`Book` Structure**:
   ```c
   struct Book {
       int id;
       char title[64];
       char author[64];
       int year;
       int isIssued;          // 0 = Available, 1 = Issued
       int issuedToUserId;    // User ID who borrowed the book
       struct Book *next;     // Singly linked list pointer
   };
   ```
2. **`User` Structure**:
   ```c
   struct User {
       int userId;
       char name[64];
       int borrowedCount;
   };
   ```

### 3. Key Functional Modules
- **Book Catalog CRUD**:
  - `addBook(head, id, title, author, year)`: Dynamically allocates and prepends/appends book node.
  - `displayBooks(head)`: Traverses linked list and renders tabular catalog.
  - `searchBook(head, id)`: Searches by primary ID in $O(n)$ time.
  - `updateBook(head, id, newTitle, newYear)`: Updates book metadata in-place.
  - `deleteBook(head, id)`: Removes book node and re-stitches neighbor pointers.
- **Transaction Engine**:
  - `issueBook(head, bookId, userId)`: Marks book as issued and records borrower.
  - `returnBook(head, bookId)`: Clears issue status.
- **Persistence Engine**:
  - `saveToFile(head, filename)`: Writes all linked nodes to disk storage.
  - `loadFromFile(filename)`: Reconstructs dynamic heap linked list on application startup.
- **Memory Safety & Cleanup**:
  - `freeLibrary(head)`: Traverses and frees every heap node upon application exit.

### 4. Step-by-Step Execution Walkthrough
1. **Startup**: Program opens catalog file; if found, reads saved books into heap linked list.
2. **Interactive Menu**: User selects action (1. Add Book, 2. Display All, 3. Search, 4. Issue, 5. Return, 6. Delete, 7. Save & Exit).
3. **Execution**: Selected operation mutates dynamic linked list in RAM.
4. **Shutdown**: Serializes state to disk and safely frees all heap nodes.

### 5. Memory Management & Leak Prevention
Every node created via `malloc(sizeof(struct Book))` is registered in the list. During termination, `freeLibrary()` safely traverses the chain with a temporary pointer to guarantee zero memory leaks.""",
            "visualDiagram": """LIBRARY MANAGEMENT SYSTEM ARCHITECTURE:

  +-------------------------------------------------------------+
  |              Menu-Driven User Interface (CLI)               |
  +-------------------------------------------------------------+
         |                      |                       |
         v                      v                       v
  [ Catalog CRUD ]     [ Transaction Engine ]   [ Persistence Engine ]
  (Add, Edit, Del)     (Issue / Return Book)    (fopen, fread, fwrite)
         |                      |                       |
         +----------------------+-----------------------+
                                |
                                v
               [ Dynamic Heap Linked List Memory ]
               Node 1: [ID: 101 | "Clean Code"  | next*]
                                     |
                                     v
               Node 2: [ID: 102 | "The C Lang"   | next*]
                                     |
                                     v
               Node 3: [ID: 103 | "Data Structs" | NULL ]""",
            "syntax": """// Library Management System Headers
struct Book* addBook(struct Book *head, int id, const char *title, const char *author, int year);
struct Book* searchBook(struct Book *head, int id);
int          issueBook(struct Book *head, int bookId, int userId);
int          returnBook(struct Book *head, int bookId);
struct Book* deleteBook(struct Book *head, int bookId);
void         displayCatalog(const struct Book *head);
void         freeLibrary(struct Book *head);""",
            "simpleExample": {
                "code": """#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct SimpleBook {
    int id;
    char title[32];
    int isIssued;
    struct SimpleBook *next;
};

int main(void) {
    struct SimpleBook b1 = {101, "C Systems", 0, NULL};
    printf("Book: [%d] %s | Status: %s\\n", b1.id, b1.title, b1.isIssued ? "Issued" : "Available");
    return 0;
}""",
                "explanation": "Illustrates the basic book node structure and issuance status."
            },
            "codeExample": """#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct Book {
    int id;
    char title[48];
    char author[32];
    int isIssued;
    int issuedToUserId;
    struct Book *next;
};

struct Book* addBook(struct Book *head, int id, const char *title, const char *author) {
    struct Book *newBook = (struct Book *)malloc(sizeof(struct Book));
    if (!newBook) return head;
    newBook->id = id;
    strncpy(newBook->title, title, sizeof(newBook->title) - 1);
    newBook->title[sizeof(newBook->title) - 1] = '\\0';
    strncpy(newBook->author, author, sizeof(newBook->author) - 1);
    newBook->author[sizeof(newBook->author) - 1] = '\\0';
    newBook->isIssued = 0;
    newBook->issuedToUserId = 0;
    newBook->next = head;
    return newBook;
}

struct Book* searchBook(struct Book *head, int id) {
    struct Book *curr = head;
    while (curr) {
        if (curr->id == id) return curr;
        curr = curr->next;
    }
    return NULL;
}

int issueBook(struct Book *head, int bookId, int userId) {
    struct Book *b = searchBook(head, bookId);
    if (!b || b->isIssued) return 0;
    b->isIssued = 1;
    b->issuedToUserId = userId;
    return 1;
}

int returnBook(struct Book *head, int bookId) {
    struct Book *b = searchBook(head, bookId);
    if (!b || !b->isIssued) return 0;
    b->isIssued = 0;
    b->issuedToUserId = 0;
    return 1;
}

void displayCatalog(const struct Book *head) {
    printf("=== Library Catalog ===\\n");
    const struct Book *curr = head;
    while (curr) {
        printf("ID: %d | Title: %-22s | Author: %-15s | Status: %s\\n",
               curr->id, curr->title, curr->author,
               curr->isIssued ? "ISSUED" : "AVAILABLE");
        curr = curr->next;
    }
}

void freeLibrary(struct Book *head) {
    struct Book *curr = head;
    while (curr) {
        struct Book *temp = curr;
        curr = curr->next;
        free(temp);
    }
}

int main(void) {
    struct Book *library = NULL;

    // 1. Add Books
    library = addBook(library, 101, "The C Programming Lang", "Kernighan & Ritchie");
    library = addBook(library, 102, "Advanced Unix Env",    "W. Richard Stevens");
    library = addBook(library, 103, "Clean Architecture",   "Robert C. Martin");

    // 2. Issue a book
    issueBook(library, 102, 5001);

    // 3. Display Catalog
    displayCatalog(library);

    // 4. Return book
    returnBook(library, 102);

    // 5. Clean Memory
    freeLibrary(library);
    printf("Library memory safely released.\\n");
    return 0;
}""",
            "expectedOutput": """=== Library Catalog ===
ID: 103 | Title: Clean Architecture     | Author: Robert C. Martin | Status: AVAILABLE
ID: 102 | Title: Advanced Unix Env      | Author: W. Richard Stevens | Status: ISSUED
ID: 101 | Title: The C Programming Lang | Author: Kernighan & Ritchie | Status: AVAILABLE
Library memory safely released.""",
            "stepByStep": [
                "Line 5-12: `struct Book` models books with ID, title, author, issuance state, borrower ID, and next pointer.",
                "Line 14-26: `addBook` allocates a node on heap, initializes fields safely with `strncpy`, and prepends to head in O(1).",
                "Line 28-35: `searchBook` traverses the linked list by ID.",
                "Line 37-51: `issueBook` and `returnBook` validate and update issuance state.",
                "Line 53-62: `displayCatalog` prints formatted tabular records.",
                "Line 64-71: `freeLibrary` safely deallocates every book node to prevent memory leaks."
            ],
            "dryRun": "Add 101, 102, 103. Issue 102 to user 5001. Catalog displays 103 (avail), 102 (issued), 101 (avail). Return 102. Free all 3 nodes.",
            "keyTakeaways": [
                "Real C systems combine structures, pointers, dynamic memory, algorithms, and file handling.",
                "Dynamic linked lists provide scalable storage without arbitrary static array bounds.",
                "Clear separation into modular functions ensures clean architecture and maintainability.",
                "Always check for NULL pointers after malloc and handle missing search targets gracefully.",
                "Pairing dynamic memory allocations with comprehensive deallocation prevents resource leaks."
            ],
            "commonMistakes": [
                {
                    "mistake": "Using gets() or unconstrained scanf(\"%s\", title) when capturing user input in the menu loop.",
                    "whyWrong": "Allows buffer overflow vulnerabilities if the user enters more characters than the buffer size.",
                    "correction": "Use fgets(buffer, sizeof(buffer), stdin) and strip trailing newlines.",
                    "explanation": "Buffer security is paramount in systems programming."
                },
                {
                    "mistake": "Forgetting to update the head pointer when deleting the first book in the list.",
                    "whyWrong": "Failing to update head causes head to point to deallocated memory (dangling pointer).",
                    "correction": "Pass struct Book **head (pointer-to-pointer) or return the updated head pointer from delete functions.",
                    "explanation": "Deleting the head node requires updating the caller's head variable."
                }
            ],
            "realWorldExample": {
                "scenario": "Commercial Inventory & Asset Tracking Engine",
                "code": """#include <stdio.h>

struct Asset {
    int assetTag;
    char name[48];
    int isCheckedOut;
    struct Asset *next;
};

int main(void) {
    printf("Warehouse logistics and asset systems use linked-record architectures for inventory.\\n");
    return 0;
}""",
                "explanation": "Enterprise asset tracking tools in warehouses and data centers maintain active inventory records in dynamic memory backed by persistent disk storage."
            },
            "practice": {
                "prompt": "Add a function `int countIssuedBooks(const struct Book *head)` that counts how many books currently have `isIssued == 1`.",
                "starterCode": """#include <stdio.h>

struct Book {
    int id;
    int isIssued;
    struct Book *next;
};

int countIssuedBooks(const struct Book *head) {
    // Return count of issued books
    return 0;
}

int main(void) {
    struct Book b1 = {1, 1, NULL};
    struct Book b2 = {2, 0, &b1};
    printf("Issued count: %d\\n", countIssuedBooks(&b2));
    return 0;
}""",
                "solution": """#include <stdio.h>

struct Book {
    int id;
    int isIssued;
    struct Book *next;
};

int countIssuedBooks(const struct Book *head) {
    int count = 0;
    const struct Book *curr = head;
    while (curr) {
        if (curr->isIssued) count++;
        curr = curr->next;
    }
    return count;
}

int main(void) {
    struct Book b1 = {1, 1, NULL};
    struct Book b2 = {2, 0, &b1};
    printf("Issued count: %d\\n", countIssuedBooks(&b2)); // 1
    return 0;
}""",
                "hints": [
                    "Loop through list with curr = curr->next",
                    "If curr->isIssued == 1, increment count"
                ]
            },
            "quiz": [
                {
                    "id": "q-c-adv-proj-1",
                    "question": "Why is a linked list chosen over a fixed array for storing books in the Library Management System?",
                    "options": [
                        "Linked lists use less memory per book",
                        "Linked lists allow dynamic addition and deletion of books at runtime without arbitrary fixed size limits",
                        "Linked lists can be saved to disk faster",
                        "Arrays cannot store strings"
                    ],
                    "correctIndex": 1,
                    "explanation": "Linked lists grow and shrink dynamically on the heap as books are added and deleted, without requiring a predetermined maximum capacity."
                },
                {
                    "id": "q-c-adv-proj-2",
                    "question": "When deleting a book from a singly linked list, why must the predecessor node's next pointer be updated?",
                    "options": [
                        "To prevent the compiler from throwing a syntax error",
                        "To bypass the deleted node and preserve list continuity",
                        "To automatically free memory",
                        "To sort the list"
                    ],
                    "correctIndex": 1,
                    "explanation": "Re-stitching prev->next = curr->next ensures the chain remains unbroken when curr is freed."
                },
                {
                    "id": "q-c-adv-proj-3",
                    "question": "What is the critical step when shutting down a dynamic C application?",
                    "options": [
                        "Deleting the binary file",
                        "Traversing and freeing every dynamically allocated heap node to prevent memory leaks",
                        "Calling exit(0) immediately without freeing",
                        "Clearing console screen"
                    ],
                    "correctIndex": 1,
                    "explanation": "Freeing all allocated nodes ensures clean resource management and prevents memory leaks."
                },
                {
                    "id": "q-c-adv-proj-4",
                    "question": "How can the Library Management System achieve persistent storage across computer restarts?",
                    "options": [
                        "By declaring all variables static",
                        "By saving the records to a secondary storage file (text or binary) using fopen/fwrite/fprintf and loading on startup",
                        "By storing records in the CPU registers",
                        "By keeping the program running forever"
                    ],
                    "correctIndex": 1,
                    "explanation": "Serializing records to disk files via standard file I/O guarantees data persistence across sessions."
                }
            ],
            "codingChallenge": {
                "title": "Library Catalog Kernel: Add, Search, and Issue",
                "difficulty": "Medium",
                "problem_statement": "Implement the core engine of the Library Management System:\n1. Define `struct Book` with `id` (int), `isIssued` (int), and `next` pointer.\n2. Implement `struct Book* addBook(struct Book *head, int id)`: prepends book (isIssued=0).\n3. Implement `int issueBook(struct Book *head, int id)`: marks book as issued (`isIssued = 1`), returning 1 if successful, 0 if not found or already issued.\n\nIn `main()`:\n- Add books 101, 102, 103.\n- Issue book 102 (returns 1).\n- Attempt to re-issue book 102 (returns 0).\n- Print exact format:\n`Issue 102: Success | Re-issue 102: Failed | Total: 3`\n- Free all nodes.",
                "input_format": "None.",
                "output_format": "Issue 102: Success | Re-issue 102: Failed | Total: 3",
                "constraints": "Must allocate nodes dynamically and free all memory.",
                "starter_code": """#include <stdio.h>
#include <stdlib.h>

// Define struct Book and implement kernel functions

int main(void) {
    // Implement verification
    return 0;
}""",
                "expected_output": "Issue 102: Success | Re-issue 102: Failed | Total: 3",
                "test_cases": [
                    {
                        "input": "",
                        "expected_output": "Issue 102: Success | Re-issue 102: Failed | Total: 3",
                        "is_hidden": false
                    }
                ]
            },
            "summary": [
                "The Library Management System integrates structs, dynamic memory, linked lists, and file persistence.",
                "Dynamic linked lists facilitate scalable addition, updating, and deletion of records.",
                "Transaction operations (issue and return) mutate node states in memory.",
                "File handling ensures data survives process termination.",
                "Comprehensive memory management (freeLibrary) guarantees zero heap leaks."
            ],
            "content_standard": "Comprehensive capstone project integrating C structures, self-referential linked lists, file handling, and memory lifecycle.",
            "content_detailed": "Complete menu-driven CLI architecture, error-handling matrices, file serialization, and memory leak audit for the Library Management System.",
            "content_simplified": "The final project brings everything you learned together to build a real library computer system from scratch in C."
        }
    ]
