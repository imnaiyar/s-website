import express, { Request, Response, NextFunction } from "express";
import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import config from "./config";
import { WebhookClient, EmbedBuilder, REST, Routes } from "discord.js";
const api = new REST().setToken(process.env.TOKEN!);
const app = express();
import bodyParser from "body-parser";
const webhookLogger = process.env.CONTACT_US
    ? new WebhookClient({ url: process.env.CONTACT_US })
    : undefined;
const dir = path.join(__dirname, "views");
const files = fs.readdirSync(dir);
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (token === process.env.AUTH_TOKEN) {
        next();
    } else {
        res.status(401).send("Unauthorized: Invalid Authorization Token");
    }
};
app.use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .engine("html", require("ejs").renderFile) // Set the engine to html (for ejs template)
    .set("views", path.join(__dirname, "views"))
    .set("view engine", "ejs")
    .use("/", express.static(path.join(__dirname, "views")))

    // getting bot stats from database
    .use(async (_req, res, next) => {
        try {
            const response = await fetch("http://localhost:8080/stats");
            let stats = null;
            if (response.ok) stats = await response.json();
            res.locals.stats = stats
                ? stats
                : {
                      totalServers: 1,
                      totalMembers: 1,
                      commands: 1
                  };
            next();
        } catch (err) {
            console.error(err);
            res.locals.stats = null;
            next();
        }
    })
    // loading file names for dynamic header rules
    .use((req, res, next) => {
        res.locals.filename = req.originalUrl;
        res.locals.authToken = process.env.AUTH_TOKEN;
        next();
    })
    .get("/", (_req, res) => {
        res.render("index");
    })
    .get("/commands", async (_req, res) => {
        const commands = await api.get(
            Routes.applicationCommands(config.CLIENT_ID)
        );
        res.locals.commands = commands;
        res.render("commands");
    })
    .get("/vote", (_req, res) => {
        res.redirect("https://top.gg/bot/1121541967730450574/vote");
    })
    .get("/invite", (_req, res) => {
        res.redirect(
            "https://discord.com/api/oauth2/authorize?client_id=1121541967730450574&permissions=412854114496&scope=bot+applications.commands"
        );
    });
// creating a route for every files in 'views' dir
files.forEach(file => {
    const fileName = path.parse(file).name;
    app.get(`/${fileName}`, (_req, res) => {
        res.render(file);
    });
});
// handling 'contact-us' form
app.post("/submit", authenticateToken, async (req, res) => {
    const { name, email, message, discordUsername, reason } = req.body;
    try {
        const embed = new EmbedBuilder()
            .setColor("Green")
            .setAuthor({
                name: name || "Not Provided"
            })
            .addFields(
                { name: "Email", value: email || "Not Provided" },
                {
                    name: "Username",
                    value: discordUsername || "Not Provided"
                },
                { name: "Reason", value: reason || "Not Provided" },
                { name: "Message", value: message }
            );

        if (webhookLogger) {
            webhookLogger
                .send({
                    username: "Contact Us Logs",
                    embeds: [embed]
                })
                .catch(() => {});
        }

        res.status(200).send("Submission successful");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
})
    .use((_req, res) => {
        res.status(404).render("404");
    })
    .use((err: any, _req: Request, res: Response, _next: any) => {
        console.error(err.stack);
        res.status(500).render("500");
    })
    .listen(config.PORT, () => {
        console.log(`Server started running on port ${config.PORT}`);
    });
