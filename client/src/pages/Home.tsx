import React, {useState, useEffect, useRef} from 'react'
import { FaRegEnvelope } from "react-icons/fa6"
import { useAuth } from '../config/AuthContext'
import { getTickets } from '../api/getTickets'

export const Home = () => {
    const [ticketList, setTicketList] = useState<Array<any>>([])
    const listRef = useRef<Array<any>>([])
    const [firstFetch, setFirstFetch] = useState(true)
    useEffect(() => {
      const fetchTickets = async () => {
        const result = await getTickets()

        if (result) {
          setFirstFetch(false)
          const objects = result.data

          let list = []
          for (let object of objects) {
            if (object.data.Author === currentUser?.displayName)
              list.push(object.data)
          }

          console.log(list)

          listRef.current = list
        }
      }

      if (firstFetch)
        fetchTickets()
    })

    const {currentUser} = useAuth()
    return (
      <div className='block '>
        <div className='flex text-xl font-semibold font-sans'>
          <span className='mt-1 text-2xl'>
            <FaRegEnvelope />
          </span>
          <h1 className='mx-2'>
            {currentUser?.displayName}'s tickets
          </h1>
        </div>

        <div className='mx-auto my-8 w-11/12 shadow-xl bg-white px-4'>
            <table className='w-full overflow-y-auto '>
              <thead className='bg-gray-800 text-white'>
                <tr>
                  <th className='p-2'>
                    <h1 className='flex gap-2 text-center'>Profile</h1>
                  </th>
                  <th className='p-2'>
                    <h1 className='flex gap-2 text-center'>Author</h1>
                  </th>
                  <th className='p-2'>
                    <h1 className='flex gap-2 text-center'>Title</h1>
                  </th>
                  <th className='p-2'>
                    <h1 className='flex gap-2 text-center'>Handler</h1>
                  </th>
                  <th className='p-2'>
                    <h1 className='flex gap-2 text-center'>Priority</h1>
                  </th>
                  <th className='p-2'>
                    <h1 className='flex gap-2 text-center'>Status</h1>
                  </th>
                  <th className='p-2'>
                    <h1 className='flex gap-2 text-center'>Deadline</h1>
                  </th>
                </tr>
              </thead>

              <tbody className='text-black'>
                {listRef.current.map((elem, id) => (
                  <tr key={id}>
                    <td className='p-2'>
                      <img 
                        src={elem.AuthorPicture}  
                        width={40}
                        className='rounded-full items-center'
                      />
                    </td>

                    <td className='p-2'>
                      <h1 className='flex gap-2 text-center'>{elem.Author}</h1>
                    </td>

                    <td className='p-2'>
                      <h1 className='flex gap-2 text-center'>{elem.Title}</h1>
                    </td>

                    <td className='p-2'>
                      <h1 className='flex gap-2 text-center'>{elem.Handler}</h1>
                    </td>

                    <td className='p-2'>
                      <h1 className='flex gap-2 text-center'>{elem.Priority}</h1>
                    </td>

                    <td className='p-2'>
                      <h1 className='flex gap-2 text-center'>{elem.Status}</h1>
                    </td>

                    <td className='p-2'>
                      <h1 className='flex gap-2 text-center'>{elem.Deadline}</h1>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    )
}
