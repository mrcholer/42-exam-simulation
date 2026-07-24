/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   source.c                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: poolers <poolers@student.1337.ma>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/01/01 00:00:00 by poolers           #+#    #+#             */
/*   Updated: 2024/01/01 00:00:00 by poolers          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
/* ************************************************************************** */
/*                                                                            */
/*   C00/ex00 — ft_putchar                                                    */
/*   EDUCATIONAL REFERENCE — study, trace, teach; do not blind copy-paste     */
/*                                                                            */
/*   Live-meeting file: STOP / THINK / LIVE DEMO blocks below                 */
/*   Concepts: write(), stdout, file descriptor 1, char, ASCII               */
/*                                                                            */
/* ************************************************************************** */

#include <unistd.h> //! System call write() lives here (not in stdio.h)

/* ====================================================================== */
/*  STOP — Before reading the function body                               */
/* ---------------------------------------------------------------------- */
/*  Pause. Close the IDE output panel.                                    */
/*  On paper, draw one box labeled `c` and write a character inside it.     */
/*  Ask: "If I pass 'A', what number does the CPU actually store?"          */
/*  Only continue after you write 65 (decimal) or 0x41 (hex).             */
/* ====================================================================== */

/* ====================================================================== */
/*  THINK — Three questions (answer aloud in the meeting)                 */
/* ---------------------------------------------------------------------- */
/*  1. What is a file descriptor? Why is the screen "file" number 1?      */
/*  2. Why does write() need &c and not just c?                           */
/*  3. What happens if you call write(1, &c, 2) by mistake?               */
/* ====================================================================== */

/*
 * --------------------------------------------------------------------------
 * FUNCTION: ft_putchar
 * --------------------------------------------------------------------------
 * Purpose:
 *   Display exactly one character on standard output (the terminal).
 *   This is your first bridge between a C variable and visible text.
 *
 * Inputs:
 *   c — type `char`, one byte on the stack (typically 8 bits).
 *       Holds an ASCII code (0–127 standard; 128–255 extended).
 *       Example: 'A' is stored as integer 65.
 *
 * Outputs:
 *   None (return type void). Side effect: one byte sent to stdout.
 *
 * Memory:
 *   Stack frame for ft_putchar:
 *     +-------+-------+
 *     | name  |  c    |  1 byte at some address, e.g. 0x7ffd…004
 *     +-------+-------+
 *   write() reads 1 byte FROM that address — it never copies the whole char
 *   by value into the kernel; it follows a pointer (&c).
 *
 * Time complexity:
 *   O(1) — fixed work: one syscall, one byte. (Syscall cost dominates.)
 *
 * Space complexity:
 *   O(1) — one local `char` on the stack; no heap allocation.
 *
 * Common mistakes:
 *   - write(1, c, 1)        → wrong: 2nd arg must be an address
 *   - write(1, "c", 1)      → prints wrong byte (address of string literal)
 *   - write(1, &c, 2)       → reads past c → undefined behavior
 *   - printf("%c", c)       → forbidden in 42 C00 (use write only)
 *   - forgetting #include <unistd.h>
 *
 * Alternative:
 *   putchar(c) from <stdio.h> — buffered, hides the syscall. We learn write()
 *   first so every later exercise (GNL, ft_printf) has a solid foundation.
 *
 * Edge cases:
 *   - c == '\0' (null byte): still writes one byte (often invisible)
 *   - c == '\n' (newline): terminal moves to next line — still one byte (10)
 *   - Non-printable chars (0–31): written but may not display visibly
 *   - Negative char values on some platforms: still one byte; know your type
 * --------------------------------------------------------------------------
 */

void	ft_putchar(char c)
{
	//? Why &c? write() signature: write(int fd, const void *buf, size_t count)
	//? The kernel needs a MEMORY ADDRESS to read bytes from — not the char alone.

	write(1, &c, 1);
	//  |   |   |
	//  |   |   +-- count: exactly 1 byte (ONE character — not a string length)
	//  |   +------ buf: address of local variable c on the stack
	//  +---------- fd: file descriptor 1 = stdout (standard output / terminal)

	// NOTE: write() returns ssize_t (bytes written or -1 on error).
	// NOTE: We ignore the return value here; production code may check it.
	// WARNING: Never pass &c with count > 1 — you would leak adjacent stack bytes.
}

/* ====================================================================== */
/*  LIVE DEMO — Run this main in the meeting (gcc source.c && ./a.out)   */
/* ---------------------------------------------------------------------- */
/*  Step 1: gcc -Wall -Wextra -Werror source.c -o demo_putchar             */
/*  Step 2: ./demo_putchar                                                 */
/*  Step 3: Change the character in main; predict output BEFORE running.   */
/*  Step 4: Add ft_putchar('\n'); trace ASCII 10 on paper.                 */
/* ====================================================================== */

//* Demonstration main — NOT part of the 42 submission (only ft_putchar is).
int	main(void)
{
	char	letter;

	letter = 'H'; //! 'H' is syntax sugar for integer 72 (ASCII)

	ft_putchar(letter);
	// When this line runs:
	//   1. letter (72) is copied into parameter c inside ft_putchar
	//   2. write(1, &c, 1) asks the OS to send byte 72 to the terminal
	//   3. Terminal font maps 72 → glyph "H"

	ft_putchar('i');
	// Character literals 'i' and "i" are NOT the same:
	//   'i' → single int value 105
	//   "i" → address of a 2-byte array {'i', '\0'}

	ft_putchar('!');
	ft_putchar('\n');
	// '\n' is ASCII 10 — cursor goes to next line (control character)

	return (0);
	// main returns 0 → OS interprets as "success" (exit status)
}

/* ====================================================================== */
/*  ASCII quick reference (printable subset)                              */
/* ---------------------------------------------------------------------- */
/*  '0'-'9' → 48-57    'A'-'Z' → 65-90    'a'-'z' → 97-122                 */
/*  space   → 32      '\n'   → 10        '\0'   → 0 (end of C strings)    */
/* ====================================================================== */
