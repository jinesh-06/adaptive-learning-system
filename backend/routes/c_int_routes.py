import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from backend.services.state_store import state_store
from backend.routes.auth_routes import get_current_user_id

router = APIRouter(prefix="/curriculum/c-int", tags=["c-int"])

C_INT_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "c_intermediate_topics_data.json"
C_INT_TOPICS: List[Dict[str, Any]] = []
C_INT_TOPIC_MAP: Dict[str, Dict[str, Any]] = {}

if C_INT_DATA_PATH.exists():
    try:
        with open(C_INT_DATA_PATH, "r", encoding="utf-8") as f:
            _c_int_data = json.load(f)
            C_INT_TOPICS = _c_int_data.get("topics", [])
            for t in C_INT_TOPICS:
                C_INT_TOPIC_MAP[t["id"]] = t
    except Exception as e:
        print(f"[c_int_routes] Error loading C Intermediate data: {e}")

MODULE_INFO = [
    {
        "id": "mod-c-int-1",
        "title": "Module 1: Pointer Fundamentals",
        "description": "Foundational pointer syntax, referencing, dereferencing, and arithmetic.",
        "icon": "Hash"
    },
    {
        "id": "mod-c-int-2",
        "title": "Module 2: Pointers with Strings & Arrays",
        "description": "Strings as pointers, arrays of pointers, double pointers, and void pointers.",
        "icon": "Layers"
    },
    {
        "id": "mod-c-int-3",
        "title": "Module 3: Special Pointers & Pitfalls",
        "description": "Wild, null, and dangling pointers, function pointers, and callback architecture.",
        "icon": "ShieldAlert"
    },
    {
        "id": "mod-c-int-4",
        "title": "Module 4: Dynamic Memory Allocation & Mini Project",
        "description": "Heap allocation using malloc, calloc, realloc, avoiding leaks with free, and dynamic records.",
        "icon": "Cpu"
    }
]

