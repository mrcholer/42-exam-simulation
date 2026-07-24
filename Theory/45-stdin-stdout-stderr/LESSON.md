# stdin, stdout, stderr

> **Read this lesson completely before the related exercises.**

**Prerequisites:** File Descriptors (43), write/read (44)  
**You will use this in:** C00 output, debugging, shell redirection

---

## Definition

**stdin**, **stdout**, and **stderr** are the three **standard I/O streams** every Unix process inherits at startup.

| Stream | fd | Purpose | Default connected to |
|--------|-----|---------|-------------------|
| stdin | 0 | Input | keyboard |
| stdout | 1 | Normal output | terminal |
| stderr | 2 | Error/diagnostic output | terminal |

In C:

```c
#include <unistd.h>
write(1, "result\n", 7);   /* stdout */
write(2, "error\n", 6);    /* stderr */
read(0, buf, size);          /* stdin */
```

stdio also maps them: `stdin`, `stdout`, `stderr` (FILE*) — different layer, same fds underneath.

---

## Why This Concept Exists

Programs need predictable I/O channels before opening any files. Shell **redirection** (`>`, `2>`, `<`) manipulates these fds. Separating stderr lets errors show even when stdout goes to a file.

C00 uses stdout via `write(1, ...)`.

---

## Real Life Analogy

**Three phone lines** into your office:

- **Line 0 (stdin)** — customers call in with requests
- **Line 1 (stdout)** — you send regular answers
- **Line 2 (stderr)** — emergency/alerts line, often left open when main line forwarded to voicemail (file redirect)

---

## Visual Explanation

```
Normal terminal run:

Keyboard ──> fd 0 (stdin)  ──> program
Program ──> fd 1 (stdout) ──> screen
Program ──> fd 2 (stderr) ──> screen

Shell: ./prog > out.txt

Keyboard ──> fd 0
fd 1 ──> out.txt file
fd 2 ──> screen still (errors visible!)
```

---

## ASCII / Memory Diagrams

### Redirection mapping

```
./a.out > output.txt 2> errors.txt

fd 0 → stdin (keyboard)
fd 1 → output.txt
fd 2 → errors.txt
```

### Why split stdout and stderr

```
stdout: program results for piping/processing
stderr: human/debug messages

grep won't swallow error messages if they go to fd 2
```

---

## Examples

### Correct Example

```c
#include <unistd.h>

int divide(int a, int b, int *out)
{
	if (b == 0)
	{
		write(2, "Error: div by zero\n", 20);
		return (1);
	}
	*out = a / b;
	return (0);
}

int main(void)
{
	char c;

	write(1, "Type a char: ", 13);
	if (read(0, &c, 1) == 1)
		write(1, &c, 1);
	write(1, "\n", 1);
	return (0);
}
```

### Wrong Example

```c
void mix_streams(void)
{
	write(1, "fatal bug\n", 10);   /* WRONG: errors should use fd 2 */
}

void debug_wrong(void)
{
	/* WRONG: printf debugging when stdout redirected to file silently */
	/* use stderr for debug logs during dev */
}
```

---

## STOP / THINK

> **STOP** — Shell prediction.

> **THINK** — Command: `./prog > out.txt`
> 1. Where do normal writes to fd 1 go?
> 2. Where do writes to fd 2 go?
> 3. Where does fd 0 come from?
> 4. Why keep errors on stderr?

**Answers:** (1) out.txt (2) still terminal (3) keyboard unless redirected (4) visible when stdout captured.

---

## Common Mistakes

1. Printing errors to stdout — breaks pipelines
2. Hardcoding terminal assumptions
3. Forgetting fflush on stdio when mixing (advanced)
4. Closing 0/1/2 casually
5. Confusing FILE* and fd layers without knowing link

---

## Best Practices

- Results → stdout (1), diagnostics → stderr (2)
- Read interactive input from stdin (0)
- Test with redirection in shell
- During dev, log debug to fd 2
- Know `echo hello >&2` shell syntax

---

## Mini Quiz

1. stderr fd number?
2. Redirect stdout only syntax?
3. stdin default source?
4. write vs fprintf layer?

---

## Interview Questions

1. Why two output streams?
2. pipe stdout vs stderr example?
3. What happens closing stdout?
4. dup2 redirection concept?

---

## Homework

1. Run program redirecting stdout and stderr separately.
2. Rewrite error messages to fd 2.
3. Draw fd table before/after `> file`.

---

## Extra Challenge

Program reading stdin until newline, echo to stdout.

---

## Summary

**stdin (0), stdout (1), stderr (2)** are default I/O fds for every program. Use stdout for output, stderr for errors, stdin for input. Shell redirection re wires these — essential for Unix workflow and C00+.

---

## Cheat Sheet

| fd | Name | Typical use |
|----|------|-------------|
| 0 | stdin | read input |
| 1 | stdout | program output |
| 2 | stderr | errors/debug |

---

## Useful Tips

//* Errors to 2, data to 1 — habit  
//* Test with `./prog > /dev/null` — stderr still shows  
//* C00 write(1) is stdout — you already use this  
//* Mentors: demo redirection live every week  
//* GNL reads fd parameter — often stdin or file fd
