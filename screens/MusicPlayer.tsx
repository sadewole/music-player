import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';

import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from 'react-native-track-player';

import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import songs from '../model/data';

type SongT = {
  id: number;
  title: string;
  artist: string;
  artwork: any;
  url: any;
};

const {width} = Dimensions.get('window');

const events = [
  Event.PlaybackTrackChanged,
  Event.PlaybackError,
  Event.PlaybackState,
];

const setupPlayer = async () => {
  try {
    await TrackPlayer.setupPlayer({waitForBuffer: true});
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
    });
    await TrackPlayer.add(songs);
  } catch (error) {
    console.log(error);
  }
};

const getDuration = (val: string | number | Date) => {
  const date = new Date(val);
  const [minutes, seconds] = [date.getMinutes(), date.getSeconds()];

  return `${minutes}:${`${seconds}`.padStart(2, '0')}`;
};

const MusicPlayer = () => {
  const playBackState = usePlaybackState();
  const progress = useProgress();
  const [songIndex, setsongIndex] = useState(0);
  const [playPause, setPlayPause] = useState('ios-play-circle');
  const [repeatMode, setRepeatMode] = useState('off');

  const scrollX = useRef(new Animated.Value(songIndex * width)).current;
  const songSlider: React.LegacyRef<Animated.FlatList<SongT>> = useRef(null);

  const skipToSong = async (trackId: number) => {
    await TrackPlayer.skip(trackId);
    await TrackPlayer.play();
    setPlayPause('ios-pause-circle');
  };

  useEffect(() => {
    scrollX.addListener(({value}) => {
      const index = Math.round(value / width);
      skipToSong(index);
      setsongIndex(index);
    });

    return () => {
      scrollX.removeAllListeners();
    };
  }, [scrollX]);

  useEffect(() => {
    setupPlayer();
  }, []);

  const slideNext = (val: number) => {
    songSlider.current?.scrollToOffset({
      offset: val * width,
    });
  };

  // Changing track
  useTrackPlayerEvents(events, async event => {
    if (event.type === Event.PlaybackError) {
      console.warn('An error occured while playing the current track.');
    }
    // const mode = TrackPlayer.getRepeatMode();
    // console.log(mode);

    // if (event.type === Event.PlaybackTrackChanged && event.nextTrack === null) {
    //   console.log('event.type', event.type);
    // }

    if (event.type === Event.PlaybackTrackChanged && event.nextTrack !== null) {
      let trackIndex = await TrackPlayer.getCurrentTrack();
      if (trackIndex !== songIndex) {
        slideNext(trackIndex as number);
      }
    }
  });

  const skipToNext = () => {
    slideNext(songIndex + 1);
  };

  const skipToPrevious = () => {
    if (songIndex > 0) {
      slideNext(songIndex - 1);
    }
  };

  const togglePlayBack = async (playingState: State) => {
    const currentTrack = await TrackPlayer.getCurrentTrack();
    console.log(currentTrack, playingState, State.Playing);
    if (currentTrack != null) {
      if (playingState === State.Paused || playingState === State.Ready) {
        setPlayPause('ios-pause-circle');
        await TrackPlayer.play();
      } else {
        console.log('is playingState', playingState);
        setPlayPause('ios-play-circle');
        await TrackPlayer.pause();
      }
    }
  };

  const repeatIcon = () => {
    if (repeatMode === 'off') {
      return 'repeat-off';
    }

    if (repeatMode === 'track') {
      return 'repeat-once';
    }

    if (repeatMode === 'repeat') {
      return 'repeat';
    }
  };

  const changeRepeatMode = () => {
    if (repeatMode === 'off') {
      TrackPlayer.setRepeatMode(RepeatMode.Track);
      setRepeatMode('track');
    }

    if (repeatMode === 'track') {
      TrackPlayer.setRepeatMode(RepeatMode.Queue);
      setRepeatMode('repeat');
    }

    if (repeatMode === 'repeat') {
      TrackPlayer.setRepeatMode(RepeatMode.Off);
      setRepeatMode('off');
    }
  };

  const renderSongs = ({item}: {item: SongT}) => {
    return (
      <Animated.View style={style.mainWrapper}>
        <View style={[style.imageWrapper, style.elevation]}>
          <Image source={item.artwork} style={style.musicImage} />
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={style.container}>
      <View style={style.mainContainer}>
        <Animated.FlatList
          ref={songSlider}
          renderItem={renderSongs}
          data={songs}
          keyExtractor={item => `${item.id}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: {x: scrollX},
                },
              },
            ],
            {useNativeDriver: true},
          )}
        />
        <View>
          <Text style={[style.songContent, style.songTitle]}>
            {songs[songIndex].title}
          </Text>
          <Text style={[style.songContent, style.songArtist]}>
            {songs[songIndex].artist}
          </Text>
        </View>

        {/* songslider */}
        <View>
          <Slider
            style={style.progressBar}
            value={progress.position}
            minimumValue={0}
            maximumValue={progress.duration}
            thumbTintColor="#FFD369"
            minimumTrackTintColor="#FFD369"
            maximumTrackTintColor="#fff"
            onSlidingComplete={async value => {
              await TrackPlayer.seekTo(value);
            }}
          />

          {/* Progress Durations */}
          <View style={style.progressLevelDuraiton}>
            <Text style={style.progressLabelText}>
              {getDuration(progress.position * 1000)}
            </Text>
            <Text style={style.progressLabelText}>
              {getDuration(progress.duration * 1000)}
            </Text>
          </View>
        </View>

        {/* music control */}
        {/* <Text style={{color: 'white'}}> {`${playBackState}`}</Text> */}
        <View style={style.musicControlsContainer}>
          <TouchableOpacity onPress={skipToPrevious}>
            <Ionicons name="play-skip-back-outline" size={35} color="#FFD369" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => togglePlayBack(playBackState)}>
            <Ionicons name={playPause} size={75} color="#FFD369" />
          </TouchableOpacity>
          <TouchableOpacity onPress={skipToNext}>
            <Ionicons
              name="play-skip-forward-outline"
              size={35}
              color="#FFD369"
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* bottom section */}
      <View style={style.bottomSection}>
        <View style={style.bottomIconContainer}>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="heart-outline" size={30} color="#888888" />
          </TouchableOpacity>

          <TouchableOpacity onPress={changeRepeatMode}>
            <MaterialCommunityIcons
              name={`${repeatIcon()}`}
              size={30}
              color={repeatMode !== 'off' ? '#FFD369' : '#888888'}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="share-outline" size={30} color="#888888" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="ellipsis-horizontal" size={30} color="#888888" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MusicPlayer;

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222831',
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    borderTopColor: '#393E46',
    borderWidth: 1,
    width: width,
    alignItems: 'center',
    paddingVertical: 15,
  },

  bottomIconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },

  mainWrapper: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  imageWrapper: {
    width: 300,
    height: 340,
    marginBottom: 25,
  },
  musicImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  elevation: {
    elevation: 5,

    shadowColor: '#ccc',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
  },
  songContent: {
    textAlign: 'center',
    color: '#EEEEEE',
  },
  songTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  songArtist: {
    fontSize: 16,
    fontWeight: '300',
  },

  progressBar: {
    width: 350,
    height: 40,
    marginTop: 25,
    flexDirection: 'row',
  },
  progressLevelDuraiton: {
    width: 340,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabelText: {
    color: '#FFF',
  },

  musicControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    width: '60%',
  },
});
