all:
	nasm -f bin boot.asm -o boot.bin 

clean:
	rm -f boot.bin 

booter:
	qemu-system-x86_64 -drive format=raw,file=boot.bin

