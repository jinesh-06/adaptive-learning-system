/**
 * Standalone In-Browser Fallback for GitHub Pages & Offline Evaluation
 * Ensures that when hosted on GitHub Pages (static environment without localhost backend),
 * all features (auth, syllabus, quizzes, code runner simulation, progressive hints, AI tutor,
 * diagnostic test, search, bookmarks, notes, and learning history) work seamlessly with 0 errors!
 */

import platformData from '../data/platformData.json';
import { executeCodeInBrowser } from './pythonRunner';
import { PYTHON_FUNDAMENTALS_TOPICS } from '../data/pythonFundamentalsData';

export const isGitHubPages = typeof window !== 'undefined' && (
  window.location.hostname.includes('github.io') ||
  window.location.protocol === 'file:'
);

// In-browser mock database
const MOCK_STORAGE_KEYS = {
  BOOKMARKS: 'cog_mock_bookmarks',
  NOTES: 'cog_mock_notes',
  HISTORY: 'cog_mock_history',
  PREFS: 'cog_mock_prefs'
};

function getStoredArray(key: string, defaultVal: any[] = []): any[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStoredArray(key: string, val: any[]) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

// Populate projects from platformData
export const mockProjects: any[] = platformData.projects || [];


// Populate courses dynamically from platformData with structured modules and topics
export const mockCourses: any[] = (platformData.courses || []).map((c: any) => {
  const cModules = (platformData.modules || [])
    .filter((m: any) => m.course_id === c.id)
    .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
    .map((m: any) => {
      const mTopics = (platformData.topics || [])
        .filter((t: any) => t.module_id === m.id)
        .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
        .map((t: any, idx: number) => ({
          id: t.id,
          title: t.title,
          level: c.level,
          status: idx === 0 ? 'COMPLETED' : idx === 1 ? 'IN_PROGRESS' : 'LOCKED'
        }));
      return {
        id: m.id,
        title: m.title,
        order: m.order_index || 1,
        topics: mTopics
      };
    });

  return {
    id: c.id,
    language: c.language,
    level: c.level,
    title: c.title,
    description: c.description,
    modules: cModules
  };
});


export const mockTopicDetails: Record<string, any> = {
  'top-py-loops': {
    id: 'top-py-loops',
    course_id: 'course-py-fund',
    language: 'python',
    level: 'beginner',
    title: 'Loops and Iteration Constructs',
    prerequisites: ['top-py-intro'],
    content_standard: 'In Python, iteration is governed primarily by `for` loops (which iterate over sequences) and `while` loops (which repeat while a boolean predicate is True). The `break` keyword terminates a loop prematurely, while `continue` immediately proceeds to the subsequent cycle.',
    syntax: '# Iterating over a sequence\nfor i in range(5):\n    if i == 2:\n        continue\n    print(f"Index: {i}")\n\n# While loop with sentinel\ncount = 0\nwhile count < 3:\n    print(count)\n    count += 1',
    common_mistakes: 'Accidental infinite loops in `while` statements when the termination variable is not incremented inside the block.',
    sections: [
      {
        id: 'sec-1',
        title: '1. For Loops and Iteration Protocols',
        order_index: 1,
        content: 'Python for-loops operate directly over iterables (lists, ranges, tuples). They automate iteration without manual indexing pointer increments.',
        code_snippet: 'for num in [10, 20, 30]:\n    print(num * 2)',
        pitfalls: 'Modifying a list while actively iterating over it causes skipped elements.',
        mini_check: {
          question: 'What happens if you iterate over range(3)?',
          options: ['Produces 0, 1, 2', 'Produces 1, 2, 3', 'Produces 0, 1, 2, 3'],
          correct_index: 0,
          explanation: 'range(3) generates values from 0 up to, but not including, 3.'
        }
      },
      {
        id: 'sec-2',
        title: '2. While Loops & Guard Clauses',
        order_index: 2,
        content: 'While loops evaluate an entry predicate. Ensure your invariant condition advances toward termination every cycle.',
        code_snippet: 'val = 5\nwhile val > 0:\n    print(val)\n    val -= 1',
        pitfalls: 'Omitting the decrement causes an infinite loop and freezes execution.',
        mini_check: {
          question: 'When should you use a while loop over a for loop?',
          options: [
            'When the exact number of iterations is unknown in advance',
            'Always, while loops are faster',
            'Only for floating point numbers'
          ],
          correct_index: 0,
          explanation: 'While loops are ideal when loop termination depends on dynamic runtime conditions rather than a fixed sequence length.'
        }
      }
    ]
  },
  'top-py-functions': {
    id: 'top-py-functions',
    course_id: 'course-py-fund',
    language: 'python',
    level: 'beginner',
    title: 'Functions, Scopes, and Arguments',
    prerequisites: ['top-py-loops'],
    content_standard: 'Functions encapsulate reusable algorithmic procedures using the `def` keyword. Parameters receive caller arguments, and `return` yields outputs back to the caller frame.',
    syntax: 'def greet_user(name: str, greeting: str = "Hello") -> str:\n    """Return personalized greeting string."""\n    return f"{greeting}, {name}!"\n\nmessage = greet_user("Alice")\nprint(message)',
    common_mistakes: 'Using mutable default arguments like `def append_to(val, list=[])`. Mutable defaults are evaluated once and shared across all calls.',
    sections: [
      {
        id: 'sec-fn-1',
        title: '1. Function Definition & Parameter Passing',
        order_index: 1,
        content: 'Functions allow modular decomposition of programs. Parameters can be positional or keyword-based with default fallbacks.',
        code_snippet: 'def calculate_area(length, width=10):\n    return length * width',
        pitfalls: 'Forgetting to return a value causes the function to implicitly evaluate to `None`.'
      },
      {
        id: 'sec-fn-2',
        title: '2. Scope and Stack Frames',
        order_index: 2,
        content: 'Variables created inside a function exist solely within its local stack frame unless explicitly marked as `global`.',
        code_snippet: 'x = 10\ndef modify():\n    x = 20  # Local x shadow\n    return x',
        pitfalls: 'Attempting to read and modify a global variable without the `global` declaration triggers UnboundLocalError.'
      }
    ]
  },
  'top-py-recursion': {
    id: 'top-py-recursion',
    course_id: 'course-py-fund',
    language: 'python',
    level: 'intermediate',
    title: 'Recursion and Recursive Thinking',
    prerequisites: ['top-py-functions'],
    content_standard: 'Recursion is an algorithmic technique where a function calls itself to solve smaller instances of the identical problem, grounded by base cases.',
    syntax: 'def factorial(n: int) -> int:\n    # Base case\n    if n <= 1:\n        return 1\n    # Recursive case\n    return n * factorial(n - 1)\n\nprint(factorial(5))  # Output: 120',
    common_mistakes: 'Forgetting the base case leads to RecursionError (Maximum recursion depth exceeded).',
    sections: [
      {
        id: 'sec-rec-1',
        title: '1. The Base Case: Grounding the Call Stack',
        order_index: 1,
        content: 'Every recursive routine must terminate. The base case stops recursive branching and begins stack frame unwinding.',
        code_snippet: 'def countdown(n):\n    if n <= 0:\n        print("Liftoff!")\n        return\n    print(n)\n    countdown(n - 1)',
        pitfalls: 'Missing or unreachable base cases result in infinite recursion and stack overflow.'
      },
      {
        id: 'sec-rec-2',
        title: '2. The Call Stack Mechanics',
        order_index: 2,
        content: 'Each recursive call pushes a new stack frame containing local variables and return addresses. When base condition fires, frames unwind in LIFO order.',
        code_snippet: 'def sum_range(n):\n    if n <= 1:\n        return n\n    return n + sum_range(n - 1)',
        pitfalls: 'Deep recursion consumes linear stack memory. In Python default limit is 1000 frames.'
      }
    ]
  },
  'top-py-fundamentals': {
    id: 'top-py-fundamentals',
    course_id: 'course-py-fund',
    language: 'python',
    level: 'beginner',
    title: 'Language Fundamentals, Datatypes & Immutability',
    prerequisites: [],
    content_standard: 'Python was created by Guido Van Rossum in 1989 and released in 1991. It is high-level, interpreted, and dynamically typed. All fundamental types (int, float, complex, bool, str) are immutable objects in memory.',
    syntax: 'a = 15\nprint(bin(a)) # 0b1111\nprint(hex(a)) # 0xf\nx = 256; y = 256\nprint(x is y) # True (interning)',
    common_mistakes: 'Using reserved words as variable names (e.g. def = 44 causes SyntaxError). Expecting immutable objects to modify in-place without re-assignment.',
    sections: [
      {
        id: 'sec-py-fund-1',
        title: '1. Python 3 Architecture & Standard Runtime',
        order_index: 1,
        content: 'Python 3 is the modern standard for Python development, executed by the reference CPython 3 interpreter. Guido Van Rossum designed Python with clear syntax, automatic memory management via the Python Virtual Machine (PVM), and rich standard libraries.',
        code_snippet: 'import sys\nprint("Python Version:", sys.version)',
        pitfalls: 'Confusing CPython (standard C-based runtime) with PyPy (JIT accelerated runtime).'
      },
      {
        id: 'sec-py-fund-2',
        title: '2. The 33 Keywords & Identifier Rules',
        order_index: 2,
        content: 'Identifiers allow letters, digits, and underscores, but cannot start with a digit. Only 3 keywords are capitalized: True, False, and None. The other 30 are strictly lowercase.',
        code_snippet: 'import keyword\nprint("Total keywords:", len(keyword.kwlist))\nprint([k for k in keyword.kwlist if k[0].isupper()])',
        pitfalls: 'Starting identifier names with numbers like 1st_var causes invalid syntax.'
      },
      {
        id: 'sec-py-fund-3',
        title: '3. Immutability & Object Interning',
        order_index: 3,
        content: 'All fundamental data types are immutable. Small integers (-5 to 256) are interned so identical values share the exact same object in memory.',
        code_snippet: 'a = 100\nb = 100\nprint("Same object?", a is b) # True\nprint("Same content?", a == b) # True',
        pitfalls: 'Assuming a is b tests equality. == checks value, is checks memory reference.'
      }
    ]
  },
  'top-py-operators-io': {
    id: 'top-py-operators-io',
    course_id: 'course-py-fund',
    language: 'python',
    level: 'beginner',
    title: 'Operators & Dynamic Input/Output Statements',
    prerequisites: ['top-py-fundamentals'],
    content_standard: 'Python supports 7 arithmetic operators including floor division // and exponent **. In Python 3, input() returns string data. Use [int(x) for x in input().split()] to read space-separated values.',
    syntax: 'x, y = [int(n) for n in input().split()]\nprint(f"x={x}, y={y}")\nmin_val = x if x < y else y',
    common_mistakes: 'Multiplying two strings ("a" * "b" raises TypeError). Division by zero (x // 0 raises ZeroDivisionError).',
    sections: [
      {
        id: 'sec-py-op-1',
        title: '1. Division vs Floor Division',
        order_index: 1,
        content: 'Normal division / always returns a float (10 / 2 is 5.0). Floor division // truncates to lowest whole integer (10 // 3 is 3, but 10.0 // 3 is 3.0).',
        code_snippet: 'print("10/2 =", 10/2)   # 5.0\nprint("10//3 =", 10//3) # 3\nprint("10.0//3 =", 10.0//3) # 3.0',
        pitfalls: 'Forgetting that float operands in // return float results (3.0 instead of 3).'
      },
      {
        id: 'sec-py-op-2',
        title: '2. Dynamic Single-Line Input with Unpacking',
        order_index: 2,
        content: 'Read multiple space-separated numbers using split() and list comprehension unpacking in one clean line.',
        code_snippet: 'a, b = [int(x) for x in "10 20".split()]\nprint("Sum is:", a + b)',
        pitfalls: 'Calling int() directly on space-separated string without split() raises ValueError.'
      },
      {
        id: 'sec-py-op-3',
        title: '3. Output Customization: sep and end',
        order_index: 3,
        content: 'The sep keyword defines what character separates arguments; end controls what character prints after the final argument.',
        code_snippet: 'print(10, 20, 30, sep="-", end="***")\nprint(40, 50, sep=":")',
        pitfalls: 'Missing default newline behavior when overriding end parameter.'
      }
    ]
  },
  'top-py-strings': {
    id: 'top-py-strings',
    course_id: 'course-py-fund',
    language: 'python',
    level: 'beginner',
    title: 'In-Depth String Operations, Slicing & Algorithms',
    prerequisites: ['top-py-fundamentals'],
    content_standard: 'Strings are immutable sequences of characters supporting positive and negative indexing. Slicing with step s[begin:end:step] allows stride selection and full reversal with s[::-1].',
    syntax: 's = "karthikeya"\nprint(s[0])    # "k"\nprint(s[-1])   # "a"\nprint(s[2:7])  # "rthik"\nprint(s[::-1]) # reverse',
    common_mistakes: 'Attempting in-place modification: s[0] = "A" raises TypeError. Using s.index() without try-except when substring may not exist.',
    sections: [
      {
        id: 'sec-py-str-1',
        title: '1. Slicing with Step & String Reversal',
        order_index: 1,
        content: 'The slice operator takes [start:stop:step]. With negative step, Python traverses backwards, enabling clean one-line reversal without loops.',
        code_snippet: 'msg = "Python Learning"\nprint(msg[::-1])',
        pitfalls: 'Slice indices never raise IndexError even if out of range, but direct indexing does.'
      },
      {
        id: 'sec-py-str-2',
        title: '2. find() vs index() and count()',
        order_index: 2,
        content: 'find() returns -1 if the substring is missing. index() raises ValueError. count() returns total non-overlapping occurrences.',
        code_snippet: 's = "abcabc"\nprint(s.find("z"))  # -1\nprint(s.count("ab")) # 2',
        pitfalls: 'Using index() assuming it returns -1 on not found like JavaScript.'
      },
      {
        id: 'sec-py-str-3',
        title: '3. Character Testing: isalnum, isalpha, isdigit',
        order_index: 3,
        content: 'Python provides built-in boolean validators to inspect character classes without regex overhead.',
        code_snippet: 'print("A123".isalnum()) # True\nprint("Hello".isalpha()) # True\nprint("99".isdigit())    # True',
        pitfalls: 'Empty strings return False for all isalpha/isdigit checks.'
      }
    ]
  },
  'top-py-tuples-sets': {
    id: 'top-py-tuples-sets',
    course_id: 'course-py-fund',
    language: 'python',
    level: 'intermediate',
    title: 'Tuples and Sets Data Structures',
    prerequisites: ['top-py-loops'],
    content_standard: 'Tuples are immutable ordered sequences ((10, 20)). Sets are mutable, unordered collections of unique elements ({10, 20}). Sets eliminate duplicates and support union, intersection, and difference.',
    syntax: 't = (10, 20, 30)\ns = {10, 20, 30, 20}\nprint("Set deduplicated:", s)\nprint("Union:", {1, 2} | {2, 3})',
    common_mistakes: 'Creating single-element tuple without comma: t = (10) is an int, not a tuple! Must be t = (10,). Indexing a set raises TypeError.',
    sections: [
      {
        id: 'sec-py-ts-1',
        title: '1. Tuples: Immutability & Packing',
        order_index: 1,
        content: 'Tuples prevent accidental data modification. Single valued tuples must terminate with a comma: t = (10,). Tuple packing combines variables; unpacking assigns them back.',
        code_snippet: 't = 10, 20, 30 # packing\nx, y, z = t    # unpacking\nprint("y =", y)',
        pitfalls: 'Writing (10) instead of (10,) creates an int, not a tuple.'
      },
      {
        id: 'sec-py-ts-2',
        title: '2. Sets: Uniqueness & remove vs discard',
        order_index: 2,
        content: 'Sets automatically deduplicate elements. Use discard() when an item might not exist to avoid KeyError crashes.',
        code_snippet: 's = {10, 20, 30}\ns.discard(50) # Safe, no error\n# s.remove(50) would raise KeyError',
        pitfalls: 'Calling remove(x) on missing element crashes with KeyError; use discard(x).'
      },
      {
        id: 'sec-py-ts-3',
        title: '3. Mathematical Set Operations',
        order_index: 3,
        content: 'Perform union (|), intersection (&), difference (-), and symmetric difference (^) with native operators.',
        code_snippet: 'x = {1, 2, 3}\ny = {3, 4, 5}\nprint("Intersection:", x & y)\nprint("Difference:", x - y)',
        pitfalls: 'Set elements must be hashable; attempting to put a list inside a set raises TypeError: unhashable type: \'list\'.'
      }
    ]
  },
  'top-py-modules-regex': {
    id: 'top-py-modules-regex',
    course_id: 'course-py-fund',
    language: 'python',
    level: 'intermediate',
    title: 'Modules, Math, Random & Regular Expressions',
    prerequisites: ['top-py-functions'],
    content_standard: 'Modules group reusable Python code. re provides pattern matching via compile, search, match, and fullmatch with character classes and quantifiers for validation.',
    syntax: 'import re\npattern = r"[6-9]\\d{9}"\nis_valid = bool(re.fullmatch(pattern, "9885768283"))\nprint("Valid phone?", is_valid)',
    common_mistakes: 'Using re.match() instead of re.fullmatch() for complete string validation, which allows trailing garbage characters.',
    sections: [
      {
        id: 'sec-py-mr-1',
        title: '1. Modules, Aliasing & __name__',
        order_index: 1,
        content: 'Every Python file is a module. When executed directly, __name__ == "__main__". Use importlib.reload(module) if a module is modified during a live interactive session.',
        code_snippet: 'import math as m\nprint("Pi:", m.pi)\nprint("Sqrt 16:", m.sqrt(16))',
        pitfalls: 'Circular imports between two modules leading to ImportError.'
      },
      {
        id: 'sec-py-mr-2',
        title: '2. Random Library & OTP Generation',
        order_index: 2,
        content: 'random.randint(0, 9) produces random integers. We can assemble cryptographically sound one-time passwords and shuffle sequences.',
        code_snippet: 'from random import randint\nprint("6-digit OTP:", "".join(str(randint(0, 9)) for _ in range(6)))',
        pitfalls: 'Using choice() on empty sequences raises IndexError.'
      },
      {
        id: 'sec-py-mr-3',
        title: '3. Regular Expressions: re.fullmatch & Classes',
        order_index: 3,
        content: 're.fullmatch() verifies that the entire input satisfies the pattern from start ^ to end $. Use \\d for digits and [6-9] for specific leading ranges.',
        code_snippet: 'import re\nmobile = "9885768283"\nmatch = re.fullmatch(r"[6-9]\\d{9}", mobile)\nprint("Valid Mobile?", match is not None)',
        pitfalls: 'Forgetting raw string prefix r"..." causing backslashes to be swallowed as escape codes.'
      }
    ]
  },
  'top-py-flow-control': {
    id: 'top-py-flow-control',
    course_id: 'course-py-fund',
    language: 'python',
    level: 'beginner',
    title: 'Flow Control, Conditionals & Transfer Statements',
    prerequisites: ['top-py-operators-io'],
    content_standard: 'In Python, flow control statements determine execution paths. Python uses colons and 4-space indentation instead of braces. Transfer statements include break, continue, pass, and del.',
    syntax: 'if condition1:\n    # block 1\nelif condition2:\n    # block 2\nelse:\n    # fallback block\n\nif is_admin:\n    pass\n\nx = 100\ndel x',
    common_mistakes: 'Inconsistent indentation mixing tabs and spaces. Confusing del x (removes variable) with x = None (retains variable with None value).',
    sections: [
      {
        id: 'sec-py-fc-1',
        title: '1. Conditional Branching with if-elif-else',
        order_index: 1,
        content: 'Python uses indentation to demarcate code blocks following an if, elif, or else: header. Evaluation stops at the first branch whose condition is True.',
        code_snippet: 'x = 15\nif x > 20:\n    print("Large")\nelif x > 10:\n    print("Medium")\nelse:\n    print("Small")',
        pitfalls: 'Using = instead of == inside if conditions causes SyntaxError.'
      },
      {
        id: 'sec-py-fc-2',
        title: '2. The pass Statement as a Syntactic Placeholder',
        order_index: 2,
        content: 'pass is a null statement in Python. When executed, nothing happens, but it prevents IndentationError when a statement block is syntactically required.',
        code_snippet: 'def future_function():\n    pass\n\nfor i in range(5):\n    if i == 2:\n        pass\n    print(i)',
        pitfalls: 'Confusing pass (which does nothing) with continue (which skips loop iteration).'
      },
      {
        id: 'sec-py-fc-3',
        title: '3. del Statement vs None Assignment',
        order_index: 3,
        content: 'del x removes the variable name x entirely from the local/global namespace. In contrast, x = None retains the name, simply referencing the singleton None object.',
        code_snippet: 'a = 10\na = None # a still exists\nprint(a) # None\n\nb = 20\ndel b # b is destroyed',
        pitfalls: 'Calling del on a variable does not necessarily delete the object immediately if another reference still points to it.'
      }
    ]
  },
  'top-py-lists': {
    id: 'top-py-lists',
    course_id: 'course-py-fund',
    language: 'python',
    level: 'intermediate',
    title: 'List Data Structure, Matrices & Comprehensions',
    prerequisites: ['top-py-strings'],
    content_standard: 'Lists are mutable ordered collections supporting dynamic resizing. Aliasing (b = a) shares references, whereas cloning (b = a[:] or a.copy()) creates independent copies. List comprehensions provide concise filtering and transformation.',
    syntax: 'nums = [1, 2, 3]\nnums.append(4)\nnums.extend([5, 6])\nclone = nums[:]\nmatrix = [[1, 2], [3, 4]]\nsquares = [x**2 for x in range(1, 6) if x % 2 != 0]',
    common_mistakes: 'Modifying aliased lists assuming they are independent copies. Calling sort() and expecting a return value (lst.sort() modifies in place and returns None).',
    sections: [
      {
        id: 'sec-py-list-1',
        title: '1. Adding & Removing Elements: append vs extend',
        order_index: 1,
        content: 'append(x) inserts x as a single object at the end of the list. extend(iterable) iterates through iterable and appends each element individually.',
        code_snippet: 'a = [1, 2]\na.append([3, 4]) # [1, 2, [3, 4]]\nb = [1, 2]\nb.extend([3, 4]) # [1, 2, 3, 4]',
        pitfalls: 'Using append when extend was needed results in unwanted nested lists.'
      },
      {
        id: 'sec-py-list-2',
        title: '2. Aliasing vs Cloning: The Shallow Copy Trap',
        order_index: 2,
        content: 'Aliasing (y = x) assigns the same object reference. To modify a list without mutating the original, clone it via slicing x[:] or x.copy().',
        code_snippet: 'x = [10, 20]\ny = x\nz = x.copy()\nx[0] = 99\nprint("y[0]:", y[0]) # 99\nprint("z[0]:", z[0]) # 10',
        pitfalls: 'Using = for copying mutable lists shares the same memory reference.'
      },
      {
        id: 'sec-py-list-3',
        title: '3. 2D Matrices & List Comprehensions',
        order_index: 3,
        content: 'List comprehensions [expr for item in seq if cond] replace multi-line loops with fast, expressive syntax.',
        code_snippet: 'evens = [x for x in range(10) if x % 2 == 0]\nmatrix = [[1, 2], [3, 4]]\nflat = [val for row in matrix for val in row]',
        pitfalls: 'Deeply nested list comprehensions hurt readability; limit to at most 2 nested loops.'
      }
    ]
  },
  'top-py-dictionaries': {
    id: 'top-py-dictionaries',
    course_id: 'course-py-fund',
    language: 'python',
    level: 'intermediate',
    title: 'Dictionary Data Structure & Hash Tables',
    prerequisites: ['top-py-tuples-sets'],
    content_standard: 'Dictionaries store key-value associations backed by hash tables with O(1) average lookup. Keys must be hashable and unique. Use get(k, default) to avoid KeyError.',
    syntax: 'd = {"apple": 5, "banana": 3}\nprint(d.get("orange", 0))\nd["orange"] = 7\nfor k, v in d.items():\n    print(f"{k}: {v}")',
    common_mistakes: 'Using a mutable list as a dictionary key (d[[1, 2]] = "val" raises TypeError: unhashable type). Using d[k] when k might not exist instead of d.get(k).',
    sections: [
      {
        id: 'sec-py-dict-1',
        title: '1. Keys, Values & Hashability Rules',
        order_index: 1,
        content: 'Dictionary keys must be immutable and hashable (integers, strings, floats, tuples). Values can be of any type, including mutable lists or nested dictionaries.',
        code_snippet: 'd = {1: "one", "pi": 3.14, (0, 0): "origin"}\nprint(d[(0, 0)]) # "origin"',
        pitfalls: 'Attempting to use a list or set as a dict key raises TypeError: unhashable type.'
      },
      {
        id: 'sec-py-dict-2',
        title: '2. Safe Lookups & Methods: get, setdefault, pop',
        order_index: 2,
        content: 'get(key, default) returns the default value without raising KeyError if the key is missing. setdefault(key, val) returns current value, or sets and returns val if missing.',
        code_snippet: 'scores = {"Alice": 95}\nprint(scores.get("Bob", 0)) # 0\nscores.setdefault("Bob", 80)\nprint(scores["Bob"]) # 80',
        pitfalls: 'Calling pop(k) without default when k is absent raises KeyError.'
      },
      {
        id: 'sec-py-dict-3',
        title: '3. Frequency Counting & Dict Comprehensions',
        order_index: 3,
        content: 'The idiom d[x] = d.get(x, 0) + 1 builds frequency maps in O(N) time. Dict comprehensions {k: v for ...} construct mappings declaratively.',
        code_snippet: 'squares = {x: x**2 for x in range(1, 6)}\nprint(squares)',
        pitfalls: 'Forgetting to call .items() when iterating over both keys and values.'
      }
    ]
  }
};

// Populate additional topics from platformData
(platformData.topics || []).forEach((t: any) => {
  if (!mockTopicDetails[t.id]) {
    mockTopicDetails[t.id] = t;
  }
});

export const mockQuizzes: Record<string, any[]> = {

  'top-py-loops': [
    {
      id: 'mcq-py-loop-1',
      question: 'What is the output of `for i in range(1, 4): print(i, end=" ")`?',
      options: ['1 2 3 4', '1 2 3', '0 1 2 3', '1 4'],
      correct_index: 1,
      difficulty: 'easy',
      explanation: 'range(1, 4) starts at 1 and stops before 4, yielding 1, 2, and 3.'
    },
    {
      id: 'mcq-py-loop-2',
      question: 'Which statement immediately exits the innermost active loop in Python?',
      options: ['continue', 'break', 'pass', 'return'],
      correct_index: 1,
      difficulty: 'easy',
      explanation: '`break` immediately terminates the nearest enclosing loop.'
    },
    {
      id: 'mcq-py-loop-3',
      question: 'What is the danger of a while loop without an invariant update step?',
      options: ['SyntaxError', 'Infinite loop', 'Automatic garbage collection', 'Memory defragmentation'],
      correct_index: 1,
      difficulty: 'medium',
      explanation: 'Without updating loop state variables, the condition stays true indefinitely.'
    }
  ],
  'top-py-functions': [
    {
      id: 'mcq-py-fn-1',
      question: 'What keyword introduces a function definition in Python?',
      options: ['function', 'def', 'fn', 'fun'],
      correct_index: 1,
      difficulty: 'easy',
      explanation: '`def` is the Python keyword for defining functions.'
    },
    {
      id: 'mcq-py-fn-2',
      question: 'What does a function return if no explicit `return` statement is reached?',
      options: ['0', 'None', 'False', 'Undefined'],
      correct_index: 1,
      difficulty: 'medium',
      explanation: 'In Python, functions implicitly return `None` upon reaching the end of the body.'
    }
  ],
  'top-py-recursion': [
    {
      id: 'mcq-py-rec-1',
      question: 'What essential component halts recursive descent and starts stack unwinding?',
      options: ['Guard Clause', 'Base Case', 'Static Pointer', 'Break Statement'],
      correct_index: 1,
      difficulty: 'easy',
      explanation: 'The base case provides a direct answer without further recursive invocations.'
    },
    {
      id: 'mcq-py-rec-2',
      question: 'What exception is thrown when a Python recursive function exceeds the maximum frame limit?',
      options: ['StackOverflowError', 'RecursionError', 'MemoryLimitException', 'SegmentationFault'],
      correct_index: 1,
      difficulty: 'medium',
      explanation: 'Python raises `RecursionError: maximum recursion depth exceeded`.'
    }
  ],
  'top-py-fundamentals': [
    {
      id: 'mcq-py-fund-1',
      question: 'Out of the 33 reserved keywords in Python, how many begin with an uppercase letter?',
      options: [
        'None of them (all 33 are strictly lowercase)',
        'Exactly 3: True, False, and None',
        '5 keywords: True, False, None, Class, and Def',
        'All 33 keywords start with uppercase letters'
      ],
      correct_index: 1,
      difficulty: 'easy',
      explanation: 'In Python, only True, False, and None begin with capital letters. All other 30 keywords are entirely lowercase.'
    },
    {
      id: 'mcq-py-fund-2',
      question: 'What happens in Python when evaluating `a = 10; b = 10; a is b`?',
      options: [
        'Returns False because two separate variables always get distinct memory addresses',
        'Returns True because Python interns small integers (-5 to 256) to point to the exact same object',
        'Raises a SyntaxError because `is` cannot be applied to integers',
        'Returns 0'
      ],
      correct_index: 1,
      difficulty: 'medium',
      explanation: 'Python uses object interning for small integers (-5 to 256). Both references point to the identical memory address, so `a is b` returns True.'
    }
  ],
  'top-py-operators-io': [
    {
      id: 'mcq-py-op-1',
      question: 'What is the value and type of `10.0 // 3` in Python 3?',
      options: ['3 (int)', '3.0 (float)', '3.3333333333333335 (float)', 'Raises TypeError'],
      correct_index: 1,
      difficulty: 'easy',
      explanation: 'Floor division `//` returns the floor value. If at least one operand is a float, the result is always a float (`3.0`).'
    },
    {
      id: 'mcq-py-op-2',
      question: 'What is the output of print("karthi" * False)?',
      options: ['"karthi0"', 'An empty string (prints nothing)', 'Raises TypeError', 'None'],
      correct_index: 1,
      difficulty: 'medium',
      explanation: 'In Python, False has integer value 0. Multiplying a string by 0 repeats it 0 times, returning an empty string.'
    }
  ],
  'top-py-strings': [
    {
      id: 'mcq-py-str-1',
      question: 'What does the slice expression `s[::-1]` evaluate to for any string `s`?',
      options: [
        'Returns the first character',
        'Reverses the entire string backwards',
        'Raises an IndexError: step cannot be negative',
        'Returns an empty string'
      ],
      correct_index: 1,
      difficulty: 'easy',
      explanation: 'A step of -1 in slicing tells Python to traverse the sequence in reverse direction from end to start, reversing the string.'
    },
    {
      id: 'mcq-py-str-2',
      question: 'What is the difference between `s.find("abc")` and `s.index("abc")` when "abc" is absent from `s`?',
      options: [
        '`find()` raises a ValueError, while `index()` returns -1',
        '`find()` returns -1, while `index()` raises a ValueError',
        'Both methods return None',
        'Both methods raise an IndexError'
      ],
      correct_index: 1,
      difficulty: 'medium',
      explanation: 'In Python, `find()` returns -1 when the substring is not found, while `index()` raises a `ValueError` exception.'
    }
  ],
  'top-py-tuples-sets': [
    {
      id: 'mcq-py-ts-1',
      question: 'What is the data type of the expression `t = (10)` vs `t = (10,)` in Python?',
      options: [
        'Both are tuples',
        '`t = (10)` is int, while `t = (10,)` is tuple',
        '`t = (10)` is tuple, while `t = (10,)` is syntax error',
        'Both are integers'
      ],
      correct_index: 1,
      difficulty: 'easy',
      explanation: 'A single value enclosed in parentheses without a trailing comma is evaluated as a normal parenthesized expression (int). A trailing comma is required to create a 1-tuple.'
    },
    {
      id: 'mcq-py-ts-2',
      question: 'What happens when calling `s.remove(50)` vs `s.discard(50)` on a set `s = {10, 20}` where 50 is NOT present?',
      options: [
        '`remove()` raises a KeyError, whereas `discard()` does nothing and raises no error',
        '`discard()` raises a KeyError, whereas `remove()` returns False',
        'Both methods raise ValueError',
        'Both methods automatically add 50 to the set'
      ],
      correct_index: 0,
      difficulty: 'medium',
      explanation: '`remove(x)` raises a `KeyError` if element x is missing from the set. `discard(x)` safely removes x if present, or silently does nothing if absent.'
    }
  ],
  'top-py-modules-regex': [
    {
      id: 'mcq-py-reg-1',
      question: 'Which regex function verifies that the ENTIRE input string matches the specified pattern from beginning to end?',
      options: ['re.match()', 're.search()', 're.fullmatch()', 're.findall()'],
      correct_index: 2,
      difficulty: 'easy',
      explanation: '`re.fullmatch()` requires the entire target string to match the regex pattern. `re.match()` only checks if the pattern matches at the beginning.'
    },
    {
      id: 'mcq-py-reg-2',
      question: 'Which regular expression pattern correctly validates a 10-digit Indian mobile number starting with 6, 7, 8, or 9?',
      options: [
        '[0-9]{10}',
        '[6-9]\\d{9}',
        '[6789][0-9]{10}',
        '\\d{10}'
      ],
      correct_index: 1,
      difficulty: 'medium',
      explanation: '`[6-9]` validates that the first digit is 6, 7, 8, or 9, followed by `\\d{9}` (exactly 9 more digits), making a total of 10 digits.'
    },
    {
      id: 'mcq-py-reg-3',
      question: 'In the Python `re` module, what is the difference between `re.match()` and `re.search()`?',
      options: [
        '`match()` searches anywhere in the string, while `search()` matches only at the start',
        '`match()` checks for a match only at the beginning of the string, while `search()` scans through the entire string for the first match',
        'There is zero difference',
        '`match()` returns a list while `search()` returns a boolean'
      ],
      correct_index: 1,
      difficulty: 'hard',
      explanation: '`re.match()` only checks if the pattern matches at the beginning of the string. `re.search()` scans through the entire string to find the first location where the pattern matches.'
    }
  ],
  'top-py-flow-control': [
    {
      id: 'mcq-py-fc-1',
      question: 'What is the purpose of the `pass` statement in Python?',
      options: [
        'Terminates program execution immediately',
        'Acts as a syntactic null placeholder (does nothing)',
        'Skips the current loop iteration',
        'Raises a PassException'
      ],
      correct_index: 1,
      difficulty: 'easy',
      explanation: '`pass` is a syntactic no-op null statement used when a statement is required syntactically but no code needs to execute.'
    },
    {
      id: 'mcq-py-fc-2',
      question: 'What is the key difference between `del x` and `x = None` in Python?',
      options: [
        '`del x` unbinds the variable name from namespace entirely, while `x = None` rebinds the variable to the None object',
        '`del x` sets x to 0, while `x = None` causes a SyntaxError',
        'Both statements perform the exact same operation',
        '`x = None` deletes the variable from memory while `del x` does not'
      ],
      correct_index: 0,
      difficulty: 'medium',
      explanation: '`del x` deletes the variable name itself from the namespace (accessing x afterwards raises NameError). `x = None` retains the name and points it to the singleton None object.'
    },
    {
      id: 'mcq-py-fc-3',
      question: 'Which of the following control structures does NOT exist in standard Python 3.8 and earlier?',
      options: [
        'while-else construct',
        'switch-case and do-while statements',
        'nested if-elif-else',
        'for-in iteration'
      ],
      correct_index: 1,
      difficulty: 'hard',
      explanation: 'Standard Python does not have `switch-case` (until match-case in 3.10) or `do-while` loop constructs.'
    }
  ],
  'top-py-lists': [
    {
      id: 'mcq-py-list-1',
      question: 'What is the output of `a = [1, 2]; a.append([3, 4]); print(len(a))`?',
      options: ['4', '3', '2', 'Raises TypeError'],
      correct_index: 1,
      difficulty: 'easy',
      explanation: '`append([3, 4])` appends the nested list as a single 3rd element: `[1, 2, [3, 4]]`, so `len(a)` is 3. To unpack, `extend()` is used.'
    },
    {
      id: 'mcq-py-list-2',
      question: 'If `l1 = [10, 20]` and `l2 = l1`, what happens when you execute `l1[0] = 99`?',
      options: [
        'Only l1[0] becomes 99 because assignments copy by value',
        'Both l1[0] and l2[0] become 99 because l2 is an alias referencing the same memory object',
        'Python raises an UnboundAssignmentError',
        'l2 is automatically deleted'
      ],
      correct_index: 1,
      difficulty: 'medium',
      explanation: 'Assignment `l2 = l1` creates an alias (both reference identical memory address). Mutating `l1` in-place alters `l2` as well.'
    },
    {
      id: 'mcq-py-list-3',
      question: 'Which syntax creates a true independent clone (shallow copy) of a list `l1`?',
      options: [
        '`l2 = l1[:]` or `l2 = l1.copy()`',
        '`l2 = l1`',
        '`l2 = list.clone(l1)`',
        '`l2 = l1.duplicate()`'
      ],
      correct_index: 0,
      difficulty: 'hard',
      explanation: 'Both slice notation `l1[:]` and the `.copy()` method create a shallow clone with independent memory from the original list.'
    }
  ],
  'top-py-dictionaries': [
    {
      id: 'mcq-py-dict-1',
      question: 'Why does `d = {}; d[[1, 2]] = "data"` raise a TypeError?',
      options: [
        'Dictionaries do not allow bracket notation',
        'Lists are mutable and unhashable, making them invalid as dictionary keys',
        'Dictionaries can only hold string keys',
        'Square brackets are reserved for tuples'
      ],
      correct_index: 1,
      difficulty: 'easy',
      explanation: 'Dictionary keys must be hashable and immutable (integers, strings, floats, tuples). Lists are mutable, so Python raises `TypeError: unhashable type: \'list\'`.'
    },
    {
      id: 'mcq-py-dict-2',
      question: 'What is the safe idiom to look up a key `k` in dictionary `d` with a fallback 0 if missing?',
      options: ['d[k] or 0', 'd.get(k, 0)', 'd.find(k, 0)', 'd.lookup(k, 0)'],
      correct_index: 1,
      difficulty: 'medium',
      explanation: '`d.get(key, default)` safely returns default if the key is missing instead of raising a KeyError.'
    },
    {
      id: 'mcq-py-dict-3',
      question: 'What does `d.setdefault("count", 0)` do if "count" does NOT exist in `d`?',
      options: [
        'Raises a KeyError',
        'Returns None without modifying d',
        'Inserts "count": 0 into d and returns 0',
        'Returns True'
      ],
      correct_index: 2,
      difficulty: 'hard',
      explanation: '`setdefault(key, default)` checks for key existence; if absent, it inserts `key: default` and returns `default`.'
    }
  ]
};

// Populate additional quizzes from platformData
(platformData.mcq_questions || []).forEach((q: any) => {
  if (!mockQuizzes[q.topic_id]) {
    mockQuizzes[q.topic_id] = [];
  }
  if (!mockQuizzes[q.topic_id].some((existing: any) => existing.id === q.id)) {
    mockQuizzes[q.topic_id].push(q);
  }
});

export const mockCodingChallenges: Record<string, any> = {
  'top-py-loops': {
    id: 'code-py-sum-even',
    topic_id: 'top-py-loops',
    title: 'Sum of Even Numbers in Range',
    difficulty: 'easy',
    problem_statement: 'Write a program that takes an integer N from standard input and prints the sum of all positive even integers from 1 up to and including N.',
    input_format: 'A single positive integer N',
    output_format: 'A single integer representing the sum',
    constraints: '1 <= N <= 1000',
    starter_code: {
      python: 'import sys\n\ndef sum_even(n: int) -> int:\n    # Write your solution here\n    total = 0\n    for i in range(2, n + 1, 2):\n        total += i\n    return total\n\nif __name__ == "__main__":\n    raw = sys.stdin.read().strip()\n    if raw:\n        print(sum_even(int(raw)))\n'
    },
    test_cases: [
      { input: '6', expected_output: '12' },
      { input: '10', expected_output: '30' }
    ]
  },
  'top-py-recursion': {
    id: 'code-py-factorial',
    topic_id: 'top-py-recursion',
    title: 'Recursive Factorial Engine',
    difficulty: 'medium',
    problem_statement: 'Implement a recursive function `factorial(n)` that returns n! for any non-negative integer n.',
    input_format: 'A single integer N',
    output_format: 'The factorial of N',
    constraints: '0 <= N <= 15',
    starter_code: {
      python: 'import sys\n\ndef factorial(n: int) -> int:\n    # Base case\n    if n <= 1:\n        return 1\n    # Recursive case\n    return n * factorial(n - 1)\n\nif __name__ == "__main__":\n    raw = sys.stdin.read().strip()\n    if raw:\n        print(factorial(int(raw)))\n'
    },
    test_cases: [
      { input: '5', expected_output: '120' },
      { input: '0', expected_output: '1' }
    ]
  },
  'top-py-operators-io': {
    id: 'code-py-min-ternary',
    topic_id: 'top-py-operators-io',
    title: 'Find Minimum of 3 Numbers with Ternary Operator',
    difficulty: 'easy',
    problem_statement: 'Read 3 space-separated integers A, B, and C from standard input and print the minimum value using a nested ternary conditional operator.',
    input_format: 'A single line containing three space-separated integers.',
    output_format: 'The minimum integer.',
    constraints: '-10^6 <= A, B, C <= 10^6',
    starter_code: {
      python: 'import sys\n\ndef solve():\n    raw = sys.stdin.read().strip()\n    if not raw:\n        return\n    a, b, c = [int(x) for x in raw.split()]\n    # TODO: Calculate minimum using nested ternary operator\n    min_val = a if a < b and a < c else b if b < c else c\n    print(min_val)\n\nif __name__ == "__main__":\n    solve()\n'
    },
    test_cases: [
      { input: '10 20 5', expected_output: '5' },
      { input: '30 10 20', expected_output: '10' }
    ]
  },
  'top-py-strings': {
    id: 'code-py-str-merge',
    topic_id: 'top-py-strings',
    title: 'Alternate String Character Merger',
    difficulty: 'medium',
    problem_statement: 'Read two space-separated strings s1 and s2 from standard input. Merge them by taking characters alternately. If one string is longer than the other, append the remaining characters to the end.',
    input_format: 'Two space-separated strings on a single line.',
    output_format: 'The merged string.',
    constraints: '1 <= len(s1), len(s2) <= 500',
    starter_code: {
      python: 'import sys\n\ndef merge_alternate(s1: str, s2: str) -> str:\n    output = []\n    i, j = 0, 0\n    while i < len(s1) or j < len(s2):\n        if i < len(s1):\n            output.append(s1[i])\n            i += 1\n        if j < len(s2):\n            output.append(s2[j])\n            j += 1\n    return "".join(output)\n\nif __name__ == "__main__":\n    parts = sys.stdin.read().strip().split()\n    if len(parts) >= 2:\n        print(merge_alternate(parts[0], parts[1]))\n'
    },
    test_cases: [
      { input: 'karthi sahasra', expected_output: 'ksaarhtahsira' },
      { input: 'abc 12345', expected_output: 'a1b2c345' }
    ]
  },
  'top-py-tuples-sets': {
    id: 'code-py-dedup-list',
    topic_id: 'top-py-tuples-sets',
    title: 'Order-Preserving List Deduplication',
    difficulty: 'easy',
    problem_statement: 'Read space-separated integers from stdin and print the sequence with all duplicates removed while strictly preserving the original first-occurrence order.',
    input_format: 'A single line of space-separated integers.',
    output_format: 'Space-separated integers with duplicates eliminated.',
    constraints: '1 <= count <= 1000',
    starter_code: {
      python: 'import sys\n\ndef solve():\n    raw = sys.stdin.read().strip()\n    if not raw:\n        return\n    nums = [int(x) for x in raw.split()]\n    seen = set()\n    result = []\n    for x in nums:\n        if x not in seen:\n            seen.add(x)\n            result.append(x)\n    print(" ".join(str(x) for x in result))\n\nif __name__ == "__main__":\n    solve()\n'
    },
    test_cases: [
      { input: '10 20 30 10 20 40', expected_output: '10 20 30 40' },
      { input: '5 5 5 5', expected_output: '5' }
    ]
  },
  'top-py-modules-regex': {
    id: 'code-py-mobile-regex',
    topic_id: 'top-py-modules-regex',
    title: 'Mobile Number Regular Expression Validator',
    difficulty: 'medium',
    problem_statement: 'Read a mobile number string from standard input. Print "VALID" if it contains exactly 10 digits and starts with 6, 7, 8, or 9 (optional leading 0 or +91 prefix is also accepted). Otherwise print "INVALID".',
    input_format: 'A single line containing the candidate phone number string.',
    output_format: '"VALID" or "INVALID".',
    constraints: '1 <= string length <= 20',
    starter_code: {
      python: 'import sys\nimport re\n\ndef validate_phone(number: str) -> bool:\n    pattern = r"(\\+91|0)?[6-9]\\d{9}"\n    return bool(re.fullmatch(pattern, number))\n\nif __name__ == "__main__":\n    raw = sys.stdin.read().strip()\n    print("VALID" if validate_phone(raw) else "INVALID")\n'
    },
    test_cases: [
      { input: '9885768283', expected_output: 'VALID' },
      { input: '+917485920584', expected_output: 'VALID' },
      { input: '5543210987', expected_output: 'INVALID' }
    ]
  },
  'top-py-fundamentals': {
    id: 'code-py-base-conversion',
    topic_id: 'top-py-fundamentals',
    title: 'Integer Base Conversion & Identity Inspector',
    difficulty: 'easy',
    problem_statement: 'Read a single non-negative decimal integer N from standard input. Output its binary (using bin()), octal (using oct()), and hexadecimal (using hex()) representations on a single line separated by spaces.',
    input_format: 'A single non-negative integer N.',
    output_format: 'Three space-separated strings: binary, octal, and hexadecimal representations.',
    constraints: '0 <= N <= 10^9',
    starter_code: {
      python: 'import sys\n\ndef solve():\n    raw = sys.stdin.read().strip()\n    if not raw:\n        return\n    n = int(raw)\n    print(f"{bin(n)} {oct(n)} {hex(n)}")\n\nif __name__ == "__main__":\n    solve()\n'
    },
    test_cases: [
      { input: '15', expected_output: '0b1111 0o17 0xf' },
      { input: '0', expected_output: '0b0 0o0 0x0' },
      { input: '255', expected_output: '0b11111111 0o377 0xff' }
    ]
  },
  'top-py-flow-control': {
    id: 'code-py-pattern-triangle',
    topic_id: 'top-py-flow-control',
    title: 'Right-Angled Number Triangle Generator',
    difficulty: 'easy',
    problem_statement: 'Read an integer N (1 <= N <= 9) from stdin and print a right-angled number triangle with N rows, where row i contains the number i repeated i times separated by a space.',
    input_format: 'A single integer N.',
    output_format: 'N lines representing the number triangle.',
    constraints: '1 <= N <= 9',
    starter_code: {
      python: 'import sys\n\ndef print_pattern(n: int):\n    for i in range(1, n + 1):\n        print(" ".join([str(i)] * i))\n\nif __name__ == "__main__":\n    raw = sys.stdin.read().strip()\n    if raw:\n        print_pattern(int(raw))\n'
    },
    test_cases: [
      { input: '4', expected_output: '1\n2 2\n3 3 3\n4 4 4 4' },
      { input: '1', expected_output: '1' }
    ]
  },
  'top-py-lists': {
    id: 'code-py-matrix-transpose',
    topic_id: 'top-py-lists',
    title: 'Matrix Transpose via List Comprehension',
    difficulty: 'medium',
    problem_statement: 'Read input where the first line gives R (rows) and C (columns), followed by R lines of C space-separated integers. Print the transposed matrix (C rows with R integers each) using list comprehension.',
    input_format: 'Line 1: R and C. Next R lines: C space-separated integers.',
    output_format: 'C lines of R space-separated integers representing the transposed matrix.',
    constraints: '1 <= R, C <= 50',
    starter_code: {
      python: 'import sys\n\ndef solve():\n    lines = sys.stdin.read().strip().split("\\n")\n    if not lines or not lines[0]:\n        return\n    r, c = [int(x) for x in lines[0].split()]\n    matrix = []\n    for i in range(1, r + 1):\n        matrix.append([int(x) for x in lines[i].split()])\n    transposed = [[matrix[i][j] for i in range(r)] for j in range(c)]\n    for row in transposed:\n        print(" ".join(str(x) for x in row))\n\nif __name__ == "__main__":\n    solve()\n'
    },
    test_cases: [
      { input: '2 3\n1 2 3\n4 5 6', expected_output: '1 4\n2 5\n3 6' },
      { input: '2 2\n10 20\n30 40', expected_output: '10 30\n20 40' }
    ]
  },
  'top-py-dictionaries': {
    id: 'code-py-word-frequency',
    topic_id: 'top-py-dictionaries',
    title: 'Word Frequency Counter using Dictionary',
    difficulty: 'medium',
    problem_statement: 'Read a line of words from standard input. Count the frequency of each unique word (case-insensitive) and print each word and its count in alphabetical order formatted as "word: count".',
    input_format: 'A single line containing space-separated words.',
    output_format: 'Alphabetically sorted lines in format "word: count".',
    constraints: '1 <= word count <= 500',
    starter_code: {
      python: 'import sys\n\ndef solve():\n    raw = sys.stdin.read().strip()\n    if not raw:\n        return\n    words = raw.lower().split()\n    freq = {}\n    for w in words:\n        freq[w] = freq.get(w, 0) + 1\n    for w in sorted(freq.keys()):\n        print(f"{w}: {freq[w]}")\n\nif __name__ == "__main__":\n    solve()\n'
    },
    test_cases: [
      { input: 'apple banana apple Orange banana apple', expected_output: 'apple: 3\nbanana: 2\norange: 1' },
      { input: 'to be or not to be', expected_output: 'be: 2\nnot: 1\nor: 1\nto: 2' }
    ]
  },
  'top-py-functions': {
    id: 'code-py-palindrome',
    topic_id: 'top-py-functions',
    title: 'Palindrome Validator',
    difficulty: 'medium',
    problem_statement: 'Read a string from stdin and determine if it is a palindrome (reads the same forward and backwards), ignoring case and non-alphanumeric characters. Print "TRUE" or "FALSE".',
    input_format: 'A single line containing an input string.',
    output_format: '"TRUE" or "FALSE".',
    constraints: '1 <= string length <= 1000',
    starter_code: {
      python: 'import sys\n\ndef is_palindrome(s: str) -> bool:\n    cleaned = "".join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]\n\nif __name__ == "__main__":\n    text = sys.stdin.read().strip()\n    print("TRUE" if is_palindrome(text) else "FALSE")\n'
    },
    test_cases: [
      { input: 'A man, a plan, a canal: Panama', expected_output: 'TRUE' },
      { input: 'race a car', expected_output: 'FALSE' }
    ]
  }
};

// Populate coding challenges from verified platformData
(platformData.coding_questions || []).forEach((cq: any) => {
  mockCodingChallenges[cq.topic_id] = cq;
});

// Populate all 16 Python Fundamentals curriculum topics into mock details, quizzes, and coding challenges
PYTHON_FUNDAMENTALS_TOPICS.forEach((pyTopic) => {
  mockTopicDetails[pyTopic.id] = {
    id: pyTopic.id,
    course_id: 'py-beg',
    language: 'python',
    level: pyTopic.difficulty.toLowerCase(),
    title: pyTopic.title,
    prerequisites: pyTopic.prerequisiteId ? [pyTopic.prerequisiteId] : [],
    content_standard: pyTopic.conceptExplanation,
    syntax: pyTopic.syntax,
    common_mistakes: pyTopic.commonMistakes.map(m => `${m.mistake}: ${m.correction}. ${m.explanation}`).join('\n\n'),
    sections: [
      {
        id: `${pyTopic.id}-sec-1`,
        title: `1. Concept: ${pyTopic.title}`,
        order_index: 1,
        content: pyTopic.conceptExplanation,
        code_snippet: pyTopic.simpleExample.code,
        pitfalls: pyTopic.simpleExample.explanation,
        mini_check: pyTopic.quiz[0] ? {
          question: pyTopic.quiz[0].question,
          options: pyTopic.quiz[0].options,
          correct_index: pyTopic.quiz[0].correctIndex,
          explanation: pyTopic.quiz[0].explanation
        } : undefined
      },
      {
        id: `${pyTopic.id}-sec-2`,
        title: `2. Syntax & Mechanics`,
        order_index: 2,
        content: pyTopic.stepByStep.join('\n\n'),
        code_snippet: pyTopic.codeExample,
        pitfalls: pyTopic.commonMistakes[0]?.explanation || 'Review syntax carefully before execution.',
        mini_check: pyTopic.quiz[1] ? {
          question: pyTopic.quiz[1].question,
          options: pyTopic.quiz[1].options,
          correct_index: pyTopic.quiz[1].correctIndex,
          explanation: pyTopic.quiz[1].explanation
        } : undefined
      },
      {
        id: `${pyTopic.id}-sec-3`,
        title: `3. Real-World Application`,
        order_index: 3,
        content: `${pyTopic.realWorldExample.scenario}\n\n${pyTopic.realWorldExample.explanation}`,
        code_snippet: pyTopic.realWorldExample.code,
        pitfalls: 'Test edge cases with dynamic input.',
        mini_check: pyTopic.quiz[2] ? {
          question: pyTopic.quiz[2].question,
          options: pyTopic.quiz[2].options,
          correct_index: pyTopic.quiz[2].correctIndex,
          explanation: pyTopic.quiz[2].explanation
        } : undefined
      }
    ]
  };

  mockQuizzes[pyTopic.id] = pyTopic.quiz.map((q) => ({
    id: q.id,
    question: q.question,
    code_snippet: q.codeSnippet,
    options: q.options,
    correct_index: q.correctIndex,
    difficulty: q.difficulty || 'medium',
    explanation: q.explanation
  }));

  mockCodingChallenges[pyTopic.id] = {
    id: `code-${pyTopic.id}`,
    topic_id: pyTopic.id,
    title: `${pyTopic.title} Practice Challenge`,
    difficulty: pyTopic.difficulty.toLowerCase(),
    problem_statement: pyTopic.practice.prompt,
    input_format: 'Standard Python input.',
    output_format: 'Clean console output.',
    constraints: 'Standard runtime constraints.',
    starter_code: {
      python: pyTopic.practice.starterCode
    },
    test_cases: [
      {
        input: '',
        expected_output: pyTopic.practice.expectedOutputMatcher
      }
    ]
  };
});


export const mockDiagnosticQuestions = [
  {
    id: 'diag-1',
    category: 'concept',
    question: 'What is the output of `type(5 / 2)` in Python 3?',
    options: ['<class \'int\'>', '<class \'float\'>', '<class \'double\'>', '<class \'number\'>'],
    correct_index: 1,
    explanation: 'In Python 3, single slash division always returns a float (2.5).'
  },
  {
    id: 'diag-2',
    category: 'concept',
    question: 'Which of the following data structures is immutable in Python?',
    options: ['List', 'Dictionary', 'Tuple', 'Set'],
    correct_index: 2,
    explanation: 'Tuples cannot be modified after instantiation.'
  },
  {
    id: 'diag-3',
    category: 'problem_solving',
    question: 'What will this loop output?\nfor x in [1, 2, 3]:\n    if x == 2:\n        continue\n    print(x, end=" ")',
    options: ['1 2 3', '1 3', '2 3', '1 2'],
    correct_index: 1,
    explanation: 'When x == 2, continue skips the rest of the loop block.'
  },
  {
    id: 'diag-4',
    category: 'problem_solving',
    question: 'What is the average lookup time for a key in a hash table (or Python dict)?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'],
    correct_index: 0,
    explanation: 'Hash table lookups are O(1) on average.'
  },
  {
    id: 'diag-5',
    category: 'coding_ability',
    question: 'Which expression correctly generates even numbers from 0 to 8?',
    options: ['[x for x in range(9) if x % 2 == 0]', 'range(0, 8, 3)', 'list(even(9))', 'range(1, 9, 2)'],
    correct_index: 0,
    explanation: 'The list comprehension filters all even integers.'
  },
  {
    id: 'diag-6',
    category: 'coding_ability',
    question: 'Which keyword turns a Python function into a lazy iterator generator?',
    options: ['yield', 'await', 'produce', 'emit'],
    correct_index: 0,
    explanation: '`yield` pauses execution and yields values on demand.'
  },
  {
    id: 'diag-7',
    category: 'concept',
    question: 'What does the `is` operator test in Python?',
    options: ['Value equality', 'Memory identity', 'Data type', 'Length'],
    correct_index: 1,
    explanation: '`is` verifies whether two references point to the exact same object in memory.'
  },
  {
    id: 'diag-8',
    category: 'problem_solving',
    question: 'What is the result of `2 ** 3` in Python?',
    options: ['6', '8', '9', 'Error'],
    correct_index: 1,
    explanation: 'The double asterisk `**` is the exponentiation operator in Python (2 cubed = 8).'
  },
  {
    id: 'diag-9',
    category: 'coding_ability',
    question: 'How do you safely open and auto-close a file in Python?',
    options: ['with open(...) as f:', 'file.open_safe(...)', 'try: open() finally: del', 'using open()'],
    correct_index: 0,
    explanation: 'Context managers (`with`) guarantee resource closing upon block exit.'
  },
  {
    id: 'diag-10',
    category: 'concept',
    question: 'What is a closure in programming?',
    options: [
      'A function that retains access to its lexical scope even when executed outside that scope',
      'Closing a file pointer',
      'A class without methods',
      'A memory leak'
    ],
    correct_index: 0,
    explanation: 'Closures capture and remember free variables from their enclosing environment.'
  },
  {
    id: 'diag-11',
    category: 'concept',
    question: 'What is the exact output of `10.0 // 3` in Python 3?',
    options: ['3', '3.0', '3.3333333333333335', 'TypeError'],
    correct_index: 1,
    explanation: 'Floor division `//` performs floor arithmetic, but if at least one operand is a float (`10.0`), the result is coerced to float (`3.0`).'
  },
  {
    id: 'diag-12',
    category: 'problem_solving',
    question: 'What happens when evaluating `int("0b1111")` in Python?',
    options: [
      'Returns integer 15',
      'Raises ValueError: invalid literal for int() with base 10',
      'Returns binary string "0b1111"',
      'Returns 1111'
    ],
    correct_index: 1,
    explanation: '`int(string)` expects a base-10 integer string by default. Calling `int("0b1111")` raises ValueError. You must specify base 2: `int("0b1111", 2)`.'
  },
  {
    id: 'diag-13',
    category: 'concept',
    question: 'How do you define a single-valued tuple containing the number 10 in Python?',
    options: ['t = (10)', 't = (10,)', 't = tuple[10]', 't = [10]'],
    correct_index: 1,
    explanation: '`t = (10)` is evaluated as a grouped integer. A trailing comma `(10,)` is mandatory for Python to recognize it as a single-element tuple.'
  },
  {
    id: 'diag-14',
    category: 'problem_solving',
    question: 'Given set `s = {10, 20}`, what is the difference between `s.remove(50)` and `s.discard(50)`?',
    options: [
      '`remove(50)` raises a KeyError; `discard(50)` completes without error',
      '`discard(50)` raises a KeyError; `remove(50)` returns None',
      'Both methods raise a ValueError',
      'Both methods automatically insert 50 into the set'
    ],
    correct_index: 0,
    explanation: 'In Python sets, `remove()` raises a KeyError if the element does not exist. `discard()` removes the element if present, or safely does nothing if absent.'
  },
  {
    id: 'diag-15',
    category: 'coding_ability',
    question: 'Why does calling `calc(b=50, 100)` cause a SyntaxError in Python?',
    options: [
      'Positional arguments cannot follow keyword arguments in a function call',
      'Python functions can only accept keyword arguments',
      'Parameter `b` must be capitalized',
      'Arguments must always be enclosed in a tuple'
    ],
    correct_index: 0,
    explanation: 'In Python syntax, all positional arguments must precede any keyword arguments in a function call.'
  },
  {
    id: 'diag-16',
    category: 'coding_ability',
    question: 'What types do variable-length positional arguments `*args` and keyword arguments `**kwargs` have inside a Python function?',
    options: [
      '`*args` is a tuple, `**kwargs` is a dict',
      '`*args` is a list, `**kwargs` is a tuple',
      '`*args` is a set, `**kwargs` is a list',
      '`*args` is a generator, `**kwargs` is an object'
    ],
    correct_index: 0,
    explanation: '`*args` packages excess positional arguments into an immutable tuple, while `**kwargs` packages named arguments into a dictionary.'
  },
  {
    id: 'diag-17',
    category: 'concept',
    question: 'Out of the 33 reserved keywords in Python, which ones start with a capital letter?',
    options: [
      'True, False, None',
      'Def, Class, Return',
      'If, Elif, Else',
      'All 33 keywords are lowercase'
    ],
    correct_index: 0,
    explanation: 'Only True, False, and None are capitalized in Python keywords. The remaining 30 are strictly lowercase.'
  },
  {
    id: 'diag-18',
    category: 'problem_solving',
    question: 'Which regular expression pattern validates a 10-digit Indian mobile number starting with digits 6 to 9?',
    options: [
      're.fullmatch(r"[6-9]\\d{9}", number)',
      're.match(r"[0-9]{10}", number)',
      're.search(r"\\d{10}", number)',
      're.findall(r"[6-9]{10}", number)'
    ],
    correct_index: 0,
    explanation: '`[6-9]` requires the first digit to be 6, 7, 8, or 9, followed by exactly 9 digits (`\\d{9}`). Using `re.fullmatch` guarantees no unvalidated prefix or suffix.'
  }
];

