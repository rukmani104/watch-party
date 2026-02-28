import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

function App() {
  const socketRef = useRef(null);
  const playerRef = useRef(null);

  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [videoId, setVideoId] = useState("dQw4w9WgXcQ");
  const [roomData, setRoomData] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // Load YouTube API
  const loadYouTubeAPI = () =>
    new Promise((resolve) => {
      if (window.YT && window.YT.Player) return resolve();
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      window.onYouTubeIframeAPIReady = () => resolve();
      document.body.appendChild(tag);
    });

  // Socket initialization
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("sync_state", ({ videoId, currentTime, isPlaying }) => {
      setVideoId(videoId);
      setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.seekTo(currentTime || 0);
          if (isPlaying) playerRef.current.playVideo();
          else playerRef.current.pauseVideo();
        }
      }, 700);
    });

    socketRef.current.on("room_update", (data) => setRoomData(data));
    socketRef.current.on("play", () => playerRef.current?.playVideo());
    socketRef.current.on("pause", () => playerRef.current?.pauseVideo());
    socketRef.current.on("seek", ({ time }) => playerRef.current?.seekTo(time));
    socketRef.current.on("change_video", ({ videoId }) => setVideoId(videoId));

    socketRef.current.on("chat_message", ({ username, message }) => {
      setChatMessages((prev) => [...prev, { username, message }]);
    });

    socketRef.current.on("removed", () => {
      alert("You have been removed from the room.");
      setJoined(false);
      setRoomId("");
    });

    return () => socketRef.current.disconnect();
  }, []);

  // Initialize YouTube player
  useEffect(() => {
    if (!joined) return;

    const createPlayer = () => {
      if (playerRef.current) playerRef.current.destroy();

      playerRef.current = new window.YT.Player("player", {
        height: "390",
        width: "640",
        videoId,
        playerVars: { controls: 1, disablekb: 1, modestbranding: 1 },
        events: {
          onReady: () => {
            const isHostOrMod = ["HOST", "MODERATOR"].includes(
              roomData?.users[socketRef.current?.id]?.role
            );

            if (!isHostOrMod) playerRef.current.pauseVideo();
            setDuration(playerRef.current.getDuration() || 0);

            if (isHostOrMod) {
              playerRef.current.addEventListener("onStateChange", (event) => {
                const state = event.data;
                const time = playerRef.current.getCurrentTime();
                setCurrentTime(time);
                if (state === window.YT.PlayerState.PLAYING) socketRef.current.emit("play", { roomId, currentTime: time });
                if (state === window.YT.PlayerState.PAUSED) socketRef.current.emit("pause", { roomId, currentTime: time });
              });
            }
          },
        },
      });
    };

    loadYouTubeAPI().then(createPlayer);
  }, [joined, videoId, roomData]);

  // Actions
  const joinRoom = () => {
    if (!roomId || !username) return;
    socketRef.current.emit("join_room", { roomId, username });
    setJoined(true);
  };

  const handlePlay = () => {
    const time = playerRef.current?.getCurrentTime() || 0;
    socketRef.current.emit("play", { roomId, currentTime: time });
  };
  const handlePause = () => {
    const time = playerRef.current?.getCurrentTime() || 0;
    socketRef.current.emit("pause", { roomId, currentTime: time });
  };
  const handleSeek = () => {
    const time = playerRef.current?.getCurrentTime();
    socketRef.current.emit("seek", { roomId, time });
  };
  const changeVideo = () => {
    const url = prompt("Enter YouTube URL or Video ID");
    if (!url) return;
    const newId = url.includes("v=") ? url.split("v=")[1].split("&")[0] : url;
    socketRef.current.emit("change_video", { roomId, videoId: newId });
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    socketRef.current.emit("chat_message", { roomId, username, message: chatInput });
    setChatInput("");
  };

  // UI
  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f0f2f5", fontFamily: "Arial, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "800px", backgroundColor: "#fff", padding: "30px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", textAlign: "center" }}>
        {!joined ? (
          <>
            <h2 style={{ marginBottom: "20px", color: "#333" }}>Join Watch Party</h2>
            <input placeholder="Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} style={{ width: "80%", padding: "10px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ccc" }} />
            <br />
            <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: "80%", padding: "10px", marginBottom: "20px", borderRadius: "8px", border: "1px solid #ccc" }} />
            <br />
            <button onClick={joinRoom} style={{ padding: "10px 25px", borderRadius: "8px", backgroundColor: "#4caf50", color: "#fff", border: "none", cursor: "pointer" }}>Join</button>
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: "15px" }}>Room: {roomId} <span style={{ fontSize: "14px", color: "#666" }}>({Object.keys(roomData?.users || {}).length} participants)</span></h2>
            <div id="player" style={{ marginBottom: "15px", borderRadius: "12px", overflow: "hidden" }}></div>
            <progress value={currentTime} max={duration || 100} style={{ width: "100%", height: "12px", borderRadius: "6px", marginBottom: "20px" }}></progress>

            {/* Host + Moderator Controls */}
            {roomData &&
              ["HOST", "MODERATOR"].includes(roomData.users[socketRef.current?.id]?.role) && (
                <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center", gap: "10px" }}>
                  <button onClick={handlePlay} style={{ padding: "8px 16px", borderRadius: "8px", backgroundColor: "#2196f3", color: "#fff", border: "none", cursor: "pointer" }}>Play</button>
                  <button onClick={handlePause} style={{ padding: "8px 16px", borderRadius: "8px", backgroundColor: "#f44336", color: "#fff", border: "none", cursor: "pointer" }}>Pause</button>
                  <button onClick={handleSeek} style={{ padding: "8px 16px", borderRadius: "8px", backgroundColor: "#ff9800", color: "#fff", border: "none", cursor: "pointer" }}>Sync Seek</button>
                  <button onClick={changeVideo} style={{ padding: "8px 16px", borderRadius: "8px", backgroundColor: "#9c27b0", color: "#fff", border: "none", cursor: "pointer" }}>Change Video</button>
                </div>
            )}

            <hr style={{ margin: "20px 0" }} />
            <h3 style={{ marginBottom: "15px" }}>Participants</h3>
            {roomData &&
              Object.entries(roomData.users).map(([id, user]) => (
                <div key={id} style={{ marginBottom: "8px", padding: "8px", borderRadius: "8px", backgroundColor: user.role === "HOST" ? "#fff3e0" : "#f5f5f5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <b>{user.username}</b> <span style={{ fontSize: "12px", color: "#555" }}>({user.role})</span>
                  </div>
                  {roomData.users[socketRef.current?.id]?.role === "HOST" && user.role !== "HOST" && (
                    <div>
                      <button onClick={() => socketRef.current.emit("make_host", { roomId, userId: id })} style={{ marginRight: "5px", padding: "4px 8px", borderRadius: "6px", cursor: "pointer" }}>Make Host</button>
                      <button onClick={() => socketRef.current.emit("remove_user", { roomId, userId: id })} style={{ padding: "4px 8px", borderRadius: "6px", cursor: "pointer" }}>Remove</button>
                    </div>
                  )}
                </div>
              ))}

            {/* Chat Section */}
            <hr style={{ margin: "20px 0" }} />
            <h3>Chat</h3>
            <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc", padding: "8px", marginBottom: "8px", textAlign: "left", borderRadius: "8px", backgroundColor: "#fafafa" }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx}><b>{msg.username}:</b> {msg.message}</div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
              <input
                placeholder="Type a message"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
                onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
              />
              <button onClick={sendChatMessage} style={{ padding: "8px 12px", borderRadius: "8px", backgroundColor: "#4caf50", color: "#fff", border: "none", cursor: "pointer" }}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;