---
title: About
---

Created by [Peter Koraca](https://github.com/pkorac), Whippet.js is an open source tool that generates static websites.

The idea behind Whippet.js is quite similar to [Jeklyll’s](http://jekyllrb.com/) – it compiles a static website from a folder of **markdown** files, using **templates** you design and create. However that’s where the similarities end.

Whippet.js is written in **javascript**, not ruby, it uses only [github flavoured markdown](https://help.github.com/articles/github-flavored-markdown) as the format for writing and [mustache](http://mustache.github.io/) for rendering templates. It separates the **pages** from the **blog** posts and allows for “**on-the-fly templateing**” (see the readme for usage). It also creates a search index automatically, which allows your visitors to **search** through the static site and will also add a cache.manifest to it (in the upcoming version), so your website can be accessed **offline** as-well.


### Why a static website?

In many cases static websites are a very bad idea. However, for pages like portfolios or simple blog sites, static websites offer many benefits.
You don't have to worry about complex server setups, databases, content management systems, their ugrades and security patches.
They work great over a [CDN](http://en.wikipedia.org/wiki/Content_delivery_network) which also makes them faster and cheaper (in general), they can be uploaded to almost any server and can also be downloaded and run localy, which is great for kiosk installation scenarios.


### Why a generator like this one?

Because it makes editing the website as simple as editing documents on your hard-drive and because you have complete control over the design of your site. Whippet.js won’t insert any cms specific classes, tags or other nonsense to your pages. You create the template htmls and you decide what goes in them.

{{{signature}}}