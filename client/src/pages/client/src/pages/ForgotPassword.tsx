import React, { useState } from "react";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Chama API para enviar email de reset
    const res = await fetch("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
    setMsg("Se o e-mail existir, você receberá um link para resetar a senha.");
  }
  return (
    <form onSubmit={handleSubmit}>
      <h2>Esqueci minha senha</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Seu e-mail" />
      <button type="submit">Enviar</button>
      {msg && <div>{msg}</div>}
    </form>
  );
}