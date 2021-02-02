
var apiKey;
var sessionId;
var token;
(function clojure() {
  const video = document.querySelector('#video');
  const stream = video.captureStream();
  stream.addEventListener('addtrack', publish);
  function handleError(error) {
    if (error) {
      console.error(error);
    }
  }

  let publisher;
  // initialize the publisher
  function publish() {
    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();
    if (!publisher && videoTracks.length > 0 && audioTracks.length > 0) {
      stream.removeEventListener('addtrack', publish);
      publisher = OT.initPublisher('publisher', {
        videoSource: videoTracks[0],
        audioSource: audioTracks[0],
        fitMode: 'contain',
      }, (err) => {
        if (err) {
          video.pause();
          alert(err.message);
        } else {
          video.play();
        }
      });
      publisher.on('destroyed', () => {
        video.pause();
      });

      var session = OT.initSession(apiKey, sessionId);

      // Subscribe to a newly created stream
      session.on('streamCreated', function streamCreated(event) {
        var subscriberOptions = {
          insertMode: 'append',
          width: '100%',
          height: '100%'
        };
        session.subscribe(event.stream, 'subscriber', subscriberOptions, handleError);
      });

      session.on('sessionDisconnected', function sessionDisconnected(event) {
        console.log('You were disconnected from the session.', event.reason);
      })

      session.connect(token, function callback(error) {
        debugger
        if (error) {
          handleError(error);
        } else {
          // If the connection is successful, publish the publisher to the session
          session.publish(publisher, handleError);
        }
      })

    }
  }

  // Make an Ajax request to get the OpenTok API key, session ID, and token from the server
  fetch('https://opentok-web-samples-backend.herokuapp.com' + '/session').then(function fetch(res) {
    return res.json();
  }).then(function fetchJson(json) {
    apiKey = json.apiKey;
    sessionId = json.sessionId;
    token = json.token;
  }).catch(function catchErr(error) {
    handleError(error);
    alert('Failed to get opentok sessionId and token. Make sure you have updated the config.js file.');
  });
})()
