import TodoForm from "./components/todoForm";
import TodoListTitle from "./components/todoTitle";
import TodoList from "./components/todoList"
import useTodo from "./hooks/useTodo";


const App = () => {

  const [copytodos, todos, saveTodo, deleteTodo, toggleTodo, setTodos, todo, setTodo, setDone] = useTodo([]);

  return (
    <div className="container">
      <TodoListTitle title={"Список дел"} />
      <TodoForm saveTodo={saveTodo} todo={todo} todos={todos} setTodo={setTodo} setTodos={setTodos} />
      <TodoList deleteTodo={deleteTodo} toggleTodo={toggleTodo} list={copytodos} />

      <button onClick={() => setDone("all")}>All</button>
      <button onClick={() => setDone("active")}>Active</button>
      <button onClick={() => setDone("ready")}>Ready</button>
    </div>
  );
}

export default App;

