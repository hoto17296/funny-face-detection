const resolution = { width: 1280, height: 720 } // 720p

$main = document.getElementsByTagName("main")[0]
$footer = document.getElementsByTagName("footer")[0]

const $video = document.getElementsByTagName("video")[0]
$video.width = resolution.width
$video.height = resolution.height

const $device = document.createElement("select")
$device.addEventListener("change", async (event) => await setDevice(event.target.value))

async function init() {
  const devices = (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind == "videoinput")
  if (devices.length == 0) throw new Exception("Video device is not detected")
  $footer.append($device)
  devices.forEach(device => {
    const $option = document.createElement("option")
    $option.value = device.deviceId
    $option.textContent = device.label
    $device.append($option)
  })
  await setDevice(devices[0].deviceId)
}

async function setDevice(deviceId) {
  $video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { deviceId, ...resolution } })
}

init().catch(err => console.error(err))