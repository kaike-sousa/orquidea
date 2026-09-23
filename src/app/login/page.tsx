    "use client"

    import { FormEvent, useState } from "react"
    import { useRouter } from "next/navigation"
    import Link from "next/link"
    import { createClient } from "@/lib/supabase/client"

    export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        setError("")
        setSuccess("")
        setLoading(true)

        const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
        })

        if (error) {
        setError("E-mail ou senha incorretos.")
        setLoading(false)
        return
        }

        if (!data.user) {
        setError("Não foi possível realizar o login.")
        setLoading(false)
        return
        }

        const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

        if (profile?.role === "admin") {
        router.push("/admin")
        } else {
        router.push("/")
        }

        router.refresh()
    }

    async function handleForgotPassword() {
        if (!email.trim()) {
        setError("Digite seu e-mail para recuperar a senha.")
        return
        }

        setError("")
        setSuccess("")
        setLoading(true)

        const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
            redirectTo: `${window.location.origin}/redefinir-senha`,
        }
        )

        if (error) {
        setError(
            "Não foi possível enviar o e-mail de recuperação. Tente novamente."
        )
        } else {
        setSuccess(
            "Enviamos um link para redefinir sua senha. Verifique seu e-mail."
        )
        }

        setLoading(false)
    }

    return (
        <main className="login-page">
        <section className="login-container">
            <div className="login-brand">
            <Link href="/" className="login-logo">
                ORQUÍDEA ESSENCE
            </Link>

            <p className="login-subtitle">
                Bem-vindo de volta
            </p>
            </div>

            <div className="login-card">
            <div className="login-header">
                <h1>Entrar</h1>
                <p>
                Acesse sua conta para continuar.
                </p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                <label htmlFor="email">E-mail</label>

                <input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                />
                </div>

                <div className="form-group">
                <div className="password-label">
                    <label htmlFor="password">Senha</label>

                    <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="forgot-password"
                    disabled={loading}
                    >
                    Esqueci minha senha
                    </button>
                </div>

                <div className="password-input">
                    <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                    />

                    <button
                    type="button"
                    className="show-password"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                        showPassword
                        ? "Ocultar senha"
                        : "Mostrar senha"
                    }
                    >
                    {showPassword ? "Ocultar" : "Mostrar"}
                    </button>
                </div>
                </div>

                {error && (
                <div className="login-message login-error">
                    {error}
                </div>
                )}

                {success && (
                <div className="login-message login-success">
                    {success}
                </div>
                )}

                <button
                type="submit"
                className="login-submit"
                disabled={loading}
                >
                {loading ? "Entrando..." : "Entrar"}
                </button>
            </form>

            <div className="login-divider">
                <span>ou</span>
            </div>

            <div className="login-register">
                <p>
                Ainda não possui uma conta?
                </p>

                <Link href="/cadastro">
                Criar minha conta
                </Link>
            </div>
            </div>

            <Link href="/" className="back-home">
            ← Voltar para a loja
            </Link>
        </section>
        </main>
    )
    }