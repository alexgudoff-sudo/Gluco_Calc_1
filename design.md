# GlucoCalc — Design Plan

## App Concept
A minimalist single-screen calculator for people with Type 1 Diabetes. Helps calculate how many grams of a carbohydrate-containing food to eat in order to raise blood glucose from the current level to the target level.

## Formula
The app uses the "Rule of 10": 10g of carbohydrates raises blood glucose by approximately 2.2 mmol/L (or 40 mg/dL).

**Exact formula:**
- Carbs needed (g) = (Target glucose − Current glucose) × 10 / 2.2  [for mmol/L]
- Product mass (g) = Carbs needed × 100 / Carbs per 100g

## Screen List
- **Main Screen (Home)** — single screen, no navigation needed

## Primary Content & Functionality

### Main Screen
- App title / logo at the top
- Input: Target blood glucose level (mmol/L)
- Input: Current blood glucose level (mmol/L)
- Input: Carbohydrates per 100g of product (g)
- Result card: Grams of product to eat (calculated live)
- Subtle disclaimer note

## Key User Flow
1. User opens app
2. Enters target glucose (e.g., 5.5 mmol/L)
3. Enters current glucose (e.g., 2.8 mmol/L)
4. Enters carbs per 100g of chosen product (e.g., 75g for glucose tablets)
5. Result updates instantly — shows grams to eat

## Color Choices
- **Background**: #F8FAFB (very light cool gray — clean, clinical)
- **Surface / Cards**: #FFFFFF (pure white cards)
- **Primary accent**: #3B82F6 (calm blue — medical, trustworthy)
- **Foreground text**: #1A2332 (near-black, readable)
- **Muted text**: #8A95A3 (secondary labels)
- **Border**: #E2E8F0 (soft dividers)
- **Result accent**: #10B981 (green — positive outcome, "you're safe")
- **Warning**: #F59E0B (amber — for edge cases)
- **Error**: #EF4444 (red — invalid input)

## Typography
- Font: System default (SF Pro on iOS, Roboto on Android)
- Title: 28px bold
- Input labels: 13px medium, uppercase tracking
- Input values: 22px semibold
- Result value: 48px bold (large, prominent)
- Result unit: 18px regular

## Layout (Portrait, 9:16)
```
┌─────────────────────────┐
│   [Logo]  GlucoCalc     │  ← Header, top-center
│                         │
│  ┌─────────────────┐    │
│  │ TARGET GLUCOSE  │    │  ← Input card 1
│  │   [ 5.5 mmol/L ]│    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │ CURRENT GLUCOSE │    │  ← Input card 2
│  │   [ 2.8 mmol/L ]│    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │  CARBS / 100g   │    │  ← Input card 3
│  │   [  75  g  ]   │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │     RESULT      │    │  ← Result card (green accent)
│  │    36 grams     │    │
│  └─────────────────┘    │
│                         │
│  * Consult your doctor  │  ← Disclaimer
└─────────────────────────┘
```

## Design Principles
- Minimalist: no decorations, no icons except logo
- Large touch targets (min 56px height for inputs)
- Instant calculation (no "Calculate" button)
- Clear visual hierarchy: result is the most prominent element
- Single tab, no navigation
