import React from "react";
import s from "./style.module.css"

export type PropsTodo = {
    value: string,
    id: number,
    status: boolean,
    deleteTodo: Function,
    toggleTodo: Function,
}

const TodoItem = ({ value, deleteTodo, toggleTodo, id, status }: PropsTodo) => {

    return (
        <li className={s.wrap}>
            <div className={s.groop}>
                <input type={"checkbox"} checked={status}
                    readOnly={true}
                    onClick={() => toggleTodo(id)} ></input>
                <p className={s.title} >{value}</p>
            </div>
            <button onClick={() => deleteTodo(id)} className={s.btnDelete}>Удалить</button>
        </li>
    );
};

export default TodoItem;