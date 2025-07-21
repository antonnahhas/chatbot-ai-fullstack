import './App.css';
import { Button } from './components/ui/Button';
import { Sidebar } from './components/ui/Sidebar';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Button>Send</Button>
        <Sidebar>
          <button className="text-left w-full px-3 py-2 hover:bg-gray-800 rounded">New Chat</button>
          <button className="text-left w-full px-3 py-2 hover:bg-gray-800 rounded">History</button>
        </Sidebar>
      </header>
    </div>
  );
}

export default App;
