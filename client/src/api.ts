import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const api = {
    uploadFile: async (file: File, options: { password?: string, oneTime?: boolean, email?: string } = {}, onProgress: (progress: number) => void) => {
        const formData = new FormData();
        formData.append('file', file);
        if (options.password) formData.append('password', options.password);
        if (options.oneTime) formData.append('oneTime', 'true');
        if (options.email) formData.append('email', options.email);

        const response = await axios.post(`${API_URL}/upload`, formData, {
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
                onProgress(percentCompleted);
            }
        });
        return response.data; // { code, expiresAt }
    },

    getFileInfo: async (code: string) => {
        const response = await axios.get(`${API_URL}/info/${code}`);
        return response.data;
    },

    getErrorMsg: (error: any) => {
        if (error.response?.data?.error) return error.response.data.error;
        return 'An unexpected error occurred.';
    }
};
