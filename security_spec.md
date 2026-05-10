# Security Specification - IPTV Manager Pro

## Data Invariants
1. A client document must always have an `ownerId` matching the authenticated user.
2. The `expirationDate` must be a valid timestamp.
3. Clients can only be read/written by their owner.
4. `createdAt` is immutable.
5. `updatedAt` must be updated on every write.

## The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Attempt to create a client with an `ownerId` belonging to another user.
2. **Resource Poisoning**: Use a 2KB string as a document ID.
3. **Ghost Field injection**: Add `isAdmin: true` to a client document.
4. **State Shortcutting**: Change a client's status directly without being the owner.
5. **PII Leak**: Attempt to list all clients without being signed in.
6. **Immutable Breach**: Attempt to change `createdAt` date.
7. **Orphaned Record**: Create a client without a name.
8. **Negative Size**: Send a string with negative size (if possible in transport, rules block it).
9. **Type Mismatch**: Send `expirationDate` as a boolean.
10. **Unauthorized Read**: Try to `get` a client that belongs to another user.
11. **Mass Delete**: Attempt to delete all clients.
12. **Malicious Query**: Query clients without filtering by `ownerId`.

## Test Runner (Draft)
The following tests verify the security boundaries:
- `get(/clients/any)` -> DENIED for unauth.
- `create(/clients/doc)` -> DENIED if `ownerId != auth.uid`.
- `update(/clients/doc)` -> DENIED if `ownerId` changes.
- `list(/clients)` -> DENIED if query doesn't filter by `ownerId`.
