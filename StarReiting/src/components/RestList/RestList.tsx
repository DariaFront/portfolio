import { RestoranCard } from '../RestCard/RestCard'
import { FC } from 'react'
import './RestList.css'

export interface restoranProp {
    id: string,
    name: string,
    description: string,
    raiting: number
    url: string,
}

type restauranArrayProp = {
    restaurants: restoranProp[];
}

export const RestauranLust: FC<restauranArrayProp> = ({ restaurants }) => {
    if (Array.isArray(restaurants)) {

        return (<ul className="list">
            {restaurants.map((rest) => (
                <li key={rest.id} >
                    <RestoranCard
                        cardId={rest.id}
                        title={rest.name}
                        kitchen={rest.description}
                        starRaiting={rest.raiting}
                        imageUrl={rest.url} />
                </li>
            ))}
        </ul>
        )
    }
}
