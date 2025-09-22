function threadFunction() {
    return new Promise((resolve) => {
        setTimeout(resolve, 2000);
    });
}

async function main() {
    const N = 100000;
    const start = Date.now();

    const promises = [];
    for (let i = 0; i < N; i++) {
        promises.push(threadFunction());
    }

    await Promise.all(promises);

    const end = Date.now();
    console.log(`JavaScript: Took ${((end - start) / 1000).toFixed(2)} seconds`);
}

main();

