let clientList = [];
let serverDataObj;
let serverDataObject;
let serverClient;
let contactTitle;
let contactInput;
let filteredArr = [];
const SERVER_URL = 'http://localhost:3000';

tippy('[data-tippy-content]')


function validation(form) {
  let rezult = true;

  let regex = /^[а-яА-ЯЁё\s]+$/;
  if (regex.test(document.getElementById('name-1').value) === false || (document.getElementById('name-1').value).trim() == "") {
    createErrorInput(document.getElementById('name-1'), "Пожалуйста, введите правильную фамилию");
    rezult = false;
  }

  if (regex.test(document.getElementById('name-2').value) === false || (document.getElementById('name-2').value).trim() == "") {
    createErrorInput(document.getElementById('name-2'), "Пожалуйста, введите правильное имя");
    rezult = false;
  }

  if (regex.test(document.getElementById('name-3').value) === false) {
    createErrorInput(document.getElementById('name-3'), "Пожалуйста, введите отчество или пробел");
    rezult = false;
  }

  return rezult;
}

function errorlabelDelete() {
  let allEror = document.querySelectorAll('.error-label');
  allEror.forEach((inpError) => {
    removeEror(inpError);
  });
}

function createErrorInput(input, text) {
  const parentLine = input;
  parentLine.classList.add('errorLine');
  const parent = input.parentNode;
  const errorLabel = document.createElement('label');;
  errorLabel.classList.add('error-label');
  errorLabel.textContent = text;
  parent.classList.add('error');
  parent.append(errorLabel)
}

function removeEror(input) {
  const parent = input.parentNode;
  if (parent.classList.contains('error')) {
    let erroDiv = document.querySelector('.error-label');
    erroDiv.remove();
    let erroParent = document.querySelector('.error');
    erroParent.classList.remove('error');
    let erroParentLine = document.querySelector('.errorLine');
    erroParentLine.classList.remove('errorLine');
  }
}

function createErrorText(text) {
  const $errorText = document.createElement('p');
  $errorText.classList.add('red');
  text!== ''? $errorText.textContent = `${text}`: $errorText.textContent = 'Что-то пошло не так...';
  return $errorText
}

function createErrorGet(text) {
  const $modalScreenGet = createModalScreen();
  const $modalError = createModalBox();
  const $closeBut = createCloseX()
  const $errorGetText = createErrorText(text);

  $modalError.append($closeBut, $errorGetText);
  $modalScreenGet.append($modalError)
  document.body.append($modalScreenGet);

  $closeBut.addEventListener('click', function (event) {
    $modalScreenGet.remove();
  })
}


async function serverAddClient(obj) {
  let response = await fetch(SERVER_URL + '/api/clients', {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj),
  })
  let data;
  let text = `${response.status} ${response.statusText}`
  if (response.status >= 200 && response.status < 300) { data = await response.json() }
  else {
    const $errorText = document.createElement('p');
    $errorText.classList.add('red');
    $errorText.textContent = text;
    const $errorContainer = document.getElementById('form');
  $errorContainer.after($errorText);
  }
  return data
}

async function serverGetClient() {
  let response = await fetch(SERVER_URL + '/api/clients', {
    method: "GET",
    headers: { 'Content-Type': 'application/json' }
  })
  let data;
  let text = `${response.status} ${response.statusText}`
  if (response.status >= 200 && response.status < 300) { data = await response.json() }
  else {
    error = createErrorGet(text)
    const $errorContainer = document.getElementById('form');
  $errorContainer.after(error);
  }
  return data
}

async function serverGetEditClient(id) {
  let response = await fetch(SERVER_URL + `/api/clients/${id}`, {
    method: "GET",
    headers: { 'Content-Type': 'application/json' }
  })

  let data;
  let text = `${response.status} ${response.statusText}`
  if (response.status >= 200 && response.status < 300) { data = await response.json() }
  else {
    error = createErrorGet(text)
    const $errorContainer = document.getElementById('form');
  $errorContainer.after(error);
  }
  return data
}

