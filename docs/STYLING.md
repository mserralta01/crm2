# Styling Guide

This document outlines the styling system used in the SalesPro CRM application.

## Color System

The application uses a sophisticated HSL-based color system with CSS variables for easy theming.

### Base Colors

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --accent: 262.1 83.3% 57.8%;
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  /* ... other color variables */
}
```

### Dark Mode Colors

```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... other dark mode colors */
}
```

## Custom Effects

### Gradients

The application uses custom gradient effects for various elements:

```css
.gradient-bg {
  background: linear-gradient(
    135deg,
    hsl(var(--primary)) 0%,
    hsl(var(--accent)) 100%
  );
}

.text-gradient {
  background: linear-gradient(
    135deg,
    hsl(var(--primary)) 0%,
    hsl(var(--accent)) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Animations

Custom keyframe animations:

```css
.typewriter-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background-color: currentColor;
  margin-left: 2px;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  from, to { opacity: 1; }
  50% { opacity: 0; }
}

.floating {
  animation: floating 3s ease-in-out infinite;
}

@keyframes floating {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}
```

## Layout System

### Container

The application uses a container system for consistent content width:

```css
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}
```

### Grid System

Tailwind's grid system is used for responsive layouts:

```html
<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
```

## Typography

### Font Scale

The application uses a consistent typographic scale:

- Headlines: text-4xl to text-6xl
- Subheadlines: text-xl to text-2xl
- Body: text-base
- Small text: text-sm

### Font Weights

- Regular: font-normal
- Medium: font-medium
- Semibold: font-semibold
- Bold: font-bold

## Spacing

### Vertical Rhythm

Consistent spacing using Tailwind's spacing scale:

- Section padding: py-24
- Component gaps: gap-8
- Text margins: mb-6

### Responsive Spacing

Spacing adjusts based on screen size:

```html
<section class="pt-32 pb-16 md:pt-40 md:pb-24">
```

## Best Practices

1. Use CSS variables for theme values
2. Maintain consistent spacing
3. Follow responsive design patterns
4. Optimize animations for performance
5. Maintain accessibility standards