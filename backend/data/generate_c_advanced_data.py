"""Script to generate authoritative curriculum data for Advanced C Systems & Data Structures:
1. backend/data/c_advanced_topics_data.json
2. src/data/cAdvancedData.ts
3. Updates src/data/platformData.json with modules & topics
"""

import json
import os
import sys
from pathlib import Path

# Add backend to path
DATA_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = DATA_DIR.parent.parent
sys.path.insert(0, str(DATA_DIR))

from gen_c_adv_mod1 import get_module_1_topics
from gen_c_adv_mod2 import get_module_2_topics
from gen_c_adv_mod3 import get_module_3_topics
from gen_c_adv_mod4 import get_module_4_topics

MODULES_DEF = [
    {
        "id": "mod-c-adv-structures",
        "number": 1,
        "numberDisplay": "01",
        "title": "Module 1: Structures and Data Organization",
        "level": "Advanced",
        "estimatedHours": 3.5,
        "estimatedMinutes": 200,
        "description": "Structures, nested records, structure pointers, dynamic memory allocation for structures, unions, enumerations, typedef, and memory-efficient bit fields in C."
    },
    {
        "id": "mod-c-adv-files",
        "number": 2,
        "numberDisplay": "02",
        "title": "Module 2: File Handling and Preprocessor",
        "level": "Advanced",
        "estimatedHours": 3.0,
        "estimatedMinutes": 155,
        "description": "File pointers, streams, text vs binary files, formatted/unformatted file I/O, random access with fseek and ftell, error handling, preprocessor macros, header guards, and modular compilation."
    },
    {
        "id": "mod-c-adv-data-structures",
        "number": 3,
        "numberDisplay": "03",
        "title": "Module 3: Core Data Structures",
        "level": "Advanced",
        "estimatedHours": 4.5,
        "estimatedMinutes": 275,
        "description": "Abstract data types, computational complexity, Big O analysis, singly linked lists, doubly and circular linked lists, stacks, queues, and binary search trees with pointer manipulation and memory deallocation."
    },
    {
        "id": "mod-c-adv-algorithms-systems",
        "number": 4,
        "numberDisplay": "04",
        "title": "Module 4: Algorithms and Systems Programming",
        "level": "Advanced",
        "estimatedHours": 4.0,
        "estimatedMinutes": 245,
        "description": "Searching algorithms, sorting algorithms, algorithmic complexity comparison, command-line arguments (argc, argv), modular multi-file architecture, debugging, and the complete Library Management System final project."
    }
]

