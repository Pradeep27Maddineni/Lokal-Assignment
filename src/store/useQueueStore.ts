import { create } from 'zustand';
import { Song } from '../types';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV();

interface QueueState {
    queue: Song[];
    originalQueue: Song[];
    currentIndex: number;
    isShuffle: boolean;
    repeatMode: 'OFF' | 'ALL' | 'ONE';
    addToQueue: (track: Song) => void;
    setQueue: (tracks: Song[]) => void;
    removeFromQueue: (id: string) => void;
    playNext: () => void;
    playPrev: () => void;
    toggleShuffle: () => void;
    toggleRepeat: () => void;
    setIndex: (index: number) => void;
}

const getPersistedQueue = (): Song[] => {
    const json = storage.getString('queue');
    return json ? JSON.parse(json) : [];
}

const getPersistedIndex = (): number => {
    return storage.getNumber('queueIndex') || 0;
}

export const useQueueStore = create<QueueState>((set, get) => ({
    queue: getPersistedQueue(),
    originalQueue: getPersistedQueue(),
    currentIndex: getPersistedIndex(),
    isShuffle: false,
    repeatMode: 'OFF',

    addToQueue: (track) => {
        const { queue } = get();
        const newQueue = [...queue, track];
        set({ queue: newQueue, originalQueue: newQueue });
        storage.set('queue', JSON.stringify(newQueue));
    },

    setQueue: (tracks) => {
        set({ queue: tracks, originalQueue: tracks, currentIndex: 0 });
        storage.set('queue', JSON.stringify(tracks));
        storage.set('queueIndex', 0);
    },

    removeFromQueue: (id) => {
        const { queue } = get();
        const newQueue = queue.filter(t => t.id !== id);
        set({ queue: newQueue });
        storage.set('queue', JSON.stringify(newQueue));
    },

    playNext: () => {
        const { currentIndex, queue, repeatMode } = get();
        let nextIndex = currentIndex + 1;

        if (nextIndex >= queue.length) {
            if (repeatMode === 'ALL') {
                nextIndex = 0;
            } else {
                return;
            }
        }
        set({ currentIndex: nextIndex });
        storage.set('queueIndex', nextIndex);
    },

    playPrev: () => {
        const { currentIndex, queue, repeatMode } = get();
        let prevIndex = currentIndex - 1;

        if (prevIndex < 0) {
            if (repeatMode === 'ALL') {
                prevIndex = queue.length - 1;
            } else {
                return;
            }
        }
        set({ currentIndex: prevIndex });
        storage.set('queueIndex', prevIndex);
    },

    setIndex: (index) => {
        set({ currentIndex: index });
        storage.set('queueIndex', index);
    },

    toggleShuffle: () => {
        set(state => {
            const newShuffle = !state.isShuffle;
            if (newShuffle) {
                const shuffled = [...state.queue].sort(() => Math.random() - 0.5);
                return { isShuffle: true, queue: shuffled };
            } else {
                return { isShuffle: false, queue: state.originalQueue };
            }
        });
    },

    toggleRepeat: () => {
        set(state => {
            const modes: ('OFF' | 'ALL' | 'ONE')[] = ['OFF', 'ALL', 'ONE'];
            const nextIndex = (modes.indexOf(state.repeatMode) + 1) % modes.length;
            return { repeatMode: modes[nextIndex] };
        });
    }
}));
