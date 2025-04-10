import { createContext, useEffect, useState } from "react";

export const SavedCardsContext = createContext();

export const SavedCardsProvider = (props) => {
    const [savedCards, setSavedcards] = useState([]);

    return (
        <SavedCardsContext.Provider value={[savedCards, setSavedcards]}>
            {props.children}
        </SavedCardsContext.Provider>
    )
}