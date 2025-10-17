// Initialize Supabase client
// Ensure Supabase client is loaded via CDN
let supabaseClient;
if (typeof window.createClient === 'function') {
  supabaseClient = window.createClient(
    'https://pxwbumtpnzbbqzqhnsow.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4d2J1bXRwbnpiYnF6cWhuc293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjM4NTcsImV4cCI6MjA3MzgzOTg1N30.CfDyCEQCCoc4p1KrE_G43ToVGExuVvGAGWk3hMQxf3s'
  );
} else if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
  supabaseClient = window.supabase.createClient(
    'https://pxwbumtpnzbbqzqhnsow.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4d2J1bXRwbnpiYnF6cWhuc293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjM4NTcsImV4cCI6MjA3MzgzOTg1N30.CfDyCEQCCoc4p1KrE_G43ToVGExuVvGAGWk3hMQxf3s'
  );
}

function startRoomLinkPolling() {
  console.log("DEBUG: startRoomLinkPolling function entered.");
  const urlParams = new URLSearchParams(window.location.search);
  const clientName = urlParams.get('client_name');
  const autoJoin = urlParams.get('auto_join');
  
  // Set client name if provided
  if (clientName) {
    const nameInput = document.getElementById('name');
    if (nameInput) {
      nameInput.value = clientName;
    }
  }

  // Only auto-join if specified and we have a room link
  if (autoJoin === 'true') {
    const joinButton = document.getElementById('joinMeetingBtn');
    if (joinButton) {
      joinButton.click();
    }
  }

  console.log("Starting room link polling");

  // Clear any existing interval
  if (window.roomLinkPollingInterval) {
    clearInterval(window.roomLinkPollingInterval);
  }

  // Start polling every 5 seconds
  window.roomLinkPollingInterval = setInterval(async () => {
    console.log("DEBUG: Polling for room link...");
    try {
      if (!supabaseClient) {
        console.error('❌ Supabase client not initialized');
        return;
      }

      // Query Supabase for the latest room link
      const { data, error } = await supabaseClient
        .from('bookings')
        .select('id, room_link, meeting_status, scheduled_for')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      console.log('📊 Supabase response:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        const statusDiv = document.getElementById('meeting-status');
        if (statusDiv) {
          statusDiv.textContent = 'Error connecting to meeting server. Retrying...';
          statusDiv.style.backgroundColor = '#3d0000';
          statusDiv.style.color = '#ff4444';
        }
        return;
      }

      if (data) {
        console.log('✅ Data received:', data);
        const statusDiv = document.getElementById('meeting-status');
        
        if (data.room_link) {
          const input = document.getElementById('joinMeetingId');
          const urlParams = new URLSearchParams(window.location.search);
          const urlRoomId = urlParams.get('room_id');

          // Defensive: only set join input from the room_link field (never from id)
          if (input && data.room_link) {
            console.log('Setting joinMeetingId from room_link:', data.room_link);
            input.value = data.room_link;
          }
        }
        
        // Update status messages with professional styling
        if (statusDiv) {
          statusDiv.style.padding = '10px';
          statusDiv.style.borderRadius = '5px';
          statusDiv.style.marginTop = '10px';
          statusDiv.style.fontWeight = 'bold';
          
          if (data.scheduled_for) {
            const date = new Date(data.scheduled_for);
            const formatted = date.toLocaleString();
            statusDiv.textContent = `📅 Scheduled for ${formatted}`;
            statusDiv.style.backgroundColor = '#2c2c2c';
            statusDiv.style.color = '#ffd700';
          } else if (data.meeting_status === 'pending') {
            statusDiv.textContent = '⌛ Waiting for host to join...';
            statusDiv.style.backgroundColor = '#3d0000';
            statusDiv.style.color = '#ff4444';
          } else if (data.meeting_status === 'ready') {
            statusDiv.textContent = '✅ Host has joined! Click Join Meeting';
            statusDiv.style.backgroundColor = '#004400';
            statusDiv.style.color = '#44ff44';
            document.querySelector('.join-meeting-input').style.display = 'block';
          } else {
            statusDiv.textContent = '🔄 Connecting to meeting...';
            statusDiv.style.backgroundColor = '#2c2c2c';
            statusDiv.style.color = '#ffffff';
          }
        }
      } else {
        console.log('⚠️ No data returned from Supabase');
        const statusDiv = document.getElementById('meeting-status');
        if (statusDiv) {
          statusDiv.textContent = 'No meeting information available';
          statusDiv.style.backgroundColor = '#2c2c2c';
          statusDiv.style.color = '#ffffff';
        }
      }
    } catch (err) {
      console.error('❌ Polling error:', err);
      const statusDiv = document.getElementById('meeting-status');
      if (statusDiv) {
        statusDiv.textContent = 'Connection error. Retrying...';
        statusDiv.style.backgroundColor = '#3d0000';
        statusDiv.style.color = '#ff4444';
      }
    }
  }, 5000); // Poll every 5 seconds
}

