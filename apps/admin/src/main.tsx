import React from 'react';
import { createRoot } from 'react-dom/client';
import { Router, Route, Link } from 'wouter';
import { Room, RoomEvent, RemoteTrack, RemoteParticipant, RemoteTrackPublication } from 'livekit-client';

function useHealth() {
  const [state, set] = React.useState<any>(null);
  React.useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE ?? ''}/health`).then(r=>r.json()).then(set).catch(()=>set({ ok:false }));
  }, []);
  return state;
}

function Home() {
  const h = useHealth();
  return (
    <div style={{ padding: 24 }}>
      <h1>Fanno Platform</h1>
      <p>Backend: {h?.ok ? '✅ Connected' : '⏳ Checking...'}</p>
      
      <div style={{ marginTop: 20 }}>
        <h3>Features</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: 10 }}>
            <Link href="/webrtc" style={{ 
              display: 'inline-block', 
              padding: '10px 15px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: 5,
              marginRight: 10
            }}>
              🎥 Join Video Room
            </Link>
          </li>
          <li style={{ marginBottom: 10 }}>
            <Link href="/payments" style={{ 
              display: 'inline-block', 
              padding: '10px 15px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: 5,
              marginRight: 10
            }}>
              💳 Test Payments
            </Link>
          </li>
        </ul>
      </div>

      <div style={{ marginTop: 30, padding: 20, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
        <h4>Platform Status</h4>
        <p><strong>Service:</strong> {h?.service || 'Unknown'}</p>
        <p><strong>Last Check:</strong> {h?.time || 'Never'}</p>
        <p><strong>Status:</strong> {h?.ok ? '🟢 Healthy' : '🔴 Unavailable'}</p>
      </div>
    </div>
  );
}

function WebRTC() {
  const [joining, setJoining] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [room, setRoom] = React.useState<Room | null>(null);
  const [connected, setConnected] = React.useState(false);
  const [participants, setParticipants] = React.useState<RemoteParticipant[]>([]);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const remoteVideoRef = React.useRef<HTMLDivElement>(null);

  async function join() {
    setErr(null); setJoining(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE ?? ''}/api/livekit/token`, { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({ roomName: 'lobby' }) 
      });
      const data = await res.json();
      
      if (!data.token || !data.url) {
        throw new Error('Invalid response from server');
      }

      // Create room and connect
      const room = new Room();
      setRoom(room);

      // Set up event listeners
      room.on(RoomEvent.Connected, () => {
        console.log('Connected to room');
        setConnected(true);
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from room');
        setConnected(false);
        setRoom(null);
      });

      room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        console.log('Participant connected:', participant.identity);
        setParticipants(prev => [...prev, participant]);
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
        console.log('Participant disconnected:', participant.identity);
        setParticipants(prev => prev.filter(p => p.identity !== participant.identity));
      });

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, _publication: RemoteTrackPublication, _participant: RemoteParticipant) => {
        if (track.kind === 'video') {
          const videoElement = document.createElement('video');
          videoElement.autoplay = true;
          videoElement.style.width = '300px';
          videoElement.style.height = '200px';
          videoElement.style.margin = '10px';
          track.attach(videoElement);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.appendChild(videoElement);
          }
        }
      });

      // Connect to room
      await room.connect(data.url, data.token);
      
      // Enable camera and microphone
      await room.localParticipant.enableCameraAndMicrophone();
      
      // Attach local video
      if (videoRef.current) {
        const tracks = Array.from(room.localParticipant.videoTrackPublications.values());
        if (tracks.length > 0 && tracks[0].track) {
          tracks[0].track.attach(videoRef.current);
        }
      }

    } catch (e: unknown) {
      console.error('Join error:', e);
      setErr((e as Error)?.message ?? 'Failed to join room');
    } finally {
      setJoining(false);
    }
  }

  async function disconnect() {
    if (room) {
      await room.disconnect();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.innerHTML = '';
      }
    }
  }

  React.useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  return (
    <div style={{ padding: 24 }}>
      <h2>WebRTC Video Room</h2>
      
      <div style={{ marginBottom: 20 }}>
        <button onClick={join} disabled={joining || connected}>
          {joining ? 'Joining...' : connected ? 'Connected' : 'Join Room'}
        </button>
        {connected && (
          <button onClick={disconnect} style={{ marginLeft: 10 }}>
            Disconnect
          </button>
        )}
      </div>

      {err && <pre style={{ color:'red', marginBottom: 20 }}>{err}</pre>}

      {connected && (
        <div>
          <p style={{ color: 'green' }}>✅ Connected to video room</p>
          <p>Participants: {participants.length + 1} (including you)</p>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        {connected && (
          <div>
            <h3>Your Video</h3>
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline
              style={{ 
                width: 300, 
                height: 200, 
                backgroundColor: '#000',
                border: '2px solid #007bff'
              }} 
            />
          </div>
        )}

        <div>
          <h3>Remote Participants</h3>
          <div ref={remoteVideoRef} style={{ display: 'flex', flexWrap: 'wrap' }}>
            {participants.length === 0 && connected && (
              <p style={{ color: '#666' }}>No other participants yet</p>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <Link href="/">← Back to Home</Link>
      </div>
    </div>
  );
}

function Payments() {
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function createCheckout() {
    setErr(null);
    setLoading(true);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE ?? ''}/payments/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (e: unknown) {
      console.error('Checkout error:', e);
      setErr((e as Error)?.message ?? 'Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  }

  // Check URL parameters for payment status
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get('success');
  const canceled = urlParams.get('canceled');

  return (
    <div style={{ padding: 24 }}>
      <h2>Payment Integration</h2>
      
      {success && (
        <div style={{ 
          padding: 15, 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          border: '1px solid #c3e6cb',
          borderRadius: 5,
          marginBottom: 20 
        }}>
          ✅ Payment successful! Thank you for your purchase.
        </div>
      )}

      {canceled && (
        <div style={{ 
          padding: 15, 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          border: '1px solid #f5c6cb',
          borderRadius: 5,
          marginBottom: 20 
        }}>
          ❌ Payment was canceled. You can try again if you'd like.
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <h3>Test Stripe Integration</h3>
        <p>This will create a test checkout session for $5.00</p>
        
        <button 
          onClick={createCheckout} 
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 16
          }}
        >
          {loading ? 'Creating Session...' : 'Start Checkout ($5.00)'}
        </button>
      </div>

      {err && (
        <div style={{ 
          padding: 15, 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          border: '1px solid #f5c6cb',
          borderRadius: 5,
          marginBottom: 20 
        }}>
          Error: {err}
        </div>
      )}

      <div style={{ marginTop: 30, padding: 20, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
        <h4>How It Works</h4>
        <ol>
          <li>Click "Start Checkout" to create a Stripe checkout session</li>
          <li>You'll be redirected to Stripe's secure payment page</li>
          <li>Use test card: 4242 4242 4242 4242</li>
          <li>Any future date for expiry, any 3-digit CVC</li>
          <li>Complete payment and you'll return here with success status</li>
        </ol>
      </div>

      <div style={{ marginTop: 20 }}>
        <Link href="/">← Back to Home</Link>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Route path="/" component={Home} />
      <Route path="/webrtc" component={WebRTC} />
      <Route path="/payments" component={Payments} />
    </Router>
  </React.StrictMode>
);