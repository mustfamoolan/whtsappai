# SHADCN UI APPLICATION SHELL — DESIGN SYSTEM & LAYOUT FOUNDATION

## ROLE

You are working as a senior frontend engineer responsible for establishing the permanent UI foundation of this project.

The project already uses **Shadcn UI**.

Before continuing with the current development phase, you must inspect the existing project and establish one **consistent, reusable Application Shell** that all future pages and phases will use.

The goal is NOT to redesign the application.

The goal is to understand the existing Shadcn UI implementation and create the permanent structural foundation for the application.

---

# 1. IMPORTANT — READ THE PROJECT FIRST

I will provide you with the current project files/code.

Before writing or modifying UI code:

1. Inspect the existing frontend structure.
2. Inspect `package.json`.
3. Inspect the existing Shadcn configuration.
4. Inspect existing components.
5. Inspect existing CSS/global styles.
6. Inspect Tailwind configuration if present.
7. Inspect existing layout components.
8. Inspect existing Sidebar implementation if any.
9. Inspect existing Header/Navbar implementation if any.
10. Inspect existing routing.
11. Inspect existing theme/dark-mode implementation if any.
12. Inspect existing fonts and typography.
13. Inspect existing reusable UI primitives.

You MUST understand how Shadcn UI is already implemented in this project before creating anything new.

Do NOT assume the project follows a default Shadcn template.

---

# 2. DESIGN REFERENCE RULE

The existing project files are the primary design reference.

I want the new application shell to follow the same visual language already established in this project.

If the existing project already contains:

- Sidebar
- Header
- Footer
- Buttons
- Inputs
- Tables
- Dialogs
- Dropdowns
- Cards
- Tabs
- Badges
- Typography
- Colors
- Spacing
- Radius
- Shadows
- Dark mode
- RTL behavior

then REUSE and EXTEND those patterns.

Do not create a second design language.

Do not introduce another UI framework.

Do not replace Shadcn UI.

Do not redesign existing components just because you personally prefer another style.

---

# 3. PRIMARY OBJECTIVE

Create a reusable permanent:

## Application Shell

The shell should establish the structure used by all future application pages.

The basic structure should be:

```text
Application
│
├── Sidebar
│
└── Main Area
    │
    ├── Header
    │
    ├── Main Content
    │
    └── Footer
```

The exact implementation must follow the existing project's conventions.

The shell must be reusable so future pages do NOT recreate this structure manually.

---

# 4. SIDEBAR

Create or standardize a reusable Sidebar based on the existing Shadcn implementation.

The Sidebar should support:

- Application branding
- Navigation items
- Active route state
- Icons
- Sections/groups when needed
- Collapsed state if appropriate
- Mobile behavior
- Tooltips when collapsed
- User/account area if appropriate
- Connection/system status if appropriate

However:

DO NOT add unnecessary navigation items just to make the Sidebar look complete.

Only create the structural capability.

Future phases will add real navigation items.

The Sidebar must be a reusable component.

Example conceptual structure:

```text
┌──────────────────────┐
│ LOGO / CLINIC NAME   │
├──────────────────────┤
│ الرئيسية             │
│ المحادثات             │
│ المواعيد              │
├──────────────────────┤
│ إدارة العيادة         │
│ الأطباء               │
│ الخدمات               │
│ الأسئلة الشائعة       │
├──────────────────────┤
│ الإعدادات              │
├──────────────────────┤
│ User / Account        │
└──────────────────────┘
```

Do NOT assume these exact items must exist now.

Build the reusable structure.

---

# 5. HEADER

Create or standardize a reusable Header.

The Header should be capable of containing:

- Sidebar trigger
- Page title
- Breadcrumbs if appropriate
- Search if appropriate
- Notifications
- WhatsApp connection status
- User/account controls
- Other global actions

Again:

Do not fill it with unnecessary features.

Build the structure so future phases can use it.

The Header must not be recreated separately for every page.

---

# 6. MAIN CONTENT AREA

Create a reusable content container/layout.

Future pages must be able to do:

```tsx
<AppLayout>
    <PageContent />
</AppLayout>
```

or an equivalent project-consistent pattern.

The page content area must support:

- Full-width DataTables
- Forms
- Dialogs
- Detail pages
- Conversation interfaces
- Dashboards
- Settings
- Responsive layouts

Do NOT force every page into cards.

This is especially important.

The project should prefer:

- DataTable for lists
- Forms for data entry
- Split layouts where appropriate
- Conversation layouts for chat
- Cards only where cards actually make sense

Do NOT turn every section into a Card.

---

# 7. FOOTER

Create a lightweight reusable Footer if the application design requires one.

It should not consume excessive vertical space.

Possible contents:

- Application name
- Version
- Copyright
- Connection/system information if appropriate

Keep it subtle.

Do not make the Footer visually dominant.

---

# 8. RTL REQUIREMENT

This project is Arabic-first.

The UI must properly support:

## RTL

The application shell must be designed with RTL as a first-class requirement.

Do NOT simply mirror an LTR layout without checking:

