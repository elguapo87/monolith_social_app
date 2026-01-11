import { fetchConnections } from '@/redux/slices/connectionSlice';
import {  AppDispatch, RootState } from '@/redux/store';
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'

const ConnectionNotification = () => {
    const pendingConnections = useSelector((state: RootState) => state.connection.pendingConnections);
    const dispatch = useDispatch<AppDispatch>();
    const { getToken } = useAuth();

     useEffect(() => {
        const getConnections = async () => {
            const token = await getToken();
            dispatch(fetchConnections(token));
        };
        getConnections();
    }, [getToken, dispatch]);

    return pendingConnections.length > 0 && (
        <span
            className='absolute top-25 right-14 md:right-26 min-w-4.5 h-4.5 text-xs
                bg-red-500 text-white rounded-full flex items-center justify-center'
        >
            {pendingConnections.length}
        </span>
    )
}

export default ConnectionNotification
