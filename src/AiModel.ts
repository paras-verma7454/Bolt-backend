const { GoogleGenerativeAI } = require("@google/generative-ai");
import dotenv from 'dotenv';

dotenv.config();
const apiKey = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};
const CodeGenerationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

export const chatSession = model.startChat({
  generationConfig,
  history: [],
});

// const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
// console.log(result.response.text());

export const GenAICode = model.startChat({
  generationConfig: CodeGenerationConfig,
  history: [
    {
      role: "user",
      parts: [
        {
          text: ' generate todo app: Generate a Project in React. Create multiple components, organizing them in separate folders with filenames using the .tsx extension, if needed. The output should use Tailwind CSS for styling, \nwithout any third-party dependencies or libraries, except for icons from the lucide-react library, which should only be used when necessary. Available icons include: Heart, Shield, Clock, Users, Play, Home, Search, Menu, User, Settings, Mail, Bell, Calendar, Star, Upload, Download, Trash, Edit, Plus, Minus, Check, X, and ArrowRight. For example, you can import an icon as import { Heart } from "lucide-react" and use it in JSX as <Heart className="" />.\nalso you can use date-fns for date format and react-chartjs-2 chart, graph library\n\nReturn the response in JSON format with the following schema:\n{\n  "projectTitle": "",\n  "explanation": "",\n  "files": {\n    "/App.tsx": {\n      "code": ""\n    },\n    ...\n  },\n  "generatedFiles": []\n}\n\nHere’s the reformatted and improved version of your prompt:\n\nGenerate a programming code structure for a React project using Vite. Create multiple components, organizing them in separate folders with filenames using the .tsx extension, if needed. The output should use Tailwind CSS for styling, without any third-party dependencies or libraries, except for icons from the lucide-react library, which should only be used when necessary. Available icons include: Heart, Shield, Clock, Users, Play, Home, Search, Menu, User, Settings, Mail, Bell, Calendar, Star, Upload, Download, Trash, Edit, Plus, Minus, Check, X, and ArrowRight. For example, you can import an icon as import { Heart } from "lucide-react" and use it in JSX as <Heart className="" />.\n\nReturn the response in JSON format with the following schema:\n\njson\nCopy code\n{\n  "projectTitle": "",\n  "explanation": "",\n  "files": {\n    "/App.tsx": {\n      "code": ""\n    },\n    ...\n  },\n  "generatedFiles": []\n}\nEnsure the files field contains all created files, and the generatedFiles field lists all the filenames. Each file\'s code should be included in the code field, following this example:\nfiles:{\n  "/App.tsx": {\n    "code": "import React from \'react\';\\nimport \'./styles.css\';\\nexport default function App() {\\n  return (\\n    <div className=\'p-4 bg-gray-100 text-center\'>\\n      <h1 className=\'text-2xl font-bold text-blue-500\'>Hello, Tailwind CSS with Sandpack!</h1>\\n      <p className=\'mt-2 text-gray-700\'>This is a live code editor.</p>\\n    </div>\\n  );\\n}"\n  }\n}\n  Additionally, include an explanation of the project\'s structure, purpose, and functionality in the explanation field. Make the response concise and clear in one paragraph.\n  - When asked then only use this package to import, here are some packages available to import and use (date-fns,react-chartjs-2,"firebase","@google/generative-ai" ) only when it required\n  \n  - For placeholder images, please use a https://archive.org/download/placeholder-image/placeholder-image.jpg\n  -Add Emoji icons whenever needed to give good user experinence\n  - all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\n- By default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.\n\n- Use icons from lucide-react for logos.\n\n- Use stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags.\n   `,',
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: '```json\n{\n  "projectTitle": "React Todo App",\n  "explanation": "This React Todo App provides a user-friendly interface for managing tasks. It\'s built with components organized into separate folders, leveraging Tailwind CSS for styling, and lucide-react for essential icons. The application allows users to add, delete, and mark tasks as complete, enhancing productivity and task management. 🚀",\n  "files": {\n    "/App.tsx": {\n      "code": "import React, { useState, useEffect } from \'react\';\\nimport TodoList from \'./components/TodoList\';\\nimport AddTodo from \'./components/AddTodo\';\\nimport Header from \'./components/Header\';\\n\\nfunction App() {\\n  const [todos, setTodos] = useState(() => {\\n    const storedTodos = localStorage.getItem(\'todos\');\\n    return storedTodos ? JSON.parse(storedTodos) : [];\\n  });\\n\\n  useEffect(() => {\\n    localStorage.setItem(\'todos\', JSON.stringify(todos));\\n  }, [todos]);\\n\\n  const addTodo = (text) => {\\n    if(text.trim()){\\n      setTodos([...todos, { id: Date.now(), text, completed: false }]);\\n    }\\n    \\n  };\\n\\n  const toggleComplete = (id) => {\\n    setTodos(todos.map(todo =>\\n      todo.id === id ? { ...todo, completed: !todo.completed } : todo\\n    ));\\n  };\\n\\n  const deleteTodo = (id) => {\\n    setTodos(todos.filter(todo => todo.id !== id));\\n  };\\n\\n  return (\\n    <div className=\\"bg-gray-100 min-h-screen py-10\\">\\n      <div className=\\"container mx-auto p-4 bg-white shadow-md rounded-lg max-w-2xl\\">\\n        <Header/>\\n        <AddTodo addTodo={addTodo} />\\n        <TodoList todos={todos} toggleComplete={toggleComplete} deleteTodo={deleteTodo} />\\n      </div>\\n    </div>\\n  );\\n}\\n\\nexport default App;"\n    },\n    "/components/TodoList.tsx": {\n      "code": "import React from \'react\';\\nimport TodoItem from \'./TodoItem\';\\n\\nfunction TodoList({ todos, toggleComplete, deleteTodo }) {\\n  return (\\n    <ul className=\\"mt-4\\">\\n      {todos.map(todo => (\\n        <TodoItem key={todo.id} todo={todo} toggleComplete={toggleComplete} deleteTodo={deleteTodo} />\\n      ))}\\n    </ul>\\n  );\\n}\\n\\nexport default TodoList;"\n    },\n    "/components/TodoItem.tsx": {\n      "code": "import React from \'react\';\\nimport { Trash, Check } from \'lucide-react\';\\n\\nfunction TodoItem({ todo, toggleComplete, deleteTodo }) {\\n  return (\\n    <li className=\\"flex justify-between items-center py-2 border-b border-gray-200 last:border-none\\">\\n      <div className=\\"flex items-center\\">\\n        <input\\n          type=\\"checkbox\\"\\n          id={`todo-${todo.id}`}\\n          checked={todo.completed}\\n          onChange={() => toggleComplete(todo.id)}\\n          className=\\"mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded\\"\\n        />\\n        <label htmlFor={`todo-${todo.id}`} className={`text-gray-700 ${todo.completed ? \'line-through text-gray-400\' : \'\'}`}>\\n          {todo.text}\\n        </label>\\n      </div>\\n      <div className=\\"space-x-2\\">\\n        <button onClick={() => deleteTodo(todo.id)} className=\\"text-red-500 hover:text-red-700\\">\\n          <Trash className=\\"h-5 w-5\\"/>\\n        </button>\\n      </div>\\n    </li>\\n  );\\n}\\n\\nexport default TodoItem;"\n    },\n    "/components/AddTodo.tsx": {\n      "code": "import React, { useState } from \'react\';\\nimport { Plus } from \'lucide-react\';\\n\\nfunction AddTodo({ addTodo }) {\\n  const [text, setText] = useState(\'\');\\n\\n  const handleSubmit = (e) => {\\n    e.preventDefault();\\n    addTodo(text);\\n    setText(\'\');\\n  };\\n\\n  return (\\n    <form onSubmit={handleSubmit} className=\\"flex items-center\\">\\n      <input\\n        type=\\"text\\"\\n        value={text}\\n        onChange={(e) => setText(e.target.value)}\\n        placeholder=\\"Add a new task...\\"\\n        className=\\"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline\\"\\n      />\\n      <button type=\\"submit\\" className=\\"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2\\">\\n        <Plus className=\\"h-5 w-5\\"/>\\n      </button>\\n    </form>\\n  );\\n}\\n\\nexport default AddTodo;"\n    },\n    "/components/Header.tsx": {\n      "code": "import React from \'react\';\\n\\nfunction Header() {\\n  return (\\n    <header className=\\"text-center mb-6\\">\\n      <h1 className=\\"text-3xl font-bold text-gray-800\\">My Todo List 📝</h1>\\n      <p className=\\"text-gray-500\\">Stay organized and get things done! ✅</p>\\n    </header>\\n  );\\n}\\n\\nexport default Header;"\n    }\n  },\n  "generatedFiles": [\n    "/App.tsx",\n    "/components/TodoList.tsx",\n    "/components/TodoItem.tsx",\n    "/components/AddTodo.tsx",\n    "/components/Header.tsx"\n  ]\n}\n```',
        },
      ],
    },
  ],
});
