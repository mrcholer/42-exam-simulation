/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   rush02.c                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: poolers <poolers@student.1337.ma>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/01/01 00:00:00 by poolers           #+#    #+#             */
/*   Updated: 2024/01/01 00:00:00 by poolers          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

void	ft_putchar(char c);

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
		if (row == 1 || row == y)
			ft_put_line('A', 'B', 'C', x);
		else
			ft_put_line('B', ' ', 'B', x);
		row++;
	}
}
