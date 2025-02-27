import TodoItem from "../todoItem";
import s from "./style.module.css"
import { Todo } from "../../hooks/useTodo"

type PropsList = {
    list: any,
    deleteTodo: Function | any,
    toggleTodo: Function | any,

}

const TodoList = ({ list, deleteTodo, toggleTodo }: PropsList) => {

    return (
        <div className={s.list}>
            {list.map((item: Todo, index: number) => {
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
}



export default TodoList;