import {type ReactNode, type FC, ReactElement, cloneElement} from "react";
import {MdAdd} from "react-icons/md";
import {Tooltip} from "antd";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogDescription
} from "@/components/ui/dialog";
import useModalContext from "@/hooks/useModal.tsx";

type CustomModalProps = {
    id: string;
    title: string;
    description?: string;
    component?: ReactElement;
    width?: number | string;
    children: ReactNode;
};

const CustomModal: FC<CustomModalProps> = ({
                                               id,
                                               title,
                                               description,
                                               component,
                                               children,
                                               width = 520
                                           }) => {
    const {openModal, closeModal, isModalVisible} = useModalContext();

    const handleOpen = (e) => {
        e.preventDefault()
        e.stopPropagation()
        openModal(id)
    };

    // Default to Add button if no component is provided
    const defaultComponent = (
        <Tooltip title="Add">
            <Button variant="outline" size="icon">
                <MdAdd className="h-4 w-4"/>
            </Button>
        </Tooltip>
    );

    const triggerComponent = cloneElement(component || defaultComponent, {
        onClick: handleOpen,
        className: `cursor-pointer ${(component || defaultComponent).props.className || ''}`
    });

    return (
        <>
            {triggerComponent}
            <Dialog
                open={isModalVisible(id)}
                onOpenChange={(open) => {
                    if (!open) closeModal(id);
                }}
            >
                <DialogContent style={{maxWidth: typeof width === 'number' ? `${width}px` : width}}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {description && (
                            <DialogDescription>
                                {description}
                            </DialogDescription>
                        )}
                    </DialogHeader>
                    {children}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button onClick={() => closeModal(id)}>
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CustomModal;