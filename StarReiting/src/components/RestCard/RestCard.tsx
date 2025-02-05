import { Star } from '../Star/starRating'

export type someCard = {
  cardId: string,
  title: string,
  kitchen: string,
  starRaiting: number,
  imageUrl: string
}

export const RestoranCard = ({ cardId, starRaiting, title, kitchen, imageUrl }: someCard) => {

  return (
    <div className='card'>
      <div>
        <div className="previeu">
          <img className="img" src={imageUrl}></img>
        </div>
        <p className="title">{title}</p>
        <p className="subtitle">
          {kitchen};
        </p>
      </div>
      <Star starRaiting={starRaiting} id={cardId} />
    </div>
  );
};

