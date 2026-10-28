# ==============================================================================
# Adaptive Learning System - Hardened Multi-Language Code Sandbox
# Supports Python 3, OpenJDK 17, GCC, and G++ in unprivileged, isolated Linux containers.
# ==============================================================================

FROM debian:bookworm-slim

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 \
    PATH="/usr/lib/jvm/java-17-openjdk-amd64/bin:${PATH}"

# Install minimal, verified runtimes for Python 3, OpenJDK 17, GCC, and G++
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-minimal \
    openjdk-17-jdk-headless \
    gcc \
    g++ \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Create dedicated unprivileged sandbox user and group (UID/GID 10001)
RUN groupadd -g 10001 sandbox && \
    useradd -u 10001 -g sandbox -m -s /bin/sh sandbox

# Prepare workspace directory with restricted permissions
RUN mkdir -p /workspace && \
    chown -R sandbox:sandbox /workspace && \
    chmod 700 /workspace

# Set default working directory
WORKDIR /workspace

# Switch to unprivileged sandbox user
USER 10001:10001

# Default fallback command
CMD ["python3", "--version"]
