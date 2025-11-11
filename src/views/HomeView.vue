<template>
  <div class="p-4 space-y-2">
    <div class="w-full flex justify-between items-center">
      <h1 class="text-2xl font-semibold">Home</h1>
      <div class="flex flex-col">
        <h2 class="text-xs font-light">Recorder Status: Idle</h2>
        <span class="text-xs">disk space graph</span>
      </div>
      
    </div>

    <div class="flex flex-col gap-3">
      <div class="flex flex-col bg-gray-900 gap-2 p-1">
        <div class="flex justify-between">
          <span>Recent Recordings</span>
          <span>filter</span>  
        </div>
        
        <div class="flex p-2 w-full bg-gray-800 rounded-sm">
          <div class="w-full flex p-1">
            <div>
              <span class="flex flex-col">Pete Tongs Essential Collection</span>
              <span>11/8/25</span>
            </div>
            <div class="flex items-center grow">
              <span>BBC Radio 1</span>
            </div>
          </div>
          <div class="flex items-center">Play</div>
        </div>
        <div class="flex p-2 w-full bg-gray-800 rounded-sm">
          <div class="w-full flex flex-col p-1">
            <span class="text-md font-medium">Pete Tongs Essential Collection</span>
            <div class="flex p-1 gap-2">
              <span class="text-sm font-light">BBC Radio 1</span>
              <span class="text-sm font-light">11/08/2025</span>
            </div>
          </div>
          <div class="flex items-center">Play</div>
        </div>
        <span>(8) More Recordings</span>
      </div>

      <div>
        <div class="flex flex-col bg-gray-900 gap-2 p-1">
            <div class="flex justify-between">
                <span>Upcoming Recordings</span>
                <span>filter</span>
            </div>
            <div class="w-full flex p-2 bg-gray-800 rounded-sm">
              <div class="w-full flex p-1 justify-between">
                <span>Pete Tongs Essential Collection</span>
                <span>11/14/25 - 6:00 PM CST</span>

              </div>
            </div>
        </div>

      </div>
      
    </div>
  </div>
</template>

<script setup></script>
