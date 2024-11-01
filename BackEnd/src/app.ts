import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Client, NoAuth } from 'whatsapp-web.js';
import fs from 'fs';
const qrcode = require('qrcode-terminal') as any;

const app: Express = express();
const port = process.env.PORT || 3000; // Usa a porta do ambiente se disponível

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const client = new Client({
    authStrategy: new NoAuth()
});

client.on('qr', (qr: string) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async message => {
    if (message.hasMedia) {
        try {
            const media = await message.downloadMedia();
            if (media.mimetype.startsWith('audio/')) {
                const filename = `audio-${message.id.id}.mp3`;
                const filePath = `./audios/${filename}`;
                fs.writeFileSync(filePath, media.data, 'base64');
                console.log(`Audio saved: ${filename}`);
            }
        } catch (err) {
            console.error('Error handling media message:', err);
        }
    }
});

client.initialize();

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Garante que o diretório de áudios exista
const audiosDir = './audios';
if (!fs.existsSync(audiosDir)) {
    fs.mkdirSync(audiosDir);
}
