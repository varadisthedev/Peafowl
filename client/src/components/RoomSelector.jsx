import { useState } from "react";

export default function RoomSelector({ onSelectRoom, currentRoomId }) {
  const [newRoomId, setNewRoomId] = useState("");
  const [rooms, setRooms] = useState(["room-1", "room-2", "general", "random"]);

  const handleAddRoom = () => {
    if (!newRoomId.trim()) {
      console.log("[RoomSelector] Empty room ID, not adding");
      return;
    }

    console.log("[RoomSelector] Adding new room:", newRoomId);
    if (!rooms.includes(newRoomId)) {
      setRooms([...rooms, newRoomId]);
    }
    setNewRoomId("");
  };

  const handleSelectRoom = (roomId) => {
    console.log("[RoomSelector] Selecting room:", roomId);
    onSelectRoom(roomId);
  };

  return (
    <div>
      <h3>[ROOM SELECTOR]</h3>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          value={newRoomId}
          onChange={(e) => setNewRoomId(e.target.value)}
          placeholder="Enter room ID"
          onKeyPress={(e) => e.key === "Enter" && handleAddRoom()}
        />
        <button onClick={handleAddRoom}>[CREATE/JOIN ROOM]</button>
      </div>

      <div>
        <p>[AVAILABLE ROOMS]</p>
        {rooms.map((room) => (
          <button
            key={room}
            onClick={() => handleSelectRoom(room)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: "5px",
              padding: "10px",
              backgroundColor: currentRoomId === room ? "#007bff" : "#f0f0f0",
              color: currentRoomId === room ? "#fff" : "#000",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            {room} {currentRoomId === room ? " ✓" : ""}
          </button>
        ))}
      </div>
    </div>
  );
}
