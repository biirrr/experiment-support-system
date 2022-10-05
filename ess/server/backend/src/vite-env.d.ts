/// <reference types="svelte" />
/// <reference types="vite/client" />

type OAuth2Token = {
    accessToken: string,
    expiresAt: number,
    refreshToken: string,
};
