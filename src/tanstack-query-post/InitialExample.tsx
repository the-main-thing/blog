import { useState, useEffect } from 'react'
import { createApiClient, type User } from './apiClient'

const apiClient = createApiClient()

function App() {
  const [users, setUsers] = useState<Array<User> | undefined>()
  useEffect(() => {
    apiClient.getAllUsers().then(setUsers)
  }, [])

  if (!users) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  )
}