- Sidebar positioning
- Icons
- Chevron direction
- Breadcrumbs
- Dropdown positioning
- Tooltips
- Tables
- Form alignment
- Search fields
- Navigation
- Text alignment
- Spacing
- Scrollbars where relevant

Arabic must look intentional and native.

---

# 9. RESPONSIVE BEHAVIOR

The shell must work across:

- Desktop
- Laptop
- Tablet
- Smaller screens

The desktop application is the primary target, but the layout must not break on smaller widths.

Use Shadcn's existing responsive patterns where possible.

Do not introduce complicated responsive logic unless necessary.

---

# 10. THEME

Inspect the existing theme implementation.

If dark mode already exists:

- Preserve it.
- Make the Application Shell compatible with it.

If it does not exist:

Do NOT introduce a complete theme system unless the existing architecture clearly supports it.

Do not randomly introduce new colors.

Use the project's existing CSS variables/design tokens.

Prefer:

```css
bg-background
text-foreground
border-border
bg-muted
text-muted-foreground
```

and the existing project tokens rather than hard-coded colors.

---

# 11. DESIGN TOKENS

Before creating new styles, identify the project's existing:

- Colors
- CSS variables
- Radius
- Typography
- Spacing
- Shadows
- Border styles
- Component variants

The Application Shell must consume these existing tokens.

If a required token does not exist, add the smallest appropriate token instead of introducing arbitrary styling.

---

# 12. COMPONENT ARCHITECTURE

Do NOT put the entire application shell into one huge component.

Prefer a clean reusable structure such as:

```text
components/
├── layout/
│   ├── app-shell
│   ├── app-sidebar
│   ├── app-header
│   ├── app-footer
│   └── page-container
│
├── ui/
│   └── existing shadcn components
```

But this is only an example.

Follow the project's existing folder conventions if they differ.

Do not reorganize the entire project just for this task.

---

# 13. ROUTING

Inspect the existing router.

The Application Shell should integrate with the existing routing system.

The shell should wrap authenticated/application routes appropriately.

Do NOT break existing routes.

Do NOT rewrite the router unless necessary.

---

# 14. AUTHENTICATION BOUNDARY

The application shell should be compatible with the future authentication structure.

Conceptually:

```text
Public Routes
│
├── Login
└── ...

Application Routes
│
└── AppShell
    ├── Sidebar
    ├── Header
    ├── Main
    └── Footer
```

Do not implement a complete authentication system in this task unless one already exists.

Only establish the correct structural boundary.

---

# 15. WHATSAPP STATUS

Because this application is a WhatsApp AI agent, the global shell should have a place for WhatsApp connection status.

However, do NOT implement the complete WhatsApp connection system in this task.

The UI should simply provide a reusable location/component for future status information.

For example:

```text
WhatsApp
● متصل
```

or

```text
WhatsApp
● غير متصل
```

The actual connection state must eventually come from the backend.

Do NOT create fake permanent connection status.

If no backend state exists yet, use an appropriate placeholder/state.

---

# 16. AI STATUS

Similarly, the shell may eventually need to show AI availability/status.

Do not create fake functionality.

Prepare the structure only if it fits naturally with the existing architecture.

---

# 17. CONVERSATION UI — IMPORTANT

The primary product is a WhatsApp conversation management system.

Therefore the shell must NOT consume too much horizontal space.

The application should leave enough room for future conversation interfaces.

The future conversation page will likely require:

```text
Sidebar
│
├── Conversation List
│
└── Conversation Detail
```

Therefore avoid oversized:

- Sidebar
- Header
- Footer
- Margins
- Page padding

The UI should be practical.

---

# 18. DO NOT OVER-DESIGN

This is a business application.

Do NOT create:

- Huge hero sections
- Excessive gradients
- Decorative animations
- Excessive glassmorphism
- Giant cards
- Marketing-style layouts
- Dribbble-style UI
- Random AI-generated design patterns

The interface should feel like a serious production management system.

Prioritize:

- Clarity
- Speed
- Consistency
- Readability
- Information density
- Accessibility
- Maintainability

---

# 19. SHADCN UI RULE

Use Shadcn UI components wherever an appropriate component already exists.

Do NOT install another component library.

Do NOT replace Shadcn with:

- Material UI
- Ant Design
- Chakra
- Bootstrap
- custom component framework
- another UI kit

If Shadcn provides the component, use it.

If customization is required, extend the existing component rather than replacing the system.

---

# 20. ICONS

Inspect the existing icon system.

Reuse it.

Do not introduce multiple icon libraries unnecessarily.

If the project already uses Lucide/Shadcn icons, continue using them.

Keep icon usage consistent.

---

# 21. ACCESSIBILITY

The shell must maintain proper:

- Keyboard navigation
- Focus states
- Button labels
- Tooltip behavior
- ARIA where appropriate
- Contrast
- Screen-reader semantics

Do not sacrifice accessibility for visual appearance.

---

# 22. PERFORMANCE

The shell will exist on almost every application page.

Therefore:

- Avoid unnecessary re-renders.
- Avoid unnecessary API calls.
- Avoid duplicated global state.
- Avoid expensive effects.
- Keep global components lightweight.

Do not introduce state management libraries unless already required by the project.

---

