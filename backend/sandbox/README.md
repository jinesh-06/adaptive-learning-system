# Production Sandbox Execution Engine Architecture & Deployment Guide

## 1. Overview
The Adaptive Learning System Code Execution Sandbox provides an isolated, production-quality execution engine for student-submitted Python and Java programs. It guarantees that untrusted user code never executes directly on the host machine or within the application server process.

---

## 2. Hardened Security Sandbox Isolation Model

Every student code submission is executed within an ephemeral, unprivileged Linux container governed by strict kernel-level constraints:

| Security Control | Implementation / Flag | Security Rationale |
|---|---|---|
| **Unprivileged User** | `--user 10001:10001` (`sandbox:sandbox`) | Student code cannot access root utilities or root-owned system files. |
| **No New Privileges** | `--security-opt no-new-privileges:true` | Prevents `setuid` binaries from escalating privileges. |
| **Dropped Capabilities** | `--cap-drop ALL` | Strips all Linux capabilities (raw sockets, device nodes, ptrace, admin). |
| **Read-Only Root Filesystem** | `--read-only` | Prevents runtime tampering with libraries, binaries, or container OS. |
| **Network Isolation** | `--network none` | Completely severs outbound and inbound internet/network communication. |
| **CPU Quota** | `--cpus 1.0` | Prevents Denial-of-Service CPU starvation on the host machine. |
| **Memory Limit** | `--memory 128m --memory-swap 128m` (256m for Java) | Mitigates memory exhaustion and heap allocation attacks. |
| **Process Count Cap** | `--pids-limit 32` | Prevents fork bombs and unbounded thread creation. |
| **Ephemeral Temp Directory** | `--tmpfs /tmp:rw,noexec,nosuid,size=32m` | Scoped temporary storage without execution privileges. |
| **Bounded Output Streaming** | Truncation at 1 MiB | Protects server memory and network buffers against infinite print loops. |
| **Guaranteed Cleanup** | `finally` block `rm -f` and directory purge | Prevents orphaned processes or stale temporary workspaces. |
| **No Host Command Injection** | Argument arrays only (never `shell=True`) | Direct parameter passing eliminates shell metacharacter vulnerabilities. |

---

## 3. Supported Execution Statuses

The execution engine provides explicit, structured statuses conforming to frontend requirements:

- `SUCCESS` (Legacy alias: `PASSED`): Program exited with returncode 0.
- `COMPILE_ERROR` (Legacy alias: `COMPILATION_ERROR`): Java compilation failed (diagnostics returned).
- `RUNTIME_ERROR`: Program threw an unhandled exception or returned non-zero.
- `TIMEOUT` (Legacy alias: `TIME_LIMIT_EXCEEDED`): Execution exceeded the configured timeout (5.0s default).
- `MEMORY_LIMIT_EXCEEDED`: Program triggered container OOM kill or Java heap exhaustion.
- `OUTPUT_LIMIT_EXCEEDED`: Program exceeded the maximum allowed output size.
- `INVALID_REQUEST`: Malformed payload, missing fields, or input exceeding size limits (64 KiB).
- `UNSUPPORTED_LANGUAGE`: Requested language is not in `['python', 'java', 'c', 'cpp']`.
- `EXECUTOR_UNAVAILABLE`: Container runtime (Docker/Podman) is offline; host execution is blocked.
- `INTERNAL_ERROR`: Unexpected infrastructure exception during execution.

---

## 4. Setup Instructions

### A. Windows Development Environment (Docker Desktop + WSL2)

1. **Install Docker Desktop for Windows**:
   - Enable the **WSL 2 backend** in Docker Desktop settings.
   - Verify installation in PowerShell:
     ```powershell
     docker --version
     docker info
     ```
2. **Build the Sandbox Image**:
   ```powershell
   docker build -t adaptive-learning-sandbox:latest -f backend/sandbox/Dockerfile .
   ```
3. **Verify the Built Image**:
   ```powershell
   docker run --rm adaptive-learning-sandbox:latest python3 --version
   docker run --rm adaptive-learning-sandbox:latest javac -version
   ```

### B. Linux Production Deployment (Ubuntu/Debian)

1. **Install Docker Engine**:
   ```bash
   sudo apt-get update && sudo apt-get install -y docker.io
   sudo systemctl enable --now docker
   sudo usermod -aG docker $USER
   ```
2. **Build and Tag Image**:
   ```bash
   docker build -t adaptive-learning-sandbox:latest -f backend/sandbox/Dockerfile .
   ```

---

## 5. Configuration (Environment Variables)

| Variable | Default Value | Description |
|---|---|---|
| `SANDBOX_CONTAINER_RUNTIME` | `docker` | Container executable (`docker` or `podman`). |
| `SANDBOX_CONTAINER_IMAGE` | `adaptive-learning-sandbox:latest` | Trusted container image tag. |
| `ENVIRONMENT` | `development` | Environment mode (`development`, `production`, `test`). |
| `SANDBOX_TIMEOUT_SECONDS` | `5.0` | Default execution timeout in seconds. |
| `SANDBOX_JAVA_COMPILE_TIMEOUT` | `8.0` | Java compiler timeout in seconds. |
| `SANDBOX_MAX_SOURCE_BYTES` | `65536` (64 KiB) | Maximum allowed source code size. |
| `SANDBOX_MAX_STDIN_BYTES` | `65536` (64 KiB) | Maximum allowed stdin size. |
| `SANDBOX_MAX_OUTPUT_BYTES` | `1048576` (1 MiB) | Maximum captured output stream size. |
| `SANDBOX_RATE_LIMIT_PER_MIN` | `30` | Maximum executions per user per minute. |
| `SANDBOX_MAX_CONCURRENCY` | `8` | Maximum concurrent sandbox executions. |
| `ALLOW_TEST_CONTAINER_MOCK` | `false` | Enables test mock runner for offline test suites. |

---

## 6. Offline Testing / Continuous Integration (CI)

In development or test environments where Docker is not running:
- Setting `ENVIRONMENT=test` or `ALLOW_TEST_CONTAINER_MOCK=true` allows tests to run using `MockSandboxDriver`.
- In `production` (`ENVIRONMENT=production`), the application strictly demands a functional container runtime and will fail safely with `EXECUTOR_UNAVAILABLE` rather than executing student code on the host.
