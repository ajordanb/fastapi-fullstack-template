export type ModalContextType = {
    openModal: (id: string) => void;
    closeModal: (id: string) => void;
    isModalVisible: (id: string) => boolean;
};