var songs = [];
var deletedIndexes = [];
var currentId;
$.get('/playlist').done((data) => {
    for (var i = 0; i < data.files.length; i++) {
        var replacedUnderScores = data.files[i].split('_').join(' ');
        songs.push(replacedUnderScores);
    }
    for (var i = 0; i < songs.length; i++) {
        var div = document.createElement('div');
        div.setAttribute('class', 'song');
        div.style.borderStyle = 'solid';
        var btn = document.createElement('button');
        btn.setAttribute('id', i);
        btn.textContent = 'Play';
        btn.setAttribute('class', 'playBtn');
        var title = document.createElement('p');
        title.setAttribute('class', 'songTitle');
        title.innerHTML = songs[i].substring(0, songs[i].length - 4);
        div.append(title);
        div.append(btn);
        document.getElementById('songs').append(div);

    }
    $('.playBtn').click((e) => {
        if (e.currentTarget.getAttribute('id') == currentId) {
            if (e.currentTarget.textContent == 'Play') {

                document.getElementById('player').play();
            } else {
                document.getElementById('player').pause();
            }
        } else {
            $('#' + currentId).css('background-color', '');
            $('#' + currentId).text('Play');
            currentId = e.currentTarget.getAttribute('id');
            document.getElementById('player').setAttribute('src', '/savedsongs/' + songs[currentId].split(' ').join('_'));
            document.getElementById('player').play();
            $('#' + currentId).css('background-color', '#abffb0');
            $('#player-buttons>button').prop('disabled', false);
            $('#mute').prop('disabled', false);
        }
    })
});

var aud = $('audio')[0];

aud.addEventListener('play', () => {
    $('#play').text('PAUSE');
    $('#' + currentId).text('Pause');
})

aud.addEventListener('pause', () => {
    $('#play').text('PLAY');
    $('#' + currentId).text('Play');
})


aud.addEventListener('timeupdate', updateTime);
function rangeSlide(value) {
    aud.currentTime = aud.duration / 100 * value;
    aud.addEventListener('timeupdate', updateTime);
}
document.getElementById('ranger').addEventListener('input', (e) => {
    var date = new Date(0);
    date.setSeconds(Math.floor(e.currentTarget.value / 100 * aud.duration));
    if (Math.floor(aud.currentTime) < 3600) {
        var timeString = date.toISOString().substr(14, 5);
    } else {
        var timeString = date.toISOString().substr(11, 8);
    }
    $('#elapsedTime').text(timeString);
    aud.removeEventListener('timeupdate', updateTime);
})
function updateTime() {
    document.getElementById('ranger').value = aud.currentTime / aud.duration * 100;
    var date = new Date(0);
    date.setSeconds(Math.floor(aud.currentTime));
    if (Math.floor(aud.currentTime) < 3600) {
        var timeString = date.toISOString().substr(14, 5);
    } else {
        var timeString = date.toISOString().substr(11, 8);
    }
    $('#elapsedTime').text(timeString);
}

aud.onended = function () {
    nextSong();
}

const nextSong = function () {
    currentId = parseInt(currentId);
    $('#' + currentId).css('background-color', '');
    $('#' + currentId).text('Play');
    if (currentId + 1 > songs.length - 1) {
        currentId = -1;
    }
    currentId += 1;
    while (deletedIndexes.includes((currentId).toString())) {
        if (currentId + 1 > songs.length - 1) {
            currentId = 0;
        } else {
            currentId += 1;
        }
    }
    document.getElementById('player').setAttribute('src', '/savedsongs/' + songs[currentId].split(' ').join('_'));
    if ($('#play').text() == 'PLAY') {
        $('#play').text('PAUSE');
    }
    document.getElementById('player').play();
    $('#' + currentId).css('background-color', '#abffb0');
    $('#' + currentId).text('Pause');
}

const prevSong = function () {
    currentId = parseInt(currentId);
    if (Math.floor(aud.currentTime) < 3) {
        $('#' + currentId).css('background-color', '');
        $('#' + currentId).text('Play');

        if (currentId - 1 < 0) {
            currentId = songs.length;
        }
        currentId -= 1;
        while (deletedIndexes.includes((currentId).toString())) {
            if (currentId == 0) {
                currentId = songs.length - 1;
            } else {
                currentId -= 1;
            }
        }
        document.getElementById('player').setAttribute('src', '/savedsongs/' + songs[currentId].split(' ').join('_'));
        if ($('#play').text() == 'PLAY') {
            $('#play').text('PAUSE');
        }
        document.getElementById('player').play();
        $('#' + currentId).css('background-color', '#abffb0');
        $('#' + currentId).text('Pause');
    } else {
        aud.currentTime = 0;
    }
}

