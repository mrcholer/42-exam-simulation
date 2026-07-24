# Rush — Weekend team projects (norme)

Classic 1337 / 42 Piscine Rush: draw ASCII boxes with nested loops.

Each rush is a **real multi-file C project** (42 Norme style):

```
rush0X/
  Makefile
  ft_putchar.c
  rush0X.c
  main.c
  source.c      # single-file demo for Playground Step / Run
  LESSON.md
  QUIZ.md
```

## Build (terminal)

```bash
cd Rush/rush00
make
./rush-00
```

Flags: `-Wall -Wextra -Werror` (norm).

## Exercises

| Folder | Border scheme | Demo `rush(5, 3)` |
|--------|---------------|-------------------|
| [rush00](rush00/LESSON.md) | `o` / `-` / `\|` | `o---o` / `\|   \|` / `o---o` |
| [rush01](rush01/LESSON.md) | top `A`, bottom `C`, edges `B` | `ABBBA` / `B   B` / `CBBBC` |
| [rush02](rush02/LESSON.md) | left `A`, right `C`, edges `B` | `ABBBC` / `B   B` / `ABBBC` |

## Norme checklist

- Tabs for indentation
- Max 4 parameters, max 5 locals, max 25 lines per function
- Max 80 columns
- `return (0);` with parentheses
- No `for` / `do` / `switch` / ternary (use `while`)
- Functions separated by one blank line
- 42 file header present

In the Playground: open `source.c` for Step tracing, or open `main.c` / `rush0X.c` and Run — the server links every `.c` in the folder (except `source.c` when other project files exist).
