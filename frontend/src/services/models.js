import { request } from "./request";
import React from "react";
import { ThunderboltOutlined, StarOutlined, FireOutlined } from "@ant-design/icons";

const iconMapping = {
    1: <ThunderboltOutlined style={{ color: '#73c9ca' }} />,
    2: <StarOutlined style={{ color: '#9b5ffc' }} />,
    3: <StarOutlined style={{ color: '#9b5ffc' }} />,
    4: <FireOutlined style={{ color: '#f5c004' }} />,
};

export async function fetchModelList() {
  try {
    const response = await request.get('/api/list-models/');
    const data = response.data;

    for (const modelName in data) {
        data[modelName].icon = iconMapping[data[modelName].icon];
    }

    return data;
    } catch (error) {
        console.error('Failed to fetch model list:', error);
        throw error;
    }
}