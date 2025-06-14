---
layout: ../layouts/article.astro
title: 'Maybe You Don’t Need SSR'
description: 'There is some caveats to Server Side Rendering in frontend teams. Learn my story now for free!'
date: 2025-06-14
---

2025-06-14

There’s a simple but not easy-to-solve problem with turning your app into a server-rendered one.

**tl;dr: SSR requires server knowledge, and if you’re building an app hidden behind an auth wall, you likely don’t need it.**

You have a team: a couple of backend engineers and a couple of frontend engineers. Your app is a SPA — it loads in the browser and fires off hundreds of API requests, effectively doing table joins on the client. You want to speed things up, reduce the number of requests, and (most importantly) try the new framework everyone’s talking about. Management still needs convincing… until your boss announces:

> "We have a new project, a custom CRM system. You can use whatever tech you want."

**YAY!!!!**

You scaffold the project and build your first page: it reads the user’s token, sends it to the API, fetches data, and returns to the client only what’s needed.

Next task: add a button to manipulate that data and make some more requests to the backend. Naturally, you start by adding client-side request logic since the action is happening in the browser. Obviously, requests are sent straight to the API — why wouldn’t they be?

It’s a bit annoying to set up a custom `fetch` function on both the client and the server.  
So, you create a nice cross-platform abstraction that handles authentication nicely.

It breaks all the time and grows more and more bloated with little hacks to work around the server-client boundary, to the point where you can barely understand what’s going on.

Apart from unmaintainable code, you’ve also created a security issue:

**The auth token, which is stored globally on the server, could also be used to serve a different user’s request.**

You’re using the same fetch abstraction that sets up the auth token, and there’s a possibility that at some point it will use a token from User A to serve User B.

**So, User B could see User A’s data.**

A developer who has always worked with SPAs isn’t used to the idea of the same code serving different requests. Global state in a SPA is global only for a browser tab.  
On the server, however, global state is global for everyone.

Some frameworks do a lot to make it feel like there’s no boundary between the server and the client, so it’s really easy to fall into old habits without realizing that servers work a bit differently.

Since you’re still in the early stages, your app consists of a single user that everyone logs in as for testing, so no one has discovered the issue yet.

A couple of days later, your PM creates a ticket:

> "This page is kinda slow. Fix IT!"

Your backend team could make the data load faster, but they’re busy. However, there’s another way to make it fast — preload data on your server.

You and your frontend buddy add caching, and things look really nice. The issue is that this cache is also global on the server. And again, it could potentially be read by everyone.

You’ve created a shared private cache that could be read by effectively anyone.

But this is a startup, so there are no concurrent sessions and no real users, so you still don’t know about the vulnerabilities you’ve created.

A couple of weeks later, during the "planning poker" meeting, the CEO starts complaining that simple tasks that used to take a couple of story points now cost hundreds of them:

> "This SSR thing — what benefits are we getting from it?"

During your most beautiful, persuasive talk, you realize: "Almost none of it is applicable to us."

- There’s no need for SEO — the app is completely behind an auth wall.
- There’s no real need to make the bundle smaller for the initial load — the bundle loads only once, and the client-side data join overhead is too small for anyone to notice.
- There’s no benefit to storing the logic on the server — you’re already duplicating it.
- There are a lot of problems with making the page look nice with just CSS, since you can’t get screen info on the server.
- Your `fetch` cross-platform abstraction breaks all the time, requiring more and more code to fix, and nobody really understands how it works. All you want is to call the "users" microservice to get their birth date. Why is it breaking all the time? Nobody knows, and you’re afraid to touch it. And you don’t even have any real users yet!
- Every task takes at least twice as long because of errors like:
  > "Error: Hydration failed because the initial UI does not match what was rendered on the server."
- Your company has to pay for more servers — for what?
- You and the frontend team aren’t ready to support the server side of the system since you barely know what the "H" in "SSH" stands for.

So, after convincing the CEO that SSR is the way forward, you decide:

> "That’s it! We’re moving back to good old CSR."

You complete the migration in under a week. The app feels faster. Your frontend team closes tasks faster. There are fewer bugs.

### Conclusion

I’ve seen this happen several times — a team decides to move to SSR. And most of the time, I see the same thing:

- People try to use the server as just an "initial page load" thing. This leads to the next point:
- A huge amount of abstractions are created to make it feel like there’s no boundary between the server and the client. And, as always, there are a couple of places where they don’t work, so these abstractions become even more abstract. They become so abstract that Martin Fowler would say:
  > "Well, I think this one is a bit too much."
- Frontend developers, who are either afraid of touching the server or don’t really understand programming outside the browser, make decisions that lead to security issues, bad performance, or bugs.
- Cached values or some global state are shared between requests.
- Hacks that prevent SSR altogether, like:
  ```javascript
  if (typeof window === 'undefined') return null
  ```
  so the developer can finally close that JIRA ticket.
- `'use client'` and `'use server'` are everywhere, with or without the need.
- The app still shows a loading screen on opening.

If your team has always worked with SPAs, you need to think twice before committing to SSR. You either have to teach the team or use a framework where the boundary between the server and the client is clear. Otherwise, the app becomes unusable and unsupportable before it’s even released.
