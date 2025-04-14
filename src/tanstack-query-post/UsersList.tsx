import type { User } from './apiClient'

export function UsersList({ users }: { users: Array<User> }) {
  return (
    <ul className="flex flex-col gap-2">
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
