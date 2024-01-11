import axios from "axios";
import fs from "fs";

class ClipContent {
    constructor(url, broadcaster_id, broadcaster_name, game_id, title, thumbnail_url, duration, path) {
        this.url = url
        this.broadcaster_id = broadcaster_id
        this.broadcaster_name = broadcaster_name
        this.game_id = game_id
        this.title = title
        this.thumbnail_url = thumbnail_url
        this.duration = duration
        this.path = path
    }
}

export class ClipsGetter {
    constructor(headers) {
        this.headers = headers;
    }

    async getClip(request_id, clip_id = null) {
        const params = {
            'id': clip_id
        }

        try {
            const response = await axios.get('https://api.twitch.tv/helix/clips', {
                params: params,
                headers: this.headers
            });

            if (response.data.data.length === 0) {
                throw new Error('Clip not found');
            }

            const clip = response.data.data[0];

            let newClip = new ClipContent(
                clip['url'],
                clip['broadcaster_id'],
                clip['broadcaster_name'],
                clip['game_id'],
                clip['title'],
                clip['thumbnail_url'],
                clip['duration'],
                `clips/${request_id}/${clip["title"].replace(" ", "_").replace("/", "_").toLowerCase()}.mp4`
            );

            return newClip;
        } catch (error) {
            console.error(error);
        }
    }
}

export class ClipsDownloader {
    constructor() { }

    async downloadClip(request_id, clip) {
        let index = clip.thumbnail_url.indexOf('-preview')
        let clip_url = clip.thumbnail_url.slice(0, index) + '.mp4'

        try {
            axios.get(clip_url, { responseType: "stream" }).then((response) => {
                if (response.headers['content-type'] == 'binary/octet-stream') {
                    if (!fs.existsSync(`clips/${request_id}`)) {
                        fs.mkdirSync(`clips/${request_id}`, { recursive: true })
                    }
                    const writeStream = fs.createWriteStream(clip.path);
                    response.data.pipe(writeStream);
                    writeStream.on('finish', () => {
                        return true
                    });
                } else {
                    console.log(`Failed to download clip from url: ${clip_url}`)
                    return false
                }
            })
        } catch (error) {
            console.error(error);
        }

    }
}