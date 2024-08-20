import React, { useState, useEffect } from 'react'
import { TicketObject } from '../../utils/interfaces/Ticket'
import { TicketCard } from './TicketCard'
import { useNavigate } from 'react-router-dom'

interface Props {
    items: TicketObject[];
    itemsNumber: number;
}

export const TicketViewContainer: React.FC<Props> = ({ items, itemsNumber }) => {
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pages, setPages] = useState<number[]>([]);

    useEffect(() => {
        setPageNumber(1)
        const calculatedPages = Array.from({ length: Math.ceil(items.length / itemsNumber) }, (_, index) => index + 1);
        setPages(calculatedPages);
    }, [items, itemsNumber]);

    // Calculate the index range for the items to display on the current page
    const startIndex = (pageNumber - 1) * itemsNumber;
    const endIndex = Math.min(startIndex + itemsNumber, items.length);
    const itemsOnPage = items.slice(startIndex, endIndex);

    return (
        <div className='block my-2'>
            <div className='flex flex-wrap my-2'>
                {itemsOnPage.map((item, index) => (
                    <TicketCard
                        
                        key={index}
                        ticket={item}
                    />
                ))}
            </div>

            <div className='flex justify-end my-10 mr-20'>
                {pages.map((page, index) => (
                    <button
                        onClick={() => setPageNumber(page)}
                        key={index}
                        className={`${page === pageNumber ? "bg-gray-800 text-white" : "bg-white text-gray-800 hover:bg-gray-800 hover:text-white"} 
                        border border-gray-800 rounded-md px-2 py-1 mx-1 cursor-pointer`}
                    >
                        {page}
                    </button>
                ))}
            </div>
        </div>
    );
};
