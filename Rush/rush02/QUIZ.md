# Quiz — Rush 02 (A left / C right corners, B edges)

> **Topic-specific questions** · nested loops, left vs right corners
> Answer, then hit **Check answers**.

---

## Multiple Choice (8)

### MCQ 1
In Rush 02, a **left** corner prints:

- A) `A`
- B) `B`
- C) `C`
- D) space

### MCQ 2
A **right** corner prints:

- A) `A`
- B) `B`
- C) `C`
- D) space

### MCQ 3
Unlike Rush 01, the corner character here depends on:

- A) The row (top vs bottom)
- B) The column (left vs right)
- C) The ASCII table
- D) The exit code

### MCQ 4
`rush(5, 3)` prints which top row?

- A) `ABBBC`
- B) `CBBBA`
- C) `ABBBA`
- D) `BBBBB`

### MCQ 5
What is common to Rush 00, 01, and 02?

- A) The border characters
- B) The nested-loop skeleton and newline handling
- C) The corner rule
- D) Nothing

### MCQ 6
`rush(1, 3)` (single column) prints edge cells as:

- A) All `A` on the corner rows, `B` in between
- B) All `C`
- C) All spaces
- D) `ABC`

### MCQ 7
If you factor the decision into `draw_cell`, switching variants means:

- A) Rewriting the loops
- B) Editing only `draw_cell`
- C) Changing the prototype
- D) Changing `main` only

### MCQ 8
The middle row of `rush(5, 3)` is:

- A) `ABBBC`
- B) `B   B`
- C) `BBBBB`
- D) `A   C`

---

## True or False (6)

1. Left and right corners differ in Rush 02. **T / F**
2. The loop skeleton is identical across all three Rush variants. **T / F**
3. Corner logic here is based on the row, like Rush 01. **T / F**
4. Specific corner branches must be tested before the generic edge. **T / F**
5. `B` is used for every non-corner edge. **T / F**
6. Good structure keeps `draw_cell` separate from the loops. **T / F**

---

## Coding (4)

1. Write `draw_cell` with left/right corner logic.
2. Predict `rush(3, 4)` on paper, then verify with **Run**.
3. Add the full version and test `rush(5, 3)`.
4. Extend it so all four corners are different characters.

---

## Answer Key

### Multiple Choice
| # | Answer | Why |
|---|--------|-----|
| 1 | **A** | Left corners are `A`. |
| 2 | **C** | Right corners are `C`. |
| 3 | **B** | Corner depends on the column side. |
| 4 | **A** | Top row is `ABBBC`. |
| 5 | **B** | Loops and newline handling are shared. |
| 6 | **A** | Corner rows print `A`, middle edges `B`. |
| 7 | **B** | Only the decision helper changes. |
| 8 | **B** | Middle row is wall + spaces + wall. |

### True or False
| # | Answer | Why |
|---|--------|-----|
| 1 | **T** | `A` left, `C` right. |
| 2 | **T** | Only `draw_cell` differs between variants. |
| 3 | **F** | Rush 02 is column-based, not row-based. |
| 4 | **T** | Specific before general. |
| 5 | **T** | `B` covers all non-corner edges. |
| 6 | **T** | Separation of concerns = easy variants. |
