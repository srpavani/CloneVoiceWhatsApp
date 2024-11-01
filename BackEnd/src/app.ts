import express from 'express';
import bodyParser from 'body-parser';
import { Client, NoAuth } from 'whatsapp-web.js';
import fs from 'fs';


const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const client = new Client({
    authStrategy: new NoAuth()
});


client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async message => {
    if (message.hasMedia) {
        const media = await message.downloadMedia();
        if (media.mimetype.startsWith('audio/')) {
            const filename = `audio-${message.id.id}.mp3`;
            fs.writeFile(`./audios/${filename}`, media.data, 'base64', (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log(`Audio saved: ${filename}`);
            });
        }
    }
});

client.initialize();

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
