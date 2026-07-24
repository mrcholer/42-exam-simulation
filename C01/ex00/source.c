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
/*   C01/ex00 — ft_ft — EDUCATIONAL REFERENCE                                 */
/*                                                                            */
/*   STUDY ONLY — implement your own version for submission.                  */
/*   Concepts: pointers, pass by address, & operator, * dereference           */
/*                                                                            */
/* ************************************************************************** */

/*
 * ============================================================================
 * FUNCTION: ft_ft
 * ============================================================================
 *
 * PURPOSE:
 *   Set the integer pointed to by nbr to 42. Smallest example of modifying
 *   caller memory through a pointer (output parameter pattern).
 *
 * INPUTS:
 *   nbr — pointer to int (copy of address passed by caller)
 *
 * OUTPUTS:
 *   None (void). Effect: *nbr becomes 42.
 *
 * MEMORY:
 *   Caller owns the int (stack). nbr holds copy of that address on callee
 *   stack. *nbr = 42 writes through to caller's int. See VISUALS.md.
 *
 * TIME COMPLEXITY:  O(1)
 * SPACE COMPLEXITY: O(1)
 *
 * COMMON MISTAKES:
 *   - nbr = 42          (assign to pointer, not target)
 *   - ft_ft(number)     (missing & at call site)
 *   - void f(int n)     (pass by value — no effect on caller)
 *
 * ALTERNATIVES:
 *   - return 42 and assign in caller (different API)
 *   - global variable (bad design)
 *   - ft_set(nbr, 42)   (generalized version — see EXERCISES.md)
 *
 * EDGE CASES:
 *   - nbr == NULL  → dereference crashes (segfault)
 *   - wild pointer → undefined behavior
 *   - 1337 subject does not require NULL guard; production code should
 *
 * ============================================================================
 */

void	ft_ft(int *nbr);

/* ************************************************************************** */
/* IMPLEMENTATION                                                             */
/* ************************************************************************** */

void	ft_ft(int *nbr)
{
	*nbr = 42;
}

/*
 * ============================================================================
 * STOP — Do not read past this line until you have:
 *   1. Read README.md and VISUALS.md
 *   2. Drawn memory for main + ft_ft on paper
 *   3. Written your own ft_ft attempt
 * ============================================================================
 */

/*
 * ============================================================================
 * THINK — Predict before running main:
 *
 *   int number;
 *
 *   number = 0;
 *   ft_ft(&number);
 *
 *   Q1: Value of number after ft_ft returns?
 *   Q2: What is stored INSIDE nbr during the call — 42 or an address?
 *   Q3: Why ft_ft(&number) and not ft_ft(number)?
 *
 * Answers: (1) 42  (2) address of number  (3) need address to write original
 * ============================================================================
 */

/*
 * ============================================================================
 * LIVE DEMO — compile this file for local study:
 *
 *   gcc -Wall -Wextra -Werror source.c -o ft_ft_demo
 *   ./ft_ft_demo
 *
 * Meeting: mentor uncomments demo sections one at a time.
 * ============================================================================
 */

#ifdef FT_FT_DEMO

# include <unistd.h>

static void	ft_putchar(char c)
{
	write(1, &c, 1);
}

static void	ft_putstr(char *s)
{
	while (*s)
	{
		ft_putchar(*s);
		s++;
	}
}

static void	ft_putnbr(int n)
{
	if (n == -2147483648)
	{
		ft_putstr("-2147483648");
		return ;
	}
	if (n < 0)
	{
		ft_putchar('-');
		n = -n;
	}
	if (n >= 10)
		ft_putnbr(n / 10);
	ft_putchar((char)('0' + (n % 10)));
}

static void	demo_pass_by_value_fails(void)
{
	int	number;

	number = 0;
	/*
	 * void bad(int n) { n = 42; }  — would NOT change number
	 * Compare with ft_ft(&number) below.
	 */
	ft_ft(&number);
	ft_putstr("After ft_ft: number = ");
	ft_putnbr(number);
	ft_putchar('\n');
}

int	main(void)
{
	demo_pass_by_value_fails();
	return (0);
}

#endif /* FT_FT_DEMO */

/*
 * ============================================================================
 * WRONG VERSIONS — study COMMON_ERRORS.md, then read why each fails:
 *
 *   void bad_value(int n)      { n = 42; }           pass by value
 *   void bad_ptr(int *nbr)     { nbr = 42; }          overwrites address
 *   void bad_local(int *nbr)   { int x = 42; nbr=&x; } points at dying local
 *
 * ============================================================================
 */

/*
 * ============================================================================
 * NORM NOTES (42):
 *   - Tabs for indentation
 *   - Max 25 lines per function (ft_ft easily fits)
 *   - No forbidden functions inside ft_ft
 *   - Submit only your ft_ft.c per project layout — this file is reference
 * ============================================================================
 */
