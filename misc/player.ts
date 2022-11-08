// let playerActive: boolean = false;

// function setupPlayer() {
//   if (playerActive) {
//     return;
//   }
//   playerActive = true;
//   TrackPlayer.setupPlayer({waitForBuffer: true}).then(async () => {
//     await TrackPlayer.updateOptions({
//       stopWithApp: false,
//       capabilities: [
//         TrackPlayer.CAPABILITY_PLAY,
//         TrackPlayer.CAPABILITY_PAUSE,
//         TrackPlayer.CAPABILITY_STOP,
//       ],
//       compactCapabilities: [
//         TrackPlayer.CAPABILITY_PLAY,
//         TrackPlayer.CAPABILITY_PAUSE,
//         TrackPlayer.CAPABILITY_STOP,
//       ],
//       notificationCapabilities: [
//         TrackPlayer.CAPABILITY_PLAY,
//         TrackPlayer.CAPABILITY_PAUSE,
//         TrackPlayer.CAPABILITY_STOP,
//       ],
//     });
//   });
// }

// export async function togglePlay() {
//   setupPlayer();
//   const playbackState = await TrackPlayer.getState();
//   const currentTrack = await TrackPlayer.getCurrentTrack();
//   if (currentTrack == null) {
//     await TrackPlayer.reset();
//     await TrackPlayer.add(createTrack(currentStation));
//     await TrackPlayer.play();
//   } else {
//     if (playbackState === TrackPlayer.STATE_PAUSED) {
//       await TrackPlayer.stop(); // Force Restart
//       await TrackPlayer.reset();
//       await togglePlay();
//     } else {
//       await TrackPlayer.pause();
//     }
//   }
// }
