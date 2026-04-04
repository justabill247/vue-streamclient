import { ref, onMounted, onUnmounted } from 'vue';

let ws = null;
let reconnectTimeout = null;
let useCount = 0;
const activeRecordingCount = ref(0);
const recordings = ref([]);
const activeJobs = ref([]);
const schedules = ref([]);
const scheduleStateLoaded = ref(false);

async function fetchScheduleState() {
  try {
    const response = await fetch('/api/schedule');
    if (!response.ok) {
      throw new Error(`Failed to load schedules: ${response.status}`);
    }

    const data = await response.json();
    activeJobs.value = data.activeJobs || [];
    schedules.value = data.schedules || [];
    scheduleStateLoaded.value = true;
    console.log('[Recording Status] Schedule state refreshed from API:', data);
  } catch (error) {
    console.error('[Recording Status] Failed to fetch schedule state:', error);
  }
}

export function useRecordingStatus() {
  const connect = () => {
    try {
      // Don't connect if already connected or connecting
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        console.log('[Recording Status] Already connected or connecting');
        return;
      }

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
          } else if (data.type === 'schedule-state') {
            activeJobs.value = data.activeJobs || [];
            schedules.value = data.schedules || [];
            scheduleStateLoaded.value = true;
            console.log('[Recording Status] Schedule state updated:', data);
          }
        } catch (err) {
          console.error('[Recording Status] Failed to parse message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('[Recording Status] WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('[Recording Status] WebSocket disconnected');
        // Only reconnect if we still have active users
        if (useCount > 0) {
          console.log('[Recording Status] Will attempt reconnect in 3s...');
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };
    } catch (err) {
      console.error('[Recording Status] Failed to create WebSocket:', err);
    }
  };

  const disconnect = () => {
    if (ws) {
      console.log('[Recording Status] Closing WebSocket connection');
      ws.close();
      ws = null;
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  };

  onMounted(() => {
    useCount++;
    console.log('[Recording Status] Component mounted, use count:', useCount);
    if (useCount === 1) {
      console.log('[Recording Status] First component mounted, connecting...');
      connect();
    }

    if (!scheduleStateLoaded.value) {
      fetchScheduleState();
    }
  });

  onUnmounted(() => {
    useCount--;
    console.log('[Recording Status] Component unmounted, use count:', useCount);
    if (useCount === 0) {
      console.log('[Recording Status] Last component unmounted, disconnecting...');
      disconnect();
    }
  });

  return {
    activeRecordingCount,
    recordings,
    activeJobs,
    schedules,
    scheduleStateLoaded,
    fetchScheduleState,
    connect,
    disconnect
  };
}
