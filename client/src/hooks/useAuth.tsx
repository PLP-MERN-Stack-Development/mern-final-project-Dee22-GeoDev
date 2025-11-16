import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: "talent" | "recruiter"
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Axios defaults
axios.defaults.withCredentials = true; // For HttpOnly cookie JWT
axios.defaults.baseURL = "http://localhost:4000"; // ✔ YOUR EXPRESS SERVER

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load logged-in user on refresh
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        setUser(res.data.user);
      } catch {
        setUser(null);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });

      setUser(res.data.user);
      toast.success("Welcome back!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: "talent" | "recruiter"
  ) => {
    try {
      const res = await axios.post("/api/auth/register", {
        email,
        password,
        fullName,
        role,
      });

      toast.success("Account created!");

      if (res.data.user) setUser(res.data.user);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  const signOut = async () => {
    try {
      await axios.post("/api/auth/logout");
      setUser(null);
      toast.success("Logged out");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
