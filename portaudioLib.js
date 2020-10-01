/*
Wrapper for naudiodon

Useful for server-side LTC reading.  
For web-ltc, we'll try to use the RTC / HTML5 Audio API
*/

///

const portAudio = require('naudiodon')

module.exports = {
  // From naudiodon
  SampleFormatFloat32: 1,
  SampleFormat8Bit: 8,
  SampleFormat16Bit: 16,
  SampleFormat24Bit: 24,
  SampleFormat32Bit: 32
}

/* // Node.js 12
Object.fromEntries(
  Object.entries(portAudio)
  .filter(
    ([key, value]) => Number.isInteger(value)
  )
)
*/

// Get input devices
module.exports.getInputDevices = () => {
  inputDevices = portAudio
    .getDevices()
    .filter(
      // Find only input devices (has at least one input)
      ({ maxInputChannels: inputs }) => inputs > 0
    )

    .reduce(
      // Group devices by host API
      (obj, device) => ({
        ...obj,
        [device.hostAPIName]: [...(obj[device.hostAPIName] || []), device]
      }),
      {}
    )

  let types = portAudio.getHostAPIs()

  // Attach type to name
  types.HostAPIs.forEach(
    ({ name, type }) => inputDevices[name] && (inputDevices[name].type = type)
  )

  // Attach default device list
  inputDevices.__proto__.default =
    inputDevices[
      types.HostAPIs.find(({ id }) => id == types.defaultHostAPI).name
    ]

  // Second level condition
  const lookupBase = condition => {
    for (let set of Object.values(inputDevices)) {
      let device = set.find(condition)
      if (device) return device
    }

    return null
  }

  // Lookup by Id
  inputDevices.__proto__.getById = deviceId =>
    lookupBase(({ id }) => id == deviceId)

  // Lookup by Name
  inputDevices.__proto__.getByName = deviceName =>
    lookupBase(({ name }) => name == deviceName)

  return inputDevices
}

function e(err) { throw new Error(err) }

/**
 * @param {Object} option - Options
 * @param {Device} device - Device from getInputDevices(), or undefined
 */
module.exports.createStream = (
  {
    deviceId,
    channelCount,
    sampleFormat = portAudio.SampleFormat16Bit,
    sampleRate,
    deviceId,
    closeOnError = true
  } = {},
  device
) => {
  if (!!device) {
    deviceId = device.id || deviceId || e('No device ID supplied')
    channelCount = channelCount || device.maxInputChannels || 1
    sampleRate = sampleRate || device.defaultSampleRate || 44100
  }

  return new portAudio.AudioIO({
    inOptions: {
      channelCount,
      sampleFormat,
      sampleRate,
      deviceId,
      closeOnError: true
    }
  })
}
