# Quiz — ft_ft

Complete all sections. Write reasoning — correct letters without explanation score half.

**Answer key** at bottom for self-check; mentor validates reasoning in meeting.

---

## Multiple Choice (10)

1. What is the primary purpose of `ft_ft`?
   - A) Return the integer 42 from the function
   - B) Modify an `int` in the caller's memory through a pointer
   - C) Create a new integer on the heap
   - D) Copy the value 42 into a local variable

2. Correct prototype for this exercise?
   - A) `int ft_ft(int nbr)`
   - B) `void ft_ft(int nbr)`
   - C) `void ft_ft(int *nbr)`
   - D) `void ft_ft(int **nbr)`

3. What does `&number` produce at the call site?
   - A) The value stored in `number`
   - B) The memory address of `number`
   - C) A pointer to a copy of `number` on the heap
   - D) The size of `number` in bytes

4. Inside `ft_ft`, what does `nbr` store?
   - A) The integer 42
   - B) A memory address
   - C) The character '42'
   - D) Always NULL until assigned

5. Inside `ft_ft`, what does `*nbr = 42` do?
   - A) Sets the pointer variable to 42
   - B) Writes 42 to the memory location `nbr` points to
   - C) Compares `nbr` with 42
   - D) Allocates 42 bytes

6. Why does `void broken(int n) { n = 42; }` fail to change the caller's variable?
   - A) Because 42 is too large for int
   - B) Because C passes `int` arguments by value (copy)
   - C) Because void functions cannot modify integers
   - D) Because the compiler optimizes away the assignment

7. Correct way to call `ft_ft` for variable `int score`?
   - A) `ft_ft(score)`
   - B) `ft_ft(*score)`
   - C) `ft_ft(&score)`
   - D) `score = ft_ft(&score)`

8. After `ft_ft(&number)` returns successfully, where does the value 42 live?
   - A) Inside parameter `nbr` after return
   - B) In the caller's `number` variable
   - C) On the heap until free()
   - D) In the CPU register permanently

9. What is the time complexity of `ft_ft`?
   - A) O(n)
   - B) O(log n)
   - C) O(1)
   - D) O(n²)

10. In `int *nbr`, the `*` in the declaration means?
    - A) Multiply nbr
    - B) nbr is a pointer to int
    - C) nbr is an array
    - D) nbr must be dereferenced before declaration

---

## True or False (10)

1. `nbr` and `*nbr` are the same thing. **T / F**

2. The caller must use `&` when passing a variable that `ft_ft` will modify. **T / F**

3. `ft_ft` must return 42 for the exercise to pass. **T / F**

4. A pointer parameter allows modifying the original variable because the address is shared. **T / F**

5. `nbr = 42` inside `ft_ft` is equivalent to `*nbr = 42`. **T / F**

6. Calling `ft_ft(NULL)` is safe on all systems. **T / F**

7. Even pointers are passed by value in C — `nbr` is a copy of the caller's address. **T / F**

8. After `ft_ft` returns, the local parameter `nbr` still exists in main. **T / F**

9. `*nbr = 42` performs at least one memory WRITE. **T / F**

10. Understanding `ft_ft` is essential for later exercises like `ft_swap`. **T / F**

---

## Coding (5)

1. **Minimal:** Write `ft_ft` in ≤ 5 lines (prototype + body). Norm-style tabs.

2. **Generalized:** Write `void ft_set(int *nbr, int value)` and use it to set a variable to 42 from `main`.

3. **Safe variant:** Write `ft_ft_safe` that returns early if `nbr == NULL`, otherwise sets `*nbr = 42`.

4. **Trace main:** Write a `main` that initializes `int x = 0`, calls `ft_ft(&x)`, and verifies `x == 42` using only `write` (no `printf` in submitted exercise file if forbidden by your norm).

5. **Broken fix:** Fix this and explain the bug in one comment:
   ```c
   void ft_ft(int *nbr)
   {
       nbr = 42;
   }
   ```

---

## Memory (5)

1. Draw stack frames for `main` and `ft_ft` **before** `*nbr = 42`. Label `number`, `nbr`, addresses, values.

2. Draw the same diagram **after** `*nbr = 42` but **before** return.

3. Draw pass-by-value failure: `void f(int n) { n = 42; }` — show why `number` stays 0.

4. Use arrow notation: `nbr` → `number`. Show state when `number` is 0, then when `number` is 42.

5. Draw what happens when `ft_ft(NULL)` is called — what does `*nbr = 42` attempt to write?

---

## Debugging (5)

1. **Symptom:** Segfault on call. Caller wrote `ft_ft(number)` instead of `ft_ft(&number)`. Explain why.

2. **Symptom:** Compiles, no crash, `number` still 0. Function uses `void ft_ft(int nbr) { nbr = 42; }`. Explain.

3. **Symptom:** Segfault inside function. Body is `nbr = 42; *nbr = 42;`. Explain first failing line.

4. **Symptom:** Works once, then weird values. Student used uninitialized `int *p; ft_ft(p);`. Explain.

5. **Logic bug:** Student sets `number = 42` in main **after** `ft_ft(&number)` then says function failed. Explain order of operations.

---

## Answer Key (Self-Check)

### Multiple Choice

1-B  2-C  3-B  4-B  5-B  6-B  7-C  8-B  9-C  10-B

### True or False

1-F  2-T  3-F  4-T  5-F  6-F  7-T  8-F  9-T  10-T

### Coding / Memory / Debugging

Graded on **working code + diagram + explanation**. No single letter answer.

**Discuss every wrong answer in meeting — fix the mental model, not just the letter.**

---

## Bonus Oral Questions (Mentor)

1. Say aloud: "When I write `*nbr = 42`, I READ \_\_\_\_ and WRITE \_\_\_\_."
2. Why is `ft_ft` called `void`?
3. How is ex01 `ft_ultimate_ft` harder in one sentence?
