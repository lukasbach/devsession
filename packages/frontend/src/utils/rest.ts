export const restMessage = async (path: string, method: 'GET' | 'POST', data: any) => {
  const query = method === 'GET' && data ? '?' + Object.keys(data).map(key => `${key}=${data[key]}`).join('&') : '';
  const target = `http://localhost:4000${path}${query}`;

  const result = await fetch(target, {
    method,
    body: method === "POST" && data ? data : undefined
  });

  if (result.ok) {
    return await result.json();
  } else {
    const err = await result.json();
    console.error(`Error during REST call to ${target}, error is: ${JSON.stringify(err)}`)
    throw Error(err);
  }
}