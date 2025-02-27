import s from "./style.module.css"


const TodoForm = (props: any) => {
    return (
        <form className={s.form}
            onSubmit={(e) => {
                e.preventDefault();
                props.saveTodo(props.todo);
                props.setTodo("")
            }}
        >
            <input
                className={s.input}
                value={props.todo}
                onChange={(e) => props.setTodo(e.target.value)}
                placeholder="Введите название дела"
            />
            <button className={s.btn} >Добавить дело</button>
        </form>
    );
}

export default TodoForm;