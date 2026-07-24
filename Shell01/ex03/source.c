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
/* Shell01/ex03 — Countdown — EDUCATIONAL REFERENCE */
/* Concepts: while loop, arithmetic — STUDY, DO NOT SUBMIT */
/* Shell exercises: practice in terminal; this file is a study guide stub. */

#include <unistd.h>

/* STOP: List 3 shell commands you need for "Countdown" before reading main. */
/* THINK: What does each command read/write — stdout, files, or network? */

int main(void)
{
	write(1, "=== Countdown ===\n", 18);
	write(1, "Open LESSON.md and run commands in your terminal.\n", 50);
	write(1, "Concepts: while loop, arithmetic\n", 33);
	return (0);
}
