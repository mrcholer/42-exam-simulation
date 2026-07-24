# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: poolers <poolers@student.1337.ma>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/01/01 00:00:00 by poolers           #+#    #+#              #
#    Updated: 2024/01/01 00:00:00 by poolers          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

NAME	= rush-01
SRCS	= ft_putchar.c rush01.c main.c
OBJS	= $(SRCS:.c=.o)
CC		= gcc
CFLAGS	= -Wall -Wextra -Werror

all: $(NAME)

$(NAME): $(OBJS)
	$(CC) $(CFLAGS) -o $(NAME) $(OBJS)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS)

fclean: clean
	rm -f $(NAME)

re: fclean all

.PHONY: all clean fclean re
