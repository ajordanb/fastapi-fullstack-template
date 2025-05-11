import { getAPIURL } from "@/api/apiUrl";
import type { TokenDecodedData } from "./model";

const apiUrl = getAPIURL()
console.log("API URL: ", apiUrl);

async function _formPostRequest(
  url: string,
  body: Record<string, any>
): Promise<unknown> {
  const formData = new URLSearchParams();
  for (const [key, value] of Object.entries(body)) {
    formData.append(key, value.toString());
  }
  
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  
  const response = await fetch(apiUrl + url, {
    method: "POST",
    headers,
    body: formData,
  });
  let data;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return null;
  }
  if (!response.ok) {
    const errorMessage = data.detail || data.message || data.error || "Network response was not ok";
    throw new Error(errorMessage);
  }
  
  return data;
}

async function _jsonPostRequest(
      url: string,
      body: Record<string, any>
    ): Promise<unknown> {
        const response = await fetch("" + url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    }

function decodeToken(token: string): TokenDecodedData{
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
};


async function _postRequest(
    url: string,
    body: Record<string, any>,
    token?: string | null,
    params?: Record<string, any>,
): Promise<Response> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    } 

    const req_url = params ? apiUrl + url + '?' + new URLSearchParams(params) : apiUrl + url;
    return fetch(req_url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });
}

export { _formPostRequest, _jsonPostRequest, decodeToken, _postRequest };



