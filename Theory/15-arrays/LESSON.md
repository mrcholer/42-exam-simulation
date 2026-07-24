# Arrays — Continuous Memory Blocks

> **An array is not a list of values floating in the air. It is a fixed row of bytes in RAM, sitting next to each other.**

---

## Definition

An **array** is a collection of elements of the **same type**, stored in **contiguous (continuous) memory**, accessed by an **index** starting at **0**.

```c
int nums[5];           // 5 ints in a row in memory
char name[] = "Ada";   // char array: 'A' 'd' 'a' '\0'
```

---

## Why This Concept Exists

### The Problem

Imagine tracking 100 test scores. Without arrays:

```c
int score0, score1, score2, ... /* nightmare */
```

### The Solution

One name, many slots:

```c
int scores[100];   // 100 ints, one after another
scores[0] = 95;
scores[1] = 88;
```

//! **Arrays exist because memory is linear — and the CPU is fast at sequential access.**

---

## Real Life Analogy

### Apartment Building

- **Array** = a row of identical apartments on one floor
- **Index** = apartment number (but we start at 0, not 1!)
- **Element** = the person living inside
- **sizeof** = size of one apartment × number of apartments

```
Floor (memory):
+-----+-----+-----+-----+-----+
| Apt0| Apt1| Apt2| Apt3| Apt4|   int arr[5]
+-----+-----+-----+-----+-----+
  [0]   [1]   [2]   [3]   [4]
```

//* Apartment 0 is the FIRST one — that's why index 0, not 1.

---

## How Arrays Are Stored — Continuous Memory

```
int arr[4] = {10, 20, 30, 40};

Address:  0x1000  0x1004  0x1008  0x100C
        +-------+-------+-------+-------+
        |  10   |  20   |  30   |  40   |
        +-------+-------+-------+-------+
Index:     [0]     [1]     [2]     [3]
```

Each `int` is typically 4 bytes — addresses jump by 4, not by 1.

---

## Indexes

```c
arr[0]   // first element
arr[3]   // fourth element
arr[4]   // OUT OF BOUNDS for int arr[4] — undefined behavior!
```

| Array size | Valid indexes |
|------------|---------------|
| `n` | `0` to `n-1` only |

// WARNING: C does **not** check bounds. `arr[999]` might compile and crash or corrupt memory.

---

## Why Indexes Start at Zero

**Because the index is an OFFSET from the start address.**

```
Address of arr[i] = address_of_arr + (i × sizeof(element))
```

- `i = 0` → no offset → **first** element
- `i = 1` → one step forward → **second** element

If we started at 1, every address calculation would need `i - 1` — wasteful on every access.

//====================================================
// STOP
Ask students: If `arr` starts at 0x1000 and `int` is 4 bytes, what address is `arr[2]`?
Answer: 0x1008. Discuss before continuing.
//====================================================

---

## Relationship Between Arrays and Pointers

```c
int arr[3] = {10, 20, 30};
int *p = arr;   // arr "decays" to address of arr[0]
```

These are **equivalent**:

```c
arr[i]
*(arr + i)
*(p + i)
p[i]
```

```
arr --> [10][20][30]
         ^
         |
    arr == &arr[0]
```

//! **Array name ≈ constant pointer to first element** (with subtle differences — see below).

### Difference: array vs pointer

```c
int arr[5];
int *p = arr;

sizeof(arr);  // 20 (5 × 4) — whole array
sizeof(p);    // 8 — pointer size only
```

---

## Character Arrays and Strings

In C, a **string** is a **char array ending with `\0`** (null terminator).

```c
char s[] = {'H', 'e', 'l', 'l', 'o', '\0'};
char t[] = "Hello";   // compiler adds \0 automatically
```

### Memory

```
"H e l l o \0"
+---+---+---+---+---+---+
|72 |101|108|108|111| 0 |
+---+---+---+---+---+---+
  s[0] ...         s[5]
```

ASCII: 'H'=72, 'e'=101, etc.

