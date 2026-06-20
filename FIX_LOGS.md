`forEach` was designed for synchronous code. When you pass an `async` callback to it, here's what happens:

```typescript
// what you think happens:
middleware1 → await → middleware2 → await → handler

// what actually happens:
middleware1 fires → (doesn't wait) → middleware2 fires → (doesn't wait) → handler fires
     ↓                                      ↓
 resolves later                        resolves later
```

`forEach` sees your `async` callback as just a function that returns a Promise — and it **throws that Promise away**. It doesn't `await` it, doesn't care about it, just moves to the next iteration immediately.

So by the time `Auth` finishes reading the file and sets `isClosed = true`, your handler has **already run and sent the response**.

The timeline looks like this:

```
1. forEach calls Auth()        → Auth starts, returns a Promise (ignored)
2. forEach finishes instantly  → moves on
3. isClosed check runs         → still false! Auth hasn't finished yet
4. handler runs                → sends 200 with data ← WRONG
5. Auth finally finishes       → sets isClosed = true (too late)
```

`for...of` with `await` fixes this because it actually **pauses** at each iteration and waits for the Promise to resolve before continuing:

```
1. await Auth()      → pauses here
2. Auth finishes     → isClosed = true
3. isClosed check    → true! skip handler ← CORRECT
```
