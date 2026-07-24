# write & read

> **Read this lesson completely before the related exercises.**

**Prerequisites:** File Descriptors (43), void pointer (18)  
**You will use this in:** C00 ft_putchar, C11 GNL, all low-level I/O

---

## Definition

**write** and **read** are Unix **system calls** that transfer bytes between your buffer and an open file descriptor.

```c
#include <unistd.h>

ssize_t write(int fd, const void *buf, size_t count);
ssize_t read(int fd, void *buf, size_t count);
```

- Return **number of bytes** transferred (success, may be less than count)
- Return **-1** on error, set `errno`
- Return **0** on read means **EOF** (no more data now)
- `buf` is raw memory — usually `char *` or `void *`
- `count` is max bytes to transfer

```c
write(1, "Hi\n", 3);   /* 3 bytes to stdout */
```

---

## Why This Concept Exists

High-level `printf` hides syscalls. At 1337 you learn the real boundary: user buffer ↔ kernel ↔ device/file. `write` is how C00 prints without stdio. `read` is how GNL pulls bytes from files.

Understanding partial reads/writes prevents subtle GNL bugs.

---

## Real Life Analogy

**Mailbox slot size limit** — you send letters in batches (count bytes). Post office may accept fewer than you offered (partial write). Reading mailbox might yield one letter even if you hoped for five (partial read). Empty box tick = read returns 0.

---

## Visual Explanation

```
write(1, "ABC", 3):

YOUR BUFFER          KERNEL              TERMINAL
[ A B C ]  ──3──>   stdout handler  ──> displays ABC
return 3

read(fd, buf, 100):

FILE ON DISK    ──> kernel ──> maybe 42 bytes ──> your buf
return 42 (not always 100!)
```

---

## ASCII / Memory Diagrams

### Partial read loop (GNL pattern)

```
Request 100 bytes:

read 1: got 42  ──> process
read 2: got 58  ──> total 100
OR
read 1: got 42
read 2: got 0   ──> EOF
```

### write loop for large buffer

```
remaining = total;
while remaining > 0 {
	n = write(fd, ptr, remaining);
	if n <= 0) break;
	ptr += n;
	remaining -= n;
}
```

---

## Examples

### Correct Example

```c
#include <unistd.h>

void ft_putchar(char c)
{
	write(1, &c, 1);
}

ssize_t read_all(int fd, char *buf, size_t goal)
{
	size_t	total;
	ssize_t	n;

	total = 0;
	while (total < goal)
	{
		n = read(fd, buf + total, goal - total);
		if (n == 0)
			break ;
		if (n < 0)
			return (-1);
		total += n;
	}
	return ((ssize_t)total);
}
```

### Wrong Example

```c
void bad_write(void)
{
	write(1, NULL, 10);        /* WRONG: bad buffer */
	write(1, "hello", 1000);   /* WRONG: count > string — reads invalid memory */
}

void ignore_return(void)
{
	char buf[10];
	read(0, buf, 10);
	buf[10] = '\0';   /* WRONG: use return value — may read 0 bytes */
}

void short_write_assume(void)
{
	write(1, big, HUGE);
	/* WRONG: assume all written in one call */
}
```

---

## STOP / THINK

> **STOP** — Predict return values.

> **THINK** —
> 1. `write(1, "abc", 3)` return if success?
> 2. `read(fd, buf, 100)` when file empty at EOF?
> 3. Must read always fill buffer?
> 4. Why `const void *` on write buffer?

**Answers:** (1) 3 (2) 0 (3) No — partial read common (4) kernel promises not to modify your bytes.

---

## Common Mistakes

1. Wrong count (strlen vs sizeof confusion)
2. Ignoring return value
3. Not looping on partial I/O
4. Forgetting read doesn't null-terminate
5. Using read return as bool without checking -1

---

## Best Practices

- Count bytes precisely — for strings often `strlen` or known length
- Always check `-1` and handle `errno` when debugging
- Loop until done or EOF/error for robust code
- Null-terminate strings yourself after read if needed
- Use `ssize_t` for return — signed for errors

---

## Mini Quiz

1. write header?
2. read returns 0 means?
3. Partial write when?
4. ft_putchar implementation one line?

---

## Interview Questions

1. write vs printf internal?
2. Why read can return less than requested?
3. EINTR and restarting syscalls (concept)?
4. Buffer size choice tradeoffs?

---

## Homework

1. Implement ft_putstr with write loop.
2. Read file byte-by-byte until EOF — count bytes.
3. Explain GNL partial read scenario.

---

## Extra Challenge

Write robust writestring handling partial writes.

---

## Summary

**write** sends bytes to an fd; **read** receives bytes from an fd. Returns count or -1; reads may be short; EOF is read==0. These syscalls power C00 output and GNL input — respect return values always.

---

## Cheat Sheet

| Call | Success | Special |
|------|---------|---------|
| write | bytes written | may be < count |
| read | bytes read | 0 = EOF |
| both | -1 | error |

---

## Useful Tips

//* Return value is truth — never ignore  
//* read doesn't add '\0'  
//* write(1,&c,1) is ft_putchar  
//* Short reads normal — loop  
//* errno explains -1 after perror
