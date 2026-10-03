import { PythonTopic } from './pythonFundamentalsData';

export interface IntermediateModule {
  id: string;
  number: number;
  title: string;
  description: string;
  topicsCount: number;
}

export const INTERMEDIATE_MODULES: IntermediateModule[] = [
  {
    id: 'mod-adv-py',
    number: 1,
    title: 'Module 01: Advanced Python Concepts',
    description: 'Comprehensions, functional tools (lambda, map, filter, reduce), iterators, generators, decorators, and advanced argument packing.',
    topicsCount: 5
  },
  {
    id: 'mod-oop',
    number: 2,
    title: 'Module 02: Object-Oriented Programming',
    description: 'Classes, constructors (__init__), method types (@classmethod, @staticmethod), encapsulation, inheritance, polymorphism, and abstraction.',
    topicsCount: 5
  },
  {
    id: 'mod-ds',
    number: 3,
    title: 'Module 03: Data Structures',
    description: 'Arrays, linked lists, stacks, queues, hash tables, binary trees, binary search trees, heaps, and graph fundamentals.',
    topicsCount: 9
  },
  {
    id: 'mod-algo',
    number: 4,
    title: 'Module 04: Algorithms & Practical Applications',
    description: 'Searching, sorting algorithms, recursion, Big O asymptotic analysis, algorithmic problem-solving techniques, and complete mini-project.',
    topicsCount: 7
  }
];

export interface IntermediateCodingChallenge {
  title: string;
  problemStatement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  starterCode: string;
  testCases: Array<{
    input: string;
    expected_output: string;
  }>;
}

export interface IntermediatePythonTopic extends Omit<PythonTopic, 'difficulty'> {
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  moduleId: string;
  moduleTitle: string;
  challenge?: IntermediateCodingChallenge;
}

