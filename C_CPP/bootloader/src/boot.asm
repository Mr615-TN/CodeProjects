[BITS 16]
[ORG 0x7c00]
start:
  cli
  mov ax, 0x00 
  mov ds, ax
  mov es, ax
  mov ss, ax
  mov sp, 0x7c00
  sti
  mov si, msg
print:
  lodsb
  cmp al, 0 
  je done 
  mov ah, 0x0e 
  int 0x10 
  jmp print 
done:
  cli 
  hlt 
msg: dw "Hello World!", 0 
times 510 - ($ - $$) dw 0 
dw 0xAA55
