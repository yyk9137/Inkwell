export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <aside className="w-64 bg-gray-800 p-4 border-r border-gray-700">
        <h1 className="text-xl font-bold mb-4">Inkwell</h1>
        <p className="text-gray-400 text-sm">Character list placeholder</p>
      </aside>
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-auto">
          <p className="text-gray-400">Chat area placeholder</p>
        </div>
        <div className="p-4 border-t border-gray-700">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full bg-gray-800 text-white rounded px-4 py-2 outline-none focus:ring-1 focus:ring-blue-500"
            disabled
          />
        </div>
      </main>
    </div>
  )
}
