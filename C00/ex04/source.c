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
/* C00/ex04 — ft_is_negative — EDUCATIONAL REFERENCE */
/* Concepts: conditions, return values — STUDY, DO NOT SUBMIT */

#include <unistd.h>

/* ====================================================================== */
/*  STOP — Predict output / memory before reading the implementation.     */
/* ====================================================================== */

/* ====================================================================== */
/*  THINK — conditions, return values                                                 */
/* ====================================================================== */

int	ft_is_negative(int n)
{
	if (n < 0)
		return (1);
	return (0);
}


/* ====================================================================== */
/*  LIVE DEMO — gcc -Wall -Wextra -Werror source.c && ./a.out           */
/* ====================================================================== */

int main(void)
{
	write(1, "Demo: ft_is_negative\n", 21);
	/* Call ft_is_negative here after you understand the function above. */
	return (0);
}
