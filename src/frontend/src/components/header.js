/**
 * @file header.js
 * @author Lukas Koszegy
 * @brief Implementacia spolocneho panela
 */

import React from 'react';
import { Menu, Popup } from 'semantic-ui-react';
import '../css/header.css';

const Header = ({createApp}) => (
    <div className='header'>
        <Menu inverted size='large' icon fixed='top'>
            <Popup
                trigger={<Menu.Item
                        link
                        icon='add'
                        position='right'
                        onClick={createApp}
                        ></Menu.Item>}
                content='Create application'
                size='mini' inverted />
        </Menu>
    </div>
);

export default Header;
