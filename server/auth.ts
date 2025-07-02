import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "nxt-ai-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: false, // Permitir cookies em HTTP durante desenvolvimento
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "lax", // Permitir cookies cross-site em desenvolvimento
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "username" },
      async (username, password, done) => {
        try {
          console.log("🔍 Tentando autenticar:", username);
          
          // Tenta buscar por email primeiro, depois por username
          let user = await storage.getUserByEmail(username);
          if (!user) {
            user = await storage.getUserByUsername(username);
          }
          
          if (!user) {
            console.log("❌ Usuário não encontrado:", username);
            return done(null, false);
          }
          
          console.log("✅ Usuário encontrado:", user.email || user.username);
          
          const passwordMatch = await comparePasswords(password, user.password);
          
          if (!passwordMatch) {
            console.log("❌ Senha incorreta para:", username);
            return done(null, false);
          }
          
          console.log("✅ Autenticação bem-sucedida para:", username);
          return done(null, user);
        } catch (error) {
          console.error("❌ Erro na estratégia de autenticação:", error);
          return done(error);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName, tenantName } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já está em uso" });
      }

      // Create or find tenant
      let tenant;
      if (tenantName) {
        const slug = tenantName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const existingTenant = await storage.getTenantBySlug(slug);
        if (existingTenant) {
          return res.status(400).json({ message: "Nome da empresa já está em uso" });
        }
        tenant = await storage.createTenant({
          name: tenantName,
          slug,
        });
      } else {
        // Default tenant for demo users
        tenant = await storage.getTenantBySlug("nxt-ai-demo");
        if (!tenant) {
          tenant = await storage.createTenant({
            name: "NXT.ai Demo",
            slug: "nxt-ai-demo",
          });
        }
      }

      const user = await storage.createUser({
        email,
        username: email,
        password: await hashPassword(password),
        firstName,
        lastName,
        role: tenantName ? "admin" : "user",
        tenantId: tenant.id,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    // Suporte para login com email ou username no mesmo campo
    const identifier = req.body.email || req.body.username;
    console.log("🔐 Tentativa de login:", identifier);
    
    // Garantir que o passport receba o campo correto
    if (req.body.email && !req.body.username) {
      req.body.username = req.body.email;
    }
    
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("❌ Erro na autenticação:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("❌ Login falhou para:", identifier);
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("❌ Erro ao fazer login:", loginErr);
          return next(loginErr);
        }
        
        console.log("✅ Login bem-sucedido:", user.email || user.username);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
