import { data, redirect } from "react-router";
import type { Route } from "./+types/auth.login";
import { loginSchema, type LoginFormData } from "~/lib/validation";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { getSession } = await import("~/lib/session.server");
  const session = await getSession(request);

  if (session.has("userId")) {
    throw redirect("/");
  }

  return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return null;
  }

  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // Validate input
    const validatedData: LoginFormData = await loginSchema.validate(
      { email, password },
      { abortEarly: true }
    );


    const dummyUserId = "user-1";
    const dummyUsername = email.split("@")[0];

    const { createUserSession } = await import("~/lib/session.server");

    return await createUserSession(
      dummyUserId,
      validatedData.email,
      dummyUsername,
      "/"
    );
  } catch (error: any) {
    return data(
      { error: error.message || "Invalid email or password" },
      { status: 400 }
    );
  }
};

export default function LoginPage({ actionData }: Route.ComponentProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>

        {actionData?.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {actionData.error}
          </div>
        )}

        <form method="POST" className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <a href="/auth/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
