# 🍱 Collections

## What are Collections?

Astro Collections help you break up a larger set of data into multiple pages. Examples of use-cases include:

- Automatic pagination: `/posts/1`, `/posts/2`, etc.
- Grouping content: `/author/fred`, `/author/matthew`, etc.
- Generating one page per item: `/pokemon/pikachu`, `/pokemon/charmander`, etc.
- Generating pages from remote data
- Generating pages from local data

**When to use Collections: When you need to generate multiple pages from a single template.** If you just want to generate a single page (ex: a long list of every post on your site) then you can fetch data from a normal Astro page without using the Collection API.

## Collections API

To create a new Astro Collection, you must do two things:

1. Create a new file in the `src/pages` directory that starts with the `$` symbol. This is required to enable the Collections API.

- Example: `src/pages/$tags.astro` -> `/tags/:tag`
- Example: `src/pages/$posts.astro` -> `/posts/1`, `/posts/2`, etc.

1. Define and export a `createPages` function: this tells Astro what pages to generate. It **MUST** be named `createPages` and it must be exported. Check out the examples below for documentation on how it should be implemented.

- Example: `export async function createPages() { /* ... */ }`
- API Reference: [createPages][create-collection-api]

## Example: Listing Content by Tag, Author, etc.

```jsx
---
// Define a `createPages` function.
// In this example, we'll customize the URLs that we generate to
// create a new page to group every pokemon by first letter of their name.
export async function createPages() {
  const allPokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=150`);
  const allPokemonResult = await allPokemonResponse.json();
  const allPokemon = allPokemonResult.results;
  const allLetters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
  return {
    // `permalink` defines the URL structure for your collection. 
    // Multiple URL params can be provided in the `routes()` function.
    permalink: `/pokemon/:letter`,
    // `routes` tells Astro which routes to generate in your collection.
    // Provide an array of params, matching the `permalink` above.
    // Here, we create a route for each letter (ex: "a" -> {letter: "a"}).
    routes: allLetters.map(letter => {
      return {letter};
    }),
    // `props` returns the data needed on each page.
    // If you needed to fetch more data for each page, you can do that here as well.
    // Luckily, we loaded all of the data that we need at the top of the function, 
    // so we use this function to pass the data to each page via the `items` prop.
    async props({ params }) {
      return {items: allPokemon.filter((pokemon) => pokemon.name[0] === params.letter)};
    },
  };
}
// On every generated page, "params.letter" will be the page letter (a, b, etc.) and
// "items" will be the array of all pokemon that match that letter.
const {params} = Astro.request;
const {items} = Astro.props;
---
<html lang="en">
  <head>
    <title>Pokemon: {params.letter}</head>
  <body>
    {items.map((pokemon) => (<h1>{pokemon.name}</h1>))}
  </body>
</html>
```

## Example: Individual Pages from Remote Data

```jsx
---
// Define a `createPages` function.
// In this example, we'll create a new page for every single pokemon.
export async function createPages() {
  const allPokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=150`);
  const allPokemonResult = await allPokemonResponse.json();
  const allPokemon = allPokemonResult.result;
  return {
    // `permalink` defines the URL structure for your collection. 
    // Multiple URL params can be provided in the `routes()` function.
    permalink: `/pokemon/:name`,
    // `routes` tells Astro which routes to generate in your collection.
    // Provide an array of params, matching the `permalink` above.
    // Here, we create a route for each pokemon (ex: "pikachu" -> {name: "pikachu"}).
    routes: allPokemon.map((pokemon, i) => {
      return {name: pokemon.name, index: i};
    }),
    // `props` returns the data needed on each page.
    // If you needed to fetch more data for each page, you can do that here as well.
    // Luckily, we loaded all of the data that we need at the top of the function, 
    // so we use this function to pass the data to each page via the `items` prop.
    async props({ params }) {
      return {item: allPokemon[params.index]};
    },
  };
}
// For each page, "item" is the pokemon for that page.
const {item} = Astro.props;
---
<html lang="en">
  <head>
    <title>Pokemon: {item.name}</head>
  <body>
    Who's that pokemon? It's {item.name}!
  </body>
</html>
```


## Example: Simple Pagination

```jsx
---
// Define a `createPages` function.
export async function createPages() {
  return {
    // Because you are just doing simple pagination, its fine to return the 
    // full set of posts for the collection data. If no permalink is provided,
    // Astro will default to use the current filename.
    paginate: true,
    async props({paginate}) { 
      const allPosts = Astro.fetchContent('../posts/*.md'); // fetch local posts.
      allPosts.sort((a, b) => a.title.localeCompare(b.title)); // sort by title.
      return {
        // pageSize default: 25
        posts: paginate(allPosts, {pageSize: 10}),
      }; 
    },
  };
}
// Now, you can get the paginated posts from your props.
const {posts} = Astro.props;
---
<html lang="en">
  <head>
    <title>Pagination Example: Page Number {posts.page.current}</title>
  </head>
  <body>
    {posts.data.map((post) => (
      <h1>{post.title}</h1>
      <time>{formatDate(post.published_at)}</time>
      <a href={post.url}>Read Post</a>
    ))}
  </body>
</html>
```

## Example: Pagination Metadata

```jsx
---
// In addition to data, your paginated prop also includes important metadata
// for the collection, such as: `collection.page` and `collection.url`.
// In this example, we'll use these values to add pagination UI controls.
export async function createPages() { /* See Previous Example */ }
const {posts} = Astro.props;
---
<html lang="en">
  <head>
    <title>Pagination Example: Page Number {posts.page.current}</title>
    <link rel="canonical" href={posts.url.current} />
    <link rel="prev" href={posts.url.prev} />
    <link rel="next" href={posts.url.next} />
  </head>
  <body>
    <main>
      <h5>Results {posts.page.start + 1}–{posts.page.end + 1} of {posts.page.total}</h5>
    </main>
    <footer>
      <h4>Page {posts.page.current} / {posts.page.last}</h4>
      <nav class="nav">
        <a class="prev" href={posts.url.prev || '#'}>Prev</a>
        <a class="next" href={posts.url.next || '#'}>Next</a>
      </nav>
    </footer>
  </body>
</html>
```

### 📚 Further Reading

- [Fetching data in Astro][docs-data]
- API Reference: [createPages()][create-collection-api]
- API Reference: [Creating an RSS feed][create-collection-api]

[docs-data]: ../README.md#-fetching-data
[create-collection-api]: ./api.md#createcollection
[example-blog]: ../examples/blog
[fetch-content]: ./api.md#fetchcontent

