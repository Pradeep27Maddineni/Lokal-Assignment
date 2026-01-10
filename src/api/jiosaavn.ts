import axios from 'axios';
import { SearchResponse, Song, ApiResponse } from '../types';

const BASE_URL = 'https://saavn.sumit.co';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

export const searchSongs = async (query: string): Promise<Song[]> => {
    try {
        const response = await api.get<SearchResponse<Song>>(`/api/search/songs?query=${encodeURIComponent(query)}`);
        if (response.data.status === 'SUCCESS') {
            return response.data.data.results;
        }
        return [];
    } catch (error) {
        console.error('Search Error:', error);
        throw error;
    }
};

export const getSongById = async (id: string): Promise<Song | null> => {
    try {
        const response = await api.get<ApiResponse<Song[]>>(`/api/songs/${id}`);
        if (response.data.success && response.data.data.length > 0) {
            return response.data.data[0];
        }
        return null;
    } catch (error) {
        console.error('Get Song Error:', error);
        throw error;
    }
};

export const getSongSuggestions = async (id: string): Promise<Song[]> => {
    try {
        const response = await api.get<ApiResponse<Song[]>>(`/api/songs/${id}/suggestions`);
        if (response.data.success) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error('Get Suggestions Error:', error);
        return [];
    }
}
