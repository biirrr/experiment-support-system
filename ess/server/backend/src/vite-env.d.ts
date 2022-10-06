/// <reference types="svelte" />
/// <reference types="vite/client" />

type OAuth2Token = {
    accessToken: string,
    expiresAt: number,
    refreshToken: string,
};

type User = {
    id: string,
    name: string,
    email: string,
};
