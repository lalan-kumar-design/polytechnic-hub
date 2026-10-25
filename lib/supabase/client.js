import { createBrowserClient } from "@supabase/ssr";

const mockAuth = {
  signInWithPassword: async ({ email, password }) => {
    if (!email || !password) {
      return { error: { message: "Email and password are required" }, data: null };
    }
    return {
      error: null,
      data: {
        user: { email, id: "mock-user-id" },
        session: { access_token: "mock-token", user: { email, id: "mock-user-id" } },
      },
    };
  },
  signUp: async ({ email, password, options }) => {
    if (!email || !password) {
      return { error: { message: "Email and password are required" }, data: null };
    }
    return {
      error: null,
      data: {
        user: { email, id: "mock-user-id", user_metadata: options?.data },
        session: null,
      },
    };
  },
  signOut: async () => ({ error: null }),
  getUser: async () => ({ data: { user: null }, error: null }),
  getSession: async () => ({ data: { session: null }, error: null }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
};

const mockClient = {
  auth: mockAuth,
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
  }),
};

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key || !url.startsWith("http")) {
    return mockClient;
  }

  try {
    return createBrowserClient(url, key);
  } catch (err) {
    console.warn("Supabase initialization failed, falling back to mock client", err);
    return mockClient;
  }
}
