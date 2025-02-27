import TodoForm from "./components/todoForm";
import TodoListTitle from "./components/todoTitle";
import TodoList from "./components/todoList";
import { Todos } from "./types/types"
import { useState } from "react";
import { Todo } from "./types/types"

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
    setTodos(todos.filter((item, index) => index !== key));
  }

  const toggleTodo = (key: number): void => {
    setTodos(todos.map((item, index) => index === key ? { ...item, status: !item.status } : { ...item }))
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
  let count: number = (todos.filter(item => item.status === false)).length;

  const clearReady = (todos: Todos): void => {
    setTodos(todos.filter(item => item.status === false))
  }
  return (
    <div className="container">
      <TodoListTitle title={"Список дел"} />
      <TodoForm saveTodo={saveTodo} todos={todos} setTodo={setTodo} setTodos={setTodos} todo={todo} />
      <TodoList deleteTodo={deleteTodo} toggleTodo={toggleTodo} list={copytodos} />
      <div className="btnGroop">
        <button className="all" onClick={() => setDone("all")}>весь список</button>
        <button className="active" onClick={() => setDone("active")}>ожидают</button>
        <button className="ready" onClick={() => setDone("ready")}>выполнено</button>
        <button className="clean" onClick={() => clearReady(todos)}>очистить готовые</button>
      </div>
      <p className="count">{count} осталось выполнить</p>

    </div>
  );
}

export default App;
