const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

const app = express();
const port = process.env.PORT || '3500';

app.use(express.json({ limit: '25mb' }));


app.get('/', (req, res) => {
    res.send('Meow');
})
app.post('/', (req, res) => {
    try {
        const image = req.body.image;
        const convertTo = req.body.convertTo;
        const size = req.body.size;

        if (image == null) res.send('Please provide an image');
        if (convertTo == null) res.send('Please provide an output');

        const data = image.replace(/^data:image\/\w+;base64,/, '');
        const date = new Date().toISOString();
        fs.writeFileSync(`./tmp/${date}`, data, { encoding: 'base64' });
        if (!!size) {
            ffmpeg()
                .input(`./tmp/${date}`)
                .size(size)
                .toFormat(convertTo)
                .save(`./tmp/${date}.${convertTo}`)
                .on('end', () => {
                    res.json({ resBuffer: fs.readFileSync(`./tmp/${date}.${convertTo}`).toString('base64') });
                    fs.unlinkSync(`./tmp/${date}`);
                    fs.unlinkSync(`./tmp/${date}.${convertTo}`)
                })
        } else {
            ffmpeg()
                .input(`./tmp/${date}`)
                .toFormat(convertTo)
                .save(`./tmp/${date}.${convertTo}`)
                .on('end', () => {
                    res.json({ resBuffer: fs.readFileSync(`./tmp/${date}.${convertTo}`).toString('base64') });
                    fs.unlinkSync(`./tmp/${date}`);
                    fs.unlinkSync(`./tmp/${date}.${convertTo}`)
                })
        }

    } catch (error) {
        console.log(error);
        res.send(new Error(error));
    }
})

app.listen(port, () => console.log(`Listening to port ${port}`));