import express, { Express } from 'express';
import bodyParser from 'body-parser';
import { Client, NoAuth, Message } from 'whatsapp-web.js';
import fs from 'fs';
import path from 'path';

const qrcode = require('qrcode-terminal') as any;

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const client = new Client({
    authStrategy: new NoAuth()
});

client.on('qr', (qr: string) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client está pronto!');
});

client.on('message', async (message: Message) => {
    const contactId = message.from.replace(/[^0-9]/g, '');
    const contactDir = `./contacts/${contactId}`;

   
    if (!fs.existsSync(contactDir)) {
        fs.mkdirSync(contactDir, { recursive: true });
        fs.mkdirSync(`${contactDir}/audios`);
        fs.mkdirSync(`${contactDir}/images`);
        fs.mkdirSync(`${contactDir}/videos`);
    }

    const textFile = `${contactDir}/conversation.txt`;
    const textContent = `${new Date(message.timestamp * 1000).toLocaleString()}: ${message.body}\n`;
    fs.appendFileSync(textFile, textContent, { encoding: 'utf-8' });
    console.log(`Texto atualizado: ${textFile}`);

    
    if (message.hasMedia) {
        const media = await message.downloadMedia();
        let mediaPath = `${contactDir}/`;

        
        if (media.mimetype.startsWith('audio/')) {
            mediaPath += 'audios';
        } else if (media.mimetype.startsWith('image/')) {
            mediaPath += 'images';
        } else if (media.mimetype.startsWith('video/')) {
            mediaPath += 'videos';
        }

        const filename = `${mediaPath}/${message.timestamp}-${message.id.id}.${media.mimetype.split('/')[1]}`;
        fs.writeFileSync(filename, media.data, 'base64');
        console.log(`Mídia salva: ${filename}`);
    }
});

client.initialize();

app.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}`);
});
