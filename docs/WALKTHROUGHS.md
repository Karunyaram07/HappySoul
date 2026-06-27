# Happy Soul – Global Architecture & Development Standards

These standards apply to **every future phase** of the Happy Soul project.

This is a permanent architectural guideline for the entire codebase.

All future implementations (Phase 5 onwards) must follow these standards automatically unless explicitly instructed otherwise.

---

# 1. Feature-Based Architecture

Every new feature must be developed as an independent module.

Avoid placing unrelated components inside large shared folders.

Example project structure:

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

Every feature owns its own components.

---

# 2. Internal Feature Structure

Each feature should follow a consistent internal organization.

Example:

```text
components/
└── thoughts/
    ├── cards/
    ├── actions/
    ├── badges/
    ├── layout/
    ├── skeletons/
    └── shared/
```

or

```text
components/
└── dashboard/
    ├── layout/
    ├── widgets/
    ├── actions/
    └── shared/
```

Organize by responsibility.

Never allow dozens of components in one folder.

---

# 3. Data Layer Separation

Business logic must never live inside React components.

Every feature should have its own library.

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

# 4. Standard Library Structure

Every feature library should follow this pattern whenever applicable.

```text
lib/
└── feature/
    ├── provider.js
    ├── selector.js
    ├── dataset.js
    ├── schema.js
    ├── utils.js
    ├── constants.js
    └── index.js
```

Only create files that are useful.

Do not create empty placeholders.

---

# 5. Provider Pattern

UI components must never know where data comes from.

Always expose a provider function.

Example

```javascript
getDailyThought(profile)
```

Today

↓

Local Dataset

Later

↓

Gemini

↓

OpenAI

↓

Database

↓

External APIs

The UI should never change because of a new data source.

---

# 6. Schema Documentation

Even though this project uses JavaScript (JSX), every feature should define a schema describing its data structure.

Example

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

Schemas are for documentation and architectural consistency.

Do not introduce runtime validation unless required.

---

# 7. Reusable Components

Repeated UI patterns should be extracted into shared components.

Examples

```text
components/shared/

Card.jsx

Badge.jsx

Chip.jsx

SectionTitle.jsx

EmptyState.jsx

LoadingSpinner.jsx

Dialog.jsx

Modal.jsx
```

Avoid duplicate UI code.

---

# 8. Feature Independence

Every feature should be replaceable without affecting others.

Example

Dashboard

↓

Thought Widget

↓

Provider

↓

Dataset

Replacing the provider should not require UI changes.

---

# 9. Single Responsibility Principle

Each component should have one responsibility.

Avoid large components.

Target:

50–200 lines per component whenever practical.

Split components when responsibilities grow.

---

# 10. Folder Consistency

Every feature should look familiar.

Example:

```text
components/

feature/

cards/

layout/

actions/

shared/
```

Developers should immediately know where code belongs.

---

# 11. Import Consistency

Always use project aliases.

Avoid deep relative imports whenever possible.

Remove unused imports.

Keep import ordering consistent.

---

# 12. Scalability

Every new feature should be implemented assuming that:

* AI providers may change.
* APIs may change.
* Database schema may expand.
* Additional languages may be added.
* Mobile support will continue to improve.

Avoid tightly coupled implementations.

---

# 13. Documentation

Whenever a significant feature is implemented, provide:

* Updated folder structure
* Files created
* Files modified
* Architecture explanation
* Build verification
* Lint verification
* Future extension points

---

# 14. Verification

Every phase must finish with:

```bash
npm run build

npm run lint
```

Zero build errors.

Zero lint errors.

No regression in previous functionality.

---

# 15. Backward Compatibility

Whenever refactoring:

* Preserve existing functionality.
* Preserve UI behavior.
* Preserve routes.
* Preserve authentication.
* Preserve onboarding.
* Preserve responsive layouts.

Refactoring should improve architecture without introducing regressions.

---

# Final Rule

For every future phase of Happy Soul, prioritize:

1. Maintainability
2. Scalability
3. Readability
4. Reusability
5. Feature Independence

Never sacrifice architecture for short-term implementation speed.

Build every new feature as if this project will eventually become a production-grade wellness platform with dozens of modules.



components/
└── dashboard/
    ├── layout/
    │   ├── DashboardHeader.jsx    # Page header & profile status banner
    │   └── DashboardGrid.jsx      # Widget column composer
    │
    ├── widgets/
    │   ├── WelcomeCard.jsx        # Client time greeting card
    │   ├── ThoughtCard.jsx        # Cycles quotes via provider
    │   ├── ProgressCard.jsx       # Daily statistics SVG indicator
    │   ├── WellnessJourney.jsx    # Goals & interests chips
    │   ├── RecommendationCard.jsx # Curated placeholder cards
    │   └── ComingSoon.jsx         # Features timeline roadmap
    │
    └── actions/
        └── QuickActions.jsx       # Interactive actions grid

lib/
└── thoughts/
    ├── schema.js                  # Thought object structure reference
    ├── dataset.js                 # Curated local quotes collection
    ├── categories.js              # List of thought categories
    ├── hash.js                    # Hashing function for date selection
    ├── selector.js                # Onboarding personalization logic
    └── provider.js                # Unified daily quotes provider interface

docs/
└── architecture.md                # Architecture document detailing this refactor