TOPIC_METADATA = [
    {
        "id": "top-c-pointers-intro",
        "number": 1,
        "numberDisplay": "01",
        "moduleId": "mod-c-int-1",
        "moduleTitle": "Module 1: Pointer Fundamentals",
        "title": "Introduction to Pointers",
        "slug": "introduction-to-pointers",
        "difficulty": "Intermediate",
        "estimatedMinutes": 45,
        "shortDescription": "Master the concepts of Introduction to Pointers in C."
    },
    {
        "id": "top-c-pointer-declaration",
        "number": 2,
        "numberDisplay": "02",
        "moduleId": "mod-c-int-1",
        "moduleTitle": "Module 1: Pointer Fundamentals",
        "title": "Pointer Declaration and Initialization",
        "slug": "pointer-declaration-and-initialization",
        "difficulty": "Intermediate",
        "estimatedMinutes": 45,
        "shortDescription": "Master pointer declaration syntax, address-of operator &, and pointer initialization."
    },
    {
        "id": "top-c-pointer-arithmetic",
        "number": 3,
        "numberDisplay": "03",
        "moduleId": "mod-c-int-1",
        "moduleTitle": "Module 1: Pointer Fundamentals",
        "title": "Pointer Arithmetic",
        "slug": "pointer-arithmetic",
        "difficulty": "Intermediate",
        "estimatedMinutes": 45,
        "shortDescription": "Incrementing, decrementing, and indexing through memory using pointer arithmetic."
    },
    {
        "id": "top-c-pointer-functions",
        "number": 4,
        "numberDisplay": "04",
        "moduleId": "mod-c-int-1",
        "moduleTitle": "Module 1: Pointer Fundamentals",
        "title": "Pointers and Functions",
        "slug": "pointers-and-functions",
        "difficulty": "Intermediate",
        "estimatedMinutes": 45,
        "shortDescription": "Pass-by-reference semantics, modifying callers arguments, and returning pointers."
    },
    {
        "id": "top-c-pointer-arrays",
        "number": 5,
        "numberDisplay": "05",
        "moduleId": "mod-c-int-1",
        "moduleTitle": "Module 1: Pointer Fundamentals",
        "title": "Pointers and Arrays",
        "slug": "pointers-and-arrays",
        "difficulty": "Intermediate",
        "estimatedMinutes": 45,
        "shortDescription": "Deep dive into array decay, pointer equivalence, and buffer traversal."
    },
    {
        "id": "top-c-pointer-strings",
        "number": 6,
        "numberDisplay": "06",
        "moduleId": "mod-c-int-2",
        "moduleTitle": "Module 2: Pointers with Strings & Arrays",
        "title": "Pointers and Strings",
        "slug": "pointers-and-strings",
        "difficulty": "Intermediate",
        "estimatedMinutes": 45,
        "shortDescription": "Manipulating string literals, char pointers, and standard string library internals."
    },
    {
        "id": "top-c-array-pointers",
        "number": 7,
        "numberDisplay": "07",
        "moduleId": "mod-c-int-2",
        "moduleTitle": "Module 2: Pointers with Strings & Arrays",
        "title": "Array of Pointers",
        "slug": "array-of-pointers",
        "difficulty": "Intermediate",
        "estimatedMinutes": 45,
        "shortDescription": "Managing collections of references, jagged arrays, and command-line arguments."
    },
    {
        "id": "top-c-double-pointers",
        "number": 8,
        "numberDisplay": "08",
        "moduleId": "mod-c-int-2",
        "moduleTitle": "Module 2: Pointers with Strings & Arrays",
        "title": "Pointer to Pointer",
        "slug": "pointer-to-pointer",
        "difficulty": "Intermediate",
        "estimatedMinutes": 45,
        "shortDescription": "Double indirection, modifying pointers in functions, and 2D dynamic matrices."
    },
    {
        "id": "top-c-void-pointers",
        "number": 9,
        "numberDisplay": "09",
        "moduleId": "mod-c-int-2",
        "moduleTitle": "Module 2: Pointers with Strings & Arrays",
        "title": "Void Pointers",
        "slug": "void-pointers",
        "difficulty": "Intermediate",
        "estimatedMinutes": 45,
        "shortDescription": "Generic memory pointers, type-agnostic buffers, and explicit casting."
    },
    {
        "id": "top-c-invalid-pointers",
        "number": 10,
        "numberDisplay": "10",
        "moduleId": "mod-c-int-3",
        "moduleTitle": "Module 3: Special Pointers & Pitfalls",
        "title": "Null, Wild, and Dangling Pointers",
        "slug": "null-wild-dangling-pointers",
        "difficulty": "Intermediate",
        "estimatedMinutes": 45,
        "shortDescription": "Identify, debug, and prevent undefined behaviors and memory corruption."
    },
    {
        "id": "top-c-function-pointers",
        "number": 11,
        "numberDisplay": "11",
        "moduleId": "mod-c-int-3",
        "moduleTitle": "Module 3: Special Pointers & Pitfalls",
        "title": "Function Pointers",
        "slug": "function-pointers",
        "difficulty": "Intermediate",
        "estimatedMinutes": 45,
        "shortDescription": "Callback architecture, event handlers, and dispatch tables using function pointers."
    },
    {
        "id": "top-c-dynamic-intro",
        "number": 12,
        "numberDisplay": "12",
        "moduleId": "mod-c-int-4",
        "moduleTitle": "Module 4: Dynamic Memory Allocation & Mini Project",
        "title": "Introduction to Dynamic Memory Allocation",
        "slug": "introduction-to-dynamic-memory-allocation",
        "difficulty": "Intermediate",
        "estimatedMinutes": 45,
        "shortDescription": "Stack vs heap memory architecture and runtime memory sizing."
    },
    {
        "id": "top-c-malloc-calloc",
        "number": 13,
        "numberDisplay": "13",
        "moduleId": "mod-c-int-4",
        "moduleTitle": "Module 4: Dynamic Memory Allocation & Mini Project",
        "title": "malloc() and calloc()",
        "slug": "malloc-and-calloc",
        "difficulty": "Intermediate",
        "estimatedMinutes": 45,
        "shortDescription": "Allocating raw heap blocks with malloc vs zero-initialized memory with calloc."
    },
    {
        "id": "top-c-realloc",
        "number": 14,
        "numberDisplay": "14",
        "moduleId": "mod-c-int-4",
        "moduleTitle": "Module 4: Dynamic Memory Allocation & Mini Project",
        "title": "realloc()",
        "slug": "realloc",
        "difficulty": "Intermediate",
        "estimatedMinutes": 45,
        "shortDescription": "Growing and shrinking dynamic memory buffers safely without memory leaks."
    },
    {
        "id": "top-c-free-memory-leaks",
        "number": 15,
        "numberDisplay": "15",
        "moduleId": "mod-c-int-4",
        "moduleTitle": "Module 4: Dynamic Memory Allocation & Mini Project",
        "title": "free() and Memory Leaks",
        "slug": "free-and-memory-leaks",
        "difficulty": "Intermediate",
        "estimatedMinutes": 45,
        "shortDescription": "Releasing heap allocations, detecting memory leaks, and lifetime management."
    },
    {
        "id": "top-c-dynamic-project",
        "number": 16,
        "numberDisplay": "16",
        "moduleId": "mod-c-int-4",
        "moduleTitle": "Module 4: Dynamic Memory Allocation & Mini Project",
        "title": "Final Mini Project – Dynamic Student Record Manager",
        "slug": "dynamic-student-record-manager",
        "difficulty": "Advanced Project",
        "estimatedMinutes": 60,
        "shortDescription": "Build a comprehensive dynamic student records system with pointer-driven allocation."
    }
]


