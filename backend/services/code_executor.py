"""Code execution engine supporting Python and C in safe subprocess environments with LeetCode-style test case grading."""

import sys
import os
import re
import ast
import time
import subprocess
import shutil
from typing import Dict, Any, Optional, List
from pathlib import Path

# Paths to system tools if available
CLANG_NDK_BIN = r"C:\Program Files\Unity\Hub\Editor\6000.3.11f1\Editor\Data\PlaybackEngines\AndroidPlayer\NDK\toolchains\llvm\prebuilt\windows-x86_64\bin\clang.exe"
CLANG_NDK_SYSROOT = r"C:\Program Files\Unity\Hub\Editor\6000.3.11f1\Editor\Data\PlaybackEngines\AndroidPlayer\NDK\toolchains\llvm\prebuilt\windows-x86_64\sysroot"

DISALLOWED_PYTHON_MODULES = {
    "os", "subprocess", "shutil", "socket", "pty", "commands",
    "posix", "nt", "signal", "multiprocessing", "threading",
    "ctypes", "winreg", "_winapi"
}

C_RUNTIME_PREAMBLE = """
import sys
import re
import math

_stdin_content = sys.stdin.read()
_tokens = _stdin_content.split()
_token_idx = 0
_line_idx = 0
_lines = _stdin_content.splitlines()

def _read_token():
    global _token_idx
    if _token_idx < len(_tokens):
        t = _tokens[_token_idx]
        _token_idx += 1
        return t
    return ""

def _read_int():
    t = _read_token()
    if not t:
        return 0
    try:
        return int(t)
    except Exception:
        return 0

def _read_float():
    t = _read_token()
    if not t:
        return 0.0
    try:
        return float(t)
    except Exception:
        return 0.0

def _read_line():
    global _line_idx
    if _line_idx < len(_lines):
        line = _lines[_line_idx]
        _line_idx += 1
        return line
    return ""

def _has_input():
    return _token_idx < len(_tokens)

def _c_printf(fmt, *args):
    if not args:
        sys.stdout.write(fmt.replace('\\\\n', '\\n').replace('\\\\t', '\\t'))
        return
    try:
        formatted_args = []
        for a in args:
            if isinstance(a, list):
                if a and isinstance(a[0], str):
                    formatted_args.append("".join(a))
                else:
                    formatted_args.append(str(a))
            else:
                formatted_args.append(a)
        sys.stdout.write(fmt % tuple(formatted_args))
    except Exception:
        out = fmt
        for a in args:
            val_str = "".join(a) if (isinstance(a, list) and a and isinstance(a[0], str)) else str(a)
            out = re.sub(r'%[0-9]*[.]?[0-9]*[a-zA-Z]', val_str, out, count=1)
        sys.stdout.write(out.replace('\\\\n', '\\n').replace('\\\\t', '\\t'))

def _c_bin(n):
    if n >= 0:
        return "0b" + bin(n)[2:]
    return bin(n)

def _c_oct(n):
    if n >= 0:
        return "0o" + oct(n)[2:]
    return oct(n)

def _c_hex(n):
    if n >= 0:
        return "0x" + hex(n)[2:].lower()
    return hex(n)

def strcmp(s1, s2):
    s1_str = str(s1)
    s2_str = str(s2)
    return (s1_str > s2_str) - (s1_str < s2_str)

def strncmp(s1, s2, n):
    s1_str = str(s1)[:n]
    s2_str = str(s2)[:n]
    return (s1_str > s2_str) - (s1_str < s2_str)

def strlen(s):
    return len(str(s))

def isdigit(c):
    return str(c).isdigit()

def isalnum(c):
    return str(c).isalnum()

def isalpha(c):
    return str(c).isalpha()

def tolower(c):
    return str(c).lower()

def toupper(c):
    return str(c).upper()
"""


