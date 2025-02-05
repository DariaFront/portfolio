import { useState } from 'react';
import { queryClient } from "../../function/queryClient" 
import { updateRestaurantRating } from '../../function/api'
import { useMutation } from "@tanstack/react-query";
import {StarIcon} from './StarIcon'
import './star.css'

type StarType = {
  starRaiting: number,
  id: string
}

export const Star = ({ starRaiting, id}: StarType) => {

const colors = {
  orange: "#E74A2A",
  grey: "#E0C2A6"
}

const [raiting, setRating] = useState(starRaiting)
const [hoverValue, setHoverValue] = useState<number | undefined>(undefined)

const starMutation = useMutation({
  mutationFn: () => updateRestaurantRating({id, raiting}),
 }, queryClient)

const handleMouseOverStar = (value:number) => {
  setHoverValue(value)
};

const handleMouseLeaveStar = () => {
  setHoverValue(undefined)
}

const handleClickStar = (value:number) => {
  setRating(value);
  starMutation.mutate(); 
};

const stars = Array(5).fill(0)

return (
  <div className='star-box'>
     {stars.map((_, index) => {
          return (
               <StarIcon            
                   key={index}
                   className ={'star'}
                   size={20}
                   value= {raiting} 
                   color={(hoverValue || raiting) > index ? colors.orange : colors.grey}
                   fill = {(hoverValue || raiting) > index ? colors.orange : colors.grey}
                   onClick={() => handleClickStar(index + 1)}
                   onMouseOver={() => handleMouseOverStar(index + 1)}
                   onMouseLeave={() => handleMouseLeaveStar}
                />
           )
       })}

  </div>
);
}