export const mockDiagnosticQuestionsByLang: Record<string, any[]> = {
  python: mockDiagnosticQuestions,
  c: [
    {
      id: 'diag-c-1',
      category: 'concept',
      question: 'What is the size in bytes of any pointer (e.g., int*, char*) on a standard 64-bit operating system?',
      options: ['4 bytes', '8 bytes', '16 bytes', 'Depends on target data type'],
      correct_index: 1,
      explanation: 'On a 64-bit architecture, memory addresses are 64 bits wide, making all pointers occupy exactly 8 bytes.'
    },
    {
      id: 'diag-c-2',
      category: 'concept',
      question: 'What is the crucial difference between malloc() and calloc() in standard C?',
      options: [
        'calloc() zero-initializes memory, while malloc() leaves indeterminate garbage values',
        'malloc() allocates on stack, calloc() on heap',
        'calloc() cannot be freed with free()',
        'malloc() requires two parameters'
      ],
      correct_index: 0,
      explanation: 'calloc zeroes out allocated memory, while malloc leaves previous memory content intact.'
    },
    {
      id: 'diag-c-3',
      category: 'problem_solving',
      question: 'What will be the final value of variable val after executing: int val = 15; int *ptr = &val; *ptr = *ptr + 10; *ptr *= 2;?',
      options: ['15', '25', '50', 'Segmentation Fault'],
      correct_index: 2,
      explanation: '*ptr modifies val directly in memory: (15 + 10) * 2 = 50.'
    },
    {
      id: 'diag-c-4',
      category: 'problem_solving',
      question: 'How many times does this while loop execute: int i = 0; while (i++ < 3) { ... }?',
      options: ['2 times', '3 times', '4 times', 'Infinite loop'],
      correct_index: 1,
      explanation: 'Postfix i++ tests before incrementing, resulting in exactly 3 iterations (for i=0, 1, 2).'
    },
    {
      id: 'diag-c-5',
      category: 'coding_ability',
      question: 'Which sequence properly frees heap memory and defends against dangling pointers?',
      options: ['free(ptr); ptr = NULL;', 'delete ptr;', 'ptr = NULL; free(ptr);', 'free(&ptr);'],
      correct_index: 0,
      explanation: 'free releases the buffer, and setting ptr = NULL prevents accidental double-free or dangling access.'
    },
    {
      id: 'diag-c-6',
      category: 'coding_ability',
      question: 'Which syntax correctly declares a function pointer named op taking two ints and returning int?',
      options: ['int (*op)(int, int);', 'int *op(int, int);', 'func<int(int, int)> op;', '(*op)(int, int) -> int;'],
      correct_index: 0,
      explanation: 'Parentheses around (*op) ensure op is a pointer to a function returning int.'
    }
  ],
  cpp: [
    {
      id: 'diag-cpp-1',
      category: 'concept',
      question: 'In C++, what is the only fundamental difference between a class and a struct?',
      options: [
        'Default member and inheritance visibility is private for class, and public for struct',
        'struct cannot have methods',
        'class is always on heap, struct on stack',
        'struct cannot use inheritance'
      ],
      correct_index: 0,
      explanation: 'In C++, classes and structs are identical in feature set; their only distinction is default access.'
    },
    {
      id: 'diag-cpp-2',
      category: 'concept',
      question: 'What is the core principle of RAII (Resource Acquisition Is Initialization)?',
      options: [
        'Tying resource lifetime to stack object scope and deterministic destructors',
        'Initializing all pointers to NULL at boot',
        'Parallelizing constructors',
        'Garbage collecting dead objects'
      ],
      correct_index: 0,
      explanation: 'RAII binds resource ownership to object lifetime, ensuring automatic cleanup when exiting scope.'
    },
    {
      id: 'diag-cpp-3',
      category: 'problem_solving',
      question: 'What keyword enables dynamic dispatch and runtime polymorphism on a base class method?',
      options: ['virtual', 'override', 'dynamic', 'polymorphic'],
      correct_index: 0,
      explanation: 'The virtual keyword creates vtable entries for runtime dispatch.'
    },
    {
      id: 'diag-cpp-4',
      category: 'problem_solving',
      question: 'Why pass large objects as const std::string& rather than std::string?',
      options: ['Avoids expensive heap copying of the string buffer', 'Runs asynchronously', 'Converts string to bytes', 'Locks thread'],
      correct_index: 0,
      explanation: 'Const reference passes by address without copying heap memory.'
    },
    {
      id: 'diag-cpp-5',
      category: 'coding_ability',
      question: 'Which smart pointer represents exclusive, zero-overhead ownership?',
      options: ['std::unique_ptr', 'std::shared_ptr', 'std::weak_ptr', 'std::auto_ptr'],
      correct_index: 0,
      explanation: 'std::unique_ptr gives unique non-shared ownership with zero overhead.'
    },
    {
      id: 'diag-cpp-6',
      category: 'coding_ability',
      question: 'What does std::vector::reserve(100) do?',
      options: ['Pre-allocates capacity without changing size', 'Fills vector with 100 elements', 'Caps max size at 100', 'Clears vector'],
      correct_index: 0,
      explanation: 'reserve(n) pre-allocates memory capacity to prevent reallocations.'
    }
  ],
  java: [
    {
      id: 'diag-java-1',
      category: 'concept',
      question: 'What is the difference between == and .equals() for String objects in Java?',
      options: ['== tests reference identity, .equals() compares character content', '== is case-insensitive', 'They are completely identical', '.equals() only works on primitives'],
      correct_index: 0,
      explanation: '== checks if references point to the exact same object in memory, while .equals() checks semantic text equality.'
    },
    {
      id: 'diag-java-2',
      category: 'concept',
      question: 'Which access modifier restricts visibility strictly to within the declaring class?',
      options: ['private', 'protected', 'default', 'public'],
      correct_index: 0,
      explanation: 'private limits access exclusively to within the class itself.'
    },
    {
      id: 'diag-java-3',
      category: 'problem_solving',
      question: 'What happens when calling a method on a null reference in Java?',
      options: ['Throws NullPointerException at runtime', 'Returns null silently', 'Compilation error', 'Prints empty string'],
      correct_index: 0,
      explanation: 'Dereferencing a null reference throws a java.lang.NullPointerException.'
    },
    {
      id: 'diag-java-4',
      category: 'problem_solving',
      question: 'Which keyword explicitly calls a constructor in the parent class?',
      options: ['super(...)', 'this(...)', 'parent(...)', 'base(...)'],
      correct_index: 0,
      explanation: 'super() invokes the superclass constructor.'
    },
    {
      id: 'diag-java-5',
      category: 'coding_ability',
      question: 'Which Java collection guarantees unique elements and O(1) average lookup?',
      options: ['HashSet', 'ArrayList', 'TreeSet', 'LinkedList'],
      correct_index: 0,
      explanation: 'HashSet uses a hash table providing constant time average lookup and uniqueness.'
    },
    {
      id: 'diag-java-6',
      category: 'coding_ability',
      question: 'When is a finally block guaranteed to execute in try-catch-finally?',
      options: ['Always, whether an exception occurs, is caught, or not (unless System.exit())', 'Only when an exception is thrown', 'Only when no exception is thrown', 'In a daemon thread'],
      correct_index: 0,
      explanation: 'finally blocks execute during stack unwinding for guaranteed resource disposal.'
    }
  ]
};

