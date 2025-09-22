class Worker extends Thread {
    public void run() {
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}

public class ThreadTest {
    public static void main(String[] args) throws InterruptedException {
        int N = 100000;
        Worker[] workers = new Worker[N];

        long start = System.currentTimeMillis();

        for (int i = 0; i < N; i++) {
            workers[i] = new Worker();
            workers[i].start();
        }

        for (int i = 0; i < N; i++) {
            workers[i].join();
        }

        long end = System.currentTimeMillis();
        System.out.printf("Java: Took %.2f seconds%n", (end - start) / 1000.0);
    }
}

