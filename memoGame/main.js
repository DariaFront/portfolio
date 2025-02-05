// import {AmazingCard, Card} from './cardClass'
class Card {
  open = false;
  success = false;

  constructor(container, cardNumber, flip) {
    this.container = container;

    this.flip = flip;
    this.createElement();
    this.cardNumber = cardNumber;
  }

  createElement() {
    this.card = document.createElement('div');
    this.card.classList.add("card");
    this.card.textContent = this.cardNumber;

    this.card.addEventListener('click', () => {

      if (this.open == false && this.success == false) {
        console.log(this.open)
        this.card.classList.add("open");
        this.open = true;
        console.log(this.open)
        this.flip(this);
      }
    })

    this.container.append(this.card)
  }

  set cardNumber(value) {
    this._cardNumber = value;
    this.card.textContent = this._cardNumber;
  }

  get cardNumber() {
    return this._cardNumber
  }

  set open(value) {
    this._open = value;
  }
  get open() {
    return this._open
  }
  set success(value) {
    this._success = value;
  }

  get success() {
    return this._success
  }
}

class AmazingCard extends Card {

  set cardNumber(value) {
    this._cardNumber = value;
    const img = document.createElement('img');
    img.setAttribute('src', `./img/${value}.jpg`)
    img.classList.add('img');
    img.classList.add('visually-hidden');

    this.card.append(img);

    img.onerror = () => {
        img.src = './img/not-found.jpg';}
    this.card.addEventListener('click', ()=>{
      img.classList.remove('visually-hidden');
    })
  }

  get cardNumber() {
    return this._cardNumber
  }
}

let countNomber = 0;
let card1 = null;
let card2 = null;
const cardsArray = [];
let count = null;


export function game(container, count) {

  count = Number(prompt('введите количество пар'));

  function createNumbersArray(count) {
    const countCards = count * 2 - 2;
    let array = [1, 1];
    for (let i = 0; i < countCards; i = i + 2) {
      array.push(array[i] + 1);
      array.push(array[i] + 1);
    }
    return array
  };

  const arr = createNumbersArray(count);

  function shuffle(arr) {
    const countArray = count * 2;
    for (let i = 0; i < countArray; i++) {
      let j = Math.floor(Math.random() * (countArray - 1) + 1);
      let b = arr[i];
      arr[i] = arr[j];
      arr[j] = b;
    }
    return arr
  };

  const cardsNumberArray = shuffle(arr);

  for (const cardNumber of cardsNumberArray) {
    let card = new AmazingCard(container, cardNumber, flip)
    cardsArray.push(card);
  }

  function flip(card) {
    if (card1 == null) {
      card1 = card;

    }
    else {
      if (card2 == null) {
        card2 = card;
      }
    }
    setTimeout(() => {
      if (card1 !== null && card2 !== null) {
        if (card1.cardNumber !== card2.cardNumber) {
          card1.open = false;
          card2.open = false;
          card1.card.classList.remove('open');
          card2.card.classList.remove('open');
          let img1 =  card1.card.firstChild;
          let img2 =  card2.card.firstChild;
          img1.classList.add('visually-hidden');
          img2.classList.add('visually-hidden');
          card1 = null;
          card2 = null;
        }
      }
    }, 1000)

    if (card1 !== null && card2 !== null) {
      if (card1.cardNumber == card2.cardNumber) {
        card1.success = true;
        card2.success = true;
        card1.card.classList.add('succses');
        card2.card.classList.add('succses');
        card1 = null;
        card2 = null;
        ++countNomber;
      }
    }

    if (count === countNomber) {
      setTimeout(() => {
        document.getElementById('container').innerHTML = '';
        const sucsessTitle = document.createElement('h2');
        const sucsessButtonYes = document.createElement('button');
        const sucsessButtonNo = document.createElement('button');
        sucsessButtonYes.classList.add('button');
        sucsessButtonNo.classList.add('button');
        let buttonGrup = document.createElement('div');
        buttonGrup.classList.add('buttonGrup');
        sucsessTitle.classList.add('title');
        sucsessTitle.textContent = 'Поздравляю с победой! Сыграть ещё?';
        sucsessButtonYes.textContent = 'Да';
        sucsessButtonYes.addEventListener('click', function () {
          document.getElementById('container').innerHTML = '';
          countNomber = 0;
          count = Number(prompt('введите количество пар'));
          game(document.getElementById('container'), count);
        })
        sucsessButtonNo.textContent = 'Нет';
        sucsessButtonNo.addEventListener('click', function () {
          const goTitle = document.createElement('h2');
          goTitle.textContent = 'Спасибо за игру?';
          document.getElementById('container').append(goTitle);
        })

        buttonGrup.append(sucsessButtonYes, sucsessButtonNo);
        document.getElementById('container').append(sucsessTitle, buttonGrup);
      }, 500);
    }
  }
}


//работает не трогать


export default game(document.getElementById('container'), count)
