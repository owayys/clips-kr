import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientId = process.env.APPLICATION_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_TOKEN;

// console.log(typeof (clientId), typeof (guildId), typeof (process.env.APPLICATION_ID))
const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

const importPromises = [];

for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        console.log(`Importing file:///${filePath}`);
        const importPromise = import('file:///' + filePath)
            .then((module) => {
                const command = module.default || module; // Use module.default if present
                if ('data' in command && 'execute' in command) {
                    return command.data.toJSON();
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                    return null;
                }
            })
            .catch((error) => {
                console.error(`Error importing ${filePath}:`, error);
                return null;
            });

        importPromises.push(importPromise);
    }
}

// Construct and prepare an instance of the REST module
// const rest = new REST().setToken(token);

// and deploy your commands!

Promise.all(importPromises)
    .then((commandDataArray) => {
        const validCommands = commandDataArray.filter((data) => data !== null);

        const rest = new REST().setToken(token);

        (async () => {
            try {
                console.log(`Started refreshing ${validCommands.length} application (/) commands.`);
                console.log(validCommands);

                const data = await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    { body: validCommands },
                );

                console.log(`Successfully reloaded ${data.length} application (/) commands.`);
            } catch (error) {
                console.error(error);
            }
        })();
    });

// (async () => {
//     try {
//         console.log(`Started refreshing ${commands.length} application (/) commands.`);
//         console.log(commands)

//         // The put method is used to fully refresh all commands in the guild with the current set
//         const data = await rest.put(
//             Routes.applicationGuildCommands(clientId, guildId),
//             { body: commands },
//         );

//         console.log(`Successfully reloaded ${data.length} application (/) commands.`);
//     } catch (error) {
//         // And of course, make sure you catch and log any errors!
//         console.error(error);
//     }
// })();