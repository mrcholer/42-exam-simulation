# Linked Lists

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Pointers (16), malloc/free (30/33), Structs (from practice)  
**You will use this in:** C10 — list creation, push, size, last

---

## Definition

A **linked list** is a chain of **nodes** where each node holds **data** and a **pointer to the next node**.

```c
typedef struct s_list
{
	void			*data;
	struct s_list	*next;
}	t_list;
```

Properties:

- Nodes usually allocated on **heap** (`malloc`)
- Head pointer points to first node (or `NULL` if empty)
- Last node's `next` is `NULL`
- Not contiguous like arrays — nodes scattered in heap

Traversal:

```c
while (node)
{
	/* use node->data */
	node = node->next;
}
```

---

## Why This Concept Exists

Arrays have fixed size; inserting in middle requires shifting. Linked lists grow node-by-node and insert by **rewiring pointers** — O(1) at head if you have pointer.

They teach **pointer manipulation** before trees, queues, and graphs.

---

## Real Life Analogy

**Treasure hunt clues** — each note says data + "next clue in locker 7." No single shelf holds all notes contiguously — you follow links. `NULL` = "no more clues."

---

## Visual Explanation

```
head
  │
  ▼
┌─────────┐    ┌─────────┐    ┌─────────┐
│ data: A │    │ data: B │    │ data: C │
│ next: ──┼──> │ next: ──┼──> │ next:NULL│
└─────────┘    └─────────┘    └─────────┘
 node1          node2          node3
```

---

## ASCII / Memory Diagrams

### Push front

```
Before: head ──> [B]──>[C]──>NULL

Create new node A:
new ──> [A|?]

After push_front:
head ──> [A]──>[B]──>[C]──>NULL
new->next = head (old);
head = new;
```

### Insertion lost pointer bug

```
WRONG:
tmp = head->next;
free(head);
head = tmp->next;   /* oops if order wrong — classic exam bug */
```

---

## Examples

### Correct Example

```c
#include <stdlib.h>

typedef struct s_list
{
	int				data;
	struct s_list	*next;
}	t_list;

t_list *create_node(int value)
{
	t_list *node;

	node = malloc(sizeof(t_list));
	if (!node)
		return (NULL);
	node->data = value;
	node->next = NULL;
	return (node);
}

void push_front(t_list **head, int value)
{
	t_list *new;

	new = create_node(value);
	if (!new)
		return ;
	new->next = *head;
	*head = new;
}

int list_size(t_list *head)
{
	int count;

	count = 0;
	while (head)
	{
		count++;
		head = head->next;
	}
	return (count);
}
```

### Wrong Example

```c
void leak_list(t_list *head)
{
	while (head)
	{
		head = head->next;   /* WRONG: lost node — leak */
	}
}

void double_free_list(t_list *head)
{
	free(head);
	free(head->next);   /* WRONG if head->next not duplicated */
}

t_list *dangling_head;

void bad_remove(t_list *head)
{
	free(head);
	/* WRONG: caller's head now dangling if not updated */
}
```

---

## STOP / THINK

> **STOP** — Draw three nodes.

> **THINK** — Why `push_front(t_list **head, ...)` not `t_list *head`?
> 1. What must change in caller when inserting at front?
> 2. How detect empty list?
> 3. How free entire list safely?

**Answers:** (1) Caller’s head pointer variable itself must update — needs address. (2) `head == NULL`. (3) Save `next`, free current, advance.

---

## Common Mistakes

1. Losing `next` before free
2. Not using `**` when head changes
3. Memory leaks on delete
4. Dangling head after free
5. No NULL check on malloc node

---

## Best Practices

- Use `t_list **head` for functions modifying head
- Temp pointer `next` before free in destroy
- Empty list is valid — always handle NULL head
- One malloc per node — one free per node
- Draw boxes and arrows for every insert/remove

---

## Mini Quiz

1. Last node next field?
2. O(1) insert at head — why?
3. Array vs list memory layout?
4. How find list length?

---

## Interview Questions

1. Insert at tail — complexity naive?
2. Detect cycle in list (concept)?
3. Doubly linked list preview?
4. When array beats list?

---

## Homework

1. Draw push_front step-by-step.
2. Write destroy_list pseudo-code.
3. Implement size iteratively — no globals.

---

## Extra Challenge

Implement ft_list_push_front matching 42 C10 prototype exactly.

---

## Summary

**Linked lists** chain nodes with `next` pointers. Master head pointer updates (`**`), traversal, malloc per node, and ordered free. C10 is pointer wiring — diagrams first, code second.

---

## Cheat Sheet

| Item | Remember |
|------|----------|
| Empty | `head == NULL` |
| Traverse | `while (node) { ...; node = node->next; }` |
| Push front | `new->next = *head; *head = new;` |
| Free all | save next, free current |
| Last | next is NULL |

---

## Useful Tips

//* Every node is malloc — every node needs free  
//* **head when head itself moves  
//* Draw NULL terminator explicitly  
//* Traversal never skips malloc nodes without plan  
//* C10 eval: leaks are automatic fail
