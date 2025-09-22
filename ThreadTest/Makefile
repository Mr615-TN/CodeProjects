.PHONY: all clean c cpp rust go java python js

all: c cpp rust java python js

c: thread_test.c
	@gcc -O2 -pthread thread_test.c -o thread_test_c
	@./thread_test_c

cpp: thread_test.cpp
	@g++ -O2 -pthread thread_test.cpp -o thread_test_cpp
	@./thread_test_cpp

rust: thread_test.rs
	@rustc -O thread_test.rs -o thread_test_rust
	@./thread_test_rust


java: ThreadTest.java
	@javac ThreadTest.java
	@java ThreadTest

python: thread_test.py
	@python3 thread_test.py

js: thread_test.js
	@node thread_test.js

clean:
	rm -f thread_test_c thread_test_cpp thread_test_rust ThreadTest.class

