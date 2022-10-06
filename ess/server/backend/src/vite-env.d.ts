/// <reference types="svelte" />
/// <reference types="vite/client" />

type OAuth2Token = {
    accessToken: string,
    expiresAt: number,
    refreshToken: string,
};

type User = {
    id: number,
    name: string,
    email: string,
};

type Experiment = {
    id: number,
    title: string,
    status: 'development'|'active'|'completed',
};

type PydanticError = {
    ctx: {[x: string]: string},
    loc: string[],
    msg: string,
    type:string,
};