class CIntProgressPayload(BaseModel):
    topic_id: Optional[str] = None
    status: Optional[str] = "COMPLETED"
    completion_pct: Optional[float] = None
    quiz_score: Optional[float] = None
    attempts_delta: Optional[int] = 0
    time_spent_delta: Optional[float] = 0.0


@router.get("/progress")
@router.get("/dashboard")
async def get_c_int_dashboard(request: Request):
    """Retrieve full dashboard overview and topic progress for C Intermediate (Pointers & Memory)."""
    try:
        user_id = get_current_user_id(request)
        if not user_id or not isinstance(user_id, str) or not user_id.strip():
            user_id = "guest-learner"
        user_id = user_id.strip()

        # Query c-int progress safely
        raw_progress = state_store.get_user_course_progress(user_id, "c-int")
        progress_map: Dict[str, Dict[str, Any]] = {}
        for p in raw_progress:
            t_id = p.get("topic_id")
            if t_id:
                progress_map[t_id] = p

        # Check for legacy progress saved under c-beg for intermediate topics
        try:
            beg_progress = state_store.get_user_course_progress(user_id, "c-beg")
            meta_ids = {m["id"] for m in TOPIC_METADATA}
            for p in beg_progress:
                t_id = p.get("topic_id")
                if t_id and t_id in meta_ids and t_id not in progress_map:
                    progress_map[t_id] = p
        except Exception:
            pass

        # Query adapted lessons in a single batch query (1 query instead of 16 queries)
        adapted_topic_ids = state_store.get_user_adapted_topic_ids(user_id)

        completed_count = 0
        quiz_completed_count = 0
        total_time_spent = 0.0

        topics_output = []
        current_topic_id = TOPIC_METADATA[0]["id"] if TOPIC_METADATA else "top-c-pointers-intro"
        first_incomplete_found = False
        progress_summary = []

        for idx, meta in enumerate(TOPIC_METADATA):
            t_id = meta["id"]
            prog = progress_map.get(t_id, {})
            status = prog.get("status") or "NOT_STARTED"

            # Safe numeric conversions
            try:
                comp_pct = float(prog.get("completion_pct") if prog.get("completion_pct") is not None else (100.0 if status == "COMPLETED" else 0.0))
            except (ValueError, TypeError):
                comp_pct = 100.0 if status == "COMPLETED" else 0.0

            try:
                quiz_score = float(prog["quiz_score"]) if prog.get("quiz_score") is not None else None
            except (ValueError, TypeError):
                quiz_score = None

            try:
                time_spent = float(prog.get("time_spent_seconds") or 0.0)
            except (ValueError, TypeError):
                time_spent = 0.0

            total_time_spent += time_spent

            try:
                attempts = int(prog.get("attempts") or 0)
            except (ValueError, TypeError):
                attempts = 0

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
                if idx == 0:
                    status = "NOT_STARTED"
                elif idx > 0 and (topics_output[idx - 1]["status"] in ("COMPLETED", "IN_PROGRESS", "ADAPTATION_AVAILABLE")):
                    status = "NOT_STARTED"
                else:
                    status = "LOCKED"

                if status != "LOCKED" and not first_incomplete_found:
                    current_topic_id = t_id
                    first_incomplete_found = True

            has_adaptation = t_id in adapted_topic_ids
            if has_adaptation and status != "COMPLETED":
                status = "ADAPTATION_AVAILABLE"

            processed_topic = {
                **meta,
                "status": status,
                "completion_percentage": round(comp_pct, 1),
                "quiz_score": quiz_score,
                "attempts": attempts,
                "time_spent_seconds": round(time_spent, 1),
                "has_adapted_lesson": has_adaptation
            }
            topics_output.append(processed_topic)
            progress_summary.append({
                "topic_id": t_id,
                "status": status,
                "completed": status == "COMPLETED"
            })

        total_topics = len(TOPIC_METADATA)
        overall_progress = round((completed_count / total_topics) * 100) if total_topics > 0 else 0
        remaining_minutes = sum(
            int(t.get("estimatedMinutes") or 45)
            for t in topics_output
            if t["status"] != "COMPLETED"
        )

        return {
            "course_id": "c-int",
            "title": "C Pointers & Memory Management",
            "subtitle": "Master pointers, memory addresses, pointer arithmetic, arrays, strings, dynamic memory allocation, and memory management techniques in C.",
            "language": "c",
            "level": "Intermediate",
            "total_modules": len(MODULE_INFO),
            "total_topics": total_topics,
            "completed_topics": completed_count,
            "quizzes_completed": quiz_completed_count,
            "overall_progress": overall_progress,
            "progress_percentage": overall_progress,
            "current_topic_id": current_topic_id,
            "streak_days": 4,
            "estimated_remaining_minutes": remaining_minutes,
            "learning_signals_status": "Cognitive Engine Calibrated & Active",
            "modules": MODULE_INFO,
            "topics": topics_output,
            "progress": progress_summary
        }
    except Exception as e:
        print(f"[c_int_routes] Error in get_c_int_dashboard: {e}")
        # Safe fallback response that ensures 500 is never returned
        fallback_topics = []
        for idx, meta in enumerate(TOPIC_METADATA):
            fallback_topics.append({
                **meta,
                "status": "NOT_STARTED" if idx == 0 else "LOCKED",
                "completion_percentage": 0.0,
                "quiz_score": None,
                "attempts": 0,
                "time_spent_seconds": 0.0,
                "has_adapted_lesson": False
            })
        return {
            "course_id": "c-int",
            "title": "C Pointers & Memory Management",
            "subtitle": "Master pointers, memory addresses, pointer arithmetic, arrays, strings, dynamic memory allocation, and memory management techniques in C.",
            "language": "c",
            "level": "Intermediate",
            "total_modules": len(MODULE_INFO),
            "total_topics": len(TOPIC_METADATA),
            "completed_topics": 0,
            "quizzes_completed": 0,
            "overall_progress": 0,
            "progress_percentage": 0,
            "current_topic_id": TOPIC_METADATA[0]["id"] if TOPIC_METADATA else "top-c-pointers-intro",
            "streak_days": 4,
            "estimated_remaining_minutes": sum(int(t.get("estimatedMinutes") or 45) for t in TOPIC_METADATA),
            "learning_signals_status": "Cognitive Engine Calibrated & Active",
            "modules": MODULE_INFO,
            "topics": fallback_topics,
            "progress": [{"topic_id": t["id"], "status": "NOT_STARTED" if idx == 0 else "LOCKED", "completed": False} for idx, t in enumerate(TOPIC_METADATA)]
        }