async function serverDeleteClient(id) {
  let response = await fetch(SERVER_URL + '/api/clients/' + id, {
    method: "DELETE"
  })

  let data;
  let text = `${response.status} ${response.statusText}`
  if (response.status >= 200 && response.status < 300) { data = await response.json() }
  else {
    const $errorText = document.createElement('p');
    $errorText.classList.add('red');
    $errorText.textContent = text;
    const $errorContainer = document.querySelector('.modal-warning');
  $errorContainer.after($errorText);
  }
  return data
}

async function serverEditClient(object) {
  let response = await fetch(SERVER_URL + '/api/clients/' + object.id, {
    method: "PATCH",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(object),
  })

  let data;
  let text = `${response.status} ${response.statusText}`
  if (response.status >= 200 && response.status < 300) { data = await response.json() }
  else {
    const $errorText = document.createElement('p');
    $errorText.classList.add('red');
    $errorText.textContent = text;
    const $errorContainer = document.getElementById('form');
  $errorContainer.after($errorText);
  }
  return data
}

let serverData = await serverGetClient()

if (serverData) {
  clientList = serverData;
  renderClientsTable(clientList);
}

const $modalClose = createCloseX();
const $butAdd = createContaktButton();

function createContaktButton() {
  const $contactBox = document.createElement('form');
  $contactBox.classList.add('contact');
  $contactBox.setAttribute('id', 'form');
  const $contactList = document.createElement('ul');
  $contactList.setAttribute('id', 'list');
  $contactList.classList.add('list-reset');

  const $buttonAdd = document.createElement('button');
  $buttonAdd.classList.add("modal__button-add", "btn-reset");
  $buttonAdd.textContent = "Добавить контакт";
  $buttonAdd.setAttribute('id', 'add');
  $contactBox.append($contactList, $buttonAdd);

  $buttonAdd.addEventListener('click', function (event) {
    event.preventDefault();
    let contactsNumber = document.querySelectorAll('.contact-item');
    if (contactsNumber.length === 10) {
      $buttonAdd.remove();
    }
    const $contaktItem = createContaktInput();
    $contactList.classList.add('contact-list');
    $contactList.append($contaktItem);
  })

  return $contactBox;
}

function createContactInputDelete() {
  const $contactDel = document.createElement('button');
  $contactDel.classList.add('btn-reset', 'contact-del-btn');
  return $contactDel
}

function createContaktInput() {
  const $contactLi = document.createElement('li');
  $contactLi.classList.add('contact-item');
  const $label = document.createElement('label');
  $label.classList.add('contakt-label')
  const $contactInput = document.createElement('input');
  $contactInput.classList.add('contact-input');
  $contactInput.setAttribute('id', 'co-value');
  $contactInput.placeholder = 'Введите данные контакта';
  const $contactVar = document.createElement('select');
  $contactVar.setAttribute('name', 'contact-select');
  $contactVar.classList.add('contact-select');
  const $contactTel = document.createElement('option');
  $contactTel.classList.add('select-opinion');

  $contactTel.setAttribute('value', 'Tелефон');
  const $contactVk = document.createElement('option');
  $contactVk.setAttribute('value', 'VK');
  $contactVk.classList.add('select-opinion');
  const $contactMail = document.createElement('option');
  $contactMail.setAttribute('value', 'Email');
  $contactMail.classList.add('select-opinion');
  const $contactFb = document.createElement('option');
  $contactFb.setAttribute('value', 'Facebook');
  $contactFb.classList.add('select-opinion');
  const $contactOther = document.createElement('option');
  $contactOther.setAttribute('value', 'Другое');
  $contactOther.classList.add('select-opinion')
  const $contactDelBtn = createContactInputDelete();

  $contactTel.textContent = 'Tелефон';
  $contactVk.textContent = 'VK'
  $contactFb.textContent = 'Facebook'
  $contactMail.textContent = 'Email'
  $contactOther.textContent = 'Другое'

  $contactVar.append($contactTel, $contactMail, $contactFb, $contactVk, $contactOther);
  $label.append($contactVar, $contactInput)
  $contactLi.append($label);
  $contactInput.addEventListener('input', function () {
    if (document.querySelector('.contact-input').value !== '') {
      $label.append($contactDelBtn)
    }
  })

  $contactDelBtn.addEventListener('click', function (event) {
    event.preventDefault();
    $contactLi.remove();
  });

  return $contactLi
}

