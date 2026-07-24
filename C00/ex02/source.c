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
/* C00/ex02 — ft_print_reverse_alphabet — EDUCATIONAL REFERENCE */
/* Concepts: loops, decrement — STUDY, DO NOT SUBMIT */

#include <unistd.h>

/* ====================================================================== */
/*  STOP — Predict output / memory before reading the implementation.     */
/* ====================================================================== */

/* ====================================================================== */
/*  THINK — loops, decrement                                                 */
/* ====================================================================== */

void	ft_putchar(char c);

void	ft_print_reverse_alphabet(void)
{
	char	letter;

	letter = 'z';
	while (letter >= 'a')
	{
		ft_putchar(letter);
		letter = letter - 1;
	}
}


/* ====================================================================== */
/*  LIVE DEMO — gcc -Wall -Wextra -Werror source.c && ./a.out           */
/* ====================================================================== */

int main(void)
{
	write(1, "Demo: ft_print_reverse_alphabet\n", 32);
	/* Call ft_print_reverse_alphabet here after you understand the function above. */
	return (0);
}
