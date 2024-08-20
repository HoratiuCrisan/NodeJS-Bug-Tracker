import {OptionProps, StylesConfig, CSSObjectWithLabel} from 'react-select'

interface Option {
    label: string,
    value: string
}


export const selectStyles = (background: string, text: string) => {
    const colourStyles: StylesConfig<Option, false> = {
        option: (base: CSSObjectWithLabel, { data, isDisabled, isFocused, isSelected }: OptionProps<Option, false>) => {
          return {
            ...base,
            backgroundColor: isFocused ? background: isSelected ? background : undefined, 
            color: text
          }
        }
    }

    return colourStyles
}

export const customStyles = {
  control: (provided: CSSObjectWithLabel) => ({
    ...provided,
    border: "1px solid #000", // Set a border color to mimic the outline
    boxShadow: "none", // Remove any box shadow
    "&:hover": {
      border: "2px solid #000" // Set the border color on hover
    },
    "&:focus": {
      border: "2px solid #000", // Set the border color when focused
    }
  })
}