const resolution = { width: 1280, height: 720 } // 720p
const fps = 10
const modelUri = "https://cdn.hotolab.net/face-api.js/models"
const threshold = 0.4

const $video = document.querySelector("main > video")
$video.width = resolution.width
$video.height = resolution.height

$canvas = document.querySelector("main > canvas")
$canvas.width = resolution.width
$canvas.height = resolution.height

const overlayImage = new Image()
overlayImage.src = "overlay.png"

const $device = document.getElementById("device")
$device.addEventListener("change", async (event) => await setDevice(event.target.value))

const $debug = document.getElementById("debug")

async function init() {
  const devices = (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind == "videoinput")
  if (devices.length == 0) throw new Exception("Video device is not detected")
  devices.forEach(device => {
    const $option = document.createElement("option")
    $option.value = device.deviceId
    $option.textContent = device.label
    $device.append($option)
  })
  await setDevice(devices[0].deviceId)
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(modelUri),
    faceapi.nets.faceLandmark68Net.loadFromUri(modelUri),
    faceapi.nets.faceExpressionNet.loadFromUri(modelUri),
  ])
}

async function setDevice(deviceId) {
  $video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { deviceId, ...resolution } })
}

$video.addEventListener("play", () => {
  const ctx = $canvas.getContext("2d")
  faceapi.matchDimensions($canvas, resolution)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces($video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, resolution)
    ctx.clearRect(0, 0, resolution.width, resolution.height)
    if ($debug.checked) {
      faceapi.draw.drawDetections($canvas, resizedDetections)
      faceapi.draw.drawFaceLandmarks($canvas, resizedDetections)
      faceapi.draw.drawFaceExpressions($canvas, resizedDetections)
    }
    const surprised = resizedDetections.filter(face => face.expressions.surprised > threshold)
    if (surprised.length > 0) ctx.drawImage(overlayImage, 0, 0, resolution.width, resolution.height)
  }, 1000 / fps)
})

init().catch(err => console.error(err))