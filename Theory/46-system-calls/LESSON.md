# System Calls

> **Read this lesson completely before the related exercises.**

**Prerequisites:** File Descriptors (43), write/read (44), How Computers Work (01)  
**You will use this in:** Understanding all Unix I/O, C00–C11 foundation

---

## Definition

A **system call (syscall)** is how a user program **requests a service from the operating system kernel** — a controlled gateway from your code to privileged operations.

Examples:

| Syscall | Purpose |
|---------|---------|
| `write` | output bytes to fd |
| `read` | input bytes from fd |
| `open` | open file → fd |
| `close` | release fd |
| `exit` | terminate process |
| `malloc` | **NOT** a syscall — library uses `brk`/`mmap` internally |

Flow:

```
Your program  →  syscall instruction  →  kernel  →  hardware/device
                (user mode)              (kernel mode)
```

User code runs unprivileged; syscalls are the **API of the OS**.

---

## Why This Concept Exists

If any program could touch disk or network directly, security and stability collapse. Syscalls enforce rules: valid fds, permissions, memory boundaries.

When you call `write(1, "hi", 2)`, libc wraps the raw syscall. Understanding this layer demystifies "how print actually works."

---

## Real Life Analogy

**Front desk at a secure building** — you (user program) cannot enter server room. You fill a request form (syscall) — security (kernel) validates and performs action. You never hold master keys directly.

---

## Visual Explanation

```
┌─────────────────────────────────────┐
│  Application (your C program)       │
│  write(1, buf, n);  ← libc function │
└──────────────┬──────────────────────┘
               │ syscall wrapper
               ▼
┌─────────────────────────────────────┐
│  Linux kernel                       │
│  validates fd, copies buffer, I/O   │
└──────────────┬──────────────────────┘
               ▼
         terminal / file / device
```

---

## ASCII / Memory Diagrams

### User vs kernel mode

```
USER SPACE:
  main()
  write()
  ──────────── syscall boundary ────────────
KERNEL SPACE:
  sys_write()
  device driver
```

### strace glimpse (concept)

```
write(1, "hello\n", 6)  = 6

Shows actual syscall name, args, return
```

---

## Examples

### Correct Example

```c
#include <unistd.h>
#include <fcntl.h>

/* Direct syscalls via unistd wrappers */
int copy_stdin_to_stdout(void)
{
	char	buf[4096];
	ssize_t	n;

	while (1)
	{
		n = read(0, buf, sizeof(buf));
		if (n == 0)
			break ;
		if (n < 0)
			return (1);
		if (write(1, buf, n) != n)
			return (1);
	}
	return (0);
}
```

### Wrong Example

```c
void fake_syscall(void)
{
	/* WRONG: inline asm syscall without knowing ABI — portability nightmare */
}

void confuse_layers(void)
{
	/* WRONG thinking: "printf is syscall" — usually buffered libc */
	printf("hi");   /* may not syscall until fflush/newline in some setups */
}
```

---

## STOP / THINK

> **STOP** — Classify each.

> **THINK** — Syscall or library function?
> 1. read()
> 2. strlen()
> 3. malloc()
> 4. exit()
> 5. ft_putchar using write()

**Answers:** (1) syscall wrapper (2) library only (3) library (uses syscalls internally) (4) syscall wrapper (5) your code calling write syscall wrapper.

---

## Common Mistakes

1. Thinking every libc call is syscall (printf buffers)
2. Ignoring errno after failed syscall
3. Assuming syscall atomic for all sizes (partial writes)
4. Confusing syscall number with fd
5. Trying to bypass kernel "for speed"

---

## Best Practices

- Know key syscalls: read, write, open, close, exit
- Check return values — syscall contract
- Use `strace ./prog` (Linux) to watch syscalls learn
- Read man pages: section 2 = syscalls
- Separate "my logic" from "OS I/O" mentally

---

## Mini Quiz

1. Who executes syscall handler?
2. Why can't user code access hardware raw?
3. errno set when?
4. Is write always one syscall per call?

---

## Interview Questions

1. Syscall vs function call cost?
2. How does kernel validate user pointer in read/write?
3. What is vdso (conceptual fast path)?
4. Why monolithic kernel + syscalls?

---

## Homework

1. Run strace on C00 hello — list syscalls.
2. Draw user/kernel boundary for open/read/close.
3. Read man 2 write — summarize 3 rules.

---

## Extra Challenge

Implement file copy using only open/read/write/close.

---

## Summary

**System calls** are controlled requests from user programs to the OS kernel. `read`, `write`, `open`, `close`, and `exit` form your Piscine I/O core. libc wraps syscalls; the kernel enforces safety. This is where software meets the real machine.

---

## Cheat Sheet

| Layer | Example |
|-------|---------|
| Your code | ft_putchar |
| libc | write() wrapper |
| Kernel | sys_write |
| Hardware | terminal |

---

## Useful Tips

//* man 2 for syscalls, man 3 for libc  
//* strace is best syscall teacher  
//* errno + perror decode failures  
//* Buffering hides syscalls — fflush reveals  
//* Every Poolers I/O lesson stacks here
