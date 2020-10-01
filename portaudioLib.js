/*
Wrapper for naudiodon

Useful for server-side LTC reading.  
For web-ltc, we'll try to use the RTC / HTML5 Audio API
*/

///

const portAudio = require('naudiodon')

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
  types.HostAPIs.forEach(({ name, type }) => (inputDevices[name].type = type))

  // Attach default device list
  inputDevices.default =
    inputDevices[
      types.HostAPIs.find(({ id }) => id == types.defaultHostAPI).name
    ]

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