# 23. WHAT YOU ARE ALLOWED TO CHANGE

You may:

- Create the Application Shell.
- Create reusable layout components.
- Refactor existing layout code when necessary.
- Reuse existing Shadcn components.
- Add missing Shadcn components if genuinely required.
- Add minimal CSS/tokens required by the shell.
- Connect the shell to the existing router.
- Fix layout issues discovered during implementation.

You may NOT:

- Change the backend architecture.
- Change the database.
- Change WhatsApp architecture.
- Change AI architecture.
- Add new business features.
- Implement appointments.
- Implement AI.
- Implement WhatsApp messaging logic.
- Replace Shadcn UI.
- Change the project's technology stack.
- Redesign unrelated pages.

---

# 24. IMPORTANT — DO NOT DUPLICATE EXISTING COMPONENTS

Before creating:

```text
Sidebar
Header
Footer
Button
Dialog
Dropdown
Tooltip
Table
Input
Select
Tabs
```

search the project first.

If one already exists:

USE IT.

Do not create:

```text
Sidebar2
NewSidebar
CustomSidebar
ModernSidebar
DashboardSidebar
```

just because you did not find it immediately.

---

# 25. IMPLEMENTATION PROCESS

Follow this exact process.

## STEP 1 — AUDIT

Read the existing frontend.

Identify:

- Framework
- Router
- Shadcn setup
- Existing layout
- Existing components
- CSS architecture
- Theme
- RTL
- Fonts
- Icons

## STEP 2 — DESIGN MAP

Before coding, determine:

```text
Existing Design System
        ↓
Application Shell
        ↓
Reusable Layout Components
        ↓
Future Pages
```

## STEP 3 — IMPLEMENT

Implement only the shell.

## STEP 4 — VERIFY

Check:

- Build
- TypeScript
- Lint
- Existing routes
- RTL
- Responsive behavior
- Dark mode if present
- Sidebar behavior
- Header behavior
- No console errors

## STEP 5 — REVIEW

Compare the implementation against the existing project style.

Ask:

> Does this look like the same application?

If not, fix it.

Do NOT introduce a new visual identity.

---

# 26. ACCEPTANCE CRITERIA

This task is COMPLETE only when:

### Architecture

- [ ] Reusable AppShell exists.
- [ ] Sidebar is reusable.
- [ ] Header is reusable.
- [ ] Footer is reusable if appropriate.
- [ ] Main content container is reusable.
- [ ] Routing integrates correctly.

### Shadcn

- [ ] Existing Shadcn implementation is respected.
- [ ] No competing UI library introduced.
- [ ] Existing components reused.
- [ ] Design tokens reused.

### RTL

- [ ] RTL works correctly.
- [ ] Sidebar positioning is correct.
- [ ] Icons/directions are correct.
- [ ] Forms and navigation are correct.

### UX

- [ ] Layout is practical.
- [ ] No excessive cards.
- [ ] No unnecessary decorative UI.
- [ ] Conversation area will have sufficient space.
- [ ] Desktop works correctly.
- [ ] Smaller screens do not break the layout.

### Engineering

- [ ] Existing functionality still works.
- [ ] Build succeeds.
- [ ] TypeScript succeeds.
- [ ] No obvious console errors.
- [ ] No duplicate components.
- [ ] No unnecessary dependencies.

---

# 27. VERY IMPORTANT — FUTURE PHASES

After this task is accepted, EVERY future frontend phase MUST use this Application Shell.

Future developers/AI agents must NOT create their own:

- Sidebar
- Header
- Footer
- Page container
- Global navigation
- Theme system

unless there is a documented architectural reason and the change is explicitly approved.

The shell becomes part of the project's permanent UI foundation.

---

# 28. DO NOT IMPLEMENT FUTURE FEATURES NOW

Even if you see obvious places where future features should exist, do not implement them.

For example:

Do NOT implement:

- AI chat
- WhatsApp connection
- Appointments
- Doctor management
- Services management
- Knowledge base
- Notifications
- Human takeover
- AI routing

unless they already exist and must be preserved.

Only establish the UI foundation required for those future features.

---

# 29. FINAL REPORT

When finished, report:

## 1. Existing UI Architecture Found

Explain briefly how the existing project was structured.

## 2. Components Created

List only newly created components.

## 3. Components Reused

List important existing Shadcn/project components reused.

## 4. Files Changed

List every changed file.

## 5. Verification

Report actual results for:

- Build
- TypeScript
- Lint
- Routes
- RTL
- Responsive
- Console errors

Do NOT claim a test passed unless you actually ran it.

## 6. Design System Rules Established

Document the rules future phases must follow.

## 7. Problems Found

If anything is incomplete or technically questionable, state it clearly.

Do not hide problems.

---

# FINAL RULE

The objective is not to make the UI impressive.

The objective is to establish a **stable, reusable Shadcn UI Application Shell** that becomes the visual and structural foundation of the entire project.

Study the supplied project first.

Reuse what already exists.

Do not invent a second design system.

Do not over-engineer.

Do not skip verification.

Once the shell is implemented and verified, STOP and wait for the next phase.

**Do not continue implementing Phase 2 features automatically.**