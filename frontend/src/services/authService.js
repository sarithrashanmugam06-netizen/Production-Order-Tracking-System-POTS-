import api from "./api";

// Checks the credentials on the server. Throws on failure (wrong password,
// inactive account, too many attempts...); use getErrorMessage(error) to show why.
export async function loginUser(email, password) {
  const { data } = await api.post("/auth/login", { email, password });

  return { user: data.user, token: data.access_token };
}
