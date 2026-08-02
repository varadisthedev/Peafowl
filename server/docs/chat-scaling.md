# Chat fanout: why direct broadcast, and when to revisit

## Current design (single instance)

`features/chat/chat.gateway.ts` broadcasts chat events directly via Socket.IO's
`io.to(roomId).emit(...)` / `socket.to(roomId).emit(...)`. No Redis is involved in
the message-delivery path. Messages are still persisted to Postgres first
(`messages.service.ts`'s `saveMessage`), so chat history is durable regardless of
how live delivery works — only the *live push* mechanism changed.

Redis is still used elsewhere in the backend (OTP/pending-user TTL storage in
`auth.service.ts`, and the distributed rate limiter), just not for chat fanout.

## Why this app doesn't use Redis pub/sub for chat

A previous iteration of this code used Redis `PUBLISH`/`SUBSCRIBE` so that any
server instance could broadcast a chat event to sockets connected to *other*
instances (needed for horizontal scaling — a load balancer can put two clients
in the same room on two different server processes). That was dropped because:

1. **This app runs a single server instance** (`docker-compose.yml` defines one
   `server` service, no replicas). A cross-instance fanout mechanism has zero
   effect when there's only one instance to fan out to — it was pure overhead.
2. **Plain Redis pub/sub loses messages under exactly the failure mode you'd hit
   in production**: if a subscriber's connection is down or reconnecting at the
   moment of `PUBLISH` (a deploy, a network blip, a brief Redis hiccup), that
   event is gone for that instance — no persistence, no replay, nothing to
   resume from. For a chat app, that means client B's live view silently misses
   messages that client A sent, with no error surfaced anywhere.

## What to do if horizontal scaling becomes necessary

Don't re-introduce plain pub/sub — it has the message-loss problem above by
design. Redis Streams (`XADD`/`XREAD`) fixes this because entries persist in the
stream and a reader resumes from a cursor instead of only seeing events published
while it happened to be connected.

A working prototype of this is preserved in
[`docs/redis-streams-reference/`](./redis-streams-reference) — `chatPublisher.ts.txt`
appends events via `XADD`, `chatSubscriber.ts.txt` runs a blocking `XREAD` loop and
fans out to local Socket.IO clients. **Before enabling it**, close one gap in that
prototype: it tracks the read cursor (`lastId`) in an in-memory variable, so a
*brief* disconnect resumes correctly, but a full process restart resets to `$`
(latest) and silently skips whatever was published while the process was down.
That's fine for the fanout layer alone (Postgres is still the durable source of
truth, and reconnecting clients re-fetch history over REST), but if you want
zero-gap live delivery across restarts too, switch to a **consumer group**
(`XGROUP CREATE`, `XREADGROUP`, `XACK`) — Redis stores the last-acknowledged ID
server-side per consumer group, so a restarted instance picks up exactly where it
left off instead of relying on process memory. Also add `MAXLEN ~` trimming on
`XADD` so the stream doesn't grow unbounded.

To bring it back: restore the three files under `features/chat/` (drop the
`.txt` extensions, update imports to match whatever the module layout looks like
at that point), wire `initChatSubscriber`/`stopChatSubscriber` back into
`index.ts`'s startup/shutdown, and add the consumer-group change above before
relying on it in production.
