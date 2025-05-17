import {createContext, useState, type ReactNode} from "react";
import type {ModalContextType} from "@/contexts/modal/model.tsx";


export const ModalContext = createContext<ModalContextType | undefined>(undefined);

// eslint-disable-next-line react/prop-types
export const ModalProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [visibleModals, setVisibleModals] = useState<{ [key: string]: boolean }>({});

    const openModal = (id: string) => {
        setVisibleModals((prev) => ({...prev, [id]: true}));
    };

    const closeModal = (id: string) => {
        setVisibleModals((prev) => ({...prev, [id]: false}));
    };

    const isModalVisible = (id: string) => Boolean(visibleModals[id]);

    return (
        <ModalContext.Provider value={{openModal, closeModal, isModalVisible}}>
            {children}
        </ModalContext.Provider>
    );
};
