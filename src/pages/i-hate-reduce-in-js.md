---
layout: ../layouts/article.astro
title: 'I hate .reduce in JS'
date: 2025-04-24
---

2025-04-24

Look at this:

```javascript
const result = array.reduce((acc, item) => {
  if (item.type === 'foo') {
    return [...acc, item.id]
  }
  return acc
}, [])
```

I can't tell you how often I've seen code like this.
<br>
To make it worse this kind of code often lives inside of
React components. No `memo` or `useMemo` or something. Just straight:

```jsx
export const ComponentWithList = ({ items }) => {
  const listOfIDs = items.reduce((acc, item) => {
    if (item.type === 'foo') {
      return [...acc, item.id]
    }
    return acc
  }, [])

  return <MyListOfIDs list={listOfIDs} />
}

// Just to make lookups more fun
export default ComponentWithList
```

What's wrong with it?
<br>
I’ll skip what's wrong with the component itself and focus just
on the crappy reduce thing.

1. WTF is `acc`? I know it's short for "accumulator", but WHY? Name it after
   what you're actually building: "listOfIDs".
2. Performance. Performance. What could cost about O(n) for memory
   and compute now costs "I’m not good enough at math to calculate exponentials".

Actually I can live with the `acc` thing since I've
seen a lot of `.reduce` in my life. I just don't like
this kind of generic naming.

But what’s up with the spreading!?<br>
It hurts something inside me when I think about creating a copy of an array
EVERY TIME the condition is met. The pain is so real it fueled me enough
to write this article.

Each time `item.type === 'foo'` we are:

1. Creating a new array that is just one item longer than `acc`
2. Iterating over `acc` to copy its values into the new array
3. Then placing item.id at the last index of that new array
<div class="mt-2"></div>

With 5 items, that’s 5 copies &mdash; assuming worst-case (big O):

1. `acc` copied on the first callback call: `[...[], items[0]]`
2. `[...[items[0]], items[1]]`
3. `[...[items[0], items[1]], items[2]]`
4. `[...[items[0], items[1], items[2]], items[3]]`
5. `[...[items[0], items[1], items[2], items[3]], items[4]]`

Assuming `typeof item.id === 'nubmer'` we are wasting on each iteration:

<table class="border-separate border-spacing-0 border border-gray-500 mt-4">
<thead>
<tr>
  <th class="p-2">Index</th>
  <th class="p-2">Memory in bytes (sum)</th>
  <th class="p-2">Iterations (sum)</th>
</tr>
</thead>
<tbody class="align-middle text-center">
<tr>
  <td class="border-t border-gray-700">0</td>
  <td class="border-t border-gray-700">0</td>
  <td class="border-t border-gray-700">0</td>
</tr>
<tr>
  <td class="border-t border-gray-700">1</td>
  <td class="border-t border-gray-700">8 (8)</td>
  <td class="border-t border-gray-700">1 (1)</td>
</tr>
<tr>
  <td class="border-t border-gray-700">2</td>
  <td class="border-t border-gray-700">16 (24)</td>
  <td class="border-t border-gray-700">2 (3)</td>
</tr>
<tr>
  <td class="border-t border-gray-700">3</td>
  <td class="border-t border-gray-700">24 (48)</td>
  <td class="border-t border-gray-700">3 (6)</td>
</tr>
<tr>
  <td class="border-t border-gray-700">4</td>
  <td class="border-t border-gray-700">32 (80)</td>
  <td class="border-t border-gray-700">4 (10)</td>
</tr>
</tbody>
</table>
<small>At every iteration we add current waste to the sum of previous ones</small>
<div class="mt-6"></div>

For the whole thing we've paid 120 bytes and 15 iterations:
<br>
_total waste + 48 bytes array built over 5 iterations._
<br>

Imagine doing that every time a user types something in an input.<br>
<small>React, am I right?</small>

We can do better in terms of performance and readability using
a plain old for loop:

```js
// New array
const listOfIDs = []
for (const item of items) {
  if (item.type === 'foo') {
    // Mutate it. It's ok since the array is new.
    listOfIDs.push(item.id)
  }
}
```

If you don't like looping then use `filter` and `map`:

```js
const listOfIDs = items
  .filter((item) => item.type === 'foo')
  .map((item) => item.id)
```

Yes, you'll create a one more array than needed but it's still much better and
reads well by a human fellow.

You could even still use `.reduce`.<br>
I just can't think of a good reason, aside from
"I just learned it, it was hard, and I want to feel
like this new knowledge has value.":

```js
const listOfIds = items.reduce((acc, item) => {
  if (item.type === 'foo') {
    // Mutating acc just like in a loop.
    acc.push(item.id)
  }
  return acc
  // This new array below is our `acc`.
}, [])
```

Even though `[].push()` might copy an array under the hood sometimes,
it is still faster than spreading:

- No new object is created
- JS engine could use [dynamic arrays](https://en.wikipedia.org/wiki/Dynamic_array)
  to avoid copying
- It is faster for some reason that I don't know yet, but it is what it is.

### More on perf.

JS engines generally perform a bit better with for loops
than with `.reduce`, `.filter` and `.map`.
I'm guessing that loops are faster since:

- they are easier to statically analyze and are JIT'ed earlier
- with a loop we don't have to create a new function

But to be completely fair I haven't been in a situation where the difference
in performance of an app was noticeable when using `.filter().map()` vs a `for` loop.
<br>
So just write the readable thing.

### GOTCHA

One might assume that we could squeeze out some more performance by
allocating an array beforehand with `Array(items.length)`:

```js
const listOfIDs = Array(items.length)
let listIndex = 0

for (const item of items) {
  if (item.type === 'foo') {
    listOfIDs[listIndex] = item.id
  }
}
```

The issue with this lies in the internals of JS engines. In V8 this line:

```js
const listOfIDs = Array(items.length)
```

will create a special type of array called "holey array". This is **THE SLOWEST**
kind of array. There's no way to make it faster. In V8 arrays could
change their type only to a solwer one. So V8 team recommend to just
create a new empty array and `.push()` items into it,
just like in the loop example.

In general I would recommend avoid writing clever code that "should perform better".
<br>
At least not at your job.
<br>
Write obvious code. Try to write is as if JS has types.
JavaScript is not a fast language by it's nature. It is fast because of
the optimizations that JS engines do. And you have to know each engine's
internals to make reasonlable decisions about micro-optimizations.<br>

So on this note — where I'm kind of countering myself — I demand you to

**NOT COPY ON EVERY ITERATION**.

Just don't do it.

If you're creating an array once with `.reduce()` + spread, then fine.
I'll still shit on your code for readability unless you are my boss.

But in a context of a react app this thing could actually cause a noteceable
performance hit. Beleive me. One of the codebases I had to work on
couldn't even animate the caret in an input because of the vast amount
of memory copying.
<br><small>Redux, am I right?</small>

Young me would've loved to know that senior coders write this kind of code daily.
It's ok to write shitty code. I am glad that the code I wrote last month looks
like shit to me now. That means I'm growing.<br>
And to be completely fair, I've also written a bunch of "clever" oneliners like this one:

```js
items.reduce((acc, i) => {
  return i.type === 'foo' ? [...acc, i.id] : acc
}, [])
```

It felt cool at the time.

But now that you’ve read this article, you have no excuse for `reduce`'ing
memory into `Infinity`

Love you, bye!
