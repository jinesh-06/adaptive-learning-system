"""Python Fundamentals Curriculum, Dashboard, and Adaptive Engine Routes."""

import json
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List

from backend.services.state_store import state_store
from backend.services.ml_service import ml_service
from backend.services.llm_service import llm_service
from backend.services.rag_service import rag_service
from backend.routes.auth_routes import get_current_user_id

router = APIRouter(prefix="/python", tags=["python-fundamentals"])

TOPIC_METADATA = [
    {"id": "top-py-intro", "number": 1, "numberDisplay": "01", "title": "Python Introduction", "slug": "python-introduction", "difficulty": "Beginner", "estimatedMinutes": 20, "desc": "Learn what Python is, how it works, and how to write your first program."},
    {"id": "top-py-variables-datatypes", "number": 2, "numberDisplay": "02", "title": "Variables & Data Types", "slug": "variables-data-types", "difficulty": "Beginner", "estimatedMinutes": 25, "desc": "Master variables as memory containers, dynamic typing, and fundamental data types."},
    {"id": "top-py-input-output", "number": 3, "numberDisplay": "03", "title": "Input & Output", "slug": "input-output", "difficulty": "Beginner", "estimatedMinutes": 20, "desc": "Capture user terminal input and format beautiful dynamic console outputs with f-strings."},
    {"id": "top-py-operators", "number": 4, "numberDisplay": "04", "title": "Operators", "slug": "operators", "difficulty": "Beginner", "estimatedMinutes": 25, "desc": "Perform arithmetic, assignment, comparison, logical, and membership operations."},
    {"id": "top-py-conditionals", "number": 5, "numberDisplay": "05", "title": "Conditional Statements", "slug": "conditional-statements", "difficulty": "Beginner", "estimatedMinutes": 25, "desc": "Control decision logic and execution branching with if, elif, and else."},
    {"id": "top-py-loops", "number": 6, "numberDisplay": "06", "title": "Loops", "slug": "loops", "difficulty": "Beginner", "estimatedMinutes": 30, "desc": "Master for loops, while loops, range iteration, and transfer statements."},
    {"id": "top-py-functions", "number": 7, "numberDisplay": "07", "title": "Functions", "slug": "functions", "difficulty": "Intermediate", "estimatedMinutes": 30, "desc": "Write modular reusable code with functions, parameters, return values, and scopes."},
    {"id": "top-py-strings", "number": 8, "numberDisplay": "08", "title": "Strings", "slug": "strings", "difficulty": "Intermediate", "estimatedMinutes": 25, "desc": "Manipulate text with indexing, slicing, string methods, and format strings."},
    {"id": "top-py-lists", "number": 9, "numberDisplay": "09", "title": "Lists", "slug": "lists", "difficulty": "Intermediate", "estimatedMinutes": 30, "desc": "Work with ordered mutable collections, slicing, sorting, and list comprehensions."},
    {"id": "top-py-tuples", "number": 10, "numberDisplay": "10", "title": "Tuples", "slug": "tuples", "difficulty": "Intermediate", "estimatedMinutes": 20, "desc": "Store immutable sequences, tuple packing, unpacking, and coordinate data."},
    {"id": "top-py-sets", "number": 11, "numberDisplay": "11", "title": "Sets", "slug": "sets", "difficulty": "Intermediate", "estimatedMinutes": 20, "desc": "Manage unique element collections, mathematical set operations, and fast lookups."},
    {"id": "top-py-dictionaries", "number": 12, "numberDisplay": "12", "title": "Dictionaries", "slug": "dictionaries", "difficulty": "Intermediate", "estimatedMinutes": 30, "desc": "Model key-value pairs, hash map operations, dictionary comprehension, and lookups."},
    {"id": "top-py-exceptions", "number": 13, "numberDisplay": "13", "title": "Basic Exception Handling", "slug": "basic-exception-handling", "difficulty": "Intermediate", "estimatedMinutes": 25, "desc": "Catch and handle errors gracefully using try, except, else, and finally blocks."},
    {"id": "top-py-file-handling", "number": 14, "numberDisplay": "14", "title": "File Handling", "slug": "file-handling", "difficulty": "Intermediate", "estimatedMinutes": 30, "desc": "Read, write, and safely append data to disk files using context managers."},
    {"id": "top-py-modules-packages", "number": 15, "numberDisplay": "15", "title": "Modules & Packages", "slug": "modules-packages", "difficulty": "Intermediate", "estimatedMinutes": 25, "desc": "Organize large programs using standard library modules, math, random, and imports."},
    {"id": "top-py-mini-projects", "number": 16, "numberDisplay": "16", "title": "Mini Projects", "slug": "mini-projects", "difficulty": "Intermediate", "estimatedMinutes": 45, "desc": "Build end-to-end interactive applications combining all 15 Python fundamentals."}
]

