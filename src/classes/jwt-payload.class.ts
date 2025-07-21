export class JwtPayload {
    sub: {
        id: number;
        type: 'user' | 'system';
    };
    iat: number;
    exp: number;
}