const playSong = function (e) {
    if (e.currentTarget.textContent == 'PLAY') {
        aud.play();
    } else {
        aud.pause();
    }
}

aud.addEventListener('loadeddata', () => {
    document.getElementById('ranger').value = 0;
    var playerTitle = songs[currentId];
    document.getElementById('player-title').textContent = playerTitle.substring(0, playerTitle.length - 4).replace(/_/g, ' ');
    var date = new Date(0);
    date.setSeconds(Math.floor(aud.duration));
    if (Math.floor(aud.currentTime) < 3600) {
        var timeString = date.toISOString().substr(14, 5);
    } else {
        var timeString = date.toISOString().substr(11, 8);
    }
    $('#fullTime').text(timeString);
})

$('#volume-control').on('input', (e) => {
    aud.volume = e.currentTarget.value / 100;
})

var prevVolume;
$('#mute').on('click', (e) => {
    if ($('#mute').text() == 'MUTE') {
        prevVolume = aud.volume;
        aud.volume = e.currentTarget.value / 100;
        $('#volume-control').val(0);
        $('#mute').text('UNMUTE');
    } else {
        aud.volume = prevVolume;
        $('#volume-control').val(aud.volume * 100);
        $('#mute').text('MUTE');
    }
})

$('#search-bar').on('keyup', () => {
    var val = $('#search-bar').val();
    var song;
    for (var i = 0; i < songs.length; i++) {
        if (songs[i].toLowerCase().includes(val.toLowerCase())) {
            $('#' + i).parent().show();
        } else {
            $('#' + i).parent().hide();
        }
    }
})

var deleteToggle = false;
var songsToDeleteIndexes = [];
var songsToDelete = [];
$('#delete').on('click', () => {
    if (deleteToggle) {
        for (var i = 0; i < songsToDeleteIndexes.length; i++) {
            songsToDelete.push(songs[songsToDeleteIndexes[i]]);
        }
        deleteToggle = false;
        $('body').append('<div class="blur"></div>');
        var deleteWindow = document.createElement('div');
        $('.blur').append('<div id="delete-popup"></div>');
        $('#delete-popup').append('<div class="delete-popup-buttons"></div>')
        $('.delete-popup-buttons').append('<button class="delete-popup-ok"> Yes </button>');
        $('.delete-popup-buttons').append('<button class="delete-popup-no"> No </button>');
        $('#delete-popup').append('<h1 class="delete-popup-quetion">Do you want to delete these songs?</h1>')
        for (var i = 0; i < songsToDelete.length; i++) {
            $('#delete-popup').append('<h2 class="delete-popup-song">' + songsToDelete[i] + '</h2>')
        }
        $('.delete-popup-ok').on('click', () => {
            deletedIndexes.push(...songsToDeleteIndexes);
            var tableFields = document.getElementById('songs');
            var children = tableFields.children;
            for (var i = 0; i < children.length; i++) {
                var tableChild = children[i];
                var idToSchek = tableChild.children[1].getAttribute('id');
                if (songsToDeleteIndexes.includes(idToSchek)) {
                    tableChild.remove();
                    i--;
                }
            }
            $.ajax({
                url: '/delete',
                data: { 'files': songsToDelete },
                type: 'POST',
                dataType: 'text',
            })
                .done(() => {        
                })
            $('.blur').remove();
            songsToDeleteIndexes = [];
            songsToDelete = [];
            $('.song').off();
        })
        $('.delete-popup-no').on('click', () => {
            $('.blur').remove();
            songsToDeleteIndexes = [];
            songsToDelete = [];
            $('.song').css('background-color', '');
            $('.song').attr('data-click-state', 0);
            $('.song').off();
        });
        $('#delete').text('Delete');
    } else {
        $('#delete').text('Delete selected');
        $('.song').on('click', function (e) {
            if ($(this).attr('data-click-state') == 1) {
                $(this).attr('data-click-state', 0);
                $(this).css('background-color', '')
                let pos = songsToDeleteIndexes.indexOf($(e.currentTarget).children('button').attr('id'));
                songsToDeleteIndexes.splice(pos, 1);
            }
            else {
                $(this).attr('data-click-state', 1);
                $(this).css('background-color', '#faa7ae')
                songsToDeleteIndexes.push($(e.currentTarget).children('button').attr('id'));
            }
        });
        deleteToggle = true;
    }
})