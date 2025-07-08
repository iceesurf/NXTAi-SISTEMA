import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";

export default {
  messages: pgTable("messages", {
    id: serial("id").primaryKey(),
    sender: varchar("sender", 256),
    text: text("text"),
    timestamp: timestamp("timestamp"),
  }),
};