VISUAL_MODELS = {
    "top-c-advanced-structures": """+---------------------------------------------------------------+
|                      struct Student Memory                    |
+-----------------------------------+---------------------------+
| rollNumber (int: 4 bytes)         | [0x1000 - 0x1003] = 101   |
| name       (char[50]: 50 bytes)   | [0x1004 - 0x1035] "Alice" |
| [Padding]  (2 bytes align)        | [0x1036 - 0x1037] [PAD]   |
| gpa        (float: 4 bytes)       | [0x1038 - 0x103B] = 3.92  |
+-----------------------------------+---------------------------+
Total sizeof(struct Student) = 60 Bytes (Contiguous Stack / Heap block)""",

    "top-c-structure-pointers": """+----------------+          +--------------------------------------+
|  ptr (Pointer) | -------> |       Heap / Stack struct Student    |
|  [0x7FFE0010]  |          +------------------+-------------------+
|  Val: 0x2000   |          | rollNumber       | 101               |
+----------------+          | name             | "David"           |
                            | gpa              | 3.85              |
                            +------------------+-------------------+
    Direct: (*ptr).rollNumber    Shorthand Arrow: ptr->rollNumber""",

    "top-c-unions-enums": """+-------------------------------------------------------------+
|               union Value (Shared 8 Bytes of Memory)        |
+-------------------------------------------------------------+
| intVal    [4 bytes] [0x3000 - 0x3003]                      |
| floatVal  [4 bytes] [0x3000 - 0x3003]                      |
| doubleVal [8 bytes] [0x3000 - 0x3007] (Dominates union size)|
+-------------------------------------------------------------+
* Overwrites previous member when a new field is assigned!""",

    "top-c-typedef-bitfields": """+-----------------------------------------------------------------+
|             struct StatusRegister (Single 16-Bit Word)          |
+-------+--------+---------+---------+----------------------------+
| Bit 0 | Bit 1  | Bit 2   | Bit 3-5 | Bits 6-15                  |
| isRead| isWrite| isExec  | mode(3b)| reserved (10 bits)         |
+-------+--------+---------+---------+----------------------------+
Memory Efficiency: Fits 4 control flags in 2 bytes instead of 16 bytes!""",

    "top-c-file-fundamentals": """[User C Program] <---> [C Runtime FILE Buffer] <---> [OS Kernel / Disk]
  fopen("db.txt", "r")       stdin / stdout / file           Persistent File
  fgetc() / fgets()          In-memory 4KB cache             Sectors on Storage
  fclose(fp)                 Flushes dirty buffers           File handle closed""",

    "top-c-file-operations": """+--------------------------------------------------------------------+
|                    File Byte Stream (Random Access)                |
+---------+---------+---------+---------+---------+---------+--------+
| Byte 0  | Byte 1  | Byte 2  | Byte 3  | Byte 4  | Byte 5  | ...EOF |
+---------+---------+---------+---------+---------+---------+--------+
     ^                             ^
  ftell(fp)=0               ftell(fp)=3
  SEEK_SET                   fseek(fp, 3, SEEK_SET)""",

    "top-c-preprocessor": """[Source .c File] + [Header .h]
        |
        v  (cpp: Macro replacement, #include expansion, conditional strips)
[Preprocessed .i Translation Unit]
        |
        v  (gcc: Compilation to Assembler)
[Assembly .s] ---> [Object .o] ---> [Linker ld] ---> [Executable .exe]""",

    "top-c-data-structures-intro": """           Complexity Growth (Big O Notation)
Operations ^
     O(n²) |                                 *
           |                          *
  O(n logn)|                    *
      O(n) |             *
  O(log n) |       *
      O(1) | *--------------------------------
           +-----------------------------------> Elements (n)""",

    "top-c-singly-linked-list": """+---------+       +---------+------+       +---------+------+       +---------+------+
|  HEAD   | ----> | Data: 10| Next | ----> | Data: 20| Next | ----> | Data: 30| NULL |
+---------+       +---------+------+       +---------+------+       +---------+------+
0x1000             [Node at 0x2000]         [Node at 0x3000]         [Node at 0x4000]""",

    "top-c-doubly-circular-list": """                  +----------------------------------------------+
                  |                                              |
                  v                                              |
            +-----+----+------+     +-----+----+------+          |
 HEAD ----> | Prev| 10 | Next | <-> | Prev| 20 | Next | ---------+
            +-----+----+------+     +-----+----+------+
               ^                                  |
               +----------------------------------+""",

    "top-c-stacks-queues": """STACK (LIFO: Last-In, First-Out)          QUEUE (FIFO: First-In, First-Out)
       |   Push / Pop   |                       Enqueue              Dequeue
       v       ^        |                          v                    ^
    +-------------+     |               +----+----+----+----+    +----+ |
    |    Item 3   | <-- TOP             | D  | C  | B  | A  | -> |Out |-+
    +-------------+                     +----+----+----+----+    +----+
    |    Item 2   |                     REAR                 FRONT
    +-------------+
    |    Item 1   |
    +-------------+""",

    "top-c-trees-bst": """                         [ 50 (Root) ]
                         /           \
                 [ 30 (< 50) ]    [ 70 (> 50) ]
                 /          \     /           \
             [ 20 ]       [ 40 ] [ 60 ]       [ 80 ]
  Inorder Traversal: Left -> Root -> Right yields sorted ascending order:
                    20, 30, 40, 50, 60, 70, 80""",

    "top-c-searching": """LINEAR SEARCH: O(n) Sequential Check
[ 12 | 45 | 7 | 89 | 23 | 56 ] -> Inspect each index 0, 1, 2, ...

BINARY SEARCH: O(log n) Divide-and-Conquer (Requires Sorted Array)
[ 11 | 22 | 33 | 44 | 55 | 66 | 77 ] Target: 66
               ^ Mid=44 (66 > 44, discard left half)
                     [ 55 | 66 | 77 ]
                            ^ Mid=66 Found in 2 steps!""",

    "top-c-sorting": """QUICKSORT PARTITIONING AROUND PIVOT:
[ 40 | 10 | 80 | 30 | 90 | 70 | 50 (Pivot) ]
  Left elements (< 50)     Pivot       Right elements (> 50)
  [ 40 | 10 | 30 ]       | [ 50 ] |    [ 80 | 90 | 70 ]
Recursively sort sub-arrays -> Time Complexity O(n log n) average.""",

    "top-c-command-line-modular": """$ ./app input.txt --verbose 42

argc = 4
argv[0] -> "./app"
argv[1] -> "input.txt"
argv[2] -> "--verbose"
argv[3] -> "42"
argv[4] -> NULL""",

    "top-c-library-project": """+------------------------------------------------------------------------+
|                LIBRARY MANAGEMENT SYSTEM ARCHITECTURE                  |
+------------------------------------------------------------------------+
| [ main.c ]                                                             |
|   Menu Dispatcher -> Add / Search / Issue / Return / Display / Save    |
+------------------------------------+-----------------------------------+
                                     |
                                     v
+------------------------------------+-----------------------------------+
| [ Book Linked List Node ]          | [ File Persistence Engine ]       |
|   - id, title, author, price, qty  |   - fopen("library.dat", "rb/wb") |
|   - isIssued, issuedToUser         |   - fread() / fwrite() records    |
|   - struct Book* next              |   - Atomic disk sync on exit      |
+------------------------------------+-----------------------------------+"""
}

