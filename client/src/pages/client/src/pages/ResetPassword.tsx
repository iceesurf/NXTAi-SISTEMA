import React, { useState } from "react";
export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = new URLSearchParams(window.location.search).get("token");
    // Chama API para salvar nova senha
    await fetch("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword: password }) });
    setMsg("Senha alterada com sucesso!");
  }
  return (
    <form onSubmit={handleSubmit}>
      <h2>Nova senha</h2>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Nova senha" />
      <button type="submit">Salvar</button>
      {msg && <div>{msg}</div>}
    </form>
  );
}