import React from "react";
import s from "./style.module.css"
import TodoItem from "../todoItem";

const TodoList = ({ list, deleteTodo, toggleTodo }) => {
    return (
        <div className={s.list}>
            {list.map((item, index) => {
                return (
                    <TodoItem
                        toggleTodo={toggleTodo}
                        deleteTodo={deleteTodo}
                        id={index}
                        key={index}
                        todo={item}
                        status={item.status}
                    />
                );
            })}
        </div>
    );
};

export default TodoList;