See: [Theory/14-strings](../14-strings/LESSON.md)

---

## 2D Arrays — Grid in Memory

```c
int grid[2][3] = {
    {1, 2, 3},
    {4, 5, 6}
};
```

Still **one continuous block** in row-major order:

```
Memory: [1][2][3][4][5][6]
         row0      row1

grid[1][2] == 6
```

```
Visual:
      col0  col1  col2
row0 [  1     2     3  ]
row1 [  4     5     6  ]
```

---

## Memory Visualization — Full Example

```c
int main(void)
{
    int a[3] = {1, 2, 3};
    int i = 0;
    while (i < 3)
    {
        write(1, &a[i], 1);  // wrong for int — illustration only
        i++;
    }
}
```

### Stack during loop (i=1):

```
+-------+-------+-------+-------+-------+
| a[0]=1| a[1]=2| a[2]=3|  i=1  |  ...  |
+-------+-------+-------+-------+-------+
```

---

## Examples

### Correct: Iterate array

```c
int i = 0;
while (i < len)
{
    /* use arr[i] */
    i++;
}
```

### Correct: String length

```c
int len = 0;
while (str[len] != '\0')
    len++;
```

### Wrong: Off-by-one

```c
while (i <= len)   // accesses arr[len] — one past end!
    i++;
```

### Wrong: Uninitialized

```c
int arr[10];
arr[0] = arr[0] + 1;   // garbage + 1
```

---

## Common Mistakes

1. **Off-by-one** — `<=` instead of `<`
2. **Forgetting `\0`** on char arrays used as strings
3. **Array size in brackets wrong** — `char s[4] = "Hello"` too small (needs 6 bytes)
4. **Confusing array size with string length** — `"Hi"` needs `char[3]` minimum
5. **Passing array expecting copy** — arrays decay to pointers; size is lost
6. **Using `==` to compare arrays** — compares addresses, not content

---

## Best Practices

//* Always know: how many elements? Valid indexes?
//* For strings: leave room for `\0`
//* Pass size explicitly: `void f(int *arr, int size)`
//* Draw memory before loops
//* Use meaningful index names or `i`, `j` consistently

---

## Mini Quiz

1. Why does index start at 0?
2. Where is `arr[2]` in memory if `arr` is at 0x2000 and `int` is 4 bytes?
3. How many bytes for `char msg[] = "1337"`?
4. What is `arr[i]` in pointer notation?
5. What happens at `arr[size]`?

---

## Interview Questions

1. Difference between `char *s = "hi"` and `char s[] = "hi"`?
2. How are 2D arrays laid out in memory?
3. Why must you pass array size to functions?
4. Explain array decay.
5. Trace: `int a[]={1,2,3}; int *p=a; p++;` — what is `*p`?

---

## Homework

1. Draw 5 arrays by hand with addresses.
2. Write a loop that prints each char of your name with index labels.
3. Find the bug in: `for (i=0; i<=10; i++) arr[i]=0;` for `int arr[10]`.

---

## Extra Challenge

Implement string length and reverse using **only** pointer notation (no `[]`).

---

## Summary

| Idea | Remember |
|------|----------|
| Storage | Continuous bytes |
| Index | Offset from start; starts at 0 |
| Bounds | 0 to n-1 |
| Strings | char array + `\0` |
| Pointers | `arr[i] == *(arr+i)` |

---

## Cheat Sheet

```
Declare:     type name[size];
Init:        type name[] = { ... };
Access:      name[i]   0 .. size-1
String:      char s[] = "text";  // +1 for \0
Size bytes:  sizeof(name)       // whole array
Length:      not sizeof — use loop to count
Pointer:     name == &name[0] (mostly)
```

---

## Useful Tips

//! Arrays and pointers are taught together for a reason — draw both
//? Before every `[i]`, ask: is i in range?
//* Piscine C02–C04 is mostly array + pointer practice — master this lesson first

## Exercises

See [C01/ex07](../../C01/ex07/README.md) (reverse array), [C02](../../C02/README.md) (strings).
