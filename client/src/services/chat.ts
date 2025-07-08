import { db } from "../firebase";
import { ref, push, onChildAdded } from "firebase/database";

const CHAT_ROOM = "leads_chatroom";

export function sendMessage(text, sender = "lead") {
  return push(ref(db, CHAT_ROOM), { text, sender, timestamp: Date.now() });
}

export function onMessage(callback) {
  return onChildAdded(ref(db, CHAT_ROOM), snap => callback(snap.val()));
}
