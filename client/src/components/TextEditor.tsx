import React, {useState} from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../styles/TextEditor.css';

interface Props {
    value: string;
    onChange: (value: string) => void;
    readonly: boolean;
    classname?: string;
}

const modules = {
    toolbar: [
        [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
        [{size: []}],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, 
         {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image', 'video'],
        ['clean']
    ],
    clipboard: {
        matchVisual: false,
    }
};

const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
];

export const TextEditor: React.FC<Props> = ({value, onChange, readonly, classname}) => {
    return (
        <div className="">
            <ReactQuill 
                id="#editor"
                theme="snow"
                modules={modules}
                formats={formats}
                value={value}
                onChange={onChange}
                className={`${classname ? `${classname}` : 'w-full'}`}
                readOnly={readonly}
            />
        </div>
    );
};
