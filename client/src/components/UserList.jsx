export default function UserList({ users, typingUsers, currentUserId }) {
  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "10px",
        border: "1px solid #ddd",
      }}
    >
      <h3>[USERS IN ROOM]</h3>
      {users.length === 0 ? (
        <p>[INFO] No users yet</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user}>
              {user}
              {user === currentUserId && <span> (you)</span>}
              {typingUsers[user] && user !== currentUserId && (
                <span style={{ color: "#6b7280", fontStyle: "italic" }}>
                  {" "}
                  · typing…
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
