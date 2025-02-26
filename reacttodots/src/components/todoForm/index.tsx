import React from "react";
import s from "./style.module.css"
import { Todo, Todos } from "../../hooks/useTodo"

type formProps<Todo> = {
    todo: Todo,
    saveTodo: any,
    setTodos: any,
    setTodo: any,
    todos: any
}

const TodoForm = (props: formProps<Todo>) => {
    return (
        <form className={s.form}
            onSubmit={(e) => {
                e.preventDefault();
                props.saveTodo(props.todo.value);
                props.setTodo("")
            }}
        >
            <input
                className={s.input}
                value={props.todo.value}
                onChange={(e) => props.setTodo(e.target.value)}
                placeholder="Введите название дела"
            />
            <button className={s.btn} >Добавить дело</button>
        </form>
    );
}

export default TodoForm;