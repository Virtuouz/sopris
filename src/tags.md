---
title: 'Tag Archive'
layout: 'layouts/feed.html'
pagination:
  data: collections
  size: 1
  alias: tag
  filter: ['blog', 'work', 'featuredWork', 'people', 'rss']
# permalink: '/tag/{{ tag | slug }}/'
eleventyExcludeFromCollections: true
---