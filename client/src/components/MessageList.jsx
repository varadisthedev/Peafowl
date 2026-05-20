import { useState } from "react";

export default function MessageList({
  messages,
  currentUser,
  onDeleteMessage,
  onEditMessage,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const handleEditStart = (messageId, content) => {
    console.log("[MessageList] Starting edit for message:", messageId);
    setEditingId(messageId);
    setEditContent(content);
  };

  const handleEditSave = (messageId) => {
    console.log("[MessageList] Saving edit for message:", messageId);
    onEditMessage(messageId, editContent);
    setEditingId(null);
    setEditContent("");
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "10px",
        height: "400px",
        overflowY: "auto",
        marginBottom: "10px",
      }}
    >
      <h3>[MESSAGE HISTORY]</h3>
      {messages.length === 0 ? (
        <p>[INFO] No messages yet</p>
      ) : (
        messages.map((msg) => (
          <div
            key={msg._id}
            style={{
              marginBottom: "10px",
              padding: "8px",
              border: "1px solid #eee",
              backgroundColor: msg.sender === currentUser ? "#f0f0f0" : "#fff",
            }}
          >
            <strong>[{msg.sender}]</strong>{" "}
            {msg.isEdited && <span>[EDITED]</span>}
            <br />
            <small>{new Date(msg.timestamp).toLocaleString()}</small>
            <div>
              {editingId === msg._id ? (
                <>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={{ width: "100%", marginTop: "5px" }}
                  />
                  <button onClick={() => handleEditSave(msg._id)}>
                    [SAVE EDIT]
                  </button>
                  <button onClick={() => setEditingId(null)}>[CANCEL]</button>
                </>
              ) : (
                <>
                  <p>{msg.content}</p>
                  {msg.sender === currentUser && (
                    <>
                      <button
                        onClick={() => handleEditStart(msg._id, msg.content)}
                      >
                        [EDIT]
                      </button>
                      <button onClick={() => onDeleteMessage(msg._id)}>
                        [DELETE]
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
