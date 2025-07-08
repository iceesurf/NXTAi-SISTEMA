import { useState } from "react";
import ChatWindow from "./ChatWindow";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div onClick={() => setOpen(!open)} className="fixed bottom-5 right-5 bg-blue-500 text-white p-3 rounded-full cursor-pointer">💬</div>
      {open && <ChatWindow onClose={() => setOpen(false)} />}
    </>
  );
}
