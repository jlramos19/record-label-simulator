# Modular Code Workflow for the Web App

This document summarizes a modular workflow tailored to the web/TypeScript codebase.

## Principles

1. DRY: keep shared logic in one place to avoid drift.
2. Modular boundaries: split features into small, focused modules.
3. Loose coupling: minimize cross-module dependencies and avoid cyclic imports.
4. Composition over inheritance: build features by combining small units.
5. Interfaces for abstraction: define clear contracts for systems and adapters.
6. Readability first: code is read more than it is written.

## Web-Specific Practices

7. ES module boundaries: use clear folder boundaries and explicit imports.
8. TypeScript project structure: keep data models separate from UI adapters.
9. Shared code as packages: if reuse grows, extract to internal packages (npm workspace-style).
10. Versioning discipline: keep module versions and changelogs predictable.
11. CI checks: enforce lint/type checks to prevent cross-module regressions.

These practices keep the web app modular, scalable, and maintainable while the simulation grows.
