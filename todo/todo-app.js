(function () {
  let arr = [];
  listName = '';

  function createAppTitle(title) {
    let appTitle = document.createElement('h2');
    appTitle.innerHTML = title;
    return appTitle;
  }

  function createTodoItemForm() {
    let form = document.createElement('form');
    let input = document.createElement('input');
    let buttonWrapper = document.createElement('div');
    let button = document.createElement('button');

    form.classList.add('input-group', 'mb-3');
    input.classList.add('form-control');
    input.placeholder = 'Введите название нового дела';
    buttonWrapper.classList.add('input-group-append');
    button.textContent = 'Добавить дело';
    button.disabled = true;

    buttonWrapper.append(button);
    form.append(input);
    form.append(buttonWrapper);

    input.addEventListener('input', function () {
      if (input.value !== '') {
        button.disabled = false;
      }
    });
    return {
      form,
      input,
      button,
    };
  }

  function createTodoList() {
    let list = document.createElement('ul');
    list.classList.add('list-group');
    return list;
  }

  function createTodoItem(obj) {
    let item = document.createElement('li');
    let buttonGroup = document.createElement('div');
    let doneButton = document.createElement('button');
    let deleteButton = document.createElement('button');

      if (obj.done === true) {
      item.classList.toggle('list-group-item-success');
      }

    item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-item-center');
    item.textContent = obj.name;
    buttonGroup.classList.add('btn-group', 'btn-group-sm');
    doneButton.classList.add('btn', 'btn-success');
    doneButton.textContent = 'Готово';

    deleteButton.classList.add('btn', 'btn-danger');
    deleteButton.textContent = 'Удалить';

    doneButton.addEventListener('click', function () {
      item.classList.toggle('list-group-item-success');
      for (let arrObject of arr) {
        if (arrObject.id == obj.id) {
          if (arrObject.done === false) {
            arrObject.done = true;
          }
          else {
            arrObject.done = false;
          }
        }
      }
      saveList(arr, listName);
    });

    deleteButton.addEventListener('click', function () {
      if (confirm('Вы уверенны?')) {
        item.remove();
        for (let i = 0; i < arr.length; i++) {
           (arr.splice(arr.indexOf(obj), 1));
        }
      }
      saveList(arr, listName);
    });


    buttonGroup.append(doneButton);
    buttonGroup.append(deleteButton);
    item.append(buttonGroup);

    return {
      arr,
      item,
      doneButton,
      deleteButton,
    };
  }

  function saveList(arrMemory, keyName) {
    localStorage.setItem( keyName, JSON.stringify(arrMemory));
  }

  function createTodoApp(container, title = 'Список дел',  keyName) {
    let todoAppTitle = createAppTitle(title);
    let { form, input, button } = createTodoItemForm();
    let todoList = createTodoList();

    listName = keyName;

    container.append(todoAppTitle);
    container.append(form);
    container.append(todoList);

    if (localStorage.getItem(listName) !== null && localStorage.getItem(listName) !== '') {
      arr = JSON.parse(localStorage.getItem(listName));
    }
    else {
      localStorage.setItem(listName, JSON.stringify(arr));
    }

    for (let object of arr) {
      todoList.append(createTodoItem(object).item);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!input.value.trim()) {
        return;
      }
      let inputValue = input.value;

      function createIdObj(array) {
        return array.length != 0 ? array[array.length - 1].id + 1 : 1
      };

      let objeck = {
        id: createIdObj(arr),
        name: inputValue,
        done: false
      }

      arr.push(objeck);

      todoList.append(createTodoItem(objeck).item);
      saveList(arr, listName);
      input.value = '';
      button.disabled = true;
    });
  }

  window.createTodoApp = createTodoApp;

})();