function formatDate(date) {
  let dd = date.getDate();
  if (dd < 10) dd = '0' + dd;
  let mm = date.getMonth() + 1;
  if (mm < 10) mm = '0' + mm;
  let yy = date.getFullYear();
  if (yy < 10) yy = '0' + yy;
  return dd + '.' + mm + '.' + yy;
}

function startTime(date) {
  let dataTime = new Date(date);
  let hh = dataTime.getHours();
  if (hh < 10) hh = '0' + hh;
  let minut = dataTime.getMinutes();
  if (minut < 10) minut = '0' + minut;
  return hh + ':' + minut
}

function createTr(client) {
  const clientTable = document.getElementById('table');
  const $clientTr = document.createElement('tr');
  $clientTr.classList.add("clients__tr");
  const $tdId = document.createElement('td');
  $tdId.textContent = client.id;
  $tdId.classList.add("clients__td-grey", "td-id", 'line');
  $tdId.setAttribute('id', 'searchId')

  const $tdName = document.createElement('td');
  $tdName.classList.add('line', 'clients-name');
  $tdName.textContent = (client.surname + ' ' + client.name + ' ' + client.lastName);
  $tdName.setAttribute('id', 'searchName');

  const $trDataTime = document.createElement('td');
  $trDataTime.classList.add('line')
  const trDataTimeBlock = document.createElement('div');
  const $tdData = document.createElement('div');
  trDataTimeBlock.classList.add('block');
  $tdData.textContent = `${formatDate(new Date(client.createdAt))}`
  const $tdTime = document.createElement('div');
  $tdTime.textContent = `${startTime(client.createdAt)}`
  $tdTime.classList.add("clients__td-grey");
  trDataTimeBlock.append($tdData, $tdTime);
  $trDataTime.append(trDataTimeBlock);
  $trDataTime.setAttribute('id', 'searchTime')

  const $trUpdate = document.createElement('td');
  $trUpdate.classList.add('line');
  const $tdUpdateBlock = document.createElement('div');
  const $tdUpdateData = document.createElement('div');
  $tdUpdateBlock.classList.add('block');
  $tdUpdateData.textContent = `${formatDate(new Date(client.updatedAt))}`
  const $tdUpdateTime = document.createElement('div');
  $tdUpdateTime.textContent = `${startTime(client.updatedAt)}`;
  $tdUpdateTime.classList.add("clients__td-grey");

  $trUpdate.setAttribute('id', 'searchUpdate')

  $tdUpdateBlock.append($tdUpdateData, $tdUpdateTime)
  $trUpdate.append($tdUpdateBlock);
  const $tdContacts = document.createElement('td');
  $tdContacts.classList.add('line', 'contact-block');

  let contactCount = 0;
  const $contactCountBtn = document.createElement('button')
  $contactCountBtn.classList.add('contact-Count__bnt', 'contact__bnt', 'btn-reset')
  const $contactList = document.createElement('ul')
  $contactList.classList.add('list-reset', 'contact__list')
  let length = client.contacts.length;
  client.contacts.forEach(contactUser => {
    const $contactItem = document.createElement('li');
    const $contactBtn = document.createElement('button')
    $contactBtn.classList.add('contact__bnt', 'btn-reset')
    let strong = `${contactUser.type}: ${contactUser.value}`;
    contactCount++;
    if (contactUser.type === 'VK') {
      $contactBtn.classList.add('vk')
    };
    if (contactUser.type === 'Tелефон') {
      $contactBtn.classList.add('phone')
    };
    if (contactUser.type === 'Email') {
      $contactBtn.classList.add('mail')
    };
    if (contactUser.type === 'Другое') {
      $contactBtn.classList.add('other')
    };
    if (contactUser.type === 'Facebook') {
      $contactBtn.classList.add('fb')
    };

    tippy(
      $contactBtn, {
      content: strong,
      allowHtml: true
    })
    if (contactCount >= 5 && length > 5) {
      $contactBtn.classList.add('visually-hidden')

      $contactCountBtn.addEventListener('click', function () {
        $contactBtn.classList.toggle('visually-hidden');
        $contactCountBtn.classList.add('visually-hidden')
      })

    }
    $contactItem.append($contactBtn);
    $contactList.append($contactItem);
  })
  if (contactCount > 5) {
    $contactCountBtn.innerHTML = `+${contactCount - 4}`
    $contactList.append($contactCountBtn)
  }

  $tdContacts.append($contactList)
  const $tdChange = document.createElement('td');
  const $tdChangeBlock = document.createElement('div');
  $tdChangeBlock.classList.add('change-block')
  const $btnChange = document.createElement('button');
  $btnChange.classList.add("btn-change", "btn", "btn-reset");
  $btnChange.textContent = "Изменить";
  const $btnDelete = document.createElement('button');
  $btnDelete.classList.add("btn-delete", "btn", "btn-reset");
  $btnDelete.textContent = "Удалить";
  $tdChange.classList.add('line');


  $tdChangeBlock.append($btnChange, $btnDelete);
  $tdChange.append($tdChangeBlock);
  $clientTr.append($tdId, $tdName, $trDataTime, $trUpdate, $tdContacts, $tdChange);
  clientTable.append($clientTr);

  $btnChange.addEventListener('click', async function () {
    let objClient = await serverGetEditClient(client.id)
    createModalBlockEdit(objClient);
  })

  $btnDelete.addEventListener('click', function () {
    createModalBlockDelete();
  })

  const $modalScreenEdit = createModalScreen();
  const $modalScreenDelete = createModalScreen();
  const $modalBlockEdit = createModalBox();
  const $modalBlockDelete = createModalBox();
  const $modalFormEdit = createModalForm();
  const $modalFormDelete = createModalForm();

  const $butAddEdite = createContaktButton();
  const $butEditeDelete = createCanselDelete();
  const $butCancelDelete = createCanselButton();
  const $butDeleteClient = createDeleteClientButton(client);
  const $deleteForm = deleteClient(client);


  function editClient(objClient) {
    const $modalTitle = document.createElement('h2');
    $modalTitle.textContent = "Изменить данные"
    $modalTitle.classList.add("modal__title");
    const $modalSpan = document.createElement('span');
    $modalSpan.textContent = ` ID: ${objClient.id}`;
    $modalSpan.classList.add("modal__span");

    const $modalInputFValue = createInputSurName();
    $modalInputFValue.children[0].value = objClient.surname
    const $modalInputIValue = createInputName();
    $modalInputIValue.children[0].value = objClient.name
    const $modalInputOValue = createInputLastName();
    $modalInputOValue.children[0].value = objClient.lastName

    const ul = $butAddEdite.children[0];
    const $add = $butAddEdite.children[1]
    if (objClient.contacts.length > 9) {
      $butAddEdite.children[1].remove()
    }
    if (objClient.contacts !== null) {
      const contaktArray = objClient.contacts
      contaktArray.forEach(contactValue => {
        const $liEdit = createContaktInput();
        const editLabel = $liEdit.children[0];
        const editInput = editLabel.children[1];
        const editSelect = editLabel.children[0];
        editSelect.value = contactValue.type;
        editInput.value = contactValue.value;
        const $contactDelEdit = createContactInputDelete();
        editLabel.append($contactDelEdit)

        $contactDelEdit.addEventListener('click', function (event) {
          event.preventDefault();
          $liEdit.remove();
          let contactsLiNumber = document.querySelectorAll('.contact-item');
          if (contactsLiNumber.length <= 9) {
            document.getElementById('list').append($add);
          }
        });

        ul.append($liEdit);
      });
    }

    const $butSaveEdite = createSaveButton();

    $butSaveEdite.addEventListener('click', async function (event) {
      event.preventDefault();
      let contackEForm = addContacts();
      errorlabelDelete();
      if (validation(this) == true) {
        let serverObject = {
          id: objClient.id,
          surname: ($modalInputFValue.children[0].value || objClient.surname),
          name: ($modalInputIValue.children[0].value || objClient.name),
          lastName: ($modalInputOValue.children[0].value || objClient.lastName),
          contacts: (contackEForm || objClient.contacts)
        }
        serverDataObject = await serverEditClient(serverObject);
        serverDataObject.createdAt = new Date(serverDataObject.createdAt)
        serverDataObject.updatedAt = new Date(serverDataObject.updatedAt)
        clientList.splice(clientList.includes(serverClient.id), 1, serverDataObject);
        renderClientsTable(clientList);
      }

    })

    $modalTitle.append($modalSpan)
    $modalFormEdit.append($modalTitle, $modalInputFValue, $modalInputIValue, $modalInputOValue, $butAddEdite, $butSaveEdite, $butEditeDelete);

    return $modalFormEdit
  }

  function deleteClient() {
    const $modalTitleDelete = document.createElement('h2');
    $modalTitleDelete.textContent = "Удалить клиента"
    $modalTitleDelete.classList.add("modal__title");

    const $modalWarning = document.createElement('p');
    $modalWarning.classList.add("modal-warning");
    $modalWarning.textContent = "Вы действительно хотите удалить данного клиента?"

    $modalFormDelete.append($modalTitleDelete, $modalWarning, $butDeleteClient, $butCancelDelete);

    return $modalFormDelete
  }

  function createSaveButton() {
    const $buttonSave = document.createElement('button');
    $buttonSave.classList.add("modal__button-save", "btn-reset");
    $buttonSave.textContent = "Сохранить";
    $buttonSave.setAttribute('id', 'save');
    return $buttonSave;
  }

  function createDeleteClientButton(client) {
    const $buttonD = document.createElement('button');
    $buttonD.classList.add("modal__button-save", "btn-reset");
    $buttonD.textContent = "удалить";
    $buttonD.setAttribute('id', 'delete');

    $buttonD.addEventListener('click', async function () {
      await serverDeleteClient(client.id)

      clientList.splice(clientList.includes(client.id), 1);
      $clientTr.remove();
    })
    return $buttonD;
  }

  function createCanselButton() {
    const $buttonCancel = document.createElement('button');
    $buttonCancel.classList.add("modal__button-cancel", "btn-reset");
    $buttonCancel.textContent = "Отмена";
    $buttonCancel.setAttribute('id', 'cancel');

    $buttonCancel.addEventListener("click", function () {
      document.getElementById('modal-add').remove();
    })
    return $buttonCancel;
  }

  function createCanselDelete() {
    const $butDel = document.createElement('button');
    $butDel.classList.add("modal__button-cancel", "btn-reset");
    $butDel.textContent = "Удалить клиента";
    $butDel.setAttribute('id', 'delete');

    $butDel.addEventListener("click", function () {
      document.getElementById('modal-add').remove();
      createModalBlockDelete();
    })
    return $butDel;
  }


  function createModalBlockEdit(serverClient) {
    const $editForm = editClient(serverClient)
    $modalBlockEdit.append($modalClose, $editForm);
    $modalScreenEdit.append($modalBlockEdit);
    document.body.append($modalScreenEdit);
  }

  function createModalBlockDelete() {
    $modalBlockDelete.append($modalClose, $deleteForm);
    $modalScreenDelete.append($modalBlockDelete);
    document.body.append($modalScreenDelete);
  }
}

