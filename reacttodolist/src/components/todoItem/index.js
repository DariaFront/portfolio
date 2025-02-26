import React from "react";
import s from "./style.module.css"


const TodoItem = ({ todo, deleteTodo, toggleTodo, id, status }) => {

    return (
        <div className={s.wrap}>
            <div className={s.groop}>
                <input type={"checkbox"} checked={status}
                    readOnly={true}
                    onClick={() => toggleTodo(id)} ></input>
                <p className={s.title} style={todo.status ? { textDecoration: "line-through" } : { textDecoration: "none" }}>{todo.value}</p>
            </div>

            <button onClick={() => deleteTodo(id)} className={s.btnDelete}>Удалить</button>

        </div>
    );
};

export default TodoItem;