import time
from threading import Thread

def concurrent_threads(func, args):
    threads = []
    for arg in args:
        t = Thread(target=func, args=(arg,))
        t.start()
        threads.append(t)
    for t in threads:
        t.join()

def thread_function(name):
    time.sleep(2)

start = time.perf_counter()
concurrent_threads(thread_function, [(i,) for i in range(100000)])
end = time.perf_counter()

print(f"Python: Took {end - start:.2f} seconds")

