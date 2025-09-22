#include <iostream>
#include <thread>
#include <vector>
#include <chrono>

void thread_function(int) {
    std::this_thread::sleep_for(std::chrono::seconds(2));
}

int main() {
    const int N = 100000;
    std::vector<std::thread> threads;

    auto start = std::chrono::high_resolution_clock::now();

    for (int i = 0; i < N; i++) {
        threads.emplace_back(thread_function, i);
    }

    for (auto& t : threads) {
        t.join();
    }

    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double> elapsed = end - start;

    std::cout << "C++: Took " << elapsed.count() << " seconds\n";
    return 0;
}

