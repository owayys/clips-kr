import { SlashCommandBuilder } from 'discord.js';
import { TwitchAPI } from '../../src/twitch_api.js';
import { ClipsGetter, ClipsDownloader } from '../../src/clips.js';
import dotenv from 'dotenv';
dotenv.config()

export default {
    data: new SlashCommandBuilder()
        .setName('clip')
        .setDescription('Gets the specified clip')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('Link to the clip')),
    async execute(interaction) {
        await interaction.reply("holup");

        const clipLink = interaction.options.getString('link');
        const clipId = clipLink.split('https://clips.twitch.tv/')[1]

        const api = new TwitchAPI();
        api.auth(process.env.CLIENT_ID, process.env.CLIENT_SECRET)
            .then(() => {
                const clipGetter = new ClipsGetter(api.headers);
                clipGetter.getClip(1, clipId)
                    .then(async (clip) => {
                        let index = clip.thumbnail_url.indexOf('-preview')
                        await interaction.editReply("here man -> " + clip.thumbnail_url.slice(0, index) + '.mp4');
                        // console.log(clipGetter.clips_content)
                        // const clipDownloader = new ClipsDownloader();
                        // clipDownloader.downloadClip(1, clip)
                        //     .then(async (result) => {
                        //         if (result) {
                        //             await interaction.editReply(clip.url);
                        //         }
                        //     })
                    })
            })

    },
};