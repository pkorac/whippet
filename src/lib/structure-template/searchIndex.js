[{"title":"About","content":"\n\nCreated by [Peter Koraca](https://github.com/pkorac), Whippet.js is an open source tool that generates static websites.\n\nThe idea behind Whippet.js is quite similar to [Jeklyll’s](http://jekyllrb.com/) – it compiles a static website from a folder of **markdown** files, using **templates** you design and create. However that’s where the similarities end.\n\nWhippet.js is written in **javascript**, not ruby, it uses only [github flavoured markdown](https://help.github.com/articles/github-flavored-markdown) as the format for writing and [mustache](http://mustache.github.io/) for rendering templates. It separates the **pages** from the **blog** posts and allows for “**on-the-fly templateing**” (see the readme for usage). It also creates a search index automatically, which allows your visitors to **search** through the static site and will also add a cache.manifest to it (in the upcoming version), so your website can be accessed **offline** as-well.\n\n\n### Why a static website?\n\nIn many cases static websites are a very bad idea. However, for pages like portfolios or simple blog sites, static websites offer many benefits.\nYou don't have to worry about complex server setups, databases, content management systems, their ugrades and security patches.\nThey work great over a [CDN](http://en.wikipedia.org/wiki/Content_delivery_network) which also makes them faster and cheaper (in general), they can be uploaded to almost any server and can also be downloaded and run localy, which is great for kiosk installation scenarios.\n\n\n### Why a generator like this one?\n\nBecause it makes editing the website as simple as editing documents on your hard-drive and because you have complete control over the design of your site. Whippet.js won’t insert any cms specific classes, tags or other nonsense to your pages. You create the template htmls and you decide what goes in them.\n\n\n","url":"pages/about.html"},{"title":"Whippet.js","content":"\n# Usage\n\nInstall\n```npm install -g```\n\nCreate a new site\n```whippet new mySite```\n\nChange to the site directory\n```cd mySite```\n\nBuild the site\n```whippet build```\n\nor\n\nWatch the folder for changes and automatically build the site\n```whippet watch```\n\n\n","url":"index.html"},{"title":"First post","content":"\nHello there, this is a blog post.\n\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","url":"blog/2014-04-11.html"},{"title":"Second post","content":"\nAn example post number **two**.\n\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","url":"blog/2014-04-14.html"}]