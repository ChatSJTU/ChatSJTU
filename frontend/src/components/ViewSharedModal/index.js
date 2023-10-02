import React, { useContext, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Typography, Button, Space } from 'antd';

import { request } from "../../services/request";
import { SessionContext } from '../../contexts/SessionContext';

const { Title, Text } = Typography;

function ViewSharedModalContent ( {closeModal} ) {

    const { sharedSession } = useContext(SessionContext);
    
    return (
        <Typography>

        </Typography>
    )
    
}

export default ViewSharedModalContent;