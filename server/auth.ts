import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function setupAuth(app: Express) {
    const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: false,
        ttl: sessionTtl,
        tableName: "sessions",
    });

    app.set("trust proxy", 1);
    app.use(
        session({
            secret: process.env.SESSION_SECRET || "vizaiboost-secret",
            store: sessionStore,
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: sessionTtl,
            },
        })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    // Google Strategy
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        const email = profile.emails?.[0].value;
                        const userData = {
                            googleId: profile.id,
                            email: email,
                            firstName: profile.name?.givenName,
                            lastName: profile.name?.familyName,
                            profileImageUrl: profile.photos?.[0].value,
                            authProvider: "google",
                        };
                        const user = await storage.upsertUser(userData);
                        return done(null, user);
                    } catch (error) {
                        return done(error as Error);
                    }
                }
            )
        );
    }

    // Local Strategy (Email/Password)
    passport.use(
        new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
            try {
                const user = await storage.getUserByEmail(email);
                if (!user || !user.password) {
                    return done(null, false, { message: "Invalid email or password." });
                }
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false, { message: "Invalid email or password." });
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        })
    );

    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });

    // --- Auth Routes ---

    // Email Registration
    app.post("/api/auth/register", async (req, res, next) => {
        try {
            const { email, password, firstName, lastName } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required." });
            }

            const existingUser = await storage.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: "Check if you already have an account with this email." });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await storage.upsertUser({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                authProvider: "local",
            });

            req.login(user, (err) => {
                if (err) return next(err);
                res.status(201).json(user);
            });
        } catch (error) {
            next(error);
        }
    });

    // Email Login
    app.post("/api/auth/login", (req, res, next) => {
        passport.authenticate("local", (err: any, user: any, info: any) => {
            if (err) return next(err);
            if (!user) return res.status(401).json({ message: info?.message || "Login failed" });
            req.login(user, (err) => {
                if (err) return next(err);
                res.json(user);
            });
        })(req, res, next);
    });

    // Google Auth
    app.get(
        "/api/auth/google",
        async (req, res, next) => {
            if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
                // Mock Login for Dev
                const userData = {
                    googleId: "dev-google-id",
                    email: "dev-user@example.com",
                    firstName: "Development",
                    lastName: "User",
                    authProvider: "google",
                };
                const user = await storage.upsertUser(userData);
                return req.login(user, () => res.redirect("/dashboard"));
            }
            next();
        },
        passport.authenticate("google", { scope: ["profile", "email"] })
    );

    app.get(
        "/api/auth/google/callback",
        passport.authenticate("google", { failureRedirect: "/login" }),
        (req, res) => res.redirect("/dashboard")
    );

    app.get("/api/auth/user", (req, res) => {
        if (req.isAuthenticated()) {
            return res.json(req.user);
        }
        res.status(401).json({ message: "Not authenticated" });
    });

    app.get("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            res.redirect("/");
        });
    });

    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            res.json({ message: "Logged out" });
        });
    });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
    // Development Bypass
    if (!process.env.REPL_ID && !process.env.GOOGLE_CLIENT_ID) {
        return next();
    }

    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized" });
};

export const isAdmin: RequestHandler = (req: any, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ message: "Forbidden: Admins only" });
};
