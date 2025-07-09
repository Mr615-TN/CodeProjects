#ifndef IDT_H
#define IDT_H

#include <stdint.h>

/* Segment selectors */
#define KERNEL_CS 0x08

/* How every interrupt gate (handler) is defined */
struct idt_entry {
    uint16_t base_low;
    uint16_t sel;
    uint8_t always0;
    uint8_t flags;
    uint16_t base_high;
} __attribute__((packed));

/* A pointer to the array of interrupt handlers.
 * Assembly instruction 'lidt' will read it */
struct idt_reg {
    uint16_t limit;
    uint32_t base;
} __attribute__((packed));

extern idt_entry idt[256];
extern idt_reg idt_reg;


/* Functions implemented in idt.c */
void set_idt_gate(int n, uint32_t handler);
void set_idt();

#endif