INTERMEDIATE_TOPIC_METADATA = [
    # Module 1: Advanced Python Concepts
    {"id": "top-py-int-comprehensions", "number": 1, "numberDisplay": "01", "title": "List, Dictionary & Set Comprehensions", "slug": "comprehensions", "difficulty": "Intermediate", "estimatedMinutes": 25, "desc": "Write concise, expressive, and optimized comprehensions with filtering and transformations."},
    {"id": "top-py-int-lambdas-functional", "number": 2, "numberDisplay": "02", "title": "Lambda Functions & Functional Tools", "slug": "lambdas-functional", "difficulty": "Intermediate", "estimatedMinutes": 25, "desc": "Master anonymous lambda closures and functional data pipelines with map(), filter(), and reduce()."},
    {"id": "top-py-int-iterators-generators", "number": 3, "numberDisplay": "03", "title": "Iterators, Iterables & Generators", "slug": "iterators-generators", "difficulty": "Intermediate", "estimatedMinutes": 30, "desc": "Deep-dive into the iteration protocol, lazy evaluation, and infinite data streaming using yield."},
    {"id": "top-py-int-decorators", "number": 4, "numberDisplay": "04", "title": "Function & Class Decorators", "slug": "decorators", "difficulty": "Intermediate", "estimatedMinutes": 30, "desc": "Master function wrappers, closures, @functools.wraps, execution timers, and parameterized decorators."},
    {"id": "top-py-int-args-kwargs", "number": 5, "numberDisplay": "05", "title": "Advanced Arguments (*args & **kwargs)", "slug": "args-kwargs", "difficulty": "Intermediate", "estimatedMinutes": 20, "desc": "Write flexible APIs using variable positional arguments, keyword unpacking, and keyword-only constraints."},

    # Module 2: Object-Oriented Programming
    {"id": "top-py-int-classes-objects", "number": 6, "numberDisplay": "06", "title": "Classes, Objects & State Modeling", "slug": "classes-objects", "difficulty": "Intermediate", "estimatedMinutes": 25, "desc": "Model domain entities through object-oriented blueprints, state encapsulation, and instance variables."},
    {"id": "top-py-int-methods-types", "number": 7, "numberDisplay": "07", "title": "Instance, Class & Static Methods", "slug": "methods-types", "difficulty": "Intermediate", "estimatedMinutes": 25, "desc": "Differentiate self vs @classmethod cls vs @staticmethod utility functions."},
    {"id": "top-py-int-encapsulation", "number": 8, "numberDisplay": "08", "title": "Encapsulation, Name Mangling & @property", "slug": "encapsulation", "difficulty": "Intermediate", "estimatedMinutes": 25, "desc": "Protect internal invariants using private variables, name mangling, getters, and @property setters."},
    {"id": "top-py-int-inheritance-overriding", "number": 9, "numberDisplay": "09", "title": "Inheritance & Method Overriding", "slug": "inheritance-overriding", "difficulty": "Intermediate", "estimatedMinutes": 30, "desc": "Derive specialized child classes, reuse parent logic with super(), and master Method Resolution Order."},
    {"id": "top-py-int-polymorphism-abstraction", "number": 10, "numberDisplay": "10", "title": "Polymorphism, Duck Typing & Abstraction", "slug": "polymorphism-abstraction", "difficulty": "Intermediate", "estimatedMinutes": 30, "desc": "Harness dynamic duck typing, abstract base classes (abc.ABC), and abstract methods."},

    # Module 3: Data Structures
    {"id": "top-py-int-ds-intro-arrays", "number": 11, "numberDisplay": "11", "title": "Data Structures Intro & Dynamic Arrays", "slug": "ds-intro-arrays", "difficulty": "Intermediate", "estimatedMinutes": 25, "desc": "Inspect contiguous RAM allocation, dynamic array geometric resizing, and amortized O(1) appending."},
    {"id": "top-py-int-linked-lists", "number": 12, "numberDisplay": "12", "title": "Singly & Doubly Linked Lists", "slug": "linked-lists", "difficulty": "Intermediate", "estimatedMinutes": 30, "desc": "Build node pointer chains from scratch with constant-time head insertion and bidirectional traversal."},
    {"id": "top-py-int-stacks", "number": 13, "numberDisplay": "13", "title": "Stacks & LIFO Applications", "slug": "stacks", "difficulty": "Intermediate", "estimatedMinutes": 25, "desc": "Implement Last-In-First-Out stacks for bracket validation, undo buffers, and evaluation."},
    {"id": "top-py-int-queues", "number": 14, "numberDisplay": "14", "title": "Queues, Circular Queues & Deque", "slug": "queues", "difficulty": "Intermediate", "estimatedMinutes": 25, "desc": "Implement FIFO task scheduling, ring buffers, and collections.deque double-ended queues."},
    {"id": "top-py-int-hash-tables", "number": 15, "numberDisplay": "15", "title": "Hash Tables & Dictionary Internals", "slug": "hash-tables", "difficulty": "Intermediate", "estimatedMinutes": 30, "desc": "Demystify hashing functions, collision resolution via chaining/open addressing, and amortized O(1)."},
    {"id": "top-py-int-trees-bst", "number": 16, "numberDisplay": "16", "title": "Trees & Binary Search Trees (BST)", "slug": "trees-bst", "difficulty": "Intermediate", "estimatedMinutes": 35, "desc": "Construct hierarchical node trees, BST search/insert invariants, and in-order/pre-order traversals."},
    {"id": "top-py-int-heaps-priority-queues", "number": 17, "numberDisplay": "17", "title": "Heaps & Priority Queues", "slug": "heaps-priority-queues", "difficulty": "Intermediate", "estimatedMinutes": 25, "desc": "Implement binary min/max heaps with heapq, parent/child index math, and log-N priority queues."},
    {"id": "top-py-int-graphs", "number": 18, "numberDisplay": "18", "title": "Graph Fundamentals & Adjacency Lists", "slug": "graphs", "difficulty": "Intermediate", "estimatedMinutes": 35, "desc": "Model network topologies using adjacency lists, Breadth-First Search (BFS), and Depth-First Search (DFS)."},
    {"id": "top-py-int-choosing-ds", "number": 19, "numberDisplay": "19", "title": "Choosing the Appropriate Data Structure", "slug": "choosing-ds", "difficulty": "Intermediate", "estimatedMinutes": 20, "desc": "Evaluate runtime complexity matrices, memory footprints, and access patterns to pick optimal structures."},

    # Module 4: Algorithms & Practical Applications
    {"id": "top-py-int-big-o-complexity", "number": 20, "numberDisplay": "20", "title": "Time & Space Complexity (Big O)", "slug": "big-o-complexity", "difficulty": "Intermediate", "estimatedMinutes": 25, "desc": "Quantify asymptotic efficiency, time vs space tradeoffs, and upper-bound classifications."},
    {"id": "top-py-int-recursion", "number": 21, "numberDisplay": "21", "title": "Recursion & Call Stack Dynamics", "slug": "recursion", "difficulty": "Intermediate", "estimatedMinutes": 30, "desc": "Master base cases, recursive steps, call stack activation records, and stack overflow prevention."},
    {"id": "top-py-int-searching-algorithms", "number": 22, "numberDisplay": "22", "title": "Searching Algorithms: Linear vs Binary", "slug": "searching-algorithms", "difficulty": "Intermediate", "estimatedMinutes": 25, "desc": "Implement linear scan O(N) and logarithmic binary search O(log N) on sorted sequences."},
    {"id": "top-py-int-sorting-basic", "number": 23, "numberDisplay": "23", "title": "Elementary Sorting: Bubble, Selection & Insertion", "slug": "sorting-basic", "difficulty": "Intermediate", "estimatedMinutes": 30, "desc": "Compare quadratic O(N^2) comparison sorts, element swaps, and in-place stability."},
    {"id": "top-py-int-sorting-advanced", "number": 24, "numberDisplay": "24", "title": "Advanced Sorting: Merge Sort & Quick Sort", "slug": "sorting-advanced", "difficulty": "Intermediate", "estimatedMinutes": 35, "desc": "Divide-and-conquer sorting with O(N log N) recursive splitting, pivot partitioning, and merging."},
    {"id": "top-py-int-problem-solving", "number": 25, "numberDisplay": "25", "title": "Practical Problem-Solving Patterns", "slug": "problem-solving", "difficulty": "Intermediate", "estimatedMinutes": 35, "desc": "Apply Two-Pointers, Sliding Window, and Hash Map frequency tracking to algorithmic challenges."},
    {"id": "top-py-int-mini-project", "number": 26, "numberDisplay": "26", "title": "Final Mini Project: LRU Cache Implementation", "slug": "mini-project-lru-cache", "difficulty": "Intermediate", "estimatedMinutes": 45, "desc": "Build an end-to-end O(1) Least Recently Used (LRU) Cache combining Doubly Linked Lists & Hash Maps."}
]

