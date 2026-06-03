import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Brain, Loader2, Eye, EyeOff } from "lucide-react";
import { login, register } from "@/lib/api";
import { useUserId, useUserName } from "@/lib/userStore";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
    head: () => ({ meta: [{ title: "Login — DocIntel AI" }] }),
    component: LoginPage,
});

function LoginPage() {
    const navigate = useNavigate();
    const [, setUserId] = useUserId();
    const [, setUserName] = useUserName();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = isLogin
                ? await login(form.email, form.password)
                : await register(form.name, form.email, form.password);

            const { token, userId, name } = res.data;

            // Store token and userId
            localStorage.setItem("token", token);
            setUserId(userId);
            setUserName(name);

            toast.success(`Welcome ${name}!`);
            navigate({ to: "/documents" });
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background">
            <div className="w-full max-w-md animate-fade-in-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 rounded-2xl bg-gradient-primary shadow-glow mb-4">
                        <Brain className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-display font-bold">DocIntel <span className="text-primary">AI</span></h1>
                    <p className="text-muted-foreground mt-2 text-sm">Your private AI document assistant</p>
                </div>

                {/* Card */}
                <div className="glass-strong rounded-2xl p-8 shadow-elegant">
                    {/* Toggle */}
                    <div className="flex glass rounded-xl p-1 mb-6">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${isLogin ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground"
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${!isLogin ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground"
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Your full name"
                                    className="mt-1.5 w-full bg-input/60 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="you@example.com"
                                className="mt-1.5 w-full bg-input/60 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</label>
                            <div className="relative mt-1.5">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full bg-input/60 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-primary text-primary-foreground py-3 rounded-xl font-medium shadow-glow hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isLogin ? "Sign In" : "Create Account"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}