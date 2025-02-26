import React from "react";
import s from "./style.module.css"


// type PropTitle = {
//     title: string,
// }
// const TodoListTitle = ({ title }: PropTitle) => {
const TodoListTitle = (title) => {
    // return <h1 >{title}</h1>
    return <h1 className={s.title}>{title}</h1>
};

export default TodoListTitle;