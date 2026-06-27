# Happy Soul – Permanent Architecture & Development Standards

These standards are permanent and apply to **all future phases** of the Happy Soul platform.

Every implementation from Phase 5 onward must follow these architectural principles automatically unless explicitly instructed otherwise.

These standards take precedence over feature-specific implementation details.

---

# Core Development Principles

Every new feature must prioritize:

1. Maintainability
2. Scalability
3. Readability
4. Reusability
5. Feature Independence

Never sacrifice long-term architecture for short-term implementation speed.

Build every feature as if Happy Soul will become a production-grade wellness platform.

---

# Feature-Based Architecture

Each feature must live inside its own module.

Example:

```text
components/

dashboard/

thoughts/

krishna-ai/

journal/

mood/

yoga/

stories/

music/

movies/

shared/
```

Never mix unrelated features in the same folder.

---

# Component Organization

Within each feature, organize components by responsibility whenever the feature grows.

Example:

```text
components/
└── feature/
    ├── layout/
    ├── widgets/
    ├── cards/
    ├── actions/
    ├── badges/
    ├── dialogs/
    ├── skeletons/
    └── shared/
```

Only create folders when they improve organization.

Avoid unnecessary nesting.

---

# Data Layer Separation

Business logic must never live inside React components.

Feature logic belongs inside:

```text
lib/
```

Example:

```text
lib/

thoughts/

krishna-ai/

journal/

mood/

music/

stories/
```

---

# Standard Feature Library

When applicable, every feature library should follow this structure.

```text
lib/
└── feature/
    ├── provider.js
    ├── selector.js
    ├── dataset.js
    ├── schema.js
    ├── constants.js
    ├── utils.js
    └── index.js
```

Only create files that are actually needed.

Do not generate empty placeholder files.

---

# Provider Pattern

UI components must never know where data originates.

Always expose a provider interface.

Example:

```javascript
getDailyThought(profile)
```

Current implementation:

↓

Local Dataset

Future implementations:

↓

Gemini

↓

OpenAI

↓

Database

↓

External APIs

Changing providers must never require UI changes.

---

# Schema Documentation

Although this project uses JavaScript (JSX), every feature should document its expected data structure.

Example:

```javascript
export const ThoughtSchema = {
    id: "",
    quote: "",
    author: "",
    category: "",
    language: "",
    tags: [],
};
```

Schemas are intended for architectural consistency and developer documentation.

Do not introduce runtime validation libraries unless explicitly requested.

---

# Shared Components

Repeated UI patterns should be extracted into reusable shared components.

Example:

```text
components/shared/

Card.jsx

Button.jsx

Badge.jsx

Chip.jsx

SectionTitle.jsx

EmptyState.jsx

LoadingSpinner.jsx

Dialog.jsx

Modal.jsx
```

Avoid duplicate UI implementations.

---

# Single Responsibility Principle

Each component should have one clear responsibility.

Prefer components between approximately 50–200 lines whenever practical.

Split components when they become difficult to understand.

---

# Import Standards

Use project aliases consistently.

Avoid deep relative imports.

Remove unused imports.

Maintain consistent import ordering.

---

# Future Scalability

Every feature should assume that:

* AI providers may change.
* APIs may change.
* Database schemas may evolve.
* New languages may be supported.
* Mobile experiences will continue improving.

Design loosely coupled systems.

---

# Documentation

Every completed phase must include:

* Updated folder structure
* Files created
* Files modified
* Architecture explanation
* Build verification
* Lint verification
* Future extension points

Maintain architecture documentation under:

```text
docs/
```

---

# Verification Requirements

Every implementation must finish with:

```bash
npm run build
npm run lint
```

Requirements:

* Zero build errors
* Zero lint errors
* No regressions
* Responsive layout maintained
* Dark mode maintained

---

# Backward Compatibility

Whenever refactoring:

* Preserve authentication.
* Preserve onboarding.
* Preserve routing.
* Preserve middleware behavior.
* Preserve responsive layouts.
* Preserve existing UI functionality.

Refactoring should improve architecture without changing user-facing behavior unless explicitly requested.

---

# Feature Completion Rule

At the end of every phase, provide:

1. Updated folder structure
2. Components created
3. Files modified
4. Architecture explanation
5. Verification results
6. Suggested improvements for the next phase

---

# Permanent Rule

All future Happy Soul features must follow these standards automatically.

Do not repeat these architectural rules in future implementation plans.

Assume these standards are part of the project's permanent engineering guidelines.
