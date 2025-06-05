import express, { Request, Response, NextFunction } from "express";
import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import config from "./config";
import { API, Routes, APIEmbed } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { parseWebhookURL } from "./utils/parseWebhookURL";
const rest = new REST().setToken(process.env.TOKEN!);
const api = new API(rest);
const webhook = parseWebhookURL(process.env.CONTACT_US!);
const app = express();

const dir = path.resolve() + "/views";
const files = fs.readdirSync(dir);

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (token === process.env.AUTH_TOKEN) {
        next();
    } else {
        res.status(401).send("Unauthorized: Invalid Authorization Token");
    }
};
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Other Middleware and Route Definitions
app.engine("html", require("ejs").renderFile)
    .set("views", path.resolve() + "/views")
    .set("view engine", "ejs")
    .use("/", express.static(path.resolve() + "/views"));

// Middleware for dynamic header rules
app.use((req, res, next) => {
    res.locals.filename = req.originalUrl;
    res.locals.authToken = process.env.AUTH_TOKEN;
    next();
});

// Routes
app.get("/", async (_req, res) => {
    try {
        const response = await fetch(config.API_ENDPOINT + "/stats").catch(
            () => null
        );
        let stats = null;
        if (response && response.ok) stats = await response.json();
        res.locals.stats = stats
            ? stats
            : { totalServers: 1, totalMembers: 1, commands: 1, totalUserInstalls: 1};
    } catch (err) {
        console.error(err);
        res.locals.stats = null;
    }
    res.render("index");
});

app.get("/commands", async (_req, res) => {
    const commands = await api.rest.get(
        Routes.applicationCommands(config.CLIENT_ID)
    );
    res.locals.commands = commands;
    res.render("commands");
});

app.get("/vote", (_req, res) => {
    res.redirect("https://top.gg/bot/1121541967730450574/vote");
});

app.get("/invite", (_req, res) => {
    res.redirect(
        "https://discord.com/oauth2/authorize?client_id=1121541967730450574"
    );
});

// Create a route for every file in the 'views' dir
files.forEach(file => {
    const fileName = path.parse(file).name;
    app.get(`/${fileName}`, (_req, res) => {
        res.render(file);
    });
});

// Handling 'contact-us' form submission
app.post("/submit", authenticateToken, async (req, res) => {
    const body = req.body;

    const { name, email, message, discordUsername, reason } = body;

    try {
        const embed: APIEmbed = {
            color: 5763719,
            author: { name: name, url: undefined, icon_url: undefined },
            fields: [
                { name: "Email", value: email || "Not Provided" },
                { name: "Username", value: discordUsername || "Not Provided" },
                { name: "Reason", value: reason || "Not Provided" },
                { name: "Message", value: message }
            ]
        };

        if (webhook) {
            await api.webhooks.execute(webhook.id, webhook.token, {
                username: "Contact Us Logs",
                embeds: [embed]
            });
        }

        res.status(200).send("Submission successful");
    } catch (err) {
        console.error("Error handling submission:", err);
        res.status(500).send("Server Error");
    }
});

// 404 and 500 Error Handling
app.use((_req, res) => {
    res.status(404).render("404");
});

app.use((err: any, _req: Request, res: Response, _next: any) => {
    res.locals.filename = _req.originalUrl;
    console.error(err);
    res.status(500).render("500");
});

module.exports = app;