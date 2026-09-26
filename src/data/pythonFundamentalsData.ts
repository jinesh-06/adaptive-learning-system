export interface CommonMistake {
  mistake: string;
  correction: string;
  explanation: string;
}

export interface PracticeChallenge {
  prompt: string;
  starterCode: string;
  expectedOutputMatcher: string;
  hint: string;
  solution: string;
}

export interface TopicQuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface PythonTopic {
  id: string;
  number: number;
  numberDisplay: string; // e.g. "01"
  title: string;
  slug: string;
  shortDescription: string;
  difficulty: 'Beginner' | 'Intermediate';
  estimatedMinutes: number;
  prerequisiteId: string | null;

  // 12-Section Curriculum
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
  summary: string[];
}

export const PYTHON_FUNDAMENTALS_TOPICS: PythonTopic[] = [
  {
    id: 'top-py-intro',
    number: 1,
    numberDisplay: '01',
    title: 'Python Introduction',
    slug: 'python-introduction',
    shortDescription: 'Learn what Python is, how the bytecode interpreter executes instructions, and write your first program.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: null,
    learningObjectives: [
      'Understand how Python executes interpreted code line-by-line',
      'Learn the role of the print() statement and stdout stream',
      'Write, test, and debug your first valid Python program',
      'Avoid indentation pitfalls and basic command syntax mistakes'
    ],
    conceptExplanation: 'Python is a high-level, interpreted programming language known for its clean, readable syntax. Unlike compiled languages like C or C++ where entire files are compiled into machine binaries beforehand, Python translates code into intermediate bytecode (.pyc) which is then dynamically executed by the Python Virtual Machine (PVM).',
    simpleExample: {
      code: 'print("Hello, World!")',
      explanation: 'print() is a built-in Python function that outputs strings or values directly to the standard output console stream.'
    },
    syntax: 'print(object, ..., sep=\' \', end=\'\\n\', file=sys.stdout, flush=False)',
    codeExample: '# Greeting script\nuser_name = "Learner"\nprint("Welcome to Python Fundamentals,", user_name)\nprint("System status: Ready to code!")',
    expectedOutput: 'Welcome to Python Fundamentals, Learner\nSystem status: Ready to code!',
    stepByStep: [
      'The Python interpreter loads the script into memory and parses tokens sequentially.',
      'A string literal "Learner" is assigned to the identifier user_name.',
      'The print() function is called with two arguments separated by the default space delimiter.',
      'The output stream is flushed to the terminal screen.'
    ],
    commonMistakes: [
      {
        mistake: 'Print("Hello")',
        correction: 'print("Hello")',
        explanation: 'Python is strictly case-sensitive. "Print" is undefined; the built-in function is lowercase "print".'
      },
      {
        mistake: 'print "Hello"',
        correction: 'print("Hello")',
        explanation: 'In Python 3, print is a function and requires parentheses around its arguments.'
      }
    ],
    realWorldExample: {
      scenario: 'Cloud service health heartbeat script',
      code: 'service = "AuthenticationGateway"\nstatus = "ONLINE"\nprint(f"[HEALTH-CHECK] Service {service} is {status}.")',
      explanation: 'DevOps and backend monitoring agents execute lightweight Python scripts to periodically poll and report API status.'
    },
    practice: {
      prompt: 'Write a Python program that prints the exact message "Ready to learn Python!" to the console.',
      starterCode: '# Print the exact message below\n',
      expectedOutputMatcher: 'Ready to learn Python!',
      hint: 'Use print("Ready to learn Python!") and make sure punctuation and capitalization match exactly.',
      solution: 'print("Ready to learn Python!")'
    },
    quiz: [
      {
        id: 'q-py-intro-1',
        question: 'Which of the following describes how Python executes source code?',
        options: [
          'It compiles directly to x86 assembly before execution',
          'It compiles to bytecode and executes on the Python Virtual Machine (PVM)',
          'It only runs inside a web browser JavaScript engine',
          'It converts code into C++ headers'
        ],
        correctIndex: 1,
        explanation: 'Python compiles source code (.py) into intermediate bytecode (.pyc) which the PVM interprets line-by-line.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-intro-2',
        question: 'What is the exact output of: print("Python", "3", sep="-")?',
        options: ['Python 3', 'Python-3', 'Python3', 'SyntaxError'],
        correctIndex: 1,
        explanation: 'The sep parameter specifies the separator character placed between multiple arguments (here, a hyphen).',
        difficulty: 'easy'
      }
    ],
    summary: [
      'Python is an interpreted, dynamically typed language optimized for readability and developer productivity.',
      'The print() function sends textual data to the standard output console stream.',
      'Identifiers and keywords are case-sensitive.'
    ]
  },
  {
    id: 'top-py-variables-datatypes',
    number: 2,
    numberDisplay: '02',
    title: 'Variables & Data Types',
    slug: 'variables-data-types',
    shortDescription: 'Master variables as memory labels, dynamic typing, and fundamental types (int, float, str, bool).',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    prerequisiteId: 'top-py-intro',
    learningObjectives: [
      'Create and reassign variables without explicit type declarations',
      'Distinguish fundamental data types: int, float, str, and bool',
      'Inspect runtime types using the built-in type() function',
      'Understand type casting and memory reference bindings'
    ],
    conceptExplanation: 'In Python, a variable is not an empty bucket of a fixed type; it is a named reference (label) pointing to an object stored in heap memory. Python uses dynamic typing, meaning the type of a variable is inferred automatically at runtime based on the value assigned to it.',
    simpleExample: {
      code: 'score = 95\nplayer = "Alice"\nis_active = True\nprint(type(score), type(player), type(is_active))',
      explanation: 'score binds to an int, player binds to a str, and is_active binds to a bool object.'
    },
    syntax: 'variable_name = expression',
    codeExample: 'temperature = 36.6\nstatus = "Normal"\nreading_count = 10\nprint(f"Reading {reading_count}: {temperature}°C ({status})")',
    expectedOutput: 'Reading 10: 36.6°C (Normal)',
    stepByStep: [
      'The float literal 36.6 is instantiated in memory and labeled by temperature.',
      'The string "Normal" is instantiated and labeled by status.',
      'The integer 10 is instantiated and labeled by reading_count.',
      'The f-string evaluates expressions inside curly braces {} and prints the formatted string.'
    ],
    commonMistakes: [
      {
        mistake: '2nd_score = 100',
        correction: 'score_2 = 100',
        explanation: 'Variable names cannot start with numbers. They must begin with a letter or an underscore.'
      },
      {
        mistake: 'total = "50" + 25',
        correction: 'total = int("50") + 25',
        explanation: 'Python does not implicitly coerce strings to integers. You must explicitly cast using int().'
      }
    ],
    realWorldExample: {
      scenario: 'E-commerce shopping cart item model',
      code: 'sku = "LAPTOP-X1"\nprice = 1299.99\nquantity = 2\nin_stock = True\ntotal = price * quantity\nprint(f"Total for {quantity}x {sku}: ${total:.2f}")',
      explanation: 'Online stores store item prices as floating-point numbers or decimals, quantities as integers, and stock availability as booleans.'
    },
    practice: {
      prompt: 'Declare a variable called points with the value 50, then increment it by 25 and print the final value.',
      starterCode: '# Declare points and add 25\npoints = 50\n',
      expectedOutputMatcher: '75',
      hint: 'You can increment using points = points + 25 or the shorthand points += 25, then call print(points).',
      solution: 'points = 50\npoints += 25\nprint(points)'
    },
    quiz: [
      {
        id: 'q-py-var-1',
        question: 'What is the output of type("123") in Python?',
        options: ['<class \'int\'>', '<class \'str\'>', '<class \'number\'>', '<class \'float\'>'],
        correctIndex: 1,
        explanation: 'Any characters enclosed in double or single quotes are stored as string (str) objects.',
        difficulty: 'easy'
      },
      {
        id: 'q-py-var-2',
        question: 'Which of the following is an INVALID variable name in Python?',
        options: ['_item_count', 'user_age_2', '2_users', 'totalScore'],
        correctIndex: 2,
        explanation: 'Identifiers in Python cannot start with a numeric digit.',
        difficulty: 'easy'
      }
    ],
    summary: [
      'Variables are dynamic labels referencing objects in memory.',
      'Core primitive types are int, float, str, and bool.',
      'Use type() to inspect object type and int(), float(), str() to perform explicit type conversions.'
    ]
  },
  {
    id: 'top-py-input-output',
    number: 3,
    numberDisplay: '03',
    title: 'Input & Output',
    slug: 'input-output',
    shortDescription: 'Capture terminal user input, typecast string inputs, and format dynamic outputs with f-strings.',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    prerequisiteId: 'top-py-variables-datatypes',
    learningObjectives: [
      'Collect interactive user data using the input() function',
      'Understand that input() always returns a string (str)',
      'Convert user input to numerical types safely',
      'Format output using modern Python f-strings'
    ],
    conceptExplanation: 'Programs need to receive data from users and present computed results cleanly. Python provides input(prompt) which pauses execution, awaits keyboard entry until Enter is pressed, and returns the entered characters as a string. f-strings (formatted string literals) allow embedding expressions directly inside string constants.',
    simpleExample: {
      code: 'user_name = "Alex"\nage = 24\nprint(f"User {user_name} is {age} years old.")',
      explanation: 'f-strings prefixed with "f" automatically evaluate variable names and expressions placed inside {} brackets.'
    },
    syntax: 'user_val = input("Prompt: ")\nf"Text {variable_or_expression}"',
    codeExample: 'name = "Dev"\nyears = 3\nprint(f"Developer: {name}")\nprint(f"Experience: {years} years ({years * 12} months)")',
    expectedOutput: 'Developer: Dev\nExperience: 3 years (36 months)',
    stepByStep: [
      'The variable name stores the string "Dev".',
      'The variable years stores the integer 3.',
      'The expression {years * 12} is computed inline inside the f-string, producing 36.',
      'The formatted text is written to standard output.'
    ],
    commonMistakes: [
      {
        mistake: 'age = input("Age: ") \nnext_year = age + 1',
        correction: 'age = int(input("Age: ")) \nnext_year = age + 1',
        explanation: 'input() returns strings. Adding an int to a str causes a TypeError: can only concatenate str to str.'
      }
    ],
    realWorldExample: {
      scenario: 'CLI Configuration Prompt',
      code: 'host = "127.0.0.1"\nport = 8080\nprint(f"Connecting to database at {host}:{port}...")',
      explanation: 'Command-line utilities prompt administrators for server hosts and ports before launching network daemons.'
    },
    practice: {
      prompt: 'Using variables item = "Book" and price = 15, print an f-string output: "Item: Book costs $15".',
      starterCode: 'item = "Book"\nprice = 15\n# Print f-string below\n',
      expectedOutputMatcher: 'Item: Book costs $15',
      hint: 'Use print(f"Item: {item} costs ${price}").',
      solution: 'item = "Book"\nprice = 15\nprint(f"Item: {item} costs ${price}")'
    },
    quiz: [
      {
        id: 'q-py-io-1',
        question: 'What is the return data type of the input() function in Python 3?',
        options: ['int', 'str', 'any', 'Depends on what the user types'],
        correctIndex: 1,
        explanation: 'input() always returns a str. Even if the user types 42, the return value is "42".',
        difficulty: 'easy'
      }
    ],
    summary: [
      'input(prompt) reads a line from stdin as a string.',
      'Explicit conversion with int() or float() is required for mathematical processing.',
      'f-strings f"..." offer the most readable, performant string interpolation in Python 3.'
    ]
  },
  {
    id: 'top-py-operators',
    number: 4,
    numberDisplay: '04',
    title: 'Operators',
    slug: 'operators',
    shortDescription: 'Perform arithmetic, boolean logic (and/or/not), comparison, and identity checks.',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    prerequisiteId: 'top-py-input-output',
    learningObjectives: [
      'Master arithmetic operators (+, -, *, /, //, %, **)',
      'Apply comparison operators (==, !=, <, >, <=, >=)',
      'Construct boolean logic using and, or, and not',
      'Distinguish value equality (==) from memory identity (is)'
    ],
    conceptExplanation: 'Operators are special symbols that execute arithmetic, relational, or logical computations on operands. Python provides integer floor division (//), modulo remainder (%), and power (**), along with word-based logical operators (and, or, not).',
    simpleExample: {
      code: 'print(10 // 3)   # 3 (Floor division)\nprint(10 % 3)    # 1 (Remainder)\nprint(2 ** 3)    # 8 (Power)',
      explanation: '// discards decimal portions, % gives the remainder, and ** raises base to an exponent.'
    },
    syntax: 'res = a + b | a // b | a % b | (x > 5 and y < 10)',
    codeExample: 'total_seconds = 125\nminutes = total_seconds // 60\nseconds = total_seconds % 60\nprint(f"{total_seconds} seconds = {minutes}m {seconds}s")',
    expectedOutput: '125 seconds = 2m 5s',
    stepByStep: [
      '125 // 60 calculates whole minutes (2).',
      '125 % 60 computes remaining seconds (5).',
      'f-string formats the result into "2m 5s".'
    ],
    commonMistakes: [
      {
        mistake: 'if a = 10:',
        correction: 'if a == 10:',
        explanation: 'Single equal sign = is assignment; double equal == tests equality.'
      },
      {
        mistake: 'if a && b:',
        correction: 'if a and b:',
        explanation: 'Python uses the English words "and", "or", and "not" instead of C-style symbols &&, ||, !.'
      }
    ],
    realWorldExample: {
      scenario: 'Pagination calculation',
      code: 'total_items = 45\nitems_per_page = 10\ntotal_pages = (total_items + items_per_page - 1) // items_per_page\nprint(f"Pages needed: {total_pages}")',
      explanation: 'Web applications calculate pagination offsets using ceiling floor arithmetic.'
    },
    practice: {
      prompt: 'Given num = 17, calculate its remainder when divided by 5 and print the result.',
      starterCode: 'num = 17\n# Calculate remainder with 5 and print\n',
      expectedOutputMatcher: '2',
      hint: 'Use the modulo operator %: print(num % 5).',
      solution: 'num = 17\nprint(num % 5)'
    },
    quiz: [
      {
        id: 'q-py-op-1',
        question: 'What is the output of 7 // 2 in Python 3?',
        options: ['3.5', '3', '4', '1'],
        correctIndex: 1,
        explanation: '// is floor division, which rounds down to the nearest integer (3).',
        difficulty: 'easy'
      }
    ],
    summary: [
      'Python supports full arithmetic with // for floor division and ** for power.',
      'Logical operations use and, or, not.',
      'Comparison operators return True or False boolean values.'
    ]
  },
  {
    id: 'top-py-conditionals',
    number: 5,
    numberDisplay: '05',
    title: 'Conditional Statements',
    slug: 'conditional-statements',
    shortDescription: 'Direct control flow with if, elif, else branches and logical decision trees.',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    prerequisiteId: 'top-py-operators',
    learningObjectives: [
      'Understand indentation-based code blocks in Python',
      'Implement if, elif, and else conditional branching',
      'Use nested conditionals safely',
      'Write ternary conditional expressions'
    ],
    conceptExplanation: 'Conditional statements permit selective execution of code blocks depending on whether a boolean expression evaluates to True or False. Python uses 4-space indentation to define scope rather than curly braces {}.',
    simpleExample: {
      code: 'score = 85\nif score >= 90:\n    print("Grade: A")\nelif score >= 80:\n    print("Grade: B")\nelse:\n    print("Grade: C")',
      explanation: 'Python checks conditions in top-down order and executes only the first matching branch.'
    },
    syntax: 'if condition:\n    pass\nelif other_condition:\n    pass\nelse:\n    pass',
    codeExample: 'temperature = 28\nif temperature > 30:\n    alert = "Heat Advisory"\nelif temperature >= 20:\n    alert = "Pleasant"\nelse:\n    alert = "Chilly"\nprint(f"Weather: {alert}")',
    expectedOutput: 'Weather: Pleasant',
    stepByStep: [
      'Evaluates temperature > 30 (28 > 30 is False).',
      'Evaluates elif temperature >= 20 (28 >= 20 is True).',
      'Assigns "Pleasant" to alert and bypasses the else clause.',
      'Prints the result.'
    ],
    commonMistakes: [
      {
        mistake: 'if x > 5\n    print("Greater")',
        correction: 'if x > 5:\n    print("Greater")',
        explanation: 'A colon (:) is mandatory at the end of every conditional header line.'
      }
    ],
    realWorldExample: {
      scenario: 'Access control gatekeeper',
      code: 'role = "admin"\nis_authenticated = True\nif is_authenticated and role == "admin":\n    print("ACCESS GRANTED: Full administrative privileges.")\nelse:\n    print("ACCESS DENIED: Insufficient permissions.")',
      explanation: 'Web servers inspect token roles before allowing access to privileged API routes.'
    },
    practice: {
      prompt: 'Given number = -5, write an if-else statement to print "Negative" if number < 0, else "Positive".',
      starterCode: 'number = -5\n# Write if-else below\n',
      expectedOutputMatcher: 'Negative',
      hint: 'if number < 0: print("Negative") else: print("Positive")',
      solution: 'number = -5\nif number < 0:\n    print("Negative")\nelse:\n    print("Positive")'
    },
    quiz: [
      {
        id: 'q-py-cond-1',
        question: 'What happens if multiple elif conditions evaluate to True?',
        options: [
          'All matching elif blocks execute sequentially',
          'Only the first matching elif block executes',
          'A SyntaxError is raised',
          'Only the last matching elif executes'
        ],
        correctIndex: 1,
        explanation: 'Python evaluates if/elif chains sequentially and exits the entire statement as soon as the first True branch finishes.',
        difficulty: 'medium'
      }
    ],
    summary: [
      'Control flow branches depend on boolean expressions.',
      'Colons and consistent indentation (4 spaces) define block scope.',
      'if, elif, and else chains execute at most one matching branch.'
    ]
  },
  {
    id: 'top-py-loops',
    number: 6,
    numberDisplay: '06',
    title: 'Loops',
    slug: 'loops',
    shortDescription: 'Master for loops, while loops, range generation, break, and continue constructs.',
    difficulty: 'Beginner',
    estimatedMinutes: 30,
    prerequisiteId: 'top-py-conditionals',
    learningObjectives: [
      'Iterate over sequences and numbers using for loops and range()',
      'Construct condition-driven while loops with termination guarantees',
      'Use break to terminate loops early and continue to skip iterations',
      'Understand loop else clauses'
    ],
    conceptExplanation: 'Loops automate repetitive tasks. A for loop iterates over elements of an iterable (lists, strings, range()), while a while loop repeatedly executes while a condition remains True.',
    simpleExample: {
      code: 'for i in range(1, 4):\n    print(f"Step {i}")',
      explanation: 'range(1, 4) produces values 1, 2, 3 (stopping before 4).'
    },
    syntax: 'for item in iterable:\n    pass\n\nwhile condition:\n    pass',
    codeExample: 'total = 0\nfor n in [10, 20, 30]:\n    total += n\nprint(f"Accumulated total: {total}")',
    expectedOutput: 'Accumulated total: 60',
    stepByStep: [
      'Initializes total = 0.',
      'First iteration: n = 10, total becomes 10.',
      'Second iteration: n = 20, total becomes 30.',
      'Third iteration: n = 30, total becomes 60.',
      'Prints the accumulated sum.'
    ],
    commonMistakes: [
      {
        mistake: 'i = 0\nwhile i < 5:\n    print(i)\n    # Forgot i += 1',
        correction: 'i = 0\nwhile i < 5:\n    print(i)\n    i += 1',
        explanation: 'Failing to advance loop state inside while loops causes infinite loops that freeze processes.'
      }
    ],
    realWorldExample: {
      scenario: 'Retry network request with exponential backoff',
      code: 'attempts = 0\nsuccess = False\nwhile attempts < 3 and not success:\n    attempts += 1\n    if attempts == 2:\n        success = True\nprint(f"Connected on attempt {attempts}")',
      explanation: 'Network clients use bounded while loops to retry socket handshakes safely.'
    },
    practice: {
      prompt: 'Write a loop that prints the numbers from 1 to 3, each on its own line.',
      starterCode: '# Print 1, 2, 3 using a for loop\n',
      expectedOutputMatcher: '1\n2\n3',
      hint: 'Use for i in range(1, 4): print(i).',
      solution: 'for i in range(1, 4):\n    print(i)'
    },
    quiz: [
      {
        id: 'q-py-loop-1',
        question: 'What is the output of list(range(2, 6))?',
        options: ['[2, 3, 4, 5, 6]', '[2, 3, 4, 5]', '[3, 4, 5, 6]', '[2, 4, 6]'],
        correctIndex: 1,
        explanation: 'range(start, stop) stops before reaching the stop value.',
        difficulty: 'easy'
      }
    ],
    summary: [
      'for loops iterate directly across sequences.',
      'while loops repeat until their condition turns False.',
      'break terminates loops; continue skips to the next iteration.'
    ]
  },
  {
    id: 'top-py-functions',
    number: 7,
    numberDisplay: '07',
    title: 'Functions',
    slug: 'functions',
    shortDescription: 'Write modular code with def, parameters, default arguments, return statements, and LEGB scoping.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisiteId: 'top-py-loops',
    learningObjectives: [
      'Define functions using def and return computed values',
      'Utilize positional, keyword, and default parameters',
      'Understand variable scopes: Local, Enclosing, Global, Built-in (LEGB)',
      'Write clean docstrings for code maintainability'
    ],
    conceptExplanation: 'Functions are self-contained blocks of reusable code designed to perform a single logical task. Functions take arguments, process them, and return a value to the caller using return.',
    simpleExample: {
      code: 'def add(a, b=5):\n    return a + b\n\nprint(add(10))\nprint(add(10, 20))',
      explanation: 'b has a default value of 5 when omitted. Calling add(10) returns 15; add(10, 20) returns 30.'
    },
    syntax: 'def function_name(param1, param2=default):\n    """Docstring."""\n    return result',
    codeExample: 'def calculate_tax(subtotal, rate=0.08):\n    return round(subtotal * rate, 2)\n\ntax = calculate_tax(100.0)\nprint(f"Tax: ${tax}")',
    expectedOutput: 'Tax: $8.0',
    stepByStep: [
      'The function calculate_tax is registered in global scope.',
      'Calling calculate_tax(100.0) binds subtotal = 100.0 and rate = 0.08.',
      'Computes 100.0 * 0.08 = 8.0 and returns it.',
      'The caller assigns 8.0 to variable tax and prints.'
    ],
    commonMistakes: [
      {
        mistake: 'def multiply(a, b):\n    print(a * b)\nres = multiply(2, 3) * 2',
        correction: 'def multiply(a, b):\n    return a * b\nres = multiply(2, 3) * 2',
        explanation: 'print() displays to stdout, but returns None. You must return values to use them in calculations.'
      }
    ],
    realWorldExample: {
      scenario: 'Data validation pipeline function',
      code: 'def is_valid_email(email):\n    return "@" in email and "." in email\n\nprint("Valid:", is_valid_email("dev@python.org"))',
      explanation: 'Authentication libraries wrap input verification into dedicated, testable functions.'
    },
    practice: {
      prompt: 'Write a function called square(n) that returns the square of n, then print square(4).',
      starterCode: '# Define square(n) below\n\n# Call and print square(4)\n',
      expectedOutputMatcher: '16',
      hint: 'def square(n): return n * n. Then print(square(4)).',
      solution: 'def square(n):\n    return n * n\n\nprint(square(4))'
    },
    quiz: [
      {
        id: 'q-py-fn-1',
        question: 'What is returned by a Python function that does not contain an explicit return statement?',
        options: ['0', 'None', 'False', 'Undefined'],
        correctIndex: 1,
        explanation: 'All Python functions return None implicitly if no return statement is executed.',
        difficulty: 'easy'
      }
    ],
    summary: [
      'Functions encapsulate logic and promote code reuse.',
      'Use return to send values back to callers.',
      'Parameters can have default values.'
    ]
  },
  {
    id: 'top-py-strings',
    number: 8,
    numberDisplay: '08',
    title: 'Strings',
    slug: 'strings',
    shortDescription: 'Manipulate textual data with zero-indexed slicing, case formatting, stripping, and splitting.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisiteId: 'top-py-functions',
    learningObjectives: [
      'Index and slice strings with [start:stop:step]',
      'Use string methods: upper(), lower(), strip(), replace(), split()',
      'Understand string immutability in memory',
      'Join string collections using .join()'
    ],
    conceptExplanation: 'Strings in Python are immutable sequences of Unicode characters. Slicing with [start:stop:step] extracts substrings without mutating the original text.',
    simpleExample: {
      code: 'text = "Python"\nprint(text[0])       # P (First character)\nprint(text[1:4])     # yth (Slice)\nprint(text[::-1])    # nohtyP (Reverse)',
      explanation: 'Slicing uses zero-based indexing and negative strides to step backward.'
    },
    syntax: 'string[start:stop:step]\nstring.method()',
    codeExample: 'raw_data = "  alice,engineer,active  "\nfields = [f.strip().capitalize() for f in raw_data.split(",") if f.strip()]\nprint(" | ".join(fields))',
    expectedOutput: 'Alice | Engineer | Active',
    stepByStep: [
      'split(",") divides the string into tokens by comma.',
      'strip() removes surrounding whitespace.',
      'capitalize() formats the first letter uppercase.',
      '" | ".join() joins the tokens with a separator.'
    ],
    commonMistakes: [
      {
        mistake: 's = "hello"\ns[0] = "H"',
        correction: 's = "H" + s[1:]',
        explanation: 'Strings are immutable. You cannot assign to individual string indices.'
      }
    ],
    realWorldExample: {
      scenario: 'Cleaning CSV record columns',
      code: 'raw_phone = "(555) 019-2834"\nclean_digits = "".join(c for c in raw_phone if c.isdigit())\nprint(f"Normalized: {clean_digits}")',
      explanation: 'Data engineering ETL pipelines normalize raw phone numbers and codes before storing in databases.'
    },
    practice: {
      prompt: 'Given word = "developer", print the first 4 characters using string slicing.',
      starterCode: 'word = "developer"\n# Print slice of first 4 characters\n',
      expectedOutputMatcher: 'deve',
      hint: 'Slice from 0 to 4: print(word[:4]).',
      solution: 'word = "developer"\nprint(word[:4])'
    },
    quiz: [
      {
        id: 'q-py-str-1',
        question: 'What is the output of "hello".upper()?',
        options: ['HELLO', 'Hello', 'hello', 'TypeError'],
        correctIndex: 0,
        explanation: 'upper() returns a new string with all lowercase letters converted to uppercase.',
        difficulty: 'easy'
      }
    ],
    summary: [
      'Strings are immutable sequences of Unicode characters.',
      'Slice syntax [start:stop:step] enables powerful substring extraction.',
      'Methods like split(), strip(), and replace() return new strings.'
    ]
  },
  {
    id: 'top-py-lists',
    number: 9,
    numberDisplay: '09',
    title: 'Lists',
    slug: 'lists',
    shortDescription: 'Master mutable ordered lists, slicing, sorting, filtering, and list comprehensions.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisiteId: 'top-py-strings',
    learningObjectives: [
      'Create and mutate lists using append(), insert(), pop(), remove()',
      'Slice and sort lists in-place vs sorted()',
      'Construct expressive, high-speed list comprehensions',
      'Understand reference copying vs shallow/deep copying'
    ],
    conceptExplanation: 'Lists are mutable, ordered collections capable of storing heterogeneous data types. Because they are mutable, elements can be added, modified, or removed in-place without creating a new list.',
    simpleExample: {
      code: 'nums = [1, 2, 3]\nnums.append(4)\nprint(nums)  # [1, 2, 3, 4]',
      explanation: 'append() adds an item to the end of the list in O(1) amortized time.'
    },
    syntax: 'my_list = [item1, item2]\n[expr for item in iterable if condition]',
    codeExample: 'scores = [45, 88, 72, 95, 60]\npassing = [s for s in scores if s >= 70]\nprint(f"Passing scores: {sorted(passing)}")',
    expectedOutput: 'Passing scores: [72, 88, 95]',
    stepByStep: [
      'List comprehension filters elements >= 70 into passing.',
      'sorted(passing) returns a new sorted list in ascending order.',
      'Prints the sorted list.'
    ],
    commonMistakes: [
      {
        mistake: 'a = [1, 2]\nb = a\nb.append(3)\n# Expect a to be [1, 2]',
        correction: 'b = a.copy()',
        explanation: 'b = a creates an alias referencing the same list. Modifying b mutates a. Use a.copy() for shallow copy.'
      }
    ],
    realWorldExample: {
      scenario: 'Filtering analytics log event codes',
      code: 'http_codes = [200, 200, 404, 500, 200, 403]\nerrors = [c for c in http_codes if c >= 400]\nprint(f"Error count: {len(errors)}")',
      explanation: 'Web log analyzers filter and report HTTP client and server error frequencies.'
    },
    practice: {
      prompt: 'Create a list numbers = [1, 2, 3], append the number 4 to it, and print the list.',
      starterCode: 'numbers = [1, 2, 3]\n# Append 4 and print\n',
      expectedOutputMatcher: '[1, 2, 3, 4]',
      hint: 'numbers.append(4) then print(numbers).',
      solution: 'numbers = [1, 2, 3]\nnumbers.append(4)\nprint(numbers)'
    },
    quiz: [
      {
        id: 'q-py-list-1',
        question: 'Which method removes and returns the last element of a Python list?',
        options: ['remove()', 'pop()', 'delete()', 'extract()'],
        correctIndex: 1,
        explanation: 'pop() removes and returns the element at the given index (defaulting to the last element).',
        difficulty: 'easy'
      }
    ],
    summary: [
      'Lists are ordered, mutable sequences.',
      'List comprehensions offer concise, fast filtering and mapping.',
      'Use .copy() or slice [:] to avoid accidental reference aliasing.'
    ]
  },
  {
    id: 'top-py-tuples',
    number: 10,
    numberDisplay: '10',
    title: 'Tuples',
    slug: 'tuples',
    shortDescription: 'Store immutable fixed sequences, tuple packing, unpacking, and coordinate pairs.',
    difficulty: 'Intermediate',
    estimatedMinutes: 20,
    prerequisiteId: 'top-py-lists',
    learningObjectives: [
      'Construct tuples and understand immutability benefits',
      'Perform tuple packing and multiple-assignment unpacking',
      'Use single-element tuples with trailing commas',
      'Use tuples as immutable dictionary keys'
    ],
    conceptExplanation: 'Tuples are immutable ordered sequences defined with parentheses (). Because they cannot be mutated, tuples are memory-efficient, faster than lists, and can be used as keys in dictionaries.',
    simpleExample: {
      code: 'point = (10, 20)\nx, y = point\nprint(f"X: {x}, Y: {y}")',
      explanation: 'Tuple unpacking assigns elements to x and y in a single statement.'
    },
    syntax: 'tup = (item1, item2)\nsingle = (item,)',
    codeExample: 'def get_dimensions():\n    return 1920, 1080\n\nwidth, height = get_dimensions()\nprint(f"Resolution: {width}x{height}")',
    expectedOutput: 'Resolution: 1920x1080',
    stepByStep: [
      'get_dimensions packs 1920 and 1080 into a tuple.',
      'The caller unpacks the returned tuple into width and height.',
      'Prints the resolution.'
    ],
    commonMistakes: [
      {
        mistake: 'single = (5)\nprint(type(single))  # int!',
        correction: 'single = (5,)\nprint(type(single))  # tuple',
        explanation: 'A trailing comma is mandatory for single-element tuples; otherwise parentheses are treated as grouping.'
      }
    ],
    realWorldExample: {
      scenario: 'Geographic GPS coordinate representation',
      code: 'location = (37.7749, -122.4194)\nlat, lon = location\nprint(f"Lat: {lat}, Lon: {lon}")',
      explanation: 'GPS coordinates are fixed coordinates that should never be mutated unexpectedly in memory.'
    },
    practice: {
      prompt: 'Create a tuple pair = (100, 200), unpack it into a and b, and print a + b.',
      starterCode: 'pair = (100, 200)\n# Unpack into a and b, then print sum\n',
      expectedOutputMatcher: '300',
      hint: 'a, b = pair then print(a + b).',
      solution: 'pair = (100, 200)\na, b = pair\nprint(a + b)'
    },
    quiz: [
      {
        id: 'q-py-tup-1',
        question: 'Which of the following creates a valid single-element tuple containing the integer 10?',
        options: ['t = (10)', 't = (10,)', 't = tuple[10]', 't = [10]'],
        correctIndex: 1,
        explanation: 'A trailing comma (10,) is required to distinguish a single-item tuple from parenthesized arithmetic.',
        difficulty: 'medium'
      }
    ],
    summary: [
      'Tuples are immutable; once instantiated, their elements cannot be changed.',
      'Tuple unpacking makes returning multiple values from functions clean and pythonic.',
      'Single-item tuples require a trailing comma: (val,).'
    ]
  },
  {
    id: 'top-py-sets',
    number: 11,
    numberDisplay: '11',
    title: 'Sets',
    slug: 'sets',
    shortDescription: 'Manage unique collections, fast O(1) membership tests, and mathematical set operations.',
    difficulty: 'Intermediate',
    estimatedMinutes: 20,
    prerequisiteId: 'top-py-tuples',
    learningObjectives: [
      'Create sets and understand automatic deduplication',
      'Perform set union (|), intersection (&), and difference (-)',
      'Use sets for high-speed O(1) membership tests',
      'Distinguish remove() from discard()'
    ],
    conceptExplanation: 'Sets are unordered, mutable collections of unique, hashable elements defined using curly braces {}. Sets cannot contain duplicate values and deliver O(1) average lookup times.',
    simpleExample: {
      code: 's = {1, 2, 2, 3}\nprint(s)  # {1, 2, 3} (Duplicates removed)',
      explanation: 'Duplicate values are automatically pruned during set creation.'
    },
    syntax: 's = {item1, item2}\ns.union(other) | s | other\ns.intersection(other) | s & other',
    codeExample: 'frontend = {"HTML", "CSS", "JS", "React"}\nbackend = {"Python", "SQL", "JS", "Docker"}\nboth = frontend & backend\nprint(f"Shared skills: {sorted(both)}")',
    expectedOutput: "Shared skills: ['JS']",
    stepByStep: [
      'frontend set contains 4 web technologies.',
      'backend set contains 4 server technologies.',
      '& computes the intersection of both sets.',
      'Only "JS" exists in both, which is sorted and printed.'
    ],
    commonMistakes: [
      {
        mistake: 'empty_set = {}',
        correction: 'empty_set = set()',
        explanation: '{} creates an empty dictionary. You must call set() to create an empty set.'
      }
    ],
    realWorldExample: {
      scenario: 'Deduplicating visitor IP logs',
      code: 'ips = ["1.1.1.1", "2.2.2.2", "1.1.1.1", "3.3.3.3"]\nunique_ips = set(ips)\nprint(f"Unique visitors: {len(unique_ips)}")',
      explanation: 'Web servers track unique visitors by adding IP addresses to an in-memory hash set.'
    },
    practice: {
      prompt: 'Given items = [1, 2, 2, 3, 3, 3], convert it to a set to remove duplicates, and print the length of the set.',
      starterCode: 'items = [1, 2, 2, 3, 3, 3]\n# Convert to set and print length\n',
      expectedOutputMatcher: '3',
      hint: 'unique = set(items); print(len(unique))',
      solution: 'items = [1, 2, 2, 3, 3, 3]\nprint(len(set(items)))'
    },
    quiz: [
      {
        id: 'q-py-set-1',
        question: 'What is the syntax to create an empty set in Python?',
        options: ['{}', 'set()', '[]', '()'],
        correctIndex: 1,
        explanation: '{} creates an empty dict; set() creates an empty set.',
        difficulty: 'easy'
      }
    ],
    summary: [
      'Sets store unique elements only and discard duplicates.',
      'Membership testing (item in s) is O(1) average time.',
      'Supports mathematical operations: union |, intersection &, and difference -.'
    ]
  },
  {
    id: 'top-py-dictionaries',
    number: 12,
    numberDisplay: '12',
    title: 'Dictionaries',
    slug: 'dictionaries',
    shortDescription: 'Model key-value pairs, hash map operations, get() fallbacks, and dictionary iteration.',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisiteId: 'top-py-sets',
    learningObjectives: [
      'Store and access data with key-value pairs',
      'Use dict.get(key, default) to prevent KeyErrors',
      'Iterate over keys, values, and items()',
      'Update and merge dictionaries with update() and unpacking'
    ],
    conceptExplanation: 'Dictionaries are mutable mappings of unique, hashable keys to values. They are implemented as hash tables, delivering O(1) average time complexity for lookups, insertions, and deletions.',
    simpleExample: {
      code: 'user = {"name": "Alice", "role": "admin"}\nprint(user["name"])\nprint(user.get("email", "N/A"))',
      explanation: 'Bracket access retrieves known keys; .get() provides safe fallback for missing keys.'
    },
    syntax: 'dict = {key: value}\ndict.get(key, default)\nfor k, v in dict.items():',
    codeExample: 'student = {"name": "Bob", "math": 90, "science": 85}\ntotal = student["math"] + student["science"]\nprint(f"{student[\'name\']} Total: {total}")',
    expectedOutput: 'Bob Total: 175',
    stepByStep: [
      'student dictionary is initialized with 3 key-value pairs.',
      'student["math"] retrieves 90; student["science"] retrieves 85.',
      'Computes 90 + 85 = 175.',
      'Formats and prints the result.'
    ],
    commonMistakes: [
      {
        mistake: 'val = user["missing_key"]',
        correction: 'val = user.get("missing_key", "default")',
        explanation: 'Direct bracket indexing on a missing key raises a KeyError. Use .get() to return a safe default.'
      }
    ],
    realWorldExample: {
      scenario: 'REST API JSON payload mapping',
      code: 'api_response = {"status": 200, "user_id": 4012, "verified": True}\nif api_response.get("verified"):\n    print(f"User {api_response[\'user_id\']} authorized.")',
      explanation: 'Backend services represent JSON payloads as nested Python dictionaries.'
    },
    practice: {
      prompt: 'Given person = {"name": "Sara", "age": 28}, print the value associated with the key "age".',
      starterCode: 'person = {"name": "Sara", "age": 28}\n# Print age\n',
      expectedOutputMatcher: '28',
      hint: 'print(person["age"])',
      solution: 'person = {"name": "Sara", "age": 28}\nprint(person["age"])'
    },
    quiz: [
      {
        id: 'q-py-dict-1',
        question: 'What is the average time complexity for searching a key in a Python dictionary?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'],
        correctIndex: 0,
        explanation: 'Dictionaries use hash tables under the hood, yielding O(1) amortized constant time lookups.',
        difficulty: 'easy'
      }
    ],
    summary: [
      'Dictionaries store key-value associations in a hash table.',
      'Keys must be immutable and hashable (strings, numbers, tuples).',
      'Use .get() for safe lookups that avoid KeyErrors.'
    ]
  },
  {
    id: 'top-py-exceptions',
    number: 13,
    numberDisplay: '13',
    title: 'Basic Exception Handling',
    slug: 'basic-exception-handling',
    shortDescription: 'Catch errors gracefully using try, except, else, and finally blocks to prevent crashes.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisiteId: 'top-py-dictionaries',
    learningObjectives: [
      'Catch runtime errors using try and except blocks',
      'Target specific exception types: ValueError, ZeroDivisionError, KeyError',
      'Use else for success execution and finally for mandatory cleanup',
      'Raise exceptions intentionally using raise'
    ],
    conceptExplanation: 'Exceptions are runtime errors that disrupt the normal execution flow when an error occurs. Rather than letting the program crash, try and except blocks catch exceptions and allow graceful recovery.',
    simpleExample: {
      code: 'try:\n    res = 10 / 0\nexcept ZeroDivisionError:\n    print("Cannot divide by zero!")',
      explanation: 'The ZeroDivisionError is caught and handled safely without terminating the program.'
    },
    syntax: 'try:\n    # code\nexcept ExceptionType as e:\n    # handle\nelse:\n    # if no error\nfinally:\n    # always runs',
    codeExample: 'def safe_divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return "Error: Division by zero"\n\nprint(safe_divide(10, 2))\nprint(safe_divide(10, 0))',
    expectedOutput: '5.0\nError: Division by zero',
    stepByStep: [
      'Calling safe_divide(10, 2) executes successfully and returns 5.0.',
      'Calling safe_divide(10, 0) triggers a ZeroDivisionError.',
      'The except block catches the error and returns a clean error message.',
      'Both results are printed.'
    ],
    commonMistakes: [
      {
        mistake: 'except:\n    pass',
        correction: 'except ValueError as e:\n    logger.error(e)',
        explanation: 'Bare except catches everything, including KeyboardInterrupt (Ctrl+C) and system exit signals. Always catch specific exceptions.'
      }
    ],
    realWorldExample: {
      scenario: 'Parsing integer user input from query parameters',
      code: 'raw_param = "invalid"\ntry:\n    page = int(raw_param)\nexcept ValueError:\n    page = 1  # Safe fallback\nprint(f"Loading page: {page}")',
      explanation: 'Web applications sanitize and validate URL query strings by catching conversion ValueErrors.'
    },
    practice: {
      prompt: 'Write a try-except block that attempts to divide 20 by 0, catches ZeroDivisionError, and prints "Handled".',
      starterCode: '# Write try-except block below\n',
      expectedOutputMatcher: 'Handled',
      hint: 'try: x = 20 / 0 except ZeroDivisionError: print("Handled")',
      solution: 'try:\n    x = 20 / 0\nexcept ZeroDivisionError:\n    print("Handled")'
    },
    quiz: [
      {
        id: 'q-py-exc-1',
        question: 'When does a finally block execute in a try-except-finally construct?',
        options: [
          'Only when an exception occurs',
          'Only when no exception occurs',
          'Always, regardless of whether an exception occurred or was caught',
          'Only if the program terminates'
        ],
        correctIndex: 2,
        explanation: 'The finally block always runs during stack unwinding, guaranteeing resource cleanup.'
      }
    ],
    summary: [
      'try/except blocks prevent runtime crashes by catching exceptions.',
      'Always catch specific exceptions rather than bare except.',
      'finally blocks always execute, making them ideal for closing files and network sockets.'
    ]
  },
  {
    id: 'top-py-file-handling',
    number: 14,
    numberDisplay: '14',
    title: 'File Handling',
    slug: 'file-handling',
    shortDescription: 'Read, write, and safely append data to disk files using context managers (with open).',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    prerequisiteId: 'top-py-exceptions',
    learningObjectives: [
      'Open files in read (r), write (w), and append (a) modes',
      'Use context managers (with open(...)) to auto-close files',
      'Read files line-by-line and parse structured content',
      'Handle FileNotFoundError gracefully'
    ],
    conceptExplanation: 'Python handles files via built-in open() functions. The with statement acts as a context manager that guarantees the file descriptor is closed automatically upon exiting the block, even if an exception occurs.',
    simpleExample: {
      code: '# Reading safely with context manager\n# with open("data.txt", "r") as f:\n#     content = f.read()\nprint("File safely managed with context managers.")',
      explanation: 'Using with open() ensures automatic buffer flushing and stream closing.'
    },
    syntax: 'with open("filename.txt", "r", encoding="utf-8") as file:\n    content = file.read()',
    codeExample: '# Simulated memory stream file write/read\nlog_entries = ["INIT", "CONNECTED", "READY"]\nformatted_log = "\\n".join(f"[LOG] {entry}" for entry in log_entries)\nprint(formatted_log)',
    expectedOutput: '[LOG] INIT\n[LOG] CONNECTED\n[LOG] READY',
    stepByStep: [
      'A list of system log tokens is assembled.',
      'A join operation constructs a multi-line formatted string representing file lines.',
      'Prints the parsed file contents.'
    ],
    commonMistakes: [
      {
        mistake: 'f = open("file.txt", "w")\nf.write("data")\n# Forgot f.close()',
        correction: 'with open("file.txt", "w") as f:\n    f.write("data")',
        explanation: 'Without with open(), unclosed files leak system handles and can cause data corruption.'
      }
    ],
    realWorldExample: {
      scenario: 'Writing application audit logs',
      code: 'event = "USER_LOGIN_SUCCESS"\ntimestamp = "12:00:00"\nlog_line = f"{timestamp} - {event}"\nprint(f"Logged: {log_line}")',
      explanation: 'Backend applications record security events into append-only log files.'
    },
    practice: {
      prompt: 'Format and print a simulated file line: "config.json: status=active".',
      starterCode: '# Print the simulated config line below\n',
      expectedOutputMatcher: 'config.json: status=active',
      hint: 'print("config.json: status=active")',
      solution: 'print("config.json: status=active")'
    },
    quiz: [
      {
        id: 'q-py-file-1',
        question: 'Which file mode opens a file for writing, but truncates (overwrites) existing content?',
        options: ['"r"', '"w"', '"a"', '"x"'],
        correctIndex: 1,
        explanation: '"w" opens a file for writing and overwrites existing contents. "a" appends without truncation.',
        difficulty: 'easy'
      }
    ],
    summary: [
      'Always use with open(...) as f to guarantee file closing.',
      'Modes: "r" (read), "w" (overwrite), "a" (append).',
      'Handle FileNotFoundError when reading external files.'
    ]
  },
  {
    id: 'top-py-modules-packages',
    number: 15,
    numberDisplay: '15',
    title: 'Modules & Packages',
    slug: 'modules-packages',
    shortDescription: 'Structure projects with standard library modules, math, random, datetime, and imports.',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    prerequisiteId: 'top-py-file-handling',
    learningObjectives: [
      'Import modules using import, from ... import ..., and as aliases',
      'Explore Python Standard Library modules: math, random, datetime',
      'Understand how Python searches sys.path for modules',
      'Organize directories into packages using __init__.py'
    ],
    conceptExplanation: 'A module is simply a Python file (.py) containing functions, classes, and variables. A package is a directory of modules. The import statement allows sharing and reusing code across files without copying code.',
    simpleExample: {
      code: 'import math\nprint(math.sqrt(16))  # 4.0\nprint(math.pi)        # 3.14159...',
      explanation: 'import math loads Python’s optimized C-backed mathematical module into the script.'
    },
    syntax: 'import module_name\nfrom module_name import specific_function as alias',
    codeExample: 'import math\nradius = 5\narea = math.pi * (radius ** 2)\nprint(f"Circle area: {round(area, 2)}")',
    expectedOutput: 'Circle area: 78.54',
    stepByStep: [
      'The math standard module is imported.',
      'radius is squared: 5 ** 2 = 25.',
      'Multiplies by math.pi.',
      'Rounds the result to 2 decimal places and prints 78.54.'
    ],
    commonMistakes: [
      {
        mistake: 'from math import *\n# Pollutes global namespace',
        correction: 'import math\n# Or: from math import sqrt, pi',
        explanation: 'Wildcard imports (import *) pollute the namespace and can silently overwrite existing variables.'
      }
    ],
    realWorldExample: {
      scenario: 'Generating secure verification tokens',
      code: 'import random\ncode = random.randint(100000, 999999)\nprint(f"Verification Code: {code}")',
      explanation: 'Two-factor authentication services import random or secrets modules to generate OTP pin codes.'
    },
    practice: {
      prompt: 'Import the math module and print math.floor(9.8).',
      starterCode: '# Import math and print math.floor(9.8)\n',
      expectedOutputMatcher: '9',
      hint: 'import math; print(math.floor(9.8))',
      solution: 'import math\nprint(math.floor(9.8))'
    },
    quiz: [
      {
        id: 'q-py-mod-1',
        question: 'What file historically designates a directory as an importable Python package?',
        options: ['__main__.py', '__init__.py', 'setup.py', 'package.json'],
        correctIndex: 1,
        explanation: '__init__.py indicates to the Python interpreter that the directory should be treated as a package.',
        difficulty: 'medium'
      }
    ],
    summary: [
      'Modules break code into maintainable, reusable files.',
      'The Python standard library comes "batteries included" with math, random, json, etc.',
      'Avoid wildcard imports to prevent namespace collisions.'
    ]
  },
  {
    id: 'top-py-mini-projects',
    number: 16,
    numberDisplay: '16',
    title: 'Mini Projects',
    slug: 'mini-projects',
    shortDescription: 'Synthesize all 15 core concepts into end-to-end interactive applications and algorithmic tools.',
    difficulty: 'Intermediate',
    estimatedMinutes: 45,
    prerequisiteId: 'top-py-modules-packages',
    learningObjectives: [
      'Synthesize variables, loops, functions, lists, and dicts in a unified project',
      'Implement an interactive Number Guessing Game and Contact Manager',
      'Follow software engineering clean code standards',
      'Graduate from Python Fundamentals to Intermediate & OOP Track'
    ],
    conceptExplanation: 'The best way to solidify programming skills is building cohesive programs. This capstone combines state variables, conditional logic, looping constructs, structured data collections, and error handling into complete programs.',
    simpleExample: {
      code: 'def grade_calculator(scores):\n    avg = sum(scores) / len(scores)\n    return "Pass" if avg >= 60 else "Fail"\n\nprint("Result:", grade_calculator([75, 80, 90]))',
      explanation: 'Combines functions, list iteration with sum(), and conditional returns.'
    },
    syntax: '# End-to-end program pattern\n# 1. State setup\n# 2. Logic functions\n# 3. Main runner loop',
    codeExample: 'def run_inventory_summary():\n    inventory = {"Apples": 50, "Oranges": 35, "Bananas": 60}\n    total_units = sum(inventory.values())\n    print("--- INVENTORY SUMMARY ---")\n    for item, qty in inventory.items():\n        print(f"• {item}: {qty} units")\n    print(f"Total Stock: {total_units} units")\n\nrun_inventory_summary()',
    expectedOutput: '--- INVENTORY SUMMARY ---\n• Apples: 50 units\n• Oranges: 35 units\n• Bananas: 60 units\nTotal Stock: 145 units',
    stepByStep: [
      'The function run_inventory_summary initializes an item inventory dictionary.',
      'Computes total inventory units using sum(inventory.values()).',
      'Iterates through key-value pairs with for item, qty in inventory.items().',
      'Prints the summary block.'
    ],
    commonMistakes: [
      {
        mistake: 'Putting all code in global scope without helper functions',
        correction: 'Wrap discrete features into clean functions with descriptive names',
        explanation: 'Decomposing programs into modular functions makes code testable and easy to maintain.'
      }
    ],
    realWorldExample: {
      scenario: 'Command-Line Task Manager CLI',
      code: 'tasks = []\ndef add_task(title):\n    tasks.append({"id": len(tasks) + 1, "title": title, "done": False})\nadd_task("Finish Python Fundamentals")\nprint(f"Active tasks: {len(tasks)}")',
      explanation: 'Production task trackers and microservices use the same list-of-dictionaries state model.'
    },
    practice: {
      prompt: 'Write a function called count_positive(nums) that counts how many numbers in a list are greater than 0, then print count_positive([-2, 0, 5, 10]).',
      starterCode: 'def count_positive(nums):\n    # Write logic here\n    pass\n\nprint(count_positive([-2, 0, 5, 10]))\n',
      expectedOutputMatcher: '2',
      hint: 'count = sum(1 for x in nums if x > 0); return count',
      solution: 'def count_positive(nums):\n    return sum(1 for x in nums if x > 0)\n\nprint(count_positive([-2, 0, 5, 10]))'
    },
    quiz: [
      {
        id: 'q-py-proj-1',
        question: 'Which software development principle encourages breaking large code into small, single-responsibility functions?',
        options: [
          'Modular Programming / Separation of Concerns',
          'Linear Code Monolith',
          'Variable Masking',
          'Recursive Shadowing'
        ],
        correctIndex: 0,
        explanation: 'Modular programming decomposes complex systems into smaller, manageable, reusable functions.',
        difficulty: 'easy'
      }
    ],
    summary: [
      'Building complete projects unites all 15 core Python fundamentals.',
      'Clean architecture uses functions to isolate concerns and handle state predictably.',
      'Congratulations on mastering Python Fundamentals!'
    ]
  }
];
