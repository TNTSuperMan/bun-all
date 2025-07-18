const queue: (() => void)[] = [];

export const limit = () => {
    const { promise, resolve } = Promise.withResolvers<void>();
    queue.push(resolve);
    return promise;
};

setInterval(() => queue.shift()?.(), 1000);
