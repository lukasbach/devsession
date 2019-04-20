export const restMessage = async (path: string, method: "GET" | "POST", data: any) => {
  const query = method === "GET" && data ? "?" + Object.keys(data).map((key) => `${key}=${data[key]}`).join("&") : "";
  const host = (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("backend")) || `${window.location.protocol}//${window.location.host}`;
  const target = `${host}${path}${query}`;

  const result = await fetch(target, {
    method,
    body: method === "POST" && data ? data : undefined
  });

  if (result.ok) {
    return await result.json();
  } else {
    const err = await result.json();
    console.error(`Error during REST call to ${target}, error is: ${JSON.stringify(err)}`);
    throw Error(err);
  }
};
