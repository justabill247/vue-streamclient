import { ref, onMounted, onUnmounted } from 'vue';

let ws = null;
const activeRecordingCount = ref(0);
const recordings = ref([]);

export function useRecordingStatus() {
  const connect = () => {
    try {
      // Get backend URL from environment or use default
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      
      // Convert HTTP/HTTPS to WS/WSS
      const wsUrl = apiBaseUrl
        .replace(/^https:/, 'wss:')
        .replace(/^http:/, 'ws:') + '/ws';

      console.log('[Recording Status] Attempting to connect to:', wsUrl);
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[Recording Status] WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[Recording Status] Message received:', data);

          if (data.type === 'recording-status') {
            activeRecordingCount.value = data.activeCount || 0;
            recordings.value = data.recordings || [];
            console.log('[Recording Status] Updated - Active:', data.activeCount, 'Recordings:', data.recordings);
          }
        } catch (err) {
          console.error('[Recording Status] Failed to parse message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('[Recording Status] WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('[Recording Status] WebSocket disconnected, attempting reconnect in 3s...');
        setTimeout(connect, 3000);
      };
    } catch (err) {
      console.error('[Recording Status] Failed to create WebSocket:', err);
    }
  };

  const disconnect = () => {
    if (ws) {
      ws.close();
      ws = null;
    }
  };

  onMounted(() => {
    console.log('[Recording Status] Component mounted, connecting...');
    connect();
  });

  onUnmounted(() => {
    console.log('[Recording Status] Component unmounted, disconnecting...');
    disconnect();
  });

  return {
    activeRecordingCount,
    recordings,
    connect,
    disconnect
  };
}
