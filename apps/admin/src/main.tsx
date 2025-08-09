import React from 'react';
import { createRoot } from 'react-dom/client';
import { Router, Route, Link } from 'wouter';

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
      <p>Backend: {h?.ok ? '✅' : '⏳ checking...'}</p>
      <p><Link href="/webrtc">Join WebRTC Room</Link></p>
    </div>
  );
}

function WebRTC() {
  const [joining, setJoining] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function join() {
    setErr(null); setJoining(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE ?? ''}/api/livekit/token`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ roomName: 'lobby' }) });
      const data = await res.json();
      console.log('LiveKit creds', data);
      alert(`Would connect to ${data.url} with token length ${data.token?.length}`);
    } catch (e:any) {
      setErr(e?.message ?? 'failed');
    } finally {
      setJoining(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>WebRTC</h2>
      <button onClick={join} disabled={joining}>{joining ? 'Joining...' : 'Join Room'}</button>
      {err && <pre style={{ color:'red' }}>{err}</pre>}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Route path="/" component={Home} />
      <Route path="/webrtc" component={WebRTC} />
    </Router>
  </React.StrictMode>
);