---
layout: ../layouts/article.astro
title: 'Copying structs may actually be much faster (golang)'
date: 2025-04-17
---

2025-04-17

I was learning about the heap, stack, and CPU cache…

And it got me wondering: at what point is copying no longer slower than passing by reference?

I made a synthetic test. I have to note that synthetic tests aren’t really a good way to get reliable measurements, since in these tests we either have to trick the compiler into skipping optimizations, or the test ends up doing nothing.

The test was:

Create arrays of inputs and an array for structs

Fill the inputs with random strings

Iterate over the inputs and create a struct for each input

Save the array of structs into a JSON file

This way, I prevent the compiler from erasing the loops, since we're actually using them.

Then I ran this test with two different implementations of the `createStruct` function:

```go
func createStructPointer(a string, b string) *MyStruct
```

and

```go
func createStructCopy(a string, b string) MyStruct
```

Copying was about 90% faster than passing a reference.

Then I added 5 more fields to my struct and made each of them 1000-character-long strings.

Same result.

So my conclusion is: I have no idea how to effectively decide when I should copy or pass a reference. For now, I've decided to just copy. If problems come up, I'll deal with them when they do.

Moreover, compilers love simple, straightforward code. They optimize the hell out of it.
And Golang seems like the language for this kind of programming — simple, obvious, boring.  

I kinda like it.  

But also not.