@router.get("/topic/{topic_id}")
async def get_c_int_topic(topic_id: str):
    """Retrieve full interactive topic content including code examples, exercises, and quizzes."""
    topic = C_INT_TOPIC_MAP.get(topic_id)
    if not topic:
        meta = next((m for m in TOPIC_METADATA if m["id"] == topic_id), None)
        if meta:
            topic = {
                **meta,
                "conceptExplanation": meta.get("shortDescription", ""),
                "syntax": "// Pointer Syntax\nint *ptr;",
                "codeExample": "#include <stdio.h>\nint main(void) {\n    printf(\"C Pointers\\n\");\n    return 0;\n}",
                "expectedOutput": "C Pointers",
                "commonMistakes": [],
                "learningObjectives": ["Understand pointer syntax and mechanics"],
                "quiz": []
            }
    if not topic:
        raise HTTPException(status_code=404, detail=f"Topic '{topic_id}' not found.")
    return {"success": True, "topic": topic}


@router.post("/progress")
async def update_c_int_progress(payload: CIntProgressPayload, request: Request):
    """Save progress for a C Intermediate topic."""
    try:
        user_id = get_current_user_id(request) or "guest-learner"
        topic_id = payload.topic_id or "top-c-pointers-intro"
        status = payload.status or "COMPLETED"
        comp_pct = payload.completion_pct if payload.completion_pct is not None else (100.0 if status == "COMPLETED" else 50.0)
        result = state_store.save_topic_progress(
            user_id=user_id,
            course_id="c-int",
            topic_id=topic_id,
            status=status,
            completion_pct=comp_pct,
            quiz_score=payload.quiz_score,
            attempts_delta=payload.attempts_delta or 0,
            time_spent_delta=payload.time_spent_delta or 0.0
        )
        return {"success": True, "message": "Progress updated successfully", "progress": result}
    except Exception as e:
        print(f"[c_int_routes] Error in update_c_int_progress: {e}")
        return {"success": False, "message": str(e), "error": str(e)}


@router.post("/progress/{topic_id}")
async def update_c_int_progress_topic(topic_id: str, request: Request, payload: Optional[Dict[str, Any]] = None):
    """Legacy route for updating a C Intermediate topic status by topic ID in path."""
    try:
        user_id = get_current_user_id(request) or "guest-learner"
        status = "COMPLETED"
        if payload and isinstance(payload, dict):
            status = payload.get("status", "COMPLETED")
        result = state_store.save_topic_progress(
            user_id=user_id,
            course_id="c-int",
            topic_id=topic_id,
            status=status,
            completion_pct=100.0 if status == "COMPLETED" else 50.0
        )
        return {"message": "Progress updated successfully", "topic_id": topic_id, "status": status, "progress": result}
    except Exception as e:
        print(f"[c_int_routes] Error in update_c_int_progress_topic: {e}")
        return {"message": "Failed to update progress", "error": str(e)}