export const PYTHON_INTERMEDIATE_TOPICS: IntermediatePythonTopic[] = [
  // ==========================================
  // MODULE 01: ADVANCED PYTHON CONCEPTS
  // ==========================================
  {
    id: 'top-py-int-comprehensions',
    number: 1,
    numberDisplay: '01',
    moduleId: 'mod-adv-py',
    moduleTitle: 'Module 01: Advanced Python Concepts',
    title: 'List, Dict & Set Comprehensions',
    slug: 'comprehensions-list-dict-set',
    shortDescription: 'Master concise, high-performance declarative syntax for constructing lists, dictionaries, and sets from iterables.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisiteId: null,
    learningObjectives: [
      'Transform procedural for-loops and conditionals into declarative comprehensions',
      'Construct dictionary comprehensions with key-value transformations and filtering',
      'Utilize set comprehensions to produce deduplicated collections directly',
      'Recognize nested comprehensions and avoid readability anti-patterns'
    ],
    conceptExplanation: `Comprehensions provide a concise, declarative syntax to construct new collections (lists, dictionaries, or sets) from existing iterables. Under the hood, Python compiles comprehensions into optimized bytecode loops that run faster than manual \`list.append()\` loops by avoiding repeated method lookup overhead.

### 1. List Comprehensions
A list comprehension consists of brackets containing an expression followed by a \`for\` clause, then zero or more \`if\` clauses:
\`[expression for item in iterable if condition]\`

### 2. Dictionary Comprehensions
Dictionary comprehensions map keys to values using curly braces and a colon delimiter:
\`{key_expr: value_expr for item in iterable if condition}\`

### 3. Set Comprehensions
Set comprehensions construct unordered collections of unique elements:
\`{expression for item in iterable if condition}\`

**Performance Insight:** Comprehensions execute at C-level loop speed in CPython, making them both more readable and significantly faster for bulk data manipulation.`,
    simpleExample: {
      code: `numbers = [1, 2, 3, 4, 5, 6]
squares = [n ** 2 for n in numbers if n % 2 == 0]
print("Even squares:", squares)`,
      explanation: 'Evaluates n**2 for each element n in numbers only when n % 2 == 0, producing [4, 16, 36].'
    },
    syntax: `# List: [expr for x in iterable if condition]
# Dict: {k_expr: v_expr for x in iterable if condition}
# Set:  {expr for x in iterable if condition}`,
    codeExample: `# Data processing using comprehensions
raw_users = [
    {"id": 1, "username": "alice", "active": True},
    {"id": 2, "username": "bob", "active": False},
    {"id": 3, "username": "charlie", "active": True}
]

# 1. Filtered List of usernames
active_users = [u["username"].upper() for u in raw_users if u["active"]]
print(f"Active: {active_users}")

# 2. Dictionary lookup: id -> username
user_map = {u["id"]: u["username"] for u in raw_users}
print(f"User Map: {user_map}")

# 3. Set of username lengths
name_lengths = {len(u["username"]) for u in raw_users}
print(f"Unique Lengths: {name_lengths}")`,
    expectedOutput: `Active: ['ALICE', 'CHARLIE']
User Map: {1: 'alice', 2: 'bob', 3: 'charlie'}
Unique Lengths: {5, 3, 7}`,
    stepByStep: [
      'The Python compiler creates a specialized frame for comprehension evaluation.',
      'The source iterable is iterated using its iterator protocol.',
      'The optional if predicate is evaluated for truthiness on each item.',
      'For matching items, the output expression is evaluated and appended to the internal buffer.',
      'The completed list, dict, or set object is returned.'
    ],
    commonMistakes: [
      {
        mistake: 'Using parenthesis hoping for a tuple: (x*2 for x in items)',
        correction: 'tuple(x*2 for x in items)',
        explanation: 'Parentheses with a comprehension syntax create a Generator Expression, not a tuple.'
      },
      {
        mistake: 'Over-nesting multiple comprehensions into unreadable 3-line blocks',
        correction: 'Use traditional nested for-loops or helper generator functions for multi-level loops',
        explanation: 'The Zen of Python states: "Readability counts". If comprehension logic exceeds two clauses, refactor.'
      }
    ],
    realWorldExample: {
      scenario: 'Data Sanitization in an ETL Pipeline',
      code: `raw_scores = {"math": " 95 ", "science": "88", "history": " N/A "}
clean_scores = {
    subj: int(val.strip())
    for subj, val in raw_scores.items()
    if val.strip().isdigit()
}
print(clean_scores)`,
      explanation: 'ETL pipelines use dictionary comprehensions to filter invalid entries and parse strings into numbers in a single readable step.'
    },
    practice: {
      prompt: 'Given words = ["python", "is", "awesome", "code"], write a list comprehension that selects words with length >= 4 and converts them to UPPERCASE.',
      starterCode: `words = ["python", "is", "awesome", "code"]
# Create filtered_words using a list comprehension
filtered_words = ...

print(filtered_words)
`,
      expectedOutputMatcher: `['PYTHON', 'AWESOME', 'CODE']`,
      hint: 'Use [w.upper() for w in words if len(w) >= 4]',
      solution: `words = ["python", "is", "awesome", "code"]
filtered_words = [w.upper() for w in words if len(w) >= 4]
print(filtered_words)`
    },
    quiz: [
      {
        id: 'q-py-comp-1',
        question: 'What is the type of the object produced by `{x: x**2 for x in range(3)}`?',
        options: ['set', 'dict', 'list', 'generator'],
        correctIndex: 1,
        explanation: 'Key-value pairs separated by a colon inside curly braces produce a dict.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-comp-2',
        question: 'What is the output of `len({x % 3 for x in range(10)})`?',
        options: ['10', '3', '4', '1'],
        correctIndex: 1,
        explanation: 'x % 3 produces remainders 0, 1, and 2. Because sets deduplicate values, the set contains {0, 1, 2}, with length 3.',
        difficulty: 'medium'
      }
    ,
      {
        id: "q-py-comp-3",
        question: "What is the output of the following nested comprehension?",
        codeSnippet: `matrix = [[1, 2], [3, 4]]
flat = [x for row in matrix for x in row if x % 2 != 0]
print(flat)`,
        options: [
          "[1, 3]",
          "[1, 2, 3, 4]",
          "[[1], [3]]",
          "[2, 4]"
        ],
        correctIndex: 0,
        explanation: "The outer loop iterates over each row in matrix, and the inner loop iterates over each item x in row. Only odd numbers (1 and 3) pass the filter, producing [1, 3].",
        difficulty: "medium"
      },
      {
        id: "q-py-comp-4",
        question: "Which of the following creates a dictionary with numbers 0 to 3 as keys and their cubes as values?",
        codeSnippet: null,
        options: [
          "{x: x**3 for x in range(4)}",
          "[x: x**3 for x in range(4)]",
          "{x, x**3 for x in range(4)}",
          "dict(x**3 for x in range(4))"
        ],
        correctIndex: 0,
        explanation: "Dictionary comprehensions require curly braces with a key: value pair separated by a colon: {k: v for ...}.",
        difficulty: "easy"
      },
      {
        id: "q-py-comp-5",
        question: "Why should you avoid overly complex, deeply nested comprehensions with 3+ clauses?",
        codeSnippet: null,
        options: [
          "They cause CPython bytecode compilation errors",
          "They sacrifice readability and maintainability without meaningful performance benefits",
          "They cannot return values in Python 3",
          "They always run in O(N^3) memory"
        ],
        correctIndex: 1,
        explanation: "The Zen of Python emphasizes 'Readability counts'. Deeply nested comprehensions are difficult to read and debug; explicit loops or generator functions are preferred.",
        difficulty: "medium"
      }
    ],
    challenge: {
      title: "Student Roster Transformation",
      problemStatement: "Given a comma-separated string of 'name:score' pairs, use comprehensions to compute two results: (1) A dictionary of students who passed (score >= 60), mapping their capitalized name to their score; (2) A sorted list of unique letter grades assigned (>=90 is 'A', >=80 is 'B', >=70 is 'C', >=60 is 'D', otherwise 'F').",
      inputFormat: "A single line containing comma-separated student:score strings.",
      outputFormat: "Two lines: Line 1 prints the passing dictionary, Line 2 prints the sorted list of unique grades.",
      constraints: "1 <= len(input) <= 500",
      starterCode: `import sys

def solve():
    raw = sys.stdin.read().strip()
    if not raw:
        return
    pairs = [item.strip().split(':') for item in raw.split(',')]
    students = {name.strip().capitalize(): int(score.strip()) for name, score in pairs}
    passing = {k: v for k, v in students.items() if v >= 60}
    def grade(s):
        return 'A' if s >= 90 else 'B' if s >= 80 else 'C' if s >= 70 else 'D' if s >= 60 else 'F'
    grades = sorted(list({grade(s) for s in students.values()}))
    print(passing)
    print(grades)

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: "alice:92, bob:58, charlie:85, diana:74",
          expected_output: `{'Alice': 92, 'Charlie': 85, 'Diana': 74}
['A', 'B', 'C', 'F']`
        }
      ]
    },
    summary: [
      'Comprehensions provide elegant, high-speed construction for lists, dicts, and sets.',
      'Filtering is achieved with an optional trailing if clause.',
      'CPython executes comprehensions faster than repeated manual append calls.'
    ]
  },

  {
    id: 'top-py-int-lambdas-functional',
    number: 2,
    numberDisplay: '02',
    moduleId: 'mod-adv-py',
    moduleTitle: 'Module 01: Advanced Python Concepts',
    title: 'Lambda Functions, Map, Filter & Reduce',
    slug: 'lambda-functions-map-filter-reduce',
    shortDescription: 'Write anonymous inline functions and apply higher-order functional patterns for clean data transformations.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisiteId: 'top-py-int-comprehensions',
    learningObjectives: [
      'Construct anonymous lambda functions for custom sorting keys and callbacks',
      'Use map() to transform collections with lazy iterator semantics',
      'Filter data streams conditionally using filter() and truthiness checks',
      'Aggregate sequences into scalar values using functools.reduce()'
    ],
    conceptExplanation: `Functional programming in Python treats functions as **first-class citizens**—functions can be passed as arguments, returned from other functions, and stored in variables.

### 1. Lambda Functions
A lambda is an anonymous, single-expression function defined with the \`lambda\` keyword:
\`lambda arguments: expression\`
Lambdas cannot contain statements (like \`return\` or assignments), only an expression whose value is implicitly returned.

### 2. map(function, iterable)
Applies a transformation function to all items in an iterable. In Python 3, \`map()\` returns a memory-efficient lazy iterator.

### 3. filter(function, iterable)
Yields elements from the iterable for which the predicate function returns \`True\`.

### 4. reduce(function, iterable[, initializer])
Found in the \`functools\` module, \`reduce()\` repeatedly applies a binary function cumulatively to reduce a sequence down to a single aggregate value.`,
    simpleExample: {
      code: `from functools import reduce
nums = [1, 2, 3, 4]
doubled = list(map(lambda x: x * 2, nums))
total = reduce(lambda acc, x: acc + x, nums)
print("Doubled:", doubled, "Total:", total)`,
      explanation: 'map doubles each element, while reduce accumulates the elements into a single sum (10).'
    },
    syntax: `lambda args: expression
map(func, iterable)
filter(predicate, iterable)
functools.reduce(binary_func, iterable, [initial])`,
    codeExample: `from functools import reduce

products = [
    {"name": "Laptop", "price": 1200, "in_stock": True},
    {"name": "Mouse", "price": 25, "in_stock": True},
    {"name": "Monitor", "price": 300, "in_stock": False},
    {"name": "Keyboard", "price": 75, "in_stock": True}
]

# Sort by price descending using lambda key
sorted_by_price = sorted(products, key=lambda p: p["price"], reverse=True)
print("Highest price:", sorted_by_price[0]["name"])

# Filter in-stock items
available = list(filter(lambda p: p["in_stock"], products))
print("Available count:", len(available))

# Calculate total catalog value of in-stock items using map + reduce
prices = map(lambda p: p["price"], available)
total_value = reduce(lambda acc, p: acc + p, prices, 0)
print(f"Total Available Value: \${total_value}")`,
    expectedOutput: `Highest price: Laptop
Available count: 3
Total Available Value: $1300`,
    stepByStep: [
      'Lambda expression is compiled into an anonymous code object with closure scope.',
      'The higher-order function (sorted/map/filter) calls the lambda for each item.',
      'map and filter yield values lazily on demand via the iterator protocol.',
      'reduce maintains an accumulator and combines items step by step.'
    ],
    commonMistakes: [
      {
        mistake: 'Forgetting to consume map() or filter() with list() or a for loop',
        correction: 'result = list(map(func, data))',
        explanation: 'map and filter return iterators in Python 3; printing them directly displays an object representation like <map object at 0x...>, not the elements.'
      },
      {
        mistake: 'Assigning a lambda to a variable name instead of def: my_func = lambda x: x+1',
        correction: 'def my_func(x): return x + 1',
        explanation: 'PEP 8 specifically advises using def for named functions so stack traces retain the function name.'
      }
    ],
    realWorldExample: {
      scenario: 'Sorting Complex Objects in Web Backends',
      code: `logs = [
    ("2026-09-29 10:00", 500, "Server Error"),
    ("2026-09-29 08:30", 200, "OK"),
    ("2026-09-29 09:15", 404, "Not Found")
]
# Sort by timestamp ascending
logs.sort(key=lambda record: record[0])
print("Chronological first:", logs[0][2])`,
      explanation: 'APIs sort database records and audit logs by multiple criteria using lambdas as sorting extractors.'
    },
    practice: {
      prompt: 'Use filter() and a lambda function to extract all numbers strictly greater than 10 from numbers = [4, 12, 3, 19, 8, 22, 10], then print the resulting list.',
      starterCode: `numbers = [4, 12, 3, 19, 8, 22, 10]
# Use filter and lambda, convert to list
greater_than_10 = ...

print(greater_than_10)
`,
      expectedOutputMatcher: `[12, 19, 22]`,
      hint: 'list(filter(lambda x: x > 10, numbers))',
      solution: `numbers = [4, 12, 3, 19, 8, 22, 10]
greater_than_10 = list(filter(lambda x: x > 10, numbers))
print(greater_than_10)`
    },
    quiz: [
      {
        id: 'q-py-lam-1',
        question: 'Which of the following is NOT permitted inside a Python lambda expression?',
        options: [
          'Ternary conditional (a if cond else b)',
          'Function invocation (len(x))',
          'Assignment statement (x = 5)',
          'Arithmetic operations (x + 10)'
        ],
        correctIndex: 2,
        explanation: 'Lambdas can only evaluate single expressions. Statements like assignments, while, or return are invalid syntax.',
        difficulty: 'medium'
      },
      {
        id: 'q-py-lam-2',
        question: 'What does reduce(lambda a, b: a * b, [1, 2, 3, 4], 1) evaluate to?',
        options: ['10', '24', '12', 'Error'],
        correctIndex: 1,
        explanation: '1 * 1 = 1; 1 * 2 = 2; 2 * 3 = 6; 6 * 4 = 24.',
        difficulty: 'easy'
      }
    ,
      {
        id: "q-py-lam-3",
        question: "What is the return type of map(lambda x: x*2, [1, 2, 3]) in Python 3?",
        codeSnippet: null,
        options: [
          "list",
          "map iterator object",
          "tuple",
          "generator function"
        ],
        correctIndex: 1,
        explanation: "In Python 3, map() returns a memory-efficient lazy map iterator rather than a materialized list.",
        difficulty: "easy"
      },
      {
        id: "q-py-lam-4",
        question: "What is the output of the following reduce operation?",
        codeSnippet: `from functools import reduce
nums = [1, 2, 3, 4]
result = reduce(lambda acc, x: acc * x, nums, 10)
print(result)`,
        options: [
          "24",
          "240",
          "120",
          "10"
        ],
        correctIndex: 1,
        explanation: "Initial accumulator is 10. The multiplications proceed: 10*1 = 10, 10*2 = 20, 20*3 = 60, 60*4 = 240.",
        difficulty: "medium"
      },
      {
        id: "q-py-lam-5",
        question: "Why is 'lambda' limited to a single expression in Python?",
        codeSnippet: null,
        options: [
          "To prevent unreadable multi-line statements and preserve Python's indentation syntax",
          "Because CPython bytecode interpreter cannot parse newlines",
          "To ensure lambdas execute in O(1) time",
          "Because lambdas cannot capture variables in closures"
        ],
        correctIndex: 0,
        explanation: "Guido van Rossum intentionally restricted lambda to a single expression to preserve readability and encourage named 'def' functions for complex multi-statement logic.",
        difficulty: "medium"
      }
    ],
    challenge: {
      title: "Functional Data Pipeline",
      problemStatement: "Given a list of integers from stdin (separated by spaces), write a functional pipeline using filter, map, and reduce: (1) Filter out negative numbers; (2) Map each remaining number to its cube; (3) Compute the sum of the cubes using functools.reduce with initial value 0. Print the final sum.",
      inputFormat: "A single line containing space-separated integers.",
      outputFormat: "A single integer representing the sum of cubes of all non-negative integers.",
      constraints: "Each number is between -100 and 100.",
      starterCode: `import sys
from functools import reduce

def solve():
    raw = sys.stdin.read().strip()
    if not raw:
        return
    nums = [int(x) for x in raw.split()]
    # 1. filter non-negative (>= 0)
    # 2. map to cubes (x**3)
    # 3. reduce to sum
    non_neg = filter(lambda x: x >= 0, nums)
    cubes = map(lambda x: x ** 3, non_neg)
    total = reduce(lambda a, b: a + b, cubes, 0)
    print(total)

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: "1 -2 3 -4 5",
          expected_output: "153"
        },
        {
          input: "-1 -5 -10",
          expected_output: "0"
        }
      ]
    },
    summary: [
      'Lambdas provide anonymous functions for lightweight callbacks and key extractors.',
      'map and filter return lazy iterators for memory-efficient batch processing.',
      'reduce folds sequences into single cumulative values.'
    ]
  },

  {
    id: 'top-py-int-iterators-generators',
    number: 3,
    numberDisplay: '03',
    moduleId: 'mod-adv-py',
    moduleTitle: 'Module 01: Advanced Python Concepts',
    title: 'Iterators, Iterables & Generators',
    slug: 'iterators-iterables-generators-yield',
    shortDescription: 'Master the iterator protocol (__iter__, __next__) and build memory-efficient streaming generators with yield.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisiteId: 'top-py-int-lambdas-functional',
    learningObjectives: [
      'Differentiate between an iterable (can be iterated) and an iterator (holds iteration state)',
      'Implement the iterator protocol using __iter__() and __next__() methods',
      'Create generator functions that pause and resume execution using the yield keyword',
      'Process massive data streams with O(1) memory overhead using generator pipelines'
    ],
    conceptExplanation: `Python's iteration mechanism is governed by the **Iterator Protocol**. Understanding this allows you to process datasets that are far larger than your system RAM.

### 1. Iterable vs Iterator
* **Iterable:** Any object with an \`__iter__()\` method that returns an iterator (e.g. lists, tuples, strings, dicts).
* **Iterator:** A stateful object with a \`__next__()\` method. Calling \`next(it)\` yields the next element until it raises \`StopIteration\`.

### 2. Generator Functions and \`yield\`
A generator function looks like a normal function, but whenever it needs to produce a value, it uses the \`yield\` keyword instead of \`return\`.
* When \`yield\` is encountered, the function's execution state, local variables, and instruction pointer are **frozen**.
* When \`next()\` is called on the generator object, execution resumes immediately after the \`yield\` statement!

\`\`\`python
def count_up(limit):
    n = 1
    while n <= limit:
        yield n
        n += 1
\`\`\`

### 3. Generator Expressions
Similar to list comprehensions, but wrapped in round parentheses \`()\`:
\`gen = (x * 2 for x in range(1_000_000))\`
Generates values on-the-fly without allocating memory for 1 million integers!`,
    simpleExample: {
      code: `def countdown(start):
    while start > 0:
        yield start
        start -= 1

for num in countdown(3):
    print("Tick:", num)
print("Liftoff!")`,
      explanation: 'countdown yields 3, then 2, then 1, pausing execution between iterations without allocating a list in memory.'
    },
    syntax: `def my_generator():
    yield value

# Generator expression:
gen = (expr for item in iterable if condition)`,
    codeExample: `import sys

# Compare memory usage: List vs Generator
large_range = 100_000
list_comp = [x * 2 for x in range(large_range)]
gen_exp = (x * 2 for x in range(large_range))

print(f"List size in RAM: {sys.getsizeof(list_comp)} bytes")
print(f"Generator size in RAM: {sys.getsizeof(gen_exp)} bytes")

# Generator pipeline: Stream processing
def read_numbers(limit):
    for i in range(1, limit + 1):
        yield i

def filter_evens(stream):
    for val in stream:
        if val % 2 == 0:
            yield val

def square_stream(stream):
    for val in stream:
        yield val ** 2

# Chain the pipeline
pipeline = square_stream(filter_evens(read_numbers(6)))
print("Pipeline output:", list(pipeline))`,
    expectedOutput: `List size in RAM: 800984 bytes
Generator size in RAM: 200 bytes
Pipeline output: [4, 16, 36]`,
    stepByStep: [
      'Calling a generator function returns a generator object without executing code yet.',
      'The consumer calls next() on the generator object.',
      'Code runs until it hits yield, yielding the value and saving CPU register state.',
      'Subsequent next() calls resume from the exact line after yield.',
      'When the function finishes, StopIteration is automatically raised to signal loop completion.'
    ],
    commonMistakes: [
      {
        mistake: 'Trying to reuse an exhausted generator',
        correction: 'Create a new generator instance or store values in a list if multiple passes are required',
        explanation: 'Generators are one-way streams. Once a generator reaches StopIteration, it is exhausted and yields nothing further.'
      },
      {
        mistake: 'Calling len(gen) on a generator',
        correction: 'Use sum(1 for _ in gen) or inspect count while consuming',
        explanation: 'Generators do not know their length in advance because items are computed dynamically on demand.'
      }
    ],
    realWorldExample: {
      scenario: 'Streaming Multi-Gigabyte Server Logs',
      code: `def stream_log_errors(lines):
    for line in lines:
        if "[ERROR]" in line:
            yield line.strip()

mock_log_stream = [
    "[INFO] Server initialized",
    "[ERROR] Database connection timed out",
    "[DEBUG] Worker thread spawned",
    "[ERROR] Out of file descriptors"
]
for error in stream_log_errors(mock_log_stream):
    print("ALERT:", error)`,
      explanation: 'Production monitoring agents stream terabytes of access logs line-by-line through generators without crashing server RAM.'
    },
    practice: {
      prompt: 'Write a generator function fibonacci_gen(limit) that yields Fibonacci numbers (starting with 0, 1, 1, 2, 3...) whose values are less than or equal to limit. Print the list of yielded numbers for limit = 20.',
      starterCode: `def fibonacci_gen(limit):
    # Implement generator yielding fibonacci numbers <= limit
    pass

print(list(fibonacci_gen(20)))
`,
      expectedOutputMatcher: `[0, 1, 1, 2, 3, 5, 8, 13]`,
      hint: 'Initialize a, b = 0, 1; while a <= limit: yield a; a, b = b, a + b',
      solution: `def fibonacci_gen(limit):
    a, b = 0, 1
    while a <= limit:
        yield a
        a, b = b, a + b

print(list(fibonacci_gen(20)))`
    },
    quiz: [
      {
        id: 'q-py-gen-1',
        question: 'What exception is automatically raised by an iterator when no more items exist?',
        options: ['IndexError', 'StopIteration', 'EndOfStreamError', 'GeneratorExit'],
        correctIndex: 1,
        explanation: 'The iterator protocol relies on StopIteration to terminate for-loops cleanly.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-gen-2',
        question: 'What happens to a generator function local state when yield is executed?',
        options: [
          'All local variables are deleted from memory',
          'Execution pauses and all local variables/registers are preserved until next()',
          'The function terminates permanently',
          'Execution restarts from the top'
        ],
        correctIndex: 1,
        explanation: 'yield freezes execution and retains all local variable state in the generator frame.',
        difficulty: 'medium'
      }
    ,
      {
        id: "q-py-gen-3",
        question: "What happens when a generator function finishes executing all statements or encounters a return?",
        codeSnippet: null,
        options: [
          "It automatically loops back to the start",
          "It raises a StopIteration exception",
          "It returns None on all future next() calls",
          "It frees the function bytecode from memory"
        ],
        correctIndex: 1,
        explanation: "Under the iterator protocol, reaching the end of a generator or returning from it raises StopIteration, signaling to for-loops that iteration is complete.",
        difficulty: "medium"
      },
      {
        id: "q-py-gen-4",
        question: "What is the memory advantage of a generator expression over a list comprehension for 10 million numbers?",
        codeSnippet: null,
        options: [
          "Generators use 0 CPU cycles",
          "Generators produce items on demand in O(1) space rather than allocating all 10 million elements in RAM",
          "Generators run multithreaded by default",
          "Generators are stored directly on the GPU"
        ],
        correctIndex: 1,
        explanation: "Generators evaluate lazily. Only one item is held in memory at a time, requiring constant O(1) memory footprint regardless of stream size.",
        difficulty: "easy"
      },
      {
        id: "q-py-gen-5",
        question: "What is the output of the following generator function?",
        codeSnippet: `def countdown(n):
    while n > 0:
        yield n
        n -= 1

g = countdown(3)
print(next(g), next(g))`,
        options: [
          "3 3",
          "3 2",
          "2 1",
          "3 None"
        ],
        correctIndex: 1,
        explanation: "The first next(g) yields 3 and pauses. The second next(g) resumes, decrements n to 2, loops, yields 2, and pauses.",
        difficulty: "easy"
      }
    ],
    challenge: {
      title: "Custom Fibonacci Stream Generator",
      problemStatement: "Write a generator function fibonacci_gen() that produces an infinite sequence of Fibonacci numbers (0, 1, 1, 2, 3, 5, 8, ...). In the solve() function, read an integer N from standard input and print the first N Fibonacci numbers separated by a space on a single line.",
      inputFormat: "A single integer N (1 <= N <= 50).",
      outputFormat: "N space-separated integers on one line.",
      constraints: "1 <= N <= 50",
      starterCode: `import sys

def fibonacci_gen():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

def solve():
    raw = sys.stdin.read().strip()
    if not raw:
        return
    n = int(raw)
    gen = fibonacci_gen()
    out = [str(next(gen)) for _ in range(n)]
    print(' '.join(out))

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: "7",
          expected_output: "0 1 1 2 3 5 8"
        },
        {
          input: "1",
          expected_output: "0"
        }
      ]
    },
    summary: [
      'Iterables implement __iter__(); iterators implement __next__().',
      'Generators use yield to produce values on-demand with minimal memory footprint.',
      'Generators enable composable streaming pipelines for big data.'
    ]
  },

  {
    id: 'top-py-int-decorators',
    number: 4,
    numberDisplay: '04',
    moduleId: 'mod-adv-py',
    moduleTitle: 'Module 01: Advanced Python Concepts',
    title: 'Decorators & Function Wrappers',
    slug: 'decorators-closures-wrappers',
    shortDescription: 'Master function decorators, closures, @functools.wraps, and parameter passing to extend behavior cleanly.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisiteId: 'top-py-int-iterators-generators',
    learningObjectives: [
      'Understand closures: how nested functions capture enclosing lexical scope',
      'Build custom decorators using the @decorator syntactic sugar',
      'Preserve function metadata (name, docstring) using @functools.wraps',
      'Construct decorators that accept configurable arguments'
    ],
    conceptExplanation: `A **decorator** is a callable that takes another function as an argument, extends or alters its behavior, and returns a modified function—all without altering the original function's source code!

### 1. Closures: The Building Blocks
A closure occurs when an inner function remembers and has access to variables in its outer enclosing scope, even after the outer function has finished executing.

### 2. How Decorators Work
The \`@my_decorator\` syntax is syntactic sugar for:
\`\`\`python
def greet(): pass
greet = my_decorator(greet)
\`\`\`

### 3. The Standard Decorator Template
Always use \`@functools.wraps(func)\` so that \`func.__name__\` and docstrings are preserved:

\`\`\`python
import functools

def my_decorator(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # 1. Do something before
        result = func(*args, **kwargs)
        # 2. Do something after
        return result
    return wrapper
\`\`\`

### 4. Practical Uses
Decorators are ubiquitously used in frameworks (Flask, FastAPI, Django) for:
* Logging & execution timing
* Authentication & authorization checks
* Caching & memoization (\`@lru_cache\`)
* Rate limiting and input validation`,
    simpleExample: {
      code: `def announce(func):
    def wrapper():
        print(">> Starting execution...")
        func()
        print(">> Execution finished.")
    return wrapper

@announce
def say_hello():
    print("Hello from Python!")

say_hello()`,
      explanation: '@announce wraps say_hello, printing messages before and after executing the inner logic.'
    },
    syntax: `def decorator(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # Pre-execution logic
        result = func(*args, **kwargs)
        # Post-execution logic
        return result
    return wrapper`,
    codeExample: `import time
from functools import wraps

def timer(func):
    """Decorator that measures execution time of a function."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        duration = time.perf_counter() - start
        print(f"[TIMER] {func.__name__} executed in {duration:.6f}s")
        return result
    return wrapper

def repeat(times):
    """Decorator factory that repeats execution n times."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for i in range(times):
                res = func(*args, **kwargs)
            return res
        return wrapper
    return decorator

@timer
@repeat(times=2)
def compute_sum(n):
    return sum(i * 2 for i in range(n))

val = compute_sum(100_000)
print(f"Result: {val}")
print(f"Function identity preserved: {compute_sum.__name__}")`,
    expectedOutput: `[TIMER] compute_sum executed in 0.009...s
Result: 9999900000
Function identity preserved: compute_sum`,
    stepByStep: [
      'Python compiles compute_sum, then passes it as an argument into the decorator chain.',
      'The inner wrapper function is returned and rebound to the identifier compute_sum.',
      'When compute_sum() is invoked, the wrapper executes pre-logic (timer start).',
      'The wrapper calls the original function with *args and **kwargs.',
      'The wrapper executes post-logic (timer end) and returns the result.'
    ],
    commonMistakes: [
      {
        mistake: 'Forgetting @functools.wraps(func) inside the wrapper',
        correction: 'Always add @functools.wraps(func) immediately above wrapper(*args, **kwargs)',
        explanation: 'Without @wraps, the decorated function will lose its original __name__, __doc__, and signature, breaking debugging and introspection.'
      },
      {
        mistake: 'Forgetting to return result from wrapper',
        correction: 'result = func(*args, **kwargs); return result',
        explanation: 'If wrapper does not return result, calling the decorated function will return None.'
      }
    ],
    realWorldExample: {
      scenario: 'Role-Based Access Control in Web APIs',
      code: `current_user = {"name": "Bob", "role": "admin"}

def require_admin(func):
    def wrapper(*args, **kwargs):
        if current_user.get("role") != "admin":
            raise PermissionError("403: Admin privileges required")
        return func(*args, **kwargs)
    return wrapper

@require_admin
def delete_database():
    return "Database purged successfully."

print(delete_database())`,
      explanation: 'Production web frameworks use route decorators (@login_required, @require_admin) to guard endpoint execution.'
    },
    practice: {
      prompt: 'Write a decorator called uppercase_output that intercepts the return value of any function returning a string and converts that string to uppercase. Decorate get_status().',
      starterCode: `from functools import wraps

def uppercase_output(func):
    # Implement wrapper here
    pass

@uppercase_output
def get_status():
    return "system operational"

print(get_status())
`,
      expectedOutputMatcher: `SYSTEM OPERATIONAL`,
      hint: 'def wrapper(*args, **kwargs): return func(*args, **kwargs).upper()',
      solution: `from functools import wraps

def uppercase_output(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs).upper()
    return wrapper

@uppercase_output
def get_status():
    return "system operational"

print(get_status())`
    },
    quiz: [
      {
        id: 'q-py-dec-1',
        question: 'What is the purpose of @functools.wraps inside a decorator?',
        options: [
          'It speeds up execution by compiling to C',
          'It preserves original function name, docstring, and metadata',
          'It prevents recursive calls',
          'It automatically retries failed network calls'
        ],
        correctIndex: 1,
        explanation: 'functools.wraps copies __name__, __doc__, and annotations from the original function to the wrapper.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-dec-2',
        question: 'If you stack decorators:\n@decorator_a\n@decorator_b\ndef f(): pass\nIn what order are they applied?',
        options: [
          'f = decorator_a(decorator_b(f))',
          'f = decorator_b(decorator_a(f))',
          'Both execute simultaneously',
          'Python chooses the fastest one first'
        ],
        correctIndex: 0,
        explanation: 'Decorators are evaluated bottom-up: decorator_b wraps f first, then decorator_a wraps the resulting function.',
        difficulty: 'medium'
      }
    ,
      {
        id: "q-py-dec-3",
        question: "Why is @functools.wraps(func) recommended inside custom decorators?",
        codeSnippet: null,
        options: [
          "To prevent infinite recursion in the wrapper",
          "To preserve original function metadata like __name__, __doc__, and type annotations",
          "To compile the wrapper to C machine code",
          "To make the function thread-safe"
        ],
        correctIndex: 1,
        explanation: "Without @functools.wraps, the decorated function inherits the wrapper's __name__ and loses its original docstring, breaking introspection and debugging tools.",
        difficulty: "medium"
      },
      {
        id: "q-py-dec-4",
        question: "What is the equivalent syntax for decorating a function: @my_decorator def greet(): pass?",
        codeSnippet: null,
        options: [
          "greet = my_decorator(greet)",
          "my_decorator = greet(my_decorator)",
          "greet() = my_decorator",
          "my_decorator.apply(greet)"
        ],
        correctIndex: 0,
        explanation: "The @ syntactic sugar passes the target function object into the decorator and rebinds the original function name to the returned wrapper: greet = my_decorator(greet).",
        difficulty: "easy"
      },
      {
        id: "q-py-dec-5",
        question: "How can a decorator accept custom arguments (e.g. @repeat(num_times=3))?",
        codeSnippet: null,
        options: [
          "By using a three-level nested function: an outer factory function that returns the actual decorator",
          "By adding arguments directly to the wrapper function",
          "By making the decorator inherit from class tuple",
          "Decorators cannot accept arguments in Python"
        ],
        correctIndex: 0,
        explanation: "Parameterized decorators are decorator factories: an outer function accepts configuration arguments, and returns the decorator, which in turn returns the wrapper.",
        difficulty: "hard"
      }
    ],
    challenge: {
      title: "Call Counter Decorator",
      problemStatement: `Implement a decorator \`@count_calls\` that counts how many times the decorated function has been invoked. The decorator should attach an attribute \`calls\` to the wrapped function initialized at 0, incrementing it on every call, and printing \`[Call #N] {func_name} executed\` before returning the function result.`,
      inputFormat: "A single integer K from standard input representing how many times to call a decorated function add(a, b).",
      outputFormat: "K lines of call telemetry followed by the return value of each call.",
      constraints: "1 <= K <= 20",
      starterCode: `import sys
from functools import wraps

def count_calls(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        print(f"[Call #{wrapper.calls}] {func.__name__} executed")
        return func(*args, **kwargs)
    wrapper.calls = 0
    return wrapper

@count_calls
def add(a, b):
    return a + b

def solve():
    raw = sys.stdin.read().strip()
    if not raw:
        return
    k = int(raw)
    for i in range(k):
        res = add(i, i + 1)
        print(f"Result: {res}")

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: "2",
          expected_output: `[Call #1] add executed
Result: 1
[Call #2] add executed
Result: 3`
        }
      ]
    },
    summary: [
      'Decorators wrap and extend functions non-invasively using closures.',
      'Always accept *args and **kwargs to support functions of any signature.',
      'Use @functools.wraps to preserve introspection and docstrings.'
    ]
  },

  {
    id: 'top-py-int-args-kwargs',
    number: 5,
    numberDisplay: '05',
    moduleId: 'mod-adv-py',
    moduleTitle: 'Module 01: Advanced Python Concepts',
    title: 'Advanced Arguments (*args & **kwargs)',
    slug: 'args-kwargs-parameter-unpacking',
    shortDescription: 'Master flexible variable-length positional and keyword argument handling, argument unpacking, and keyword-only parameters.',
    difficulty: 'Intermediate',
    estimatedMinutes: 20,
    prerequisiteId: 'top-py-int-decorators',
    learningObjectives: [
      'Capture variable positional arguments using the *args tuple collector',
      'Capture arbitrary keyword parameters using the **kwargs dictionary collector',
      'Unpack lists/tuples and dictionaries into function arguments at call sites',
      'Enforce keyword-only arguments using standalone asterisk * delimiters'
    ],
    conceptExplanation: `Python provides flexible syntax to author functions that accept an arbitrary number of positional or keyword arguments.

### 1. *args: Variable Positional Arguments
The asterisk \`*\` collects extra positional arguments into a **tuple**. The identifier name \`args\` is a PEP 8 convention.

### 2. **kwargs: Variable Keyword Arguments
The double asterisk \`**\` collects extra named arguments into a **dictionary**.

### 3. Argument Ordering Hierarchy
Parameters must strictly follow this order in function definitions:
\`def func(positional, *args, keyword_only, **kwargs): pass\`

### 4. Argument Unpacking at Call Sites
The asterisks can also be used in reverse during function calls:
* \`*my_list\` expands elements as positional arguments.
* \`**my_dict\` expands key-value pairs as keyword arguments.

### 5. Keyword-Only Arguments
Using a lone \`*\` forces all subsequent parameters to be passed by keyword only:
\`def configure(mode, *, timeout=30, debug=False): pass\``,
    simpleExample: {
      code: `def multiply_all(factor, *numbers):
    return [n * factor for n in numbers]

print(multiply_all(10, 1, 2, 3, 4))`,
      explanation: 'factor receives 10; *numbers collects (1, 2, 3, 4) into a tuple, multiplying each by 10.'
    },
    syntax: `def func(pos, *args, kw_only=val, **kwargs):
    pass

# Unpacking call:
func(*my_tuple, **my_dict)`,
    codeExample: `# Unified Dispatcher Pattern
def build_query(table, *columns, **filters):
    col_str = ", ".join(columns) if columns else "*"
    query = f"SELECT {col_str} FROM {table}"
    
    if filters:
        conditions = [f"{k} = '{v}'" for k, v in filters.items()]
        query += " WHERE " + " AND ".join(conditions)
    return query

# Call with dynamic positional and keyword arguments
q1 = build_query("users", "id", "email", status="active", role="admin")
print("Q1:", q1)

# Unpacking collections directly into arguments
cols = ["title", "author", "price"]
params = {"genre": "Science", "in_print": "True"}
q2 = build_query("books", *cols, **params)
print("Q2:", q2)`,
    expectedOutput: `Q1: SELECT id, email FROM users WHERE status = 'active' AND role = 'admin'
Q2: SELECT title, author, price FROM books WHERE genre = 'Science' AND in_print = 'True'`,
    stepByStep: [
      'Positional arguments match parameters in left-to-right order.',
      'Surplus positional arguments are packed into a tuple bound to *args.',
      'Keyword arguments matching named parameters are bound.',
      'Surplus keyword arguments are packed into a dict bound to **kwargs.'
    ],
    commonMistakes: [
      {
        mistake: 'Putting positional arguments after *args: def f(*args, a): f(1, 2, 3)',
        correction: 'Pass "a" as keyword argument: f(1, 2, a=3)',
        explanation: 'Any parameter declared after *args becomes a keyword-only parameter and cannot be passed positionally.'
      },
      {
        mistake: 'Passing a dictionary to a function without double asterisks: func(my_dict)',
        correction: 'func(**my_dict)',
        explanation: 'func(my_dict) passes the entire dictionary as a single positional parameter.'
      }
    ],
    realWorldExample: {
      scenario: 'Microservice API Wrapper / Proxy Client',
      code: `def send_http_request(url, method="GET", **headers):
    print(f"[{method}] Request sent to {url}")
    print(f"Headers: {headers}")

client_headers = {"Authorization": "Bearer token123", "User-Agent": "PyBot/2.0"}
send_http_request("https://api.cloud.io/v1/metrics", "POST", **client_headers)`,
      explanation: 'Production HTTP clients and wrapper libraries forward arbitrary header parameters using **kwargs unpacking.'
    },
    practice: {
      prompt: 'Write a function sum_all(*numbers, multiplier=1) that computes the sum of all numbers passed in, multiplies the sum by multiplier, and returns the result. Test with sum_all(1, 2, 3, 4, multiplier=5).',
      starterCode: `def sum_all(*numbers, multiplier=1):
    # Implement here
    pass

print(sum_all(1, 2, 3, 4, multiplier=5))
`,
      expectedOutputMatcher: `50`,
      hint: 'return sum(numbers) * multiplier',
      solution: `def sum_all(*numbers, multiplier=1):
    return sum(numbers) * multiplier

print(sum_all(1, 2, 3, 4, multiplier=5))`
    },
    quiz: [
      {
        id: 'q-py-args-1',
        question: 'What is the internal data structure of *args inside a function?',
        options: ['list', 'tuple', 'set', 'dictionary'],
        correctIndex: 1,
        explanation: '*args always collects positional arguments into an immutable tuple.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-args-2',
        question: 'How do you force a parameter to be keyword-only without accepting variable positional arguments?',
        options: [
          'Use @kwonly decorator',
          'Place a lone asterisk * before the parameter in the definition',
          'Declare it as const',
          'Use **args instead'
        ],
        correctIndex: 1,
        explanation: 'A bare * in the parameter list specifies that all subsequent parameters are keyword-only.',
        difficulty: 'medium'
      }
    ,
      {
        id: "q-py-args-3",
        question: "What data structures represent *args and **kwargs inside a function body?",
        codeSnippet: null,
        options: [
          "*args is a list, **kwargs is a set",
          "*args is a tuple, **kwargs is a dict",
          "*args is a generator, **kwargs is a list",
          "Both *args and **kwargs are tuples"
        ],
        correctIndex: 1,
        explanation: "Python packs excess positional arguments into an immutable tuple (*args) and keyword arguments into a mutable dictionary (**kwargs).",
        difficulty: "easy"
      },
      {
        id: "q-py-args-4",
        question: "What is the effect of placing a bare asterisk '*' in a function signature: def func(a, b, *, c=10): pass?",
        codeSnippet: null,
        options: [
          "It causes a syntax error",
          "It enforces that 'c' must be passed as a keyword-only argument",
          "It allows infinite positional arguments after b",
          "It makes 'c' an optional pointer"
        ],
        correctIndex: 1,
        explanation: "A bare asterisk in a parameter list indicates that all subsequent parameters are keyword-only and cannot be passed positionally.",
        difficulty: "medium"
      },
      {
        id: "q-py-args-5",
        question: "Why is using a mutable default argument like def append_item(val, target=[]): dangerous in Python?",
        codeSnippet: null,
        options: [
          "The default list is created once at function definition time and shared across all invocations",
          "It raises an immediate TypeError when called without arguments",
          "Lists cannot be passed as function defaults in Python 3",
          "It causes memory corruption in CPython"
        ],
        correctIndex: 0,
        explanation: "Default arguments are evaluated once when the function is defined. Mutable objects like lists or dicts are shared across calls, mutating cumulatively.",
        difficulty: "hard"
      }
    ],
    challenge: {
      title: "Flexible Multi-Type Aggregator",
      problemStatement: `Write a function \`universal_aggregator(*args, **kwargs)\` that accepts any number of positional numeric arguments and keyword flags. If \`kwargs.get('mode') == 'product'\`, multiply all numbers together (starting from 1). If \`mode == 'sum'\` (or default), add all numbers. If \`kwargs.get('prefix')\` is supplied, prepend it to the string output as \`"{prefix}: {result}"\`, otherwise print just the numeric result.`,
      inputFormat: "A single line with mode, prefix, and numbers, e.g.: 'product MathResult 2 3 4'",
      outputFormat: "The formatted aggregate string.",
      constraints: "At least one numeric argument is provided.",
      starterCode: `import sys

def universal_aggregator(*args, **kwargs):
    mode = kwargs.get('mode', 'sum')
    prefix = kwargs.get('prefix')
    if mode == 'product':
        res = 1
        for x in args:
            res *= x
    else:
        res = sum(args)
    return f"{prefix}: {res}" if prefix else str(res)

def solve():
    raw = sys.stdin.read().strip()
    if not raw:
        return
    parts = raw.split()
    mode = parts[0]
    prefix = parts[1]
    nums = [int(p) for p in parts[2:]]
    print(universal_aggregator(*nums, mode=mode, prefix=prefix))

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: "product Total 2 3 4",
          expected_output: "Total: 24"
        },
        {
          input: "sum SumVal 10 20 30",
          expected_output: "SumVal: 60"
        }
      ]
    },
    summary: [
      '*args collects surplus positional parameters into a tuple.',
      '**kwargs collects surplus keyword parameters into a dictionary.',
      'Unpacking with * and ** allows dynamic parameter forwarding.'
    ]
  },

  // ==========================================
  // MODULE 02: OBJECT-ORIENTED PROGRAMMING
  // ==========================================
  {
    id: 'top-py-int-classes-objects',
    number: 6,
    numberDisplay: '06',
    moduleId: 'mod-oop',
    moduleTitle: 'Module 02: Object-Oriented Programming',
    title: 'Classes, Objects & Constructors (__init__)',
    slug: 'classes-objects-constructors-init',
    shortDescription: 'Master object blueprinting, state initialization with __init__, the self reference, and instance attributes.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisiteId: 'top-py-int-args-kwargs',
    learningObjectives: [
      'Define classes as blueprints for creating stateful object instances',
      'Implement the __init__ dunder method to initialize instance state',
      'Understand the role and explicit binding of the self parameter',
      'Distinguish between instance attributes and class attributes'
    ],
    conceptExplanation: `Object-Oriented Programming (OOP) models software systems around **data structures (objects)** that bundle state (attributes) and behavior (methods) together.

### 1. Classes vs Instances
* A **class** is a blueprint (like an architectural schematic).
* An **instance (object)** is a concrete manifestation created in memory from that blueprint.

### 2. The \`__init__\` Constructor
\`__init__\` is a special "dunder" (double underscore) method called automatically when instantiating a new object. It initializes the object's instance attributes.

### 3. What is \`self\`?
In Python, \`self\` is an explicit reference to the current object instance. When calling \`account.deposit(50)\`, Python automatically translates this to \`BankAccount.deposit(account, 50)\`.

### 4. Instance Attributes vs Class Attributes
* **Instance Attributes:** Unique to each individual object, initialized as \`self.x = ...\`.
* **Class Attributes:** Shared across *all* instances of the class, defined directly in the class body.`,
    simpleExample: {
      code: `class Robot:
    population = 0  # Class attribute

    def __init__(self, name):
        self.name = name  # Instance attribute
        Robot.population += 1

r1 = Robot("Atlas")
r2 = Robot("Spot")
print(f"Created: {r1.name}, {r2.name}. Total: {Robot.population}")`,
      explanation: 'r1 and r2 have distinct names, but share the common class-level population count of 2.'
    },
    syntax: `class ClassName:
    class_attr = value

    def __init__(self, param1, param2):
        self.param1 = param1
        self.param2 = param2`,
    codeExample: `class BankAccount:
    bank_name = "Global Apex Financial"

    def __init__(self, owner: str, balance: float = 0.0):
        self.owner = owner
        self.balance = balance
        self.transactions = []

    def deposit(self, amount: float):
        if amount <= 0:
            raise ValueError("Deposit must be positive")
        self.balance += amount
        self.transactions.append(f"+{amount}")
        return self.balance

    def withdraw(self, amount: float):
        if amount > self.balance:
            print(f"Declined: Insufficient funds for {self.owner}")
            return False
        self.balance -= amount
        self.transactions.append(f"-{amount}")
        return True

    def get_summary(self):
        return f"[{self.bank_name}] Account: {self.owner} | Balance: \${self.balance:.2f}"

acc = BankAccount("Alice", 250.0)
acc.deposit(100.0)
acc.withdraw(50.0)
print(acc.get_summary())
print("History:", acc.transactions)`,
    expectedOutput: `[Global Apex Financial] Account: Alice | Balance: $300.00
History: ['+100.0', '-50.0']`,
    stepByStep: [
      'Calling BankAccount("Alice", 250.0) invokes __new__ to allocate heap memory for the object.',
      'Python immediately invokes __init__(self, "Alice", 250.0), passing the new instance as self.',
      'Attributes owner, balance, and transactions are bound directly to self.__dict__.',
      'Calling acc.deposit(100.0) implicitly passes acc into self, modifying Alice balance.'
    ],
    commonMistakes: [
      {
        mistake: 'Using a mutable default argument in a class attribute: class Bag: items = []',
        correction: 'Initialize mutable lists inside __init__: self.items = []',
        explanation: 'Class attributes are shared by ALL instances! If items is a class attribute, adding an item in bag1 will also add it in bag2.'
      },
      {
        mistake: 'Forgetting self as the first parameter in method signatures: def deposit(amount):',
        correction: 'def deposit(self, amount):',
        explanation: 'Python automatically passes the instance as the first argument. Missing self results in TypeError: takes 1 positional argument but 2 were given.'
      }
    ],
    realWorldExample: {
      scenario: 'User Session Authentication Management',
      code: `import time

class UserSession:
    def __init__(self, user_id, auth_token):
        self.user_id = user_id
        self.token = auth_token
        self.created_at = time.time()
        self.is_active = True

    def invalidate(self):
        self.is_active = False

session = UserSession("usr_99", "jwt_abc123")
print("Session active:", session.is_active)
session.invalidate()
print("Session active after logout:", session.is_active)`,
      explanation: 'Production web servers encapsulate client authentication state in UserSession objects with lifecycles.'
    },
    practice: {
      prompt: 'Create a class Rectangle with an __init__ that takes width and height. Add a method area() that returns width * height, and perimeter() that returns 2 * (width + height). Instantiate with width=5, height=3, and print area() then perimeter().',
      starterCode: `class Rectangle:
    # Implement class here
    pass

r = Rectangle(5, 3)
print(r.area())
print(r.perimeter())
`,
      expectedOutputMatcher: `15\n16`,
      hint: 'def area(self): return self.width * self.height',
      solution: `class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

r = Rectangle(5, 3)
print(r.area())
print(r.perimeter())`
    },
    quiz: [
      {
        id: 'q-py-cls-1',
        question: 'What is the role of self in Python instance methods?',
        options: [
          'It is a special keyword enforced by CPython compiler grammar',
          'It is a naming convention referring to the specific instance on which the method was called',
          'It references the parent superclass',
          'It initializes static class variables'
        ],
        correctIndex: 1,
        explanation: 'self is an explicit parameter representing the instance. While any name can technically be used, self is the universal PEP 8 standard.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-cls-2',
        question: 'Where are instance variables stored internally in most standard Python objects?',
        options: [
          'Inside the global sys.modules dict',
          'Inside the instance __dict__ mapping',
          'Directly in CPU L1 cache',
          'Inside the class tuple'
        ],
        correctIndex: 1,
        explanation: 'Each standard instance contains a private __dict__ dictionary storing its specific attribute names and values.',
        difficulty: 'medium'
      }
    ,
      {
        id: "q-py-cls-3",
        question: "What is the primary difference between a class variable and an instance variable in Python?",
        codeSnippet: `class Dog:
    species = 'Canis familiaris' # A
    def __init__(self, name):
        self.name = name        # B`,
        options: [
          "Class variables are shared by all instances, while instance variables are unique to each object",
          "Class variables cannot be strings",
          "Instance variables must be declared outside __init__",
          "There is no difference in Python"
        ],
        correctIndex: 0,
        explanation: "Class variables are defined on the class itself and shared among all instances. Instance variables are bound to 'self', maintaining distinct per-object state.",
        difficulty: "medium"
      },
      {
        id: "q-py-cls-4",
        question: "What does the first parameter 'self' explicitly represent in Python method definitions?",
        codeSnippet: null,
        options: [
          "A reserved global keyword in CPython",
          "A reference to the current instance of the class upon which the method was called",
          "The parent base class",
          "A pointer to the memory allocator"
        ],
        correctIndex: 1,
        explanation: "Unlike C++ or Java where 'this' is implicit, Python requires explicit declaration of the instance reference as the first argument, conventionally named 'self'.",
        difficulty: "easy"
      },
      {
        id: "q-py-cls-5",
        question: "What is the output of the following code?",
        codeSnippet: `class Counter:
    def __init__(self):
        self.count = 0
    def inc(self):
        self.count += 1
        return self

c = Counter()
print(c.inc().inc().count)`,
        options: [
          "0",
          "1",
          "2",
          "AttributeError: 'NoneType' object has no attribute 'count'"
        ],
        correctIndex: 2,
        explanation: "By returning 'self', the inc() method enables fluent method chaining. Two inc() calls increment self.count from 0 to 2.",
        difficulty: "medium"
      }
    ],
    challenge: {
      title: "Bank Account Ledger System",
      problemStatement: `Design a \`BankAccount\` class with \`account_number\`, \`owner\`, and an initial \`balance\` (default 0.0). Implement methods: \`deposit(amount)\`, \`withdraw(amount)\` (return False if insufficient funds, else True and deduct), and \`get_summary()\` returning '{owner} (#{account_number}): \${balance:.2f}'. In \`solve()\`, parse transactions from stdin and print the final summary.`,
      inputFormat: "First line: owner and account_number. Subsequent lines: deposit/withdraw amounts.",
      outputFormat: "Final account summary string.",
      constraints: "Amounts are positive floats.",
      starterCode: `import sys

class BankAccount:
    def __init__(self, account_number: str, owner: str, balance: float = 0.0):
        self.account_number = account_number
        self.owner = owner
        self.balance = balance

    def deposit(self, amount: float):
        if amount > 0:
            self.balance += amount

    def withdraw(self, amount: float) -> bool:
        if 0 < amount <= self.balance:
            self.balance -= amount
            return True
        return False

    def get_summary(self) -> str:
        return f"{self.owner} (#{self.account_number}): \${self.balance:.2f}"

def solve():
    lines = [l.strip() for l in sys.stdin.read().strip().split('\n') if l.strip()]
    if not lines:
        return
    owner, acc = lines[0].split(',')
    account = BankAccount(acc.strip(), owner.strip())
    for tx in lines[1:]:
        action, amt = tx.split(':')
        amt = float(amt.strip())
        if action.strip() == 'DEP':
            account.deposit(amt)
        elif action.strip() == 'WIT':
            account.withdraw(amt)
    print(account.get_summary())

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: `Alice, ACC-101
DEP: 150.50
WIT: 50.00
DEP: 25.25`,
          expected_output: "Alice (#ACC-101): $125.75"
        }
      ]
    },
    summary: [
      'Classes bundle state (attributes) and behavior (methods).',
      '__init__ initializes state when objects are created.',
      'Instance attributes are unique per object; class attributes are shared.'
    ]
  },

  {
    id: 'top-py-int-methods-types',
    number: 7,
    numberDisplay: '07',
    moduleId: 'mod-oop',
    moduleTitle: 'Module 02: Object-Oriented Programming',
    title: 'Instance, Class & Static Methods',
    slug: 'instance-class-static-methods',
    shortDescription: 'Distinguish between instance methods (self), class methods (@classmethod cls), and static methods (@staticmethod).',
    difficulty: 'Intermediate',
    estimatedMinutes: 20,
    prerequisiteId: 'top-py-int-classes-objects',
    learningObjectives: [
      'Use instance methods to inspect and manipulate individual object state',
      'Implement @classmethod for factory constructors and class-level state management',
      'Use @staticmethod for utility functions related conceptually to the class',
      'Select the appropriate method decorator based on state access requirements'
    ],
    conceptExplanation: `Python classes support three distinct types of methods, each serving a specific architectural role.

| Method Type | Decorator | First Parameter | Access Level | Primary Use Case |
|---|---|---|---|---|
| **Instance Method** | None | \`self\` | Accesses instance & class state | Modifying unique object state |
| **Class Method** | \`@classmethod\` | \`cls\` | Accesses only class state | Alternative constructors / factories |
| **Static Method** | \`@staticmethod\` | None | No access to \`self\` or \`cls\` | Self-contained utility functions |

### 1. Instance Methods
The default method type. Receives \`self\` pointing to the calling instance.

### 2. Class Methods (\`@classmethod\`)
Receives \`cls\` pointing to the class object itself, not an individual instance. Class methods can inspect and modify class-level attributes, and are the idiomatic way in Python to create **alternative constructors** (e.g. \`from_dict\`, \`from_string\`).

### 3. Static Methods (\`@staticmethod\`)
Do not receive an implicit first argument. They behave like plain functions, but reside inside the class namespace for logical grouping.`,
    simpleExample: {
      code: `class MathHelper:
    @staticmethod
    def is_even(num):
        return num % 2 == 0

print("Is 4 even?", MathHelper.is_even(4))`,
      explanation: 'is_even does not need any object state or class state, so it is declared as a clean @staticmethod.'
    },
    syntax: `class MyClass:
    def instance_method(self): pass

    @classmethod
    def class_method(cls): pass

    @staticmethod
    def static_method(arg): pass`,
    codeExample: `class User:
    total_users = 0

    def __init__(self, username, email):
        self.username = username
        self.email = email
        User.total_users += 1

    # Instance method: Uses instance state
    def get_profile(self):
        return f"User: {self.username} <{self.email}>"

    # Class method: Factory constructor from CSV format
    @classmethod
    def from_csv_row(cls, csv_string: str):
        username, email = csv_string.strip().split(",")
        return cls(username.strip(), email.strip())

    # Static method: General validator independent of instance
    @staticmethod
    def is_valid_email(email: str) -> bool:
        return "@" in email and "." in email

# 1. Use static method validation
email_check = User.is_valid_email("alice@tech.org")
print(f"Email valid: {email_check}")

# 2. Use class method factory constructor
u1 = User.from_csv_row("dev_sarah, sarah@cloud.net")
print(u1.get_profile())
print(f"Total Users Registered: {User.total_users}")`,
    expectedOutput: `Email valid: True
User: dev_sarah <sarah@cloud.net>
Total Users Registered: 1`,
    stepByStep: [
      'User.is_valid_email() is called directly without instantiating any object.',
      'User.from_csv_row("dev_sarah, sarah@cloud.net") passes the User class into cls.',
      'from_csv_row splits the string, calls cls(username, email), and returns a new User instance.',
      'The returned instance u1 calls instance method u1.get_profile() via self.'
    ],
    commonMistakes: [
      {
        mistake: 'Using an instance method for a factory constructor without an existing instance',
        correction: 'Use @classmethod with cls()',
        explanation: 'You cannot call an instance method before the object exists. Class methods provide alternative entry points for instantiation.'
      },
      {
        mistake: 'Calling self.is_valid_email() and expecting it to fail as a static method',
        correction: 'Static methods can be called on both classes (User.valid()) and instances (self.valid())',
        explanation: 'Python allows static methods to be invoked through an instance, but they still receive no implicit self parameter.'
      }
    ],
    realWorldExample: {
      scenario: 'JSON Deserialization Factory Pattern',
      code: `import json

class DatabaseConfig:
    def __init__(self, host, port):
        self.host = host
        self.port = port

    @classmethod
    def from_json(cls, json_payload):
        data = json.loads(json_payload)
        return cls(data["host"], data["port"])

cfg = DatabaseConfig.from_json('{"host": "localhost", "port": 5432}')
print(f"Connected to {cfg.host}:{cfg.port}")`,
      explanation: 'Production libraries like Pydantic, SQLAlchemy, and Django rely heavily on classmethod constructors to ingest JSON, YAML, and dictionaries.'
    },
    practice: {
      prompt: 'Create a class Temperature with instance attribute celsius. Add a @classmethod from_fahrenheit(cls, f) that calculates celsius = (f - 32) * 5 / 9 and returns a new Temperature instance. Test with t = Temperature.from_fahrenheit(212) and print round(t.celsius).',
      starterCode: `class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    # Add classmethod from_fahrenheit here

t = Temperature.from_fahrenheit(212)
print(round(t.celsius))
`,
      expectedOutputMatcher: `100`,
      hint: '@classmethod def from_fahrenheit(cls, f): return cls((f - 32) * 5 / 9)',
      solution: `class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    @classmethod
    def from_fahrenheit(cls, f):
        c = (f - 32) * 5 / 9
        return cls(c)

t = Temperature.from_fahrenheit(212)
print(round(t.celsius))`
    },
    quiz: [
      {
        id: 'q-py-meth-1',
        question: 'What is the implicit first parameter passed to a @classmethod?',
        options: ['self (the instance)', 'cls (the class itself)', 'args (a tuple)', 'None'],
        correctIndex: 1,
        explanation: 'Class methods receive the class object (cls) as their first parameter.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-meth-2',
        question: 'When should you choose a @staticmethod over a regular function defined outside the class?',
        options: [
          'Whenever the function needs access to instance variables',
          'When the utility logic is conceptually tied to the class namespace, improving organization',
          'To increase execution speed by 10x',
          'Only when using multiple inheritance'
        ],
        correctIndex: 1,
        explanation: 'Static methods namespace logically related utility code within the class without coupling it to instance or class state.',
        difficulty: 'medium'
      }
    ,
      {
        id: "q-py-met-3",
        question: "Which decorator is used to define an alternative factory constructor that receives the class itself as its first argument?",
        codeSnippet: null,
        options: [
          "@staticmethod",
          "@classmethod",
          "@property",
          "@constructor"
        ],
        correctIndex: 1,
        explanation: "@classmethod receives the class object 'cls' as its first parameter, allowing instantiation from alternative formats like from_json() or from_csv().",
        difficulty: "easy"
      },
      {
        id: "q-py-met-4",
        question: "Can a @staticmethod access or mutate class state (cls) or instance state (self)?",
        codeSnippet: null,
        options: [
          "No, static methods receive neither self nor cls and behave like regular functions namespaced in the class",
          "Yes, via the global scope pointer",
          "Only if decorated with @public",
          "Yes, static methods automatically receive self"
        ],
        correctIndex: 0,
        explanation: "Static methods have no implicit first argument (neither self nor cls). They are utility functions logically organized under the class namespace.",
        difficulty: "medium"
      },
      {
        id: "q-py-met-5",
        question: "Predict the output of the following code:",
        codeSnippet: `class MathUtil:
    factor = 10
    @classmethod
    def multiply(cls, x):
        return x * cls.factor

MathUtil.factor = 5
print(MathUtil.multiply(4))`,
        options: [
          "40",
          "20",
          "50",
          "TypeError"
        ],
        correctIndex: 1,
        explanation: "cls.factor references the class variable 'factor'. Since MathUtil.factor was mutated to 5, multiply(4) returns 4 * 5 = 20.",
        difficulty: "easy"
      }
    ],
    challenge: {
      title: "Config Factory with Class & Static Methods",
      problemStatement: `Implement a \`ServerConfig\` class with instance attributes \`host\`, \`port\`, and \`ssl\` (bool). Implement: (1) \`@classmethod from_connection_string(cls, conn_str)\` which parses strings like 'https://db.internal:5432' or 'http://localhost:8080' into a ServerConfig instance; (2) \`@staticmethod is_valid_port(port)\` returning True if 1 <= port <= 65535.`,
      inputFormat: "A single connection string.",
      outputFormat: "Two lines: 'Host: {host}, Port: {port}, SSL: {ssl}' and 'Valid Port: {True/False}'.",
      constraints: "Standard URI format.",
      starterCode: `import sys

class ServerConfig:
    def __init__(self, host: str, port: int, ssl: bool):
        self.host = host
        self.port = port
        self.ssl = ssl

    @classmethod
    def from_connection_string(cls, conn_str: str):
        ssl = conn_str.startswith('https://')
        clean = conn_str.replace('https://', '').replace('http://', '')
        host, port_str = clean.split(':')
        return cls(host, int(port_str), ssl)

    @staticmethod
    def is_valid_port(port: int) -> bool:
        return 1 <= port <= 65535

def solve():
    raw = sys.stdin.read().strip()
    if not raw:
        return
    cfg = ServerConfig.from_connection_string(raw)
    print(f"Host: {cfg.host}, Port: {cfg.port}, SSL: {cfg.ssl}")
    print(f"Valid Port: {ServerConfig.is_valid_port(cfg.port)}")

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: "https://api.gateway.org:8443",
          expected_output: `Host: api.gateway.org, Port: 8443, SSL: True
Valid Port: True`
        }
      ]
    },
    summary: [
      'Instance methods operate on individual instance state (self).',
      'Class methods operate on the class itself (cls) and act as alternative constructors.',
      'Static methods are namespace-isolated utilities with no implicit state.'
    ]
  },

  {
    id: 'top-py-int-encapsulation',
    number: 8,
    numberDisplay: '08',
    moduleId: 'mod-oop',
    moduleTitle: 'Module 02: Object-Oriented Programming',
    title: 'Encapsulation & Data Hiding (@property)',
    slug: 'encapsulation-private-attributes-property',
    shortDescription: 'Protect internal object invariants using private attributes, name mangling, and elegant @property getters/setters.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisiteId: 'top-py-int-methods-types',
    learningObjectives: [
      'Understand the principle of encapsulation and information hiding',
      'Distinguish public, protected (_single_underscore), and private (__double_underscore) attributes',
      'Explain Python name mangling mechanics (_ClassName__attribute)',
      'Implement clean pythonic getters, setters, and validation with @property'
    ],
    conceptExplanation: `**Encapsulation** bundles state and behavior while restricting direct external access to internal implementation details, preventing accidental corruption of object invariants.

### 1. Python Privacy Conventions
Unlike C++ or Java with strict compiler keywords, Python embraces the philosophy: *"We are all consenting adults here."*
* **Public:** \`self.name\` (Freely accessible everywhere).
* **Protected (\`_var\`):** A single leading underscore is an internal convention warning: *"Do not touch outside the class or subclasses."*
* **Private (\`__var\`):** A double leading underscore triggers **Name Mangling**. Python renames \`__balance\` to \`_ClassName__balance\` internally to avoid accidental name collisions in subclasses.

### 2. The Pythonic Way: \`@property\`
In languages like Java, developers write verbose \`getBalance()\` and \`setBalance(val)\` methods.
In Python, we use the \`@property\` decorator to expose methods as if they were plain attributes, while maintaining full control over validation and read-only protection!

\`\`\`python
class Wallet:
    def __init__(self, amount):
        self._amount = amount

    @property
    def amount(self):
        return self._amount

    @amount.setter
    def amount(self, value):
        if value < 0: raise ValueError("Negative balance disallowed")
        self._amount = value
\`\`\``,
    simpleExample: {
      code: `class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.__salary = salary  # Private

emp = Employee("John", 80000)
# print(emp.__salary) -> Raises AttributeError!
print("Accessed via mangling:", emp._Employee__salary)`,
      explanation: '__salary is mangled to _Employee__salary, preventing accidental public access or overwriting.'
    },
    syntax: `class MyClass:
    def __init__(self):
        self._val = 0

    @property
    def val(self):
        return self._val

    @val.setter
    def val(self, new_val):
        self._val = new_val`,
    codeExample: `class BankCard:
    def __init__(self, card_number: str, pin: int):
        self._card_number = card_number
        self.__pin = pin  # Private mangled
        self._balance = 0.0

    @property
    def balance(self) -> float:
        """Read-only property for public balance inspection."""
        return self._balance

    @property
    def masked_number(self) -> str:
        """Computes masked credit card string dynamically."""
        return f"****-****-****-{self._card_number[-4:]}"

    def update_balance(self, amount: float, pin_attempt: int) -> bool:
        if pin_attempt != self.__pin:
            print("Access Denied: Invalid PIN")
            return False
        self._balance += amount
        return True

card = BankCard("4532890123459876", pin=1234)
print("Card Number:", card.masked_number)
card.update_balance(500.0, pin_attempt=1234)
print(f"Verified Balance: \${card.balance:.2f}")

# Attempting to assign to a read-only property
try:
    card.balance = 1000000.0
except AttributeError as e:
    print("Security Check Passed:", e)`,
    expectedOutput: `Card Number: ****-****-****-9876
Verified Balance: $500.00
Security Check Passed: property 'balance' of 'BankCard' object has no setter`,
    stepByStep: [
      'The constructor sets _card_number and mangles __pin to _BankCard__pin.',
      'Accessing card.masked_number executes the getter method transparently.',
      'Accessing card.balance invokes the balance property getter.',
      'Attempting direct assignment card.balance = x raises AttributeError because no @balance.setter is defined.'
    ],
    commonMistakes: [
      {
        mistake: 'Infinite recursion in property setter: @prop.setter def prop(self, val): self.prop = val',
        correction: 'Assign to the backing variable: self._prop = val',
        explanation: 'Assigning to self.prop calls the setter again, creating an infinite recursive loop that raises RecursionError!'
      },
      {
        mistake: 'Assuming __private attributes are cryptographically secure',
        correction: 'Understand that name mangling is for namespace safety, not security',
        explanation: 'Any caller can still access card._BankCard__pin directly. Python relies on developer convention.'
      }
    ],
    realWorldExample: {
      scenario: 'Data Model Validation in ORM Libraries',
      code: `class ProductListing:
    def __init__(self, title, price):
        self.title = title
        self.price = price

    @property
    def price(self):
        return self._price

    @price.setter
    def price(self, val):
        if val <= 0:
            raise ValueError("Price must be strictly positive")
        self._price = round(float(val), 2)

item = ProductListing("Mechanical Keyboard", 129.999)
print(f"Sanitized price: \${item.price}")`,
      explanation: 'ORMs like Django Models and SQLAlchemy use properties to transparently validate field bounds on assignment.'
    },
    practice: {
      prompt: 'Create a class Circle with private attribute _radius. Add a property radius that gets and sets _radius. If a user tries to set radius to a negative number, set it to 0 instead. Instantiate Circle(5), set c.radius = -10, and print c.radius.',
      starterCode: `class Circle:
    def __init__(self, radius):
        self._radius = radius

    # Implement @property radius and setter here

c = Circle(5)
c.radius = -10
print(c.radius)
`,
      expectedOutputMatcher: `0`,
      hint: '@radius.setter: self._radius = val if val >= 0 else 0',
      solution: `class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, val):
        self._radius = val if val >= 0 else 0

c = Circle(5)
c.radius = -10
print(c.radius)`
    },
    quiz: [
      {
        id: 'q-py-enc-1',
        question: 'What transformation does Python apply to attributes prefixed with double underscores (__name)?',
        options: [
          'It marks them as read-only memory pointers',
          'It mangles the name to _ClassName__name',
          'It deletes them immediately after __init__ completes',
          'It encrypts them with AES-256'
        ],
        correctIndex: 1,
        explanation: 'Name mangling prefixes double-underscore attributes with _ClassName to avoid namespace collisions in inheritance.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-enc-2',
        question: 'How do you create a read-only property in Python?',
        options: [
          'Declare the class with @readonly',
          'Define a method decorated with @property and do not provide a corresponding @prop.setter',
          'Prepend const to the method name',
          'Return None from __setattr__'
        ],
        correctIndex: 1,
        explanation: 'A @property without a matching @setter raises AttributeError upon any attempted assignment.',
        difficulty: 'medium'
      }
    ,
      {
        id: "q-py-enc-3",
        question: "What is Python's name mangling mechanism for double underscore attributes like self.__secret?",
        codeSnippet: null,
        options: [
          "It encrypts the variable at compile time using AES",
          "It rewrites the identifier internally as _ClassName__secret to prevent accidental namespace collisions in subclasses",
          "It causes a runtime error if accessed outside the file",
          "It deletes the attribute upon method exit"
        ],
        correctIndex: 1,
        explanation: "Double-underscore identifiers are mangled by prepending _ClassName to avoid name collisions in inheritance hierarchies.",
        difficulty: "medium"
      },
      {
        id: "q-py-enc-4",
        question: "What is the primary benefit of using @property over traditional Java-style get_value() and set_value() methods in Python?",
        codeSnippet: null,
        options: [
          "It maintains backward-compatible public attribute syntax (obj.value) while encapsulating getter/setter validation logic",
          "It bypasses the Python interpreter",
          "It allows variables to have multiple types simultaneously",
          "It compiles properties into C structs"
        ],
        correctIndex: 0,
        explanation: "@property allows developers to provide clean attribute access (obj.val = 10) while executing custom validation and calculation hooks behind the scenes.",
        difficulty: "medium"
      },
      {
        id: "q-py-enc-5",
        question: "What happens if code attempts to set an attribute with only a @property getter and NO @setter defined?",
        codeSnippet: `class ReadOnly:
    @property
    def val(self):
        return 42

r = ReadOnly()
r.val = 100`,
        options: [
          "val is overwritten to 100",
          "Raises AttributeError: property 'val' of 'ReadOnly' object has no setter",
          "Silently ignored",
          "Returns None"
        ],
        correctIndex: 1,
        explanation: "A property without a corresponding @setter decorator is strictly read-only; reassigning it raises an AttributeError.",
        difficulty: "easy"
      }
    ],
    challenge: {
      title: "Temperature Converter with Property Validation",
      problemStatement: `Create a \`Temperature\` class that internally stores temperature in Celsius (\`_celsius\`). Expose two properties: \`celsius\` (with getter and setter that raises \`ValueError('Below absolute zero')\` if value < -273.15) and \`fahrenheit\` (getter computes \`(c * 9/5) + 32\`, setter converts input F to C and validates). In \`solve()\`, read Celsius values and print both C and F formatted to 1 decimal place.`,
      inputFormat: "A single float representing Celsius.",
      outputFormat: "'Celsius: {c:.1f}C, Fahrenheit: {f:.1f}F'",
      constraints: "celsius >= -273.15",
      starterCode: `import sys

class Temperature:
    def __init__(self, celsius: float = 0.0):
        self.celsius = celsius

    @property
    def celsius(self) -> float:
        return self._celsius

    @celsius.setter
    def celsius(self, value: float):
        if value < -273.15:
            raise ValueError("Below absolute zero")
        self._celsius = value

    @property
    def fahrenheit(self) -> float:
        return (self._celsius * 9/5) + 32

    @fahrenheit.setter
    def fahrenheit(self, value: float):
        self.celsius = (value - 32) * 5/9

def solve():
    raw = sys.stdin.read().strip()
    if not raw:
        return
    t = Temperature(float(raw))
    print(f"Celsius: {t.celsius:.1f}C, Fahrenheit: {t.fahrenheit:.1f}F")

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: "100.0",
          expected_output: "Celsius: 100.0C, Fahrenheit: 212.0F"
        },
        {
          input: "0.0",
          expected_output: "Celsius: 0.0C, Fahrenheit: 32.0F"
        }
      ]
    },
    summary: [
      'Encapsulation maintains integrity by restricting direct attribute modification.',
      'Single underscore (_x) signals internal use; double underscore (__x) triggers name mangling.',
      '@property provides clean attribute syntax with validation behind the scenes.'
    ]
  },

  {
    id: 'top-py-int-inheritance-overriding',
    number: 9,
    numberDisplay: '09',
    moduleId: 'mod-oop',
    moduleTitle: 'Module 02: Object-Oriented Programming',
    title: 'Inheritance, Method Overriding & super()',
    slug: 'inheritance-method-overriding-super',
    shortDescription: 'Master code reuse with inheritance, subclass specialization, super() delegation, and the C3 Method Resolution Order (MRO).',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisiteId: 'top-py-int-encapsulation',
    learningObjectives: [
      'Derive subclasses from parent base classes to establish "is-a" relationships',
      'Override parent methods to customize behavior in specialized subclasses',
      'Invoke parent initialization and methods cleanly using super()',
      'Inspect and understand the C3 Method Resolution Order (MRO) in multiple inheritance'
    ],
    conceptExplanation: `**Inheritance** allows a new class (subclass/derived class) to inherit attributes and methods from an existing class (base/parent class), fostering clean code reuse and logical hierarchy.

### 1. Basic Inheritance Syntax
\`\`\`python
class Animal:
    def speak(self): return "Generic sound"

class Dog(Animal):
    def speak(self): return "Woof!"  # Method Overriding
\`\`\`

### 2. Method Overriding
A subclass overrides a parent method by re-defining a method with the identical name, providing specialized implementation.

### 3. The \`super()\` Function
\`super()\` provides a reference to parent class methods. In constructors, \`super().__init__(...)\` ensures base class attributes are properly initialized before child attributes are added.

### 4. Multiple Inheritance & MRO (Method Resolution Order)
Python supports inheriting from multiple parents:
\`class Child(ParentA, ParentB): pass\`
To resolve which method is called when duplicate names exist, Python uses the **C3 Linearization Algorithm (MRO)**. You can inspect this order with \`Child.mro()\` or \`Child.__mro__\`.`,
    simpleExample: {
      code: `class Vehicle:
    def __init__(self, brand):
        self.brand = brand

class Car(Vehicle):
    def __init__(self, brand, doors):
        super().__init__(brand)
        self.doors = doors

c = Car("Tesla", 4)
print(f"{c.brand} with {c.doors} doors")`,
      explanation: 'Car inherits brand from Vehicle using super().__init__(brand), while adding its own doors attribute.'
    },
    syntax: `class SubClass(BaseClass1, BaseClass2):
    def __init__(self, *args):
        super().__init__(*args)

    def overridden_method(self):
        super().overridden_method()`,
    codeExample: `class Employee:
    def __init__(self, name: str, base_salary: float):
        self.name = name
        self.base_salary = base_salary

    def calculate_pay(self) -> float:
        return self.base_salary

    def get_role(self) -> str:
        return "Staff Member"

class Manager(Employee):
    def __init__(self, name: str, base_salary: float, bonus: float):
        super().__init__(name, base_salary)
        self.bonus = bonus

    # Method Overriding: Specialized pay calculation
    def calculate_pay(self) -> float:
        return super().calculate_pay() + self.bonus

    def get_role(self) -> str:
        return "Engineering Manager"

class Director(Manager):
    def get_role(self) -> str:
        return "Executive Director"

# Instantiate and verify MRO
staff = Employee("Alice", 60000.0)
lead = Manager("Bob", 100000.0, 25000.0)

print(f"{staff.name} ({staff.get_role()}): \${staff.calculate_pay():.2f}")
print(f"{lead.name} ({lead.get_role()}): \${lead.calculate_pay():.2f}")
print("Director MRO:", [cls.__name__ for cls in Director.mro()])`,
    expectedOutput: `Alice (Staff Member): $60000.00
Bob (Engineering Manager): $125000.00
Director MRO: ['Director', 'Manager', 'Employee', 'object']`,
    stepByStep: [
      'Manager inherits all attributes and methods from Employee.',
      'Manager.__init__ calls super().__init__(name, base_salary), delegating core initialization upward.',
      'Manager.calculate_pay() calls super().calculate_pay(), adds self.bonus, and returns the total.',
      'Python traverses the MRO list sequentially until it finds the first matching method implementation.'
    ],
    commonMistakes: [
      {
        mistake: 'Forgetting super().__init__() in a subclass constructor',
        correction: 'Always invoke super().__init__(*args) first in child __init__',
        explanation: 'If super().__init__() is omitted, base class attributes will never be initialized on self, leading to AttributeError.'
      },
      {
        mistake: 'Using hardcoded ParentClass.__init__(self) instead of super()',
        correction: 'Use super().__init__()',
        explanation: 'Explicit base class calls break diamond inheritance hierarchies and violate cooperative multiple inheritance in Python.'
      }
    ],
    realWorldExample: {
      scenario: 'Custom Exception Hierarchy in Microservices',
      code: `class AppError(Exception):
    """Base application exception."""
    pass

class DatabaseConnectionError(AppError):
    """Raised when connection pool fails."""
    pass

def query_db():
    raise DatabaseConnectionError("Failed to reach Postgres cluster at 10.0.1.5")

try:
    query_db()
except AppError as e:
    print(f"Caught handled app error: {type(e).__name__} -> {e}")`,
      explanation: 'Production architectures build domain-specific error trees by inheriting from Exception and AppError.'
    },
    practice: {
      prompt: 'Create a base class Person(name) and derived class Student(name, student_id) that calls super().__init__(name). Add a method introduce() in Student that returns "Student <name>, ID: <student_id>". Instantiate Student("Maya", 401) and print s.introduce().',
      starterCode: `class Person:
    def __init__(self, name):
        self.name = name

class Student(Person):
    # Implement constructor and introduce() here
    pass

s = Student("Maya", 401)
print(s.introduce())
`,
      expectedOutputMatcher: `Student Maya, ID: 401`,
      hint: 'def introduce(self): return f"Student {self.name}, ID: {self.student_id}"',
      solution: `class Person:
    def __init__(self, name):
        self.name = name

class Student(Person):
    def __init__(self, name, student_id):
        super().__init__(name)
        self.student_id = student_id

    def introduce(self):
        return f"Student {self.name}, ID: {self.student_id}"

s = Student("Maya", 401)
print(s.introduce())`
    },
    quiz: [
      {
        id: 'q-py-inh-1',
        question: 'What does the acronym MRO stand for in Python OOP?',
        options: [
          'Memory Resource Optimization',
          'Method Resolution Order',
          'Module Routing Object',
          'Multiple Recursion Operator'
        ],
        correctIndex: 1,
        explanation: 'MRO stands for Method Resolution Order, the deterministic sequence in which Python searches class hierarchies for methods.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-inh-2',
        question: 'What is the top-most root class of all classes in Python 3?',
        options: ['type', 'Base', 'object', 'NoneClass'],
        correctIndex: 2,
        explanation: 'In Python 3, every class implicitly inherits from object, which provides dunders like __repr__, __eq__, and __str__.',
        difficulty: 'easy'
      }
    ,
      {
        id: "q-py-inh-3",
        question: "What algorithm does Python use to determine Method Resolution Order (MRO) in multiple inheritance?",
        codeSnippet: null,
        options: [
          "C3 Linearization algorithm",
          "Breadth-First Search (BFS)",
          "Depth-First Search (DFS) with pre-ordering",
          "Dijkstra's shortest path"
        ],
        correctIndex: 0,
        explanation: "Python uses the C3 Linearization algorithm to compute a deterministic, monotonic MRO that preserves local precedence order and avoids diamond ambiguity.",
        difficulty: "hard"
      },
      {
        id: "q-py-inh-4",
        question: "Why is super().__init__() preferred over calling ParentClass.__init__(self) explicitly?",
        codeSnippet: null,
        options: [
          "super() follows the MRO dynamically, ensuring all cooperative base classes in multiple inheritance are initialized exactly once",
          "Explicit parent calls are deprecated in Python 3",
          "super() runs multithreaded",
          "Explicit parent calls cannot pass arguments"
        ],
        correctIndex: 0,
        explanation: "super() dynamically resolves the next class according to the MRO graph, preventing duplicate or skipped constructor calls in diamond inheritance setups.",
        difficulty: "medium"
      },
      {
        id: "q-py-inh-5",
        question: "What does ClassName.__mro__ return?",
        codeSnippet: null,
        options: [
          "A tuple of classes representing the search order for method dispatch",
          "A dictionary of overridden methods",
          "A boolean indicating if the class has a parent",
          "The memory address of the vtable"
        ],
        correctIndex: 0,
        explanation: "ClassName.__mro__ (or ClassName.mro()) yields the exact ordered tuple of ancestor classes inspected during attribute lookup.",
        difficulty: "easy"
      }
    ],
    challenge: {
      title: "Employee Hierarchy & Overtime Payroll",
      problemStatement: `Build an inheritance hierarchy: Base class \`Employee(name, base_salary)\` with method \`calculate_pay() -> float\`. Subclass \`Manager(name, base_salary, bonus)\` overriding \`calculate_pay()\` to return \`base_salary + bonus\`. Subclass \`Developer(name, base_salary, overtime_hours, hourly_rate)\` overriding \`calculate_pay()\` to return \`base_salary + (overtime_hours * hourly_rate)\`. In \`solve()\`, process staff records and print each employee's total payout.`,
      inputFormat: "Lines formatted as 'Manager,Alice,5000,1200' or 'Developer,Bob,4000,10,50'.",
      outputFormat: "One line per employee: '{name} ({Role}): ${pay:.2f}'.",
      constraints: "Salary and bonus/hours are non-negative numbers.",
      starterCode: `import sys

class Employee:
    def __init__(self, name: str, base_salary: float):
        self.name = name
        self.base_salary = base_salary
    def calculate_pay(self) -> float:
        return self.base_salary

class Manager(Employee):
    def __init__(self, name: str, base_salary: float, bonus: float):
        super().__init__(name, base_salary)
        self.bonus = bonus
    def calculate_pay(self) -> float:
        return self.base_salary + self.bonus

class Developer(Employee):
    def __init__(self, name: str, base_salary: float, overtime_hours: float, hourly_rate: float):
        super().__init__(name, base_salary)
        self.overtime_hours = overtime_hours
        self.hourly_rate = hourly_rate
    def calculate_pay(self) -> float:
        return self.base_salary + (self.overtime_hours * self.hourly_rate)

def solve():
    lines = [l.strip() for l in sys.stdin.read().strip().split('\n') if l.strip()]
    for line in lines:
        parts = line.split(',')
        role, name, sal = parts[0].strip(), parts[1].strip(), float(parts[2].strip())
        if role == 'Manager':
            emp = Manager(name, sal, float(parts[3].strip()))
        else:
            emp = Developer(name, sal, float(parts[3].strip()), float(parts[4].strip()))
        print(f"{emp.name} ({role}): \${emp.calculate_pay():.2f}")

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: `Manager,Alice,5000,1500
Developer,Bob,4000,12,45`,
          expected_output: `Alice (Manager): $6500.00
Bob (Developer): $4540.00`
        }
      ]
    },
    summary: [
      'Inheritance establishes hierarchical "is-a" relationships between classes.',
      'Subclasses override methods to specialize behavior.',
      'super() cleanly delegates calls to parent classes following MRO.'
    ]
  },

  {
    id: 'top-py-int-polymorphism-abstraction',
    number: 10,
    numberDisplay: '10',
    moduleId: 'mod-oop',
    moduleTitle: 'Module 02: Object-Oriented Programming',
    title: 'Polymorphism & Abstraction (abc module)',
    slug: 'polymorphism-abstraction-abc-module',
    shortDescription: 'Apply polymorphic interfaces, Python duck typing, and enforce strict abstract base classes with the abc module.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisiteId: 'top-py-int-inheritance-overriding',
    learningObjectives: [
      'Understand polymorphism: treating different objects through a common uniform interface',
      'Apply Python duck typing principle ("If it walks like a duck and quacks like a duck...")',
      'Define abstract base classes (ABCs) using the standard abc.ABC module',
      'Enforce required method implementation using the @abstractmethod decorator'
    ],
    conceptExplanation: `### 1. Polymorphism
Polymorphism allows different classes to implement methods with the same name, enabling client code to interact with varying object types transparently through a uniform interface.

### 2. Duck Typing
In dynamically typed Python, polymorphism is largely driven by **Duck Typing**:
> *"If it walks like a duck and quacks like a duck, it's a duck."*
You don't need formal inheritance to use polymorphism—if an object has a \`quack()\` method, you can call it!

### 3. Abstraction & Abstract Base Classes (\`abc\`)
Abstraction hides internal complexity and exposes only essential interfaces. To enforce that subclasses **must** implement specific methods, Python provides the \`abc\` module:
* Inherit from \`abc.ABC\`.
* Mark required methods with \`@abstractmethod\`.
* Any subclass that fails to implement all abstract methods **cannot be instantiated** (Python raises \`TypeError\`).`,
    simpleExample: {
      code: `from abc import ABC, abstractmethod

class PaymentGateway(ABC):
    @abstractmethod
    def process(self, amount): pass

class PayPal(PaymentGateway):
    def process(self, amount):
        return f"Processed \${amount} via PayPal"

# g = PaymentGateway() -> Raises TypeError! Cannot instantiate abstract class
p = PayPal()
print(p.process(99))`,
      explanation: 'PaymentGateway defines a contract. PayPal fulfills the contract, making it instantiable and safe.'
    },
    syntax: `from abc import ABC, abstractmethod

class AbstractBase(ABC):
    @abstractmethod
    def required_method(self):
        pass`,
    codeExample: `from abc import ABC, abstractmethod
import math

class Shape(ABC):
    """Abstract interface defining contract for all geometric shapes."""
    @abstractmethod
    def area(self) -> float:
        pass

    @abstractmethod
    def perimeter(self) -> float:
        pass

class Circle(Shape):
    def __init__(self, radius: float):
        self.radius = radius

    def area(self) -> float:
        return math.pi * (self.radius ** 2)

    def perimeter(self) -> float:
        return 2 * math.pi * self.radius

class Square(Shape):
    def __init__(self, side: float):
        self.side = side

    def area(self) -> float:
        return self.side ** 2

    def perimeter(self) -> float:
        return 4 * self.side

# Polymorphic processing function: Accepts ANY Shape!
def print_shape_metrics(shape: Shape):
    print(f"Shape: {type(shape).__name__} | Area: {shape.area():.2f} | Perimeter: {shape.perimeter():.2f}")

shapes = [Circle(radius=5), Square(side=4)]
for s in shapes:
    print_shape_metrics(s)`,
    expectedOutput: `Shape: Circle | Area: 78.54 | Perimeter: 31.42
Shape: Square | Area: 16.00 | Perimeter: 16.00`,
    stepByStep: [
      'Shape inherits from abc.ABC and declares abstract methods area and perimeter.',
      'Circle and Square implement concrete versions of both methods.',
      'print_shape_metrics interacts with any Shape object polymorphically without type checking.',
      'If a subclass forgets to implement perimeter, Python halts instantiation immediately.'
    ],
    commonMistakes: [
      {
        mistake: 'Trying to instantiate a class that still has unimplemented abstract methods',
        correction: 'Implement all @abstractmethod definitions in the subclass',
        explanation: 'TypeError: Can\'t instantiate abstract class with abstract methods area, perimeter.'
      },
      {
        mistake: 'Using type(x) == ClassName checks instead of relying on polymorphism',
        correction: 'Just call the method or use isinstance(x, BaseClass)',
        explanation: 'Rigid type checks violate open/closed software design and prevent duck-typed extensions.'
      }
    ],
    realWorldExample: {
      scenario: 'Cloud Storage Driver Architecture',
      code: `from abc import ABC, abstractmethod

class StorageDriver(ABC):
    @abstractmethod
    def upload(self, file_path, content): pass

class AWS_S3_Driver(StorageDriver):
    def upload(self, file_path, content):
        return f"[S3] Uploaded {len(content)} bytes to bucket://{file_path}"

class Local_Disk_Driver(StorageDriver):
    def upload(self, file_path, content):
        return f"[Disk] Wrote {len(content)} bytes to /var/storage/{file_path}"

def backup_data(driver: StorageDriver, data: bytes):
    return driver.upload("backups/daily.tar.gz", data)

print(backup_data(AWS_S3_Driver(), b"system_state"))
print(backup_data(Local_Disk_Driver(), b"system_state"))`,
      explanation: 'Production software swaps storage drivers (S3, GCS, Local) seamlessly because client code depends on the StorageDriver abstract interface.'
    },
    practice: {
      prompt: 'Import ABC and abstractmethod. Define an abstract class Notifier(ABC) with abstract method send(message). Implement SMSNotifier(Notifier) whose send(message) returns "SMS: " + message. Test with n = SMSNotifier() and print n.send("Server OK").',
      starterCode: `from abc import ABC, abstractmethod

# Define Notifier and SMSNotifier here

n = SMSNotifier()
print(n.send("Server OK"))
`,
      expectedOutputMatcher: `SMS: Server OK`,
      hint: 'class SMSNotifier(Notifier): def send(self, message): return f"SMS: {message}"',
      solution: `from abc import ABC, abstractmethod

class Notifier(ABC):
    @abstractmethod
    def send(self, message):
        pass

class SMSNotifier(Notifier):
    def send(self, message):
        return f"SMS: {message}"

n = SMSNotifier()
print(n.send("Server OK"))`
    },
    quiz: [
      {
        id: 'q-py-poly-1',
        question: 'What happens if you attempt to instantiate an abstract base class directly in Python?',
        options: [
          'It compiles normally but returns None',
          'Raises TypeError: Can\'t instantiate abstract class',
          'Returns a proxy object',
          'Automatically runs a stub implementation'
        ],
        correctIndex: 1,
        explanation: 'Python prevents instantiation of any class inheriting from ABC that contains un-overridden @abstractmethod definitions.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-poly-2',
        question: 'Which design concept is best summarized by "Write code against interfaces, not concrete implementations"?',
        options: ['Encapsulation', 'Polymorphism & Abstraction', 'Bytecode optimization', 'Tail recursion'],
        correctIndex: 1,
        explanation: 'Abstraction allows code to depend on stable contracts rather than volatile concrete classes.',
        difficulty: 'medium'
      }
    ,
      {
        id: "q-py-poly-3",
        question: "What is the defining philosophy of 'Duck Typing' in Python?",
        codeSnippet: null,
        options: [
          "Objects must explicitly inherit from a common C++ interface",
          "'If it walks like a duck and quacks like a duck, it's a duck' — code checks for required methods/attributes rather than explicit inheritance types",
          "All objects must implement __repr__",
          "Classes cannot have more than 2 subclasses"
        ],
        correctIndex: 1,
        explanation: "Duck typing relies on object capabilities (methods and protocols) rather than explicit inheritance hierarchies or static type declarations.",
        difficulty: "easy"
      },
      {
        id: "q-py-poly-4",
        question: "What happens if a class inherits from abc.ABC and contains an un-implemented @abstractmethod when instantiated?",
        codeSnippet: `from abc import ABC, abstractmethod
class Payment(ABC):
    @abstractmethod
    def pay(self):
        pass
class CreditCard(Payment):
    pass
c = CreditCard()`,
        options: [
          "It instantiates normally with a warning",
          "Raises TypeError: Can't instantiate abstract class CreditCard with abstract method pay",
          "pay() returns None automatically",
          "It creates a dummy C pointer"
        ],
        correctIndex: 1,
        explanation: "Python's ABC mechanism actively blocks instantiation of subclasses that have not fully overridden all abstract methods, enforcing interface contracts.",
        difficulty: "medium"
      },
      {
        id: "q-py-poly-5",
        question: "Why is 'Composition over Inheritance' widely recognized as a best practice in modern object-oriented software design?",
        codeSnippet: null,
        options: [
          "Composition creates loose coupling by combining independent components ('has-a') rather than rigid inheritance hierarchies ('is-a')",
          "Inheritance is unsupported in Python 3",
          "Composition reduces RAM consumption to 0 bytes",
          "Composition guarantees thread safety"
        ],
        correctIndex: 0,
        explanation: "Composition builds complex behavior by assembling flexible, interchangeable components rather than locking classes into fragile, deeply nested inheritance trees.",
        difficulty: "medium"
      }
    ],
    challenge: {
      title: "Polymorphic Payment Notification Engine",
      problemStatement: `Define an abstract base class \`Notifier(ABC)\` with an \`@abstractmethod send(recipient: str, message: str) -> str\`. Implement concrete subclasses: \`EmailNotifier\` returning '[EMAIL -> {recipient}] {message}', and \`SMSNotifier\` returning '[SMS -> {recipient}] {message}'. Write a dispatch function \`notify_all(notifiers: list, recipient: str, msg: str)\` that polymorphically invokes each notifier.`,
      inputFormat: "Two lines: Line 1: recipient, Line 2: notification message.",
      outputFormat: "Two lines: Email notification result and SMS notification result.",
      constraints: "Strings are non-empty.",
      starterCode: `import sys
from abc import ABC, abstractmethod

class Notifier(ABC):
    @abstractmethod
    def send(self, recipient: str, message: str) -> str:
        pass

class EmailNotifier(Notifier):
    def send(self, recipient: str, message: str) -> str:
        return f"[EMAIL -> {recipient}] {message}"

class SMSNotifier(Notifier):
    def send(self, recipient: str, message: str) -> str:
        return f"[SMS -> {recipient}] {message}"

def solve():
    lines = [l.strip() for l in sys.stdin.read().strip().split('\n') if l.strip()]
    if len(lines) < 2:
        return
    recipient, msg = lines[0], lines[1]
    notifiers = [EmailNotifier(), SMSNotifier()]
    for n in notifiers:
        print(n.send(recipient, msg))

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: `user@domain.com
Your order has shipped!`,
          expected_output: `[EMAIL -> user@domain.com] Your order has shipped!
[SMS -> user@domain.com] Your order has shipped!`
        }
      ]
    },
    summary: [
      'Polymorphism allows disparate objects to be treated uniformly through shared interfaces.',
      'Duck typing prioritizes object behavior over rigid type hierarchy.',
      'abc.ABC enforces formal architectural contracts across engineering teams.'
    ]
  },

  // ==========================================
  // MODULE 03: DATA STRUCTURES
  // ==========================================
  {
    id: 'top-py-int-ds-intro-arrays',
    number: 11,
    numberDisplay: '11',
    moduleId: 'mod-ds',
    moduleTitle: 'Module 03: Data Structures',
    title: 'Intro to Data Structures, ADTs & Dynamic Arrays',
    slug: 'intro-data-structures-adts-dynamic-arrays',
    shortDescription: 'Understand Abstract Data Types vs concrete implementations, contiguous memory layout, and Python list dynamic resizing.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisiteId: 'top-py-int-polymorphism-abstraction',
    learningObjectives: [
      'Distinguish between Abstract Data Types (what operations do) and Data Structures (how data is stored)',
      'Understand physical memory layout: contiguous RAM slots vs pointer references',
      'Explain how Python dynamic arrays (list) achieve O(1) amortized append time via over-allocation',
      'Analyze the time and space complexity trade-offs of array index access vs insertions'
    ],
    conceptExplanation: `A **Data Structure** is a specialized format for organizing, processing, retrieving, and storing data in computer memory.

### 1. Abstract Data Type (ADT) vs Concrete Data Structure
* **ADT (The Interface):** A mathematical model describing *what* operations are supported and their semantics (e.g. List, Stack, Queue).
* **Data Structure (The Implementation):** The physical memory layout and algorithmic instructions that fulfill the ADT (e.g. Dynamic Array, Singly Linked List).

### 2. Contiguous Memory & Dynamic Arrays
In hardware, a primitive array is a continuous block of physical RAM cells. Accessing index \`i\` is an immediate $O(1)$ arithmetic calculation:
\`Address(i) = BaseAddress + (i * ElementSize)\`

### 3. How Python Lists Work
In Python, \`list\` is implemented as a **dynamic array of pointers** (\`PyObject*\`):
1. **Contiguous Buffer:** Python allocates contiguous memory for pointer references.
2. **Geometric Growth (Over-allocation):** When the list becomes full, Python allocates a larger contiguous memory chunk (typically roughly $1.125\\times$ current size + padding), copies pointer references, and frees the old buffer.
3. **Amortized $O(1)$ Append:** Because resizing happens infrequently, appending to a Python list has an **amortized time complexity of $O(1)$**, while inserting at the beginning ($O(n)$) requires shifting all subsequent elements!`,
    simpleExample: {
      code: `import sys
nums = []
print("Initial size in bytes:", sys.getsizeof(nums))
for i in range(5):
    nums.append(i)
    print(f"Count: {len(nums)}, Memory buffer: {sys.getsizeof(nums)} bytes")`,
      explanation: 'Notice how the memory buffer jumps in discrete chunks, demonstrating over-allocation.'
    },
    syntax: `# Python dynamic list operations:
arr = [1, 2, 3]
arr.append(4)     # O(1) amortized
val = arr[0]      # O(1) index lookup
arr.insert(0, 99) # O(n) element shift`,
    codeExample: `import time

# Benchmark: Append (O(1) amortized) vs Prepend (O(n) shift)
n = 50_000

# 1. Append at end
start = time.perf_counter()
append_list = []
for i in range(n):
    append_list.append(i)
append_time = time.perf_counter() - start

# 2. Insert at front (causes O(n) shift per insertion)
start = time.perf_counter()
prepend_list = []
for i in range(n):
    prepend_list.insert(0, i)
prepend_time = time.perf_counter() - start

print(f"Appended {n} items: {append_time:.5f}s")
print(f"Prepended {n} items: {prepend_time:.5f}s")
print(f"Prepend is ~{prepend_time / append_time:.1f}x slower due to O(n) memory shifts!")`,
    expectedOutput: `Appended 50000 items: 0.00350s
Prepended 50000 items: 0.28500s
Prepend is ~81.4x slower due to O(n) memory shifts!`,
    stepByStep: [
      'The CPU uses base pointer arithmetic to fetch any index in O(1) time.',
      'Appending checks if current size < allocated capacity.',
      'If space remains, the reference is written in O(1) time.',
      'If full, Python allocates a new larger buffer, copies existing references, and writes the new element.'
    ],
    commonMistakes: [
      {
        mistake: 'Using list.insert(0, item) repeatedly in a high-throughput loop',
        correction: 'Use collections.deque for O(1) double-ended insertions',
        explanation: 'Inserting at index 0 shifts every existing element to the right by one position, turning an O(n) loop into an O(n^2) disaster.'
      },
      {
        mistake: 'Assuming Python lists store actual primitive bytes contiguous in memory',
        correction: 'Recognize that Python lists store pointers to heap-allocated objects (PyObject*)',
        explanation: 'For raw numeric contiguous buffers, use the array module or NumPy.'
      }
    ],
    realWorldExample: {
      scenario: 'High-Speed Stock Ticker Buffer',
      code: `class StockTickerHistory:
    def __init__(self, symbol):
        self.symbol = symbol
        self.prices = []

    def record_price(self, price: float):
        self.prices.append(price)  # O(1) amortized

    def latest(self):
        return self.prices[-1] if self.prices else None

ticker = StockTickerHistory("NVDA")
ticker.record_price(124.50)
ticker.record_price(126.80)
print(f"{ticker.symbol} Latest: \${ticker.latest()}")`,
      explanation: 'Financial logging systems record thousands of ticks per second into append-only dynamic arrays.'
    },
    practice: {
      prompt: 'Write a function filter_positive_indices(arr) that returns a list of the INDICES where elements are > 0. Test with arr = [-5, 10, -2, 30, 0].',
      starterCode: `def filter_positive_indices(arr):
    # Implement using range(len(arr)) or enumerate
    pass

print(filter_positive_indices([-5, 10, -2, 30, 0]))
`,
      expectedOutputMatcher: `[1, 3]`,
      hint: 'return [idx for idx, val in enumerate(arr) if val > 0]',
      solution: `def filter_positive_indices(arr):
    return [idx for idx, val in enumerate(arr) if val > 0]

print(filter_positive_indices([-5, 10, -2, 30, 0]))`
    },
    quiz: [
      {
        id: 'q-py-arr-1',
        question: 'What is the time complexity of reading an element by index in a dynamic array (e.g. arr[42])?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
        correctIndex: 0,
        explanation: 'Arrays compute memory addresses directly using index arithmetic in constant O(1) time.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-arr-2',
        question: 'Why is list.append() considered amortized O(1) even though array resizing requires O(n) copy operations?',
        options: [
          'Python uses quantum parallelism',
          'Resizing happens geometrically and infrequently, distributing the copy cost across many cheap O(1) appends',
          'Memory is never copied',
          'Only integers can be appended in O(1)'
        ],
        correctIndex: 1,
        explanation: 'Over-allocating memory ensures resize operations happen exponentially less often as the list grows.'
      }
    ,
      {
        id: "q-py-arr-3",
        question: "Why does appending to a dynamic array (like Python's list) have an amortized time complexity of O(1) despite resizing copying elements in O(N)?",
        codeSnippet: null,
        options: [
          "Resizing happens with geometric expansion (e.g. ~1.125x + 6), making expensive O(N) reallocations exponentially rare",
          "CPython uses quantum pointers that never reallocate",
          "Appending always uses O(N^2) memory",
          "Because Python lists are actually linked lists"
        ],
        correctIndex: 0,
        explanation: "Geometric capacity growth ensures that the cost of copying N elements is amortized (spread out) over N previous O(1) appends, yielding average O(1) cost per append.",
        difficulty: "medium"
      },
      {
        id: "q-py-arr-4",
        question: "What is the worst-case time complexity of inserting or deleting an element at index 0 of a standard Python list with N elements?",
        codeSnippet: null,
        options: [
          "O(1)",
          "O(log N)",
          "O(N)",
          "O(N log N)"
        ],
        correctIndex: 2,
        explanation: "Inserting or deleting at index 0 requires shifting all N subsequent pointers in contiguous memory right or left by one slot, which takes O(N) time.",
        difficulty: "easy"
      },
      {
        id: "q-py-arr-5",
        question: "What does a Python list actually store in contiguous memory?",
        codeSnippet: null,
        options: [
          "The raw unboxed integer or character bytes directly",
          "An array of memory address pointers (PyObject*) pointing to Python objects on the heap",
          "A serialized JSON string",
          "A hash map table"
        ],
        correctIndex: 1,
        explanation: "Python lists are arrays of pointers (references) to PyObject structures. This is why Python lists can store heterogeneous data types seamlessly.",
        difficulty: "medium"
      }
    ],
    challenge: {
      title: "Dynamic Array Resizing Simulator",
      problemStatement: `Implement a simplified dynamic array simulator \`DynamicArray\` that starts with capacity 2. When \`append(x)\` is called and \`size == capacity\`, double the capacity (\`capacity *= 2\`) and record a resize event. Implement \`size\`, \`capacity\`, \`append(x)\`, and \`get(index)\`. In \`solve()\`, read N numbers, append them all, and print 'Size: {size}, Capacity: {capacity}, Elements: {list}'.`,
      inputFormat: "A single line with space-separated integers.",
      outputFormat: "'Size: {size}, Capacity: {capacity}, Elements: [e1, e2, ...]'",
      constraints: "1 <= N <= 100",
      starterCode: `import sys

class DynamicArray:
    def __init__(self):
        self.capacity = 2
        self.size = 0
        self.data = [None] * self.capacity

    def append(self, val):
        if self.size == self.capacity:
            self._resize(self.capacity * 2)
        self.data[self.size] = val
        self.size += 1

    def _resize(self, new_cap):
        new_data = [None] * new_cap
        for i in range(self.size):
            new_data[i] = self.data[i]
        self.data = new_data
        self.capacity = new_cap

def solve():
    raw = sys.stdin.read().strip()
    if not raw:
        return
    nums = [int(x) for x in raw.split()]
    arr = DynamicArray()
    for x in nums:
        arr.append(x)
    print(f"Size: {arr.size}, Capacity: {arr.capacity}, Elements: {arr.data[:arr.size]}")

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: "10 20 30 40 50",
          expected_output: "Size: 5, Capacity: 8, Elements: [10, 20, 30, 40, 50]"
        }
      ]
    },
    summary: [
      'ADTs define operational contracts; data structures define concrete memory organization.',
      'Dynamic arrays provide O(1) random index access and O(1) amortized append.',
      'Insertions and deletions at arbitrary positions require O(n) element shifting.'
    ]
  },

  {
    id: 'top-py-int-linked-lists',
    number: 12,
    numberDisplay: '12',
    moduleId: 'mod-ds',
    moduleTitle: 'Module 03: Data Structures',
    title: 'Singly & Doubly Linked Lists',
    slug: 'linked-lists-singly-doubly-nodes',
    shortDescription: 'Build pointer-based linear structures with nodes, head/tail pointers, constant-time head insertions, and sequential traversal.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisiteId: 'top-py-int-ds-intro-arrays',
    learningObjectives: [
      'Understand node-based storage: data payload and next pointer references',
      'Construct a singly linked list from scratch with append, prepend, and traversal',
      'Compare linked list time complexities ($O(1)$ front insertion vs $O(n)$ search) with dynamic arrays',
      'Explain the architecture of doubly linked lists with prev and next references'
    ],
    conceptExplanation: `Unlike arrays which store elements in contiguous memory slots, a **Linked List** is a linear data structure composed of discrete **Nodes** scattered throughout heap memory. Each node holds its data and a reference (pointer) to the next node.

### 1. Singly Linked List Structure
* **Node:** An object containing \`data\` and a \`next\` pointer.
* **Head:** A pointer to the first node in the sequence.
* **Tail:** The last node, whose \`next\` pointer is \`None\`.

\`[Head: 10] -> [Node: 20] -> [Node: 30] -> None\`

### 2. Key Advantages over Arrays
* **Constant Time Insertion/Deletion at Front ($O(1)$):** Simply re-point the \`Head\` reference without shifting any other nodes!
* **No Pre-allocated Buffer:** Allocates memory on demand per node without resizing overhead.

### 3. Key Disadvantages
* **No Random Access ($O(n)$):** To access index $k$, you must sequentially traverse through $k$ preceding nodes.
* **Memory Overhead:** Extra memory for storing pointer references (\`next\`, \`prev\`).

### 4. Doubly Linked Lists
Nodes contain both \`next\` and \`prev\` pointers, allowing bidirectional traversal at the expense of an additional pointer per node.`,
    simpleExample: {
      code: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

head = Node("First")
head.next = Node("Second")
head.next.next = Node("Third")

curr = head
while curr:
    print(curr.data, end=" -> ")
    curr = curr.next
print("None")`,
      explanation: 'Three node objects are chained together in memory by updating their next pointers.'
    },
    syntax: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None`,
    codeExample: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class SinglyLinkedList:
    def __init__(self):
        self.head = None
        self.size = 0

    def prepend(self, data):
        """O(1) insertion at the front."""
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node
        self.size += 1

    def append(self, data):
        """O(n) insertion at the end."""
        new_node = Node(data)
        if not self.head:
            self.head = new_node
        else:
            curr = self.head
            while curr.next:
                curr = curr.next
            curr.next = new_node
        self.size += 1

    def to_list(self):
        result = []
        curr = self.head
        while curr:
            result.append(curr.data)
            curr = curr.next
        return result

ll = SinglyLinkedList()
ll.append(20)
ll.append(30)
ll.prepend(10)  # O(1) front insert!
print("Linked list elements:", ll.to_list())
print("Total size:", ll.size)`,
    expectedOutput: `Linked list elements: [10, 20, 30]
Total size: 3`,
    stepByStep: [
      'Creating new_node allocates memory for data and next=None.',
      'In prepend, new_node.next is set to the current head node.',
      'self.head is updated to point to new_node in constant O(1) time.',
      'Traversal visits nodes sequentially following next pointers until encountering None.'
    ],
    commonMistakes: [
      {
        mistake: 'Losing reference to the rest of the list: self.head = new_node before setting new_node.next',
        correction: 'Always link new_node.next = self.head BEFORE re-pointing self.head',
        explanation: 'If you overwrite self.head first, all subsequent nodes are orphaned and garbage collected!'
      },
      {
        mistake: 'Forgetting to check if head is None when appending or deleting',
        correction: 'Always handle the empty list edge case explicitly',
        explanation: 'Calling curr.next when curr is None raises AttributeError: \'NoneType\' object has no attribute \'next\'.'
      }
    ],
    realWorldExample: {
      scenario: 'Music Playlist Play Next Queue',
      code: `class TrackNode:
    def __init__(self, title):
        self.title = title
        self.next = None

class PlaylistQueue:
    def __init__(self):
        self.head = None

    def play_next(self, title):
        node = TrackNode(title)
        node.next = self.head
        self.head = node

playlist = PlaylistQueue()
playlist.play_next("Song B")
playlist.play_next("Song A (Priority)")
print("Current playing track:", playlist.head.title)`,
      explanation: 'Streaming audio apps and media players model dynamic "play next" insertion using linked nodes.'
    },
    practice: {
      prompt: 'Write a function count_nodes(head) that takes the head node of a singly linked list and returns the total number of nodes in the list.',
      starterCode: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

def count_nodes(head):
    # Traverse and count nodes
    pass

h = Node(1)
h.next = Node(2)
h.next.next = Node(3)
print(count_nodes(h))
`,
      expectedOutputMatcher: `3`,
      hint: 'count = 0; curr = head; while curr: count += 1; curr = curr.next; return count',
      solution: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

def count_nodes(head):
    count = 0
    curr = head
    while curr:
        count += 1
        curr = curr.next
    return count

h = Node(1)
h.next = Node(2)
h.next.next = Node(3)
print(count_nodes(h))`
    },
    quiz: [
      {
        id: 'q-py-ll-1',
        question: 'What is the time complexity of inserting an element at the beginning (head) of a singly linked list?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctIndex: 0,
        explanation: 'Prepend only involves updating new_node.next and head, which takes constant O(1) time regardless of list size.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-ll-2',
        question: 'Why are arrays generally preferred over linked lists for sequential read-heavy tasks?',
        options: [
          'Linked lists cannot store strings',
          'Array elements are stored contiguously in memory, offering superior CPU cache locality',
          'Arrays do not allow deletions',
          'Linked lists require garbage collection pause cycles'
        ],
        correctIndex: 1,
        explanation: 'Contiguous arrays benefit from CPU hardware prefetching and cache hits, whereas traversing pointers jumps across scattered memory addresses.',
        difficulty: 'medium'
      }
    ,
      {
        id: "q-py-ll-3",
        question: "What is the time complexity to insert a new node at the HEAD of a Singly Linked List?",
        codeSnippet: null,
        options: [
          "O(1)",
          "O(N)",
          "O(log N)",
          "O(N^2)"
        ],
        correctIndex: 0,
        explanation: "Inserting at the head requires creating a node, setting node.next = head, and updating head = node. No traversal or shifting is needed, making it strictly O(1).",
        difficulty: "easy"
      },
      {
        id: "q-py-ll-4",
        question: "How do you detect a cycle in a linked list in O(N) time and O(1) auxiliary space?",
        codeSnippet: null,
        options: [
          "Floyd's Tortoise and Hare algorithm (two pointers moving at speed 1 and 2)",
          "Binary Search on the nodes",
          "Recursively reversing the list",
          "Sorting the list pointers"
        ],
        correctIndex: 0,
        explanation: "Floyd's Cycle-Finding algorithm uses a slow pointer (1 step) and fast pointer (2 steps). If a cycle exists, the fast pointer will inevitably lap and meet the slow pointer.",
        difficulty: "medium"
      },
      {
        id: "q-py-ll-5",
        question: "What is the primary memory drawback of a Doubly Linked List compared to a Singly Linked List?",
        codeSnippet: null,
        options: [
          "Each node requires an additional pointer reference ('prev'), increasing per-node memory overhead",
          "Doubly linked lists cannot store numbers",
          "Traversals run twice as slow",
          "Memory fragmentation prevents garbage collection"
        ],
        correctIndex: 0,
        explanation: `Every node in a doubly linked list must hold two references (\`prev\` and \`next\`), increasing pointer memory overhead by 100% per node.`,
        difficulty: "easy"
      }
    ],
    challenge: {
      title: "Reverse a Singly Linked List In-Place",
      problemStatement: `Implement an in-place reversal algorithm for a singly linked list. Given a list of integers from stdin, build the list \`head -> n1 -> n2 -> ...\`, reverse it in-place using three pointers (\`prev\`, \`curr\`, \`next\`), and print the reversed values space-separated.`,
      inputFormat: "A single line with space-separated integers.",
      outputFormat: "Reversed integers space-separated.",
      constraints: "0 <= N <= 100",
      starterCode: `import sys

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head: ListNode) -> ListNode:
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev

def solve():
    raw = sys.stdin.read().strip()
    if not raw:
        return
    nums = [int(x) for x in raw.split()]
    dummy = ListNode()
    curr = dummy
    for n in nums:
        curr.next = ListNode(n)
        curr = curr.next
    rev_head = reverse_list(dummy.next)
    res = []
    while rev_head:
        res.append(str(rev_head.val))
        rev_head = rev_head.next
    print(' '.join(res))

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: "1 2 3 4 5",
          expected_output: "5 4 3 2 1"
        }
      ]
    },
    summary: [
      'Linked lists store elements in nodes scattered across memory chained by pointers.',
      'Insertion and deletion at the head take constant O(1) time.',
      'Random access takes O(n) linear time because pointers must be traversed sequentially.'
    ]
  },

  {
    id: 'top-py-int-stacks',
    number: 13,
    numberDisplay: '13',
    moduleId: 'mod-ds',
    moduleTitle: 'Module 03: Data Structures',
    title: 'Stacks & Real-World Applications',
    slug: 'stacks-lifo-applications-parentheses',
    shortDescription: 'Master the Last-In First-Out (LIFO) stack principle, push/pop operations, balanced parenthesis matching, and undo systems.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisiteId: 'top-py-int-linked-lists',
    learningObjectives: [
      'Understand the Last-In, First-Out (LIFO) stack operational invariant',
      'Implement push, pop, peek, and is_empty methods with O(1) efficiency',
      'Solve classic algorithmic problems: balanced brackets and postfix evaluation',
      'Recognize how runtime environments utilize call stacks for function execution'
    ],
    conceptExplanation: `A **Stack** is a linear Abstract Data Type that adheres strictly to the **Last-In, First-Out (LIFO)** principle. The last item added to the stack is the first item removed. Think of a physical stack of dinner plates: you place new plates on top, and you take plates off from the top.

### 1. Primary Stack Operations
* **\`push(item)\`:** Adds an element to the top of the stack ($O(1)$).
* **\`pop()\`:** Removes and returns the top element ($O(1)$). Raises an error if the stack is empty (Stack Underflow).
* **\`peek()\` / \`top()\`:** Returns the top element without removing it ($O(1)$).
* **\`is_empty()\`:** Returns \`True\` if the stack has no elements ($O(1)$).

### 2. Implementation in Python
1. **Using Python \`list\`:** \`list.append()\` acts as \`push()\`, and \`list.pop()\` acts as \`pop()\`. Both operate at the end of the array in $O(1)$ time!
2. **Using \`collections.deque\`:** Offers strictly bounded memory blocks and guaranteed $O(1)$ operations without occasional geometric resizing overhead.

### 3. Canonical Applications
* **Undo / Redo Buffers:** Text editors store editing actions on a stack.
* **Syntax Parsers:** Matching opening and closing brackets \`({[]})\`.
* **Call Stack:** The runtime OS and Python VM allocate stack frames to track function execution and local variable scope.`,
    simpleExample: {
      code: `stack = []
stack.append("Page 1")  # Push
stack.append("Page 2")  # Push
stack.append("Page 3")  # Push
print("Current page:", stack[-1])  # Peek
print("Go back to:", stack.pop())  # Pop
print("Now on:", stack[-1])`,
      explanation: 'Browser back-button navigation is a textbook stack: clicking back pops the most recently visited page.'
    },
    syntax: `class Stack:
    def __init__(self): self._items = []
    def push(self, val): self._items.append(val)
    def pop(self): return self._items.pop()
    def peek(self): return self._items[-1]
    def is_empty(self): return len(self._items) == 0`,
    codeExample: `class Stack:
    def __init__(self):
        self._data = []

    def push(self, item):
        self._data.append(item)

    def pop(self):
        if self.is_empty():
            raise IndexError("pop from empty stack")
        return self._data.pop()

    def peek(self):
        if self.is_empty():
            return None
        return self._data[-1]

    def is_empty(self):
        return len(self._data) == 0

    def size(self):
        return len(self._data)

# Application: Balanced Parentheses Checker
def is_balanced(expression: str) -> bool:
    stack = Stack()
    mapping = {")": "(", "}": "{", "]": "["}

    for char in expression:
        if char in mapping.values():
            stack.push(char)
        elif char in mapping:
            if stack.is_empty() or stack.pop() != mapping[char]:
                return False
    return stack.is_empty()

print("Test 1 '{[()]}':", is_balanced("{[()]}"))
print("Test 2 '{[(])}':", is_balanced("{[(])}"))
print("Test 3 '((())':", is_balanced("((())"))`,
    expectedOutput: `Test 1 '{[()]}': True
Test 2 '{[(])}': False
Test 3 '((())': False`,
    stepByStep: [
      'An opening bracket is pushed onto the stack.',
      'When a closing bracket is found, the stack is popped and compared.',
      'If the popped opening bracket does not match the closing bracket, it returns False immediately.',
      'If the stack is completely empty at the end of the string, all brackets were balanced.'
    ],
    commonMistakes: [
      {
        mistake: 'Using list.pop(0) instead of list.pop() for a stack',
        correction: 'Always use list.pop() (removes from end)',
        explanation: 'list.pop(0) removes from the front and shifts all remaining elements, causing an O(n) bottleneck instead of O(1).'
      },
      {
        mistake: 'Failing to check is_empty before popping in expressions',
        correction: 'Check not stack.is_empty() before calling pop()',
        explanation: 'An expression like ")(" would raise IndexError on the first character without an empty check.'
      }
    ],
    realWorldExample: {
      scenario: 'Text Editor Undo Engine',
      code: `class TextEditor:
    def __init__(self):
        self.text = ""
        self.history = []  # Undo stack

    def type_text(self, new_chars):
        self.history.append(self.text)  # Snapshot
        self.text += new_chars

    def undo(self):
        if self.history:
            self.text = self.history.pop()

doc = TextEditor()
doc.type_text("Hello")
doc.type_text(" World")
print("Typed:", doc.text)
doc.undo()
print("After Undo:", doc.text)`,
      explanation: 'IDEs and word processors implement undo history via action snapshot stacks.'
    },
    practice: {
      prompt: 'Write a function reverse_string_stack(text) that uses a stack (list) to reverse a string. Return the reversed string.',
      starterCode: `def reverse_string_stack(text):
    # Push all characters to a stack, then pop all to build reversed string
    pass

print(reverse_string_stack("data structures"))
`,
      expectedOutputMatcher: `serutcurts atad`,
      hint: 'stack = list(text); return "".join(stack.pop() for _ in range(len(stack)))',
      solution: `def reverse_string_stack(text):
    stack = list(text)
    reversed_chars = []
    while stack:
        reversed_chars.append(stack.pop())
    return "".join(reversed_chars)

print(reverse_string_stack("data structures"))`
    },
    quiz: [
      {
        id: 'q-py-stk-1',
        question: 'Which principle governs the order of items removed from a stack?',
        options: ['FIFO (First-In First-Out)', 'LIFO (Last-In First-Out)', 'LILO (Last-In Last-Out)', 'Random access'],
        correctIndex: 1,
        explanation: 'Stacks are Last-In First-Out (LIFO): the most recently pushed item is always the first one popped.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-stk-2',
        question: 'What is the time complexity of the push and pop operations on a properly implemented stack?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
        correctIndex: 0,
        explanation: 'Push and pop both operate strictly at the top of the stack, executing in constant O(1) time.',
        difficulty: 'easy'
      }
    ,
      {
        id: "q-py-stk-3",
        question: "Which of the following real-world software components relies fundamentally on a Stack (LIFO)?",
        codeSnippet: null,
        options: [
          "Browser history (Back button) and Text Editor Undo/Redo buffers",
          "Printer spooling",
          "CPU Round-robin scheduling",
          "DNS round-robin routing"
        ],
        correctIndex: 0,
        explanation: "Browser back navigation and Undo mechanisms pop the most recently added state first, matching the Last-In-First-Out (LIFO) discipline of stacks.",
        difficulty: "easy"
      },
      {
        id: "q-py-stk-4",
        question: "What is the time complexity of validating balanced parentheses in a string of length N using a stack?",
        codeSnippet: null,
        options: [
          "O(1)",
          "O(N)",
          "O(N^2)",
          "O(2^N)"
        ],
        correctIndex: 1,
        explanation: "Each character is pushed or popped from the stack at most once, and stack operations are O(1), leading to an overall O(N) time complexity.",
        difficulty: "easy"
      },
      {
        id: "q-py-stk-5",
        question: "Predict the output of the following stack sequence:",
        codeSnippet: `stack = []
stack.append(10)
stack.append(20)
stack.pop()
stack.append(30)
stack.append(40)
print(stack.pop() + stack[-1])`,
        options: [
          "70",
          "50",
          "60",
          "40"
        ],
        correctIndex: 0,
        explanation: "stack.append(10, 20), pop() removes 20 (stack: [10]). append(30, 40) -> [10, 30, 40]. pop() returns 40. stack[-1] (top) is 30. 40 + 30 = 70.",
        difficulty: "medium"
      }
    ],
    challenge: {
      title: "Balanced Brackets Validator",
      problemStatement: "Given a string containing only characters '(', ')', '{', '}', '[', and ']', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets in the correct order. Print 'VALID' or 'INVALID'.",
      inputFormat: "A single string containing brackets.",
      outputFormat: "'VALID' or 'INVALID'.",
      constraints: "1 <= len(s) <= 1000",
      starterCode: `import sys

def is_valid(s: str) -> bool:
    mapping = {')': '(', '}': '{', ']': '['}
    stack = []
    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
    return len(stack) == 0

def solve():
    raw = sys.stdin.read().strip()
    if not raw:
        return
    print("VALID" if is_valid(raw) else "INVALID")

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: "{[()]}",
          expected_output: "VALID"
        },
        {
          input: "([)]",
          expected_output: "INVALID"
        }
      ]
    },
    summary: [
      'Stacks follow Last-In First-Out (LIFO) semantics.',
      'Push, pop, and peek operate in constant O(1) time.',
      'Widely used in undo histories, syntax parsing, and execution call stacks.'
    ]
  },

  {
    id: 'top-py-int-queues',
    number: 14,
    numberDisplay: '14',
    moduleId: 'mod-ds',
    moduleTitle: 'Module 03: Data Structures',
    title: 'Queues & Circular Queues',
    slug: 'queues-circular-queues-fifo-deque',
    shortDescription: 'Master the First-In First-Out (FIFO) queue principle, collections.deque, circular ring buffers, and task scheduling.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisiteId: 'top-py-int-stacks',
    learningObjectives: [
      'Understand the First-In, First-Out (FIFO) queue operational invariant',
      'Explain why Python list is inefficient for queues (O(n) pop(0)) and why collections.deque is O(1)',
      'Implement a Circular Queue (Ring Buffer) using modulo arithmetic pointer wrapping',
      'Apply queues to real-world task scheduling and breadth-first search (BFS)'
    ],
    conceptExplanation: `A **Queue** is a linear Abstract Data Type that adheres strictly to the **First-In, First-Out (FIFO)** principle. The first item added to the queue is the first item to be removed. Think of a line at a supermarket checkout: the customer who arrives first is served first.

### 1. Primary Queue Operations
* **\`enqueue(item)\`:** Adds an element to the rear/tail of the queue ($O(1)$).
* **\`dequeue()\`:** Removes and returns the element at the front/head ($O(1)$).
* **\`front()\` / \`peek()\`:** Inspects the front element without removing it ($O(1)$).
* **\`is_empty()\`:** Checks if the queue has no elements.

### 2. The Python Implementation Trap
* **Do NOT use \`list\` for queues!** Calling \`list.pop(0)\` shifts every remaining item in the list one index to the left, taking $O(n)$ linear time.
* **Use \`collections.deque\`:** \`deque\` (double-ended queue) is implemented internally as a doubly linked list of fixed-size memory blocks, providing true **$O(1)$** operations at both ends!

### 3. Circular Queues (Ring Buffers)
A circular queue uses a fixed-size array where the tail wraps around to the beginning using the modulo operator \`%\`:
\`tail = (tail + 1) % capacity\`
This avoids shifting elements and enables bounded hardware streaming buffers.`,
    simpleExample: {
      code: `from collections import deque

queue = deque()
queue.append("Print Job 1")  # Enqueue
queue.append("Print Job 2")  # Enqueue
print("Serving:", queue.popleft())  # Dequeue -> Job 1
print("Next up:", queue[0])         # Peek -> Job 2`,
      explanation: 'collections.deque achieves true O(1) front removal with popleft(), unlike list.pop(0).'
    },
    syntax: `from collections import deque
q = deque()
q.append(item)      # Enqueue O(1)
val = q.popleft()   # Dequeue O(1)`,
    codeExample: `class CircularQueue:
    """Fixed-capacity ring buffer using modulo indexing."""
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.queue = [None] * capacity
        self.head = 0
        self.tail = 0
        self.size = 0

    def enqueue(self, item) -> bool:
        if self.size == self.capacity:
            print("Queue Overflow: Buffer is full!")
            return False
        self.queue[self.tail] = item
        self.tail = (self.tail + 1) % self.capacity
        self.size += 1
        return True

    def dequeue(self):
        if self.size == 0:
            print("Queue Underflow: Buffer is empty!")
            return None
        item = self.queue[self.head]
        self.queue[self.head] = None
        self.head = (self.head + 1) % self.capacity
        self.size -= 1
        return item

cq = CircularQueue(capacity=3)
cq.enqueue("Packet A")
cq.enqueue("Packet B")
cq.enqueue("Packet C")
print("Dequeued:", cq.dequeue())  # Removes Packet A
cq.enqueue("Packet D")  # Wraps around to index 0!
print("Current buffer slots:", cq.queue)`,
    expectedOutput: `Dequeued: Packet A
Current buffer slots: ['Packet D', 'Packet B', 'Packet C']`,
    stepByStep: [
      'Enqueue places item at self.tail and advances tail = (tail + 1) % capacity.',
      'Dequeue takes item from self.head and advances head = (head + 1) % capacity.',
      'Modulo wrapping reuses slots at the front of the array as elements are consumed.',
      'All operations run in strict O(1) time with fixed memory usage.'
    ],
    commonMistakes: [
      {
        mistake: 'Using queue = [] and queue.pop(0) in performance code',
        correction: 'Use from collections import deque; q.popleft()',
        explanation: 'list.pop(0) shifts all elements in memory, causing O(n) overhead per item and degrading performance on large queues.'
      },
      {
        mistake: 'Overwriting unconsumed data in a circular buffer without size tracking',
        correction: 'Track size or use (tail + 1) % capacity == head check',
        explanation: 'Without checking full status, tail can lap head and overwrite unread data packets.'
      }
    ],
    realWorldExample: {
      scenario: 'Web Server Request Queue & Rate Limiter',
      code: `from collections import deque

class RequestDispatcher:
    def __init__(self):
        self.queue = deque()

    def receive_request(self, client_ip, endpoint):
        self.queue.append({"ip": client_ip, "path": endpoint})

    def process_next(self):
        if self.queue:
            req = self.queue.popleft()
            return f"Processed {req['path']} for {req['ip']}"
        return "Idle"

dispatcher = RequestDispatcher()
dispatcher.receive_request("192.168.1.10", "/api/data")
dispatcher.receive_request("10.0.0.5", "/auth/login")
print(dispatcher.process_next())`,
      explanation: 'Production message brokers (RabbitMQ, Kafka, Redis Streams) route asynchronous requests using FIFO queue buffers.'
    },
    practice: {
      prompt: 'Using collections.deque, write a function hot_potato(names, num) that simulates the children\'s game. Enqueue all names. In each round, dequeue and re-enqueue num times, then dequeue the eliminated person. Repeat until 1 survivor remains. Return the survivor.',
      starterCode: `from collections import deque

def hot_potato(names, num):
    # Implement game using deque
    pass

players = ["Bill", "David", "Susan", "Jane", "Kent", "Brad"]
print(hot_potato(players, 7))
`,
      expectedOutputMatcher: `Susan`,
      hint: 'q = deque(names); while len(q) > 1: for _ in range(num): q.append(q.popleft()); q.popleft(); return q[0]',
      solution: `from collections import deque

def hot_potato(names, num):
    q = deque(names)
    while len(q) > 1:
        for _ in range(num):
            q.append(q.popleft())
        q.popleft()  # Eliminate
    return q[0]

players = ["Bill", "David", "Susan", "Jane", "Kent", "Brad"]
print(hot_potato(players, 7))`
    },
    quiz: [
      {
        id: 'q-py-que-1',
        question: 'Why is collections.deque significantly faster than list for queue implementations in Python?',
        options: [
          'deque is written in pure Python while list is written in C',
          'deque provides O(1) pops from both ends, while list.pop(0) takes O(n) due to shifting',
          'deque stores data in GPU memory',
          'deque automatically sorts all incoming items'
        ],
        correctIndex: 1,
        explanation: 'deque is implemented as a doubly linked list of blocks, allowing O(1) front popleft() and rear append().',
        difficulty: 'easy'
      },
      {
        id: 'q-py-que-2',
        question: 'In a circular queue with capacity 5, if tail is at index 4, what is the next tail index after enqueue?',
        options: ['5', '0', '1', 'None'],
        correctIndex: 1,
        explanation: '(4 + 1) % 5 = 5 % 5 = 0, wrapping back around to index 0.',
        difficulty: 'easy'
      }
    ,
      {
        id: "q-py-que-3",
        question: "Why is collections.deque significantly preferred over list for implementing FIFO Queues in Python?",
        codeSnippet: null,
        options: [
          "deque provides O(1) popleft() and append(), whereas list.pop(0) is O(N) due to memory shifting",
          "deque requires zero memory",
          "list cannot store more than 100 items",
          "deque is synchronous while list is async"
        ],
        correctIndex: 0,
        explanation: "collections.deque is implemented as a doubly linked list of fixed-size memory blocks, granting O(1) pops and appends at both ends. list.pop(0) incurs an O(N) memory shift.",
        difficulty: "medium"
      },
      {
        id: "q-py-que-4",
        question: "In a fixed-size Circular Queue (Ring Buffer) of capacity C, how do you advance the rear pointer after inserting an element?",
        codeSnippet: null,
        options: [
          "rear = (rear + 1) % C",
          "rear = rear + 1",
          "rear = rear * 2",
          "rear = C - rear"
        ],
        correctIndex: 0,
        explanation: `The modulo operator \`% C\` wraps the pointer back to index 0 when it exceeds the buffer capacity, enabling circular reuse of slots.`,
        difficulty: "easy"
      },
      {
        id: "q-py-que-5",
        question: "What is the output of the following deque operations?",
        codeSnippet: `from collections import deque
q = deque([1, 2, 3])
q.append(4)
q.popleft()
q.appendleft(5)
print(list(q))`,
        options: [
          "[5, 2, 3, 4]",
          "[1, 2, 3, 4, 5]",
          "[5, 1, 2, 3]",
          "[2, 3, 4, 5]"
        ],
        correctIndex: 0,
        explanation: "[1,2,3] -> append(4) -> [1,2,3,4] -> popleft() removes 1 -> [2,3,4] -> appendleft(5) -> [5,2,3,4].",
        difficulty: "medium"
      }
    ],
    challenge: {
      title: "Circular Buffer Task Scheduler",
      problemStatement: `Implement a \`CircularQueue\` with capacity K. Support \`enqueue(item)\` (return False if full, else True) and \`dequeue()\` (return None if empty, else item). In \`solve()\`, initialize capacity K, execute operations from stdin, and print remaining elements in FIFO order.`,
      inputFormat: "First line: capacity K. Second line: operations, e.g. 'ENQ:A ENQ:B DEQ ENQ:C'.",
      outputFormat: "Space-separated elements remaining in the queue.",
      constraints: "1 <= K <= 20",
      starterCode: `import sys

class CircularQueue:
    def __init__(self, k: int):
        self.cap = k
        self.q = [None] * k
        self.head = 0
        self.tail = 0
        self.size = 0

    def enqueue(self, val) -> bool:
        if self.size == self.cap:
            return False
        self.q[self.tail] = val
        self.tail = (self.tail + 1) % self.cap
        self.size += 1
        return True

    def dequeue(self):
        if self.size == 0:
            return None
        val = self.q[self.head]
        self.q[self.head] = None
        self.head = (self.head + 1) % self.cap
        self.size -= 1
        return val

def solve():
    lines = [l.strip() for l in sys.stdin.read().strip().split('\n') if l.strip()]
    if len(lines) < 2:
        return
    k = int(lines[0])
    cq = CircularQueue(k)
    ops = lines[1].split()
    for op in ops:
        if op.startswith('ENQ:'):
            val = op.split(':')[1]
            cq.enqueue(val)
        elif op == 'DEQ':
            cq.dequeue()
    out = []
    while cq.size > 0:
        out.append(cq.dequeue())
    print(' '.join(out))

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: `3
ENQ:Task1 ENQ:Task2 ENQ:Task3 DEQ ENQ:Task4`,
          expected_output: "Task2 Task3 Task4"
        }
      ]
    },
    summary: [
      'Queues follow First-In First-Out (FIFO) semantics.',
      'Always use collections.deque for O(1) enqueue and dequeue operations in Python.',
      'Circular queues wrap pointers using modulo arithmetic to prevent memory shifting.'
    ]
  },

  {
    id: 'top-py-int-hash-tables',
    number: 15,
    numberDisplay: '15',
    moduleId: 'mod-ds',
    moduleTitle: 'Module 03: Data Structures',
    title: 'Hash Tables & Python Dictionaries',
    slug: 'hash-tables-dictionaries-collisions',
    shortDescription: 'Explore the mechanics of hash functions, collision resolution (chaining vs open addressing), and amortized O(1) lookup.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisiteId: 'top-py-int-queues',
    learningObjectives: [
      'Explain how a hash function converts arbitrary keys into integer indices',
      'Understand the hash table collision problem and contrast chaining vs open addressing',
      'Inspect Python dictionary internal compact layout and perturbation probing',
      'Analyze why dictionary and set lookups achieve O(1) average time complexity'
    ],
    conceptExplanation: `A **Hash Table** (hash map) is an associative data structure that maps **Keys** to **Values**. It provides average-case **$O(1)$ constant time** for lookup, insertion, and deletion.

### 1. How a Hash Table Works
1. **Hash Function:** Converts a key into a large integer hash value: \`hash(key)\`.
2. **Modulo Compression:** Maps the hash code into a valid index within an internal bucket array:
   \`index = hash_code % table_capacity\`
3. **Storage:** The key-value pair is stored at that calculated bucket index.

### 2. The Collision Problem
Because there are infinite possible keys but finite table buckets, two distinct keys can hash to the same bucket index ($k_1 \\neq k_2$ but $hash(k_1) \\equiv hash(k_2)$).
* **Separate Chaining:** Each bucket stores a linked list of entries that collided at that slot.
* **Open Addressing:** If a collision occurs, the algorithm searches ("probes") for the next available empty bucket.

### 3. Python Dict Architecture (CPython)
Since Python 3.6, dictionaries are **compact and ordered**:
* A sparse **indices table** stores bucket references.
* A dense **entries array** stores \`[hash, key, value]\` in insertion order.
* Collisions are resolved using an optimized pseudo-random open addressing sequence called **perturbation probing**.`,
    simpleExample: {
      code: `key = "username"
h = hash(key)
capacity = 8
bucket_idx = h % capacity
print(f"Key: {key} -> Hash: {h} -> Slot Index: {bucket_idx}")`,
      explanation: 'hash() converts the string into an integer, and modulo compresses it to fit into the bucket array.'
    },
    syntax: `# Under the hood hash mapping:
slot = hash(key) % capacity
# In Python syntax:
d = {"key": "val"}  # O(1) lookup
d["key"]            # O(1) read`,
    codeExample: `class SimpleHashMap:
    """Demonstration of a Hash Table using Separate Chaining."""
    def __init__(self, capacity=8):
        self.capacity = capacity
        self.buckets = [[] for _ in range(capacity)]

    def _hash(self, key):
        return hash(key) % self.capacity

    def put(self, key, value):
        index = self._hash(key)
        bucket = self.buckets[index]
        # Check if key exists; update if found
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                return
        bucket.append((key, value))  # Collision appended to bucket list

    def get(self, key):
        index = self._hash(key)
        bucket = self.buckets[index]
        for k, v in bucket:
            if k == key:
                return v
        raise KeyError(f"Key '{key}' not found")

hm = SimpleHashMap(capacity=4)
hm.put("apple", 100)
hm.put("banana", 200)
hm.put("orange", 300)
print("Apple count:", hm.get("apple"))
print("Internal Buckets:", hm.buckets)`,
    expectedOutput: `Apple count: 100
Internal Buckets: [[('orange', 300)], [], [('apple', 100)], [('banana', 200)]]`,
    stepByStep: [
      'Key "apple" is hashed and modulo compressed to an index (e.g. 2).',
      'The key-value pair is placed in bucket list at index 2.',
      'Looking up "apple" recalculates index 2 in O(1) time and scans the short bucket list.',
      'If keys collide, they share the same bucket list (separate chaining).'
    ],
    commonMistakes: [
      {
        mistake: 'Using a mutable object (like a list or dict) as a dictionary key',
        correction: 'Use immutable keys (strings, numbers, tuples of immutables)',
        explanation: 'TypeError: unhashable type: \'list\'. Keys must implement __hash__ and be immutable so their hash never changes.'
      },
      {
        mistake: 'Assuming hash tables never degrade in speed',
        correction: 'Ensure hash tables do not exceed ~70% load factor (size/capacity)',
        explanation: 'If a hash table becomes full or has a poor hash function, collisions escalate and lookups degrade from O(1) to O(n).'
      }
    ],
    realWorldExample: {
      scenario: 'High-Speed In-Memory Cache (Redis-Style)',
      code: `cache = {}

def get_user_profile(user_id):
    # O(1) cache lookup
    if user_id in cache:
        return f"[CACHE HIT] {cache[user_id]}"
    
    # Simulate DB fetch
    data = {"id": user_id, "name": f"User_{user_id}"}
    cache[user_id] = data
    return f"[DB FETCH] {data}"

print(get_user_profile(101))
print(get_user_profile(101))`,
      explanation: 'In-memory caches and session stores leverage hash tables for sub-millisecond O(1) record retrieval.'
    },
    practice: {
      prompt: 'Write a function first_non_repeating_char(s) that uses a dictionary to find the first character in string s that occurs only once. Return the character, or None if none exist.',
      starterCode: `def first_non_repeating_char(s):
    # Count frequencies with a dict, then find first with count == 1
    pass

print(first_non_repeating_char("swiss"))
print(first_non_repeating_char("aabbcc"))
`,
      expectedOutputMatcher: `w\nNone`,
      hint: 'counts = {}; for c in s: counts[c] = counts.get(c, 0) + 1; then loop s again checking counts[c] == 1',
      solution: `def first_non_repeating_char(s):
    counts = {}
    for c in s:
        counts[c] = counts.get(c, 0) + 1
    for c in s:
        if counts[c] == 1:
            return c
    return None

print(first_non_repeating_char("swiss"))
print(first_non_repeating_char("aabbcc"))`
    },
    quiz: [
      {
        id: 'q-py-ht-1',
        question: 'What is the average time complexity of searching for a key in a Python dictionary?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctIndex: 0,
        explanation: 'Hash tables calculate slot addresses directly in O(1) average constant time.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-ht-2',
        question: 'Why must dictionary keys in Python be immutable?',
        options: [
          'Because the operating system requires it',
          'If a key mutated after insertion, its hash value would change and it could never be found again',
          'To save RAM',
          'Only integers are valid keys in CPython'
        ],
        correctIndex: 1,
        explanation: 'Mutating a key after insertion alters its hash code, leaving the entry unreachable at its original bucket slot.',
        difficulty: 'medium'
      }
    ,
      {
        id: "q-py-ht-3",
        question: "What is the 'Load Factor' of a hash table and what role does it play in maintaining O(1) performance?",
        codeSnippet: null,
        options: [
          "The ratio of stored elements to total bucket capacity (N / Capacity); when it exceeds a threshold (~0.66 in Python), the table resizes to prevent collision clustering",
          "The number of CPU cycles consumed per hash lookup",
          "The memory in megabytes divided by the number of keys",
          "The hash seed entropy"
        ],
        correctIndex: 0,
        explanation: "Load Factor = elements / capacity. Keeping it below 2/3 ensures collisions remain rare and average lookup time remains strictly O(1).",
        difficulty: "medium"
      },
      {
        id: "q-py-ht-4",
        question: "Why cannot mutable types like Python lists be used as dictionary keys or set elements?",
        codeSnippet: null,
        options: [
          "Lists are unhashable because their contents (and thus their hash) can change after insertion, violating bucket invariants",
          "Lists take too much RAM",
          "Python dictionaries only support strings",
          "List pointers cannot be converted to integers"
        ],
        correctIndex: 0,
        explanation: "Hash table keys must be immutable and implement __hash__(). If a key mutated, its hash bucket would change, rendering it permanently unlocatable.",
        difficulty: "easy"
      },
      {
        id: "q-py-ht-5",
        question: "What collision resolution strategy does CPython's built-in dict implementation use?",
        codeSnippet: null,
        options: [
          "Open addressing with pseudo-random perturbation probing (compact dict table)",
          "Separate chaining with linked lists",
          "Red-black binary trees",
          "Skip lists"
        ],
        correctIndex: 0,
        explanation: "Python's compact dict implementation uses open addressing with a perturbation probing recurrence formula to resolve hash collisions in a contiguous indices array.",
        difficulty: "hard"
      }
    ],
    challenge: {
      title: "Top-K Frequent Words Counter",
      problemStatement: "Given a sentence of space-separated words, count the frequency of each word using a hash map (dictionary). Output the unique words sorted by frequency descending; if frequencies match, sort alphabetically ascending. Output format: 'word: count' per line.",
      inputFormat: "A single line with space-separated words.",
      outputFormat: "Lines of '{word}: {count}'.",
      constraints: "Words contain lowercase alphabetic characters.",
      starterCode: `import sys

def solve():
    raw = sys.stdin.read().strip()
    if not raw:
        return
    words = raw.lower().split()
    counts = {}
    for w in words:
        counts[w] = counts.get(w, 0) + 1
    # Sort: descending by count (-item[1]), ascending by word (item[0])
    sorted_words = sorted(counts.items(), key=lambda x: (-x[1], x[0]))
    for w, c in sorted_words:
        print(f"{w}: {c}")

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: "apple banana apple orange banana apple",
          expected_output: `apple: 3
banana: 2
orange: 1`
        }
      ]
    },
    summary: [
      'Hash tables map keys to values using hash functions and modulo compression.',
      'Collisions are resolved via separate chaining or open addressing probing.',
      'Dictionary operations execute in average O(1) constant time.'
    ]
  },

  {
    id: 'top-py-int-trees-bst',
    number: 16,
    numberDisplay: '16',
    moduleId: 'mod-ds',
    moduleTitle: 'Module 03: Data Structures',
    title: 'Trees & Binary Search Trees (BST)',
    slug: 'trees-binary-search-trees-traversal',
    shortDescription: 'Master hierarchical tree structures, the Binary Search Tree (BST) invariant, node insertion, search, and depth-first traversals.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisiteId: 'top-py-int-hash-tables',
    learningObjectives: [
      'Understand non-linear hierarchical data structures: root, parent, child, and leaf nodes',
      'Explain the Binary Search Tree (BST) invariant: left < root < right',
      'Implement BST node insertion and logarithmic search ($O(\\log n)$ average)',
      'Perform In-Order, Pre-Order, and Post-Order depth-first tree traversals'
    ],
    conceptExplanation: `A **Tree** is a non-linear, hierarchical data structure composed of nodes connected by edges.

### 1. Tree Terminology
* **Root:** The topmost node with no parent.
* **Edge:** The link between parent and child.
* **Leaf Node:** A node with zero children.
* **Height:** The length of the longest path from root to a leaf.

### 2. Binary Search Tree (BST) Invariant
A **Binary Tree** restricts every node to at most two children (\`left\` and \`right\`).
A **Binary Search Tree (BST)** enforces the fundamental ordering property:
* All values in the **left subtree** are strictly **less than** the node's value.
* All values in the **right subtree** are strictly **greater than** the node's value.

\`\`\`
       (20)
      /    \\
    (10)   (30)
    /  \\     \\
  (5)  (15)  (40)
\`\`\`

### 3. Tree Traversals (Depth-First)
* **In-Order (Left, Root, Right):** Traverses values in **strictly sorted ascending order**!
* **Pre-Order (Root, Left, Right):** Useful for cloning and serializing trees.
* **Post-Order (Left, Right, Root):** Useful for deleting nodes bottom-up (dependency evaluation).

### 4. Search Complexity
* **Balanced BST:** $O(\\log n)$ time for search, insertion, and deletion.
* **Degenerate (Skewed) BST:** If items are inserted sorted ($1 \\to 2 \\to 3 \\to 4$), the tree degrades into a linked list with $O(n)$ time!`,
    simpleExample: {
      code: `class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

root = TreeNode(20)
root.left = TreeNode(10)
root.right = TreeNode(30)
print(f"Root: {root.val}, Left: {root.left.val}, Right: {root.right.val}")`,
      explanation: 'Binary tree nodes hold a value and pointer references to left and right child nodes.'
    },
    syntax: `class BSTNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

# In-order traversal:
def inorder(node):
    if node:
        inorder(node.left)
        print(node.val)
        inorder(node.right)`,
    codeExample: `class BSTNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

class BinarySearchTree:
    def __init__(self):
        self.root = None

    def insert(self, val):
        if not self.root:
            self.root = BSTNode(val)
        else:
            self._insert_recursive(self.root, val)

    def _insert_recursive(self, curr, val):
        if val < curr.val:
            if curr.left is None:
                curr.left = BSTNode(val)
            else:
                self._insert_recursive(curr.left, val)
        elif val > curr.val:
            if curr.right is None:
                curr.right = BSTNode(val)
            else:
                self._insert_recursive(curr.right, val)

    def search(self, target) -> bool:
        return self._search_recursive(self.root, target)

    def _search_recursive(self, curr, target) -> bool:
        if curr is None:
            return False
        if curr.val == target:
            return True
        if target < curr.val:
            return self._search_recursive(curr.left, target)
        return self._search_recursive(curr.right, target)

    def inorder(self):
        result = []
        def traverse(node):
            if node:
                traverse(node.left)
                result.append(node.val)
                traverse(node.right)
        traverse(self.root)
        return result

bst = BinarySearchTree()
for num in [50, 30, 70, 20, 40, 60, 80]:
    bst.insert(num)

print("In-Order (Sorted):", bst.inorder())
print("Search 40:", bst.search(40))
print("Search 99:", bst.search(99))`,
    expectedOutput: `In-Order (Sorted): [20, 30, 40, 50, 60, 70, 80]
Search 40: True
Search 99: False`,
    stepByStep: [
      'Inserting checks val against current node: moves left if smaller, right if larger.',
      'Attaches a new BSTNode when reaching an empty child spot.',
      'Search halves the remaining search tree at every step, taking O(log n) time.',
      'In-order traversal visits left subtree, processes root, then visits right subtree, yielding sorted order.'
    ],
    commonMistakes: [
      {
        mistake: 'Inserting already-sorted data into a plain BST',
        correction: 'Use self-balancing trees (AVL or Red-Black trees) or shuffle input data first',
        explanation: 'Inserting [1, 2, 3, 4, 5] creates a straight single-line tree with height n, degrading search from O(log n) to O(n).'
      },
      {
        mistake: 'Confusing Pre-Order vs In-Order traversal',
        correction: 'Remember: In-Order visits Root IN-between Left and Right (Left -> Root -> Right)',
        explanation: 'Only In-Order traversal guarantees sorted output on a Binary Search Tree.'
      }
    ],
    realWorldExample: {
      scenario: 'Database B-Tree Indexing Engine',
      code: `# SQL databases like SQLite and PostgreSQL store row indices in B-Trees / BSTs
# to execute SELECT queries in O(log n) instead of full table scans (O(n)).
# Binary Search Tree enables instant range queries: WHERE price BETWEEN 20 AND 50`,
      explanation: 'Relational databases and file systems organize directory inodes and table primary keys in balanced tree hierarchies.'
    },
    practice: {
      prompt: 'Write a function find_min_bst(root) that takes the root of a Binary Search Tree and returns the minimum value stored in the tree.',
      starterCode: `class BSTNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def find_min_bst(root):
    # Walk left until you can't walk further
    pass

r = BSTNode(50)
r.left = BSTNode(30)
r.left.left = BSTNode(15)
r.right = BSTNode(70)
print(find_min_bst(r))
`,
      expectedOutputMatcher: `15`,
      hint: 'curr = root; while curr.left: curr = curr.left; return curr.val',
      solution: `class BSTNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def find_min_bst(root):
    if not root:
        return None
    curr = root
    while curr.left:
        curr = curr.left
    return curr.val

r = BSTNode(50)
r.left = BSTNode(30)
r.left.left = BSTNode(15)
r.right = BSTNode(70)
print(find_min_bst(r))`
    },
    quiz: [
      {
        id: 'q-py-bst-1',
        question: 'Which tree traversal order produces elements in strictly ascending sorted order on a BST?',
        options: ['Pre-Order', 'In-Order', 'Post-Order', 'Level-Order'],
        correctIndex: 1,
        explanation: 'In-Order traversal visits Left -> Root -> Right, yielding sorted order on a valid BST.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-bst-2',
        question: 'What is the worst-case time complexity of searching a degenerate (unbalanced) BST with n elements?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
        correctIndex: 2,
        explanation: 'A completely skewed BST behaves identically to a linked list, requiring O(n) worst-case search.',
        difficulty: 'medium'
      }
    ,
      {
        id: "q-py-tree-3",
        question: "Which tree traversal order yields elements in strictly ASCENDING sorted order for a valid Binary Search Tree (BST)?",
        codeSnippet: null,
        options: [
          "In-order traversal (Left, Root, Right)",
          "Pre-order traversal (Root, Left, Right)",
          "Post-order traversal (Left, Right, Root)",
          "Breadth-First traversal"
        ],
        correctIndex: 0,
        explanation: "In-order traversal visits all nodes in the left subtree (< root), then the root, then the right subtree (> root), naturally producing monotonic ascending order.",
        difficulty: "easy"
      },
      {
        id: "q-py-tree-4",
        question: "What is the worst-case search complexity in an UNBALANCED Binary Search Tree?",
        codeSnippet: null,
        options: [
          "O(1)",
          "O(log N)",
          "O(N)",
          "O(N log N)"
        ],
        correctIndex: 2,
        explanation: "If elements are inserted in already sorted order (1, 2, 3, 4, 5), the tree degenerates into a linear linked list of depth N, giving O(N) search time.",
        difficulty: "medium"
      },
      {
        id: "q-py-tree-5",
        question: "How do you find the minimum value in a Binary Search Tree?",
        codeSnippet: null,
        options: [
          "Follow the 'left' pointer from root until a node with left is None is reached",
          "Follow the 'right' pointer to the end",
          "Inspect the root node",
          "Perform post-order traversal and take the last element"
        ],
        correctIndex: 0,
        explanation: "By the BST invariant, smaller values always reside in the left child. Continuously navigating left leads to the minimum element in O(Height) time.",
        difficulty: "easy"
      }
    ],
    challenge: {
      title: "BST In-Order Traversal & Validation",
      problemStatement: `Implement a \`BST\` class supporting \`insert(val)\` and \`inorder_traversal() -> list[int]\`. In \`solve()\`, read integers, insert them into the BST, and print the in-order traversal separated by spaces.`,
      inputFormat: "A single line with space-separated integers.",
      outputFormat: "Sorted space-separated integers produced by in-order traversal.",
      constraints: "1 <= N <= 100",
      starterCode: `import sys

class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None

    def insert(self, val):
        if not self.root:
            self.root = TreeNode(val)
            return
        curr = self.root
        while True:
            if val < curr.val:
                if not curr.left:
                    curr.left = TreeNode(val)
                    break
                curr = curr.left
            else:
                if not curr.right:
                    curr.right = TreeNode(val)
                    break
                curr = curr.right

    def inorder(self):
        res = []
        def dfs(node):
            if not node: return
            dfs(node.left)
            res.append(str(node.val))
            dfs(node.right)
        dfs(self.root)
        return res

def solve():
    raw = sys.stdin.read().strip()
    if not raw:
        return
    nums = [int(x) for x in raw.split()]
    bst = BST()
    for n in nums:
        bst.insert(n)
    print(' '.join(bst.inorder()))

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: "40 20 60 10 30 50 70",
          expected_output: "10 20 30 40 50 60 70"
        }
      ]
    },
    summary: [
      'Trees organize hierarchical relationships without cycles.',
      'BST invariant: left subtree < node < right subtree.',
      'Balanced BSTs provide O(log n) search, insertion, and deletion.'
    ]
  },

  {
    id: 'top-py-int-heaps-priority-queues',
    number: 17,
    numberDisplay: '17',
    moduleId: 'mod-ds',
    moduleTitle: 'Module 03: Data Structures',
    title: 'Heaps & Priority Queues (heapq module)',
    slug: 'heaps-priority-queues-heapq',
    shortDescription: 'Master the min-heap property, array-based binary heap indexing, O(log n) pushes/pops, and the heapq module.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisiteId: 'top-py-int-trees-bst',
    learningObjectives: [
      'Understand the Heap Invariant: parent <= children (Min-Heap)',
      'Explain how complete binary trees are mapped into compact flat arrays without pointer overhead',
      'Use the standard library heapq module: heappush, heappop, heapify',
      'Construct a Priority Queue for real-time task scheduling and finding top-K items'
    ],
    conceptExplanation: `A **Heap** is a specialized tree-based data structure that satisfies the **Heap Property**:
* **Min-Heap:** The value of each parent node is $\\le$ the values of its children. The absolute minimum element is always at the root!
* **Max-Heap:** The value of each parent node is $\\ge$ the values of its children. The absolute maximum is at the root.

### 1. Array Representation of Heaps
Heaps are **complete binary trees** (all levels filled except possibly the last, which fills left to right). This unique geometry allows a heap to be stored in a **flat Python list** without any node objects or pointers:
For any element at index \`i\`:
* **Parent Index:** \`(i - 1) // 2\`
* **Left Child Index:** \`2 * i + 1\`
* **Right Child Index:** \`2 * i + 2\`

### 2. Time Complexities
* **Find Min / Peek:** $O(1)$
* **Insert (\`heappush\`):** $O(\\log n)$ via up-heap bubbling
* **Extract Min (\`heappop\`):** $O(\\log n)$ via down-heap bubbling
* **Build Heap (\`heapify\`):** $O(n)$ linear time!

### 3. Python's \`heapq\` Module
Python's standard library provides the \`heapq\` module, implementing a **Min-Heap** on top of standard Python lists.`,
    simpleExample: {
      code: `import heapq

scores = [50, 20, 80, 10, 40]
heapq.heapify(scores)  # Turns list into min-heap in O(n)
print("Smallest element is root:", scores[0])
print("Popped smallest:", heapq.heappop(scores))
print("Next smallest:", heapq.heappop(scores))`,
      explanation: 'heapq maintains the min-heap invariant, popping elements in ascending priority order.'
    },
    syntax: `import heapq
heap = []
heapq.heappush(heap, item)       # O(log n)
smallest = heapq.heappop(heap)    # O(log n)
heapq.heapify(existing_list)     # O(n)`,
    codeExample: `import heapq

# Priority Queue Implementation
class PriorityQueue:
    def __init__(self):
        self._queue = []
        self._index = 0

    def push(self, item, priority: int):
        # Min-heap: Lower priority number = Higher urgency (e.g. Priority 1 before Priority 5)
        # We store (priority, index, item) to ensure stable FIFO ordering on equal priorities
        heapq.heappush(self._queue, (priority, self._index, item))
        self._index += 1

    def pop(self):
        if not self._queue:
            raise IndexError("pop from empty priority queue")
        priority, _, item = heapq.heappop(self._queue)
        return item, priority

    def is_empty(self):
        return len(self._queue) == 0

# Test priority scheduling
pq = PriorityQueue()
pq.push("Clean temp files", priority=3)
pq.push("Resolve critical security patch", priority=1)
pq.push("Send daily analytics digest", priority=2)

print("Dispatching tasks by urgency:")
while not pq.is_empty():
    task, urgency = pq.pop()
    print(f"[Urgency {urgency}] Executing: {task}")`,
    expectedOutput: `Dispatching tasks by urgency:
[Urgency 1] Executing: Resolve critical security patch
[Urgency 2] Executing: Send daily analytics digest
[Urgency 3] Executing: Clean temp files`,
    stepByStep: [
      'heappush places the new element at the end of the list and bubbles it up.',
      'heappop swaps root with the last element, pops the min, and bubbles down the new root.',
      'Priority numbers govern extraction order, ensuring high-urgency tasks run first.',
      'All operations maintain O(log n) heap tree height.'
    ],
    commonMistakes: [
      {
        mistake: 'Assuming a heap list is fully sorted',
        correction: 'A heap only guarantees the ROOT is the minimum; children are not sorted relative to siblings',
        explanation: 'Printing a heap list directly will not show elements in strictly sorted order. Elements are sorted only upon extraction via heappop().'
      },
      {
        mistake: 'Passing a negative number to simulate max-heap without inverting during pop',
        correction: 'Multiply values by -1 to use heapq as a Max-Heap, then negate again when popping',
        explanation: 'Python heapq only implements min-heap natively. For max-heap, store (-priority, item).'
      }
    ],
    realWorldExample: {
      scenario: 'Finding Top-K Trending Products',
      code: `import heapq

def find_top_k_largest(nums, k):
    return heapq.nlargest(k, nums)

stream = [45, 12, 89, 32, 99, 102, 18, 77]
print("Top 3 values:", find_top_k_largest(stream, 3))`,
      explanation: 'heapq.nlargest and nsmallest find top records in O(n log k) time without fully sorting massive datasets (O(n log n)).'
    },
    practice: {
      prompt: 'Use heapq to find the 3 smallest numbers from numbers = [64, 25, 12, 22, 11, 90, 8]. Return the list.',
      starterCode: `import heapq

numbers = [64, 25, 12, 22, 11, 90, 8]
# Return 3 smallest numbers using heapq
three_smallest = ...

print(three_smallest)
`,
      expectedOutputMatcher: `[8, 11, 12]`,
      hint: 'heapq.nsmallest(3, numbers)',
      solution: `import heapq

numbers = [64, 25, 12, 22, 11, 90, 8]
three_smallest = heapq.nsmallest(3, numbers)
print(three_smallest)`
    },
    quiz: [
      {
        id: 'q-py-heap-1',
        question: 'What is the time complexity of extracting the minimum element from a binary heap using heapq.heappop?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctIndex: 1,
        explanation: 'heappop removes the root and bubbles down the replacement node along the tree height, taking O(log n) time.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-heap-2',
        question: 'In an array-based binary heap, where is the left child of the node at index i located?',
        options: ['i + 1', '2 * i', '2 * i + 1', 'i // 2'],
        correctIndex: 2,
        explanation: 'In 0-indexed complete binary trees, the left child of index i is at 2*i + 1, and the right child is at 2*i + 2.',
        difficulty: 'medium'
      }
    ,
      {
        id: "q-py-heap-3",
        question: "In an array-based binary min-heap stored at 0-indexed positions, what are the left and right child formulas for parent at index i?",
        codeSnippet: null,
        options: [
          "Left: 2*i + 1, Right: 2*i + 2",
          "Left: 2*i, Right: 2*i + 1",
          "Left: i/2, Right: i/2 + 1",
          "Left: i + 1, Right: i + 2"
        ],
        correctIndex: 0,
        explanation: "For 0-based array index i: Left child is at 2i + 1, right child is at 2i + 2, and parent is at (i - 1) // 2.",
        difficulty: "medium"
      },
      {
        id: "q-py-heap-4",
        question: "Does Python's heapq module implement a Min-Heap or a Max-Heap by default?",
        codeSnippet: null,
        options: [
          "Min-Heap by default (heapq.heappop always extracts the smallest element)",
          "Max-Heap by default",
          "Bi-directional heap",
          "Fibonacci heap"
        ],
        correctIndex: 0,
        explanation: "heapq maintains the min-heap invariant where h[0] is always the minimum element. To simulate a max-heap, values are commonly multiplied by -1.",
        difficulty: "easy"
      },
      {
        id: "q-py-heap-5",
        question: "What is the time complexity of converting an unsorted list of N numbers into a valid heap using heapq.heapify(lst)?",
        codeSnippet: null,
        options: [
          "O(N)",
          "O(N log N)",
          "O(N^2)",
          "O(1)"
        ],
        correctIndex: 0,
        explanation: "Using bottom-up sift-down operations, heapify runs in linear O(N) time, which is strictly faster than doing N individual heappush operations (O(N log N)).",
        difficulty: "hard"
      }
    ],
    challenge: {
      title: "Kth Largest Element Stream using Min-Heap",
      problemStatement: `Find the Kth largest element in an unsorted list of integers using a min-heap of size K. In \`solve()\`, read integer K on line 1, and space-separated numbers on line 2. Maintain a heap of size K such that the root represents the Kth largest element, and print it.`,
      inputFormat: "Line 1: integer K. Line 2: space-separated integers.",
      outputFormat: "A single integer representing the Kth largest value.",
      constraints: "1 <= K <= len(nums)",
      starterCode: `import sys
import heapq

def solve():
    lines = [l.strip() for l in sys.stdin.read().strip().split('\n') if l.strip()]
    if len(lines) < 2:
        return
    k = int(lines[0])
    nums = [int(x) for x in lines[1].split()]
    # Min-heap of size k
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    print(heap[0])

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: `3
3 2 1 5 6 4`,
          expected_output: "4"
        },
        {
          input: `2
10 20 5 80 40`,
          expected_output: "40"
        }
      ]
    },
    summary: [
      'Heaps maintain the min-heap or max-heap property with O(1) peek access.',
      'Compactly stored in flat arrays using index arithmetic (2*i + 1).',
      'Priority queues schedule tasks and find top-k items in O(log n) time.'
    ]
  },

  {
    id: 'top-py-int-graphs',
    number: 18,
    numberDisplay: '18',
    moduleId: 'mod-ds',
    moduleTitle: 'Module 03: Data Structures',
    title: 'Graph Fundamentals & Representations',
    slug: 'graph-fundamentals-adjacency-list-matrix',
    shortDescription: 'Master graph terminology (vertices, edges, directed/weighted), Adjacency Lists, and BFS/DFS traversal concepts.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisiteId: 'top-py-int-heaps-priority-queues',
    learningObjectives: [
      'Understand graph components: vertices (nodes) and edges (directed, undirected, weighted)',
      'Represent graphs in Python using Adjacency Lists (dictionaries of lists/sets)',
      'Compare Adjacency Lists ($O(V + E)$ space) with Adjacency Matrices ($O(V^2)$ space)',
      'Implement Breadth-First Search (BFS) and Depth-First Search (DFS) traversals'
    ],
    conceptExplanation: `A **Graph** is a versatile non-linear data structure consisting of a finite set of **Vertices (Nodes)** connected by **Edges (Links)**.
Unlike trees, graphs have no designated root and can contain **cycles** (paths starting and ending at the same vertex).

### 1. Types of Graphs
* **Undirected Graph:** Edges are bidirectional ($A \\leftrightarrow B$).
* **Directed Graph (Digraph):** Edges have a specific direction ($A \\to B$).
* **Weighted Graph:** Edges carry numerical values (distance, latency, cost).
* **Cyclic vs Acyclic:** Acyclic graphs have no loops (e.g. DAG - Directed Acyclic Graph).

### 2. Graph Representations in Python
1. **Adjacency List (Most Popular):** A dictionary mapping each vertex to a list or set of its neighbors:
   \`\`\`python
   graph = {
       "A": ["B", "C"],
       "B": ["A", "D"],
       "C": ["A", "D"],
       "D": ["B", "C"]
   }
   \`\`\`
   * **Space:** $O(V + E)$ (Optimal for sparse graphs).
   * **Lookup:** $O(\\text{degree}(u))$ to check if edge $(u, v)$ exists.

2. **Adjacency Matrix:** A 2D array where \`matrix[u][v] = 1\` indicates an edge. Takes $O(V^2)$ memory, suitable only for dense graphs.

### 3. Fundamental Graph Traversals
* **Breadth-First Search (BFS):** Explores neighbors level-by-level using a **Queue**. Guaranteed to find the shortest path in unweighted graphs!
* **Depth-First Search (DFS):** Explores deeply along branches using a **Stack** or recursion.`,
    simpleExample: {
      code: `social_network = {
    "Alice": ["Bob", "Charlie"],
    "Bob": ["Alice", "Diana"],
    "Charlie": ["Alice"],
    "Diana": ["Bob"]
}
print("Alice's friends:", social_network["Alice"])`,
      explanation: 'Adjacency lists in Python are cleanly expressed as dictionaries of neighbor lists.'
    },
    syntax: `# Adjacency List:
graph = {node: [neighbors]}

# BFS uses collections.deque:
from collections import deque
queue = deque([start_node])`,
    codeExample: `from collections import deque

class Graph:
    def __init__(self):
        self.adj_list = {}

    def add_edge(self, u, v, bidirectional=True):
        if u not in self.adj_list: self.adj_list[u] = []
        if v not in self.adj_list: self.adj_list[v] = []
        self.adj_list[u].append(v)
        if bidirectional:
            self.adj_list[v].append(u)

    def bfs(self, start_node):
        """Breadth-First Search: Explores level by level using a Queue."""
        visited = set([start_node])
        queue = deque([start_node])
        traversal_order = []

        while queue:
            node = queue.popleft()
            traversal_order.append(node)

            for neighbor in self.adj_list.get(node, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return traversal_order

g = Graph()
g.add_edge("A", "B")
g.add_edge("A", "C")
g.add_edge("B", "D")
g.add_edge("C", "E")

print("BFS Traversal starting from 'A':", g.bfs("A"))`,
    expectedOutput: `BFS Traversal starting from 'A': ['A', 'B', 'C', 'D', 'E']`,
    stepByStep: [
      'Graph is initialized with an empty adjacency list dictionary.',
      'add_edge updates neighbor lists for both vertices.',
      'BFS enqueues the start node and marks it visited.',
      'Dequeues front node, appends to order, and enqueues unvisited neighbors.',
      'Continues until the queue is empty, visiting all reachable nodes.'
    ],
    commonMistakes: [
      {
        mistake: 'Forgetting to maintain a visited set during traversal',
        correction: 'Always add nodes to a visited set when discovering them',
        explanation: 'Graphs can contain cycles! Without a visited set, BFS or DFS will loop infinitely between connected nodes.'
      },
      {
        mistake: 'Using an Adjacency Matrix for sparse network graphs with 100,000 nodes',
        correction: 'Use Adjacency Lists',
        explanation: 'A 100,000 x 100,000 matrix requires 10 billion integer cells (~40 GB RAM!), whereas an adjacency list only stores existing connections.'
      }
    ],
    realWorldExample: {
      scenario: 'GPS Road Navigation & Social Recommendations',
      code: `# Routing engines model road intersections as vertices and streets as weighted edges.
# Dijkstra's and A* search algorithms run on graph adjacency models
# to calculate the quickest driving route in Google Maps.`,
      explanation: 'Social networks (LinkedIn connections), GPS turn-by-turn routing, and dependency build tools (Webpack) rely entirely on graphs.'
    },
    practice: {
      prompt: 'Write a function find_degrees(graph) that takes an adjacency list dictionary and returns a dictionary mapping each node to its degree (count of connected neighbors). Test with {"A": ["B", "C"], "B": ["A"], "C": ["A"]}.',
      starterCode: `def find_degrees(graph):
    # Return dict mapping node -> len(neighbors)
    pass

g = {"A": ["B", "C"], "B": ["A"], "C": ["A"]}
print(find_degrees(g))
`,
      expectedOutputMatcher: `{'A': 2, 'B': 1, 'C': 1}`,
      hint: 'return {node: len(neighbors) for node, neighbors in graph.items()}',
      solution: `def find_degrees(graph):
    return {node: len(neighbors) for node, neighbors in graph.items()}

g = {"A": ["B", "C"], "B": ["A"], "C": ["A"]}
print(find_degrees(g))`
    },
    quiz: [
      {
        id: 'q-py-grp-1',
        question: 'Which traversal algorithm is guaranteed to find the shortest path between two nodes in an unweighted graph?',
        options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'In-Order Traversal', 'Post-Order Traversal'],
        correctIndex: 1,
        explanation: 'Because BFS explores nodes in concentric distance layers, the first time it reaches a target node is guaranteed to be via the fewest edges.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-grp-2',
        question: 'What is the primary memory representation advantage of an Adjacency List over an Adjacency Matrix for sparse graphs?',
        options: [
          'It uses O(V + E) space instead of O(V^2)',
          'It allows constant time matrix multiplication',
          'It prevents cycles',
          'It is compiled to C++ headers'
        ],
        correctIndex: 0,
        explanation: 'In sparse graphs where E << V^2, adjacency lists consume O(V + E) memory, saving vast amounts of RAM.',
        difficulty: 'medium'
      }
    ,
      {
        id: "q-py-grp-3",
        question: "Which data structure is used to implement Breadth-First Search (BFS) and which is used for Depth-First Search (DFS)?",
        codeSnippet: null,
        options: [
          "BFS uses a Queue (FIFO), DFS uses a Stack (LIFO or recursion)",
          "BFS uses a Stack, DFS uses a Queue",
          "Both use Priority Queues",
          "Both use Hash Maps"
        ],
        correctIndex: 0,
        explanation: "BFS explores level-by-level using a FIFO Queue. DFS explores deepest paths first using a LIFO Stack or recursive call stack.",
        difficulty: "easy"
      },
      {
        id: "q-py-grp-4",
        question: "Why is an Adjacency List preferred over an Adjacency Matrix for sparse graphs with V vertices and E edges where E << V^2?",
        codeSnippet: null,
        options: [
          "Adjacency lists use O(V + E) memory instead of wasting O(V^2) memory on empty matrix cells",
          "Adjacency matrices cannot store weights",
          "Adjacency lists are supported by GPUs",
          "Adjacency lists prevent cycles"
        ],
        correctIndex: 0,
        explanation: "For sparse graphs, an adjacency matrix allocates V*V slots (mostly zeros), wasting memory. An adjacency list only stores existing edges in O(V + E) space.",
        difficulty: "medium"
      },
      {
        id: "q-py-grp-5",
        question: "What is the time complexity of Breadth-First Search (BFS) on a graph represented with an adjacency list?",
        codeSnippet: null,
        options: [
          "O(V + E)",
          "O(V * E)",
          "O(V^2)",
          "O(log(V + E))"
        ],
        correctIndex: 0,
        explanation: "Every vertex is visited once (O(V)) and every incident edge is inspected once (O(E)), summing to O(V + E) time.",
        difficulty: "medium"
      }
    ],
    challenge: {
      title: "Shortest Path in Unweighted Graph with BFS",
      problemStatement: "Given an unweighted undirected graph represented as edges, compute the shortest path distance (number of edges) between a Start node and a Target node using BFS. If unreachable, print -1.",
      inputFormat: "Line 1: Start and Target nodes (e.g. 'A F'). Subsequent lines: edges 'U V'.",
      outputFormat: "An integer representing the shortest path distance, or -1.",
      constraints: "Graph has at most 50 nodes.",
      starterCode: `import sys
from collections import deque, defaultdict

def solve():
    lines = [l.strip() for l in sys.stdin.read().strip().split('\n') if l.strip()]
    if not lines:
        return
    start, target = lines[0].split()
    adj = defaultdict(list)
    for edge in lines[1:]:
        u, v = edge.split()
        adj[u].append(v)
        adj[v].append(u)
    # BFS
    queue = deque([(start, 0)])
    visited = {start}
    dist = -1
    while queue:
        node, d = queue.popleft()
        if node == target:
            dist = d
            break
        for neighbor in adj[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, d + 1))
    print(dist)

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: `A E
A B
B C
C E
A D
D E`,
          expected_output: "2"
        }
      ]
    },
    summary: [
      'Graphs model complex networks of vertices and edges with potential cycles.',
      'Adjacency lists are memory-efficient O(V + E) dictionaries of neighbor sequences.',
      'BFS finds shortest unweighted paths; visited sets prevent infinite loops.'
    ]
  },

  {
    id: 'top-py-int-choosing-ds',
    number: 19,
    numberDisplay: '19',
    moduleId: 'mod-ds',
    moduleTitle: 'Module 03: Data Structures',
    title: 'Choosing the Appropriate Data Structure',
    slug: 'choosing-appropriate-data-structure-tradeoffs',
    shortDescription: 'Evaluate memory footprints, access patterns, time complexities, and decision matrices to select optimal data structures.',
    difficulty: 'Intermediate',
    estimatedMinutes: 20,
    prerequisiteId: 'top-py-int-graphs',
    learningObjectives: [
      'Analyze access patterns (read-heavy, write-heavy, FIFO, LIFO, priority-based)',
      'Compare time complexity profiles across lists, deques, sets, dicts, heaps, and trees',
      'Apply decision frameworks to select optimal data structures for production challenges',
      'Evaluate memory overhead vs CPU cache performance trade-offs'
    ],
    conceptExplanation: `In professional software engineering, selecting the wrong data structure can turn a sub-second operation into a system timeout.
Every data structure is an engineered compromise between **Time**, **Space**, and **Access Patterns**.

### 1. Master Decision Matrix

| Requirement / Pattern | Best Data Structure | Python Type | Time Complexity |
|---|---|---|---|
| Random index access by integer | Dynamic Array | \`list\` | $O(1)$ read, $O(1)$ amortized append |
| Fast FIFO queue / Double-ended ops | Double-Ended Queue | \`collections.deque\` | $O(1)$ push/pop both ends |
| Fast membership check & deduplication | Hash Set | \`set\` | $O(1)$ average contains |
| Key-Value lookups & associations | Hash Table | \`dict\` | $O(1)$ average read/write |
| Repeatedly retrieve minimum / maximum | Binary Heap | \`heapq\` | $O(1)$ peek, $O(\\log n)$ push/pop |
| Ordered keys with range queries | Balanced BST | Custom / \`bintrees\` | $O(\\log n)$ search & range scan |
| Complex relationships & networks | Adjacency List | \`dict\` of \`lists\` | $O(V + E)$ traversal |

### 2. The Decision Checklist
1. **Are elements accessed by sequential index, key, or priority?**
   * Index $\\to$ \`list\`
   * Key $\\to$ \`dict\`
   * Priority $\\to$ \`heapq\`
2. **Do elements need to remain unique?**
   * Yes $\\to$ \`set\`
3. **Are you inserting/deleting frequently at the beginning?**
   * Yes $\\to$ \`collections.deque\` (NEVER \`list.insert(0)\`!)
4. **Is memory footprint critical?**
   * Primitive numerical buffers $\\to$ \`array\` or NumPy.`,
    simpleExample: {
      code: `active_ids = {101, 102, 103, 104}  # Set
# Checking membership in a set: O(1)
print(102 in active_ids)  # Instant hash lookup!`,
      explanation: 'Checking membership in a set takes O(1) time, compared to O(n) scan in a list.'
    },
    syntax: `# Choose deliberately:
list   -> Indexed sequences
deque  -> FIFO queues & Sliding windows
set    -> Deduplicated membership
dict   -> Key-Value indexing
heapq  -> Priority management`,
    codeExample: `import time

# Practical Comparison: Membership testing in List vs Set
n = 100_000
test_list = list(range(n))
test_set = set(range(n))
target = 99_999

# Benchmark List (O(n) linear scan)
start = time.perf_counter()
found_list = target in test_list
list_time = time.perf_counter() - start

# Benchmark Set (O(1) hash lookup)
start = time.perf_counter()
found_set = target in test_set
set_time = time.perf_counter() - start

print(f"List 'in' check: {list_time:.6f}s")
print(f"Set 'in' check:  {set_time:.6f}s")
print(f"Set hash lookup is ~{list_time / set_time:.1f}x faster!")`,
    expectedOutput: `List 'in' check: 0.001450s
Set 'in' check:  0.000002s
Set hash lookup is ~725.0x faster!`,
    stepByStep: [
      'target in test_list iterates through all n elements until matching at the end (O(n)).',
      'target in test_set hashes the integer and checks the bucket directly (O(1)).',
      'Understanding operational invariants prevents massive performance cliffs.',
      'Select data structures that match runtime access requirements.'
    ],
    commonMistakes: [
      {
        mistake: 'Using a list to store unique identifiers and checking "if item not in my_list"',
        correction: 'Use a set()',
        explanation: 'Checking "if item not in list" inside a loop creates an accidental O(n^2) quadratic algorithm that stalls on large inputs.'
      },
      {
        mistake: 'Using a dictionary when only a set of keys is needed',
        correction: 'Use set()',
        explanation: 'Sets use less memory than dicts because they do not allocate space for value pointers.'
      }
    ],
    realWorldExample: {
      scenario: 'High-Volume Deduplicated Event Processor',
      code: `class EventProcessor:
    def __init__(self):
        self.seen_event_ids = set()  # O(1) lookup
        self.pending_tasks = []      # Priority heap or deque

    def process(self, event_id, payload):
        if event_id in self.seen_event_ids:
            return "DUPLICATE IGNORED"
        self.seen_event_ids.add(event_id)
        return "EVENT LOGGED"

ep = EventProcessor()
print(ep.process("evt_01", {"action": "login"}))
print(ep.process("evt_01", {"action": "login"}))`,
      explanation: 'FinTech payment gateways use hash sets to guarantee idempotency and prevent duplicate financial transactions.'
    },
    practice: {
      prompt: 'You are given two lists a = [1, 2, 3, 4] and b = [3, 4, 5, 6]. Use sets to find the common elements in O(n) time and return them as a sorted list.',
      starterCode: `def find_common_elements(a, b):
    # Use set intersection
    pass

print(find_common_elements([1, 2, 3, 4], [3, 4, 5, 6]))
`,
      expectedOutputMatcher: `[3, 4]`,
      hint: 'return sorted(list(set(a) & set(b)))',
      solution: `def find_common_elements(a, b):
    return sorted(list(set(a) & set(b)))

print(find_common_elements([1, 2, 3, 4], [3, 4, 5, 6]))`
    },
    quiz: [
      {
        id: 'q-py-dsch-1',
        question: 'Which data structure is the optimal choice for implementing an Undo history feature?',
        options: ['Queue (FIFO)', 'Stack (LIFO)', 'Hash Table', 'Binary Search Tree'],
        correctIndex: 1,
        explanation: 'Undo features require reverting the most recent action first, which matches Stack (LIFO) semantics.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-dsch-2',
        question: 'If an application frequently checks "if item in collection" on 500,000 strings, which collection should be used?',
        options: ['list', 'tuple', 'set', 'linked list'],
        correctIndex: 2,
        explanation: 'Sets evaluate membership via hashing in average O(1) time, compared to O(n) for lists and tuples.',
        difficulty: 'easy'
      }
    ,
      {
        id: "q-py-cds-3",
        question: "You need to frequently check if a username exists among 1,000,000 active users. Which data structure provides O(1) average lookup time?",
        codeSnippet: null,
        options: [
          "Hash Set (set in Python)",
          "Singly Linked List",
          "Binary Heap",
          "Unsorted Dynamic Array"
        ],
        correctIndex: 0,
        explanation: "A hash set computes the hash of the query in O(1) average time, instantly confirming presence without scanning 1,000,000 records.",
        difficulty: "easy"
      },
      {
        id: "q-py-cds-4",
        question: "Which data structure is optimal when you need fast O(1) insertion/deletion at BOTH ends but do NOT need random index access?",
        codeSnippet: null,
        options: [
          "Double-ended Queue (deque)",
          "Static Array",
          "Binary Search Tree",
          "Min-Heap"
        ],
        correctIndex: 0,
        explanation: "collections.deque provides O(1) amortized append and pop at both left and right ends, making it ideal for sliding windows and double-ended queues.",
        difficulty: "easy"
      },
      {
        id: "q-py-cds-5",
        question: "When is an array/list preferred over a linked list despite the linked list having O(1) head insertion?",
        codeSnippet: null,
        options: [
          "When fast random index access (O(1)) and CPU cache locality are prioritized",
          "When pointers are preferred over integers",
          "When data is infinitely large",
          "When sorting is impossible"
        ],
        correctIndex: 0,
        explanation: "Contiguous memory arrays benefit from CPU L1/L2 cache prefetching and O(1) random indexing, easily outperforming linked lists for read-heavy workloads.",
        difficulty: "medium"
      }
    ],
    challenge: {
      title: "Data Structure Architect Decision",
      problemStatement: "Write a decision dispatcher that recommends the optimal Python data structure given a scenario specification from stdin. Scenario 'MEMBERSHIP' -> print 'set (O(1) average lookup)'. Scenario 'FIFO' -> print 'collections.deque (O(1) append & popleft)'. Scenario 'PRIORITY' -> print 'heapq (O(log N) push & pop)'. Scenario 'RANDOM_INDEX' -> print 'list (O(1) indexing)'.",
      inputFormat: "A single keyword representing requirement.",
      outputFormat: "The recommended data structure and complexity rationale.",
      constraints: "Valid scenario string.",
      starterCode: `import sys

def solve():
    req = sys.stdin.read().strip()
    mapping = {
        'MEMBERSHIP': 'set (O(1) average lookup)',
        'FIFO': 'collections.deque (O(1) append & popleft)',
        'PRIORITY': 'heapq (O(log N) push & pop)',
        'RANDOM_INDEX': 'list (O(1) indexing)'
    }
    print(mapping.get(req, 'Unknown requirement'))

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: "MEMBERSHIP",
          expected_output: "set (O(1) average lookup)"
        },
        {
          input: "FIFO",
          expected_output: "collections.deque (O(1) append & popleft)"
        }
      ]
    },
    summary: [
      'Data structure selection dictates application scalability and speed.',
      'Use lists for indexed sequences, deques for queues, sets for uniqueness, dicts for key lookup, and heaps for priority.',
      'Always consider the asymptotic time and space trade-offs.'
    ]
  },

  // ==========================================
  // MODULE 04: ALGORITHMS & PRACTICAL APPLICATIONS
  // ==========================================
  {
    id: 'top-py-int-big-o-complexity',
    number: 20,
    numberDisplay: '20',
    moduleId: 'mod-algo',
    moduleTitle: 'Module 04: Algorithms & Practical Applications',
    title: 'Time & Space Complexity (Big O Notation)',
    slug: 'time-space-complexity-big-o-notation',
    shortDescription: 'Analyze algorithm efficiency, asymptotic upper bounds, space trade-offs, and master Big O notation.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisiteId: 'top-py-int-choosing-ds',
    learningObjectives: [
      'Define Big O notation as an asymptotic upper bound on algorithm growth rate',
      'Differentiate common complexity classes: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)',
      'Calculate time and auxiliary space complexity by inspecting loop bounds and recursion trees',
      'Recognize performance bottlenecks and premature optimization trade-offs'
    ],
    conceptExplanation: `**Big O notation** is a mathematical notation used in computer science to describe the **limiting behavior** (growth rate) of an algorithm as the input size $n$ approaches infinity. It measures how resource consumption (time or memory) scales, independent of machine hardware or clock speed.

### 1. Common Time Complexity Classes (Best to Worst)

| Notation | Name | Intuitive Example | Scalability ($n=1,000$) |
|---|---|---|---|
| **$O(1)$** | Constant | Hash map lookup, array index read | 1 op |
| **$O(\\log n)$** | Logarithmic | Binary search in sorted array | ~10 ops |
| **$O(n)$** | Linear | Single pass through a list | 1,000 ops |
| **$O(n \\log n)$** | Linearithmic | Merge Sort, Quick Sort (average), Timsort | ~10,000 ops |
| **$O(n^2)$** | Quadratic | Nested loops, Bubble Sort | 1,000,000 ops |
| **$O(2^n)$** | Exponential | Naive recursive Fibonacci | $10^{300}$ ops (Stalls!) |

### 2. Rules for Calculating Big O
1. **Drop Constant Factors:** $O(3n + 50) \\to O(n)$. Constants do not alter the growth trajectory at large scale.
2. **Drop Lower-Order Terms:** $O(n^2 + 500n + 1000) \\to O(n^2)$. At large $n$, $n^2$ dominates all other terms.
3. **Analyze Worst-Case:** Unless stated otherwise, Big O refers to the worst-case upper bound.

### 3. Space Complexity
Space complexity measures the **auxiliary memory** an algorithm allocates during execution (excluding input size). Variables take $O(1)$; an allocated array of size $n$ takes $O(n)$; recursion frames take $O(d)$ where $d$ is call stack depth.`,
    simpleExample: {
      code: `# O(1) - Constant
def get_first(arr): return arr[0]

# O(n) - Linear
def find_max(arr):
    m = arr[0]
    for x in arr:
        if x > m: m = x
    return m

# O(n^2) - Quadratic
def has_duplicates(arr):
    for i in range(len(arr)):
        for j in range(i+1, len(arr)):
            if arr[i] == arr[j]: return True
    return False`,
      explanation: 'Different loop architectures scale at drastically different rates as input size expands.'
    },
    syntax: `# Big O Hierarchy:
# O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n)`,
    codeExample: `import time

def linear_search(arr, target):
    """O(n) time, O(1) space."""
    for item in arr:
        if item == target:
            return True
    return False

def binary_search(arr, target):
    """O(log n) time, O(1) space."""
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return True
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return False

# Demonstrate scaling disparity at n = 1,000,000
data = list(range(1_000_000))
target = 999_999

t0 = time.perf_counter()
linear_search(data, target)
t_linear = time.perf_counter() - t0

t0 = time.perf_counter()
binary_search(data, target)
t_binary = time.perf_counter() - t0

print(f"O(n) Linear Search:    {t_linear:.6f}s (Examined ~1,000,000 items)")
print(f"O(log n) Binary Search: {t_binary:.6f}s (Examined ~20 items)")`,
    expectedOutput: `O(n) Linear Search:    0.024000s (Examined ~1,000,000 items)
O(log n) Binary Search: 0.000004s (Examined ~20 items)`,
    stepByStep: [
      'Input size n represents number of data items.',
      'Linear search examines items one by one: n comparisons.',
      'Binary search divides the remaining space in half on each step: log2(n) comparisons.',
      'For n = 1,000,000, log2(n) is ~20 comparisons vs 1,000,000 comparisons!'
    ],
    commonMistakes: [
      {
        mistake: 'Assuming smaller line count means smaller Big O',
        correction: 'Inspect the operations executed under the hood',
        explanation: '"x in list" is a single line of Python, but it executes an O(n) search loop under the hood.'
      },
      {
        mistake: 'Confusing O(n) time with O(n) space',
        correction: 'Analyze runtime loop counts separately from allocated memory collections',
        explanation: 'An algorithm can run in O(n^2) time while consuming only O(1) memory space.'
      }
    ],
    realWorldExample: {
      scenario: 'Database Query Optimization',
      code: `# A table with 10,000,000 rows without an index requires an O(n) full table scan.
# Adding a B-Tree index transforms query retrieval into O(log n), reducing response
# latency from 3.5 seconds to 0.002 seconds.`,
      explanation: 'Software scalability engineering revolves around keeping critical user workflows below O(n log n).'
    },
    practice: {
      prompt: 'What is the Big O time complexity of the following code snippet? Answer with "O(n)", "O(n^2)", or "O(1)".\n\nfor i in range(n):\n    for j in range(10):\n        print(i, j)',
      starterCode: `# Assign the correct string: "O(n)", "O(n^2)", or "O(1)"
answer = ...

print(answer)
`,
      expectedOutputMatcher: `O(n)`,
      hint: 'The inner loop runs a CONSTANT 10 times regardless of n. 10 * n simplifies to O(n).',
      solution: `answer = "O(n)"
print(answer)`
    },
    quiz: [
      {
        id: 'q-py-bgo-1',
        question: 'Which of the following functions grows fastest as n approaches infinity?',
        options: ['O(n log n)', 'O(n^2)', 'O(2^n)', 'O(n^3)'],
        correctIndex: 2,
        explanation: 'Exponential complexity O(2^n) grows faster than polynomial complexities (n^2, n^3) and quickly becomes uncomputable.',
        difficulty: 'medium'
      },
      {
        id: 'q-py-bgo-2',
        question: 'What is the simplified Big O time complexity of an algorithm that performs 4n^2 + 100n + 5000 operations?',
        options: ['O(n^2)', 'O(4n^2)', 'O(n^3)', 'O(5000)'],
        correctIndex: 0,
        explanation: 'We drop constant factors (4) and lower-order terms (100n, 5000), leaving O(n^2).',
        difficulty: 'easy'
      }
    ,
      {
        id: "q-py-bgo-3",
        question: "What is the Big O time complexity of accessing an element by index in a Python list versus searching for a value in an unsorted list?",
        codeSnippet: null,
        options: [
          "Index access is O(1); Value search is O(N)",
          "Index access is O(log N); Value search is O(1)",
          "Both are O(1)",
          "Both are O(N)"
        ],
        correctIndex: 0,
        explanation: "List index access (arr[i]) uses pointer arithmetic in contiguous memory in O(1) time. Searching for a value ('x in arr') must linearly scan up to N elements in O(N) worst-case time.",
        difficulty: "easy"
      },
      {
        id: "q-py-bgo-4",
        question: "Arrange these complexity classes from FASTEST growing (most efficient) to SLOWEST growing (least efficient) as N -> infinity:",
        codeSnippet: null,
        options: [
          "O(1) < O(log N) < O(N) < O(N log N) < O(N^2) < O(2^N)",
          "O(N) < O(1) < O(N^2) < O(log N)",
          "O(log N) < O(1) < O(N log N) < O(N^2)",
          "O(1) < O(N) < O(log N) < O(N^2)"
        ],
        correctIndex: 0,
        explanation: "Constant O(1) is fastest, followed by logarithmic O(log N), linear O(N), log-linear O(N log N), quadratic O(N^2), and exponential O(2^N).",
        difficulty: "easy"
      },
      {
        id: "q-py-bgo-5",
        question: "What is the time complexity of the following nested loop pattern?",
        codeSnippet: `n = len(arr)
for i in range(n):
    for j in range(i, n):
        print(arr[j])`,
        options: [
          "O(N^2)",
          "O(N log N)",
          "O(N)",
          "O(2^N)"
        ],
        correctIndex: 0,
        explanation: "The loop executes N + (N-1) + ... + 1 = N(N+1)/2 times, which asymptotically simplifies to O(N^2) quadratic time.",
        difficulty: "medium"
      }
    ],
    challenge: {
      title: "Subarray Sums with Prefix Complexity Analysis",
      problemStatement: "Given an array of integers, compute prefix sums in O(N) time so that range sum queries [L, R] can be answered in O(1) time. In solve(), read array elements on line 1, and queries 'L R' on subsequent lines. Print the sum for each query.",
      inputFormat: "Line 1: space-separated integers. Subsequent lines: two 0-indexed integers L and R.",
      outputFormat: "One integer per query line representing sum(arr[L..R]).",
      constraints: "0 <= L <= R < len(arr)",
      starterCode: `import sys

def solve():
    lines = [l.strip() for l in sys.stdin.read().strip().split('\n') if l.strip()]
    if not lines:
        return
    nums = [int(x) for x in lines[0].split()]
    # O(N) prefix array
    prefix = [0] * (len(nums) + 1)
    for i in range(len(nums)):
        prefix[i + 1] = prefix[i] + nums[i]
    # O(1) range queries
    for q in lines[1:]:
        l, r = [int(x) for x in q.split()]
        print(prefix[r + 1] - prefix[l])

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: `2 4 6 8 10
1 3
0 4`,
          expected_output: `18
30`
        }
      ]
    },
    summary: [
      'Big O measures how algorithm time and space requirements scale as input size grows.',
      'Drop constants and lower-order terms to find the asymptotic upper bound.',
      'Logarithmic and linear algorithms scale predictably to millions of items.'
    ]
  },

  {
    id: 'top-py-int-recursion',
    number: 21,
    numberDisplay: '21',
    moduleId: 'mod-algo',
    moduleTitle: 'Module 04: Algorithms & Practical Applications',
    title: 'Recursion & Call Stack Mechanics',
    slug: 'recursion-call-stack-mechanics',
    shortDescription: 'Master self-referential problem solving, base cases, recursive decomposition, stack frames, and call stack tracing.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisiteId: 'top-py-int-big-o-complexity',
    learningObjectives: [
      'Define recursion: a function solving a problem by invoking itself with smaller sub-problems',
      'Identify the two mandatory components: Base Case (stop) and Recursive Case (step)',
      'Trace call stack frame creation, parameter pushes, and stack unwinding',
      'Prevent RecursionError (stack overflow) and recognize when iteration is preferable'
    ],
    conceptExplanation: `**Recursion** is a programming technique in which a function calls itself directly or indirectly to solve a smaller instance of the same problem.

### 1. The Anatomy of Every Recursive Function
Every correct recursive function **must** have:
1. **Base Case:** A stopping condition that returns a value directly without making further recursive calls.
2. **Recursive Step:** Logic that breaks the problem into smaller sub-problems and calls the function with simpler input, moving closer to the base case.

Without a base case, recursion continues indefinitely until Python raises:
\`RecursionError: maximum recursion depth exceeded\` (Stack Overflow).

### 2. Call Stack Mechanics
Every time a function is called, the CPU allocates a **Stack Frame** containing:
* Function arguments
* Local variables
* Return address pointer

As recursive calls descend, stack frames are pushed onto the execution call stack. When a base case is hit, stack frames **unwind** in reverse order, returning values upward!

\`\`\`
factorial(3)
  -> 3 * factorial(2)
    -> 2 * factorial(1)
      -> 1 (Base case hit!)
    <- returns 2 * 1 = 2
  <- returns 3 * 2 = 6
\`\`\``,
    simpleExample: {
      code: `def factorial(n):
    if n <= 1:  # Base case
        return 1
    return n * factorial(n - 1)  # Recursive step

print("5! =", factorial(5))`,
      explanation: 'factorial calls itself with n - 1 until reaching 1, then multiplies values during stack unwinding.'
    },
    syntax: `def recursive_func(params):
    if base_condition:
        return base_value
    # Recursive reduction:
    return recursive_func(reduced_params)`,
    codeExample: `# Tracing call stack depth visually
def countdown_trace(n, depth=0):
    indent = "  " * depth
    print(f"{indent}-> Entering countdown({n})")
    
    if n == 0:
        print(f"{indent}*** Base Case Reached! ***")
        return
    
    countdown_trace(n - 1, depth + 1)
    print(f"{indent}<- Unwinding countdown({n})")

countdown_trace(3)`,
    expectedOutput: `-> Entering countdown(3)
  -> Entering countdown(2)
    -> Entering countdown(1)
      -> Entering countdown(0)
      *** Base Case Reached! ***
    <- Unwinding countdown(1)
  <- Unwinding countdown(2)
<- Unwinding countdown(3)`,
    stepByStep: [
      'Calling countdown(3) pushes a frame at depth 0.',
      'Calls descend recursively to depth 3 where n==0 triggers the base case.',
      'Stack unwinds in reverse order, printing exit messages.',
      'Frames are popped from the call stack until memory returns to original state.'
    ],
    commonMistakes: [
      {
        mistake: 'Missing base case or base case condition that is never reached',
        correction: 'Verify input moves strictly closer to the base case on each step',
        explanation: 'Calling def f(n): return f(n+1) will never hit a stopping condition, rapidly hitting Python maximum recursion limit (1000).'
      },
      {
        mistake: 'Using naive recursion for Fibonacci: fib(n-1) + fib(n-2)',
        correction: 'Use memoization (@functools.lru_cache) or iteration',
        explanation: 'Naive recursive Fibonacci recomputes the same branches exponentially, exploding to O(2^n) time!'
      }
    ],
    realWorldExample: {
      scenario: 'Recursive Directory Tree File Traversal',
      code: `def print_directory_tree(folder_dict, indent=0):
    for name, content in folder_dict.items():
        print("  " * indent + f"📁 {name}")
        if isinstance(content, dict):
            print_directory_tree(content, indent + 1)

mock_fs = {
    "src": {
        "components": {"Button.py": None},
        "utils": {"math.py": None}
    },
    "docs": {"readme.md": None}
}
print_directory_tree(mock_fs)`,
      explanation: 'File system explorers and nested JSON parsers naturally use recursive traversal to navigate arbitrary directory depths.'
    },
    practice: {
      prompt: 'Write a recursive function sum_list(nums) that calculates the sum of all numbers in a list without using the built-in sum() function or loops. Base case: empty list returns 0.',
      starterCode: `def sum_list(nums):
    # Implement recursively
    pass

print(sum_list([10, 20, 30, 40]))
`,
      expectedOutputMatcher: `100`,
      hint: 'if not nums: return 0; return nums[0] + sum_list(nums[1:])',
      solution: `def sum_list(nums):
    if not nums:
        return 0
    return nums[0] + sum_list(nums[1:])

print(sum_list([10, 20, 30, 40]))`
    },
    quiz: [
      {
        id: 'q-py-rec-1',
        question: 'What error does Python raise when a recursive function exceeds the maximum recursion limit?',
        options: ['StackOverflowException', 'RecursionError', 'MemoryIndexError', 'LoopBoundExceeded'],
        correctIndex: 1,
        explanation: 'Python raises RecursionError: maximum recursion depth exceeded in comparison.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-rec-2',
        question: 'What is the role of the base case in a recursive function?',
        options: [
          'To optimize memory allocation',
          'To terminate the recursive descent and begin stack unwinding',
          'To duplicate the initial parameters',
          'To initialize class variables'
        ],
        correctIndex: 1,
        explanation: 'Without a base case, recursion would continue indefinitely until memory is exhausted.',
        difficulty: 'easy'
      }
    ,
      {
        id: "q-py-rec-3",
        question: "What happens if a recursive function does not include a correct base case or the base case is unreachable?",
        codeSnippet: null,
        options: [
          "RecursionError: maximum recursion depth exceeded (stack overflow)",
          "Python automatically converts the code to a while loop",
          "The operating system reboots",
          "The function returns 0"
        ],
        correctIndex: 0,
        explanation: "Each recursive call allocates a stack frame on CPython's execution stack. Without a terminating base case, the stack hits sys.getrecursionlimit() (~1000) and raises RecursionError.",
        difficulty: "easy"
      },
      {
        id: "q-py-rec-4",
        question: "How does memoization (e.g. @functools.lru_cache) transform the naive recursive Fibonacci algorithm from O(2^N) to O(N)?",
        codeSnippet: null,
        options: [
          "By caching previously computed subproblem results in a hash table to avoid redundant subtree recalculations",
          "By running on multiple CPU cores",
          "By compiling Python to C",
          "By using tail-call optimization"
        ],
        correctIndex: 0,
        explanation: "Memoization records each f(n) output in a dictionary. Subsequent encounters with the same n return in O(1) time, collapsing the exponential tree into a linear chain of N subproblems.",
        difficulty: "medium"
      },
      {
        id: "q-py-rec-5",
        question: "Predict the return value of mystery(1234):",
        codeSnippet: `def mystery(n):
    if n == 0:
        return 0
    return (n % 10) + mystery(n // 10)`,
        options: [
          "10",
          "24",
          "4321",
          "1234"
        ],
        correctIndex: 0,
        explanation: "mystery computes the sum of the digits recursively: 4 + 3 + 2 + 1 + 0 = 10.",
        difficulty: "medium"
      }
    ],
    challenge: {
      title: "Recursive Flattening of Arbitrary Nested Lists",
      problemStatement: "Write a recursive function flatten(nested_list) that takes an arbitrarily deeply nested list of integers and returns a flat 1D list containing all integers in original sequence. In solve(), evaluate and print the flattened list.",
      inputFormat: "A Python list string, e.g. '[1, [2, [3, 4], 5], 6]'.",
      outputFormat: "Space-separated integers from the flattened list.",
      constraints: "Nesting depth <= 50.",
      starterCode: `import sys
import ast

def flatten(lst):
    res = []
    for item in lst:
        if isinstance(item, list):
            res.extend(flatten(item))
        else:
            res.append(item)
    return res

def solve():
    raw = sys.stdin.read().strip()
    if not raw:
        return
    data = ast.literal_eval(raw)
    flat = flatten(data)
    print(' '.join(str(x) for x in flat))

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: "[1, [2, [3, 4], 5], 6]",
          expected_output: "1 2 3 4 5 6"
        }
      ]
    },
    summary: [
      'Recursion solves problems by decomposing them into smaller sub-problems.',
      'Every recursive function requires a base case and a recursive step.',
      'Stack frames accumulate during descent and pop during unwinding.'
    ]
  },

  {
    id: 'top-py-int-searching-algorithms',
    number: 22,
    numberDisplay: '22',
    moduleId: 'mod-algo',
    moduleTitle: 'Module 04: Algorithms & Practical Applications',
    title: 'Searching Algorithms (Linear vs Binary Search)',
    slug: 'searching-algorithms-linear-binary-search',
    shortDescription: 'Master search fundamentals: O(n) Linear Search vs O(log n) Binary Search, sorted preconditions, and two-pointer tracking.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisiteId: 'top-py-int-recursion',
    learningObjectives: [
      'Implement Linear Search and recognize when it is the only viable option (unsorted data)',
      'Implement iterative and recursive Binary Search with low, mid, and high pointers',
      'Explain the mandatory precondition for Binary Search: the collection must be sorted',
      'Understand the power of logarithmic search space halving ($O(\\log n)$)'
    ],
    conceptExplanation: `Searching is the algorithmic process of locating a specific target value within a collection.

### 1. Linear Search
* **Strategy:** Iterates through every element sequentially from left to right until the target is found or the end of the collection is reached.
* **Precondition:** None. Works on unsorted, arbitrary collections.
* **Complexity:** Best: $O(1)$, Worst: $O(n)$, Average: $O(n)$.

### 2. Binary Search
* **Strategy:** Divide and Conquer. Examines the **middle** element:
  * If \`mid == target\`: Found!
  * If \`target < mid\`: Discard right half; search left (\`high = mid - 1\`).
  * If \`target > mid\`: Discard left half; search right (\`low = mid + 1\`).
* **Precondition:** **THE COLLECTION MUST BE SORTED!**
* **Complexity:** Best: $O(1)$, Worst: $O(\\log n)$, Average: $O(\\log n)$.

\`\`\`
Sorted Array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], Target = 23
Step 1: low=0, high=9, mid=4 (val=16) -> 23 > 16 -> low = 5
Step 2: low=5, high=9, mid=7 (val=56) -> 23 < 56 -> high = 6
Step 3: low=5, high=6, mid=5 (val=23) -> MATCH! Found in 3 checks!
\`\`\``,
    simpleExample: {
      code: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

nums = [10, 20, 30, 40, 50, 60]
print("Found 40 at index:", binary_search(nums, 40))`,
      explanation: 'Binary search halves the remaining items on each iteration, quickly locating index 3.'
    },
    syntax: `def binary_search(sorted_arr, target):
    low, high = 0, len(sorted_arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if sorted_arr[mid] == target: return mid
        elif sorted_arr[mid] < target: low = mid + 1
        else: high = mid - 1
    return -1`,
    codeExample: `def binary_search_verbose(arr, target):
    low = 0
    high = len(arr) - 1
    step = 1

    print(f"Target: {target} in array of length {len(arr)}")
    while low <= high:
        mid = (low + high) // 2
        mid_val = arr[mid]
        print(f"  Step {step}: low={low}, high={high} | Checking mid index {mid} (val={mid_val})")

        if mid_val == target:
            print(f"  --> Found {target} at index {mid} in {step} steps!")
            return mid
        elif mid_val < target:
            low = mid + 1
        else:
            high = mid - 1
        step += 1

    return -1

sorted_data = [3, 8, 14, 19, 27, 35, 42, 51, 68, 79, 88, 95]
binary_search_verbose(sorted_data, 79)`,
    expectedOutput: `Target: 79 in array of length 12
  Step 1: low=0, high=11 | Checking mid index 5 (val=35)
  Step 2: low=6, high=11 | Checking mid index 8 (val=68)
  Step 3: low=9, high=11 | Checking mid index 10 (val=88)
  Step 4: low=9, high=9 | Checking mid index 9 (val=79)
  --> Found 79 at index 9 in 4 steps!`,
    stepByStep: [
      'Initialize low at 0 and high at len(arr) - 1.',
      'Calculate mid = (low + high) // 2.',
      'Compare target with arr[mid].',
      'Adjust low or high to halve the active search space.',
      'Terminate with match index or -1 if low exceeds high.'
    ],
    commonMistakes: [
      {
        mistake: 'Running binary search on an unsorted array',
        correction: 'Sort the array first (O(n log n)) or use Linear Search if searching once',
        explanation: 'Binary search logic relies fundamentally on sorted ordering. Running it on unsorted data produces incorrect false negatives.'
      },
      {
        mistake: 'Using while low < high instead of while low <= high',
        correction: 'Use while low <= high',
        explanation: 'With low < high, single-element subarrays or targets situated at the boundaries will be skipped!'
      }
    ],
    realWorldExample: {
      scenario: 'Git Bisect: Finding the Commit that Introduced a Bug',
      code: `# Software engineers use 'git bisect' to identify regressions in code history.
# If a repository has 2,000 commits, git bisect uses Binary Search to isolate the
# exact faulty commit in only ~11 checks instead of manually testing 2,000 commits!`,
      explanation: 'Git bisect and binary search algorithms save developers hours of manual testing.'
    },
    practice: {
      prompt: 'Write a function find_insert_position(sorted_arr, target) that returns the index where target should be inserted into sorted_arr to maintain sorted order. If target exists, return its current index. Test with sorted_arr = [1, 3, 5, 6], target = 4.',
      starterCode: `def find_insert_position(sorted_arr, target):
    # Use binary search to find insert index
    pass

print(find_insert_position([1, 3, 5, 6], 4))
print(find_insert_position([1, 3, 5, 6], 5))
`,
      expectedOutputMatcher: `2\n2`,
      hint: 'low, high = 0, len(arr) - 1; while low <= high: ... return low',
      solution: `def find_insert_position(sorted_arr, target):
    low, high = 0, len(sorted_arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if sorted_arr[mid] == target:
            return mid
        elif sorted_arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return low

print(find_insert_position([1, 3, 5, 6], 4))
print(find_insert_position([1, 3, 5, 6], 5))`
    },
    quiz: [
      {
        id: 'q-py-src-1',
        question: 'What is the maximum number of comparisons Binary Search requires on a sorted array of 1,024 elements?',
        options: ['10', '1,024', '512', '100'],
        correctIndex: 0,
        explanation: 'log2(1024) = 10 comparisons maximum.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-src-2',
        question: 'When is Linear Search preferable over Binary Search?',
        options: [
          'When the array is sorted and contains millions of elements',
          'When the array is unsorted and you only need to search once (sorting overhead exceeds linear search)',
          'Never under any circumstances',
          'Only when searching for floating point numbers'
        ],
        correctIndex: 1,
        explanation: 'Sorting takes O(n log n). If you only search once on unsorted data, Linear Search (O(n)) is faster than sorting + binary searching.',
        difficulty: 'medium'
      }
    ,
      {
        id: "q-py-src-3",
        question: "What is the mandatory prerequisite before Binary Search can be applied to an array?",
        codeSnippet: null,
        options: [
          "The elements must be sorted in monotonic order",
          "All elements must be positive numbers",
          "The array size must be an exact power of 2",
          "The array must be stored on disk"
        ],
        correctIndex: 0,
        explanation: "Binary Search relies on comparing the midpoint to discard half of the search interval. This elimination logic is mathematically valid only if the collection is sorted.",
        difficulty: "easy"
      },
      {
        id: "q-py-src-4",
        question: "Why is 'mid = low + (high - low) // 2' preferred over 'mid = (low + high) // 2' in lower-level languages and systems programming?",
        codeSnippet: null,
        options: [
          "To prevent integer arithmetic overflow when (low + high) exceeds maximum 32-bit integer limits",
          "Because it executes in 0 clock cycles",
          "It guarantees floating point division",
          "It works on unsorted lists"
        ],
        correctIndex: 0,
        explanation: "In languages with fixed integer bit widths (like C, C++, Java), large low + high can overflow beyond 2^31 - 1 into negative numbers. low + (high - low)//2 is mathematically equivalent and overflow-safe.",
        difficulty: "medium"
      },
      {
        id: "q-py-src-5",
        question: "How many comparisons does Binary Search take in the worst case to search an array of 1,000,000 sorted elements?",
        codeSnippet: null,
        options: [
          "Approximately 20 comparisons",
          "1,000 comparisons",
          "500,000 comparisons",
          "1,000,000 comparisons"
        ],
        correctIndex: 0,
        explanation: "Since log2(1,000,000) ~= 19.93, binary search requires at most 20 comparisons, demonstrating the tremendous power of O(log N).",
        difficulty: "easy"
      }
    ],
    challenge: {
      title: "Search Insert Position with Binary Search",
      problemStatement: "Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order. You must write an algorithm with O(log N) runtime complexity.",
      inputFormat: "Line 1: space-separated sorted integers. Line 2: target integer.",
      outputFormat: "A single integer representing target index or insert position.",
      constraints: "1 <= nums.length <= 1000",
      starterCode: `import sys

def search_insert(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = low + (high - low) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return low

def solve():
    lines = [l.strip() for l in sys.stdin.read().strip().split('\n') if l.strip()]
    if len(lines) < 2:
        return
    nums = [int(x) for x in lines[0].split()]
    target = int(lines[1])
    print(search_insert(nums, target))

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: `1 3 5 6
5`,
          expected_output: "2"
        },
        {
          input: `1 3 5 6
2`,
          expected_output: "1"
        }
      ]
    },
    summary: [
      'Linear Search operates on unsorted collections in O(n) time.',
      'Binary Search requires a sorted collection and runs in logarithmic O(log n) time.',
      'Binary Search halves the search space at each iteration.'
    ]
  },

  {
    id: 'top-py-int-sorting-basic',
    number: 23,
    numberDisplay: '23',
    moduleId: 'mod-algo',
    moduleTitle: 'Module 04: Algorithms & Practical Applications',
    title: 'Elementary Sorting (Bubble, Selection & Insertion Sort)',
    slug: 'elementary-sorting-bubble-selection-insertion',
    shortDescription: 'Master foundational sorting mechanics, pairwise element swaps, in-place sorting, and quadratic O(n²) time complexity.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisiteId: 'top-py-int-searching-algorithms',
    learningObjectives: [
      'Understand the mechanics of comparison-based sorting',
      'Implement Bubble Sort with early termination flag optimization',
      'Implement Selection Sort by repeatedly locating the minimum element',
      'Implement Insertion Sort and understand why it excels on nearly sorted data'
    ],
    conceptExplanation: `Sorting arranges elements in a specified order (usually ascending). Understanding elementary sorting algorithms builds essential intuition for algorithmic invariants and element exchanges.

### 1. Bubble Sort
* **Strategy:** Iteratively steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. Large elements "bubble up" to the end of the array.
* **Optimization:** If an entire pass completes without a single swap, the array is already sorted—terminate early!
* **Complexity:** Best: $O(n)$ (already sorted), Worst/Average: $O(n^2)$. Space: $O(1)$ in-place.

### 2. Selection Sort
* **Strategy:** Divides the list into sorted and unsorted regions. In each pass, it finds the smallest element in the unsorted region and swaps it with the first unsorted element.
* **Complexity:** Always $O(n^2)$ time (even if sorted). Makes at most $O(n)$ swaps.

### 3. Insertion Sort
* **Strategy:** Similar to how people sort playing cards in their hands. Considers elements one by one, shifting larger elements to the right to make room for insertion.
* **Complexity:** Best: $O(n)$ on nearly sorted data! Worst/Average: $O(n^2)$. Space: $O(1)$.`,
    simpleExample: {
      code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]  # Swap!
    return arr

print("Sorted:", bubble_sort([64, 34, 25, 12, 22]))`,
      explanation: 'Adjacent elements compare and swap, bubbling the largest value to the end in each pass.'
    },
    syntax: `# Swapping in Python:
arr[j], arr[j+1] = arr[j+1], arr[j]`,
    codeExample: `def selection_sort(arr):
    """Repeatedly selects the minimum and places it at the front."""
    a = arr.copy()
    n = len(a)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if a[j] < a[min_idx]:
                min_idx = j
        a[i], a[min_idx] = a[min_idx], a[i]
    return a

def insertion_sort(arr):
    """Inserts each element into its proper position in the sorted sub-array."""
    a = arr.copy()
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
    return a

raw_data = [29, 10, 14, 37, 13]
print("Raw:           ", raw_data)
print("Selection Sort:", selection_sort(raw_data))
print("Insertion Sort:", insertion_sort(raw_data))`,
    expectedOutput: `Raw:            [29, 10, 14, 37, 13]
Selection Sort: [10, 13, 14, 29, 37]
Insertion Sort: [10, 13, 14, 29, 37]`,
    stepByStep: [
      'Bubble sort compares pairs (0,1), (1,2) and swaps out-of-order neighbors.',
      'Selection sort scans for minimum index and executes a single swap per pass.',
      'Insertion sort shifts elements backward until finding the key insertion point.',
      'All three algorithms sort in-place with O(1) auxiliary space.'
    ],
    commonMistakes: [
      {
        mistake: 'Using bubble sort on large datasets (100,000 items)',
        correction: 'Use built-in list.sort() (Timsort, O(n log n))',
        explanation: 'Bubble sort requires 10 billion comparisons for 100,000 items, taking minutes instead of milliseconds.'
      },
      {
        mistake: 'Modifying the array while iterating with a plain for-in loop',
        correction: 'Use explicit index bounds range(len(arr))',
        explanation: 'In-place sorting requires stable pointer indices to manage sorted and unsorted boundaries.'
      }
    ],
    realWorldExample: {
      scenario: 'Online Real-Time Streaming Insertion Sort',
      code: `# Insertion Sort is the foundational engine inside Python's Timsort algorithm!
# When subarrays are small (<= 32 elements), Timsort uses Insertion Sort because its
# low constant factors and cache locality beat complex divide-and-conquer algorithms.`,
      explanation: 'Production standard libraries use Insertion Sort for small partitions due to its superior speed on tiny, nearly-sorted blocks.'
    },
    practice: {
      prompt: 'Implement an optimized Bubble Sort function bubble_sort_optimized(arr) that uses a swapped boolean flag to terminate early if no swaps occurred during a pass. Return the sorted list.',
      starterCode: `def bubble_sort_optimized(arr):
    a = arr.copy()
    n = len(a)
    # Implement bubble sort with swapped flag
    return a

print(bubble_sort_optimized([5, 1, 4, 2, 8]))
`,
      expectedOutputMatcher: `[1, 2, 4, 5, 8]`,
      hint: 'for i in range(n): swapped = False; for j in range(0, n-i-1): ... if not swapped: break',
      solution: `def bubble_sort_optimized(arr):
    a = arr.copy()
    n = len(a)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:
            break
    return a

print(bubble_sort_optimized([5, 1, 4, 2, 8]))`
    },
    quiz: [
      {
        id: 'q-py-srt1-1',
        question: 'Which elementary sorting algorithm performs best (O(n) linear time) when the array is already mostly sorted?',
        options: ['Selection Sort', 'Insertion Sort', 'Naive Bubble Sort', 'Bogosort'],
        correctIndex: 1,
        explanation: 'Insertion Sort only performs one comparison per element when data is already sorted, running in O(n) time.',
        difficulty: 'medium'
      },
      {
        id: 'q-py-srt1-2',
        question: 'What is the auxiliary space complexity of Bubble Sort, Selection Sort, and Insertion Sort?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
        correctIndex: 0,
        explanation: 'All three algorithms sort in-place, requiring only a constant O(1) number of temporary swap variables.',
        difficulty: 'easy'
      }
    ,
      {
        id: "q-py-sbs-3",
        question: "What is the defining characteristic of a 'Stable' sorting algorithm?",
        codeSnippet: null,
        options: [
          "It preserves the relative input order of records with equal keys",
          "It never crashes with OutOfMemoryError",
          "It runs in O(N log N) worst-case time",
          "It only sorts integers"
        ],
        correctIndex: 0,
        explanation: "A stable sort guarantees that two records with identical comparison keys remain in the exact same relative sequence as they were in the original input.",
        difficulty: "medium"
      },
      {
        id: "q-py-sbs-4",
        question: "Which elementary sorting algorithm exhibits adaptive O(N) best-case performance when the input array is already almost sorted?",
        codeSnippet: null,
        options: [
          "Insertion Sort",
          "Selection Sort",
          "Naive Quicksort",
          "Bogosort"
        ],
        correctIndex: 0,
        explanation: "Insertion sort only shifts elements when an out-of-order item is encountered. If the array is already sorted, the inner loop terminates in 1 comparison, achieving linear O(N) time.",
        difficulty: "easy"
      },
      {
        id: "q-py-sbs-5",
        question: "Why does Selection Sort always run in O(N^2) time even if the array is already sorted?",
        codeSnippet: null,
        options: [
          "Because it unconditionally scans the entire remaining unsorted suffix to find the minimum element in every pass",
          "Because it uses recursion",
          "Because it allocates auxiliary memory",
          "CPython optimizes it out"
        ],
        correctIndex: 0,
        explanation: "Selection sort has no early termination mechanism. It must scan all remaining N-i elements in every pass to be sure it has found the true minimum.",
        difficulty: "medium"
      }
    ],
    challenge: {
      title: "Insertion Sort Step Tracer",
      problemStatement: "Implement Insertion Sort on an array of integers. After each insertion pass (starting from index 1 to N-1), print the entire array state as space-separated integers on a new line.",
      inputFormat: "A single line with space-separated integers.",
      outputFormat: "N-1 lines displaying array progression.",
      constraints: "2 <= N <= 20",
      starterCode: `import sys

def solve():
    raw = sys.stdin.read().strip()
    if not raw:
        return
    nums = [int(x) for x in raw.split()]
    for i in range(1, len(nums)):
        key = nums[i]
        j = i - 1
        while j >= 0 and nums[j] > key:
            nums[j + 1] = nums[j]
            j -= 1
        nums[j + 1] = key
        print(' '.join(str(x) for x in nums))

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: "5 2 4 6 1",
          expected_output: `2 5 4 6 1
2 4 5 6 1
2 4 5 6 1
1 2 4 5 6`
        }
      ]
    },
    summary: [
      'Elementary sorts (Bubble, Selection, Insertion) have O(n²) average time complexity.',
      'All three operate in-place with O(1) space complexity.',
      'Insertion Sort excels on small or nearly sorted collections.'
    ]
  },

  {
    id: 'top-py-int-sorting-advanced',
    number: 24,
    numberDisplay: '24',
    moduleId: 'mod-algo',
    moduleTitle: 'Module 04: Algorithms & Practical Applications',
    title: 'Advanced Sorting (Merge Sort & Quick Sort)',
    slug: 'advanced-sorting-merge-sort-quick-sort',
    shortDescription: 'Master Divide-and-Conquer algorithms: Merge Sort stability, Quick Sort pivot partitioning, and O(n log n) efficiency.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisiteId: 'top-py-int-sorting-basic',
    learningObjectives: [
      'Understand the Divide and Conquer algorithmic paradigm',
      'Implement Merge Sort: recursive splitting and linear merge step ($O(n \\log n)$ guaranteed)',
      'Implement Quick Sort: pivot selection, partitioning, and recursive sorting',
      'Contrast Merge Sort stability and memory ($O(n)$ space) with Quick Sort in-place partitioning'
    ],
    conceptExplanation: `When sorting large datasets (millions of elements), $O(n^2)$ elementary sorts fail. We turn to **Divide and Conquer** algorithms that operate in **$O(n \\log n)$** time.

### 1. Merge Sort
* **Strategy:**
  1. **Divide:** Recursively split the array in half until individual 1-element subarrays remain.
  2. **Conquer:** Merge sorted halves back together in sorted order by comparing front elements.
* **Guaranteed Complexity:** Always $O(n \\log n)$ in best, worst, and average cases.
* **Stability:** Stable (preserves original order of equal keys).
* **Space:** $O(n)$ auxiliary memory required for merge buffers.

### 2. Quick Sort
* **Strategy:**
  1. Pick a **Pivot** element.
  2. **Partition:** Rearrange elements so that all items smaller than the pivot are on the left, and all items larger are on the right.
  3. Recursively sort the left and right partitions.
* **Complexity:**
  * Average: $O(n \\log n)$ with very small constant factors.
  * Worst: $O(n^2)$ if an unbalanced pivot is chosen on sorted data.
* **Space:** $O(\\log n)$ call stack space (in-place partitioning).`,
    simpleExample: {
      code: `def quick_sort_simple(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort_simple(left) + middle + quick_sort_simple(right)

print(quick_sort_simple([38, 27, 43, 3, 9, 82, 10]))`,
      explanation: 'Quick sort partitions elements around a pivot, recursively sorting each side.'
    },
    syntax: `# Divide & Conquer paradigm:
# 1. Base case: len(arr) <= 1
# 2. Divide: split into partitions
# 3. Combine: merge sorted subproblems`,
    codeExample: `def merge_sort(arr):
    """Guaranteed O(n log n) stable sorting."""
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    return merge(left, right)

def merge(left, right):
    sorted_arr = []
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            sorted_arr.append(left[i])
            i += 1
        else:
            sorted_arr.append(right[j])
            j += 1

    sorted_arr.extend(left[i:])
    sorted_arr.extend(right[j:])
    return sorted_arr

data = [54, 26, 93, 17, 77, 31, 44, 55, 20]
print("Unsorted:", data)
print("Merge Sort Output:", merge_sort(data))`,
    expectedOutput: `Unsorted: [54, 26, 93, 17, 77, 31, 44, 55, 20]
Merge Sort Output: [17, 20, 26, 31, 44, 54, 55, 77, 93]`,
    stepByStep: [
      'Array is recursively divided into single-element lists.',
      'The merge helper compares front elements of left and right.',
      'Smallest element is appended to sorted buffer.',
      'Leftover elements are appended once one side is exhausted.',
      'Produces fully sorted array in O(n log n) time.'
    ],
    commonMistakes: [
      {
        mistake: 'Choosing the first element as pivot in Quick Sort on sorted data',
        correction: 'Choose middle element or use random pivot selection',
        explanation: 'Picking arr[0] on an already sorted list produces maximally unbalanced partitions of size 1 and n-1, causing O(n^2) worst-case performance.'
      },
      {
        mistake: 'Forgetting that Merge Sort allocates O(n) extra memory',
        correction: 'Consider memory budgets on embedded devices with large datasets',
        explanation: 'Merge sort cannot easily sort in-place; it requires temporary storage proportional to the array size.'
      }
    ],
    realWorldExample: {
      scenario: 'Python\'s Built-in Timsort Engine',
      code: `# Python's list.sort() and sorted() use Timsort (developed by Tim Peters in 2002).
# Timsort is a hybrid of Merge Sort and Insertion Sort:
# It identifies pre-existing sorted runs and merges them using an adaptive merge sort,
# achieving O(n) on sorted data and O(n log n) worst-case!`,
      explanation: 'Timsort powers Python, Java 8+, and Android, combining the best of Merge Sort and Insertion Sort.'
    },
    practice: {
      prompt: 'Implement a recursive quick_sort(arr) function that returns a sorted list using the middle element as pivot. Test with [9, 3, 7, 5, 6, 4, 8, 2].',
      starterCode: `def quick_sort(arr):
    # Implement quick sort
    pass

print(quick_sort([9, 3, 7, 5, 6, 4, 8, 2]))
`,
      expectedOutputMatcher: `[2, 3, 4, 5, 6, 7, 8, 9]`,
      hint: 'if len(arr) <= 1: return arr; p = arr[len(arr)//2]; return quick_sort([x for x in arr if x < p]) + [x for x in arr if x == p] + quick_sort([x for x in arr if x > p])',
      solution: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    p = arr[len(arr) // 2]
    left = [x for x in arr if x < p]
    mid = [x for x in arr if x == p]
    right = [x for x in arr if x > p]
    return quick_sort(left) + mid + quick_sort(right)

print(quick_sort([9, 3, 7, 5, 6, 4, 8, 2]))`
    },
    quiz: [
      {
        id: 'q-py-srt2-1',
        question: 'What is the worst-case time complexity of Merge Sort?',
        options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'],
        correctIndex: 1,
        explanation: 'Merge Sort guarantees O(n log n) time complexity in all cases (best, average, and worst).',
        difficulty: 'easy'
      },
      {
        id: 'q-py-srt2-2',
        question: 'What does it mean for a sorting algorithm to be "stable"?',
        options: [
          'It never crashes the interpreter',
          'It preserves the original relative order of items with identical keys',
          'It uses zero auxiliary memory',
          'It runs in constant O(1) time'
        ],
        correctIndex: 1,
        explanation: 'A stable sort ensures that two elements with identical sorting keys retain their original relative order after sorting.',
        difficulty: 'medium'
      }
    ,
      {
        id: "q-py-sad-3",
        question: "What is the primary trade-off between Merge Sort and Quick Sort?",
        codeSnippet: null,
        options: [
          "Merge Sort guarantees O(N log N) worst-case time but requires O(N) auxiliary memory; Quick Sort is in-place (O(log N) space) and faster in practice, but can degrade to O(N^2) on bad pivots",
          "Merge Sort is unstable while Quick Sort is stable",
          "Quick Sort only works on strings",
          "Merge Sort cannot be implemented recursively"
        ],
        correctIndex: 0,
        explanation: "Merge sort requires O(N) buffer space to merge subarrays, while Quicksort partitions in-place. Good pivot selection (median-of-three or randomized) makes Quicksort the fastest general-purpose sort in practice.",
        difficulty: "medium"
      },
      {
        id: "q-py-sad-4",
        question: "What standard sorting algorithm does Python's built-in sorted() and list.sort() use?",
        codeSnippet: null,
        options: [
          "Timsort (an adaptive hybrid of Merge Sort and Insertion Sort)",
          "Pure Quicksort",
          "Heap Sort",
          "Bubble Sort"
        ],
        correctIndex: 0,
        explanation: "Python uses Timsort (invented by Tim Peters in 2002). It identifies existing ordered runs and merges them using an adaptive merge sort, achieving O(N) best case and O(N log N) worst case.",
        difficulty: "easy"
      },
      {
        id: "q-py-sad-5",
        question: "What is the recurrence relation for the time complexity of Merge Sort?",
        codeSnippet: null,
        options: [
          "T(N) = 2T(N/2) + O(N)",
          "T(N) = T(N-1) + O(1)",
          "T(N) = 2T(N/2) + O(1)",
          "T(N) = T(N/2) + O(N)"
        ],
        correctIndex: 0,
        explanation: "Merge sort divides the array into 2 halves (2*T(N/2)) and then merges the sorted halves in linear time (O(N)), which Master Theorem solves to O(N log N).",
        difficulty: "hard"
      }
    ],
    challenge: {
      title: "Divide-and-Conquer Merge Sort",
      problemStatement: "Implement Merge Sort to sort a list of numbers in ascending order. In solve(), read space-separated integers, apply merge sort, and print the sorted output space-separated.",
      inputFormat: "A single line with space-separated integers.",
      outputFormat: "Sorted space-separated integers.",
      constraints: "1 <= N <= 100",
      starterCode: `import sys

def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    # Merge
    res = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            res.append(left[i])
            i += 1
        else:
            res.append(right[j])
            j += 1
    res.extend(left[i:])
    res.extend(right[j:])
    return res

def solve():
    raw = sys.stdin.read().strip()
    if not raw:
        return
    nums = [int(x) for x in raw.split()]
    sorted_nums = merge_sort(nums)
    print(' '.join(str(x) for x in sorted_nums))

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: "38 27 43 3 9 82 10",
          expected_output: "3 9 10 27 38 43 82"
        }
      ]
    },
    summary: [
      'Divide and conquer algorithms achieve O(n log n) scalability.',
      'Merge Sort is stable with guaranteed O(n log n) time and O(n) space.',
      'Quick Sort partitions in-place with excellent average performance.'
    ]
  },

  {
    id: 'top-py-int-problem-solving',
    number: 25,
    numberDisplay: '25',
    moduleId: 'mod-algo',
    moduleTitle: 'Module 04: Algorithms & Practical Applications',
    title: 'Practical Problem-Solving Challenges',
    slug: 'practical-problem-solving-techniques',
    shortDescription: 'Master industry problem-solving patterns: Two Pointers, Sliding Window, and Hash Map frequency counting.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisiteId: 'top-py-int-sorting-advanced',
    learningObjectives: [
      'Apply the Two-Pointer technique to solve array pair problems in $O(n)$ time',
      'Implement the Sliding Window pattern to find optimal subarrays',
      'Use Hash Map frequency counting to solve anagram and element matching challenges',
      'Transform brute-force $O(n^2)$ solutions into linear $O(n)$ algorithms'
    ],
    conceptExplanation: `Industry coding interviews and real-world system optimization rely on recurring **algorithmic patterns**.
Recognizing these patterns allows you to reduce complex $O(n^2)$ problems to clean $O(n)$ solutions.

### 1. Two Pointers Pattern
* **Concept:** Maintain two pointer indices that traverse an array toward each other or in lockstep.
* **When to use:** Sorted arrays where you need to find pairs matching a condition (e.g. Target Sum), reverse arrays in-place, or detect cycles.
* **Benefit:** Reduces $O(n^2)$ nested search to a single $O(n)$ pass!

### 2. Sliding Window Pattern
* **Concept:** Maintain a dynamic "window" (subarray) defined by left and right boundaries that expands or contracts as you iterate.
* **When to use:** Subarrays with contiguous constraints (e.g. Maximum sum subarray of size $k$, longest substring without repeating characters).
* **Benefit:** Avoids recomputing overlapping sums repeatedly ($O(n)$ instead of $O(n \\cdot k)$).

### 3. Frequency Counting Pattern
* **Concept:** Use a hash map (\`dict\` or \`collections.Counter\`) to collect item occurrences in a single linear pass before comparing.`,
    simpleExample: {
      code: `# Two-Sum in a Sorted Array using Two Pointers (O(n))
def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        current_sum = arr[left] + arr[right]
        if current_sum == target:
            return (left, right)
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    return None

print("Indices matching 15:", two_sum_sorted([2, 5, 8, 10, 13, 17], 15))`,
      explanation: 'Two pointers move inward from opposite ends, finding the pair in a single O(n) pass.'
    },
    syntax: `# Two Pointers:
left, right = 0, len(arr) - 1
while left < right: ...

# Sliding Window:
window_sum = sum(arr[:k])
for i in range(k, len(arr)):
    window_sum += arr[i] - arr[i - k]`,
    codeExample: `def max_sub_array_of_size_k(arr, k):
    """Finds maximum sum of any contiguous subarray of size k in O(n)."""
    if len(arr) < k:
        return 0

    # 1. Compute sum of first window
    window_sum = sum(arr[:k])
    max_sum = window_sum

    # 2. Slide window across remaining array: add incoming, subtract outgoing
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)

    return max_sum

# Test Sliding Window
numbers = [2, 1, 5, 1, 3, 2]
k = 3
print(f"Max sum of subarray of size {k}:", max_sub_array_of_size_k(numbers, k))`,
    expectedOutput: `Max sum of subarray of size 3: 9`,
    stepByStep: [
      'Compute sum of first k elements [2, 1, 5] = 8.',
      'Slide window to right: subtract outgoing element (2), add incoming element (1). New sum = 7.',
      'Slide again: subtract 1, add 3. New sum = 9.',
      'Slide again: subtract 5, add 2. New sum = 6.',
      'Return maximum recorded sum (9) in O(n) time without nested loops.'
    ],
    commonMistakes: [
      {
        mistake: 'Recomputing sum(arr[i:i+k]) on every step in sliding window',
        correction: 'window_sum += arr[i] - arr[i - k]',
        explanation: 'Calling sum() inside a loop re-evaluates all k items, degrading the algorithm back to O(n * k).'
      },
      {
        mistake: 'Applying Two Pointers to an unsorted array for pair sum',
        correction: 'Sort the array first or use a Hash Set (complement lookup)',
        explanation: 'Two-pointer convergence logic requires the array to be monotonically ordered.'
      }
    ],
    realWorldExample: {
      scenario: 'Network Bandwidth Peak Monitor (Sliding Window)',
      code: `traffic_per_sec = [120, 140, 200, 310, 420, 280, 150, 110]
window_seconds = 3

peak_throughput = max_sub_array_of_size_k(traffic_per_sec, window_seconds)
print(f"Peak 3-second traffic: {peak_throughput} MB")`,
      explanation: 'Network telemetry and cloud auto-scalers measure rolling traffic spikes using sliding windows.'
    },
    practice: {
      prompt: 'Write a function is_valid_palindrome(s) that uses Two Pointers to check if a string is a palindrome, ignoring non-alphanumeric characters and casing. Return True or False.',
      starterCode: `def is_valid_palindrome(s):
    # Filter alphanumeric, lowercase, and use two pointers
    pass

print(is_valid_palindrome("A man, a plan, a canal: Panama"))
print(is_valid_palindrome("race a car"))
`,
      expectedOutputMatcher: `True\nFalse`,
      hint: 'cleaned = [c.lower() for c in s if c.isalnum()]; left, right = 0, len(cleaned)-1; compare cleaned[left] == cleaned[right]',
      solution: `def is_valid_palindrome(s):
    cleaned = [c.lower() for c in s if c.isalnum()]
    left, right = 0, len(cleaned) - 1
    while left < right:
        if cleaned[left] != cleaned[right]:
            return False
        left += 1
        right -= 1
    return True

print(is_valid_palindrome("A man, a plan, a canal: Panama"))
print(is_valid_palindrome("race a car"))`
    },
    quiz: [
      {
        id: 'q-py-pat-1',
        question: 'What is the primary benefit of the Sliding Window technique over brute-force subarray evaluation?',
        options: [
          'It reduces time complexity from O(n * k) to O(n) by recycling overlapping computations',
          'It works without memory allocations',
          'It automatically sorts the input',
          'It parallelizes GPU threads'
        ],
        correctIndex: 0,
        explanation: 'Sliding window subtracts the exiting item and adds the entering item in O(1) time instead of summing k elements each time.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-pat-2',
        question: 'Which algorithmic pattern is best suited for matching anagrams between two strings in O(n) time?',
        options: ['Binary search', 'Frequency counting with Hash Maps', 'Recursive depth search', 'Bubble Sort'],
        correctIndex: 1,
        explanation: 'Counting character frequencies in two dicts takes O(n) time and O(1) space (26 alphabet characters).',
        difficulty: 'easy'
      }
    ,
      {
        id: "q-py-psp-3",
        question: "Which algorithmic pattern is optimal for finding a contiguous subarray of size K with the maximum sum in O(N) time?",
        codeSnippet: null,
        options: [
          "Sliding Window pattern",
          "Depth-First Search",
          "Binary Search on array",
          "Dynamic Matrix Multiplication"
        ],
        correctIndex: 0,
        explanation: "Sliding window maintains a running sum of K elements, adding the incoming element and subtracting the outgoing element in O(1) per step, yielding O(N) total time.",
        difficulty: "easy"
      },
      {
        id: "q-py-psp-4",
        question: "When can the 'Two Pointers' technique (one pointer at 0 and one at N-1 moving inward) be used to find two numbers that sum to a target?",
        codeSnippet: null,
        options: [
          "When the array is sorted",
          "Only when all numbers are negative",
          "When numbers are stored in a linked list",
          "Only on strings"
        ],
        correctIndex: 0,
        explanation: "On a sorted array, if arr[left] + arr[right] > target, decreasing right is guaranteed to reduce the sum; if sum < target, increasing left increases the sum.",
        difficulty: "easy"
      },
      {
        id: "q-py-psp-5",
        question: "How does using a Hash Map reduce the Two Sum problem from O(N^2) brute force to O(N) time?",
        codeSnippet: null,
        options: [
          "By storing complements (target - x) seen so far and checking for presence in O(1) average time",
          "By sorting the input in O(1)",
          "By compressing the numbers into binary strings",
          "By using multi-threading"
        ],
        correctIndex: 0,
        explanation: "For each number x, we check if complement = (target - x) is already in the hash map. The lookup is O(1), leading to an overall single-pass O(N) algorithm.",
        difficulty: "medium"
      }
    ],
    challenge: {
      title: "Longest Substring Without Repeating Characters (Sliding Window)",
      problemStatement: "Given a string s, find the length of the longest contiguous substring without repeating characters using the sliding window pattern with a hash map in O(N) time.",
      inputFormat: "A single line containing the string s.",
      outputFormat: "An integer representing the length of the longest unique substring.",
      constraints: "0 <= len(s) <= 500",
      starterCode: `import sys

def length_of_longest_substring(s: str) -> int:
    char_index = {}
    left = 0
    max_len = 0
    for right, c in enumerate(s):
        if c in char_index and char_index[c] >= left:
            left = char_index[c] + 1
        char_index[c] = right
        max_len = max(max_len, right - left + 1)
    return max_len

def solve():
    raw = sys.stdin.read().strip()
    print(length_of_longest_substring(raw))

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: "abcabcbb",
          expected_output: "3"
        },
        {
          input: "bbbbb",
          expected_output: "1"
        }
      ]
    },
    summary: [
      'Two Pointers find matching pairs and reverse arrays in a single O(n) pass.',
      'Sliding Window evaluates continuous subarrays in linear time.',
      'Recognizing algorithmic patterns turns brute-force bottlenecks into scalable solutions.'
    ]
  },

    {
    id: "top-py-int-mini-project",
    number: 26,
    numberDisplay: "26",
    moduleId: "mod-algo",
    moduleTitle: "Module 04: Algorithms & Practical Applications",
    title: "Final Mini Project: LRU Cache Implementation",
    slug: "final-project-lru-cache",
    shortDescription: "Architect and implement an industrial-strength Least Recently Used (LRU) Cache supporting strictly O(1) get and put operations via Doubly Linked Lists and Hash Maps.",
    difficulty: "Advanced",
    estimatedMinutes: 60,
    prerequisiteId: "top-py-int-problem-solving",
    learningObjectives: [
      "Synthesize Doubly Linked Lists and Hash Maps to achieve strict O(1) temporal bounds for get() and put()",
      "Implement sentinel dummy head and tail nodes to eliminate edge-case branching during node detachment and insertion",
      "Execute the Least Recently Used (LRU) eviction policy when capacity thresholds are exceeded",
      "Engineer complete unit test suites validating cache hits, misses, updates, eviction ordering, and capacity limits"
    ],
    conceptExplanation: `### System Architecture: Least Recently Used (LRU) Cache

In high-throughput computing (databases, web servers, CDNs, OS virtual memory), caches store frequently accessed items in fast RAM to avoid expensive disk or network trips. Because RAM is finite, an **eviction policy** decides which entry to discard when the cache reaches maximum capacity.

The **Least Recently Used (LRU)** policy evicts the item that has not been read or written for the longest duration.

---

### The Algorithmic Dilemma: Why One Data Structure Is Not Enough
To build a production cache, we demand two operations:
1. \`get(key)\`: Retrieve value in **O(1)** time, then mark key as *Most Recently Used*.
2. \`put(key, value)\`: Insert or update key in **O(1)** time. If capacity is exceeded, evict the *Least Recently Used* item in **O(1)** time.

| Candidate Data Structure | Lookup Cost | Update Recency / Eviction Cost | Verdict |
| :--- | :--- | :--- | :--- |
| **Python List / Dynamic Array** | O(N) search | O(N) shift on removal | ❌ Too slow |
| **Hash Map (dict) alone** | O(1) key lookup | O(N) scanning to find oldest entry | ❌ Eviction too slow |
| **Doubly Linked List alone** | O(N) search to find node | O(1) removal once node is located | ❌ Search too slow |
| **Hash Map + Doubly Linked List** | **O(1) via Map** | **O(1) pointer updates via DLL** | ✅ **Optimal O(1) Hybrid** |

---

### Dual-Structure Engineering: How They Cooperate
1. **Doubly Linked List (Ordering Engine):**
   * Maintains temporal access sequence.
   * **Head:** Anchors the *Least Recently Used (LRU)* items.
   * **Tail:** Anchors the *Most Recently Used (MRU)* items.
   * Every node holds \`key\`, \`val\`, \`prev\`, and \`next\`. Storing \`key\` on the node is vital because when evicting from the head, we must know which key to delete from the hash map!
2. **Hash Map (Fast Index Engine):**
   * Maps \`key -> Node reference\`.
   * Enables instant O(1) jump directly to any node in the doubly linked list without linear traversal.
3. **Dummy Sentinel Nodes:**
   * By initializing \`self.head = Node(0, 0)\` and \`self.tail = Node(0, 0)\` linked to each other (\`head.next = tail\`, \`tail.prev = head\`), we never have to write special null checks when removing or adding nodes.`,
    simpleExample: {
      code: `class Node:
    def __init__(self, key, val):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCacheSimple:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {} # key -> node
        # Sentinel dummy boundaries
        self.head, self.tail = Node(0, 0), Node(0, 0)
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node: Node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_tail(self, node: Node):
        node.prev = self.tail.prev
        node.next = self.tail
        self.tail.prev.next = node
        self.tail.prev = node`,
      explanation: "Dummy head and tail nodes eliminate null checks: detaching a node and splicing it into the tail position executes in strictly 4 pointer reassignments."
    },
    syntax: `class LRUCache:
    def __init__(self, capacity: int): ...
    def get(self, key: int) -> int: ...
    def put(self, key: int, value: int) -> None: ...`,
    codeExample: `class Node:
    __slots__ = ('key', 'val', 'prev', 'next')
    def __init__(self, key: int, val: int):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    """Production-grade Least Recently Used Cache with O(1) operations."""
    def __init__(self, capacity: int):
        if capacity <= 0:
            raise ValueError("Capacity must be positive")
        self.capacity = capacity
        self.map = {} # key -> Node
        
        # Sentinel nodes: Head = LRU side, Tail = MRU side
        self.head = Node(0, 0)
        self.tail = Node(0, 0)
        self.head.next = self.tail
        self.tail.prev = self.head

    def _detach(self, node: Node):
        """Unlink node from its current position in O(1)."""
        node.prev.next = node.next
        node.next.prev = node.prev

    def _append_mru(self, node: Node):
        """Insert node right before self.tail (Most Recently Used)."""
        node.prev = self.tail.prev
        node.next = self.tail
        self.tail.prev.next = node
        self.tail.prev = node

    def get(self, key: int) -> int:
        if key not in self.map:
            return -1 # Cache miss
        node = self.map[key]
        self._detach(node)
        self._append_mru(node)
        return node.val

    def put(self, key: int, value: int) -> None:
        if key in self.map:
            node = self.map[key]
            node.val = value
            self._detach(node)
            self._append_mru(node)
            return

        if len(self.map) >= self.capacity:
            lru_node = self.head.next
            self._detach(lru_node)
            del self.map[lru_node.key]

        new_node = Node(key, value)
        self.map[key] = new_node
        self._append_mru(new_node)

    def debug_order(self) -> list:
        res = []
        curr = self.head.next
        while curr != self.tail:
            res.append((curr.key, curr.val))
            curr = curr.next
        return res

# Demonstration
cache = LRUCache(2)
cache.put(1, 100)
cache.put(2, 200)
print("Initial Cache (LRU -> MRU):", cache.debug_order())
print("Fetch Key 1:", cache.get(1))
print("Cache after reading 1:", cache.debug_order())
cache.put(3, 300)
print("Cache after inserting 3:", cache.debug_order())
print("Get Key 2:", cache.get(2))
print("Get Key 3:", cache.get(3))`,
    expectedOutput: `Initial Cache (LRU -> MRU): [(1, 100), (2, 200)]
Fetch Key 1: 100
Cache after reading 1: [(2, 200), (1, 100)]
Cache after inserting 3: [(1, 100), (3, 300)]
Get Key 2: -1
Get Key 3: 300`,
    stepByStep: [
      "1. Initialization: Create dummy head and tail sentinels linked together with capacity C and an empty lookup dictionary.",
      "2. get(key): If key absent, return -1. Otherwise, locate Node in O(1) via map, detach from current chain, re-attach at tail (MRU), and return value.",
      "3. put(key, val) on existing key: Update value, detach node, and move to tail (MRU).",
      "4. put(key, val) on new key: If size equals capacity, remove the head.next node (LRU), delete its key from map, instantiate new Node, register in map, and attach at tail.",
      "5. O(1) Guarantees: All operations involve fixed numbers of dictionary lookups and pointer swaps, guaranteeing strict O(1) time complexity."
    ],
    commonMistakes: [
      {
        mistake: "Forgetting to store 'key' inside the Node class (only storing 'val')",
        correction: "Always store self.key and self.val inside the Node",
        explanation: "When evicting the least recently used node from the head of the linked list, you must know which key to delete from self.map. Without node.key, deleting from self.map requires an O(N) reverse search."
      },
      {
        mistake: "Omitting recency promotion during get(key) operations",
        correction: "Every read is an access event; move accessed node to MRU tail on get()",
        explanation: "LRU tracks access recency, not just creation time. A key that is read often must never be evicted."
      },
      {
        mistake: "Managing head and tail without dummy sentinel nodes",
        correction: "Use sentinel head and tail nodes to avoid fragile null checks",
        explanation: "Without sentinels, inserting into an empty list or deleting the single remaining node requires complex if-else branching that frequently causes NullPointer/AttributeError bugs."
      }
    ],
    realWorldExample: {
      scenario: "Operating System Page Replacement & Web Browser Asset Caching",
      code: `# Real-world web browsers use LRU memory caches to store decoded image bitmaps.
# When tab memory reaches the RAM ceiling, decoded images that haven't been scrolled
# into view recently are evicted, while active viewport images remain in cache.`,
      explanation: "From Linux kernel page caches to Cloudflare Edge DNS resolvers and Redis LRU eviction modes (maxmemory-policy allkeys-lru), this exact dual-structure architecture powers internet scale systems."
    },
    practice: {
      prompt: "Complete the LRUCache implementation below. The cache has capacity 2. Implement get(key) and put(key, val). Test: put(1, 10), put(2, 20), get(1) (returns 10), put(3, 30) (evicts key 2), then print get(2) and get(3).",
      starterCode: `class Node:
    def __init__(self, key, val):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.map = {}
        self.head, self.tail = Node(0, 0), Node(0, 0)
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add(self, node):
        node.prev = self.tail.prev
        node.next = self.tail
        self.tail.prev.next = node
        self.tail.prev = node

    def get(self, key: int) -> int:
        # Implement get with MRU update
        pass

    def put(self, key: int, value: int) -> None:
        # Implement put with eviction
        pass

cache = LRUCache(2)
cache.put(1, 10)
cache.put(2, 20)
cache.get(1)
cache.put(3, 30)
print(cache.get(2))
print(cache.get(3))
`,
      expectedOutputMatcher: "-1\n30",
      hint: "In get: if key in map: node = map[key]; self._remove(node); self._add(node); return node.val. In put: if key in map: self._remove(map[key]); elif len(map) >= cap: lru = self.head.next; self._remove(lru); del map[lru.key]. Then add new node.",
      solution: `class Node:
    def __init__(self, key, val):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.map = {}
        self.head, self.tail = Node(0, 0), Node(0, 0)
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add(self, node):
        node.prev = self.tail.prev
        node.next = self.tail
        self.tail.prev.next = node
        self.tail.prev = node

    def get(self, key: int) -> int:
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)
        self._add(node)
        return node.val

    def put(self, key: int, value: int) -> None:
        if key in self.map:
            self._remove(self.map[key])
        elif len(self.map) >= self.cap:
            lru = self.head.next
            self._remove(lru)
            del self.map[lru.key]
        new_node = Node(key, value)
        self.map[key] = new_node
        self._add(new_node)

cache = LRUCache(2)
cache.put(1, 10)
cache.put(2, 20)
cache.get(1)
cache.put(3, 30)
print(cache.get(2))
print(cache.get(3))`
    },
    quiz: [
      {
        id: "q-py-proj-1",
        question: "Why is a Doubly Linked List paired with a Hash Map in an LRU Cache rather than using a Singly Linked List?",
        options: [
          "A doubly linked list allows removing any arbitrary node in O(1) time given its reference; singly linked lists require an O(N) scan to locate the preceding node",
          "Singly linked lists cannot store numbers",
          "Doubly linked lists automatically sort elements",
          "Hash maps only connect to doubly linked lists"
        ],
        correctIndex: 0,
        explanation: "To detach a node in O(1), you must update node.prev.next = node.next. In a singly linked list, node.prev does not exist, forcing an O(N) traversal from the head to find the predecessor.",
        difficulty: "medium"
      },
      {
        id: "q-py-proj-2",
        question: "Why must the Doubly Linked List node store both the key AND the value, rather than just the value?",
        options: [
          "When the LRU node at the head is evicted, its stored key is needed to delete the corresponding entry from the hash map in O(1)",
          "To satisfy Python 3 syntax rules",
          "To encrypt cache entries",
          "To enable garbage collection"
        ],
        correctIndex: 0,
        explanation: "When evicting lru_node = head.next, we must execute 'del self.map[lru_node.key]'. If the node only held the value, we would have to search the entire dictionary in O(N) to discover which key to evict.",
        difficulty: "medium"
      },
      {
        id: "q-py-proj-3",
        question: "What is the primary architectural purpose of dummy sentinel 'head' and 'tail' nodes in the doubly linked list?",
        options: [
          "To eliminate edge-case branching (checking for None pointers when inserting into an empty list or deleting the only node)",
          "To allocate 1 GB of memory upfront",
          "To prevent multithreading deadlocks",
          "To store telemetry metrics"
        ],
        correctIndex: 0,
        explanation: "Sentinel nodes act as permanent anchors. Every real data node always sits between two valid nodes, making node.prev and node.next non-null and eliminating boundary condition if-statements.",
        difficulty: "easy"
      },
      {
        id: "q-py-proj-4",
        question: "What are the exact time and auxiliary space complexities of the get() and put() operations in this LRU Cache design?",
        options: [
          "Time: O(1) for both get and put; Space: O(Capacity) total auxiliary memory",
          "Time: O(log N) get, O(1) put; Space: O(1)",
          "Time: O(N) get, O(1) put; Space: O(N^2)",
          "Time: O(1) get, O(N) put; Space: O(log N)"
        ],
        correctIndex: 0,
        explanation: "Both get and put perform a constant number of hash lookups and 4 pointer updates, guaranteeing strict O(1) time. The memory footprint is strictly bounded by O(Capacity) entries.",
        difficulty: "easy"
      },
      {
        id: "q-py-proj-5",
        question: "Congratulations on completing all 26 lessons of Intermediate Python & Data Structures! What is the unifying architectural lesson demonstrated across this curriculum?",
        options: [
          "Real-world high-performance software achieves optimal efficiency by composing complementary data structures and algorithms tailored to system access patterns",
          "Avoid writing classes and functions",
          "Always use nested for loops for maximum speed",
          "Python does not require algorithmic optimization"
        ],
        correctIndex: 0,
        explanation: "Mastery of Python data structures, memory architecture, Big O complexity, and object-oriented principles empowers you to engineer scalable, production-ready systems.",
        difficulty: "easy"
      }
    ],
    challenge: {
      title: "Full LRU Cache Engine with Command Stream",
      problemStatement: "Implement the complete LRUCache class with capacity K. Read command stream from stdin: 'PUT key val' or 'GET key'. For each GET command, print the returned integer value (or -1 if missing). At the end of all commands, print the final cache state from LRU to MRU formatted as 'LRU -> [(k1, v1), (k2, v2)]'.",
      inputFormat: "Line 1: capacity K. Subsequent lines: 'PUT k v' or 'GET k'.",
      outputFormat: "One line per GET result, followed by the final order string.",
      constraints: "1 <= K <= 100",
      starterCode: `import sys

class Node:
    def __init__(self, key=0, val=0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.map = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add(self, node):
        node.prev = self.tail.prev
        node.next = self.tail
        self.tail.prev.next = node
        self.tail.prev = node

    def get(self, key: int) -> int:
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)
        self._add(node)
        return node.val

    def put(self, key: int, value: int) -> None:
        if key in self.map:
            self._remove(self.map[key])
        elif len(self.map) >= self.cap:
            lru = self.head.next
            self._remove(lru)
            del self.map[lru.key]
        node = Node(key, value)
        self.map[key] = node
        self._add(node)

    def get_order(self):
        res = []
        curr = self.head.next
        while curr != self.tail:
            res.append((curr.key, curr.val))
            curr = curr.next
        return res

def solve():
    lines = [l.strip() for l in sys.stdin.read().strip().split('\n') if l.strip()]
    if not lines:
        return
    cap = int(lines[0])
    cache = LRUCache(cap)
    for line in lines[1:]:
        parts = line.split()
        cmd = parts[0]
        if cmd == 'PUT':
            cache.put(int(parts[1]), int(parts[2]))
        elif cmd == 'GET':
            print(cache.get(int(parts[1])))
    print(f"LRU -> {cache.get_order()}")

if __name__ == '__main__':
    solve()
`,
      testCases: [
        {
          input: `2
PUT 1 10
PUT 2 20
GET 1
PUT 3 30
GET 2
GET 3`,
          expected_output: `10
-1
30
LRU -> [(1, 10), (3, 30)]`
        }
      ]
    },
    summary: [
      "Mastered dual-structure engineering by uniting Hash Maps (O(1) indexing) and Doubly Linked Lists (O(1) sequential ordering).",
      "Implemented sentinel dummy head and tail nodes to achieve completely branchless, exception-free node insertion and deletion.",
      "Guaranteed strict O(1) time bounds for both get() and put() cache operations under heavy eviction workloads.",
      "Congratulations on completing all 26 lessons of Intermediate Python & Data Structures!"
    ]
  }
];