function createCloseX() {
  const $modalCloseBut = document.createElement('button');
  $modalCloseBut.classList.add("modal__close", "btn-reset");
  $modalCloseBut.setAttribute('id', 'close');

  $modalCloseBut.addEventListener("click", function () {
    document.getElementById('form').remove();
    document.getElementById('modal-add').remove();
  })
  return $modalCloseBut;
}

function createModalForm() {
  const $modalForm = document.createElement('form');
  $modalForm.classList.add("modal__form");
  return $modalForm;
}

function createModalScreen() {
  const $modalScreen = document.createElement('div');
  $modalScreen.classList.add("modal__screen");
  $modalScreen.setAttribute('id', 'modal-add');
  return $modalScreen;
}

function createModalBox() {
  const $modalBlock = document.createElement('div');
  $modalBlock.classList.add("modal__block");
  $modalBlock.setAttribute('id', 'modal-box');
  return $modalBlock;
}

function addClient() {
  const $butSave = document.createElement('button');
  $butSave.classList.add("modal__button-save", "btn-reset");
  $butSave.textContent = "Сохранить";
  $butSave.setAttribute('id', 'save');
  const $butCancel = document.createElement('button');
  $butCancel.classList.add("modal__button-cancel", "btn-reset");
  $butCancel.textContent = "Отмена";
  $butCancel.setAttribute('id', 'cancel');

  $butCancel.addEventListener("click", function () {
    document.getElementById('form').remove();
    document.getElementById('modal-add').remove();

  })
  const $modalTitleNew = document.createElement('h2');
  $modalTitleNew.textContent = "Новый клиент"
  $modalTitleNew.classList.add("modal__title");
  const $modalFormNew = createModalForm();

  const $InputSurNameAdd = createInputSurName();
  const $InputNameAdd = createInputName();
  const $InputLastNameAdd = createInputLastName();

  $modalFormNew.append($modalTitleNew, $InputSurNameAdd, $InputNameAdd, $InputLastNameAdd, $butAdd, $butSave, $butCancel)

  $butSave.addEventListener("click", async function (event) {
    event.preventDefault();
    errorlabelDelete();

    if (validation(this) == true) {
      let contactAddForm = addContacts();
      let newClient = {
        surname: document.getElementById("name-1").value,
        name: document.getElementById("name-2").value,
        lastName: document.getElementById("name-3").value,
        contacts: contactAddForm
      }

      serverDataObj = await serverAddClient(newClient);
      serverDataObj.createdAt = new Date(serverDataObj.createdAt)
      serverDataObj.updatedAt = new Date(serverDataObj.updatedAt)

      clientList.push(serverDataObj);
      createTr(serverDataObj);
    }
  })

  return $modalFormNew
}


