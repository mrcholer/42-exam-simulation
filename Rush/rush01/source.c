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
/*
** EDUCATIONAL single-file demo for the Playground (Step / Run).
** Real Rush layout (norme): ft_putchar.c + rush01.c + main.c + Makefile
** Build real project: make && ./rush-01
*/

#include <unistd.h>

void	ft_putchar(char c)
{
	write(1, &c, 1);
}

static void	ft_put_line(char left, char mid, char right, int x)
{
	int	i;

	if (x < 1)
		return ;
	ft_putchar(left);
	i = 1;
	while (i < x - 1)
	{
		ft_putchar(mid);
		i++;
	}
	if (x > 1)
		ft_putchar(right);
	ft_putchar('\n');
}

void	rush(int x, int y)
{
	int	row;

	if (x <= 0 || y <= 0)
		return ;
	row = 1;
	while (row <= y)
	{
		if (row == 1)
			ft_put_line('A', 'B', 'A', x);
		else if (row == y)
			ft_put_line('C', 'B', 'C', x);
		else
			ft_put_line('B', ' ', 'B', x);
		row++;
	}
}

int	main(void)
{
	rush(5, 3);
	return (0);
}