def main():
    m1 = get_module_1_topics()
    m2 = get_module_2_topics()
    m3 = get_module_3_topics()
    m4 = get_module_4_topics()

    all_topics = m1 + m2 + m3 + m4
    print(f"Total topics generated: {len(all_topics)}")
    assert len(all_topics) == 16, f"Expected exactly 16 topics, got {len(all_topics)}"

    # Ensure sections and canonical fields exist for all topics
    for idx, t in enumerate(all_topics):
        t["number"] = idx + 1
        t["numberDisplay"] = f"{idx + 1:02d}"

        # 1. learningObjectives
        # 2. introduction
        if not t.get("introduction"):
            ce = t.get("conceptExplanation", "")
            paras = [p.strip() for p in ce.split("\n\n") if p.strip() and not p.strip().startswith("#")]
            t["introduction"] = paras[0] if paras else t.get("shortDescription", f"Introduction to {t['title']} in C.")

        # 3. conceptExplanation
        # 4. syntax and syntaxAndUsage
        t["syntaxAndUsage"] = t.get("syntax", "")

        # 5. visualModel and visualDiagram
        t["visualModel"] = VISUAL_MODELS.get(t["id"], t.get("visualDiagram", ""))
        t["visualDiagram"] = t["visualModel"]

        # 6. interactiveCodeExample
        t["interactiveCodeExample"] = t.get("codeExample", "")

        # 7. lineByLineExplanation and stepByStep
        sbs = t.get("stepByStep", [])
        t["lineByLineExplanation"] = sbs
        t["stepByStep"] = sbs

        # 8. dryRun
        # 9. keyTakeaways
        # 10. commonMistakes

        # 11. realWorldApplications and realWorldExample
        rwe = t.get("realWorldExample", {})
        t["realWorldApplications"] = rwe
        t["realWorldExample"] = rwe

        # 12. tryYourself and practice
        prac = t.get("practice", {})
        t["tryYourself"] = prac
        t["practice"] = prac

        # 13. miniQuiz and quiz
        q = t.get("quiz", [])
        t["miniQuiz"] = q
        t["quiz"] = q

        # 14. codingChallenge

        # 15. lessonSummary and summary
        summ = t.get("summary", [])
        t["lessonSummary"] = summ
        t["summary"] = summ

        if not t.get("sections"):
            t["sections"] = [
                {
                    "id": f"{t['id']}-sec-1",
                    "title": f"1. Conceptual Foundations: {t['title']}",
                    "order_index": 1,
                    "content": t.get("conceptExplanation", ""),
                    "code_snippet": t.get("syntax", ""),
                    "pitfalls": t.get("commonMistakes", [{}])[0].get("mistake", "") if t.get("commonMistakes") else ""
                },
                {
                    "id": f"{t['id']}-sec-2",
                    "title": "2. Working Code & Memory Mechanics",
                    "order_index": 2,
                    "content": "\n\n".join(t.get("stepByStep", [])),
                    "code_snippet": t.get("codeExample", ""),
                    "pitfalls": t.get("commonMistakes", [{}])[0].get("explanation", "") if t.get("commonMistakes") else ""
                },
                {
                    "id": f"{t['id']}-sec-3",
                    "title": "3. Systems Practice & Key Insights",
                    "order_index": 3,
                    "content": "\n\n".join(t.get("summary", [])),
                    "code_snippet": t.get("simpleExample", {}).get("code", ""),
                    "pitfalls": t.get("commonMistakes", [{}])[-1].get("correction", "") if t.get("commonMistakes") else ""
                }
            ]
        if not t.get("content_standard"):
            t["content_standard"] = t.get("conceptExplanation", "")

    # Group topics into modules
    modules_output = []
    for m in MODULES_DEF:
        m_topics = [t for t in all_topics if t["moduleId"] == m["id"]]
        modules_output.append({
            **m,
            "topics": m_topics
        })

    # 1. Write backend/data/c_advanced_topics_data.json
    backend_json_path = DATA_DIR / "c_advanced_topics_data.json"
    backend_payload = {
        "course_id": "c-advanced-systems",
        "title": "Advanced C Systems & Data Structures",
        "description": "Master structures, unions, file handling, linked lists, stacks, queues, trees, searching, sorting, and low-level systems programming through practical C implementations.",
        "level": "Advanced",
        "language": "c",
        "total_topics": 16,
        "total_duration_hours": 14,
        "modules": modules_output,
        "topics": all_topics
    }
    with open(backend_json_path, "w", encoding="utf-8") as f:
        json.dump(backend_payload, f, indent=2)
    print(f"Successfully wrote {backend_json_path}")

    # 2. Write src/data/cAdvancedData.ts
    frontend_ts_path = PROJECT_ROOT / "src" / "data" / "cAdvancedData.ts"
    
    ts_content = f"""// Authoritative curriculum dataset for Advanced C Systems & Data Structures course
// Auto-generated by backend/data/generate_c_advanced_data.py - DO NOT EDIT MANUALLY

import {{ TopicQuizQuestion }} from './pythonFundamentalsData';

export interface CCommonMistake {{
  mistake: string;
  correction: string;
  explanation: string;
  whyWrong?: string;
}}

export interface CPracticeChallenge {{
  prompt: string;
  starterCode: string;
  hints?: string[];
  expectedOutputMatcher?: string;
  solution?: string;
}}

export interface CTopic {{
  id: string;
  number: number;
  numberDisplay: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  slug: string;
  language: 'c';
  difficulty: 'Advanced' | 'Advanced Project' | string;
  estimatedMinutes: number;
  prerequisiteId: string | null;
  shortDescription: string;
  learningObjectives: string[];
  conceptExplanation: string;
  visualDiagram?: string;
  syntax: string;
  simpleExample: {{
    code: string;
    explanation: string;
  }};
  codeExample: string;
  expectedOutput: string;
  stepByStep: string[];
  dryRun?: string;
  keyTakeaways?: string[];
  commonMistakes: CCommonMistake[];
  realWorldExample: {{
    scenario: string;
    code: string;
    explanation: string;
  }};
  practice: CPracticeChallenge;
  quiz: TopicQuizQuestion[];
  codingChallenge?: {{
    title?: string;
    difficulty?: string;
    problem_statement?: string;
    input_format?: string;
    output_format?: string;
    constraints?: string;
    starter_code?: string;
    expected_output?: string;
    test_cases?: any[];
    [key: string]: any;
  }};
  summary: string[];
  introduction?: string;
  visualModel?: string;
  lineByLineExplanation?: string[];
  realWorldApplications?: {{
    scenario: string;
    code: string;
    explanation: string;
  }};
  tryYourself?: CPracticeChallenge;
  lessonSummary?: string[];
  content_standard?: string;
  content_detailed?: string;
  content_simplified?: string;
  sections?: any[];
  [key: string]: any;
}}

export interface CModule {{
  id: string;
  number: number;
  numberDisplay: string;
  title: string;
  level: string;
  estimatedHours: number;
  estimatedMinutes: number;
  description: string;
  topics: CTopic[];
}}

export const C_ADVANCED_MODULES_INFO = {json.dumps(MODULES_DEF, indent=2)};

export const C_ADVANCED_TOPICS: CTopic[] = {json.dumps(all_topics, indent=2)};

export const C_ADVANCED_MODULES: CModule[] = C_ADVANCED_MODULES_INFO.map(m => ({{
  ...m,
  topics: C_ADVANCED_TOPICS.filter(t => t.moduleId === m.id)
}}));
"""
    with open(frontend_ts_path, "w", encoding="utf-8") as f:
        f.write(ts_content)
    print(f"Successfully wrote {frontend_ts_path}")

    # 3. Update src/data/platformData.json
    platform_data_path = PROJECT_ROOT / "src" / "data" / "platformData.json"
    if platform_data_path.exists():
        try:
            with open(platform_data_path, "r", encoding="utf-8") as f:
                pdata = json.load(f)

            # Ensure course exists
            courses = pdata.get("courses", [])
            c_course = next((c for c in courses if c["id"] == "c-advanced-systems"), None)
            course_obj = {
                "id": "c-advanced-systems",
                "language": "c",
                "level": "advanced",
                "title": "Advanced C Systems & Data Structures",
                "description": "Master structures, unions, file handling, linked lists, stacks, queues, trees, searching, sorting, and low-level systems programming through practical C implementations.",
                "order_index": 3
            }
            if c_course:
                c_course.update(course_obj)
            else:
                courses.append(course_obj)
            pdata["courses"] = courses

            # Update modules
            existing_mods = pdata.get("modules", [])
            # Remove any stale c-advanced-systems modules
            existing_mods = [m for m in existing_mods if m.get("course_id") != "c-advanced-systems"]
            for m in MODULES_DEF:
                existing_mods.append({
                    "id": m["id"],
                    "course_id": "c-advanced-systems",
                    "title": m["title"],
                    "order_index": m["number"]
                })
            pdata["modules"] = existing_mods

            # Update topics
            existing_topics = pdata.get("topics", [])
            # Remove any old topics for these modules
            mod_ids = {m["id"] for m in MODULES_DEF}
            existing_topics = [t for t in existing_topics if t.get("module_id") not in mod_ids and not t.get("id", "").startswith("top-c-adv-")]
            
            for t in all_topics:
                existing_topics.append({
                    "id": t["id"],
                    "module_id": t["moduleId"],
                    "title": t["title"],
                    "slug": t["slug"],
                    "order_index": t["number"],
                    "difficulty": t["difficulty"].lower()
                })
            pdata["topics"] = existing_topics

            with open(platform_data_path, "w", encoding="utf-8") as f:
                json.dump(pdata, f, indent=2)
            print(f"Successfully updated platformData.json with modules & topics.")
        except Exception as e:
            print(f"Error updating platformData.json: {e}")

if __name__ == "__main__":
    main()
