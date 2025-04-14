export interface User {
  id: number
  name: string
  email: string
}

const NAMES = ['Mohamed', 'Seo-jun', 'John', 'Sofia', 'Tanya', 'Jia', 'Lyoha']

export function createApiClient() {
  const database = NAMES.map((name, i) => ({
    id: i + 1,
    name,
    email: `${name.toLowerCase()}@example.com`,
  }))

  async function insert(user: Omit<User, 'id'>) {
    await sleep(randInt(100, 800))
    const id = database.length + 1
    const newUser = { id, ...user }
    database.push(newUser)
    return newUser
  }

  async function update(user: User) {
    await sleep(randInt(200, 600))
    const index = database.findIndex((u) => u.id === user.id)
    if (index === -1) {
      return null
    }
    database[index] = user
    return user
  }

  async function deleteUser(id: number) {
    await sleep(randInt(100, 500))
    const index = database.findIndex((u) => u.id === id)
    if (index === -1) {
      return null
    }
    database.splice(index, 1)
    return id
  }

  async function getUser(id: number) {
    await sleep(randInt(100, 500))
    const index = database.findIndex((u) => u.id === id)
    if (index === -1) {
      return null
    }
    return database[index]
  }

  async function getAllUsers() {
    await sleep(randInt(10, 200))
    const currentState = database.slice()
    await sleep(randInt(200, 1000))
    return currentState
  }

  return {
    insert,
    update,
    deleteUser,
    getUser,
    getAllUsers,
  }
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export 
