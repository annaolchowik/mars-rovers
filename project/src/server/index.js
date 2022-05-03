require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

app.get('/showRover/:roverID', async (req, res) => {
    try {
        let rover = req.params.roverID;
        // fetch SOL setting
        let manifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.params.roverID}?api_key=${process.env.API_KEY}`)
            .then(res => res.json())

        let MAX_SOL =  manifest.photo_manifest.max_sol;

        let response = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.params.roverID}/photos?sol=${MAX_SOL}&api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ response })
    } catch (err) {
        console.error('error:', err);
    }
})

app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))