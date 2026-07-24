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
/* Shell01/ex06 — Group IDs — EDUCATIONAL REFERENCE */
/* Concepts: groups, id — STUDY, DO NOT SUBMIT */
/* Shell exercises: practice in terminal; this file is a study guide stub. */

#include <unistd.h>

/* STOP: List 3 shell commands you need for "Group IDs" before reading main. */
/* THINK: What does each command read/write — stdout, files, or network? */

int main(void)
{
	write(1, "=== Group IDs ===\n", 18);
	write(1, "Open LESSON.md and run commands in your terminal.\n", 50);
	write(1, "Concepts: groups, id\n", 21);
	return (0);
}
