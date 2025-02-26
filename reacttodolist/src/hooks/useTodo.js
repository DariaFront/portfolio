import { useState } from "react";

const useTodo = (initialvalue) => {
    const [todos, setTodos] = useState([]);
    const [todo, setTodo] = useState(initialvalue);
    const [done, setDone] = useState('');
    let copytodos = todos

    let saveTodo = (todo) => {
        let task = {
            id: Math.random(),
            value: todo,
            status: false,
        }
        setTodos([task, ...todos]);
    }

    let deleteTodo = (key) => {
        setTodos(todos.filter((i, index) => index !== key));
    }

    let toggleTodo = (key) => {

        setTodos(todos.map((e, index) => index === key ? { ...e, status: !e.status } : { ...e }))
    }

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

    return [copytodos, todos, saveTodo, deleteTodo, toggleTodo, setTodos, todo, setTodo, setDone];
}

export default useTodo