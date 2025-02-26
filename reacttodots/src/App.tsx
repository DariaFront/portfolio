import TodoForm from "./components/todoForm";
import TodoListTitle from "./components/todoTitle";
import TodoList from "./components/todoList";
import useTodo from "./hooks/useTodo";
import { Todos } from "./hooks/useTodo"
import { Todo } from "./hooks/useTodo"

const App = () => {

  const [copytodos, todos, saveTodo, deleteTodo, toggleTodo, setTodos, todo, setTodo, setDone] = useTodo<Todos | string>([]);

  return (
    <div className="container">
      <TodoListTitle title={"Список дел"} />
      <TodoForm saveTodo={saveTodo} todos={todos} setTodo={setTodo} setTodos={setTodos} />
      <TodoList deleteTodo={deleteTodo} toggleTodo={toggleTodo} list={copytodos} />

      <button onClick={() => setDone<Todo | string>("all")}>All</button>
      <button onClick={() => setDone<Todo | string>("active")}>Active</button>
      <button onClick={() => setDone<Todo | string>("ready")}>Ready</button>
    </div>
  );
}

export default App;