function addContacts() {
  let contackForm = []
  let contactsValue = document.querySelectorAll('.contakt-label');

  contactsValue.forEach(contactElement => {
    if (contactElement.children[0].value !== '') {
      let contact = {};
      contact['type'] = contactElement.children[0].value;
      contact['value'] = contactElement.children[1].value;
      contackForm.push(contact);
    }
  });
  return contackForm
}

function createInputName() {
  const $modalDivI = document.createElement('div');
  $modalDivI.classList.add("modal__div");
  const $modalInputI = document.createElement('input');
  $modalInputI.classList.add("modal__input");
  $modalInputI.setAttribute('id', 'name-2');
  $modalInputI.setAttribute('required', '');
  const $placeholderI = document.createElement('label');
  $placeholderI.textContent = "Имя";
  $placeholderI.classList.add("placeholder", "star");
  $modalDivI.append($modalInputI, $placeholderI);

  return $modalDivI
}

function createInputSurName() {
  const $modalDivF = document.createElement('div');
  $modalDivF.classList.add("modal__div");
  const $modalInputF = document.createElement('input');
  $modalInputF.classList.add("modal__input");
  $modalInputF.setAttribute('id', 'name-1');
  $modalInputF.setAttribute('required', '');
  // $modalInputF.setAttribute('pattern', '^[А-Яа-яЁё\s]+$');

  const $placeholderF = document.createElement('label');
  $placeholderF.textContent = "Фамилия";
  $placeholderF.classList.add("placeholder", "star");
  $modalDivF.append($modalInputF, $placeholderF);

  return $modalDivF
}

