import { ButtonProps, Button as ChakraButton } from "@chakra-ui/react";
import { MouseEventHandler, forwardRef } from "react";
import LinearSpinner from "./LinearSpinner";

interface CustomButtonProps extends ButtonProps {
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, CustomButtonProps>(({ children, isLoading, onClick, ...rest }, ref) => {
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (!isLoading && onClick) {
      onClick(event);
    }
  };

  return (
    <ChakraButton
      ref={ref}
      variant="primary"
      onClick={handleClick}
      cursor={isLoading ? "not-allowed" : "pointer"}
      {...rest}
    >
      {isLoading ? <LinearSpinner /> : children}
    </ChakraButton>
  );
});

export default Button;
