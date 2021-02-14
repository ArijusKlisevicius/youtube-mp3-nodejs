
const express = require('express');
const bodyParser = require('body-parser');
//const { exec } = require('child_process');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


app.listen(3000, () => {
    console.log("Server is listening on port 3000")
})

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/song', (req, res) => {
    res.download(__dirname + "/songs/GREATRUDE.mp3")
})

app.post('/post', (req, res) => {
    var filePath;
    console.log(req.body.ytUrl);
    var path = __dirname + "/songs/%(title)s.%(ext)s";
    res.setHeader("Content-Type", "text/html");

    //const ls1 = spawn("youtube-dl --extract-audio --audio-format mp3 https://www.youtube.com/watch?v=L8PSn-NNdpI&ab_channel=gzertra");
    const ls = spawn("youtube-dl", ["-o", path, "--extract-audio", "--audio-format", "mp3", req.body.ytUrl]);
    ls.stdout.on("data", data => {
        if (data.includes("[ffmpeg] Destination")) {
            var stringData = data.toString();
            var pathStart = stringData.lastIndexOf('\\') + 1;  
            var pathEnd = stringData.lastIndexOf('.mp3') + 4;
            filePath = stringData.substring(pathStart, pathEnd);
            console.log(`pathStart: ${pathStart} pathEnd: ${pathEnd} stringData.length: ${stringData.length} filePath: ${filePath}`);
        }


        var re = /\d{1,3}\.\d{1,2}%/g;
        let array1;
        while ((array1 = re.exec(data)) !== null) {
            res.write(`${array1[0]}`)
        }

    });

    ls.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });

    ls.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });

    ls.on("close", code => {
        console.log(`child process exited with code ${code}`);
        res.end(filePath);
    });
});

app.get('/download/', (req, res) => {
    res.download(__dirname + '/songs/' + req.query.fileAdress, () => {
        fs.unlink(__dirname + '/songs/' + req.query.fileAdress, () => {
        })
    })
    
})
