---
eleventyExcludeFromCollections: true
eleventyNavigation:
  key: Blog
  order: 6
title: "The Vynxlabs Blog"
headline: "The Vynxlabs Blog"
subheadline: "The latests articles demonstrating our design, thinking, and expertise"
layout: "layouts/feed.html"
pagination:
    data: collections.blog
    size: 5
permalink: 'blog{% if pagination.pageNumber > 0 %}/page/{{ pagination.pageNumber }}{% endif %}/index.html'
paginationPrevText: "Newer posts"
paginationNextText: "Older posts"
paginationAnchor: "#post-list"
---