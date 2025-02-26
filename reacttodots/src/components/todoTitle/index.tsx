import React from "react";
import s from "./style.module.css"

const TodoListTitle = ({ title }: { title: string }) => {

    return <h1 className={s.title}>{title}</h1>
};

export default TodoListTitle;