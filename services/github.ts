export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  company: string | null;
}

export async function getAuthenticatedUser(token: string): Promise<GitHubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      authorization: `token ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  return await response.json();
}
