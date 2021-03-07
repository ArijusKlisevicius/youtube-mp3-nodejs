$('#whole').hide();
var fileAddress;

const checkUrl = (url) => {
    var re = /^http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;
    return re.test(url);
}
$('#downloadNext').click(() => {
    $('#downloadBar>div').css("width", 0);
    fileAddress = '';
    $('#submitBtn').prop('disabled', false);
    $('#ytUrl').val('');
    $('#downloadBar>div').css("background-color", 'orange');
    $('#ytUrl').css("border-color", 'black');
    $('#submitBtn').prop('disabled', true);
    $('#submitBtn').css('background-color', '');
    $('#downloadNext').prop('disabled', true);
})

$('#saveSong').click(() => {
    $.ajax({
        url: '/save',
        data: { 'address': fileAddress },
        type: 'POST',
        dataType: 'text',
    })
        .done(() => {
            console.log("Done");
        })
    songs.push(fileAddress);
    var div = document.createElement('div');
    div.setAttribute('class', 'song');
    div.style.borderStyle = 'solid';
    var btn = document.createElement('button');
    btn.setAttribute('id', songs.length - 1);
    btn.textContent = 'Play';
    btn.setAttribute('class', 'playBtn');
    var title = document.createElement('p');
    title.innerHTML = songs[songs.length - 1].substring(0, songs[ songs.length - 1 ].length - 4).replace(/_/g, ' ');
    title.setAttribute('class', 'songTitle');
    div.append(title);
    div.append(btn);
    document.getElementById('songs').prepend(div);
    btn.addEventListener('click', (e) => {
        if (e.currentTarget.getAttribute('id') == currentId) {
            console.log(e.currentTarget.textContent);
            if (e.currentTarget.textContent == 'Play') {
              
                document.getElementById('player').play();
            } else {
                document.getElementById('player').pause();        
            }
        } else {      
            $('#' + currentId).css('background-color', '');
            $('#' + currentId).text('Play');
            console.log(e.currentTarget.getAttribute('id'));
            currentId = e.currentTarget.getAttribute('id');
            document.getElementById('player').setAttribute('src', '/savedsongs/' + songs[currentId]);
            document.getElementById('player').play();    
            $('#' + currentId).css('background-color', '#abffb0');
            $('#player-buttons>button').prop('disabled',false);
        }
    })
    $('#downloadBtn').prop('disabled', true);
    $('#saveSong').prop('disabled', true);
    $('#downloadNext').prop('disabled', false);
})

$('#downloadBtn').click((e) => {
    e.preventDefault();
    var url = new URL('/download/', window.location);
    var params = [['fileAdress', fileAddress]];
    url.search = new URLSearchParams(params).toString();
    console.log(fileAddress);
    fetch(url)
        .then(resp => {
            return resp.blob();
        })
        .then(blob => {
            console.log('AAAA');
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileAddress;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch((err) => alert(err));
    $('#downloadBtn').prop('disabled', true);
    $('#saveSong').prop('disabled', true);
    $('#downloadNext').prop('disabled', false);
})

$('#ytUrl').keyup(() => {
    var isYtUrl = checkUrl($('#ytUrl').val());
    if (isYtUrl) {
        $('#submitBtn').css("background-color", '#abffb0');
        $('#submitBtn').prop('disabled', false);
    } else {
        $('#ytUrl').css("border-color", 'red');
        $('#submitBtn').css("background-color", '#faa7ae');
        $('#submitBtn').prop('disabled', true);
    }
})
$('#form').submit((e) => {
    e.preventDefault();
    $('#submitBtn').prop('disabled', true);
    $('#whole').slideDown();
    $('#songs').css('height', '45vh')
    var checkIfThumbnailExists = document.getElementById('thumbnail');
    if (checkIfThumbnailExists != null) {
        var indexOfAmper = $('#ytUrl').val().lastIndexOf('&');
        if (indexOfAmper < 0) {
            var yurl = $('#ytUrl').val().substring($('#ytUrl').val().lastIndexOf('?v=') + 3);
            
        } else {
            var yurl = $('#ytUrl').val().substring($('#ytUrl').val().lastIndexOf('?v=') + 3, $('#ytUrl').val().lastIndexOf('&'));
        }
        
        checkIfThumbnailExists.setAttribute('src', 'https://www.youtube.com/embed/' + yurl);
    } else {
        var iframe = document.createElement('iframe');
        iframe.setAttribute('id', 'thumbnail');
        iframe.setAttribute('width', 250);
        iframe.setAttribute('height', 150);
        var indexOfAmper = $('#ytUrl').val().lastIndexOf('&');
        if (indexOfAmper < 0) {
            
            var yurl = $('#ytUrl').val().substring($('#ytUrl').val().lastIndexOf('?v=') + 3);
        } else {
            var yurl = $('#ytUrl').val().substring($('#ytUrl').val().lastIndexOf('?v=') + 3, $('#ytUrl').val().lastIndexOf('&'));
        }
        iframe.setAttribute('src', 'https://www.youtube.com/embed/' + yurl);
        $('#ytLookup').append(iframe);
    }

    console.log(yurl);
    var url = 'https://www.youtube.com/watch?v=' + yurl;
    $.getJSON('https://noembed.com/embed',
            { format: 'json', url: url }, function (data) {
                document.getElementById('title').innerHTML = data.title;
            });
    var filePath;
    var lastResponseLength = false;
    var re = /\d{1,3}\.\d{1,2}%/g;
    $.ajax({
        url: '/post',
        data: $("#form").serialize(),
        type: "POST",
        dataType: "text",
        processData: false,
        xhrFields: {
            onprogress: function (e) {
                var progressResponse;
                var response = e.currentTarget.response;
                if (lastResponseLength === false) {
                    progressResponse = response;
                    lastResponseLength = response.length;
                }
                else {
                    progressResponse = response.substring(lastResponseLength);
                    lastResponseLength = response.length;
                }
                var m;
                do {
                    m = re.exec(progressResponse);
                    if (m) {
                        $('#insideBar').css("width", m[0]);
                    }
                } while (m);
                console.log(progressResponse);
            }
        }
    })
        .done((data) => {
            $('#downloadBtn').prop('disabled', false);
            $('#saveSong').prop('disabled', false);
            $('#downloadBar>div').css("background-color", 'green');
            fileAddress = data.substring(data.lastIndexOf('%') + 1);
            console.log(fileAddress);
        })
        .fail((xhr, status, errorThrown) => {
            alert("Sorry, there was a problem!");
            console.log("Error: " + errorThrown);
            console.log("Status: " + status);
            console.dir(xhr);
        })
        .always((xhr, status) => {
            // alert("The request iss complete!");
        });

});
