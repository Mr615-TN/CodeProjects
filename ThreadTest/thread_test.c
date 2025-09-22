#include <stdio.h>
#include <pthread.h>
#include <unistd.h>
#include <time.h>

void* thread_function(void* arg) {
    sleep(2);
    return NULL;
}

int main() {
    const int N = 100000;
    pthread_t threads[N];
    struct timespec start, end;

    clock_gettime(CLOCK_MONOTONIC, &start);

    for (int i = 0; i < N; i++) {
        pthread_create(&threads[i], NULL, thread_function, NULL);
    }

    for (int i = 0; i < N; i++) {
        pthread_join(threads[i], NULL);
    }

    clock_gettime(CLOCK_MONOTONIC, &end);
    double elapsed = (end.tv_sec - start.tv_sec) +
                     (end.tv_nsec - start.tv_nsec) / 1e9;

    printf("C: Took %.2f seconds\n", elapsed);
    return 0;
}