function createInputLastName() {
  const $modalDivO = document.createElement('div');
  $modalDivO.classList.add("modal__div");
  const $modalInputO = document.createElement('input');
  $modalInputO.classList.add("modal__input");
  $modalInputO.setAttribute('id', 'name-3');
  $modalInputO.setAttribute('required', '');
  const $placeholderO = document.createElement('label');
  $placeholderO.textContent = "Отчество";
  $placeholderO.classList.add("placeholder");
  $modalDivO.append($modalInputO, $placeholderO);

  return $modalDivO
}

document.getElementById('open').addEventListener("click", function () {
  const $newForm = addClient();
  const $modalBlockNew = createModalBox();
  const $modalScreenNew = createModalScreen();

  $modalBlockNew.append($modalClose, $newForm);
  $modalScreenNew.append($modalBlockNew);
  document.body.append($modalScreenNew);
})

function renderClientsTable(clientList) {
  for (let ClientObj of clientList) {
    createTr(ClientObj);
  }
  document.getElementById('preloader').remove();
}

//действия с модальным окном
window.addEventListener('keydown', (e) => {
  if (e.key === "Escape") {
    document.getElementById('modal-add').remove();
  }
})
// document.querySelector("#modal-add .modal-block").addEventListener('click', event => {
//  event._isClickWithInModal = true;
// })
// document.getElementById('modal-add').addEventListener('click', event => {
//  if (event._isClickWithInModal) return;
//  event.currentTarget.remove();
// })


