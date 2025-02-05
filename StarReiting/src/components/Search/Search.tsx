
import './search.css'
import '../RestList/RestList.css'
import { useState } from "react";
import { FetcheRstaurantsView } from '../../function/fechRestorant'
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "./../../function/queryClient";
import { getRestaurants } from './../../function/api'

export const Search = () => {
  const [value, setInput] = useState('');

  const searchMutation = useMutation({
    mutationFn: (restName: string) => getRestaurants({ restName }),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["restName"] });
    },
  }, queryClient)

  const handleClick = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setInput(event.target.value);
    searchMutation.mutate(value);
  }
  return (
    <div>
      <input className="search"
        placeholder="Search for restaurants"
        onChange={handleClick}
      />
      <FetcheRstaurantsView restName={value} />
    </div>
  )

}






