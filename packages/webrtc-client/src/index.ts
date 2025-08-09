import { Room, RoomOptions } from 'livekit-client';

export type TokenProvider = (args: { roomName?: string; identity?: string; metadata?: string }) => Promise<string>;

export function createRoomClient(opts: { url: string; tokenProvider: TokenProvider; roomOptions?: RoomOptions }) {
  async function join(args: { roomName?: string; identity?: string; metadata?: string }) {
    const token = await opts.tokenProvider(args);
    const room = new Room(opts.roomOptions);
    await room.connect(opts.url, token);
    return room;
  }
  return { join };
}