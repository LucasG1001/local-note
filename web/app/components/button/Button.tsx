import React from 'react';
import styles from './Button.module.css';
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from '@fortawesome/react-fontawesome';

interface ButtonProps {
  text: string;
  variant: string;
  icon?: FontAwesomeIconProps['icon'];
  onClick?: () => void;
}

const Button = ({ text, variant, icon, onClick }: ButtonProps) => {
  return (
    <button className={`${styles[variant]}`} onClick={onClick}>
      {icon && <FontAwesomeIcon icon={icon} />} {text}
    </button>
  );
};

export default Button;