document.addEventListener('DOMContentLoaded', async function () {
  // Watcher to detect unexpected programmatic changes to the meeting input.
  try {
    const joinInputWatcher = document.getElementById('joinMeetingId');
    if (joinInputWatcher) {
      let _lastJoinVal = joinInputWatcher.value;
      setInterval(() => {
        try {
          if (joinInputWatcher.value !== _lastJoinVal) {
            console.log('DEBUG: joinMeetingId changed from', _lastJoinVal, 'to', joinInputWatcher.value);
            console.trace();
            _lastJoinVal = joinInputWatcher.value;
          }
        } catch (e) {
          console.error('Error in joinInputWatcher:', e);
        }
      }, 500);
    }
  } catch (e) {
    console.error('Error setting up joinMeetingId watcher:', e);
  }
  // Start polling for room link from Supabase after DOM is ready
  startRoomLinkPolling();
  // Clear any existing meeting code value
  const joinMeetingCode = document.getElementById('joinMeetingId');
  if (joinMeetingCode) {
    joinMeetingCode.value = "";
  }
  /*

  const audioPermission = await window.VideoSDK.requestPermission(
    window.VideoSDK.Constants.permission.AUDIO,
  );

  console.log(
    "request Audio Permissions",
    audioPermission.get(window.VideoSDK.Constants.permission.AUDIO)
  );


  const videoPermission = await window.VideoSDK.requestPermission(
    window.VideoSDK.Constants.permission.VIDEO,
  );

  console.log(
    "request Video Permissions",
    videoPermission.get(window.VideoSDK.Constants.permission.VIDEO)
  );

  const audiovideoPermission = await window.VideoSDK.requestPermission(
    window.VideoSDK.Constants.permission.AUDIO_AND_VIDEO,
  );

  console.log(
    "request Audio and Video Permissions",
    audiovideoPermission.get(window.VideoSDK.Constants.permission.AUDIO),
    audiovideoPermission.get(window.VideoSDK.Constants.permission.VIDEO)
  );

  */

  /*

  try {
    const checkAudioPermission = await window.VideoSDK.checkPermissions(
      window.VideoSDK.Constants.permission.AUDIO,
    );
    console.log(
      "Check Audio Permissions",
      checkAudioPermission.get(window.VideoSDK.Constants.permission.AUDIO)
    );
  } catch (e) {
    console.error(e.message);
  }

  try {
    const checkVideoPermission = await window.VideoSDK.checkPermissions(
      window.VideoSDK.Constants.permission.VIDEO,
    );
    console.log(
      "Check Video Permissions",
      checkVideoPermission.get(window.VideoSDK.Constants.permission.VIDEO)
    );
  } catch (e) {
    console.error(e.message);
  }

  try {
    const checkAudioVideoPermission = await window.VideoSDK.checkPermissions(
      window.VideoSDK.Constants.permission.AUDIO_AND_VIDEO,
    );
    console.log(
      "Check Audio Video Permissions",
      checkAudioVideoPermission.get(window.VideoSDK.Constants.permission.VIDEO),
      checkAudioVideoPermission.get(window.VideoSDK.Constants.permission.AUDIO)
    );
  } catch (e) {
    console.error(e.message);
  }

  */

  let checkAudioVideoPermission;

  try {
    checkAudioVideoPermission = await VideoSDK.checkPermissions(
      VideoSDK.Constants.permission.AUDIO_AND_VIDEO,
    );
    console.log(
      "check Audio and Video Permissions",
      checkAudioVideoPermission.get(VideoSDK.Constants.permission.AUDIO),
      checkAudioVideoPermission.get(VideoSDK.Constants.permission.VIDEO)
    );
  } catch (ex) {
    console.log("Error in checkPermissions ", ex);
  }


  if (checkAudioVideoPermission.get(window.VideoSDK.Constants.permission.VIDEO) === false || checkAudioVideoPermission.get(window.VideoSDK.Constants.permission.AUDIO) === false) {
    checkAudioVideoPermission = await window.VideoSDK.requestPermission(
      window.VideoSDK.Constants.permission.AUDIO_AND_VIDEO,
    );
  }






  // if(requestPermission.get(window.VideoSDK.Constants.permission.AUDIO)){
  //   console.log("permission check called");

  //   var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  //   svg.setAttribute("width", "20");
  //   svg.setAttribute("height", "20");
  //   svg.setAttribute("viewBox", "0 0 20 20");
  //   svg.setAttribute("fill", "none");

  //   svg.innerHTML = `
  //   <g filter="url(#filter0_d_20_967)">
  //   <circle cx="10" cy="8" r="8" fill="#FF8A00"/>
  //   </g>
  //   <path d="M10.876 4.258V7.69C10.876 8.058 10.854 8.424 10.81 8.788C10.766 9.148 10.708 9.516 10.636 9.892H9.37605C9.30405 9.516 9.24605 9.148 9.20205 8.788C9.15805 8.424 9.13605 8.058 9.13605 7.69V4.258H10.876ZM8.93205 12.058C8.93205 11.914 8.95805 11.78 9.01005 11.656C9.06605 11.532 9.14005 11.424 9.23205 11.332C9.32805 11.24 9.44005 11.168 9.56805 11.116C9.69605 11.06 9.83605 11.032 9.98805 11.032C10.136 11.032 10.274 11.06 10.402 11.116C10.53 11.168 10.642 11.24 10.738 11.332C10.834 11.424 10.908 11.532 10.96 11.656C11.016 11.78 11.044 11.914 11.044 12.058C11.044 12.202 11.016 12.338 10.96 12.466C10.908 12.59 10.834 12.698 10.738 12.79C10.642 12.882 10.53 12.954 10.402 13.006C10.274 13.058 10.136 13.084 9.98805 13.084C9.83605 13.084 9.69605 13.058 9.56805 13.006C9.44005 12.954 9.32805 12.882 9.23205 12.79C9.14005 12.698 9.06605 12.59 9.01005 12.466C8.95805 12.338 8.93205 12.202 8.93205 12.058Z" fill="white"/>
  //   <defs>
  //   <filter id="filter0_d_20_967" x="0" y="0" width="20" height="20" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
  //   <feFlood flood-opacity="0" result="BackgroundImageFix"/>
  //   <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
  //   <feOffset dy="2"/>
  //   <feGaussianBlur stdDeviation="1"/>
  //   <feComposite in2="hardAlpha" operator="out"/>
  //   <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
  //   <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_20_967"/>
  //   <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_20_967" result="shape"/>
  //   </filter>
  //   </defs>
  //   `
  //   document.querySelector(".video-content").appendChild(svg);
  // }

  console.log(
    "request Audio and Video Permissions",
    checkAudioVideoPermission.get(window.VideoSDK.Constants.permission.AUDIO),
    checkAudioVideoPermission.get(window.VideoSDK.Constants.permission.VIDEO)
  );

  if (checkAudioVideoPermission.get(window.VideoSDK.Constants.permission.AUDIO) === false) {
    document.getElementById("micButton").style.display = "none";
    document.getElementById("no-microphone-permission").style.display = "block";
  }

  if (checkAudioVideoPermission.get(window.VideoSDK.Constants.permission.VIDEO) === false) {
    document.getElementById("camButton").style.display = "none";
    document.getElementById("no-camera-permission").style.display = "block";
  }

  await updateDevices();
  await enableCam();
  await enableMic();

  // microphonePermission.addEventListener('click', async () => {
  //   console.log("microphone permission request called");
  //   try{
  //     requestPermission = await window.VideoSDK.requestPermission(
  //       window.VideoSDK.Constants.permission.AUDIO,
  //     );
  //     console.log("permission taken")
  //   }catch(e){
  //     console.log("Error while requesting microphone permission", e);
  //   }
  // })

  // cameraPermission.addEventListener('click', async () => {
  //   try{
  //     requestPermission = await window.VideoSDK.requestPermission(
  //       window.VideoSDK.Constants.permission.VIDEO,
  //     );
  //   }catch(e){
  //     console.log("Error while requesting camera permission", e);
  //   }
  // })
  deviceChangeEventListener = async (devices) => {
    await updateDevices();
    await enableCam();
  };
  window.VideoSDK.on("device-changed", deviceChangeEventListener);
  refreshButton.addEventListener('click', async () => {
  try {
      const refreshElement = document.getElementById("refresh");
      console.log(refreshElement);
      document.getElementById("download-speed-div").style.display = "none";
      document.getElementById("upload-speed-div").style.display = "none";
      document.getElementById("check-speed-div").style.display = "unset";
      document.getElementById("network-stats").style.marginLeft = "445px";
      refreshElement.firstElementChild.classList.remove("bi-arrow-clockwise");
      refreshElement.firstElementChild.classList.add("bi-arrow-repeat");
      refreshElement.classList.add("spin");
      const result = await window.VideoSDK.getNetworkStats({ timeoutDuration: 120000 });
      document.getElementById("download-speed-div").style.display = "flex";
      document.getElementById("upload-speed-div").style.display = "flex";
      document.getElementById("check-speed-div").style.display = "none";
      document.getElementById("network-stats").style.marginLeft = "375px";
      refreshElement.firstElementChild.classList.add("bi-arrow-clockwise");
      refreshElement.firstElementChild.classList.remove("bi-arrow-repeat");
      refreshElement.classList.remove("spin");
      document.getElementById("network-error-offline").style.display = "none";
      document.getElementById("network-error-online").style.display = "none";
      console.log("Network Stats : ", result);
      document.getElementById("download-speed").innerHTML = result["downloadSpeed"] + " MBPS";
      document.getElementById("upload-speed").innerHTML = result["uploadSpeed"] + " MBPS";
      document.getElementById("network-stats").style.display = "flex";
    } catch (error) {
      document.getElementById("network-stats").style.display = "none";
      console.log(error);
      if (error == "Not able to get NetworkStats due to no Network") {
        document.getElementById("network-error-offline").style.display = "flex";
        console.log("Error in Network Stats : ", error);
      } else if (error == "Not able to get NetworkStats due to timeout") {
        document.getElementById("network-error-online").style.display = "flex";
        console.log("Error in Network Stats : ", error);
      }
    }
  });

  networkErrorRefreshButton.forEach((refersh) => {
    refersh.addEventListener("click", async () => {
      try {
        const refreshElement = document.getElementById("refresh");
        console.log(refreshElement);
        refreshElement.firstElementChild.classList.remove("bi-arrow-clockwise");
        refreshElement.firstElementChild.classList.add("bi-arrow-repeat");
        refreshElement.classList.add("spin");
        document.getElementById("download-speed-div").style.display = "none";
        document.getElementById("upload-speed-div").style.display = "none";
        document.getElementById("check-speed-div").style.display = "unset";
        document.getElementById("network-stats").style.marginLeft = "445px";
        const result = await window.VideoSDK.getNetworkStats({ timeoutDuration: 120000 });
        // console.log("SUII");
        document.getElementById("download-speed-div").style.display = "flex";
        document.getElementById("upload-speed-div").style.display = "flex";
        document.getElementById("check-speed-div").style.display = "none";
        document.getElementById("network-stats").style.marginLeft = "375px";
        refreshElement.firstElementChild.classList.remove("bi-arrow-repeat");
        refreshElement.classList.remove("spin");
        refreshElement.firstElementChild.classList.add("bi-arrow-clockwise");
        document.getElementById("network-error-offline").style.display = "none";
        document.getElementById("network-error-online").style.display = "none";
        console.log("Network Stats : ", result);
        document.getElementById("download-speed").innerHTML = result["downloadSpeed"] + " MBPS";
        document.getElementById("upload-speed").innerHTML = result["uploadSpeed"] + " MBPS";
        document.getElementById("network-stats").style.display = "flex";
      } catch (error) {
        document.getElementById("network-stats").style.display = "none";
        console.log(error);
        if (error == "Not able to get NetworkStats due to no Network") {
          document.getElementById("network-error-offline").style.display = "flex";
          console.log("Error in Network Stats : ", error);
        } else if (error == "Not able to get NetworkStats due to timeout") {
          document.getElementById("network-error-online").style.display = "flex";
          console.log("Error in Network Stats : ", error);
        }
      }
    })
  })

  await window.VideoSDK.getNetworkStats({ timeoutDuration: 120000 })
    .then((result) => {
      const refreshElement = document.getElementById("refresh");
      document.getElementById("download-speed-div").style.display = "flex";
      document.getElementById("upload-speed-div").style.display = "flex";
      document.getElementById("check-speed-div").style.display = "none";
      document.getElementById("network-stats").style.marginLeft = "375px";
      // console.log("repeat removed")
      refreshElement.classList.remove("spin");
      refreshElement.firstElementChild.classList.remove("bi-arrow-repeat");
      refreshElement.firstElementChild.classList.add("bi-arrow-clockwise");
      document.getElementById("network-error-offline").style.display = "none";
      document.getElementById("network-error-online").style.display = "none";
      console.log("Network Stats : ", result);
      document.getElementById("download-speed").innerHTML = result["downloadSpeed"] + " MBPS";
      document.getElementById("upload-speed").innerHTML = result["uploadSpeed"] + " MBPS";
      document.getElementById("network-stats").style.display = "flex";
    })
    .catch((error) => {
      console.log(error);
      if (error == "Not able to get NetworkStats due to no Network") {
        document.getElementById("network-error-offline").style.display = "flex"
        console.log("Error in Network Stats : ", error);
      } else if (error == "Not able to get NetworkStats due to timeout") {
        document.getElementById("network-error-online").style.display = "flex"
        console.log("Error in Network Stats : ", error);
      }
    });


});


}
