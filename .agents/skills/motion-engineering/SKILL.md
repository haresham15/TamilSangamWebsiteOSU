---
name: motion-engineering
description: >-
  Implements purposeful, hardware-accelerated motion engineering using Framer Motion and GSAP.
  Use when building layoutId shared element transitions, parent-child variants with staggerChildren,
  physics-based spring interactions, time-based tween state transitions, or respecting prefers-reduced-motion.
---

# Intentional Motion Engineering Skill

This skill guides the agent in implementing fluid, high-performance, and accessible animations that elevate the user experience without falling into sluggish CSS transitions or juvenile, over-bouncy springs.

---

## 1. The Physics Law: Spring vs. Tween

Never apply a single universal easing curve to every element. Choose the motion engine based on the cause of movement:

### Physics-Based Springs (Direct User Manipulation)
- **When to Use**: Dragging, swiping, magnetic button hover pulls, cursor followers, volume/slider scrubs, expandable accordions triggered by user clicks.
- **Why**: Springs have natural momentum and overshoot that mimics physical mass reacting to hand/mouse input.
- **Parameters**:
  - Snappy/Tight: `stiffness: 400, damping: 30` (ideal for buttons and pills)
  - Organic/Fluid: `stiffness: 200, damping: 20` (ideal for cursor followers and cards)
  - Never use underdamped springs (`damping < 10`) that oscillate wildly.

### Time-Based Tweens with Custom Beziers (Systemic State Shifts)
- **When to Use**: Page entrances, modal mount fades, view transitions, tab crossfades, toast notifications.
- **Why**: System-initiated transitions must settle at an exact, predictable timestamp so the user can immediately read content.
- **Parameters**:
  - Standard Enter: `duration: 0.35, ease: [0.16, 1, 0.3, 1]` (custom cubic ease-out)
  - Smooth Morph: `duration: 0.5, ease: [0.25, 0.1, 0.25, 1]`

---

## 2. Eliminating Redundant Code with Parent Variants

Never attach individual delay calculations (`delay: index * 0.1`) on every child node. Use Framer Motion's parent `variants`:

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

// Markup:
<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

---

## 3. Seamless Morphs with `layoutId`

To create Apple-like fluid shared element transitions (e.g. clicking a thumbnail card to expand it into a full modal or page):

1. Give the collapsed element and the expanded element the **exact same string** in `layoutId`:
   ```tsx
   // Collapsed Item:
   <motion.div layoutId={`card-${id}`} className="rounded-2xl ...">
     <motion.h3 layoutId={`title-${id}`}>{title}</motion.h3>
   </motion.div>

   // Expanded Modal:
   <motion.div layoutId={`card-${id}`} className="rounded-3xl p-8 ...">
     <motion.h3 layoutId={`title-${id}`}>{title}</motion.h3>
   </motion.div>
   ```
2. Framer Motion calculates the FLIP (First, Last, Invert, Play) delta and transforms hardware-accelerated bounding boxes with zero layout thrashing.

---

## 4. Accessibility and Semantic Integrity (Non-Negotiable)

1. **Native Primitives**: Never wrap `whileHover` or `whileTap` around a plain `<div>`. Always use native semantic HTML elements:
   ```tsx
   // Correct:
   <motion.button
     type="button"
     whileHover={{ scale: 1.02 }}
     whileTap={{ scale: 0.98 }}
     className="..."
   >
     Submit
   </motion.button>

   // Forbidden:
   <motion.div whileHover={{ scale: 1.02 }} onClick={...}>Submit</motion.div>
   ```
2. **Reduced Motion**: Respect user preferences automatically:
   ```tsx
   const shouldReduceMotion = useReducedMotion();
   const animation = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 };
   ```
