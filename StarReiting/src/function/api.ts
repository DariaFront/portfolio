const API_URL = 'http://localhost:3000'


export interface Restaurant {
  id: string
  name: string
  description: string
  raiting: number
  url: string
}

export interface SearchTextProps {
  restName: string;
}

export const getRestaurants = ({restName}:SearchTextProps): Promise<Restaurant[]> => {
  return fetch(`${API_URL}/restaurants`).then((res) => res.json())
    .then((data) => {
      const filterRestorant = data.filter((el: Restaurant) => {
        return Object.values(el).some((el) =>
          String(el).toLowerCase().includes(restName.toLowerCase())
        );
      })
      // if(filterRestorant === '') 
      //   filterRestorant = 'список ресторанов по Вашим параметрам пуст...'
      return filterRestorant;
    })
}

interface UpdateRestaurantRaitingArgs {
  id: Restaurant['id']
  raiting: Restaurant['raiting']
}

export const updateRestaurantRating = ({
  id,
  raiting,
}: UpdateRestaurantRaitingArgs): Promise<Restaurant> =>
  fetch(`${API_URL}/restaurants/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ raiting }),
  }).then((res) => res.json())

