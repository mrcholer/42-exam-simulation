# Rush 01 — ASCII Art Box (`A / C` corners, `B` edges)

> **1337 / 42 Piscine · Weekend Rush** · Concepts: nested loops, top vs bottom corners
> This is Rush 00 with a twist: **top corners and bottom corners differ**.

---

## Goal

Same rectangle, new border scheme. The important new idea: your corner
decision now depends on **which** corner it is.

```
rush(5, 3):        rush(1, 1):     rush(3, 4):
ABBBA              A               ABA
B   B                              B B
CBBBC                              B B
                                   CBC
```

---

## Project layout (norme)

```
rush01/
  Makefile · ft_putchar.c · rush01.c · main.c · source.c
```

```bash
make && ./rush-01
```

## The Prototype

```c
void	rush(int x, int y);
```

Same signature as every Rush. Only the character rules change.

---

## The Character Rules

| Position | When | Character |
|----------|------|-----------|
| Top corner | side column **and** first row | `A` |
| Bottom corner | side column **and** last row | `C` |
| Any other edge | first/last row or first/last column | `B` |
| Inside | everything else | space |

Notice the **order** matters: test the top corner and bottom corner
*before* the generic edge, otherwise a corner would be drawn as `B`.

---

## Algorithm

```
for row from 0 to height - 1:
    for col from 0 to width - 1:
        if (side column) and (first row):   putchar 'A'
        elif (side column) and (last row):  putchar 'C'
        elif (any edge):                    putchar 'B'
        else:                               putchar ' '
    putchar '\n'
```

The `elif` chain encodes priority: **specific cases first, general last.**

---

## Why Ordering Matters

If you wrote the generic edge test first:

```c
if (first_row || last_row || first_col || last_col)   // WRONG order
    ft_putchar('B');
else if (corner ...) ...
```

then every corner would match `B` and you would never reach the `A`/`C`
branches. Always check the **most specific** condition first.

---

## Memory Diagram (`rush(5, 3)`)

```
Stack ( grows ↓ )
┌──────────┬────────┬──────────────────────────────┐
│ name     │ value  │ notes                         │
├──────────┼────────┼──────────────────────────────┤
│ width    │ 5      │ parameter                     │
│ height   │ 3      │ parameter                     │
│ row      │ 0..2   │ 0 → 'A' row, 2 → 'C' row      │
│ col      │ 0..4   │ walks each row                │
└──────────┴────────┴──────────────────────────────┘
stdout: "ABBBA\nB   B\nCBBBC\n"
```

---

## Common Errors

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Generic edge tested first | Corners print `B` | Put `A`/`C` branches **before** `B` |
| Swapped `A`/`C` | Top and bottom flipped | `A` = first row, `C` = last row |
| Single-row box `rush(x, 1)` | Ambiguous corner | First row wins → prints `A` corners |

---

## Practice

1. **Easy:** hand-draw `rush(4, 3)`.
2. **Medium:** what does `rush(3, 1)` print? (only one row — which corner wins?)
3. **Hard:** make a `rush02`-style version where **left** corners differ from **right** corners.

---

## Summary

Rush 01 teaches **branch ordering**: when several conditions can match, test
the most specific first. The loops are identical to Rush 00; only the
decision tree grew one level.

> Open **QUIZ.md** in the **Quiz** tab, then **Run** and **Step** to watch the
> `A`/`B`/`C` box appear.
