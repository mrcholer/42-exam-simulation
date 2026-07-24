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
/* C01/ex02 — ft_swap — EDUCATIONAL REFERENCE */
/* Concepts: swap via pointers — STUDY, DO NOT SUBMIT */

#include <unistd.h>

/* ====================================================================== */
/*  STOP — Predict output / memory before reading the implementation.     */
/* ====================================================================== */

/* ====================================================================== */
/*  THINK — swap via pointers                                                 */
/* ====================================================================== */

void	ft_swap(int *a, int *b)
{
	int	tmp;

	tmp = *a;
	*a = *b;
	*b = tmp;
}


/* ====================================================================== */
/*  LIVE DEMO — gcc -Wall -Wextra -Werror source.c && ./a.out           */
/* ====================================================================== */

int main(void)
{
	write(1, "Demo: ft_swap\n", 14);
	/* Call ft_swap here after you understand the function above. */
	return (0);
}
