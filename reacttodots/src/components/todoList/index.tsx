import React from "react";
import TodoItem from "../todoItem";
import { PropsTodo } from "../todoItem"
import s from "./style.module.css"
import { Todo } from "../../hooks/useTodo"


type PropsItems = Array<PropsTodo>

type PropsList = {
    list: PropsItems,
    deleteTodo: Function,
    toggleTodo: Function,
    saveTodo: Function,
    setTodo: Function,
    setTodos: Function,
}

const TodoList = ({ list, deleteTodo, toggleTodo }: PropsList) => {
    return (
        <div className={s.list}>
            {list.map((item, index) => {
                return (
                    <TodoItem
                        toggleTodo={toggleTodo}
                        deleteTodo={deleteTodo}
                        id={index}
                        key={index}
                        value={item.value}
                        status={item.status}
                    />
                );
            })}
        </div>
    );
};

export default TodoList;