# Design Engineering Take-Home Exercise

## Challenge: FormKit - A Visual Form Builder

FormKit is a visual form builder that allows users to create custom forms by dragging and dropping components, configuring their properties, and instantly previewing the result. Your task is to enhance and complete this form builder prototype with a focus on **exceptional visual design, delightful interactions, and polished frontend engineering**.

This exercise evaluates your ability to blend aesthetic sensibility with technical skills—the core of design engineering. We're looking for beautiful, performant, and accessible user experiences that go beyond basic functionality.

## Getting Started

This repository contains a starter Next.js application with basic form builder structure already in place. Your job is to expand and enhance the existing functionality.

### Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Navigate to `http://localhost:3000` to see the app
5. Click "Start Building" to access the form builder at `/builder`

## Current Implementation

The repository includes a basic foundation with:

### Tech Stack

- **Next.js 15.3** with App Router
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Zustand** for state management
- **React Hook Form** for form handling
- **Lucide React** for icons
- **Comprehensive UI components** (Button, Input, Card, etc.)

### Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page with "Start Building" link
│   └── builder/
│       └── page.tsx        # Form builder interface
├── components/
│   ├── canvas.tsx          # Main form canvas component
│   ├── header.tsx          # Builder header
│   └── ui/                 # Complete UI component library
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── select.tsx
│       └── ... (12 components total)
└── lib/
    └── store.ts            # Zustand store for form state