//сортировка столбцов
let dir = false;
const sortRezult = (array, prop, dir) => array.sort((a, b) => (!dir ? a[prop] < b[prop] : a[prop] > b[prop]) ? -1 : 0)

document.getElementById('fio').addEventListener('click', function () {
  document.getElementById('table').innerHTML = "";
  dir = !dir;
  renderClientsTable(sortRezult(clientList, 'surname', dir));
})

document.getElementById('id').addEventListener('click', function () {
  document.getElementById('table').innerHTML = "";
  dir = !dir;
  renderClientsTable(sortRezult(clientList, 'id', dir));
})

document.getElementById('data').addEventListener('click', function () {
  document.getElementById('table').innerHTML = "";
  dir = !dir;
  renderClientsTable(sortRezult(clientList, 'createdAt', dir));
})

document.getElementById('change').addEventListener('click', function () {
  document.getElementById('table').innerHTML = "";
  dir = !dir;
  renderClientsTable(sortRezult(clientList, 'updatedAt', dir));
})

//поиск
function filter(arr, key, val) {
  if (val !== "") {
    return arr.filter(el => {
      if (key === "search") {
        const dataSearch = `${formatDate(new Date(el.createdAt))}`;
        const updataSearch = `${formatDate(new Date(el.updatedAt))}`;
        const timeSeach = `${startTime(el.createdAt)}`;
        const timeUpSearch = `${startTime(el.updatedAt)}`;
        const searchRezult = (el.id + ' ' + el.surname + ' ' + el.name + ' ' + el.lastName + ' ' + dataSearch + ' ' + updataSearch + ' ' + timeSeach + ' ' + timeUpSearch);
        const searchRezultLower = searchRezult.toLowerCase()
        return String(searchRezultLower).includes(val);

      }
      else {
        return String(el[key]).includes(val)
      }
    })

  }
  else {
    return arr;
  }
}

setTimeout(() => {
  document.getElementById('search').addEventListener("keyup", (e) => {
    filteredArr = filter(clientList, 'search', document.getElementById('search').value);
    document.getElementById('table').innerHTML = "";
    renderClientsTable(filteredArr);

  })
}, 300)

// изменение картинок в шапке сайта

document.getElementById('id').addEventListener('click', function () {
  document.querySelector('.th-id').classList.toggle('up');
  document.querySelector('.th-id').classList.toggle('down');

})

document.getElementById('data').addEventListener('click', function () {
  document.querySelector('.th-data').classList.toggle('up');
  document.querySelector('.th-data').classList.toggle('down');

})
document.getElementById('change').addEventListener('click', function () {
  document.querySelector('.th-changes').classList.toggle('up');
  document.querySelector('.th-changes').classList.toggle('down');

})

document.getElementById('fio').addEventListener('click', function () {
  document.querySelector('.th-fio').classList.toggle('th-fio-up');
  document.querySelector('.th-fio').classList.toggle('th-fio-down');

})
//прелоадер
document.getElementById('table').addEventListener('DOMcontentLoaded', function () {
  let preloader = document.getElementById('preloader')
  if (!preloader.classList.contains('preloader-hide'))
    preloader.classList.add('preloader-hide')
})
