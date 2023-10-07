const Image = require("@11ty/eleventy-img");
const path = require("path");
const dateFilter = require("./src/filters/date-filter.js");
const w3DateFilter = require("./src/filters/w3-date-filter.js");
const rssPlugin = require("@11ty/eleventy-plugin-rss");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const pluginTOC = require('eleventy-plugin-toc')

const imageShortcode = async (
  src,
  cls,
  alt,
  sizes,
  widths = [200, 400, 850, 1920, 2500, null],
  formats = ["webp", "jpeg"]
) => {
  const imageMetadata = await Image(src, {
    widths: [...widths],
    formats: [...formats, null],
    outputDir: "dist/assets/images",
    urlPath: "/assets/images",
  });

  const imageAttributes = {
    class: cls,
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  return Image.generateHTML(imageMetadata, imageAttributes);
};

function generateImages(src, widths = [200, 400, 850, 1920, 2500]) {
  let source = src;
  let options = {
    widths: [...widths,null],
    formats: ["jpeg","webp", null],
    outputDir: "dist/assets/images",
    urlPath: "/assets/images",
    useCache: true,
    sharpJpegOptions: {
      quality: 80,
      progressive: true,
    },
  };
  // genrate images, ! dont wait
  Image(source, options);
  // get metadata even the image are not fully generated
  return Image.statsSync(source, options);
}

function imageCssBackground(src, selector, widths) {
  const metadata = generateImages(src, widths);
  let markup = [
    `${selector} { background-image: url(${metadata.jpeg[0].url});} `,
  ];
  // i use always jpeg for backgrounds
  metadata.jpeg.slice(1).forEach((image, idx) => {
    markup.push(
      `@media (min-width: ${metadata.jpeg[idx].width}px) { ${selector} {background-image: url(${image.url});}}`
    );
  });
  return markup.join("");
}

module.exports = (eleventyConfig) => {
  // Markdown
  eleventyConfig.setLibrary(
    'md',
    markdownIt().use(markdownItAnchor)
  )
  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
  eleventyConfig.addPassthroughCopy("./src/images/");
  eleventyConfig.addPassthroughCopy("./src/images/");
  eleventyConfig.addPassthroughCopy("./src/_includes/partials/background");
  // eleventyConfig.addPassthroughCopy("./src/css/");
  eleventyConfig.addPassthroughCopy({"./src/images/favicon":"/"})
  eleventyConfig.addPassthroughCopy("./src/fonts");
  eleventyConfig.addPassthroughCopy({ './src/robots.txt': '/robots.txt' });
  eleventyConfig.addPassthroughCopy('./src/_redirects');
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addNunjucksShortcode("cssBackground", imageCssBackground);
  eleventyConfig.addPlugin(rssPlugin);
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(pluginTOC,{tags:['h1','h2','h3']})

  // Returns a collection of blog posts in reverse date order
  eleventyConfig.addCollection("blog", (collection) => {
    return [...collection.getFilteredByGlob("./src/posts/*.md")].reverse();
  });

  eleventyConfig.addCollection("specials", (collection) => {
    return collection.getFilteredByGlob("./src/specials/*.md");
  });

  eleventyConfig.addCollection("events", (collection) => {
    return collection.getFilteredByGlob("./src/events/*.md");
  });

  eleventyConfig.addCollection("menu", (collection) => {
    return collection.getFilteredByGlob("./src/menu/*.md");
  });

  eleventyConfig.addFilter("dateFilter", dateFilter);
  eleventyConfig.addFilter("w3DateFilter", w3DateFilter);

  return {
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    cssTemplateEngine: "njk",
    dir: {
      input: "src",
      output: "dist",
    },
  };
};
