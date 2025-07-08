import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import ChatWidget from "../components/ChatWidget";
import FlowEditor from "../components/FlowEditor";

export default function Home() {
  const loginGoogle = () => signInWithPopup(auth, provider).then(() => window.location.href="/painel");
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center">
      <header className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white text-center">
        <h1 className="text-4xl font-bold">🚀 NXT.ai – Automação e CRM Inteligente</h1>
        <p className="mt-2 max-w-2xl mx-auto">Transforme sua empresa com automação, chat ao vivo, CRM e muito mais.</p>
        <button onClick={loginGoogle} className="mt-4 bg-white text-purple-700 px-6 py-3 rounded shadow">Entrar com Google</button>
        <p className="text-sm mt-2">Não tem conta? Será criada automaticamente.</p>
      </header>
      <main className="p-6 max-w-6xl w-full space-y-16">
        <section><h2 className="text-2xl font-bold mb-4 text-center">O que você ganha:</h2><ul className="grid grid-cols-1 md:grid-cols-3 gap-6"><li>✅ Fluxos automatizados</li><li>✅ Chat ao vivo</li><li>✅ CRM e campanhas</li><li>✅ Agendamento social</li><li>✅ Integrações (WhatsApp, IG...)</li><li>✅ White-label</li></ul></section>
        <section className="bg-gray-100 p-6 rounded"><h3 className="text-xl font-bold mb-4 text-center">Depoimentos</h3><blockquote className="text-sm text-gray-600">“Automatizamos 60% do atendimento.” — João / LojaTrend</blockquote><blockquote className="text-sm text-gray-600">“2x mais leads com inteligência.” — Ana / Clínica Vitta</blockquote></section>
        <section className="text-center"><h3 className="text-xl font-bold mb-2">Quer sua versão com marca própria?</h3><p>Ativamos sua versão white-label com branding completo.</p><a href="mailto:samuel@dnxtai.com" className="text-indigo-600">→ Falar com o time comercial</a></section>
      </main>
      <footer className="p-6 text-center text-gray-500 text-sm">© 2025 NXT.ai. <a href="/painel" className="underline">Acessar painel</a></footer>
      <ChatWidget />
    </div>
  );
}
