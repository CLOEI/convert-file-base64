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
        const { image, convertTo, size, filters } = req.body;

        if (image == null) res.status('400').send('image parameter not provided.');
        if (convertTo == null) res.status('400').send('convertTo parameter not provided');

        const data = image.replace(/^data:image\/\w+;base64,/, '');
        const fileName = new Date().toISOString();
        fs.writeFileSync(`./tmp/${fileName}`, data, { encoding: 'base64' });

        ffmpeg()
            .input(`./tmp/${fileName}`)
            .size(size || '100%')
            .videoFilter(filters || [])
            .toFormat(convertTo)
            .save(`./tmp/${fileName}.${convertTo}`)
            .on('end', () => {
                res.json({ resBuffer: fs.readFileSync(`./tmp/${fileName}.${convertTo}`).toString('base64') });
                console.log(resBuffer: fs.readFileSync(`./tmp/${fileName}.${convertTo}`).toString('base64'));
                fs.unlinkSync(`./tmp/${fileName}`);
                fs.unlinkSync(`./tmp/${fileName}.${convertTo}`)
            })

    } catch (error) {
        console.log(error);
        res.send(new Error(error));
    }
})

app.listen(port, () => console.log(`Listening to port ${port}`));