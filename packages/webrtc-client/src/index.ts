import { connect, Room, RoomConnectOptions } from 'livekit-client';

export type TokenProvider = (args: { roomName?: string; identity?: string; metadata?: string }) => Promise<string>;

export function createRoomClient(opts: { url: string; tokenProvider: TokenProvider; connectOptions?: RoomConnectOptions }) {
  async function join(args: { roomName?: string; identity?: string; metadata?: string }) {
    const token = await opts.tokenProvider(args);
    const room = await connect(opts.url, token, opts.connectOptions);
    return room;
  }
  return { join };
}