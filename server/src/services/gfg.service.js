import { ApiError } from "../utils/api-error.js";

export async function fetchGfgRawData(handle) {
  const profileUrl = new URL("https://authapi.geeksforgeeks.org/api-get/user-profile-info/");
  profileUrl.search = new URLSearchParams({ handle, article_count: "false", redirect: "true" });
  const signal = AbortSignal.timeout(10000);

  const [profileResponse, submissionsResponse] = await Promise.all([
    fetch(profileUrl, { signal }),
    fetch("https://practiceapi.geeksforgeeks.org/api/v1/user/problems/submissions/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle }),
      signal,
    }),
  ]);

  if (profileResponse.status === 404) throw new ApiError(404, "GeeksforGeeks user not found");
  if (!profileResponse.ok || !submissionsResponse.ok) {
    throw new ApiError(502, "GeeksforGeeks could not provide profile data");
  }

  const [profile, submissions] = await Promise.all([
    profileResponse.json(),
    submissionsResponse.json(),
  ]);
  if (profile.message === "User not found!") throw new ApiError(404, "GeeksforGeeks user not found");
  if (!profile.data || submissions.status !== "success" || !submissions.result) {
    throw new ApiError(502, "GeeksforGeeks returned incomplete profile data");
  }

  return { handle, profile: profile.data, submissions: submissions.result };
}
