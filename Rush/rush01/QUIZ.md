# Quiz — Rush 01 (A/C corners, B edges)

> **Topic-specific questions** · nested loops, branch ordering, corners
> Answer, then hit **Check answers**.

---

## Multiple Choice (8)

### MCQ 1
What character is a **top** corner?

- A) `A`
- B) `B`
- C) `C`
- D) `o`

### MCQ 2
What character is a **bottom** corner?

- A) `A`
- B) `B`
- C) `C`
- D) space

### MCQ 3
Every non-corner edge cell prints:

- A) `A`
- B) `B`
- C) `C`
- D) space

### MCQ 4
Why must the `A`/`C` corner tests come **before** the generic edge test?

- A) For speed
- B) Otherwise corners match the edge case and print `B`
- C) The compiler requires it
- D) It does not matter

### MCQ 5
`rush(5, 3)` prints which top row?

- A) `ABBBA`
- B) `CBBBC`
- C) `AAAAA`
- D) `BBBBB`

### MCQ 6
`rush(5, 3)` prints which bottom row?

- A) `ABBBA`
- B) `CBBBC`
- C) `BBBBB`
- D) `CCCCC`

### MCQ 7
In `rush(3, 1)` (a single row), the corners print:

- A) `A` (first row wins)
- B) `C` (last row wins)
- C) `B`
- D) Nothing

### MCQ 8
Compared to Rush 00, what changed in the code?

- A) The loop structure
- B) Only the character-decision branches
- C) The prototype
- D) The newline handling

---

## True or False (6)

1. Top and bottom corners use different characters. **T / F**
2. The nested-loop structure is the same as Rush 00. **T / F**
3. Testing the generic edge first would still work correctly. **T / F**
4. `B` is used for both horizontal and vertical edges. **T / F**
5. Branch order encodes priority (specific before general). **T / F**
6. The middle row of `rush(5, 3)` is `B   B`. **T / F**

---

## Coding (4)

1. Write the corner branches in the correct order.
2. Implement `rush(1, 1)` — which char prints?
3. Add the full version and test `rush(5, 3)`.
4. Modify it so bottom corners are `Z` instead of `C`.

---

## Answer Key

### Multiple Choice
| # | Answer | Why |
|---|--------|-----|
| 1 | **A** | Top corners are `A`. |
| 2 | **C** | Bottom corners are `C`. |
| 3 | **B** | All non-corner edges are `B`. |
| 4 | **B** | Specific case must beat the general edge case. |
| 5 | **A** | Top row of a 5x3 box is `ABBBA`. |
| 6 | **B** | Bottom row is `CBBBC`. |
| 7 | **A** | First-row branch is tested first, so `A` wins. |
| 8 | **B** | Only the decision branches changed. |

### True or False
| # | Answer | Why |
|---|--------|-----|
| 1 | **T** | `A` top, `C` bottom. |
| 2 | **T** | Loops are identical. |
| 3 | **F** | Corners would wrongly print `B`. |
| 4 | **T** | `B` covers every non-corner edge. |
| 5 | **T** | That is why order matters. |
| 6 | **T** | Middle row is wall + spaces + wall. |
