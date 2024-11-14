import React from 'react';
import { Upload } from 'lucide-react';
import { DropzoneProps } from 'react-dropzone';

interface FileUploadProps {
  getRootProps: (props?: any) => any;
  getInputProps: () => any;
  isDragActive: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ getRootProps, getInputProps, isDragActive }) => {
  return (
    <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
      ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-blue-500/50'}`}>
      <input {...getInputProps()} />
      <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
      <p className="text-lg text-gray-300 mb-2">
        Drag & drop your CSV file here, or click to select
      </p>
      <p className="text-sm text-gray-400">
        Maximum file size: 10MB
      </p>
    </div>
  );
};

export default FileUpload;