
const express = require('express');
const bodyParser = require('body-parser');
//const { exec } = require('child_process');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'songs')));


app.listen(3000, () => {
    console.log("Server is listening on port 3000")
})

app.get('/',  (req,res) => {
    res.render('index');
})

app.get('/song', (req, res) => {
    res.download(__dirname + "/songs/GREATRUDE.mp3")
})

app.post('/post', (req, res) => {
    console.log(req.body.ytUrl);
    var path = __dirname + "/songs/%(title)s.%(ext)s";

    //const ls1 = spawn("youtube-dl --extract-audio --audio-format mp3 https://www.youtube.com/watch?v=L8PSn-NNdpI&ab_channel=gzertra");
    const ls = spawn("youtube-dl", ["-o", path,"--extract-audio", "--audio-format", "mp3", req.body.ytUrl]);
    ls.stdout.pipe(res);
    
    ls.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });
    
    ls.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });
    
    ls.on("close", code => {
        console.log(`child process exited with code ${code}`);
    });
});

app.get('/download/', (req,res) => {
    console.log(req.query.fileAdress);
    console.log("KVIECIAM SITA");
    res.download(__dirname + '/songs/' + req.query.fileAdress, () => {
        fs.unlink(__dirname + '/songs/' + req.query.fileAdress, () => {
            console.log('unlinked bitch');
        })
    })
    // res.download(__dirname + '/songs/' + req.query.fileAdress);
})


app.get('/hui', (req,res) => {
    console.log("HUI");
})
