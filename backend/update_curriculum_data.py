"""Script to enrich platformData.json with comprehensive, verified LeetCode-style coding challenges across Python and C."""

import json
import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.services.code_executor import code_executor

DATA_PATH = PROJECT_ROOT / "src" / "data" / "platformData.json"

with open(DATA_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

# 1. Update/Ensure Modules
modules = data.get("modules", [])
existing_mod_ids = {m["id"] for m in modules}

new_modules = [
    {
        "id": "mod-c-1",
        "course_id": "c-beg",
        "title": "Stage 1: Core Syntax, Data Types & Control Flow",
        "order_index": 1
    },
    {
        "id": "mod-c-2",
        "course_id": "c-int",
        "title": "Stage 2: Pointers, Functions & Dynamic Memory",
        "order_index": 2
    },
    {
        "id": "mod-c-3",
        "course_id": "c-adv",
        "title": "Stage 3: Structures, Unions & Systems Programming",
        "order_index": 3
    },
    {
        "id": "mod-py-7",
        "course_id": "py-adv",
        "title": "Stage 7: Object-Oriented Programming (Classes & Objects)",
        "order_index": 7
    }
]

for nm in new_modules:
    idx = next((i for i, m in enumerate(modules) if m["id"] == nm["id"]), None)
    if idx is not None:
        modules[idx] = nm
    else:
        modules.append(nm)

data["modules"] = modules

# 2. Update/Ensure Topics
topics = data.get("topics", [])
new_topics = [
    # Python Beginner Topics (Direct script, no function wrapper)
    {
        "id": "top-py-fundamentals",
        "module_id": "mod-py-1",
        "title": "Language Fundamentals, Datatypes & Immutability",
        "order_index": 1,
        "content_path": "rag/documents/PYTHON/python_fundamentals.txt"
    },
    {
        "id": "top-py-operators-io",
        "module_id": "mod-py-1",
        "title": "Operators & Dynamic Input/Output Statements",
        "order_index": 2,
        "content_path": "rag/documents/PYTHON/python_fundamentals.txt"
    },
    {
        "id": "top-py-flow-control",
        "module_id": "mod-py-2",
        "title": "Flow Control, Conditionals & Transfer Statements",
        "order_index": 1,
        "content_path": "rag/documents/PYTHON/python_control_flow.txt"
    },
    {
        "id": "top-py-loops",
        "module_id": "mod-py-2",
        "title": "Loops, Iteration Constructs & Pattern Printing",
        "order_index": 2,
        "content_path": "rag/documents/PYTHON/python_control_flow.txt"
    },
    # Python Intermediate
    {
        "id": "top-py-strings",
        "module_id": "mod-py-3",
        "title": "In-Depth String Operations, Slicing & Algorithms",
        "order_index": 1,
        "content_path": "rag/documents/PYTHON/python_data_structures.txt"
    },
    {
        "id": "top-py-lists",
        "module_id": "mod-py-4",
        "title": "List Data Structure, Matrices & Comprehensions",
        "order_index": 1,
        "content_path": "rag/documents/PYTHON/python_data_structures.txt"
    },
    {
        "id": "top-py-tuples-sets",
        "module_id": "mod-py-5",
        "title": "Tuples and Sets Data Structures",
        "order_index": 1,
        "content_path": "rag/documents/PYTHON/python_data_structures.txt"
    },
    {
        "id": "top-py-dictionaries",
        "module_id": "mod-py-5",
        "title": "Dictionary Data Structure & Hash Tables",
        "order_index": 2,
        "content_path": "rag/documents/PYTHON/python_data_structures.txt"
    },
    # Python Function Topics (Uses ONLY functions)
    {
        "id": "top-py-functions",
        "module_id": "mod-py-6",
        "title": "Functions, Parameters & Scope (LEGB)",
        "order_index": 1,
        "content_path": "rag/documents/PYTHON/python_functions.txt"
    },
    {
        "id": "top-py-recursion",
        "module_id": "mod-py-6",
        "title": "Recursion and Recursive Thinking",
        "order_index": 2,
        "content_path": "rag/documents/PYTHON/python_functions.txt"
    },
    {
        "id": "top-py-modules-regex",
        "module_id": "mod-py-6",
        "title": "Modules, Math, Random & Regular Expressions",
        "order_index": 3,
        "content_path": "rag/documents/PYTHON/python_exceptions_modules.txt"
    },
    # Python OOP Topic (Uses Class and Object)
    {
        "id": "top-py-oop",
        "module_id": "mod-py-7",
        "title": "Classes, Objects, Encapsulation & Methods",
        "order_index": 1,
        "content_path": "rag/documents/PYTHON/python_oop.txt"
    },
    # C Beginner Topics (Direct main, no helper function)
    {
        "id": "top-c-fundamentals",
        "module_id": "mod-c-1",
        "title": "C Fundamentals, Data Types & Console I/O",
        "order_index": 1,
        "content_path": "rag/documents/C/c_fundamentals.txt"
    },
    {
        "id": "top-c-operators",
        "module_id": "mod-c-1",
        "title": "Arithmetic, Relational & Conditional Operators",
        "order_index": 2,
        "content_path": "rag/documents/C/c_fundamentals.txt"
    },
    {
        "id": "top-c-control-flow",
        "module_id": "mod-c-1",
        "title": "Decision Making & Branching (if-else, switch)",
        "order_index": 3,
        "content_path": "rag/documents/C/c_control_flow.txt"
    },
    {
        "id": "top-c-loops",
        "module_id": "mod-c-1",
        "title": "Iteration & Loop Architecture (for, while, do-while)",
        "order_index": 4,
        "content_path": "rag/documents/C/c_control_flow.txt"
    },
    {
        "id": "top-c-arrays",
        "module_id": "mod-c-1",
        "title": "Single & Multidimensional Array Processing",
        "order_index": 5,
        "content_path": "rag/documents/C/c_arrays_strings.txt"
    },
    # C Intermediate Topics
    {
        "id": "top-c-strings",
        "module_id": "mod-c-2",
        "title": "String Processing & Character Sequences",
        "order_index": 1,
        "content_path": "rag/documents/C/c_arrays_strings.txt"
    },
    {
        "id": "top-c-functions",
        "module_id": "mod-c-2",
        "title": "Functions, Parameters & Call-by-Value",
        "order_index": 2,
        "content_path": "rag/documents/C/c_functions.txt"
    },
    {
        "id": "top-c-pointers",
        "module_id": "mod-c-2",
        "title": "Pointers and Memory Addressing",
        "order_index": 3,
        "content_path": "rag/documents/C/c_pointers_memory.txt"
    },
    {
        "id": "top-c-malloc",
        "module_id": "mod-c-2",
        "title": "Dynamic Memory Allocation (malloc, calloc, free)",
        "order_index": 4,
        "content_path": "rag/documents/C/c_pointers_memory.txt"
    },
    # C Advanced Topics
    {
        "id": "top-c-structures",
        "module_id": "mod-c-3",
        "title": "Structures, Unions & Typedef Architecture",
        "order_index": 1,
        "content_path": "rag/documents/C/c_structures_unions.txt"
    }
]

for nt in new_topics:
    idx = next((i for i, t in enumerate(topics) if t["id"] == nt["id"]), None)
    if idx is not None:
        topics[idx] = {**topics[idx], **nt}
    else:
        topics.append(nt)

data["topics"] = topics

# 3. Comprehensive Coding Challenges (Beginning to Advanced)
# Categorical rules:
# - Beginner topics: Direct procedural script, NO function wrapper in Python, direct main in C!
# - Function topics: Uses ONLY functions!
# - OOP topics: Uses Class and Object!
# - ALL starter codes PASS all test cases!

coding_questions = [
    # 1. Beginner: Fundamentals (Base Conversion)
    {
        "id": "code-py-base-conversion",
        "topic_id": "top-py-fundamentals",
        "title": "Integer Base Conversion & Identity Inspector",
        "difficulty": "Easy",
        "problem_statement": "Given a single non-negative integer N from standard input, print its binary, octal, and hexadecimal representations on a single line separated by a single space.",
        "input_format": "A single non-negative integer N on standard input.",
        "output_format": "Three space-separated strings: the binary representation (with 0b prefix), octal representation (with 0o prefix), and hexadecimal representation (with 0x prefix).",
        "constraints": "0 <= N <= 10^9",
        "sample_input": "15",
        "sample_output": "0b1111 0o17 0xf",
        "starter_code": {
            "python": "import sys\n\nraw = sys.stdin.read().strip()\nif raw:\n    n = int(raw)\n    print(f\"{bin(n)} {oct(n)} {hex(n)}\")\n",
            "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"0b\");\n        if (n == 0) {\n            printf(\"0\");\n        } else {\n            int temp = n;\n            int bits[32];\n            int count = 0;\n            while (temp > 0) {\n                bits[count] = temp % 2;\n                count++;\n                temp /= 2;\n            }\n            for (int i = count - 1; i >= 0; i--) {\n                printf(\"%d\", bits[i]);\n            }\n        }\n        printf(\" 0o%o 0x%x\\n\", n, n);\n    }\n    return 0;\n}\n"
        },

        "test_cases": [
            {"input": "15", "expected_output": "0b1111 0o17 0xf", "is_hidden": False},
            {"input": "0", "expected_output": "0b0 0o0 0x0", "is_hidden": False},
            {"input": "255", "expected_output": "0b11111111 0o377 0xff", "is_hidden": True},
            {"input": "100", "expected_output": "0b1100100 0o144 0x64", "is_hidden": True}
        ]
    },
    # 2. Beginner: Operators & I/O (Min of 3 numbers)
    {
        "id": "code-py-min-ternary",
        "topic_id": "top-py-operators-io",
        "title": "Find Minimum of 3 Numbers with Conditional Operator",
        "difficulty": "Easy",
        "problem_statement": "Read three space-separated integers A, B, and C from standard input and output the minimum value among them.",
        "input_format": "A single line containing three space-separated integers A, B, and C.",
        "output_format": "A single integer representing the minimum value.",
        "constraints": "-10^6 <= A, B, C <= 10^6",
        "sample_input": "10 20 5",
        "sample_output": "5",
        "starter_code": {
            "python": "import sys\n\nraw = sys.stdin.read().strip()\nif raw:\n    a, b, c = [int(x) for x in raw.split()]\n    min_val = a if a < b and a < c else (b if b < c else c)\n    print(min_val)\n",
            "c": "#include <stdio.h>\n\nint main() {\n    int a, b, c;\n    if (scanf(\"%d %d %d\", &a, &b, &c) == 3) {\n        int min_val = a;\n        if (b < min_val) min_val = b;\n        if (c < min_val) min_val = c;\n        printf(\"%d\\n\", min_val);\n    }\n    return 0;\n}\n"
        },
        "test_cases": [
            {"input": "10 20 5", "expected_output": "5", "is_hidden": False},
            {"input": "30 10 20", "expected_output": "10", "is_hidden": False},
            {"input": "-5 -1 -10", "expected_output": "-10", "is_hidden": True},
            {"input": "7 7 7", "expected_output": "7", "is_hidden": True}
        ]
    },
    # 3. Beginner: Flow Control (Triangle Generator)
    {
        "id": "code-py-pattern-triangle",
        "topic_id": "top-py-flow-control",
        "title": "Right-Angled Number Triangle Generator",
        "difficulty": "Easy",
        "problem_statement": "Read an integer N (1 <= N <= 9) from standard input and print a right-angled number triangle of N rows. In each row i (from 1 to N), print the number i repeated i times, separated by a single space.",
        "input_format": "A single positive integer N.",
        "output_format": "N lines representing the number triangle pattern.",
        "constraints": "1 <= N <= 9",
        "sample_input": "4",
        "sample_output": "1\n2 2\n3 3 3\n4 4 4 4",
        "starter_code": {
            "python": "import sys\n\nraw = sys.stdin.read().strip()\nif raw:\n    n = int(raw)\n    for i in range(1, n + 1):\n        print(\" \".join([str(i)] * i))\n",
            "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        for (int i = 1; i <= n; i++) {\n            for (int j = 0; j < i; j++) {\n                printf(\"%d%s\", i, (j == i - 1) ? \"\" : \" \");\n            }\n            printf(\"\\n\");\n        }\n    }\n    return 0;\n}\n"
        },
        "test_cases": [
            {"input": "4", "expected_output": "1\n2 2\n3 3 3\n4 4 4 4", "is_hidden": False},
            {"input": "1", "expected_output": "1", "is_hidden": False},
            {"input": "3", "expected_output": "1\n2 2\n3 3 3", "is_hidden": True},
            {"input": "5", "expected_output": "1\n2 2\n3 3 3\n4 4 4 4\n5 5 5 5 5", "is_hidden": True}
        ]
    },
    # 4. Beginner: Loops (Sum of Even Numbers)
    {
        "id": "code-py-sum-evens",
        "topic_id": "top-py-loops",
        "title": "Sum of Even Numbers up to N",
        "difficulty": "Easy",
        "problem_statement": "Read a single positive integer N from standard input. Calculate and print the sum of all positive even integers from 1 up to and including N.",
        "input_format": "A single positive integer N.",
        "output_format": "A single integer representing the sum of even numbers.",
        "constraints": "1 <= N <= 1000",
        "sample_input": "6",
        "sample_output": "12",
        "starter_code": {
            "python": "import sys\n\nraw = sys.stdin.read().strip()\nif raw:\n    n = int(raw)\n    total = sum(i for i in range(2, n + 1, 2))\n    print(total)\n",
            "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        int sum = 0;\n        for (int i = 2; i <= n; i += 2) {\n            sum += i;\n        }\n        printf(\"%d\\n\", sum);\n    }\n    return 0;\n}\n"
        },
        "test_cases": [
            {"input": "6", "expected_output": "12", "is_hidden": False},
            {"input": "10", "expected_output": "30", "is_hidden": False},
            {"input": "1", "expected_output": "0", "is_hidden": True},
            {"input": "20", "expected_output": "110", "is_hidden": True}
        ]
    },
    # 5. Intermediate: Strings (Alternate String Merger)
    {
        "id": "code-py-str-merge",
        "topic_id": "top-py-strings",
        "title": "Alternate String Character Merger",
        "difficulty": "Medium",
        "problem_statement": "Read two space-separated strings s1 and s2 from standard input. Merge them by taking characters alternately starting with s1. If one string is longer than the other, append the remaining characters to the end.",
        "input_format": "Two space-separated strings s1 and s2 on a single line.",
        "output_format": "The merged string.",
        "constraints": "1 <= len(s1), len(s2) <= 500",
        "sample_input": "karthi sahasra",
        "sample_output": "ksaarhtahsira",
        "starter_code": {
            "python": "import sys\n\nparts = sys.stdin.read().strip().split()\nif len(parts) >= 2:\n    s1, s2 = parts[0], parts[1]\n    merged = []\n    i, j = 0, 0\n    while i < len(s1) or j < len(s2):\n        if i < len(s1):\n            merged.append(s1[i])\n            i += 1\n        if j < len(s2):\n            merged.append(s2[j])\n            j += 1\n    print(\"\".join(merged))\n",
            "c": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s1[600], s2[600];\n    if (scanf(\"%s %s\", s1, s2) == 2) {\n        int i = 0;\n        int j = 0;\n        int len1 = strlen(s1);\n        int len2 = strlen(s2);\n        while (i < len1 || j < len2) {\n            if (i < len1) {\n                printf(\"%c\", s1[i]);\n                i++;\n            }\n            if (j < len2) {\n                printf(\"%c\", s2[j]);\n                j++;\n            }\n        }\n        printf(\"\\n\");\n    }\n    return 0;\n}\n"
        },
        "test_cases": [
            {"input": "karthi sahasra", "expected_output": "ksaarhtahsira", "is_hidden": False},
            {"input": "abc 12345", "expected_output": "a1b2c345", "is_hidden": False},
            {"input": "hello world", "expected_output": "hweolrllod", "is_hidden": True},
            {"input": "ab c", "expected_output": "acb", "is_hidden": True}
        ]
    },
    # 6. Intermediate: Lists (Matrix Transpose)
    {
        "id": "code-py-matrix-transpose",
        "topic_id": "top-py-lists",
        "title": "Matrix Transposition",
        "difficulty": "Medium",
        "problem_statement": "The first line contains R (rows) and C (columns). The next R lines contain C space-separated integers. Print the transposed matrix of dimension C x R.",
        "input_format": "Line 1: integers R and C. Next R lines: C space-separated integers each.",
        "output_format": "C lines containing R space-separated integers representing the transposed matrix.",
        "constraints": "1 <= R, C <= 50",
        "sample_input": "2 3\n1 2 3\n4 5 6",
        "sample_output": "1 4\n2 5\n3 6",
        "starter_code": {
            "python": "import sys\n\ntokens = sys.stdin.read().strip().split()\nif len(tokens) >= 2:\n    r, c = int(tokens[0]), int(tokens[1])\n    idx = 2\n    matrix = []\n    for i in range(r):\n        row = [int(tokens[idx + j]) for j in range(c)]\n        matrix.append(row)\n        idx += c\n    transposed = [[matrix[i][j] for i in range(r)] for j in range(c)]\n    for row in transposed:\n        print(\" \".join(str(x) for x in row))\n",
            "c": "#include <stdio.h>\n\nint main() {\n    int r, c;\n    if (scanf(\"%d %d\", &r, &c) == 2) {\n        int mat[50][50];\n        for (int i = 0; i < r; i++) {\n            for (int j = 0; j < c; j++) {\n                scanf(\"%d\", &mat[i][j]);\n            }\n        }\n        for (int j = 0; j < c; j++) {\n            for (int i = 0; i < r; i++) {\n                printf(\"%d%s\", mat[i][j], (i == r - 1) ? \"\" : \" \");\n            }\n            printf(\"\\n\");\n        }\n    }\n    return 0;\n}\n"
        },
        "test_cases": [
            {"input": "2 3\n1 2 3\n4 5 6", "expected_output": "1 4\n2 5\n3 6", "is_hidden": False},
            {"input": "2 2\n10 20\n30 40", "expected_output": "10 30\n20 40", "is_hidden": False},
            {"input": "1 3\n5 10 15", "expected_output": "5\n10\n15", "is_hidden": True}
        ]
    },
    # 7. Intermediate: Tuples and Sets (Deduplication)
    {
        "id": "code-py-dedup-list",
        "topic_id": "top-py-tuples-sets",
        "title": "Order-Preserving List Deduplication",
        "difficulty": "Easy",
        "problem_statement": "Read space-separated integers from stdin and print the sequence with all duplicate elements removed, strictly maintaining the order of their first appearance.",
        "input_format": "A single line containing space-separated integers.",
        "output_format": "A single line of space-separated integers with duplicates removed.",
        "constraints": "1 <= N <= 1000",
        "sample_input": "10 20 30 10 20 40",
        "sample_output": "10 20 30 40",
        "starter_code": {
            "python": "import sys\n\nraw = sys.stdin.read().strip()\nif raw:\n    nums = [int(x) for x in raw.split()]\n    seen = set()\n    result = []\n    for x in nums:\n        if x not in seen:\n            seen.add(x)\n            result.append(x)\n    print(\" \".join(str(x) for x in result))\n",
            "c": "#include <stdio.h>\n\nint main() {\n    int x;\n    int seen[1000];\n    int count = 0;\n    while (scanf(\"%d\", &x) == 1) {\n        int exists = 0;\n        for (int i = 0; i < count; i++) {\n            if (seen[i] == x) {\n                exists = 1;\n                break;\n            }\n        }\n        if (!exists) {\n            seen[count++] = x;\n        }\n    }\n    for (int i = 0; i < count; i++) {\n        printf(\"%d%s\", seen[i], (i == count - 1) ? \"\" : \" \");\n    }\n    printf(\"\\n\");\n    return 0;\n}\n"
        },
        "test_cases": [
            {"input": "10 20 30 10 20 40", "expected_output": "10 20 30 40", "is_hidden": False},
            {"input": "5 5 5 5", "expected_output": "5", "is_hidden": False},
            {"input": "1 2 3 4 5", "expected_output": "1 2 3 4 5", "is_hidden": True},
            {"input": "9 1 9 2 9 3", "expected_output": "9 1 2 3", "is_hidden": True}
        ]
    },
    # 8. Intermediate: Dictionaries (Word Frequency)
    {
        "id": "code-py-word-frequency",
        "topic_id": "top-py-dictionaries",
        "title": "Word Frequency Counter",
        "difficulty": "Medium",
        "problem_statement": "Read a line of words from standard input. Count the occurrences of each unique word (case-insensitive) and print each word and its frequency in alphabetical order formatted as 'word: count'.",
        "input_format": "A single line containing space-separated words.",
        "output_format": "Alphabetically sorted lines with 'word: count'.",
        "constraints": "1 <= word count <= 500",
        "sample_input": "apple banana apple Orange banana apple",
        "sample_output": "apple: 3\nbanana: 2\norange: 1",
        "starter_code": {
            "python": "import sys\n\nraw = sys.stdin.read().strip()\nif raw:\n    words = raw.lower().split()\n    freq = {}\n    for w in words:\n        freq[w] = freq.get(w, 0) + 1\n    for w in sorted(freq.keys()):\n        print(f\"{w}: {freq[w]}\")\n",
            "c": "#include <stdio.h>\n#include <string.h>\n#include <ctype.h>\n\nint main() {\n    char w[100];\n    char words[200][100];\n    int counts[200];\n    int total = 0;\n    while (scanf(\"%s\", w) == 1) {\n        for (int k = 0; k < strlen(w); k++) {\n            w[k] = tolower(w[k]);\n        }\n        int found = 0;\n        for (int i = 0; i < total; i++) {\n            if (strcmp(words[i], w) == 0) {\n                counts[i]++;\n                found = 1;\n                break;\n            }\n        }\n        if (!found) {\n            strcpy(words[total], w);\n            counts[total] = 1;\n            total++;\n        }\n    }\n    for (int i = 0; i < total - 1; i++) {\n        for (int j = 0; j < total - i - 1; j++) {\n            if (strcmp(words[j], words[j + 1]) > 0) {\n                char temp_w[100];\n                strcpy(temp_w, words[j]);\n                strcpy(words[j], words[j + 1]);\n                strcpy(words[j + 1], temp_w);\n                int temp_c = counts[j];\n                counts[j] = counts[j + 1];\n                counts[j + 1] = temp_c;\n            }\n        }\n    }\n    for (int i = 0; i < total; i++) {\n        printf(\"%s: %d\\n\", words[i], counts[i]);\n    }\n    return 0;\n}\n"
        },
        "test_cases": [
            {"input": "apple banana apple Orange banana apple", "expected_output": "apple: 3\nbanana: 2\norange: 1", "is_hidden": False},
            {"input": "to be or not to be", "expected_output": "be: 2\nnot: 1\nor: 1\nto: 2", "is_hidden": False},
            {"input": "cat dog bird", "expected_output": "bird: 1\ncat: 1\ndog: 1", "is_hidden": True}
        ]
    },
    # 9. Function Topic: Functions (Palindrome - USES ONLY FUNCTION!)
    {
        "id": "code-py-palindrome",
        "topic_id": "top-py-functions",
        "title": "Palindrome Validator Function",
        "difficulty": "Medium",
        "problem_statement": "Implement the function `is_palindrome(s)` that determines if a given string reads the same forwards and backwards, ignoring non-alphanumeric characters and case sensitivity. Return 'TRUE' if it is a palindrome, otherwise 'FALSE'.",
        "input_format": "A single line of text from standard input.",
        "output_format": "'TRUE' or 'FALSE'.",
        "constraints": "1 <= string length <= 1000",
        "sample_input": "A man, a plan, a canal: Panama",
        "sample_output": "TRUE",
        "starter_code": {
            "python": "import sys\n\ndef is_palindrome(s: str) -> bool:\n    # Function topic: Implement solution inside function\n    cleaned = \"\".join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]\n\nif __name__ == \"__main__\":\n    text = sys.stdin.read().strip()\n    print(\"TRUE\" if is_palindrome(text) else \"FALSE\")\n",
            "c": "#include <stdio.h>\n#include <string.h>\n#include <ctype.h>\n\n// Function topic: Implement solution inside function\nint is_palindrome(char* s) {\n    int left = 0, right = strlen(s) - 1;\n    while (left < right) {\n        while (left < right && !isalnum(s[left])) left++;\n        while (left < right && !isalnum(s[right])) right--;\n        if (tolower(s[left]) != tolower(s[right])) return 0;\n        left++;\n        right--;\n    }\n    return 1;\n}\n\nint main() {\n    char s[1000];\n    if (fgets(s, sizeof(s), stdin)) {\n        printf(\"%s\\n\", is_palindrome(s) ? \"TRUE\" : \"FALSE\");\n    }\n    return 0;\n}\n"
        },
        "test_cases": [
            {"input": "A man, a plan, a canal: Panama", "expected_output": "TRUE", "is_hidden": False},
            {"input": "race a car", "expected_output": "FALSE", "is_hidden": False},
            {"input": "Was it a car or a cat I saw?", "expected_output": "TRUE", "is_hidden": True},
            {"input": "hello", "expected_output": "FALSE", "is_hidden": True}
        ]
    },
    # 10. Function Topic: Recursion (Factorial - USES ONLY FUNCTION!)
    {
        "id": "code-py-factorial",
        "topic_id": "top-py-recursion",
        "title": "Recursive Factorial Engine",
        "difficulty": "Medium",
        "problem_statement": "Implement a pure recursive function `factorial(n)` that returns N! for any non-negative integer N without using iterative loops.",
        "input_format": "A single non-negative integer N.",
        "output_format": "A single integer representing N!.",
        "constraints": "0 <= N <= 15",
        "sample_input": "5",
        "sample_output": "120",
        "starter_code": {
            "python": "import sys\n\ndef factorial(n: int) -> int:\n    # Function topic: pure recursive function\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nif __name__ == \"__main__\":\n    raw = sys.stdin.read().strip()\n    if raw:\n        print(factorial(int(raw)))\n",
            "c": "#include <stdio.h>\n\n// Function topic: pure recursive function\nint factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", factorial(n));\n    }\n    return 0;\n}\n"
        },
        "test_cases": [
            {"input": "5", "expected_output": "120", "is_hidden": False},
            {"input": "0", "expected_output": "1", "is_hidden": False},
            {"input": "1", "expected_output": "1", "is_hidden": True},
            {"input": "6", "expected_output": "720", "is_hidden": True}
        ]
    },
    # 11. OOP Topic: Classes and Objects (Bank Account - MUST USE CLASS AND OBJECT!)
    {
        "id": "code-py-bank-account",
        "topic_id": "top-py-oop",
        "title": "Object-Oriented Bank Account Manager",
        "difficulty": "Medium",
        "problem_statement": "In this Object-Oriented Programming challenge, design a class `BankAccount` containing:\n- `__init__(self, initial_balance: int)`: initializes account balance\n- `deposit(self, amount: int)`: deposits amount into balance\n- `withdraw(self, amount: int) -> bool`: deducts amount if funds exist and returns True, else returns False\n- `get_balance(self) -> int`: returns current balance.\n\nThe input begins with the starting balance, followed by transaction operations ('DEPOSIT X' or 'WITHDRAW X'). Output the final balance.",
        "input_format": "Line 1: Starting balance integer.\nFollowing lines: 'DEPOSIT <amount>' or 'WITHDRAW <amount>'.",
        "output_format": "A single integer representing the final balance.",
        "constraints": "0 <= balance <= 10^8, 1 <= operations <= 100",
        "sample_input": "100\nDEPOSIT 50\nWITHDRAW 30\nDEPOSIT 20",
        "sample_output": "140",
        "starter_code": {
            "python": "import sys\n\n# OOP Topic: Use class and object encapsulation\nclass BankAccount:\n    def __init__(self, initial_balance: int = 0):\n        self.balance = initial_balance\n\n    def deposit(self, amount: int):\n        self.balance += amount\n\n    def withdraw(self, amount: int) -> bool:\n        if self.balance >= amount:\n            self.balance -= amount\n            return True\n        return False\n\n    def get_balance(self) -> int:\n        return self.balance\n\nif __name__ == \"__main__\":\n    lines = sys.stdin.read().strip().split(\"\\n\")\n    if lines and lines[0]:\n        account = BankAccount(int(lines[0]))\n        for line in lines[1:]:\n            parts = line.split()\n            if not parts:\n                continue\n            cmd, val = parts[0], int(parts[1])\n            if cmd == \"DEPOSIT\":\n                account.deposit(val)\n            elif cmd == \"WITHDRAW\":\n                account.withdraw(val)\n        print(account.get_balance())\n",
            "c": "#include <stdio.h>\n#include <string.h>\n\n// OOP Topic in C using Struct and Method Encapsulation\ntypedef struct {\n    int balance;\n} BankAccount;\n\nvoid deposit(BankAccount* acc, int amount) {\n    acc->balance += amount;\n}\n\nint withdraw(BankAccount* acc, int amount) {\n    if (acc->balance >= amount) {\n        acc->balance -= amount;\n        return 1;\n    }\n    return 0;\n}\n\nint main() {\n    int initial;\n    if (scanf(\"%d\", &initial) == 1) {\n        BankAccount acc = { initial };\n        char cmd[20];\n        int val;\n        while (scanf(\"%s %d\", cmd, &val) == 2) {\n            if (strcmp(cmd, \"DEPOSIT\") == 0) deposit(&acc, val);\n            else if (strcmp(cmd, \"WITHDRAW\") == 0) withdraw(&acc, val);\n        }\n        printf(\"%d\\n\", acc.balance);\n    }\n    return 0;\n}\n"
        },
        "test_cases": [
            {"input": "100\nDEPOSIT 50\nWITHDRAW 30\nDEPOSIT 20", "expected_output": "140", "is_hidden": False},
            {"input": "500\nWITHDRAW 200\nWITHDRAW 400", "expected_output": "300", "is_hidden": False},
            {"input": "0\nDEPOSIT 1000\nWITHDRAW 250", "expected_output": "750", "is_hidden": True}
        ]
    },
    # 12. Advanced: Modules & Regex (Mobile Validation)
    {
        "id": "code-py-mobile-regex",
        "topic_id": "top-py-modules-regex",
        "title": "Mobile Number Regular Expression Validator",
        "difficulty": "Medium",
        "problem_statement": "Read a mobile number string from standard input. Print 'VALID' if it is a valid 10-digit number starting with 6, 7, 8, or 9 (an optional leading 0 or +91 prefix is accepted). Otherwise print 'INVALID'.",
        "input_format": "A single line containing the candidate phone number string.",
        "output_format": "'VALID' or 'INVALID'.",
        "constraints": "1 <= string length <= 25",
        "sample_input": "9885768283",
        "sample_output": "VALID",
        "starter_code": {
            "python": "import sys\nimport re\n\nraw = sys.stdin.read().strip()\npattern = r\"(\\+91|0)?[6-9]\\d{9}$\"\nprint(\"VALID\" if re.match(pattern, raw) else \"INVALID\")\n",
            "c": "#include <stdio.h>\n#include <string.h>\n#include <ctype.h>\n\nint main() {\n    char s[50];\n    if (scanf(\"%s\", s) == 1) {\n        int start = 0;\n        if (s[0] == '+' && s[1] == '9' && s[2] == '1') start = 3;\n        else if (s[0] == '0') start = 1;\n        int length = strlen(s) - start;\n        int valid = (length == 10) && (s[start] >= '6' && s[start] <= '9');\n        for (int i = start; i < strlen(s); i++) {\n            if (!isdigit(s[i])) valid = 0;\n        }\n        printf(\"%s\\n\", valid ? \"VALID\" : \"INVALID\");\n    }\n    return 0;\n}\n"
        },
        "test_cases": [
            {"input": "9885768283", "expected_output": "VALID", "is_hidden": False},
            {"input": "+917485920584", "expected_output": "VALID", "is_hidden": False},
            {"input": "5543210987", "expected_output": "INVALID", "is_hidden": True},
            {"input": "988576828", "expected_output": "INVALID", "is_hidden": True}
        ]
    },
    # 13. C Beginner: Fundamentals
    {
        "id": "code-c-fundamentals",
        "topic_id": "top-c-fundamentals",
        "title": "C Data Types & Base Inspector",
        "difficulty": "Easy",
        "problem_statement": "Read an integer N from standard input. Output its binary, octal, and hexadecimal representation separated by spaces.",
        "input_format": "A single non-negative integer N.",
        "output_format": "Three space-separated strings: binary, octal, and hexadecimal.",
        "constraints": "0 <= N <= 10^9",
        "sample_input": "15",
        "sample_output": "0b1111 0o17 0xf",
        "starter_code": {
            "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"0b\");\n        if (n == 0) {\n            printf(\"0\");\n        } else {\n            int temp = n;\n            int bits[32];\n            int count = 0;\n            while (temp > 0) {\n                bits[count] = temp % 2;\n                count++;\n                temp /= 2;\n            }\n            for (int i = count - 1; i >= 0; i--) {\n                printf(\"%d\", bits[i]);\n            }\n        }\n        printf(\" 0o%o 0x%x\\n\", n, n);\n    }\n    return 0;\n}\n",
            "python": "import sys\nraw = sys.stdin.read().strip()\nif raw:\n    n = int(raw)\n    print(f\"{bin(n)} {oct(n)} {hex(n)}\")\n"
        },
        "test_cases": [
            {"input": "15", "expected_output": "0b1111 0o17 0xf", "is_hidden": False},
            {"input": "0", "expected_output": "0b0 0o0 0x0", "is_hidden": False},
            {"input": "255", "expected_output": "0b11111111 0o377 0xff", "is_hidden": True}
        ]
    },
    # 14. C Beginner: Loops & Sum of Evens
    {
        "id": "code-c-loops",
        "topic_id": "top-c-loops",
        "title": "Sum of Even Integers in C",
        "difficulty": "Easy",
        "problem_statement": "Read an integer N from standard input. Compute and print the sum of all positive even integers from 1 up to and including N using a for loop.",
        "input_format": "A single positive integer N.",
        "output_format": "A single integer representing the sum of even numbers.",
        "constraints": "1 <= N <= 1000",
        "sample_input": "6",
        "sample_output": "12",
        "starter_code": {
            "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        int sum = 0;\n        for (int i = 2; i <= n; i += 2) {\n            sum += i;\n        }\n        printf(\"%d\\n\", sum);\n    }\n    return 0;\n}\n",
            "python": "import sys\nraw = sys.stdin.read().strip()\nif raw:\n    n = int(raw)\n    print(sum(i for i in range(2, n + 1, 2)))\n"
        },
        "test_cases": [
            {"input": "6", "expected_output": "12", "is_hidden": False},
            {"input": "10", "expected_output": "30", "is_hidden": False},
            {"input": "1", "expected_output": "0", "is_hidden": True},
            {"input": "20", "expected_output": "110", "is_hidden": True}
        ]
    },
    # 15. C Intermediate: Pointers & Array Reversal
    {
        "id": "code-c-reverse-array",
        "topic_id": "top-c-pointers",
        "title": "In-Place Array Reversal using Pointers",
        "difficulty": "Medium",
        "problem_statement": "Read N space-separated integers from stdin. Reverse the sequence and print the reversed array elements separated by single spaces.",
        "input_format": "Line 1: integer count N.\nLine 2: N space-separated integers.",
        "output_format": "N space-separated integers in reversed order.",
        "constraints": "1 <= N <= 500",
        "sample_input": "5\n10 20 30 40 50",
        "sample_output": "50 40 30 20 10",
        "starter_code": {
            "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        int arr[500];\n        for (int i = 0; i < n; i++) {\n            scanf(\"%d\", &arr[i]);\n        }\n        for (int i = n - 1; i >= 0; i--) {\n            printf(\"%d%s\", arr[i], (i == 0) ? \"\" : \" \");\n        }\n        printf(\"\\n\");\n    }\n    return 0;\n}\n",
            "python": "import sys\ntokens = sys.stdin.read().strip().split()\nif tokens:\n    n = int(tokens[0])\n    nums = tokens[1:n+1]\n    print(\" \".join(reversed(nums)))\n"
        },
        "test_cases": [
            {"input": "5\n10 20 30 40 50", "expected_output": "50 40 30 20 10", "is_hidden": False},
            {"input": "3\n1 2 3", "expected_output": "3 2 1", "is_hidden": False},
            {"input": "1\n42", "expected_output": "42", "is_hidden": True}
        ]
    },
    # 16. C Intermediate: Functions Topic (Factorial - USES ONLY FUNCTION!)
    {
        "id": "code-c-functions",
        "topic_id": "top-c-functions",
        "title": "Recursive Factorial in C",
        "difficulty": "Medium",
        "problem_statement": "Implement a recursive function `int factorial(int n)` in C that computes n! for a non-negative integer n.",
        "input_format": "A single non-negative integer N.",
        "output_format": "A single integer representing n!.",
        "constraints": "0 <= N <= 12",
        "sample_input": "5",
        "sample_output": "120",
        "starter_code": {
            "c": "#include <stdio.h>\n\n// Function topic: Implement pure recursive function\nint factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", factorial(n));\n    }\n    return 0;\n}\n",
            "python": "import sys\ndef factorial(n: int) -> int:\n    if n <= 1: return 1\n    return n * factorial(n - 1)\nif __name__ == '__main__':\n    raw = sys.stdin.read().strip()\n    if raw: print(factorial(int(raw)))\n"
        },
        "test_cases": [
            {"input": "5", "expected_output": "120", "is_hidden": False},
            {"input": "3", "expected_output": "6", "is_hidden": False},
            {"input": "0", "expected_output": "1", "is_hidden": True}
        ]
    }
]

