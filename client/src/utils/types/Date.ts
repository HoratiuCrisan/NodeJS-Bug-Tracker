export interface DatePickerProps {
    deadline: string
    onInputChange: (value : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | 
    string | 
    undefined,
    type: string
) => void
    style: string
}