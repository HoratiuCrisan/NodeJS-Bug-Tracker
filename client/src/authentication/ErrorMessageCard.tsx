import React from 'react'

interface ErrorMessageCard {
    text: string
}

/**
 * Responsible from rendering the error message
 */

export const ErrorMessageCard = ({text}: ErrorMessageCard) => {
  return (
    <section className='w-full bg-red-100 text-red-600 font-semibold text-sm xl:text-md border border-red-600 rounded-md  p-2'>
        * {text}
    </section>
  )
}
