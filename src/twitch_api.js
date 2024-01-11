import axios from "axios";

export class TwitchAPI {
    constructor() {
        this.headers = null;
    }

    async auth(client_id, client_secret) {
        const data = {
            client_id: client_id,
            client_secret: client_secret,
            grant_type: 'client_credentials',
        };

        await axios.post('https://id.twitch.tv/oauth2/token', data)
            .then((response) => {
                const bearer = response.data.access_token;
                this.headers = {
                    'Authorization': `Bearer ${bearer}`,
                    'Client-Id': client_id,
                };
            })
            .catch((error) => {
                console.log(error);
            });

    }
}

// class TwitchAPI():

//     def __init__(self):
// self.headers = None

//     def auth(self, client_id, client_secret):
// headers = {
//     'Content-Type': 'application/x-www-form-urlencoded',
// }

// data = f'client_id={client_id}&client_secret={client_secret}&grant_type=client_credentials'

// try:
// response = requests.post(
//     'https://id.twitch.tv/oauth2/token', headers = headers, data = data)
// response.raise_for_status()
//         except requests.exceptions.HTTPError as err:
//             raise SystemExit(err)
//         except requests.exceptions.RequestException as err:
//             raise SystemExit(err)

// bearer = response.json()['access_token']

// self.headers = {
//     'Authorization': f'Bearer {bearer}',
//     'Client-Id': client_id,
// }