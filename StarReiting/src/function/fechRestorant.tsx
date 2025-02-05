import { Loader } from "../components/Loader/Loader";
import { useQuery } from "@tanstack/react-query"
import { queryClient } from "./queryClient"
import { RestauranLust } from '../components/RestList/RestList'
import { getRestaurants } from './api'
import { SearchTextProps } from '../function/api'


export const FetcheRstaurantsView = ({ restName }: SearchTextProps): JSX.Element => {

    const restoranQery = useQuery({
        queryFn: () => getRestaurants({ restName }),
        queryKey: ["restName"],
    }, queryClient
    )

    switch (restoranQery.status) {
        case 'pending':
            return <Loader />
        case 'success':
            return restoranQery.data.length === 0? <span>'список ресторанов по Вашим параметрам пуст...'</span> : <RestauranLust restaurants={restoranQery.data} />
        case 'error':
            return (<div>
                <span>произошла ошибка</span>
                <button onClick={() => restoranQery.refetch()}>повторить запрос</button>
            </div>)
    }
}
