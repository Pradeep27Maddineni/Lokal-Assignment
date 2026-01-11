import { Audio, InterruptionModeAndroid, InterruptionModeIOS, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import { Song } from '../types';
import { usePlayerStore } from '../store/usePlayerStore';
import { useQueueStore } from '../store/useQueueStore';

class AudioService {
    private sound: Audio.Sound | null = null;
    private isSetup = false;

    constructor() {
        this.setupAudio();
    }

    private async setupAudio() {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                interruptionModeIOS: InterruptionModeIOS.DoNotMix,
                interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                playThroughEarpieceAndroid: false
            });
            this.isSetup = true;
        } catch (e) {
            console.error('Audio Setup Error', e);
        }
    }

    async playSong(song: Song) {
        try {
            if (this.sound) {
                await this.sound.unloadAsync();
                this.sound = null;
            }
            let streamUrl = song.url;

            const highQuality = song.downloadUrl.find(d => d.quality === '320kbps') ||
                song.downloadUrl.find(d => d.quality === '160kbps');

            if (highQuality) {
                streamUrl = highQuality.link;
            }

            const { sound } = await Audio.Sound.createAsync(
                { uri: streamUrl },
                { shouldPlay: true },
                this.onPlaybackStatusUpdate
            );

            this.sound = sound;
            usePlayerStore.getState().setCurrentTrack(song);
            usePlayerStore.getState().setIsPlaying(true);
            usePlayerStore.getState().setDuration(parseInt(song.duration) * 1000 || 0);
        } catch (error) {
            console.error('Play Song Error', error);
            usePlayerStore.getState().setIsPlaying(false);
        }
    }

    async pause() {
        if (this.sound) {
            await this.sound.pauseAsync();
            usePlayerStore.getState().setIsPlaying(false);
        }
    }

    async resume() {
        if (this.sound) {
            await this.sound.playAsync();
            usePlayerStore.getState().setIsPlaying(true);
        }
    }

    async seekTo(positionMillis: number) {
        if (this.sound) {
            await this.sound.setPositionAsync(positionMillis);
        }
    }

    private onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (!status.isLoaded) {
            if (status.error) {
                console.error('Playback Error', status.error);
            }
            return;
        }

        const s = status as AVPlaybackStatusSuccess;
        usePlayerStore.getState().setPosition(s.positionMillis);
        usePlayerStore.getState().setIsBuffering(s.isBuffering);
        usePlayerStore.getState().setIsPlaying(s.isPlaying);
        if (s.durationMillis && usePlayerStore.getState().duration !== s.durationMillis) {
            usePlayerStore.getState().setDuration(s.durationMillis);
        }
        if (s.didJustFinish && !s.isLooping) {
            this.handleTrackFinished();
        }
    }

    private handleTrackFinished() {
        const { playNext } = useQueueStore.getState();
        playNext();
        const { queue, currentIndex } = useQueueStore.getState();
        const nextSong = queue[currentIndex];

        if (nextSong) {
            this.playSong(nextSong);
        } else {
            usePlayerStore.getState().setIsPlaying(false);
        }
    }
}

export const audioService = new AudioService();