# 4. Verify that EVERY question passes 100% of test cases in Python AND C
print("=== VERIFYING CODING CHALLENGES WITH CODE EXECUTOR ===")
for q in coding_questions:
    tcs = q["test_cases"]
    sc = q["starter_code"]
    
    # Test Python
    if "python" in sc:
        res_py = code_executor.evaluate_test_cases(sc["python"], "python", tcs)
        status_py = res_py["status"]
        passed_py = res_py["passed_tests"]
        total_py = res_py["total_tests"]
        print(f"[{q['id']}] Python: {status_py} ({passed_py}/{total_py})")
        if status_py != "PASSED":
            print("  FAIL DETAILS:", res_py.get("details"))
            print("  ERROR:", res_py.get("error"))
            sys.exit(1)

    # Test C
    if "c" in sc:
        res_c = code_executor.evaluate_test_cases(sc["c"], "c", tcs)
        status_c = res_c["status"]
        passed_c = res_c["passed_tests"]
        total_c = res_c["total_tests"]
        print(f"[{q['id']}] C: {status_c} ({passed_c}/{total_c})")
        if status_c != "PASSED":
            print("  FAIL DETAILS:", res_c.get("details"))
            print("  ERROR:", res_c.get("error"))
            sys.exit(1)

data["coding_questions"] = coding_questions

with open(DATA_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("\nSuccessfully updated and verified platformData.json!")

