import { data } from "react-router";
import type { Route } from "./+types/auth.register";
import { registerSchema, type RegisterFormData } from "~/lib/validation";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { getSession } = await import("~/lib/session.server");
  const session = await getSession(request);

  if (session.has("userId")) {
    // Redirect to home if already logged in
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  }

  return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return null;
  }

  const formData = await request.formData();
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  try {
    // Validate input
    const validatedData: RegisterFormData = await registerSchema.validate(
      { username, email, password, confirmPassword },
      { abortEarly: true }
    );

    
    const newUserId = `user-${Date.now()}`;

    const { createUserSession } = await import("~/lib/session.server");

    return await createUserSession(
      newUserId,
      validatedData.email,
      validatedData.username,
      "/"
    );
  } catch (error: any) {
    return data(
      { error: error.message || "Error during registration" },
      { status: 400 }
    );
  }
};

export default function RegisterPage({ actionData }: Route.ComponentProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Register</h1>

        {actionData?.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {actionData.error}
          </div>
        )}

        <form method="POST" className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