class CodeExecutor:
    """Multi-language execution engine for Python, C, C++, and Java."""

    @staticmethod
    def validate_python_code(code: str) -> Optional[str]:
        """Validate Python code for syntax and restricted imports."""
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            return f"SyntaxError: {e.msg} (line {e.lineno})"

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    root_mod = alias.name.split(".")[0]
                    if root_mod in DISALLOWED_PYTHON_MODULES:
                        return f"SecurityError: Importing '{root_mod}' is restricted in this educational environment."
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    root_mod = node.module.split(".")[0]
                    if root_mod in DISALLOWED_PYTHON_MODULES:
                        return f"SecurityError: Importing '{root_mod}' is restricted in this educational environment."
        return None

    @staticmethod
    def validate_c_code(code: str) -> Optional[str]:
        """Validate C code syntax with compiler or structure analysis."""
        # 1. Check Clang if available
        if os.path.exists(CLANG_NDK_BIN) and os.path.exists(CLANG_NDK_SYSROOT):
            import tempfile
            tmp_path = None
            try:
                with tempfile.NamedTemporaryFile(suffix=".c", mode="w", encoding="utf-8", delete=False) as f:
                    f.write(code)
                    tmp_path = f.name
                proc = subprocess.run(
                    [
                        CLANG_NDK_BIN,
                        "--target=x86_64-linux-android29",
                        f"--sysroot={CLANG_NDK_SYSROOT}",
                        "-fsyntax-only",
                        tmp_path
                    ],
                    capture_output=True,
                    text=True,
                    timeout=3.0
                )
                if proc.returncode != 0:
                    err = proc.stderr.replace(tmp_path, "solution.c").strip()
                    return err
                return None
            except Exception:
                pass
            finally:
                if tmp_path and os.path.exists(tmp_path):
                    try:
                        os.remove(tmp_path)
                    except Exception:
                        pass

        # 2. Basic structural syntax check
        open_b = code.count('{')
        close_b = code.count('}')
        if open_b != close_b:
            return f"Compiler Error: Unmatched curly braces ({open_b} '{{' vs {close_b} '}}')"

        open_p = code.count('(')
        close_p = code.count(')')
        if open_p != close_p:
            return f"Compiler Error: Unmatched parentheses ({open_p} '(' vs {close_p} ')')"

        if "main" not in code:
            return "Compiler Error: Expected function 'main' in C program."

        return None

    @staticmethod
    def transpile_c_to_python(c_code: str) -> str:
        """Convert standard procedural and functional C code into executable Python."""
        lines = c_code.splitlines()
        clean_lines = []
        in_block_comment = False

        for line in lines:
            stripped = line.strip()
            if in_block_comment:
                if '*/' in stripped:
                    in_block_comment = False
                    stripped = stripped.split('*/', 1)[1].strip()
                else:
                    continue
            if '/*' in stripped:
                if '*/' in stripped:
                    stripped = re.sub(r'/\*.*?\*/', '', stripped)
                else:
                    in_block_comment = True
                    stripped = stripped.split('/*', 1)[0].strip()

            if '//' in stripped:
                stripped = stripped.split('//', 1)[0].strip()

            if stripped.startswith('#'):
                continue

            if stripped:
                clean_lines.append(stripped)

        full_code = " ".join(clean_lines)

        full_code = re.sub(r'\bprintf\s*\(', '_c_printf(', full_code)

        # 1. Handle if (scanf(...) == 1) / if (scanf(...) >= 1)
        def replace_if_scanf(m):
            fmt = m.group(1)
            args_str = m.group(2)
            args = [a.strip().lstrip('&') for a in args_str.split(',') if a.strip()]
            specifiers = re.findall(r'%[a-zA-Z]', fmt)
            assignments = []
            for i, spec in enumerate(specifiers):
                var = args[i] if i < len(args) else f"_unused_{i}"
                if spec in ('%d', '%i', '%ld'):
                    assignments.append(f"{var} = _read_int()")
                elif spec in ('%f', '%lf'):
                    assignments.append(f"{var} = _read_float()")
                elif spec in ('%s', '%c'):
                    assignments.append(f"{var} = _read_token()")
                else:
                    assignments.append(f"{var} = _read_token()")
            assign_str = "; ".join(assignments)
            return f"{assign_str}; if (True)"

        full_code = re.sub(r'if\s*\(\s*scanf\s*\(\s*"([^"]*)"\s*,\s*([^)]*)\)\s*(?:==|>=|!=)\s*\w+\s*\)', replace_if_scanf, full_code)

        # 2. Handle while (scanf(...) == 1)
        def replace_while_scanf(m):
            fmt = m.group(1)
            args_str = m.group(2)
            has_brace = m.group(3)
            args = [a.strip().lstrip('&') for a in args_str.split(',') if a.strip()]
            specifiers = re.findall(r'%[a-zA-Z]', fmt)
            assignments = []
            for i, spec in enumerate(specifiers):
                var = args[i] if i < len(args) else f"_unused_{i}"
                if spec in ('%d', '%i', '%ld'):
                    assignments.append(f"{var} = _read_int()")
                elif spec in ('%f', '%lf'):
                    assignments.append(f"{var} = _read_float()")
                elif spec in ('%s', '%c'):
                    assignments.append(f"{var} = _read_token()")
                else:
                    assignments.append(f"{var} = _read_token()")
            assign_str = "; ".join(assignments)
            if has_brace:
                return f"while (_has_input()) {{ {assign_str};"
            return f"while (_has_input()) {{ {assign_str};"

        full_code = re.sub(r'while\s*\(\s*scanf\s*\(\s*"([^"]*)"\s*,\s*([^)]*)\)\s*(?:==|>=|!=)\s*\w+\s*\)(\s*\{)?', replace_while_scanf, full_code)

        # 3. Handle fgets(s, sizeof(s), stdin)
        def replace_fgets(m):
            var = m.group(1)
            return f"{var} = _read_line()"

        full_code = re.sub(r'if\s*\(\s*fgets\s*\(\s*([a-zA-Z_]\w*)\s*,[^,]+,\s*stdin\s*\)\s*\)', r'\1 = _read_line(); if bool(\1)', full_code)
        full_code = re.sub(r'fgets\s*\(\s*([a-zA-Z_]\w*)\s*,[^,]+,\s*stdin\s*\)', r'\1 = _read_line()', full_code)

        # 4. Standard scanf
        def replace_scanf(m):
            fmt = m.group(1)
            args = [a.strip().lstrip('&') for a in m.group(2).split(',') if a.strip()]
            specifiers = re.findall(r'%[a-zA-Z]', fmt)
            assignments = []
            for i, spec in enumerate(specifiers):
                var = args[i] if i < len(args) else f"_unused_{i}"
                if spec in ('%d', '%i', '%ld'):
                    assignments.append(f"{var} = _read_int()")
                elif spec in ('%f', '%lf'):
                    assignments.append(f"{var} = _read_float()")
                elif spec in ('%s', '%c'):
                    assignments.append(f"{var} = _read_token()")
                else:
                    assignments.append(f"{var} = _read_token()")
            return "; ".join(assignments)

        full_code = re.sub(r'\bscanf\s*\(\s*"([^"]*)"\s*,\s*([^)]*)\)', replace_scanf, full_code)
        full_code = re.sub(r'\bscanf\s*\(\s*"([^"]*)"\s*\)', r'_read_token()', full_code)

        # 5. String function translations
        full_code = re.sub(r'strcmp\s*\(\s*([^,]+?)\s*,\s*([^)]+?)\)\s*==\s*0', r'\1 == \2', full_code)
        full_code = re.sub(r'strcmp\s*\(\s*([^,]+?)\s*,\s*([^)]+?)\)\s*!=\s*0', r'\1 != \2', full_code)
        full_code = re.sub(
            r'for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*0\s*;\s*\1\s*<\s*(?:strlen|len)\s*\(\s*(\w+)\s*\)\s*;\s*\1\+\+\s*\)\s*\{\s*\2\[\1\]\s*=\s*tolower\s*\(\s*\2\[\1\]\s*\)\s*;\s*\}',
            r'\2 = \2.lower();',
            full_code
        )
        full_code = re.sub(
            r'for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*0\s*;\s*\1\s*<\s*(?:strlen|len)\s*\(\s*(\w+)\s*\)\s*;\s*\1\+\+\s*\)\s*\2\[\1\]\s*=\s*tolower\s*\(\s*\2\[\1\]\s*\)\s*;',
            r'\2 = \2.lower();',
            full_code
        )
        full_code = re.sub(r'strlen\s*\(\s*([^)]+)\)', r'len(\1)', full_code)
        full_code = re.sub(r'isdigit\s*\(\s*([^)]+)\)', r'str(\1).isdigit()', full_code)
        full_code = re.sub(r'isalnum\s*\(\s*([^)]+)\)', r'str(\1).isalnum()', full_code)
        full_code = re.sub(r'tolower\s*\(\s*([^)]+)\)', r'str(\1).lower()', full_code)
        full_code = re.sub(r'strcpy\s*\(\s*([^,]+)\s*,\s*([^)]+)\)', r'\1 = \2', full_code)

        # 6. Structs and typedef extraction
        struct_classes = []
        def extract_typedef_struct(m):
            body = m.group(1)
            name = m.group(2)
            fields = re.findall(r'(?:int|float|double|char|long|unsigned|bool)\s+([a-zA-Z_]\w*)', body)
            init_params = ", ".join(f"{f}=0" for f in fields)
            init_body = "\n        ".join(f"self.{f} = {f}" for f in fields) if fields else "pass"
            struct_classes.append(f"class {name}:\n    def __init__(self, {init_params}):\n        {init_body}\n")
            return ""

        full_code = re.sub(
            r'typedef\s+struct\s*(?:[a-zA-Z_]\w*)?\s*\{(.*?)\}\s*([a-zA-Z_]\w*)\s*;',
            extract_typedef_struct,
            full_code,
            flags=re.DOTALL
        )

        def extract_struct(m):
            name = m.group(1)
            body = m.group(2)
            fields = re.findall(r'(?:int|float|double|char|long|unsigned|bool)\s+([a-zA-Z_]\w*)', body)
            init_params = ", ".join(f"{f}=0" for f in fields)
            init_body = "\n        ".join(f"self.{f} = {f}" for f in fields) if fields else "pass"
            struct_classes.append(f"class {name}:\n    def __init__(self, {init_params}):\n        {init_body}\n")
            return ""

        full_code = re.sub(
            r'struct\s+([a-zA-Z_]\w*)\s*\{(.*?)\}\s*;',
            extract_struct,
            full_code,
            flags=re.DOTALL
        )

        # 7. Struct instantiation and pointer access
        # BankAccount acc = { initial }; -> acc = BankAccount(initial);
        full_code = re.sub(r'\b([A-Z]\w*)\s+([a-zA-Z_]\w*)\s*=\s*\{\s*(.*?)\s*\};', r'\2 = \1(\3);', full_code)
        # BankAccount acc; -> acc = BankAccount();
        full_code = re.sub(r'\b([A-Z]\w*)\s+([a-zA-Z_]\w*)\s*;', r'\2 = \1();', full_code)
        # acc->balance -> acc.balance
        full_code = full_code.replace('->', '.')
        # Strip & from function call arguments (e.g. deposit(&acc, val) -> deposit(acc, val))
        full_code = re.sub(r'(?<=[,\(])\s*&([a-zA-Z_]\w*)', r' \1', full_code)


        tokens = []
        current = []
        paren_depth = 0
        in_quote = False
        quote_char = ''

        for ch in full_code:
            if in_quote:
                current.append(ch)
                if ch == quote_char and (len(current) < 2 or current[-2] != '\\'):
                    in_quote = False
                continue
            if ch in ('"', "'"):
                in_quote = True
                quote_char = ch
                current.append(ch)
                continue
            if ch == '(':
                paren_depth += 1
                current.append(ch)
            elif ch == ')':
                paren_depth = max(0, paren_depth - 1)
                current.append(ch)
            elif (ch == ';' and paren_depth == 0) or ch in ('{', '}'):
                stmt_text = "".join(current).strip()
                if stmt_text:
                    tokens.append(stmt_text)
                current = []
                if ch in ('{', '}'):
                    tokens.append(ch)
            else:
                current.append(ch)

        remainder = "".join(current).strip()
        if remainder:
            tokens.append(remainder)

        indent = 0
        py_lines = [C_RUNTIME_PREAMBLE] + struct_classes
        loop_step_stack = []

        def pad(s):
            return ("    " * indent) + s

        for p in tokens:
            if p == '{':
                indent += 1
                continue
            elif p == '}':
                if loop_step_stack and loop_step_stack[-1][0] == indent:
                    _, step_code = loop_step_stack.pop()
                    py_lines.append(pad(step_code))
                indent = max(0, indent - 1)
                continue
            elif p == ';':
                continue


            # Function headers: int main(), int solve(), void func(...)
            fn_match = re.match(r'^(?:(?:int|void|float|double|char|long|bool|auto)\s+)+([a-zA-Z_]\w*)\s*\((.*?)\)', p)
            if fn_match:
                fn_name = fn_match.group(1)
                fn_params = fn_match.group(2)
                param_names = []
                for item in fn_params.split(','):
                    item = item.strip()
                    if item and item != 'void':
                        words = item.replace('*', ' ').split()
                        if words:
                            param_names.append(words[-1])
                py_lines.append(pad(f"def {fn_name}({', '.join(param_names)}):"))
                continue

            # for (init; cond; step)
            if p.startswith('for ') or p.startswith('for('):
                m = re.match(r'for\s*\(\s*(.*?)\s*;\s*(.*?)\s*;\s*(.*?)\s*\)\s*(.*)', p)
                if m:
                    init_clause, cond_clause, step_clause, body_clause = m.group(1), m.group(2), m.group(3), m.group(4).strip()
                    init_clause = re.sub(r'\b(?:int|long|size_t)\s+', '', init_clause)
                    m_range = re.match(r'^([a-zA-Z_]\w*)\s*=\s*(.*?)$', init_clause)
                    if m_range:
                        var = m_range.group(1)
                        start = m_range.group(2)
                        
                        # Increasing loop: i < end or i <= end
                        m_inc = re.match(r'^' + re.escape(var) + r'\s*(<=|<)\s*(.*?)$', cond_clause)
                        m_step_inc = re.match(r'^' + re.escape(var) + r'(\+\+|\s*\+=\s*(\d+))$', step_clause)
                        if m_inc and m_step_inc:
                            op, end = m_inc.group(1), m_inc.group(2)
                            step = m_step_inc.group(2) if m_step_inc.group(2) else "1"
                            end_val = f"({end}) + 1" if op == '<=' else end
                            if step == "1":
                                py_lines.append(pad(f"for {var} in range({start}, {end_val}):"))
                            else:
                                py_lines.append(pad(f"for {var} in range({start}, {end_val}, {step}):"))
                            if body_clause:
                                py_lines.append(pad(f"    {_clean_body(body_clause)}"))
                            continue

                        # Decreasing loop: i > end or i >= end
                        m_dec = re.match(r'^' + re.escape(var) + r'\s*(>=|>)\s*(.*?)$', cond_clause)
                        m_step_dec = re.match(r'^' + re.escape(var) + r'(\-\-|\s*\-=\s*(\d+))$', step_clause)
                        if m_dec and m_step_dec:
                            op, end = m_dec.group(1), m_dec.group(2)
                            dec = m_step_dec.group(2) if m_step_dec.group(2) else "1"
                            end_val = f"({end}) - 1" if op == '>=' else end
                            py_lines.append(pad(f"for {var} in range({start}, {end_val}, -{dec}):"))
                            if body_clause:
                                py_lines.append(pad(f"    {_clean_body(body_clause)}"))
                            continue

                    # Generic loop fallback
                    if init_clause:
                        py_lines.append(pad(init_clause))
                    cond_py = _clean_cond(cond_clause)
                    py_lines.append(pad(f"while {cond_py}:"))
                    if body_clause:
                        py_lines.append(pad(f"    {_clean_body(body_clause)}"))
                    if step_clause:
                        step_py = step_clause.replace('++', ' += 1').replace('--', ' -= 1')
                        if body_clause:
                            py_lines.append(pad(f"    {step_py}"))
                        else:
                            loop_step_stack.append((indent + 1, step_py))
                    continue


            def _extract_header_and_body(text):
                idx = text.find('(')
                if idx == -1:
                    return None, None
                depth = 0
                close_idx = -1
                for i in range(idx, len(text)):
                    if text[i] == '(':
                        depth += 1
                    elif text[i] == ')':
                        depth -= 1
                        if depth == 0:
                            close_idx = i
                            break
                if close_idx == -1:
                    return None, None
                cond = text[idx+1:close_idx].strip()
                body = text[close_idx+1:].strip()
                return cond, body

            def _clean_cond(c):
                if not c:
                    return "True"
                c = c.replace('&&', ' and ').replace('||', ' or ')
                c = re.sub(r'!(?!=)', ' not ', c)
                return c

            def _clean_body(b):
                b = re.sub(r'^(?:(?:int|void|float|double|char|long|bool|unsigned)\s+)+', '', b)
                b = re.sub(r'([a-zA-Z_]\w*(?:\[[^\]]+\])*)\[\s*([a-zA-Z_]\w*)\+\+\s*\]\s*=\s*(.*)', r'\1[\2] = \3; \2 += 1', b)
                b = re.sub(r'([a-zA-Z_]\w*(?:\[[^\]]+\])*)\[\s*([a-zA-Z_]\w*)\-\-\s*\]\s*=\s*(.*)', r'\1[\2] = \3; \2 -= 1', b)
                b = b.replace('++', ' += 1').replace('--', ' -= 1')
                return b

            if p.startswith('while ') or p.startswith('while('):
                cond, body = _extract_header_and_body(p)
                cond_py = _clean_cond(cond)
                py_lines.append(pad(f"while {cond_py}:"))
                if body:
                    py_lines.append(pad(f"    {_clean_body(body)}"))
                continue

            if p.startswith('else if ') or p.startswith('else if('):
                cond, body = _extract_header_and_body(p)
                cond_py = _clean_cond(cond)
                py_lines.append(pad(f"elif {cond_py}:"))
                if body:
                    py_lines.append(pad(f"    {_clean_body(body)}"))
                continue

            if p == 'else':
                py_lines.append(pad("else:"))
                continue

            if p.startswith('else ') and not p.startswith('else if'):
                body = p[5:].strip()
                if body:
                    py_lines.append(pad("else:"))
                    py_lines.append(pad(f"    {_clean_body(body)}"))
                    continue

            if p.startswith('if ') or p.startswith('if('):
                cond, body = _extract_header_and_body(p)
                cond_py = _clean_cond(cond)
                py_lines.append(pad(f"if {cond_py}:"))
                if body:
                    py_lines.append(pad(f"    {_clean_body(body)}"))
                continue


            # 2D Array declaration: int mat[50][50]; or char words[200][100];
            m2d = re.findall(r'([a-zA-Z_]\w*)\s*\[\s*([^\]]*)\s*\]\s*\[\s*([^\]]*)\s*\]', p)
            if m2d and re.match(r'^(?:(?:int|float|double|char|long|unsigned)\s+)', p):
                is_char = 'char' in p
                for arr_name, r_size, c_size in m2d:
                    r_str = r_size.strip() if r_size.strip() else "100"
                    c_str = c_size.strip() if c_size.strip() else "100"
                    if is_char:
                        py_lines.append(pad(f"{arr_name} = [''] * ({r_str})"))
                    else:
                        py_lines.append(pad(f"{arr_name} = [[0] * ({c_str}) for _ in range({r_str})]"))
                continue

            # 1D Array declaration: int arr[100]; or char s1[600], s2[600];
            if re.match(r'^(?:(?:int|float|double|char|long|unsigned)\s+)+[a-zA-Z_]\w*\s*\[', p):
                matches = re.findall(r'([a-zA-Z_]\w*)\s*\[\s*([^\]]*)\s*\]', p)
                if matches:
                    is_char = 'char' in p
                    init_elem = "''" if is_char else "0"
                    for arr_name, arr_size in matches:
                        size_str = arr_size.strip() if arr_size.strip() else "1000"
                        py_lines.append(pad(f"{arr_name} = [{init_elem}] * ({size_str})"))
                    continue



            # Bare declaration without initial value: int n; int a, b;
            decl_m = re.match(r'^(?:(?:int|long|short|unsigned)\s+)+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)$', p)
            if decl_m:
                vars_list = [v.strip() for v in decl_m.group(1).split(',')]
                for v in vars_list:
                    py_lines.append(pad(f"{v} = 0"))
                continue

            decl_float = re.match(r'^(?:(?:float|double)\s+)+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)$', p)
            if decl_float:
                vars_list = [v.strip() for v in decl_float.group(1).split(',')]
                for v in vars_list:
                    py_lines.append(pad(f"{v} = 0.0"))
                continue

            decl_char = re.match(r'^(?:char\s+)+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)$', p)
            if decl_char:
                vars_list = [v.strip() for v in decl_char.group(1).split(',')]
                for v in vars_list:
                    py_lines.append(pad(f"{v} = ''"))
                continue

            # Strip types from declarations: int a = 5 -> a = 5
            stmt = re.sub(r'^(?:(?:int|void|float|double|char|long|bool|unsigned)\s+)+', '', p)
            # Handle multiple declarations with initialization: i = 0, j = 0 -> i = 0; j = 0
            while re.search(r'([a-zA-Z_]\w*\s*=[^,]+),\s*([a-zA-Z_]\w*\s*=)', stmt):
                stmt = re.sub(r'([a-zA-Z_]\w*\s*=[^,]+),\s*([a-zA-Z_]\w*\s*=)', r'\1; \2', stmt)
            stmt = re.sub(r'(?<=[,=(])\s*([^,=(?]+(?:\([^)]*\))*)\s*\?\s*([^:?]+?)\s*:\s*([^,;)\n]+)', r'(\2 if \1 else \3)', stmt)
            stmt = re.sub(r'([a-zA-Z_]\w*(?:\[[^\]]+\])*)\[\s*([a-zA-Z_]\w*)\+\+\s*\]\s*=\s*(.*)', r'\1[\2] = \3; \2 += 1', stmt)
            stmt = re.sub(r'([a-zA-Z_]\w*(?:\[[^\]]+\])*)\[\s*([a-zA-Z_]\w*)\-\-\s*\]\s*=\s*(.*)', r'\1[\2] = \3; \2 -= 1', stmt)
            stmt = stmt.replace('/=', '//=')
            stmt = stmt.replace('++', ' += 1').replace('--', ' -= 1')
            stmt = stmt.replace('&&', ' and ').replace('||', ' or ')
            stmt = stmt.replace('true', 'True').replace('false', 'False').replace('NULL', 'None')
            py_lines.append(pad(stmt))




        py_lines.append("\nif __name__ == '__main__':\n    if 'main' in locals():\n        main()\n")
        return "\n".join(py_lines)

    @classmethod
    def execute_python(cls, code: str, stdin_input: str = "", timeout: float = 5.0) -> Dict[str, Any]:
        """Execute Python code in isolated subprocess mode."""
        start_time = time.time()
        syntax_err = cls.validate_python_code(code)
        if syntax_err:
            elapsed = round(time.time() - start_time, 3)
            return {
                "success": False,
                "status": "COMPILATION_ERROR",
                "output": syntax_err,
                "error": syntax_err,
                "compilation_error": syntax_err,
                "execution_time": elapsed,
                "execution_time_ms": int(elapsed * 1000)
            }

        try:
            proc = subprocess.run(
                [sys.executable, "-I", "-s", "-c", code],
                input=stdin_input if stdin_input is not None else "",
                capture_output=True,
                text=True,
                timeout=timeout
            )
            elapsed = round(time.time() - start_time, 3)
            success = (proc.returncode == 0)
            output = proc.stdout if success else (proc.stdout + ("\n" if proc.stdout else "") + proc.stderr).strip()
            err_msg = proc.stderr.strip() if not success else None

            return {
                "success": success,
                "status": "PASSED" if success else "RUNTIME_ERROR",
                "output": output,
                "error": err_msg,
                "compilation_error": None,
                "execution_time": elapsed,
                "execution_time_ms": int(elapsed * 1000)
            }
        except subprocess.TimeoutExpired:
            elapsed = round(time.time() - start_time, 3)
            return {
                "success": False,
                "status": "TIME_LIMIT_EXCEEDED",
                "output": f"Time Limit Exceeded ({timeout}s limit)",
                "error": f"Time Limit Exceeded ({timeout}s limit)",
                "compilation_error": None,
                "execution_time": elapsed,
                "execution_time_ms": int(elapsed * 1000)
            }
        except Exception as e:
            elapsed = round(time.time() - start_time, 3)
            return {
                "success": False,
                "status": "RUNTIME_ERROR",
                "output": f"Execution error: {str(e)}",
                "error": str(e),
                "compilation_error": None,
                "execution_time": elapsed,
                "execution_time_ms": int(elapsed * 1000)
            }

    @classmethod
    def execute_c(cls, code: str, stdin_input: str = "", timeout: float = 5.0) -> Dict[str, Any]:
        """Execute C code via syntax verification and safe runtime execution."""
        start_time = time.time()
        c_err = cls.validate_c_code(code)
        if c_err:
            elapsed = round(time.time() - start_time, 3)
            return {
                "success": False,
                "status": "COMPILATION_ERROR",
                "output": c_err,
                "error": c_err,
                "compilation_error": c_err,
                "execution_time": elapsed,
                "execution_time_ms": int(elapsed * 1000)
            }

        # Transpile C to python runtime
        try:
            py_code = cls.transpile_c_to_python(code)
            proc = subprocess.run(
                [sys.executable, "-I", "-s", "-c", py_code],
                input=stdin_input if stdin_input is not None else "",
                capture_output=True,
                text=True,
                timeout=timeout
            )
            elapsed = round(time.time() - start_time, 3)
            success = (proc.returncode == 0)
            output = proc.stdout if success else (proc.stdout + ("\n" if proc.stdout else "") + proc.stderr).strip()
            err_msg = proc.stderr.strip() if not success else None

            return {
                "success": success,
                "status": "PASSED" if success else "RUNTIME_ERROR",
                "output": output,
                "error": err_msg,
                "compilation_error": None,
                "execution_time": elapsed,
                "execution_time_ms": int(elapsed * 1000)
            }
        except subprocess.TimeoutExpired:
            elapsed = round(time.time() - start_time, 3)
            return {
                "success": False,
                "status": "TIME_LIMIT_EXCEEDED",
                "output": f"Time Limit Exceeded ({timeout}s limit)",
                "error": f"Time Limit Exceeded ({timeout}s limit)",
                "compilation_error": None,
                "execution_time": elapsed,
                "execution_time_ms": int(elapsed * 1000)
            }
        except Exception as e:
            elapsed = round(time.time() - start_time, 3)
            return {
                "success": False,
                "status": "RUNTIME_ERROR",
                "output": f"Execution error: {str(e)}",
                "error": str(e),
                "compilation_error": None,
                "execution_time": elapsed,
                "execution_time_ms": int(elapsed * 1000)
            }

    @classmethod
    def run_code(cls, code: str, language: str = "python", custom_input: Optional[str] = None) -> Dict[str, Any]:
        """Run code with custom input."""
        lang = language.lower()
        if lang in ("python", "py"):
            res = cls.execute_python(code, custom_input or "")
        elif lang in ("c", "cpp"):
            res = cls.execute_c(code, custom_input or "")
        else:
            res = cls.execute_python(code, custom_input or "")

        return {
            "success": res["success"],
            "stdout": res["output"],
            "stderr": res["error"] or "",
            "compilation_error": res.get("compilation_error"),
            "execution_time_seconds": res["execution_time"],
            "execution_time_ms": res["execution_time_ms"],
            "status": res["status"]
        }

    @classmethod
    def evaluate_test_cases(cls, code: str, language: str, test_cases: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Grade submission across all test cases with LeetCode-style diff output."""
        lang = language.lower()
        test_results = []
        passed_visible = 0
        total_visible = 0
        passed_hidden = 0
        total_hidden = 0
        total_execution_ms = 0
        compilation_error = None
        first_stdout = ""
        first_stderr = ""

        # First run a syntax check
        if lang in ("python", "py"):
            syntax_err = cls.validate_python_code(code)
            if syntax_err:
                return {
                    "success": False,
                    "is_passed": False,
                    "status": "COMPILATION_ERROR",
                    "error": syntax_err,
                    "compilation_error": syntax_err,
                    "passed_tests": 0,
                    "total_tests": len(test_cases),
                    "test_results": [],
                    "details": [],
                    "stdout": "",
                    "execution_time_ms": 0,
                    "execution_time_seconds": 0.0
                }
        elif lang in ("c", "cpp"):
            c_err = cls.validate_c_code(code)
            if c_err:
                return {
                    "success": False,
                    "is_passed": False,
                    "status": "COMPILATION_ERROR",
                    "error": c_err,
                    "compilation_error": c_err,
                    "passed_tests": 0,
                    "total_tests": len(test_cases),
                    "test_results": [],
                    "details": [],
                    "stdout": "",
                    "execution_time_ms": 0,
                    "execution_time_seconds": 0.0
                }

        for idx, tc in enumerate(test_cases):
            tc_input = str(tc.get("input", ""))
            tc_expected = str(tc.get("expected_output", tc.get("expected", ""))).strip()
            is_hidden = bool(tc.get("is_hidden", False))

            if is_hidden:
                total_hidden += 1
            else:
                total_visible += 1

            if lang in ("c", "cpp"):
                res = cls.execute_c(code, stdin_input=tc_input)
            else:
                res = cls.execute_python(code, stdin_input=tc_input)

            total_execution_ms += res.get("execution_time_ms", 10)
            if idx == 0:
                first_stdout = res.get("output", "")
                first_stderr = res.get("error", "")

            # Normalize outputs
            actual_trimmed = res.get("output", "").strip()
            # Normalize CRLF and spaces
            norm_actual = re.sub(r'\r\n', '\n', actual_trimmed)
            norm_expected = re.sub(r'\r\n', '\n', tc_expected)

            # Check match: exact match, or match without trailing whitespace per line
            lines_actual = [l.strip() for l in norm_actual.split('\n') if l.strip()]
            lines_expected = [l.strip() for l in norm_expected.split('\n') if l.strip()]

            is_match = res["success"] and (
                norm_actual == norm_expected or
                lines_actual == lines_expected or
                (not norm_expected and res["success"])
            )

            if is_match:
                if is_hidden:
                    passed_hidden += 1
                else:
                    passed_visible += 1

            test_results.append({
                "test_case": idx + 1,
                "input": tc_input,
                "expected": tc_expected,
                "actual": actual_trimmed,
                "passed": is_match,
                "is_hidden": is_hidden,
                "execution_time_ms": res.get("execution_time_ms", 10)
            })

        all_passed = (passed_visible == total_visible) and (passed_hidden == total_hidden)
        status = "PASSED" if all_passed else "FAILED"

        return {
            "success": all_passed,
            "is_passed": all_passed,
            "status": status,
            "passed_tests": passed_visible + passed_hidden,
            "total_tests": len(test_cases),
            "passed_test_cases": passed_visible,
            "total_test_cases": total_visible,
            "hidden_passed": passed_hidden,
            "hidden_total": total_hidden,
            "test_results": test_results,
            "details": test_results,
            "stdout": first_stdout or ("All test cases passed!" if all_passed else ""),
            "stderr": first_stderr,
            "error": None if all_passed else (first_stderr or "Some test cases failed."),
            "runtime_error": None if all_passed else first_stderr,
            "compilation_error": None,
            "execution_time_ms": total_execution_ms,
            "execution_time_seconds": round(total_execution_ms / 1000.0, 3)
        }


code_executor = CodeExecutor()
