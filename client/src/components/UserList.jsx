export default function UserList({ users, typingUsers }) {
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
              {typingUsers[user] && <span> [TYPING...]</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