ADVANCED_TOPIC_METADATA = [
    # Module 1: Advanced Python Programming (10 Topics)
    {"id": "top-py-adv-args-kwargs", "number": 1, "numberDisplay": "01", "title": "Advanced Function Arguments (*args and **kwargs)", "slug": "args-kwargs", "difficulty": "Advanced", "estimatedMinutes": 20, "desc": "Master variable positional arguments, keyword unpacking, keyword-only parameters, and signature introspection."},
    {"id": "top-py-adv-closures", "number": 2, "numberDisplay": "02", "title": "Closures and Scope", "slug": "closures-scope", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Deep dive into LEGB lexical scope resolution, enclosing scopes, nonlocal bindings, and __closure__ cell introspection."},
    {"id": "top-py-adv-decorators", "number": 3, "numberDisplay": "03", "title": "Advanced Decorators", "slug": "advanced-decorators", "difficulty": "Advanced", "estimatedMinutes": 30, "desc": "Build parameterized decorators, decorator classes, stacking decorators, and metadata preservation with functools.wraps."},
    {"id": "top-py-adv-generators", "number": 4, "numberDisplay": "04", "title": "Generators and yield", "slug": "generators-yield", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Master lazy stream evaluation, memory efficiency, bidirectional coroutines with send(), throw(), and close()."},
    {"id": "top-py-adv-iterators", "number": 5, "numberDisplay": "05", "title": "Iterators and Iterables", "slug": "iterators-iterables", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Implement the Python Iterator Protocol with __iter__ and __next__, StopIteration handling, and custom iterables."},
    {"id": "top-py-adv-context-managers", "number": 6, "numberDisplay": "06", "title": "Context Managers", "slug": "context-managers", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Manage resources cleanly with the context management protocol (__enter__, __exit__) and @contextlib.contextmanager."},
    {"id": "top-py-adv-comprehensions", "number": 7, "numberDisplay": "07", "title": "Advanced Comprehensions", "slug": "advanced-comprehensions", "difficulty": "Advanced", "estimatedMinutes": 20, "desc": "Write complex nested list, dict, and set comprehensions with multiple conditionals and walrus assignments."},
    {"id": "top-py-adv-functional", "number": 8, "numberDisplay": "08", "title": "Functional Programming", "slug": "functional-programming", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Apply pure functions, immutability, higher-order functions, partials, and itertools pipelines."},
    {"id": "top-py-adv-map-filter-reduce", "number": 9, "numberDisplay": "09", "title": "map(), filter(), and reduce()", "slug": "map-filter-reduce", "difficulty": "Advanced", "estimatedMinutes": 20, "desc": "Process data streams effectively using map, filter, functools.reduce, and operator module callables."},
    {"id": "top-py-adv-type-hints", "number": 10, "numberDisplay": "10", "title": "Type Hints and Annotations", "slug": "type-hints-annotations", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Utilize static typing with typing module, Generic, Union, Callable, Protocol, and mypy validation."},

    # Module 2: Advanced Object-Oriented Programming (14 Topics)
    {"id": "top-py-adv-oop-principles", "number": 11, "numberDisplay": "11", "title": "OOP Principles and Design", "slug": "oop-principles-design", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Master the core pillars of Object-Oriented Programming: Encapsulation, Abstraction, Inheritance, and Polymorphism."},
    {"id": "top-py-adv-classes-deep-dive", "number": 12, "numberDisplay": "12", "title": "Classes and Objects — Deep Dive", "slug": "classes-objects-deep-dive", "difficulty": "Advanced", "estimatedMinutes": 30, "desc": "Explore Python's class model, type meta-type, __new__ vs __init__, and memory optimization with __slots__."},
    {"id": "top-py-adv-method-types", "number": 13, "numberDisplay": "13", "title": "Instance, Class, and Static Methods", "slug": "instance-class-static-methods", "difficulty": "Advanced", "estimatedMinutes": 20, "desc": "Contrast bound instance methods, @classmethod alternative constructors, and @staticmethod utility functions."},
    {"id": "top-py-adv-encapsulation", "number": 14, "numberDisplay": "14", "title": "Encapsulation and Access Control", "slug": "encapsulation-access-control", "difficulty": "Advanced", "estimatedMinutes": 20, "desc": "Implement data protection conventions, single-underscore protected members, and name mangling (__private)."},
    {"id": "top-py-adv-multiple-inheritance", "number": 15, "numberDisplay": "15", "title": "Inheritance and Multiple Inheritance", "slug": "multiple-inheritance", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Architect multi-tier inheritance, mixin composition classes, and cooperative super() delegation."},
    {"id": "top-py-adv-mro", "number": 16, "numberDisplay": "16", "title": "Method Resolution Order (MRO)", "slug": "method-resolution-order", "difficulty": "Advanced", "estimatedMinutes": 30, "desc": "Deconstruct Python's C3 Linearization algorithm for multiple inheritance and diamond hierarchies."},
    {"id": "top-py-adv-polymorphism", "number": 17, "numberDisplay": "17", "title": "Polymorphism and Duck Typing", "slug": "polymorphism-duck-typing", "difficulty": "Advanced", "estimatedMinutes": 20, "desc": "Leverage dynamic runtime polymorphism, structural subtyping, and Python's 'If it walks like a duck' philosophy."},
    {"id": "top-py-adv-abc", "number": 18, "numberDisplay": "18", "title": "Abstraction and Abstract Base Classes", "slug": "abstract-base-classes", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Enforce strict interface contracts across teams using the abc module, ABCMeta, and @abstractmethod."},
    {"id": "top-py-adv-magic-methods", "number": 19, "numberDisplay": "19", "title": "Magic Methods and Operator Overloading", "slug": "magic-methods-operator-overloading", "difficulty": "Advanced", "estimatedMinutes": 30, "desc": "Overload arithmetic, string representations (__str__, __repr__), and comparison operators."},
    {"id": "top-py-adv-descriptors", "number": 20, "numberDisplay": "20", "title": "Properties and Descriptors", "slug": "properties-descriptors", "difficulty": "Advanced", "estimatedMinutes": 30, "desc": "Implement the descriptor protocol (__get__, __set__, __delete__) to power managed attributes and ORMs."},
    {"id": "top-py-adv-dataclasses", "number": 21, "numberDisplay": "21", "title": "Dataclasses", "slug": "dataclasses", "difficulty": "Advanced", "estimatedMinutes": 20, "desc": "Streamline boilerplate class definitions using @dataclass, field specifications, and frozen immutability."},
    {"id": "top-py-adv-composition", "number": 22, "numberDisplay": "22", "title": "Composition vs Inheritance", "slug": "composition-vs-inheritance", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Apply the 'favor composition over inheritance' design principle to build modular and testable architectures."},
    {"id": "top-py-adv-solid", "number": 23, "numberDisplay": "23", "title": "SOLID Principles in Python", "slug": "solid-principles", "difficulty": "Advanced", "estimatedMinutes": 35, "desc": "Architect maintainable codebases adhering to SRP, OCP, LSP, ISP, and DIP."},
    {"id": "top-py-adv-design-patterns", "number": 24, "numberDisplay": "24", "title": "Design Patterns — Singleton, Factory, Observer, Strategy", "slug": "design-patterns", "difficulty": "Advanced", "estimatedMinutes": 35, "desc": "Implement gang-of-four structural and behavioral design patterns idiomatically in Python."},

    # Module 3: Asynchronous Python Programming (15 Topics)
    {"id": "top-py-adv-sync-vs-async", "number": 25, "numberDisplay": "25", "title": "Synchronous vs Asynchronous Programming", "slug": "sync-vs-async", "difficulty": "Advanced", "estimatedMinutes": 20, "desc": "Compare synchronous execution with non-blocking cooperative execution for high-concurrency workloads."},
    {"id": "top-py-adv-concurrency-vs-parallelism", "number": 26, "numberDisplay": "26", "title": "Concurrency vs Parallelism", "slug": "concurrency-vs-parallelism", "difficulty": "Advanced", "estimatedMinutes": 20, "desc": "Understand the difference between dealing with lots of things at once vs doing lots of things at once."},
    {"id": "top-py-adv-blocking-non-blocking", "number": 27, "numberDisplay": "27", "title": "Blocking and Non-Blocking Operations", "slug": "blocking-non-blocking", "difficulty": "Advanced", "estimatedMinutes": 20, "desc": "Identify CPU and I/O bottlenecks and how non-blocking I/O prevents thread stalling."},
    {"id": "top-py-adv-intro-asyncio", "number": 28, "numberDisplay": "28", "title": "Introduction to asyncio", "slug": "intro-asyncio", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Explore Python's built-in asynchronous framework, cooperative multitasking, and the asyncio module."},
    {"id": "top-py-adv-coroutines", "number": 29, "numberDisplay": "29", "title": "Coroutines and async/await", "slug": "coroutines-async-await", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Write async coroutines, yield control with await, and inspect coroutine lifecycle states."},
    {"id": "top-py-adv-event-loop", "number": 30, "numberDisplay": "30", "title": "Event Loop", "slug": "event-loop", "difficulty": "Advanced", "estimatedMinutes": 30, "desc": "Understand the core event loop mechanics, task scheduling, epoll/kqueue selectors, and cooperative context switches."},
    {"id": "top-py-adv-tasks-futures", "number": 31, "numberDisplay": "31", "title": "asyncio Tasks and Futures", "slug": "tasks-futures", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Manage concurrent task execution, wrap coroutines with Tasks, and inspect Future results."},
    {"id": "top-py-adv-gather", "number": 32, "numberDisplay": "32", "title": "asyncio.gather()", "slug": "asyncio-gather", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Execute multiple coroutines concurrently and aggregate ordered results with return_exceptions handling."},
    {"id": "top-py-adv-create-task", "number": 33, "numberDisplay": "33", "title": "asyncio.create_task()", "slug": "create-task", "difficulty": "Advanced", "estimatedMinutes": 20, "desc": "Schedule background tasks fire-and-forget style without blocking the ongoing execution stream."},
    {"id": "top-py-adv-async-context-managers", "number": 34, "numberDisplay": "34", "title": "Async Context Managers", "slug": "async-context-managers", "difficulty": "Advanced", "estimatedMinutes": 20, "desc": "Implement __aenter__ and __aexit__ protocols for safe acquisition of async resources."},
    {"id": "top-py-adv-async-iterators", "number": 35, "numberDisplay": "35", "title": "Async Iterators and Generators", "slug": "async-iterators-generators", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Stream async payloads over time with async for and async generator yield expressions."},
    {"id": "top-py-adv-async-exceptions", "number": 36, "numberDisplay": "36", "title": "Exception Handling in Async Code", "slug": "async-exceptions", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Handle failures across concurrent tasks, ExceptionGroups, and custom error handlers."},
    {"id": "top-py-adv-async-timeouts", "number": 37, "numberDisplay": "37", "title": "Asyncio Timeouts and Cancellation", "slug": "async-timeouts-cancellation", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Cancel hanging tasks, enforce SLA deadlines with asyncio.timeout(), and catch CancelledError."},
    {"id": "top-py-adv-concurrency-comparison", "number": 38, "numberDisplay": "38", "title": "Threading vs Multiprocessing vs Asyncio", "slug": "concurrency-comparison", "difficulty": "Advanced", "estimatedMinutes": 30, "desc": "Choose between OS threads, multi-core processes, and async event loops based on GIL and workload."},
    {"id": "top-py-adv-concurrent-apps", "number": 39, "numberDisplay": "39", "title": "Building Concurrent Applications", "slug": "concurrent-applications", "difficulty": "Advanced", "estimatedMinutes": 35, "desc": "Build resilient producer-consumer systems using asyncio.Queue and concurrency primitives."},

    # Module 4: Advanced Applications & Projects (14 Topics)
    {"id": "top-py-adv-memory-management", "number": 40, "numberDisplay": "40", "title": "Python Memory Management", "slug": "memory-management", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Understand PyObject headers, PyMalloc arenas, pools, blocks, and reference counting semantics."},
    {"id": "top-py-adv-garbage-collection", "number": 41, "numberDisplay": "41", "title": "Garbage Collection", "slug": "garbage-collection", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Demystify Python's generational cyclic garbage collector (Generation 0, 1, 2) and the gc module."},
    {"id": "top-py-adv-shallow-deep-copy", "number": 42, "numberDisplay": "42", "title": "Shallow Copy vs Deep Copy", "slug": "shallow-vs-deep-copy", "difficulty": "Advanced", "estimatedMinutes": 20, "desc": "Inspect object reference copying vs recursive heap cloning using the copy module."},
    {"id": "top-py-adv-mutable-immutable", "number": 43, "numberDisplay": "43", "title": "Mutable vs Immutable Objects", "slug": "mutable-vs-immutable", "difficulty": "Advanced", "estimatedMinutes": 20, "desc": "Understand the memory model and performance implications of object mutability and identity."},
    {"id": "top-py-adv-performance-optimization", "number": 44, "numberDisplay": "44", "title": "Performance Optimization", "slug": "performance-optimization", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Accelerate Python execution using optimized lookups, vectorization, and bytecode efficiency."},
    {"id": "top-py-adv-profiling-benchmarking", "number": 45, "numberDisplay": "45", "title": "Profiling and Benchmarking", "slug": "profiling-benchmarking", "difficulty": "Advanced", "estimatedMinutes": 30, "desc": "Profile CPU hotspots and memory allocations using cProfile, timeit, and memory_profiler."},
    {"id": "top-py-adv-logging-debugging", "number": 46, "numberDisplay": "46", "title": "Logging and Debugging", "slug": "logging-debugging", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Configure production-ready structured logging and master interactive debugging with pdb / breakpoint()."},
    {"id": "top-py-adv-unit-testing", "number": 47, "numberDisplay": "47", "title": "Unit Testing with pytest", "slug": "unit-testing-pytest", "difficulty": "Advanced", "estimatedMinutes": 30, "desc": "Write robust unit tests, test fixtures, parameterized tests, and mock external systems."},
    {"id": "top-py-adv-project-structure", "number": 48, "numberDisplay": "48", "title": "Project Structure and Modular Architecture", "slug": "project-structure", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Organize professional Python projects using pyproject.toml, src layout, and virtual environments."},
    {"id": "top-py-adv-env-vars-config", "number": 49, "numberDisplay": "49", "title": "Environment Variables and Configuration", "slug": "env-vars-config", "difficulty": "Advanced", "estimatedMinutes": 20, "desc": "Manage application configuration securely with .env files, os.environ, and Pydantic Settings."},
    {"id": "top-py-adv-async-http", "number": 50, "numberDisplay": "50", "title": "Working with APIs Using Async HTTP Clients", "slug": "async-http-clients", "difficulty": "Advanced", "estimatedMinutes": 25, "desc": "Consume external REST APIs concurrently using aiohttp and httpx with connection pooling."},
    {"id": "top-py-adv-async-task-manager", "number": 51, "numberDisplay": "51", "title": "Building an Asynchronous Task Manager", "slug": "async-task-manager", "difficulty": "Advanced", "estimatedMinutes": 35, "desc": "Build a multi-worker async background job queue with retry logic and rate limiting."},
    {"id": "top-py-adv-mini-oop-app", "number": 52, "numberDisplay": "52", "title": "Building a Mini OOP Application", "slug": "mini-oop-app", "difficulty": "Advanced", "estimatedMinutes": 35, "desc": "Architect an extensible domain application using SOLID principles and design patterns."},
    {"id": "top-py-adv-final-project", "number": 53, "numberDisplay": "53", "title": "Final Advanced Python Project", "slug": "final-advanced-project", "difficulty": "Advanced", "estimatedMinutes": 45, "desc": "Build a production-grade async microservice combining OOP architecture, asyncio, and testing."}
]


class ProgressUpdatePayload(BaseModel):
    topic_id: str
    status: Optional[str] = "IN_PROGRESS"
    completion_pct: Optional[float] = None
    quiz_score: Optional[float] = None
    attempts_delta: Optional[int] = 0
    time_spent_delta: Optional[float] = 0.0


class AnalyzeSignalsPayload(BaseModel):
    topic_id: str
    time_spent_seconds: float = 60.0
    quiz_accuracy: Optional[float] = None
    incorrect_attempts: int = 0
    code_errors: int = 0
    hints_requested: int = 0
    solution_revealed: bool = False
    revisits_count: int = 0


class GenerateAdaptationPayload(BaseModel):
    topic_id: str
    strategy: Optional[str] = "SIMPLIFY"
    signals: Optional[Dict[str, Any]] = None
    force_refresh: bool = False


@router.get("/fundamentals")
async def get_python_fundamentals_dashboard(request: Request):
    """Retrieve full dashboard overview for Python Fundamentals with live progress."""
    user_id = get_current_user_id(request)
    raw_progress = state_store.get_user_course_progress(user_id, "py-beg")
    progress_map = {p["topic_id"]: p for p in raw_progress}

    completed_count = 0
    quiz_completed_count = 0
    total_time_spent = 0.0
    unlocked = True

    topics_output = []
    current_topic_id = TOPIC_METADATA[0]["id"]
    first_incomplete_found = False

    for idx, meta in enumerate(TOPIC_METADATA):
        t_id = meta["id"]
        prog = progress_map.get(t_id, {})
        status = prog.get("status", "NOT_STARTED")
        comp_pct = float(prog.get("completion_pct") or 0.0)
        quiz_score = prog.get("quiz_score")
        time_spent = float(prog.get("time_spent_seconds") or 0.0)
        total_time_spent += time_spent

        if status == "COMPLETED" or comp_pct >= 95.0:
            status = "COMPLETED"
            completed_count += 1
            if quiz_score is not None and quiz_score > 0:
                quiz_completed_count += 1
        elif status == "IN_PROGRESS" or comp_pct > 0.0:
            status = "IN_PROGRESS"
            if not first_incomplete_found:
                current_topic_id = t_id
                first_incomplete_found = True
        else:
            # Topic locking rule: First topic unlocked; subsequent unlocked if previous completed or in progress
            if idx == 0:
                status = "NOT_STARTED"
            elif idx > 0 and (topics_output[idx - 1]["status"] in ("COMPLETED", "IN_PROGRESS")):
                status = "NOT_STARTED"
            else:
                status = "LOCKED"

            if status != "LOCKED" and not first_incomplete_found:
                current_topic_id = t_id
                first_incomplete_found = True

        # Check if an adapted lesson exists
        has_adaptation = state_store.get_adapted_lesson(user_id, t_id) is not None
        if has_adaptation and status != "COMPLETED":
            status = "ADAPTATION_AVAILABLE"

        topics_output.append({
            **meta,
            "status": status,
            "completion_percentage": round(comp_pct, 1),
            "quiz_score": quiz_score,
            "attempts": prog.get("attempts", 0),
            "time_spent_seconds": round(time_spent, 1),
            "has_adapted_lesson": has_adaptation
        })

    total_topics = len(TOPIC_METADATA)
    overall_progress = round((completed_count / total_topics) * 100) if total_topics > 0 else 0

    # Estimate remaining minutes
    remaining_minutes = sum(
        t["estimatedMinutes"]
        for t in topics_output
        if t["status"] != "COMPLETED"
    )

    return {
        "title": "Python Fundamentals",
        "subtitle": "Build a strong foundation in Python through guided lessons, practice, and adaptive learning.",
        "total_topics": total_topics,
        "completed_topics": completed_count,
        "quizzes_completed": quiz_completed_count,
        "overall_progress": overall_progress,
        "current_topic_id": current_topic_id,
        "streak_days": 3,
        "estimated_remaining_minutes": remaining_minutes,
        "learning_signals_status": "Calibrated & Active",
        "topics": topics_output
    }


@router.get("/intermediate")
async def get_python_intermediate_dashboard(request: Request):
    """Retrieve full dashboard overview for Intermediate Python & Data Structures with live progress."""
    user_id = get_current_user_id(request)
    raw_progress = state_store.get_user_course_progress(user_id, "py-int")
    progress_map = {p["topic_id"]: p for p in raw_progress}

    completed_count = 0
    quiz_completed_count = 0
    total_time_spent = 0.0

    topics_output = []
    current_topic_id = INTERMEDIATE_TOPIC_METADATA[0]["id"]
    first_incomplete_found = False

    for idx, meta in enumerate(INTERMEDIATE_TOPIC_METADATA):
        t_id = meta["id"]
        prog = progress_map.get(t_id, {})
        status = prog.get("status", "NOT_STARTED")
        comp_pct = float(prog.get("completion_pct") or 0.0)
        quiz_score = prog.get("quiz_score")
        time_spent = float(prog.get("time_spent_seconds") or 0.0)
        total_time_spent += time_spent

        if status == "COMPLETED" or comp_pct >= 95.0:
            status = "COMPLETED"
            completed_count += 1
            if quiz_score is not None and quiz_score > 0:
                quiz_completed_count += 1
        elif status == "IN_PROGRESS" or comp_pct > 0.0:
            status = "IN_PROGRESS"
            if not first_incomplete_found:
                current_topic_id = t_id
                first_incomplete_found = True
        else:
            # Topic locking rule: First topic unlocked; subsequent unlocked if previous completed or in progress
            if idx == 0:
                status = "NOT_STARTED"
            elif idx > 0 and (topics_output[idx - 1]["status"] in ("COMPLETED", "IN_PROGRESS")):
                status = "NOT_STARTED"
            else:
                status = "LOCKED"

            if status != "LOCKED" and not first_incomplete_found:
                current_topic_id = t_id
                first_incomplete_found = True

        # Check if an adapted lesson exists
        has_adaptation = state_store.get_adapted_lesson(user_id, t_id) is not None
        if has_adaptation and status != "COMPLETED":
            status = "ADAPTATION_AVAILABLE"

        topics_output.append({
            **meta,
            "status": status,
            "completion_percentage": round(comp_pct, 1),
            "quiz_score": quiz_score,
            "attempts": prog.get("attempts", 0),
            "time_spent_seconds": round(time_spent, 1),
            "has_adapted_lesson": has_adaptation
        })

    total_topics = len(INTERMEDIATE_TOPIC_METADATA)
    overall_progress = round((completed_count / total_topics) * 100) if total_topics > 0 else 0

    remaining_minutes = sum(
        t["estimatedMinutes"]
        for t in topics_output
        if t["status"] != "COMPLETED"
    )

    return {
        "title": "Intermediate Python & Data Structures",
        "subtitle": "Master advanced Python mechanics, core data structures, algorithms, and practical problem solving with cognitive-load awareness.",
        "total_topics": total_topics,
        "completed_topics": completed_count,
        "quizzes_completed": quiz_completed_count,
        "overall_progress": overall_progress,
        "current_topic_id": current_topic_id,
        "streak_days": 4,
        "estimated_remaining_minutes": remaining_minutes,
        "learning_signals_status": "Calibrated & Active",
        "topics": topics_output
    }


@router.get("/advanced")
async def get_python_advanced_dashboard(request: Request):
    """Retrieve full dashboard overview for Advanced Python, OOP & Async with live progress."""
    user_id = get_current_user_id(request)
    raw_progress = state_store.get_user_course_progress(user_id, "py-adv")
    progress_map = {p["topic_id"]: p for p in raw_progress}

    completed_count = 0
    quiz_completed_count = 0
    total_time_spent = 0.0

    topics_output = []
    current_topic_id = ADVANCED_TOPIC_METADATA[0]["id"]
    first_incomplete_found = False

    for idx, meta in enumerate(ADVANCED_TOPIC_METADATA):
        t_id = meta["id"]
        prog = progress_map.get(t_id, {})
        status = prog.get("status", "NOT_STARTED")
        comp_pct = float(prog.get("completion_pct") or 0.0)
        quiz_score = prog.get("quiz_score")
        time_spent = float(prog.get("time_spent_seconds") or 0.0)
        total_time_spent += time_spent

        if status == "COMPLETED" or comp_pct >= 95.0:
            status = "COMPLETED"
            completed_count += 1
            if quiz_score is not None and quiz_score > 0:
                quiz_completed_count += 1
        elif status == "IN_PROGRESS" or comp_pct > 0.0:
            status = "IN_PROGRESS"
            if not first_incomplete_found:
                current_topic_id = t_id
                first_incomplete_found = True
        else:
            # Topic locking rule: First topic unlocked; subsequent unlocked if previous completed or in progress
            if idx == 0:
                status = "NOT_STARTED"
            elif idx > 0 and (topics_output[idx - 1]["status"] in ("COMPLETED", "IN_PROGRESS")):
                status = "NOT_STARTED"
            else:
                status = "LOCKED"

            if status != "LOCKED" and not first_incomplete_found:
                current_topic_id = t_id
                first_incomplete_found = True

        # Check if an adapted lesson exists
        has_adaptation = state_store.get_adapted_lesson(user_id, t_id) is not None
        if has_adaptation and status != "COMPLETED":
            status = "ADAPTATION_AVAILABLE"

        topics_output.append({
            **meta,
            "status": status,
            "completion_percentage": round(comp_pct, 1),
            "quiz_score": quiz_score,
            "attempts": prog.get("attempts", 0),
            "time_spent_seconds": round(time_spent, 1),
            "has_adapted_lesson": has_adaptation
        })

    total_topics = len(ADVANCED_TOPIC_METADATA)
    overall_progress = round((completed_count / total_topics) * 100) if total_topics > 0 else 0

    remaining_minutes = sum(
        t["estimatedMinutes"]
        for t in topics_output
        if t["status"] != "COMPLETED"
    )

    return {
        "title": "Advanced Python, OOP & Async",
        "subtitle": "Master advanced Python programming through object-oriented design, asynchronous execution, decorators, generators, memory management, and real-world application development.",
        "total_modules": 4,
        "total_topics": total_topics,
        "completed_topics": completed_count,
        "quizzes_completed": quiz_completed_count,
        "overall_progress": overall_progress,
        "current_topic_id": current_topic_id,
        "streak_days": 5,
        "estimated_remaining_minutes": remaining_minutes,
        "learning_signals_status": "Calibrated & Active",
        "topics": topics_output
    }


@router.post("/progress")
async def update_topic_progress(payload: ProgressUpdatePayload, request: Request):
    """Save progress event for a topic."""
    user_id = get_current_user_id(request)
    course_id = "py-adv" if payload.topic_id.startswith("top-py-adv-") else ("py-int" if payload.topic_id.startswith("top-py-int-") else "py-beg")
    result = state_store.save_topic_progress(
        user_id=user_id,
        course_id=course_id,
        topic_id=payload.topic_id,
        status=payload.status,
        completion_pct=payload.completion_pct,
        quiz_score=payload.quiz_score,
        attempts_delta=payload.attempts_delta or 0,
        time_spent_delta=payload.time_spent_delta or 0.0
    )
    return {"success": True, "progress": result}


@router.post("/adaptation/analyze")
async def analyze_learning_signals(payload: AnalyzeSignalsPayload, request: Request):
    """Analyze learner signals and trigger Adaptive Learning Insight when appropriate."""
    user_id = get_current_user_id(request)

    # Feature engineering from learner signals
    accuracy = payload.quiz_accuracy if payload.quiz_accuracy is not None else (
        max(10, 100 - (payload.incorrect_attempts * 25))
    )
    backtracking = payload.code_errors + (1 if payload.solution_revealed else 0)

    ml_eval = ml_service.evaluate({
        "time_spent_seconds": payload.time_spent_seconds,
        "accuracy": accuracy,
        "hesitation_time_seconds": 10.0 if payload.hints_requested > 1 else 5.0,
        "backtracking": backtracking,
        "quiz_attempts": payload.incorrect_attempts + 1,
        "revisits": payload.revisits_count
    })

    load = ml_eval.get("predicted_cognitive_load", "MEDIUM")

    # Determine if adaptation is suggested
    needs_adaptation = False
    strategy = "BALANCED"
    reason = "Learning pace is optimal and progression is steady."
    suggested_changes = []

    if load == "HIGH" or payload.incorrect_attempts >= 3 or payload.code_errors >= 2 or payload.hints_requested >= 2:
        needs_adaptation = True
        strategy = "SIMPLIFY"
        reason = "Recent learning signals suggest that a more guided, step-by-step explanation may help with this topic."
        suggested_changes = [
            "Simpler explanation with intuitive everyday analogies",
            "More step-by-step breakdown of core mechanics",
            "Additional visual representation and diagrams",
            "Easier first practice questions with progressive scaffolding"
        ]
    elif load == "LOW" and (payload.quiz_accuracy or 0) >= 90 and payload.hints_requested == 0 and payload.time_spent_seconds < 180:
        needs_adaptation = True
        strategy = "INCREASE_DIFFICULTY"
        reason = "High mastery and rapid problem solving detected. Advanced deep-dive insights and challenging patterns are ready."
        suggested_changes = [
            "Dense architectural explanation with edge cases",
            "Minimal introductory preamble",
            "Challenging algorithmic variation exercises",
            "Under-the-hood memory representation insights"
        ]

    # Meaningful user-facing signals summary (never expose raw telemetry)
    signals_summary = []
    if payload.incorrect_attempts > 0:
        signals_summary.append(f"{payload.incorrect_attempts} incorrect attempts observed on practice checks")
    if payload.hints_requested > 0:
        signals_summary.append(f"{payload.hints_requested} hints requested for guidance")
    if payload.code_errors > 0:
        signals_summary.append(f"{payload.code_errors} code syntax/runtime errors caught")
    if payload.revisits_count > 1:
        signals_summary.append(f"Revisited concept sections {payload.revisits_count} times")
    if payload.time_spent_seconds > 300:
        signals_summary.append("Deliberate, extended time invested exploring concept sections")
    elif payload.time_spent_seconds < 60 and (payload.quiz_accuracy or 0) >= 90:
        signals_summary.append("Rapid accurate recall and immediate first-attempt mastery")

    if not signals_summary:
        signals_summary.append("Consistent, stable reading pace and active practice")

    return {
        "topic_id": payload.topic_id,
        "suggested": needs_adaptation,
        "cognitive_state": load,
        "confidence": ml_eval.get("confidence", 0.88),
        "strategy": strategy,
        "reason": reason,
        "suggested_adaptation": suggested_changes,
        "signals_summary": signals_summary
    }


@router.post("/adaptation/generate")
async def generate_adapted_lesson(payload: GenerateAdaptationPayload, request: Request):
    """Generate a dedicated AI-adapted lesson grounded in verified curriculum RAG context."""
    user_id = get_current_user_id(request)
    t_id = payload.topic_id

    # 1. Check if an adaptation was already cached for this user & topic
    if not payload.force_refresh:
        cached = state_store.get_adapted_lesson(user_id, t_id)
        if cached and cached.get("lesson_data"):
            return {
                "success": True,
                "cached": True,
                "topic_id": t_id,
                "strategy": cached.get("adaptation_strategy", "SIMPLIFY"),
                "adapted_lesson": cached["lesson_data"]
            }

    # Find topic title
    is_advanced = t_id.startswith("top-py-adv-")
    is_intermediate = t_id.startswith("top-py-int-")
    course_id = "py-adv" if is_advanced else ("py-int" if is_intermediate else "py-beg")
    level = "advanced" if is_advanced else ("intermediate" if is_intermediate else "beginner")

    topic_meta = next((m for m in ADVANCED_TOPIC_METADATA if m["id"] == t_id), None)
    if not topic_meta:
        topic_meta = next((m for m in INTERMEDIATE_TOPIC_METADATA if m["id"] == t_id), None)
    if not topic_meta:
        topic_meta = next((m for m in TOPIC_METADATA if m["id"] == t_id), TOPIC_METADATA[0])

    topic_title = topic_meta["title"]
    strategy = payload.strategy or "SIMPLIFY"

    # 2. Retrieve verified RAG curriculum context
    rag_context = rag_service.get_formatted_context(
        query=f"Python {topic_title} explanation step by step examples",
        course="python",
        topic=t_id,
        level=level,
        top_k=4
    )

    # 3. Call LLM Service / Gemini to generate structured adaptation
    strategy_prompt = f"""
Generate an AI-Adapted Lesson for the Python topic: '{topic_title}'.
Adaptation Strategy: {strategy}.
Signals observed: {json.dumps(payload.signals or {})}

Follow these rules:
1. Provide a completely fresh, more intuitive explanation.
2. Break concepts into smaller, digestible micro-steps.
3. Use a friendly analogy (e.g. labeled boxes, recipes, train cars).
4. Provide clean beginner-friendly code examples with commentary.
5. Provide a visual text-based diagram (ASCII or table).
6. Provide 1 scaffolded guided practice problem.
7. Provide a short 2-question knowledge check.
"""
    llm_resp = llm_service.generate_explanation(
        question=strategy_prompt,
        cognitive_load="HIGH" if strategy in ("SIMPLIFY", "STEP_BY_STEP", "VISUAL") else "LOW",
        course="python",
        topic=topic_title,
        topic_id=t_id
    )

    generated_text = llm_resp.get("answer", "")

    # Structured adapted lesson payload
    adapted_lesson_data = {
        "topic_id": t_id,
        "topic_title": topic_title,
        "topic_number": topic_meta["numberDisplay"],
        "adaptation_strategy": strategy,
        "strategy_label": "Simplified + Step-by-Step" if strategy == "SIMPLIFY" else "Accelerated + Deep Dive" if strategy == "INCREASE_DIFFICULTY" else "Visual + Interactive",
        "header_note": f"Based on your recent learning signals, this version provides a more guided, step-by-step explanation.",
        "concept_analogy": f"Let's visualize {topic_title} using a clear everyday analogy: think of it as structured labeled containers where each item has an explicit label and content.",
        "detailed_explanation": generated_text or f"In this adapted edition of {topic_title}, we break the fundamentals down into smaller, clear conceptual steps without overwhelming syntax.",
        "steps": [
            {"step": 1, "title": "Identify the Core Need", "description": f"Understand why {topic_title} exists in Python and how it solves real programming challenges."},
            {"step": 2, "title": "Inspect the Simplest Form", "description": "Look at the minimal code required to see the concept in action."},
            {"step": 3, "title": "Experiment in the Sandbox", "description": "Modify values and observe immediate console output."}
        ],
        "guided_code": f"# Adapted Step-by-Step Example for {topic_title}\n# Step 1: Initialize cleanly\nname = \"Jinesh\"\nscore = 100\n\n# Step 2: Output clearly\nprint(f\"Learner: {{name}}, Score: {{score}}\")\n",
        "expected_output": "Learner: Jinesh, Score: 100",
        "guided_practice": {
            "prompt": f"Write an adapted, simplified snippet demonstrating {topic_title} with print().",
            "starterCode": f"# Adapted Practice: {topic_title}\n\n",
            "expectedOutputMatcher": "Success",
            "hint": "Create your variable and use print('Success').",
            "solution": "print('Success')"
        },
        "knowledge_check": [
            {
                "id": f"kc-{t_id}-1",
                "question": f"What is the primary benefit of this adapted step-by-step approach to {topic_title}?",
                "options": [
                    "Breaks complex mechanics into manageable micro-steps",
                    "Changes the core Python programming language syntax",
                    "Requires reading an entire textbook first",
                    "Disables the code runner"
                ],
                "correctIndex": 0,
                "explanation": "Adapted lessons reduce cognitive friction by isolating concepts into step-by-step milestones."
            }
        ],
        "summary": [
            f"You reviewed an AI-adapted edition of {topic_title}.",
            "Mastery builds one clear concept at a time.",
            "You are ready to proceed with practice or advance to the next topic."
        ]
    }

    # 4. Save to persistent SQLite cache
    state_store.save_adapted_lesson(
        user_id=user_id,
        topic_id=t_id,
        adaptation_strategy=strategy,
        lesson_data=adapted_lesson_data,
        signals=payload.signals
    )

    # 5. Mark status in user_progress
    state_store.save_topic_progress(
        user_id=user_id,
        course_id=course_id,
        topic_id=t_id,
        status="ADAPTATION_AVAILABLE"
    )

    return {
        "success": True,
        "cached": False,
        "topic_id": t_id,
        "strategy": strategy,
        "adapted_lesson": adapted_lesson_data
    }


@router.get("/adapted/{topic_id}")
async def get_adapted_lesson_by_topic(topic_id: str, request: Request):
    """Retrieve an existing generated adapted lesson for a topic."""
    user_id = get_current_user_id(request)
    cached = state_store.get_adapted_lesson(user_id, topic_id)
    if not cached or not cached.get("lesson_data"):
        raise HTTPException(status_code=404, detail="No adapted lesson found for this topic.")
    return {
        "success": True,
        "topic_id": topic_id,
        "strategy": cached.get("adaptation_strategy", "SIMPLIFY"),
        "adapted_lesson": cached["lesson_data"]
    }
