import { request } from "./request";
import Config from '../config/config'
import { message } from 'antd';

export const uploadFile = async (options) => {
    const { onSuccess, onError, file, onProgress } = options;

    const isSizeLimited = file.size / 1024 / 1024 < Config.UPLOAD_LIMIT_SIZE;
    if (!isSizeLimited) {
        message.error(`上传失败：上传文件需小于 ${Config.UPLOAD_LIMIT_SIZE} MB`);
        onError('文件过大', file);
        return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
        const response = await request.post('files/upload/', formData, {
            onUploadProgress: (event) => {
            onProgress({ percent: (event.loaded / event.total) * 100 });
            },
        });
        
        //拼接baseurl
        file.url = `${document.baseURI}user_content${response.data.url}`;
    
        onSuccess(null, file);
    } catch (error) {
        let error_msg = '上传失败';
        if (error.response.data.message) {
            error_msg = error.response.data.message
            message.error(`上传失败：${error_msg}`);
        } else {
            message.error("上传失败");
        }
        file.error = error_msg;
        onError(error_msg, file);
    }
};