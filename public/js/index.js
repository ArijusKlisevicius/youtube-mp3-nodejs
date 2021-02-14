   
        $('.lds-dual-ring').hide();
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


        })

        $('#downloadBtn').click((e) => {
            e.preventDefault();
            var url = new URL('/download/', window.location);
            var params = [['fileAdress', fileAddress]];
            url.search = new URLSearchParams(params).toString();

            fetch(url)
                .then(resp => {
                    return resp.blob();
                })
                .then(blob => {
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
            $('#downloadNext').prop('disabled', false);
        })

        $('#ytUrl').keyup(() => {

            var isYtUrl = checkUrl($('#ytUrl').val());
            if (isYtUrl) {
                $('#ytUrl').css("border-color", 'green');
                $('#submitBtn').prop('disabled', false);
            } else {
                $('#ytUrl').css("border-color", 'red');
                $('#submitBtn').prop('disabled', true);
            }
        })
        $('#form').submit((e) => {
            $('#submitBtn').prop('disabled', true);
            $('.lds-dual-ring').show();
            e.preventDefault();
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
                    }
                }
            })
                .done((data) => {

                    $('#downloadBtn').prop('disabled', false);
                    $('#downloadBar>div').css("background-color", 'green');
                    fileAddress = data.substring(data.lastIndexOf('%')+1);
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