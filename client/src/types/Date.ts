export type DatePickerType = {
    style: string;
    onInputChange: (
        value : number,
        field: 'deadline',
    ) => void;
    value: number;
};