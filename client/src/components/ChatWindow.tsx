import { useEffect, useState } from "react";
import { sendMessage, onMessage } from "../services/chat";

export default function ChatWindow({ onClose }) {
  const [msgs, setMsgs] = useState([]);
  const [txt, setTxt] = useState("");
  useEffect(() => {
    const unsub = onMessage(m => setMsgs(prev => [...prev, m]));
    return () => unsub();
  }, []);
  return (
    <div className="fixed bottom-20 right-5 w-80 h-96 bg-white border rounded shadow flex flex-col z-50">
      <div className="flex justify-between p-2 border-b"><strong>Atendimento NXT.ai</strong><button onClick={onClose}>✖</button></div>
      <div className="flex-1 overflow-auto p-2">{msgs.map((m,i)=><div key={i}><strong>{m.sender}:</strong> {m.text}</div>)}</div>
      <div className="flex p-2 border-t"><input className="flex-1 border px-2" value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Digite..." /><button onClick={()=>{sendMessage(txt);setTxt("");}} className="ml-2 bg-blue-500 text-white px-4 rounded">Enviar</button></div>
    </div>
  );
}
