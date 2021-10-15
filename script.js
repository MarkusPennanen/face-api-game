const video = document.getElementById('video')
var itemPositionX = 300
var itemPositionY = 230
var doDraw = false

function startVideo() { /* Start webcam feed */
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

Promise.all([ /* Load all nessecary face-api models asynchronously */
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

video.addEventListener('play', () => { /* When webcam feed is started */
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)

  setInterval(async () => { /* Run facial detection every 300 ms */
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const mouth = detections[0].landmarks.getMouth()
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

    if (doDraw == true) { /* Draw expressions and landmarks if chosen by user */
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    }

    function getLocation () { /* Get current mouth coordinates, if they match the position of an item, run newPosition */
        const coordinatesXmin = mouth[0].x
        const coordinatesXmax = mouth[6].x
        const coordinatesYmin = mouth[4].y
        const coordinatesYmax = mouth[10].y
      if ((itemPositionX + 10) > coordinatesXmin && (itemPositionX - 10) < coordinatesXmax &&
          (itemPositionY + 10) > coordinatesYmin && (itemPositionY - 10) < coordinatesYmax) {
            newPosition()
    }
  }
  getLocation()
  }, 300)
})

function newPosition(){ /* Reposition the item on screen */
  const restrictions = video.getBoundingClientRect()
  var x = Math.random()*((restrictions.right - 150) - (restrictions.left + 100)) + (restrictions.left + 100); /* Set restrictions to where items can spawn */
  x = Math.round(x);
  var y = Math.random()*((restrictions.bottom - 150) - (restrictions.top + 100)) + (restrictions.top + 100);
  y = Math.round(y);
  document.getElementById("hitBox").style.top = y+"px"; /* Position item and hitbox on screen */
  document.getElementById("hitBox").style.left = x+"px";
  document.getElementById("spawnedItem").style.top = (y-25)+"px";
  document.getElementById("spawnedItem").style.left = (x-28)+"px";
  itemPositionX = (x - video.getBoundingClientRect().left)
  itemPositionY = (y - video.getBoundingClientRect().top)

  if (typeof(Storage) !== "undefined") { /* Save points to localStorage */
    if (localStorage.points) {
      localStorage.points = Number(localStorage.points)+1
      document.getElementById("points").innerHTML = "Points: " + localStorage.points
    } else {
      localStorage.points = 0;
      document.getElementById("points").innerHTML = "Points: " + localStorage.points
    }
  } else {
    document.getElementById("points").innerHTML = ""
  }
}

function setDraw() {
  doDraw = !doDraw
}
