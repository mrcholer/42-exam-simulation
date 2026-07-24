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
/* C00/ex03 — ft_print_numbers — EDUCATIONAL REFERENCE */
/* Concepts: digits, loops — STUDY, DO NOT SUBMIT */

#include <unistd.h>

/* ====================================================================== */
/*  STOP — Predict output / memory before reading the implementation.     */
/* ====================================================================== */

/* ====================================================================== */
/*  THINK — digits, loops                                                 */
/* ====================================================================== */

void	ft_putchar(char c);

void	ft_print_numbers(void)
{
	char	digit;

	digit = '0';
	while (digit <= '9')
	{
		ft_putchar(digit);
		digit = digit + 1;
	}
}


/* ====================================================================== */
/*  LIVE DEMO — gcc -Wall -Wextra -Werror source.c && ./a.out           */
/* ====================================================================== */

int main(void)
{
	write(1, "Demo: ft_print_numbers\n", 23);
	/* Call ft_print_numbers here after you understand the function above. */
	return (0);
}
