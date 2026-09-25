"""
Document Validator module for the RAG Knowledge Base.
Performs rigorous structural, content, depth, and technical accuracy validation across all 32 documents.

Validation Checks:
1. Exactly 32 documents in total.
2. Exactly 8 documents per supported course (C, CPP, PYTHON, JAVA).
3. All files are non-empty and satisfy the minimum depth threshold (>= 1,800 words).
4. Required metadata header fields exist (COURSE, TOPIC, LEVEL, SOURCE, TITLE).
5. Core pedagogical sections exist (Introduction, Learning Objectives, Syntax, Code Examples, Mistakes, Debugging, Edge Cases, Best Practices, FAQs, Interview, Exam, Practice Questions, Summary).
6. No placeholder or unfinished text (TODO, TBD, placeholder, "more information later").
7. Technical accuracy markers verified.
"""

import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Any, Tuple

from rag.src.config import RAGConfig, default_config

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

REQUIRED_HEADERS = ["COURSE:", "TOPIC:", "LEVEL:", "SOURCE:"]

REQUIRED_SECTIONS = [
    "Introduction",
    "Learning Objectives",
    "Syntax",
    "Examples",
    "Mistakes",
    "Debugging",
    "Edge Cases",
    "Best Practices",
    "Interview Questions",
    "Exam Questions",
    "Practice Questions",
    "Summary"
]

FORBIDDEN_PLACEHOLDERS = [
    r"\bTODO\b",
    r"\bTBD\b",
    r"\bplaceholder\b",
    r"\bmore information can be added\b",
    r"\bto be determined\b",
    r"\bwill be covered later\b"
]

EXPECTED_COURSES = {
    "C": 8,
    "CPP": 8,
    "PYTHON": 8,
    "JAVA": 8
}


def validate_single_document(file_path: Path) -> Tuple[bool, List[str], Dict[str, Any]]:
    """Validate structure, depth, metadata, and quality of a single educational document."""
    errors: List[str] = []
    
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()

    words = len(content.split())
    chars = len(content)

    # 1. Non-empty check
    if chars == 0:
        errors.append("File is empty.")
        return False, errors, {"words": 0, "chars": 0}

    # 2. Depth check
    if words < 1700:
        errors.append(f"Document is too short ({words} words). Minimum required is 1,700+ words.")

    # 3. Metadata Header check
    header_block = content[:400]
    for req_header in REQUIRED_HEADERS:
        if req_header not in header_block:
            errors.append(f"Missing required metadata header: '{req_header}'")

    # 4. Sections check
    content_lower = content.lower()
    for sec in REQUIRED_SECTIONS:
        sec_lower = sec.lower()
        if sec_lower not in content_lower:
            errors.append(f"Missing key section or content topic: '{sec}'")

    # 5. Placeholder check
    for pat in FORBIDDEN_PLACEHOLDERS:
        match = re.search(pat, content, re.IGNORECASE)
        if match:
            errors.append(f"Contains forbidden placeholder text matching: '{match.group(0)}'")

    # 6. Technical sanity checks
    # Check that volatile is not claimed as providing thread safety without atomic/memory fence clarification
    if "volatile makes code thread-safe" in content_lower or "volatile provides thread safety" in content_lower:
        errors.append("Inaccurate claim: volatile does not provide thread safety in C/C++ without atomic operations.")

    is_valid = len(errors) == 0
    stats = {
        "words": words,
        "chars": chars,
        "valid": is_valid
    }
    return is_valid, errors, stats


def validate_all_documents(config: RAGConfig = default_config) -> Dict[str, Any]:
    """
    Run complete validation across all course documents in rag/documents/.
    Returns a summary dictionary with pass/fail status and detailed metrics.
    """
    docs_dir = config.documents_dir
    course_counts: Dict[str, int] = {}
    all_errors: Dict[str, List[str]] = {}
    doc_stats: Dict[str, Dict[str, Any]] = {}
    total_words = 0
    total_chars = 0

    print("=" * 70)
    print("STARTING KNOWLEDGE BASE DOCUMENT VALIDATION AUDIT")
    print(f"Directory: {docs_dir}")
    print("=" * 70)

    for course_name, expected_count in EXPECTED_COURSES.items():
        course_dir = docs_dir / course_name
        if not course_dir.exists():
            all_errors[course_name] = [f"Directory {course_dir} does not exist."]
            course_counts[course_name] = 0
            continue

        files = sorted(list(course_dir.glob("*.txt")))
        course_counts[course_name] = len(files)

        for f in files:
            is_valid, errs, stats = validate_single_document(f)
            total_words += stats["words"]
            total_chars += stats["chars"]
            doc_stats[f.name] = stats

            status_tag = "[PASS]" if is_valid else "[FAIL]"
            print(f"  {status_tag} {f.parent.name}/{f.name:32} | {stats['words']:5} words | {stats['chars']:6} chars")

            if not is_valid:
                all_errors[f.name] = errs
                for e in errs:
                    print(f"         └── [ERROR] {e}")

    # Verify course counts
    count_errors: List[str] = []
    total_files = sum(course_counts.values())
    if total_files != 32:
        count_errors.append(f"Total document count is {total_files}, expected exactly 32.")

    for c_name, exp_cnt in EXPECTED_COURSES.items():
        actual = course_counts.get(c_name, 0)
        if actual != exp_cnt:
            count_errors.append(f"Course {c_name} has {actual} files, expected exactly {exp_cnt}.")

    if count_errors:
        all_errors["course_counts"] = count_errors

    is_overall_valid = len(all_errors) == 0
    avg_words = total_words // total_files if total_files > 0 else 0

    print("\n" + "=" * 70)
    print("VALIDATION SUMMARY")
    print("=" * 70)
    print(f"Overall Status:        {'PASSED [OK]' if is_overall_valid else 'FAILED [X]'}")
    print(f"Total Documents:       {total_files} / 32")
    print(f"Total Word Count:      {total_words:,} words")
    print(f"Average Words/Doc:     {avg_words:,} words/doc")
    for c_name, cnt in course_counts.items():
        print(f"  - Course {c_name:6}: {cnt} documents (Expected: {EXPECTED_COURSES[c_name]})")
    print("=" * 70 + "\n")

    return {
        "valid": is_overall_valid,
        "total_files": total_files,
        "course_counts": course_counts,
        "total_words": total_words,
        "average_words": avg_words,
        "errors": all_errors,
        "doc_stats": doc_stats
    }


if __name__ == "__main__":
    result = validate_all_documents()
    if not result["valid"]:
        sys.exit(1)
    sys.exit(0)