// Fallback handlers for api.ts
export const mockHandlers = {
  getPlatformStats: async () => ({
    total_learners: 1420,
    total_topics: 16,
    total_questions: 48,
    supported_languages: 4
  }),

  getCourses: async (language: string = 'python') => {
    return mockCourses.filter(c => c.language === language.toLowerCase()) || mockCourses;
  },

  getCourseDetail: async (courseId: string) => {
    return mockCourses.find(c => c.id === courseId) || mockCourses[0];
  },

  getTopicDetail: async (topicId: string) => {
    return mockTopicDetails[topicId] || mockTopicDetails['top-py-loops'];
  },

  getTopicQuiz: async (topicId: string) => {
    return {
      target_difficulty: 'standard',
      adaptive_note: 'Standard calibrated quiz based on your active mastery.',
      questions: mockQuizzes[topicId] || mockQuizzes['top-py-loops']
    };
  },

  submitTopicQuiz: async (topicId: string, answers: Record<string, number>, timeSpent: number) => {
    const qList = mockQuizzes[topicId] || mockQuizzes['top-py-loops'];
    let correct = 0;
    const review = qList.map(q => {
      const userAns = answers[q.id];
      const isCorrect = userAns === q.correct_index;
      if (isCorrect) correct++;
      return {
        ...q,
        is_correct: isCorrect,
        user_choice: userAns
      };
    });
    const score = Math.round((correct / qList.length) * 100);
    const passed = score >= 70;
    const cognitiveLevel = score < 60 ? 'HIGH' : score >= 85 ? 'LOW' : 'MEDIUM';

    // Store in history
    const history = getStoredArray(MOCK_STORAGE_KEYS.HISTORY, []);
    history.unshift({
      id: `hist-${Date.now()}`,
      timestamp: new Date().toISOString(),
      topic_id: topicId,
      topic_title: mockTopicDetails[topicId]?.title || 'Practice Session',
      language: 'python',
      quiz_score: score,
      coding_score: passed ? 100 : 40,
      time_spent: timeSpent,
      cognitive_load: cognitiveLevel,
      adaptive_action: passed ? 'ADVANCE' : 'SIMPLIFY'
    });
    setStoredArray(MOCK_STORAGE_KEYS.HISTORY, history.slice(0, 30));

    return {
      score,
      correct_count: correct,
      total_questions: qList.length,
      passed,
      review,
      adaptive_feedback: {
        cognitive_level: cognitiveLevel,
        recommended_action: passed ? 'CONTINUE' : 'REVISE',
        reason: passed
          ? 'Great job! You demonstrated solid mastery. Proceeding to coding challenge.'
          : 'High cognitive load detected. Reviewing simplified analogies and micro-steps.'
      }
    };
  },

  getTopicCodingChallenge: async (topicId: string, language?: string) => {
    const langKey = (language || 'python').toLowerCase();
    let challenge = mockCodingChallenges[topicId];
    if (!challenge) {
      if (langKey === 'c' && !topicId.startsWith('top-c-')) {
        challenge = mockCodingChallenges[topicId.replace('top-py-', 'top-c-')];
      } else if (langKey === 'python' && !topicId.startsWith('top-py-')) {
        challenge = mockCodingChallenges[topicId.replace('top-c-', 'top-py-')];
      }
    }
    if (!challenge) {
      challenge = mockCodingChallenges['top-py-fundamentals'] || Object.values(mockCodingChallenges)[0];
    }
    const sc = challenge.starter_code;
    let selectedSc = '';
    if (typeof sc === 'object' && sc !== null) {
      selectedSc = sc[langKey] || sc['python'] || sc['c'] || '';
    } else {
      selectedSc = String(sc || '');
    }
    return {
      ...challenge,
      starter_code: selectedSc,
      starter_codes: typeof sc === 'object' ? sc : { python: selectedSc, c: selectedSc }
    };
  },

  runCode: async (code: string, language: string, input: string = '') => {
    const res = await executeCodeInBrowser(code, language, input);
    return {
      status: res.status,
      stdout: res.stdout,
      stderr: res.stderr,
      execution_time: res.execution_time_ms,
      execution_time_ms: res.execution_time_ms,
      passed_test_cases: res.status === 'SUCCESS' ? 1 : 0,
      total_test_cases: 1,
      details: [
        {
          input: input || 'Standard',
          expected: res.stdout,
          actual: res.stdout || res.stderr || 'Execution finished',
          passed: res.status === 'SUCCESS',
          is_hidden: false
        }
      ]
    };
  },

  submitCode: async (topicId: string, code: string, telemetryData: any = {}) => {
    const challenge = mockCodingChallenges[topicId] || Object.values(mockCodingChallenges)[0];
    const testCases = (challenge && challenge.test_cases && challenge.test_cases.length > 0)
      ? challenge.test_cases
      : [{ input: '', expected_output: 'Execution finished', is_hidden: false }];

    const details: any[] = [];
    let passedVisible = 0;
    let totalVisible = 0;
    let passedHidden = 0;
    let totalHidden = 0;
    let firstStdout = '';
    let firstStderr = '';

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      if (tc.is_hidden) totalHidden++;
      else totalVisible++;

      const res = await executeCodeInBrowser(code, telemetryData.language || 'python', tc.input || '');
      if (i === 0) {
        firstStdout = res.stdout;
        firstStderr = res.stderr;
      }

      const actualTrimmed = (res.stdout || '').trim();
      const expectedTrimmed = (tc.expected_output || tc.expected || '').trim();
      const isMatch = (actualTrimmed === expectedTrimmed) ||
                      (res.status === 'SUCCESS' && actualTrimmed.length > 0 && !expectedTrimmed);

      if (isMatch) {
        if (tc.is_hidden) passedHidden++;
        else passedVisible++;
      }

      details.push({
        input: tc.input || '',
        expected: expectedTrimmed,
        actual: actualTrimmed || res.stderr || 'No output recorded',
        passed: isMatch,
        is_hidden: !!tc.is_hidden
      });
    }

    const allPassed = (totalVisible > 0 ? passedVisible === totalVisible : true) &&
                      (totalHidden > 0 ? passedHidden === totalHidden : true);

    const execResult = {
      status: allPassed ? 'PASSED' : 'FAILED',
      passed_test_cases: passedVisible,
      total_test_cases: totalVisible,
      hidden_passed: passedHidden,
      hidden_total: totalHidden,
      execution_time_ms: 125,
      stdout: firstStdout || (allPassed ? 'All test cases executed successfully!' : ''),
      stderr: firstStderr,
      details
    };

    return {
      execution: execResult,
      is_passed: allPassed,
      status: allPassed ? 'PASSED' : 'FAILED',
      stdout: execResult.stdout,
      adaptive_feedback: {
        cognitive_level: allPassed ? 'LOW' : 'MEDIUM',
        recommended_action: allPassed ? 'CONTINUE_NEXT_TOPIC' : 'REVISE',
        reason: allPassed
          ? 'Solution executed cleanly with zero syntax errors. All test cases passed!'
          : 'Some test cases did not match expected output. Review hint progression and check logic.'
      }
    };
  },

  getProjects: async (language: string = 'python', level?: string) => {
    let projs = mockProjects.filter((p: any) => p.language === language.toLowerCase());
    if (level && level !== 'all') {
      projs = projs.filter((p: any) => p.level === level.toLowerCase());
    }
    return { projects: projs };
  },

  getProjectDetail: async (id: string) => {
    const proj = mockProjects.find((p: any) => p.id === id) || mockProjects[0];
    return { project: proj };
  },

  submitProject: async (projectId: string, payload: any) => {
    const proj = mockProjects.find((p: any) => p.id === projectId);
    const code = payload.code || '';
    const res = await executeCodeInBrowser(code, proj?.language || 'python', proj?.test_cases?.[0]?.input || '');
    const passed = res.status === 'SUCCESS' && code.length > 25;

    return {
      success: true,
      evaluation: {
        total_score: passed ? 92 : 65,
        passed,
        rubric_breakdown: {
          correctness: passed ? 38 : 22,
          efficiency: 18,
          style: 18,
          cognitive_mastery: passed ? 18 : 12
        },
        feedback: passed
          ? 'Outstanding work! Project requirements, architectural separation, and test cases verified.'
          : 'Project submitted. Review milestones and ensure all required features are implemented.'
      }
    };
  },


  getDashboardSnapshot: async () => {
    const history = getStoredArray(MOCK_STORAGE_KEYS.HISTORY, []);
    return {
      success: true,
      user: { name: 'Learner', email: 'learner@cognitive.edu' },
      streak_days: 3,
      learning_snapshot: {
        overall_progress: 35,
        topics_completed: 4,
        total_topics: 12,
        quiz_accuracy: 88,
        challenges_solved: 3
      },
      cognitive_state: {
        current_load: 'LOW',
        trajectory: 'IMPROVING',
        recent_average_load: 'MEDIUM'
      },
      ai_recommendation: {
        action: 'CONTINUE',
        target_topic_id: 'top-py-functions',
        reason: 'Optimal pace observed. Ready to advance to Functions and Modular Scopes.'
      },
      recent_activity: history.slice(0, 5)
    };
  },

  getLanguageRoadmap: async (language: string = 'python') => {
    return {
      success: true,
      language,
      roadmap: [
        { id: 'top-py-intro', title: 'Python Syntax & Dynamic Typing', level: 'Beginner', status: 'COMPLETED', load: 'LOW' },
        { id: 'top-py-loops', title: 'Loops and Iteration Constructs', level: 'Beginner', status: 'IN_PROGRESS', load: 'MEDIUM' },
        { id: 'top-py-functions', title: 'Functions, Scopes, and Arguments', level: 'Beginner', status: 'LOCKED', load: 'HIGH' },
        { id: 'top-py-recursion', title: 'Recursion and Recursive Thinking', level: 'Intermediate', status: 'LOCKED', load: 'LOW' }
      ]
    };
  },

  askAiAssistant: async (payload: any) => {
    const topic = payload.topic || 'Programming';
    const mode = payload.tutor_mode || 'EXPLAIN';
    const load = payload.cognitive_load || 'MEDIUM';

    const answers: Record<string, string> = {
      SIMPLIFY: `### 🌱 Simplified Analogy: ${topic}\n\nThink of a **Function** like a **Vending Machine**: you put in money and select a code (arguments/parameters), the machine processes your request internally (execution logic), and it dispenses your drink (return value).\n\nYou don't need to know the gears inside the vending machine to get your soda—just like callers don't need to know internal variables to use the function!`,
      DEBUG: `### 🛠️ Common Bug Diagnostic: ${topic}\n\n1. **Mutable Default Arguments**: Never write \`def fn(item, lst=[])\`. Use \`lst=None\` and initialize inside.\n2. **Off-By-One Errors**: Remember \`range(a, b)\` stops before \`b\`.\n3. **Shadowing Variables**: Keep parameter names distinct from outer globals.`,
      EXPLAIN: `### 💡 Architectural Deep Dive: ${topic}\n\nIn Python, code is executed within stack frames. When a function executes, its local symbol table handles scope resolution following the **LEGB rule** (Local, Enclosing, Global, Built-in).`
    };

    return {
      answer: answers[mode] || answers.EXPLAIN,
      sources: [`Knowledge Base: python/${topic.toLowerCase().replace(/\s+/g, '_')}.json`],
      cognitive_mode_applied: load
    };
  },

  requestProgressiveHint: async (payload: any) => {
    const lvl = payload.hint_level || 1;
    const hints = [
      '💡 **Level 1 — Conceptual Clue**: Identify your base condition and what value stops recursion or completes iteration.',
      '🧭 **Level 2 — Algorithmic Strategy**: Maintain an accumulator variable or recursive return step that decrements N toward 0.',
      '📝 **Level 3 — Pseudocode Blueprint**:\n```text\nFUNCTION solve(n):\n    IF n <= 1 RETURN 1\n    RETURN n * solve(n - 1)\n```',
      '🧩 **Level 4 — Partial Code Skeleton**:\n```python\ndef solve(n):\n    if n <= 1:\n        return 1\n    return n * solve(n - 1)  # Fill recursion step\n```',
      '🎓 **Level 5 — Full Walkthrough**: Here is the completed pattern with comments explaining the stack unwind order.'
    ];
    return {
      hint_level: lvl,
      hint_text: hints[Math.min(lvl - 1, hints.length - 1)],
      next_hint_available: lvl < 5
    };
  },

  // Diagnostic Test
  getDiagnosticQuestions: async (language: string = 'python') => {
    const langKey = language.toLowerCase() === 'c++' ? 'cpp' : language.toLowerCase();
    const list = mockDiagnosticQuestionsByLang[langKey] || mockDiagnosticQuestionsByLang.python;
    return {
      language,
      total_questions: list.length,
      questions: list.map(({ correct_index, explanation, ...rest }) => rest)
    };
  },

  submitDiagnosticTest: async (
    language: string,
    answers: Record<string, number>,
    timeSpent: number,
    observations?: Record<string, any>
  ) => {
    const langKey = language.toLowerCase() === 'c++' ? 'cpp' : language.toLowerCase();
    const list = mockDiagnosticQuestionsByLang[langKey] || mockDiagnosticQuestionsByLang.python;
    let correct = 0;
    const catTotals: Record<string, number> = {};
    const catCorrect: Record<string, number> = {};

    const breakdown = list.map(q => {
      const cat = q.category || 'concept';
      catTotals[cat] = (catTotals[cat] || 0) + 1;
      const userChoice = answers[q.id];
      const isCorrect = userChoice === q.correct_index;
      if (isCorrect) {
        correct++;
        catCorrect[cat] = (catCorrect[cat] || 0) + 1;
      }
      return {
        id: q.id,
        category: cat,
        is_correct: isCorrect,
        user_choice: userChoice,
        correct_index: q.correct_index,
        explanation: q.explanation
      };
    });

    const score = Math.round((correct / list.length) * 100);
    const conceptScore = catTotals.concept ? Math.round(((catCorrect.concept || 0) / catTotals.concept) * 100) : score;
    const psScore = catTotals.problem_solving ? Math.round(((catCorrect.problem_solving || 0) / catTotals.problem_solving) * 100) : score;
    const codingScore = catTotals.coding_ability ? Math.round(((catCorrect.coding_ability || 0) / catTotals.coding_ability) * 100) : score;

    const switchCount = observations?.revisions_count || 0;
    const avgHesitation = observations?.avg_hesitation_seconds || 6.0;

    let cognitiveLoad: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    let suggestedMode = 'BALANCED';
    let level = 'intermediate';

    if (score >= 80 && avgHesitation < 15) {
      cognitiveLoad = 'LOW';
      suggestedMode = 'CONCISE';
      level = 'advanced';
    } else if (score < 50 || switchCount > 3 || avgHesitation > 18) {
      cognitiveLoad = 'HIGH';
      suggestedMode = 'SIMPLIFIED';
      level = 'beginner';
    } else {
      cognitiveLoad = 'MEDIUM';
      suggestedMode = 'BALANCED';
      level = 'intermediate';
    }

    const startingTopicMap: Record<string, Record<string, string>> = {
      python: { beginner: 'top-py-fundamentals', intermediate: 'top-py-functions', advanced: 'top-py-recursion' },
      c: { beginner: 'top-c-fundamentals', intermediate: 'top-c-pointers', advanced: 'top-c-structures' },
      cpp: { beginner: 'top-cpp-fundamentals', intermediate: 'top-cpp-oop', advanced: 'top-cpp-containers' },
      java: { beginner: 'top-java-fundamentals', intermediate: 'top-java-oop', advanced: 'top-java-collections' }
    };
    const startingTopic = (startingTopicMap[langKey] || startingTopicMap.python)[level];

    return {
      success: true,
      diagnostic_result: {
        language,
        total_score: score,
        concept_score: conceptScore,
        problem_solving_score: psScore,
        coding_score: codingScore,
        recommended_level: level,
        starting_topic_id: startingTopic,
        cognitive_load: cognitiveLoad,
        suggested_mode: suggestedMode,
        confidence: 0.88,
        evaluated_at: new Date().toISOString(),
        observations: {
          total_time_seconds: timeSpent,
          avg_seconds_per_question: Math.round((timeSpent / list.length) * 10) / 10,
          revisions_count: switchCount,
          predicted_load: cognitiveLoad,
          confidence: 0.88
        }
      },
      question_breakdown: breakdown,
      message: `Diagnostic test complete! Recommended starting point: ${level.toUpperCase()} track with ${suggestedMode} cognitive mode.`
    };
  },

  // Global Search
  search: async (query: string, language?: string) => {
    const q = (query || '').toLowerCase().trim();
    const results = [
      { id: 'top-py-loops', title: 'Loops and Iteration Constructs', type: 'topic', language: 'python', snippet: 'for loops, while loops, break, continue' },
      { id: 'top-py-functions', title: 'Functions, Scopes, and Arguments', type: 'topic', language: 'python', snippet: 'def keyword, parameters, return values, LEGB scopes' },
      { id: 'top-py-recursion', title: 'Recursion and Recursive Thinking', type: 'topic', language: 'python', snippet: 'base cases, call stack unwinding, factorial' },
      { id: 'top-c-pointers', title: 'Pointers and Memory Addresses', type: 'topic', language: 'c', snippet: 'address-of operator (&), dereference (*), memory buffers' }
    ].filter(item => {
      return !q || item.title.toLowerCase().includes(q) || item.snippet.toLowerCase().includes(q) || (language && item.language === language);
    });

    return {
      success: true,
      query,
      total: results.length,
      synonyms_matched: q === 'memory' ? ['pointer', 'malloc'] : q === 'iteration' ? ['loop', 'for'] : [],
      results
    };
  },

  // Bookmarks CRUD (localStorage)
  getBookmarks: async (type?: string) => {
    const all = getStoredArray(MOCK_STORAGE_KEYS.BOOKMARKS, [
      {
        id: 'bm-default-1',
        item_type: 'lesson',
        item_id: 'top-py-functions',
        title: 'Functions, Scopes, and Arguments',
        snippet: 'Core function definition and parameter passing mechanics.',
        language: 'python',
        created_at: new Date().toISOString()
      }
    ]);
    const filtered = type && type !== 'all' ? all.filter(b => b.item_type === type) : all;
    return { success: true, total: filtered.length, bookmarks: filtered };
  },

  addBookmark: async (payload: any) => {
    const all = getStoredArray(MOCK_STORAGE_KEYS.BOOKMARKS, []);
    const newBm = {
      id: `bm-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString()
    };
    all.unshift(newBm);
    setStoredArray(MOCK_STORAGE_KEYS.BOOKMARKS, all);
    return { success: true, bookmark: newBm };
  },

  deleteBookmark: async (id: string) => {
    const all = getStoredArray(MOCK_STORAGE_KEYS.BOOKMARKS, []);
    setStoredArray(MOCK_STORAGE_KEYS.BOOKMARKS, all.filter(b => b.id !== id));
    return { success: true };
  },

  checkBookmarkStatus: async (itemType: string, itemId: string) => {
    const all = getStoredArray(MOCK_STORAGE_KEYS.BOOKMARKS, []);
    const found = all.some(b => b.item_type === itemType && b.item_id === itemId);
    return { is_bookmarked: found };
  },

  // Notes CRUD (localStorage)
  getNotes: async (query?: string, language?: string) => {
    let all = getStoredArray(MOCK_STORAGE_KEYS.NOTES, [
      {
        id: 'note-default-1',
        language: 'python',
        topic_id: 'top-py-functions',
        subtopic_title: 'Parameters',
        title: 'Default Argument Gotcha',
        content: 'Never use mutable default arguments like def fn(x=[]). Always use def fn(x=None): if x is None: x = []',
        updated_at: new Date().toISOString()
      }
    ]);
    if (query) {
      all = all.filter(n => n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase()));
    }
    if (language && language !== 'all') {
      all = all.filter(n => n.language === language);
    }
    return { success: true, total: all.length, notes: all };
  },

  createNote: async (payload: any) => {
    const all = getStoredArray(MOCK_STORAGE_KEYS.NOTES, []);
    const newNote = {
      id: `note-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    all.unshift(newNote);
    setStoredArray(MOCK_STORAGE_KEYS.NOTES, all);
    return { success: true, note: newNote };
  },

  updateNote: async (id: string, payload: any) => {
    const all = getStoredArray(MOCK_STORAGE_KEYS.NOTES, []);
    const idx = all.findIndex(n => n.id === id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...payload, updated_at: new Date().toISOString() };
      setStoredArray(MOCK_STORAGE_KEYS.NOTES, all);
      return { success: true, note: all[idx] };
    }
    return { success: false };
  },

  deleteNote: async (id: string) => {
    const all = getStoredArray(MOCK_STORAGE_KEYS.NOTES, []);
    setStoredArray(MOCK_STORAGE_KEYS.NOTES, all.filter(n => n.id !== id));
    return { success: true };
  },

  // Learning History
  getLearningHistory: async () => {
    const history = getStoredArray(MOCK_STORAGE_KEYS.HISTORY, [
      {
        id: 'hist-seed-1',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        topic_id: 'top-py-intro',
        topic_title: 'Python Syntax & Dynamic Typing',
        language: 'python',
        quiz_score: 90,
        coding_score: 100,
        time_spent: 240,
        cognitive_load: 'LOW',
        adaptive_action: 'CONTINUE'
      },
      {
        id: 'hist-seed-2',
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        topic_id: 'top-py-loops',
        topic_title: 'Loops and Iteration Constructs',
        language: 'python',
        quiz_score: 75,
        coding_score: 80,
        time_spent: 310,
        cognitive_load: 'MEDIUM',
        adaptive_action: 'PRACTICE'
      }
    ]);
    return {
      success: true,
      history,
      summary_stats: {
        total_sessions: history.length,
        avg_quiz_score: 85,
        avg_coding_score: 90,
        total_time_spent: 550
      },
      cognitive_trajectory: ['HIGH', 'MEDIUM', 'LOW']
    };
  },

  // Python Fundamentals Adaptive Flow
  getPythonFundamentals: async () => {
    const storedProgress = getStoredArray('cog_python_progress', []);
    const progressMap: Record<string, any> = {};
    storedProgress.forEach((p: any) => {
      progressMap[p.topic_id] = p;
    });

    const adaptedLessons = getStoredArray('cog_python_adapted', []);
    const adaptedMap: Record<string, any> = {};
    adaptedLessons.forEach((a: any) => {
      adaptedMap[a.topic_id] = a;
    });

    let completedCount = 0;
    let quizCompletedCount = 0;
    let currentTopicId = PYTHON_FUNDAMENTALS_TOPICS[0].id;
    let firstIncompleteFound = false;

    const topicsOutput = PYTHON_FUNDAMENTALS_TOPICS.map((topic, idx) => {
      const prog = progressMap[topic.id] || {};
      let status = prog.status || 'NOT_STARTED';
      const compPct = Number(prog.completion_pct || 0);
      const quizScore = prog.quiz_score;

      if (status === 'COMPLETED' || compPct >= 95) {
        status = 'COMPLETED';
        completedCount++;
        if (quizScore !== undefined && quizScore > 0) quizCompletedCount++;
      } else if (status === 'IN_PROGRESS' || compPct > 0) {
        status = 'IN_PROGRESS';
        if (!firstIncompleteFound) {
          currentTopicId = topic.id;
          firstIncompleteFound = true;
        }
      } else {
        if (idx === 0) {
          status = 'NOT_STARTED';
        } else {
          const prevProg = progressMap[PYTHON_FUNDAMENTALS_TOPICS[idx - 1].id] || {};
          if (prevProg.status === 'COMPLETED' || prevProg.completion_pct >= 95) {
            status = 'NOT_STARTED';
          } else {
            status = 'LOCKED';
          }
        }
        if (status !== 'LOCKED' && !firstIncompleteFound) {
          currentTopicId = topic.id;
          firstIncompleteFound = true;
        }
      }

      const hasAdapted = !!adaptedMap[topic.id];
      if (hasAdapted && status !== 'COMPLETED') {
        status = 'ADAPTATION_AVAILABLE';
      }

      return {
        id: topic.id,
        number: topic.number,
        numberDisplay: topic.numberDisplay,
        title: topic.title,
        slug: topic.slug,
        difficulty: topic.difficulty,
        estimatedMinutes: topic.estimatedMinutes,
        desc: topic.shortDescription,
        status,
        completion_percentage: compPct,
        quiz_score: quizScore,
        attempts: prog.attempts || 0,
        time_spent_seconds: prog.time_spent_seconds || 0,
        has_adapted_lesson: hasAdapted
      };
    });

    const totalTopics = PYTHON_FUNDAMENTALS_TOPICS.length;
    const overallProgress = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
    const remainingMinutes = topicsOutput
      .filter(t => t.status !== 'COMPLETED')
      .reduce((acc, t) => acc + t.estimatedMinutes, 0);

    return {
      title: "Python Fundamentals",
      subtitle: "Build a strong foundation in Python through guided lessons, practice, and adaptive learning.",
      total_topics: totalTopics,
      completed_topics: completedCount,
      quizzes_completed: quizCompletedCount,
      overall_progress: overallProgress,
      current_topic_id: currentTopicId,
      streak_days: 3,
      estimated_remaining_minutes: remainingMinutes,
      learning_signals_status: "Calibrated & Active",
      topics: topicsOutput
    };
  },

  getPythonTopic: async (topicId: string) => {
    const topic = PYTHON_FUNDAMENTALS_TOPICS.find(t => t.id === topicId) || PYTHON_FUNDAMENTALS_TOPICS[0];
    return {
      success: true,
      topic
    };
  },

  updatePythonProgress: async (payload: {
    topic_id: string;
    status?: string;
    completion_pct?: number;
    quiz_score?: number;
    attempts_delta?: number;
    time_spent_delta?: number;
  }) => {
    const stored = getStoredArray('cog_python_progress', []);
    const idx = stored.findIndex((p: any) => p.topic_id === payload.topic_id);
    let record = idx >= 0 ? stored[idx] : { topic_id: payload.topic_id, attempts: 0, time_spent_seconds: 0 };

    record = {
      ...record,
      status: payload.status || record.status || 'IN_PROGRESS',
      completion_pct: payload.completion_pct !== undefined ? payload.completion_pct : (record.completion_pct || 0),
      quiz_score: payload.quiz_score !== undefined ? payload.quiz_score : record.quiz_score,
      attempts: (record.attempts || 0) + (payload.attempts_delta || 0),
      time_spent_seconds: (record.time_spent_seconds || 0) + (payload.time_spent_delta || 0)
    };

    if (idx >= 0) {
      stored[idx] = record;
    } else {
      stored.push(record);
    }
    setStoredArray('cog_python_progress', stored);
    return { success: true, progress: record };
  },

  analyzePythonSignals: async (payload: {
    topic_id: string;
    time_spent_seconds?: number;
    quiz_accuracy?: number;
    incorrect_attempts?: number;
    code_errors?: number;
    hints_requested?: number;
    solution_revealed?: boolean;
    revisits_count?: number;
  }) => {
    const errors = (payload.code_errors || 0) + (payload.incorrect_attempts || 0);
    const hints = payload.hints_requested || 0;
    const timeSpent = payload.time_spent_seconds || 60;
    const revisits = payload.revisits_count || 0;

    let needsAdaptation = false;
    let strategy = 'BALANCED';
    let cognitiveState = 'MEDIUM';
    let reason = 'Learning pace is optimal and progression is steady.';
    let suggestedChanges = [
      'Continue with standard curriculum pacing'
    ];

    if (errors >= 2 || hints >= 2 || (payload.quiz_accuracy !== undefined && payload.quiz_accuracy < 70) || revisits >= 2) {
      needsAdaptation = true;
      strategy = 'SIMPLIFY';
      cognitiveState = 'HIGH';
      reason = 'Recent learning signals suggest that a more guided, step-by-step explanation may help with this topic.';
      suggestedChanges = [
        'Simpler explanation with intuitive everyday analogies',
        'More step-by-step breakdown of core mechanics',
        'Additional visual representation and diagrams',
        'Easier first practice questions with progressive scaffolding'
      ];
    } else if (errors === 0 && hints === 0 && (payload.quiz_accuracy || 0) >= 90 && timeSpent < 180) {
      needsAdaptation = true;
      strategy = 'INCREASE_DIFFICULTY';
      cognitiveState = 'LOW';
      reason = 'High mastery and rapid problem solving detected. Advanced deep-dive insights and challenging patterns are ready.';
      suggestedChanges = [
        'Dense architectural explanation with edge cases',
        'Challenging algorithmic variation exercises',
        'Under-the-hood memory representation insights'
      ];
    }

    const signalsSummary: string[] = [];
    if (payload.incorrect_attempts && payload.incorrect_attempts > 0) {
      signalsSummary.push(`${payload.incorrect_attempts} incorrect attempts observed on practice checks`);
    }
    if (payload.hints_requested && payload.hints_requested > 0) {
      signalsSummary.push(`${payload.hints_requested} hints requested for guidance`);
    }
    if (payload.code_errors && payload.code_errors > 0) {
      signalsSummary.push(`${payload.code_errors} code syntax/runtime errors caught`);
    }
    if (payload.revisits_count && payload.revisits_count > 1) {
      signalsSummary.push(`Revisited concept sections ${payload.revisits_count} times`);
    }
    if (timeSpent > 300) {
      signalsSummary.push('Deliberate, extended time invested exploring concept sections');
    }
    if (signalsSummary.length === 0) {
      signalsSummary.push('Consistent, stable reading pace and active practice');
    }

    return {
      topic_id: payload.topic_id,
      suggested: needsAdaptation,
      cognitive_state: cognitiveState,
      confidence: 0.88,
      strategy,
      reason,
      suggested_adaptation: suggestedChanges,
      signals_summary: signalsSummary
    };
  },

  generateAdaptedLesson: async (payload: {
    topic_id: string;
    strategy?: string;
    signals?: any;
  }) => {
    const topic = PYTHON_FUNDAMENTALS_TOPICS.find(t => t.id === payload.topic_id) || PYTHON_FUNDAMENTALS_TOPICS[0];
    const isSimplified = payload.strategy !== 'INCREASE_DIFFICULTY';

    const adaptedLesson = {
      topic_id: topic.id,
      topic_title: topic.title,
      adaptation_badge: isSimplified ? 'Simplified & Step-by-Step' : 'Accelerated Deep Dive',
      adaptation_strategy: payload.strategy || 'SIMPLIFY',
      concept_breakdown: [
        {
          heading: `Deconstructing ${topic.title}: The Core Intuition`,
          content: isSimplified
            ? `Think of ${topic.title.toLowerCase()} like a familiar daily system. Instead of abstract rules, focus on what the computer is doing step by step.`
            : `Delving into ${topic.title} at an architectural level. In CPython, execution characteristics and memory layouts drive how this operates under the hood.`
        },
        {
          heading: "Everyday Analogy",
          content: isSimplified
            ? `Imagine an organized postal sorting office or a labeled recipe card. Before executing any instructions, Python validates names and references so every piece has a clear address.`
            : `Under the hood, memory pointers, bytecode compilation (PyCodeObject), and reference counts dictate the evaluation semantics.`
        }
      ],
      step_by_step_example: {
        title: "Calibrated Walkthrough",
        steps: [
          "Step 1: Inspect what data is being provided and its structure.",
          "Step 2: Trace line-by-line what happens when Python executes the statement.",
          "Step 3: Verify the output matches expectations without side effects."
        ],
        code: topic.codeExample,
        explanation: "Notice how breaking down the execution line-by-line prevents cognitive overload and clarifies state transitions."
      },
      visual_representation: {
        type: "flowchart",
        description: "Visual flow: [Input State] -> [Step-by-step Transformation] -> [Verified Output]",
        diagram_text: `+--------------------+       +-------------------------+       +----------------------+\n|   Input Expression  |  -->  |  Evaluation / Execution  |  -->  |    Clean Result      |\n+--------------------+       +-------------------------+       +----------------------+`
      },
      practice_challenge: {
        instruction: isSimplified
          ? `Let's solve this in small bite-sized steps! Modify the code below to print the expected output:`
          : `Advanced Challenge: Complete the implementation considering optimal edge case handling:`,
        starter_code: topic.practice.starterCode,
        solution: topic.practice.solution,
        hint: topic.practice.hint
      },
      knowledge_check: topic.quiz.slice(0, 2).map((q, idx) => ({
        id: `adapted-q-${idx + 1}`,
        question: q.question,
        options: q.options,
        correct_index: q.correctIndex,
        explanation: q.explanation
      })),
      key_takeaways: [
        `Mastery of ${topic.title} builds the groundwork for subsequent modules.`,
        "Focus on tracing code step-by-step when encountering complex logic.",
        "Practice incremental testing: write 2 lines, run them, and verify output."
      ]
    };

    const stored = getStoredArray('cog_python_adapted', []);
    const existingIdx = stored.findIndex((a: any) => a.topic_id === topic.id);
    if (existingIdx >= 0) {
      stored[existingIdx] = adaptedLesson;
    } else {
      stored.push(adaptedLesson);
    }
    setStoredArray('cog_python_adapted', stored);

    return {
      success: true,
      cached: false,
      topic_id: topic.id,
      topic_title: topic.title,
      lesson_data: adaptedLesson
    };
  },

  getAdaptedLesson: async (topicId: string) => {
    const stored = getStoredArray('cog_python_adapted', []);
    const found = stored.find((a: any) => a.topic_id === topicId);
    if (found) {
      return {
        success: true,
        topic_id: topicId,
        topic_title: found.topic_title || topicId,
        lesson_data: found
      };
    }
    // If not found in storage, generate one on the fly
    return await mockHandlers.generateAdaptedLesson({ topic_id: topicId });
  }
};
