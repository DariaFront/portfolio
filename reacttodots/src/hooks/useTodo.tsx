import { useState } from "react";

export type Todo = {
    id: number,
    value: string,
    status: boolean
}

export type Todos = Array<Todo>

const useTodo = (initialvalue: string) => {
    const [todos, setTodos] = useState<Todos>([]);
    const [todo, setTodo] = useState<string>(initialvalue);
    const [done, setDone] = useState<Todo | string>('');
    let copytodos: Todos = todos

    let saveTodo = (todo: string) => {
        let task: Todo = {
            id: Math.random(),
            value: todo,
            status: false,
        }
        setTodos([task, ...todos]);
    }

    let deleteTodo = (key: number) => {
        setTodos(todos.filter((i, index) => index !== key));
    }

    let toggleTodo = (key: number) => {
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