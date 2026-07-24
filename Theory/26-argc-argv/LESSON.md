# argc and argv — Talking to Your Program

> **When you type `./program hello world`, the operating system hands your program a list of words. argc and argv are how C receives that list.**

---

## Definition

| Name | Type | Meaning |
|------|------|---------|
| `argc` | `int` | **Argument count** — how many strings |
| `argv` | `char **` | **Argument vector** — array of pointers to those strings |

```c
int main(int argc, char **argv)
{
    /* argc = number of arguments */
    /* argv[0] = program name */
    /* argv[1] .. argv[argc-1] = user arguments */
    return (0);
}
```

---

## Why This Concept Exists

Programs need input **before** they run interactively:

```bash
./sort -n file.txt
./grep "error" log.txt
./ft_print_params hello 1337 poolers
```

The **shell** parses the command line and passes tokens to your program via `argc`/`argv`.

Without this: every program would need to ask "what file?" after starting — slow and not scriptable.

---

## Real Life Analogy

### Restaurant Order Ticket

- **Command line** = customer speaking: "Burger, no onions, extra sauce"
- **Shell** = waiter writing each item on separate lines
- **argc** = number of lines on the ticket (including restaurant name header)
- **argv** = each line of the ticket
- **argv[0]** = restaurant/program name (always there)

```
Ticket (argv):
+---------------------------+
| [0] ./my_program          |
| [1] hello                 |
| [2] 1337                  |
| [3] poolers               |
+---------------------------+
argc = 4
```

---

## Command Line — Who Does What?

```
You type:     ./a.out hello world
                    |
                    v
Shell (bash/zsh): splits by spaces -> ["./a.out", "hello", "world"]
                    |
                    v
OS loader:      starts program, sets up argc=3, argv
                    |
                    v
main():         receives argc, argv
```

---

## Program Execution — Memory Setup

When `main` starts, the stack already contains `argc` and `argv` set up by the runtime (with OS help).

---

## argc — Argument Count

```bash
./program one two
```

```c
argc == 3
// argv[0] = "./program"
// argv[1] = "one"
// argv[2] = "two"
// argv[3] = NULL (often — see below)
```

//! **argc includes the program name** — so minimum argc is **1** (no extra args).

```c
if (argc < 2)
{
    write(2, "Usage: program arg1 arg2\n", 26);
    return (1);
}
```

---

## argv — Argument Vector

`argv` is an **array of strings**. Each string is `char *`.

```c
argv[0]   // char * — points to first char of program name
argv[1]   // char * — points to first char of first argument
```

### String layout in memory

```
./a.out\0hello\0world\0
^       ^     ^
|       |     |
argv[0] argv[1] argv[2]
```

Strings may be **contiguous** in memory (implementation detail) but always treat each `argv[i]` as its own C string.

---

## Why argv is `char **` (Not `char *`)

**Because argv is an array of `char *` — and array parameters decay to pointers.**

```
Step by step:
  char *     = pointer to one character (start of one string)
  char *[]   = array of those pointers
  char **    = pointer to first element of that array
```

### Visual

```
argv (char **)
    |
    v
+--------+--------+--------+--------+
| ptr[0] | ptr[1] | ptr[2] |  NULL  |   array of char *
+--------+--------+--------+--------+
    |        |        |
    v        v        v
  "./a"   "hello"  "world"    actual char data (\0 terminated)
```

//====================================================
// STOP
Ask students: What type is `argv[1]`? What type is `argv`?
Answers: `char *` and `char **`. Draw on board before continuing.
//====================================================

---

## Why Not `char *argv[]`?

```c
int main(int argc, char *argv[])  // equivalent to char **argv
```

`argv[]` in parameter list means "array of pointers" but **decays to `char **`** — same thing.

---

## Memory Visualization — Full Example

Command: `./greet Ada 1337`

```
argc = 3

Stack (simplified):
+------------------+
| argc = 3         |
| argv -->         |----+
+------------------+    |
                        v
              +------------------+
              | [0] --> "./greet\0"
              | [1] --> "Ada\0"
              | [2] --> "1337\0"
              | [3] --> NULL
              +------------------+
```

---

## Examples

### Print program name (C06 ex00)

```c
int main(int argc, char **argv)
{
    (void)argc;
    write(1, argv[0], /* length */);
    write(1, "\n", 1);
    return (0);
}
```

### Print all parameters (C06 ex01)

```c
int i = 1;   // skip argv[0] — program name
while (i < argc)
{
    /* print argv[i] */
    i++;
}
```

### Wrong: assume argv[1] exists

```c
write(1, argv[1], 5);   // CRASH or garbage if argc == 1
```

### Correct: check first

```c
if (argc > 1)
    /* use argv[1] */
```

---

## Common Mistakes

1. **Off-by-one on argc** — loop `i <= argc` reads past end
2. **Forgetting argv[0] is program name** — user args start at 1
3. **Not checking argc** before using argv[1]
4. **Confusing `char **` with `char *`**
5. **Modifying argv strings** — may be read-only on some systems
6. **Assuming argv[argc] is always NULL** — check your platform; loop `i < argc` is safe

---

## Best Practices

//* Always validate `argc` before accessing `argv[i]`
//* Loop: `i = 1; while (i < argc)`
//* Print usage to **stderr** (fd 2) on error
//* Return non-zero from main on usage error

---

## Mini Quiz

1. If you run `./a b c`, what is argc?
2. What is argv[0]?
3. Why is argv type `char **`?
4. Where do user arguments start?
5. What if argc is 1?

---

## Interview Questions

1. Draw memory for `./prog x y` with argc and argv.
2. Difference between `*argv[1]` and `**argv`?
3. How would you sort argv strings? (C06 ex03)
4. Can argc ever be 0? (Historical/platform — discuss)
5. Relation between argv and environment variables (envp — bonus)?

---

## Homework

1. Run `echo ./test a b` then trace argc/argv on paper.
2. Write a program that prints each argument on its own line with index.
3. Explain `char **` to someone who only knows `int`.

---

## Extra Challenge

Implement reverse order of argv (C06 ex02) without using extra array — only pointer swapping (advanced).

---

## Summary

| Item | Detail |
|------|--------|
| argc | Count of strings (includes program name) |
| argv | Array of char * (written as char **) |
| argv[0] | Program name |
| argv[1..] | User arguments |
| Safety | Check argc before use |

---

## Cheat Sheet

```c
int main(int argc, char **argv)

argc >= 1 always (at least program name)
User args: argv[1] .. argv[argc-1]
Safe loop: for (i = 1; i < argc; i++)

if (argc < 2) { usage(); return 1; }
```

---

## Useful Tips

//! C06 is entirely about argc/argv — read this lesson twice
//? Say: "argv is array of strings; char ** points to first string pointer"
//* Live demo: `printf("argc=%d\n", argc);` for every test command

## Related Exercises

- [C06/ex00](../../C06/ex00/README.md) — program name
- [C06/ex01](../../C06/ex01/README.md) — print params
- [C06/ex02](../../C06/ex02/README.md) — reverse params
- [C06/ex03](../../C06/ex03/README.md) — sort params

## Quizzes

See [QUIZ.md](QUIZ.md) for full assessment set.
