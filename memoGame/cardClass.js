export class Card {
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

export class AmazingCard extends Card {

  set cardNumber(value) {
    this._cardNumber = value;
    const img = document.createElement('img');
    img.setAttribute('src', `./img/${value}.jpg`)
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
