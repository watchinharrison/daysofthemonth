const query = `{
  query {
    viewer { 
      pullRequests (first: 100, orderBy: {field: COMMENTS, direction: DESC}) {
        nodes {
          title
          reactionGroups {
            content
            reactors {
              totalCount
            }
          }
        }
      }
    }
  }
}`;

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(req) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + GITHUB_TOKEN
    },
    body: JSON.stringify({
      query,
      variables: {}
    }),
  });
  // const data = await response.json();
  console.log(response);
  return new Response('Hello worker!', {
    headers: { 'content-type': 'text/plain' },
  })
}
