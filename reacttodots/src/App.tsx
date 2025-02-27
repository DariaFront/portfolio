import TodoForm from "./components/todoForm";
import TodoListTitle from "./components/todoTitle";
import TodoList from "./components/todoList";
import { Todos } from "./hooks/useTodo"
import { useState } from "react";
import { Todo } from "./hooks/useTodo"

const App = () => {

  const [todos, setTodos] = useState<Todos>([]);
  const [todo, setTodo] = useState<Todo | string>('');

  const saveTodo = (value: string): void => {
    let task: Todo = {
      id: Math.random(),
      value: value,
      status: false,
    }
    setTodos([task, ...todos]);
  }

  const deleteTodo = (key: number): void => {
    setTodos(todos.filter((i, index) => index !== key));
  }

  const toggleTodo = (key: number): void => {
    setTodos(todos.map((e, index) => index === key ? { ...e, status: !e.status } : { ...e }))
  }

  const [done, setDone] = useState('')
  let copytodos = todos

  switch (done) {
    case "all":
      copytodos = todos
      break;
    case "active":
      copytodos = todos.filter(item => item.status === false)
      break;
    case "ready":
      copytodos = todos.filter(item => item.status === true)
      break;
    default:
      break;
  }


  return (
    <div className="container">
      <TodoListTitle title={"Список дел"} />
      <TodoForm saveTodo={saveTodo} todos={todos} setTodo={setTodo} setTodos={setTodos} todo={todo} />
      <TodoList deleteTodo={deleteTodo} toggleTodo={toggleTodo} list={copytodos} />

      <button onClick={() => setDone("all")}>All</button>
      <button onClick={() => setDone("active")}>Active</button>
      <button onClick={() => setDone("ready")}>Ready</button>
    </div>
  );
}

export default App;
