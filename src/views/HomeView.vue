<template>
  <div class="p-4 space-y-3">
    <div class="w-full flex justify-between items-center">
      <h1 class="text-2xl font-bold text-spotify-text-primary">Home</h1>
      <div class="flex flex-col text-right">
        <h2 class="text-xs font-light text-spotify-text-secondary">Recorder Status: Idle</h2>
        <span class="text-xs text-spotify-text-disabled">disk space graph</span>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <div class="flex flex-col bg-spotify-bg-secondary gap-2 p-3 border border-spotify-border rounded-lg">
        <div class="flex justify-between">
          <span class="font-semibold text-spotify-text-primary">Recent Recordings</span>
          <span class="text-spotify-text-secondary text-sm">filter</span>  
        </div>
        
        <div class="flex p-3 w-full bg-spotify-bg-tertiary rounded-lg border border-spotify-border hover:border-spotify-text-secondary transition">
          <div class="w-full flex p-2">
            <div>
              <span class="flex flex-col text-spotify-text-primary font-medium">Pete Tongs Essential Collection</span>
              <span class="text-xs text-spotify-text-secondary">11/8/25</span>
            </div>
            <div class="flex items-center grow text-spotify-text-secondary text-sm">
              <span>BBC Radio 1</span>
            </div>
          </div>
          <div class="flex items-center text-spotify-green">Play</div>
        </div>
        <div class="flex p-3 w-full bg-spotify-bg-tertiary rounded-lg border border-spotify-border hover:border-spotify-text-secondary transition">
          <div class="w-full flex flex-col p-2">
            <span class="text-md font-semibold text-spotify-text-primary">Pete Tongs Essential Collection</span>
            <div class="flex p-1 gap-2">
              <span class="text-sm text-spotify-text-secondary">BBC Radio 1</span>
              <span class="text-sm text-spotify-text-secondary">11/08/2025</span>
            </div>
          </div>
          <div class="flex items-center text-spotify-green">Play</div>
        </div>
        <span class="text-xs text-spotify-text-secondary">(8) More Recordings</span>
      </div>

      <div>
        <div class="flex flex-col bg-spotify-bg-secondary gap-2 p-3 border border-spotify-border rounded-lg">
            <div class="flex justify-between">
                <span class="font-semibold text-spotify-text-primary">Upcoming Recordings</span>
                <span class="text-spotify-text-secondary text-sm">filter</span>
            </div>
            <div class="w-full flex p-3 bg-spotify-bg-tertiary rounded-lg border border-spotify-border hover:border-spotify-text-secondary transition">
              <div class="w-full flex p-2 justify-between">
                <span class="text-spotify-text-primary font-medium">Pete Tongs Essential Collection</span>
                <span class="text-spotify-text-secondary text-sm">11/14/25 - 6:00 PM CST</span>

              </div>
            </div>
        </div>

      </div>
      
    </div>
  </div>
</template>

<script setup></script>
