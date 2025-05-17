import {type ReactNode, type FC} from "react";
import {MdAdd} from "react-icons/md";
import {Tooltip} from "antd";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose, DialogDescription
} from "@/components/ui/dialog";
import useModalContext from "@/hooks/useModal.tsx";

type CustomModalProps = {
    id: string;
    title: string;
    description?: string;
    modalContent: ReactNode;
    width?: number | string;
    children: ((openFn: () => void) => ReactNode) | ReactNode;
};

const CustomModal: FC<CustomModalProps> = ({
    id,
    title,
    description,
    modalContent,
    children,
    width = 520
}) => {
    const {openModal, closeModal, isModalVisible} = useModalContext();

    const handleOpen = () => openModal(id);

    return (
        <>
            {typeof children === 'function' ? (
                children(handleOpen)
            ) : (
                <Tooltip placement="topLeft" title={title}>
                    <Button
                        className="btn"
                        onClick={handleOpen}
                    >
                        {children || <MdAdd />}
                    </Button>
                </Tooltip>
            )}

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
                    {modalContent}
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