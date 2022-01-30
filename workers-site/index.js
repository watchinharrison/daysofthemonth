const query = `{
  viewer {
    repository(name: "daysofthemonth") {
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
  const cacheKey = 'DOFM';
  let data = await DAYSOFTHEMONTH.get(cacheKey, { type: "json" });
  if (data === null) {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + GITHUB_TOKEN,
        'User-Agent': 'request'
      },
      body: JSON.stringify({
        query,
        variables: {}
      }),
    });
    data = await response.json();
    await DAYSOFTHEMONTH.put(cacheKey, JSON.stringify(data), { expirationTtl: 3600 });
  }

  const table = `
    <html>
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
        <title>daysofthemonth</title>
      </head>
      <body>
        <table>
          <tr>
            <th>Title</th>
            <th>Up Votes</th>
            <th>Down Votes</th>
          </tr>
          ${data.data.viewer.repository.pullRequests.nodes.map(pr => `
            <tr>
              <td>${pr.title}</td>
              <td>${pr.reactionGroups.find(rg => rg.content === 'THUMBS_UP').reactors.totalCount}</td>
              <td>${pr.reactionGroups.find(rg => rg.content === 'THUMBS_DOWN').reactors.totalCount}</td>
            </tr>
          `).join('')}
        </table>        
      </body>
    </html>
  `;
  return new Response(table, {
    headers: { 'content-type': 'text/html' },
  })
}
