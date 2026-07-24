# File Descriptors

> **Read this lesson completely before the related exercises.**

**Prerequisites:** How Computers Work (01), write/read (44)  
**You will use this in:** C00 write(), C11 GNL, all Unix I/O

---

## Definition

A **file descriptor (fd)** is a small **non-negative integer** the operating system assigns to represent an **open I/O resource** — file, pipe, socket, or standard stream.

Every process starts with three open fds:

| fd | Name | Default |
|----|------|---------|
| 0 | stdin | keyboard input |
| 1 | stdout | terminal output |
| 2 | stderr | error output |

```c
#include <unistd.h>

write(1, "hello\n", 6);   /* fd 1 = stdout */
```

Opening files returns new fds (3, 4, 5, ...). `close(fd)` releases them.

---

## Why This Concept Exists

User programs cannot touch hardware directly. The kernel mediates access through **numeric handles**. File descriptors are the Unix contract: "read/write this number, kernel knows what it means."

C00 `write(1, ...)` only makes sense once fds are understood.

---

## Real Life Analogy

**Ticket numbers at a deli counter** — you don't walk into the kitchen. You hold ticket **#1** for printing output, **#0** for input. Opening a file gets ticket **#3**. Close your ticket when done so the shop doesn't run out of numbers.

---

## Visual Explanation

```
Process fd table:

fd 0 ──> keyboard (stdin)
fd 1 ──> terminal (stdout)
fd 2 ──> terminal (stderr)
fd 3 ──> open file "data.txt"
fd 4 ──> pipe to another program

write(3, buf, n)  → kernel writes to data.txt
```

---

## ASCII / Memory Diagrams

### Process + kernel view

```
YOUR PROGRAM                    KERNEL
┌─────────────┐                ┌──────────────┐
│ fd 0 ───────┼───────────────>│ stdin stream │
│ fd 1 ───────┼───────────────>│ stdout stream│
│ fd 2 ───────┼───────────────>│ stderr stream│
│ fd 3 ───────┼───────────────>│ file object  │
└─────────────┘                └──────────────┘
```

### open / close lifecycle

```
fd = open("file.txt", O_RDONLY);  → returns 3
read(fd, buf, size);
close(fd);                         → 3 reusable later
```

---

## Examples

### Correct Example

```c
#include <fcntl.h>
#include <unistd.h>

int demo_fd(void)
{
	int fd;
	char buf[100];
	ssize_t n;

	fd = open("test.txt", O_RDONLY);
	if (fd == -1)
		return (1);
	n = read(fd, buf, 99);
	if (n > 0)
	{
		buf[n] = '\0';
		write(1, buf, n);
	}
	close(fd);
	return (0);
}
```

### Wrong Example

```c
void leak_fd(void)
{
	int fd = open("a.txt", O_RDONLY);
	/* WRONG: never close — fd leak */
	read(fd, NULL, 10);   /* WRONG: NULL buffer */
}

void bad_fd(void)
{
	write(99, "x", 1);   /* WRONG: likely invalid fd — EBADF */
	close(0);            /* WRONG: closing stdin breaks shell input */
}
```

---

## STOP / THINK

> **STOP** — Match fd numbers.

> **THINK** —
> 1. Default fd for normal print?
> 2. First likely fd after opening one file?
> 3. What returns -1?
> 4. Why close fds?

**Answers:** (1) 1 stdout (2) 3 (3) open/read/write error (4) avoid leaks, free kernel resources.

---

## Common Mistakes

1. Forgetting close → fd leak
2. Using fd before checking open() == -1
3. Confusing fd with FILE* (stdio)
4. Hardcoding fd 3 assuming always same
5. Double close (UB on some systems)

---

## Best Practices

- Check `-1` from open and negative from read/write
- Close every opened fd on all paths
- Use `#include <fcntl.h>` for open flags
- Know 0/1/2 by heart
- Draw fd table when debugging I/O

---

## Mini Quiz

1. stdin fd number?
2. open() failure return?
3. fd vs FILE*?
4. Maximum fds — need exact number?

---

## Interview Questions

1. What is fd table per process?
2. redirect stdout shell — fd level?
3. pipe creates how many fds?
4. EBADF meaning?

---

## Homework

1. List process fds with `ls -l /proc/self/fd` (Linux).
2. Trace C00 write(1) through kernel conceptually.
3. Write open/read/close error checklist.

---

## Extra Challenge

Open file, read chunk, write to stdout — full error paths.

---

## Summary

**File descriptors** are integer handles for I/O. Stdin/stdout/stderr are 0/1/2. Open files get new fds; always validate and close. Foundation for write, read, GNL, and syscalls.

---

## Cheat Sheet

| fd | Stream |
|----|--------|
| 0 | stdin |
| 1 | stdout |
| 2 | stderr |
| 3+ | opened resources |
| -1 | error from open |

---

## Useful Tips

//* Memorize 0, 1, 2 — exam reflex  
//* open fail? don't read  
//* close mirrors open like free mirrors malloc  
//* fd is int not pointer  
//* strace shows syscalls behind fds