```

### What's Already Built

- ✅ Basic Next.js app structure
- ✅ Form builder layout with sidebar and canvas
- ✅ Zustand store with field management
- ✅ Complete UI component library
- ✅ TypeScript configuration
- ✅ Basic form field rendering

### What You Need to Build

## Core Requirements

### 1. Enhanced Form Builder Interface

- **Component Library Sidebar**: Create a visually appealing sidebar with draggable form components
- **Property Configuration Panel**: Design an intuitive interface for editing field settings
- **Visual Polish & Micro-interactions**: Add delightful animations, hover states, and feedback
- **Responsive Layout**: Ensure the builder works seamlessly on different screen sizes

### 2. Form Components to Implement

Expand beyond the basic text input to include:

- Text Input (partially implemented)
- Text Area
- Select Dropdown
- Checkbox
- Radio Button Group
- Number Input
- Email Input

### 3. Drag & Drop Functionality

- **Smooth drag interactions** with visual feedback and drop zones
- **Component reordering** within the canvas with smooth animations
- **Visual indicators** during drag operations (ghost elements, drop zones)
- **Accessible drag & drop** with keyboard support
- **Delete/remove components** with confirmation and undo patterns

### 4. Component Configuration

- Edit component labels and placeholders
- Set required/optional status
- Configure options for select/radio components
- Add validation rules

### 5. Form State Management

Enhance the existing Zustand store to handle:

- Component reordering
- Component deletion
- Field validation
- Form preview state

## Bonus Features (Choose what interests you)

Focus on areas that showcase your design engineering strengths:

### Visual & Interaction Polish

- **Form Preview Mode**: Smooth toggle between builder and live preview
- **Advanced Animations**: Page transitions, component entrance/exit animations
- **Custom Styling**: Theme system with design tokens and CSS custom properties
- **Dark/Light Mode**: Thoughtful theme switching with proper contrast ratios

### Technical Excellence

- **Export/Import**: Save/load forms as JSON with proper error handling
- **Real-time Validation**: Beautiful validation feedback and error messaging
- **Keyboard Shortcuts**: Power-user features with visual shortcut hints
- **Undo/Redo**: Command history with visual feedback

### Advanced Features

- **Component Grouping**: Sections and fieldsets with collapsible UI
- **Conditional Logic**: Show/hide fields based on other inputs
- **Multi-step Forms**: Wizard interface with progress indicators
- **Form Templates**: Pre-built form layouts with customization

## What We're Evaluating

As a **Design Engineer**, you'll be assessed on your ability to create exceptional user experiences that blend visual design with technical excellence:

### Visual Design & Polish (30%)

- **Modern, cohesive design system** that feels intentional and consistent
- **Attention to micro-interactions** and delightful user affordances
- **Visual hierarchy and typography** that guides users effectively
- **Smooth animations and transitions** with no dropped frames
- **Responsive design** that works beautifully across devices
- **Color, spacing, and layout** that demonstrate strong design sensibility

### Interaction Design & UX (25%)

- **Intuitive drag-and-drop interactions** with clear visual feedback
- **Seamless user workflows** that feel natural and effortless
- **Performance considerations** - fast, responsive interactions
- **Accessibility** - keyboard navigation, screen reader support, ARIA labels
- **Error states and edge cases** handled gracefully
- **Progressive disclosure** of complexity

### Frontend Engineering (25%)

- **Clean, readable TypeScript** with proper typing and patterns
- **Component architecture** that's scalable and maintainable
- **Performance optimization** - efficient rendering and state management
- **Browser compatibility** and cross-platform considerations
- **Reusable component patterns** following design system principles
- **Modern React patterns** and best practices

### Problem Solving & Craft (20%)

- **Creative solutions** to complex interaction challenges
- **Implementation cost vs. experience impact** decision-making
- **Code organization** that supports future iteration
- **Technical exploration** to push what's possible
- **Balance of business goals with craft** - shipping polished, iterative improvements

## Implementation Approach

### Design Engineering Mindset

Think like a Design Engineer - consider both the **visual experience** and **technical implementation** at every step:

1. **Start with the user experience**: How should dragging feel? What visual feedback makes sense?
2. **Design in code**: Use the existing component system but push it further with custom styling
3. **Prioritize polish**: A few well-executed features beat many rough ones
4. **Consider performance**: Smooth animations require careful attention to rendering performance
5. **Accessibility first**: Ensure keyboard navigation, screen readers, and inclusive design

### Suggested Implementation Order

1. **Design the sidebar**: Create a beautiful component library with clear categorization
2. **Implement drag & drop**: Focus on smooth, delightful interactions with visual feedback
3. **Enhanced field rendering**: Make each form component visually appealing and functional
4. **Configuration panel**: Design an intuitive property editing interface
5. **Polish the experience**: Animations, micro-interactions, error states, and accessibility

### Working with the Existing Code

- The `useFormStore` in `/src/lib/store.ts` is your main state management foundation
- UI components in `/src/components/ui/` follow shadcn/ui patterns - extend them with custom styling
- The `FormBuilderCanvas` component renders form fields - enhance it with better visual design
- Use existing TypeScript interfaces but feel free to extend them for richer interactions
- Tailwind CSS 4 is configured - leverage modern CSS features and design tokens

### Recommended Libraries for Design Engineering

The project includes essential dependencies, but consider adding:

- `@dnd-kit/core` + `@dnd-kit/sortable` for accessible drag and drop
- `framer-motion` for smooth, performant animations
- `cmdk` for command palette patterns
- `@radix-ui/react-*` for accessible, unstyled primitives
- Additional `lucide-react` icons for visual consistency

## Time Expectation & Submission

### Focus Area (2—3 Hour)

This is designed as a **2—3 hour focused session**. We recommend prioritizing:

1. **Visual polish** - Make the existing interface beautiful and modern
2. **One key interaction** - Implement drag & drop OR component configuration really well
3. **Micro-interactions** - Add delightful hover states, animations, and feedback
4. **Code quality** - Clean, well-structured TypeScript with good patterns

**Remember**: Design Engineers prioritize **quality over quantity**. We'd rather see exceptional execution of core features than basic implementation of many features.

### What to Submit

When complete, ensure your solution:

1. **Runs without errors** (`npm run dev`)
2. **Demonstrates design engineering thinking** - visual design + technical execution
3. **Includes thoughtful micro-interactions** and attention to detail
4. **Works with the existing code structure** while enhancing it
5. **Brief comments** explaining key design and technical decisions

### Evaluation Focus

We'll specifically look for:

- **Visual design sensibility** and modern UI patterns
- **Smooth, performant interactions** that feel polished
- **Accessibility considerations** and inclusive design
- **Clean, maintainable code** that follows React/TypeScript best practices
- **Design system thinking** - consistent patterns and reusable components

## Questions?

If you have any questions about the existing code, design requirements, or technical implementation, please don't hesitate to reach out. We're excited to see your design engineering approach!

**Good luck building something beautiful! ✨**
#   o k t a - n e x t j s - f o r m - b u i l d e r  
 