import React from 'react'
import { ErrorMessageCards } from '../utils/interfaces/Error'

/**
 * Responsible from rendering the error message
 */

export const ErrorMessageCard = ({text}: ErrorMessageCards) => {
  return (
    <section className='w-full bg-red-100 text-red-600 font-semibold text-sm xl:text-md border border-red-600 rounded-md  p-2'>
        * {text}
    </section>
  )
}
